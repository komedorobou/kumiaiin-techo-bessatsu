/**
 * kigyodanLeaveData.ts — 大阪広域水道企業団の休暇カテゴリ（休暇ガイドの企業団版）。
 * 岸和田市の leaveData とは独立。日数・区分は kigyodan_facts.json（就業規則）から取得。
 * src/data 配下（check_hardcode 対象外）。岸和田タブ構成（daily/illness/marriage/childbirth/childcare/nursing/bereavement/other）を踏襲。
 */
import type { LeaveCategory, LeaveItem, FamilyChartEntry } from './leaveData';
import facts from './kigyodan_facts.json';

interface SpecialLeave { no: number; name: string; days: string }
const special = (facts.leave as any).specialLeave as SpecialLeave[];
const byNo = (no: number): SpecialLeave => special.find((s) => s.no === no) ?? { no, name: '', days: '' };

const F = facts.facts as any;
const annualLeaveDays: number = F.annualLeaveDays.value;
const annualLeaveCarryover: number = F.annualLeaveCarryover.value;
const kaigo: string = F.kaigoLeave.value;
const sick: string = (facts.leave as any).sickLeave.value;

// 忌引（別表第4の3区分）
const mourning = (facts.leave as any).mourning as { relation: string; days: number }[];
const familyChart: FamilyChartEntry[] = mourning.map((m) => ({ relation: m.relation, days: m.days }));

// 特別休暇を号→LeaveItem に変換するヘルパ
function sp(no: number, extra?: Partial<LeaveItem>): LeaveItem {
  const s = byNo(no);
  return {
    name: s.name,
    type: '有給・特別休暇',
    days: s.days,
    conditions: `就業規則 第25条第1項第${no}号にもとづく特別休暇です。`,
    ...extra,
  };
}

export const kigyodanLeaveCategories: LeaveCategory[] = [
  {
    id: 'daily',
    title: '日常の休暇',
    emoji: '\u{1F334}',
    description: '年次有給休暇・夏期休暇・勤続休暇など',
    items: [
      {
        name: '年次休暇',
        type: '有給',
        days: `年間${annualLeaveDays}日`,
        conditions: '全職員に付与（年度＝4月1日から翌年3月31日を単位）。',
        unit: '1日 または 1時間単位',
        notes: `未取得分は${annualLeaveCarryover}日を限度に翌年度へ繰り越せます。年度途中採用者は採用月に応じた日数（4月採用20日〜3月採用1日）が付与されます。`,
        table: {
          headers: ['採用月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'],
          rows: [['付与日数', '20日', '18日', '16日', '15日', '13日', '11日', '10日', '8日', '6日', '5日', '3日', '1日']],
        },
      },
      sp(22, { type: '有給・特別休暇', name: '夏期休暇' }),
      sp(24, { type: '有給・特別休暇', name: '勤続休暇', notes: '勤続10年・20年・30年に達した職員が対象です。' }),
    ],
  },
  {
    id: 'illness',
    title: '病気・ケガ',
    emoji: '\u{1F912}',
    description: '病気休暇・介護休暇・介護時間',
    items: [
      { name: '病気休暇', type: '有給', days: sick, conditions: '負傷または疾病により療養が必要な場合。', notes: '固定の上限日数の規定はありません（就業規則 第24条第2項）。' },
      { name: '介護休暇', type: '無給', days: kaigo, conditions: '配偶者・父母・子等の介護が必要な場合。', notes: '被介護人が介護を必要とする1の継続する状態ごとに取得できます（就業規則 第26条）。' },
      { name: '介護時間', type: '無給', days: '勤務時間の一部', conditions: '介護のため1日の勤務時間の一部について勤務しない場合。', notes: '就業規則が定める介護時間の制度です。' },
    ],
  },
  {
    id: 'marriage',
    title: '結婚',
    emoji: '\u{1F48D}',
    description: '結婚休暇',
    items: [sp(9, { name: '結婚休暇' })],
  },
  {
    id: 'childbirth',
    title: '出産・妊娠',
    emoji: '\u{1F476}',
    description: '産前産後・妊娠障害・妻の出産補助など',
    items: [
      sp(13, { name: '出産（産前産後）' }),
      sp(14, { name: '妊娠障害' }),
      sp(15, { name: '妊産婦の保健指導・健康診査' }),
      sp(16, { name: '妊娠中の通勤緩和' }),
      sp(19, { name: '流早死産等の特例' }),
      sp(11, { name: '妻の出産補助' }),
      sp(12, { name: '出産に係る子等の養育（男性育児参加）' }),
    ],
  },
  {
    id: 'childcare',
    title: '育児',
    emoji: '\u{1F9F8}',
    description: '育児時間・子の看護',
    items: [
      sp(17, { name: '育児時間' }),
      sp(20, { name: '子の看護等' }),
    ],
  },
  {
    id: 'nursing',
    title: '家族の介護',
    emoji: '\u{1F91D}',
    description: '短期介護休暇',
    items: [sp(21, { name: '短期介護' })],
  },
  {
    id: 'bereavement',
    title: '忌引・慶弔',
    emoji: '\u{1F338}',
    description: '親族の喪に服する場合の休暇（続柄別の付与日数）',
    items: [
      {
        name: '忌引',
        type: '有給・特別休暇',
        days: '続柄により1〜7日',
        conditions: '親族の喪に服する場合。別表第4の続柄区分に応じて付与されます（就業規則 第25条第1項第8号）。',
        familyChart,
      },
    ],
  },
  {
    id: 'other',
    title: 'その他',
    emoji: '\u{1F4C4}',
    description: '公民権の行使・骨髄提供・不妊治療・災害時など',
    items: [
      sp(1, { name: '感染症による交通制限・遮断' }),
      sp(2, { name: '天災・交通機関事故等で勤務不能' }),
      sp(3, { name: '天災による現住居の滅失・破壊等の復旧' }),
      sp(4, { name: '裁判員・証人・鑑定人等の出頭' }),
      sp(5, { name: '選挙権その他公民権の行使' }),
      sp(6, { name: '非常災害時の退勤途上の危険回避' }),
      sp(7, { name: '骨髄・末梢血幹細胞の提供' }),
      sp(10, { name: '不妊治療の通院等' }),
      sp(18, { name: '生理' }),
      sp(23, { name: '障がい者の補助犬貸与・補装具給付等' }),
      sp(25, { name: 'その他企業長が必要と認める休暇' }),
    ],
  },
];
