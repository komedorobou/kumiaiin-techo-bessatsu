'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const features = [
  {
    href: '/salary',
    title: '給料シミュレーター',
    description: '職種・等級・号給を選んで月額給料を確認。来年の昇給シミュレーションも。',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="32" height="28" rx="4" />
        <path d="M10 14h.01M16 14h.01M22 14h.01M28 14h.01" />
        <path d="M10 20h.01M16 20h.01M22 20h.01M28 20h.01" />
        <path d="M10 26h6M22 26h6" />
        <circle cx="20" cy="20" r="3" strokeWidth="1.2" />
        <path d="M20 17v-1M20 24v-1M23 20h1M16 20h1" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    href: '/leave',
    title: '休暇ガイド',
    description: 'ライフイベントから検索。結婚・出産・介護など場面別に必要な休暇が分かる。',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="7" width="30" height="28" rx="4" />
        <path d="M27 4v6M13 4v6M5 17h30" />
        <path d="M15 23l3 3 6-6" strokeWidth="2" />
      </svg>
    ),
  },
  {
    href: '/insurance',
    title: '共済かんたん診断',
    description: '質問に答えるだけで最適なセット共済プランを提案。保障内容も比較できる。',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 37s13-6.5 13-16.5V9L20 4 7 9v11.5C7 30.5 20 37 20 37z" />
        <path d="M15 20l3.5 3.5 7-7" strokeWidth="2" />
      </svg>
    ),
  },
  {
    href: '/allowances',
    title: '手当ガイド',
    description: '扶養・住居・通勤・賞与など各種手当の詳細。シミュレーター付き。',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="10" width="28" height="20" rx="3" />
        <path d="M6 16h28M6 24h28" />
        <circle cx="20" cy="20" r="4" />
        <path d="M20 17.5v5M18 19h4" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    href: '/rules',
    title: '規約ビューア',
    description: '組合規約の全文を章ごとにナビゲーション。全文検索でキーワードを素早く発見。',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 33A4 4 0 0111 29H34" />
        <path d="M11 4H34v32H11A4 4 0 017 32V8a4 4 0 014-4z" />
        <path d="M13 12h14M13 18h10M13 24h8" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden hero-pattern">
        <div className="hero-geo" />

        {/* Decorative shapes */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full border border-accent/[0.06] hidden lg:block" />
        <div className="absolute top-40 right-32 w-32 h-32 rounded-full border border-accent/[0.08] hidden lg:block" />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full border border-accent/[0.05] hidden lg:block" />
        <div className="absolute top-28 left-1/4 w-3 h-3 rounded-full bg-accent/10 hidden lg:block" />
        <div className="absolute top-48 right-1/3 w-2 h-2 rounded-full bg-accent/15 hidden lg:block" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-2xl">
            <div className="animate-fade-in">
              <p className="text-xs font-medium text-accent/60 tracking-widest uppercase mb-4">
                Member Portal
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold text-charcoal tracking-tight leading-tight">
                岸和田市職員
                <br />
                労働組合
              </h1>
              <p className="mt-6 text-base sm:text-lg text-charcoal/50 leading-relaxed max-w-lg">
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
                <div className="w-14 h-14 rounded-xl bg-accent/5 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent/10 transition-colors">
                  {feature.icon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-charcoal group-hover:text-accent transition-colors">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm text-charcoal/50 leading-relaxed">
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
