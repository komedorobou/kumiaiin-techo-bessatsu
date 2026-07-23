/**
 * hearingMaster.ts — 導入時ヒアリングの「定番リスト」（両市共通のテンプレ資産）。
 *
 * 目的: 条例・規則には書かれないことが多い制度（例規外運用・組合固有情報）を
 *       あらかじめ列挙しておき、facts.json に既に取れているもの（detect で確認済み）と、
 *       導入時に組合へ確認すべきもの（残差）を機械的に仕分ける。
 *
 * detect の考え方:
 *   - detectKeys : facts.json 内のドット区切りパスが存在すれば「例規で確認済み」
 *   - detectWords: 検索対象JSON文字列にこの語が含まれれば「例規で確認済み」
 *   - scope      : 検索範囲。正職員向け項目は 'leave'（facts.leave のみ）に限定する。
 *       ※ 会計年度任用職員にのみ夏季休暇がある自治体では、正職員の夏季を
 *         facts 全体で探すと会計年度の記述に引っかかり誤って「確認済み」になる。
 *         scope を分けることでこの誤検出を防ぐ。
 *
 * このファイルは src/data 配下＝check_hardcode の走査対象外（数値ベタ書き検査は掛からない）。
 */

export type HearingCategory = 'leave' | 'pay' | 'union' | 'ops';

/** 検出の検索範囲。'leave'=正職員休暇のみ / 'kaikei'=会計年度のみ / 'all'=notFound等を除く全収録データ */
export type HearingScope = 'leave' | 'kaikei' | 'all';

export type HearingItem = {
  key: string;
  label: string;
  category: HearingCategory;
  /** なぜ聞くか（例規外運用が多い等）を1文で */
  why: string;
  /** 検索範囲（既定 'all'）。正職員向け項目は 'leave' に限定して誤検出を防ぐ */
  scope?: HearingScope;
  /** facts.json 内にこのドット区切りキーが存在すれば「例規で確認済み」 */
  detectKeys?: string[];
  /** 検索対象JSON文字列にこの語が含まれれば「例規で確認済み」 */
  detectWords?: string[];
};

export const hearingMaster: HearingItem[] = [
  /* ============ 休暇（正職員）— scope:'leave' で facts.leave のみを検索 ============ */
  {
    key: 'leave.kaki',
    label: '夏季休暇の運用',
    category: 'leave',
    scope: 'leave',
    detectWords: ['夏季'],
    why: '夏季休暇は日数・取得可能期間・分割の可否が内規や労使合意で運用され、例規に載らない場合があります。',
  },
  {
    key: 'leave.refresh',
    label: 'リフレッシュ・アニバーサリー・永年勤続休暇',
    category: 'leave',
    scope: 'leave',
    detectWords: ['リフレッシュ', 'アニバーサリー', '永年勤続'],
    why: '勤続の節目に付与する特別休暇は、名称・付与年・日数が団体ごとに異なります。',
  },
  {
    key: 'leave.volunteer',
    label: 'ボランティア休暇',
    category: 'leave',
    scope: 'leave',
    detectWords: ['ボランティア'],
    why: '災害支援等のボランティア休暇は、対象活動と付与日数の運用に幅があります。',
  },
  {
    key: 'leave.checkup',
    label: '人間ドック・健診休暇',
    category: 'leave',
    scope: 'leave',
    detectWords: ['ドック', '健診休暇'],
    why: '人間ドックや健康診断に伴う休暇は、福利厚生の一環として例規外で運用されることがあります。',
  },
  {
    key: 'leave.kumiai',
    label: '組合休暇の運用実態',
    category: 'leave',
    scope: 'leave',
    detectKeys: ['leave.kumiaiLeave'],
    detectWords: ['組合休暇'],
    why: '組合休暇は上限日数が例規にあっても、実際の付与・承認の運用は組合と確認が要ります。',
  },

  /* ============ 給与・手当 — 実額・運用が例規別表に載りにくい項目（原則ヒアリング） ============ */
  {
    key: 'pay.special',
    label: '特殊勤務手当の実額・対象業務',
    category: 'pay',
    why: '特殊勤務手当は対象業務の列挙はあっても、実額や支給の運用実態が別表に載らないことがあります。',
  },
  {
    key: 'pay.retirement',
    label: '退職手当の制度（組合・共済会含む）',
    category: 'pay',
    why: '退職手当は本体条例に加え、組合・共済会経由の上乗せがあり、実運用は導入時に確認が要ります。',
  },
  {
    key: 'pay.startingSalary',
    label: '初任給決定の運用（前歴換算）',
    category: 'pay',
    why: '初任給・前歴換算は市長が別に定める内規で運用され、具体的な基準表が例規に公開されないことがあります。',
  },
  {
    key: 'pay.cut',
    label: '給料の独自減額・カットの有無',
    category: 'pay',
    why: '独自の給料カット・調整措置は時限条例や労使合意で行われ、現行の例規に残らない場合があります。',
  },
  {
    key: 'pay.allowanceAuth',
    label: '住居・通勤手当の認定運用（契約書・経路認定）',
    category: 'pay',
    why: '住居・通勤手当は金額基準は例規にありますが、契約書確認や経路認定などの実務運用は組合と確認が要ります。',
  },

  /* ============ 組合固有情報 — 例規には存在しない（常時ヒアリング） ============ */
  {
    key: 'union.kyosai',
    label: '共済制度の内容',
    category: 'union',
    why: '共済制度は組合独自の給付設計で、例規には現れません。',
  },
  {
    key: 'union.fee',
    label: '組合費と徴収方法',
    category: 'union',
    why: '組合費の額とチェックオフ等の徴収方法は組合規約側の事項です。',
  },
  {
    key: 'union.rule',
    label: '組合規約',
    category: 'union',
    why: 'ポータル掲載やメンバー管理の前提として組合規約の内容を確認します。',
  },
  {
    key: 'union.condolence',
    label: '慶弔見舞金',
    category: 'union',
    why: '慶弔見舞金の種類・金額は組合または互助会の独自制度です。',
  },
  {
    key: 'union.gojokai',
    label: '互助会・福利厚生会',
    category: 'union',
    why: '互助会・福利厚生会の給付やイベントは例規外の福利厚生です。',
  },
  {
    key: 'union.events',
    label: '組合行事・親睦活動',
    category: 'union',
    why: '行事カレンダーや親睦活動はポータルに載せる組合独自コンテンツになります。',
  },
  {
    key: 'union.orientation',
    label: '新規採用者への組合説明の段取り',
    category: 'union',
    why: '新採への組合説明のタイミングと資料は、ポータル導線設計に関わります。',
  },

  /* ============ ポータル運用 — 掲載方針・見せ方（常時ヒアリング） ============ */
  {
    key: 'ops.content',
    label: 'ポータルに載せたい組合独自コンテンツ（ニュース・行事カレンダー等）',
    category: 'ops',
    why: '例規データ以外に何を載せるか（お知らせ・行事等）で構成が変わります。',
  },
  {
    key: 'ops.branding',
    label: '組合名の正式表記・ロゴ',
    category: 'ops',
    why: '正式名称の表記ゆれとロゴ有無を確定してから見出し・ヘッダーに反映します。',
  },
  {
    key: 'ops.access',
    label: '公開範囲（認証方式）',
    category: 'ops',
    why: '誰に公開するか（職員番号認証・QR等）で公開範囲と導線設計が決まります。',
  },
];
