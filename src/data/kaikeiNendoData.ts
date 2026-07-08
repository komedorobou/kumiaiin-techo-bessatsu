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

/* ==================== 労働条件一覧表（その3） ==================== */

export const kaikeiEmploymentRows: { label: string; values: [string, string, string] }[] = [
  {
    label: '身分',
    values: ['パートタイム会計年度任用職員', 'パートタイム会計年度任用職員', 'パートタイム会計年度任用職員'],
  },
  {
    label: '任用期間',
    values: [
      '毎年4月1日より翌年3月31日まで。人事評価等による能力実証を行ったうえで再度の任用あり（4回、最長5年）。5年経過後、再度受験可。',
      '毎年4月1日より翌年3月31日まで。人事評価等による能力実証を行ったうえで再度の任用あり（4回、最長5年）。5年経過後、再度受験可。',
      '毎年4月1日より翌年3月31日まで。人事評価等による能力実証を行ったうえで再度の任用あり（4回、最長5年）。5年経過後、再度受験可。',
    ],
  },
  { label: '当局研修', values: ['年1回', '年1回', '―'] },
  {
    label: '担当課',
    values: ['子ども家庭応援部 子育て施設課', '子ども家庭応援部 子育て支援課', '子ども家庭応援部 子育て施設課'],
  },
];

export const kaikeiEmploymentColumns = ['長時間担当保育分会', '学童保育指導員分会', '児童指導員分会'];

export const kaikeiEmploymentNote = '※2008年4月より、学童保育事業は条例化されました。';

export const kaikeiInsuranceRows: { label: string; value: string }[] = [
  { label: '健康診断', value: '有り' },
  { label: '健康保険', value: '大阪府市町村職員共済組合加入' },
  { label: '雇用保険', value: '加入' },
  { label: '厚生年金', value: '加入' },
  { label: '労災補償保険', value: '加入' },
  { label: '厚生会', value: '加入' },
];

/* ==================== 通勤手当支給一覧 ==================== */

export const kaikeiCommuteVehicleRows: { range: string; car: string; bike: string; bicycle: string }[] = [
  { range: '2km以上4km未満', car: '6,200円', bike: '3,600円', bicycle: '3,000円' },
  { range: '4km以上6km未満', car: '7,800円', bike: '4,400円', bicycle: '3,500円' },
  { range: '6km以上8km未満', car: '9,400円', bike: '5,200円', bicycle: '4,000円' },
  { range: '8km以上', car: '11,000円', bike: '6,000円', bicycle: '4,500円' },
];

export const kaikeiCommuteNotes = [
  '交通機関利用者は定期券の額（限度額 18,000円）。',
  '長時間担当保育は朝夕2回勤務のため、通勤距離を1/2換算する。',
];

/* ==================== 休暇一覧 ==================== */

// 年次有給休暇（1年目・任用月別）※時間換算は1日6時間3分勤務の場合
export const kaikeiNenkyuFirstYear: { month: string; days: number; hours: string }[] = [
  { month: '4月', days: 13, hours: '79時間' },
  { month: '5月', days: 12, hours: '73時間' },
  { month: '6月', days: 10, hours: '61時間' },
  { month: '7月', days: 9, hours: '55時間' },
  { month: '8月', days: 8, hours: '49時間' },
  { month: '9月', days: 7, hours: '43時間' },
  { month: '10月', days: 5, hours: '31時間' },
  { month: '11月', days: 4, hours: '25時間' },
  { month: '12月', days: 3, hours: '19時間' },
  { month: '1月', days: 2, hours: '13時間' },
];

// 年次有給休暇（2年目以降・継続任用）
export const kaikeiNenkyuContinued: { year: string; days: number; hours: string }[] = [
  { year: '2年目', days: 14, hours: '85時間' },
  { year: '3年目', days: 15, hours: '91時間' },
  { year: '4年目', days: 18, hours: '109時間' },
  { year: '5年目', days: 20, hours: '121時間' },
];

export const kaikeiNenkyuNotes = [
  '取得単位は1日（時間単位取得可）。1日までは午前及び午後の半日取得に限り、実時間での取得可能。',
  '前年付与日数（時間数）に残時間がある場合は、その年の付与時間数を限度に翌年に繰り越すことができる。',
  '時間換算は週5日・1日6時間3分勤務の場合。',
];

export interface KaikeiLeaveItem {
  name: string;
  detail: string;
}

