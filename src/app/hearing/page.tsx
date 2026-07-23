import PageLayout from '@/components/PageLayout';
import factsData from '@/data/facts.json';
import { municipality, unionName, source, salaryTables } from '@/lib/facts';
import { hearingMaster, type HearingItem } from '@/data/hearingMaster';
import { analyzeHearing } from '@/lib/hearing';
import { jaLabel } from '../sources/labels';

/**
 * 隠しページ /hearing — 導入時ヒアリングシート（どこからもリンクしない・URL直打ちのみ）。
 * 「例規集から取れるものは自動収録済み。組合に聞くのはこの N 件だけ」を facts.json から機械導出する
 * 営業資料兼導入手順書。robots noindex は layout.tsx のグローバル設定で全ルートに適用済み。
 */

const F = factsData as unknown as Record<string, any>;

/** 例規集から自動収録できた項目数（配列は要素数で展開）。 */
function countRecorded(obj: Record<string, any> | undefined): number {
  if (!obj) return 0;
  let n = 0;
  for (const v of Object.values(obj)) n += Array.isArray(v) ? v.length : 1;
  return n;
}

const autoCount =
  countRecorded(F.facts) + countRecorded(F.leave) + countRecorded(F.kaikei) + salaryTables.length;

const notFound: { key: string; reason: string }[] = F.notFound ?? [];
const { confirmed, toAsk } = analyzeHearing();
const askLeavePay = toAsk.filter((i) => i.category === 'leave' || i.category === 'pay');
const unionOps = hearingMaster.filter((i) => i.category === 'union' || i.category === 'ops');

// A（未収録）＋ B（例規外運用の確認）＋ C（組合固有情報）
const askCount = notFound.length + askLeavePay.length + unionOps.length;

function notFoundLabel(key: string): string {
  const tail = key.split('.').pop() ?? key;
  return jaLabel(tail);
}

/** 印刷用のチェック枠（機能なし・CSSの丸角枠のみ）。 */
function CheckBox() {
  return (
    <span
      aria-hidden
      className="mt-0.5 inline-block h-5 w-5 flex-none rounded-md border-2 border-charcoal/30 bg-white"
    />
  );
}

function AskRow({ label, note }: { label: string; note: string }) {
  return (
    <div className="hearing-row flex items-start gap-3 rounded-xl border border-charcoal/10 bg-white/80 px-4 py-3 print:break-inside-avoid">
      <CheckBox />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-charcoal">{label}</p>
        <p className="mt-1 text-xs text-charcoal/60 leading-relaxed">{note}</p>
      </div>
    </div>
  );
}

function SectionHeading({ tag, title, count }: { tag: string; title: string; count: number }) {
  return (
    <div className="mb-3 flex items-baseline gap-2">
      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
        {tag}
      </span>
      <h2 className="text-base font-bold text-charcoal">{title}</h2>
      <span className="text-xs font-normal text-charcoal/50">{count}件</span>
    </div>
  );
}

export default function HearingPage() {
  return (
    <PageLayout
      title="運用確認シート"
      subtitle={`${unionName}｜例規集取得日 ${source.fetchedAt}`}
    >
      <p className="mb-6 max-w-3xl text-sm leading-relaxed text-charcoal/75">
        {municipality}の例規集（条例・規則）と組合員手帳別冊から収録した項目は、既にポータルへ反映済みです
        （通勤手当の距離別実額・忌引の血族／姻族細分・病気休暇90日などは組合員手帳別冊で確認済み）。
        以下は、条例・規則に書かれにくい運用や組合固有の情報のうち、随時ご確認・更新いただく項目です。
      </p>

      {/* サマリ */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="rounded-xl border border-accent/20 bg-accent-pale/60 px-4 py-3">
          <p className="text-xs text-charcoal/60">例規集から自動収録</p>
          <p className="mt-1 text-2xl font-bold text-accent">
            {autoCount}
            <span className="ml-1 text-sm font-normal text-charcoal/60">件</span>
          </p>
        </div>
        <div className="rounded-xl border border-amber-300/50 bg-amber-50/70 px-4 py-3">
          <p className="text-xs text-charcoal/60">組合にご確認いただく項目</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            {askCount}
            <span className="ml-1 text-sm font-normal text-charcoal/60">件</span>
          </p>
        </div>
      </div>

      {/* A. 例規集から取得できなかった項目 */}
      <section className="mb-10">
        <SectionHeading tag="A" title="例規集から取得できなかった項目" count={notFound.length} />
        <p className="mb-3 text-xs text-charcoal/55">
          例規集に該当規定がなく、機械では取れなかった項目です。理由とともに掲載しています。
        </p>
        <div className="space-y-2">
          {notFound.map((n, i) => (
            <div
              key={i}
              className="hearing-row flex items-start gap-3 rounded-xl border border-charcoal/10 bg-white/80 px-4 py-3 print:break-inside-avoid"
            >
              <CheckBox />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-charcoal">{notFoundLabel(n.key)}</p>
                <p className="mt-1 text-xs leading-relaxed text-charcoal/60">{n.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* B. 例規外の運用がないかの確認 */}
      <section className="mb-10">
        <SectionHeading tag="B" title="例規外の運用がないかの確認" count={askLeavePay.length} />
        <p className="mb-3 text-xs text-charcoal/55">
          条例・規則には載りにくい休暇の運用・手当の実額などです。該当があれば導入時に反映します。
        </p>
        <div className="space-y-2">
          {askLeavePay.map((item: HearingItem) => (
            <AskRow key={item.key} label={item.label} note={item.why} />
          ))}
        </div>
      </section>

      {/* C. 組合固有の情報 */}
      <section className="mb-10">
        <SectionHeading tag="C" title="組合固有の情報" count={unionOps.length} />
        <p className="mb-3 text-xs text-charcoal/55">
          例規には存在しない、組合・互助会の制度やポータルの見せ方に関する項目です。
        </p>
        <div className="space-y-2">
          {unionOps.map((item: HearingItem) => (
            <AskRow key={item.key} label={item.label} note={item.why} />
          ))}
        </div>
      </section>

      {/* D. 例規で確認済み（ヒアリング不要） */}
      <section className="mb-4">
        <div className="mb-3 flex items-baseline gap-2">
          <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-charcoal/15 text-xs font-bold text-charcoal/70">
            D
          </span>
          <h2 className="text-base font-bold text-charcoal/70">例規で確認済み（ヒアリング不要）</h2>
          <span className="text-xs font-normal text-charcoal/45">{confirmed.length}件</span>
        </div>
        <p className="mb-3 text-xs text-charcoal/50">
          この{confirmed.length}件は例規集から自動で確認できました。組合に聞く必要はありません。
        </p>
        <div className="flex flex-wrap gap-2">
          {confirmed.map((item) => (
            <span
              key={item.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-charcoal/10 bg-white/60 px-3 py-1.5 text-xs text-charcoal/60"
            >
              <span aria-hidden className="text-accent/70">
                ✓
              </span>
              {item.label}
            </span>
          ))}
          {confirmed.length === 0 && (
            <span className="text-xs text-charcoal/45">
              自動確認できた例規外項目はありませんでした。
            </span>
          )}
        </div>
      </section>

      <p className="mt-10 text-xs leading-relaxed text-charcoal/50">
        この一覧は運用確認用です。A〜C の {askCount} 件を組合と確認・更新すれば、
        {municipality}版ポータルの掲載内容を最新に保てます。数値項目の根拠は /sources に掲載しています。
      </p>
    </PageLayout>
  );
}
