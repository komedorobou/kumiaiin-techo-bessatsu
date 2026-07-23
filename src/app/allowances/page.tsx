'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { useStaffMode, StaffModeToggle } from '@/components/StaffMode';
import AllowancesKigyodan from '@/components/AllowancesKigyodan';
import { getFact, factValue, ordinanceName, getKaikei, seishokuTables, gradeLabel } from '@/lib/facts';
import { chiikiPct, bonusRates, annualBonusMonths, kanriList } from '@/lib/salaryCalc';
import { calcJukyo } from '@/lib/formulas/jukyo';
import {
  tokushuData, tokushuSource,
  taishokuFormula, taishokuRates, taishokuRateNote, taishokuExample,
  taishokuChoseiIntro, taishokuChoseiPoints, taishokuPoints, taishokuSource,
  paymentDay, paymentDayNote, paymentDayPoints, paymentDeductions, paymentGengakuText, paymentGengakuFormula,
  shokyuBasics, shokyuBasicNote, shokyuNoRaise, shokyuAdjust, shokyuLongLeaveIntro, shokyuLongLeave, shokyuLongLeaveNote,
  over61Intro, over61SevenTenths, over61FullAmount, gikyuChoseiIntro, gikyuChoseiRows,
} from '@/data/allowanceExtras';

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

type AllowTab = 'bonus' | 'fuyo' | 'jukyo' | 'tsukin' | 'chiiki' | 'warimashi' | 'kanri' | 'sonota' | 'tokushu' | 'shokyu' | 'over61' | 'taishoku' | 'payment';

// タブ構成は facts の存在で駆動（対応する事実が無いタブは出さない）
const tabDefs: { key: AllowTab; label: string; present: boolean }[] = [
  { key: 'bonus', label: '賞与', present: !!getFact('bonusKimatsuRate') },
  { key: 'fuyo', label: '扶養', present: !!getFact('fuyoChild') },
  { key: 'jukyo', label: '住居', present: !!getFact('jukyoMax') },
  { key: 'tsukin', label: '通勤', present: !!getFact('tsukinVehicle') },
  { key: 'chiiki', label: '地域', present: !!getFact('chiikiTeatePercent') },
  { key: 'warimashi', label: '時間外・休日', present: !!getFact('overtimeRates') },
  { key: 'kanri', label: '管理職', present: !!getFact('kanrishokuTeate') },
  { key: 'tokushu', label: '特殊勤務', present: true },
  { key: 'shokyu', label: '昇給', present: true },
  { key: 'over61', label: '61歳〜', present: true },
  { key: 'taishoku', label: '退職手当', present: true },
  { key: 'payment', label: '給与の支払', present: true },
  { key: 'sonota', label: 'その他', present: !!getFact('tandokuFunin') || !!getFact('shukuNichoku') },
];
const allowTabs = tabDefs.filter((t) => t.present);

