'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { initFluid } from '@/lib/fluid';
import { unionName, municipality } from '@/lib/facts';
import { MS_PER_SEC } from '@/lib/ui';


const featureIcons: Record<string, React.ReactNode> = {
  salary: (
    <svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="6" width="28" height="36" rx="6" />
      <rect x="16" y="12" width="16" height="7" rx="2" opacity="0.4" />
      <path d="M17 27h.01M24 27h.01M31 27h.01M17 34h.01M24 34h.01M31 34h.01" strokeWidth="3.2" />
    </svg>
  ),
  leave: (
    <svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="10" width="32" height="30" rx="6" />
      <path d="M17 6v8M31 6v8" />
      <path d="M8 20h32" opacity="0.4" />
      <path d="M19 30l4 4 7-8" />
    </svg>
  ),
  allowance: (
    <svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 16a5 5 0 015-5h19a4 4 0 014 4v2" opacity="0.4" />
      <rect x="8" y="14" width="32" height="24" rx="5" />
      <path d="M31 26h5" strokeWidth="3.2" />
    </svg>
  ),
  kyosai: (
    <svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 5l15 5v12c0 9.5-6.3 16.9-15 21C15.3 38.9 9 31.5 9 22V10l15-5z" />
      <path d="M24 30s-7-4.2-7-9a4 4 0 017-2.6A4 4 0 0131 21c0 4.8-7 9-7 9z" opacity="0.55" fill="currentColor" stroke="none" />
    </svg>
  ),
};

const features = [
  {
    href: '/salary',
    iconKey: 'salary',
    title: '給料シミュレーター',
    description: '職種・等級・号給を選んで月額給料を確認。将来の昇給や60歳特例まで試算できます。',
  },
  {
    href: '/leave',
    iconKey: 'leave',
    title: '休暇ガイド',
    description: '勤務時間・年休・特別休暇・忌引・病気休暇など岸和田市の休暇制度を確認。',
  },
  {
    href: '/allowances',
    iconKey: 'allowance',
    title: '手当ガイド',
    description: '賞与・扶養・住居・地域・通勤・時間外・管理職など各種手当を岸和田市の条例で確認。',
  },
  {
    href: '/insurance',
    iconKey: 'kyosai',
    title: '共済ガイド',
    description: 'セット共済・火災共済・慶弔費など自治労連共済の給付制度を確認。',
  },
];

export default function Home() {
  // 本体: WebGL流体シミュレーション（Navier-Stokes・物理演算）。失敗時は下の雲JSが背景を担う
  useEffect(() => {
    const container = document.getElementById('fluidContainer');
    if (!container) return;
    return initFluid(container as HTMLElement);
  }, []);

  // 雲はJS駆動: OSの視差軽減設定やCSSアニメ無効化の影響を受けず必ず動く（WebGL失敗時のフォールバック兼下地）
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.cloud'));
    if (nodes.length === 0) return;
    const params = nodes.map((_, i) => ({
      ax: 4 + (i % 3) * 1.6,           // 振幅(vmax相当のpx換算は下で)
      ay: 3 + ((i + 1) % 3) * 1.4,
      sx: 0.16 + i * 0.03,            // 角速度
      sy: 0.12 + i * 0.035,
      ph: i * 1.7,
      rot: (i % 2 === 0 ? 1 : -1) * (2 + i),
      sc: 0.08 + (i % 3) * 0.03,
    }));
    const vmax = Math.max(window.innerWidth, window.innerHeight) / 100;
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 33) return;
      last = now;
      const t = now / MS_PER_SEC;
      nodes.forEach((n, i) => {
        const p = params[i];
        const x = Math.sin(t * p.sx + p.ph) * p.ax * vmax;
        const y = Math.cos(t * p.sy + p.ph) * p.ay * vmax;
        const r = Math.sin(t * p.sx * 0.7 + p.ph) * p.rot;
        const sc = 1 + Math.sin(t * p.sy * 0.9 + p.ph) * p.sc;
        n.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${r}deg) scale(${sc})`;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <>
      <Header />

      {/* Hero: 固定・すりガラス液体の動画。スクロールでコンテンツが上に被さる */}
      <section className="fixed inset-0 z-0 overflow-hidden" aria-label="ヒーロー">
        {/* インク雲: コード生成（動画不使用・全端末で必ず動く） */}
        <div className="absolute inset-0 cloud-field" aria-hidden="true">
          <div className="cloud cloud-1" />
          <div className="cloud cloud-2" />
          <div className="cloud cloud-3" />
          <div className="cloud cloud-4" />
          <div className="cloud cloud-5" />
          <div className="cloud cloud-6" />
        </div>
        {/* 物理演算流体（Navier-Stokes）: 触ると墨が混ざる */}
        <div id="fluidWrap" className="absolute inset-0 opacity-0 transition-opacity duration-700" aria-hidden="true">
          <div id="fluidContainer" className="w-full h-full" />
        </div>
        {/* 可読性: 左からの白フェード＋最下部の沈み */}
        <div className="absolute inset-0 bg-gradient-to-r from-base/85 via-base/30 to-transparent sm:w-3/4 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-base/70 to-transparent pointer-events-none" />

        <div className="relative z-10 h-full flex items-center pointer-events-none">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
            <div className="max-w-2xl animate-fade-in">
              <p className="text-sm sm:text-[16px] font-semibold text-accent/80 tracking-wide mb-3">
                {unionName}
              </p>
              <h1 className="text-4xl sm:text-6xl font-bold text-charcoal tracking-tight leading-tight">
                組合員ポータル
              </h1>
              <p className="mt-6 text-[16px] sm:text-lg text-charcoal/70 leading-relaxed max-w-lg">
                勤務・労働条件・給料・手当の情報を、スマホでいつでも。
                <br className="hidden sm:block" />
                給料シミュレーターには{municipality}の給与条例の実データを反映しています。
              </p>
            </div>
          </div>
        </div>

        {/* スクロールキュー */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-accent/60">
          <span className="text-xs font-medium tracking-widest">SCROLL</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
            <path d="M3 6l5 5 5-5" />
          </svg>
        </div>
      </section>

      {/* ここから下がヒーローの上に被さってくる */}
      <div className="relative z-10 mt-[100svh]">
      {/* Feature Cards */}
      <section className="bg-base rounded-t-3xl shadow-[0_-24px_60px_-20px_rgba(27,77,79,0.35)] pt-12 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {features.map((feature, i) => (
            <Link
              key={feature.href}
              href={feature.href}
              className={`group glass-card-strong rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-[0.99] animate-fade-in-delay-${i + 1}`}
            >
              <div className="flex items-start gap-4">
                <div className="glass-tile w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center text-accent group-hover:scale-105 transition-transform duration-300">
                  {featureIcons[feature.iconKey]}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-charcoal group-hover:text-accent transition-colors">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm text-charcoal/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="text-xs font-semibold text-accent/70 group-hover:text-accent transition-colors flex items-center gap-1">
                  開く
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 3l4 4-4 4" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
        </div>
      </section>

      <Footer />
      </div>
    </>
  );
}
