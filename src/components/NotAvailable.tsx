/**
 * NotAvailable — fail-visible 部品。
 * facts.json に無い項目は「黙って隠す」のではなく、これで「導入時に反映します」と可視化する。
 */

export function NotAvailableBadge({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" />
      導入時に反映{label ? `：${label}` : ''}
    </span>
  );
}

export default function NotAvailable({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-5 sm:px-6 py-5">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#92400e" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 5v3.5M8 11h.01" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-amber-900">{title}</p>
          <p className="mt-1 text-xs text-amber-800/90 leading-relaxed">
            {detail ?? 'この項目は導入時に、岸和田市の条例・組合の制度から反映します。正確を期すため、この画面ではサンプルを表示していません。'}
          </p>
        </div>
      </div>
    </div>
  );
}
