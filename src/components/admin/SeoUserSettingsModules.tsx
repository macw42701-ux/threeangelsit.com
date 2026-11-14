import { Check, Lock, Plus, RefreshCw, ShieldCheck, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FIRESTORE_COLLECTIONS } from '../../services/adminDataService';
import type { AuthSessionState } from '../../services/authService';
import type {
  AdminUser,
  MediaAsset,
  PlatformUser,
  SeoSettings,
  WebsiteSettings,
} from '../../types/admin';
import { AdminSectionHeader, ConfirmDeleteModal, Stage2BackendNotice } from './AdminSharedUI';

interface SeoManagementModuleProps {
  seo: SeoSettings;
  mediaLibrary: MediaAsset[];
  onSaveSeo: (updated: SeoSettings) => void;
}

export function SeoManagementModule({
  seo,
  mediaLibrary,
  onSaveSeo,
}: SeoManagementModuleProps) {
  const [draft, setDraft] = useState<SeoSettings>({ ...seo });
  const [keywordsText, setKeywordsText] = useState(seo.keywords.join(', '));
  const [sitemapText, setSitemapText] = useState(seo.sitemapPaths.join('\n'));
  const [warning, setWarning] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    setDraft({ ...seo });
    setKeywordsText(seo.keywords.join(', '));
    setSitemapText(seo.sitemapPaths.join('\n'));
  }, [seo]);

  const handleSave = () => {
    const parsedKeywords = Array.from(
      new Set(
        keywordsText
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      )
    );

    if (parsedKeywords.length > 10) {
      setWarning('Keep SEO keywords focused (10 or fewer unique phrases) to avoid keyword stuffing.');
      return;
    }
    if (!draft.pageTitle.trim() || !draft.metaDescription.trim()) {
      setWarning('Page title and meta description are required.');
      return;
    }

    setWarning(null);
    onSaveSeo({
      ...draft,
      keywords: parsedKeywords,
      sitemapPaths: sitemapText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const robotsPreview = `User-agent: *\n${draft.robotsIndex ? 'Allow: /' : 'Disallow: /'}\nDisallow: /admin\nSitemap: ${draft.canonicalUrl.replace(/\/$/, '')}/sitemap.xml`;

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="SEO Management"
        description="Configure live search metadata, canonical URL, OpenGraph sharing imagery, and robots/sitemap output without duplicate metadata."
        action={
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
          >
            <Check className="h-4 w-4" />
            Save & Publish SEO
          </button>
        }
      />

      <Stage2BackendNotice collectionName="website_settings" />

      {savedToast && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/25 px-4 py-2.5 text-xs text-emerald-200">
          SEO metadata saved to Cloud Firestore and applied to the public document title & meta tags.
        </div>
      )}

      {warning && (
        <p role="alert" className="rounded-lg border border-amber-500/40 bg-amber-950/30 px-4 py-2.5 text-xs text-amber-200">
          {warning}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-xl border border-slate-800 bg-[#14243A]/75 p-5 lg:col-span-7">
          <div>
            <div className="flex justify-between text-xs font-medium text-[#CBD5E1]">
              <label>Page Title *</label>
              <span className="font-mono text-slate-400 tabular-nums">
                {draft.pageTitle.length} chars
              </span>
            </div>
            <input
              type="text"
              value={draft.pageTitle}
              onChange={(e) => setDraft({ ...draft, pageTitle: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-sm text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-[#CBD5E1]">
              <label>Meta Description *</label>
              <span className="font-mono text-slate-400 tabular-nums">
                {draft.metaDescription.length} / 160 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={draft.metaDescription}
              onChange={(e) => setDraft({ ...draft, metaDescription: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#CBD5E1]">Canonical URL</label>
            <input
              type="url"
              value={draft.canonicalUrl}
              onChange={(e) => setDraft({ ...draft, canonicalUrl: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 font-mono text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#CBD5E1]">
              Focused Keywords (comma-separated, max 10)
            </label>
            <input
              type="text"
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#CBD5E1]">Social Sharing Image</label>
              <select
                value={draft.socialImage}
                onChange={(e) => setDraft({ ...draft, socialImage: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
              >
                {mediaLibrary.map((m) => (
                  <option key={m.id} value={m.url}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#CBD5E1]">Social Image Alt Text</label>
              <input
                type="text"
                value={draft.socialImageAlt}
                onChange={(e) => setDraft({ ...draft, socialImageAlt: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-800 bg-[#14243A]/75 p-5 lg:col-span-5">
          <h3 className="border-b border-slate-800 pb-3 font-display text-base font-bold text-[#F8FAFC]">
            Robots & Sitemap Configuration
          </h3>

          <div className="flex flex-wrap gap-4 text-xs">
            <label className="flex items-center gap-2 text-[#CBD5E1] cursor-pointer">
              <input
                type="checkbox"
                checked={draft.robotsIndex}
                onChange={(e) => setDraft({ ...draft, robotsIndex: e.target.checked })}
                className="h-4 w-4 accent-[#2563EB]"
              />
              Allow Search Indexing
            </label>
            <label className="flex items-center gap-2 text-[#CBD5E1] cursor-pointer">
              <input
                type="checkbox"
                checked={draft.robotsFollow}
                onChange={(e) => setDraft({ ...draft, robotsFollow: e.target.checked })}
                className="h-4 w-4 accent-[#2563EB]"
              />
              Follow Links
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#CBD5E1]">
              Indexed Sitemap Paths (1 per line)
            </label>
            <textarea
              rows={5}
              value={sitemapText}
              onChange={(e) => setSitemapText(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 font-mono text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-[#CBD5E1]">Generated robots.txt Preview</p>
            <pre className="mt-1.5 overflow-x-auto rounded-lg border border-slate-800 bg-[#070D18] p-3 font-mono text-[11px] leading-relaxed text-cyan-300">
              {robotsPreview}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

interface UserManagementModuleProps {
  admins: AdminUser[];
  users: PlatformUser[];
  onSaveUser: (user: PlatformUser, isNew: boolean) => void;
  onDeleteUser: (id: string) => void;
}

export function UserManagementModule({
  admins,
  users,
  onSaveUser,
  onDeleteUser,
}: UserManagementModuleProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PlatformUser['role']>('Instructor');
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlatformUser | null>(null);

  const handleAddUser = () => {
    if (name.trim().length < 2) {
      setFormError('Enter a name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Enter a valid email address.');
      return;
    }
    setFormError(null);
    onSaveUser(
      {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        role,
        status: 'Active',
        createdAt: new Date().toISOString().slice(0, 10),
      },
      true
    );
    setName('');
    setEmail('');
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="User & Role Management"
        description="View verified Firebase Administrators in the allowlist and manage registered contributor records in Firestore. Credentials are never exposed."
      />

      <Stage2BackendNotice collectionName="admins, users" />

      {/* Verified Admins Allowlist */}
      <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <h3 className="font-display text-base font-bold text-[#F8FAFC]">
              Authorized Firebase Administrators ({admins.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Collection: admins</span>
        </div>

        {admins.length === 0 ? (
          <p className="text-xs text-slate-400">
            No additional administrator documents listed yet. The owner account is authenticated via Firebase Auth.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Last Sign-In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {admins.map((adm) => (
                  <tr key={adm.uid}>
                    <td className="py-2.5 pr-4 font-semibold text-[#F8FAFC]">{adm.displayName}</td>
                    <td className="py-2.5 pr-4 font-mono text-cyan-300">{adm.email}</td>
                    <td className="py-2.5 pr-4 text-slate-300">{adm.role}</td>
                    <td className="py-2.5 pr-4 font-semibold text-emerald-400">{adm.status}</td>
                    <td className="py-2.5 text-right font-mono text-slate-400">
                      {adm.lastSignInAt ?? 'Active'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Platform Contributor / User Record */}
      <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-5 space-y-3">
        <h3 className="font-display text-base font-bold text-[#F8FAFC]">
          Add Platform Contributor / Reader Directory Entry
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="sm:col-span-4 rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="sm:col-span-4 rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as PlatformUser['role'])}
            className="sm:col-span-2 rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
          >
            <option value="Editor">Editor</option>
            <option value="Instructor">Instructor</option>
            <option value="Reader">Reader</option>
          </select>
          <button
            type="button"
            onClick={handleAddUser}
            className="sm:col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Entry
          </button>
        </div>
        {formError && <p className="text-xs text-red-400">{formError}</p>}
      </div>

      {users.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-8 text-center space-y-3">
          <Users className="mx-auto h-7 w-7 text-[#06B6D4]" />
          <h3 className="font-display text-lg font-bold text-[#F8FAFC]">
            No Directory Entries Yet
          </h3>
          <p className="mx-auto max-w-xl text-xs leading-relaxed text-[#CBD5E1]">
            Public readers browse freely without signup. Add instructors, editors, or invited contributors above to track them in Firestore <code className="font-mono text-cyan-300">users</code>.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#14243A]/75">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0F1B2E] text-slate-400">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email Address</th>
                <th className="px-4 py-3 font-medium">Account Created</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#0B1220]/40">
                  <td className="px-4 py-3 font-semibold text-[#F8FAFC]">{u.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{u.email}</td>
                  <td className="px-4 py-3 font-mono text-slate-400 tabular-nums">{u.createdAt}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        onSaveUser(
                          { ...u, status: u.status === 'Active' ? 'Disabled' : 'Active' },
                          false
                        )
                      }
                      className={`font-semibold cursor-pointer ${
                        u.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {u.status}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-cyan-300">{u.role}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      aria-label={`Remove ${u.name}`}
                      onClick={() => setDeleteTarget(u)}
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
      )}

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        entityType="User Entry"
        itemLabel={deleteTarget?.email ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onDeleteUser(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

interface WebsiteSettingsModuleProps {
  settings: WebsiteSettings;
  onSaveSettings: (updated: WebsiteSettings) => void;
  onRestoreDefaults: () => void;
}

export function WebsiteSettingsModule({
  settings,
  onSaveSettings,
  onRestoreDefaults,
}: WebsiteSettingsModuleProps) {
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [supportNote, setSupportNote] = useState(settings.supportNote);
  const [openAccessEnabled, setOpenAccessEnabled] = useState(settings.openAccessEnabled);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    setCompanyName(settings.companyName);
    setTagline(settings.tagline);
    setSupportNote(settings.supportNote);
    setOpenAccessEnabled(settings.openAccessEnabled);
  }, [settings]);

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      companyName: companyName.trim() || 'THREE ANGELS IT SERVICES',
      tagline: tagline.trim(),
      supportNote: supportNote.trim(),
      openAccessEnabled,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Website Settings"
        description="Manage live platform configuration stored in Cloud Firestore and verify active database collections."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onRestoreDefaults}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-xs font-semibold text-[#CBD5E1] hover:border-cyan-400 hover:text-white cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Restore Default Catalog
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              Save Settings
            </button>
          </div>
        }
      />

      <Stage2BackendNotice collectionName="website_settings" />

      {savedToast && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/25 px-4 py-2.5 text-xs text-emerald-200">
          Website settings persisted to Cloud Firestore.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-xl border border-slate-800 bg-[#14243A]/75 p-5 lg:col-span-7">
          <div>
            <label className="block text-xs font-medium text-[#CBD5E1]">Official Brand Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-sm text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#CBD5E1]">Platform Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#CBD5E1]">Public Support Policy Note</label>
            <textarea
              rows={3}
              value={supportNote}
              onChange={(e) => setSupportNote(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs text-[#CBD5E1] cursor-pointer">
            <input
              type="checkbox"
              checked={openAccessEnabled}
              onChange={(e) => setOpenAccessEnabled(e.target.checked)}
              className="h-4 w-4 accent-[#2563EB]"
            />
            Keep public website open for all readers without individual user login
          </label>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-5 lg:col-span-5">
          <h3 className="border-b border-slate-800 pb-3 font-display text-base font-bold text-[#F8FAFC]">
            Live Cloud Firestore Collections
          </h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono text-cyan-300">
            {FIRESTORE_COLLECTIONS.map((col) => (
              <li key={col} className="rounded-lg border border-slate-800 bg-[#0B1220] px-3 py-2">
                {col}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface AdminProfileModuleProps {
  session: AuthSessionState;
}

export function AdminProfileModule({ session }: AdminProfileModuleProps) {
  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Admin Profile"
        description="Verified Firebase Authentication session details and active zero-trust security enforcement."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#F8FAFC]">
                {session.displayName ?? 'Authenticated Administrator'}
              </h3>
              <p className="font-mono text-xs text-cyan-300">{session.adminEmail}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-4 text-xs">
            <div>
              <p className="text-slate-400">Assigned Role</p>
              <p className="mt-0.5 font-semibold text-[#F8FAFC]">{session.adminRole}</p>
            </div>
            <div>
              <p className="text-slate-400">Firebase UID</p>
              <p className="mt-0.5 font-mono text-slate-300 truncate">{session.uid}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#F8FAFC]">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Active Production Security Safeguards</span>
          </div>
          <ul className="space-y-2 text-xs text-[#CBD5E1]">
            <li className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-[#06B6D4] shrink-0" />
              Google OAuth + verified email identity checked by Firestore rules
            </li>
            <li className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-[#06B6D4] shrink-0" />
              Public administrator self-registration permanently disabled
            </li>
            <li className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-[#06B6D4] shrink-0" />
              Executable/script uploads blocked across Media Library & Digital Resources
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
