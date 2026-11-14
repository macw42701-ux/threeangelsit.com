import { ArrowRight, CheckSquare, Square } from 'lucide-react';
import { useState } from 'react';
import { CAREER_ROADMAP } from '../data/itData';

interface RoadmapSectionProps {
  completedMilestones: string[];
  onToggleMilestone: (milestoneId: string) => void;
  onNavigate: (sectionId: string) => void;
}

export default function RoadmapSection({
  completedMilestones,
  onToggleMilestone,
  onNavigate,
}: RoadmapSectionProps) {
  const [selectedStageId, setSelectedStageId] = useState<string>(CAREER_ROADMAP[0].id);

  const activeStage =
    CAREER_ROADMAP.find((s) => s.id === selectedStageId) ?? CAREER_ROADMAP[0];

  const totalMilestones = CAREER_ROADMAP.reduce((acc, s) => acc + s.milestones.length, 0);

  return (
    <section id="roadmap" className="border-b border-slate-800/80 bg-[#0B1220] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold text-[#F59E0B]">
              04. Career Progression & Skills Path
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
              Become an IT Engineer – Career Roadmap
            </h2>
            <p className="mt-2 text-base text-[#CBD5E1]">
              A structured six-stage progression from computer hardware and operating systems to helpdesk operations, networking, cloud infrastructure, and cybersecurity.
            </p>
          </div>
          <div className="text-xs font-medium text-[#CBD5E1] tabular-nums shrink-0">
            Overall Progress:{' '}
            <strong className="font-semibold text-[#06B6D4]">
              {completedMilestones.length} / {totalMilestones} milestones
            </strong>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: 6-Stage Progression Rail */}
          <div className="space-y-2.5 lg:col-span-5">
            {CAREER_ROADMAP.map((stage) => {
              const isSelected = stage.id === activeStage.id;
              const stageDoneCount = stage.milestones.filter((m) =>
                completedMilestones.includes(m.id)
              ).length;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setSelectedStageId(stage.id)}
                  className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400/70 bg-[#14243A] shadow-md shadow-cyan-950/30'
                      : 'border-slate-800 bg-[#0F1B2E] hover:border-slate-600 hover:bg-[#14243A]/70'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono font-semibold text-[#06B6D4] tabular-nums">
                        Stage {stage.stepNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#CBD5E1]">{stage.timeline}</span>
                    </div>
                    <div className="mt-0.5 font-display text-base font-semibold text-[#F8FAFC] truncate">
                      {stage.title}
                    </div>
                    <div className="text-xs text-[#CBD5E1] truncate">{stage.focus}</div>
                  </div>
                  <div className="shrink-0 font-mono text-xs font-semibold text-[#F59E0B] tabular-nums">
                    {stageDoneCount}/{stage.milestones.length}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Active Stage Details & Milestone Checklist */}
          <div className="lg:col-span-7">
            <div className="glass-surface rounded-2xl p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-mono font-semibold text-[#06B6D4] tabular-nums">
                  Stage {activeStage.stepNumber}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-[#CBD5E1]">{activeStage.timeline}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#F59E0B]">{activeStage.focus}</span>
              </div>

              <h3 className="mt-2 font-display text-2xl font-bold text-[#F8FAFC]">
                {activeStage.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-[#CBD5E1]">
                {activeStage.description}
              </p>

              {/* Core Skills */}
              <div className="mt-6 border-t border-slate-700/60 pt-5">
                <h4 className="font-display text-sm font-semibold text-[#F8FAFC]">
                  Core Competencies to Master
                </h4>
                <ul className="mt-2.5 space-y-2 text-sm text-[#CBD5E1]">
                  {activeStage.coreSkills.map((skill, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-1 font-mono text-xs text-[#06B6D4] shrink-0">•</span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Milestones */}
              <div className="mt-6 border-t border-slate-700/60 pt-5">
                <h4 className="font-display text-sm font-semibold text-[#F8FAFC]">
                  Practical Milestones (Saved Locally)
                </h4>
                <div className="mt-3 space-y-2">
                  {activeStage.milestones.map((m) => {
                    const checked = completedMilestones.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => onToggleMilestone(m.id)}
                        className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors cursor-pointer ${
                          checked
                            ? 'border-emerald-500/50 bg-emerald-950/35 text-emerald-100'
                            : 'border-slate-700 bg-[#0B1220] text-[#F8FAFC] hover:border-cyan-500/50'
                        }`}
                      >
                        {checked ? (
                          <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <Square className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                        )}
                        <span className={checked ? 'line-through text-slate-400' : ''}>
                          {m.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tools & Direct Practice CTA */}
              <div className="mt-6 flex flex-col justify-between gap-4 border-t border-slate-700/60 pt-5 sm:flex-row sm:items-center">
                <div className="text-xs text-[#CBD5E1]">
                  <span className="font-semibold text-[#F8FAFC]">Key Tools: </span>
                  <span className="font-mono text-cyan-300">
                    {activeStage.essentialTools.join(' · ')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(activeStage.practiceLink.targetSection)}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 hover:bg-blue-500 cursor-pointer"
                >
                  {activeStage.practiceLink.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
