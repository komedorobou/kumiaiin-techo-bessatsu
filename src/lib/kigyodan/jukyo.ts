/**
 * kigyodan/jukyo.ts — 住居手当の計算式（大阪広域水道企業団方式）。
 * 岸和田市の jukyo.ts とは独立（別データ源・別名前空間）。
 *
 * 出典: 大阪広域水道企業団職員の給与に関する規程 第43条第1項第1号
 * 条文構造:
 *   - 月額16,000円（facts.jukyoThreshold）を超える家賃が対象（16,000円以下は支給なし）。
 *   - 家賃が27,000円以下: 家賃 − 16,000円。
 *   - 家賃が27,000円超  : (家賃 − 27,000円) × 1/2（この額が17,000円を超えるときは17,000円）を 11,000円に加算。
 *   - 総額上限: 28,000円（facts.jukyoMax = 11,000 + 17,000）。
 */
import { factValue } from '@/lib/kigyodan/facts';

const BASE = Number(factValue('jukyoThreshold') ?? 16000); // 16,000（facts）
const CAP = Number(factValue('jukyoMax') ?? 28000); // 28,000（facts）
const STEP2 = 27000; // 第2段階の境界（条文の実数。facts.jukyoFormula.value に明記）
const STEP2_ADD = 11000; // 27,000円超区分の基礎加算額（条文の実数）
const STEP2_HALF_CAP = 17000; // (家賃-27,000)/2 の上限（条文の実数）

export function calcJukyo(rent: number): number {
  if (!rent || rent <= BASE) return 0;
  if (rent <= STEP2) return rent - BASE;
  const half = Math.min(Math.floor((rent - STEP2) / 2), STEP2_HALF_CAP);
  return Math.min(half + STEP2_ADD, CAP);
}

export const jukyoBounds = { BASE, CAP, STEP2, STEP2_ADD, STEP2_HALF_CAP };
