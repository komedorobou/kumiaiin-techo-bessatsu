/**
 * allowanceExtras.ts — 手当ガイドの静的コンテンツ（岸和田市・本番デモ移植）。
 * 特殊勤務手当・退職手当・給与の支払い・昇給の詳細・61歳以後の給与。
 * 数値はデータ層（src/data）に集約（check_hardcode 対象外）。tsx はここから読み出す。
 * 出典: 岸和田市例規集（給与条例・同施行規則／退職手当条例）・組合員手帳別冊。内容現在 令和8年4月1日。
 */

/* ==================== 特殊勤務手当 ==================== */
export const tokushuData: { name: string; amount: string; target: string }[] = [
  { name: '税務手当（賦課・評価調査）', amount: '1日200円', target: '市民税課・固定資産税課' },
  { name: '税務手当（納付指導・徴収）', amount: '1日100円', target: '納税課' },
  { name: '税務手当（滞納処分）', amount: '調書作成1件20円/物件引揚1件30円', target: '納税課（外勤+200円、月上限1万円）' },
  { name: '国民健康保険料徴収手当', amount: '1日100円（滞納処分は別途）', target: '健康保険課（月上限1万円）' },
  { name: '病原菌接触手当', amount: '1日150円', target: '市民病院 検査技師・医師' },
  { name: '防疫作業従事手当', amount: '1日150円', target: '感染症防疫作業従事者' },
  { name: '保護世帯調査手当', amount: '1日200円', target: '生活福祉課' },
  { name: '介護認定・支援費支給調査手当', amount: '1日100円（4件以上200円）', target: '障害者支援課・介護保険課' },
  { name: '放射線作業手当', amount: '1日150円', target: '市民病院 診療放射線技師・医師' },
  { name: '死体火葬手当', amount: '1日375円', target: '葬儀事務所' },
  { name: '市営住宅使用料徴収手当', amount: '外勤1日200円', target: '住宅政策課' },
  { name: '災害応急作業等手当', amount: '1日950円', target: '災害応急対策・避難所開設等' },
  { name: '緊急消防援助隊手当', amount: '1日2,160円', target: '消防本部（署）' },
  { name: '危険作業従事手当', amount: '1回300円（2時間以上500円）', target: '消防本部（署）火災出場等' },
  { name: '救急業務手当', amount: '出場1回100円', target: '消防本部（署）' },
  { name: '救急救命士手当', amount: '1当務1,000円', target: '消防本部（署）救急救命士' },
  { name: '高所作業手当', amount: '1当務300円', target: '消防本部（署）はしご車等' },
  { name: '清掃業務従事手当', amount: '外勤1日350円（繁忙期500円）', target: '廃棄物対策課' },
  { name: '清掃作業従事手当', amount: '1日200円（繁忙期300円）', target: 'じん芥処理場' },
  { name: '下水道使用料・負担金徴収手当', amount: '外勤1日200円', target: '下水道河川総務課' },
  { name: '終末処理場・ポンプ場業務手当', amount: '1日150円', target: '終末処理場・下水道中継ポンプ場' },
  { name: '夜間看護手当', amount: '4h以上5,000円/2-4h4,400円/2h未満3,000円', target: '市民病院 看護師等' },
  { name: '医師手当', amount: '給料月額×職位別割合/日', target: '市民病院 医師' },
  { name: '救急医療業務手当', amount: '患者1人2,000円（入院4,000円）', target: '市民病院 医師' },
  { name: '分娩介助手当', amount: '医師1胎9,000円/助産師1胎5,000円', target: '市民病院 医師・助産師' },
];
export const tokushuSource =
  '出典：職員の特殊勤務手当に関する条例（昭和31年条例第17号）・同規則。内容現在 令和8年4月1日。';

/* ==================== 退職手当 ==================== */
export const taishokuFormula = '退職手当 ＝ 退職日の給料月額 × 支給率 ＋ 調整額';
export const taishokuRates: { years: string; jiko: string; teinen: string }[] = [
  { years: '5年', jiko: '2.51月', teinen: '4.19月' },
  { years: '10年', jiko: '5.02月', teinen: '8.37月' },
  { years: '15年', jiko: '10.38月', teinen: '16.22月' },
  { years: '20年', jiko: '19.67月', teinen: '24.59月' },
  { years: '25年', jiko: '28.04月', teinen: '33.27月' },
  { years: '30年', jiko: '34.74月', teinen: '40.80月' },
  { years: '35年（上限）', jiko: '39.76月', teinen: '47.71月' },
];
export const taishokuRateNote =
  '支給率は勤続年数と退職理由（自己都合か、定年・応募認定退職などか）で決まります。調整率83.7%込みの月数。';
export const taishokuExample =
  '例）定年退職・勤続35年・給料月額40万円の場合: 40万円 × 47.71月 ≒ 約1,908万円 ＋ 調整額';
export const taishokuChoseiIntro =
  '在職中の職責（職務の級など）に応じた区分ごとの月額を、高い方から60月分合計して基本額に加算するものです。';
