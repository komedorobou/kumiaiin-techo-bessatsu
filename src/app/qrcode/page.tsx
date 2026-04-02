'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QRCode from '@/components/QRCode';

const BASE_URL = 'https://komedorobou.github.io/kumiaiin-techo-bessatsu';

const pages = [
  { path: '/', title: 'トップページ', description: '組合員手帳別冊デジタル版のトップ' },
  { path: '/salary/', title: '給料シミュレーター', description: '職種・等級・号給で月額給料を確認' },
  { path: '/leave/', title: '休暇ガイド', description: 'ライフイベント別に必要な休暇を検索' },
  { path: '/insurance/', title: '共済かんたん診断', description: '最適な共済プランを提案' },
  { path: '/allowances/', title: '手当ガイド', description: '扶養・住居・通勤・賞与など各種手当' },
  { path: '/rules/', title: '規約ビューア', description: '組合規約の全文検索・閲覧' },
];

export default function QRCodePage() {
  return (
    <>
      <Header />
      <main className="pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal mb-2">
            QRコード一覧
          </h1>
          <p className="text-sm text-charcoal/50 mb-10">
            各QRコードを読み取ると、対応するページに直接アクセスできます。印刷して手帳に貼り付けてご利用ください。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <div
                key={page.path}
                className="glass-card-strong rounded-2xl p-6 flex flex-col items-center gap-4"
              >
                <h2 className="text-base font-semibold text-charcoal">
                  {page.title}
                </h2>
                <QRCode value={`${BASE_URL}${page.path}`} size={180} />
                <p className="text-xs text-charcoal/50 text-center">
                  {page.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
