import {
  ArrowRight,
  HardDrive,
  Monitor,
  Network,
  Package,
  Server,
  Terminal,
} from 'lucide-react';
import { LAB_MODULES, type LabModuleId } from './lab/labTypes';

interface VirtualLabSectionProps {
  onOpenLab?: (moduleId?: LabModuleId) => void;
}

const CARD_ICONS: Record<LabModuleId, typeof Network> = {
  network: Network,
  windows: Monitor,
  linux: Terminal,
  disk: HardDrive,
  ad: Server,
  software: Package,
};

export default function VirtualLabSection({ onOpenLab }: VirtualLabSectionProps) {
  return (
    <section id="lab" className="border-b border-slate-800/80 bg-[#0B1220] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Clean Directory Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-slate-800 pb-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold text-[#06B6D4]">
              07. Dedicated Interactive Practice Environment
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
              Virtual IT Lab Workspace
            </h2>
            <p className="mt-2 text-base text-[#CBD5E1]">
              To keep reading clear and focused, all 6 interactive browser-based labs open in a dedicated full-screen workspace—running locally at ₹0 cost with no cloud VMs or logins required.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenLab?.('network')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 shadow-lg shadow-blue-950/50 transition-colors hover:bg-blue-500 cursor-pointer"
          >
            Open Virtual IT Lab
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* 6 Focused Lab Entry Cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {LAB_MODULES.map((mod) => {
            const Icon = CARD_ICONS[mod.id];
            return (
              <div
                key={mod.id}
                className="glass-surface flex flex-col justify-between rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:border-cyan-400/60"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs font-medium text-cyan-300">
                      {mod.category}
                    </span>
                    <Icon className="h-5 w-5 text-[#F59E0B] shrink-0" />
                  </div>

                  <h3 className="mt-3 font-display text-lg font-bold text-[#F8FAFC]">
                    {mod.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">{mod.summary}</p>

                  <p className="mt-4 text-xs text-slate-400">
                    {mod.skills.join(' · ')}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => onOpenLab?.(mod.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 cursor-pointer"
                  >
                    Launch {mod.shortLabel} Lab
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
