import { unionName } from '@/lib/facts';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-base">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <span className="text-white text-[11px] font-bold leading-none">組</span>
            </div>
            <span className="text-xs text-charcoal/70">
              {unionName}
            </span>
          </div>
          <p className="text-xs text-charcoal/65">
            組合員ポータル
          </p>
        </div>
      </div>
    </footer>
  );
}
