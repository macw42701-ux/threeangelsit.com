import { Bold, Code, Edit3, Eye, Heading2, Italic, List, Plus, Search, Star, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { AdminArticle, MediaAsset, PublicationStatus } from '../../types/admin';
import { AdminSectionHeader, ConfirmDeleteModal, Stage2BackendNotice } from './AdminSharedUI';

interface BlogManagementModuleProps {
  articles: AdminArticle[];
  mediaLibrary: MediaAsset[];
  onSaveArticle: (article: AdminArticle, isNew: boolean) => void;
  onDeleteArticle: (id: string) => void;
  onTogglePublish: (id: string) => void;
  onToggleFeatured: (id: string) => void;
}

const BLOG_CATEGORIES = [
  'Networking & Windows',
  'Linux Operations',
  'Cybersecurity',
  'IT Helpdesk',
  'Cloud & Infrastructure',
];

function createEmptyArticle(defaultImage: string): AdminArticle {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: `blog-${Date.now()}`,
    title: '',
    subtitle: '',
    content: '',
    featuredImage: defaultImage,
    author: 'THREE ANGELS Editorial Team',
    category: BLOG_CATEGORIES[0],
    tags: [],
    seoTitle: '',
    seoDescription: '',
    status: 'Draft',
    publishedDate: today,
    featured: false,
    updatedAt: today,
  };
}

