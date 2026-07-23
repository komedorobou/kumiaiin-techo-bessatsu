'use client';

/**
 * AllowancesKigyodan.tsx — 大阪広域水道企業団の手当ガイド（岸和田版のタブ構成を踏襲）。
 * 岸和田市の条例ロジックは使わず、src/lib/kigyodan/* 経由でのみ数値を表示（check_hardcode対象）。
 */
import { useState } from 'react';
import { getFact, factValue, ordinanceName } from '@/lib/kigyodan/facts';
import { chiikiPct, annualBonusMonths, bonusRatesForGrade, specialManagerGrade, seniorRatePct } from '@/lib/kigyodan/salaryCalc';
import { kanriTiers, fuyoUnitAmounts } from '@/lib/kigyodan/slots';
import { calcJukyo, jukyoBounds } from '@/lib/kigyodan/jukyo';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-charcoal/10 bg-white/80 px-5 sm:px-6 py-5 mb-5">
      <h2 className="text-lg font-bold text-charcoal mb-3">{title}</h2>
      {children}
    </section>
  );
}

const cell = 'py-2.5 px-3 text-sm align-top';
const th = 'py-2 px-3 text-left text-xs text-charcoal/60 font-semibold';

type Tab = 'bonus' | 'fuyo' | 'jukyo' | 'chiiki' | 'tsukin' | 'warimashi' | 'kanri' | 'kinmu' | 'tokushu' | 'sonota';

const tabs: { key: Tab; label: string }[] = [
  { key: 'bonus', label: '賞与' },
  { key: 'fuyo', label: '扶養' },
  { key: 'jukyo', label: '住居' },
  { key: 'chiiki', label: '地域' },
  { key: 'tsukin', label: '通勤' },
  { key: 'warimashi', label: '時間外・休日' },
  { key: 'kanri', label: '管理職' },
  { key: 'kinmu', label: '勤務時間' },
  { key: 'tokushu', label: '特殊勤務' },
  { key: 'sonota', label: 'その他' },
];

