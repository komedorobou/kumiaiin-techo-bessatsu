'use client';

import { useState, ReactNode } from 'react';
import PageLayout from '@/components/PageLayout';
import {
  leaveCategories,
  LeaveCategory,
  LeaveItem,
  TimelineStep,
  FamilyChartEntry,
  LeaveSubItem,
} from '@/data/leaveData';

/* ── Category SVG Icons (24px, line-style) ── */
const categoryIcons: Record<string, ReactNode> = {
  daily: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  ),
  illness: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4M16 2v4" />
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <path d="M12 14v4M10 16h4" />
      <circle cx="12" cy="16" r="6" />
    </svg>
  ),
  marriage: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="13" r="4" />
      <circle cx="15" cy="13" r="4" />
      <path d="M12 3l1.5 3.5L17 7l-2.5 2.5L15 13l-3-2-3 2 .5-3.5L7 7l3.5-.5z" />
    </svg>
  ),
  childbirth: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="6" r="3" />
      <path d="M9 12h6" />
      <path d="M8 21c0-3 1.5-5 4-5s4 2 4 5" />
      <path d="M12 12v4" />
      <path d="M9 15.5c-2 .5-3 2-3 3.5" />
      <path d="M15 15.5c2 .5 3 2 3 3.5" />
    </svg>
  ),
  childcare: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="5" r="2.5" />
      <circle cx="17" cy="7" r="2" />
      <path d="M5 14c0-2.5 1.8-4 4-4s4 1.5 4 4v7H5v-7z" />
      <path d="M14 16c0-2 1.2-3 3-3s3 1 3 3v5h-6v-5z" />
    </svg>
  ),
  nursing: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" />
      <path d="M8 22l1-7H5l3-5h8l3 5h-4l1 7H8z" />
      <path d="M4 15h2M18 15h2" />
    </svg>
  ),
  bereavement: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V8" />
      <path d="M9 3c-1.5 0-3 1-3 3s3 4 6 2c3 2 6 0 6-2s-1.5-3-3-3c-1 0-2 .5-3 1.5C11 4 10 3.5 9 3z" />
      <path d="M7 14c-2 0-3.5 1.5-3.5 3s1.5 3 3.5 3M17 14c2 0 3.5 1.5 3.5 3s-1.5 3-3.5 3" />
    </svg>
  ),
  other: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 10h8M8 14h4" />
      <circle cx="8" cy="18" r="0.5" fill="currentColor" />
      <circle cx="12" cy="18" r="0.5" fill="currentColor" />
      <circle cx="16" cy="18" r="0.5" fill="currentColor" />
    </svg>
  ),
};

/* ── Badge inline SVG icons (14px) ── */
function PaidIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block shrink-0">
      <circle cx="7" cy="7" r="6" />
      <path d="M4.5 7l2 2 3.5-3.5" />
    </svg>
  );
}

function UnpaidIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block shrink-0">
      <circle cx="7" cy="7" r="6" />
      <path d="M5 5l4 4M9 5l-4 4" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block shrink-0">
      <circle cx="7" cy="7" r="6" />
      <path d="M7 4v3.5l2 1.5" />
    </svg>
  );
}

function MixedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block shrink-0">
      <circle cx="7" cy="7" r="6" />
      <path d="M7 4v4M7 10h.01" />
    </svg>
  );
}

/* ── Document icon for required documents ── */
function DocumentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block shrink-0 text-accent/50">
      <path d="M8 1H3.5A1.5 1.5 0 002 2.5v9A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V5L8 1z" />
      <path d="M8 1v4h4" />
      <path d="M5 7.5h4M5 10h2.5" />
    </svg>
  );
}

