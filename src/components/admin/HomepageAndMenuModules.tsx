import { ArrowDown, ArrowUp, Check, Eye, Lock, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import type {
  AdminArticle,
  AdminCourse,
  HomepageContentConfig,
  MediaAsset,
  MenuNavItem,
} from '../../types/admin';
import { AdminSectionHeader, ConfirmDeleteModal, Stage2BackendNotice } from './AdminSharedUI';

interface HomepageEditorModuleProps {
  homepage: HomepageContentConfig;
  courses: AdminCourse[];
  articles: AdminArticle[];
  mediaLibrary: MediaAsset[];
  onSaveHomepage: (updated: HomepageContentConfig) => void;
}

export function HomepageEditorModule({
  homepage,
  courses,
  articles,
  mediaLibrary,
  onSaveHomepage,
}: HomepageEditorModuleProps) {
  const [draft, setDraft] = useState<HomepageContentConfig>({ ...homepage });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const toggleFeaturedCourse = (courseId: string) => {
    const exists = draft.featuredCourseIds.includes(courseId);
    setDraft({
      ...draft,
      featuredCourseIds: exists
        ? draft.featuredCourseIds.filter((id) => id !== courseId)
        : [...draft.featuredCourseIds, courseId],
    });
  };

  const toggleFeaturedArticle = (articleId: string) => {
    const exists = draft.featuredArticleIds.includes(articleId);
    setDraft({
      ...draft,
      featuredArticleIds: exists
        ? draft.featuredArticleIds.filter((id) => id !== articleId)
        : [...draft.featuredArticleIds, articleId],
    });
  };

  const handleSave = () => {
    if (draft.mainHeading.trim().length < 6) {
      setFormError('Main heading must be at least 6 characters.');
      return;
    }
    if (!draft.primaryButtonText.trim() || !draft.secondaryButtonText.trim()) {
      setFormError('Both primary and secondary hero button labels are required.');
      return;
    }
    setFormError(null);
    onSaveHomepage({
      ...draft,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Homepage Content Editor"
        description="Update hero text, call-to-action labels, featured courses/articles, section copy, and site announcements without altering the Stage 1 visual layout."
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-700 bg-[#0B1220] px-4 py-2 text-xs font-semibold text-[#F8FAFC] hover:border-[#06B6D4] cursor-pointer"
            >
              <Eye className="h-4 w-4 text-cyan-300" />
              Preview Draft
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              Save Homepage Draft
            </button>
          </div>
        }
      />

      <Stage2BackendNotice collectionName="website_settings" />

      {savedToast && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/25 px-4 py-2.5 text-xs text-emerald-200">
          Homepage content published to Cloud Firestore. Public homepage updated live.
        </div>
      )}

      {formError && (
        <p role="alert" className="rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-2.5 text-xs text-red-200">
          {formError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-xl border border-slate-800 bg-[#14243A]/75 p-5 lg:col-span-7">
          <h3 className="border-b border-slate-800 pb-3 font-display text-base font-bold text-[#F8FAFC]">
            Hero & Announcement Copy
          </h3>

          <div>
            <label className="block text-xs font-medium text-[#CBD5E1]">Main Hero Heading *</label>
            <input
              type="text"
              value={draft.mainHeading}
              onChange={(e) => setDraft({ ...draft, mainHeading: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-sm text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#CBD5E1]">Homepage Description</label>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#CBD5E1]">Primary Button Text *</label>
              <input
                type="text"
                value={draft.primaryButtonText}
                onChange={(e) => setDraft({ ...draft, primaryButtonText: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#CBD5E1]">Secondary Button Text *</label>
              <input
                type="text"
                value={draft.secondaryButtonText}
                onChange={(e) => setDraft({ ...draft, secondaryButtonText: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#CBD5E1]">Hero Visual Banner Image</label>
            <select
              value={draft.heroBannerImage}
              onChange={(e) => setDraft({ ...draft, heroBannerImage: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
            >
              {mediaLibrary.map((asset) => (
                <option key={asset.id} value={asset.url}>
                  {asset.title}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-3">
            <label className="flex items-center gap-2 text-xs text-[#CBD5E1] cursor-pointer">
              <input
                type="checkbox"
                checked={draft.announcementEnabled}
                onChange={(e) => setDraft({ ...draft, announcementEnabled: e.target.checked })}
                className="h-4 w-4 accent-[#2563EB]"
              />
              Enable Homepage Announcement Banner
            </label>
            <input
              type="text"
              value={draft.announcementText}
              onChange={(e) => setDraft({ ...draft, announcementText: e.target.value })}
              placeholder="Announcement text..."
              className="w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-800 bg-[#14243A]/75 p-5 lg:col-span-5">
          <h3 className="border-b border-slate-800 pb-3 font-display text-base font-bold text-[#F8FAFC]">
            Featured Blocks & Section Copy
          </h3>

          <div>
            <label className="block text-xs font-medium text-[#CBD5E1]">IT Awareness Section Heading</label>
            <input
              type="text"
              value={draft.awarenessSectionHeading}
              onChange={(e) => setDraft({ ...draft, awarenessSectionHeading: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#CBD5E1]">Technical Solutions Heading</label>
            <input
              type="text"
              value={draft.solutionsSectionHeading}
              onChange={(e) => setDraft({ ...draft, solutionsSectionHeading: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-[#CBD5E1]">Featured Courses on Homepage</p>
            <div className="mt-1.5 space-y-1.5 rounded-lg border border-slate-800 bg-[#0B1220] p-2.5">
              {courses.map((course) => (
                <label key={course.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.featuredCourseIds.includes(course.id)}
                    onChange={() => toggleFeaturedCourse(course.id)}
                    className="h-3.5 w-3.5 accent-[#2563EB]"
                  />
                  <span className="truncate">{course.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[#CBD5E1]">Featured Articles on Homepage</p>
            <div className="mt-1.5 space-y-1.5 rounded-lg border border-slate-800 bg-[#0B1220] p-2.5">
              {articles.map((article) => (
                <label key={article.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.featuredArticleIds.includes(article.id)}
                    onChange={() => toggleFeaturedArticle(article.id)}
                    className="h-3.5 w-3.5 accent-[#2563EB]"
                  />
                  <span className="truncate">{article.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#070D18]/85 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-[#0F1B2E] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-cyan-300">
                Homepage Hero & Sections Preview (Draft)
              </span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-lg border border-slate-700 bg-[#0B1220] p-1.5 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {draft.announcementEnabled && draft.announcementText && (
              <div className="rounded-lg border border-cyan-500/30 bg-[#14243A] px-4 py-2 text-xs text-cyan-200">
                {draft.announcementText}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-center">
              <div className="md:col-span-7 space-y-3">
                <p className="text-xs font-semibold text-[#06B6D4]">THREE ANGELS IT SERVICES</p>
                <h4 className="font-display text-2xl font-bold text-[#F8FAFC]">{draft.mainHeading}</h4>
                <p className="text-xs leading-relaxed text-[#CBD5E1]">{draft.description}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <span className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white">
                    {draft.primaryButtonText}
                  </span>
                  <span className="rounded-lg border border-slate-700 bg-[#0B1220] px-4 py-2 text-xs font-semibold text-[#CBD5E1]">
                    {draft.secondaryButtonText}
                  </span>
                </div>
              </div>
              <div className="md:col-span-5 overflow-hidden rounded-xl border border-slate-800">
                <img
                  src={draft.heroBannerImage}
                  alt="Hero preview banner"
                  referrerPolicy="no-referrer"
                  className="h-44 w-full object-cover"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-slate-800 pt-4 text-xs sm:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-[#0B1220] p-3">
                <p className="font-semibold text-cyan-300">IT Awareness Section</p>
                <p className="mt-1 text-slate-300">{draft.awarenessSectionHeading}</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#0B1220] p-3">
                <p className="font-semibold text-cyan-300">Technical Solutions Section</p>
                <p className="mt-1 text-slate-300">{draft.solutionsSectionHeading}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MenuManagementModuleProps {
  menuItems: MenuNavItem[];
  onSaveMenu: (items: MenuNavItem[]) => void;
}

export function MenuManagementModule({ menuItems, onSaveMenu }: MenuManagementModuleProps) {
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuNavItem | null>(null);

  const sorted = [...menuItems].sort((a, b) => a.order - b.order);

  const handleAdd = () => {
    if (!newLabel.trim() || !newUrl.trim()) {
      setFormError('Enter both a menu label and destination URL or anchor (e.g., #guides).');
      return;
    }
    setFormError(null);
    const nextItem: MenuNavItem = {
      id: `menu-${Date.now()}`,
      label: newLabel.trim(),
      url: newUrl.trim(),
      enabled: true,
      order: sorted.length + 1,
      protectedSystem: false,
    };
    onSaveMenu([...sorted, nextItem]);
    setNewLabel('');
    setNewUrl('');
  };

  const handleMove = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= sorted.length) return;
    const copy = [...sorted];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onSaveMenu(copy.map((item, idx) => ({ ...item, order: idx + 1 })));
  };

  const handleToggleEnabled = (item: MenuNavItem) => {
    if (item.protectedSystem) return;
    onSaveMenu(
      sorted.map((entry) =>
        entry.id === item.id ? { ...entry, enabled: !entry.enabled } : entry
      )
    );
  };

  const handleSaveEdit = (item: MenuNavItem) => {
    if (!editLabel.trim() || (!item.protectedSystem && !editUrl.trim())) {
      setFormError('Label and destination URL cannot be empty.');
      return;
    }
    setFormError(null);
    onSaveMenu(
      sorted.map((entry) =>
        entry.id === item.id
          ? {
              ...entry,
              label: editLabel.trim(),
              url: item.protectedSystem ? entry.url : editUrl.trim(),
            }
          : entry
      )
    );
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Menu Management"
        description="Manage header navigation labels, ordering, and visibility. Essential system routes (Home, Contact Us, Admin Portal) remain protected."
      />

      <Stage2BackendNotice collectionName="website_settings" />

      {/* Add Menu Item */}
      <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-5 space-y-3">
        <h3 className="font-display text-base font-bold text-[#F8FAFC]">Add Navigation Item</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Menu Label (e.g., Security Checklist)"
            className="sm:col-span-5 rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Destination URL or Anchor (e.g., #resources)"
            className="sm:col-span-5 rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 font-mono text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="sm:col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        {formError && <p className="text-xs text-red-400">{formError}</p>}
      </div>

      {/* Menu Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#14243A]/75">
        <table className="w-full min-w-[740px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-[#0F1B2E] text-slate-400">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Label</th>
              <th className="px-4 py-3 font-medium">Destination URL</th>
              <th className="px-4 py-3 font-medium">Visibility</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {sorted.map((item, idx) => {
              const isEditingRow = editingId === item.id;
              return (
                <tr key={item.id} className="hover:bg-[#0B1220]/40">
                  <td className="px-4 py-3 font-mono text-slate-400 tabular-nums">
                    <div className="flex items-center gap-1">
                      <span>#{item.order}</span>
                      <button
                        type="button"
                        aria-label="Move up"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, -1)}
                        className="rounded p-1 text-slate-400 hover:bg-[#14243A] hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        aria-label="Move down"
                        disabled={idx === sorted.length - 1}
                        onClick={() => handleMove(idx, 1)}
                        className="rounded p-1 text-slate-400 hover:bg-[#14243A] hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#F8FAFC]">
                    {isEditingRow ? (
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="rounded border border-slate-700 bg-[#0B1220] px-2 py-1 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                      />
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        {item.label}
                        {item.protectedSystem && (
                          <span title="Protected system route" className="inline-flex items-center">
                            <Lock className="h-3 w-3 text-[#F59E0B]" aria-hidden="true" />
                          </span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {isEditingRow && !item.protectedSystem ? (
                      <input
                        type="text"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="rounded border border-slate-700 bg-[#0B1220] px-2 py-1 font-mono text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                      />
                    ) : (
                      item.url
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.protectedSystem ? (
                      <span className="text-slate-400">Always Enabled (System)</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleEnabled(item)}
                        className={`font-semibold cursor-pointer ${
                          item.enabled ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {item.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isEditingRow ? (
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item)}
                          className="rounded bg-[#2563EB] px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(item.id);
                            setEditLabel(item.label);
                            setEditUrl(item.url);
                          }}
                          className="rounded border border-slate-700 bg-[#0B1220] px-2.5 py-1 text-xs font-medium text-cyan-300 hover:border-cyan-400 cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                      {!item.protectedSystem && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="rounded border border-slate-700 bg-[#0B1220] p-1.5 text-red-400 hover:border-red-400 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        entityType="Menu Item"
        itemLabel={deleteTarget?.label ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            onSaveMenu(
              sorted
                .filter((i) => i.id !== deleteTarget.id)
                .map((i, idx) => ({ ...i, order: idx + 1 }))
            );
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
