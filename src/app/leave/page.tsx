'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { leaveCategories, LeaveCategory, LeaveItem } from '@/data/leaveData';

export default function LeavePage() {
  const [selectedCategory, setSelectedCategory] = useState<LeaveCategory | null>(null);

  return (
    <PageLayout
      title="休暇ガイド"
      subtitle="ライフイベントに応じた休暇制度を確認できます"
    >
      {!selectedCategory ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaveCategories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className={`glass-card-strong rounded-2xl p-6 text-left hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-fade-in-delay-${Math.min(i + 1, 4)}`}
            >
              <div className="text-3xl mb-3">{cat.emoji}</div>
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
            <span className="text-3xl">{selectedCategory.emoji}</span>
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
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-charcoal">{item.name}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              item.type.includes('有給')
                ? 'bg-green-50 text-green-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {item.type}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-accent">{item.days}</span>
          </div>
        </div>
        <div className={`w-6 h-6 rounded-full bg-accent/5 flex items-center justify-center shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent/50">
            <path d="M3 5l3 3 3-3" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-gray-100 pt-4">
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-charcoal/40">条件</span>
              <p className="text-charcoal/70 mt-0.5">{item.conditions}</p>
            </div>
            {item.unit && (
              <div>
                <span className="text-xs text-charcoal/40">取得単位</span>
                <p className="text-charcoal/70 mt-0.5">{item.unit}</p>
              </div>
            )}
            {item.notes && (
              <div>
                <span className="text-xs text-charcoal/40">備考</span>
                <p className="text-charcoal/70 mt-0.5">{item.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
