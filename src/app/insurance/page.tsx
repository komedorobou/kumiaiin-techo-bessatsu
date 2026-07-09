'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import {
  setKyosaiPlans,
  planCategories,
  planTableNotes,
  seniorContinuation,
  childTransition,
  supportU40,
  kyosaiFeatures,
  enrollmentRules,
  healthNoticeIntro,
  healthNoticeItems,
  healthTerms,
  notChronicDiseases,
  chronicDiseases,
  claimSteps,
  claimDocuments,
  claimNotes,
  claimExclusionsCommon,
  claimExclusionsAccident,
  claimExclusionsTraffic,
  sekkotsuinNotes,
  kyosaiContact,
  mutualAidBenefits,
  SetKyosaiPlan,
} from '@/data/insuranceData';

type Kyosai = 'set' | 'kasai' | 'soshiki';
type SetMode = 'plans' | 'features' | 'notice' | 'claim';

export default function InsurancePage() {
  const [kyosai, setKyosai] = useState<Kyosai>('set');
  const [setMode, setSetMode] = useState<SetMode>('plans');

  return (
    <PageLayout
      title="共済ガイド"
      subtitle="セット共済・火災共済・組織共済の内容を確認できます"
    >
      {/* 共済の種類 */}
      <div className="glass-card-strong rounded-2xl p-5 sm:p-7 mb-6 animate-fade-in">
        <label className="block text-xs font-medium text-charcoal/50 mb-3">共済の種類</label>
        <div className="flex items-center gap-3 flex-wrap">
          {([
            ['set', 'セット共済'],
            ['kasai', '火災共済'],
            ['soshiki', '組織共済（弔慰金）'],
          ] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setKyosai(val)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                kyosai === val
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-white/60 text-charcoal/50 border border-gray-200 hover:border-accent/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {kyosai === 'set' && (
        <>
          {/* セット共済内タブ */}
          <div className="flex gap-2 mb-8 flex-wrap animate-fade-in-delay-1">
            {([
              { key: 'plans', label: 'プラン一覧' },
              { key: 'features', label: '特徴・加入' },
              { key: 'notice', label: '健康告知' },
              { key: 'claim', label: '給付の手続き' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSetMode(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  setMode === key
                    ? 'bg-accent text-white'
                    : 'bg-white text-charcoal/50 hover:text-accent hover:bg-accent/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {setMode === 'plans' && <PlanSection />}
          {setMode === 'features' && <FeaturesSection />}
          {setMode === 'notice' && <NoticeSection />}
          {setMode === 'claim' && <ClaimSection />}
        </>
      )}

      {kyosai === 'kasai' && <KasaiSection />}
      {kyosai === 'soshiki' && <BenefitsList />}
    </PageLayout>
  );
}

/* ==================== 火災共済（準備中） ==================== */

function KasaiSection() {
  return (
    <div className="glass-card-strong rounded-2xl p-10 sm:p-16 animate-fade-in text-center">
      <div className="w-14 h-14 rounded-2xl bg-accent/5 flex items-center justify-center text-accent mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l9-8 9 8" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M9 21v-6h6v6" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-charcoal mb-2">火災共済</h2>
      <p className="text-sm text-charcoal/50">
        コンテンツは現在準備中です。詳しくは組合事務所へお問い合わせください。
      </p>
    </div>
  );
}

/* ==================== プラン一覧 ==================== */

function PlanSection() {
  const [category, setCategory] = useState<'adult' | 'medical' | 'child'>('adult');
  const plans = setKyosaiPlans.filter((p) => p.category === category);
  const cat = planCategories.find((c) => c.id === category)!;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Category selector */}
      <div className="flex gap-2 flex-wrap">
        {planCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              category === c.id
                ? 'bg-accent text-white shadow-md'
                : 'bg-white/60 text-charcoal/50 border border-gray-200 hover:border-accent/30'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-charcoal/60">{cat.note}</p>

      {/* Desktop table */}
      <div className="hidden lg:block">
        <div className="glass-card-strong rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[1100px]">
              <thead>
                <tr className="border-b border-gray-200 bg-accent/5">
                  <th rowSpan={2} className="text-left p-2 font-medium text-charcoal/50 sticky left-0 bg-white/95 z-10">型</th>
                  <th rowSpan={2} className="text-right p-2 font-medium text-charcoal/50">月掛金</th>
                  <th colSpan={4} className="p-2 font-semibold text-charcoal/70 border-l border-gray-200">入院保障（日額）</th>
                  <th colSpan={6} className="p-2 font-semibold text-charcoal/70 border-l border-gray-200">通院保障（日額）</th>
                  <th colSpan={3} className="p-2 font-semibold text-charcoal/70 border-l border-gray-200">死亡・重度障害</th>
                  <th colSpan={3} className="p-2 font-semibold text-charcoal/70 border-l border-gray-200">後遺障害（3〜14級）</th>
                  <th rowSpan={2} className="text-right p-2 font-medium text-charcoal/50 border-l border-gray-200">手術見舞金※4</th>
                  <th rowSpan={2} className="text-right p-2 font-medium text-charcoal/50 border-l border-gray-200">サポートU40（年額）</th>
                </tr>
                <tr className="border-b border-gray-200 text-charcoal/40">
                  <th className="p-2 font-medium border-l border-gray-200">病気・ケガ</th>
                  <th className="p-2 font-medium">がん※1</th>
                  <th className="p-2 font-medium">不慮の事故</th>
                  <th className="p-2 font-medium">交通事故</th>
                  <th className="p-2 font-medium border-l border-gray-200">病気</th>
                  <th className="p-2 font-medium">ケガ・不慮※2</th>
                  <th className="p-2 font-medium">ギプス装着整骨院</th>
                  <th className="p-2 font-medium">交通事故※3</th>
                  <th className="p-2 font-medium">安静加療加算</th>
                  <th className="p-2 font-medium">ギプス装着整骨院</th>
                  <th className="p-2 font-medium border-l border-gray-200">病気・ケガ</th>
                  <th className="p-2 font-medium">不慮の事故</th>
                  <th className="p-2 font-medium">交通事故</th>
                  <th className="p-2 font-medium border-l border-gray-200">病気・ケガ</th>
                  <th className="p-2 font-medium">不慮の事故</th>
                  <th className="p-2 font-medium">交通事故</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p, i) => (
                  <tr key={p.id} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-gray-50/40' : ''} hover:bg-accent/[0.03] transition-colors`}>
                    <td className="p-2 font-bold text-charcoal sticky left-0 bg-white/95 z-10">{p.name}</td>
                    <td className="p-2 text-right font-semibold text-accent whitespace-nowrap">{p.monthly.toLocaleString()}円</td>
                    {p.hosp.map((v, j) => (
                      <td key={j} className={`p-2 text-right text-charcoal/70 whitespace-nowrap ${j === 0 ? 'border-l border-gray-100' : ''}`}>{v.toLocaleString()}円</td>
                    ))}
                    {p.outp.map((v, j) => (
                      <td key={j} className={`p-2 text-right text-charcoal/70 whitespace-nowrap ${j === 0 ? 'border-l border-gray-100' : ''}`}>{v.toLocaleString()}円</td>
                    ))}
                    {p.death.map((v, j) => (
                      <td key={j} className={`p-2 text-right text-charcoal/70 whitespace-nowrap ${j === 0 ? 'border-l border-gray-100' : ''}`}>{v.toLocaleString()}万円</td>
                    ))}
                    {p.disability.map((v, j) => (
                      <td key={j} className={`p-2 text-right text-charcoal/60 whitespace-nowrap ${j === 0 ? 'border-l border-gray-100' : ''}`}>{v}</td>
                    ))}
                    <td className="p-2 text-right text-charcoal/70 whitespace-nowrap border-l border-gray-100">{p.surgery.toLocaleString()}円</td>
                    <td className="p-2 text-right font-semibold text-charcoal whitespace-nowrap border-l border-gray-100">{p.u40.toLocaleString()}円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-4">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {/* 加入対象・移行 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card-strong rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-charcoal mb-2">61歳から65歳未満の組合員・配偶者</h3>
          <p className="text-xs text-charcoal/60 leading-relaxed">{seniorContinuation}</p>
        </div>
        <div className="glass-card-strong rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-charcoal mb-2">サポートU40</h3>
          <p className="text-xs text-charcoal/60 leading-relaxed">{supportU40.description}</p>
          <p className="text-xs text-accent/80 mt-2 leading-relaxed">{supportU40.example}</p>
        </div>
      </div>

      <div className="glass-card-strong rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-charcoal mb-3">慢性疾患に罹患している子どもの型の移行表（19歳から移行できる型）</h3>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[320px]">
            <tbody>
              {childTransition.map((row, i) => (
                <tr key={row.from} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/30' : ''}`}>
                  <td className="py-2 px-3 font-medium text-charcoal/70 w-32">18歳現在 {row.from}</td>
                  <td className="py-2 px-3 text-charcoal/70">{row.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-charcoal/40">
          現在加入中で慢性疾患に罹患している子どもが、新しい効力発生日時点で19歳となったときは、上表の範囲内でセット型を選択してください。現契約からの移行を確保するセット型（ピンク）を選択する場合はチェックシートが必要です。
        </p>
      </div>

      {/* Notes */}
      <div className="glass-card rounded-xl p-5 text-xs text-charcoal/50 space-y-1.5 leading-relaxed">
        {planTableNotes.map((note, i) => (
          <p key={i}>{note}</p>
        ))}
        <p className="pt-2 text-charcoal/40">
          加入中に健康告知に該当しても現契約で継続できます。共済期間は1年間（月払い・給料天引き）。{kyosaiContact}
        </p>
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: SetKyosaiPlan }) {
  const [open, setOpen] = useState(false);
  const outpLabels = ['病気', 'ケガ・不慮※2', 'ギプス装着整骨院', '交通事故※3', '安静加療加算', '交通・ギプス装着整骨院'];
  const hospLabels = ['病気・ケガ', 'がん※1', '不慮の事故', '交通事故'];
  const deathLabels = ['病気・ケガ', '不慮の事故', '交通事故'];

  return (
    <div className="glass-card-strong rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-5 text-left flex items-center justify-between">
        <div>
          <h3 className="font-bold text-charcoal">{plan.name}</h3>
          <p className="text-lg font-bold text-accent mt-1">
            {plan.monthly.toLocaleString()}
            <span className="text-xs font-normal text-charcoal/40">円/月</span>
          </p>
          <p className="text-[11px] text-charcoal/40 mt-0.5">
            入院日額 {plan.hosp[0].toLocaleString()}円〜 ／ 死亡・重度障害 最高{plan.death[2].toLocaleString()}万円
          </p>
        </div>
        <div className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-charcoal/30">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4 text-xs">
          <div>
            <p className="font-semibold text-charcoal/60 mb-1.5">入院保障（日額）</p>
            {plan.hosp.map((v, i) => (
              <Row key={i} label={hospLabels[i]} value={`${v.toLocaleString()}円`} />
            ))}
          </div>
          <div>
            <p className="font-semibold text-charcoal/60 mb-1.5">通院保障（日額）</p>
            {plan.outp.map((v, i) => (
              <Row key={i} label={outpLabels[i]} value={`${v.toLocaleString()}円`} />
            ))}
          </div>
          <div>
            <p className="font-semibold text-charcoal/60 mb-1.5">死亡・重度障害</p>
            {plan.death.map((v, i) => (
              <Row key={i} label={deathLabels[i]} value={`${v.toLocaleString()}万円`} />
            ))}
          </div>
          <div>
            <p className="font-semibold text-charcoal/60 mb-1.5">後遺障害（3〜14級）</p>
            {plan.disability.map((v, i) => (
              <Row key={i} label={deathLabels[i]} value={v} />
            ))}
          </div>
          <Row label="手術見舞金※4" value={`${plan.surgery.toLocaleString()}円`} />
          <Row label="サポートU40（年額）" value={`${plan.u40.toLocaleString()}円`} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-charcoal/40">{label}</span>
      <span className="font-medium text-charcoal/70">{value}</span>
    </div>
  );
}

/* ==================== 特徴・加入 ==================== */

function FeaturesSection() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="glass-card-strong rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-charcoal mb-1">組合員みんなの助け合い ―「もうけ」を目的としません</h2>
        <p className="text-xs text-charcoal/40 mb-6">安い掛金で大きな保障を実現</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {kyosaiFeatures.map((f, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <h3 className="text-sm font-semibold text-charcoal">{f.title}</h3>
              </div>
              <p className="text-xs text-charcoal/60 leading-relaxed">{f.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card-strong rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-charcoal mb-6">セット共済の加入にあたって知っておきたいこと</h2>
        <div className="space-y-5">
          {enrollmentRules.map((r) => (
            <div key={r.title}>
              <h3 className="text-sm font-semibold text-charcoal mb-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                {r.title}
              </h3>
              <p className="text-xs text-charcoal/60 leading-relaxed pl-3.5">{r.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== 健康告知 ==================== */

function NoticeSection() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="glass-card-strong rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-charcoal mb-2">健康告知とは</h2>
        <p className="text-xs text-charcoal/60 leading-relaxed mb-6">{healthNoticeIntro}</p>
        <div className="space-y-3">
          {healthNoticeItems.map((item, i) => (
            <div key={i} className="flex gap-3 items-start rounded-xl bg-red-50/50 border border-red-100 p-3">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <p className="text-xs text-charcoal/70 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card-strong rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-charcoal mb-6">用語の解説</h2>
        <div className="space-y-5">
          {healthTerms.map((t) => (
            <div key={t.term}>
              <h3 className="text-sm font-semibold text-charcoal mb-1">「{t.term.replace('とは', '')}」とは？</h3>
              <p className="text-xs text-charcoal/60 leading-relaxed">{t.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card-strong rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-green-700 mb-3">慢性疾患ではない主な疾患（加入可）</h3>
          <div className="flex flex-wrap gap-1.5">
            {notChronicDiseases.map((d) => (
              <span key={d} className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">{d}</span>
            ))}
          </div>
        </div>
        <div className="glass-card-strong rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-red-600 mb-3">慢性疾患です（該当すると加入不可）</h3>
          <div className="flex flex-wrap gap-1.5">
            {chronicDiseases.map((d) => (
              <span key={d} className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== 給付の手続き ==================== */

function ClaimSection() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="glass-card-strong rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-charcoal mb-6">給付は簡単な手続きでOK！</h2>
        <div className="space-y-3 mb-6">
          {claimSteps.map((s, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <p className="text-sm text-charcoal/70 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-semibold text-charcoal mb-3">そろえていただく書類</h3>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[480px]">
            <tbody>
              {claimDocuments.map((row, i) => (
                <tr key={row.kind} className={`border-b border-gray-100 align-top ${i % 2 === 0 ? 'bg-gray-50/30' : ''}`}>
                  <td className="py-2.5 px-3 font-medium text-charcoal/70 w-28 whitespace-nowrap">{row.kind}</td>
                  <td className="py-2.5 px-3 text-charcoal/70">
                    {row.docs.map((d, j) => (
                      <p key={j} className="text-xs leading-relaxed">・{d}</p>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-gray-50/80 text-xs text-charcoal/40 space-y-1">
          {claimNotes.map((n, i) => (
            <p key={i}>・{n}</p>
          ))}
        </div>
      </div>

      <div className="glass-card-strong rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-charcoal mb-1">ご注意ください</h2>
        <p className="text-xs text-charcoal/40 mb-6">給付にあたっては「自治労連共済規約・細則」の支払基準に基づきお支払いします</p>

        <h3 className="text-sm font-semibold text-charcoal mb-2">つぎの場合は共済金をお支払いできません（全ての共済に共通）</h3>
        <ul className="space-y-1.5 mb-6">
          {claimExclusionsCommon.map((e, i) => (
            <li key={i} className="flex gap-2 text-xs text-charcoal/60 leading-relaxed"><span className="text-red-400 shrink-0">{i + 1}.</span>{e}</li>
          ))}
        </ul>

        <h3 className="text-sm font-semibold text-charcoal mb-2">つぎの場合は不慮事故入院共済金はお支払いできません</h3>
        <ul className="space-y-1.5 mb-6">
          {claimExclusionsAccident.map((e, i) => (
            <li key={i} className="flex gap-2 text-xs text-charcoal/60 leading-relaxed"><span className="text-red-400 shrink-0">{i + 1}.</span>{e}</li>
          ))}
        </ul>

        <h3 className="text-sm font-semibold text-charcoal mb-2">つぎの場合は交通災害共済金はお支払いできません</h3>
        <ul className="space-y-1.5 mb-6">
          {claimExclusionsTraffic.map((e, i) => (
            <li key={i} className="flex gap-2 text-xs text-charcoal/60 leading-relaxed"><span className="text-red-400 shrink-0">{i + 1}.</span>{e}</li>
          ))}
        </ul>

        <h3 className="text-sm font-semibold text-charcoal mb-2">接骨院・整骨院の扱いについて</h3>
        <ul className="space-y-1.5">
          {sekkotsuinNotes.map((e, i) => (
            <li key={i} className="flex gap-2 text-xs text-charcoal/60 leading-relaxed"><span className="text-accent/60 shrink-0">&bull;</span>{e}</li>
          ))}
        </ul>

        <p className="mt-6 text-xs text-charcoal/40">{kyosaiContact}</p>
      </div>
    </div>
  );
}

/* ==================== 慶弔見舞金 ==================== */

function BenefitsList() {
  return (
    <div className="glass-card-strong rounded-2xl p-6 sm:p-8 animate-fade-in">
      <h2 className="text-lg font-bold text-charcoal mb-1">組織共済（弔慰金）</h2>
      <p className="text-xs text-charcoal/40 mb-6">
        市職労共済規程 慶弔見舞金 ― 事由発生日より1年以内に請求してください
      </p>

      <div className="space-y-0">
        {mutualAidBenefits.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between py-4 ${
              i < mutualAidBenefits.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            <span className="text-sm text-charcoal/70 flex-1 pr-4">{item.event}</span>
            <span className="text-sm font-semibold text-accent whitespace-nowrap">
              {item.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
