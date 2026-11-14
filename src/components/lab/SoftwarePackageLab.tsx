import { CheckCircle2, Download, Package, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SoftwarePackage {
  id: string;
  os: 'windows' | 'linux';
  name: string;
  packageId: string;
  version: string;
  sizeMb: number;
  category: string;
  dependencies: string;
  description: string;
  verifyOutput: string;
}

const PACKAGE_CATALOG: SoftwarePackage[] = [
  {
    id: 'pkg-wireshark',
    os: 'windows',
    name: 'Wireshark Network Analyzer',
    packageId: 'WiresharkFoundation.Wireshark',
    version: '4.4.1',
    sizeMb: 84,
    category: 'Packet Inspection',
    dependencies: 'Npcap 1.80 Packet Driver',
    description: 'Deep inspection protocol analyzer for DNS, TCP handshakes, and SMB traffic.',
    verifyOutput: 'TShark (Wireshark) 4.4.1 — Npcap driver active on Ethernet0',
  },
  {
    id: 'pkg-7zip',
    os: 'windows',
    name: '7-Zip File Archiver',
    packageId: '7zip.7zip',
    version: '24.08',
    sizeMb: 2,
    category: 'Workstation Utility',
    dependencies: 'None',
    description: 'Standard enterprise archive tool for log bundles and compressed installers.',
    verifyOutput: '7-Zip 24.08 (x64) : Copyright (c) 1999-2024 Igor Pavlov',
  },
  {
    id: 'pkg-putty',
    os: 'windows',
    name: 'PuTTY SSH & Telnet Client',
    packageId: 'PuTTY.PuTTY',
    version: '0.81',
    sizeMb: 4,
    category: 'Remote Administration',
    dependencies: 'None',
    description: 'Lightweight SSH and serial console client for switch and Linux administration.',
    verifyOutput: 'plink: Release 0.81 (SSH-2 protocol ready)',
  },
  {
    id: 'pkg-sysinternals',
    os: 'windows',
    name: 'Microsoft Sysinternals Suite',
    packageId: 'Microsoft.Sysinternals',
    version: '2026.10',
    sizeMb: 48,
    category: 'Diagnostics',
    dependencies: '.NET Desktop Runtime 8',
    description: 'Process Explorer, ProcMon, and Autoruns for deep Windows troubleshooting.',
    verifyOutput: 'Sysinternals Process Explorer & ProcMon registered in C:\\Tools\\Sysinternals',
  },
  {
    id: 'pkg-nginx',
    os: 'linux',
    name: 'nginx HTTP & Reverse Proxy',
    packageId: 'nginx',
    version: '1.24.0-2ubuntu7',
    sizeMb: 12,
    category: 'Web Server',
    dependencies: 'nginx-common, libpcre2-8-0',
    description: 'High-performance HTTP server and reverse proxy for Ubuntu workloads.',
    verifyOutput: 'nginx version: nginx/1.24.0 (Ubuntu) — systemd unit active',
  },
  {
    id: 'pkg-fail2ban',
    os: 'linux',
    name: 'Fail2Ban Intrusion Prevention',
    packageId: 'fail2ban',
    version: '1.0.2-3',
    sizeMb: 6,
    category: 'Security Hardening',
    dependencies: 'python3, iptables / nftables',
    description: 'Automatically blocks repeated failed SSH login attempts from /var/log/auth.log.',
    verifyOutput: 'Fail2Ban v1.0.2 — sshd jail enabled (maxretry=5, bantime=10m)',
  },
  {
    id: 'pkg-openssh',
    os: 'linux',
    name: 'OpenSSH Server Daemon',
    packageId: 'openssh-server',
    version: '9.6p1',
    sizeMb: 18,
    category: 'Remote Access',
    dependencies: 'openssh-client, libssl3',
    description: 'Encrypted remote shell daemon listening on TCP port 22.',
    verifyOutput: 'OpenSSH_9.6p1 Ubuntu-3ubuntu13 — ssh.service listening on 0.0.0.0:22',
  },
  {
    id: 'pkg-git',
    os: 'linux',
    name: 'Git Distributed SCM',
    packageId: 'git',
    version: '2.43.0',
    sizeMb: 28,
    category: 'DevOps & Scripting',
    dependencies: 'libcurl4, perl',
    description: 'Version control for infrastructure scripts and configuration playbooks.',
    verifyOutput: 'git version 2.43.0',
  },
];

export default function SoftwarePackageLab() {
  const [osTab, setOsTab] = useState<'windows' | 'linux'>('windows');
  const [installedIds, setInstalledIds] = useState<string[]>(['pkg-7zip', 'pkg-openssh']);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState<number>(0);
  const [cliOutput, setCliOutput] = useState<string[]>([
    '# Package Manager Ready — select any package below to simulate installation or verification.',
  ]);

  useEffect(() => {
    if (!installingId) return;
    if (installProgress >= 100) {
      const pkg = PACKAGE_CATALOG.find((p) => p.id === installingId);
      setInstalledIds((prev) => (prev.includes(installingId) ? prev : [...prev, installingId]));
      if (pkg) {
        setCliOutput((prev) => [
          ...prev.slice(-12),
          pkg.os === 'windows'
            ? `Successfully installed ${pkg.name} (${pkg.packageId} v${pkg.version}).`
            : `Setting up ${pkg.packageId} (${pkg.version}) ... done.`,
        ]);
      }
      setInstallingId(null);
      setInstallProgress(0);
      return;
    }
    const timer = setTimeout(() => {
      setInstallProgress((p) => Math.min(100, p + 34));
    }, 220);
    return () => clearTimeout(timer);
  }, [installingId, installProgress]);

  const handleInstall = (pkg: SoftwarePackage) => {
    if (installingId) return;
    setInstallingId(pkg.id);
    setInstallProgress(15);
    setCliOutput((prev) => [
      ...prev.slice(-10),
      pkg.os === 'windows'
        ? `C:\\> winget install --id ${pkg.packageId} --exact`
        : `$ sudo apt update && sudo apt install -y ${pkg.packageId}`,
      `Resolving dependencies: ${pkg.dependencies} (${pkg.sizeMb} MB)...`,
    ]);
  };

  const handleVerify = (pkg: SoftwarePackage) => {
    setCliOutput((prev) => [
      ...prev.slice(-12),
      pkg.os === 'windows' ? `C:\\> ${pkg.packageId} --version` : `$ ${pkg.packageId} --version`,
      pkg.verifyOutput,
    ]);
  };

  const handleUninstall = (pkg: SoftwarePackage) => {
    setInstalledIds((prev) => prev.filter((id) => id !== pkg.id));
    setCliOutput((prev) => [
      ...prev.slice(-12),
      pkg.os === 'windows'
        ? `C:\\> winget uninstall --id ${pkg.packageId}`
        : `$ sudo apt remove -y ${pkg.packageId}`,
      `Removed ${pkg.name} cleanly.`,
    ]);
  };

  const filteredPackages = PACKAGE_CATALOG.filter((p) => p.os === osTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-[#F8FAFC]">
            Software & Package Installation Simulator (winget / apt)
          </h3>
          <p className="mt-1 text-xs text-[#CBD5E1]">
            Practice installing, verifying dependencies, checking binary versions, and uninstalling IT administration tools in a safe browser sandbox.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0B1220] p-1">
            <button
              type="button"
              onClick={() => setOsTab('windows')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                osTab === 'windows' ? 'bg-[#2563EB] text-white' : 'text-[#CBD5E1] hover:text-white'
              }`}
            >
              Windows (winget)
            </button>
            <button
              type="button"
              onClick={() => setOsTab('linux')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                osTab === 'linux' ? 'bg-[#2563EB] text-white' : 'text-[#CBD5E1] hover:text-white'
              }`}
            >
              Ubuntu Linux (apt)
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setInstalledIds(['pkg-7zip', 'pkg-openssh']);
              setCliOutput(['# Software catalog reset to default baseline.']);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs font-semibold text-[#CBD5E1] hover:border-cyan-400 hover:text-white cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Package Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
          {filteredPackages.map((pkg) => {
            const installed = installedIds.includes(pkg.id);
            const busy = installingId === pkg.id;
            return (
              <div
                key={pkg.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0B1220] p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-[#06B6D4] shrink-0" />
                      <h4 className="font-display text-sm font-bold text-[#F8FAFC]">{pkg.name}</h4>
                    </div>
                    <span
                      className={`text-[11px] font-semibold shrink-0 ${
                        installed ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {installed ? 'Installed' : 'Available'}
                    </span>
                  </div>

                  <p className="mt-1 font-mono text-[11px] text-cyan-300">
                    {pkg.packageId} · v{pkg.version} · {pkg.sizeMb} MB
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[#CBD5E1]">{pkg.description}</p>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Dependencies: <span className="text-[#F8FAFC]">{pkg.dependencies}</span>
                  </p>
                </div>

                <div className="mt-4 border-t border-slate-800 pt-3">
                  {busy ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-semibold text-cyan-300">
                        <span>Installing package...</span>
                        <span className="font-mono tabular-nums">{installProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full bg-[#06B6D4] transition-all duration-150"
                          style={{ width: `${installProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : installed ? (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleVerify(pkg)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:border-emerald-400 cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        Verify Version
                      </button>
                      <button
                        type="button"
                        aria-label={`Uninstall ${pkg.name}`}
                        onClick={() => handleUninstall(pkg)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#14243A] px-2.5 py-1.5 text-xs text-red-400 hover:border-red-400 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={Boolean(installingId)}
                      onClick={() => handleInstall(pkg)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Install via {osTab === 'windows' ? 'winget' : 'apt'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Simulated Package Manager Console */}
        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#070D18]">
            <div className="border-b border-slate-800 px-4 py-3 text-xs font-mono text-cyan-300">
              {osTab === 'windows'
                ? 'Administrator: winget Package Console'
                : 'sysadmin@lab-srv01: apt Package Console'}
            </div>
            <pre className="h-[380px] overflow-y-auto whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed text-slate-200">
              {cliOutput.join('\n')}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
