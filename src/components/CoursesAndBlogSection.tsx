import { ArrowRight, BookOpen, CheckSquare, Square, Star, Video, X } from 'lucide-react';
import { useState } from 'react';
import { FREE_COURSES, IT_BLOG_POSTS } from '../data/itData';
import type { AdminArticle, AdminCourse, AdminLesson } from '../types/admin';
import { CoursesLearningGraphic } from './TechIllustrations';

interface CoursesAndBlogSectionProps {
  completedCourseModules: string[];
  onToggleCourseModule: (moduleId: string) => void;
  onNavigate: (sectionId: string) => void;
  courses?: AdminCourse[];
  lessons?: AdminLesson[];
  articles?: AdminArticle[];
  featuredCourseIds?: string[];
  featuredArticleIds?: string[];
}

function parseArticleSections(content: string): { heading: string; body: string }[] {
  const blocks = content.split(/\n(?=##\s+)/);
  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith('##')) {
        const newlineIdx = trimmed.indexOf('\n');
        if (newlineIdx === -1) {
          return { heading: trimmed.replace(/^##\s*/, ''), body: '' };
        }
        return {
          heading: trimmed.slice(0, newlineIdx).replace(/^##\s*/, '').trim(),
          body: trimmed.slice(newlineIdx + 1).trim(),
        };
      }
      return { heading: 'Technical Overview', body: trimmed };
    })
    .filter((item): item is { heading: string; body: string } => item !== null && Boolean(item.heading || item.body));
}

export default function CoursesAndBlogSection({
  completedCourseModules,
  onToggleCourseModule,
  onNavigate,
  courses,
  lessons = [],
  articles,
  featuredCourseIds = [],
  featuredArticleIds = [],
}: CoursesAndBlogSectionProps) {
  const [levelFilter, setLevelFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');

  const publishedCourses = courses
    ? courses
        .filter((c) => c.status === 'Published')
        .map((c) => {
          const templateCourse = FREE_COURSES.find((fc) => fc.id === c.id);
          const courseLessons = lessons
            .filter((l) => l.courseId === c.id && l.status === 'Published')
            .sort((a, b) => a.sequence - b.sequence);

          const modules =
            courseLessons.length > 0
              ? courseLessons.map((l) => ({
                  id: l.id,
                  title: l.title,
                  duration: l.practicalExercise ? 'Hands-On' : 'Self-Paced',
                  videoUrl: l.videoUrl,
                }))
              : (templateCourse?.modules ?? []).map((m) => ({
                  id: `lesson-${m.id}`,
                  title: m.title,
                  duration: m.duration,
                  videoUrl: '',
                }));

          return {
            id: c.id,
            title: c.title,
            category: c.category,
            level: c.level,
            duration: c.duration,
            summary: c.description,
            learningObjectives: c.learningObjectives,
            featured: featuredCourseIds.includes(c.id),
            modules,
            practiceTarget: templateCourse?.practiceTarget ?? {
              label: 'Practice in Virtual IT Lab',
              sectionId: 'lab',
            },
          };
        })
    : FREE_COURSES.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        level: c.level,
        duration: c.duration,
        summary: c.summary,
        learningObjectives: c.outcomes,
        featured: featuredCourseIds.includes(c.id),
        modules: c.modules.map((m) => ({
          id: m.id,
          title: m.title,
          duration: m.duration,
          videoUrl: '',
        })),
        practiceTarget: c.practiceTarget,
      }));

  const [expandedCourseId, setExpandedCourseId] = useState<string>(publishedCourses[0]?.id ?? '');

  const publishedArticles = articles
    ? articles
        .filter((a) => a.status === 'Published')
        .map((a) => {
          const templatePost = IT_BLOG_POSTS.find((p) => p.id === a.id);
          return {
            id: a.id,
            category: a.category,
            published: a.publishedDate,
            readTime: templatePost?.readTime ?? '5 min read',
            title: a.title,
            excerpt: a.subtitle,
            featuredImage: a.featuredImage,
            author: a.author,
            tags: a.tags,
            featured: a.featured || featuredArticleIds.includes(a.id),
            sections: parseArticleSections(a.content),
            relatedSection: templatePost?.relatedSection ?? {
              label: 'Explore Virtual Lab',
              sectionId: 'lab',
            },
          };
        })
    : IT_BLOG_POSTS.map((p) => ({
        ...p,
        featuredImage: '',
        author: 'THREE ANGELS Editorial Team',
        tags: [p.category],
        featured: false,
      }));

  const [activeArticle, setActiveArticle] = useState<(typeof publishedArticles)[number] | null>(null);

  const visibleCourses = publishedCourses.filter(
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
              className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-[#0F1B2E] p-1"
            >
              {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
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
                <div className="h-52 border-b border-slate-800 bg-[#0B1220]">
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
                    className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200 cursor-pointer"
                  >
                    View Full Career Roadmap
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Course Grid */}
            <div className="space-y-4 lg:col-span-8">
              {visibleCourses.length === 0 ? (
                <div className="glass-surface rounded-2xl p-8 text-center text-sm text-slate-400">
                  No published courses match the selected level filter yet.
                </div>
              ) : (
                visibleCourses.map((course) => {
                  const isExpanded = expandedCourseId === course.id;
                  const doneCount = course.modules.filter((m) =>
                    completedCourseModules.includes(m.id)
                  ).length;

                  return (
                    <div
                      key={course.id}
                      className="glass-surface rounded-2xl p-6 transition-colors duration-150 hover:border-cyan-400/60"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span className="font-semibold text-cyan-300">{course.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-[#F59E0B]">{course.level}</span>
                            <span aria-hidden="true">·</span>
                            <span>{course.duration}</span>
                            {course.featured && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                                  <Star className="h-3 w-3" />
                                  Featured
                                </span>
                              </>
                            )}
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

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCourseId(isExpanded ? '' : course.id)
                          }
                          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-700 bg-[#0B1220] px-4 py-2 text-xs font-semibold text-[#F8FAFC] hover:border-cyan-400 hover:bg-[#14243A] cursor-pointer"
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
                        <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
                          {course.learningObjectives.length > 0 && (
                            <ul className="mb-3 space-y-1 text-xs text-[#CBD5E1]">
                              {course.learningObjectives.map((obj, idx) => (
                                <li key={idx}>• {obj}</li>
                              ))}
                            </ul>
                          )}
                          <p className="text-xs font-semibold text-[#F8FAFC]">
                            Course Modules (Click to track completion)
                          </p>
                          {course.modules.length === 0 ? (
                            <p className="text-xs text-slate-400">
                              Lessons for this course are being published by instructors.
                            </p>
                          ) : (
                            course.modules.map((mod) => {
                              const checked = completedCourseModules.includes(mod.id);
                              return (
                                <div key={mod.id} className="space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => onToggleCourseModule(mod.id)}
                                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                                      checked
                                        ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                                        : 'border-slate-800 bg-[#0B1220] text-[#F8FAFC] hover:border-cyan-400/70 hover:bg-[#14243A]'
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
                                  {mod.videoUrl && (
                                    <a
                                      href={mod.videoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 pl-4 text-[11px] font-medium text-cyan-300 hover:underline"
                                    >
                                      <Video className="h-3 w-3" />
                                      Watch Lesson Video
                                    </a>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* IT BLOG */}
      <section id="blog" className="border-b border-slate-800/80 bg-[#0F1B2E] py-16 lg:py-20">
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
            {publishedArticles.map((post) => (
              <article
                key={post.id}
                className="glass-surface flex flex-col justify-between rounded-2xl p-6 transition-all duration-150 hover:-translate-y-0.5 hover:border-cyan-400/60"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-cyan-300">{post.category}</span>
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

                <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveArticle(post)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 cursor-pointer"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#070D18]/80 p-4 backdrop-blur-sm"
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-[#0F1B2E] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-cyan-300">{activeArticle.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeArticle.published}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeArticle.author}</span>
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
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-[#0B1220] text-[#CBD5E1] hover:border-cyan-400 hover:text-white shrink-0 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {activeArticle.featuredImage && (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
                <img
                  src={activeArticle.featuredImage}
                  alt={activeArticle.title}
                  referrerPolicy="no-referrer"
                  className="h-48 w-full object-cover"
                />
              </div>
            )}

            <div className="mt-5 space-y-5">
              {activeArticle.sections.map((sec, idx) => (
                <div key={`${sec.heading}-${idx}`}>
                  <h4 className="font-display text-base font-semibold text-[#F59E0B]">
                    {sec.heading}
                  </h4>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-[#CBD5E1]">
                    {sec.body}
                  </p>
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
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-[#CBD5E1] hover:border-cyan-400 hover:text-white cursor-pointer"
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
