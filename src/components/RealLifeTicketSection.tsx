import { AlertCircle, Check, CheckCircle2, Copy, Play, RotateCcw, Terminal } from 'lucide-react';
import { useState } from 'react';
import { DiagnosticCheck, REAL_LIFE_TICKETS, RealLifeTicket } from '../data/itData';

interface RealLifeTicketSectionProps {
  solvedTicketIds: string[];
  onMarkSolved: (ticketId: string) => void;
}

export default function RealLifeTicketSection({
  solvedTicketIds,
  onMarkSolved,
}: RealLifeTicketSectionProps) {
  const [activeTicketId, setActiveTicketId] = useState<string>(REAL_LIFE_TICKETS[0].id);
  const [executedChecksByTicket, setExecutedChecksByTicket] = useState<Record<string, DiagnosticCheck[]>>({});
  const [selectedHypothesisByTicket, setSelectedHypothesisByTicket] = useState<Record<string, string>>({});
  const [notesByTicket, setNotesByTicket] = useState<Record<string, string>>({});
  const [submittedByTicket, setSubmittedByTicket] = useState<Record<string, boolean>>({});
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const ticket: RealLifeTicket =
    REAL_LIFE_TICKETS.find((t) => t.id === activeTicketId) ?? REAL_LIFE_TICKETS[0];

  const executedChecks = executedChecksByTicket[ticket.id] ?? [];
  const selectedHypothesisId = selectedHypothesisByTicket[ticket.id] ?? '';
  const userNotes = notesByTicket[ticket.id] ?? '';
  const isSubmitted = submittedByTicket[ticket.id] ?? false;
  const selectedHypothesis = ticket.hypotheses.find((h) => h.id === selectedHypothesisId);

  const handleRunCheck = (check: DiagnosticCheck) => {
    setExecutedChecksByTicket((prev) => {
      const existing = prev[ticket.id] ?? [];
      if (existing.some((c) => c.id === check.id)) {
        return prev;
      }
      return {
        ...prev,
        [ticket.id]: [...existing, check],
      };
    });
  };

  const handleSubmitDiagnosis = () => {
    if (!selectedHypothesisId) return;
    setSubmittedByTicket((prev) => ({ ...prev, [ticket.id]: true }));
    if (selectedHypothesis?.isCorrect) {
      onMarkSolved(ticket.id);
    }
  };

  const handleResetTicket = () => {
    setExecutedChecksByTicket((prev) => ({ ...prev, [ticket.id]: [] }));
    setSelectedHypothesisByTicket((prev) => ({ ...prev, [ticket.id]: '' }));
    setSubmittedByTicket((prev) => ({ ...prev, [ticket.id]: false }));
  };

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard?.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  return (
    <section id="tickets" className="border-b border-slate-200 bg-slate-50 py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header + ticket selector */}
        <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              01. IT Engineer's Real-Life Ticket
            </h2>
            <p className="mt-2 text-base text-slate-600">
              Diagnose one realistic support incident at a time. Run diagnostic commands to gather evidence, lock in your root-cause hypothesis, and compare it against the suggested engineer solution.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Select support ticket"
            className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-200/70 p-1"
          >
            {REAL_LIFE_TICKETS.map((item) => {
              const isActive = item.id === ticket.id;
              const isSolved = solvedTicketIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTicketId(item.id)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="font-mono tabular-nums">{item.number}</span>
                  {isSolved && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-label="Solved" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Two-zone interactive workbench */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Zone: Ticket Brief + Diagnostic Actions + Live Console */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              {/* Unboxed typographic metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-semibold text-blue-700 tabular-nums">{ticket.number}</span>
                  <span aria-hidden="true">·</span>
                  <span>{ticket.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{ticket.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{ticket.estimatedTime}</span>
                </div>
                {solvedTicketIds.includes(ticket.id) && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified Solved
                  </span>
                )}
              </div>

              <h3 className="mt-3 font-display text-xl font-semibold text-slate-900" style={{ textWrap: 'balance' }}>
                {ticket.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                {ticket.symptomSummary}
              </p>

              <blockquote className="mt-4 rounded-lg bg-slate-50 p-4 text-sm italic text-slate-700 border border-slate-200">
                “{ticket.userQuote}”
                <footer className="mt-2 not-italic text-xs font-medium text-slate-500">
                  — {ticket.reporter}, {ticket.department} · Host {ticket.device} ({ticket.os})
                </footer>
              </blockquote>

              <p className="mt-3 font-mono text-xs text-slate-500">
                Environment: {ticket.networkContext}
              </p>
            </div>

            {/* Diagnostic Command Deck */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-display text-base font-semibold text-slate-900">
                    Step 1: Run Diagnostic Checks
                  </h4>
                  <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                    {executedChecks.length} of {ticket.checks.length} checks executed
                  </p>
                </div>

                {executedChecks.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetTicket}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 whitespace-nowrap shrink-0 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Session
                  </button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {ticket.checks.map((check) => {
                  const alreadyRun = executedChecks.some((c) => c.id === check.id);
                  return (
                    <button
                      key={check.id}
                      type="button"
                      onClick={() => handleRunCheck(check)}
                      className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                        alreadyRun
                          ? 'border-blue-200 bg-blue-50 text-blue-800'
                          : 'border-slate-300 bg-white text-slate-800 hover:border-blue-400 hover:bg-slate-50'
                      }`}
                    >
                      {alreadyRun ? (
                        <Check className="h-3.5 w-3.5 text-blue-700" />
                      ) : (
                        <Play className="h-3.5 w-3.5 text-slate-500" />
                      )}
                      {check.label}
                    </button>
                  );
                })}
              </div>

              {/* Monospace Diagnostic Output Terminal */}
              <div className="mt-5 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-slate-100">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-2 font-mono">
                    <Terminal className="h-3.5 w-3.5 text-blue-400" />
                    Diagnostic Output Console
                  </span>
                  <span className="font-mono">{ticket.device}</span>
                </div>

                <div className="max-h-[340px] space-y-5 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
                  {executedChecks.length === 0 ? (
                    <p className="text-slate-400">
                      Select a diagnostic check above to inspect live command output and isolate the failing layer.
                    </p>
                  ) : (
                    executedChecks.map((check) => (
                      <div key={check.id} className="space-y-2 border-b border-slate-800/80 pb-4 last:border-b-0 last:pb-0">
                        <div className="text-blue-400">
                          <span className="text-slate-500">PS C:\Users\itadmin&gt; </span>
                          {check.command}
                        </div>
                        <pre className="whitespace-pre-wrap text-slate-200">{check.output}</pre>
                        <div className="rounded bg-slate-900 px-3 py-2 text-[11px] text-slate-300 border border-slate-800">
                          <strong className="font-semibold text-white">Observation:</strong> {check.finding}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Zone: Hypothesis Selection & Answer Comparison */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h4 className="font-display text-base font-semibold text-slate-900">
                Step 2: Select Root Cause & Compare Solution
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Based on your diagnostic evidence, pick the true root cause before revealing the senior engineer solution.
              </p>

              <fieldset className="mt-4 space-y-2.5">
                <legend className="sr-only">Candidate root causes</legend>
                {ticket.hypotheses.map((hyp) => {
                  const isSelected = selectedHypothesisId === hyp.id;
                  return (
                    <label
                      key={hyp.id}
                      className={`block cursor-pointer rounded-lg border p-3.5 transition-colors duration-150 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name={`hypothesis-${ticket.id}`}
                          value={hyp.id}
                          checked={isSelected}
                          onChange={() => {
                            setSelectedHypothesisByTicket((prev) => ({
                              ...prev,
                              [ticket.id]: hyp.id,
                            }));
                            setSubmittedByTicket((prev) => ({
                              ...prev,
                              [ticket.id]: false,
                            }));
                          }}
                          className="mt-1 h-4 w-4 text-blue-700 focus:ring-blue-700"
                        />
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{hyp.title}</div>
                          <div className="mt-1 text-xs leading-relaxed text-slate-600">{hyp.summary}</div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </fieldset>

              <div className="mt-5">
                <label htmlFor={`notes-${ticket.id}`} className="block text-xs font-semibold text-slate-700">
                  Your Troubleshooting Notes / Fix Plan (Optional)
                </label>
                <textarea
                  id={`notes-${ticket.id}`}
                  rows={3}
                  maxLength={1000}
                  value={userNotes}
                  onChange={(e) =>
                    setNotesByTicket((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                  }
                  placeholder="Write what command or change you would execute to fix this for the user..."
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="button"
                disabled={!selectedHypothesisId}
                onClick={handleSubmitDiagnosis}
                className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 cursor-pointer"
              >
                Submit Diagnosis & Compare Answer
              </button>
            </div>

            {/* Solution Comparison Output */}
            {isSubmitted && selectedHypothesis && (
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div
                  className={`flex items-start gap-3 rounded-lg border p-3.5 ${
                    selectedHypothesis.isCorrect
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-amber-200 bg-amber-50 text-amber-900'
                  }`}
                >
                  {selectedHypothesis.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  )}
                  <div className="text-xs leading-relaxed">
                    <div className="font-semibold">
                      {selectedHypothesis.isCorrect ? 'Diagnosis Confirmed' : 'Review Evidence'}
                    </div>
                    <p className="mt-1">{selectedHypothesis.feedback}</p>
                  </div>
                </div>

                {userNotes.trim() && (
                  <div className="mt-4 border-b border-slate-200 pb-4">
                    <h5 className="text-xs font-semibold text-slate-500">Your Proposed Notes</h5>
                    <p className="mt-1 text-sm text-slate-800">{userNotes}</p>
                  </div>
                )}

                <div className="mt-4 space-y-4">
                  <div>
                    <h5 className="font-display text-sm font-semibold text-slate-900">
                      Suggested Senior Engineer Answer
                    </h5>
                    <p className="mt-1 text-xs leading-relaxed text-slate-700">
                      <strong className="text-slate-900">Root Cause: </strong>
                      {ticket.suggestedSolution.rootCause}
                    </p>
                  </div>

                  <div>
                    <h6 className="text-xs font-semibold text-slate-800">Resolution Steps</h6>
                    <ol className="mt-1.5 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-slate-700">
                      {ticket.suggestedSolution.remediationSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h6 className="text-xs font-semibold text-slate-800">Remediation Commands</h6>
                    <div className="mt-1.5 space-y-1.5">
                      {ticket.suggestedSolution.commands.map((cmd) => (
                        <div
                          key={cmd}
                          className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100"
                        >
                          <code className="truncate">{cmd}</code>
                          <button
                            type="button"
                            onClick={() => handleCopyCommand(cmd)}
                            aria-label={`Copy command ${cmd}`}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white shrink-0 cursor-pointer"
                          >
                            {copiedCmd === cmd ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            {copiedCmd === cmd ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 text-xs text-slate-600">
                    <strong className="text-slate-900">Prevention: </strong>
                    {ticket.suggestedSolution.prevention}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
