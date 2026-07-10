'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { salaryTables, getSalary } from '@/data/salaryData';
import {
  kaikeiNendoJobs,
  kaikeiMonthlyFromTable,
  kaikeiEmploymentRows,
  kaikeiEmploymentColumns,
  kaikeiEmploymentNote,
  kaikeiCommuteAmounts,
  kaikeiTransitCap,
} from '@/data/kaikeiNendoData';
import { useStaffMode, StaffModeToggle } from '@/components/StaffMode';

/* ===================== Types ===================== */
type PositionLevel = 'buchou' | 'riji' | 'kachou' | 'sanji' | 'kachohosa' | 'shukan' | 'tantouchou' | 'shusa' | 'shunin' | 'ippan';
type HousingType = 'rent' | 'own' | 'other';
type CommuteMethod = 'transit' | 'car' | 'bike' | 'bicycle' | 'walk';

interface PromotionPlan {
  id: number;
  yearOffset: number | '';
  targetGrade: number;
}

const positionLabels: Record<PositionLevel, string> = {
  buchou: '部長',
  riji: '理事',
  kachou: '課長',
  sanji: '参事',
  kachohosa: '課長補佐',
  shukan: '主幹',
  tantouchou: '担当長',
  shusa: '主査',
  shunin: '主任',
  ippan: '一般',
};

/* ===================== Management Allowance ===================== */
const kanrishokuTeateMap: Partial<Record<PositionLevel, number>> = {
  buchou: 72000,
  riji: 63000,
  kachou: 58000,
  sanji: 51000,
  kachohosa: 44000,
  shukan: 38000,
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
  // over 25km: base 22900 + 3900 per 5km, max 46300（通勤手当支給規則 別表。自転車は12km以上の区分なし）
  if (distanceKm >= 25) {
    if (method === 'bicycle') return 0;
    const extra = Math.floor((distanceKm - 25) / 5) * 3900;
    const base = method === 'car' ? 22900 : 12000;
    return Math.min(base + extra, 46300);
  }
  const row = commuteVehicleData.find(r => distanceKm >= r.min && distanceKm < r.max);
  if (!row) return 0;
  return row[method];
}


/* 数値欄: フォーカス時にカーソルを数値の右端へ。
   iOSはフォーカス後のタップ位置にカーソルを置き直すため、直後のclickでも右端へ寄せる */
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

/* ===================== Calculation Helpers ===================== */

