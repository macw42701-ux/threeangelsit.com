import { ArrowRight, CheckCircle2, Download, Eye, FileText, X } from 'lucide-react';
import { useState } from 'react';
import {
  DIGITAL_RESOURCES,
  DigitalResourceItem,
  TECHNICAL_SOLUTIONS,
} from '../data/itData';
import { CloudInfraGraphic, DigitalResourcesGraphic } from './TechIllustrations';

interface SolutionsAndResourcesSectionProps {
  onNavigate: (sectionId: string) => void;
}

export default function SolutionsAndResourcesSection({
  onNavigate,
}: SolutionsAndResourcesSectionProps) {
  const [activeDomainId, setActiveDomainId] = useState<string>(TECHNICAL_SOLUTIONS[0].id);
  const [previewResource, setPreviewResource] = useState<DigitalResourceItem | null>(null);

  const activeSolution =
    TECHNICAL_SOLUTIONS.find((s) => s.id === activeDomainId) ?? TECHNICAL_SOLUTIONS[0];

  const handleDownloadResource = (res: DigitalResourceItem) => {
    const blob = new Blob([res.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = res.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* TECHNICAL SOLUTIONS */}
      <section id="solutions" className="border-b border-slate-800/80 bg-[#0E182A] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-6 border-b border-slate-800 pb-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-semibold text-[#06B6D4]">
                05. Networking, Hardware, Software & Infrastructure
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
                Technical Solutions
              </h2>
              <p className="mt-2 text-base text-[#CBD5E1]">
                Practical engineering architectures and troubleshooting checklists across campus networks, endpoint hardware, operating systems, and infrastructure security.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Technical solution domain"
              className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-700/70 bg-[#0B1220] p-1"
            >
              {TECHNICAL_SOLUTIONS.map((sol) => (
                <button
                  key={sol.id}
                  type="button"
                  role="tab"
                  aria-selected={sol.id === activeSolution.id}
                  onClick={() => setActiveDomainId(sol.id)}
                  className={`rounded-md px-3 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    sol.id === activeSolution.id
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  {sol.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left 3D Cloud & Networking Visual */}
            <div className="lg:col-span-5">
              <div className="glass-surface overflow-hidden rounded-2xl">
                <div className="h-56 border-b border-slate-700/60 bg-[#0B1220]">
                  <CloudInfraGraphic />
                </div>
                <div className="p-6">
                  <p className="font-mono text-xs text-[#F59E0B]">{activeSolution.subtitle}</p>
                  <h3 className="mt-1.5 font-display text-xl font-bold text-[#F8FAFC]">
                    {activeSolution.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#CBD5E1]">
                    {activeSolution.summary}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate(activeSolution.relatedSection.sectionId)}
                    className="mt-5 inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                  >
                    {activeSolution.relatedSection.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Engineering Capabilities & Field Checklist */}
            <div className="grid grid-cols-1 gap-6 lg:col-span-7">
              <div className="glass-surface rounded-2xl p-6">
                <h4 className="font-display text-base font-semibold text-[#F8FAFC]">
                  Core Engineering Capabilities
                </h4>
                <ul className="mt-4 space-y-3 text-sm text-[#CBD5E1]">
                  {activeSolution.capabilities.map((cap, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="font-mono text-xs font-semibold text-[#06B6D4] mt-0.5 shrink-0">
                        0{idx + 1}.
                      </span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-surface rounded-2xl p-6">
                <h4 className="font-display text-base font-semibold text-[#F8FAFC]">
                  Production Reliability Checklist
                </h4>
                <ul className="mt-4 space-y-3 text-sm text-[#CBD5E1]">
                  {activeSolution.checklist.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIGITAL RESOURCES */}
      <section id="resources" className="border-b border-slate-800/80 bg-[#0B1220] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="border-b border-slate-800 pb-6">
            <p className="font-mono text-xs font-semibold text-[#F59E0B]">
              05B. Study Guides, Command Sheets & Checklists
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
              Digital Resources
            </h2>
            <p className="mt-2 max-w-2xl text-base text-[#CBD5E1]">
              Preview and download concise, copyright-free reference sheets and field checklists created for students, helpdesk technicians, and systems engineers.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="glass-surface overflow-hidden rounded-2xl">
                <div className="h-52 border-b border-slate-700/60 bg-[#0B1220]">
                  <DigitalResourcesGraphic />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-[#F8FAFC]">
                    Offline-Ready Reference Guides
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#CBD5E1]">
                    Download clean Markdown study sheets directly from your browser with no email gate, signup, or external tracking.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
              {DIGITAL_RESOURCES.map((res) => (
                <div
                  key={res.id}
                  className="glass-surface flex flex-col justify-between rounded-2xl p-5 transition-all duration-150 hover:border-cyan-400/50"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-[#06B6D4]">{res.category}</span>
                      <span className="font-mono text-[#F59E0B]">{res.format}</span>
                    </div>
                    <h3 className="mt-2 font-display text-base font-bold text-[#F8FAFC]">
                      {res.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#CBD5E1]">{res.summary}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-700/60 pt-4">
                    <button
                      type="button"
                      onClick={() => setPreviewResource(res)}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-600 bg-[#0B1220] px-3 py-1.5 text-xs font-semibold text-[#F8FAFC] hover:border-cyan-400 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-[#06B6D4]" />
                      Preview
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadResource(res)}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resource Preview Modal */}
      {previewResource && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resource-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-[#0F1B2E] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-[#06B6D4] shrink-0" />
                <div>
                  <h3
                    id="resource-modal-title"
                    className="font-display text-lg font-bold text-[#F8FAFC]"
                  >
                    {previewResource.title}
                  </h3>
                  <p className="text-xs text-slate-400">{previewResource.fileName}</p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close resource preview"
                onClick={() => setPreviewResource(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-[#14243A] text-[#CBD5E1] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-800 bg-[#070D18] p-4 font-mono text-xs leading-relaxed text-cyan-100">
              {previewResource.content}
            </pre>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => handleDownloadResource(previewResource)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Download File
              </button>
              <button
                type="button"
                onClick={() => setPreviewResource(null)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-[#CBD5E1] hover:text-white cursor-pointer"
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
