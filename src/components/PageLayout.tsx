import Header from './Header';
import Footer from './Footer';

export default function PageLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-charcoal/50">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