export default function AllowancesKigyodan() {
  const [tab, setTab] = useState<Tab>('bonus');
  const [rent, setRent] = useState<number | ''>('');
  const jukyo = rent === '' ? 0 : calcJukyo(rent);
  const rNormal = bonusRatesForGrade(1);
  const rHigh = bonusRatesForGrade(specialManagerGrade);
  const bonusBaseDef = getFact<string>('bonusBase');

  const fuyoChild = Number(factValue('fuyoChild') ?? 0);
  const fuyoChildAdd = Number(factValue('fuyoChildAdd15to22') ?? 0);
  const fuyoParents = Number(factValue('fuyoParentsEtc') ?? 0);
  const fuyo8 = fuyoUnitAmounts(8);
  const fuyoSpouse = getFact<string>('fuyoSpouse');
  const fuyoCut = getFact<string>('fuyoHighGradeCut');

  const jukyoFormula = getFact<string>('jukyoFormula');
  const jukyoMax = jukyoBounds.CAP;

  const chiikiBase = getFact<string>('chiikiTeateBase');

  const tsukinTransit = getFact<string>('tsukinTransit');
  const tsukinVehicle = (factValue('tsukinVehicle') ?? []) as { kmFrom: number; kmTo: number | null; yen: number }[];

  const overtime = (factValue('overtimeRates') ?? {}) as Record<string, number>;
  const overtimeHoliday = Number(factValue('overtimeHoliday') ?? 0);
  const overtimeNight = Number(factValue('overtimeNight') ?? 0);

  const kanriRows = (factValue('kanrishokuTeate') ?? []) as { grade: string; tiers: Record<string, number> }[];

  const workWeek = getFact<string>('workWeekHours');
  const dailyHours = getFact<string>('dailyHours');
  const breakTime = getFact<string>('breakTime');

  const tokushu = getFact<string>('tokushuKinmu');

  const tandoku = Number(factValue('tandokuFunin') ?? 0);
  const tandokuNote = getFact('tandokuFunin')?.note;
  const shukuNichoku = Number(factValue('shukuNichoku') ?? 0);
  const shukuNichokuNote = getFact('shukuNichoku')?.note;
  const kanriTokubetsuObj = (factValue('kanriTokubetsuKinmuTeate') ?? {}) as Record<string, number>;
  const kanriTokubetsuNote = getFact('kanriTokubetsuKinmuTeate')?.note;
  // 第1項（週休日等の勤務）の種別＝「N種」キー（midnight/over6h を除く）
  const kanriTokubetsuTiers = Object.entries(kanriTokubetsuObj)
    .filter(([k]) => k.endsWith('種') && !k.startsWith('midnight'))
    .map(([k, v]) => ({ tier: k.replace('weekday_holiday_', ''), yen: v }));
  const kanriTokubetsuMidnight = Number(kanriTokubetsuObj.midnight_1種 ?? 0);
  const kanriTokubetsuOver6h = Number(kanriTokubetsuObj.over6hMultiplier ?? 0);
  const senior7wari = getFact<string>('senior7wari');

  return (
    <>
      <div className="mb-5 rounded-xl bg-accent/5 border border-accent/15 px-4 py-3">
        <p className="text-xs font-semibold text-accent">大阪広域水道企業団モード</p>
        <p className="mt-1 text-xs text-charcoal/65 leading-relaxed">企業団の給与規程・管理職手当規程・就業規則にもとづく各種手当です（岸和田市の条例とは別体系）。</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 min-h-[44px] inline-flex items-center justify-center rounded-full text-sm font-medium transition-all active:scale-95 ${tab === key ? 'bg-accent text-white' : 'bg-white text-charcoal/70 hover:text-accent hover:bg-accent/5'}`}>
            {label}
          </button>
        ))}
      </div>

      

      {tab === 'bonus' && (
        <Card title="期末手当・勤勉手当（ボーナス）">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-charcoal/15">
                <th className={th}>種類</th>
                <th className={`${th} text-right`}>6月期</th>
                <th className={`${th} text-right`}>12月期</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-charcoal/10">
                <td className={cell}>期末手当</td>
                <td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{rNormal.kimatsu}ヶ月分</td>
                <td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{rNormal.kimatsu}ヶ月分</td>
              </tr>
              <tr className="border-b border-charcoal/10">
                <td className={cell}>勤勉手当</td>
                <td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{rNormal.kinben}ヶ月分</td>
                <td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{rNormal.kinben}ヶ月分</td>
              </tr>
              <tr>
                <td className={`${cell} font-bold`}>年間合計</td>
                <td colSpan={2} className={`${cell} text-right font-bold text-base`} style={{ color: '#8A6224' }}>約{annualBonusMonths}ヶ月分</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-charcoal/60">
            「◯ヶ月分」は基礎額（{bonusBaseDef?.value}）に対する倍率。基準日は6月1日・12月1日。勤勉手当は「支給総額の上限率」で、実支給は人事評価（成績率）で変動します。
          </p>
          <div className="mt-4 rounded-xl bg-amber-50/70 border border-amber-200 px-4 py-3">
            <p className="text-xs font-bold text-amber-900 mb-0.5">{specialManagerGrade}級以上（特定管理職員）</p>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              期末手当と勤勉手当の率が入れ替わり、期末{rHigh.kimatsu}ヶ月・勤勉{rHigh.kinben}ヶ月（各期）になります。年間合計は変わりません。
            </p>
          </div>
        </Card>
      )}

      {tab === 'fuyo' && (
        <Card title="扶養手当">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b border-charcoal/10"><td className={cell}>扶養親族たる子</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>1人 {fuyoChild.toLocaleString()}円</td></tr>
              <tr className="border-b border-charcoal/10"><td className={cell}>15〜22歳の子（加算）</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>1人につき +{fuyoChildAdd.toLocaleString()}円</td></tr>
              <tr className="border-b border-charcoal/10"><td className={cell}>父母等</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>1人 {fuyoParents.toLocaleString()}円</td></tr>
              <tr><td className={cell}>父母等（8級の職員）</td><td className={`${cell} text-right font-semibold text-charcoal/80`}>1人 {fuyo8.parents.toLocaleString()}円</td></tr>
            </tbody>
          </table>
          <div className="mt-4 rounded-xl bg-amber-50/70 border border-amber-200 px-4 py-3">
            <p className="text-xs font-bold text-amber-900 mb-0.5">配偶者は扶養手当の対象外</p>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              企業団では扶養手当の対象に配偶者が含まれません。出典：{ordinanceName(fuyoSpouse?.provenance?.ordinance ?? '')}　{fuyoSpouse?.provenance?.article}。
            </p>
          </div>
          {fuyoCut && <p className="mt-3 text-xs text-charcoal/60">級による特例：{fuyoCut.value}（給与に関する規程 第41条）。</p>}
          <p className="mt-2 text-xs text-charcoal/60">加算は、満15歳に達した後の最初の4月1日から満22歳に達する日以後の最初の3月31日までの間にある子が対象です。</p>
        </Card>
      )}

      {tab === 'jukyo' && (
        <Card title="住居手当（シミュレーター）">
          <label className="block text-sm font-semibold text-charcoal/70 mb-2">1か月の家賃</label>
          <div className="flex items-center gap-2">
            <input type="text" inputMode="numeric" value={rent} onChange={(e) => setRent(e.target.value === '' ? '' : Number(e.target.value.replace(/[^0-9]/g, '')))} placeholder="例：60000" className="flex-1 rounded-xl border border-charcoal/15 px-4 py-3 text-base font-bold tracking-wider outline-none" />
            <span className="text-sm text-charcoal/65">円</span>
          </div>
          <div className="mt-4 rounded-xl bg-[#1B4D4F] text-white px-5 py-4">
            <p className="text-xs text-white/70">住居手当 月額</p>
            <p className="text-3xl font-bold mt-0.5">{jukyo.toLocaleString()}<span className="text-base font-semibold ml-1">円</span></p>
            {rent !== '' && jukyo === jukyoMax && <p className="text-xs text-white/70 mt-1">総額上限（{jukyoMax.toLocaleString()}円）に達しています</p>}
          </div>
          <p className="mt-3 text-sm text-charcoal/70">{jukyoFormula?.value}</p>
          <p className="mt-2 text-sm font-semibold text-charcoal/80">総額上限：{jukyoMax.toLocaleString()}円／月</p>
        </Card>
      )}

      {tab === 'chiiki' && (
        <Card title="地域手当">
          <p className="text-sm text-charcoal/80 leading-relaxed">月額 ＝ 基礎額 × <b className="text-[#1B4D4F]">{chiikiPct}%</b>（大阪府の区域に在勤する職員）。</p>
          {chiikiBase && <p className="mt-2 text-sm text-charcoal/70">基礎額 ＝ {chiikiBase.value}</p>}
        </Card>
      )}

      {tab === 'tsukin' && (
        <Card title="通勤手当">
          <p className="mb-3 text-sm text-charcoal/80">交通機関利用：{tsukinTransit?.value}</p>
          <p className="mb-2 text-sm font-semibold text-charcoal/80">自転車等使用者（片道距離別・月額）</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[280px]">
              <thead>
                <tr className="border-b border-charcoal/15">
                  <th className={th}>片道の使用距離</th>
                  <th className={`${th} text-right`}>月額</th>
                </tr>
              </thead>
              <tbody>
                {tsukinVehicle.map((row, i) => (
                  <tr key={i} className="border-b border-charcoal/10 last:border-0">
                    <td className={cell}>{row.kmFrom}km以上{row.kmTo ? `〜${row.kmTo}km未満` : '〜'}</td>
                    <td className={`${cell} text-right font-bold text-[#1B4D4F] whitespace-nowrap`}>{row.yen.toLocaleString()}円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-charcoal/60 leading-relaxed">片道2km未満は自転車等の支給対象外です。交通機関は運賃相当額で、1箇月あたりの支給には上限があります。</p>
        </Card>
      )}

      {tab === 'warimashi' && (
        <Card title="時間外・休日・夜間の勤務手当（割増率）">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-charcoal/15"><th className={th}>勤務の区分</th><th className={`${th} text-right`}>1時間あたりの割増率</th></tr></thead>
            <tbody>
              <tr className="border-b border-charcoal/10"><td className={cell}>時間外（勤務日）</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{overtime.weekday}%</td></tr>
              <tr className="border-b border-charcoal/10"><td className={cell}>時間外（週休日等）</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{overtime.offday}%</td></tr>
              <tr className="border-b border-charcoal/10"><td className={cell}>月60時間を超える時間外（勤務日）</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{overtime.over60hWeekday}%</td></tr>
              <tr className="border-b border-charcoal/10"><td className={cell}>月60時間超の深夜（時間外）</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{overtime.over60hMidnight}%</td></tr>
              <tr className="border-b border-charcoal/10"><td className={cell}>時間外の深夜加算（22時〜翌5時）</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>＋{overtime.midnightAdd}%</td></tr>
              <tr className="border-b border-charcoal/10"><td className={cell}>休日勤務</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{overtimeHoliday}%</td></tr>
              <tr><td className={cell}>夜間勤務（正規の勤務が深夜帯の場合）</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>＋{overtimeNight}%</td></tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-charcoal/60">勤務1時間当たりの給与額を基礎に、上表の割増率を乗じて算定します（給与に関する規程 第47〜49条）。</p>
        </Card>
      )}

      {tab === 'kanri' && (
        <Card title="管理職手当（級×区分の定額表）">
          <p className="mb-3 text-sm text-charcoal/70">管理職手当は定率ではなく、職務の級と職の区分（種）による定額です（管理職手当規程 別表第2）。</p>
          <div className="space-y-4">
            {kanriRows.map((r) => (
              <div key={r.grade}>
                <p className="text-xs font-semibold text-charcoal/60 mb-1">{r.grade}</p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[240px]">
                    <thead><tr className="border-b border-charcoal/15"><th className={th}>区分</th><th className={`${th} text-right`}>月額</th></tr></thead>
                    <tbody>
                      {Object.entries(r.tiers).map(([tier, amount]) => (
                        <tr key={tier} className="border-b border-charcoal/10 last:border-0">
                          <td className={cell}>{tier}</td>
                          <td className={`${cell} text-right font-bold text-[#1B4D4F] whitespace-nowrap`}>{amount.toLocaleString()}円</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-charcoal/60">職の区分（種）は管理職手当規程 別表第1で1種（副企業長）〜8種として指定されます。全{kanriTiers().length}区分。</p>
        </Card>
      )}

      {tab === 'kinmu' && (
        <Card title="勤務時間・休憩">
          <table className="w-full border-collapse">
            <tbody>
              {workWeek && <tr className="border-b border-charcoal/10"><td className={cell}>1週間の勤務時間</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{workWeek.value}</td></tr>}
              {dailyHours && <tr className="border-b border-charcoal/10"><td className={cell}>1日の勤務時間</td><td className={`${cell} text-right font-semibold text-charcoal/80`}>{dailyHours.value}</td></tr>}
              {breakTime && <tr><td className={cell}>休憩</td><td className={`${cell} text-right font-semibold text-charcoal/80`}>{breakTime.value}</td></tr>}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-charcoal/50">出典：{ordinanceName('shugyo')}（第7条・第8条・第10条）。</p>
        </Card>
      )}

      {tab === 'tokushu' && (
        <Card title="特殊勤務手当">
          <p className="mb-3 text-sm text-charcoal/70">著しく危険・不快・不健康又は困難な勤務等に従事する職員に、勤務の特殊性に応じて支給される手当です（水道事業の現業系業務が中心）。</p>
          {tokushu && <p className="text-sm text-charcoal/80 leading-relaxed">{tokushu.value}</p>}
          <p className="mt-3 text-xs text-charcoal/50">出典：{ordinanceName('tokushu')}。</p>
        </Card>
      )}

      {tab === 'sonota' && (
        <>
          <Card title="単身赴任手当">
            <p className="text-sm text-charcoal/80 mb-2">基本額 <b className="text-[#1B4D4F]">{tandoku.toLocaleString()}円</b>／月。</p>
            {tandokuNote && <p className="text-xs text-charcoal/60 leading-relaxed">{tandokuNote}</p>}
          </Card>
          <Card title="宿日直手当">
            <p className="text-sm text-charcoal/80">勤務1回につき <b className="text-[#1B4D4F]">{shukuNichoku.toLocaleString()}円</b>。</p>
            {shukuNichokuNote && <p className="mt-2 text-xs text-charcoal/60">{shukuNichokuNote}</p>}
          </Card>
          <Card title="管理職員特別勤務手当">
            <p className="mb-2 text-sm font-semibold text-charcoal/80">週休日等の勤務（第1項・勤務1回あたり）</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[240px]">
                <thead><tr className="border-b border-charcoal/15"><th className={th}>区分</th><th className={`${th} text-right`}>額</th></tr></thead>
                <tbody>
                  {kanriTokubetsuTiers.map((r) => (
                    <tr key={r.tier} className="border-b border-charcoal/10 last:border-0">
                      <td className={cell}>{r.tier}</td>
                      <td className={`${cell} text-right font-bold text-[#1B4D4F] whitespace-nowrap`}>{r.yen.toLocaleString()}円</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-charcoal/70">深夜の緊急勤務（第2項）は1種 <b className="text-[#1B4D4F]">{kanriTokubetsuMidnight.toLocaleString()}円</b> から始まる区分別の額です。勤務が6時間を超える場合は各額に <b className="text-[#1B4D4F]">{kanriTokubetsuOver6h}%</b> を乗じます。</p>
            {kanriTokubetsuNote && <p className="mt-2 text-xs text-charcoal/55 leading-relaxed border-l-2 border-charcoal/15 pl-2">{kanriTokubetsuNote}</p>}
          </Card>
          <Card title="60歳超の給与（7割措置）">
            <p className="text-sm text-charcoal/70 leading-relaxed">満61歳（60歳に達した日後の最初の4月1日）以後は、給料月額および管理職手当が{seniorRatePct}%（7割）になります。</p>
            {senior7wari && <p className="mt-2 text-xs text-charcoal/55 leading-relaxed border-l-2 border-charcoal/15 pl-2">{senior7wari.value}</p>}
          </Card>
        </>
      )}

      <p className="text-xs text-charcoal/50 mt-4 px-1">
        出典：{ordinanceName('kyuyo_jorei')}・{ordinanceName('kyuyo_kitei')}・{ordinanceName('kanrishoku')}・{ordinanceName('shugyo')}（公開例規集）。
      </p>
    </>
  );
}
