import { X } from 'lucide-react';
import { useState } from 'react';
import BrandLogo from './BrandLogo';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onResetProgress: () => void;
  onOpenAdmin?: () => void;
}

export default function Footer({ onNavigate, onResetProgress, onOpenAdmin }: FooterProps) {
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <>
      <footer className="border-t border-slate-800 bg-[#070D18] text-[#CBD5E1]">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid grid-cols-1 gap-10 border-b border-slate-800 pb-10 sm:grid-cols-2 lg:grid-cols-12">
            {/* Brand & Description */}
            <div className="lg:col-span-4">
              <BrandLogo variant="stacked" />
              <p className="mt-3 max-w-sm text-xs leading-relaxed text-slate-400">
                Practical IT knowledge, digital safety awareness, beginner-friendly courses, browser-based virtual labs, and diagnostic runbooks—freely accessible without individual logins.
              </p>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-[#06B6D4]">
                Quick Links
              </h4>
              <ul className="mt-3 space-y-2 text-xs">
                {[
                  { id: 'top', label: 'Home' },
                  { id: 'awareness', label: 'IT Awareness' },
                  { id: 'blog', label: 'IT Blog' },
                  { id: 'about', label: 'About Us' },
                  { id: 'contact', label: 'Contact Us' },
                ].map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      className="text-slate-400 hover:text-cyan-300 cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Learning Resources */}
            <div className="lg:col-span-3">
              <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-[#06B6D4]">
                Learning Resources
              </h4>
              <ul className="mt-3 space-y-2 text-xs">
                {[
                  { id: 'courses', label: 'Free IT Courses' },
                  { id: 'roadmap', label: 'Career Roadmap' },
                  { id: 'resources', label: 'Digital Resources' },
                  { id: 'lab', label: 'Virtual IT Lab' },
                ].map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      className="text-slate-400 hover:text-cyan-300 cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Solutions */}
            <div className="lg:col-span-3">
              <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-[#06B6D4]">
                Technical Solutions
              </h4>
              <ul className="mt-3 space-y-2 text-xs">
                {[
                  { id: 'solutions', label: 'Networking & Infrastructure' },
                  { id: 'kb', label: 'IT Knowledge Base' },
                  { id: 'tickets', label: 'Real-Life IT Tickets' },
                ].map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      className="text-slate-400 hover:text-cyan-300 cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
                <li className="pt-1">
                  <button
                    type="button"
                    onClick={onResetProgress}
                    className="font-semibold text-[#F59E0B] underline underline-offset-4 hover:text-amber-300 cursor-pointer"
                  >
                    Reset Saved Progress
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Legal & Copyright */}
          <div className="mt-8 flex flex-col justify-between gap-4 text-xs text-slate-400 sm:flex-row sm:items-center">
            <p>© 2026 THREE ANGELS IT SERVICES. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-6">
              <button
                type="button"
                onClick={() => setLegalModal('privacy')}
                className="hover:text-white cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setLegalModal('terms')}
                className="hover:text-white cursor-pointer"
              >
                Terms and Conditions
              </button>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="hover:text-white cursor-pointer"
              >
                Contact Support
              </button>
              {onOpenAdmin && (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  Admin Portal
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy / Terms Modal */}
      {legalModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#070D18]/80 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0F1B2E] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 id="legal-modal-title" className="font-display text-lg font-bold text-[#F8FAFC]">
                {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms and Conditions'}
              </h3>
              <button
                type="button"
                aria-label="Close legal dialog"
                onClick={() => setLegalModal(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-[#0B1220] text-[#CBD5E1] hover:border-cyan-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-[#CBD5E1]">
              {legalModal === 'privacy' ? (
                <>
                  <p>
                    THREE ANGELS IT SERVICES operates as an open educational platform with no individual user accounts, tracking cookies, or third-party analytics beacons.
                  </p>
                  <p>
                    Your solved tickets, roadmap milestones, and course module checkboxes are stored strictly inside your own browser&apos;s local storage and can be cleared anytime via &ldquo;Reset Saved Progress&rdquo;.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    All educational guides, virtual lab exercises, and troubleshooting runbooks on THREE ANGELS IT SERVICES are provided for learning and skill development.
                  </p>
                  <p>
                    Always verify administrative commands and change windows against your organization&apos;s policies before executing commands in live production environments.
                  </p>
                </>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
