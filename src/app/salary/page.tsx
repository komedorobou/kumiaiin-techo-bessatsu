'use client';

import { useState, useMemo, useCallback } from 'react';
import PageLayout from '@/components/PageLayout';
import { salaryTables, getSalary } from '@/data/salaryData';

/* ===================== Types ===================== */
type PositionLevel = 'buchou' | 'kachou' | 'shukan' | 'tantouchou' | 'shusa' | 'shunin' | 'ippan';
type HousingType = 'rent' | 'own' | 'other';
type CommuteMethod = 'transit' | 'car' | 'bike' | 'bicycle' | 'walk';

interface PromotionPlan {
  id: number;
  yearOffset: number;
  targetGrade: number;
}

const positionLabels: Record<PositionLevel, string> = {
  buchou: '部長級',
  kachou: '課長級',
  shukan: '主幹級',
  tantouchou: '担当長級',
  shusa: '主査級',
  shunin: '主任級',
  ippan: '一般',
};

const commuteLabels: Record<CommuteMethod, string> = {
  transit: '交通機関',
  car: '自動車',
  bike: 'バイク',
  bicycle: '自転車',
  walk: '徒歩',
};

/* ===================== Commute Data ===================== */
const commuteVehicleData = [
  { min: 0, max: 4, car: 6200, bike: 3600, bicycle: 3000 },
  { min: 4, max: 6, car: 7800, bike: 4400, bicycle: 3500 },
  { min: 6, max: 8, car: 9400, bike: 5200, bicycle: 4000 },
  { min: 8, max: 10, car: 11000, bike: 6000, bicycle: 4500 },
  { min: 10, max: 12, car: 12600, bike: 6800, bicycle: 5000 },
  { min: 12, max: 14, car: 14200, bike: 7600, bicycle: 0 },
  { min: 14, max: 16, car: 15800, bike: 8400, bicycle: 0 },
  { min: 16, max: 18, car: 17400, bike: 9200, bicycle: 0 },
  { min: 18, max: 20, car: 19000, bike: 10000, bicycle: 0 },
  { min: 20, max: 25, car: 22900, bike: 12000, bicycle: 0 },
];

function getCommuteAllowanceVehicle(method: 'car' | 'bike' | 'bicycle', distanceKm: number): number {
  if (distanceKm < 2) return 0;
  // over 25km: base 22900 + 3900 per 5km, max 46300
  if (distanceKm >= 25) {
    const extra = Math.floor((distanceKm - 25) / 5) * 3900;
    const base = method === 'car' ? 22900 : method === 'bike' ? 12000 : 0;
    return Math.min(base + extra, 46300);
  }
  const row = commuteVehicleData.find(r => distanceKm >= r.min && distanceKm < r.max);
  if (!row) return 0;
  return row[method];
}

/* ===================== Calculation Helpers ===================== */

function calcFuyoTeate(
  hasSpouse: boolean,
  numChildren: number,
  numChildren16to22: number,
  numParents: number,
  position: PositionLevel,
  useR8: boolean
): number {
  let total = 0;
  if (useR8) {
    // R8 onwards: spouse 0, child 13000 (+5000 for 16-22), parents 0
    total += numChildren * 13000;
    total += numChildren16to22 * 5000;
  } else {
    // R7: spouse 3000, child 11500 (+5000 for 16-22), parents 6500/3500
    if (hasSpouse) total += 3000;
    total += numChildren * 11500;
    total += numChildren16to22 * 5000;
    if (position === 'buchou') {
      total += numParents * 3500;
    } else {
      total += numParents * 6500;
    }
  }
  return total;
}

function calcHousingAllowance(housingType: HousingType, rent: number): number {
  if (housingType !== 'rent') return 0;
  if (rent <= 16000) return 0;
  if (rent <= 27000) return rent - 16000;
  if (rent < 61000) return Math.floor((rent - 27000) / 2) + 11000;
  return 28000;
}

function calcCommuteAllowance(
  method: CommuteMethod,
  distanceKm: number,
  sixMonthPass: number
): number {
  if (method === 'walk') return 0;
  if (method === 'transit') return Math.round(sixMonthPass / 6);
  return getCommuteAllowanceVehicle(
    method as 'car' | 'bike' | 'bicycle',
    distanceKm
  );
}

