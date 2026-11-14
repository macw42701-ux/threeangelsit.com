import { ArrowLeft, Lock, LogOut, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { authService, type AuthSessionState } from '../../services/authService';
import BrandLogo from '../BrandLogo';

interface AdminLoginPageProps {
  session: AuthSessionState;
  onBackToSite: () => void;
  onAuthSuccess: () => void;
}

export default function AdminLoginPage({
  session,
  onBackToSite,
  onAuthSuccess,
}: AdminLoginPageProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setStatusMessage(null);
    const result = await authService.signInWithGoogle();
    setSubmitting(false);
    if (result.success) {
      onAuthSuccess();
    } else {
      setStatusMessage(result.message);
    }
  };

  const handleSwitchAccount = async () => {
    setSubmitting(true);
    await authService.signOut();
    setStatusMessage(null);
    setSubmitting(false);
  };

  const displayedError = statusMessage || session.unauthorizedReason;

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F8FAFC] tech-grid-bg flex flex-col justify-between px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <button
          type="button"
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0F1B2E] px-3.5 py-2 text-xs font-semibold text-[#CBD5E1] hover:border-cyan-400 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-[#06B6D4]" />
          Back to Public Website
        </button>

        <span className="font-mono text-xs text-slate-400">
          Protected Route · /admin/login
        </span>
      </div>

      <main className="mx-auto my-8 w-full max-w-4xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Security Architecture Panel */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0F1B2E]/90 p-6 sm:p-8 lg:col-span-6">
            <div>
              <BrandLogo variant="horizontal" />

              <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
                Administrator Portal
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">
                Private content and platform console for THREE ANGELS IT SERVICES. Protected by Firebase Authentication and zero-trust Cloud Firestore Security Rules.
              </p>

              <div className="mt-6 space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-xs leading-relaxed text-[#CBD5E1]">
                <div className="flex items-center gap-2 font-semibold text-emerald-300">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Production Firebase Security Active</span>
                </div>
                <ul className="space-y-1.5 pl-6 list-disc text-slate-300">
                  <li>Zero hardcoded passwords, API secrets, or client-side bypasses.</li>
                  <li>Server-enforced Firestore rules verify authenticated admin identity on every mutation.</li>
                  <li>Published updates reflect immediately on the live public website.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-800 pt-5 text-xs text-slate-400">
              Only authorized administrator Google accounts configured in the platform allowlist can write or publish content.
            </div>
          </div>

          {/* Right Google OAuth Sign-In Panel */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#14243A]/75 p-6 sm:p-8 lg:col-span-6">
            <div>
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-[#0B1220] text-[#06B6D4]">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-[#F8FAFC]">
                    Administrator Sign In
                  </h2>
                  <p className="text-xs text-slate-400">
                    Firebase Authentication · Verified Google Identity
                  </p>
                </div>
              </div>

              {session.isLoading ? (
                <div className="mt-8 rounded-xl border border-slate-800 bg-[#0B1220] p-6 text-center text-xs text-slate-400">
                  Verifying existing Firebase Authentication session...
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  <p className="text-xs leading-relaxed text-[#CBD5E1]">
                    Authenticate with your authorized administrator Google account to manage courses, lessons, IT awareness briefings, blog articles, knowledge base runbooks, media assets, and website settings.
                  </p>

                  {session.isAuthenticated && !session.isAuthorizedAdmin && (
                    <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-xs text-red-200 space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-red-300">
                        <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                        <span>Signed In Account Not Authorized</span>
                      </div>
                      <p>
                        Currently signed in as <strong className="text-white">{session.adminEmail}</strong>, which does not have administrator permissions.
                      </p>
                      <button
                        type="button"
                        onClick={handleSwitchAccount}
                        disabled={submitting}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/40 bg-[#0B1220] px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-950/60 cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out Current Account
                      </button>
                    </div>
                  )}

                  {displayedError && !(session.isAuthenticated && !session.isAuthorizedAdmin) && (
                    <div
                      role="alert"
                      className="rounded-lg border border-amber-500/40 bg-amber-950/30 px-3.5 py-2.5 text-xs leading-relaxed text-amber-200"
                    >
                      {displayedError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={submitting}
                    className="inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-lg bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-60 cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {submitting ? 'Authenticating with Firebase...' : 'Sign In with Google (Admin Only)'}
                  </button>
                </div>
              )}
            </div>

            <p className="mt-6 border-t border-slate-800 pt-4 text-xs leading-relaxed text-slate-400">
              Public readers do not need an account—all published courses, labs, and study resources remain openly accessible on the main website.
            </p>
          </div>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl border-t border-slate-800 pt-4 text-center text-xs text-slate-500">
        © 2026 THREE ANGELS IT SERVICES · Firebase Auth & Firestore Zero-Trust Guard
      </footer>
    </div>
  );
}