export default function LeavePage() {
  const [selectedCategory, setSelectedCategory] = useState<LeaveCategory | null>(null);

  return (
    <PageLayout
      title="休暇ガイド"
      subtitle="ライフイベントに応じた休暇制度を確認できます（服務・勤怠関係事務 R7.10.1改定準拠）"
    >
      {!selectedCategory ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {leaveCategories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className={`glass-card-strong rounded-2xl p-6 text-left hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-fade-in-delay-${Math.min(i + 1, 4)}`}
            >
              <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent mb-3 group-hover:bg-accent/10 transition-colors">
                {categoryIcons[cat.id] || cat.emoji}
              </div>
              <h2 className="text-lg font-semibold text-charcoal group-hover:text-accent transition-colors">
                {cat.title}
              </h2>
              <p className="mt-2 text-xs text-charcoal/40 leading-relaxed">
                {cat.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs text-accent/40 group-hover:text-accent/70 transition-colors">
                <span>{cat.items.length}件の休暇</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M5 3l4 4-4 4" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-sm text-charcoal/40 hover:text-accent transition-colors mb-8 animate-fade-in"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10 4L6 8l4 4" />
            </svg>
            一覧に戻る
          </button>

          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
              {categoryIcons[selectedCategory.id] || selectedCategory.emoji}
            </div>
            <div>
              <h2 className="text-xl font-bold text-charcoal">{selectedCategory.title}</h2>
              <p className="text-xs text-charcoal/40">{selectedCategory.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            {selectedCategory.items.map((item, i) => (
              <LeaveCard key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
}

function LeaveCard({ item, index }: { item: LeaveItem; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`glass-card-strong rounded-2xl overflow-hidden animate-fade-in-delay-${Math.min(index + 1, 4)}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-charcoal">{item.name}</h3>
            <PayBadge type={item.type} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-accent">{item.days}</span>
          </div>
          {item.eligibility && (
            <div className="mt-1.5 flex gap-1 flex-wrap">
              {item.eligibility.split('・').map((e, i) => (
                <span
                  key={i}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-accent/5 text-accent/60"
                >
                  {e}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={`w-6 h-6 rounded-full bg-accent/5 flex items-center justify-center shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent/50">
            <path d="M3 5l3 3 3-3" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-gray-100 pt-4">
          <div className="space-y-4 text-sm">
            {/* 条件 */}
            <DetailRow label="条件" value={item.conditions} />

            {/* 取得単位 */}
            {item.unit && <DetailRow label="取得単位" value={item.unit} />}

            {/* 必要書類 */}
            {item.documents && (
              <div>
                <span className="text-xs text-charcoal/40 font-medium inline-flex items-center gap-1">
                  <DocumentIcon />
                  必要書類
                </span>
                <p className="text-charcoal/70 mt-0.5 leading-relaxed whitespace-pre-line">{item.documents}</p>
              </div>
            )}

            {/* サブアイテム */}
            {item.subItems && item.subItems.length > 0 && (
              <SubItemsList items={item.subItems} />
            )}

            {/* テーブル（中途採用者付与日数等） */}
            {item.table && <DataTable headers={item.table.headers} rows={item.table.rows} />}

            {/* タイムライン（病気休暇給与支給図） */}
            {item.timeline && item.timeline.length > 0 && (
              <PayTimeline steps={item.timeline} />
            )}

            {/* 忌引日数図 */}
            {item.familyChart && item.familyChart.length > 0 && (
              <FamilyDaysChart entries={item.familyChart} />
            )}

            {/* 備考 */}
            {item.notes && <DetailRow label="備考" value={item.notes} />}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 有給/無給バッジ ── */
function PayBadge({ type }: { type: string }) {
  const isUnpaid = type.includes('無給');
  const isPaid = type.includes('有給');
  const isMixed = isPaid && isUnpaid;
  const isSystem = type.includes('制度') || type.includes('給付金');

  let bgClass = 'bg-green-50 text-green-700';
  if (isSystem) bgClass = 'bg-blue-50 text-blue-700';
  else if (isMixed) bgClass = 'bg-amber-50 text-amber-700';
  else if (isUnpaid) bgClass = 'bg-gray-100 text-gray-600';

  const icon = isSystem ? <SystemIcon /> : isMixed ? <MixedIcon /> : isPaid ? <PaidIcon /> : isUnpaid ? <UnpaidIcon /> : null;

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap inline-flex items-center gap-1 ${bgClass}`}>
      {icon}
      {type}
    </span>
  );
}

/* ── 詳細行 ── */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-charcoal/40 font-medium">{label}</span>
      <p className="text-charcoal/70 mt-0.5 leading-relaxed whitespace-pre-line">{value}</p>
    </div>
  );
}

/* ── サブアイテム一覧 ── */
function SubItemsList({ items }: { items: LeaveSubItem[] }) {
  return (
    <div>
      <span className="text-xs text-charcoal/40 font-medium">詳細</span>
      <div className="mt-1.5 space-y-1.5">
        {items.map((sub, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-xs font-medium text-accent bg-accent/5 rounded px-1.5 py-0.5 shrink-0 mt-0.5">
              {sub.label}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-charcoal/70 text-sm">{sub.value}</span>
              {sub.note && (
                <span className="block text-xs text-charcoal/40 mt-0.5">{sub.note}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── データテーブル ── */
function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div>
      <span className="text-xs text-charcoal/40 font-medium">中途採用者の付与日数</span>
      <div className="mt-1.5 overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
        <table className="min-w-full text-xs border-collapse">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`py-1.5 px-2 text-center font-medium text-charcoal/50 border-b border-gray-200 ${i === 0 ? 'text-left sticky left-0 bg-white/90 z-10' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`py-1.5 px-2 text-center text-charcoal/70 border-b border-gray-100 ${ci === 0 ? 'text-left font-medium sticky left-0 bg-white/90 z-10' : ''}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── 給与支給タイムライン（病気休暇用） ── */
function PayTimeline({ steps }: { steps: TimelineStep[] }) {
  const colorMap = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400',
  };

  const bgColorMap = {
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
    gray: 'bg-gray-50 border-gray-200',
  };

  return (
    <div>
      <span className="text-xs text-charcoal/40 font-medium">給与支給の流れ</span>
      <div className="mt-2 flex flex-col gap-0">
        {steps.map((step, i) => (
          <div key={i} className="flex items-stretch gap-3">
            {/* 左のタイムラインバー */}
            <div className="flex flex-col items-center w-3 shrink-0">
              <div className={`w-3 h-3 rounded-full ${colorMap[step.color]} shrink-0 mt-2.5`} />
              {i < steps.length - 1 && (
                <div className="w-0.5 flex-1 bg-gray-200 my-0.5" />
              )}
            </div>
            {/* 右のコンテンツ */}
            <div className={`flex-1 rounded-lg border p-2.5 mb-2 ${bgColorMap[step.color]}`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-semibold text-charcoal/80">{step.label}</span>
                {step.duration && (
                  <span className="text-xs font-bold text-charcoal/60">{step.duration}</span>
                )}
              </div>
              {step.pay && (
                <span className="text-[11px] text-charcoal/50 mt-0.5 block">{step.pay}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 忌引日数表 ── */
function FamilyDaysChart({ entries }: { entries: FamilyChartEntry[] }) {
  // Group by days descending for visual hierarchy
  const sorted = [...entries].sort((a, b) => b.days - a.days);

  const dayColorMap: Record<number, string> = {
    7: 'bg-accent/20 text-accent border-accent/30',
    6: 'bg-accent/15 text-accent border-accent/25',
    5: 'bg-accent/12 text-accent/90 border-accent/20',
    4: 'bg-accent/10 text-accent/80 border-accent/15',
    3: 'bg-accent/8 text-accent/70 border-accent/12',
    2: 'bg-accent/5 text-accent/60 border-accent/10',
    1: 'bg-gray-50 text-charcoal/50 border-gray-200',
  };

  return (
    <div>
      <span className="text-xs text-charcoal/40 font-medium">続柄別の付与日数</span>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {sorted.map((entry, i) => {
          const colorClass = dayColorMap[entry.days] || dayColorMap[1];
          return (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 ${colorClass}`}
            >
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium">{entry.relation}</span>
                {entry.note && (
                  <span className="block text-[10px] opacity-60 mt-0.5">{entry.note}</span>
                )}
              </div>
              <span className="text-sm font-bold ml-2 shrink-0">{entry.days}日</span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-charcoal/40 mt-2">
        ※ 遠隔地の場合は1日加算（移動手段が分かる書類を添付）
      </p>
    </div>
  );
}
