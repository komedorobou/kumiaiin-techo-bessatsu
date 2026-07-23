/**
 * ui.ts — 表示ロジック用の非事実（UIの物差し）定数。
 * ここは条例の「事実」ではなく、スライダーの上限や万円換算など画面制御の数値だけを置く。
 * facts.json（事実）とは明確に分離。src/app・src/components からは必ずこの層を import して使い、
 * .tsx に4桁以上のマジックナンバーを置かない。
 */

// 万円換算
export const YEN_PER_MAN = 10000;

// ミリ秒→秒（雲アニメの時間換算・UI制御値）
export const MS_PER_SEC = 1000;

// 概算手取り率（税・社保 約21%控除の概算・参考値）
export const TAKEHOME_RATE = 0.79;

// 退職年齢（将来シミュレーションの終端。定年）
export const RETIREMENT_AGE = 65;

// 家賃スライダー（UI上限・刻み。手当額そのものではない）
export const RENT_SLIDER_MAX = 200000;
export const RENT_SLIDER_STEP = 1000;

// 交通機関 6か月定期スライダー
export const PASS_SLIDER_MAX = 300000;
export const PASS_SLIDER_STEP = 1000;

// 交通機関手当の月額上限（給与条例第15条の4第2項第1号「1箇月当たり55,000円を上限」の実数。
// facts では tsukinTransit の文中に埋め込まれているため、UI計算用にここへ数値化して保持）
export const TRANSIT_MONTHLY_CAP = 55000;

// 等級・号給 逆引きの探索しきい値（UIヒューリスティック）
export const FINDER_MIN_SALARY = 130000;
export const FINDER_DIFF_TOLERANCE = 1200;

// 会計年度 報酬シミュレーターの勤務時間スライダー（UI下限・刻み。上限は38.75h＝フルタイム）
export const KAIKEI_HOURS_MIN = 15;
export const KAIKEI_HOURS_STEP = 0.25;
