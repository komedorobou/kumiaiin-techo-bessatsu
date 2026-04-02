/**
 * QR Code SVG generator script.
 * Byte-mode encoding, EC level M, versions 1-10.
 */
const fs = require('fs');

// ========== GF(256) ==========
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x; LOG[x] = i;
    x <<= 1; if (x & 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
}

function gfMul(a, b) {
  return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
}

function rsEncode(data, ecLen) {
  let gen = [1];
  for (let i = 0; i < ecLen; i++) {
    const newGen = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      newGen[j] ^= gen[j];
      newGen[j + 1] ^= gfMul(gen[j], EXP[i]);
    }
    gen = newGen;
  }
  const result = new Array(ecLen).fill(0);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ result[0];
    result.shift();
    result.push(0);
    for (let j = 0; j < ecLen; j++) {
      result[j] ^= gfMul(gen[j + 1], factor);
    }
  }
  return result;
}

const QR_PARAMS = {
  1:  { size: 21, ecPB: 10, groups: [[1, 16]] },
  2:  { size: 25, ecPB: 16, groups: [[1, 28]] },
  3:  { size: 29, ecPB: 26, groups: [[1, 44]] },
  4:  { size: 33, ecPB: 18, groups: [[2, 32]] },
  5:  { size: 37, ecPB: 24, groups: [[2, 43]] },
  6:  { size: 41, ecPB: 16, groups: [[4, 27]] },
  7:  { size: 45, ecPB: 18, groups: [[4, 31]] },
  8:  { size: 49, ecPB: 22, groups: [[2, 38], [2, 39]] },
  9:  { size: 53, ecPB: 22, groups: [[3, 36], [2, 37]] },
  10: { size: 57, ecPB: 26, groups: [[4, 43], [1, 44]] },
};

const ALIGNMENT_PATTERNS = {
  1: [], 2: [6,18], 3: [6,22], 4: [6,26], 5: [6,30],
  6: [6,34], 7: [6,22,38], 8: [6,24,42], 9: [6,26,46], 10: [6,28,52],
};

