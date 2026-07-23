/**
 * jukyo.ts — 住居手当の計算式（岸和田市方式）。
 * 式の「構造」を関数で表現し、取れる定数は facts から取る。
 *
 * 出典: 岸和田市職員給与条例 第14条の4第2項
 * 条文構造（岸和田）:
 *   - 月額16,000円（facts.jukyoBase）を超える家賃が対象（16,000円以下は支給なし）。
 *   - 家賃が27,000円以下: 家賃 − 16,000円。
 *   - 家賃が27,000円超  : (家賃 − 27,000円) × 1/2（この額が17,000円を超えるときは17,000円）を 11,000円に加算。
 *   - 総額上限: 28,000円（facts.jukyoMax = 11,000 + 17,000）。
 */
import factsData from '@/data/facts.json';

const F = factsData as any;
const BASE: number = F.facts.jukyoBase.value; // 16,000
const CAP: number = F.facts.jukyoMax.value; // 28,000
const STEP2 = 27000; // 第2段階の境界（条文の実数。facts.jukyoFormula.value に明記）
const STEP2_ADD = 11000; // 27,000円超区分の基礎加算額（条文の実数）
const STEP2_HALF_CAP = 17000; // (家賃-27,000)/2 の上限（条文の実数）

export const jukyoFormulaType = 'kishiwada';

export function calcJukyo(rent: number): number {
  if (!rent || rent <= BASE) return 0;
  if (rent <= STEP2) return rent - BASE;
  const half = Math.min(Math.floor((rent - STEP2) / 2), STEP2_HALF_CAP);
  return Math.min(half + STEP2_ADD, CAP);
}

// 画面表示用の境界値ヘルパ（facts.jukyoFormula.value を第一次ソースとして使うのが基本）。
export const jukyoBounds = { BASE, CAP, STEP2, STEP2_ADD, STEP2_HALF_CAP };
