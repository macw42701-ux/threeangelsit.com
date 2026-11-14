import {
  AlertTriangle,
  CheckCircle2,
  Monitor,
  RotateCcw,
  Settings,
  Shield,
  Terminal,
} from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';
import { WINDOWS_SCENARIOS } from '../../data/itData';

interface WindowsOsConfig {
  hostname: string;
  ipMode: 'dhcp' | 'static';
  ipv4: string;
  subnet: string;
  gateway: string;
  dnsMode: 'dhcp' | 'manual';
  primaryDns: string;
  firewallEnabled: boolean;
  rdpEnabled: boolean;
  windowsUpdateRing: 'Semi-Annual Channel' | 'Security Patches Only';
}

const DEFAULT_OS_CONFIG: WindowsOsConfig = {
  hostname: 'PC-LAB-01',
  ipMode: 'dhcp',
  ipv4: '10.20.4.42',
  subnet: '255.255.255.0',
  gateway: '10.20.4.1',
  dnsMode: 'manual',
  primaryDns: '1.1.1.1',
  firewallEnabled: true,
  rdpEnabled: false,
  windowsUpdateRing: 'Semi-Annual Channel',
};

export default function WindowsOsLab() {
  const [subView, setSubView] = useState<'troubleshoot' | 'osconfig'>('troubleshoot');

  // Interactive OS configuration state
  const [osConfig, setOsConfig] = useState<WindowsOsConfig>(DEFAULT_OS_CONFIG);
  const [configNotice, setConfigNotice] = useState<string | null>(null);

  // Troubleshooting scenarios state
  const [winScenarioId, setWinScenarioId] = useState<string>(WINDOWS_SCENARIOS[0].id);
  const [winInput, setWinInput] = useState<string>('');
  const [winLogs, setWinLogs] = useState<Record<string, { cmd: string; out: string }[]>>({});
  const [winResolved, setWinResolved] = useState<Record<string, boolean>>({});
  const winTerminalRef = useRef<HTMLDivElement>(null);

  const activeWinScenario =
    WINDOWS_SCENARIOS.find((w) => w.id === winScenarioId) ?? WINDOWS_SCENARIOS[0];
  const currentWinLogs = winLogs[activeWinScenario.id] ?? [];
  const isWinFixed = winResolved[activeWinScenario.id] ?? false;

  const executeWindowsCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();

    if (lower === 'cls' || lower === 'clear') {
      setWinLogs((prev) => ({ ...prev, [activeWinScenario.id]: [] }));
      return;
    }

    let output = '';

    // OS-config-aware commands work anywhere
    if (lower === 'hostname') {
      output = osConfig.hostname;
    } else if (lower === 'ipconfig /all' && subView === 'osconfig') {
      output = [
        `Windows IP Configuration`,
        `   Host Name . . . . . . . . . . . . : ${osConfig.hostname}`,
        `   Primary Dns Suffix  . . . . . . . : corp.internal`,
        `Ethernet adapter Ethernet0:`,
        `   DHCP Enabled. . . . . . . . . . . : ${osConfig.ipMode === 'dhcp' ? 'Yes' : 'No'}`,
        `   IPv4 Address. . . . . . . . . . . : ${osConfig.ipv4}`,
        `   Subnet Mask . . . . . . . . . . . : ${osConfig.subnet}`,
        `   Default Gateway . . . . . . . . . : ${osConfig.gateway}`,
        `   DNS Servers . . . . . . . . . . . : ${osConfig.dnsMode === 'dhcp' ? '10.20.1.10 (Corporate AD DNS)' : osConfig.primaryDns}`,
      ].join('\n');
    } else if (lower.includes('netsh') && lower.includes('dns') && lower.includes('dhcp')) {
      setOsConfig((prev) => ({ ...prev, dnsMode: 'dhcp', primaryDns: '10.20.1.10' }));
      output =
        'Updated Ethernet0 DNS configuration to DHCP (10.20.1.10). Internal corporate resolution restored.';
      if (activeWinScenario.id === 'win-dns-cache') {
        setWinResolved((prev) => ({ ...prev, [activeWinScenario.id]: true }));
      }
    } else if (lower === 'sfc /scannow') {
      output =
        'Beginning system scan... Verification 100% complete.\nWindows Resource Protection did not find any integrity violations.';
    } else if (lower === 'gpupdate /force') {
      output =
        'Updating policy...\nComputer Policy update has completed successfully.\nUser Policy update has completed successfully.';
    } else {
      const match = activeWinScenario.acceptedCommands.find((item) =>
        lower.includes(item.pattern.toLowerCase())
      );

      if (lower === 'help') {
        output = `Available scenario commands:\n${activeWinScenario.hintCommands.join('\n')}\nhostname\nsfc /scannow\ngpupdate /force\ncls`;
      } else if (match) {
        output = match.output;
        if (match.fixesIssue) {
          setWinResolved((prev) => ({ ...prev, [activeWinScenario.id]: true }));
        }
      } else {
        output = `'${trimmed}' did not match an active diagnostic command. Type 'help' or click a guided command below.`;
      }
    }

    setWinLogs((prev) => ({
      ...prev,
      [activeWinScenario.id]: [...(prev[activeWinScenario.id] ?? []), { cmd: trimmed, out: output }],
    }));
  };

  const handleWinSubmit = (e: FormEvent) => {
    e.preventDefault();
    executeWindowsCommand(winInput);
    setWinInput('');
  };

  const handleApplyOsConfig = (e: FormEvent) => {
    e.preventDefault();
    const cleanedHost = osConfig.hostname.trim().toUpperCase() || 'PC-LAB-01';
    setOsConfig((prev) => ({ ...prev, hostname: cleanedHost }));
    setConfigNotice(
      `Applied Windows 11 settings to ${cleanedHost}: IPv4=${osConfig.ipMode.toUpperCase()}, DNS=${
        osConfig.dnsMode === 'dhcp' ? '10.20.1.10 (Auto DHCP)' : osConfig.primaryDns
      }, Firewall=${osConfig.firewallEnabled ? 'Enabled' : 'Disabled'}, RDP=${
        osConfig.rdpEnabled ? 'Enabled' : 'Disabled'
      }.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Sub-mode switcher inside Windows Lab */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-[#F8FAFC]">
            Windows 11 Workstation & OS Configuration Lab
          </h3>
          <p className="mt-1 text-xs text-[#CBD5E1]">
            Switch between OS Control Panel configuration and live Windows troubleshooting scenarios.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0B1220] p-1">
          <button
            type="button"
            onClick={() => setSubView('troubleshoot')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer ${
              subView === 'troubleshoot'
                ? 'bg-[#2563EB] text-white'
                : 'text-[#CBD5E1] hover:text-white'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            Troubleshooting Console
          </button>
          <button
            type="button"
            onClick={() => setSubView('osconfig')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer ${
              subView === 'osconfig'
                ? 'bg-[#2563EB] text-white'
                : 'text-[#CBD5E1] hover:text-white'
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            OS Settings & NIC Config
          </button>
        </div>
      </div>

      {subView === 'osconfig' ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Windows Settings & Control Panel Simulator */}
          <form
            onSubmit={handleApplyOsConfig}
            className="space-y-5 rounded-2xl border border-slate-800 bg-[#0B1220] p-6 lg:col-span-6"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-[#06B6D4]" />
                <h4 className="font-display text-base font-semibold text-[#F8FAFC]">
                  Windows Settings · System & Network Adapter
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOsConfig(DEFAULT_OS_CONFIG);
                  setConfigNotice('Restored default Windows workstation configuration.');
                }}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1]">
                  Computer Name (Hostname)
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={osConfig.hostname}
                  onChange={(e) => setOsConfig({ ...osConfig, hostname: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-3 py-2 font-mono text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1]">
                  Windows Update Policy
                </label>
                <select
                  value={osConfig.windowsUpdateRing}
                  onChange={(e) =>
                    setOsConfig({
                      ...osConfig,
                      windowsUpdateRing: e.target.value as WindowsOsConfig['windowsUpdateRing'],
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                >
                  <option value="Semi-Annual Channel">Semi-Annual Channel</option>
                  <option value="Security Patches Only">Security Patches Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1]">IPv4 Assignment</label>
                <select
                  value={osConfig.ipMode}
                  onChange={(e) =>
                    setOsConfig({ ...osConfig, ipMode: e.target.value as 'dhcp' | 'static' })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                >
                  <option value="dhcp">Obtain IP Automatically (DHCP)</option>
                  <option value="static">Use Static IPv4 Address</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1]">DNS Server Mode</label>
                <select
                  value={osConfig.dnsMode}
                  onChange={(e) =>
                    setOsConfig({
                      ...osConfig,
                      dnsMode: e.target.value as 'dhcp' | 'manual',
                      primaryDns: e.target.value === 'dhcp' ? '10.20.1.10' : osConfig.primaryDns,
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                >
                  <option value="dhcp">Obtain DNS Automatically (10.20.1.10)</option>
                  <option value="manual">Manual DNS Override</option>
                </select>
              </div>
            </div>

            {osConfig.ipMode === 'static' && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400">IPv4</label>
                  <input
                    type="text"
                    value={osConfig.ipv4}
                    onChange={(e) => setOsConfig({ ...osConfig, ipv4: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-2.5 py-1.5 font-mono text-xs text-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400">Subnet</label>
                  <input
                    type="text"
                    value={osConfig.subnet}
                    onChange={(e) => setOsConfig({ ...osConfig, subnet: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-2.5 py-1.5 font-mono text-xs text-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400">Gateway</label>
                  <input
                    type="text"
                    value={osConfig.gateway}
                    onChange={(e) => setOsConfig({ ...osConfig, gateway: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-2.5 py-1.5 font-mono text-xs text-[#F8FAFC]"
                  />
                </div>
              </div>
            )}

            {osConfig.dnsMode === 'manual' && (
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1]">
                  Manual Primary DNS Server
                </label>
                <input
                  type="text"
                  value={osConfig.primaryDns}
                  onChange={(e) => setOsConfig({ ...osConfig, primaryDns: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-3 py-2 font-mono text-xs text-[#F8FAFC]"
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 border-t border-slate-800 pt-4 sm:grid-cols-2">
              <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#0F1B2E] p-3 text-xs cursor-pointer">
                <span className="font-semibold text-[#F8FAFC]">Windows Defender Firewall</span>
                <input
                  type="checkbox"
                  checked={osConfig.firewallEnabled}
                  onChange={(e) => setOsConfig({ ...osConfig, firewallEnabled: e.target.checked })}
                  className="h-4 w-4 accent-[#2563EB]"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#0F1B2E] p-3 text-xs cursor-pointer">
                <span className="font-semibold text-[#F8FAFC]">Remote Desktop (TCP 3389)</span>
                <input
                  type="checkbox"
                  checked={osConfig.rdpEnabled}
                  onChange={(e) => setOsConfig({ ...osConfig, rdpEnabled: e.target.checked })}
                  className="h-4 w-4 accent-[#2563EB]"
                />
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
            >
              Apply Operating System Configuration
            </button>

            {configNotice && (
              <div
                role="status"
                className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-200"
              >
                {configNotice}
              </div>
            )}
          </form>

          {/* Right: Live OS State & Verification Readout */}
          <div className="space-y-4 lg:col-span-6">
            <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <Shield className="h-4 w-4" />
                Live OS Configuration Health Check
              </div>

              <dl className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between gap-4 border-b border-slate-800 pb-2.5">
                  <dt className="text-slate-400">Workstation Hostname</dt>
                  <dd className="font-mono font-semibold text-[#F8FAFC]">{osConfig.hostname}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-800 pb-2.5">
                  <dt className="text-slate-400">IPv4 Address</dt>
                  <dd className="font-mono text-[#CBD5E1] tabular-nums">
                    {osConfig.ipv4} ({osConfig.ipMode.toUpperCase()})
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-800 pb-2.5">
                  <dt className="text-slate-400">Active DNS Resolver</dt>
                  <dd
                    className={`font-mono font-semibold ${
                      osConfig.dnsMode === 'dhcp' || osConfig.primaryDns === '10.20.1.10'
                        ? 'text-emerald-400'
                        : 'text-[#F59E0B]'
                    }`}
                  >
                    {osConfig.dnsMode === 'dhcp' ? '10.20.1.10 (Corporate AD)' : osConfig.primaryDns}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-800 pb-2.5">
                  <dt className="text-slate-400">Host Firewall</dt>
                  <dd
                    className={`font-semibold ${
                      osConfig.firewallEnabled ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {osConfig.firewallEnabled ? 'Protected (All Profiles Active)' : 'Warning: Disabled'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Remote Desktop (RDP)</dt>
                  <dd className="font-mono text-[#CBD5E1]">
                    {osConfig.rdpEnabled ? 'Allowed (Port 3389)' : 'Blocked'}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    executeWindowsCommand('ipconfig /all');
                    setSubView('troubleshoot');
                  }}
                  className="rounded-lg border border-slate-700 bg-[#14243A] px-3 py-1.5 font-mono text-xs font-medium text-cyan-300 hover:border-cyan-400 cursor-pointer"
                >
                  Verify via ipconfig /all
                </button>
                <button
                  type="button"
                  onClick={() => {
                    executeWindowsCommand('gpupdate /force');
                    setSubView('troubleshoot');
                  }}
                  className="rounded-lg border border-slate-700 bg-[#14243A] px-3 py-1.5 font-mono text-xs font-medium text-cyan-300 hover:border-cyan-400 cursor-pointer"
                >
                  Run gpupdate /force
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <div className="space-y-2.5">
              {WINDOWS_SCENARIOS.map((sc) => {
                const active = sc.id === activeWinScenario.id;
                const fixed = winResolved[sc.id] ?? false;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setWinScenarioId(sc.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                      active
                        ? 'border-[#06B6D4] bg-[#0B1220]'
                        : 'border-slate-800 bg-[#0B1220]/70 hover:border-slate-700 hover:bg-[#14243A]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-semibold text-[#F8FAFC]">
                        {sc.title}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${
                          fixed ? 'text-emerald-400' : 'text-[#F59E0B]'
                        }`}
                      >
                        {fixed ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Nominal
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Fault Active
                          </>
                        )}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#CBD5E1]">{sc.symptom}</p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-5">
              <h4 className="font-display text-sm font-semibold text-[#F8FAFC]">
                Suggested Windows Commands
              </h4>
              <p className="mt-1 text-xs text-slate-400">
                Click any command to run it in the Windows administrative console, or type directly.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeWinScenario.hintCommands.map((cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => executeWindowsCommand(cmd)}
                    className="rounded-lg border border-slate-700 bg-[#14243A] px-3 py-1.5 font-mono text-xs font-medium text-cyan-300 hover:border-cyan-400 cursor-pointer"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0B1220] px-5 py-3.5">
              <div className="text-xs">
                <span className="text-slate-400">Subsystem: </span>
                <strong className="text-[#F8FAFC]">{activeWinScenario.serviceName}</strong>
              </div>
              <div
                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                  isWinFixed ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {isWinFixed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                {isWinFixed ? activeWinScenario.resolvedStatus : activeWinScenario.initialStatus}
              </div>
            </div>

            {/* Realistic Dark Windows PowerShell / CMD Console */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#070D18] text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 text-xs text-slate-400">
                <span className="font-mono">
                  Administrator: Windows PowerShell / CMD ({osConfig.hostname})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setWinResolved((prev) => ({ ...prev, [activeWinScenario.id]: false }));
                    setWinLogs((prev) => ({ ...prev, [activeWinScenario.id]: [] }));
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Fault
                </button>
              </div>

              <div
                ref={winTerminalRef}
                className="h-[300px] space-y-4 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
              >
                {currentWinLogs.length === 0 ? (
                  <div className="text-slate-400">
                    Microsoft Windows [Version 10.0.22631] — Interactive Troubleshooting Lab.
                    <br />
                    Type <span className="text-cyan-300">help</span> or run a diagnostic command below.
                  </div>
                ) : (
                  currentWinLogs.map((entry, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="text-cyan-300">
                        <span className="text-slate-500">C:\Windows\System32&gt; </span>
                        {entry.cmd}
                      </div>
                      <pre className="whitespace-pre-wrap text-slate-200">{entry.out}</pre>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleWinSubmit}
                className="flex items-center gap-2 border-t border-slate-800 bg-[#0F1B2E] px-4 py-2.5"
              >
                <span className="font-mono text-xs text-slate-400 shrink-0">C:\&gt;</span>
                <input
                  type="text"
                  maxLength={160}
                  autoComplete="off"
                  spellCheck={false}
                  value={winInput}
                  onChange={(e) => setWinInput(e.target.value)}
                  placeholder="Enter Windows command (e.g. ipconfig /flushdns)"
                  aria-label="Windows command input"
                  className="w-full bg-transparent font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 hover:bg-blue-500 cursor-pointer"
                >
                  Run
                </button>
              </form>
            </div>

            {isWinFixed && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-xs leading-relaxed text-emerald-200">
                <strong className="font-semibold">Scenario Resolved: </strong>
                {activeWinScenario.explanation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
