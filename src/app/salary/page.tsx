'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { useStaffMode, StaffModeToggle } from '@/components/StaffMode';
import KaikeiKishiwada from '@/components/KaikeiKishiwada';
import SalaryKigyodan from '@/components/SalaryKigyodan';
import { seishokuTables, simTables, getSalary, getTable, stepCount, factValue, getFact, gradeLabel } from '@/lib/facts';
import { fuyoUnitAmounts, defaultPromotionTarget, entryGrade, type VehicleKind, type PositionLevel } from '@/lib/slots/kishiwada';
import { calcJukyo } from '@/lib/formulas/jukyo';
import {
  chiikiPct,
  bonusRates,
  annualBonusMonths,
  positionOrder,
  positionLabels,
  positionKanriYen,
  getPositionAddRate,
  positionAddGaku,
  calcFuyo,
  calcChiikiMonthly,
  commuteVehicleYen,
  commuteTransitYen,
  applySeniorSalary,
  isSeniorReduced,
  raiseStep,
  raiseStopAge,
  seniorStartAge,
  bonusBaseOf,
  bonusKinbenBaseOf,
  bonusTerm,
  bonusAnnual,
} from '@/lib/salaryCalc';
import {
  YEN_PER_MAN,
  TAKEHOME_RATE,
  RETIREMENT_AGE,
  RENT_SLIDER_MAX,
  RENT_SLIDER_STEP,
  PASS_SLIDER_MAX,
  PASS_SLIDER_STEP,
  FINDER_MIN_SALARY,
  FINDER_DIFF_TOLERANCE,
} from '@/lib/ui';

/* ===================== Types ===================== */
type HousingType = 'rent' | 'own' | 'other';
type CommuteMethod = 'transit' | 'car' | 'walk';

interface PromotionPlan {
  id: number;
  yearOffset: number | '';
  targetGrade: number;
}

const commuteLabels: Record<CommuteMethod, string> = {
  transit: '交通機関',
  car: '交通用具（自動車・バイク・自転車）',
  walk: '徒歩',
};

const vehicleLabels: Record<VehicleKind, string> = {
  car: '自動車',
  bike: 'バイク',
  bicycle: '自転車',
};

const multiSimTable = simTables.length > 1;
const multiViewTable = seishokuTables.length > 1;

/* 数値欄: フォーカス時にカーソルを数値の右端へ */
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
  const onClick = () => move();
  el.addEventListener('click', onClick, { once: true });
  setTimeout(() => el.removeEventListener('click', onClick), 700);
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
        <path
          d={`${pathD} L${points[points.length - 1].x},${PAD_T + chartH} L${points[0].x},${PAD_T + chartH} Z`}
          fill="url(#areaGrad)"
          opacity="0.15"
        />
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
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

