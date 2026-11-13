import { Check, Copy, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { KNOWLEDGE_BASE, KnowledgeArticle } from '../data/itData';

const CATEGORIES: ('All' | KnowledgeArticle['category'])[] = [
  'All',
  'Networking',
  'Windows',
  'Linux',
  'Identity & Access',
  'Security',
];

const DIFFICULTIES: ('All' | KnowledgeArticle['difficulty'])[] = [
  'All',
  'Beginner',
  'Intermediate',
  'Advanced',
];

export default function KnowledgeBaseSection() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'All' | KnowledgeArticle['category']>('All');
  const [difficulty, setDifficulty] = useState<'All' | KnowledgeArticle['difficulty']>('All');
  const [selectedId, setSelectedId] = useState<string>(KNOWLEDGE_BASE[0].id);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return KNOWLEDGE_BASE.filter((art) => {
      if (category !== 'All' && art.category !== category) return false;
      if (difficulty !== 'All' && art.difficulty !== difficulty) return false;
      if (!q) return true;
      const haystack = [
        art.title,
        art.category,
        ...art.symptoms,
        ...art.possibleCauses,
        ...art.diagnosticCommands.map((c) => `${c.label} ${c.command}`),
        ...art.solutions,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, category, difficulty]);

  const activeArticle =
    filteredArticles.find((a) => a.id === selectedId) ?? filteredArticles[0] ?? null;

  const handleCopy = (cmd: string) => {
    navigator.clipboard?.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  return (
    <section id="kb" className="bg-slate-50 py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="border-b border-slate-200 pb-6">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            05. IT Knowledge Base
          </h2>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            Searchable production runbooks structured by real-world symptoms, root causes, copyable diagnostic commands, remediation steps, and prevention controls.
          </p>

          {/* Search & Filter Toolbar */}
          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                maxLength={120}
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search symptoms, commands, error codes (e.g. 0x80070035, ss, MTU)..."
                aria-label="Search IT knowledge base"
                className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Category segmented filter */}
              <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-200/70 p-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      category === cat
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Difficulty segmented filter */}
              <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
                {DIFFICULTIES.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      difficulty === lvl
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Split */}
        {filteredArticles.length === 0 ? (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="font-display text-base font-semibold text-slate-900">
              No matching runbooks found
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Try clearing your search filter or switching to All categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCategory('All');
                setDifficulty('All');
              }}
              className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Runbook List */}
            <div className="space-y-2.5 lg:col-span-5">
              <p className="text-xs font-medium text-slate-500 tabular-nums">
                Showing {filteredArticles.length} of {KNOWLEDGE_BASE.length} runbooks
              </p>

              {filteredArticles.map((art) => {
                const isSelected = activeArticle?.id === art.id;
                return (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => setSelectedId(art.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-white shadow-sm'
                        : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-blue-700">{art.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{art.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span>Updated {art.updated}</span>
                    </div>
                    <h3 className="mt-1.5 font-display text-sm font-semibold text-slate-900">
                      {art.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                      {art.symptoms[0]}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selected Runbook Detail */}
            {activeArticle && (
              <div className="lg:col-span-7">
                <article className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-blue-700">{activeArticle.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>Difficulty: {activeArticle.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span>Updated {activeArticle.updated}</span>
                  </div>

                  <h3 className="mt-2 font-display text-2xl font-bold text-slate-900" style={{ textWrap: 'balance' }}>
                    {activeArticle.title}
                  </h3>

                  {/* Symptoms & Possible Causes */}
                  <div className="mt-6 grid grid-cols-1 gap-6 border-t border-slate-200 pt-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-display text-sm font-semibold text-slate-900">
                        Symptoms
                      </h4>
                      <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-slate-700">
                        {activeArticle.symptoms.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-display text-sm font-semibold text-slate-900">
                        Possible Causes
                      </h4>
                      <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-slate-700">
                        {activeArticle.possibleCauses.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Diagnostic Commands */}
                  <div className="mt-6 border-t border-slate-200 pt-6">
                    <h4 className="font-display text-sm font-semibold text-slate-900">
                      Diagnostic Commands
                    </h4>
                    <div className="mt-3 space-y-2.5">
                      {activeArticle.diagnosticCommands.map((item) => (
                        <div key={item.command} className="space-y-1">
                          <div className="text-xs font-medium text-slate-600">{item.label}</div>
                          <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-slate-100">
                            <code className="overflow-x-auto whitespace-nowrap">{item.command}</code>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.command)}
                              className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white shrink-0 cursor-pointer"
                            >
                              {copiedCmd === item.command ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              {copiedCmd === item.command ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Solutions & Prevention */}
                  <div className="mt-6 grid grid-cols-1 gap-6 border-t border-slate-200 pt-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-display text-sm font-semibold text-slate-900">
                        Solutions
                      </h4>
                      <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-slate-700">
                        {activeArticle.solutions.map((sol, idx) => (
                          <li key={idx}>{sol}</li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-display text-sm font-semibold text-slate-900">
                        Prevention
                      </h4>
                      <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-slate-700">
                        {activeArticle.prevention.map((prev, idx) => (
                          <li key={idx}>{prev}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
