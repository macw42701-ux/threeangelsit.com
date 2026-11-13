import BrandLogo from './BrandLogo';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onResetProgress: () => void;
}

export default function Footer({ onNavigate, onResetProgress }: FooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
        <div>
          <BrandLogo className="h-14 w-auto" />
          <p className="mt-2 text-xs text-slate-500">
            Open single-page IT engineering platform · No tracking, cookies, or sign-in required — diagnostics run locally in your browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => onNavigate('tickets')}
            className="hover:text-slate-900 cursor-pointer"
          >
            Real-Life Tickets
          </button>
          <button
            type="button"
            onClick={() => onNavigate('lab')}
            className="hover:text-slate-900 cursor-pointer"
          >
            Virtual Lab
          </button>
          <button
            type="button"
            onClick={() => onNavigate('awareness')}
            className="hover:text-slate-900 cursor-pointer"
          >
            Awareness
          </button>
          <button
            type="button"
            onClick={() => onNavigate('roadmap')}
            className="hover:text-slate-900 cursor-pointer"
          >
            Roadmap
          </button>
          <button
            type="button"
            onClick={() => onNavigate('kb')}
            className="hover:text-slate-900 cursor-pointer"
          >
            Knowledge Base
          </button>
          <button
            type="button"
            onClick={onResetProgress}
            className="text-slate-500 underline underline-offset-4 hover:text-slate-900 cursor-pointer"
          >
            Reset Saved Progress
          </button>
        </div>
      </div>
    </footer>
  );
}