function encode(text) {
  const data = Buffer.from(text, 'utf-8');
  let version = 0;
  for (let v = 1; v <= 10; v++) {
    const p = QR_PARAMS[v];
    let totalData = 0;
    for (const [cnt, dc] of p.groups) totalData += cnt * dc;
    const ccb = v <= 9 ? 8 : 16;
    if (4 + ccb + data.length * 8 <= totalData * 8) { version = v; break; }
  }
  if (!version) throw new Error('Data too long');

  const params = QR_PARAMS[version];
  const size = params.size;
  const ccb = version <= 9 ? 8 : 16;
  let totalDataCW = 0;
  for (const [cnt, dc] of params.groups) totalDataCW += cnt * dc;

  const bits = [];
  function pushBits(val, len) { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); }
  pushBits(0b0100, 4);
  pushBits(data.length, ccb);
  for (const b of data) pushBits(b, 8);
  const totalDataBits = totalDataCW * 8;
  for (let i = 0; i < 4 && bits.length < totalDataBits; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  const pads = [0xEC, 0x11]; let pi = 0;
  while (bits.length < totalDataBits) { pushBits(pads[pi & 1], 8); pi++; }

  const dataBytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    dataBytes.push(b);
  }

  const dataBlocks = [], ecBlocks = [];
  let offset = 0;
  for (const [cnt, dc] of params.groups) {
    for (let i = 0; i < cnt; i++) {
      const block = dataBytes.slice(offset, offset + dc);
      dataBlocks.push(block);
      ecBlocks.push(rsEncode(block, params.ecPB));
      offset += dc;
    }
  }

  const interleaved = [];
  const maxDC = Math.max(...dataBlocks.map(b => b.length));
  for (let i = 0; i < maxDC; i++)
    for (const b of dataBlocks) if (i < b.length) interleaved.push(b[i]);
  for (let i = 0; i < params.ecPB; i++)
    for (const b of ecBlocks) if (i < b.length) interleaved.push(b[i]);

  const grid = Array.from({ length: size }, () => new Array(size).fill(null));
  const reserved = Array.from({ length: size }, () => new Array(size).fill(false));

  function setMod(r, c, dark) { grid[r][c] = dark; reserved[r][c] = true; }

  function placeFinder(row, col) {
    for (let dr = -1; dr <= 7; dr++)
      for (let dc = -1; dc <= 7; dc++) {
        const r = row + dr, c = col + dc;
        if (r < 0 || r >= size || c < 0 || c >= size) continue;
        let dark = false;
        if (dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6)
          dark = dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
        setMod(r, c, dark);
      }
  }
  placeFinder(0, 0); placeFinder(0, size - 7); placeFinder(size - 7, 0);

  for (const ar of ALIGNMENT_PATTERNS[version])
    for (const ac of ALIGNMENT_PATTERNS[version]) {
      if (ar <= 8 && ac <= 8) continue;
      if (ar <= 8 && ac >= size - 9) continue;
      if (ar >= size - 9 && ac <= 8) continue;
      for (let dr = -2; dr <= 2; dr++)
        for (let dc = -2; dc <= 2; dc++)
          setMod(ar + dr, ac + dc, Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0));
    }

  for (let i = 8; i < size - 8; i++) {
    if (!reserved[6][i]) setMod(6, i, i % 2 === 0);
    if (!reserved[i][6]) setMod(i, 6, i % 2 === 0);
  }
  setMod(size - 8, 8, true);

  for (let i = 0; i <= 8; i++) {
    if (!reserved[8][i]) { reserved[8][i] = true; grid[8][i] = false; }
    if (!reserved[i][8]) { reserved[i][8] = true; grid[i][8] = false; }
  }
  for (let i = 0; i < 8; i++)
    if (!reserved[8][size - 1 - i]) { reserved[8][size - 1 - i] = true; grid[8][size - 1 - i] = false; }
  for (let i = 0; i < 7; i++)
    if (!reserved[size - 1 - i][8]) { reserved[size - 1 - i][8] = true; grid[size - 1 - i][8] = false; }

  const dataBitStream = [];
  for (const byte of interleaved) for (let i = 7; i >= 0; i--) dataBitStream.push((byte >> i) & 1);

  const isDataMod = Array.from({ length: size }, () => new Array(size).fill(false));
  let bi = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++)
      for (let j = 0; j < 2; j++) {
        const col = right - j;
        const upward = ((Math.floor((size - 1 - right) / 2)) & 1) === 0;
        const row = upward ? size - 1 - vert : vert;
        if (row >= 0 && row < size && col >= 0 && col < size && !reserved[row][col]) {
          grid[row][col] = bi < dataBitStream.length ? dataBitStream[bi] === 1 : false;
          isDataMod[row][col] = true;
          bi++;
        }
      }
  }

  const maskFns = [
    (r, c) => (r + c) % 2 === 0,
    (r) => r % 2 === 0,
    (_, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
    (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
    (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
  ];

  let bestPen = Infinity, bestResult = grid;
  for (let m = 0; m < 8; m++) {
    const masked = grid.map(r => [...r]);
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (isDataMod[r][c] && maskFns[m](r, c)) masked[r][c] = !masked[r][c];
    writeFormatInfo(masked, size, m);
    const pen = calcPenalty(masked, size);
    if (pen < bestPen) { bestPen = pen; bestResult = masked; }
  }
  return { version, modules: bestResult };
}

function writeFormatInfo(grid, size, maskPattern) {
  const formatData = (0b00 << 3) | maskPattern;
  let rem = formatData;
  for (let i = 0; i < 10; i++) { rem <<= 1; if (rem & (1 << 10)) rem ^= 0b10100110111; }
  const fb = ((formatData << 10) | rem) ^ 0b101010000010010;

  const posA = [[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
  const posB = [[size-1,8],[size-2,8],[size-3,8],[size-4,8],[size-5,8],[size-6,8],[size-7,8],
    [8,size-8],[8,size-7],[8,size-6],[8,size-5],[8,size-4],[8,size-3],[8,size-2],[8,size-1]];
  for (let i = 0; i < 15; i++) {
    grid[posA[i][0]][posA[i][1]] = ((fb >> i) & 1) === 1;
    grid[posB[i][0]][posB[i][1]] = ((fb >> i) & 1) === 1;
  }
}

function calcPenalty(grid, size) {
  let pen = 0;
  for (let r = 0; r < size; r++) {
    let cnt = 1;
    for (let c = 1; c < size; c++) { if (grid[r][c] === grid[r][c-1]) cnt++; else { if (cnt >= 5) pen += cnt - 2; cnt = 1; } }
    if (cnt >= 5) pen += cnt - 2;
  }
  for (let c = 0; c < size; c++) {
    let cnt = 1;
    for (let r = 1; r < size; r++) { if (grid[r][c] === grid[r-1][c]) cnt++; else { if (cnt >= 5) pen += cnt - 2; cnt = 1; } }
    if (cnt >= 5) pen += cnt - 2;
  }
  for (let r = 0; r < size - 1; r++)
    for (let c = 0; c < size - 1; c++) {
      const v = grid[r][c];
      if (v === grid[r][c+1] && v === grid[r+1][c] && v === grid[r+1][c+1]) pen += 3;
    }
  const p1 = [1,0,1,1,1,0,1,0,0,0,0], p2 = [0,0,0,0,1,0,1,1,1,0,1];
  for (let r = 0; r < size; r++)
    for (let c = 0; c <= size - 11; c++) {
      let m1 = true, m2 = true;
      for (let i = 0; i < 11; i++) { const v = grid[r][c+i] ? 1 : 0; if (v !== p1[i]) m1 = false; if (v !== p2[i]) m2 = false; }
      if (m1 || m2) pen += 40;
    }
  for (let c = 0; c < size; c++)
    for (let r = 0; r <= size - 11; r++) {
      let m1 = true, m2 = true;
      for (let i = 0; i < 11; i++) { const v = grid[r+i][c] ? 1 : 0; if (v !== p1[i]) m1 = false; if (v !== p2[i]) m2 = false; }
      if (m1 || m2) pen += 40;
    }
  let dark = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (grid[r][c]) dark++;
  const pct = (dark * 100) / (size * size);
  const prev5 = Math.floor(pct / 5) * 5;
  pen += Math.min(Math.abs(prev5 - 50) / 5, Math.abs(prev5 + 5 - 50) / 5) * 10;
  return pen;
}

// Generate SVG
const url = 'https://komedorobou.github.io/kumiaiin-techo-bessatsu/';
const { modules } = encode(url);
const mc = modules.length;
const margin = 4;
const totalSize = mc + margin * 2;
const scale = 10;

let rects = '';
for (let y = 0; y < mc; y++)
  for (let x = 0; x < mc; x++)
    if (modules[y][x])
      rects += `<rect x="${(x + margin) * scale}" y="${(y + margin) * scale}" width="${scale}" height="${scale}" fill="#1a1a2e"/>`;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize * scale}" height="${totalSize * scale}" viewBox="0 0 ${totalSize * scale} ${totalSize * scale}">
<rect width="${totalSize * scale}" height="${totalSize * scale}" fill="#ffffff"/>
${rects}
</svg>`;

fs.writeFileSync('public/qrcode.svg', svg);
console.log(`QR code generated: public/qrcode.svg (${mc}x${mc} modules, version ${(mc - 17) / 4})`);
