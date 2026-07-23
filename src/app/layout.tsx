import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StaffModeProvider } from '@/components/StaffMode';
import UnregisterSW from '@/components/UnregisterSW';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1B4D4F',
};

export const metadata: Metadata = {
  title: '組合員ポータル | 岸和田市職員労働組合',
  description: '岸和田市職員労働組合の組合員ポータル。給料シミュレーター・休暇ガイド・手当ガイド・共済ガイドに、岸和田市の給与条例の実データと組合員手帳別冊を反映しています。',
  // 組合員限定・検索エンジンから除外
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-base text-charcoal font-sans antialiased">
        <StaffModeProvider>{children}</StaffModeProvider>
        <UnregisterSW />
      </body>
    </html>
  );
}
