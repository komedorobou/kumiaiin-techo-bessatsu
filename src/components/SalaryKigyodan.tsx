'use client';

/**
 * SalaryKigyodan.tsx — 大阪広域水道企業団モードの給料シミュレーター。
 * 岸和田市の条例ロジック（src/lib/salaryCalc・slots/kishiwada）は一切使わない完全分離。
 * 数値はすべて src/lib/kigyodan/* 経由（このファイルにベタ書きしない：check_hardcode対象）。
 */
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { kigyoTable, getSalary, getTable, stepCount, factValue, getFact, gradeLabel } from '@/lib/kigyodan/facts';
import { defaultPromotionTarget, ENTRY_GRADE, fuyoUnitAmounts, calcFuyo, kanriTiers, kanriYenById } from '@/lib/kigyodan/slots';
import { calcJukyo } from '@/lib/kigyodan/jukyo';
import {
  chiikiPct,
  annualBonusMonths,
  bonusRatesForGrade,
  specialManagerGrade,
  calcChiikiMonthly,
  calcChiikiForBonus,
  bonusBaseOf,
  bonusKinbenBaseOf,
  bonusTerm,
  bonusAnnual,
  applySeniorSalary,
  applySeniorKanri,
  isSeniorReduced,
  raiseStep,
  raiseHalfAge,
  raiseNormalStep,
  raiseHalfStep,
  seniorStartAge,
  seniorRatePct,
  teinenAge,
} from '@/lib/kigyodan/salaryCalc';
import {
  YEN_PER_MAN,
  TAKEHOME_RATE,
  RENT_SLIDER_MAX,
  RENT_SLIDER_STEP,
  PASS_SLIDER_MAX,
  PASS_SLIDER_STEP,
  FINDER_MIN_SALARY,
  FINDER_DIFF_TOLERANCE,
} from '@/lib/ui';
import { commuteVehicleYen, commuteTransitYen } from '@/lib/kigyodan/slots';

type HousingType = 'rent' | 'own' | 'other';
type CommuteMethod = 'transit' | 'vehicle' | 'walk';

interface PromotionPlan {
  id: number;
  yearOffset: number | '';
  targetGrade: number;
}

const commuteLabels: Record<CommuteMethod, string> = {
  transit: '交通機関',
  vehicle: '自転車等（片道距離別）',
  walk: '徒歩',
};

function caretToEnd(e: React.FocusEvent<HTMLInputElement>) {
  const el = e.target;
  const move = () => {
    try {
      const len = el.value.length;
      el.setSelectionRange(len, len);
    } catch {
      /* noop */
    }
  };
  move();
  requestAnimationFrame(move);
  setTimeout(move, 50);
}

