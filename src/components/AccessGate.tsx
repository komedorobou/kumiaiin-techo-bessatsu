'use client';

import { useEffect, useState, ReactNode, FormEvent } from 'react';

// 2段構え：カードのQR(?key=)がフォームへの扉、職員番号+生年月日が本人確認。
// 名簿はサーバ関数(/api/auth)側にのみ存在し、ブラウザには来ない。
const CARD_KEY = 'k44r-2026-himitsu';
const CARD_STORAGE = 'portalCardKey';
const TOKEN_STORAGE = 'portalMemberToken';
// 説明会デモ：?demo=<有効期限のミリ秒> のQRを配ると、期限まではフル閲覧できる。
// 期限を過ぎたら閉じて「加入してください」へ。サーバー不要（クライアントで時刻判定）。
const DEMO_STORAGE = 'portalDemoExp';

type GateState = 'checking' | 'locked' | 'form' | 'open' | 'demoExpired';

export default function AccessGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>('checking');
  const [demoExp, setDemoExp] = useState<number | null>(null);
  const [no, setNo] = useState('');
  const [dob, setDob] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 組合員（本人確認済み）は無条件で開く
    if (localStorage.getItem(TOKEN_STORAGE)) {
      setState('open');
      return;
    }

    const params = new URLSearchParams(window.location.search);

    // --- 説明会デモQR（期限付き） ---
    const demoParam = params.get('demo');
    const storedDemo = sessionStorage.getItem(DEMO_STORAGE);
    const expStr = demoParam ?? storedDemo;
    if (expStr) {
      const exp = parseInt(expStr, 10);
      if (!Number.isNaN(exp)) {
        if (Date.now() < exp) {
          sessionStorage.setItem(DEMO_STORAGE, String(exp));
          if (demoParam) {
            const url = new URL(window.location.href);
            url.searchParams.delete('demo');
            window.history.replaceState(null, '', url.toString());
          }
          setDemoExp(exp);
          setState('open');
          return;
        }
        // 期限切れ
        sessionStorage.removeItem(DEMO_STORAGE);
        setState('demoExpired');
        return;
      }
    }

    // --- 組合員カードQR ---
    if (params.get('key') === CARD_KEY) {
      localStorage.setItem(CARD_STORAGE, CARD_KEY);
      const url = new URL(window.location.href);
      url.searchParams.delete('key');
      window.history.replaceState(null, '', url.toString());
      setState('form');
      return;
    }
    if (localStorage.getItem(CARD_STORAGE) === CARD_KEY) {
      setState('form');
      return;
    }

    setState('locked');
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ no, dob: dob.replace(/[^0-9]/g, '') }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(TOKEN_STORAGE, data.token);
        sessionStorage.removeItem(DEMO_STORAGE);
        setState('open');
      } else {
        setError('職員番号または生年月日が名簿と一致しません');
      }
    } catch {
      setError('通信エラーです。電波のある場所でお試しください');
    } finally {
      setBusy(false);
    }
  };

  if (state === 'checking') return <div className="min-h-screen bg-base" />;

  // 組合員 or 説明会デモ（期限内）＝中身を見せる。デモ中は上部にバナー。
  if (state === 'open') {
    return (
      <>
        {demoExp !== null && <DemoBanner exp={demoExp} />}
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#1B4D4F] flex items-center justify-center px-8 py-12">
      <div className="max-w-sm w-full text-center text-white">
        <img
          src="/icon-192.png"
          alt=""
          className="w-20 h-20 rounded-3xl mx-auto shadow-lg"
        />
        <h1 className="mt-6 text-xl font-bold tracking-wide">組合員ポータル</h1>
        <p className="mt-1 text-sm text-white/60">岸和田市職員労働組合</p>

        {state === 'demoExpired' ? (
          <>
            <div className="mt-8 rounded-2xl bg-white/10 px-6 py-6 text-left">
              <p className="font-bold text-sm">説明会デモは終了しました</p>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                続きは、加入して<b>自分のカード</b>でご覧いただけます。給料シミュレーター・共済・組合が勝ち取った成果は、組合員だけの内容です。
              </p>
            </div>
            <p className="mt-6 text-xs text-white/40">
              加入のご案内：組合事務所（内線◯◯◯）まで
            </p>
          </>
        ) : state === 'locked' ? (
          <>
            <div className="mt-8 rounded-2xl bg-white/10 px-6 py-6 text-left">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <p className="font-bold text-sm">組合員限定ページです</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                組合員証のQRコードまたはNFCから開いてください。
              </p>
            </div>
            <p className="mt-6 text-xs text-white/40">
              カードのご案内：組合事務所（内線◯◯◯）まで
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 rounded-2xl bg-white/10 px-6 py-6 text-left">
            <p className="font-bold text-sm">本人確認（初回のみ）</p>
            <p className="mt-1 text-xs text-white/60 leading-relaxed">
              組合名簿と照合します。この端末では次回から入力不要です。
            </p>
            <label className="block mt-5 text-xs font-bold text-white/70">
              職員番号
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={no}
                onChange={(e) => setNo(e.target.value)}
                className="mt-1.5 w-full rounded-xl bg-white text-[#1a1a1a] px-4 py-3 text-base font-bold tracking-wider outline-none"
                placeholder="例：1001"
                required
              />
            </label>
            <label className="block mt-4 text-xs font-bold text-white/70">
              生年月日（8桁）
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="mt-1.5 w-full rounded-xl bg-white text-[#1a1a1a] px-4 py-3 text-base font-bold tracking-wider outline-none"
                placeholder="例：19900101"
                required
              />
            </label>
            {error && <p className="mt-3 text-xs font-bold text-[#ffb3a7]">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full rounded-full bg-white text-[#1B4D4F] font-bold py-3 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {busy ? '確認中…' : '利用をはじめる'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// 説明会デモ中の上部バナー（残り時間＋加入導線）
function DemoBanner({ exp }: { exp: number }) {
  const [left, setLeft] = useState<number>(exp - Date.now());
  useEffect(() => {
    const t = setInterval(() => {
      const l = exp - Date.now();
      setLeft(l);
      if (l <= 0) window.location.reload(); // 期限が来たら締める
    }, 1000);
    return () => clearInterval(t);
  }, [exp]);
  const min = Math.max(0, Math.floor(left / 60000));
  const sec = Math.max(0, Math.floor((left % 60000) / 1000));
  return (
    <div className="sticky top-0 z-50 bg-[#A8792E] text-white text-center text-xs sm:text-sm font-bold px-4 py-2 leading-tight">
      説明会デモ体験中（残り {min}:{String(sec).padStart(2, '0')}）
      <span className="font-normal">　加入すると自分のカードでずっと見られます</span>
    </div>
  );
}
