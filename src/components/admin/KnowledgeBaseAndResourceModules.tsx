import { BookOpen, Edit3, FileText, Plus, ShieldAlert, Trash2, Upload } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import { adminDataRepository, KB_CATEGORIES } from '../../services/adminDataService';
import type {
  AdminDigitalResource,
  AdminKBGuide,
  KBCategory,
  MediaAsset,
  PublicationStatus,
} from '../../types/admin';
import { formatBytes, validateDigitalResourceUpload } from '../../utils/fileValidation';
import { AdminSectionHeader, ConfirmDeleteModal, Stage2BackendNotice } from './AdminSharedUI';

interface KnowledgeBaseModuleProps {
  guides: AdminKBGuide[];
  mediaLibrary: MediaAsset[];
  onSaveGuide: (guide: AdminKBGuide, isNew: boolean) => void;
  onDeleteGuide: (id: string) => void;
  onTogglePublish: (id: string) => void;
}

export function KnowledgeBaseManagementModule({
  guides,
  mediaLibrary,
  onSaveGuide,
  onDeleteGuide,
  onTogglePublish,
}: KnowledgeBaseModuleProps) {
  const [categoryFilter, setCategoryFilter] = useState<'All' | KBCategory>('All');
  const [editing, setEditing] = useState<AdminKBGuide | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [stepsText, setStepsText] = useState('');
  const [commandsText, setCommandsText] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminKBGuide | null>(null);

  const openEditor = (guide: AdminKBGuide, createMode: boolean) => {
    setIsNew(createMode);
    setEditing({ ...guide });
    setStepsText(guide.steps.join('\n'));
    setCommandsText(guide.commands.join('\n'));
    setKeywordsText(guide.keywords.join(', '));
    setFormError(null);
  };

  const handleNew = () => {
    openEditor(
      {
        id: `kb-${Date.now()}`,
        title: '',
        category: 'Networking',
        difficulty: 'Beginner',
        keywords: [],
        diagramUrl: mediaLibrary[1]?.url ?? '',
        steps: ['Verify physical or logical connectivity first'],
        commands: [],
        status: 'Draft',
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      true
    );
  };

  const handleSave = (statusOverride?: PublicationStatus) => {
    if (!editing) return;
    if (editing.title.trim().length < 5) {
      setFormError('Troubleshooting guide title must be at least 5 characters.');
      return;
    }
    const steps = stepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (steps.length === 0) {
      setFormError('Add at least one step-by-step troubleshooting instruction.');
      return;
    }
    const saved: AdminKBGuide = {
      ...editing,
      title: editing.title.trim(),
      keywords: keywordsText
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      steps,
      commands: commandsText
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean),
      status: statusOverride ?? editing.status,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSaveGuide(saved, isNew);
    setEditing(null);
  };

  const visibleGuides = guides.filter(
    (g) => categoryFilter === 'All' || g.category === categoryFilter
  );

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Knowledge Base Management"
        description="Author structured IT troubleshooting guides, diagnostic CLI commands, keywords, and original architecture diagrams."
        action={
          <button
            type="button"
            onClick={handleNew}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap hover:bg-blue-500 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Troubleshooting Guide
          </button>
        }
      />

      <Stage2BackendNotice collectionName="knowledge_base" />

      {editing ? (
        <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="font-display text-lg font-bold text-[#F8FAFC]">
              {isNew ? 'Create Knowledge Base Guide' : `Edit Guide: ${editing.title}`}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">Guide Title *</label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-sm text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">
                  Step-by-Step Instructions (1 step per line) *
                </label>
                <textarea
                  rows={6}
                  value={stepsText}
                  onChange={(e) => setStepsText(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">
                  Diagnostic Commands (1 per line)
                </label>
                <textarea
                  rows={4}
                  value={commandsText}
                  onChange={(e) => setCommandsText(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 font-mono text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4 lg:col-span-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1]">Category</label>
                  <select
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value as KBCategory })}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                  >
                    {KB_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1]">Difficulty</label>
                  <select
                    value={editing.difficulty}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        difficulty: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced',
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  placeholder="DNS, SMB, 0x80070035, Firewall"
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1]">
                  Diagram / Screenshot (Media Library)
                </label>
                <select
                  value={editing.diagramUrl}
                  onChange={(e) => setEditing({ ...editing, diagramUrl: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                >
                  {mediaLibrary.map((asset) => (
                    <option key={asset.id} value={asset.url}>
                      {asset.title}
                    </option>
                  ))}
                </select>
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
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('Published')}
                  className="rounded-lg bg-[#2563EB] px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                >
                  Publish Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-[#14243A]/75 p-2">
            {(['All', ...KB_CATEGORIES] as const).map((cat) => (
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

          {visibleGuides.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-8 text-center">
              <BookOpen className="mx-auto h-6 w-6 text-[#06B6D4]" />
              <p className="mt-2 font-display text-base font-semibold text-[#F8FAFC]">
                No guides in {categoryFilter} yet
              </p>
              <p className="mt-1 text-xs text-slate-400">Click &ldquo;New Troubleshooting Guide&rdquo; to document this topic.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#14243A]/75">
              <table className="w-full min-w-[740px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0F1B2E] text-slate-400">
                    <th className="px-4 py-3 font-medium">Guide Title</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Difficulty</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {visibleGuides.map((guide) => (
                    <tr key={guide.id} className="hover:bg-[#0B1220]/40">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#F8FAFC]">{guide.title}</p>
                        <p className="mt-0.5 text-slate-400">
                          {guide.steps.length} steps · {guide.keywords.join(', ')}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{guide.category}</td>
                      <td className="px-4 py-3 text-slate-300">{guide.difficulty}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => onTogglePublish(guide.id)}
                          className={`font-semibold cursor-pointer ${
                            guide.status === 'Published' ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {guide.status}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditor(guide, false)}
                            className="rounded-lg border border-slate-700 bg-[#0B1220] p-1.5 text-cyan-300 hover:border-cyan-400 cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(guide)}
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

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        entityType="Knowledge Base Guide"
        itemLabel={deleteTarget?.title ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onDeleteGuide(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

interface DigitalResourceModuleProps {
  resources: AdminDigitalResource[];
  onSaveResource: (res: AdminDigitalResource, isNew: boolean) => void;
  onDeleteResource: (id: string) => void;
  onTogglePublish: (id: string) => void;
}

const RESOURCE_CATEGORIES = [
  'Networking Reference',
  'SysAdmin Triage',
  'Cybersecurity',
  'IT Support',
  'Study Guides',
  'Networking Diagrams',
];

export function DigitalResourceManagementModule({
  resources,
  onSaveResource,
  onDeleteResource,
  onTogglePublish,
}: DigitalResourceModuleProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(RESOURCE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminDigitalResource | null>(null);

  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const check = validateDigitalResourceUpload(file);
    if (!check.valid) {
      setValidationError(check.error ?? 'File blocked by security policy.');
      setPendingFile(null);
      e.target.value = '';
      return;
    }
    setValidationError(null);
    setPendingFile(file);
    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
    }
  };

  const handleAddResource = async () => {
    if (title.trim().length < 4) {
      setValidationError('Enter a descriptive resource title (at least 4 characters).');
      return;
    }

    const cleanExternal = externalUrl.trim();
    if (!pendingFile && !cleanExternal) {
      setValidationError(
        'Upload a safe study guide (.md/.txt/.csv or compact diagram) OR paste a free external HTTPS download link.'
      );
      return;
    }
    if (cleanExternal && !cleanExternal.startsWith('https://')) {
      setValidationError('External download URL must use secure https://.');
      return;
    }

    setUploading(true);
    setValidationError(null);
    try {
      const uploaded = pendingFile
        ? await adminDataRepository.uploadDigitalResourceFile(pendingFile)
        : {};
      const inferredFileName = pendingFile
        ? pendingFile.name
        : `${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
      const item: AdminDigitalResource = {
        id: `res-${Date.now()}`,
        title: title.trim(),
        fileName: inferredFileName,
        fileType: pendingFile
          ? pendingFile.type || pendingFile.name.split('.').pop()?.toUpperCase() || 'Document'
          : 'External HTTPS Link',
        fileSizeBytes: pendingFile ? pendingFile.size : 0,
        category,
        uploadDate: new Date().toISOString().slice(0, 10),
        status: 'Published',
        description: description.trim() || 'Downloadable IT learning material.',
        content: uploaded.content,
        downloadUrl: cleanExternal || uploaded.downloadUrl,
      };
      onSaveResource(item, true);
      setTitle('');
      setDescription('');
      setExternalUrl('');
      setPendingFile(null);
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : 'Unable to save resource entry.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Digital Resource Management"
        description="Publish Markdown/TXT/CSV study guides within the free Firebase Spark tier or attach free external HTTPS links (GitHub Releases / Google Drive) for large PDFs at ₹0 cost."
      />

      <Stage2BackendNotice collectionName="digital_resources (Spark Free Tier)" />

      {/* Secure Resource Upload Form */}
      <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#06B6D4]" />
            <h3 className="font-display text-base font-bold text-[#F8FAFC]">
              Add & Publish Free Learning Resource
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Inline Spark Free: .md, .txt, .csv (≤90 KB), diagrams · Large PDFs via free HTTPS URL
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-[#CBD5E1]">Resource Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Subnetting & VLAN Lab Checklist"
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-[#CBD5E1]">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
            >
              {RESOURCE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-[#CBD5E1]">Upload Inline Study File (Optional)</label>
            <label className="mt-1.5 flex items-center justify-between gap-2 rounded-lg border border-dashed border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-cyan-300 hover:border-cyan-400 cursor-pointer">
              <span className="truncate">
                {pendingFile
                  ? `${pendingFile.name} (${formatBytes(pendingFile.size)})`
                  : 'Choose .md, .txt, .csv, or diagram...'}
              </span>
              <Upload className="h-4 w-4 shrink-0" />
              <input
                type="file"
                accept=".md,.txt,.csv,.png,.jpg,.jpeg,.webp"
                onChange={handleFileSelected}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className="block text-xs font-medium text-[#CBD5E1]">
              Free External PDF / Video HTTPS URL (Optional)
            </label>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://github.com/... or https://drive.google.com/..."
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
            />
          </div>

          <div className="md:col-span-6 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[#CBD5E1]">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of what learners get from this resource"
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
              />
            </div>
            <button
              type="button"
              disabled={uploading}
              onClick={handleAddResource}
              className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap hover:bg-blue-500 disabled:opacity-60 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              {uploading ? 'Saving...' : 'Add Resource Entry'}
            </button>
          </div>
        </div>

        {validationError && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/30 px-3.5 py-2.5 text-xs text-red-200"
          >
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Resource Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#14243A]/75">
        <table className="w-full min-w-[780px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-[#0F1B2E] text-slate-400">
              <th className="px-4 py-3 font-medium">Title & File Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Upload Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {resources.map((res) => (
              <tr key={res.id} className="hover:bg-[#0B1220]/40">
                <td className="px-4 py-3">
                  <p className="font-semibold text-[#F8FAFC]">{res.title}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-400">{res.fileName}</p>
                </td>
                <td className="px-4 py-3 text-slate-300">{res.category}</td>
                <td className="px-4 py-3 font-mono text-slate-400 tabular-nums">
                  {formatBytes(res.fileSizeBytes)}
                </td>
                <td className="px-4 py-3 font-mono text-slate-400 tabular-nums">{res.uploadDate}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onTogglePublish(res.id)}
                    className={`font-semibold cursor-pointer ${
                      res.status === 'Published' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {res.status}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    aria-label={`Delete ${res.title}`}
                    onClick={() => setDeleteTarget(res)}
                    className="rounded-lg border border-slate-700 bg-[#0B1220] p-1.5 text-red-400 hover:border-red-400 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        entityType="Digital Resource"
        itemLabel={deleteTarget?.title ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onDeleteResource(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