function getPositionAddRate(position: PositionLevel, age: number): number {
  if (position === 'buchou') return 0.20;
  if (position === 'kachou') return 0.15;
  if (position === 'shukan') return 0.10;
  if (position === 'tantouchou' || position === 'shusa' || position === 'shunin') return 0.05;
  // ippan
  if (age >= 44) return 0.10;
  return 0;
}

/* ===================== SVG Chart ===================== */
function LineChart({ data }: { data: { label: string; value: number }[] }) {
  if (data.length < 2) return null;
  const W = 800;
  const H = 300;
  const PAD_L = 70;
  const PAD_R = 20;
  const PAD_T = 20;
  const PAD_B = 50;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = PAD_L + (i / (data.length - 1)) * chartW;
    const y = PAD_T + chartH - ((d.value - minVal) / range) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  // Y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    minVal + (range / yTicks) * i
  );

  // X-axis labels (show every N labels to avoid crowding)
  const labelInterval = Math.max(1, Math.ceil(data.length / 10));

  return (
    <div className="overflow-x-auto -mx-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[500px]" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {yTickValues.map((v, i) => {
          const y = PAD_T + chartH - ((v - minVal) / range) * chartH;
          return (
            <g key={i}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#e5e5e5" strokeWidth="1" />
              <text x={PAD_L - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#999">
                {Math.round(v / 10000)}
              </text>
            </g>
          );
        })}
        {/* Y axis label */}
        <text x={12} y={PAD_T + chartH / 2} textAnchor="middle" fontSize="10" fill="#999" transform={`rotate(-90, 12, ${PAD_T + chartH / 2})`}>
          万円
        </text>
        {/* Line */}
        <path d={pathD} fill="none" stroke="#1B4D4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Area fill */}
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
        {/* Data points and labels */}
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
function SectionCard({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass-card-strong rounded-2xl p-5 sm:p-7 ${className}`}>
      {title && (
        <h3 className="text-base font-semibold text-charcoal mb-4 flex items-center gap-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

/* ===================== Main Page ===================== */
export default function SalaryPage() {
  // Basic info
  const [tableId, setTableId] = useState('gyosei');
  const [grade, setGrade] = useState(6);
  const [step, setStep] = useState(25);
  const [age, setAge] = useState<number | ''>('');
  const [position, setPosition] = useState<PositionLevel>('ippan');

  // Dependents
  const [hasSpouse, setHasSpouse] = useState(false);
  const [numChildren, setNumChildren] = useState<number | ''>('');
  const [numChildren16to22, setNumChildren16to22] = useState<number | ''>('');
  const [numParents, setNumParents] = useState<number | ''>('');

  // Housing
  const [housingType, setHousingType] = useState<HousingType>('rent');
  const [rent, setRent] = useState<number | ''>('');

  // Commute
  const [commuteMethod, setCommuteMethod] = useState<CommuteMethod>('transit');
  const [commuteDistance, setCommuteDistance] = useState<number | ''>('');
  const [sixMonthPass, setSixMonthPass] = useState<number | ''>('');

  // Promotion plans
  const [promotionPlans, setPromotionPlans] = useState<PromotionPlan[]>([]);
  const [nextPlanId, setNextPlanId] = useState(1);

  // Use R8 rules (R8 onwards = from 2026)
  const useR8 = true; // Current date is 2026

  // Current table data
  const currentTable = useMemo(
    () => salaryTables.find((t) => t.id === tableId)!,
    [tableId]
  );

  const maxGrades = currentTable.grades;
  const maxSteps = useMemo(() => {
    const gradeData = currentTable.data[grade];
    if (!gradeData) return 1;
    return Math.max(...Object.keys(gradeData).map(Number));
  }, [currentTable, grade]);

  // Reset step/grade when table changes
  const handleTableChange = (id: string) => {
    setTableId(id);
    setGrade(1);
    setStep(1);
  };

  const handleGradeChange = (g: number) => {
    setGrade(g);
    setStep(1);
  };

  // ===================== Safe numeric values =====================
  const ageNum = age === '' ? 30 : age;
  const numChildrenNum = numChildren === '' ? 0 : numChildren;
  const numChildren16to22Num = numChildren16to22 === '' ? 0 : numChildren16to22;
  const numParentsNum = numParents === '' ? 0 : numParents;
  const rentNum = rent === '' ? 0 : rent;
  const commuteDistanceNum = commuteDistance === '' ? 0 : commuteDistance;
  const sixMonthPassNum = sixMonthPass === '' ? 0 : sixMonthPass;

  // ===================== Calculations =====================
  const baseSalary = getSalary(tableId, grade, step) ?? 0;

  const fuyoTeate = useMemo(
    () => calcFuyoTeate(hasSpouse, numChildrenNum, numChildren16to22Num, numParentsNum, position, useR8),
    [hasSpouse, numChildrenNum, numChildren16to22Num, numParentsNum, position, useR8]
  );

  const kanrishokuTeate = 0; // Placeholder - not calculated, just noted

  const chiikiTeate = useMemo(
    () => Math.floor((baseSalary + fuyoTeate + kanrishokuTeate) * 0.1),
    [baseSalary, fuyoTeate, kanrishokuTeate]
  );

  const jukyoTeate = useMemo(
    () => calcHousingAllowance(housingType, rentNum),
    [housingType, rentNum]
  );

  const tsukinTeate = useMemo(
    () => calcCommuteAllowance(commuteMethod, commuteDistanceNum, sixMonthPassNum),
    [commuteMethod, commuteDistanceNum, sixMonthPassNum]
  );

  const monthlyTotal = baseSalary + fuyoTeate + chiikiTeate + jukyoTeate + tsukinTeate;

  // Bonus calculation
  const positionAddRate = useMemo(() => getPositionAddRate(position, ageNum), [position, ageNum]);
  const yakushokuKasanGaku = useMemo(
    () => Math.floor((baseSalary + baseSalary * 0.1) * positionAddRate),
    [baseSalary, positionAddRate]
  );

  const bonusBase = baseSalary + fuyoTeate + chiikiTeate + yakushokuKasanGaku;
  const kimatsuTeate = Math.floor(bonusBase * 2.5); // 1.25 * 2
  const kinbenTeate = Math.floor(bonusBase * 2.1); // 1.05 * 2
  const bonusAnnual = kimatsuTeate + kinbenTeate;

  const annualIncome = monthlyTotal * 12 + bonusAnnual;
  const takeHome = Math.round(annualIncome * 0.79);

  // ===================== Future Simulation =====================
  const addPromotionPlan = useCallback(() => {
    setPromotionPlans(prev => [
      ...prev,
      { id: nextPlanId, yearOffset: 5, targetGrade: Math.max(1, grade - 1) },
    ]);
    setNextPlanId(prev => prev + 1);
  }, [nextPlanId, grade]);

  const removePromotionPlan = useCallback((id: number) => {
    setPromotionPlans(prev => prev.filter(p => p.id !== id));
  }, []);

  const updatePromotionPlan = useCallback((id: number, field: 'yearOffset' | 'targetGrade', value: number) => {
    setPromotionPlans(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  }, []);

  const simulation = useMemo(() => {
    const results: {
      year: number;
      age: number;
      grade: number;
      step: number;
      monthlySalary: number;
      annualIncome: number;
    }[] = [];

    let curGrade = grade;
    let curStep = step;
    const retirementAge = 65;
    const maxYears = retirementAge - ageNum;
    if (maxYears <= 0) return results;

    // Sort promotions by year
    const sortedPlans = [...promotionPlans].sort((a, b) => a.yearOffset - b.yearOffset);

    for (let y = 0; y <= Math.min(maxYears, 35); y++) {
      const curAge = ageNum + y;

      // Check for promotion this year
      const promo = sortedPlans.find(p => p.yearOffset === y);
      if (promo && y > 0) {
        // Find closest salary match in new grade
        const currentSal = getSalary(tableId, curGrade, curStep) ?? 0;
        const newGradeData = currentTable.data[promo.targetGrade];
        if (newGradeData) {
          let bestStep = 1;
          let bestDiff = Infinity;
          for (const [s, sal] of Object.entries(newGradeData)) {
            const diff = Math.abs(sal - currentSal);
            if (diff < bestDiff) {
              bestDiff = diff;
              bestStep = Number(s);
            }
          }
          curGrade = promo.targetGrade;
          curStep = bestStep;
        }
      }

      const sal = getSalary(tableId, curGrade, curStep) ?? 0;
      // Apply 61+ rule: 70% salary
      const effectiveSalary = curAge >= 61 ? Math.floor(sal * 0.7) : sal;

      // Calculate annual income for this year
      const yFuyo = calcFuyoTeate(hasSpouse, numChildrenNum, numChildren16to22Num, numParentsNum, position, true);
      const yChiiki = Math.floor((effectiveSalary + yFuyo) * 0.1);
      const yJukyo = calcHousingAllowance(housingType, rentNum);
      const yTsukin = calcCommuteAllowance(commuteMethod, commuteDistanceNum, sixMonthPassNum);
      const yMonthly = effectiveSalary + yFuyo + yChiiki + yJukyo + yTsukin;

      const yPosRate = getPositionAddRate(position, curAge);
      const yYakushoku = Math.floor((effectiveSalary + effectiveSalary * 0.1) * yPosRate);
      const yBonusBase = effectiveSalary + yFuyo + yChiiki + yYakushoku;
      const yBonus = Math.floor(yBonusBase * 2.5) + Math.floor(yBonusBase * 2.1);
      const yAnnual = yMonthly * 12 + yBonus;

      results.push({
        year: y,
        age: curAge,
        grade: curGrade,
        step: curStep,
        monthlySalary: effectiveSalary,
        annualIncome: yAnnual,
      });

      // Apply step increase for next year
      if (curAge < 58) {
        // Normal increase
        const isBuchou = position === 'buchou' || curGrade === 1;
        const stepIncrease = isBuchou ? 1 : 4;
        const nextStep = curStep + stepIncrease;
        // Check if next step exists
        if (getSalary(tableId, curGrade, nextStep) !== null) {
          curStep = nextStep;
        }
        // If at max, stay at current step
      }
      // 58+ = no more step increases
    }

    return results;
  }, [
    grade, step, ageNum, position, tableId, currentTable, promotionPlans,
    hasSpouse, numChildrenNum, numChildren16to22Num, numParentsNum,
    housingType, rentNum, commuteMethod, commuteDistanceNum, sixMonthPassNum,
  ]);

  const chartData = useMemo(
    () =>
      simulation.map(s => ({
        label: `${s.age}歳`,
        value: s.annualIncome,
      })),
    [simulation]
  );

  // ===================== Input classes =====================
  const inputCls =
    'w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all';
  const labelCls = 'block text-xs font-medium text-charcoal/50 mb-1.5';
  const sliderCls = 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1B4D4F]';
  const miniInputCls = 'w-20 bg-white/80 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all';

  return (
    <PageLayout
      title="給料シミュレーター"
      subtitle="給料・手当・ボーナス・年収を試算し、将来の収入推移をシミュレーションできます"
    >
      {/* ==================== INPUT SECTION ==================== */}
      <div className="space-y-6">
        {/* 基本情報 */}
        <SectionCard title="基本情報" className="animate-fade-in-delay-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className={labelCls}>職種</label>
              <select value={tableId} onChange={(e) => handleTableChange(e.target.value)} className={inputCls}>
                {salaryTables.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>現在の等級</label>
              <select value={grade} onChange={(e) => handleGradeChange(Number(e.target.value))} className={inputCls}>
                {Array.from({ length: maxGrades }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>{g}級</option>
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
                <input type="range" min={18} max={65} value={ageNum} onChange={(e) => setAge(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                <input type="number" min={18} max={65} value={age} placeholder="30" onChange={(e) => setAge(e.target.value === '' ? '' : Math.max(18, Math.min(65, Number(e.target.value))))} className={miniInputCls} />
                <span className="text-xs text-charcoal/40">歳</span>
              </div>
            </div>
            <div>
              <label className={labelCls}>役職</label>
              <select value={position} onChange={(e) => setPosition(e.target.value as PositionLevel)} className={inputCls}>
                {Object.entries(positionLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </SectionCard>

        {/* 扶養家族 */}
        <SectionCard title="扶養家族" className="animate-fade-in-delay-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>配偶者</label>
              <div className="flex items-center gap-3 h-[42px]">
                <button
                  onClick={() => setHasSpouse(true)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    hasSpouse
                      ? 'bg-accent text-white shadow-md'
                      : 'bg-white/60 text-charcoal/50 border border-gray-200 hover:border-accent/30'
                  }`}
                >
                  あり
                </button>
                <button
                  onClick={() => setHasSpouse(false)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    !hasSpouse
                      ? 'bg-accent text-white shadow-md'
                      : 'bg-white/60 text-charcoal/50 border border-gray-200 hover:border-accent/30'
                  }`}
                >
                  なし
                </button>
              </div>
            </div>
            <div>
              <label className={labelCls}>子の人数</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={6} value={numChildrenNum} onChange={(e) => { const v = Number(e.target.value); setNumChildren(v); if (numChildren16to22Num > v) setNumChildren16to22(v); }} className={`${sliderCls} flex-1`} />
                <input type="number" min={0} max={6} value={numChildren} placeholder="0" onChange={(e) => { if (e.target.value === '') { setNumChildren(''); return; } const v = Math.max(0, Math.min(6, Number(e.target.value))); setNumChildren(v); if (numChildren16to22Num > v) setNumChildren16to22(v); }} className={miniInputCls} />
                <span className="text-xs text-charcoal/40">人</span>
              </div>
            </div>
            <div>
              <label className={labelCls}>うち16〜22歳の子</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={numChildrenNum} value={numChildren16to22Num} onChange={(e) => setNumChildren16to22(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                <input type="number" min={0} max={numChildrenNum} value={numChildren16to22} placeholder="0" onChange={(e) => setNumChildren16to22(e.target.value === '' ? '' : Math.max(0, Math.min(numChildrenNum, Number(e.target.value))))} className={miniInputCls} />
                <span className="text-xs text-charcoal/40">人</span>
              </div>
            </div>
            <div>
              <label className={labelCls}>父母等の人数</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={4} value={numParentsNum} onChange={(e) => setNumParents(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                <input type="number" min={0} max={4} value={numParents} placeholder="0" onChange={(e) => setNumParents(e.target.value === '' ? '' : Math.max(0, Math.min(4, Number(e.target.value))))} className={miniInputCls} />
                <span className="text-xs text-charcoal/40">人</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 住居 */}
        <SectionCard title="住居" className="animate-fade-in-delay-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>住居区分</label>
              <div className="flex items-center gap-2 h-[42px]">
                {([['rent', '賃貸'], ['own', '持家'], ['other', 'その他']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setHousingType(val)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      housingType === val
                        ? 'bg-accent text-white shadow-md'
                        : 'bg-white/60 text-charcoal/50 border border-gray-200 hover:border-accent/30'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {housingType === 'rent' && (
              <div>
                <label className={labelCls}>家賃額（月額）</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={150000} step={1000} value={rentNum} onChange={(e) => setRent(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                  <input type="number" min={0} step={1000} value={rent} placeholder="55000" onChange={(e) => setRent(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className={miniInputCls} />
                  <span className="text-xs text-charcoal/40">円</span>
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
            {(commuteMethod === 'car' || commuteMethod === 'bike' || commuteMethod === 'bicycle') && (
              <div>
                <label className={labelCls}>片道距離</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={50} step={1} value={commuteDistanceNum} onChange={(e) => setCommuteDistance(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                  <input type="number" min={0} max={100} step={0.5} value={commuteDistance} placeholder="10" onChange={(e) => setCommuteDistance(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className={miniInputCls} />
                  <span className="text-xs text-charcoal/40">km</span>
                </div>
              </div>
            )}
            {commuteMethod === 'transit' && (
              <div>
                <label className={labelCls}>6ヶ月定期代</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={300000} step={1000} value={sixMonthPassNum} onChange={(e) => setSixMonthPass(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                  <input type="number" min={0} step={1000} value={sixMonthPass} placeholder="60000" onChange={(e) => setSixMonthPass(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className={miniInputCls} />
                  <span className="text-xs text-charcoal/40">円</span>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* ==================== RESULTS ==================== */}
      <div className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-charcoal tracking-tight animate-fade-in">試算結果</h2>

        {/* Annual Income Hero */}
        <div className="glass-card-strong rounded-2xl p-6 sm:p-8 animate-fade-in-delay-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-1">
              <p className="text-xs font-medium text-charcoal/40 mb-1">年収（税・社保控除前）</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl sm:text-5xl font-bold text-accent tracking-tight">
                  {Math.round(annualIncome / 10000).toLocaleString()}
                </span>
                <span className="text-sm text-charcoal/40">万円</span>
              </div>
              <p className="text-xs text-charcoal/30 mt-1">
                （{annualIncome.toLocaleString()}円）
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal/40 mb-1">概算手取り年収</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
                  {Math.round(takeHome / 10000).toLocaleString()}
                </span>
                <span className="text-sm text-charcoal/40">万円</span>
              </div>
              <p className="text-xs text-charcoal/30 mt-1">
                （税・社保約21%控除の概算）
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal/40 mb-1">月収合計</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
                  {monthlyTotal.toLocaleString()}
                </span>
                <span className="text-sm text-charcoal/40">円</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <SectionCard title="月収内訳" className="animate-fade-in-delay-2">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[400px]">
              <tbody>
                {[
                  ['給料（基本給）', baseSalary],
                  ['扶養手当', fuyoTeate],
                  ['地域手当（10%）', chiikiTeate],
                  ['住居手当', jukyoTeate],
                  ['通勤手当', tsukinTeate],
                ].map(([label, val], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                    <td className="py-3 px-3 text-charcoal/70">{label as string}</td>
                    <td className="py-3 px-3 text-right font-semibold text-charcoal">
                      {(val as number).toLocaleString()}円
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-accent/20 bg-accent/5">
                  <td className="py-3 px-3 font-semibold text-charcoal">月収合計</td>
                  <td className="py-3 px-3 text-right font-bold text-accent text-lg">
                    {monthlyTotal.toLocaleString()}円
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {kanrishokuTeate === 0 && (position === 'buchou' || position === 'kachou' || position === 'shukan') && (
            <p className="mt-3 text-xs text-charcoal/40">
              ※ 管理職手当は役職により異なるため、上記には含まれていません。実際の月収はこれに管理職手当が加算されます。
            </p>
          )}
        </SectionCard>

        {/* Bonus */}
        <SectionCard title="ボーナス（期末・勤勉手当）" className="animate-fade-in-delay-3">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[400px]">
              <tbody>
                <tr className="bg-gray-50/50">
                  <td className="py-3 px-3 text-charcoal/70">期末勤勉手当基礎額</td>
                  <td className="py-3 px-3 text-right text-charcoal">
                    {bonusBase.toLocaleString()}円
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-charcoal/50 text-xs pl-6">
                    内訳: 給料{baseSalary.toLocaleString()} + 扶養{fuyoTeate.toLocaleString()} + 地域{chiikiTeate.toLocaleString()} + 役職加算{yakushokuKasanGaku.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="py-3 px-3 text-charcoal/70">
                    役職加算額
                    <span className="text-xs text-charcoal/40 ml-1">
                      （加算率{(positionAddRate * 100).toFixed(0)}%）
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-charcoal">
                    {yakushokuKasanGaku.toLocaleString()}円
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-charcoal/70">
                    期末手当（年額）
                    <span className="text-xs text-charcoal/40 ml-1">1.25 x 2回 = 2.5ヶ月</span>
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-charcoal">
                    {kimatsuTeate.toLocaleString()}円
                  </td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="py-3 px-3 text-charcoal/70">
                    勤勉手当（年額）
                    <span className="text-xs text-charcoal/40 ml-1">1.05 x 2回 = 2.1ヶ月</span>
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-charcoal">
                    {kinbenTeate.toLocaleString()}円
                  </td>
                </tr>
                <tr className="border-t-2 border-accent/20 bg-accent/5">
                  <td className="py-3 px-3 font-semibold text-charcoal">ボーナス年額合計</td>
                  <td className="py-3 px-3 text-right font-bold text-accent text-lg">
                    {bonusAnnual.toLocaleString()}円
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* ==================== FUTURE SIMULATION ==================== */}
      <div className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-charcoal tracking-tight animate-fade-in">将来シミュレーション</h2>

        {/* Promotion Plans */}
        <SectionCard title="昇格プラン設定" className="animate-fade-in-delay-1">
          <div className="space-y-3">
            {promotionPlans.map((plan) => (
              <div key={plan.id} className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={35}
                    value={plan.yearOffset}
                    onChange={(e) => updatePromotionPlan(plan.id, 'yearOffset', Math.max(1, Number(e.target.value)))}
                    className="w-20 bg-white/80 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                  <span className="text-sm text-charcoal/60">年後に</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={plan.targetGrade}
                    onChange={(e) => updatePromotionPlan(plan.id, 'targetGrade', Number(e.target.value))}
                    className="w-24 bg-white/80 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    {Array.from({ length: maxGrades }, (_, i) => i + 1).map((g) => (
                      <option key={g} value={g}>{g}級</option>
                    ))}
                  </select>
                  <span className="text-sm text-charcoal/60">に昇格</span>
                </div>
                <button
                  onClick={() => removePromotionPlan(plan.id)}
                  className="text-charcoal/30 hover:text-red-400 transition-colors p-1"
                  title="削除"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={addPromotionPlan}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-accent bg-accent/5 hover:bg-accent/10 border border-accent/10 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 1v12M1 7h12" />
              </svg>
              昇格プランを追加
            </button>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-gray-50/80 text-xs text-charcoal/40 space-y-1">
            <p>・通常: 毎年+4号昇給（1月1日）、部長級は+1号</p>
            <p>・58歳以降: 昇給停止</p>
            <p>・61歳以降: 給料月額 x 0.7（7割措置）</p>
            <p>・昇格時は現在の給料に最も近い号給に読み替えます</p>
          </div>
        </SectionCard>

        {/* Chart */}
        {simulation.length > 1 && (
          <SectionCard title="年収推移グラフ" className="animate-fade-in-delay-2">
            <LineChart data={chartData} />
          </SectionCard>
        )}

        {/* Simulation Table */}
        {simulation.length > 0 && (
          <SectionCard title="年次シミュレーション結果" className="animate-fade-in-delay-3">
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm min-w-[550px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 text-charcoal/40 font-medium text-xs">年</th>
                    <th className="text-left py-2 px-2 text-charcoal/40 font-medium text-xs">年齢</th>
                    <th className="text-left py-2 px-2 text-charcoal/40 font-medium text-xs">等級</th>
                    <th className="text-left py-2 px-2 text-charcoal/40 font-medium text-xs">号給</th>
                    <th className="text-right py-2 px-2 text-charcoal/40 font-medium text-xs">給料月額</th>
                    <th className="text-right py-2 px-2 text-charcoal/40 font-medium text-xs">年収概算</th>
                  </tr>
                </thead>
                <tbody>
                  {simulation.map((row, i) => {
                    const isPromo = promotionPlans.some(p => p.yearOffset === row.year) && row.year > 0;
                    const is61 = row.age === 61;
                    const is58 = row.age === 58;
                    return (
                      <tr
                        key={i}
                        className={`border-b border-gray-100 ${
                          isPromo
                            ? 'bg-accent/10'
                            : is61
                            ? 'bg-amber-50'
                            : is58
                            ? 'bg-orange-50/50'
                            : i % 2 === 0
                            ? 'bg-gray-50/30'
                            : ''
                        }`}
                      >
                        <td className="py-2 px-2 text-charcoal/60">
                          {row.year === 0 ? '現在' : `+${row.year}年`}
                        </td>
                        <td className="py-2 px-2 text-charcoal/70 font-medium">
                          {row.age}歳
                          {isPromo && (
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                              昇格
                            </span>
                          )}
                          {is61 && (
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-700 font-medium">
                              7割
                            </span>
                          )}
                          {is58 && (
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-orange-200 text-orange-700 font-medium">
                              昇給停止
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-charcoal/70">{row.grade}級</td>
                        <td className="py-2 px-2 text-charcoal/70">{row.step}号</td>
                        <td className="py-2 px-2 text-right text-charcoal font-medium">
                          {row.monthlySalary.toLocaleString()}円
                        </td>
                        <td className="py-2 px-2 text-right font-semibold text-accent">
                          {Math.round(row.annualIncome / 10000).toLocaleString()}万円
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </div>

      {/* Info box */}
      <div className="mt-8 glass-card rounded-xl p-5 animate-fade-in-delay-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
              <circle cx="6" cy="6" r="5" />
              <path d="M6 4v3M6 8.5v.01" />
            </svg>
          </div>
          <div className="text-xs text-charcoal/40 leading-relaxed">
            <p>
              このシミュレーターは参考値を表示するものです。管理職手当・特殊勤務手当等は含まれていません。
              実際の給与は昇給・昇格の時期、人事評価、条例改正等により異なります。
            </p>
            <p className="mt-2 text-charcoal/30">
              ※ 手取り概算は税・社会保険料を約21%として計算した概算値です。実際の控除額は家族構成・各種控除により異なります。
            </p>
            <p className="mt-1 text-charcoal/30">
              ※ 扶養手当は令和8年度以降のルールで計算しています（配偶者手当廃止、子の手当増額）。
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
