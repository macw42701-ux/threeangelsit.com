import { ArrowDown, ArrowUp, Edit3, Plus, Trash2, Video } from 'lucide-react';
import { useState } from 'react';
import { COURSE_CATEGORIES } from '../../services/adminDataService';
import type {
  AdminCourse,
  AdminDigitalResource,
  AdminLesson,
  CourseCategory,
  MediaAsset,
  PublicationStatus,
  QuizQuestionDraft,
} from '../../types/admin';
import { validateSafeEmbedUrl } from '../../utils/fileValidation';
import { AdminSectionHeader, ConfirmDeleteModal, Stage2BackendNotice } from './AdminSharedUI';

interface CourseManagementModuleProps {
  courses: AdminCourse[];
  lessons: AdminLesson[];
  resources: AdminDigitalResource[];
  mediaLibrary: MediaAsset[];
  onSaveCourse: (course: AdminCourse, isNew: boolean) => void;
  onDeleteCourse: (id: string) => void;
  onTogglePublish: (id: string) => void;
  onJumpToLessons: () => void;
}

export function CourseManagementModule({
  courses,
  lessons,
  resources,
  mediaLibrary,
  onSaveCourse,
  onDeleteCourse,
  onTogglePublish,
  onJumpToLessons,
}: CourseManagementModuleProps) {
  const [editing, setEditing] = useState<AdminCourse | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [objectivesText, setObjectivesText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | CourseCategory>('All');
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCourse | null>(null);

  const openEditor = (course: AdminCourse, createMode: boolean) => {
    setIsNew(createMode);
    setEditing({
      ...course,
      lessonIds: [...course.lessonIds],
      materialIds: [...course.materialIds],
    });
    setObjectivesText(course.learningObjectives.join('\n'));
    setFormError(null);
  };

  const handleNewCourse = () => {
    openEditor(
      {
        id: `course-${Date.now()}`,
        title: '',
        description: '',
        thumbnailUrl: mediaLibrary[1]?.url ?? mediaLibrary[0]?.url ?? '',
        level: 'Beginner',
        category: 'Computer Fundamentals',
        learningObjectives: ['Understand core operational fundamentals'],
        lessonIds: [],
        materialIds: [],
        duration: '4 Weeks · Self-Paced',
        status: 'Draft',
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      true
    );
  };

  const moveLessonOrder = (index: number, direction: -1 | 1) => {
    if (!editing) return;
    const target = index + direction;
    if (target < 0 || target >= editing.lessonIds.length) return;
    const updated = [...editing.lessonIds];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setEditing({ ...editing, lessonIds: updated });
  };

  const toggleMaterial = (resourceId: string) => {
    if (!editing) return;
    const exists = editing.materialIds.includes(resourceId);
    setEditing({
      ...editing,
      materialIds: exists
        ? editing.materialIds.filter((id) => id !== resourceId)
        : [...editing.materialIds, resourceId],
    });
  };

  const handleSave = (statusOverride?: PublicationStatus) => {
    if (!editing) return;
    if (editing.title.trim().length < 4) {
      setFormError('Course title must be at least 4 characters.');
      return;
    }
    if (editing.description.trim().length < 15) {
      setFormError('Course description must be at least 15 characters.');
      return;
    }
    const saved: AdminCourse = {
      ...editing,
      title: editing.title.trim(),
      description: editing.description.trim(),
      learningObjectives: objectivesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      status: statusOverride ?? editing.status,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSaveCourse(saved, isNew);
    setEditing(null);
  };

  const visibleCourses = courses.filter(
    (c) => categoryFilter === 'All' || c.category === categoryFilter
  );

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Course Management"
        description="Manage free practical IT learning tracks, thumbnails, objectives, lesson ordering, and downloadable materials. Courses are open educational tracks without third-party accreditation claims."
        action={
          <button
            type="button"
            onClick={handleNewCourse}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap hover:bg-blue-500 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Course
          </button>
        }
      />

      <Stage2BackendNotice collectionName="courses" />

      {editing ? (
        <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="font-display text-lg font-bold text-[#F8FAFC]">
              {isNew ? 'Create Course' : `Edit Course: ${editing.title}`}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Course Title *</label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-sm text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1]">Category</label>
                  <select
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value as CourseCategory })}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                  >
                    {COURSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1]">Level</label>
                  <select
                    value={editing.level}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        level: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced',
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1]">Duration</label>
                  <input
                    type="text"
                    value={editing.duration}
                    onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Course Description *</label>
                <textarea
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Learning Objectives (1 per line)</label>
                <textarea
                  rows={4}
                  value={objectivesText}
                  onChange={(e) => setObjectivesText(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4 lg:col-span-5">
              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Course Thumbnail</label>
                <select
                  value={editing.thumbnailUrl}
                  onChange={(e) => setEditing({ ...editing, thumbnailUrl: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                >
                  {mediaLibrary.map((asset) => (
                    <option key={asset.id} value={asset.url}>
                      {asset.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesson Ordering */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#CBD5E1]">
                    Lesson Sequence ({editing.lessonIds.length})
                  </label>
                  <button
                    type="button"
                    onClick={onJumpToLessons}
                    className="text-[11px] text-cyan-300 hover:underline cursor-pointer"
                  >
                    Open Lesson Manager
                  </button>
                </div>
                {editing.lessonIds.length === 0 ? (
                  <p className="mt-1.5 rounded-lg border border-slate-800 bg-[#0B1220] p-3 text-xs text-slate-400">
                    No lessons linked yet. Create lessons in Lesson Management and associate them with this course.
                  </p>
                ) : (
                  <ul className="mt-1.5 space-y-1.5 rounded-lg border border-slate-800 bg-[#0B1220] p-2">
                    {editing.lessonIds.map((lessonId, idx) => {
                      const lesson = lessons.find((l) => l.id === lessonId);
                      return (
                        <li
                          key={lessonId}
                          className="flex items-center justify-between gap-2 rounded bg-[#14243A] px-2.5 py-1.5 text-xs"
                        >
                          <span className="truncate text-[#F8FAFC]">
                            {idx + 1}. {lesson?.title ?? lessonId}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              aria-label="Move lesson up"
                              onClick={() => moveLessonOrder(idx, -1)}
                              disabled={idx === 0}
                              className="rounded p-1 text-slate-300 hover:bg-[#0B1220] disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              aria-label="Move lesson down"
                              onClick={() => moveLessonOrder(idx, 1)}
                              disabled={idx === editing.lessonIds.length - 1}
                              className="rounded p-1 text-slate-300 hover:bg-[#0B1220] disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Downloadable Materials */}
              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">
                  Downloadable Learning Materials
                </label>
                <div className="mt-1.5 space-y-1.5 rounded-lg border border-slate-800 bg-[#0B1220] p-2.5">
                  {resources.map((res) => (
                    <label key={res.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editing.materialIds.includes(res.id)}
                        onChange={() => toggleMaterial(res.id)}
                        className="h-3.5 w-3.5 accent-[#2563EB]"
                      />
                      <span className="truncate">{res.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formError && (
                <p role="alert" className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-xs text-red-200">
                  {formError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSave('Draft')}
                  className="rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2.5 text-xs font-semibold text-[#CBD5E1] hover:border-cyan-400 hover:text-white cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('Published')}
                  className="rounded-lg bg-[#2563EB] px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                >
                  Publish Course
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-[#14243A]/75 p-2">
            {(['All', ...COURSE_CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {visibleCourses.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-8 text-center">
              <p className="font-display text-base font-semibold text-[#F8FAFC]">
                No courses in {categoryFilter} yet
              </p>
              <p className="mt-1 text-xs text-slate-400">Create a new course track for this category above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {visibleCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#14243A]/75 p-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-cyan-300">
                        {course.category} · {course.level}
                      </span>
                      <button
                        type="button"
                        onClick={() => onTogglePublish(course.id)}
                        className={`font-semibold cursor-pointer ${
                          course.status === 'Published' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {course.status}
                      </button>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-bold text-[#F8FAFC]">{course.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#CBD5E1]">{course.description}</p>
                    <p className="mt-3 font-mono text-xs text-slate-400 tabular-nums">
                      {course.lessonIds.length} lessons · {course.materialIds.length} materials · {course.duration}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
                    <button
                      type="button"
                      onClick={() => openEditor(course, false)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:border-cyan-400 cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(course)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-1.5 text-xs font-semibold text-red-400 hover:border-red-400 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        entityType="Course"
        itemLabel={deleteTarget?.title ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onDeleteCourse(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

interface LessonManagementModuleProps {
  lessons: AdminLesson[];
  courses: AdminCourse[];
  resources: AdminDigitalResource[];
  onSaveLesson: (lesson: AdminLesson, isNew: boolean) => void;
  onDeleteLesson: (id: string) => void;
}

export function LessonManagementModule({
  lessons,
  courses,
  resources,
  onSaveLesson,
  onDeleteLesson,
}: LessonManagementModuleProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('All');
  const [editing, setEditing] = useState<AdminLesson | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [newQuestionPrompt, setNewQuestionPrompt] = useState('');
  const [newOptionsText, setNewOptionsText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminLesson | null>(null);

  const openEditor = (lesson: AdminLesson, createMode: boolean) => {
    setIsNew(createMode);
    setEditing({
      ...lesson,
      pdfResourceIds: [...lesson.pdfResourceIds],
      quizQuestions: [...lesson.quizQuestions],
    });
    setNewQuestionPrompt('');
    setNewOptionsText('');
    setFormError(null);
  };

  const handleNewLesson = () => {
    const defaultCourse = courses[0]?.id ?? '';
    openEditor(
      {
        id: `lesson-${Date.now()}`,
        courseId: defaultCourse,
        title: '',
        description: '',
        content: '',
        videoUrl: '',
        pdfResourceIds: [],
        practicalExercise: '',
        quizQuestions: [],
        sequence: lessons.filter((l) => l.courseId === defaultCourse).length + 1,
        status: 'Draft',
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      true
    );
  };

  const addQuizQuestion = () => {
    if (!editing || !newQuestionPrompt.trim()) return;
    const opts = newOptionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (opts.length < 2) {
      setFormError('Quiz questions require at least 2 answer options (1 per line).');
      return;
    }
    setFormError(null);
    const q: QuizQuestionDraft = {
      id: `quiz-q-${Date.now()}`,
      prompt: newQuestionPrompt.trim(),
      options: opts,
      correctIndex: 0,
    };
    setEditing({ ...editing, quizQuestions: [...editing.quizQuestions, q] });
    setNewQuestionPrompt('');
    setNewOptionsText('');
  };

  const handleSave = (statusOverride?: PublicationStatus) => {
    if (!editing) return;
    if (editing.title.trim().length < 3) {
      setFormError('Lesson title must be at least 3 characters.');
      return;
    }
    const urlCheck = validateSafeEmbedUrl(editing.videoUrl);
    if (!urlCheck.valid) {
      setFormError(urlCheck.error ?? 'Invalid video URL.');
      return;
    }
    const saved: AdminLesson = {
      ...editing,
      title: editing.title.trim(),
      description: editing.description.trim(),
      status: statusOverride ?? editing.status,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSaveLesson(saved, isNew);
    setEditing(null);
  };

  const visibleLessons = lessons
    .filter((l) => selectedCourseId === 'All' || l.courseId === selectedCourseId)
    .sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Lesson Management"
        description="Build course lessons with original content, validated HTTPS video embeds, PDF attachments, practical exercises, and quizzes."
        action={
          <button
            type="button"
            onClick={handleNewLesson}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap hover:bg-blue-500 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Lesson
          </button>
        }
      />

      <Stage2BackendNotice collectionName="lessons, quizzes" />

      {editing ? (
        <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="font-display text-lg font-bold text-[#F8FAFC]">
              {isNew ? 'Create New Lesson' : `Edit Lesson: ${editing.title}`}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#CBD5E1]">Course Association</label>
                  <select
                    value={editing.courseId}
                    onChange={(e) => setEditing({ ...editing, courseId: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1]">Lesson Sequence #</label>
                  <input
                    type="number"
                    min={1}
                    value={editing.sequence}
                    onChange={(e) =>
                      setEditing({ ...editing, sequence: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] tabular-nums focus:border-[#06B6D4] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Lesson Title *</label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-sm text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Lesson Description</label>
                <textarea
                  rows={2}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Lesson Content</label>
                <textarea
                  rows={5}
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 font-mono text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Practical Exercise</label>
                <textarea
                  rows={2}
                  value={editing.practicalExercise}
                  onChange={(e) => setEditing({ ...editing, practicalExercise: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4 lg:col-span-5">
              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">
                  Original Video Embed URL (HTTPS only)
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  <Video className="h-4 w-4 shrink-0 text-[#06B6D4]" />
                  <input
                    type="url"
                    value={editing.videoUrl}
                    onChange={(e) => setEditing({ ...editing, videoUrl: e.target.value })}
                    placeholder="https://... (only embed original/authorized content)"
                    className="w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Attached PDF / Study Resources</label>
                <div className="mt-1.5 space-y-1.5 rounded-lg border border-slate-800 bg-[#0B1220] p-2.5">
                  {resources.map((res) => (
                    <label key={res.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editing.pdfResourceIds.includes(res.id)}
                        onChange={() => {
                          const exists = editing.pdfResourceIds.includes(res.id);
                          setEditing({
                            ...editing,
                            pdfResourceIds: exists
                              ? editing.pdfResourceIds.filter((id) => id !== res.id)
                              : [...editing.pdfResourceIds, res.id],
                          });
                        }}
                        className="h-3.5 w-3.5 accent-[#2563EB]"
                      />
                      <span className="truncate">{res.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0B1220] p-3 space-y-2.5">
                <p className="text-xs font-semibold text-[#F8FAFC]">
                  Quiz Questions ({editing.quizQuestions.length})
                </p>
                {editing.quizQuestions.map((q, qIdx) => (
                  <div key={q.id} className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2 text-xs">
                    <div>
                      <p className="font-medium text-cyan-300">Q{qIdx + 1}: {q.prompt}</p>
                      <p className="text-[11px] text-slate-400">{q.options.length} choices</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          quizQuestions: editing.quizQuestions.filter((item) => item.id !== q.id),
                        })
                      }
                      className="text-red-400 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <input
                  type="text"
                  value={newQuestionPrompt}
                  onChange={(e) => setNewQuestionPrompt(e.target.value)}
                  placeholder="New quiz question prompt..."
                  className="w-full rounded border border-slate-700 bg-[#0F1B2E] px-2.5 py-1.5 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                />
                <textarea
                  rows={2}
                  value={newOptionsText}
                  onChange={(e) => setNewOptionsText(e.target.value)}
                  placeholder="Answer options (1 per line; first line marked correct)"
                  className="w-full rounded border border-slate-700 bg-[#0F1B2E] px-2.5 py-1.5 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addQuizQuestion}
                  className="rounded border border-cyan-500/40 bg-[#0F1B2E] px-3 py-1 text-xs font-semibold text-cyan-300 hover:border-cyan-400 cursor-pointer"
                >
                  + Add Quiz Question
                </button>
              </div>

              {formError && (
                <p role="alert" className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-xs text-red-200">
                  {formError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSave('Draft')}
                  className="rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2.5 text-xs font-semibold text-[#CBD5E1] hover:border-cyan-400 hover:text-white cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('Published')}
                  className="rounded-lg bg-[#2563EB] px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                >
                  Publish Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-[#14243A]/75 p-4">
            <label htmlFor="lesson-course-filter" className="text-xs font-medium text-[#CBD5E1]">
              Filter by Course:
            </label>
            <select
              id="lesson-course-filter"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
            >
              <option value="All">All Courses ({lessons.length} lessons)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#14243A]/75">
            <table className="w-full min-w-[740px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0F1B2E] text-slate-400">
                  <th className="px-4 py-3 font-medium">Seq</th>
                  <th className="px-4 py-3 font-medium">Lesson Title</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Quiz</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {visibleLessons.map((lesson) => {
                  const parentCourse = courses.find((c) => c.id === lesson.courseId);
                  return (
                    <tr key={lesson.id} className="hover:bg-[#0B1220]/40">
                      <td className="px-4 py-3 font-mono text-slate-400 tabular-nums">#{lesson.sequence}</td>
                      <td className="px-4 py-3 font-semibold text-[#F8FAFC]">{lesson.title}</td>
                      <td className="px-4 py-3 text-slate-300">{parentCourse?.title ?? 'Unassigned'}</td>
                      <td className="px-4 py-3 font-mono text-slate-400 tabular-nums">
                        {lesson.quizQuestions.length} Q
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            lesson.status === 'Published' ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'
                          }
                        >
                          {lesson.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditor(lesson, false)}
                            className="rounded-lg border border-slate-700 bg-[#0B1220] p-1.5 text-cyan-300 hover:border-cyan-400 cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(lesson)}
                            className="rounded-lg border border-slate-700 bg-[#0B1220] p-1.5 text-red-400 hover:border-red-400 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        entityType="Lesson"
        itemLabel={deleteTarget?.title ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onDeleteLesson(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
