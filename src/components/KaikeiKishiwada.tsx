'use client';

/**
 * KaikeiKishiwada — 会計年度任用職員（岸和田市）。
 * 1) 職種別の年次報酬表（児童指導員・長時間担当職員・放課後児童支援員（学童）・一般事務員）。
 *    初任給号給＝施行規則別表第2、昇給＝+2号/年（上限9年）、報酬＝給料月額×1.11×週時間÷38.75。
 * 2) 任意の号給×週勤務時間で試算する汎用シミュレーター。
 * 数値はすべて src/data/kaikeiNendoData.ts・facts.json・slots/kishiwada 経由（tsxにベタ書きしない）。
 */
import { useMemo, useState } from 'react';
import NotAvailable from '@/components/NotAvailable';
import { getKaikei, ordinanceName } from '@/lib/facts';
import { kaikeiBase, kaikeiStepCount, kaikeiMonthly, KAIKEI_FULLTIME_HOURS } from '@/lib/slots/kishiwada';
import { KAIKEI_HOURS_MIN, KAIKEI_HOURS_STEP } from '@/lib/ui';
import {
  kaikeiNendoJobs,
  kaikeiMonthlyFromTable,
  kaikeiNendoSource,
  kaikeiEmploymentRows,
  kaikeiEmploymentColumns,
  kaikeiEmploymentNote,
  kaikeiInsuranceRows,
  kaikeiCommuteVehicleRows,
  kaikeiCommuteNotes,
  kaikeiTransitCap,
} from '@/data/kaikeiNendoData';

const cell = 'py-2.5 px-3 text-sm align-top';
const th = 'py-2 px-3 text-left text-xs text-charcoal/60 font-semibold';

function FactCard({ label, value, ordinanceKey, article }: { label: string; value: string; ordinanceKey?: string; article?: string }) {
  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white/80 px-5 sm:px-6 py-5">
      <p className="text-xs font-semibold text-charcoal/55">{label}</p>
      <p className="mt-1.5 text-sm text-charcoal/85 leading-relaxed">{value}</p>
      {ordinanceKey && (
        <p className="mt-2 text-xs text-charcoal/50">出典：{ordinanceName(ordinanceKey)}{article ? `　${article}` : ''}</p>
      )}
    </div>
  );
}

