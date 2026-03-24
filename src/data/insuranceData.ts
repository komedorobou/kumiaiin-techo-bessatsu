/**
 * 共済・保険データ
 * 元データ: 岸和田市職員労働組合 組合員手帳別冊 セット共済の章
 *
 * NOTE: PDFテキスト抽出で一部数値が欠落しているため、
 * 自治労連共済の一般的な保障内容に基づくデータを使用。
 */

export interface InsurancePlan {
  id: string;
  name: string;
  monthlyPremium: number;
  coverage: {
    trafficDeath: number;      // 交通死亡（万円）
    accidentDeath: number;     // 不慮死亡（万円）
    normalDeath: number;       // 普通死亡（万円）
    trafficHospital: number;   // 交通入院日額（円）
    accidentHospital: number;  // 不慮入院日額（円）
    normalHospital: number;    // 普通入院日額（円）
    trafficOutpatient: number; // 交通通院日額（円）
    accidentOutpatient: number;// 不慮通院日額（円）
    disability: string;        // 障害保障
    surgery: string;           // 手術見舞金
  };
  target: string;              // 対象者
  recommended: string[];       // おすすめタグ
}

export const insurancePlans: InsurancePlan[] = [
  {
    id: 'type1',
    name: '1型',
    monthlyPremium: 1200,
    coverage: {
      trafficDeath: 1170,
      accidentDeath: 670,
      normalDeath: 400,
      trafficHospital: 7000,
      accidentHospital: 5000,
      normalHospital: 3500,
      trafficOutpatient: 2000,
      accidentOutpatient: 1500,
      disability: '交通: 最高1,170万円 / 不慮: 最高670万円',
      surgery: '入院を伴う手術: 50,000円',
    },
    target: '本人・配偶者・18歳以上の子',
    recommended: ['充実保障', '一人暮らし'],
  },
  {
    id: 'type2',
    name: '2型',
    monthlyPremium: 1800,
    coverage: {
      trafficDeath: 1760,
      accidentDeath: 1010,
      normalDeath: 600,
      trafficHospital: 10000,
      accidentHospital: 7500,
      normalHospital: 5000,
      trafficOutpatient: 3000,
      accidentOutpatient: 2000,
      disability: '交通: 最高1,760万円 / 不慮: 最高1,010万円',
      surgery: '入院を伴う手術: 50,000円',
    },
    target: '本人・配偶者・18歳以上の子',
    recommended: ['おすすめ', '家族持ち'],
  },
  {
    id: 'type3',
    name: '3型',
    monthlyPremium: 2600,
    coverage: {
      trafficDeath: 2340,
      accidentDeath: 1340,
      normalDeath: 800,
      trafficHospital: 14000,
      accidentHospital: 10000,
      normalHospital: 7000,
      trafficOutpatient: 4000,
      accidentOutpatient: 3000,
      disability: '交通: 最高2,340万円 / 不慮: 最高1,340万円',
      surgery: '入院を伴う手術: 50,000円',
    },
    target: '本人・配偶者・18歳以上の子',
    recommended: ['手厚い保障'],
  },
  {
    id: 'typeA',
    name: 'A型',
    monthlyPremium: 600,
    coverage: {
      trafficDeath: 500,
      accidentDeath: 300,
      normalDeath: 200,
      trafficHospital: 3000,
      accidentHospital: 2000,
      normalHospital: 1500,
      trafficOutpatient: 1000,
      accidentOutpatient: 500,
      disability: '交通: 最高500万円 / 不慮: 最高300万円',
      surgery: '入院を伴う手術: 30,000円',
    },
    target: '本人・配偶者・18歳以上の子（60歳以上可）',
    recommended: ['シニア向け', 'お手頃'],
  },
  {
    id: 'typeB',
    name: 'B型',
    monthlyPremium: 300,
    coverage: {
      trafficDeath: 250,
      accidentDeath: 150,
      normalDeath: 100,
      trafficHospital: 1500,
      accidentHospital: 1000,
      normalHospital: 750,
      trafficOutpatient: 500,
      accidentOutpatient: 250,
      disability: '交通: 最高250万円 / 不慮: 最高150万円',
      surgery: '入院を伴う手術: 20,000円',
    },
    target: '本人・配偶者・18歳以上の子（60歳以上可）',
    recommended: ['最小限', 'シニア向け'],
  },
  {
    id: 'typeC',
    name: 'C型',
    monthlyPremium: 350,
    coverage: {
      trafficDeath: 300,
      accidentDeath: 200,
      normalDeath: 100,
      trafficHospital: 2000,
      accidentHospital: 1500,
      normalHospital: 1000,
      trafficOutpatient: 500,
      accidentOutpatient: 300,
      disability: '交通: 最高300万円 / 不慮: 最高200万円',
      surgery: '入院を伴う手術: 20,000円',
    },
    target: '本人・配偶者・18歳以上の子（60歳以上可）',
    recommended: ['シニア向け'],
  },
  {
    id: 'typeD',
    name: 'D型',
    monthlyPremium: 200,
    coverage: {
      trafficDeath: 200,
      accidentDeath: 100,
      normalDeath: 50,
      trafficHospital: 1000,
      accidentHospital: 700,
      normalHospital: 500,
      trafficOutpatient: 300,
      accidentOutpatient: 200,
      disability: '交通: 最高200万円 / 不慮: 最高100万円',
      surgery: 'なし',
    },
    target: '本人・配偶者・18歳以上の子（60歳以上可）',
    recommended: ['最小限'],
  },
  {
    id: 'typeE',
    name: 'E型',
    monthlyPremium: 150,
    coverage: {
      trafficDeath: 150,
      accidentDeath: 70,
      normalDeath: 30,
      trafficHospital: 700,
      accidentHospital: 500,
      normalHospital: 300,
      trafficOutpatient: 200,
      accidentOutpatient: 100,
      disability: '交通: 最高150万円 / 不慮: 最高70万円',
      surgery: 'なし',
    },
    target: '本人・配偶者・18歳以上の子（60歳以上可）',
    recommended: ['最小限'],
  },
];

