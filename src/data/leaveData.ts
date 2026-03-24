/**
 * 休暇データ
 * 元データ: 岸和田市職員労働組合 組合員手帳別冊 労働条件の章
 */

export interface LeaveItem {
  name: string;
  type: string; // 有給・無給等
  days: string;
  conditions: string;
  unit?: string;
  notes?: string;
}

export interface LeaveCategory {
  id: string;
  title: string;
  emoji: string;
  description: string;
  items: LeaveItem[];
}

export const leaveCategories: LeaveCategory[] = [
  {
    id: 'marriage',
    title: '結婚するとき',
    emoji: '\u{1F492}',
    description: '本人または親族の結婚に関する休暇',
    items: [
      {
        name: '結婚休暇（本人）',
        type: '有給・特別休暇',
        days: '7日',
        conditions: '結婚式の1週間前から1週間後まで連続取得',
        unit: '1日単位',
        notes: '週休日と休日は含まない（交替制勤務者は含む）',
      },
      {
        name: '結婚休暇（親族）',
        type: '有給・特別休暇',
        days: '1日',
        conditions: '1親等以内の親族が結婚する場合',
        unit: '1日単位',
        notes: '結婚式の当日のみ',
      },
    ],
  },
  {
    id: 'childbirth',
    title: '子供が生まれるとき',
    emoji: '\u{1F476}',
    description: '出産・育児に関する各種休暇制度',
    items: [
      {
        name: '産前休暇',
        type: '有給・特別休暇',
        days: '出産予定日以前8週間',
        conditions: '出産予定の女性職員',
        notes: '多胎の場合は14週間。予定日より遅れた日数は産前休暇扱い',
      },
      {
        name: '産後休暇',
        type: '有給・特別休暇',
        days: '出産翌日から8週間',
        conditions: '出産した女性職員',
        notes: '予定日より早い場合はその日数を8週間に加算',
      },
      {
        name: '出産補助休暇',
        type: '有給・特別休暇',
        days: '3日',
        conditions: '妻が出産のため入院する日から出産後1月以内',
        unit: '1日単位',
      },
      {
        name: '妊娠障害休暇',
        type: '有給・特別休暇',
        days: '14日以内',
        conditions: '妊娠中毒症、切迫流産、妊娠悪阻等',
        unit: '半日単位',
        notes: '診断書が必要（コピー可）',
      },
      {
        name: '通院休暇',
        type: '有給・特別休暇',
        days: '妊娠期間により異なる',
        conditions: '妊娠中〜産後1年',
        notes: '〜妊娠6月末: 4週に1回／〜9月末: 2週に1回／10月〜出産: 1週に1回',
      },
      {
        name: '通勤の混雑緩和',
        type: '有給・特別休暇',
        days: '1日1時間以内',
        conditions: '母子手帳交付後〜産前休暇まで',
        notes: '通勤混雑が母体に影響する場合',
      },
      {
        name: '育児時間',
        type: '有給・特別休暇',
        days: '1日2回各30分',
        conditions: '出産後1年以内',
        notes: '男性も対象（配偶者が育児できる場合は不可）',
      },
      {
        name: '育児休業',
        type: '無給',
        days: '子が3歳に達するまで',
        conditions: '養育する子がいる職員',
        notes: '共済組合より育児休業手当金が支給される',
      },
    ],
  },
  {
    id: 'illness',
    title: '病気になったとき',
    emoji: '\u{1F3E5}',
    description: '本人や家族の病気・ケガに関する休暇',
    items: [
      {
        name: '病気休暇',
        type: '有給・欠勤扱い',
        days: '一般疾病90日',
        conditions: '診断書が必要',
        notes: '最初の7日まで: 1日または1時間単位。週休日含まず。7日取得後: 1日単位、週休日含む',
      },
      {
        name: '子の看護休暇',
        type: '有給・特別休暇',
        days: '子1人: 5日/年、2人以上: 10日/年',
        conditions: '小学生以下の子が病気等のとき',
        unit: '半日単位',
        notes: '予防接種・健康診断も対象。就学前含む場合は10日（小学生分は5日まで）',
      },
    ],
  },
  {
    id: 'bereavement',
    title: '家族が亡くなったとき',
    emoji: '\u{1F56F}',
    description: '忌引・法事に関する休暇',
    items: [
      {
        name: '忌引休暇（配偶者）',
        type: '有給・特別休暇',
        days: '10日',
        conditions: '配偶者が死亡したとき',
        unit: '1日単位',
        notes: '週休日と休日も含む',
      },
      {
        name: '忌引休暇（父母）',
        type: '有給・特別休暇',
        days: '7日',
        conditions: '父母（養父母含む）が死亡したとき',
        notes: '遠隔地の場合は2日加算',
      },
      {
        name: '忌引休暇（子）',
        type: '有給・特別休暇',
        days: '5日',
        conditions: '子が死亡したとき',
        notes: '死産（12週以降）の場合も対象。男性のみ（女性は産後休暇）',
      },
      {
        name: '忌引休暇（祖父母）',
        type: '有給・特別休暇',
        days: '3日',
        conditions: '祖父母が死亡したとき',
        notes: '同居の場合は血族に準ずる（7日）',
      },
      {
        name: '忌引休暇（兄弟姉妹）',
        type: '有給・特別休暇',
        days: '3日',
        conditions: '兄弟姉妹が死亡したとき',
      },
      {
        name: '忌引休暇（孫）',
        type: '有給・特別休暇',
        days: '1日',
        conditions: '孫が死亡したとき',
      },
      {
        name: '忌引休暇（配偶者の父母）',
        type: '有給・特別休暇',
        days: '3日',
        conditions: '配偶者の父母が死亡したとき',
        notes: '同居の場合は7日',
      },
      {
        name: '忌引休暇（伯叔父母）',
        type: '有給・特別休暇',
        days: '1日',
        conditions: '伯父・叔父・伯母・叔母が死亡したとき',
        notes: '本人と血縁者であること（配偶者は対象外）',
      },
      {
        name: '法事休暇',
        type: '有給・特別休暇',
        days: '1日',
        conditions: '子・配偶者・父母の法事（祭日）',
        unit: '1日単位',
      },
    ],
  },
  {
    id: 'nursing',
    title: '介護が必要なとき',
    emoji: '\u{1F9D1}\u200D\u{1F9BD}',
    description: '家族の介護に関する休暇制度',
    items: [
      {
        name: '介護休暇',
        type: '無給',
        days: '通算1年以内',
        conditions: '要介護状態の家族（配偶者・父母・子・祖父母等）を介護',
        unit: '1日または半日単位',
        notes: '同一理由につき3回以内。14日前までに申請。診断書必要',
      },
      {
        name: '介護時間',
        type: '無給',
        days: '1日2時間以内（連続3年以内）',
        conditions: '要介護状態の家族を介護',
        unit: '1時間単位',
      },
      {
        name: '短期の介護休暇',
        type: '有給',
        days: '要介護者1人: 5日、2人以上: 10日',
        conditions: '要介護状態の家族を介護',
        unit: '半日または1日単位',
        notes: '前日までに申請。診断書必要',
      },
    ],
  },
  {
    id: 'annual',
    title: '年次休暇・リフレッシュ',
    emoji: '\u{1F334}',
    description: '年次有給休暇やリフレッシュに関する制度',
    items: [
      {
        name: '年次有給休暇',
        type: '有給',
        days: '年間20日（160時間）',
        conditions: '全職員',
        unit: '1日または1時間単位',
        notes: '未取得分は翌年に繰越可（20日限度）。中途採用者は月により異なる',
      },
      {
        name: '夏季休暇',
        type: '有給・特別休暇',
        days: '5日',
        conditions: '7月〜9月の間。通常勤務を継続している職員',
        unit: '半日単位',
        notes: '欠勤や休職中は取得不可',
      },
      {
        name: 'リフレッシュ休暇',
        type: '有給・特別休暇',
        days: '勤続10年・20年: 各3日、30年: 5日',
        conditions: '該当する勤続年数に達した職員',
        notes: '3カ月前までに申請。連続取得',
      },
    ],
  },
  {
    id: 'other',
    title: 'その他の休暇',
    emoji: '\u{1F4CB}',
    description: 'ドナー休暇や災害時の休暇など',
    items: [
      {
        name: '生理休暇',
        type: '有給・特別休暇',
        days: '1回につき連続2日以内',
        conditions: '生理日の就業が困難な女性職員',
        unit: '1日単位',
      },
      {
        name: 'ドナー休暇',
        type: '有給・特別休暇',
        days: '必要と認められる日数',
        conditions: 'ドナー登録または骨髄移植のため',
        notes: '配偶者・父母・子・兄弟姉妹への提供は除く',
      },
      {
        name: '選挙権の行使',
        type: '有給・特別休暇',
        days: '必要な日または時間',
        conditions: '選挙権行使・裁判所出頭',
      },
      {
        name: '天災等による交通延着',
        type: '有給・特別休暇',
        days: '延着した時間',
        conditions: '天災・事故による交通機関の延着',
        notes: '延着証明が必要',
      },
      {
        name: '組合休暇',
        type: '無給',
        days: '必要な期間',
        conditions: '組合活動のため',
      },
    ],
  },
];
