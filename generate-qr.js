// Standalone QR code SVG generator script
const fs = require('fs');

// GF(256) arithmetic
const EXP = new Uint8Array(256);
const LOG = new Uint8Array(256);
(() => {
  let v = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = v;
    LOG[v] = i;
    v = v << 1;
    if (v >= 256) v ^= 0x11d;
  }
  EXP[255] = EXP[0];
})();

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return EXP[(LOG[a] + LOG[b]) % 255];
}

function polyMul(a, b) {
  const r = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      r[i + j] ^= gfMul(a[i], b[j]);
  return r;
}

function polyMod(data, gen) {
  const result = [...data];
  for (let i = 0; i < data.length; i++) {
    const coef = result[i];
    if (coef !== 0)
      for (let j = 0; j < gen.length; j++)
        result[i + j] ^= gfMul(gen[j], coef);
  }
  return result.slice(data.length);
}

function generatorPoly(n) {
  let g = [1];
  for (let i = 0; i < n; i++) g = polyMul(g, [1, EXP[i]]);
  return g;
}

class BitBuffer {
  constructor() { this.data = []; this.length = 0; }
  put(num, len) {
    for (let i = len - 1; i >= 0; i--) {
      this.data[this.length >> 3] = ((this.data[this.length >> 3] || 0) << 1) | ((num >> i) & 1);
      this.length++;
    }
  }
  getBit(index) {
    return (this.data[index >> 3] >> (7 - (index & 7))) & 1;
  }
  toBytes() {
    const bytes = [];
    for (let i = 0; i < this.length; i++) {
      const byteIndex = i >> 3;
      const bitIndex = 7 - (i & 7);
      if (i % 8 === 0) bytes.push(0);
      bytes[byteIndex] |= this.getBit(i) << bitIndex;
    }
    return bytes;
  }
}

const EC_CODEWORDS = { 1: 10, 2: 16, 3: 26, 4: 18, 5: 24, 6: 16, 7: 18, 8: 22, 9: 22, 10: 26 };
const DATA_CAPACITY = { 1: 16, 2: 28, 3: 44, 4: 82, 5: 110, 6: 156, 7: 178, 8: 220, 9: 270, 10: 320 };
const EC_BLOCKS = {
  1: [[1, 16]], 2: [[1, 28]], 3: [[1, 44]], 4: [[2, 32]], 5: [[2, 43]],
  6: [[4, 27]], 7: [[4, 31]], 8: [[2, 38], [2, 39]], 9: [[3, 36], [2, 37]], 10: [[4, 43], [1, 44]],
};

function chooseVersion(dataLen) {
  for (let v = 1; v <= 10; v++) {
    const charCountBits = v <= 9 ? 8 : 16;
    const totalBits = 4 + charCountBits + dataLen * 8;
    if (totalBits <= DATA_CAPACITY[v] * 8) return v;
  }
  throw new Error('Data too long');
}

function getAlignmentPositions(version) {
  if (version === 1) return [];
  const positions = [6];
  const last = version * 4 + 10;
  const count = Math.floor(version / 7) + 2;
  const step = Math.ceil((last - 6) / (count - 1));
  for (let i = 1; i < count; i++) positions.push(6 + step * i);
  positions[positions.length - 1] = last;
  return positions;
}

