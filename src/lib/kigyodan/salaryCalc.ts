/**
 * kigyodan/salaryCalc.ts — 大阪広域水道企業団の給料・手当・賞与・将来推移の計算。
 * 岸和田市の salaryCalc.ts とは完全独立（別データ源・別ロジック）。岸和田の条例ロジックは一切使わない。
 * すべての率・額・号給は kigyodan/facts・slots 経由。条文中に埋まった値だけ出典コメント付きで数値化する。
 */
import { factValue, getSalary, stepCount, getTable } from '@/lib/kigyodan/facts';
import { calcFuyo, fuyoUnitAmounts, kanriTiers, kanriYenById } from '@/lib/kigyodan/slots';

/* ---------- facts から引く定数 ---------- */
// 地域手当 12.8%（大阪府の区域に在勤する職員。給与規程 第42条第1項）。
export const chiikiPct = Number(factValue('chiikiTeatePercent') ?? 0);

// 期末・勤勉手当の1期あたり月数（基準日6/1・12/1に各1回）。
// 通常職員: 期末126.25%・勤勉106.25%。7級以上（特定管理職員）は期末106.25%・勤勉126.25%と入れ替わる。
const KIMATSU_NORMAL = Number(factValue('bonusKimatsuRate') ?? 0); // 1.2625
const KIMATSU_HIGH7 = Number(factValue('bonusKimatsuHigh7kyu') ?? 0); // 1.0625（7級以上の期末）
const KINBEN_NORMAL = Number(factValue('bonusKinbenRate') ?? 0); // 1.0625
// 7級以上の勤勉は126.25%（給与規程 第55条第1項第1号の特定管理職員＝期末の通常率と同値）。
const KINBEN_HIGH7 = KIMATSU_NORMAL; // 1.2625
// 7級以上（特定管理職員）の判定境界。
const SPECIAL_MANAGER_GRADE = 7;

// 昇給: 標準4号給。55歳到達年度末を超えて在職する職員は2号給に半減（給与規程 第30条）。
const raiseObj = (factValue('raiseSteps') ?? { normal: 4, over55: 2 }) as { normal: number; over55: number };
const RAISE_NORMAL = Number(raiseObj.normal ?? 4);
const RAISE_HALF = Number(factValue('raiseOver55') ?? raiseObj.over55 ?? 2);
// 「55歳に達した日の属する会計年度の末日を超えて」＝年齢モデルでは満56歳相当。
const RAISE_HALF_AGE = 56;

// 60歳超70%措置（給与規程 附則第15項・管理職手当規程 附則第2項）。
// 「60歳に達した日後の最初の4月1日」＝年齢モデルでは満61歳相当。
const SENIOR_RATE = 0.7;
const SENIOR_START_AGE = 61;

// 定年 65歳（定年等に関する条例 第3条）。
export const teinenAge = Number(factValue('teinenAge') ?? 65);

/* ---------- 賞与 月数（表示用） ---------- */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
/** 通常職員の期末（年間）＝1期分×2。 */
export const kimatsuMonths = round2(KIMATSU_NORMAL * 2); // 2.525
export const kinbenMonths = round2(KINBEN_NORMAL * 2); // 2.125
export const annualBonusMonths = round2((KIMATSU_NORMAL + KINBEN_NORMAL) * 2); // 4.65

/** 級に応じた1期あたりの期末・勤勉率。 */
export function bonusRatesForGrade(grade: number): { kimatsu: number; kinben: number; special: boolean } {
  const special = grade >= SPECIAL_MANAGER_GRADE;
  return special
    ? { kimatsu: KIMATSU_HIGH7, kinben: KINBEN_HIGH7, special }
    : { kimatsu: KIMATSU_NORMAL, kinben: KINBEN_NORMAL, special };
}
export const specialManagerGrade = SPECIAL_MANAGER_GRADE;

/* ---------- 地域手当（基礎＝給料＋管理職手当＋扶養手当） ---------- */
export function calcChiikiMonthly(base: number, fuyo: number, kanri: number): number {
  return Math.floor(((base + fuyo + kanri) * chiikiPct) / 100);
}
/** 賞与基礎に乗せる地域手当（給料＋扶養手当に対する分）。 */
export function calcChiikiForBonus(base: number, fuyo: number): number {
  return Math.floor(((base + fuyo) * chiikiPct) / 100);
}

/* ---------- 60歳超70%特例 ---------- */
export function isSeniorReduced(age: number): boolean {
  return age >= SENIOR_START_AGE;
}
/** 給料月額×70%（50円未満切捨・50〜100円未満は100円切上＝100円単位に丸め）。 */
export function applySeniorSalary(salary: number, age: number): number {
  if (age < SENIOR_START_AGE) return salary;
  return Math.round((salary * SENIOR_RATE) / 100) * 100;
}
/** 管理職手当×70%（管理職手当規程 附則第2項）。 */
export function applySeniorKanri(kanri: number, age: number): number {
  if (age < SENIOR_START_AGE || kanri <= 0) return kanri;
  return Math.round((kanri * SENIOR_RATE) / 100) * 100;
}
export const seniorStartAge = SENIOR_START_AGE;
export const seniorRatePct = SENIOR_RATE * 100;

/* ---------- 昇給（標準4号・満56歳以上は2号・停止年齢の明文なし） ---------- */
export function raiseStep(age: number): number {
  return age >= RAISE_HALF_AGE ? RAISE_HALF : RAISE_NORMAL;
}
export const raiseHalfAge = RAISE_HALF_AGE;
export const raiseNormalStep = RAISE_NORMAL;
export const raiseHalfStep = RAISE_HALF;

/* ---------- 通勤 ---------- */
export type CommuteMethod = 'transit' | 'vehicle' | 'walk';

/* ---------- 賞与額（役職段階別加算は企業団に無し。7級以上は率の入替のみ） ----------
 * 基礎額＝給料＋扶養手当＋（給料＋扶養手当に対する）地域手当。
 * 1期分＝floor(基礎×期末率)＋floor(基礎×勤勉率)。年間＝1期分×2（基準日6/1・12/1）。
 */
/** 期末手当の基礎額＝給料＋扶養手当＋（給料＋扶養に対する）地域手当（給与規程 第52条第3項）。 */
export function bonusBaseOf(base: number, fuyo: number): number {
  return base + fuyo + calcChiikiForBonus(base, fuyo);
}
/** 勤勉手当の基礎額＝給料＋（給料に対する）地域手当。扶養手当は含めない
 *  （給与規程 第55条「給料の月額及びこれに対する地域手当の月額」）。 */
export function bonusKinbenBaseOf(base: number): number {
  return base + calcChiikiForBonus(base, 0);
}
export function bonusTerm(base: number, fuyo: number, grade: number): number {
  const r = bonusRatesForGrade(grade);
  return Math.floor(bonusBaseOf(base, fuyo) * r.kimatsu) + Math.floor(bonusKinbenBaseOf(base) * r.kinben);
}
export function bonusAnnual(base: number, fuyo: number, grade: number): number {
  return bonusTerm(base, fuyo, grade) * 2;
}

/* ---------- 再エクスポート ---------- */
export { getSalary, stepCount, getTable, calcFuyo, fuyoUnitAmounts, kanriTiers, kanriYenById };
