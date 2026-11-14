import { ArrowRight, BookOpen, Compass, Cpu, ShieldCheck, Terminal } from 'lucide-react';
import { HeroTechScene } from './TechIllustrations';

interface HeroSectionProps {
  solvedTicketsCount: number;
  totalTicketsCount: number;
  completedMilestonesCount: number;
  totalMilestonesCount: number;
  onNavigate: (sectionId: string) => void;
}

const INTERACTIVE_MODULES = [
  {
    id: 'tickets',
    index: '01.',
    title: 'Real-Life Tickets',
    detail: 'Diagnose live incidents & compare solutions',
    icon: Terminal,
  },
  {
    id: 'lab',
    index: '02.',
    title: 'Virtual IT Lab',
    detail: 'Network traces, Windows & Linux sandboxes',
    icon: Cpu,
  },
  {
    id: 'awareness',
    index: '03.',
    title: 'IT Awareness',
    detail: 'Weekly phishing & security drills',
    icon: ShieldCheck,
  },
  {
    id: 'roadmap',
    index: '04.',
    title: 'Engineer Roadmap',
    detail: 'Structured path from basics to security',
    icon: Compass,
  },
  {
    id: 'kb',
    index: '05.',
    title: 'Knowledge Base',
    detail: 'Searchable runbooks & CLI commands',
    icon: BookOpen,
  },
];

export default function HeroSection({
  solvedTicketsCount,
  totalTicketsCount,
  completedMilestonesCount,
  totalMilestonesCount,
  onNavigate,
}: HeroSectionProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-slate-800/80 bg-[#0B1220] tech-grid-bg"
    >
      {/* Subtle ambient background highlights */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/4 h-96 w-96 rounded-full bg-[#2563EB]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-16 right-1/6 h-80 w-80 rounded-full bg-[#06B6D4]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 py-14 lg:py-20">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
          {/* Left Hero Copy */}
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#06B6D4]">
                THREE ANGELS IT SERVICES · Technology Education & Diagnostics Platform
              </p>

              <h1
                className="mt-4 font-display text-4xl font-bold tracking-tight text-[#F8FAFC] sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Learn Technology. Build Skills. Solve Real Problems.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#CBD5E1] sm:text-lg">
                Discover practical IT knowledge, digital awareness, beginner-friendly courses and technical solutions designed to help you grow in the digital world.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('courses')}
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white whitespace-nowrap shrink-0 shadow-lg shadow-blue-950/50 transition-all duration-150 hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 cursor-pointer"
                >
                  Explore Free Courses
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('solutions')}
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-lg border border-cyan-500/40 bg-[#14243A]/80 px-6 py-3 text-sm font-semibold text-[#F8FAFC] whitespace-nowrap shrink-0 transition-all duration-150 hover:-translate-y-0.5 hover:border-cyan-400 hover:bg-[#14243A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 cursor-pointer"
                >
                  Discover IT Solutions
                </button>
              </div>
            </div>

            {/* Unboxed local progress metadata */}
            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-800 pt-5 text-xs text-[#CBD5E1] tabular-nums">
              <span>
                Tickets Solved:{' '}
                <strong className="font-semibold text-[#F59E0B]">
                  {solvedTicketsCount} / {totalTicketsCount}
                </strong>
              </span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span>
                Roadmap Milestones:{' '}
                <strong className="font-semibold text-[#06B6D4]">
                  {completedMilestonesCount} / {totalMilestonesCount}
                </strong>
              </span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span>Free, open single-page access — no login required</span>
            </div>
          </div>

          {/* Right 3D Isometric Technology Illustration */}
          <div className="lg:col-span-6">
            <HeroTechScene />
          </div>
        </div>

        {/* Full-width interactive jump bar */}
        <div className="mt-12 grid grid-cols-1 gap-3.5 border-t border-slate-800/80 pt-8 sm:grid-cols-2 lg:grid-cols-5">
          {INTERACTIVE_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => onNavigate(mod.id)}
                className="group glass-surface flex flex-col items-start rounded-xl p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-cyan-400/50 focus-visible:outline-2 focus-visible:outline-cyan-400 cursor-pointer"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#F59E0B] tabular-nums">
                    {mod.index}
                  </span>
                  <Icon className="h-4 w-4 text-[#06B6D4] transition-transform duration-150 group-hover:scale-110" />
                </div>
                <span className="mt-2 font-display text-base font-semibold text-[#F8FAFC] group-hover:text-cyan-300">
                  {mod.title}
                </span>
                <span className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">
                  {mod.detail}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
