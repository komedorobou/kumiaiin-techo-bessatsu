'use client';

import { useState, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import { salaryTables, getSalary, getNextYearSalary } from '@/data/salaryData';

export default function SalaryPage() {
  const [tableId, setTableId] = useState('gyosei');
  const [grade, setGrade] = useState(1);
  const [step, setStep] = useState(1);

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

  const currentSalary = getSalary(tableId, grade, step);
  const nextYear = getNextYearSalary(tableId, grade, step);
  const diff = currentSalary && nextYear.salary ? nextYear.salary - currentSalary : null;

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

  return (
    <PageLayout
      title="給料シミュレーター"
      subtitle="職種・等級・号給を選択して月額給料を確認できます"
    >
      {/* Controls */}
      <div className="glass-card-strong rounded-2xl p-6 sm:p-8 animate-fade-in-delay-1">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Job Type */}
          <div>
            <label className="block text-xs font-medium text-charcoal/50 mb-2">
              職種
            </label>
            <select
              value={tableId}
              onChange={(e) => handleTableChange(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all"
            >
              {salaryTables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Grade */}
          <div>
            <label className="block text-xs font-medium text-charcoal/50 mb-2">
              等級
            </label>
            <select
              value={grade}
              onChange={(e) => handleGradeChange(Number(e.target.value))}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all"
            >
              {Array.from({ length: maxGrades }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>
                  {g}級
                </option>
              ))}
            </select>
          </div>

          {/* Step */}
          <div>
            <label className="block text-xs font-medium text-charcoal/50 mb-2">
              号給
            </label>
            <select
              value={step}
              onChange={(e) => setStep(Number(e.target.value))}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all"
            >
              {Array.from({ length: maxSteps }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s}>
                  {s}号
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
        {/* Current Salary */}
        <div className="glass-card-strong rounded-2xl p-6 sm:p-8 animate-fade-in-delay-2">
          <p className="text-xs font-medium text-charcoal/40 mb-1">現在の月額給料</p>
          <p className="text-xs text-charcoal/30 mb-4">
            {currentTable.name} {grade}級 {step}号
          </p>
          {currentSalary ? (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-bold text-charcoal tracking-tight">
                {currentSalary.toLocaleString()}
              </span>
              <span className="text-sm text-charcoal/40">円</span>
            </div>
          ) : (
            <p className="text-lg text-charcoal/30">該当データなし</p>
          )}
        </div>

        {/* Next Year */}
        <div className="glass-card-strong rounded-2xl p-6 sm:p-8 animate-fade-in-delay-3">
          <p className="text-xs font-medium text-charcoal/40 mb-1">
            来年の月額給料
            <span className="text-charcoal/25 ml-1">（+4号昇給時）</span>
          </p>
          <p className="text-xs text-charcoal/30 mb-4">
            {currentTable.name} {grade}級 {nextYear.step}号
          </p>
          {nextYear.salary ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-bold text-accent tracking-tight">
                  {nextYear.salary.toLocaleString()}
                </span>
                <span className="text-sm text-charcoal/40">円</span>
              </div>
              {diff !== null && diff > 0 && (
                <p className="mt-3 text-sm text-accent/70 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M7 11V3M4 5l3-3 3 3" />
                  </svg>
                  +{diff.toLocaleString()}円
                </p>
              )}
            </>
          ) : (
            <p className="text-lg text-charcoal/30">
              号給の上限に達しています
            </p>
          )}
        </div>
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
              定期昇給は通常年1回（1月1日）、現在の号給から4号上位に昇給します。
              地方公務員法第28条、29条に該当し、休職あるいは懲戒処分がおこなわれたときは昇給できない場合があります。
            </p>
            <p className="mt-2 text-charcoal/30">
              ※ 表示されている金額は参考値です。実際の給料は諸手当等により異なります。
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
