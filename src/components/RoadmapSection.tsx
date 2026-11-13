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
    <section id="roadmap" className="border-b border-slate-200 bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              04. Become an IT Engineer – Roadmap
            </h2>
            <p className="mt-2 text-base text-slate-600">
              A structured six-stage progression from core hardware and operating systems to helpdesk operations, networking, cloud infrastructure, and cybersecurity.
            </p>
          </div>
          <div className="text-xs font-medium text-slate-600 tabular-nums shrink-0">
            Overall Progress:{' '}
            <strong className="font-semibold text-slate-900">
              {completedMilestones.length} / {totalMilestones} milestones
            </strong>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: 6-Stage Progression Rail */}
          <div className="space-y-2 lg:col-span-5">
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
                  className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-blue-700 tabular-nums">
                        Stage {stage.stepNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{stage.timeline}</span>
                    </div>
                    <div className="mt-0.5 font-display text-base font-semibold text-slate-900 truncate">
                      {stage.title}
                    </div>
                    <div className="text-xs text-slate-600 truncate">{stage.focus}</div>
                  </div>
                  <div className="shrink-0 font-mono text-xs font-semibold text-slate-600 tabular-nums">
                    {stageDoneCount}/{stage.milestones.length}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Active Stage Details & Milestone Checklist */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-mono font-semibold text-blue-700 tabular-nums">
                  Stage {activeStage.stepNumber}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeStage.timeline}</span>
                <span aria-hidden="true">·</span>
                <span>{activeStage.focus}</span>
              </div>

              <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">
                {activeStage.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                {activeStage.description}
              </p>

              {/* Core Skills */}
              <div className="mt-6 border-t border-slate-200 pt-5">
                <h4 className="font-display text-sm font-semibold text-slate-900">
                  Core Competencies to Master
                </h4>
                <ul className="mt-2.5 space-y-2 text-sm text-slate-700">
                  {activeStage.coreSkills.map((skill, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-1 font-mono text-xs text-blue-700 shrink-0">•</span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Milestones */}
              <div className="mt-6 border-t border-slate-200 pt-5">
                <h4 className="font-display text-sm font-semibold text-slate-900">
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
                        className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors cursor-pointer ${
                          checked
                            ? 'border-emerald-200 bg-emerald-50/70 text-slate-900'
                            : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {checked ? (
                          <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                        ) : (
                          <Square className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        )}
                        <span className={checked ? 'line-through text-slate-500' : ''}>
                          {m.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tools & Direct Practice CTA */}
              <div className="mt-6 flex flex-col justify-between gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">Key Tools: </span>
                  <span className="font-mono">{activeStage.essentialTools.join(' · ')}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(activeStage.practiceLink.targetSection)}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 hover:bg-slate-800 cursor-pointer"
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