export default function BlogManagementModule({
  articles,
  mediaLibrary,
  onSaveArticle,
  onDeleteArticle,
  onTogglePublish,
  onToggleFeatured,
}: BlogManagementModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | PublicationStatus>('All');
  const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null);
  const [isNewMode, setIsNewMode] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [previewArticle, setPreviewArticle] = useState<AdminArticle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminArticle | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const categories = ['All', ...Array.from(new Set([...BLOG_CATEGORIES, ...articles.map((a) => a.category)]))];

  const filteredArticles = articles.filter((article) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      article.title.toLowerCase().includes(q) ||
      article.subtitle.toLowerCase().includes(q) ||
      article.tags.some((t) => t.toLowerCase().includes(q));
    const matchesCategory = categoryFilter === 'All' || article.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || article.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenNew = () => {
    setIsNewMode(true);
    setFormError(null);
    setEditingArticle(createEmptyArticle(mediaLibrary[1]?.url ?? mediaLibrary[0]?.url ?? ''));
    setTagInput('');
  };

  const handleOpenEdit = (article: AdminArticle) => {
    setIsNewMode(false);
    setFormError(null);
    setEditingArticle({ ...article, tags: [...article.tags] });
    setTagInput('');
  };

  const insertFormatting = (prefix: string, suffix = '') => {
    if (!editingArticle) return;
    const textarea = contentRef.current;
    if (!textarea) {
      setEditingArticle({ ...editingArticle, content: `${editingArticle.content}\n${prefix}${suffix}` });
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = editingArticle.content.slice(start, end) || 'Text';
    const next =
      editingArticle.content.slice(0, start) +
      prefix +
      selected +
      suffix +
      editingArticle.content.slice(end);
    setEditingArticle({ ...editingArticle, content: next });
  };

  const handleAddTag = () => {
    if (!editingArticle) return;
    const clean = tagInput.trim();
    if (!clean) return;
    if (!editingArticle.tags.includes(clean)) {
      setEditingArticle({ ...editingArticle, tags: [...editingArticle.tags, clean] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    if (!editingArticle) return;
    setEditingArticle({
      ...editingArticle,
      tags: editingArticle.tags.filter((t) => t !== tag),
    });
  };

  const handleSave = (overrideStatus?: PublicationStatus) => {
    if (!editingArticle) return;
    if (editingArticle.title.trim().length < 5) {
      setFormError('Article title must be at least 5 characters.');
      return;
    }
    if (editingArticle.content.trim().length < 20) {
      setFormError('Article content must be at least 20 characters.');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const saved: AdminArticle = {
      ...editingArticle,
      title: editingArticle.title.trim(),
      subtitle: editingArticle.subtitle.trim(),
      seoTitle: editingArticle.seoTitle.trim() || `${editingArticle.title.trim()} | THREE ANGELS IT SERVICES`,
      seoDescription: editingArticle.seoDescription.trim() || editingArticle.subtitle.trim(),
      status: overrideStatus ?? editingArticle.status,
      updatedAt: today,
    };
    onSaveArticle(saved, isNewMode);
    setEditingArticle(null);
    setFormError(null);
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Blog Management"
        description="Create, edit, tag, preview, and organize technical articles with SEO metadata and featured placement."
        action={
          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap hover:bg-blue-500 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Article
          </button>
        }
      />

      <Stage2BackendNotice collectionName="articles" />

      {/* Editor View */}
      {editingArticle ? (
        <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <h3 className="font-display text-lg font-bold text-[#F8FAFC]">
              {isNewMode ? 'Create New Article' : `Edit Article: ${editingArticle.title || 'Untitled'}`}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewArticle(editingArticle)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs font-semibold text-[#F8FAFC] hover:border-[#06B6D4] cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Main Content Column */}
            <div className="space-y-4 lg:col-span-8">
              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Article Title *</label>
                <input
                  type="text"
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  placeholder="Clear, diagnostic engineering headline"
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Article Subtitle / Summary</label>
                <input
                  type="text"
                  value={editingArticle.subtitle}
                  onChange={(e) => setEditingArticle({ ...editingArticle, subtitle: e.target.value })}
                  placeholder="Concise one-sentence summary of what readers will learn"
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                />
              </div>

              {/* Rich Formatting Toolbar + Editor */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-medium text-[#CBD5E1]">Article Content (Markdown Rich Text) *</label>
                  <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0B1220] p-1">
                    <button
                      type="button"
                      title="Heading 2"
                      onClick={() => insertFormatting('\n## ')}
                      className="rounded p-1.5 text-slate-300 hover:bg-[#14243A] hover:text-white cursor-pointer"
                    >
                      <Heading2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Bold"
                      onClick={() => insertFormatting('**', '**')}
                      className="rounded p-1.5 text-slate-300 hover:bg-[#14243A] hover:text-white cursor-pointer"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Italic"
                      onClick={() => insertFormatting('*', '*')}
                      className="rounded p-1.5 text-slate-300 hover:bg-[#14243A] hover:text-white cursor-pointer"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Bullet List"
                      onClick={() => insertFormatting('\n- ')}
                      className="rounded p-1.5 text-slate-300 hover:bg-[#14243A] hover:text-white cursor-pointer"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Command / Code Block"
                      onClick={() => insertFormatting('\n```\n', '\n```\n')}
                      className="rounded p-1.5 text-slate-300 hover:bg-[#14243A] hover:text-white cursor-pointer"
                    >
                      <Code className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <textarea
                  ref={contentRef}
                  rows={11}
                  value={editingArticle.content}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  placeholder="Write original technical guidance, diagnostic steps, and preventive measures..."
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2.5 font-mono text-xs leading-relaxed text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                />
              </div>
            </div>

            {/* Metadata & SEO Sidebar Column */}
            <div className="space-y-4 lg:col-span-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1]">Publication Status</label>
                  <select
                    value={editingArticle.status}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, status: e.target.value as PublicationStatus })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1]">Publication Date</label>
                  <input
                    type="date"
                    value={editingArticle.publishedDate}
                    onChange={(e) => setEditingArticle({ ...editingArticle, publishedDate: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Author</label>
                <input
                  type="text"
                  value={editingArticle.author}
                  onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Category</label>
                <select
                  value={editingArticle.category}
                  onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                >
                  {BLOG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Featured Image (Media Library)</label>
                <select
                  value={editingArticle.featuredImage}
                  onChange={(e) => setEditingArticle({ ...editingArticle, featuredImage: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                >
                  {mediaLibrary.map((asset) => (
                    <option key={asset.id} value={asset.url}>
                      {asset.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Tags</label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag..."
                    className="flex-1 rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-1.5 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="rounded-lg border border-slate-700 bg-[#0F1B2E] px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:border-cyan-400 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                {editingArticle.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                    {editingArticle.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="inline-flex items-center gap-1 rounded border border-slate-700 bg-[#0B1220] px-2 py-0.5 text-[11px] text-slate-200 hover:border-red-400 cursor-pointer"
                      >
                        <span>{tag}</span>
                        <X className="h-3 w-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2.5 text-xs text-[#CBD5E1] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingArticle.featured}
                  onChange={(e) => setEditingArticle({ ...editingArticle, featured: e.target.checked })}
                  className="h-4 w-4 accent-[#2563EB]"
                />
                Feature article on Homepage
              </label>

              <div className="border-t border-slate-800 pt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1]">SEO Title</label>
                  <input
                    type="text"
                    value={editingArticle.seoTitle}
                    onChange={(e) => setEditingArticle({ ...editingArticle, seoTitle: e.target.value })}
                    placeholder="Search result title"
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1]">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    value={editingArticle.seoDescription}
                    onChange={(e) => setEditingArticle({ ...editingArticle, seoDescription: e.target.value })}
                    placeholder="Concise description (140-160 chars recommended)"
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                  />
                </div>
              </div>

              {formError && (
                <p role="alert" className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-xs text-red-200">
                  {formError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSave('Draft')}
                  className="rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2.5 text-xs font-semibold text-[#CBD5E1] hover:border-cyan-400 hover:text-white cursor-pointer"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('Published')}
                  className="rounded-lg bg-[#2563EB] px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                >
                  Publish Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Filter & Search Bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-[#14243A]/75 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, subtitle, or tag..."
                className="w-full rounded-lg border border-slate-700 bg-[#0B1220] py-2 pr-3 pl-9 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter by category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0B1220] p-1">
                {(['All', 'Published', 'Draft'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-md px-3 py-1 text-xs font-medium cursor-pointer ${
                      statusFilter === status
                        ? 'bg-[#2563EB] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Articles Table */}
          {filteredArticles.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-8 text-center">
              <p className="font-display text-base font-semibold text-[#F8FAFC]">No articles match these filters</p>
              <p className="mt-1 text-xs text-slate-400">Adjust your search terms or create a new article.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#14243A]/75">
              <table className="w-full min-w-[780px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0F1B2E] text-slate-400">
                    <th className="px-4 py-3 font-medium">Article</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-[#0B1220]/40">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#F8FAFC]">{article.title}</div>
                        <div className="mt-0.5 text-slate-400">
                          {article.author} · {article.tags.join(', ') || 'No tags'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{article.category}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => onTogglePublish(article.id)}
                          className={`font-semibold cursor-pointer ${
                            article.status === 'Published' ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {article.status}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400 tabular-nums">
                        {article.publishedDate}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title={article.featured ? 'Unfeature article' : 'Set as featured'}
                            onClick={() => onToggleFeatured(article.id)}
                            className={`rounded-lg border p-1.5 cursor-pointer ${
                              article.featured
                                ? 'border-amber-400/50 bg-amber-950/30 text-[#F59E0B]'
                                : 'border-slate-700 bg-[#0B1220] text-slate-400 hover:text-white'
                            }`}
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Preview article"
                            onClick={() => setPreviewArticle(article)}
                            className="rounded-lg border border-slate-700 bg-[#0B1220] p-1.5 text-slate-300 hover:border-cyan-400 hover:text-white cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Edit article"
                            onClick={() => handleOpenEdit(article)}
                            className="rounded-lg border border-slate-700 bg-[#0B1220] p-1.5 text-cyan-300 hover:border-cyan-400 cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete article"
                            onClick={() => setDeleteTarget(article)}
                            className="rounded-lg border border-slate-700 bg-[#0B1220] p-1.5 text-red-400 hover:border-red-400 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {previewArticle && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#070D18]/85 p-4 backdrop-blur-sm"
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-[#0F1B2E] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs font-semibold text-cyan-300">
                  Preview · {previewArticle.category} · {previewArticle.status}
                </p>
                <h3 className="mt-1 font-display text-xl font-bold text-[#F8FAFC]">
                  {previewArticle.title || 'Untitled Article'}
                </h3>
                {previewArticle.subtitle && (
                  <p className="mt-1 text-sm text-slate-400">{previewArticle.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-[#0B1220] text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {previewArticle.featuredImage && (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
                <img
                  src={previewArticle.featuredImage}
                  alt={previewArticle.title}
                  referrerPolicy="no-referrer"
                  className="h-48 w-full object-cover"
                />
              </div>
            )}

            <div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-[#CBD5E1]">
              {previewArticle.content}
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        entityType="Article"
        itemLabel={deleteTarget?.title ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onDeleteArticle(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
