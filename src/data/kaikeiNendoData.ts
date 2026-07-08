/**
 * 会計年度任用職員（月給パートタイム）給与データ
 * 元データ: 岸和田市例規集（会計年度任用職員の給与等に関する条例／同施行規則）
 * 内容現在: 令和8年4月1日
 * 単位: 円
 */

import type { LeaveCategory } from './leaveData';

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

/* ==================== 休暇一覧（会計年度任用職員） ==================== */
// 元データ: 会計年度任用職員 休暇一覧（組合手帳別冊 p.18）

export const kaikeiLeaveCategories: LeaveCategory[] = [
  // ─── 日常の休暇 ───
  {
    id: 'daily',
    title: '日常の休暇',
    emoji: '\u{1F334}',
    description: '年次有給休暇・夏期休暇',
    items: [
      {
        name: '年次有給休暇',
        type: '有給',
        days: '1年目 最大13日／継続任用で最大20日',
        conditions:
          '6月以上の任期が定められている職員又は6月以上継続勤務している職員が対象。1年目は任用月に応じて付与。',
        unit: '1日（時間単位取得可）。1日までは午前・午後の半日取得に限り実時間での取得可能。',
        eligibility: '会計年度',
        notes:
          '前年付与日数（時間数）に残時間がある場合は、その年の付与時間数を限度に翌年に繰り越すことができる。時間換算は週5日・1日6時間3分勤務の場合。',
        table: {
          headers: ['任用月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月'],
          rows: [
            ['付与日数', '13日', '12日', '10日', '9日', '8日', '7日', '5日', '4日', '3日', '2日'],
            ['付与時間', '79時間', '73時間', '61時間', '55時間', '49時間', '43時間', '31時間', '25時間', '19時間', '13時間'],
          ],
        },
        subItems: [
          { label: '2年目', value: '14日（85時間）' },
          { label: '3年目', value: '15日（91時間）' },
          { label: '4年目', value: '18日（109時間）' },
          { label: '5年目', value: '20日（121時間）' },
        ],
      },
      {
        name: '夏期休暇',
        type: '有給・特別休暇',
        days: '週勤務日数に応じて1〜4日',
        conditions: '6月から10月の期間内に取得（別表2）。',
        unit: '半日単位',
        eligibility: '会計年度',
        notes: '土曜日も1日と数える。',
        subItems: [
          { label: '週4日以上', value: '4日' },
          { label: '週3日', value: '3日' },
          { label: '週2日', value: '2日' },
          { label: '週1日', value: '1日' },
        ],
      },
    ],
  },

  // ─── 病気・ケガ ───
  {
    id: 'illness',
    title: '病気・ケガ',
    emoji: '\u{1F912}',
    description: '病気休暇・感染症予防・災害時の休暇',
    items: [
      {
        name: '病気休暇',
        type: '有給・無給',
        days: '連続する30日以内',
        conditions: '負傷又は疾病のため療養する必要がある場合。最初の10日は有給取得可能。',
        unit: '連続する30日以内（最初の10日は有給取得可能）',
        eligibility: '会計年度',
        notes:
          '有給となる10日（日・土・休日等を除く）は一の年度につき、同一の疾病に限る。異なる疾病又は異なる症状によるものであっても通算する。',
      },
      {
        name: '感染症予防',
        type: '有給・特別休暇',
        days: '必要と認められる日又は時間',
        conditions: '感染症の予防等のため勤務しないことがやむを得ない場合。',
        eligibility: '会計年度',
      },
      {
        name: '現住居の滅失等（天災・非常災害）',
        type: '有給・特別休暇',
        days: '必要と認められる日又は時間',
        conditions: '天災その他の非常災害により現住居が滅失又は損壊した場合等。',
        eligibility: '会計年度',
      },
    ],
  },

  // ─── 結婚 ───
  {
    id: 'marriage',
    title: '結婚',
    emoji: '\u{1F48D}',
    description: '結婚休暇',
    items: [
      {
        name: '結婚休暇',
        type: '有給・特別休暇',
        days: '連続する5日の範囲内',
        conditions: '職員が結婚する場合。',
        unit: '連続する5日の範囲内 ※週休日を含む',
        eligibility: '会計年度',
      },
    ],
  },

  // ─── 妊娠・出産 ───
  {
    id: 'childbirth',
    title: '妊娠・出産',
    emoji: '\u{1F476}',
    description: '産前産後休暇・出産補助・不妊治療など',
    items: [
      {
        name: '産前休暇',
        type: '有給・特別休暇',
        days: '出産予定日前6週間',
        conditions: '出産の日までの間で申し出た期間（6週間以内に出産する予定である場合）。',
        eligibility: '会計年度',
      },
      {
        name: '産後休暇',
        type: '有給・特別休暇',
        days: '産後8週間',
        conditions: '出産の日の翌日から8週間を経過するまでの期間。',
        eligibility: '会計年度',
      },
      {
        name: '出産補助休暇',
        type: '有給・特別休暇',
        days: '2日',
        conditions: '妻の出産に伴う入退院の付添い等。',
        unit: '1日単位',
        eligibility: '会計年度',
      },
      {
        name: '不妊治療のための休暇',
        type: '有給・特別休暇',
        days: '5日（体外受精・顕微授精は10日）',
        conditions: '不妊治療に係る通院等のため。',
        unit: '時間単位',
        eligibility: '会計年度',
        notes: '体外受精及び顕微授精に係る通院等の場合は10日。',
      },
      {
        name: '妊産婦の通院休暇',
        type: '無給・特別休暇',
        days: '必要と認められる時間',
        conditions: '妊産婦が保健指導又は健康診査を受ける場合。',
        eligibility: '会計年度',
      },
      {
        name: '妊娠中の通勤緩和',
        type: '無給・特別休暇',
        days: '1日につき1時間以内',
        conditions: '妊娠中の職員の通勤時の混雑緩和のため。',
        eligibility: '会計年度',
      },
      {
        name: '妊娠障害休暇',
        type: '無給・特別休暇',
        days: '5日',
        conditions: 'つわり等妊娠に起因する障害のため勤務が困難な場合。産前休暇までの間。',
        unit: '半日単位',
        eligibility: '会計年度',
      },
      {
        name: '生理日の就業困難',
        type: '無給・特別休暇',
        days: '1回について3日以内',
        conditions: '生理日の就業が著しく困難な場合。必要とする期間。',
        eligibility: '会計年度',
      },
    ],
  },

  // ─── 育児 ───
  {
    id: 'childcare',
    title: '育児',
    emoji: '\u{1F37C}',
    description: '育児休業・部分休業・子の看護等休暇など',
    items: [
      {
        name: '子の看護等休暇（小学生以下）',
        type: '有給・特別休暇',
        days: '5日（条件により10日）',
        conditions: '小学生以下の子の看護等のため。',
        unit: '時間単位',
        eligibility: '会計年度',
        notes: '子が2人以上かつ小学校3年生以下の子がある場合は10日。',
      },
      {
        name: '育児時間',
        type: '無給・特別休暇',
        days: '1日2回 各30分',
        conditions: '生後1年に達しない子を育てる場合。',
        eligibility: '会計年度',
      },
      {
        name: '育児休業',
        type: '無給',
        days: '子が1歳に達するまで',
        conditions:
          '一定の場合は最長で2歳まで。子が1歳6月に達する日までの間に任用期間（更新される場合には更新後の任用期間）が満了することが明らかでないこと、かつ、1週間の勤務日が3日以上又は1年間の勤務日が121日以上の職員が対象。',
        eligibility: '会計年度',
      },
      {
        name: '部分休業',
        type: '無給',
        days: '1日のうち2時間以内',
        conditions:
          '子が3歳に達する日まで。1週間の勤務日が3日以上又は1年間の勤務日が121日以上、かつ、1日につき定められた勤務時間が6時間15分以上の職員が対象。',
        unit: '30分単位',
        eligibility: '会計年度',
      },
    ],
  },

  // ─── 介護 ───
  {
    id: 'nursing',
    title: '介護',
    emoji: '\u{1F9D3}',
    description: '介護休暇・介護時間・短期の介護休暇',
    items: [
      {
        name: '短期の介護休暇',
        type: '無給・特別休暇',
        days: '5日（要介護者2人以上は10日）',
        conditions: '要介護者の介護、通院の付添い等のため。',
        unit: '時間単位',
        eligibility: '会計年度',
      },
      {
        name: '介護休暇',
        type: '無給',
        days: '3回まで通算93日以内',
        conditions:
          '介護予定日から起算して93日を経過する日から6か月経過する日までの間に、任用期間（更新される場合には更新後の任用期間）が満了することが明らかでないこと。',
        eligibility: '会計年度',
      },
      {
        name: '介護時間',
        type: '無給',
        days: '連続する3年以内（1日2時間まで）',
        conditions: '要介護者の介護のため。',
        eligibility: '会計年度',
      },
    ],
  },

  // ─── 家族の不幸 ───
  {
    id: 'bereavement',
    title: '家族の不幸',
    emoji: '\u{1F56F}',
    description: '忌引休暇',
    items: [
      {
        name: '忌引休暇',
        type: '有給・特別休暇',
        days: '続柄により1〜5日（別表1）',
        conditions:
          '親族が死亡したとき。死亡日から告別式の間を起点として連続して取得するもので、公休日をはさむ場合はその日も1日と数える。土曜日も1日と数える。',
        unit: '1日単位',
        eligibility: '会計年度',
        notes: '続柄区分の詳細は別表1（原本）を確認してください。',
        familyChart: [
          { relation: '配偶者', days: 5 },
          { relation: '父母', days: 5 },
          { relation: '子', days: 5 },
          { relation: '祖父母・孫・兄弟姉妹', days: 3 },
          { relation: '配偶者の父母', days: 2 },
          { relation: '伯叔父母', days: 1 },
        ],
      },
    ],
  },

  // ─── その他 ───
  {
    id: 'other',
    title: 'その他',
    emoji: '\u{1F4CB}',
    description: '公民権行使・官公署出頭・骨髄等ドナー',
    items: [
      {
        name: '公民権行使',
        type: '有給・特別休暇',
        days: '必要と認められる日又は時間',
        conditions: '選挙権その他公民としての権利を行使する場合。',
        eligibility: '会計年度',
      },
      {
        name: '官公署出頭',
        type: '有給・特別休暇',
        days: '必要と認められる日又は時間',
        conditions: '裁判員、証人等として官公署へ出頭する場合。',
        eligibility: '会計年度',
      },
      {
        name: '骨髄等ドナー',
        type: '有給・特別休暇',
        days: '必要と認められる日又は時間',
        conditions: '骨髄又は末梢血幹細胞の提供のため。',
        eligibility: '会計年度',
      },
    ],
  },
];
