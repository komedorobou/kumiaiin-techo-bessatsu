import PageLayout from '@/components/PageLayout';
import factsData from '@/data/facts.json';
import { ordinanceName, salaryTables, source, notFound, formatHm } from '@/lib/facts';
import { jaLabel, nestedLabel } from './labels';

/**
 * 隠し出典ページ /sources — どこからもリンクしない（URL直打ちのみ）。
 * facts.json の全項目を「項目｜値｜条例名｜条番号｜条文引用」で一覧化する。
 * 書記長への根拠即答用にスマホで読めるカード型で出す。
 * robots noindex は layout.tsx のグローバル設定で全ルートに適用済み。
 */

type Row = { label: string; value: string; ord?: string; article?: string; quote?: string };

function showVal(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'string') return /^\d{1,2}:\d{2}$/.test(v.trim()) ? formatHm(v) : v;
  if (Array.isArray(v)) return `${v.length}件（各ページに全件掲載）`;
  if (typeof v === 'object') {
    return Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => {
        const inner =
          val != null && typeof val === 'object'
            ? `（${showVal(val)}）`
            : showVal(val);
        return `${nestedLabel(k)}: ${inner}`;
      })
      .join(' ／ ');
  }
  return String(v);
}

function flatten(obj: Record<string, any>): Row[] {
  const rows: Row[] = [];
  for (const [key, entry] of Object.entries(obj)) {
    if (Array.isArray(entry)) {
      entry.forEach((el: any, i: number) => {
        rows.push({
          label: `${jaLabel(key)}｜${el.name ?? el.relation ?? i + 1}`,
          value: showVal(el.days ?? el.value ?? ''),
          ord: el.provenance?.ordinance,
          article: el.provenance?.article,
          quote: el.provenance?.quote,
        });
      });
    } else if (entry && entry.provenance) {
      rows.push({ label: jaLabel(key), value: showVal(entry.value), ord: entry.provenance.ordinance, article: entry.provenance.article, quote: entry.provenance.quote });
    } else {
      rows.push({ label: jaLabel(key), value: showVal(entry?.value ?? entry) });
    }
  }
  return rows;
}

const factRows = flatten(factsData.facts as Record<string, any>);
const leaveRows = flatten(factsData.leave as Record<string, any>);
const kaikeiRows = flatten(factsData.kaikei as Record<string, any>);
const totalRows = factRows.length + leaveRows.length + kaikeiRows.length + salaryTables.length + notFound.length;

function CardList({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-bold text-charcoal mb-3">
        {title}
        <span className="ml-2 text-xs font-normal text-charcoal/50">{rows.length}項目</span>
      </h2>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="src-row rounded-xl border border-charcoal/10 bg-white/80 px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-sm font-semibold text-charcoal">{r.label}</p>
              <p className="text-sm font-bold text-[#1B4D4F] break-words max-w-full">{r.value}</p>
            </div>
            {(r.ord || r.article) && (
              <p className="mt-1.5 text-xs text-charcoal/60">
                {r.ord ? ordinanceName(r.ord) : ''}{r.article ? `　${r.article}` : ''}
              </p>
            )}
            {r.quote && (
              <p className="mt-1 text-xs text-charcoal/50 leading-relaxed border-l-2 border-charcoal/15 pl-2">
                「{r.quote}」
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function SourcesPage() {
  return (
    <PageLayout title="収録データの出典一覧" subtitle={`収録項目 合計 ${totalRows}件`}>
      <p className="mb-8 text-sm text-charcoal/75 leading-relaxed">
        本ポータルの数値は、岸和田市例規集（インターネット公開されている条例・規則）と、組合公認資料である
        <b>組合員手帳別冊（岸和田市職員労働組合）</b>から取得しています。取得日: {source.fetchedAt}。
        各項目に根拠となる条例名・条番号・条文の引用（手帳由来は出典＝組合員手帳別冊）を付しています。
      </p>

      <CardList title="給与・手当" rows={factRows} />
      <CardList title="休暇（正職員）" rows={leaveRows} />
      <CardList title="会計年度任用職員" rows={kaikeiRows} />

      <section className="mb-10">
        <h2 className="text-base font-bold text-charcoal mb-3">
          給料表
          <span className="ml-2 text-xs font-normal text-charcoal/50">{salaryTables.length}表</span>
        </h2>
        <div className="space-y-2">
          {salaryTables.map((t) => (
            <div key={t.id} className="src-row rounded-xl border border-charcoal/10 bg-white/80 px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-sm font-semibold text-charcoal">{t.name}</p>
                <p className="text-sm font-bold text-[#1B4D4F]">{t.grades}級</p>
              </div>
              <p className="mt-1.5 text-xs text-charcoal/60">
                {ordinanceName('kyuyo')}　{t.provenance.tableLabel}
              </p>
              <p className="mt-1 text-xs text-charcoal/50">
                級別号給数: {t.checks.stepCounts.join(' / ')}　　検証: 単調性 {t.checks.monotonicPerGrade ? 'OK' : 'NG'}・級間 {(t.checks.gradeCrossConsistent ?? (t.checks as any).crossGradeAscendingPerStep) ? 'OK' : '—'}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-4">
        <h2 className="text-base font-bold text-charcoal mb-3">
          導入時に反映（未収録）
          <span className="ml-2 text-xs font-normal text-charcoal/50">{notFound.length}項目</span>
        </h2>
        <div className="space-y-2">
          {notFound.map((n, i) => (
            <div key={i} className="src-row rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
              <p className="text-xs font-semibold text-amber-900">{jaLabel(n.key.split('.').pop() ?? n.key)}</p>
              <p className="mt-0.5 text-xs text-amber-800/90 leading-relaxed">{n.reason}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs text-charcoal/50" data-total-rows={totalRows}>
        この一覧は組合の根拠確認用です。数値はすべて上記の条例・条番号・条文引用に紐づいています。
      </p>
    </PageLayout>
  );
}
