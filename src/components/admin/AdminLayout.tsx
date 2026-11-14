import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  ListTree,
  LogOut,
  Menu,
  Settings,
  ShieldAlert,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState, type ComponentType } from 'react';
import { adminDataRepository } from '../../services/adminDataService';
import type { AuthSessionState } from '../../services/authService';
import type {
  AdminArticle,
  AdminAwarenessPost,
  AdminCourse,
  AdminDashboardSnapshot,
  AdminDigitalResource,
  AdminKBGuide,
  AdminLesson,
  MediaAsset,
  PlatformUser,
} from '../../types/admin';
import BrandLogo from '../BrandLogo';
import AwarenessManagementModule from './AwarenessManagementModule';
import BlogManagementModule from './BlogManagementModule';
import { CourseManagementModule, LessonManagementModule } from './CourseAndLessonModules';
import { HomepageEditorModule, MenuManagementModule } from './HomepageAndMenuModules';
import {
  DigitalResourceManagementModule,
  KnowledgeBaseManagementModule,
} from './KnowledgeBaseAndResourceModules';
import MediaLibraryModule from './MediaLibraryModule';
import OverviewModule, { type AdminModuleKey } from './OverviewModule';
import {
  AdminProfileModule,
  SeoManagementModule,
  UserManagementModule,
  WebsiteSettingsModule,
} from './SeoUserSettingsModules';

interface AdminLayoutProps {
  session: AuthSessionState;
  onBackToSite: () => void;
  onLogout: () => void;
}

