/**
 * kigyodan/slots.ts — 大阪広域水道企業団の固有スロット（このファイルはベタ書き許可＝src/lib配下）。
 * 汎用 facts スキーマに素直に載らない企業団固有の算式・特例を出典コメント付きで定数化する。
 * 岸和田市の slots/kishiwada.ts とは完全独立。
 *
 * 企業団の特例:
 *   1) 級の向きが岸和田と逆: 1級=最下位（新規採用側）／10級=最上位。昇格は級番号が「増える」方向。
 *      出典: 給与に関する規程 別表第1（企業職給料表＝1級が最下位）
 *   2) 扶養手当は「級」で単価が変わる（役職ではない）: 8級は父母等3,500円、9級以上は父母等不支給。
 *      出典: 給与に関する規程 第41条第2項・第1項（企業長が定める職務の級＝9級）
 *   3) 配偶者は扶養手当の対象外（条例第6条第2項の扶養親族に配偶者を掲げない）。
 *   4) 管理職手当は「級×区分」の定額表（別表第2）。定率でない。
 *   5) 通勤手当は「交通機関＝運賃相当（月額上限15万円）」と「自転車等＝片道距離別の定額」の2系統。
 *      車種（自動車/バイク）別の区分は無い（自転車等の距離別単一額）。
 *      出典: 給与に関する規程 第44条
 */
import { factValue, getTable } from '@/lib/kigyodan/facts';

/* ---------- 級の向き（企業団は 1級=最下位・級が上がるほど上位） ---------- */
export const gradeReversed = false;
/** 標準の入口級（新規採用側＝最下位級＝1級）。 */
export const ENTRY_GRADE = 1;
/** 既定の昇格先（1つ上の級）。最上位級を超えない。 */
export function defaultPromotionTarget(grade: number, maxGrades: number): number {
  return Math.min(maxGrades, grade + 1);
}

/* ---------- 扶養手当（配偶者対象外・子・15〜22歳加算・父母等は級で逓減） ----------
 * 子: 13,000円／15歳到達後最初の4/1〜22歳の子は+5,000円加算／父母等: 6,500円。
 * ただし父母等は 8級=3,500円、9級以上=不支給（給与規程 第41条）。
 */
export interface FuyoUnitAmounts {
  child: number;
  childAdd15to22: number;
  parents: number;
  parentsUnsupported: boolean; // 9級以上は父母等不支給
}
/** 8級の父母等減額単価（給与規程 第41条第2項かっこ書きの実数）。 */
const FUYO_PARENTS_G8 = 3500;
/** 父母等が不支給となる級の下限（給与規程 第41条第1項＝企業長が定める職務の級9級）。 */
const FUYO_PARENTS_CUT_GRADE = 9;
/** 8級（父母等が3,500円に下がる級）。 */
const FUYO_PARENTS_HALF_GRADE = 8;

export function fuyoUnitAmounts(grade: number): FuyoUnitAmounts {
  const parentsUnsupported = grade >= FUYO_PARENTS_CUT_GRADE;
  const parents = parentsUnsupported
    ? 0
    : grade === FUYO_PARENTS_HALF_GRADE
      ? FUYO_PARENTS_G8
      : Number(factValue('fuyoParentsEtc') ?? 0);
  return {
    child: Number(factValue('fuyoChild') ?? 0),
    childAdd15to22: Number(factValue('fuyoChildAdd15to22') ?? 0),
    parents,
    parentsUnsupported,
  };
}

export function calcFuyo(
  input: { numChildren: number; numChildren15to22: number; numParents: number },
  grade: number
): number {
  const u = fuyoUnitAmounts(grade);
  return (
    input.numChildren * u.child +
    input.numChildren15to22 * u.childAdd15to22 +
    input.numParents * u.parents
  );
}

/* ---------- 管理職手当（級×区分の定額表・別表第2） ----------
 * facts.kanrishokuTeate = [{grade:"10級", tiers:{"1種":128100,...}}, ...]（6〜10級のみ）。
 * シミュレーターでは全（級×区分）を一覧化して選択させ、非管理職＝0円を既定にする。
 */
export interface KanriTier {
  id: string; // "10級-1種"
  label: string; // "10級 1種"
  grade: string; // "10級"
  tier: string; // "1種"
  yen: number;
}
type KanriRow = { grade: string; tiers: Record<string, number> };

export function kanriTiers(): KanriTier[] {
  const rows = (factValue('kanrishokuTeate') ?? []) as KanriRow[];
  const out: KanriTier[] = [];
  for (const r of rows) {
    for (const [tier, amount] of Object.entries(r.tiers)) {
      out.push({ id: `${r.grade}-${tier}`, label: `${r.grade} ${tier}`, grade: r.grade, tier, yen: amount });
    }
  }
  return out;
}
/** 管理職手当区分ID → 月額。非管理職（''）は0円。 */
export function kanriYenById(id: string): number {
  if (!id) return 0;
  return kanriTiers().find((t) => t.id === id)?.yen ?? 0;
}

/* ---------- 通勤手当 ---------- */
/** 交通機関の月額上限（＝1箇月当たり15万円。facts.tsukinTransit の文中の実数を計算用に数値化）。
 *  出典: 給与に関する規程 第44条第5項「15万円を超える職員の通勤手当の額は…15万円…」 */
export const TRANSIT_MONTHLY_CAP = 150000;

type VehicleBand = { kmFrom: number; kmTo: number | null; yen: number };
/** 自転車等使用者の通勤手当（月額）。片道距離kmから距離帯の定額を引く（片道2km未満は対象外）。 */
export function commuteVehicleYen(km: number): number {
  if (!km || km < 2) return 0;
  const bands = (factValue('tsukinVehicle') ?? []) as VehicleBand[];
  for (const b of bands) {
    const okLow = km >= b.kmFrom;
    const okHigh = b.kmTo == null ? true : km < b.kmTo;
    if (okLow && okHigh) return b.yen ?? 0;
  }
  return 0;
}
/** 交通機関（運賃相当）の月額。6箇月定期代 ÷ 6、月額上限15万円。 */
export function commuteTransitYen(sixMonthPass: number): number {
  if (!sixMonthPass) return 0;
  return Math.min(Math.round(sixMonthPass / 6), TRANSIT_MONTHLY_CAP);
}

/* ---------- 定年前再任用短時間 基準給料月額（参考） ---------- */
export function saiteiSaininyoValues(): number[] {
  return getTable('kigyoshoku')?.saiteiSaininyo?.values ?? [];
}
