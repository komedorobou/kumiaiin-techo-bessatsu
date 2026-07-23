import Link from 'next/link';
import PageLayout from './PageLayout';
import { municipality, unionName } from '@/lib/facts';

export default function ComingSoon({
  title,
  detail,
  subtitle = 'このデモでは準備中の機能です',
}: {
  title: string;
  detail?: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <PageLayout title={title} subtitle={subtitle}>
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-6 py-10 text-center">
        <p className="text-charcoal/80 leading-relaxed">
          {detail ?? (
            <>
              このデモでは、<b>給料シミュレーター</b>に{municipality}の給与条例から自動作成した
              <b>実データ</b>を反映しています。
            </>
          )}
        </p>
        {!detail && (
          <p className="mt-3 text-charcoal/70 leading-relaxed text-sm">
            {title}は、導入時に{municipality}の条例・{unionName}の制度から作成します。
            正確を期すため、この画面ではサンプルを表示していません。
          </p>
        )}
        <Link
          href="/salary"
          className="inline-block mt-7 rounded-full bg-[#1B4D4F] text-white font-bold px-6 py-3 active:scale-[0.98] transition-transform"
        >
          給料シミュレーターを見る
        </Link>
      </div>
    </PageLayout>
  );
}
