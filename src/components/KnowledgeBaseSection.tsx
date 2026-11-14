import { Check, Copy, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { KNOWLEDGE_BASE, KnowledgeArticle } from '../data/itData';
import type { AdminKBGuide } from '../types/admin';

interface KnowledgeBaseSectionProps {
  guides?: AdminKBGuide[];
}

const DIFFICULTIES: ('All' | KnowledgeArticle['difficulty'])[] = [
  'All',
  'Beginner',
  'Intermediate',
  'Advanced',
];

function parseCommands(commands: string[]): { label: string; command: string }[] {
  return commands.map((raw, idx) => {
    const colonIdx = raw.indexOf(':');
    if (colonIdx > 0 && colonIdx < 45) {
      return {
        label: raw.slice(0, colonIdx).trim(),
        command: raw.slice(colonIdx + 1).trim(),
      };
    }
    return { label: `Command ${idx + 1}`, command: raw };
  });
}

export default function KnowledgeBaseSection({ guides }: KnowledgeBaseSectionProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [difficulty, setDifficulty] = useState<'All' | KnowledgeArticle['difficulty']>('All');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const runbooks: KnowledgeArticle[] = useMemo(() => {
    if (!guides) return KNOWLEDGE_BASE;
    return guides
      .filter((g) => g.status === 'Published')
      .map((g) => {
        const template = KNOWLEDGE_BASE.find((k) => k.id === g.id);
        return {
          id: g.id,
          category: (template?.category ?? g.category) as KnowledgeArticle['category'],
          difficulty: g.difficulty,
          updated: g.updatedAt,
          title: g.title,
          symptoms: template?.symptoms ?? g.keywords,
          possibleCauses: template?.possibleCauses ?? ['Configuration drift or dependency outage'],
          diagnosticCommands:
            g.commands.length > 0
              ? parseCommands(g.commands)
              : template?.diagnosticCommands ?? [],
          solutions: g.steps,
          prevention: template?.prevention ?? [
            'Document resolution and verify post-change health checks.',
          ],
        };
      });
  }, [guides]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(runbooks.map((r) => r.category)))],
    [runbooks]
  );

  const [selectedId, setSelectedId] = useState<string>(runbooks[0]?.id ?? '');

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return runbooks.filter((art) => {
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
  }, [runbooks, query, category, difficulty]);

  const activeArticle =
    filteredArticles.find((a) => a.id === selectedId) ?? filteredArticles[0] ?? null;

  const handleCopy = (cmd: string) => {
    navigator.clipboard?.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  return (
    <section id="kb" className="border-b border-slate-800/80 bg-[#0F1B2E] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="border-b border-slate-800 pb-6">
          <p className="font-mono text-xs font-semibold text-[#06B6D4]">
            06. Technical Support & Diagnostic Runbooks
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
            IT Knowledge Base
          </h2>
          <p className="mt-2 max-w-2xl text-base text-[#CBD5E1]">
            Searchable production runbooks structured by real-world symptoms, root causes, copyable diagnostic commands, remediation steps, and prevention controls.
          </p>

          {/* Search & Filter Toolbar */}
          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                maxLength={120}
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search symptoms, commands, error codes (e.g. 0x80070035, ss, MTU)..."
                aria-label="Search IT knowledge base"
                className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B1220] pr-4 pl-10 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Category segmented filter */}
              <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-[#0B1220] p-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      category === cat
                        ? 'bg-[#2563EB] text-white'
                        : 'text-[#CBD5E1] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Difficulty segmented filter */}
              <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0B1220] p-1">
                {DIFFICULTIES.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      difficulty === lvl
                        ? 'bg-[#06B6D4] text-[#070D18] font-semibold'
                        : 'text-[#CBD5E1] hover:text-white'
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
          <div className="glass-surface mt-8 rounded-2xl p-10 text-center">
            <p className="font-display text-base font-semibold text-[#F8FAFC]">
              No matching runbooks found
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Try clearing your search filter or switching to All categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCategory('All');
                setDifficulty('All');
              }}
              className="mt-4 rounded-lg border border-slate-700 bg-[#0B1220] px-4 py-2 text-xs font-semibold text-[#F8FAFC] hover:border-cyan-400 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Runbook List */}
            <div className="space-y-2.5 lg:col-span-5">
              <p className="text-xs font-medium text-slate-400 tabular-nums">
                Showing {filteredArticles.length} of {runbooks.length} runbooks
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
                        ? 'border-[#06B6D4] bg-[#14243A] shadow-lg'
                        : 'border-slate-800 bg-[#0B1220] hover:border-slate-700 hover:bg-[#14243A]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-cyan-300">{art.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-[#F59E0B]">{art.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span>Updated {art.updated}</span>
                    </div>
                    <h3 className="mt-1.5 font-display text-sm font-semibold text-[#F8FAFC]">
                      {art.title}
                    </h3>
                    {art.symptoms[0] && (
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                        {art.symptoms[0]}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Runbook Detail */}
            {activeArticle && (
              <div className="lg:col-span-7">
                <article className="glass-surface rounded-2xl p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-cyan-300">{activeArticle.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-[#F59E0B]">Difficulty: {activeArticle.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span>Updated {activeArticle.updated}</span>
                  </div>

                  <h3
                    className="mt-2 font-display text-2xl font-bold text-[#F8FAFC]"
                    style={{ textWrap: 'balance' }}
                  >
                    {activeArticle.title}
                  </h3>

                  {/* Symptoms & Possible Causes */}
                  <div className="mt-6 grid grid-cols-1 gap-6 border-t border-slate-800 pt-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-display text-sm font-semibold text-[#F8FAFC]">
                        Symptoms & Keywords
                      </h4>
                      <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-[#CBD5E1]">
                        {activeArticle.symptoms.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-display text-sm font-semibold text-[#F8FAFC]">
                        Possible Causes
                      </h4>
                      <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-[#CBD5E1]">
                        {activeArticle.possibleCauses.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Diagnostic Commands */}
                  {activeArticle.diagnosticCommands.length > 0 && (
                    <div className="mt-6 border-t border-slate-800 pt-6">
                      <h4 className="font-display text-sm font-semibold text-[#F8FAFC]">
                        Diagnostic Commands
                      </h4>
                      <div className="mt-3 space-y-2.5">
                        {activeArticle.diagnosticCommands.map((item, idx) => (
                          <div key={`${item.command}-${idx}`} className="space-y-1">
                            <div className="text-xs font-medium text-slate-400">{item.label}</div>
                            <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#070D18] px-3.5 py-2.5 font-mono text-xs text-cyan-200">
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
                  )}

                  {/* Solutions & Prevention */}
                  <div className="mt-6 grid grid-cols-1 gap-6 border-t border-slate-800 pt-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-display text-sm font-semibold text-[#F8FAFC]">
                        Solutions
                      </h4>
                      <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-[#CBD5E1]">
                        {activeArticle.solutions.map((sol, idx) => (
                          <li key={idx}>{sol}</li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-display text-sm font-semibold text-[#F8FAFC]">
                        Prevention
                      </h4>
                      <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-[#CBD5E1]">
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
