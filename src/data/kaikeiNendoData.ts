/**
 * 会計年度任用職員（月給パートタイム）給与データ
 * 元データ: 岸和田市例規集（会計年度任用職員の給与等に関する条例／同施行規則）
 * 内容現在: 令和8年4月1日
 * 単位: 円
 */

export interface KaikeiNendoRow {
  year: number; // 年目
  gokyu: number; // 号給
  tableSalary: number; // 給料表1（38.75h）の給料月額
  monthly: number; // 月額報酬
}

export interface KaikeiNendoJob {
  id: string;
  name: string;
  subtitle: string;
  rows: KaikeiNendoRow[];
  notes: string[];
}

export const kaikeiNendoJobs: KaikeiNendoJob[] = [
  {
    id: 'jidoshido',
    name: '児童指導員',
    subtitle:
      '保育所・認定こども園／月給パートタイム・保育士資格必須・週約30.25時間・地域手当11%込み',
    rows: [
      { year: 1, gokyu: 46, tableSalary: 259300, monthly: 224688 },
      { year: 2, gokyu: 48, tableSalary: 261700, monthly: 226768 },
      { year: 3, gokyu: 50, tableSalary: 263900, monthly: 228674 },
      { year: 4, gokyu: 52, tableSalary: 266100, monthly: 230580 },
      { year: 5, gokyu: 54, tableSalary: 268000, monthly: 232227 },
      { year: 6, gokyu: 56, tableSalary: 270000, monthly: 233960 },
      { year: 7, gokyu: 58, tableSalary: 271900, monthly: 235606 },
      { year: 8, gokyu: 60, tableSalary: 273600, monthly: 237079 },
      { year: 9, gokyu: 62, tableSalary: 275200, monthly: 238466 },
      { year: 10, gokyu: 64, tableSalary: 276700, monthly: 239765 },
    ],
    notes: [
      '1年目（初任46号給）＝224,688円は岸和田市「児童指導員（月給）任用条件」（更新2026年5月20日）の公表実額。',
      '月額報酬パートタイム（給料表1）。初任給は別表第2の46号給（施行規則第3条第2号）。',
      '昇給は経験1年ごとに+2号給、上限9年（10年目で+18号の64号給）。施行規則の経験年数加算による。',
      '2年目以降＝1年目実額 ×（各号給の給料月額 ÷ 46号給259,300円）で算定。',
    ],
  },
  {
    id: 'choujikan',
    name: '長時間担当職員',
    subtitle:
      '保育補助・有資格／月給パートタイム・保育士資格必須・週26時間・地域手当11%込み',
    rows: [
      { year: 1, gokyu: 40, tableSalary: 251700, monthly: 187460 },
      { year: 2, gokyu: 42, tableSalary: 254300, monthly: 189396 },
      { year: 3, gokyu: 44, tableSalary: 256900, monthly: 191333 },
      { year: 4, gokyu: 46, tableSalary: 259300, monthly: 193120 },
      { year: 5, gokyu: 48, tableSalary: 261700, monthly: 194908 },
      { year: 6, gokyu: 50, tableSalary: 263900, monthly: 196546 },
      { year: 7, gokyu: 52, tableSalary: 266100, monthly: 198185 },
      { year: 8, gokyu: 54, tableSalary: 268000, monthly: 199600 },
      { year: 9, gokyu: 56, tableSalary: 270000, monthly: 201089 },
      { year: 10, gokyu: 58, tableSalary: 271900, monthly: 202504 },
    ],
    notes: [
      '1年目（初任40号給）＝187,460円は岸和田市「長時間担当職員（月給）任用条件」（更新2026年5月20日）の公表実額。',
      '勤務時間は月〜金 1日計4時間＋土6時間＝週26時間。報酬＝給料月額×1.11×26÷38.75。',
      '昇給は経験1年ごとに+2号給、上限9年（10年目で+18号の58号給）。施行規則の経験年数加算による。',
      '2年目以降＝1年目実額 ×（各号給の給料月額 ÷ 40号給251,700円）で算定。',
    ],
  },
  {
    id: 'houkago',
    name: '放課後児童支援員',
    subtitle: '学童／週30時間勤務・地域手当11%込み',
    rows: [
      { year: 1, gokyu: 33, tableSalary: 242000, monthly: 207964 },
      { year: 2, gokyu: 35, tableSalary: 244700, monthly: 210284 },
      { year: 3, gokyu: 37, tableSalary: 247500, monthly: 212690 },
      { year: 4, gokyu: 39, tableSalary: 250300, monthly: 215097 },
      { year: 5, gokyu: 41, tableSalary: 253100, monthly: 217503 },
      { year: 6, gokyu: 43, tableSalary: 255600, monthly: 219651 },
      { year: 7, gokyu: 45, tableSalary: 258100, monthly: 221799 },
      { year: 8, gokyu: 47, tableSalary: 260500, monthly: 223862 },
      { year: 9, gokyu: 49, tableSalary: 262800, monthly: 225838 },
      { year: 10, gokyu: 51, tableSalary: 265000, monthly: 227729 },
    ],
    notes: [
      '給料表は会計年度任用職員給料表1（別表第1）。初任は33号給、1年ごとに2号給昇給。',
      '報酬額＝給料月額 × 1.11（地域手当11%）× 30 ÷ 38.75 を四捨五入（会計年度任用職員の給与等に関する条例 第13条）。',
      '38.75時間＝フルタイム基準（週38時間45分）。30時間＝放課後児童支援員の規定労働時間。',
    ],
  },
];

export const kaikeiNendoSource =
  '出典：岸和田市例規集（会計年度任用職員の給与等に関する条例／同施行規則）内容現在 令和8年4月1日、および各職種（月給）任用条件。';
