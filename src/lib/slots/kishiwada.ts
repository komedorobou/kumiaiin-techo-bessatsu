/**
 * slots/kishiwada.ts — 岸和田市専用スロット（このファイルだけベタ書き許可）。
 * 条例の構造上、汎用 facts スキーマに素直に載らない「市固有の特例・算式」を出典コメント付きで定数化する。
 *
 * 岸和田市の特例:
 *   1) 扶養手当に配偶者区分が無い（配偶者は扶養手当の対象外）。
 *      出典: 岸和田市職員給与条例 第15条第2項（扶養親族に配偶者を列挙せず）
 *      （facts.fuyoSpouse.value = "対象外"）
 *   2) 父母等の扶養手当は1人6,500円。ただし行政職等1等級職員は3,500円。
 *      出典: 岸和田市職員給与条例 第15条第3項
 *      （計算は6,500円で行い注記で示す。1等級判定は級から機械化しない）
 *   3) 交通用具（自動車・バイク・自転車）使用者の通勤手当は片道距離別の定額で、車種ごとに額が異なる。
 *      25km以上は5kmごとに3,900円加算（自動車の基準22,900円・バイク12,000円）で上限46,300円。
 *      出典: facts.tsukinVehicle（組合員手帳別冊の距離別表。給与条例第16条は任命権者委任）
 *   4) 級の向きが逆: 1級=最上位／級番号が大きいほど下位（新規採用側）。
 *      昇格は級番号が「減る」方向（gradeReversed=true）。
 *      出典: 岸和田市職員給与条例 別表第1（行政職給料表＝1等級最上位）
 */
import { factValue, getTable } from '@/lib/facts';

/* ---------- 級の向き（岸和田は 1級=最上位・級番号が大きいほど下位） ---------- */
export const gradeReversed = true;
export function defaultPromotionTarget(grade: number): number {
  return Math.max(1, grade - 1);
}
/** 標準の入口級（新規採用側＝最下位級＝級番号が最大）。表ごとの級数を渡す。 */
export function entryGrade(maxGrades: number): number {
  return maxGrades;
}

/* ---------- 役職（岸和田の実職制10区分） ----------
 * 部長〜主幹は管理職手当あり、担当長・主査・主任は管理職手当0だが実在する職制。
 * 役職→期末勤勉の加算率は給与規則別表第2の級区分（1等級20%…）と対応（本番実装どおり）。
 * 出典: 給与条例施行規則第1条の2（管理職手当・職制別定額）／別表第2（役職加算割合）。
 */
export type PositionLevel =
  | 'buchou' | 'riji' | 'kachou' | 'sanji' | 'kachohosa' | 'shukan'
  | 'tantouchou' | 'shusa' | 'shunin' | 'ippan';

export const positionOrder: PositionLevel[] = [
  'buchou', 'riji', 'kachou', 'sanji', 'kachohosa', 'shukan',
  'tantouchou', 'shusa', 'shunin', 'ippan',
];

export const positionLabels: Record<PositionLevel, string> = {
  buchou: '部長', riji: '理事', kachou: '課長', sanji: '参事',
  kachohosa: '課長補佐', shukan: '主幹', tantouchou: '担当長',
  shusa: '主査', shunin: '主任', ippan: '一般',
};

// 管理職手当（職制別定額。担当長・主査・主任・一般は0円）
export const kanrishokuTeateMap: Partial<Record<PositionLevel, number>> = {
  buchou: 72000, riji: 63000, kachou: 58000, sanji: 51000, kachohosa: 44000, shukan: 38000,
};
export function positionKanriYen(p: PositionLevel): number {
  return kanrishokuTeateMap[p] ?? 0;
}

