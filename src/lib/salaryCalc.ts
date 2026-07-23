/**
 * salaryCalc.ts — 給料・手当・賞与・将来推移の計算（岸和田市）。
 * すべての率・額・号給は facts / slots / formulas 経由。ここに条例数値をベタ書きしない
 * （SENIOR_RATE 等 facts の文章中に埋まっている値だけは出典コメント付きで数値化）。
 */
import { factValue, getSalary, stepCount, getTable } from '@/lib/facts';
import {
  calcFuyo,
  commuteVehicleYen as slotCommuteVehicleYen,
  getPositionAddRate,
  positionKanriYen,
  positionLabels,
  positionOrder,
  kanrishokuTeateMap,
  type VehicleKind,
  type PositionLevel,
} from '@/lib/slots/kishiwada';

/* ---------- facts から引く定数 ---------- */
export const chiikiPct = Number(factValue('chiikiTeatePercent') ?? 0); // 11

function toTerm(v: unknown): { jun: number; dec: number } {
  if (typeof v === 'number') return { jun: v, dec: v };
  const o = (v ?? {}) as { jun?: number; dec?: number };
  return { jun: Number(o.jun ?? 0), dec: Number(o.dec ?? 0) };
}
const kimatsu = toTerm(factValue('bonusKimatsuRate'));
const kinben = toTerm(factValue('bonusKinbenRate'));
const raise = (factValue('raiseSteps') ?? { normal: 4, topGrade: 1, stopAge: 58 }) as {
  normal: number;
  topGrade?: number;
  standardMax?: number;
  stopAge?: number;
  stopAgeDoctor?: number;
};

// 管理職手当の一覧（手当ガイドの管理職タブ表示用。職制別定額の6区分）。
export const kanriList = positionOrder
  .filter((p) => kanrishokuTeateMap[p])
  .map((p) => ({ label: positionLabels[p], yen: kanrishokuTeateMap[p] as number }));

export const bonusRates = { kimatsu, kinben };

// 60歳超7割特例の給料率＝100分の70（給与条例 附則第23項）。
const SENIOR_RATE = 0.7;
// 昇給停止年齢＝満58歳（給与条例第10条の2）。
const RAISE_STOP_AGE = Number(raise.stopAge ?? 58);
// 60歳超7割措置の開始＝「60歳に達した日後の最初の4月1日」＝年齢モデルでは満61歳相当。
const SENIOR_START_AGE = 61;

/* ---------- 賞与月数（表示用） ---------- */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
export const kimatsuMonths = round2(kimatsu.jun + kimatsu.dec); // 2.525
export const kinbenMonths = round2(kinben.jun + kinben.dec); // 2.125
export const annualBonusMonths = round2(kimatsu.jun + kimatsu.dec + kinben.jun + kinben.dec); // 4.65

/* ---------- 役職（管理職手当・役職加算率は slots/kishiwada の10区分定義） ---------- */
export { getPositionAddRate, positionKanriYen, positionLabels, positionOrder };
export type { PositionLevel };

/* ---------- 地域手当 ---------- */
export function calcChiikiMonthly(base: number, fuyo: number, kanri: number): number {
  return Math.floor(((base + fuyo + kanri) * chiikiPct) / 100);
}
export function calcChiikiForBonus(base: number, fuyo: number): number {
  return Math.floor(((base + fuyo) * chiikiPct) / 100);
}

/* ---------- 通勤 ---------- */
export type CommuteMethod = 'transit' | 'car' | 'walk';
export function commuteVehicleYen(km: number, kind: VehicleKind = 'car'): number {
  return slotCommuteVehicleYen(km, kind);
}
export function commuteTransitYen(sixMonthPass: number): number {
  if (!sixMonthPass) return 0;
  return Math.round(sixMonthPass / 6);
}

/* ---------- 60歳超7割特例 ---------- */
export function isSeniorReduced(age: number): boolean {
  return age >= SENIOR_START_AGE;
}
export function applySeniorSalary(salary: number, age: number): number {
  if (age < SENIOR_START_AGE) return salary;
  return Math.round((salary * SENIOR_RATE) / 100) * 100;
}
export const seniorStartAge = SENIOR_START_AGE;
export const raiseStopAge = RAISE_STOP_AGE;

/* ---------- 昇給（1/1・標準4号／最上位級・部長は1号／58歳で停止） ---------- */
export function raiseStep(age: number, slow = false): number {
  if (age >= RAISE_STOP_AGE) return 0;
  return slow ? Number(raise.topGrade ?? 1) : Number(raise.normal ?? 4);
}

/* ---------- 賞与（役職加算は役職→率。給与条例第25条第6項／規則別表第2） ----------
 * 加算額＝floor((給料月額＋その地域手当) × 役職加算率)。本番実装と同一。
 */
export function positionAddGaku(base: number, position: PositionLevel, age: number): number {
  const rate = getPositionAddRate(position, age);
  if (rate <= 0) return 0;
  return Math.floor((base + (base * chiikiPct) / 100) * rate);
}
/** 期末手当の基礎額＝給料＋扶養手当＋（給料＋扶養に対する）地域手当＋役職加算（給与条例第25条第2項）。 */
export function bonusBaseOf(base: number, fuyo: number, position: PositionLevel, age: number): number {
  return base + fuyo + calcChiikiForBonus(base, fuyo) + positionAddGaku(base, position, age);
}
/** 勤勉手当の基礎額＝期末手当基礎額と同一（扶養込み）。
 *  岸和田は給与条例第26条第3項が第25条第5項（給料及び扶養手当の月額並びに地域手当の合計額）を
 *  読替えなしで勤勉手当基礎額に準用するため、読替えで扶養を除外する市と異なり扶養手当を含むのが条例どおり。 */
export function bonusKinbenBaseOf(base: number, fuyo: number, position: PositionLevel, age: number): number {
  return bonusBaseOf(base, fuyo, position, age);
}
export function bonusTerm(base: number, fuyo: number, position: PositionLevel, age: number, term: 'jun' | 'dec'): number {
  const kimatsuBase = bonusBaseOf(base, fuyo, position, age);
  const kinbenBase = bonusKinbenBaseOf(base, fuyo, position, age);
  return Math.floor(kimatsuBase * kimatsu[term]) + Math.floor(kinbenBase * kinben[term]);
}
export function bonusAnnual(base: number, fuyo: number, position: PositionLevel, age: number): number {
  return bonusTerm(base, fuyo, position, age, 'jun') + bonusTerm(base, fuyo, position, age, 'dec');
}

/* ---------- 再エクスポート ---------- */
export { getSalary, stepCount, getTable, calcFuyo };
