'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QRCode from '@/components/QRCode';

const SITE_URL = 'https://komedorobou.github.io/kumiaiin-techo-bessatsu/';

export default function QRCodePage() {
  return (
    <>
      <Header />
      <main className="pt-28 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal mb-2">
            QRコード
          </h1>
          <p className="text-sm text-charcoal/50 mb-10">
            このQRコードを読み取ると、組合員手帳別冊デジタル版にアクセスできます。
          </p>

          <div className="glass-card-strong rounded-2xl p-8 sm:p-12 flex flex-col items-center gap-6">
            <QRCode value={SITE_URL} size={280} />
            <p className="text-xs text-charcoal/40 text-center break-all">
              {SITE_URL}
            </p>
          </div>

          <p className="mt-6 text-xs text-charcoal/40 text-center">
            印刷して配布資料やポスターに貼り付けてご利用ください。
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
