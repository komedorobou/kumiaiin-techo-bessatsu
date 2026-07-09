'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';


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
  rules: (
    <svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 40a5 5 0 015-5h19V4H17a5 5 0 00-5 5v31z" />
      <path d="M12 40a5 5 0 005 4h19v-9" opacity="0.4" />
      <path d="M28 4v14l-4-3.5L20 18V4" opacity="0.55" fill="currentColor" stroke="none" />
    </svg>
  ),
};

const features = [
  {
    href: '/salary',
    iconKey: 'salary',
    title: '給料シミュレーター',
    description: '職種・等級・号給を選んで月額給料を確認。来年の昇給シミュレーションも。',
  },
  {
    href: '/leave',
    iconKey: 'leave',
    title: '休暇ガイド',
    description: 'ライフイベントから検索。結婚・出産・介護など場面別に必要な休暇が分かる。',
  },
  {
    href: '/allowances',
    iconKey: 'allowance',
    title: '手当ガイド',
    description: '扶養・住居・通勤・賞与など各種手当の詳細。シミュレーター付き。',
  },
  {
    href: '/insurance',
    iconKey: 'kyosai',
    title: '共済ガイド',
    description: 'セット共済のプラン比較・加入条件・給付手続き、火災共済、組織共済（弔慰金）を確認できる。',
  },
  {
    href: '/rules',
    iconKey: 'rules',
    title: '規約ビューア',
    description: '組合規約の全文を章ごとにナビゲーション。全文検索でキーワードを素早く発見。',
  },
];

export default function Home() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden hero-pattern">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-2xl">
            <div className="animate-fade-in">
              <p className="text-sm sm:text-[16px] font-semibold text-accent/70 tracking-wide mb-3">
                岸和田市職員労働組合
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold text-charcoal tracking-tight leading-tight">
                組合員ポータル
              </h1>
              <p className="mt-6 text-[16px] sm:text-lg text-charcoal/70 leading-relaxed max-w-lg">
                組合員手帳別冊のデジタル版。
                <br className="hidden sm:block" />
                給料・休暇・共済・規約の情報にすばやくアクセス。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-4 sm:-mt-8 relative z-20 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {features.map((feature, i) => (
            <Link
              key={feature.href}
              href={feature.href}
              className={`group glass-card-strong rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-delay-${i + 1}`}
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
                <span className="text-xs font-medium text-accent/40 group-hover:text-accent/70 transition-colors flex items-center gap-1">
                  開く
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 3l4 4-4 4" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