export default function KaikeiKishiwada() {
  // ---- 職種別 年次報酬表 ----
  const [jobId, setJobId] = useState(kaikeiNendoJobs[0].id);
  const job = useMemo(() => kaikeiNendoJobs.find((j) => j.id === jobId)!, [jobId]);
  const [hours, setHours] = useState<number>(job.defaultWeeklyHours ?? job.weeklyHours);

  const onJobChange = (id: string) => {
    setJobId(id);
    const j = kaikeiNendoJobs.find((x) => x.id === id)!;
    setHours(j.defaultWeeklyHours ?? j.weeklyHours);
  };

  const usesDefaultHours = !job.weeklyHoursOptions || hours === (job.defaultWeeklyHours ?? job.weeklyHours);
  const jobRows = job.rows.map((r) => ({
    ...r,
    monthlyEff: usesDefaultHours ? r.monthly : kaikeiMonthlyFromTable(r.tableSalary, hours),
  }));

  // ---- 汎用シミュレーター（任意号給×週時間） ----
  const stepMax = kaikeiStepCount();
  const [go, setGo] = useState(1);
  const [simHours, setSimHours] = useState(KAIKEI_FULLTIME_HOURS);
  const base = kaikeiBase(go);
  const monthly = kaikeiMonthly(go, simHours);

  // ---- facts ----
  const shonin = getKaikei<any>('shoninGokyu');
  const raise = getKaikei<any>('raise');
  const formula = getKaikei<any>('hoshuFormula');
  const eligibility = getKaikei<any>('eligibilityCondition');
  const chiiki = getKaikei<any>('chiikiTeate');
  const bonusKimatsu = getKaikei<any>('bonusKimatsu');
  const bonusText = '年間 約4.65ヶ月分（6月・12月 各約2.325ヶ月）。期末手当は給料月額＋地域手当に規則の率、勤勉手当は支給総額の上限率による。一任用期間6ヶ月以上かつ週15.5時間以上で支給、新規採用の初回は一部支給。';

  return (
    <div className="space-y-5">
      {/* 職種別 年次報酬表 */}
      <section className="glass-card-strong rounded-2xl p-5 sm:p-7">
        <h2 className="text-[16px] font-semibold text-charcoal mb-1">会計年度任用職員（月給）職種別の年次報酬</h2>
        <p className="text-xs text-charcoal/60 mb-4">職種を選ぶと、初任給から10年目までの号給・給料月額・月額報酬を表示します。</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-charcoal/70 mb-1.5">職種</label>
            <select value={jobId} onChange={(e) => onJobChange(e.target.value)} className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-2.5 min-h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-accent/20">
              {kaikeiNendoJobs.map((j) => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal/70 mb-1.5">週勤務時間</label>
            {job.weeklyHoursOptions ? (
              <select value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-2.5 min-h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-accent/20">
                {job.weeklyHoursOptions.map((h) => (
                  <option key={h} value={h}>週{h}時間</option>
                ))}
              </select>
            ) : (
              <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 min-h-[44px] text-sm text-charcoal/70 flex items-center">週{job.weeklyHours}時間（規定）</div>
            )}
          </div>
        </div>
        <p className="text-xs text-charcoal/60 mb-3">{job.subtitle}</p>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[360px]">
            <thead>
              <tr className="border-b border-charcoal/15">
                <th className={th}>経験</th>
                <th className={`${th} text-right`}>号給</th>
                <th className={`${th} text-right`}>給料月額</th>
                <th className={`${th} text-right`}>月額報酬</th>
              </tr>
            </thead>
            <tbody>
              {jobRows.map((r, i) => (
                <tr key={r.year} className={`border-b border-charcoal/10 ${i === 0 ? 'bg-accent/5' : ''}`}>
                  <td className={cell}>{r.year === 1 ? '1年目（初任）' : `${r.year}年目`}</td>
                  <td className={`${cell} text-right text-charcoal/70`}>{r.gokyu}号</td>
                  <td className={`${cell} text-right text-charcoal/70 whitespace-nowrap`}>{r.tableSalary.toLocaleString()}円</td>
                  <td className={`${cell} text-right font-bold text-[#1B4D4F] whitespace-nowrap`}>{r.monthlyEff.toLocaleString()}円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!usesDefaultHours && (
          <p className="mt-2 text-xs text-charcoal/55">週{hours}時間で再計算した額です（公表実額は週{job.defaultWeeklyHours ?? job.weeklyHours}時間の場合）。</p>
        )}
        <ul className="mt-3 space-y-1">
          {job.notes.map((n, i) => (
            <li key={i} className="text-xs text-charcoal/60 leading-relaxed flex gap-1.5"><span className="text-accent/60 shrink-0">・</span>{n}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-charcoal/50">{kaikeiNendoSource}</p>
      </section>

      {/* facts カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {shonin && <FactCard label="初任給号給" value={shonin.value} ordinanceKey={shonin.provenance?.ordinance} article={shonin.provenance?.article} />}
        {raise && <FactCard label="昇給" value={raise.value} ordinanceKey={raise.provenance?.ordinance} article={raise.provenance?.article} />}
        {formula && <FactCard label="月額報酬の算定式" value={formula.value} ordinanceKey={formula.provenance?.ordinance} article={formula.provenance?.article} />}
        {chiiki && <FactCard label="地域手当" value={`給料月額 × ${chiiki.value}%（会計年度任用職員給料表３は16%）`} ordinanceKey={chiiki.provenance?.ordinance} article={chiiki.provenance?.article} />}
        <FactCard label="期末・勤勉手当" value={bonusText} ordinanceKey={bonusKimatsu?.provenance?.ordinance} article={bonusKimatsu?.provenance?.article} />
        {eligibility && <FactCard label="年休・特別休暇の対象条件" value={eligibility.value} ordinanceKey={eligibility.provenance?.ordinance} article={eligibility.provenance?.article} />}
      </div>

      {/* 労働条件一覧（分会別） */}
      <section className="glass-card-strong rounded-2xl p-5 sm:p-7">
        <h2 className="text-[16px] font-semibold text-charcoal mb-4">労働条件（分会別）</h2>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="border-b border-charcoal/15">
                <th className={th}></th>
                {kaikeiEmploymentColumns.map((c) => (
                  <th key={c} className={`${th}`}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kaikeiEmploymentRows.map((row) => (
                <tr key={row.label} className="border-b border-charcoal/10 align-top">
                  <td className={`${cell} font-semibold text-charcoal/70 whitespace-nowrap`}>{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className={`${cell} text-charcoal/70`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-charcoal/60">{kaikeiEmploymentNote}</p>
      </section>

      {/* 通勤手当・社会保険 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section className="glass-card-strong rounded-2xl p-5 sm:p-7">
          <h2 className="text-[16px] font-semibold text-charcoal mb-3">通勤手当（会計年度）</h2>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[300px]">
              <thead>
                <tr className="border-b border-charcoal/15">
                  <th className={th}>片道距離</th>
                  <th className={`${th} text-right`}>自動車</th>
                  <th className={`${th} text-right`}>バイク</th>
                  <th className={`${th} text-right`}>自転車</th>
                </tr>
              </thead>
              <tbody>
                {kaikeiCommuteVehicleRows.map((r) => (
                  <tr key={r.range} className="border-b border-charcoal/10 last:border-0">
                    <td className={cell}>{r.range}</td>
                    <td className={`${cell} text-right font-semibold text-[#1B4D4F] whitespace-nowrap`}>{r.car}</td>
                    <td className={`${cell} text-right text-charcoal/70 whitespace-nowrap`}>{r.bike}</td>
                    <td className={`${cell} text-right text-charcoal/70 whitespace-nowrap`}>{r.bicycle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-3 space-y-1">
            {kaikeiCommuteNotes.map((n, i) => (
              <li key={i} className="text-xs text-charcoal/60 leading-relaxed flex gap-1.5"><span className="text-accent/60 shrink-0">・</span>{n}</li>
            ))}
            <li className="text-xs text-charcoal/60 leading-relaxed flex gap-1.5"><span className="text-accent/60 shrink-0">・</span>交通機関の月額限度額は{kaikeiTransitCap.toLocaleString()}円。</li>
          </ul>
        </section>
        <section className="glass-card-strong rounded-2xl p-5 sm:p-7">
          <h2 className="text-[16px] font-semibold text-charcoal mb-3">社会保険・福利</h2>
          <table className="w-full text-sm">
            <tbody>
              {kaikeiInsuranceRows.map((r) => (
                <tr key={r.label} className="border-b border-charcoal/10 last:border-0">
                  <td className={`${cell} text-charcoal/70`}>{r.label}</td>
                  <td className={`${cell} text-right font-semibold text-charcoal/80`}>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* 汎用シミュレーター */}
      <section className="glass-card-strong rounded-2xl p-5 sm:p-7">
        <h2 className="text-[16px] font-semibold text-charcoal mb-1">任意の号給で試算（フルタイム基準）</h2>
        <p className="text-xs text-charcoal/60 mb-4">会計年度任用職員給料表1（別表第1・全{stepMax}号）の号給と週勤務時間から報酬月額を試算します。</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-charcoal/70 mb-1.5">号給</label>
            <select value={go} onChange={(e) => setGo(Number(e.target.value))} className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-2.5 min-h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-accent/20">
              {Array.from({ length: stepMax }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}号</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal/70 mb-1.5">1週間の勤務時間</label>
            <div className="flex items-center gap-2">
              <input type="range" min={KAIKEI_HOURS_MIN} max={KAIKEI_FULLTIME_HOURS} step={KAIKEI_HOURS_STEP} value={simHours} aria-label="1週間の勤務時間" onChange={(e) => setSimHours(Number(e.target.value))} className="slider flex-1" />
              <span className="text-sm font-bold text-charcoal w-24 text-right whitespace-nowrap">{simHours}h</span>
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-xl bg-accent text-white px-5 py-4">
          <p className="text-xs text-white/75">報酬 月額（フルタイム基準 {base.toLocaleString()}円 × {simHours}h ÷ {KAIKEI_FULLTIME_HOURS}h）</p>
          <p className="text-3xl font-bold mt-0.5">{monthly.toLocaleString()}<span className="text-base font-semibold ml-1">円</span></p>
        </div>
        <p className="mt-3 text-xs text-charcoal/60 leading-relaxed">出典：{ordinanceName('kaikei')}　別表第1（会計年度任用職員給料表１）・第13条第1項第1号。期末・勤勉手当は別途支給されます。</p>
      </section>

      <NotAvailable
        title="扶養手当等の会計年度個別運用"
        detail="上記のほか、扶養手当や配属先別の細目は任用条件により異なります。休暇ガイドの会計年度タブおよび導入時の確認内容もあわせてご覧ください。"
      />
    </div>
  );
}
