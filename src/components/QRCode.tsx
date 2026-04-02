'use client';

/**
 * QR Code generator component (SVG output).
 * Byte-mode encoding, EC level M, versions 1-10.
 * No external dependencies.
 */

// ========== GF(256) ==========
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
}

function gfMul(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
}

function rsEncode(data: number[], ecLen: number): number[] {
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

// ========== QR Parameters (EC Level M) ==========
const QR_PARAMS: Record<number, { size: number; ecPB: number; groups: number[][] }> = {
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

const ALIGNMENT_PATTERNS: Record<number, number[]> = {
  1: [], 2: [6,18], 3: [6,22], 4: [6,26], 5: [6,30],
  6: [6,34], 7: [6,22,38], 8: [6,24,42], 9: [6,26,46], 10: [6,28,52],
};

// ========== Encoding ==========
function encode(text: string): { version: number; modules: boolean[][] } {
  const textBytes = new TextEncoder().encode(text);

  // Choose version
  let version = 0;
  for (let v = 1; v <= 10; v++) {
    const p = QR_PARAMS[v];
    let totalData = 0;
    for (const [cnt, dc] of p.groups) totalData += cnt * dc;
    const charCountBits = v <= 9 ? 8 : 16;
    const bitsNeeded = 4 + charCountBits + textBytes.length * 8;
    if (bitsNeeded <= totalData * 8) { version = v; break; }
  }
  if (!version) throw new Error('Data too long for QR versions 1-10');

  const params = QR_PARAMS[version];
  const size = params.size;
  const charCountBits = version <= 9 ? 8 : 16;

  let totalDataCW = 0;
  for (const [cnt, dc] of params.groups) totalDataCW += cnt * dc;

  // Build data bitstream
  const bits: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  }

  pushBits(0b0100, 4); // Byte mode
  pushBits(textBytes.length, charCountBits);
  for (const b of textBytes) pushBits(b, 8);

  const totalDataBits = totalDataCW * 8;
  for (let i = 0; i < 4 && bits.length < totalDataBits; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const pads = [0xEC, 0x11];
  let padIdx = 0;
  while (bits.length < totalDataBits) {
    pushBits(pads[padIdx & 1], 8);
    padIdx++;
  }

  const dataBytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    dataBytes.push(byte);
  }

  // Split into blocks and compute EC
  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let offset = 0;
  for (const [cnt, dcPerBlock] of params.groups) {
    for (let i = 0; i < cnt; i++) {
      const block = dataBytes.slice(offset, offset + dcPerBlock);
      dataBlocks.push(block);
      ecBlocks.push(rsEncode(block, params.ecPB));
      offset += dcPerBlock;
    }
  }

  // Interleave
  const interleaved: number[] = [];
  const maxDC = Math.max(...dataBlocks.map(b => b.length));
  for (let i = 0; i < maxDC; i++)
    for (const b of dataBlocks) if (i < b.length) interleaved.push(b[i]);
  for (let i = 0; i < params.ecPB; i++)
    for (const b of ecBlocks) if (i < b.length) interleaved.push(b[i]);

  // ========== Build QR matrix ==========
  const grid: (boolean | null)[][] = Array.from({ length: size }, () => new Array(size).fill(null));
  const reserved: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

  function setModule(r: number, c: number, dark: boolean) {
    grid[r][c] = dark;
    reserved[r][c] = true;
  }

  // Finder patterns
  function placeFinderPattern(row: number, col: number) {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = row + dr, c = col + dc;
        if (r < 0 || r >= size || c < 0 || c >= size) continue;
        let dark = false;
        if (dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6) {
          dark = dr === 0 || dr === 6 || dc === 0 || dc === 6 ||
                 (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
        }
        setModule(r, c, dark);
      }
    }
  }
  placeFinderPattern(0, 0);
  placeFinderPattern(0, size - 7);
  placeFinderPattern(size - 7, 0);

  // Alignment patterns
  const alignPos = ALIGNMENT_PATTERNS[version];
  for (const ar of alignPos) {
    for (const ac of alignPos) {
      if (ar <= 8 && ac <= 8) continue;
      if (ar <= 8 && ac >= size - 9) continue;
      if (ar >= size - 9 && ac <= 8) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dark = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
          setModule(ar + dr, ac + dc, dark);
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!reserved[6][i]) setModule(6, i, i % 2 === 0);
    if (!reserved[i][6]) setModule(i, 6, i % 2 === 0);
  }

  // Dark module
  setModule(size - 8, 8, true);

  // Reserve format info areas
  // Top-left: row 8 cols 0-8 and col 8 rows 0-8
  for (let i = 0; i <= 8; i++) {
    if (!reserved[8][i]) { reserved[8][i] = true; grid[8][i] = false; }
    if (!reserved[i][8]) { reserved[i][8] = true; grid[i][8] = false; }
  }
  // Top-right: row 8, cols size-8 to size-1 (8 positions)
  for (let i = 0; i < 8; i++) {
    if (!reserved[8][size - 1 - i]) { reserved[8][size - 1 - i] = true; grid[8][size - 1 - i] = false; }
  }
  // Bottom-left: col 8, rows size-7 to size-1 (7 positions)
  for (let i = 0; i < 7; i++) {
    if (!reserved[size - 1 - i][8]) { reserved[size - 1 - i][8] = true; grid[size - 1 - i][8] = false; }
  }

  // Place data bits
  const dataBitStream: number[] = [];
  for (const byte of interleaved) {
    for (let i = 7; i >= 0; i--) dataBitStream.push((byte >> i) & 1);
  }

  const isDataModule: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  let bitIdx = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const col = right - j;
        const upward = ((Math.floor((size - 1 - right) / 2)) & 1) === 0;
        const row = upward ? size - 1 - vert : vert;
        if (row >= 0 && row < size && col >= 0 && col < size && !reserved[row][col]) {
          grid[row][col] = bitIdx < dataBitStream.length ? dataBitStream[bitIdx] === 1 : false;
          isDataModule[row][col] = true;
          bitIdx++;
        }
      }
    }
  }

  // ========== Masking ==========
  const maskFns = [
    (r: number, c: number) => (r + c) % 2 === 0,
    (r: number, _c: number) => r % 2 === 0,
    (_r: number, c: number) => c % 3 === 0,
    (r: number, c: number) => (r + c) % 3 === 0,
    (r: number, c: number) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r: number, c: number) => ((r * c) % 2) + ((r * c) % 3) === 0,
    (r: number, c: number) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
    (r: number, c: number) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
  ];

  let bestPenalty = Infinity;
  let bestResult: (boolean | null)[][] = grid;

  for (let m = 0; m < 8; m++) {
    const masked = grid.map(row => [...row]);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (isDataModule[r][c] && maskFns[m](r, c)) {
          masked[r][c] = !masked[r][c];
        }
      }
    }

    writeFormatInfo(masked, size, m);

    const pen = calcPenalty(masked, size);
    if (pen < bestPenalty) {
      bestPenalty = pen;
      bestResult = masked;
    }
  }

  return { version, modules: bestResult as boolean[][] };
}

