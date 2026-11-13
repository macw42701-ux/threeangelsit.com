import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import BrandLogo from './BrandLogo';

interface TopBarProps {
  onNavigate: (sectionId: string) => void;
}

const NAV_ITEMS = [
  { id: 'tickets', label: 'Tickets' },
  { id: 'lab', label: 'Virtual Lab' },
  { id: 'awareness', label: 'Awareness' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'kb', label: 'Knowledge Base' },
];

export default function TopBar({ onNavigate }: TopBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (id: string) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-2.5">
        {/* Zone 1: Uploaded brand logo */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
        >
          <BrandLogo className="h-12 w-auto sm:h-14" />
        </a>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav aria-label="Primary" className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id);
              }}
              className="whitespace-nowrap shrink-0 py-1 transition-colors duration-150 hover:text-slate-900 hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('tickets')}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 cursor-pointer"
          >
            Start Diagnostic
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 lg:hidden hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-700 cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-4 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.id);
                }}
                className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => handleLinkClick('tickets')}
              className="mt-2 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer"
            >
              Start Diagnostic
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
