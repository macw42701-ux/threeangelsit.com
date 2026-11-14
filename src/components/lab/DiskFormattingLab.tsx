import { AlertTriangle, CheckCircle2, HardDrive, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VirtualPartition {
  id: string;
  label: string;
  mountOrLetter: string;
  sizeGb: number;
  filesystem: 'NTFS' | 'ext4' | 'FAT32' | 'exFAT' | 'RAW';
  protectedSystem?: boolean;
  status: 'Healthy' | 'Unformatted';
}

interface VirtualDisk {
  id: 'disk0' | 'disk1';
  name: string;
  capacityGb: number;
  interfaceType: string;
  partitionStyle: 'Uninitialized' | 'GPT' | 'MBR';
  partitions: VirtualPartition[];
}

const INITIAL_DISKS: VirtualDisk[] = [
  {
    id: 'disk0',
    name: 'Disk 0 · NVMe System SSD',
    capacityGb: 128,
    interfaceType: 'NVMe PCIe Gen4',
    partitionStyle: 'GPT',
    partitions: [
      {
        id: 'p-efi',
        label: 'EFI System',
        mountOrLetter: 'System',
        sizeGb: 1,
        filesystem: 'FAT32',
        protectedSystem: true,
        status: 'Healthy',
      },
      {
        id: 'p-win',
        label: 'Windows OS',
        mountOrLetter: 'C:',
        sizeGb: 127,
        filesystem: 'NTFS',
        protectedSystem: true,
        status: 'Healthy',
      },
    ],
  },
  {
    id: 'disk1',
    name: 'Disk 1 · Secondary SATA Data Drive',
    capacityGb: 256,
    interfaceType: 'SATA III 6Gbps',
    partitionStyle: 'Uninitialized',
    partitions: [],
  },
];

export default function DiskFormattingLab() {
  const [disks, setDisks] = useState<VirtualDisk[]>(INITIAL_DISKS);
  const [selectedDiskId, setSelectedDiskId] = useState<'disk0' | 'disk1'>('disk1');
  const [initStyle, setInitStyle] = useState<'GPT' | 'MBR'>('GPT');

  const [newSizeGb, setNewSizeGb] = useState<number>(128);
  const [filesystem, setFilesystem] = useState<'NTFS' | 'ext4' | 'FAT32' | 'exFAT'>('NTFS');
  const [volumeLabel, setVolumeLabel] = useState<string>('CORP_DATA');
  const [mountPath, setMountPath] = useState<string>('D:');
  const [quickFormat, setQuickFormat] = useState<boolean>(true);

  const [formattingProgress, setFormattingProgress] = useState<number | null>(null);
  const [confirmWipeId, setConfirmWipeId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [cliLog, setCliLog] = useState<string[]>([
    'DISKPART> list disk',
    '  Disk 0    Online    128 GB   GPT',
    '  Disk 1    Offline   256 GB   Uninitialized',
  ]);

  const selectedDisk = disks.find((d) => d.id === selectedDiskId) ?? disks[1];
  const usedGb = selectedDisk.partitions.reduce((sum, p) => sum + p.sizeGb, 0);
  const unallocatedGb = Math.max(0, selectedDisk.capacityGb - usedGb);

  useEffect(() => {
    if (formattingProgress === null) return;
    if (formattingProgress >= 100) {
      const doneTimer = setTimeout(() => setFormattingProgress(null), 500);
      return () => clearTimeout(doneTimer);
    }
    const stepTimer = setTimeout(() => {
      setFormattingProgress((p) => (p === null ? null : Math.min(100, p + 25)));
    }, 180);
    return () => clearTimeout(stepTimer);
  }, [formattingProgress]);

  const appendLog = (lines: string[]) => {
    setCliLog((prev) => [...prev.slice(-14), ...lines]);
  };

  const handleInitializeDisk = () => {
    if (selectedDisk.id === 'disk0') {
      setStatusMessage('Disk 0 is already initialized with GPT for the active OS.');
      return;
    }
    setDisks((prev) =>
      prev.map((d) => (d.id === 'disk1' ? { ...d, partitionStyle: initStyle } : d))
    );
    setStatusMessage(`Disk 1 initialized as ${initStyle}. Ready to create a partition.`);
    appendLog([
      `DISKPART> select disk 1`,
      `DISKPART> online disk`,
      `DISKPART> convert ${initStyle.toLowerCase()}`,
      `DiskPart successfully converted Disk 1 to ${initStyle} format.`,
    ]);
  };

  const handleCreateAndFormatPartition = () => {
    if (selectedDisk.partitionStyle === 'Uninitialized') {
      setStatusMessage('Initialize Disk 1 as GPT or MBR before creating partitions.');
      return;
    }
    if (selectedDisk.id === 'disk0') {
      setStatusMessage('Disk 0 has zero unallocated space (protected OS volume C:).');
      return;
    }
    const alloc = Math.min(Math.max(16, newSizeGb), unallocatedGb);
    if (alloc <= 0) {
      setStatusMessage('No unallocated space left on Disk 1. Delete a partition first to test reformatting.');
      return;
    }

    const cleanLabel = volumeLabel.trim().slice(0, 16) || 'NEW_VOLUME';
    const targetMount =
      filesystem === 'ext4'
        ? mountPath.startsWith('/')
          ? mountPath
          : '/mnt/data'
        : mountPath.endsWith(':')
          ? mountPath
          : 'E:';

    setFormattingProgress(0);
    const created: VirtualPartition = {
      id: `part-${Date.now()}`,
      label: cleanLabel,
      mountOrLetter: targetMount,
      sizeGb: alloc,
      filesystem,
      status: 'Healthy',
    };

    setDisks((prev) =>
      prev.map((d) =>
        d.id === 'disk1' ? { ...d, partitions: [...d.partitions, created] } : d
      )
    );

    if (filesystem === 'ext4') {
      appendLog([
        `$ sudo parted -s /dev/sdb mkpart primary ext4 0% ${alloc}GB`,
        `$ sudo mkfs.ext4 -L "${cleanLabel}" /dev/sdb1`,
        `$ sudo mount /dev/sdb1 ${targetMount}`,
      ]);
    } else {
      appendLog([
        `DISKPART> create partition primary size=${alloc * 1024}`,
        `DISKPART> format fs=${filesystem.toLowerCase()} label="${cleanLabel}"${quickFormat ? ' quick' : ''}`,
        `DISKPART> assign letter=${targetMount.replace(':', '')}`,
      ]);
    }

    setStatusMessage(
      `Formatted ${alloc} GB ${filesystem} partition "${cleanLabel}" and mounted at ${targetMount}.`
    );
  };

  const handleFormatExisting = (part: VirtualPartition) => {
    if (part.protectedSystem) {
      setStatusMessage('Blocked: Cannot format active operating system partition C: while Windows is running.');
      return;
    }
    setConfirmWipeId(null);
    setFormattingProgress(0);
    setDisks((prev) =>
      prev.map((d) =>
        d.id === selectedDiskId
          ? {
              ...d,
              partitions: d.partitions.map((p) =>
                p.id === part.id
                  ? { ...p, filesystem, label: volumeLabel.trim() || p.label, status: 'Healthy' }
                  : p
              ),
            }
          : d
      )
    );
    appendLog([
      `FORMAT ${part.mountOrLetter} /FS:${filesystem}${quickFormat ? ' /Q' : ''} /V:${volumeLabel.trim() || part.label}`,
      `Formatting ${part.sizeGb} GB complete. Volume clean and mounted.`,
    ]);
    setStatusMessage(`Reformatted ${part.mountOrLetter} (${part.sizeGb} GB) as ${filesystem}.`);
  };

  const handleDeletePartition = (part: VirtualPartition) => {
    if (part.protectedSystem) return;
    setConfirmWipeId(null);
    setDisks((prev) =>
      prev.map((d) =>
        d.id === selectedDiskId
          ? { ...d, partitions: d.partitions.filter((p) => p.id !== part.id) }
          : d
      )
    );
    appendLog([`DISKPART> select partition ${part.mountOrLetter}`, `DISKPART> delete partition`]);
    setStatusMessage(`Deleted partition ${part.mountOrLetter}; ${part.sizeGb} GB returned to Unallocated.`);
  };

  const handleReset = () => {
    setDisks(INITIAL_DISKS);
    setSelectedDiskId('disk1');
    setConfirmWipeId(null);
    setFormattingProgress(null);
    setStatusMessage('Storage sandbox reset to initial hardware state.');
    setCliLog([
      'DISKPART> list disk',
      '  Disk 0    Online    128 GB   GPT',
      '  Disk 1    Offline   256 GB   Uninitialized',
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-[#F8FAFC]">
            Disk Formatting & Partition Management Simulator
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Practice initializing GPT/MBR disks, sizing volumes, choosing NTFS or ext4 filesystems, and formatting safely in your browser.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs font-semibold text-[#CBD5E1] hover:border-cyan-400 hover:text-white cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Storage Lab
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Visual Disk Map & Partition List */}
        <div className="space-y-5 lg:col-span-7">
          <div className="space-y-3">
            {disks.map((disk) => {
              const isSelected = disk.id === selectedDiskId;
              const diskUsed = disk.partitions.reduce((acc, p) => acc + p.sizeGb, 0);
              const diskFree = Math.max(0, disk.capacityGb - diskUsed);
              return (
                <div
                  key={disk.id}
                  onClick={() => setSelectedDiskId(disk.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedDiskId(disk.id);
                  }}
                  className={`rounded-2xl border p-5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#06B6D4] bg-[#0B1220]'
                      : 'border-slate-800 bg-[#0B1220]/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <HardDrive className="h-4 w-4 text-[#06B6D4]" />
                      <span className="font-display text-sm font-bold text-[#F8FAFC]">
                        {disk.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-400 tabular-nums">
                      {disk.capacityGb} GB · {disk.partitionStyle} · {disk.interfaceType}
                    </span>
                  </div>

                  {/* Partition Bar */}
                  <div className="mt-4 flex h-12 w-full overflow-hidden rounded-xl border border-slate-800 bg-[#070D18]">
                    {disk.partitions.map((p) => {
                      const pct = Math.max(12, Math.round((p.sizeGb / disk.capacityGb) * 100));
                      return (
                        <div
                          key={p.id}
                          style={{ width: `${pct}%` }}
                          className={`flex flex-col justify-center border-r border-slate-800 px-3 text-[11px] ${
                            p.protectedSystem
                              ? 'bg-blue-950/60 text-cyan-100'
                              : 'bg-emerald-950/60 text-emerald-100'
                          }`}
                        >
                          <span className="font-mono font-bold truncate">
                            {p.mountOrLetter} ({p.filesystem})
                          </span>
                          <span className="text-[10px] text-slate-300 tabular-nums truncate">
                            {p.sizeGb} GB
                          </span>
                        </div>
                      );
                    })}
                    {diskFree > 0 && (
                      <div className="flex flex-1 flex-col justify-center px-3 text-[11px] text-slate-400">
                        <span className="font-mono font-semibold">
                          {disk.partitionStyle === 'Uninitialized' ? 'Uninitialized' : 'Unallocated'}
                        </span>
                        <span className="text-[10px] tabular-nums">{diskFree} GB Free</span>
                      </div>
                    )}
                  </div>

                  {/* Partition Action Rows */}
                  {disk.partitions.length > 0 && (
                    <div className="mt-4 divide-y divide-slate-800/80 border-t border-slate-800 pt-2 text-xs">
                      {disk.partitions.map((part) => (
                        <div
                          key={part.id}
                          onClick={(e) => e.stopPropagation()}
                          className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                        >
                          <div>
                            <span className="font-mono font-semibold text-[#F8FAFC]">
                              {part.mountOrLetter} — {part.label}
                            </span>
                            <span className="ml-2 font-mono text-slate-400 tabular-nums">
                              {part.sizeGb} GB · {part.filesystem}
                            </span>
                          </div>

                          {part.protectedSystem ? (
                            <span className="text-[11px] font-medium text-slate-500">
                              System Protected
                            </span>
                          ) : confirmWipeId === part.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-amber-300">
                                Erase all data?
                              </span>
                              <button
                                type="button"
                                onClick={() => handleFormatExisting(part)}
                                className="rounded bg-[#F59E0B] px-2.5 py-1 text-[11px] font-semibold text-[#0B1220] cursor-pointer"
                              >
                                Format ({filesystem})
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePartition(part)}
                                className="rounded bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white cursor-pointer"
                              >
                                Delete Volume
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmWipeId(null)}
                                className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setConfirmWipeId(part.id)}
                                className="rounded border border-slate-700 bg-[#0F1B2E] px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:border-cyan-400 cursor-pointer"
                              >
                                Format / Wipe
                              </button>
                              <button
                                type="button"
                                aria-label={`Delete ${part.mountOrLetter}`}
                                onClick={() => setConfirmWipeId(part.id)}
                                className="rounded border border-slate-700 bg-[#0F1B2E] p-1 text-red-400 hover:border-red-400 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Formatting Progress Bar */}
          {formattingProgress !== null && (
            <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/30 p-4 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-cyan-300">
                <span>Formatting Volume & Writing Filesystem Metadata...</span>
                <span className="font-mono tabular-nums">{formattingProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-[#06B6D4] transition-all duration-150"
                  style={{ width: `${formattingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Simulated diskpart / mkfs CLI log */}
          <div className="rounded-2xl border border-slate-800 bg-[#070D18] p-4">
            <p className="font-mono text-[11px] font-semibold text-cyan-300">
              Simulated Storage Command Output (diskpart / mkfs)
            </p>
            <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-200">
              {cliLog.join('\n')}
            </pre>
          </div>
        </div>

        {/* Right: Disk Initialization & New Volume Wizard */}
        <div className="space-y-5 lg:col-span-5">
          <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-6 space-y-5">
            <h4 className="border-b border-slate-800 pb-3 font-display text-base font-bold text-[#F8FAFC]">
              Configure Selected Drive: {selectedDisk.id.toUpperCase()}
            </h4>

            {selectedDisk.partitionStyle === 'Uninitialized' ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3.5 text-xs text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    Disk 1 is currently <strong>Uninitialized</strong>. Choose a partition table style before creating or formatting partitions.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1]">
                    Partition Table Style
                  </label>
                  <select
                    value={initStyle}
                    onChange={(e) => setInitStyle(e.target.value as 'GPT' | 'MBR')}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                  >
                    <option value="GPT">GPT (GUID Partition Table — Modern UEFI, &gt;2 TB)</option>
                    <option value="MBR">MBR (Master Boot Record — Legacy BIOS)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleInitializeDisk}
                  className="w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                >
                  Initialize Disk 1 ({initStyle})
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1]">
                      Partition Size (GB)
                    </label>
                    <input
                      type="number"
                      min={16}
                      max={Math.max(16, unallocatedGb)}
                      value={newSizeGb}
                      onChange={(e) => setNewSizeGb(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-3 py-2 font-mono text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1]">Filesystem</label>
                    <select
                      value={filesystem}
                      onChange={(e) => {
                        const nextFs = e.target.value as 'NTFS' | 'ext4' | 'FAT32' | 'exFAT';
                        setFilesystem(nextFs);
                        setMountPath(nextFs === 'ext4' ? '/mnt/data' : 'D:');
                      }}
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                    >
                      <option value="NTFS">NTFS (Windows Standard)</option>
                      <option value="ext4">ext4 (Linux Standard)</option>
                      <option value="exFAT">exFAT (Cross-Platform Drives)</option>
                      <option value="FAT32">FAT32 (EFI / Legacy USB)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1]">
                      Volume Label
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      value={volumeLabel}
                      onChange={(e) => setVolumeLabel(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-3 py-2 font-mono text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1]">
                      {filesystem === 'ext4' ? 'Linux Mount Path' : 'Drive Letter'}
                    </label>
                    <input
                      type="text"
                      maxLength={24}
                      value={mountPath}
                      onChange={(e) => setMountPath(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-3 py-2 font-mono text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-[#CBD5E1] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quickFormat}
                    onChange={(e) => setQuickFormat(e.target.checked)}
                    className="h-4 w-4 accent-[#2563EB]"
                  />
                  Perform a Quick Format (rebuild allocation table without full sector zeroing)
                </label>

                <button
                  type="button"
                  disabled={selectedDisk.id === 'disk0' || unallocatedGb <= 0}
                  onClick={handleCreateAndFormatPartition}
                  className="w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
                >
                  Create & Format New Partition
                </button>
              </div>
            )}

            {statusMessage && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-200"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
