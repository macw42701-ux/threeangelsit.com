import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import BrandLogo from './BrandLogo';

interface TopBarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

const NAV_ITEMS = [
  { id: 'top', label: 'Home' },
  { id: 'awareness', label: 'IT Awareness' },
  { id: 'blog', label: 'IT Blog' },
  { id: 'courses', label: 'Free Courses' },
  { id: 'roadmap', label: 'Career Roadmap' },
  { id: 'solutions', label: 'Technical Solutions' },
  { id: 'kb', label: 'Knowledge Base' },
  { id: 'resources', label: 'Digital Resources' },
  { id: 'about', label: 'About Us' },
  { id: 'contact', label: 'Contact Us' },
];

export default function TopBar({ activeSection, onNavigate }: TopBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (id: string) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0B1220]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        {/* Zone 1: 3D White Brand Emblem & 3D Extruded Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('top');
          }}
          className="inline-flex items-center shrink-0 rounded-lg py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400"
        >
          <BrandLogo variant="horizontal" />
        </a>

        {/* Zone 2: Single-line primary navigation on desktop */}
        <nav aria-label="Primary" className="hidden xl:flex items-center gap-2 text-[11.5px] font-medium 2xl:gap-4 2xl:text-[13px]">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.id);
                }}
                className={`whitespace-nowrap shrink-0 border-b-2 py-1.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400 ${
                  isActive
                    ? 'border-cyan-400 text-[#F8FAFC]'
                    : 'border-transparent text-[#CBD5E1] hover:border-blue-500/60 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Quick Lab CTA + Responsive Menu Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('lab')}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 shadow-sm transition-colors duration-150 hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 cursor-pointer"
          >
            Virtual IT Lab
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-[#14243A] text-[#F8FAFC] xl:hidden hover:border-cyan-400/60 focus-visible:outline-2 focus-visible:outline-cyan-400 cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Tablet / Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="max-h-[80vh] overflow-y-auto border-t border-slate-800 bg-[#0F1B2E] px-5 py-4 xl:hidden">
          <nav aria-label="Mobile" className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.id);
                  }}
                  className={`flex min-h-[44px] items-center rounded-lg px-3.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#2563EB]/25 text-cyan-300 border border-cyan-500/40'
                      : 'text-[#CBD5E1] hover:bg-[#14243A] hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-800 pt-3">
            <button
              type="button"
              onClick={() => handleLinkClick('lab')}
              className="flex min-h-[44px] items-center justify-center rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
            >
              Virtual IT Lab
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('tickets')}
              className="flex min-h-[44px] items-center justify-center rounded-lg border border-slate-700 bg-[#14243A] px-3 py-2 text-xs font-semibold text-[#F8FAFC] hover:border-cyan-400 cursor-pointer"
            >
              Real-Life Tickets
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
