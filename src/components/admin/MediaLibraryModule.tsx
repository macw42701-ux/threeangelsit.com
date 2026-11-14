import { Edit3, Image as ImageIcon, Search, ShieldAlert, Trash2, Upload, X } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import { adminDataRepository } from '../../services/adminDataService';
import type { MediaAsset } from '../../types/admin';
import { formatBytes, validateImageUpload } from '../../utils/fileValidation';
import { AdminSectionHeader, ConfirmDeleteModal, Stage2BackendNotice } from './AdminSharedUI';

interface MediaLibraryModuleProps {
  media: MediaAsset[];
  onAddMedia: (asset: MediaAsset) => void;
  onUpdateMedia: (asset: MediaAsset) => void;
  onDeleteMedia: (id: string) => void;
}

const MEDIA_CATEGORIES = ['All', 'Branding', 'Engineering', 'Cybersecurity', 'Diagrams', 'Courses'];

export default function MediaLibraryModule({
  media,
  onAddMedia,
  onUpdateMedia,
  onDeleteMedia,
}: MediaLibraryModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageUpload(file);
    if (!validation.valid) {
      setUploadError(validation.error ?? 'Image validation failed.');
      e.target.value = '';
      return;
    }

    setUploadError(null);
    setUploading(true);
    try {
      const url = await adminDataRepository.uploadImageAsset(file);
      const asset: MediaAsset = {
        id: `media-${Date.now()}`,
        title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        description: 'Uploaded to THREE ANGELS IT SERVICES Media Library',
        altText: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        category: categoryFilter === 'All' ? 'Engineering' : categoryFilter,
        fileName: file.name,
        mimeType: file.type as MediaAsset['mimeType'],
        sizeBytes: file.size,
        url,
        uploadedAt: new Date().toISOString().slice(0, 10),
      };
      onAddMedia(asset);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Unable to upload image asset.'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const filteredMedia = media.filter((asset) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      asset.title.toLowerCase().includes(q) ||
      asset.altText.toLowerCase().includes(q) ||
      asset.fileName.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === 'All' || asset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Media Library"
        description="Optimize verified JPG, PNG, and WebP images directly in your browser and store them within the free Firebase Spark Cloud Firestore tier (₹0 Blaze cost)."
        action={
          <label className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap hover:bg-blue-500 cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>{uploading ? 'Optimizing...' : 'Upload Image (JPG/PNG/WebP)'}</span>
            <input
              type="file"
              disabled={uploading}
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              className="sr-only"
            />
          </label>
        }
      />

      <Stage2BackendNotice collectionName="media (Spark Free Tier)" />

      {uploadError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-xs text-red-200"
        >
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-[#14243A]/75 p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images by title, filename, or alt text..."
            className="w-full rounded-lg border border-slate-700 bg-[#0B1220] py-2 pr-3 pl-9 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {MEDIA_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#2563EB] text-white'
                  : 'text-slate-300 hover:bg-[#0B1220] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-8 text-center">
          <ImageIcon className="mx-auto h-6 w-6 text-[#06B6D4]" />
          <p className="mt-2 font-display text-base font-semibold text-[#F8FAFC]">No media matches your search</p>
          <p className="mt-1 text-xs text-slate-400">Upload a JPG, JPEG, PNG, or WebP asset or clear filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMedia.map((asset) => (
            <div
              key={asset.id}
              className="flex flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-[#14243A]/75"
            >
              <div>
                <div className="aspect-[16/10] w-full bg-[#0B1220] overflow-hidden border-b border-slate-800">
                  <img
                    src={asset.url}
                    alt={asset.altText || asset.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between text-[11px] text-cyan-300">
                    <span className="font-semibold">{asset.category}</span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {formatBytes(asset.sizeBytes)}
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-sm font-bold text-[#F8FAFC]">{asset.title}</h3>
                  <p className="mt-1 text-xs text-[#CBD5E1] line-clamp-2">{asset.description}</p>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Alt: <span className="text-slate-300">{asset.altText || 'Missing alt text'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-800 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setEditingAsset({ ...asset })}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-1.5 text-xs font-semibold text-[#F8FAFC] hover:border-cyan-400 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Metadata
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(asset)}
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

      {/* Edit Metadata Modal */}
      {editingAsset && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#070D18]/80 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0F1B2E] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display text-base font-bold text-[#F8FAFC]">Edit Media Metadata</h3>
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                className="rounded-lg border border-slate-700 bg-[#0B1220] p-1.5 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#CBD5E1]">Title</label>
              <input
                type="text"
                value={editingAsset.title}
                onChange={(e) => setEditingAsset({ ...editingAsset, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#CBD5E1]">Category</label>
              <select
                value={editingAsset.category}
                onChange={(e) => setEditingAsset({ ...editingAsset, category: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
              >
                {MEDIA_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#CBD5E1]">Alternative Text (Accessibility)</label>
              <input
                type="text"
                value={editingAsset.altText}
                onChange={(e) => setEditingAsset({ ...editingAsset, altText: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#CBD5E1]">Description</label>
              <textarea
                rows={2}
                value={editingAsset.description}
                onChange={(e) => setEditingAsset({ ...editingAsset, description: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                className="rounded-lg border border-slate-700 bg-[#0B1220] px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateMedia(editingAsset);
                  setEditingAsset(null);
                }}
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
              >
                Save Metadata
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        entityType="Media Asset"
        itemLabel={deleteTarget?.title ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onDeleteMedia(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
