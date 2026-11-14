import { AlertTriangle, CheckCircle2, Eye } from 'lucide-react';
import { useState } from 'react';
import { AWARENESS_LESSONS } from '../data/itData';
import { CyberShieldGraphic } from './TechIllustrations';

export default function AwarenessSection() {
  const [activeLessonId, setActiveLessonId] = useState<string>(AWARENESS_LESSONS[0].id);
  const [flaggedClues, setFlaggedClues] = useState<Record<string, string[]>>({});
  const [selectedQuizOption, setSelectedQuizOption] = useState<Record<string, string>>({});

  const lesson =
    AWARENESS_LESSONS.find((l) => l.id === activeLessonId) ?? AWARENESS_LESSONS[0];
  const foundClues = flaggedClues[lesson.id] ?? [];
  const chosenOptionId = selectedQuizOption[lesson.id] ?? '';
  const chosenOption = lesson.quizOptions.find((o) => o.id === chosenOptionId);

  const handleToggleClue = (clueId: string) => {
    setFlaggedClues((prev) => {
      const current = prev[lesson.id] ?? [];
      if (current.includes(clueId)) return prev;
      return {
        ...prev,
        [lesson.id]: [...current, clueId],
      };
    });
  };

  return (
    <section id="awareness" className="border-b border-slate-800/80 bg-[#0E182A] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col justify-between gap-6 border-b border-slate-800 pb-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold text-[#06B6D4]">
              01. Cybersecurity & Digital Safety
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
              IT Awareness of the Week
            </h2>
            <p className="mt-2 text-base text-[#CBD5E1]">
              Concise weekly briefings on phishing, rogue Wi-Fi hotspots, data protection, and credential hygiene. Inspect the simulated prompt below to uncover every threat indicator.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Select weekly awareness briefing"
            className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-700/70 bg-[#0B1220] p-1"
          >
            {AWARENESS_LESSONS.map((item) => {
              const active = item.id === lesson.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveLessonId(item.id)}
                  className={`rounded-md px-3 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  {item.weekLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: 3D Cybersecurity Graphic + Defense Checklist */}
          <div className="space-y-6 lg:col-span-5">
            <div className="glass-surface overflow-hidden rounded-2xl">
              <div className="h-52 w-full border-b border-slate-700/60 bg-[#0B1220]">
                <CyberShieldGraphic />
              </div>

              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-[#06B6D4]">{lesson.weekLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#CBD5E1]">{lesson.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{lesson.readTime}</span>
                </div>

                <h3
                  className="mt-2 font-display text-xl font-bold text-[#F8FAFC]"
                  style={{ textWrap: 'balance' }}
                >
                  {lesson.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-[#CBD5E1]">{lesson.summary}</p>

                <div className="mt-5 border-t border-slate-700/60 pt-4">
                  <h4 className="text-xs font-semibold text-[#F8FAFC]">Key Defense Habits</h4>
                  <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-[#CBD5E1]">
                    {lesson.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-mono text-[#F59E0B] shrink-0">0{idx + 1}.</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 border-t border-slate-700/60 pt-4">
                  <h4 className="text-xs font-semibold text-[#F8FAFC]">Verification Checklist</h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-[#CBD5E1]">
                    {lesson.defenseChecklist.map((chk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        <span>{chk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Threat Inspector & Decision Check */}
          <div className="space-y-6 lg:col-span-7">
            <div className="glass-surface rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-display text-base font-semibold text-[#F8FAFC]">
                    Interactive Drill: Inspect the Suspicious Prompt
                  </h4>
                  <p className="mt-0.5 text-xs text-[#CBD5E1]">
                    Click each suspicious indicator below to inspect how attackers craft social engineering traps.
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold text-[#06B6D4] tabular-nums">
                  {foundClues.length} / {lesson.clues.length} Inspected
                </span>
              </div>

              {/* Simulated Message Canvas */}
              <div className="mt-4 rounded-xl border border-slate-700 bg-[#0B1220] p-5">
                <div className="border-b border-slate-800 pb-3 text-xs">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold text-[#F8FAFC]">{lesson.senderName}</span>
                    <span className="font-mono text-[#F59E0B]">&lt;{lesson.senderAddress}&gt;</span>
                  </div>
                  <div className="mt-1 font-semibold text-[#CBD5E1]">
                    Subject: {lesson.subject}
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#CBD5E1]">
                  {lesson.bodyLines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
                  <span className="inline-flex items-center rounded-lg border border-slate-700 bg-[#14243A] px-4 py-2 text-xs font-semibold text-[#F8FAFC]">
                    {lesson.ctaText}
                  </span>
                  <span className="font-mono text-[11px] text-cyan-300 break-all">
                    Target URL: {lesson.ctaActualUrl}
                  </span>
                </div>
              </div>

              {/* Clickable Clue Inspector Buttons */}
              <div className="mt-5 space-y-2.5">
                <p className="text-xs font-semibold text-[#CBD5E1]">Select Indicators to Analyze:</p>
                {lesson.clues.map((clue) => {
                  const inspected = foundClues.includes(clue.id);
                  return (
                    <div key={clue.id} className="rounded-xl border border-slate-700/80 bg-[#0B1220]">
                      <button
                        type="button"
                        onClick={() => handleToggleClue(clue.id)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-xs font-medium text-[#CBD5E1] hover:bg-[#14243A]/70 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Eye className="h-3.5 w-3.5 text-[#06B6D4] shrink-0" />
                          <span>
                            <strong className="text-[#F8FAFC]">{clue.regionLabel}: </strong>
                            {clue.label}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 font-semibold ${
                            inspected ? 'text-[#F59E0B]' : 'text-[#06B6D4]'
                          }`}
                        >
                          {inspected ? clue.severity : 'Inspect'}
                        </span>
                      </button>

                      {inspected && (
                        <div className="border-t border-slate-800 bg-[#14243A]/60 px-4 py-3 text-xs leading-relaxed text-[#CBD5E1]">
                          {clue.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scenario Decision Check */}
            <div className="glass-surface rounded-2xl p-6">
              <h4 className="font-display text-base font-semibold text-[#F8FAFC]">
                Quick Decision Check
              </h4>
              <p className="mt-1.5 text-sm text-[#CBD5E1]">{lesson.quizQuestion}</p>

              <div className="mt-4 space-y-2">
                {lesson.quizOptions.map((opt) => {
                  const isSelected = chosenOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setSelectedQuizOption((prev) => ({ ...prev, [lesson.id]: opt.id }))
                      }
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? opt.isCorrect
                            ? 'border-emerald-500/70 bg-emerald-950/50 text-emerald-200'
                            : 'border-red-500/70 bg-red-950/50 text-red-200'
                          : 'border-slate-700 bg-[#0B1220] text-[#CBD5E1] hover:border-cyan-500/50 hover:text-white'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <span className="shrink-0 font-semibold">
                          {opt.isCorrect ? 'Correct' : 'Unsafe'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {chosenOption && (
                <div
                  className={`mt-3 flex items-start gap-2 rounded-xl border p-3.5 text-xs leading-relaxed ${
                    chosenOption.isCorrect
                      ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200'
                      : 'border-amber-500/50 bg-amber-950/40 text-amber-200'
                  }`}
                >
                  {chosenOption.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  )}
                  <span>{chosenOption.feedback}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