function calcFuyoTeate(
  numChildren: number,
  numChildren16to22: number,
  numParents: number,
  position: PositionLevel
): number {
  // R8.4.1現行の給与条例第15条: 配偶者は扶養親族の範囲外（廃止済み）。
  // 子13,000円＋特定期間(16〜22歳)の子1人につき5,000円加算、
  // 父母等（孫・60歳以上父母祖父母・弟妹・障害者）6,500円（1等級等職員＝部長・理事級は3,500円）
  let total = numChildren * 13000 + numChildren16to22 * 5000;
  total += numParents * (position === 'buchou' || position === 'riji' ? 3500 : 6500);
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
  if (position === 'buchou' || position === 'riji') return 0.20;
  if (position === 'kachou' || position === 'sanji') return 0.15;
  if (position === 'kachohosa' || position === 'shukan') return 0.10;
  if (position === 'tantouchou' || position === 'shusa' || position === 'shunin') return 0.05;
  // ippan
  if (age >= 44) return 0.10;
  return 0;
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
  // viewBox幅＝実描画幅にすることで、スマホでも文字が縮小されず読める
  const W = measuredW;
  const H = 300;
  const PAD_L = W < 500 ? 48 : 70;
  const PAD_R = W < 500 ? 12 : 20;
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

  // X-axis labels (show every N labels to avoid crowding; narrow widths show fewer)
  const maxLabels = Math.max(4, Math.floor(W / 80));
  const labelInterval = Math.max(1, Math.ceil(data.length / maxLabels));

  return (
    <div ref={containerRef}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
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
        <h3 className="text-[16px] font-semibold text-charcoal mb-4 flex items-center gap-2">
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

  // 職員区分（正職員 / その他）※サイト共通
  const { mode: staffMode } = useStaffMode();

  // Promotion model preset
  type PromotionModel = 'daigaku' | 'kousotsu' | 'nashi' | null;
  const [activeModel, setActiveModel] = useState<PromotionModel>(null);
  const [modelOpen, setModelOpen] = useState(false);

  const applyPromotionModel = useCallback((model: PromotionModel) => {
    if (model === activeModel) {
      // Toggle off
      setActiveModel(null);
      return;
    }
    setActiveModel(model);
    setTableId('gyosei');

    if (model === 'daigaku') {
      setAge(23);
      setGrade(7);
      setStep(3);
      setPromotionPlans([
        { id: 1, yearOffset: 8, targetGrade: 6 },
        { id: 2, yearOffset: 15, targetGrade: 5 },
        { id: 3, yearOffset: 19, targetGrade: 4 },
      ]);
      setNextPlanId(4);
    } else if (model === 'kousotsu') {
      setAge(19);
      setGrade(8);
      setStep(14);
      setPromotionPlans([
        { id: 1, yearOffset: 4, targetGrade: 7 },
        { id: 2, yearOffset: 12, targetGrade: 6 },
      ]);
      setNextPlanId(3);
    } else if (model === 'nashi') {
      setAge(31);
      setGrade(6);
      setStep(23);
      setPromotionPlans([]);
      setNextPlanId(1);
    }
  }, [activeModel]);

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
    setActiveModel(null);
  };

  const handleGradeChange = (g: number) => {
    setGrade(g);
    setStep(1);
    setActiveModel(null);
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
    () => calcFuyoTeate(numChildrenNum, numChildren16to22Num, numParentsNum, position),
    [numChildrenNum, numChildren16to22Num, numParentsNum, position]
  );

  const kanrishokuTeate = kanrishokuTeateMap[position] ?? 0;

  const chiikiTeate = useMemo(
    () => Math.floor((baseSalary + fuyoTeate + kanrishokuTeate) * 0.11),
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

  const monthlyTotal = baseSalary + kanrishokuTeate + fuyoTeate + chiikiTeate + jukyoTeate + tsukinTeate;

  // Bonus calculation
  const positionAddRate = useMemo(() => getPositionAddRate(position, ageNum), [position, ageNum]);
  const yakushokuKasanGaku = useMemo(
    () => Math.floor((baseSalary + baseSalary * 0.11) * positionAddRate),
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

  const updatePromotionPlan = useCallback((id: number, field: 'yearOffset' | 'targetGrade', value: number | '') => {
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
    const sortedPlans = [...promotionPlans].sort((a, b) => (a.yearOffset === '' ? 0 : a.yearOffset) - (b.yearOffset === '' ? 0 : b.yearOffset));

    for (let y = 0; y <= maxYears; y++) {
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
      const yFuyo = calcFuyoTeate(numChildrenNum, numChildren16to22Num, numParentsNum, position);
      const yKanri = kanrishokuTeateMap[position] ?? 0;
      const yChiiki = Math.floor((effectiveSalary + yFuyo + yKanri) * 0.11);
      const yJukyo = calcHousingAllowance(housingType, rentNum);
      const yTsukin = calcCommuteAllowance(commuteMethod, commuteDistanceNum, sixMonthPassNum);
      const yMonthly = effectiveSalary + yKanri + yFuyo + yChiiki + yJukyo + yTsukin;

      const yPosRate = getPositionAddRate(position, curAge);
      const yYakushoku = Math.floor((effectiveSalary + effectiveSalary * 0.11) * yPosRate);
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
    numChildrenNum, numChildren16to22Num, numParentsNum,
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
    'w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-2.5 min-h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all';
  const labelCls = 'block text-xs font-medium text-charcoal/70 mb-1.5';
  const sliderCls = 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1B4D4F]';
  const miniInputCls = 'w-20 bg-white/80 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all';

  return (
    <PageLayout
      title="給料シミュレーター"
      subtitle="給料・手当・ボーナス・年収を試算し、将来の収入推移をシミュレーションできます"
    >
      {/* ==================== 職員区分選択（サイト共通） ==================== */}
      <StaffModeToggle />

      {staffMode === 'seishoku' && (
      <>
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
                <input type="text" inputMode="numeric" onFocus={caretToEnd} min={18} max={65} value={age} placeholder="30" onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value.replace(/[^0-9.]/g, '')))} onBlur={(e) => { if (e.target.value !== '') setAge(Math.max(18, Math.min(65, Number(e.target.value.replace(/[^0-9.]/g, ''))))); }} className={miniInputCls} />
                <span className="text-xs text-charcoal/65">歳</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>子の人数</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={6} value={numChildrenNum} onChange={(e) => { const v = Number(e.target.value); setNumChildren(v); if (numChildren16to22Num > v) setNumChildren16to22(v); }} className={`${sliderCls} flex-1`} />
                <input type="text" inputMode="numeric" onFocus={caretToEnd} min={0} max={6} value={numChildren} placeholder="0" onChange={(e) => { if (e.target.value === '') { setNumChildren(''); return; } const v = Math.max(0, Math.min(6, Number(e.target.value.replace(/[^0-9.]/g, '')))); setNumChildren(v); if (numChildren16to22Num > v) setNumChildren16to22(v); }} className={miniInputCls} />
                <span className="text-xs text-charcoal/65">人</span>
              </div>
            </div>
            <div>
              <label className={labelCls}>うち16〜22歳の子</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={numChildrenNum} value={numChildren16to22Num} onChange={(e) => setNumChildren16to22(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                <input type="text" inputMode="numeric" onFocus={caretToEnd} min={0} max={numChildrenNum} value={numChildren16to22} placeholder="0" onChange={(e) => setNumChildren16to22(e.target.value === '' ? '' : Number(e.target.value.replace(/[^0-9.]/g, '')))} onBlur={(e) => { if (e.target.value !== '') setNumChildren16to22(Math.max(0, Math.min(numChildrenNum, Number(e.target.value.replace(/[^0-9.]/g, ''))))); }} className={miniInputCls} />
                <span className="text-xs text-charcoal/65">人</span>
              </div>
            </div>
            <div>
              <label className={labelCls}>父母等の人数</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={4} value={numParentsNum} onChange={(e) => setNumParents(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                <input type="text" inputMode="numeric" onFocus={caretToEnd} min={0} max={4} value={numParents} placeholder="0" onChange={(e) => setNumParents(e.target.value === '' ? '' : Math.max(0, Math.min(4, Number(e.target.value.replace(/[^0-9.]/g, '')))))} className={miniInputCls} />
                <span className="text-xs text-charcoal/65">人</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-charcoal/65">
            ※ 配偶者に係る扶養手当は令和8年4月に廃止されたため入力欄はありません。父母等＝孫・60歳以上の父母や祖父母・弟妹・障害のある扶養親族（月6,500円、部長・理事級は3,500円）。
          </p>
        </SectionCard>

        {/* 住居 */}
        <SectionCard title="住居" className="animate-fade-in-delay-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>住居区分</label>
              <div className="flex items-center gap-2 min-h-[44px]">
                {([['rent', '賃貸'], ['own', '持家'], ['other', 'その他']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setHousingType(val)}
                    className={`px-4 py-2 min-h-[44px] inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                      housingType === val
                        ? 'bg-accent text-white shadow-md'
                        : 'bg-white/60 text-charcoal/70 border border-gray-200 hover:border-accent/30'
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
                  <input type="text" inputMode="numeric" onFocus={caretToEnd} min={0} step={1000} value={rent} placeholder="55000" onChange={(e) => setRent(e.target.value === '' ? '' : Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, ''))))} className={miniInputCls} />
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
            {(commuteMethod === 'car' || commuteMethod === 'bike' || commuteMethod === 'bicycle') && (
              <div>
                <label className={labelCls}>片道距離</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={50} step={1} value={commuteDistanceNum} onChange={(e) => setCommuteDistance(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                  <input type="text" inputMode="decimal" onFocus={caretToEnd} min={0} max={100} step={0.5} value={commuteDistance} placeholder="10" onChange={(e) => setCommuteDistance(e.target.value === '' ? '' : Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, ''))))} className={miniInputCls} />
                  <span className="text-xs text-charcoal/65">km</span>
                </div>
              </div>
            )}
            {commuteMethod === 'transit' && (
              <div>
                <label className={labelCls}>6ヶ月定期代</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={300000} step={1000} value={sixMonthPassNum} onChange={(e) => setSixMonthPass(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                  <input type="text" inputMode="numeric" onFocus={caretToEnd} min={0} step={1000} value={sixMonthPass} placeholder="60000" onChange={(e) => setSixMonthPass(e.target.value === '' ? '' : Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, ''))))} className={miniInputCls} />
                  <span className="text-xs text-charcoal/65">円</span>
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
              <p className="text-xs font-medium text-charcoal/65 mb-1">年収（税・社保控除前）</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl sm:text-5xl font-bold text-accent tracking-tight">
                  {Math.round(annualIncome / 10000).toLocaleString()}
                </span>
                <span className="text-sm text-charcoal/65">万円</span>
              </div>
              <p className="text-xs text-charcoal/60 mt-1">
                （{annualIncome.toLocaleString()}円）
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal/65 mb-1">概算手取り年収</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
                  {Math.round(takeHome / 10000).toLocaleString()}
                </span>
                <span className="text-sm text-charcoal/65">万円</span>
              </div>
              <p className="text-xs text-charcoal/60 mt-1">
                （税・社保約21%控除の概算）
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal/65 mb-1">月収合計</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
                  {monthlyTotal.toLocaleString()}
                </span>
                <span className="text-sm text-charcoal/65">円</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <SectionCard title="月収内訳" className="animate-fade-in-delay-2">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ['給料（基本給）', baseSalary],
                  ['管理職手当', kanrishokuTeate],
                  ['扶養手当', fuyoTeate],
                  ['地域手当（11%）', chiikiTeate],
                  ['住居手当', jukyoTeate],
                  ['通勤手当', tsukinTeate],
                ].map(([label, val], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                    <td className="py-3 px-3 text-charcoal/70">{label as string}</td>
                    <td className="py-3 px-3 text-right font-semibold text-charcoal whitespace-nowrap">
                      {(val as number).toLocaleString()}円
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-accent/20 bg-accent/5">
                  <td className="py-3 px-3 font-semibold text-charcoal">月収合計</td>
                  <td className="py-3 px-3 text-right font-bold text-accent text-lg whitespace-nowrap">
                    {monthlyTotal.toLocaleString()}円
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Bonus */}
        <SectionCard title="ボーナス（期末・勤勉手当）" className="animate-fade-in-delay-3">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <tbody>
                <tr className="bg-gray-50/50">
                  <td className="py-3 px-3 text-charcoal/70">期末勤勉手当基礎額</td>
                  <td className="py-3 px-3 text-right text-charcoal whitespace-nowrap">
                    {bonusBase.toLocaleString()}円
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-charcoal/70 text-xs pl-6">
                    内訳: 給料{baseSalary.toLocaleString()} + 扶養{fuyoTeate.toLocaleString()} + 地域{chiikiTeate.toLocaleString()} + 役職加算{yakushokuKasanGaku.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="py-3 px-3 text-charcoal/70">
                    役職加算額
                    <span className="text-xs text-charcoal/65 ml-1">
                      （加算率{(positionAddRate * 100).toFixed(0)}%）
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-charcoal whitespace-nowrap">
                    {yakushokuKasanGaku.toLocaleString()}円
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-charcoal/70">
                    期末手当（年額）
                    <span className="text-xs text-charcoal/65 ml-1">1.25 x 2回 = 2.5ヶ月</span>
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-charcoal whitespace-nowrap">
                    {kimatsuTeate.toLocaleString()}円
                  </td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="py-3 px-3 text-charcoal/70">
                    勤勉手当（年額）
                    <span className="text-xs text-charcoal/65 ml-1">1.05 x 2回 = 2.1ヶ月</span>
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-charcoal whitespace-nowrap">
                    {kinbenTeate.toLocaleString()}円
                  </td>
                </tr>
                <tr className="border-t-2 border-accent/20 bg-accent/5">
                  <td className="py-3 px-3 font-semibold text-charcoal">ボーナス年額合計</td>
                  <td className="py-3 px-3 text-right font-bold text-accent text-lg whitespace-nowrap">
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
                    type="text"
                    inputMode="numeric"
                    onFocus={caretToEnd}
                    min={1}
                    max={35}
                    value={plan.yearOffset}
                    onChange={(e) => updatePromotionPlan(plan.id, 'yearOffset', e.target.value === '' ? '' : Number(e.target.value.replace(/[^0-9]/g, '')))}
                    onBlur={(e) => updatePromotionPlan(plan.id, 'yearOffset', e.target.value === '' ? 1 : Math.max(1, Math.min(35, Number(e.target.value))))}
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
                  className="text-charcoal/60 hover:text-red-400 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
              className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-accent bg-accent/5 hover:bg-accent/10 border border-accent/10 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 1v12M1 7h12" />
              </svg>
              昇格プランを追加
            </button>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-gray-50/80 text-xs text-charcoal/65 space-y-1">
            <p>・通常: 毎年+4号昇給（1月1日）、部長級は+1号</p>
            <p>・58歳以降: 昇給停止</p>
            <p>・61歳以降: 給料月額 x 0.7（7割措置）</p>
            <p>・昇格時は現在の給料に最も近い号給に読み替えます</p>
            <p>・役職なしの場合、44歳以降はボーナスの職務段階別加算10%を見込んで計算します（44歳の年に年収が一段上がります）</p>
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="hidden sm:table-cell text-left py-2 px-2 text-charcoal/65 font-medium text-xs">年</th>
                    <th className="text-left py-2 px-2 text-charcoal/65 font-medium text-xs">年齢</th>
                    <th className="hidden sm:table-cell text-left py-2 px-2 text-charcoal/65 font-medium text-xs">等級</th>
                    <th className="hidden sm:table-cell text-left py-2 px-2 text-charcoal/65 font-medium text-xs">号給</th>
                    <th className="text-right py-2 px-2 text-charcoal/65 font-medium text-xs">給料月額</th>
                    <th className="text-right py-2 px-2 text-charcoal/65 font-medium text-xs">年収概算</th>
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
                        <td className="hidden sm:table-cell py-2 px-2 text-charcoal/60">
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
                        <td className="hidden sm:table-cell py-2 px-2 text-charcoal/70">{row.grade}級</td>
                        <td className="hidden sm:table-cell py-2 px-2 text-charcoal/70">{row.step}号</td>
                        <td className="py-2 px-2 text-right text-charcoal font-medium whitespace-nowrap">
                          {row.monthlySalary.toLocaleString()}円
                        </td>
                        <td className="py-2 px-2 text-right font-semibold text-accent whitespace-nowrap">
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
          <div className="text-xs text-charcoal/65 leading-relaxed">
            <p>
              このシミュレーターは参考値を表示するものです。特殊勤務手当等は含まれていません。
              実際の給与は昇給・昇格の時期、人事評価、条例改正等により異なります。
            </p>
            <p className="mt-2 text-charcoal/60">
              ※ 手取り概算は税・社会保険料を約21%として計算した概算値です。実際の控除額は家族構成・各種控除により異なります。
            </p>
            <p className="mt-1 text-charcoal/60">
              ※ 扶養手当は令和8年度以降のルールで計算しています（配偶者手当廃止・子13,000円・父母等6,500円、給与条例第15条）。
            </p>
          </div>
        </div>
      </div>
      </>
      )}

      {staffMode === 'sonota' && <KaikeiSection />}
    </PageLayout>
  );
}

/* ===================== 会計年度任用職員シミュレーター ===================== */

function calcKaikeiCommute(
  method: CommuteMethod,
  distanceKm: number,
  sixMonthPass: number,
  halfDistance: boolean
): number {
  if (method === 'walk') return 0;
  if (method === 'transit') return Math.min(Math.round(sixMonthPass / 6), kaikeiTransitCap);
  const d = halfDistance ? distanceKm / 2 : distanceKm;
  if (d < 2) return 0;
  const idx = d < 4 ? 0 : d < 6 ? 1 : d < 8 ? 2 : 3;
  return kaikeiCommuteAmounts[method as 'car' | 'bike' | 'bicycle'][idx];
}

function KaikeiSection() {
  // Basic info
  const [jobId, setJobId] = useState(kaikeiNendoJobs[0].id);
  const [yearNum, setYearNum] = useState(1);
  const [age, setAge] = useState<number | ''>('');
  const [weeklyHours, setWeeklyHours] = useState<number | null>(null);

  // Commute
  const [commuteMethod, setCommuteMethod] = useState<CommuteMethod>('transit');
  const [commuteDistance, setCommuteDistance] = useState<number | ''>('');
  const [sixMonthPass, setSixMonthPass] = useState<number | ''>('');

  const job = kaikeiNendoJobs.find((j) => j.id === jobId) ?? kaikeiNendoJobs[0];
  const ageNum = age === '' ? 30 : age;
  const distanceNum = commuteDistance === '' ? 0 : commuteDistance;
  const passNum = sixMonthPass === '' ? 0 : sixMonthPass;
  const isChoujikan = jobId === 'choujikan';

  const hours = job.weeklyHoursOptions
    ? weeklyHours ?? job.defaultWeeklyHours ?? job.weeklyHoursOptions[0]
    : null;
  const rowMonthly = (row: (typeof job.rows)[number]) =>
    hours !== null ? kaikeiMonthlyFromTable(row.tableSalary, hours) : row.monthly;

  const monthly = rowMonthly(job.rows[Math.min(Math.max(yearNum, 1), 10) - 1]);

  const tsukinTeate = useMemo(
    () => calcKaikeiCommute(commuteMethod, distanceNum, passNum, isChoujikan),
    [commuteMethod, distanceNum, passNum, isChoujikan]
  );

  const monthlyTotal = monthly + tsukinTeate;

  // ボーナス（期末・勤勉手当）: 6月期2.325月＋12月期2.325月＝年間4.65月
  const kimatsuTeate = Math.floor(monthly * 2.325);
  const kinbenTeate = Math.floor(monthly * 2.325);
  const bonusAnnual = kimatsuTeate + kinbenTeate;

  const annualIncome = monthlyTotal * 12 + bonusAnnual;
  const takeHome = Math.round(annualIncome * 0.79);

  // 将来シミュレーション（65歳まで。昇給は10年目が上限）
  const simulation = useMemo(() => {
    const results: {
      year: number;
      age: number;
      expYear: number;
      monthlySalary: number;
      annualIncome: number;
    }[] = [];
    const maxYears = 65 - ageNum;
    if (maxYears <= 0) return results;

    for (let y = 0; y <= maxYears; y++) {
      const expYear = Math.min(yearNum + y, 10);
      const m = rowMonthly(job.rows[expYear - 1]);
      const yBonus = Math.floor(m * 2.325) * 2;
      const yAnnual = (m + tsukinTeate) * 12 + yBonus;
      results.push({
        year: y,
        age: ageNum + y,
        expYear,
        monthlySalary: m,
        annualIncome: yAnnual,
      });
    }
    return results;
  }, [ageNum, yearNum, job, tsukinTeate, hours]);

  const chartData = useMemo(
    () => simulation.map((s) => ({ label: `${s.age}歳`, value: s.annualIncome })),
    [simulation]
  );

  const inputCls =
    'w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-2.5 min-h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all';
  const labelCls = 'block text-xs font-medium text-charcoal/70 mb-1.5';
  const sliderCls = 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1B4D4F]';
  const miniInputCls = 'w-20 bg-white/80 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all';

  return (
    <>
      {/* ==================== INPUT SECTION ==================== */}
      <div className="space-y-6">
        {/* 基本情報 */}
        <SectionCard title="基本情報" className="animate-fade-in-delay-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>職種</label>
              <select
                value={jobId}
                onChange={(e) => {
                  setJobId(e.target.value);
                  setWeeklyHours(null);
                }}
                className={inputCls}
              >
                {kaikeiNendoJobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>
            </div>
            {job.weeklyHoursOptions && hours !== null && (
              <div>
                <label className={labelCls}>週勤務時間（配属先による）</label>
                <select
                  value={hours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className={inputCls}
                >
                  {job.weeklyHoursOptions.map((h) => (
                    <option key={h} value={h}>週{h}時間</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className={labelCls}>何年目</label>
              <select value={yearNum} onChange={(e) => setYearNum(Number(e.target.value))} className={inputCls}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((y) => (
                  <option key={y} value={y}>{y}年目</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>年齢</label>
              <div className="flex items-center gap-2">
                <input type="range" min={18} max={65} value={ageNum} onChange={(e) => setAge(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                <input type="text" inputMode="numeric" onFocus={caretToEnd} min={18} max={65} value={age} placeholder="30" onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value.replace(/[^0-9.]/g, '')))} onBlur={(e) => { if (e.target.value !== '') setAge(Math.max(18, Math.min(65, Number(e.target.value.replace(/[^0-9.]/g, ''))))); }} className={miniInputCls} />
                <span className="text-xs text-charcoal/65">歳</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-charcoal/65">{job.subtitle}</p>
        </SectionCard>

        {/* 通勤 */}
        <SectionCard title="通勤" className="animate-fade-in-delay-2">
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
                  <input type="range" min={0} max={30} step={1} value={distanceNum} onChange={(e) => setCommuteDistance(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                  <input type="text" inputMode="decimal" onFocus={caretToEnd} min={0} max={100} step={0.5} value={commuteDistance} placeholder="10" onChange={(e) => setCommuteDistance(e.target.value === '' ? '' : Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, ''))))} className={miniInputCls} />
                  <span className="text-xs text-charcoal/65">km</span>
                </div>
              </div>
            )}
            {commuteMethod === 'transit' && (
              <div>
                <label className={labelCls}>6ヶ月定期代</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={300000} step={1000} value={passNum} onChange={(e) => setSixMonthPass(Number(e.target.value))} className={`${sliderCls} flex-1`} />
                  <input type="text" inputMode="numeric" onFocus={caretToEnd} min={0} step={1000} value={sixMonthPass} placeholder="60000" onChange={(e) => setSixMonthPass(e.target.value === '' ? '' : Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, ''))))} className={miniInputCls} />
                  <span className="text-xs text-charcoal/65">円</span>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-gray-50/80 text-xs text-charcoal/65 space-y-1">
            <p>・交通機関利用者は定期券の額（月額限度 18,000円）</p>
            <p>・交通用具は距離区分に応じた定額（片道2km（直線1.5km）未満は支給なし）</p>
            {isChoujikan && <p>・長時間担当職員（長時間担当保育）は朝夕2回勤務のため通勤距離を1/2換算</p>}
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
              <p className="text-xs font-medium text-charcoal/65 mb-1">年収（税・社保控除前）</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl sm:text-5xl font-bold text-accent tracking-tight">
                  {Math.round(annualIncome / 10000).toLocaleString()}
                </span>
                <span className="text-sm text-charcoal/65">万円</span>
              </div>
              <p className="text-xs text-charcoal/60 mt-1">
                （{annualIncome.toLocaleString()}円）
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal/65 mb-1">概算手取り年収</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
                  {Math.round(takeHome / 10000).toLocaleString()}
                </span>
                <span className="text-sm text-charcoal/65">万円</span>
              </div>
              <p className="text-xs text-charcoal/60 mt-1">
                （税・社保約21%控除の概算）
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal/65 mb-1">月収合計</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
                  {monthlyTotal.toLocaleString()}
                </span>
                <span className="text-sm text-charcoal/65">円</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <SectionCard title="月収内訳" className="animate-fade-in-delay-2">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <tbody>
                {[
                  [`月額報酬（${job.name}・${yearNum}年目${hours !== null ? `・週${hours}時間` : ''}）`, monthly],
                  ['通勤手当', tsukinTeate],
                ].map(([label, val], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                    <td className="py-3 px-3 text-charcoal/70">{label as string}</td>
                    <td className="py-3 px-3 text-right font-semibold text-charcoal whitespace-nowrap">
                      {(val as number).toLocaleString()}円
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-accent/20 bg-accent/5">
                  <td className="py-3 px-3 font-semibold text-charcoal">月収合計</td>
                  <td className="py-3 px-3 text-right font-bold text-accent text-lg whitespace-nowrap">
                    {monthlyTotal.toLocaleString()}円
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-charcoal/65">
            ※ 月額報酬は地域手当（11%）込みの額です。
          </p>
        </SectionCard>

        {/* Bonus */}
        <SectionCard title="ボーナス（期末・勤勉手当）" className="animate-fade-in-delay-3">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <tbody>
                <tr className="bg-gray-50/50">
                  <td className="py-3 px-3 text-charcoal/70">
                    6月期
                    <span className="text-xs text-charcoal/65 ml-1">2.325ヶ月</span>
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-charcoal whitespace-nowrap">
                    {kimatsuTeate.toLocaleString()}円
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-charcoal/70">
                    12月期
                    <span className="text-xs text-charcoal/65 ml-1">2.325ヶ月</span>
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-charcoal whitespace-nowrap">
                    {kinbenTeate.toLocaleString()}円
                  </td>
                </tr>
                <tr className="border-t-2 border-accent/20 bg-accent/5">
                  <td className="py-3 px-3 font-semibold text-charcoal">ボーナス年額合計（4.65ヶ月）</td>
                  <td className="py-3 px-3 text-right font-bold text-accent text-lg whitespace-nowrap">
                    {bonusAnnual.toLocaleString()}円
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-charcoal/65">
            ※ 一任用期間が6ヶ月以上、かつ一週間の勤務時間が15.5時間以上の場合に支給。新規採用者の場合、初回は一部支給。月額報酬を基礎にした概算です。
          </p>
        </SectionCard>
      </div>

      {/* ==================== FUTURE SIMULATION ==================== */}
      <div className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-charcoal tracking-tight animate-fade-in">将来シミュレーション</h2>

        {/* Chart */}
        {simulation.length > 1 && (
          <SectionCard title="年収推移グラフ" className="animate-fade-in-delay-1">
            <LineChart data={chartData} />
          </SectionCard>
        )}

        {/* Simulation Table */}
        {simulation.length > 0 && (
          <SectionCard title="年次シミュレーション結果" className="animate-fade-in-delay-2">
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="hidden sm:table-cell text-left py-2 px-2 text-charcoal/65 font-medium text-xs">年</th>
                    <th className="text-left py-2 px-2 text-charcoal/65 font-medium text-xs">年齢</th>
                    <th className="text-left py-2 px-2 text-charcoal/65 font-medium text-xs">経験年数</th>
                    <th className="text-right py-2 px-2 text-charcoal/65 font-medium text-xs">月額報酬</th>
                    <th className="text-right py-2 px-2 text-charcoal/65 font-medium text-xs">年収概算</th>
                  </tr>
                </thead>
                <tbody>
                  {simulation.map((row, i) => {
                    const isMax = row.expYear === 10 && (i === 0 || simulation[i - 1].expYear < 10);
                    return (
                      <tr
                        key={i}
                        className={`border-b border-gray-100 ${
                          isMax ? 'bg-amber-50' : i % 2 === 0 ? 'bg-gray-50/30' : ''
                        }`}
                      >
                        <td className="hidden sm:table-cell py-2 px-2 text-charcoal/60">
                          {row.year === 0 ? '現在' : `+${row.year}年`}
                        </td>
                        <td className="py-2 px-2 text-charcoal/70 font-medium">
                          {row.age}歳
                          {isMax && (
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-700 font-medium">
                              昇給上限
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-charcoal/70">{row.expYear}年目{row.expYear === 10 ? '〜' : ''}</td>
                        <td className="py-2 px-2 text-right text-charcoal font-medium whitespace-nowrap">
                          {row.monthlySalary.toLocaleString()}円
                        </td>
                        <td className="py-2 px-2 text-right font-semibold text-accent whitespace-nowrap">
                          {Math.round(row.annualIncome / 10000).toLocaleString()}万円
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-gray-50/80 text-xs text-charcoal/65 space-y-1">
              <p>・昇給は経験1年ごとに+2号給、上限9年（10年目以降は同額）</p>
              <p>・任用は毎年4月1日〜翌年3月31日。再度の任用あり（4回、最長5年。5年経過後、再度受験可）</p>
            </div>
          </SectionCard>
        )}
      </div>

      {/* ==================== 任用条件 ==================== */}
      <div className="mt-10 space-y-6">
        <SectionCard title="任用条件（労働条件一覧表）" className="animate-fade-in-delay-3">
          {/* スマホ: 項目ごとのスタック表示（共通値は1つに畳む） */}
          <div className="sm:hidden space-y-4">
            {kaikeiEmploymentRows.map((row) => {
              const allSame = row.values.every((v) => v === row.values[0]);
              return (
                <div key={row.label} className="border-b border-gray-100 pb-3">
                  <p className="text-xs font-semibold text-charcoal mb-1.5">{row.label}</p>
                  {allSame ? (
                    <p className="text-sm text-charcoal/70 leading-relaxed">{row.values[0]}</p>
                  ) : (
                    <div className="space-y-1.5">
                      {row.values.map((v, j) => (
                        <p key={j} className="text-sm text-charcoal/70 leading-relaxed">
                          <span className="text-xs font-medium text-accent mr-1.5">{kaikeiEmploymentColumns[j]}</span>
                          {v}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* PC: 従来の3分会テーブル */}
          <div className="hidden sm:block overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-charcoal/65 font-medium text-xs w-24">項目</th>
                  {kaikeiEmploymentColumns.map((col) => (
                    <th key={col} className="text-left py-2 px-3 text-charcoal/65 font-medium text-xs">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kaikeiEmploymentRows.map((row, i) => {
                  const allSame = row.values.every((v) => v === row.values[0]);
                  return (
                    <tr key={row.label} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/30' : ''}`}>
                      <td className="py-2.5 px-3 text-charcoal/70 font-medium whitespace-nowrap">{row.label}</td>
                      {allSame ? (
                        <td className="py-2.5 px-3 text-charcoal/70" colSpan={3}>{row.values[0]}</td>
                      ) : (
                        row.values.map((v, j) => (
                          <td key={j} className="py-2.5 px-3 text-charcoal/70">{v}</td>
                        ))
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-charcoal/65">{kaikeiEmploymentNote}</p>
        </SectionCard>
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
          <div className="text-xs text-charcoal/65 leading-relaxed">
            <p>
              このシミュレーターは参考値を表示するものです。実際の給与は経験年数の認定、条例改正等により異なります。
            </p>
            <p className="mt-2 text-charcoal/60">
              ※ 手取り概算は税・社会保険料を約21%として計算した概算値です。実際の控除額は家族構成・各種控除により異なります。
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