interface SidebarNavEntry {
  key: AdminModuleKey | 'logout';
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const SIDEBAR_ITEMS: SidebarNavEntry[] = [
  { key: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
  { key: 'blog', label: 'Blog Management', icon: FileText },
  { key: 'awareness', label: 'IT Awareness Management', icon: ShieldAlert },
  { key: 'courses', label: 'Course Management', icon: GraduationCap },
  { key: 'lessons', label: 'Lesson Management', icon: FolderKanban },
  { key: 'knowledge_base', label: 'Knowledge Base', icon: BookOpen },
  { key: 'resources', label: 'Digital Resources', icon: FileText },
  { key: 'media', label: 'Media Library', icon: ImageIcon },
  { key: 'homepage', label: 'Homepage Editor', icon: LayoutTemplate },
  { key: 'menu', label: 'Menu Management', icon: ListTree },
  { key: 'seo', label: 'SEO Management', icon: Globe },
  { key: 'users', label: 'User Management', icon: Users },
  { key: 'settings', label: 'Website Settings', icon: Settings },
  { key: 'profile', label: 'Admin Profile', icon: UserCheck },
  { key: 'logout', label: 'Logout', icon: LogOut },
];

export default function AdminLayout({ session, onBackToSite, onLogout }: AdminLayoutProps) {
  const [activeModule, setActiveModule] = useState<AdminModuleKey>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<AdminDashboardSnapshot>(() =>
    adminDataRepository.getInitialSnapshot()
  );
  const [syncNotice, setSyncNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const today = () => new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let active = true;

    if (session.isBootstrappedOwner) {
      void adminDataRepository
        .seedDefaultContentToFirestore(false)
        .then((seeded) => {
          if (active && seeded) {
            setSyncNotice({
              type: 'ok',
              text: 'Initial website catalog & settings synced to Cloud Firestore.',
            });
          }
        })
        .catch((err) => {
          if (active) {
            setSyncNotice({
              type: 'err',
              text: err instanceof Error ? err.message : 'Unable to seed initial Firestore data.',
            });
          }
        });
    }

    const unsub = adminDataRepository.subscribeAdminSnapshot(
      session.isBootstrappedOwner,
      (next) => {
        if (!active) return;
        setSnapshot((prev) => ({ ...next, activity: prev.activity }));
      },
      (errMsg) => {
        if (!active) return;
        setSyncNotice({ type: 'err', text: errMsg });
      }
    );

    return () => {
      active = false;
      unsub();
    };
  }, [session.isBootstrappedOwner]);

  const recordActivity = (action: string, collection: string, targetTitle: string) => {
    setSnapshot((prev) => ({
      ...prev,
      activity: [
        {
          id: `act-${Date.now()}`,
          action,
          collection,
          targetTitle,
          timestamp: today(),
          mode: 'Live Firestore' as const,
        },
        ...prev.activity.slice(0, 14),
      ],
    }));
  };

  const runPersisted = async (
    task: () => Promise<void>,
    action: string,
    collectionName: string,
    targetTitle: string
  ) => {
    try {
      await task();
      recordActivity(action, collectionName, targetTitle);
      setSyncNotice({
        type: 'ok',
        text: `${action}: "${targetTitle}" saved to Cloud Firestore.`,
      });
    } catch (err) {
      setSyncNotice({
        type: 'err',
        text: `Failed to save ${collectionName}: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }
  };

  const handleSelectNav = (key: AdminModuleKey | 'logout') => {
    setMobileDrawerOpen(false);
    if (key === 'logout') {
      onLogout();
      return;
    }
    setActiveModule(key);
  };

  const activeLabel =
    SIDEBAR_ITEMS.find((item) => item.key === activeModule)?.label ?? 'Dashboard Overview';

  // Blog handlers
  const handleSaveArticle = (article: AdminArticle, isNew: boolean) => {
    void runPersisted(
      () => adminDataRepository.saveArticle(article, isNew),
      isNew ? 'Created Article' : 'Updated Article',
      'articles',
      article.title
    );
  };

  const handleDeleteArticle = (id: string) => {
    const target = snapshot.articles.find((a) => a.id === id);
    void runPersisted(
      () => adminDataRepository.deleteArticle(id),
      'Deleted Article',
      'articles',
      target?.title ?? id
    );
  };

  const handleToggleArticlePublish = (id: string) => {
    const target = snapshot.articles.find((a) => a.id === id);
    if (!target) return;
    const nextStatus = target.status === 'Published' ? 'Draft' : 'Published';
    void runPersisted(
      () =>
        adminDataRepository.saveArticle(
          { ...target, status: nextStatus, updatedAt: today() },
          false
        ),
      nextStatus === 'Published' ? 'Published Article' : 'Unpublished Article',
      'articles',
      target.title
    );
  };

  const handleToggleArticleFeatured = (id: string) => {
    const target = snapshot.articles.find((a) => a.id === id);
    if (!target) return;
    void runPersisted(
      () =>
        adminDataRepository.saveArticle(
          { ...target, featured: !target.featured, updatedAt: today() },
          false
        ),
      !target.featured ? 'Featured Article' : 'Unfeatured Article',
      'articles',
      target.title
    );
  };

  // Awareness handlers
  const handleSaveAwareness = (post: AdminAwarenessPost, isNew: boolean) => {
    void runPersisted(
      () => adminDataRepository.saveAwareness(post, isNew),
      isNew ? 'Created Awareness Post' : 'Updated Awareness Post',
      'awareness_posts',
      post.title
    );
  };

  const handleDeleteAwareness = (id: string) => {
    const target = snapshot.awareness_posts.find((p) => p.id === id);
    void runPersisted(
      () => adminDataRepository.deleteAwareness(id),
      'Deleted Awareness Post',
      'awareness_posts',
      target?.title ?? id
    );
  };

  const handleToggleAwarenessPublish = (id: string) => {
    const target = snapshot.awareness_posts.find((p) => p.id === id);
    if (!target) return;
    const nextStatus = target.status === 'Published' ? 'Draft' : 'Published';
    void runPersisted(
      () =>
        adminDataRepository.saveAwareness(
          { ...target, status: nextStatus, updatedAt: today() },
          false
        ),
      nextStatus === 'Published' ? 'Published Awareness Post' : 'Unpublished Awareness Post',
      'awareness_posts',
      target.title
    );
  };

  // Course & Lesson handlers
  const handleSaveCourse = (course: AdminCourse, isNew: boolean) => {
    void runPersisted(
      () => adminDataRepository.saveCourse(course, isNew),
      isNew ? 'Created Course' : 'Updated Course',
      'courses',
      course.title
    );
  };

  const handleDeleteCourse = (id: string) => {
    const target = snapshot.courses.find((c) => c.id === id);
    void runPersisted(
      () => adminDataRepository.deleteCourse(id),
      'Deleted Course',
      'courses',
      target?.title ?? id
    );
  };

  const handleToggleCoursePublish = (id: string) => {
    const target = snapshot.courses.find((c) => c.id === id);
    if (!target) return;
    const nextStatus = target.status === 'Published' ? 'Draft' : 'Published';
    void runPersisted(
      () =>
        adminDataRepository.saveCourse(
          { ...target, status: nextStatus, updatedAt: today() },
          false
        ),
      nextStatus === 'Published' ? 'Published Course' : 'Unpublished Course',
      'courses',
      target.title
    );
  };

  const handleSaveLesson = (lesson: AdminLesson, isNew: boolean) => {
    void runPersisted(
      () => adminDataRepository.saveLesson(lesson, isNew),
      isNew ? 'Created Lesson' : 'Updated Lesson',
      'lessons',
      lesson.title
    );
  };

  const handleDeleteLesson = (id: string) => {
    const target = snapshot.lessons.find((l) => l.id === id);
    void runPersisted(
      () => adminDataRepository.deleteLesson(id, snapshot.courses),
      'Deleted Lesson',
      'lessons',
      target?.title ?? id
    );
  };

  // KB & Digital Resource handlers
  const handleSaveKB = (guide: AdminKBGuide, isNew: boolean) => {
    void runPersisted(
      () => adminDataRepository.saveKBGuide(guide, isNew),
      isNew ? 'Created KB Guide' : 'Updated KB Guide',
      'knowledge_base',
      guide.title
    );
  };

  const handleDeleteKB = (id: string) => {
    const target = snapshot.knowledge_base.find((g) => g.id === id);
    void runPersisted(
      () => adminDataRepository.deleteKBGuide(id),
      'Deleted KB Guide',
      'knowledge_base',
      target?.title ?? id
    );
  };

  const handleToggleKBPublish = (id: string) => {
    const target = snapshot.knowledge_base.find((g) => g.id === id);
    if (!target) return;
    const nextStatus = target.status === 'Published' ? 'Draft' : 'Published';
    void runPersisted(
      () =>
        adminDataRepository.saveKBGuide(
          { ...target, status: nextStatus, updatedAt: today() },
          false
        ),
      nextStatus === 'Published' ? 'Published KB Guide' : 'Unpublished KB Guide',
      'knowledge_base',
      target.title
    );
  };

  const handleSaveResource = (res: AdminDigitalResource, isNew: boolean) => {
    void runPersisted(
      () => adminDataRepository.saveDigitalResource(res, isNew),
      isNew ? 'Added Learning Resource' : 'Updated Learning Resource',
      'digital_resources',
      res.title
    );
  };

  const handleDeleteResource = (id: string) => {
    const target = snapshot.digital_resources.find((r) => r.id === id);
    void runPersisted(
      () => adminDataRepository.deleteDigitalResource(id),
      'Deleted Resource',
      'digital_resources',
      target?.title ?? id
    );
  };

  const handleToggleResourcePublish = (id: string) => {
    const target = snapshot.digital_resources.find((r) => r.id === id);
    if (!target) return;
    const nextStatus = target.status === 'Published' ? 'Draft' : 'Published';
    void runPersisted(
      () =>
        adminDataRepository.saveDigitalResource({ ...target, status: nextStatus }, false),
      nextStatus === 'Published' ? 'Published Resource' : 'Unpublished Resource',
      'digital_resources',
      target.title
    );
  };

  // Media handlers
  const handleAddMedia = (asset: MediaAsset) => {
    void runPersisted(
      () => adminDataRepository.saveMediaAsset(asset, true),
      'Uploaded Media Asset',
      'media',
      asset.fileName
    );
  };

  const handleUpdateMedia = (asset: MediaAsset) => {
    void runPersisted(
      () => adminDataRepository.saveMediaAsset(asset, false),
      'Updated Media Metadata',
      'media',
      asset.title
    );
  };

  const handleDeleteMedia = (id: string) => {
    const target = snapshot.media.find((m) => m.id === id);
    void runPersisted(
      () => adminDataRepository.deleteMediaAsset(id),
      'Deleted Media Asset',
      'media',
      target?.title ?? id
    );
  };

  // User & Inquiry handlers
  const handleSaveUser = (user: PlatformUser, isNew: boolean) => {
    void runPersisted(
      () => adminDataRepository.savePlatformUser(user, isNew),
      isNew ? 'Added User Record' : 'Updated User Record',
      'users',
      user.email
    );
  };

  const handleDeleteUser = (id: string) => {
    const target = snapshot.users.find((u) => u.id === id);
    void runPersisted(
      () => adminDataRepository.deletePlatformUser(id),
      'Removed User Record',
      'users',
      target?.email ?? id
    );
  };

  const handleToggleInquiryStatus = (id: string, nextStatus: 'New' | 'Reviewed') => {
    void runPersisted(
      () => adminDataRepository.markInquiryReviewed(id, nextStatus),
      `Marked Inquiry ${nextStatus}`,
      'contact_inquiries',
      id
    );
  };

  const handleDeleteInquiry = (id: string) => {
    void runPersisted(
      () => adminDataRepository.deleteInquiry(id),
      'Deleted Contact Inquiry',
      'contact_inquiries',
      id
    );
  };

  const renderSidebarList = (compact: boolean) => (
    <nav aria-label="Admin Sidebar" className="flex-1 space-y-1 overflow-y-auto px-2.5 py-4">
      {SIDEBAR_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeModule === item.key;
        const isLogout = item.key === 'logout';
        return (
          <button
            key={item.key}
            type="button"
            title={compact ? item.label : undefined}
            onClick={() => handleSelectNav(item.key)}
            className={`flex w-full min-h-[40px] items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
              isActive
                ? 'bg-[#2563EB] text-white'
                : isLogout
                  ? 'mt-3 border-t border-slate-800 pt-3 text-amber-400 hover:bg-amber-950/30 hover:text-amber-300'
                  : 'text-[#CBD5E1] hover:bg-[#14243A] hover:text-white'
            } ${compact ? 'justify-center' : ''}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!compact && <span className="truncate">{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[#0B1220] text-[#F8FAFC]">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-slate-800 bg-[#0F1B2E] transition-all duration-200 ${
          sidebarCollapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-3">
          {!sidebarCollapsed ? (
            <span className="font-display text-xs font-extrabold tracking-tight uppercase text-[#F8FAFC] truncate">
              THREE ANGELS ADMIN
            </span>
          ) : (
            <span className="mx-auto font-display text-xs font-extrabold text-[#06B6D4]">3A</span>
          )}
          <button
            type="button"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setSidebarCollapsed((c) => !c)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-[#0B1220] text-slate-300 hover:border-cyan-400 hover:text-white cursor-pointer"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {renderSidebarList(sidebarCollapsed)}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#070D18]/80 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col border-r border-slate-800 bg-[#0F1B2E]">
            <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
              <span className="font-display text-xs font-extrabold tracking-tight uppercase text-[#F8FAFC]">
                THREE ANGELS ADMIN
              </span>
              <button
                type="button"
                aria-label="Close admin sidebar"
                onClick={() => setMobileDrawerOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-[#0B1220] text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {renderSidebarList(false)}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Admin Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-800 bg-[#0B1220]/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open admin sidebar"
              onClick={() => setMobileDrawerOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-[#0F1B2E] text-slate-200 lg:hidden cursor-pointer"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="hidden sm:block">
              <BrandLogo variant="horizontal" />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
              <span className="hidden sm:inline">/</span>
              <span className="font-semibold text-cyan-300 truncate">{activeLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="hidden md:inline font-mono text-[11px] font-medium text-emerald-400 whitespace-nowrap">
              {session.adminRole} · {session.adminEmail}
            </span>
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0F1B2E] px-3 py-1.5 text-xs font-semibold text-[#F8FAFC] whitespace-nowrap hover:border-cyan-400 cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#06B6D4]" />
              Public Website
            </button>
          </div>
        </header>

        {/* Active Module Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-5">
            {syncNotice && (
              <div
                role={syncNotice.type === 'err' ? 'alert' : 'status'}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-xs ${
                  syncNotice.type === 'err'
                    ? 'border-red-500/40 bg-red-950/40 text-red-200'
                    : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                }`}
              >
                <span>{syncNotice.text}</span>
                <button
                  type="button"
                  onClick={() => setSyncNotice(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {activeModule === 'overview' && (
              <OverviewModule
                snapshot={snapshot}
                onSelectModule={setActiveModule}
                onToggleInquiryStatus={handleToggleInquiryStatus}
                onDeleteInquiry={handleDeleteInquiry}
              />
            )}

            {activeModule === 'blog' && (
              <BlogManagementModule
                articles={snapshot.articles}
                mediaLibrary={snapshot.media}
                onSaveArticle={handleSaveArticle}
                onDeleteArticle={handleDeleteArticle}
                onTogglePublish={handleToggleArticlePublish}
                onToggleFeatured={handleToggleArticleFeatured}
              />
            )}

            {activeModule === 'awareness' && (
              <AwarenessManagementModule
                posts={snapshot.awareness_posts}
                mediaLibrary={snapshot.media}
                onSavePost={handleSaveAwareness}
                onDeletePost={handleDeleteAwareness}
                onTogglePublish={handleToggleAwarenessPublish}
                onRegisterMedia={handleAddMedia}
              />
            )}

            {activeModule === 'courses' && (
              <CourseManagementModule
                courses={snapshot.courses}
                lessons={snapshot.lessons}
                resources={snapshot.digital_resources}
                mediaLibrary={snapshot.media}
                onSaveCourse={handleSaveCourse}
                onDeleteCourse={handleDeleteCourse}
                onTogglePublish={handleToggleCoursePublish}
                onJumpToLessons={() => setActiveModule('lessons')}
              />
            )}

            {activeModule === 'lessons' && (
              <LessonManagementModule
                lessons={snapshot.lessons}
                courses={snapshot.courses}
                resources={snapshot.digital_resources}
                onSaveLesson={handleSaveLesson}
                onDeleteLesson={handleDeleteLesson}
              />
            )}

            {activeModule === 'knowledge_base' && (
              <KnowledgeBaseManagementModule
                guides={snapshot.knowledge_base}
                mediaLibrary={snapshot.media}
                onSaveGuide={handleSaveKB}
                onDeleteGuide={handleDeleteKB}
                onTogglePublish={handleToggleKBPublish}
              />
            )}

            {activeModule === 'resources' && (
              <DigitalResourceManagementModule
                resources={snapshot.digital_resources}
                onSaveResource={handleSaveResource}
                onDeleteResource={handleDeleteResource}
                onTogglePublish={handleToggleResourcePublish}
              />
            )}

            {activeModule === 'media' && (
              <MediaLibraryModule
                media={snapshot.media}
                onAddMedia={handleAddMedia}
                onUpdateMedia={handleUpdateMedia}
                onDeleteMedia={handleDeleteMedia}
              />
            )}

            {activeModule === 'homepage' && (
              <HomepageEditorModule
                homepage={snapshot.website_settings.homepage}
                courses={snapshot.courses}
                articles={snapshot.articles}
                mediaLibrary={snapshot.media}
                onSaveHomepage={(updated) => {
                  const nextSettings = {
                    ...snapshot.website_settings,
                    homepage: updated,
                    updatedAt: today(),
                  };
                  void runPersisted(
                    () => adminDataRepository.saveWebsiteSettings(nextSettings),
                    'Published Homepage Content',
                    'website_settings',
                    updated.mainHeading
                  );
                }}
              />
            )}

            {activeModule === 'menu' && (
              <MenuManagementModule
                menuItems={snapshot.website_settings.menuItems}
                onSaveMenu={(items) => {
                  const nextSettings = {
                    ...snapshot.website_settings,
                    menuItems: items,
                    updatedAt: today(),
                  };
                  void runPersisted(
                    () => adminDataRepository.saveWebsiteSettings(nextSettings),
                    'Updated Navigation Menu',
                    'website_settings',
                    `${items.length} menu links`
                  );
                }}
              />
            )}

            {activeModule === 'seo' && (
              <SeoManagementModule
                seo={snapshot.website_settings.seo}
                mediaLibrary={snapshot.media}
                onSaveSeo={(seo) => {
                  const nextSettings = {
                    ...snapshot.website_settings,
                    seo,
                    updatedAt: today(),
                  };
                  void runPersisted(
                    () => adminDataRepository.saveWebsiteSettings(nextSettings),
                    'Updated SEO Settings',
                    'website_settings',
                    seo.pageTitle
                  );
                }}
              />
            )}

            {activeModule === 'users' && (
              <UserManagementModule
                admins={snapshot.admins}
                users={snapshot.users}
                onSaveUser={handleSaveUser}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {activeModule === 'settings' && (
              <WebsiteSettingsModule
                settings={snapshot.website_settings}
                onSaveSettings={(updated) => {
                  void runPersisted(
                    () => adminDataRepository.saveWebsiteSettings(updated),
                    'Updated Website Settings',
                    'website_settings',
                    updated.companyName
                  );
                }}
                onRestoreDefaults={() => {
                  void runPersisted(
                    async () => {
                      await adminDataRepository.seedDefaultContentToFirestore(true);
                    },
                    'Restored Default Content',
                    'all_collections',
                    'Default Stage 1 Catalog'
                  );
                }}
              />
            )}

            {activeModule === 'profile' && <AdminProfileModule session={session} />}
          </div>
        </main>
      </div>
    </div>
  );
}
