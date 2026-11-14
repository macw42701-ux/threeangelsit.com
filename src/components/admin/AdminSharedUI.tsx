import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function AdminSectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-[#F8FAFC]">{title}</h2>
        <p className="mt-1 text-sm text-[#CBD5E1]">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface Stage2NoticeProps {
  collectionName: string;
  message?: string;
}

export function Stage2BackendNotice({ collectionName, message }: Stage2NoticeProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/25 px-4 py-3 text-xs text-emerald-200 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5 sm:items-center">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400 sm:mt-0" />
        <span>
          {message ??
            `Firebase Spark (Free Tier) — Changes saved or published to "${collectionName}" persist within free Spark quotas with zero billing enabled.`}
        </span>
      </div>
      <span className="font-mono text-[11px] font-semibold text-emerald-300 whitespace-nowrap shrink-0">
        Spark Free Tier · ₹0
      </span>
    </div>
  );
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  itemLabel: string;
  entityType: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  itemLabel,
  entityType,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#070D18]/80 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0F1B2E] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/40 bg-red-950/30 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 id="confirm-delete-title" className="font-display text-lg font-bold text-[#F8FAFC]">
                Delete {entityType}
              </h3>
              <p className="text-xs text-slate-400">Permanent Firestore removal</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Cancel deletion"
            onClick={onCancel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-[#0B1220] text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[#CBD5E1]">
          Are you sure you want to permanently remove <strong className="text-white">{itemLabel}</strong> from Cloud Firestore?
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-700 bg-[#0B1220] px-4 py-2 text-xs font-semibold text-[#CBD5E1] hover:border-cyan-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 cursor-pointer"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}
