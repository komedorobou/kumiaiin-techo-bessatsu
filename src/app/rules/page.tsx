'use client';

import { useState, useMemo, useCallback } from 'react';
import PageLayout from '@/components/PageLayout';
import { rulesChapters, RulesChapter } from '@/data/rulesData';

export default function RulesPage() {
  const [selectedChapter, setSelectedChapter] = useState<string>(rulesChapters[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentChapter = rulesChapters.find((c) => c.id === selectedChapter)!;

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.trim().toLowerCase();
    const results: { chapter: RulesChapter; articleIdx: number; snippet: string }[] = [];

    for (const chapter of rulesChapters) {
      for (let i = 0; i < chapter.articles.length; i++) {
        const article = chapter.articles[i];
        const fullText = `${article.number} ${article.subtitle || ''} ${article.content}`;
        if (fullText.toLowerCase().includes(q)) {
          const idx = fullText.toLowerCase().indexOf(q);
          const start = Math.max(0, idx - 30);
          const end = Math.min(fullText.length, idx + q.length + 30);
          const snippet = (start > 0 ? '...' : '') + fullText.slice(start, end) + (end < fullText.length ? '...' : '');
          results.push({ chapter, articleIdx: i, snippet });
        }
      }
    }
    return results;
  }, [searchQuery]);

  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? `<mark>${part}</mark>` : part
    ).join('');
  }, []);

  const navigateToArticle = (chapterId: string) => {
    setSelectedChapter(chapterId);
    setSearchQuery('');
    setSidebarOpen(false);
  };

  return (
    <PageLayout
      title="規約ビューア"
      subtitle="岸和田市職員労働組合規約"
    >
      <div className="flex gap-8 relative">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-accent text-white shadow-lg flex items-center justify-center"
          aria-label="章を選択"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-20 lg:top-24 z-30 lg:z-0
            w-72 lg:w-56 shrink-0 max-h-[calc(100vh-6rem)] overflow-y-auto
            transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            left-0 lg:left-auto
            bg-base lg:bg-transparent
            p-4 lg:p-0
            shadow-2xl lg:shadow-none
            rounded-r-2xl lg:rounded-none
          `}
        >
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30"
              >
                <circle cx="7" cy="7" r="4.5" />
                <path d="M10.5 10.5L14 14" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="全文検索..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all"
              />
            </div>
          </div>

          {/* Search results */}
          {searchResults && searchResults.length > 0 ? (
            <div className="mb-4">
              <p className="text-[10px] text-charcoal/40 mb-2">{searchResults.length}件の結果</p>
              <div className="space-y-1">
                {searchResults.slice(0, 20).map((r, i) => (
                  <button
                    key={i}
                    onClick={() => navigateToArticle(r.chapter.id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <p className="text-[10px] text-accent/60">{r.chapter.title}</p>
                    <p
                      className="text-xs text-charcoal/60 mt-0.5 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: highlightText(r.snippet, searchQuery) }}
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : searchResults && searchQuery.trim() ? (
            <p className="text-xs text-charcoal/30 mb-4 px-3">該当する条文が見つかりません</p>
          ) : null}

          {/* Chapter nav */}
          <nav className="space-y-0.5">
            {rulesChapters.map((ch) => (
              <button
                key={ch.id}
                onClick={() => navigateToArticle(ch.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all ${
                  selectedChapter === ch.id
                    ? 'bg-accent/10 text-accent font-medium'
                    : 'text-charcoal/50 hover:bg-accent/5 hover:text-charcoal/70'
                }`}
              >
                {ch.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/10 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0 animate-fade-in-delay-1">
          <div className="glass-card-strong rounded-2xl p-6 sm:p-8 lg:p-10">
            <h2 className="text-xl font-bold text-accent mb-8">
              {currentChapter.title}
            </h2>

            <div className="rules-text space-y-8">
              {currentChapter.articles.map((article) => (
                <article key={article.number} className="group">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono text-accent/40 bg-accent/[0.04] px-2 py-1 rounded shrink-0 mt-0.5">
                      {article.number}
                    </span>
                    <div className="flex-1">
                      {article.subtitle && (
                        <h3 className="text-sm font-semibold text-charcoal/80 mb-2">
                          {article.subtitle}
                        </h3>
                      )}
                      <div className="text-sm text-charcoal/60 leading-[1.9] whitespace-pre-line">
                        {searchQuery.trim()
                          ? <span dangerouslySetInnerHTML={{ __html: highlightText(article.content, searchQuery) }} />
                          : article.content
                        }
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Chapter navigation */}
            <div className="mt-12 flex justify-between border-t border-gray-100 pt-6">
              {(() => {
                const idx = rulesChapters.findIndex((c) => c.id === selectedChapter);
                const prev = idx > 0 ? rulesChapters[idx - 1] : null;
                const next = idx < rulesChapters.length - 1 ? rulesChapters[idx + 1] : null;
                return (
                  <>
                    {prev ? (
                      <button
                        onClick={() => navigateToArticle(prev.id)}
                        className="text-xs text-charcoal/40 hover:text-accent transition-colors flex items-center gap-1"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M9 3L5 7l4 4" />
                        </svg>
                        {prev.title}
                      </button>
                    ) : <span />}
                    {next ? (
                      <button
                        onClick={() => navigateToArticle(next.id)}
                        className="text-xs text-charcoal/40 hover:text-accent transition-colors flex items-center gap-1"
                      >
                        {next.title}
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M5 3l4 4-4 4" />
                        </svg>
                      </button>
                    ) : <span />}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