// 期末・勤勉手当の役職加算率（給与規則別表第2の級区分に対応）。
// ※役職なし（一般）への年齢一律加算（本番の「44歳10%」）は例規に根拠がないため採らず0とする。
export function getPositionAddRate(p: PositionLevel): number {
  if (p === 'buchou' || p === 'riji') return 0.20;
  if (p === 'kachou' || p === 'sanji') return 0.15;
  if (p === 'kachohosa' || p === 'shukan') return 0.10;
  if (p === 'tantouchou' || p === 'shusa' || p === 'shunin') return 0.05;
  return 0; // 一般
}

/* ---------- 扶養手当（配偶者は対象外・子・16〜22歳加算・父母等） ----------
 * 父母等は1人6,500円。ただし1等級等職員（部長・理事級）は3,500円（給与条例第15条第3項）。
 */
export interface FuyoUnitAmounts {
  child: number;
  childAdd16to22: number;
  parents: number;
}
export function fuyoUnitAmounts(position: PositionLevel = 'ippan'): FuyoUnitAmounts {
  const reduced = position === 'buchou' || position === 'riji';
  return {
    child: Number(factValue('fuyoChild') ?? 0),
    childAdd16to22: Number(factValue('fuyoChildAdd16to22') ?? 0),
    parents: reduced ? 3500 : Number(factValue('fuyoParents') ?? 0),
  };
}
export function calcFuyo(
  input: { numChildren: number; numChildren16to22: number; numParents: number },
  position: PositionLevel = 'ippan'
): number {
  const u = fuyoUnitAmounts(position);
  return (
    input.numChildren * u.child +
    input.numChildren16to22 * u.childAdd16to22 +
    input.numParents * u.parents
  );
}

/* ---------- 交通用具の通勤手当（片道距離別の定額・車種別） ---------- */
export type VehicleKind = 'car' | 'bike' | 'bicycle';
type VehicleBand = { kmFrom: number; kmTo: number | null; car: number; bike: number; bicycle: number };

// 25km以上の加算（組合員手帳別冊の距離別表の運用）。5kmごと+3,900円・上限46,300円。
const VEHICLE_LONG_STEP_KM = 5;
const VEHICLE_LONG_STEP_YEN = 3900;
const VEHICLE_LONG_CAP = 46300;
const VEHICLE_BASE_25KM = { car: 22900, bike: 12000, bicycle: 0 } as const;

/** 交通用具使用者の通勤手当（月額）。片道距離kmと車種から額を引く（2km未満は対象外）。 */
export function commuteVehicleYen(km: number, kind: VehicleKind = 'car'): number {
  if (!km || km < 2) return 0;
  if (km >= 25) {
    if (kind === 'bicycle') return 0;
    const extra = Math.floor((km - 25) / VEHICLE_LONG_STEP_KM) * VEHICLE_LONG_STEP_YEN;
    return Math.min(VEHICLE_BASE_25KM[kind] + extra, VEHICLE_LONG_CAP);
  }
  const bands = (factValue('tsukinVehicle') ?? []) as VehicleBand[];
  for (const b of bands) {
    const okLow = km >= b.kmFrom;
    const okHigh = b.kmTo == null ? true : km < b.kmTo;
    if (okLow && okHigh) return b[kind] ?? 0;
  }
  return 0;
}

/* ---------- 会計年度任用職員（フルタイム）報酬 ---------- */
// フルタイム基準の週勤務時間（38時間45分＝38.75h）。会計年度の報酬按分の分母。
export const KAIKEI_FULLTIME_HOURS = 38.75;
export function kaikeiBase(go: number): number {
  const t = getTable('kaikei');
  const col = t?.cells['1'] ?? [];
  return col[go - 1] ?? 0;
}
export function kaikeiStepCount(): number {
  const t = getTable('kaikei');
  return t?.cells['1']?.length ?? 0;
}
/** 週勤務時間に応じた報酬月額＝floor(フルタイム給料月額 × 勤務時間 ÷ 38.75）。 */
export function kaikeiMonthly(go: number, hours: number): number {
  return Math.floor((kaikeiBase(go) * hours) / KAIKEI_FULLTIME_HOURS);
}
