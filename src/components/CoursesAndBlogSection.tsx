import { ArrowRight, BookOpen, CheckSquare, Square, X } from 'lucide-react';
import { useState } from 'react';
import { BlogPost, FREE_COURSES, IT_BLOG_POSTS } from '../data/itData';
import { CoursesLearningGraphic } from './TechIllustrations';

interface CoursesAndBlogSectionProps {
  completedCourseModules: string[];
  onToggleCourseModule: (moduleId: string) => void;
  onNavigate: (sectionId: string) => void;
}

export default function CoursesAndBlogSection({
  completedCourseModules,
  onToggleCourseModule,
  onNavigate,
}: CoursesAndBlogSectionProps) {
  const [levelFilter, setLevelFilter] = useState<'All' | 'Beginner' | 'Intermediate'>('All');
  const [expandedCourseId, setExpandedCourseId] = useState<string>(FREE_COURSES[0].id);
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

  const visibleCourses = FREE_COURSES.filter(
    (c) => levelFilter === 'All' || c.level === levelFilter
  );

  return (
    <>
      {/* FREE IT COURSES */}
      <section id="courses" className="border-b border-slate-800/80 bg-[#0B1220] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-6 border-b border-slate-800 pb-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-semibold text-[#06B6D4]">
                02. Online Education & Learning Paths
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
                Free IT Courses
              </h2>
              <p className="mt-2 text-base text-[#CBD5E1]">
                Beginner-friendly, structured lessons covering hardware, networking, systems administration, cloud foundations, and security—paired with interactive labs.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Filter courses by level"
              className="flex items-center gap-1 rounded-lg border border-slate-700/70 bg-[#14243A]/70 p-1"
            >
              {(['All', 'Beginner', 'Intermediate'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  role="tab"
                  aria-selected={levelFilter === lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    levelFilter === lvl
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Visual Feature Card */}
            <div className="lg:col-span-4">
              <div className="glass-surface sticky top-24 overflow-hidden rounded-2xl">
                <div className="h-52 border-b border-slate-700/60 bg-[#0B1220]">
                  <CoursesLearningGraphic />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-[#F8FAFC]">
                    Learn Step-by-Step, Openly
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#CBD5E1]">
                    Every course module on THREE ANGELS IT SERVICES is free to read and track locally. Check off completed lessons as you build practical troubleshooting skills.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('roadmap')}
                    className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#06B6D4] hover:text-cyan-300 cursor-pointer"
                  >
                    View Full Career Roadmap
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Course Grid */}
            <div className="space-y-4 lg:col-span-8">
              {visibleCourses.map((course) => {
                const isExpanded = expandedCourseId === course.id;
                const doneCount = course.modules.filter((m) =>
                  completedCourseModules.includes(m.id)
                ).length;

                return (
                  <div
                    key={course.id}
                    className="glass-surface rounded-2xl p-6 transition-colors duration-150 hover:border-cyan-500/40"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span className="font-semibold text-[#06B6D4]">{course.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#F59E0B]">{course.level}</span>
                          <span aria-hidden="true">·</span>
                          <span>{course.duration}</span>
                        </div>
                        <h3 className="mt-1.5 font-display text-xl font-bold text-[#F8FAFC]">
                          {course.title}
                        </h3>
                      </div>

                      <span className="font-mono text-xs font-semibold text-cyan-300 tabular-nums shrink-0">
                        {doneCount} / {course.modules.length} Modules
                      </span>
                    </div>

                    <p className="mt-2.5 text-sm leading-relaxed text-[#CBD5E1]">
                      {course.summary}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/60 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCourseId(isExpanded ? '' : course.id)
                        }
                        className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-600 bg-[#0B1220] px-4 py-2 text-xs font-semibold text-[#F8FAFC] hover:border-cyan-400 cursor-pointer"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-[#06B6D4]" />
                        {isExpanded ? 'Hide Syllabus' : 'Open Course Syllabus'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onNavigate(course.practiceTarget.sectionId)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F59E0B] hover:text-amber-300 cursor-pointer"
                      >
                        {course.practiceTarget.label}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-2 border-t border-slate-700/60 pt-4">
                        <p className="text-xs font-semibold text-[#F8FAFC]">
                          Course Modules (Click to track completion)
                        </p>
                        {course.modules.map((mod) => {
                          const checked = completedCourseModules.includes(mod.id);
                          return (
                            <button
                              key={mod.id}
                              type="button"
                              onClick={() => onToggleCourseModule(mod.id)}
                              className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                                checked
                                  ? 'border-emerald-500/50 bg-emerald-950/35 text-emerald-100'
                                  : 'border-slate-700 bg-[#0B1220] text-[#CBD5E1] hover:border-cyan-500/50 hover:text-white'
                              }`}
                            >
                              <span className="flex items-center gap-2.5">
                                {checked ? (
                                  <CheckSquare className="h-4 w-4 shrink-0 text-emerald-400" />
                                ) : (
                                  <Square className="h-4 w-4 shrink-0 text-slate-500" />
                                )}
                                <span className={checked ? 'line-through text-slate-400' : ''}>
                                  {mod.title}
                                </span>
                              </span>
                              <span className="font-mono text-[11px] text-slate-400 shrink-0 tabular-nums">
                                {mod.duration}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* IT BLOG */}
      <section id="blog" className="border-b border-slate-800/80 bg-[#0E182A] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="border-b border-slate-800 pb-6">
            <p className="font-mono text-xs font-semibold text-[#F59E0B]">
              03. Practical Engineering Notes
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
              IT Blog & Field Briefings
            </h2>
            <p className="mt-2 max-w-2xl text-base text-[#CBD5E1]">
              Original engineering breakdowns explaining why common network, server, and identity incidents happen—and how to verify fixes rapidly.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {IT_BLOG_POSTS.map((post) => (
              <article
                key={post.id}
                className="glass-surface flex flex-col justify-between rounded-2xl p-6 transition-all duration-150 hover:-translate-y-0.5 hover:border-cyan-400/50"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-[#06B6D4]">{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.published}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="mt-2.5 font-display text-lg font-bold text-[#F8FAFC]">
                    {post.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#CBD5E1]">{post.excerpt}</p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-700/60 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveArticle(post)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#06B6D4] hover:text-cyan-300 cursor-pointer"
                  >
                    Read Article
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate(post.relatedSection.sectionId)}
                    className="text-xs font-medium text-[#F59E0B] hover:text-amber-300 cursor-pointer"
                  >
                    {post.relatedSection.label}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="blog-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-[#0F1B2E] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-[#06B6D4]">{activeArticle.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeArticle.published}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeArticle.readTime}</span>
                </div>
                <h3
                  id="blog-modal-title"
                  className="mt-2 font-display text-2xl font-bold text-[#F8FAFC]"
                >
                  {activeArticle.title}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close article"
                onClick={() => setActiveArticle(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-[#14243A] text-[#CBD5E1] hover:text-white shrink-0 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {activeArticle.sections.map((sec) => (
                <div key={sec.heading}>
                  <h4 className="font-display text-base font-semibold text-[#F59E0B]">
                    {sec.heading}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#CBD5E1]">{sec.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => {
                  const target = activeArticle.relatedSection.sectionId;
                  setActiveArticle(null);
                  onNavigate(target);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
              >
                {activeArticle.relatedSection.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-[#CBD5E1] hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
