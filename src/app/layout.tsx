import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1B4D4F',
};

export const metadata: Metadata = {
  title: '組合員ポータル | 岸和田市職員労働組合',
  description: '岸和田市職員労働組合の組合員手帳別冊デジタル版。給料シミュレーター、休暇ガイド、共済診断、規約ビューアを提供します。',
  manifest: '/manifest.json',
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-base text-charcoal font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
