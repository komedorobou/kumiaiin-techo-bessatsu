'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type StaffMode = 'seishoku' | 'sonota';

const StaffModeContext = createContext<{
  mode: StaffMode;
  setMode: (m: StaffMode) => void;
}>({ mode: 'seishoku', setMode: () => {} });

export function StaffModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<StaffMode>('seishoku');

  useEffect(() => {
    const saved = localStorage.getItem('staffMode');
    if (saved === 'sonota' || saved === 'seishoku') setModeState(saved);
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
      <label className="block text-xs font-medium text-charcoal/50 mb-3">職員区分</label>
      <div className="flex items-center gap-3 flex-wrap">
        {([
          ['seishoku', '正職員'],
          ['sonota', '会計年度任用職員'],
        ] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setMode(val)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === val
                ? 'bg-accent text-white shadow-md'
                : 'bg-white/60 text-charcoal/50 border border-gray-200 hover:border-accent/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