export default function AllowancesPage() {
  const { mode } = useStaffMode();
  const [tab, setTab] = useState<AllowTab>(allowTabs[0].key);
  const [rent, setRent] = useState<number | ''>('');
  const jukyo = rent === '' ? 0 : calcJukyo(rent);

  const fuyoChild = Number(factValue('fuyoChild') ?? 0);
  const fuyoChildAdd = Number(factValue('fuyoChildAdd16to22') ?? 0);
  const fuyoParents = Number(factValue('fuyoParents') ?? 0);
  const fuyoSpouse = getFact<string>('fuyoSpouse');
  const fuyo7kyuNote = getFact<string>('fuyo7kyuNote');
  const jukyoFormula = getFact<string>('jukyoFormula');
  const jukyoMax = Number(factValue('jukyoMax') ?? 0);
  const tsukinTransit = getFact<string>('tsukinTransit');
  const tsukinVehicle = factValue<{ kmFrom: number; kmTo: number | null; car: number; bike: number; bicycle: number }[]>('tsukinVehicle') ?? [];
  const overtime = factValue<any>('overtimeRates') ?? {};
  const hourlyFormula = getFact<string>('hourlyRateFormula');
  const overtimeCap = factValue<any>('overtimeCap') ?? {};
  const overtimeCapChildcare = getFact<string>('overtimeCapChildcare');
  const yakushokuKasanTable = factValue<{ table?: string; grade: number; rate: number }[]>('bonusYakushokuKasan') ?? [];
  const chiikiBase = getFact<string>('chiikiTeateBase');
  const tandokuBase = Number(factValue('tandokuFunin') ?? 0);
  const tandokuNote = getFact('tandokuFunin')?.note;
  const tandokuAdd = factValue<{ kmFrom: number; kmTo: number | null; yen: number }[]>('tandokuFuninDistanceAdd') ?? [];
  const shukuNichoku = getFact<string>('shukuNichoku');
  const kanriTokubetsu = getFact<string>('kanriTokubetsuKinmuTeate');
  const kanriCap = getFact<string>('kanrishokuTeateCap');
  const bonusBaseDef = getFact<string>('bonusBase');
  const yakushokuKasan = getFact<string>('yakushokuKasan');
  const kCommute = getKaikei<any>('commute');

  if (mode === 'kigyodan') {
    return (
      <PageLayout title="手当ガイド" subtitle="職員区分ごとの各種手当">
        <StaffModeToggle />
        <AllowancesKigyodan />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="手当ガイド" subtitle="岸和田市職員給与条例にもとづく各種手当">
      <StaffModeToggle />
      <div className="flex gap-2 mb-6 flex-wrap">
        {allowTabs.map(({ key, label }) => (
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
                <td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{bonusRates.kimatsu.jun}ヶ月分</td>
                <td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{bonusRates.kimatsu.dec}ヶ月分</td>
              </tr>
              <tr className="border-b border-charcoal/10">
                <td className={cell}>勤勉手当</td>
                <td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{bonusRates.kinben.jun}ヶ月分</td>
                <td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{bonusRates.kinben.dec}ヶ月分</td>
              </tr>
              <tr>
                <td className={`${cell} font-bold`}>年間合計</td>
                <td colSpan={2} className={`${cell} text-right font-bold text-base`} style={{ color: '#8A6224' }}>約{annualBonusMonths}ヶ月分</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-charcoal/60">
            「◯ヶ月分」は基礎額に対する倍率。基準日は6月1日・12月1日。期末手当の基礎額は給料＋扶養手当＋これらに対する地域手当、勤勉手当の基礎額は給料＋その地域手当で<b>扶養手当を含みません</b>（給与条例第26条第3項）。勤勉手当は「支給総額の上限率」で、実支給は人事評価（成績率）で変動します。在職期間が基準日前6ヶ月に満たない場合は期間率で減額されます。
          </p>
          {yakushokuKasanTable.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold text-charcoal/70 mb-2">役職加算（期末・勤勉手当の基礎額に加算）</p>
              <div className="space-y-4">
                {seishokuTables.map((t) => {
                  const rows = yakushokuKasanTable.filter((r) => r.table === t.id);
                  if (rows.length === 0) return null;
                  return (
                    <div key={t.id}>
                      <p className="text-xs font-semibold text-charcoal/60 mb-1">{t.name}</p>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[240px]">
                          <thead><tr className="border-b border-charcoal/15"><th className={th}>職務の級</th><th className={`${th} text-right`}>加算割合</th></tr></thead>
                          <tbody>
                            {rows.map((r) => (
                              <tr key={r.grade} className="border-b border-charcoal/10 last:border-0">
                                <td className={cell}>{gradeLabel(t, r.grade)}</td>
                                <td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{r.rate}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-charcoal/60 leading-relaxed">加算基礎＝給料月額＋その地域手当の合計額（扶養手当は含めない）に上表の割合を乗じた額。記載のない級は加算なし。医療職の2級・3級は職名により率が上がる場合があります（2級：診療局長等20%・3級：副部長等15%）。{yakushokuKasan?.value}</p>
            </div>
          )}
        </Card>
      )}

      {tab === 'fuyo' && (
        <Card title="扶養手当">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b border-charcoal/10"><td className={cell}>扶養親族たる子</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>1人 {fuyoChild.toLocaleString()}円</td></tr>
              <tr className="border-b border-charcoal/10"><td className={cell}>16〜22歳の子（加算）</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>1人につき +{fuyoChildAdd.toLocaleString()}円</td></tr>
              <tr><td className={cell}>父母等</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>1人 {fuyoParents.toLocaleString()}円</td></tr>
            </tbody>
          </table>
          <div className="mt-4 rounded-xl bg-amber-50/70 border border-amber-200 px-4 py-3">
            <p className="text-xs font-bold text-amber-900 mb-0.5">配偶者は扶養手当の対象外</p>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              岸和田市では扶養手当の対象に配偶者が含まれません（{fuyoSpouse?.value}）。
              出典：{ordinanceName(fuyoSpouse?.provenance?.ordinance ?? '')}　{fuyoSpouse?.provenance?.article}。
            </p>
          </div>
          <p className="mt-3 text-xs text-charcoal/60">父母等は満60歳以上の父母・祖父母、満22歳以下の孫・弟妹、重度心身障害者が対象です。一部減額職員の場合は父母等の単価が下がります。</p>
          {fuyo7kyuNote && <p className="mt-3 text-xs text-charcoal/60">特例：{fuyo7kyuNote.value}</p>}
          <p className="mt-2 text-xs text-charcoal/60">加算は、満15歳に達した後の最初の4月1日から満22歳に達する日以後の最初の3月31日までの間にある子。</p>
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
          <p className="text-sm text-charcoal/80 leading-relaxed">
            月額 ＝ 基礎額 × <b className="text-[#1B4D4F]">{chiikiPct}%</b>。
          </p>
          {chiikiBase && <p className="mt-2 text-sm text-charcoal/70">基礎額 ＝ {chiikiBase.value}</p>}
        </Card>
      )}

      {tab === 'tsukin' && (
        <Card title="通勤手当">
          <p className="mb-3 text-sm text-charcoal/80">交通機関利用：{tsukinTransit?.value}</p>
          <p className="mb-2 text-sm font-semibold text-charcoal/80">交通用具（自動車・バイク・自転車）使用者（片道距離別・月額／車種で額が異なる）</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[360px]">
              <thead>
                <tr className="border-b border-charcoal/15">
                  <th className={th}>片道の使用距離</th>
                  <th className={`${th} text-right`}>自動車</th>
                  <th className={`${th} text-right`}>バイク</th>
                  <th className={`${th} text-right`}>自転車</th>
                </tr>
              </thead>
              <tbody>
                {tsukinVehicle.map((row, i) => (
                  <tr key={i} className="border-b border-charcoal/10 last:border-0">
                    <td className={cell}>{row.kmFrom}km以上{row.kmTo ? `〜${row.kmTo}km未満` : '〜'}</td>
                    <td className={`${cell} text-right font-bold text-[#1B4D4F] whitespace-nowrap`}>{row.car.toLocaleString()}円</td>
                    <td className={`${cell} text-right font-semibold text-charcoal/80 whitespace-nowrap`}>{row.bike.toLocaleString()}円</td>
                    <td className={`${cell} text-right font-semibold text-charcoal/80 whitespace-nowrap`}>{row.bicycle ? `${row.bicycle.toLocaleString()}円` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-charcoal/60 leading-relaxed">片道2km未満は交通用具の支給対象外です。自転車は12km以上の区分がありません。25km以上は5kmごとに加算があり、支給には上限があります（自動車の基準額に距離加算）。</p>
          {tsukinVehicle.length > 0 && getFact('tsukinVehicle')?.provenance?.ordinance === 'techo' && (
            <p className="mt-2 text-xs text-charcoal/55">出典：{ordinanceName('techo')}（給与条例第16条は通勤手当の額を任命権者に委任）。</p>
          )}
          {kCommute && <p className="mt-2 text-xs text-charcoal/60 leading-relaxed">会計年度任用職員の通勤費用弁償：{kCommute.value}</p>}
        </Card>
      )}

      {tab === 'warimashi' && (
        <>
          <Card title="時間外・休日・夜間の勤務手当（割増率）">
            <table className="w-full border-collapse">
              <thead><tr className="border-b border-charcoal/15"><th className={th}>勤務の区分</th><th className={`${th} text-right`}>1時間あたりの割増率</th></tr></thead>
              <tbody>
                <tr className="border-b border-charcoal/10"><td className={cell}>時間外（勤務日）</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{overtime.weekday}%</td></tr>
                <tr className="border-b border-charcoal/10"><td className={cell}>時間外（週休日等）</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{overtime.offday}%</td></tr>
                <tr className="border-b border-charcoal/10"><td className={cell}>月60時間を超える時間外</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{overtime.over60h}%</td></tr>
                <tr className="border-b border-charcoal/10"><td className={cell}>時間外の深夜加算（22時〜翌5時）</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>＋{overtime.midnightAdd}%</td></tr>
                <tr className="border-b border-charcoal/10"><td className={cell}>休日勤務</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>{overtime.holiday}%</td></tr>
                <tr><td className={cell}>夜間勤務（正規の勤務が深夜帯の場合）</td><td className={`${cell} text-right font-bold text-[#1B4D4F]`}>＋{overtime.night}%</td></tr>
              </tbody>
            </table>
            <p className="mt-3 text-xs text-charcoal/60">勤務1時間当たりの給与額 ＝ {hourlyFormula?.value}</p>
          </Card>
          {(Object.keys(overtimeCap).length > 0 || overtimeCapChildcare) && (
            <Card title="時間外勤務の上限（命令できる時間）">
              <table className="w-full border-collapse">
                <tbody>
                  {Object.entries(overtimeCap).map(([k, v]) => (
                    <tr key={k} className="border-b border-charcoal/10 last:border-0">
                      <td className={cell}>{k}</td>
                      <td className={`${cell} text-right text-charcoal/80`}>{v as string}</td>
                    </tr>
                  ))}
                  {overtimeCapChildcare && (
                    <tr className="border-b border-charcoal/10 last:border-0">
                      <td className={cell}>育児・介護中の職員（請求した場合）</td>
                      <td className={`${cell} text-right text-charcoal/80`}>{overtimeCapChildcare.value}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}

      {tab === 'kanri' && (
        <Card title="管理職手当">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[300px]">
              <thead><tr className="border-b border-charcoal/15"><th className={th}>職</th><th className={`${th} text-right`}>月額</th></tr></thead>
              <tbody>
                {kanriList.map((k, i) => (
                  <tr key={i} className="border-b border-charcoal/10 last:border-0">
                    <td className={cell}>{k.label}</td>
                    <td className={`${cell} text-right font-bold text-[#1B4D4F] whitespace-nowrap`}>{k.yen.toLocaleString()}円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {kanriCap && <p className="mt-3 text-xs text-charcoal/60">{kanriCap.value}。</p>}
          <p className="mt-1 text-xs text-charcoal/60">市長部局の額です（議会・教育委員会・行政委員会等は別掲）。管理職員特別勤務手当は「その他」タブに記載しています。</p>
        </Card>
      )}

      {tab === 'sonota' && (
        <>
          <Card title="単身赴任手当">
            <p className="text-sm text-charcoal/80 mb-3">基本額 <b className="text-[#1B4D4F]">{tandokuBase.toLocaleString()}円</b>／月。</p>
            {tandokuAdd.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[260px]">
                  <thead><tr className="border-b border-charcoal/15"><th className={th}>交通距離</th><th className={`${th} text-right`}>加算額</th></tr></thead>
                  <tbody>
                    {tandokuAdd.map((row, i) => (
                      <tr key={i} className="border-b border-charcoal/10 last:border-0">
                        <td className={cell}>{row.kmFrom.toLocaleString()}km以上{row.kmTo ? `〜${row.kmTo.toLocaleString()}km未満` : '〜'}</td>
                        <td className={`${cell} text-right font-bold text-[#1B4D4F] whitespace-nowrap`}>+{row.yen.toLocaleString()}円</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              tandokuNote && <p className="text-xs text-charcoal/60 leading-relaxed">{tandokuNote}</p>
            )}
          </Card>
          <Card title="宿日直手当・管理職員特別勤務手当">
            <table className="w-full border-collapse">
              <tbody>
                {shukuNichoku && <tr className="border-b border-charcoal/10"><td className={cell}>宿日直手当</td><td className={`${cell} text-right font-semibold text-[#1B4D4F]`}>{shukuNichoku.value}</td></tr>}
                {kanriTokubetsu && <tr><td className={cell}>管理職員特別勤務手当</td><td className={`${cell} text-right font-semibold text-[#1B4D4F]`}>{kanriTokubetsu.value}</td></tr>}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {tab === 'tokushu' && (
        <Card title="特殊勤務手当">
          <p className="mb-3 text-sm text-charcoal/70">著しく危険・不快・不健康又は困難な勤務等に従事する職員に、勤務の特殊性に応じて支給される手当です。</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[360px]">
              <thead><tr className="border-b border-charcoal/15"><th className={th}>手当の種類</th><th className={`${th} text-right`}>額</th><th className={th}>対象</th></tr></thead>
              <tbody>
                {tokushuData.map((r) => (
                  <tr key={r.name} className="border-b border-charcoal/10 last:border-0 align-top">
                    <td className={`${cell} font-medium text-charcoal/80`}>{r.name}</td>
                    <td className={`${cell} text-right font-semibold text-[#1B4D4F] whitespace-nowrap`}>{r.amount}</td>
                    <td className={`${cell} text-charcoal/60`}>{r.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-charcoal/50">{tokushuSource}</p>
        </Card>
      )}

      {tab === 'shokyu' && (
        <>
          <Card title="普通昇給">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              {shokyuBasics.map((b) => (
                <div key={b.label} className="rounded-xl bg-[#1B4D4F] text-center px-3 py-4">
                  <p className="text-xs text-white/70">{b.label}</p>
                  <p className="text-lg font-bold text-white mt-0.5">{b.value}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-charcoal/60">{shokyuBasicNote}</p>
          </Card>
          <Card title="昇給しない場合">
            <ul className="space-y-1.5">{shokyuNoRaise.map((s, i) => (<li key={i} className="text-sm text-charcoal/70 flex gap-2"><span className="text-red-400 shrink-0">{i + 1}.</span>{s}</li>))}</ul>
          </Card>
          <Card title="昇給号数を調整する場合">
            <ul className="space-y-1.5">{shokyuAdjust.map((s, i) => (<li key={i} className="text-sm text-charcoal/70 flex gap-2"><span className="text-amber-500 shrink-0">{i + 1}.</span>{s}</li>))}</ul>
          </Card>
          <Card title="長期休職者等の昇給">
            <p className="text-sm text-charcoal/60 mb-2">{shokyuLongLeaveIntro}</p>
            <ul className="space-y-1.5">{shokyuLongLeave.map((s, i) => (<li key={i} className="text-sm text-charcoal/70 flex gap-2"><span className="text-accent/60 shrink-0">・</span>{s}</li>))}</ul>
            <p className="mt-3 rounded-xl bg-amber-50/60 border border-amber-100 px-3 py-2 text-xs text-charcoal/60">{shokyuLongLeaveNote}</p>
          </Card>
        </>
      )}

      {tab === 'over61' && (
        <>
          <Card title="61歳以後の給与（定年延長）">
            <p className="text-sm text-charcoal/70 leading-relaxed">{over61Intro}</p>
          </Card>
          <Card title="7割水準になるもの">
            <div className="flex flex-wrap gap-2">{over61SevenTenths.map((x) => (<span key={x} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium">{x}</span>))}</div>
          </Card>
          <Card title="7割にならないもの（満額支給）">
            <div className="flex flex-wrap gap-2">{over61FullAmount.map((x) => (<span key={x} className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium">{x}</span>))}</div>
          </Card>
          <Card title="給料の調整額">
            <p className="text-sm text-charcoal/60 mb-2">{gikyuChoseiIntro}</p>
            <table className="w-full border-collapse">
              <thead><tr className="border-b border-charcoal/15"><th className={th}>区分</th><th className={`${th} text-right`}>月額</th></tr></thead>
              <tbody>{gikyuChoseiRows.map((r) => (<tr key={r.label} className="border-b border-charcoal/10 last:border-0"><td className={cell}>{r.label}</td><td className={`${cell} text-right font-semibold text-[#1B4D4F]`}>{r.value}</td></tr>))}</tbody>
            </table>
          </Card>
        </>
      )}

      {tab === 'taishoku' && (
        <>
          <Card title="退職手当のしくみ">
            <div className="rounded-xl bg-accent text-center px-4 py-4 mb-3"><p className="text-sm font-bold text-white">{taishokuFormula}</p></div>
            <p className="text-sm text-charcoal/60">{taishokuRateNote}</p>
          </Card>
          <Card title="支給率早見表">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[300px]">
                <thead><tr className="border-b border-charcoal/15"><th className={th}>勤続年数</th><th className={`${th} text-right`}>自己都合</th><th className={`${th} text-right`}>定年・応募認定等</th></tr></thead>
                <tbody>{taishokuRates.map((r) => (<tr key={r.years} className="border-b border-charcoal/10 last:border-0"><td className={`${cell} font-medium`}>{r.years}</td><td className={`${cell} text-right text-charcoal/70`}>{r.jiko}</td><td className={`${cell} text-right font-semibold text-[#1B4D4F]`}>{r.teinen}</td></tr>))}</tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-charcoal/65">{taishokuExample}</p>
          </Card>
          <Card title="調整額とは">
            <p className="text-sm text-charcoal/60 mb-2">{taishokuChoseiIntro}</p>
            <ul className="space-y-1.5">{taishokuChoseiPoints.map((s, i) => (<li key={i} className="text-sm text-charcoal/70 flex gap-2"><span className="text-accent/60 shrink-0">・</span>{s}</li>))}</ul>
          </Card>
          <Card title="知っておきたいポイント">
            <ul className="space-y-1.5">{taishokuPoints.map((p, i) => (<li key={i} className="text-sm text-charcoal/70 flex gap-2"><span className={`shrink-0 ${p.warn ? 'text-red-400' : 'text-accent/60'}`}>・</span>{p.text}</li>))}</ul>
            <p className="mt-3 text-xs text-charcoal/50">{taishokuSource}</p>
          </Card>
        </>
      )}

      {tab === 'payment' && (
        <>
          <Card title="支給日">
            <div className="rounded-xl bg-accent text-center px-4 py-4 mb-3">
              <p className="text-xs text-white/70">毎月の給与支給日</p>
              <p className="text-3xl font-bold text-white mt-0.5">{paymentDay}</p>
              <p className="text-xs text-white/70 mt-1">{paymentDayNote}</p>
            </div>
            <ul className="space-y-1">{paymentDayPoints.map((s, i) => (<li key={i} className="text-sm text-charcoal/60 flex gap-2"><span className="text-accent/60 shrink-0">・</span>{s}</li>))}</ul>
          </Card>
          <Card title="控除項目">
            <div className="space-y-2.5">
              {paymentDeductions.map((sec) => (
                <div key={sec.title} className="rounded-xl bg-white/50 border border-gray-100 px-3 py-2.5">
                  <p className="text-sm font-medium text-charcoal mb-1">{sec.title}</p>
                  <ul className="space-y-0.5">{sec.items.map((it, i) => (<li key={i} className="text-xs text-charcoal/70">・{it}</li>))}</ul>
                </div>
              ))}
            </div>
          </Card>
          <Card title="給料の減額">
            <p className="text-sm text-charcoal/70 leading-relaxed">{paymentGengakuText}</p>
            <div className="mt-3 rounded-xl bg-accent/5 px-3 py-2.5 text-xs text-charcoal/60 text-center">{paymentGengakuFormula}</div>
          </Card>
        </>
      )}

      <p className="text-xs text-charcoal/50 mt-4 px-1">
        出典：{ordinanceName('kyuyo')}・{ordinanceName('kyuyoKisoku')}（岸和田市例規集）・各別条例（特殊勤務手当条例／退職手当条例）。通勤手当・管理職手当の実額は{ordinanceName('techo')}。
      </p>
    </PageLayout>
  );
}
