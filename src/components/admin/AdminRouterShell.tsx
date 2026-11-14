import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import App from '../../App';
import { authService, type AuthSessionState } from '../../services/authService';
import type { LabModuleId } from '../lab/labTypes';
import VirtualLabPage from '../lab/VirtualLabPage';
import AdminLayout from './AdminLayout';
import AdminLoginPage from './AdminLoginPage';

type RouteTarget = 'public' | 'lab' | 'admin' | 'admin-login';

const VALID_LAB_MODULES = new Set<LabModuleId>([
  'network',
  'windows',
  'linux',
  'disk',
  'ad',
  'software',
]);

function getNormalizedBase(): string {
  const raw = import.meta.env.BASE_URL || '/';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

function resolveCurrentRoute(): RouteTarget {
  const base = getNormalizedBase();
  let path = window.location.pathname;
  if (base && path.startsWith(base)) {
    path = path.slice(base.length) || '/';
  }
  const hash = window.location.hash;

  if (
    path === '/admin/login' ||
    path.startsWith('/admin/login/') ||
    hash.startsWith('#/admin/login')
  ) {
    return 'admin-login';
  }
  if (path === '/admin' || path.startsWith('/admin/') || hash.startsWith('#/admin')) {
    return 'admin';
  }
  if (path === '/lab' || path.startsWith('/lab/') || hash.startsWith('#/lab')) {
    return 'lab';
  }
  return 'public';
}

function resolveInitialLabModule(): LabModuleId {
  const params = new URLSearchParams(window.location.search);
  const hashQueryIdx = window.location.hash.indexOf('?');
  const hashParams =
    hashQueryIdx >= 0
      ? new URLSearchParams(window.location.hash.slice(hashQueryIdx + 1))
      : null;
  const raw = params.get('module') ?? hashParams?.get('module');
  if (raw && VALID_LAB_MODULES.has(raw as LabModuleId)) {
    return raw as LabModuleId;
  }
  return 'network';
}

function buildRouteUrl(target: RouteTarget, labModule?: LabModuleId): string {
  const base = getNormalizedBase();
  if (target === 'admin-login') return `${base}/admin/login`;
  if (target === 'admin') return `${base}/admin`;
  if (target === 'lab') {
    return labModule ? `${base}/lab?module=${labModule}` : `${base}/lab`;
  }
  return `${base}/`;
}

export default function AdminRouterShell() {
  const [route, setRoute] = useState<RouteTarget>(() => resolveCurrentRoute());
  const [activeLabModule, setActiveLabModule] = useState<LabModuleId>(() =>
    resolveInitialLabModule()
  );
  const [session, setSession] = useState<AuthSessionState>(() => authService.getSessionState());

  const navigateTo = (target: RouteTarget, replace = false, labModule?: LabModuleId) => {
    const nextUrl = buildRouteUrl(target, labModule);
    const currentFull = `${window.location.pathname}${window.location.search}`;
    if (currentFull !== nextUrl) {
      if (replace) {
        window.history.replaceState({}, '', nextUrl);
      } else {
        window.history.pushState({}, '', nextUrl);
      }
    }
    if (labModule) {
      setActiveLabModule(labModule);
    }
    setRoute(target);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  useEffect(() => {
    const unsub = authService.subscribeSession((nextSession) => {
      setSession(nextSession);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(resolveCurrentRoute());
      setActiveLabModule(resolveInitialLabModule());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Strict AdminAuthGuard: enforce /admin -> /admin/login unless authenticated AND authorized admin
  useEffect(() => {
    if (
      route === 'admin' &&
      !session.isLoading &&
      (!session.isAuthenticated || !session.isAuthorizedAdmin)
    ) {
      navigateTo('admin-login', true);
    }
  }, [route, session.isLoading, session.isAuthenticated, session.isAuthorizedAdmin]);

  const handleLogout = async () => {
    const nextSession = await authService.signOut();
    setSession(nextSession);
    navigateTo('admin-login');
  };

  if (route === 'admin' && session.isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1220] text-[#F8FAFC] flex flex-col items-center justify-center gap-3 p-6">
        <ShieldCheck className="h-8 w-8 animate-pulse text-[#06B6D4]" />
        <p className="font-display text-base font-semibold text-[#F8FAFC]">
          Verifying Administrator Session...
        </p>
        <p className="text-xs text-slate-400">Checking Firebase Authentication & admin role</p>
      </div>
    );
  }

  if (
    route === 'admin-login' ||
    (route === 'admin' && (!session.isAuthenticated || !session.isAuthorizedAdmin))
  ) {
    return (
      <AdminLoginPage
        session={session}
        onBackToSite={() => navigateTo('public')}
        onAuthSuccess={() => navigateTo('admin')}
      />
    );
  }

  if (route === 'admin') {
    return (
      <AdminLayout
        session={session}
        onBackToSite={() => navigateTo('public')}
        onLogout={handleLogout}
      />
    );
  }

  if (route === 'lab') {
    return (
      <VirtualLabPage
        initialModule={activeLabModule}
        onSelectModuleUrl={(mod) => navigateTo('lab', true, mod)}
        onBackToSite={() => navigateTo('public')}
      />
    );
  }

  return (
    <App
      onOpenAdmin={() => navigateTo('admin')}
      onOpenLab={(moduleId = 'network') => navigateTo('lab', false, moduleId)}
    />
  );
}
