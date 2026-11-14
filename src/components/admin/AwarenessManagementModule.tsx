import { Edit3, Plus, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import { adminDataRepository, AWARENESS_CATEGORIES } from '../../services/adminDataService';
import type { AdminAwarenessPost, AwarenessCategory, MediaAsset, PublicationStatus } from '../../types/admin';
import { validateImageUpload } from '../../utils/fileValidation';
import { AdminSectionHeader, ConfirmDeleteModal, Stage2BackendNotice } from './AdminSharedUI';

interface AwarenessManagementModuleProps {
  posts: AdminAwarenessPost[];
  mediaLibrary: MediaAsset[];
  onSavePost: (post: AdminAwarenessPost, isNew: boolean) => void;
  onDeletePost: (id: string) => void;
  onTogglePublish: (id: string) => void;
  onRegisterMedia: (asset: MediaAsset) => void;
}

function createEmptyAwarenessPost(defaultImg: string): AdminAwarenessPost {
  return {
    id: `aware-${Date.now()}`,
    weekLabel: 'Week 47 Briefing',
    title: '',
    category: 'Cybersecurity',
    summary: '',
    imageUrl: defaultImg,
    cybersecurityTips: ['Verify sender domains before clicking links'],
    digitalSafetyGuidance: ['Confirm urgent requests via official internal channels'],
    weeklyContent: '',
    status: 'Draft',
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

export default function AwarenessManagementModule({
  posts,
  mediaLibrary,
  onSavePost,
  onDeletePost,
  onTogglePublish,
  onRegisterMedia,
}: AwarenessManagementModuleProps) {
  const [editing, setEditing] = useState<AdminAwarenessPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'All' | AwarenessCategory>('All');
  const [tipsText, setTipsText] = useState('');
  const [guidanceText, setGuidanceText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAwarenessPost | null>(null);

  const filteredPosts = posts.filter(
    (p) => categoryFilter === 'All' || p.category === categoryFilter
  );

  const openEditor = (post: AdminAwarenessPost, createMode: boolean) => {
    setIsNew(createMode);
    setEditing({ ...post });
    setTipsText(post.cybersecurityTips.join('\n'));
    setGuidanceText(post.digitalSafetyGuidance.join('\n'));
    setUploadError(null);
    setFormError(null);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    const validation = validateImageUpload(file);
    if (!validation.valid) {
      setUploadError(validation.error ?? 'Invalid image upload.');
      return;
    }
    setUploadError(null);
    try {
      const uploadedUrl = await adminDataRepository.uploadImageAsset(file);
      const asset: MediaAsset = {
        id: `media-${Date.now()}`,
        title: file.name.replace(/\.[^.]+$/, ''),
        description: 'Uploaded for IT Awareness briefing',
        altText: `${editing.title || 'IT awareness'} illustration`,
        category: 'Cybersecurity',
        fileName: file.name,
        mimeType: file.type as MediaAsset['mimeType'],
        sizeBytes: file.size,
        url: uploadedUrl,
        uploadedAt: new Date().toISOString().slice(0, 10),
      };
      onRegisterMedia(asset);
      setEditing({ ...editing, imageUrl: uploadedUrl });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Unable to upload awareness image.');
    }
  };

  const handleSave = (statusOverride?: PublicationStatus) => {
    if (!editing) return;
    if (editing.title.trim().length < 4) {
      setFormError('Awareness title must be at least 4 characters.');
      return;
    }
    if (editing.summary.trim().length < 15) {
      setFormError('Provide a short educational summary (at least 15 characters).');
      return;
    }
    const cleaned: AdminAwarenessPost = {
      ...editing,
      title: editing.title.trim(),
      summary: editing.summary.trim(),
      cybersecurityTips: tipsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      digitalSafetyGuidance: guidanceText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      status: statusOverride ?? editing.status,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSavePost(cleaned, isNew);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="IT Awareness Management"
        description="Author original weekly security briefings, practical cybersecurity tips, and digital safety guidance."
        action={
          <button
            type="button"
            onClick={() => openEditor(createEmptyAwarenessPost(mediaLibrary[2]?.url ?? ''), true)}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap hover:bg-blue-500 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Awareness Post
          </button>
        }
      />

      <Stage2BackendNotice collectionName="awareness_posts" />

      {editing ? (
        <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="font-display text-lg font-bold text-[#F8FAFC]">
              {isNew ? 'Create Weekly IT Awareness Post' : `Edit: ${editing.title}`}
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1]">Week Label</label>
                  <input
                    type="text"
                    value={editing.weekLabel}
                    onChange={(e) => setEditing({ ...editing, weekLabel: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1]">Category</label>
                  <select
                    value={editing.category}
                    onChange={(e) =>
                      setEditing({ ...editing, category: e.target.value as AwarenessCategory })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                  >
                    {AWARENESS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Post Title *</label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="e.g., Recognizing Fake Delivery Links & SMS Phishing"
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Summary *</label>
                <textarea
                  rows={3}
                  value={editing.summary}
                  onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Weekly Awareness Narrative</label>
                <textarea
                  rows={4}
                  value={editing.weeklyContent}
                  onChange={(e) => setEditing({ ...editing, weeklyContent: e.target.value })}
                  placeholder="Scenario breakdown or real-world educational example..."
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4 lg:col-span-5">
              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Cybersecurity Tips (1 per line)</label>
                <textarea
                  rows={4}
                  value={tipsText}
                  onChange={(e) => setTipsText(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Digital Safety Guidance (1 per line)</label>
                <textarea
                  rows={4}
                  value={guidanceText}
                  onChange={(e) => setGuidanceText(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Visual Graphic (JPG/PNG/WebP)</label>
                <div className="mt-1.5 flex flex-col gap-2">
                  <select
                    value={editing.imageUrl}
                    onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                  >
                    {mediaLibrary.map((m) => (
                      <option key={m.id} value={m.url}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                  <label className="inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-cyan-300 hover:border-cyan-400 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Verified Image (Max 5 MB)</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>
                  {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
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
                  Publish Post
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-[#14243A]/75 p-2">
            {(['All', ...AWARENESS_CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#14243A]/75 p-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono text-cyan-300">{post.weekLabel} · {post.category}</span>
                    <button
                      type="button"
                      onClick={() => onTogglePublish(post.id)}
                      className={`font-semibold cursor-pointer ${
                        post.status === 'Published' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {post.status}
                    </button>
                  </div>
                  <h3 className="mt-2 font-display text-base font-bold text-[#F8FAFC]">{post.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#CBD5E1]">{post.summary}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#06B6D4]" />
                    <span>{post.cybersecurityTips.length} tips · {post.digitalSafetyGuidance.length} guidance rules</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => openEditor(post, false)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:border-cyan-400 cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(post)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-1.5 text-xs font-semibold text-red-400 hover:border-red-400 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        entityType="Awareness Post"
        itemLabel={deleteTarget?.title ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onDeletePost(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