// 特別休暇（有給）
export const kaikeiSpecialPaid: KaikeiLeaveItem[] = [
  { name: '公民権行使', detail: '必要と認められる日又は時間' },
  { name: '官公署出頭', detail: '必要と認められる日又は時間' },
  { name: '骨髄等ドナー', detail: '必要と認められる日又は時間' },
  { name: '結婚休暇', detail: '連続する5日の範囲内 ※週休日を含む' },
  { name: '不妊治療のための休暇', detail: '5日（時間単位）※体外受精及び顕微授精に係る通院等の場合は10日' },
  { name: '産前', detail: '出産の日までの間で申し出た期間（6週間以内に出産する予定である場合）' },
  { name: '産後', detail: '出産の日の翌日から8週間を経過するまでの期間' },
  { name: '子の看護等休暇（小学生以下）', detail: '5日（時間単位）※子が2人以上かつ小学校3年生以下の子がある場合は10日' },
  { name: '出産補助休暇', detail: '2日（1日単位）' },
  { name: '忌引', detail: '別表1（1日単位）' },
  { name: '夏期', detail: '別表2 6月から10月の期間内（半日単位）' },
  { name: '現住居の滅失等（天災・非常災害）', detail: '必要と認められる日又は時間' },
  { name: '感染症予防', detail: '必要と認められる日又は時間' },
];

// 特別休暇（無給）
export const kaikeiSpecialUnpaid: KaikeiLeaveItem[] = [
  { name: '生理日の就業困難', detail: '1回について3日以内で必要とする期間' },
  { name: '妊産婦の通院休暇', detail: '必要と認められる時間' },
  { name: '妊娠中の通勤緩和', detail: '1日につき1時間以内' },
  { name: '妊娠障害休暇', detail: '産前休暇までの間、5日（半日単位）' },
  { name: '育児時間', detail: '1日2回各30分（生後1年に達しない子を育てる場合）' },
  { name: '短期の介護休暇', detail: '5日（時間単位）※要介護者が2人以上いる場合は10日' },
];

// その他（無給）
export const kaikeiOtherLeave: KaikeiLeaveItem[] = [
  { name: '育児休業', detail: '子が一歳に達するまで（一定の場合は、最長で2歳まで）' },
  { name: '部分休業', detail: '子が3歳に達する日まで、1日のうち2時間以内（30分単位）' },
  { name: '病気休暇', detail: '連続する30日以内（最初の10日は有給取得可能）' },
  { name: '介護休暇', detail: '3回まで通算93日以内' },
  { name: '介護時間', detail: '連続する3年以内（1日2時間まで）' },
];

// 別表1 忌引日数
export const kaikeiKibikiRows: { kubun: string; days: string }[] = [
  { kubun: '配偶者、父母、子', days: '5日' },
  { kubun: '祖父母、孫、兄弟姉妹', days: '3日' },
  { kubun: '配偶者の父母', days: '3日' },
  { kubun: '伯叔父母', days: '1日' },
];

export const kaikeiKibikiNote =
  '※死亡日から起算して連続して取得するもので、公休日をはさむ場合はその日も1日と数える。土曜日も1日と数える。（別表1の詳細は原本を確認）';

// 別表2 夏期休暇日数
export const kaikeiKakiRows: { kinmu: string; days: string }[] = [
  { kinmu: '週4日以上', days: '4日' },
  { kinmu: '週3日', days: '3日' },
  { kinmu: '週2日', days: '2日' },
  { kinmu: '週1日', days: '1日' },
];

export const kaikeiLeaveFootnotes = [
  '年次有給休暇は6月以上の任期が定められている職員又は6月以上継続勤務している職員が対象。',
  '育児休業は、子が1歳6月に達する日までの間に、任用期間（更新される場合には、更新後の任用期間）が満了することが明らかでないこと、かつ、1週間の勤務日が3日以上又は1年間の勤務日が121日以上の職員が対象。',
  '部分休業は、1週間の勤務日が3日以上又は1年間の勤務日が121日以上、かつ、1日につき定められた勤務時間が6時間15分以上の職員が対象。',
  '病気休暇のうち有給となる10日（日・土・休日等を除く）は一の年度につき、同一の疾病に限る。',
  '介護休暇は、介護予定日から起算して93日を経過する日から6か月経過する日までの間に、任用期間（更新される場合には、更新後の任用期間）が満了することが明らかでないこと。',
];
