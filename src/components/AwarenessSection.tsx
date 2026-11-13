import { AlertTriangle, CheckCircle2, Eye, Shield } from 'lucide-react';
import { useState } from 'react';
import awarenessPhishingImg from '../assets/images/awareness_phishing_briefing_1794586743313.jpg';
import { AWARENESS_LESSONS } from '../data/itData';

export default function AwarenessSection() {
  const [activeLessonId, setActiveLessonId] = useState<string>(AWARENESS_LESSONS[0].id);
  const [flaggedClues, setFlaggedClues] = useState<Record<string, string[]>>({});
  const [selectedQuizOption, setSelectedQuizOption] = useState<Record<string, string>>({});
  const [imgError, setImgError] = useState(false);

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
    <section id="awareness" className="border-b border-slate-200 bg-slate-50 py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              03. IT Awareness of the Week
            </h2>
            <p className="mt-2 text-base text-slate-600">
              Concise weekly threat briefings covering phishing, rogue hotspots, data protection, and credential safety. Inspect the simulated message below to spot every red flag.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Select weekly awareness briefing"
            className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-200/70 p-1"
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
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.weekLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Editorial Lesson & Defense Checklist */}
          <div className="space-y-6 lg:col-span-5">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="h-48 w-full overflow-hidden border-b border-slate-200 bg-slate-100">
                {!imgError ? (
                  <img
                    src={awarenessPhishingImg}
                    alt="Minimalist technical illustration of digital identity protection filtering a phishing signal"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-100 text-slate-500">
                    <Shield className="h-10 w-10 text-blue-700" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-blue-700">{lesson.weekLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{lesson.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{lesson.readTime}</span>
                </div>

                <h3 className="mt-2 font-display text-xl font-bold text-slate-900" style={{ textWrap: 'balance' }}>
                  {lesson.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">{lesson.summary}</p>

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <h4 className="text-xs font-semibold text-slate-900">Key Defense Habits</h4>
                  <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-700">
                    {lesson.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-mono text-blue-700 shrink-0">0{idx + 1}.</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <h4 className="text-xs font-semibold text-slate-900">Verification Checklist</h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                    {lesson.defenseChecklist.map((chk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                        <span>{chk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Threat Inspector & Quick Check */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-display text-base font-semibold text-slate-900">
                    Interactive Drill: Inspect the Suspicious Prompt
                  </h4>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Click each suspicious indicator below to inspect why attackers rely on it.
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
                  {foundClues.length} / {lesson.clues.length} Indicators Inspected
                </span>
              </div>

              {/* Simulated Message Canvas */}
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
                <div className="border-b border-slate-200 pb-3 text-xs">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold text-slate-900">{lesson.senderName}</span>
                    <span className="font-mono text-slate-600">&lt;{lesson.senderAddress}&gt;</span>
                  </div>
                  <div className="mt-1 font-semibold text-slate-800">
                    Subject: {lesson.subject}
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                  {lesson.bodyLines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                  <span className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700">
                    {lesson.ctaText}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500 break-all">
                    Target URL: {lesson.ctaActualUrl}
                  </span>
                </div>
              </div>

              {/* Clickable Clue Inspector Buttons */}
              <div className="mt-5 space-y-2.5">
                <p className="text-xs font-semibold text-slate-700">Select Indicators to Analyze:</p>
                {lesson.clues.map((clue) => {
                  const inspected = foundClues.includes(clue.id);
                  return (
                    <div key={clue.id} className="rounded-lg border border-slate-200 bg-white">
                      <button
                        type="button"
                        onClick={() => handleToggleClue(clue.id)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-xs font-medium text-slate-800 hover:bg-slate-50 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Eye className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                          <span>
                            <strong className="text-slate-900">{clue.regionLabel}: </strong>
                            {clue.label}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 font-semibold ${
                            inspected ? 'text-red-700' : 'text-blue-700'
                          }`}
                        >
                          {inspected ? clue.severity : 'Inspect'}
                        </span>
                      </button>

                      {inspected && (
                        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-700">
                          {clue.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scenario Decision Check */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h4 className="font-display text-base font-semibold text-slate-900">
                Quick Decision Check
              </h4>
              <p className="mt-1.5 text-sm text-slate-700">{lesson.quizQuestion}</p>

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
                      className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? opt.isCorrect
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                            : 'border-red-400 bg-red-50 text-red-900'
                          : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
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
                  className={`mt-3 flex items-start gap-2 rounded-lg border p-3 text-xs leading-relaxed ${
                    chosenOption.isCorrect
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-amber-200 bg-amber-50 text-amber-900'
                  }`}
                >
                  {chosenOption.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
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