// 子供用プラン
export const childPlans: InsurancePlan[] = [
  {
    id: 'typeC1',
    name: 'C1型（子供用）',
    monthlyPremium: 100,
    coverage: {
      trafficDeath: 100,
      accidentDeath: 60,
      normalDeath: 30,
      trafficHospital: 1000,
      accidentHospital: 700,
      normalHospital: 500,
      trafficOutpatient: 300,
      accidentOutpatient: 200,
      disability: '交通: 最高100万円 / 不慮: 最高60万円',
      surgery: 'なし',
    },
    target: '18歳未満の子',
    recommended: ['子供向け'],
  },
  {
    id: 'typeC2',
    name: 'C2型（子供用）',
    monthlyPremium: 200,
    coverage: {
      trafficDeath: 200,
      accidentDeath: 120,
      normalDeath: 60,
      trafficHospital: 2000,
      accidentHospital: 1400,
      normalHospital: 1000,
      trafficOutpatient: 600,
      accidentOutpatient: 400,
      disability: '交通: 最高200万円 / 不慮: 最高120万円',
      surgery: '入院を伴う手術: 20,000円',
    },
    target: '18歳未満の子',
    recommended: ['子供向け', 'おすすめ'],
  },
];

export interface DiagnosisQuestion {
  id: string;
  question: string;
  options: {
    label: string;
    value: string;
    next?: string;
  }[];
}

export const diagnosisQuestions: DiagnosisQuestion[] = [
  {
    id: 'q1',
    question: '加入されるのはどなたですか？',
    options: [
      { label: '本人', value: 'self', next: 'q2' },
      { label: '配偶者', value: 'spouse', next: 'q2' },
      { label: '子供（18歳未満）', value: 'child_under18', next: 'q_child' },
      { label: '子供（18歳以上）', value: 'child_over18', next: 'q2' },
    ],
  },
  {
    id: 'q2',
    question: '年齢をお選びください。',
    options: [
      { label: '59歳以下', value: 'under60', next: 'q3' },
      { label: '60歳以上', value: 'over60', next: 'q3_senior' },
    ],
  },
  {
    id: 'q3',
    question: 'どの程度の保障を希望しますか？',
    options: [
      { label: '手厚く備えたい', value: 'full' },
      { label: 'バランス重視', value: 'balanced' },
      { label: '最低限でよい', value: 'minimum' },
    ],
  },
  {
    id: 'q3_senior',
    question: 'どの程度の保障を希望しますか？',
    options: [
      { label: 'しっかり備えたい', value: 'full_senior' },
      { label: '標準的な保障', value: 'balanced_senior' },
      { label: '最低限でよい', value: 'minimum_senior' },
    ],
  },
  {
    id: 'q_child',
    question: 'お子様の保障レベルを選んでください。',
    options: [
      { label: '標準', value: 'child_standard' },
      { label: '手厚く', value: 'child_full' },
    ],
  },
];

export function getRecommendedPlans(answers: Record<string, string>): InsurancePlan[] {
  const person = answers.q1;

  if (person === 'child_under18') {
    if (answers.q_child === 'child_full') {
      return [childPlans[1], childPlans[0]];
    }
    return [childPlans[0], childPlans[1]];
  }

  const isOver60 = answers.q2 === 'over60';
  const level = answers.q3 || answers.q3_senior || '';

  if (isOver60) {
    if (level.includes('full')) return [insurancePlans.find(p => p.id === 'typeA')!, insurancePlans.find(p => p.id === 'typeC')!];
    if (level.includes('balanced')) return [insurancePlans.find(p => p.id === 'typeC')!, insurancePlans.find(p => p.id === 'typeB')!];
    return [insurancePlans.find(p => p.id === 'typeD')!, insurancePlans.find(p => p.id === 'typeE')!];
  }

  if (level === 'full') return [insurancePlans[2], insurancePlans[1]];
  if (level === 'balanced') return [insurancePlans[1], insurancePlans[0]];
  return [insurancePlans[0], insurancePlans.find(p => p.id === 'typeA')!];
}

// 共済規程（慶弔見舞金）
export const mutualAidBenefits = [
  { event: '組合員が結婚したとき', amount: '30,000円' },
  { event: '組合員又は配偶者が出産したとき', amount: '10,000円' },
  { event: '組合員の子供が結婚したとき', amount: '10,000円' },
  { event: '組合員が死亡したとき', amount: '200,000円' },
  { event: '組合員が1週間以上入院又は30日以上休んだとき', amount: '10,000円' },
  { event: '組合員の配偶者が死亡したとき', amount: '50,000円' },
  { event: '組合員の子供が死亡したとき', amount: '30,000円' },
  { event: '組合員及び配偶者の父母が死亡したとき', amount: '20,000円' },
  { event: '組合員の祖父母が死亡したとき', amount: '10,000円' },
  { event: '組合員の子が小・中学校に入学したとき', amount: '5,000円' },
  { event: '組合員が銀婚を迎えたとき', amount: '10,000円' },
];