function applyFormatInfo(modules, isFunction, size, mask) {
  const data = (0b00 << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  for (let i = 0; i < 6; i++) modules[8][i] = ((bits >> (14 - i)) & 1) === 1;
  modules[8][7] = ((bits >> 8) & 1) === 1;
  modules[8][8] = ((bits >> 7) & 1) === 1;
  modules[7][8] = ((bits >> 6) & 1) === 1;
  for (let i = 0; i < 6; i++) modules[5 - i][8] = ((bits >> (i)) & 1) === 1;
  for (let i = 0; i < 8; i++) modules[size - 1 - i][8] = ((bits >> (14 - i)) & 1) === 1;
  for (let i = 0; i < 7; i++) modules[8][size - 7 + i] = ((bits >> (6 - i)) & 1) === 1;
}

function penaltyScore(modules, size) {
  let score = 0;
  for (let r = 0; r < size; r++) {
    let run = 1;
    for (let c = 1; c < size; c++) {
      if (modules[r][c] === modules[r][c - 1]) run++; else { if (run >= 5) score += run - 2; run = 1; }
    }
    if (run >= 5) score += run - 2;
  }
  for (let c = 0; c < size; c++) {
    let run = 1;
    for (let r = 1; r < size; r++) {
      if (modules[r][c] === modules[r - 1][c]) run++; else { if (run >= 5) score += run - 2; run = 1; }
    }
    if (run >= 5) score += run - 2;
  }
  for (let r = 0; r < size - 1; r++)
    for (let c = 0; c < size - 1; c++) {
      const color = modules[r][c];
      if (color === modules[r][c + 1] && color === modules[r + 1][c] && color === modules[r + 1][c + 1]) score += 3;
    }
  return score;
}

function encode(text) {
  const data = Buffer.from(text, 'utf-8');
  const version = chooseVersion(data.length);
  const size = version * 4 + 17;

  const buf = new BitBuffer();
  buf.put(0b0100, 4);
  const charCountBits = version <= 9 ? 8 : 16;
  buf.put(data.length, charCountBits);
  for (const b of data) buf.put(b, 8);

  const totalDataBits = DATA_CAPACITY[version] * 8;
  buf.put(0, Math.min(4, totalDataBits - buf.length));
  while (buf.length % 8 !== 0) buf.put(0, 1);
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (buf.length < totalDataBits) { buf.put(padBytes[padIdx % 2], 8); padIdx++; }

  const dataBytes = buf.toBytes();
  const blocks = EC_BLOCKS[version];
  const ecPerBlock = EC_CODEWORDS[version];
  const gen = generatorPoly(ecPerBlock);
  const dataBlocks = [];
  const ecBlocks = [];
  let offset = 0;
  for (const [count, dcCount] of blocks) {
    for (let i = 0; i < count; i++) {
      const block = dataBytes.slice(offset, offset + dcCount);
      dataBlocks.push(block);
      const padded = [...block, ...new Array(ecPerBlock).fill(0)];
      ecBlocks.push(polyMod(padded, gen));
      offset += dcCount;
    }
  }

  const result = [];
  const maxDataLen = Math.max(...dataBlocks.map(b => b.length));
  for (let i = 0; i < maxDataLen; i++)
    for (const block of dataBlocks) if (i < block.length) result.push(block[i]);
  for (let i = 0; i < ecPerBlock; i++)
    for (const block of ecBlocks) if (i < block.length) result.push(block[i]);

  const modules = Array.from({ length: size }, () => new Array(size).fill(null));
  const isFunction = Array.from({ length: size }, () => new Array(size).fill(false));

  function setFinderPattern(row, col) {
    for (let r = -1; r <= 7; r++)
      for (let c = -1; c <= 7; c++) {
        const rr = row + r, cc = col + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        const inOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        modules[rr][cc] = (r >= 0 && r <= 6 && c >= 0 && c <= 6) && (inOuter || inInner);
        isFunction[rr][cc] = true;
      }
  }
  setFinderPattern(0, 0);
  setFinderPattern(0, size - 7);
  setFinderPattern(size - 7, 0);

  const alignPositions = getAlignmentPositions(version);
  for (const r of alignPositions)
    for (const c of alignPositions) {
      if ((r < 9 && c < 9) || (r < 9 && c >= size - 8) || (r >= size - 8 && c < 9)) continue;
      for (let dr = -2; dr <= 2; dr++)
        for (let dc = -2; dc <= 2; dc++) {
          modules[r + dr][c + dc] = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
          isFunction[r + dr][c + dc] = true;
        }
    }

  for (let i = 8; i < size - 8; i++) {
    modules[6][i] = i % 2 === 0; isFunction[6][i] = true;
    modules[i][6] = i % 2 === 0; isFunction[i][6] = true;
  }
  modules[size - 8][8] = true; isFunction[size - 8][8] = true;

  for (let i = 0; i < 8; i++) {
    isFunction[8][i] = true; isFunction[8][size - 1 - i] = true;
    isFunction[i][8] = true; isFunction[size - 1 - i][8] = true;
  }
  isFunction[8][8] = true;

  const dataBits = new BitBuffer();
  for (const byte of result) dataBits.put(byte, 8);
  const remainderBits = [0, 7, 7, 7, 7, 7, 0, 0, 0, 0, 0][version] || 0;
  for (let i = 0; i < remainderBits; i++) dataBits.put(0, 1);

  let bitIndex = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const col = right - j;
        const upward = ((right + 1) & 2) === 0;
        const row = upward ? size - 1 - vert : vert;
        if (!isFunction[row][col] && bitIndex < dataBits.length) {
          modules[row][col] = dataBits.getBit(bitIndex) === 1;
          bitIndex++;
        }
      }
    }
  }

  let bestScore = Infinity;
  let bestModules = modules;
  for (let mask = 0; mask < 8; mask++) {
    const masked = modules.map(row => [...row]);
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (!isFunction[r][c]) {
          let invert = false;
          switch (mask) {
            case 0: invert = (r + c) % 2 === 0; break;
            case 1: invert = r % 2 === 0; break;
            case 2: invert = c % 3 === 0; break;
            case 3: invert = (r + c) % 3 === 0; break;
            case 4: invert = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; break;
            case 5: invert = ((r * c) % 2) + ((r * c) % 3) === 0; break;
            case 6: invert = (((r * c) % 2) + ((r * c) % 3)) % 2 === 0; break;
            case 7: invert = (((r + c) % 2) + ((r * c) % 3)) % 2 === 0; break;
          }
          if (invert) masked[r][c] = !masked[r][c];
        }
    applyFormatInfo(masked, isFunction, size, mask);
    const score = penaltyScore(masked, size);
    if (score < bestScore) { bestScore = score; bestModules = masked; }
  }
  return { version, modules: bestModules };
}

// Generate SVG
const url = 'https://komedorobou.github.io/kumiaiin-techo-bessatsu/';
const { modules } = encode(url);
const moduleCount = modules.length;
const margin = 4;
const totalSize = moduleCount + margin * 2;
const scale = 10;

let rects = '';
for (let y = 0; y < moduleCount; y++)
  for (let x = 0; x < moduleCount; x++)
    if (modules[y][x])
      rects += `<rect x="${(x + margin) * scale}" y="${(y + margin) * scale}" width="${scale}" height="${scale}" fill="#1a1a2e"/>`;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize * scale}" height="${totalSize * scale}" viewBox="0 0 ${totalSize * scale} ${totalSize * scale}">
<rect width="${totalSize * scale}" height="${totalSize * scale}" fill="#ffffff"/>
${rects}
</svg>`;

fs.writeFileSync('public/qrcode.svg', svg);
console.log(`QR code generated: public/qrcode.svg (${moduleCount}x${moduleCount} modules, version ${(moduleCount - 17) / 4})`);
