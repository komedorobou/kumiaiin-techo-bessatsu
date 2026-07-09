'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card-strong">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${process.env.NODE_ENV === 'production' ? '/kumiaiin-techo-bessatsu' : ''}/icons/logo.webp`}
              alt="組"
              width={36}
              height={36}
              className="w-9 h-9 rounded-lg"
            />
            <span className="text-sm font-semibold text-charcoal hidden sm:block group-hover:text-accent transition-colors">
              岸和田市職員労働組合
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/salary">給料シミュレーター</NavLink>
            <NavLink href="/leave">休暇ガイド</NavLink>
            <NavLink href="/allowances">手当ガイド</NavLink>
            <NavLink href="/insurance">共済ガイド</NavLink>
            <NavLink href="/rules">規約ビューア</NavLink>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-accent/5 transition-colors"
            aria-label="メニュー"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              {menuOpen ? (
                <path d="M5 5l10 10M15 5L5 15" />
              ) : (
                <path d="M3 5h14M3 10h14M3 15h14" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            <MobileNavLink href="/salary" onClick={() => setMenuOpen(false)}>給料シミュレーター</MobileNavLink>
            <MobileNavLink href="/leave" onClick={() => setMenuOpen(false)}>休暇ガイド</MobileNavLink>
            <MobileNavLink href="/allowances" onClick={() => setMenuOpen(false)}>手当ガイド</MobileNavLink>
            <MobileNavLink href="/insurance" onClick={() => setMenuOpen(false)}>共済ガイド</MobileNavLink>
            <MobileNavLink href="/rules" onClick={() => setMenuOpen(false)}>規約ビューア</MobileNavLink>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium text-charcoal/70 hover:text-accent rounded-lg hover:bg-accent/5 transition-all"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-4 py-3 min-h-[44px] flex items-center text-sm font-medium text-charcoal/80 hover:text-accent rounded-lg hover:bg-accent/5 transition-all"
    >
      {children}
    </Link>
  );
}
