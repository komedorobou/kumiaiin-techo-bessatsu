'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type StaffMode = 'seishoku' | 'sonota' | 'kigyodan';

const STAFF_MODES: StaffMode[] = ['seishoku', 'sonota', 'kigyodan'];

const StaffModeContext = createContext<{
  mode: StaffMode;
  setMode: (m: StaffMode) => void;
}>({ mode: 'seishoku', setMode: () => {} });

export function StaffModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<StaffMode>('seishoku');

  useEffect(() => {
    const saved = localStorage.getItem('staffMode');
    if (saved && (STAFF_MODES as string[]).includes(saved)) setModeState(saved as StaffMode);
  }, []);

  const setMode = (m: StaffMode) => {
    setModeState(m);
    localStorage.setItem('staffMode', m);
  };

  return (
    <StaffModeContext.Provider value={{ mode, setMode }}>
      {children}
    </StaffModeContext.Provider>
  );
}

export function useStaffMode() {
  return useContext(StaffModeContext);
}

/** ページ冒頭に置く「正職員／その他」切り替え。全ページで選択が共有される。 */
export function StaffModeToggle() {
  const { mode, setMode } = useStaffMode();

  return (
    <div className="glass-card-strong rounded-2xl p-5 sm:p-7 mb-6 animate-fade-in">
      <label className="block text-xs font-medium text-charcoal/70 mb-3">職員区分</label>
      <div className="grid grid-cols-3 gap-2">
        {([
          ['seishoku', '正職員'],
          ['sonota', '会計年度'],
          ['kigyodan', '企業団'],
        ] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setMode(val)}
            className={`px-2 py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              mode === val
                ? 'bg-accent text-white shadow-md'
                : 'bg-white/60 text-charcoal/70 border border-gray-200 hover:border-accent/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-charcoal/55">
        {mode === 'sonota' ? '会計年度任用職員向けの内容を表示中' : mode === 'kigyodan' ? '大阪広域水道企業団の職員向けの内容を表示中' : '正職員（再任用含む）向けの内容を表示中'}
      </p>
    </div>
  );
}
