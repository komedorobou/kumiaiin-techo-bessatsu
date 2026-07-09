'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BP = process.env.NODE_ENV === 'production' ? '/kumiaiin-techo-bessatsu' : '';

const features = [
  {
    href: '/salary',
    iconImg: `${BP}/icons/salary.webp`,
    title: '給料シミュレーター',
    description: '職種・等級・号給を選んで月額給料を確認。来年の昇給シミュレーションも。',
  },
  {
    href: '/leave',
    iconImg: `${BP}/icons/leave.webp`,
    title: '休暇ガイド',
    description: 'ライフイベントから検索。結婚・出産・介護など場面別に必要な休暇が分かる。',
  },
  {
    href: '/allowances',
    iconImg: `${BP}/icons/allowance.webp`,
    title: '手当ガイド',
    description: '扶養・住居・通勤・賞与など各種手当の詳細。シミュレーター付き。',
  },
  {
    href: '/insurance',
    iconImg: `${BP}/icons/kyosai.webp`,
    title: '共済ガイド',
    description: 'セット共済のプラン比較・加入条件・給付手続き、火災共済、組織共済（弔慰金）を確認できる。',
  },
  {
    href: '/rules',
    iconImg: `${BP}/icons/rules.webp`,
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
              <p className="text-sm sm:text-base font-semibold text-accent/70 tracking-wide mb-3">
                岸和田市職員労働組合
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold text-charcoal tracking-tight leading-tight">
                組合員ポータル
              </h1>
              <p className="mt-6 text-base sm:text-lg text-charcoal/70 leading-relaxed max-w-lg">
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={feature.iconImg}
                  alt=""
                  width={64}
                  height={64}
                  className="w-20 h-20 rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-300"
                />
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
