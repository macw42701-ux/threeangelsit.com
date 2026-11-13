import { ArrowRight, Terminal } from 'lucide-react';
import { useState } from 'react';
import heroWorkbenchImg from '../assets/images/hero_it_workbench_1794586743951.jpg';

interface HeroSectionProps {
  solvedTicketsCount: number;
  totalTicketsCount: number;
  completedMilestonesCount: number;
  totalMilestonesCount: number;
  onNavigate: (sectionId: string) => void;
}

const PILLARS = [
  {
    id: 'tickets',
    index: '01.',
    title: 'Real-Life Ticket',
    detail: 'Diagnose live incidents & compare solutions',
  },
  {
    id: 'lab',
    index: '02.',
    title: 'Virtual IT Lab',
    detail: 'Network traces, Windows & Linux sandboxes',
  },
  {
    id: 'awareness',
    index: '03.',
    title: 'Weekly Awareness',
    detail: 'Interactive phishing & data safety drills',
  },
  {
    id: 'roadmap',
    index: '04.',
    title: 'Engineer Roadmap',
    detail: 'Step-by-step path from basics to security',
  },
  {
    id: 'kb',
    index: '05.',
    title: 'Knowledge Base',
    detail: 'Searchable runbooks & diagnostic commands',
  },
];

export default function HeroSection({
  solvedTicketsCount,
  totalTicketsCount,
  completedMilestonesCount,
  totalMilestonesCount,
  onNavigate,
}: HeroSectionProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="top" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
          {/* Left editorial column */}
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-500">
                Hands-On IT Operations & Infrastructure Practice
              </p>

              <h1
                className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]"
                style={{ textWrap: 'balance' }}
              >
                Learn IT engineering by solving real incidents, not reading summaries.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Inspect live support tickets, trace failing packets across simulated networks, run commands in browser-based Windows and Linux terminals, and track your career progression from helpdesk fundamentals to security operations.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('tickets')}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 cursor-pointer"
                >
                  Open Active Ticket
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('lab')}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 cursor-pointer"
                >
                  <Terminal className="h-4 w-4 text-slate-600" />
                  Launch Virtual Lab
                </button>
              </div>
            </div>

            {/* Quiet unboxed progress metadata */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-200 pt-5 text-xs text-slate-500 tabular-nums">
              <span>
                Tickets Verified: <strong className="font-semibold text-slate-900">{solvedTicketsCount} / {totalTicketsCount}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Roadmap Milestones: <strong className="font-semibold text-slate-900">{completedMilestonesCount} / {totalMilestonesCount}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>Browser-native sandboxes, zero setup</span>
            </div>
          </div>

          {/* Right visual frame */}
          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[280px] overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
              {!imgError ? (
                <img
                  src={heroWorkbenchImg}
                  alt="IT engineer workstation displaying terminal diagnostics beside a patched network switch"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[300px] flex-col items-center justify-center bg-slate-900 p-8 text-center text-slate-300">
                  <Terminal className="h-10 w-10 text-blue-400" />
                  <p className="mt-3 font-display text-lg font-semibold text-white">
                    Three Angels IT Services Diagnostic Workbench
                  </p>
                  <p className="mt-1 max-w-sm text-sm text-slate-400">
                    Interactive ticket triage, network packet tracing, and CLI practice environments.
                  </p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent p-5">
                <p className="text-xs font-medium text-slate-200">
                  Featured Scenario · INC-2048: Internet reachable, corporate SMB share unreachable
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width 5-pillar interactive strip */}
        <div className="mt-10 grid grid-cols-1 gap-3 border-t border-slate-200 pt-8 sm:grid-cols-2 lg:grid-cols-5">
          {PILLARS.map((pillar) => (
            <button
              key={pillar.id}
              type="button"
              onClick={() => onNavigate(pillar.id)}
              className="group flex flex-col items-start rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-left transition-colors duration-150 hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-2 focus-visible:outline-blue-700 cursor-pointer"
            >
              <span className="font-mono text-xs font-medium text-blue-700 tabular-nums">
                {pillar.index}
              </span>
              <span className="mt-1.5 font-display text-base font-semibold text-slate-900 group-hover:text-blue-800">
                {pillar.title}
              </span>
              <span className="mt-1 text-xs leading-relaxed text-slate-600">
                {pillar.detail}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