/* ===================== SVG Chart ===================== */
function LineChart({ data }: { data: { label: string; value: number }[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredW, setMeasuredW] = useState(800);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setMeasuredW(Math.max(300, el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  if (data.length < 2) return null;
  const W = measuredW;
  const H = 300;
  const PAD_L = W < 500 ? 48 : 70;
  const PAD_R = W < 500 ? 12 : 20;
  const PAD_T = 20;
  const PAD_B = 50;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values);
  const minVal = 0;
  const range = maxVal - minVal || 1;
  const points = data.map((d, i) => {
    const x = PAD_L + (i / (data.length - 1)) * chartW;
    const y = PAD_T + chartH - ((d.value - minVal) / range) * chartH;
    return { x, y, ...d };
  });
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => minVal + (range / yTicks) * i);
  const maxLabels = Math.max(4, Math.floor(W / 80));
  const labelInterval = Math.max(1, Math.ceil(data.length / maxLabels));
  return (
    <div ref={containerRef}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {yTickValues.map((v, i) => {
          const y = PAD_T + chartH - ((v - minVal) / range) * chartH;
          return (
            <g key={i}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#e5e5e5" strokeWidth="1" />
              <text x={PAD_L - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#999">
                {Math.round(v / YEN_PER_MAN)}
              </text>
            </g>
          );
        })}
        <text x={12} y={PAD_T + chartH / 2} textAnchor="middle" fontSize="10" fill="#999" transform={`rotate(-90, 12, ${PAD_T + chartH / 2})`}>
          万円
        </text>
        <path d={pathD} fill="none" stroke="#1B4D4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`${pathD} L${points[points.length - 1].x},${PAD_T + chartH} L${points[0].x},${PAD_T + chartH} Z`} fill="url(#areaGradK)" opacity="0.15" />
        <defs>
          <linearGradient id="areaGradK" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B4D4F" />
            <stop offset="100%" stopColor="#1B4D4F" stopOpacity="0" />
          </linearGradient>
        </defs>
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="#1B4D4F" stroke="white" strokeWidth="1.5" />
            {i % labelInterval === 0 && (
              <text x={p.x} y={H - PAD_B + 18} textAnchor="middle" fontSize="10" fill="#666">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function SectionCard({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-card-strong rounded-2xl p-5 sm:p-7 ${className}`}>
      {title && <h2 className="text-[16px] font-semibold text-charcoal mb-4 flex items-center gap-2">{title}</h2>}
      {children}
    </div>
  );
}

export default function SalaryKigyodan() {
  const tableId = kigyoTable.id;
  const maxGrades = kigyoTable.grades;

  const [grade, setGrade] = useState(ENTRY_GRADE);
  const [step, setStep] = useState(1);
  const [kanriId, setKanriId] = useState('');
  const [age, setAge] = useState<number | ''>('');

  const [finderOpen, setFinderOpen] = useState(false);
  const [finderSalary, setFinderSalary] = useState<number | ''>('');

  const [numChildren, setNumChildren] = useState<number | ''>('');
  const [numChildren15to22, setNumChildren15to22] = useState<number | ''>('');
  const [numParents, setNumParents] = useState<number | ''>('');

  const [housingType, setHousingType] = useState<HousingType>('rent');
  const [rent, setRent] = useState<number | ''>('');

  const [commuteMethod, setCommuteMethod] = useState<CommuteMethod>('transit');
  const [commuteDistance, setCommuteDistance] = useState<number | ''>('');
  const [sixMonthPass, setSixMonthPass] = useState<number | ''>('');

  const [promotionPlans, setPromotionPlans] = useState<PromotionPlan[]>([]);
  const [nextPlanId, setNextPlanId] = useState(1);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerGrade, setViewerGrade] = useState(1);
  const viewerSteps = useMemo(() => kigyoTable.cells[String(viewerGrade)] ?? [], [viewerGrade]);

  const currentTable = getTable(tableId)!;
  const maxSteps = useMemo(() => stepCount(tableId, grade) || 1, [tableId, grade]);

  // 管理職手当区分（選択中の級で選べる区分のみ）
  const gradeTiers = useMemo(() => kanriTiers().filter((t) => t.grade === gradeLabel(grade)), [grade]);
  const raiseInfo = getFact<{ normal: number; over55: number }>('raiseSteps');
  const raiseDate = factValue<string>('raiseDate');
  const senior7wari = getFact<string>('senior7wari');

  const finderResults = useMemo(() => {
    if (finderSalary === '' || finderSalary < FINDER_MIN_SALARY) return [];
    const hits: { grade: number; step: number; sal: number; diff: number }[] = [];
    for (const [g, arr] of Object.entries(currentTable.cells)) {
      (arr as number[]).forEach((sal, idx) => {
        const diff = Math.abs(sal - finderSalary);
        if (diff <= FINDER_DIFF_TOLERANCE) hits.push({ grade: Number(g), step: idx + 1, sal, diff });
      });
    }
    hits.sort((a, b) => a.diff - b.diff || a.grade - b.grade);
    const exact = hits.filter((h) => h.diff === 0);
    return exact.length > 0 ? exact : hits.slice(0, 4);
  }, [finderSalary, currentTable]);

  const handleGradeChange = (g: number) => {
    setGrade(g);
    setStep(1);
    setKanriId('');
  };

  const ageNum = age === '' ? 30 : age;
  const numChildrenNum = numChildren === '' ? 0 : numChildren;
  const numChildren15to22Num = numChildren15to22 === '' ? 0 : numChildren15to22;
  const numParentsNum = numParents === '' ? 0 : numParents;
  const rentNum = rent === '' ? 0 : rent;
  const commuteDistanceNum = commuteDistance === '' ? 0 : commuteDistance;
  const sixMonthPassNum = sixMonthPass === '' ? 0 : sixMonthPass;

  const dependents = { numChildren: numChildrenNum, numChildren15to22: numChildren15to22Num, numParents: numParentsNum };

  const fuyoUnits = useMemo(() => fuyoUnitAmounts(grade), [grade]);
  const rawSalary = getSalary(tableId, grade, step) ?? 0;
  const rawKanri = kanriYenById(kanriId);

  // 60歳超（満61歳以後）は給料・管理職手当ともに70%
  const baseSalary = applySeniorSalary(rawSalary, ageNum);
  const kanriTeate = applySeniorKanri(rawKanri, ageNum);
  const reduced = isSeniorReduced(ageNum);

  const fuyoTeate = useMemo(() => calcFuyo(dependents, grade), [grade, numChildrenNum, numChildren15to22Num, numParentsNum]);
  const chiikiTeate = useMemo(() => calcChiikiMonthly(baseSalary, fuyoTeate, kanriTeate), [baseSalary, fuyoTeate, kanriTeate]);
  const jukyoTeate = useMemo(() => (housingType === 'rent' ? calcJukyo(rentNum) : 0), [housingType, rentNum]);
  const tsukinTeate = useMemo(() => {
    if (commuteMethod === 'walk') return 0;
    if (commuteMethod === 'transit') return commuteTransitYen(sixMonthPassNum);
    return commuteVehicleYen(commuteDistanceNum);
  }, [commuteMethod, commuteDistanceNum, sixMonthPassNum]);

  const monthlyTotal = baseSalary + kanriTeate + fuyoTeate + chiikiTeate + jukyoTeate + tsukinTeate;

  const rates = bonusRatesForGrade(grade);
  const bonusBase = bonusBaseOf(baseSalary, fuyoTeate);
  const bonusKinbenBase = bonusKinbenBaseOf(baseSalary);
  const bonusTermAmt = bonusTerm(baseSalary, fuyoTeate, grade);
  const bonusYear = bonusAnnual(baseSalary, fuyoTeate, grade);

  const annualIncome = monthlyTotal * 12 + bonusYear;
  const takeHome = Math.round(annualIncome * TAKEHOME_RATE);

  const addPromotionPlan = useCallback(() => {
    setPromotionPlans((prev) => [...prev, { id: nextPlanId, yearOffset: 5, targetGrade: defaultPromotionTarget(grade, maxGrades) }]);
    setNextPlanId((prev) => prev + 1);
  }, [nextPlanId, grade, maxGrades]);
  const removePromotionPlan = useCallback((id: number) => {
    setPromotionPlans((prev) => prev.filter((p) => p.id !== id));
  }, []);
  const updatePromotionPlan = useCallback((id: number, field: 'yearOffset' | 'targetGrade', value: number | '') => {
    setPromotionPlans((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }, []);

  const simulation = useMemo(() => {
    const results: { year: number; age: number; grade: number; step: number; monthlySalary: number; annualIncome: number; kanri: number }[] = [];
    let curGrade = grade;
    let curStep = step;
    const maxYears = teinenAge - ageNum;
    if (maxYears <= 0) return results;
    const sortedPlans = [...promotionPlans].sort((a, b) => (a.yearOffset === '' ? 0 : a.yearOffset) - (b.yearOffset === '' ? 0 : b.yearOffset));

    for (let y = 0; y <= maxYears; y++) {
      const curAge = ageNum + y;
      const promo = sortedPlans.find((p) => p.yearOffset === y);
      if (promo && y > 0) {
        const currentSal = getSalary(tableId, curGrade, curStep) ?? 0;
        const col = currentTable.cells[String(promo.targetGrade)];
        if (col) {
          let bestStep = 1;
          let bestDiff = Infinity;
          col.forEach((sal, idx) => {
            const diff = Math.abs(sal - currentSal);
            if (diff < bestDiff) {
              bestDiff = diff;
              bestStep = idx + 1;
            }
          });
          curGrade = promo.targetGrade;
          curStep = bestStep;
        }
      }

      const rawSal = getSalary(tableId, curGrade, curStep) ?? 0;
      const effSal = applySeniorSalary(rawSal, curAge);
      // 管理職手当は級が変われば選択区分が無効化されるため、選択級と一致する場合のみ継続適用
      const yRawKanri = curGrade === grade ? rawKanri : 0;
      const yKanri = applySeniorKanri(yRawKanri, curAge);
      const yFuyo = calcFuyo(dependents, curGrade);
      const yChiiki = calcChiikiMonthly(effSal, yFuyo, yKanri);
      const yJukyo = housingType === 'rent' ? calcJukyo(rentNum) : 0;
      const yTsukin = commuteMethod === 'walk' ? 0 : commuteMethod === 'transit' ? commuteTransitYen(sixMonthPassNum) : commuteVehicleYen(commuteDistanceNum);
      const yMonthly = effSal + yKanri + yFuyo + yChiiki + yJukyo + yTsukin;
      const yBonus = bonusAnnual(effSal, yFuyo, curGrade);
      const yAnnual = yMonthly * 12 + yBonus;

      results.push({ year: y, age: curAge, grade: curGrade, step: curStep, monthlySalary: effSal, annualIncome: yAnnual, kanri: yKanri });

      const inc = raiseStep(curAge);
      if (inc > 0 && getSalary(tableId, curGrade, curStep + inc) !== null) curStep += inc;
    }
    return results;
  }, [grade, step, ageNum, tableId, currentTable, promotionPlans, rawKanri, numChildrenNum, numChildren15to22Num, numParentsNum, housingType, rentNum, commuteMethod, commuteDistanceNum, sixMonthPassNum]);

  const chartData = useMemo(() => simulation.map((s) => ({ label: `${s.age}歳`, value: s.annualIncome })), [simulation]);

  const inputCls = 'w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-2.5 min-h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all';
  const labelCls = 'block text-xs font-medium text-charcoal/70 mb-1.5';
  const sliderCls = 'slider w-full';
  const miniInputCls = 'w-20 bg-white/80 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all';

  return (
    <>
      <div className="mb-6 rounded-xl bg-accent/5 border border-accent/15 px-4 py-3">
        <p className="text-xs font-semibold text-accent">大阪広域水道企業団モード</p>
        <p className="mt-1 text-xs text-charcoal/65 leading-relaxed">
          企業職給料表（{kigyoTable.grades}級・1級が最下位／級が上がるほど上位）で試算します。地域手当・扶養手当・昇給・60歳超の特例は企業団の給与規程にもとづき、岸和田市の条例とは別に計算しています。
        </p>
      </div>

      {/* 基本情報 */}
      <div className="space-y-6">
        <SectionCard title="基本情報" className="animate-fade-in-delay-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>現在の級</label>
              <select value={grade} onChange={(e) => handleGradeChange(Number(e.target.value))} className={inputCls}>
                {Array.from({ length: maxGrades }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>{gradeLabel(g)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>現在の号給</label>
              <select value={step} onChange={(e) => setStep(Number(e.target.value))} className={inputCls}>
                {Array.from({ length: maxSteps }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>{s}号</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>年齢</label>
              <div className="flex items-center gap-2">
                <input type="range" min={18} max={teinenAge} value={ageNum} onChange={(e) => setAge(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                <input type="text" inputMode="numeric" onFocus={caretToEnd} value={age} placeholder="30" onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value.replace(/[^0-9.]/g, '')))} onBlur={(e) => { if (e.target.value !== '') setAge(Math.max(18, Math.min(teinenAge, Number(e.target.value.replace(/[^0-9.]/g, ''))))); }} className={miniInputCls} />
                <span className="text-xs text-charcoal/65">歳</span>
              </div>
            </div>
            <div>
              <label className={labelCls}>管理職手当の区分</label>
              <select value={kanriId} onChange={(e) => setKanriId(e.target.value)} className={inputCls} disabled={gradeTiers.length === 0}>
                <option value="">非管理職（手当なし）</option>
                {gradeTiers.map((t) => (
                  <option key={t.id} value={t.id}>{t.tier}（{t.yen.toLocaleString()}円）</option>
                ))}
              </select>
              {gradeTiers.length === 0 && (
                <p className="mt-1 text-[11px] text-charcoal/50">この級に管理職手当の区分はありません（6級以上が対象）。管理職の方は級を選び直してください。</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <button onClick={() => setFinderOpen(!finderOpen)} className="text-xs font-medium text-accent underline underline-offset-2 min-h-[44px] inline-flex items-center">
              級・号給がわからない方はこちら
            </button>
            {finderOpen && (
              <div className="mt-1 p-4 rounded-xl bg-accent-pale/60 space-y-3">
                <p className="text-xs text-charcoal/70 leading-relaxed">給与明細の「基本給（給料月額）」の金額を入力してください。該当する級・号給を探します。</p>
                <div className="flex items-center gap-2">
                  <input type="text" inputMode="numeric" onFocus={caretToEnd} value={finderSalary} placeholder="例: 263900" onChange={(e) => setFinderSalary(e.target.value === '' ? '' : Number(e.target.value.replace(/[^0-9]/g, '')))} className="w-40 bg-white/80 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
                  <span className="text-sm text-charcoal/60">円</span>
                </div>
                {finderSalary !== '' && finderSalary >= FINDER_MIN_SALARY && finderResults.length === 0 && (
                  <p className="text-xs text-charcoal/70">この給料表に該当額が見つかりません。金額に手当が混ざっていないか確認してください。</p>
                )}
                {finderResults.length > 0 && (
                  <div className="space-y-2">
                    {finderResults.some((h) => h.diff > 0) && <p className="text-xs text-charcoal/60">ぴったり一致は無いため、近い金額の候補を出しています。</p>}
                    <div className="flex flex-wrap gap-2">
                      {finderResults.map((h) => (
                        <button key={`${h.grade}-${h.step}`} onClick={() => { setGrade(h.grade); setStep(h.step); setKanriId(''); setFinderOpen(false); }} className="px-3 py-2 min-h-[44px] rounded-xl bg-white border border-accent/30 text-sm font-medium text-accent hover:bg-accent hover:text-white transition-colors">
                          {gradeLabel(h.grade)} {h.step}号（{h.sal.toLocaleString()}円）に設定
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </SectionCard>

        {/* 扶養家族 */}
        <SectionCard title="扶養家族" className="animate-fade-in-delay-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>子の人数</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={6} value={numChildrenNum} onChange={(e) => { const v = Number(e.target.value); setNumChildren(v); if (numChildren15to22Num > v) setNumChildren15to22(v); }} className={`${sliderCls} flex-1`} />
                <input type="text" inputMode="numeric" onFocus={caretToEnd} value={numChildren} placeholder="0" onChange={(e) => { if (e.target.value === '') { setNumChildren(''); return; } const v = Math.max(0, Math.min(6, Number(e.target.value.replace(/[^0-9.]/g, '')))); setNumChildren(v); if (numChildren15to22Num > v) setNumChildren15to22(v); }} className={miniInputCls} />
                <span className="text-xs text-charcoal/65">人</span>
              </div>
            </div>
            <div>
              <label className={labelCls}>うち15〜22歳の子</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={numChildrenNum} value={numChildren15to22Num} onChange={(e) => setNumChildren15to22(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                <input type="text" inputMode="numeric" onFocus={caretToEnd} value={numChildren15to22} placeholder="0" onChange={(e) => setNumChildren15to22(e.target.value === '' ? '' : Number(e.target.value.replace(/[^0-9.]/g, '')))} onBlur={(e) => { if (e.target.value !== '') setNumChildren15to22(Math.max(0, Math.min(numChildrenNum, Number(e.target.value.replace(/[^0-9.]/g, ''))))); }} className={miniInputCls} />
                <span className="text-xs text-charcoal/65">人</span>
              </div>
            </div>
            <div>
              <label className={labelCls}>父母等の人数</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={4} value={numParentsNum} onChange={(e) => setNumParents(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                <input type="text" inputMode="numeric" onFocus={caretToEnd} value={numParents} placeholder="0" onChange={(e) => setNumParents(e.target.value === '' ? '' : Math.max(0, Math.min(4, Number(e.target.value.replace(/[^0-9.]/g, '')))))} className={miniInputCls} />
                <span className="text-xs text-charcoal/65">人</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-charcoal/65 leading-relaxed">
            <p>現在の級（{gradeLabel(grade)}）に適用される扶養手当の単価：</p>
            <p className="mt-1 text-charcoal/75">
              子 {fuyoUnits.child.toLocaleString()}円 ／ 15〜22歳の子 加算 {fuyoUnits.childAdd15to22.toLocaleString()}円 ／ 父母等 {fuyoUnits.parentsUnsupported ? '不支給' : `${fuyoUnits.parents.toLocaleString()}円`}
            </p>
            <p className="mt-1 text-charcoal/60">配偶者は扶養手当の対象外です。父母等は8級で単価が下がり、9級以上は不支給です（給与に関する規程 第41条）。</p>
          </div>
        </SectionCard>

        {/* 住居 */}
        <SectionCard title="住居" className="animate-fade-in-delay-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>住居区分</label>
              <div className="flex items-center gap-2 min-h-[44px]">
                {([['rent', '賃貸'], ['own', '持家'], ['other', 'その他']] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setHousingType(val)} className={`px-4 py-2 min-h-[44px] inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all ${housingType === val ? 'bg-accent text-white shadow-md' : 'bg-white/60 text-charcoal/70 border border-gray-200 hover:border-accent/30'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {housingType === 'rent' && (
              <div>
                <label className={labelCls}>家賃額（月額）</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={RENT_SLIDER_MAX} step={RENT_SLIDER_STEP} value={rentNum} onChange={(e) => setRent(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                  <input type="text" inputMode="numeric" onFocus={caretToEnd} value={rent} placeholder="55000" onChange={(e) => setRent(e.target.value === '' ? '' : Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, ''))))} className={miniInputCls} />
                  <span className="text-xs text-charcoal/65">円</span>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* 通勤 */}
        <SectionCard title="通勤" className="animate-fade-in-delay-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>通勤方法</label>
              <select value={commuteMethod} onChange={(e) => setCommuteMethod(e.target.value as CommuteMethod)} className={inputCls}>
                {Object.entries(commuteLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            {commuteMethod === 'vehicle' && (
              <div>
                <label className={labelCls}>片道距離</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={50} step={1} value={commuteDistanceNum} onChange={(e) => setCommuteDistance(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                  <input type="text" inputMode="decimal" onFocus={caretToEnd} value={commuteDistance} placeholder="10" onChange={(e) => setCommuteDistance(e.target.value === '' ? '' : Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, ''))))} className={miniInputCls} />
                  <span className="text-xs text-charcoal/65">km</span>
                </div>
              </div>
            )}
            {commuteMethod === 'transit' && (
              <div>
                <label className={labelCls}>6ヶ月定期代</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={PASS_SLIDER_MAX} step={PASS_SLIDER_STEP} value={sixMonthPassNum} onChange={(e) => setSixMonthPass(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                  <input type="text" inputMode="numeric" onFocus={caretToEnd} value={sixMonthPass} placeholder="60000" onChange={(e) => setSixMonthPass(e.target.value === '' ? '' : Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, ''))))} className={miniInputCls} />
                  <span className="text-xs text-charcoal/65">円</span>
                </div>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-charcoal/60">交通機関は運賃相当額（6ヶ月定期相当）で月額上限があります。自転車等は片道距離別の定額で、片道2km未満は対象外です（手当ガイドの通勤タブに実額表を掲載）。</p>
        </SectionCard>
      </div>

      {/* 試算結果 */}
      <div className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-charcoal tracking-tight animate-fade-in">試算結果</h2>
        <div className="glass-card-strong rounded-2xl p-6 sm:p-8 animate-fade-in-delay-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-1">
              <p className="text-xs font-medium text-charcoal/65 mb-1">年収（税・社保控除前）</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl sm:text-5xl font-bold text-accent tracking-tight">{Math.round(annualIncome / YEN_PER_MAN).toLocaleString()}</span>
                <span className="text-sm text-charcoal/65">万円</span>
              </div>
              <p className="text-xs text-charcoal/60 mt-1">（{annualIncome.toLocaleString()}円）</p>
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal/65 mb-1">概算手取り年収</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">{Math.round(takeHome / YEN_PER_MAN).toLocaleString()}</span>
                <span className="text-sm text-charcoal/65">万円</span>
              </div>
              <p className="text-xs text-charcoal/60 mt-1">（税・社保 約21%控除の概算）</p>
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal/65 mb-1">月収合計</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">{monthlyTotal.toLocaleString()}</span>
                <span className="text-sm text-charcoal/65">円</span>
              </div>
            </div>
          </div>
          {reduced && (
            <p className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              満{seniorStartAge}歳以後のため、給料月額・管理職手当を{seniorRatePct}%（7割）で計算しています。
            </p>
          )}
        </div>

        {/* 月収内訳 */}
        <SectionCard title="月収内訳" className="animate-fade-in-delay-2">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <tbody>
                {[
                  [reduced ? '給料（基本給・7割適用後）' : '給料（基本給）', baseSalary],
                  [reduced ? '管理職手当（7割適用後）' : '管理職手当', kanriTeate],
                  ['扶養手当', fuyoTeate],
                  [`地域手当（${chiikiPct}%）`, chiikiTeate],
                  ['住居手当', jukyoTeate],
                  ['通勤手当', tsukinTeate],
                ].map(([label, val], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                    <td className="py-3 px-3 text-charcoal/70">{label as string}</td>
                    <td className="py-3 px-3 text-right font-semibold text-charcoal whitespace-nowrap">{(val as number).toLocaleString()}円</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-accent/20 bg-accent/5">
                  <td className="py-3 px-3 font-semibold text-charcoal">月収合計</td>
                  <td className="py-3 px-3 text-right font-bold text-accent text-lg whitespace-nowrap">{monthlyTotal.toLocaleString()}円</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-charcoal/55">地域手当の基礎＝給料＋管理職手当＋扶養手当。</p>
        </SectionCard>

        {/* ボーナス */}
        <SectionCard title="ボーナス（期末・勤勉手当）" className="animate-fade-in-delay-3">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <tbody>
                <tr className="bg-gray-50/50">
                  <td className="py-3 px-3 text-charcoal/70">期末手当 基礎額</td>
                  <td className="py-3 px-3 text-right text-charcoal whitespace-nowrap">{bonusBase.toLocaleString()}円</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-charcoal/70 text-xs pl-6">給料＋扶養手当＋これらに対する地域手当</td>
                  <td></td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="py-3 px-3 text-charcoal/70">勤勉手当 基礎額</td>
                  <td className="py-3 px-3 text-right text-charcoal whitespace-nowrap">{bonusKinbenBase.toLocaleString()}円</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-charcoal/70 text-xs pl-6">給料＋その地域手当（扶養手当は含めない・給与規程 第55条）</td>
                  <td></td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-charcoal/70">
                    夏のボーナス（6月支給）
                    <span className="text-xs text-charcoal/65 ml-1 block sm:inline">期末{rates.kimatsu} + 勤勉{rates.kinben}ヶ月</span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-charcoal whitespace-nowrap">{bonusTermAmt.toLocaleString()}円</td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="py-3 px-3 text-charcoal/70">
                    冬のボーナス（12月支給）
                    <span className="text-xs text-charcoal/65 ml-1 block sm:inline">期末{rates.kimatsu} + 勤勉{rates.kinben}ヶ月</span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-charcoal whitespace-nowrap">{bonusTermAmt.toLocaleString()}円</td>
                </tr>
                <tr className="border-t-2 border-accent/20 bg-accent/5">
                  <td className="py-3 px-3 font-semibold text-charcoal">年間合計（約{annualBonusMonths}ヶ月）</td>
                  <td className="py-3 px-3 text-right font-bold text-accent text-lg whitespace-nowrap">{bonusYear.toLocaleString()}円</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-charcoal/55">
            勤勉手当は「支給総額の上限率」ベース。実支給は人事評価（成績率）で変動します。
            {rates.special && `　${specialManagerGrade}級以上（特定管理職員）は期末と勤勉の率が入れ替わります。`}
          </p>
        </SectionCard>
      </div>

      {/* 将来シミュレーション */}
      <div className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-charcoal tracking-tight animate-fade-in">将来シミュレーション</h2>

        <SectionCard title="昇給と60歳超のルール" className="animate-fade-in">
          <ul className="text-sm text-charcoal/80 space-y-1.5 leading-relaxed">
            <li>・昇給は原則 年 +{raiseInfo?.value?.normal ?? raiseNormalStep}号（{raiseDate}）。満{raiseHalfAge}歳以後は+{raiseHalfStep}号に半減します（55歳に達した日の属する年度末を超えて在職する職員）。</li>
            {senior7wari && <li>・{senior7wari.value}</li>}
            <li>・上記の7割は、60歳に達した日後の最初の4月1日以後に適用され、本試算の年次表では満{seniorStartAge}歳から表示します。</li>
          </ul>
          <p className="mt-2 text-xs text-charcoal/60 leading-relaxed">昇給停止年齢の明文はありません（最高号給を超えない範囲で昇給）。定年は満{teinenAge}歳です。</p>
        </SectionCard>

        <SectionCard title="昇格プラン設定" className="animate-fade-in-delay-1">
          <div className="space-y-3">
            {promotionPlans.map((plan) => (
              <div key={plan.id} className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <input type="text" inputMode="numeric" onFocus={caretToEnd} value={plan.yearOffset} onChange={(e) => updatePromotionPlan(plan.id, 'yearOffset', e.target.value === '' ? '' : Number(e.target.value.replace(/[^0-9]/g, '')))} onBlur={(e) => updatePromotionPlan(plan.id, 'yearOffset', e.target.value === '' ? 1 : Math.max(1, Math.min(40, Number(e.target.value))))} className="w-20 bg-white/80 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-accent/20" />
                  <span className="text-sm text-charcoal/60">年後に</span>
                </div>
                <div className="flex items-center gap-2">
                  <select value={plan.targetGrade} onChange={(e) => updatePromotionPlan(plan.id, 'targetGrade', Number(e.target.value))} className="w-28 bg-white/80 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20">
                    {Array.from({ length: maxGrades }, (_, i) => i + 1).map((g) => (
                      <option key={g} value={g}>{gradeLabel(g)}</option>
                    ))}
                  </select>
                  <span className="text-sm text-charcoal/60">に昇格</span>
                </div>
                <button onClick={() => removePromotionPlan(plan.id)} className="text-charcoal/60 hover:text-red-400 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center" title="削除">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>
                </button>
              </div>
            ))}
            <button onClick={addPromotionPlan} className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-accent bg-accent/5 hover:bg-accent/10 border border-accent/10 transition-all">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 1v12M1 7h12" /></svg>
              昇格プランを追加
            </button>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-gray-50/80 text-xs text-charcoal/65 space-y-1">
            <p className="font-semibold">※ 以下は標準的なモデルでの試算です（実際の昇給・昇格は人事の運用によります）</p>
            <p>・通常は毎年 +{raiseNormalStep}号の昇給（{raiseDate}）。満{raiseHalfAge}歳以後は+{raiseHalfStep}号</p>
            <p>・60歳に達した日後の最初の4月1日（本試算では{seniorStartAge}歳から表示）以後は、給料月額・管理職手当が7割（百円単位に丸め）に</p>
            <p>・昇格時は現在の給料に最も近い号給に読み替えます</p>
          </div>
        </SectionCard>

        {simulation.length > 1 && (
          <SectionCard title="年収推移グラフ" className="animate-fade-in-delay-2">
            <LineChart data={chartData} />
          </SectionCard>
        )}

        {simulation.length > 0 && (
          <SectionCard title="年次シミュレーション結果" className="animate-fade-in-delay-3">
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="hidden sm:table-cell text-left py-2 px-2 text-charcoal/65 font-medium text-xs">年</th>
                    <th className="text-left py-2 px-2 text-charcoal/65 font-medium text-xs">年齢</th>
                    <th className="hidden sm:table-cell text-left py-2 px-2 text-charcoal/65 font-medium text-xs">級</th>
                    <th className="hidden sm:table-cell text-left py-2 px-2 text-charcoal/65 font-medium text-xs">号給</th>
                    <th className="text-right py-2 px-2 text-charcoal/65 font-medium text-xs">給料月額</th>
                    <th className="text-right py-2 px-2 text-charcoal/65 font-medium text-xs">年収概算</th>
                  </tr>
                </thead>
                <tbody>
                  {simulation.map((row, i) => {
                    const isPromo = promotionPlans.some((p) => p.yearOffset === row.year) && row.year > 0;
                    const is7wari = isSeniorReduced(row.age);
                    return (
                      <tr key={i} className={`border-b border-gray-100 ${isPromo ? 'bg-accent/10' : is7wari ? 'bg-amber-50' : i % 2 === 0 ? 'bg-gray-50/30' : ''}`} data-age={row.age} data-monthly={row.monthlySalary} data-kanri={row.kanri}>
                        <td className="hidden sm:table-cell py-2 px-2 text-charcoal/60">{row.year === 0 ? '現在' : `+${row.year}年`}</td>
                        <td className="py-2 px-2 text-charcoal/70 font-medium">
                          {row.age}歳
                          {isPromo && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-medium">昇格</span>}
                          {is7wari && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800 font-medium">7割</span>}
                        </td>
                        <td className="hidden sm:table-cell py-2 px-2 text-charcoal/70">{gradeLabel(row.grade)}</td>
                        <td className="hidden sm:table-cell py-2 px-2 text-charcoal/70">{row.step}号</td>
                        <td className="py-2 px-2 text-right text-charcoal font-medium whitespace-nowrap">{row.monthlySalary.toLocaleString()}円</td>
                        <td className="py-2 px-2 text-right font-semibold text-accent whitespace-nowrap">{Math.round(row.annualIncome / YEN_PER_MAN).toLocaleString()}万円</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </div>

      {/* 給料表ビューア */}
      <div className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-charcoal tracking-tight animate-fade-in">給料表を見る</h2>
        <SectionCard className="animate-fade-in-delay-1">
          <button onClick={() => setViewerOpen(!viewerOpen)} className="w-full min-h-[44px] flex items-center justify-between px-1 py-2 text-left" aria-expanded={viewerOpen}>
            <span className="text-sm font-semibold text-charcoal">企業職給料表（号給ごとの給料月額）を表示</span>
            <span className="text-accent text-sm">{viewerOpen ? '閉じる ▲' : '開く ▼'}</span>
          </button>
          {viewerOpen && (
            <div className="mt-4 space-y-4">
              <div>
                <label className={labelCls}>級</label>
                <select value={viewerGrade} onChange={(e) => setViewerGrade(Number(e.target.value))} className={inputCls}>
                  {Array.from({ length: kigyoTable.grades }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g}>{gradeLabel(g)}</option>
                  ))}
                </select>
              </div>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 tabular-nums">
                  {viewerSteps.map((sal, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-2 rounded-lg bg-gray-50/70 border border-gray-100 px-3 py-2">
                      <span className="text-xs text-charcoal/55 whitespace-nowrap">{i + 1}号</span>
                      <span className="text-sm font-semibold text-charcoal whitespace-nowrap">{sal.toLocaleString()}円</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-charcoal/55">{kigyoTable.name}・全{viewerSteps.length}号給。1級が最下位・級が上がるほど上位。金額は企業団の給与に関する規程 別表第1から表示しています。</p>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Info box + fail-visible 会計年度 note */}
      <div className="mt-8 glass-card rounded-xl p-5 animate-fade-in-delay-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent"><circle cx="6" cy="6" r="5" /><path d="M6 4v3M6 8.5v.01" /></svg>
          </div>
          <div className="text-xs text-charcoal/65 leading-relaxed">
            <p>このシミュレーターは参考値を表示するものです。特殊勤務手当・退職手当等は含まれていません。実際の給与は昇給・昇格の時期、人事評価、規程改正等により異なります。</p>
            <p className="mt-2 text-charcoal/60">※ 手取り概算は税・社会保険料を約21%として計算した概算値です。</p>
            <p className="mt-1 text-charcoal/60">※ 金額・率・号給は大阪広域水道企業団の給与規程・管理職手当規程・就業規則等の実データから計算しています（岸和田市の条例は使用していません）。</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-amber-50/70 border border-amber-200 px-4 py-3 animate-fade-in-delay-4">
        <p className="text-xs font-bold text-amber-900 mb-0.5">会計年度任用職員の方へ</p>
        <p className="text-xs text-amber-800/90 leading-relaxed">
          企業団の会計年度任用職員の給与・勤務条件を定める規程は公開例規集に掲載がありません。該当の方の試算は、導入時に企業団の内部規程を反映して対応します。
        </p>
      </div>
    </>
  );
}
