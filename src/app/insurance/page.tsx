'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import {
  diagnosisQuestions,
  getRecommendedPlans,
  insurancePlans,
  childPlans,
  mutualAidBenefits,
  InsurancePlan,
} from '@/data/insuranceData';

type Mode = 'diagnosis' | 'compare' | 'benefits';

export default function InsurancePage() {
  const [mode, setMode] = useState<Mode>('diagnosis');

  return (
    <PageLayout
      title="共済かんたん診断"
      subtitle="あなたに最適なセット共済プランを見つけましょう"
    >
      {/* Mode tabs */}
      <div className="flex gap-2 mb-8 animate-fade-in-delay-1">
        {([
          { key: 'diagnosis', label: '診断' },
          { key: 'compare', label: 'プラン一覧' },
          { key: 'benefits', label: '慶弔見舞金' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              mode === key
                ? 'bg-accent text-white'
                : 'bg-white text-charcoal/50 hover:text-accent hover:bg-accent/5'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'diagnosis' && <DiagnosisFlow />}
      {mode === 'compare' && <PlanComparison />}
      {mode === 'benefits' && <BenefitsList />}
    </PageLayout>
  );
}

function DiagnosisFlow() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState('q1');
  const [result, setResult] = useState<InsurancePlan[] | null>(null);

  const question = diagnosisQuestions.find((q) => q.id === currentQ);

  const handleAnswer = (optionValue: string, next?: string) => {
    const newAnswers = { ...answers, [currentQ]: optionValue };
    setAnswers(newAnswers);

    if (next) {
      setCurrentQ(next);
    } else {
      const plans = getRecommendedPlans(newAnswers);
      setResult(plans);
    }
  };

  const reset = () => {
    setAnswers({});
    setCurrentQ('q1');
    setResult(null);
  };

  if (result) {
    return (
      <div>
        <div className="glass-card-strong rounded-2xl p-6 sm:p-8 mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                <path d="M7 10l3 3 5-6" />
                <circle cx="10" cy="10" r="8" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-charcoal">おすすめプラン</h2>
              <p className="text-xs text-charcoal/40">あなたに合ったプランをご提案します</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.map((plan, i) => (
              <div
                key={plan.id}
                className={`rounded-xl border p-5 ${
                  i === 0
                    ? 'border-accent/20 bg-accent/[0.03]'
                    : 'border-gray-100 bg-white/50'
                }`}
              >
                {i === 0 && (
                  <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    おすすめ
                  </span>
                )}
                <h3 className="text-xl font-bold text-charcoal mt-2">{plan.name}</h3>
                <p className="text-2xl font-bold text-accent mt-2">
                  {plan.monthlyPremium.toLocaleString()}
                  <span className="text-sm font-normal text-charcoal/40">円/月</span>
                </p>
                <div className="mt-4 space-y-2 text-xs text-charcoal/60">
                  <div className="flex justify-between">
                    <span>交通死亡</span>
                    <span className="font-medium">{plan.coverage.trafficDeath.toLocaleString()}万円</span>
                  </div>
                  <div className="flex justify-between">
                    <span>普通死亡</span>
                    <span className="font-medium">{plan.coverage.normalDeath.toLocaleString()}万円</span>
                  </div>
                  <div className="flex justify-between">
                    <span>入院日額（不慮）</span>
                    <span className="font-medium">{plan.coverage.accidentHospital.toLocaleString()}円</span>
                  </div>
                  <div className="flex justify-between">
                    <span>入院日額（普通）</span>
                    <span className="font-medium">{plan.coverage.normalHospital.toLocaleString()}円</span>
                  </div>
                </div>
                <p className="mt-3 text-[10px] text-charcoal/30">{plan.target}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={reset}
          className="text-sm text-accent/60 hover:text-accent transition-colors flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 7a5 5 0 019.3-2.5M12 7a5 5 0 01-9.3 2.5" />
            <path d="M12 2v3h-3M2 12V9h3" />
          </svg>
          もう一度診断する
        </button>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="glass-card-strong rounded-2xl p-6 sm:p-8 animate-fade-in max-w-xl">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {['q1', 'q2', 'q3'].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= Object.keys(answers).length ? 'bg-accent' : 'bg-gray-100'
            }`}
          />
        ))}
      </div>

      <h2 className="text-lg font-bold text-charcoal mb-6">{question.question}</h2>

      <div className="space-y-3">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(opt.value, opt.next)}
            className="w-full text-left px-5 py-4 rounded-xl border border-gray-100 hover:border-accent/20 hover:bg-accent/[0.02] transition-all text-sm text-charcoal/70 hover:text-charcoal group"
          >
            <span className="flex items-center justify-between">
              {opt.label}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-charcoal/20 group-hover:text-accent/40 transition-colors">
                <path d="M5 3l4 4-4 4" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      {Object.keys(answers).length > 0 && (
        <button
          onClick={reset}
          className="mt-6 text-xs text-charcoal/30 hover:text-charcoal/50 transition-colors"
        >
          最初からやり直す
        </button>
      )}
    </div>
  );
}

function PlanComparison() {
  const allPlans = [...insurancePlans, ...childPlans];

  return (
    <div className="animate-fade-in-delay-1">
      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="glass-card-strong rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 font-medium text-charcoal/40 text-xs">プラン</th>
                <th className="text-right p-4 font-medium text-charcoal/40 text-xs">月額掛金</th>
                <th className="text-right p-4 font-medium text-charcoal/40 text-xs">交通死亡</th>
                <th className="text-right p-4 font-medium text-charcoal/40 text-xs">不慮死亡</th>
                <th className="text-right p-4 font-medium text-charcoal/40 text-xs">普通死亡</th>
                <th className="text-right p-4 font-medium text-charcoal/40 text-xs">交通入院/日</th>
                <th className="text-right p-4 font-medium text-charcoal/40 text-xs">不慮入院/日</th>
                <th className="text-right p-4 font-medium text-charcoal/40 text-xs">普通入院/日</th>
              </tr>
            </thead>
            <tbody>
              {allPlans.map((plan) => (
                <tr key={plan.id} className="border-b border-gray-50 hover:bg-accent/[0.02] transition-colors">
                  <td className="p-4 font-semibold text-charcoal">{plan.name}</td>
                  <td className="p-4 text-right text-accent font-medium">{plan.monthlyPremium.toLocaleString()}円</td>
                  <td className="p-4 text-right text-charcoal/60">{plan.coverage.trafficDeath.toLocaleString()}万</td>
                  <td className="p-4 text-right text-charcoal/60">{plan.coverage.accidentDeath.toLocaleString()}万</td>
                  <td className="p-4 text-right text-charcoal/60">{plan.coverage.normalDeath.toLocaleString()}万</td>
                  <td className="p-4 text-right text-charcoal/60">{plan.coverage.trafficHospital.toLocaleString()}円</td>
                  <td className="p-4 text-right text-charcoal/60">{plan.coverage.accidentHospital.toLocaleString()}円</td>
                  <td className="p-4 text-right text-charcoal/60">{plan.coverage.normalHospital.toLocaleString()}円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-4">
        {allPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      <div className="mt-6 text-xs text-charcoal/30">
        <p>共済期間は1年間です。月払い・給料天引き。家族の加入は組合員本人の加入が条件です。</p>
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: InsurancePlan }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card-strong rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-5 text-left flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-charcoal">{plan.name}</h3>
            {plan.recommended.includes('おすすめ') && (
              <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">おすすめ</span>
            )}
          </div>
          <p className="text-lg font-bold text-accent mt-1">
            {plan.monthlyPremium.toLocaleString()}
            <span className="text-xs font-normal text-charcoal/40">円/月</span>
          </p>
        </div>
        <div className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-charcoal/30">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-2 text-xs text-charcoal/60">
          <Row label="交通死亡" value={`${plan.coverage.trafficDeath.toLocaleString()}万円`} />
          <Row label="不慮死亡" value={`${plan.coverage.accidentDeath.toLocaleString()}万円`} />
          <Row label="普通死亡" value={`${plan.coverage.normalDeath.toLocaleString()}万円`} />
          <Row label="交通入院/日" value={`${plan.coverage.trafficHospital.toLocaleString()}円`} />
          <Row label="不慮入院/日" value={`${plan.coverage.accidentHospital.toLocaleString()}円`} />
          <Row label="普通入院/日" value={`${plan.coverage.normalHospital.toLocaleString()}円`} />
          <Row label="交通通院/日" value={`${plan.coverage.trafficOutpatient.toLocaleString()}円`} />
          <Row label="不慮通院/日" value={`${plan.coverage.accidentOutpatient.toLocaleString()}円`} />
          <Row label="障害保障" value={plan.coverage.disability} />
          <Row label="手術見舞金" value={plan.coverage.surgery} />
          <p className="text-charcoal/30 pt-2">{plan.target}</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-charcoal/40">{label}</span>
      <span className="font-medium text-charcoal/70">{value}</span>
    </div>
  );
}

function BenefitsList() {
  return (
    <div className="glass-card-strong rounded-2xl p-6 sm:p-8 animate-fade-in-delay-1">
      <h2 className="text-lg font-bold text-charcoal mb-1">市職労共済規程 慶弔見舞金</h2>
      <p className="text-xs text-charcoal/40 mb-6">
        事由発生日より1年以内に請求してください
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