export const taishokuChoseiPoints: string[] = [
  '区分は月額65,000円〜0円の8区分（職務の級等に応じて市長が定める）',
  '自己都合退職: 勤続9年以下は0円、勤続10〜24年は半額',
  '定年等の退職でも勤続1〜4年は半額',
];
export const taishokuPoints: { text: string; warn?: boolean }[] = [
  { text: '支給率の上限は勤続35年（定年等47.71月分）' },
  { text: '定年前早期退職（応募認定退職等）は、定年までの残年数1年につき給料月額を3%割増して計算' },
  { text: '勤続期間は在職月数で計算。休職・停職等の期間は一部除算あり' },
  { text: '懲戒免職等の場合は全部又は一部が不支給となることがあります', warn: true },
];
export const taishokuSource =
  '出典: 職員の退職手当に関する条例（昭和32年12月20日条例第16号）内容現在 令和8年4月1日。実際の支給額は人事課にご確認ください。';

/* ==================== 給与の支払い ==================== */
export const paymentDay = '21日';
export const paymentDayNote = '土曜・日曜・祝日の場合はその前日又は前々日';
export const paymentDayPoints: string[] = [
  '新たに職員となった日から支給を開始し、退職した日をもって終了',
  '死亡した場合はその月分を全額支給',
];
export const paymentDeductions: { title: string; items: string[] }[] = [
  {
    title: '共済組合掛金',
    items: [
      '長期: 標準報酬月額 × 91.5/1000',
      '年金払い退職給付: 標準報酬月額 × 7.5/1000',
      '短期: 標準報酬月額 × 52.9/1000',
      '福祉: 標準報酬月額 × 1.6/1000',
      '介護: 標準報酬月額 × 8.0/1000',
    ],
  },
  { title: '所得税', items: ['12月給与で年末調整を実施'] },
  { title: '住民税', items: ['毎年6月より変更'] },
  {
    title: 'その他',
    items: [
      '各種償還金（共済・互助・労金等）',
      '各種保険料（生命保険・損害保険等）',
      '厚生会費・厚生会物品購入代金・駐車場料金等',
    ],
  },
];
export const paymentGengakuText =
  '勤務しないときは、特に承認があった場合を除き、勤務1時間あたりの給料月額に勤務しなかった時間数を乗じて得た額を減額します。';
export const paymentGengakuFormula = '勤務1時間あたり ＝ （給料 ＋ 給料 × 0.11）× 12 ÷ 1,860時間';

/* ==================== 昇給の詳細 ==================== */
export const shokyuBasics: { label: string; value: string }[] = [
  { label: '昇給日', value: '毎年1月1日' },
  { label: '通常昇給', value: '4号給' },
  { label: '部長級', value: '1号給' },
];
export const shokyuBasicNote = '昇給対象期間（1月〜12月）に良好な成績で勤務した時、年1回昇給します。';
export const shokyuNoRaise: string[] = [
  '1月1日時点で育児休業・病気休暇・介護休暇・休職中の場合',
  '満58歳に達した次の年度以降',
  '停職もしくは減給6ヶ月の懲戒処分を受けた場合',
];
export const shokyuAdjust: string[] = [
  '昇給対象期間中に育児休業・病気休暇・介護休暇・休職していた場合',
  '減給3ヶ月・減給1ヶ月・戒告の懲戒処分を受けた場合',
  '管理監督責任以外による訓告を受けた場合',
];
export const shokyuLongLeaveIntro = '復職時に昇給期間を満たしている者は、復職の翌月初日に昇給します。';
export const shokyuLongLeave: string[] = [
  '育児休業・介護休暇: 期間の1/2を勤務期間とみなす（育休は最大マイナス5号調整）',
  '休職: 期間の1/3を勤務期間とみなす',
  '病気休暇（引き続き休職）: 日数の1/3を勤務期間とみる',
  '結核（病気休暇・休職）: 日数の1/2を勤務期間とみる',
];
export const shokyuLongLeaveNote =
  '病気休暇・介護休暇は期間換算後60日以内、育児休業は90日以内であれば昇給調整なし';

/* ==================== 61歳以後の給与 ==================== */
export const over61Intro =
  '令和5年4月1日より定年延長制度の施行に伴い、職員（医師を除く）の定年が段階的に65歳まで引き上げられます。60歳に達した翌年度から働き方が変わり、管理監督職（主幹級以上）は原則61歳になる年度以後、担当長級へ降任となります。';
export const over61SevenTenths: string[] = [
  '給料', '地域手当', '時間外勤務手当', '休日給', '夜間勤務手当', '期末手当', '勤勉手当', '給料の調整額', '管理職手当', '初任給調整手当', '管理職員特別勤務手当',
];
export const over61FullAmount: string[] = [
  '扶養手当', '住居手当', '通勤手当', '単身赴任手当', '特殊勤務手当', '宿日直手当',
];
export const gikyuChoseiIntro =
  '市立岸和田市民病院に勤務する看護職員等（看護師・准看護師・保健師・助産師）に支給';
export const gikyuChoseiRows: { label: string; value: string }[] = [
  { label: '職員', value: '9,000円' },
  { label: '職員（当該年度61歳以上）', value: '6,300円' },
  { label: '再任用職員', value: '6,300円' },
  { label: '再任用短時間（週31時間）', value: '5,040円' },
];
