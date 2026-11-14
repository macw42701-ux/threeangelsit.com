import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  FolderKanban,
  GraduationCap,
  Mail,
  ShieldAlert,
  Trash2,
  Users,
} from 'lucide-react';
import type { AdminDashboardSnapshot } from '../../types/admin';
import { AdminSectionHeader, Stage2BackendNotice } from './AdminSharedUI';

export type AdminModuleKey =
  | 'overview'
  | 'blog'
  | 'awareness'
  | 'courses'
  | 'lessons'
  | 'knowledge_base'
  | 'resources'
  | 'media'
  | 'homepage'
  | 'menu'
  | 'seo'
  | 'users'
  | 'settings'
  | 'profile';

interface OverviewModuleProps {
  snapshot: AdminDashboardSnapshot;
  onSelectModule: (module: AdminModuleKey) => void;
  onToggleInquiryStatus: (id: string, nextStatus: 'New' | 'Reviewed') => void;
  onDeleteInquiry: (id: string) => void;
}

export default function OverviewModule({
  snapshot,
  onSelectModule,
  onToggleInquiryStatus,
  onDeleteInquiry,
}: OverviewModuleProps) {
  const totalArticles = snapshot.articles.length;
  const publishedArticles = snapshot.articles.filter((a) => a.status === 'Published').length;
  const draftArticles = snapshot.articles.filter((a) => a.status === 'Draft').length;
  const totalCourses = snapshot.courses.length;
  const totalLessons = snapshot.lessons.length;
  const totalResources = snapshot.digital_resources.length;
  const totalUsers = snapshot.users.length + snapshot.admins.length;

  const metrics = [
    { label: 'Total Articles', value: totalArticles, target: 'blog' as AdminModuleKey, icon: FileText },
    { label: 'Published Articles', value: publishedArticles, target: 'blog' as AdminModuleKey, icon: BookOpen },
    { label: 'Draft Articles', value: draftArticles, target: 'blog' as AdminModuleKey, icon: Clock },
    { label: 'Total Courses', value: totalCourses, target: 'courses' as AdminModuleKey, icon: GraduationCap },
    { label: 'Total Lessons', value: totalLessons, target: 'lessons' as AdminModuleKey, icon: FolderKanban },
    { label: 'Learning Resources', value: totalResources, target: 'resources' as AdminModuleKey, icon: ShieldAlert },
    { label: 'Registered Users', value: totalUsers, target: 'users' as AdminModuleKey, icon: Users },
  ];

  // Real inventory chart derived strictly from current Firestore document counts (zero fake visitor statistics)
  const chartSeries = [
    { label: 'Articles', published: publishedArticles, draft: draftArticles },
    {
      label: 'Awareness',
      published: snapshot.awareness_posts.filter((p) => p.status === 'Published').length,
      draft: snapshot.awareness_posts.filter((p) => p.status === 'Draft').length,
    },
    {
      label: 'Courses',
      published: snapshot.courses.filter((c) => c.status === 'Published').length,
      draft: snapshot.courses.filter((c) => c.status === 'Draft').length,
    },
    {
      label: 'Lessons',
      published: snapshot.lessons.filter((l) => l.status === 'Published').length,
      draft: snapshot.lessons.filter((l) => l.status === 'Draft').length,
    },
    {
      label: 'KB Guides',
      published: snapshot.knowledge_base.filter((k) => k.status === 'Published').length,
      draft: snapshot.knowledge_base.filter((k) => k.status === 'Draft').length,
    },
    {
      label: 'Resources',
      published: snapshot.digital_resources.filter((r) => r.status === 'Published').length,
      draft: snapshot.digital_resources.filter((r) => r.status === 'Draft').length,
    },
  ];

  const maxTotal = Math.max(1, ...chartSeries.map((s) => s.published + s.draft));

  const recentlyUpdated = [
    ...snapshot.articles.map((a) => ({
      id: a.id,
      title: a.title,
      type: 'Article',
      status: a.status,
      updatedAt: a.updatedAt,
      module: 'blog' as AdminModuleKey,
    })),
    ...snapshot.courses.map((c) => ({
      id: c.id,
      title: c.title,
      type: 'Course',
      status: c.status,
      updatedAt: c.updatedAt,
      module: 'courses' as AdminModuleKey,
    })),
    ...snapshot.awareness_posts.map((p) => ({
      id: p.id,
      title: p.title,
      type: 'IT Awareness',
      status: p.status,
      updatedAt: p.updatedAt,
      module: 'awareness' as AdminModuleKey,
    })),
    ...snapshot.knowledge_base.map((k) => ({
      id: k.id,
      title: k.title,
      type: 'KB Guide',
      status: k.status,
      updatedAt: k.updatedAt,
      module: 'knowledge_base' as AdminModuleKey,
    })),
  ]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Dashboard Overview"
        description="Real-time Cloud Firestore content inventory and incoming support inquiries for THREE ANGELS IT SERVICES."
      />

      <Stage2BackendNotice collectionName="articles, courses, lessons, contact_inquiries" />

      {/* Metric Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <button
              key={metric.label}
              type="button"
              onClick={() => onSelectModule(metric.target)}
              className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-[#14243A]/75 p-4 text-left transition-colors hover:border-[#06B6D4] cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400">
                <Icon className="h-4 w-4 text-[#06B6D4]" />
                <ArrowUpRight className="h-3.5 w-3.5 text-cyan-300 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-3">
                <p className="font-mono text-2xl font-bold text-[#F8FAFC] tabular-nums">
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-slate-400">{metric.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Real Content Inventory Chart + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-5 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#06B6D4]" />
              <h3 className="font-display text-base font-bold text-[#F8FAFC]">
                Content Inventory by Collection & Status
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#06B6D4]" />
                Published
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#F59E0B]" />
                Draft
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-3.5">
            {chartSeries.map((row) => {
              const total = row.published + row.draft;
              const pubPct = Math.round((row.published / maxTotal) * 100);
              const draftPct = Math.round((row.draft / maxTotal) * 100);
              return (
                <div key={row.label} className="grid grid-cols-12 items-center gap-3 text-xs">
                  <span className="col-span-3 text-slate-300 truncate">{row.label}</span>
                  <div className="col-span-7 flex h-4 overflow-hidden rounded bg-[#0B1220] border border-slate-800">
                    {row.published > 0 && (
                      <div
                        style={{ width: `${pubPct}%` }}
                        className="bg-[#06B6D4] transition-all duration-300"
                        title={`${row.published} Published`}
                      />
                    )}
                    {row.draft > 0 && (
                      <div
                        style={{ width: `${draftPct}%` }}
                        className="bg-[#F59E0B] transition-all duration-300"
                        title={`${row.draft} Draft`}
                      />
                    )}
                  </div>
                  <span className="col-span-2 text-right font-mono text-slate-300 tabular-nums">
                    {total} ({row.published}P/{row.draft}D)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Publishing Activity */}
        <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-5 lg:col-span-5">
          <h3 className="border-b border-slate-800 pb-3 font-display text-base font-bold text-[#F8FAFC]">
            Recent Publishing Activity
          </h3>
          {snapshot.activity.length === 0 ? (
            <p className="mt-4 text-xs text-slate-400">
              Changes published in this admin session appear here in real time.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-800 text-xs">
              {snapshot.activity.slice(0, 6).map((act) => (
                <li key={act.id} className="flex items-start justify-between gap-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[#F8FAFC]">{act.action}</p>
                    <p className="mt-0.5 text-slate-300">{act.targetTitle}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-emerald-400">
                      {act.collection} · {act.mode}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap tabular-nums">
                    {act.timestamp}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Public Contact Us Inquiries Queue */}
      <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="font-display text-base font-bold text-[#F8FAFC]">
              Incoming Contact Us Inquiries ({snapshot.contact_inquiries.length})
            </h3>
          </div>
          <span className="font-mono text-xs text-slate-400">
            {snapshot.contact_inquiries.filter((i) => i.status === 'New').length} unread
          </span>
        </div>

        {snapshot.contact_inquiries.length === 0 ? (
          <p className="mt-4 text-xs text-slate-400">
            No inquiries submitted yet from the public Contact Us form.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0F1B2E] text-slate-400">
                  <th className="py-2.5 px-3 font-medium">Sender</th>
                  <th className="py-2.5 px-3 font-medium">Topic & Message</th>
                  <th className="py-2.5 px-3 font-medium">Date</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {snapshot.contact_inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-[#0B1220]/40">
                    <td className="py-3 px-3 align-top">
                      <p className="font-semibold text-[#F8FAFC]">{inq.name}</p>
                      <p className="font-mono text-[11px] text-cyan-300">{inq.email}</p>
                    </td>
                    <td className="py-3 px-3 align-top max-w-md">
                      <p className="font-medium text-[#CBD5E1]">{inq.topic}</p>
                      <p className="mt-0.5 text-slate-400">{inq.message}</p>
                    </td>
                    <td className="py-3 px-3 align-top font-mono text-slate-400 tabular-nums whitespace-nowrap">
                      {inq.createdAt}
                    </td>
                    <td className="py-3 px-3 align-top">
                      <button
                        type="button"
                        onClick={() =>
                          onToggleInquiryStatus(
                            inq.id,
                            inq.status === 'New' ? 'Reviewed' : 'New'
                          )
                        }
                        className={`inline-flex items-center gap-1 font-semibold cursor-pointer ${
                          inq.status === 'Reviewed' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {inq.status}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right align-top">
                      <button
                        type="button"
                        aria-label={`Delete inquiry from ${inq.name}`}
                        onClick={() => onDeleteInquiry(inq.id)}
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
      </div>

      {/* Recently Updated Content Table */}
      <div className="rounded-xl border border-slate-800 bg-[#14243A]/75 p-5">
        <h3 className="border-b border-slate-800 pb-3 font-display text-base font-bold text-[#F8FAFC]">
          Recently Updated Content
        </h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0F1B2E] text-slate-400">
                <th className="py-2.5 px-3 font-medium">Title</th>
                <th className="py-2.5 px-3 font-medium">Type</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">Last Updated</th>
                <th className="py-2.5 px-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {recentlyUpdated.map((item) => (
                <tr key={item.id} className="hover:bg-[#0B1220]/40">
                  <td className="py-3 px-3 font-medium text-[#F8FAFC]">{item.title}</td>
                  <td className="py-3 px-3 text-slate-300">{item.type}</td>
                  <td className="py-3 px-3">
                    <span
                      className={
                        item.status === 'Published'
                          ? 'text-emerald-400 font-semibold'
                          : 'text-amber-400 font-semibold'
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 tabular-nums">{item.updatedAt}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectModule(item.module)}
                      className="text-cyan-300 hover:underline cursor-pointer"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