function writeFormatInfo(grid: (boolean | null)[][], size: number, maskPattern: number) {
  const ecBits = 0b00; // EC level M
  const formatData = (ecBits << 3) | maskPattern;

  // BCH(15,5)
  let remainder = formatData;
  for (let i = 0; i < 10; i++) {
    remainder <<= 1;
    if (remainder & (1 << 10)) remainder ^= 0b10100110111;
  }
  const formatBits = ((formatData << 10) | remainder) ^ 0b101010000010010;

  // First copy: around top-left finder (bit 0 at (8,0), bit 14 at (0,8))
  const posA: [number, number][] = [
    [8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],
    [7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8],
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = posA[i];
    grid[r][c] = ((formatBits >> i) & 1) === 1;
  }

  // Second copy: bit 0 at (size-1,8), bit 14 at (8,size-1)
  const posB: [number, number][] = [
    [size-1,8],[size-2,8],[size-3,8],[size-4,8],[size-5,8],[size-6,8],[size-7,8],
    [8,size-8],[8,size-7],[8,size-6],[8,size-5],[8,size-4],[8,size-3],[8,size-2],[8,size-1],
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = posB[i];
    grid[r][c] = ((formatBits >> i) & 1) === 1;
  }
}

function calcPenalty(grid: (boolean | null)[][], size: number): number {
  let penalty = 0;

  // Rule 1: runs of same color
  for (let r = 0; r < size; r++) {
    let count = 1;
    for (let c = 1; c < size; c++) {
      if (grid[r][c] === grid[r][c - 1]) count++;
      else { if (count >= 5) penalty += count - 2; count = 1; }
    }
    if (count >= 5) penalty += count - 2;
  }
  for (let c = 0; c < size; c++) {
    let count = 1;
    for (let r = 1; r < size; r++) {
      if (grid[r][c] === grid[r - 1][c]) count++;
      else { if (count >= 5) penalty += count - 2; count = 1; }
    }
    if (count >= 5) penalty += count - 2;
  }

  // Rule 2: 2x2 blocks
  for (let r = 0; r < size - 1; r++)
    for (let c = 0; c < size - 1; c++) {
      const v = grid[r][c];
      if (v === grid[r][c+1] && v === grid[r+1][c] && v === grid[r+1][c+1]) penalty += 3;
    }

  // Rule 3: finder-like patterns
  const pat1 = [1,0,1,1,1,0,1,0,0,0,0];
  const pat2 = [0,0,0,0,1,0,1,1,1,0,1];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - 11; c++) {
      let m1 = true, m2 = true;
      for (let i = 0; i < 11; i++) {
        const v = grid[r][c+i] ? 1 : 0;
        if (v !== pat1[i]) m1 = false;
        if (v !== pat2[i]) m2 = false;
      }
      if (m1 || m2) penalty += 40;
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - 11; r++) {
      let m1 = true, m2 = true;
      for (let i = 0; i < 11; i++) {
        const v = grid[r+i][c] ? 1 : 0;
        if (v !== pat1[i]) m1 = false;
        if (v !== pat2[i]) m2 = false;
      }
      if (m1 || m2) penalty += 40;
    }
  }

  // Rule 4: dark module proportion
  let darkCount = 0;
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (grid[r][c]) darkCount++;
  const percent = (darkCount * 100) / (size * size);
  const prev5 = Math.floor(percent / 5) * 5;
  const next5 = prev5 + 5;
  penalty += Math.min(Math.abs(prev5 - 50) / 5, Math.abs(next5 - 50) / 5) * 10;

  return penalty;
}

// ========== React component ==========
interface QRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
}

export default function QRCode({
  value,
  size: displaySize = 256,
  fgColor = '#1a1a2e',
  bgColor = '#ffffff',
  className,
}: QRCodeProps) {
  const { modules } = encode(value);
  const moduleCount = modules.length;
  const margin = 4;
  const totalSize = moduleCount + margin * 2;

  return (
    <svg
      width={displaySize}
      height={displaySize}
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      className={className}
    >
      <rect width={totalSize} height={totalSize} fill={bgColor} />
      {modules.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${y}-${x}`}
              x={x + margin}
              y={y + margin}
              width={1}
              height={1}
              fill={fgColor}
            />
          ) : null
        )
      )}
    </svg>
  );
}