/* ===================== Section Wrapper ===================== */
function SectionCard({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-card-strong rounded-2xl p-5 sm:p-7 ${className}`}>
      {title && <h2 className="text-[16px] font-semibold text-charcoal mb-4 flex items-center gap-2">{title}</h2>}
      {children}
    </div>
  );
}

/* ===================== Main Page ===================== */
export default function SalaryPage() {
  const { mode: staffMode } = useStaffMode();

  // Basic info（岸和田は1級=最上位/最下位級=新規採用側。初期値は入口級＝最下位級）
  const [tableId, setTableId] = useState(simTables[0].id);
  const [grade, setGrade] = useState(entryGrade(simTables[0].grades));
  const [step, setStep] = useState(1);
  const [finderOpen, setFinderOpen] = useState(false);
  const [finderSalary, setFinderSalary] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [position, setPosition] = useState<PositionLevel>('ippan');

  // Dependents（配偶者は扶養手当の対象外のため子・父母等のみ）
  const [numChildren, setNumChildren] = useState<number | ''>('');
  const [numChildren16to22, setNumChildren16to22] = useState<number | ''>('');
  const [numParents, setNumParents] = useState<number | ''>('');

  // Housing
  const [housingType, setHousingType] = useState<HousingType>('rent');
  const [rent, setRent] = useState<number | ''>('');

  // Commute
  const [commuteMethod, setCommuteMethod] = useState<CommuteMethod>('transit');
  const [vehicleKind, setVehicleKind] = useState<VehicleKind>('car');
  const [commuteDistance, setCommuteDistance] = useState<number | ''>('');
  const [sixMonthPass, setSixMonthPass] = useState<number | ''>('');

  // Promotion plans
  const [promotionPlans, setPromotionPlans] = useState<PromotionPlan[]>([]);
  const [nextPlanId, setNextPlanId] = useState(1);

  // 給料表ビューア
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerTableId, setViewerTableId] = useState(seishokuTables[0].id);
  const [viewerGrade, setViewerGrade] = useState(1);
  const viewerTable = useMemo(() => getTable(viewerTableId)!, [viewerTableId]);
  const viewerSteps = useMemo(() => viewerTable.cells[String(viewerGrade)] ?? [], [viewerTable, viewerGrade]);

  // 昇給・60歳超ルール（facts）
  const raiseSteps = factValue<{ normal: number; topGrade?: number; standardMax?: number }>('raiseSteps') ?? { normal: 4 };
  const raiseDate = factValue<string>('raiseDate');
  const senior7wari = getFact<string>('senior7wari');

  const currentTable = useMemo(() => getTable(tableId)!, [tableId]);
  const maxGrades = currentTable.grades;
  const maxSteps = useMemo(() => stepCount(tableId, grade) || 1, [tableId, grade]);

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

  const handleTableChange = (id: string) => {
    setTableId(id);
    setGrade(entryGrade(getTable(id)?.grades ?? 1));
    setStep(1);
  };
  const handleGradeChange = (g: number) => {
    setGrade(g);
    setStep(1);
  };

  // Safe numeric
  const ageNum = age === '' ? 30 : age;
  const numChildrenNum = numChildren === '' ? 0 : numChildren;
  const numChildren16to22Num = numChildren16to22 === '' ? 0 : numChildren16to22;
  const numParentsNum = numParents === '' ? 0 : numParents;
  const rentNum = rent === '' ? 0 : rent;
  const commuteDistanceNum = commuteDistance === '' ? 0 : commuteDistance;
  const sixMonthPassNum = sixMonthPass === '' ? 0 : sixMonthPass;

  const dependents = {
    numChildren: numChildrenNum,
    numChildren16to22: numChildren16to22Num,
    numParents: numParentsNum,
  };

  // Calculations
  const baseSalary = getSalary(tableId, grade, step) ?? 0;
  const fuyoUnits = useMemo(() => fuyoUnitAmounts(position), [position]);
  const fuyoTeate = useMemo(() => calcFuyo(dependents, position), [position, numChildrenNum, numChildren16to22Num, numParentsNum]);
  const kanriTeate = positionKanriYen(position);
  const chiikiTeate = useMemo(() => calcChiikiMonthly(baseSalary, fuyoTeate, kanriTeate), [baseSalary, fuyoTeate, kanriTeate]);
  const jukyoTeate = useMemo(() => (housingType === 'rent' ? calcJukyo(rentNum) : 0), [housingType, rentNum]);
  const tsukinTeate = useMemo(() => {
    if (commuteMethod === 'walk') return 0;
    if (commuteMethod === 'transit') return commuteTransitYen(sixMonthPassNum);
    return commuteVehicleYen(commuteDistanceNum, vehicleKind);
  }, [commuteMethod, vehicleKind, commuteDistanceNum, sixMonthPassNum]);

  const monthlyTotal = baseSalary + kanriTeate + fuyoTeate + chiikiTeate + jukyoTeate + tsukinTeate;

  const positionAddRate = getPositionAddRate(position, ageNum);
  const positionAddAmount = positionAddGaku(baseSalary, position, ageNum);
  const bonusBase = bonusBaseOf(baseSalary, fuyoTeate, position, ageNum);
  const bonusKinbenBase = bonusKinbenBaseOf(baseSalary, fuyoTeate, position, ageNum);
  const bonusJun = bonusTerm(baseSalary, fuyoTeate, position, ageNum, 'jun');
  const bonusDec = bonusTerm(baseSalary, fuyoTeate, position, ageNum, 'dec');
  const bonusYear = bonusAnnual(baseSalary, fuyoTeate, position, ageNum);

  const annualIncome = monthlyTotal * 12 + bonusYear;
  const takeHome = Math.round(annualIncome * TAKEHOME_RATE);

  // Future simulation
  const addPromotionPlan = useCallback(() => {
    setPromotionPlans((prev) => [...prev, { id: nextPlanId, yearOffset: 5, targetGrade: defaultPromotionTarget(grade) }]);
    setNextPlanId((prev) => prev + 1);
  }, [nextPlanId, grade, maxGrades]);
  const removePromotionPlan = useCallback((id: number) => {
    setPromotionPlans((prev) => prev.filter((p) => p.id !== id));
  }, []);
  const updatePromotionPlan = useCallback((id: number, field: 'yearOffset' | 'targetGrade', value: number | '') => {
    setPromotionPlans((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }, []);

  const simulation = useMemo(() => {
    const results: { year: number; age: number; grade: number; step: number; monthlySalary: number; annualIncome: number }[] = [];
    let curGrade = grade;
    let curStep = step;
    const maxYears = RETIREMENT_AGE - ageNum;
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
      const yFuyo = calcFuyo(dependents, position);
      const yKanri = positionKanriYen(position);
      const yChiiki = calcChiikiMonthly(effSal, yFuyo, yKanri);
      const yJukyo = housingType === 'rent' ? calcJukyo(rentNum) : 0;
      const yTsukin =
        commuteMethod === 'walk' ? 0 : commuteMethod === 'transit' ? commuteTransitYen(sixMonthPassNum) : commuteVehicleYen(commuteDistanceNum, vehicleKind);
      const yMonthly = effSal + yKanri + yFuyo + yChiiki + yJukyo + yTsukin;
      const yBonus = bonusAnnual(effSal, yFuyo, position, curAge);
      const yAnnual = yMonthly * 12 + yBonus;

      results.push({ year: y, age: curAge, grade: curGrade, step: curStep, monthlySalary: effSal, annualIncome: yAnnual });

      // 最上位級（1級）または部長は昇給1号、それ以外は標準4号（満58歳超で停止）
      const slow = curGrade === 1 || position === 'buchou';
      const inc = raiseStep(curAge, slow);
      if (inc > 0 && getSalary(tableId, curGrade, curStep + inc) !== null) curStep += inc;
    }
    return results;
  }, [grade, step, ageNum, position, tableId, currentTable, promotionPlans, numChildrenNum, numChildren16to22Num, numParentsNum, housingType, rentNum, commuteMethod, vehicleKind, commuteDistanceNum, sixMonthPassNum]);

  const chartData = useMemo(() => simulation.map((s) => ({ label: `${s.age}歳`, value: s.annualIncome })), [simulation]);

  const inputCls = 'w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-2.5 min-h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all';
  const labelCls = 'block text-xs font-medium text-charcoal/70 mb-1.5';
  const sliderCls = 'slider w-full';
  const miniInputCls = 'w-20 bg-white/80 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all';

  return (
    <PageLayout title="給料シミュレーター" subtitle="給料・手当・ボーナス・年収を試算し、将来の収入推移をシミュレーションできます">
      <StaffModeToggle />

      {staffMode === 'seishoku' && (
        <>
          {/* ===== INPUT ===== */}
          <div className="space-y-6">
            {/* 基本情報 */}
            <SectionCard title="基本情報" className="animate-fade-in-delay-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {multiSimTable && (
                  <div>
                    <label className={labelCls}>職種（給料表）</label>
                    <select value={tableId} onChange={(e) => handleTableChange(e.target.value)} className={inputCls}>
                      {simTables.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className={labelCls}>現在の級</label>
                  <select value={grade} onChange={(e) => handleGradeChange(Number(e.target.value))} className={inputCls}>
                    {Array.from({ length: maxGrades }, (_, i) => i + 1).map((g) => (
                      <option key={g} value={g}>{gradeLabel(currentTable, g)}</option>
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
                    <input type="range" min={18} max={RETIREMENT_AGE} value={ageNum} onChange={(e) => setAge(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                    <input type="text" inputMode="numeric" onFocus={caretToEnd} value={age} placeholder="30" onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value.replace(/[^0-9.]/g, '')))} onBlur={(e) => { if (e.target.value !== '') setAge(Math.max(18, Math.min(RETIREMENT_AGE, Number(e.target.value.replace(/[^0-9.]/g, ''))))); }} className={miniInputCls} />
                    <span className="text-xs text-charcoal/65">歳</span>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>役職</label>
                  <select value={position} onChange={(e) => setPosition(e.target.value as PositionLevel)} className={inputCls}>
                    {positionOrder.map((p) => (
                      <option key={p} value={p}>{positionLabels[p]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 逆引き */}
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
                            <button key={`${h.grade}-${h.step}`} onClick={() => { setGrade(h.grade); setStep(h.step); setFinderOpen(false); }} className="px-3 py-2 min-h-[44px] rounded-xl bg-white border border-accent/30 text-sm font-medium text-accent hover:bg-accent hover:text-white transition-colors">
                              {gradeLabel(currentTable, h.grade)} {h.step}号（{h.sal.toLocaleString()}円）に設定
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
                    <input type="range" min={0} max={6} value={numChildrenNum} onChange={(e) => { const v = Number(e.target.value); setNumChildren(v); if (numChildren16to22Num > v) setNumChildren16to22(v); }} className={`${sliderCls} flex-1`} />
                    <input type="text" inputMode="numeric" onFocus={caretToEnd} value={numChildren} placeholder="0" onChange={(e) => { if (e.target.value === '') { setNumChildren(''); return; } const v = Math.max(0, Math.min(6, Number(e.target.value.replace(/[^0-9.]/g, '')))); setNumChildren(v); if (numChildren16to22Num > v) setNumChildren16to22(v); }} className={miniInputCls} />
                    <span className="text-xs text-charcoal/65">人</span>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>うち16〜22歳の子</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min={0} max={numChildrenNum} value={numChildren16to22Num} onChange={(e) => setNumChildren16to22(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                    <input type="text" inputMode="numeric" onFocus={caretToEnd} value={numChildren16to22} placeholder="0" onChange={(e) => setNumChildren16to22(e.target.value === '' ? '' : Number(e.target.value.replace(/[^0-9.]/g, '')))} onBlur={(e) => { if (e.target.value !== '') setNumChildren16to22(Math.max(0, Math.min(numChildrenNum, Number(e.target.value.replace(/[^0-9.]/g, ''))))); }} className={miniInputCls} />
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
                <p>現在の給料表・級に適用される扶養手当の単価：</p>
                <p className="mt-1 text-charcoal/75">
                  子 {fuyoUnits.child.toLocaleString()}円 ／ 16〜22歳の子 加算 {fuyoUnits.childAdd16to22.toLocaleString()}円 ／ 父母等 {fuyoUnits.parents.toLocaleString()}円
                </p>
                <p className="mt-1 text-charcoal/60">配偶者は扶養手当の対象外です（岸和田市職員給与条例 第15条）。父母等は1等級等の職員（部長・理事級）のとき単価が下がります（上の単価は選択中の役職を反映）。</p>
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
                {commuteMethod === 'car' && (
                  <>
                    <div>
                      <label className={labelCls}>交通用具の種類</label>
                      <select value={vehicleKind} onChange={(e) => setVehicleKind(e.target.value as VehicleKind)} className={inputCls}>
                        {(Object.entries(vehicleLabels) as [VehicleKind, string][]).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>片道距離</label>
                      <div className="flex items-center gap-2">
                        <input type="range" min={0} max={50} step={1} value={commuteDistanceNum} onChange={(e) => setCommuteDistance(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                        <input type="text" inputMode="decimal" onFocus={caretToEnd} value={commuteDistance} placeholder="10" onChange={(e) => setCommuteDistance(e.target.value === '' ? '' : Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, ''))))} className={miniInputCls} />
                        <span className="text-xs text-charcoal/65">km</span>
                      </div>
                    </div>
                  </>
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
              <p className="mt-3 text-xs text-charcoal/60">交通機関は6ヶ月定期相当額（正職員は月額上限なし）。交通用具は片道距離別の定額で、自動車・バイク・自転車で額が異なります（片道2km未満は対象外）。長距離は距離帯ごとに加算があり、支給には上限があります（手当ガイドの通勤タブに実額表を掲載）。</p>
            </SectionCard>
          </div>

          {/* ===== RESULTS ===== */}
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
            </div>

            {/* 月収内訳 */}
            <SectionCard title="月収内訳" className="animate-fade-in-delay-2">
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ['給料（基本給）', baseSalary],
                      ['管理職手当', kanriTeate],
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
              <p className="mt-2 text-xs text-charcoal/55">地域手当の基礎＝給料＋扶養手当＋管理職手当。</p>
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
                      <td className="py-3 px-3 text-charcoal/70 text-xs pl-6">給料＋扶養手当＋これらに対する地域手当（管理職手当は含めない）</td>
                      <td></td>
                    </tr>
                    <tr className="bg-gray-50/50">
                      <td className="py-3 px-3 text-charcoal/70">勤勉手当 基礎額</td>
                      <td className="py-3 px-3 text-right text-charcoal whitespace-nowrap">{bonusKinbenBase.toLocaleString()}円</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 text-charcoal/70 text-xs pl-6">給料＋扶養手当＋これらに対する地域手当（期末手当と同じ基礎・給与条例第26条第3項）</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 text-charcoal/70">
                        夏のボーナス（6月支給）
                        <span className="text-xs text-charcoal/65 ml-1 block sm:inline">期末{bonusRates.kimatsu.jun} + 勤勉{bonusRates.kinben.jun}ヶ月</span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-charcoal whitespace-nowrap">{bonusJun.toLocaleString()}円</td>
                    </tr>
                    <tr className="bg-gray-50/50">
                      <td className="py-3 px-3 text-charcoal/70">
                        冬のボーナス（12月支給）
                        <span className="text-xs text-charcoal/65 ml-1 block sm:inline">期末{bonusRates.kimatsu.dec} + 勤勉{bonusRates.kinben.dec}ヶ月</span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-charcoal whitespace-nowrap">{bonusDec.toLocaleString()}円</td>
                    </tr>
                    <tr className="border-t-2 border-accent/20 bg-accent/5">
                      <td className="py-3 px-3 font-semibold text-charcoal">年間合計（約{annualBonusMonths}ヶ月）</td>
                      <td className="py-3 px-3 text-right font-bold text-accent text-lg whitespace-nowrap">{bonusYear.toLocaleString()}円</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-charcoal/55">勤勉手当は「支給総額の上限率」ベース。実支給は人事評価（成績率）で変動します。</p>
              {positionAddRate > 0 && (
                <div className="mt-3 rounded-xl bg-gray-50/80 px-4 py-3">
                  <p className="text-xs font-semibold text-charcoal/70">役職加算（期末・勤勉手当の基礎額に加算）</p>
                  <p className="mt-1 text-xs text-charcoal/60 leading-relaxed">
                    加算＝（給料月額＋その地域手当）× 役職加算率。{positionLabels[position]}の加算率は
                    <span className="font-bold text-accent"> {(positionAddRate * 100).toFixed(0)}%</span>、1期あたりの加算額は約{positionAddAmount.toLocaleString()}円です（給与条例第25条第6項・規則別表第2）。
                  </p>
                </div>
              )}
            </SectionCard>
          </div>

          {/* ===== FUTURE SIMULATION ===== */}
          <div className="mt-10 space-y-6">
            <h2 className="text-xl font-bold text-charcoal tracking-tight animate-fade-in">将来シミュレーション</h2>

            <SectionCard title="昇給と60歳超のルール" className="animate-fade-in">
              <ul className="text-sm text-charcoal/80 space-y-1.5 leading-relaxed">
                <li>・昇給は原則 年 +{raiseSteps.normal}号（{raiseDate}）。最上位級（1級）は{raiseSteps.topGrade}号です。</li>
                <li>・満{raiseStopAge}歳を超えて在職する職員は昇給が停止します（医師・歯科医師は60歳）。</li>
                {senior7wari && <li>・{senior7wari.value}</li>}
              </ul>
              <p className="mt-2 text-xs text-charcoal/60 leading-relaxed">適用除外：臨時的任用・任期付・非常勤職員、定年延長により勤務する職員など</p>
            </SectionCard>

            <SectionCard title="昇格プラン設定" className="animate-fade-in-delay-1">
              <div className="space-y-3">
                {promotionPlans.map((plan) => (
                  <div key={plan.id} className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <input type="text" inputMode="numeric" onFocus={caretToEnd} value={plan.yearOffset} onChange={(e) => updatePromotionPlan(plan.id, 'yearOffset', e.target.value === '' ? '' : Number(e.target.value.replace(/[^0-9]/g, '')))} onBlur={(e) => updatePromotionPlan(plan.id, 'yearOffset', e.target.value === '' ? 1 : Math.max(1, Math.min(35, Number(e.target.value))))} className="w-20 bg-white/80 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-accent/20" />
                      <span className="text-sm text-charcoal/60">年後に</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={plan.targetGrade} onChange={(e) => updatePromotionPlan(plan.id, 'targetGrade', Number(e.target.value))} className="w-28 bg-white/80 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20">
                        {Array.from({ length: maxGrades }, (_, i) => i + 1).map((g) => (
                          <option key={g} value={g}>{gradeLabel(currentTable, g)}</option>
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
                <p>・通常は毎年 +{raiseSteps.normal}号の昇給（1月1日）。最上位級は{raiseSteps.topGrade}号</p>
                <p>・満{raiseStopAge}歳を超えて在職する職員は昇給が停止します</p>
                <p>・60歳に達した日後の最初の4月1日以後は、給料月額が7割（百円単位に丸め）に</p>
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
                        const isRaiseStop = row.age > raiseStopAge && !is7wari;
                        return (
                          <tr key={i} className={`border-b border-gray-100 ${isPromo ? 'bg-accent/10' : is7wari ? 'bg-amber-50' : isRaiseStop ? 'bg-orange-50/50' : i % 2 === 0 ? 'bg-gray-50/30' : ''}`}>
                            <td className="hidden sm:table-cell py-2 px-2 text-charcoal/60">{row.year === 0 ? '現在' : `+${row.year}年`}</td>
                            <td className="py-2 px-2 text-charcoal/70 font-medium">
                              {row.age}歳
                              {isPromo && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-medium">昇格</span>}
                              {is7wari && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800 font-medium">7割</span>}
                              {isRaiseStop && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-orange-200 text-orange-800 font-medium">昇給停止</span>}
                            </td>
                            <td className="hidden sm:table-cell py-2 px-2 text-charcoal/70">{gradeLabel(currentTable, row.grade)}</td>
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
              <button
                onClick={() => setViewerOpen(!viewerOpen)}
                className="w-full min-h-[44px] flex items-center justify-between px-1 py-2 text-left"
                aria-expanded={viewerOpen}
              >
                <span className="text-sm font-semibold text-charcoal">給料表（号給ごとの給料月額）を表示</span>
                <span className="text-accent text-sm">{viewerOpen ? '閉じる ▲' : '開く ▼'}</span>
              </button>
              {viewerOpen && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {multiViewTable && (
                      <div>
                        <label className={labelCls}>給料表</label>
                        <select value={viewerTableId} onChange={(e) => { setViewerTableId(e.target.value); setViewerGrade(1); }} className={inputCls}>
                          {seishokuTables.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className={labelCls}>級</label>
                      <select value={viewerGrade} onChange={(e) => setViewerGrade(Number(e.target.value))} className={inputCls}>
                        {Array.from({ length: viewerTable.grades }, (_, i) => i + 1).map((g) => (
                          <option key={g} value={g}>{gradeLabel(viewerTable, g)}</option>
                        ))}
                      </select>
                    </div>
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
                  <p className="text-xs text-charcoal/55">{viewerTable.name}（{viewerTable.provenance.tableLabel}）・全{viewerSteps.length}号給。1級が最上位・級番号が大きいほど下位（新規採用は最下位級）。金額は岸和田市職員給与条例の別表から表示しています。</p>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Info box */}
          <div className="mt-8 glass-card rounded-xl p-5 animate-fade-in-delay-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent"><circle cx="6" cy="6" r="5" /><path d="M6 4v3M6 8.5v.01" /></svg>
              </div>
              <div className="text-xs text-charcoal/65 leading-relaxed">
                <p>このシミュレーターは参考値を表示するものです。特殊勤務手当・退職手当等は含まれていません。実際の給与は昇給・昇格の時期、人事評価、条例改正等により異なります。</p>
                <p className="mt-2 text-charcoal/60">※ 手取り概算は税・社会保険料を約21%として計算した概算値です。実際の控除額は家族構成・各種控除により異なります。</p>
                <p className="mt-1 text-charcoal/60">※ 金額・率・号給は岸和田市の給与条例・施行規則の実データ（通勤手当等の一部は組合員手帳別冊）から計算しています。</p>
              </div>
            </div>
          </div>
        </>
      )}

      {staffMode === 'sonota' && <KaikeiKishiwada />}

      {staffMode === 'kigyodan' && <SalaryKigyodan />}
    </PageLayout>
  );
}
