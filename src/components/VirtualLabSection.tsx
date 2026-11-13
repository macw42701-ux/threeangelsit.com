import {
  AlertTriangle,
  CheckCircle2,
  Monitor,
  Network,
  Play,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  LINUX_TASKS,
  NETWORK_NODES,
  NETWORK_SCENARIOS,
  NetworkNode,
  WINDOWS_SCENARIOS,
} from '../data/itData';

type LabMode = 'network' | 'windows' | 'linux';

interface LinuxLogEntry {
  command: string;
  output: string;
}

const INITIAL_AUTH_LOG = [
  'Nov 13 08:02:11 lab-srv01 sshd[1820]: Accepted publickey for deploy from 10.20.4.42 port 51204',
  'Nov 13 08:04:19 lab-srv01 sshd[1891]: Failed password for invalid user admin from 185.220.101.44 port 44112 ssh2',
  'Nov 13 08:04:22 lab-srv01 sshd[1891]: Failed password for invalid user root from 185.220.101.44 port 44118 ssh2',
  'Nov 13 08:04:25 lab-srv01 sshd[1891]: Failed password for invalid user oracle from 185.220.101.44 port 44124 ssh2',
  'Nov 13 08:09:01 lab-srv01 systemd[1]: Started Daily Backup Verification Timer.',
];

export default function VirtualLabSection() {
  const [labMode, setLabMode] = useState<LabMode>('network');

  // --- Network Simulator State ---
  const [scenarioId, setScenarioId] = useState<string>(NETWORK_SCENARIOS[1].id);
  const [selectedNode, setSelectedNode] = useState<NetworkNode>(NETWORK_NODES[0]);
  const [traceStep, setTraceStep] = useState<number>(-1);
  const [isTracing, setIsTracing] = useState<boolean>(false);

  const activeNetScenario =
    NETWORK_SCENARIOS.find((s) => s.id === scenarioId) ?? NETWORK_SCENARIOS[0];

  useEffect(() => {
    if (!isTracing) return;
    const totalHops = activeNetScenario.hopDetails.length;
    if (traceStep >= totalHops - 1) {
      setIsTracing(false);
      return;
    }
    const timer = setTimeout(() => {
      setTraceStep((prev) => prev + 1);
    }, 550);
    return () => clearTimeout(timer);
  }, [isTracing, traceStep, activeNetScenario]);

  const handleRunTrace = () => {
    setTraceStep(0);
    setIsTracing(true);
  };

  // --- Windows Troubleshooting State ---
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

    const match = activeWinScenario.acceptedCommands.find((item) =>
      lower.includes(item.pattern.toLowerCase())
    );

    let output = '';
    if (lower === 'help') {
      output = `Available scenario commands:\n${activeWinScenario.hintCommands.join('\n')}\ncls`;
    } else if (match) {
      output = match.output;
      if (match.fixesIssue) {
        setWinResolved((prev) => ({ ...prev, [activeWinScenario.id]: true }));
      }
    } else {
      output = `'${trimmed}' did not match an active diagnostic or remediation command for this lab. Type 'help' or click a guided command below.`;
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

  // --- Linux Command Lab State ---
  const [linuxInput, setLinuxInput] = useState<string>('');
  const [linuxHistory, setLinuxHistory] = useState<LinuxLogEntry[]>([
    {
      command: 'whoami && uname -sr',
      output: 'sysadmin\nLinux 6.8.0-45-generic',
    },
  ]);
  const [scriptExecutable, setScriptExecutable] = useState<boolean>(false);
  const [nginxActive, setNginxActive] = useState<boolean>(false);
  const [completedLinuxTasks, setCompletedLinuxTasks] = useState<string[]>([]);

  const markLinuxTaskDone = (taskId: string) => {
    setCompletedLinuxTasks((prev) => (prev.includes(taskId) ? prev : [...prev, taskId]));
  };

  const executeLinuxCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    if (cmd === 'clear') {
      setLinuxHistory([]);
      return;
    }

    let output = '';

    if (cmd === 'help') {
      output = [
        'Supported sandbox commands:',
        '  ss -tulpn                     Show listening TCP/UDP sockets & PIDs',
        '  ps aux                        Show running processes',
        '  ls -la /opt/backup            Inspect backup script permissions',
        '  cat /etc/hosts                View local host mappings',
        '  tail -n 5 /var/log/auth.log   View recent auth log lines',
        '  grep "Failed" /var/log/auth.log  Filter failed SSH attempts',
        '  chmod +x /opt/backup/run.sh   Make backup script executable',
        '  systemctl status nginx        Check nginx service state',
        '  systemctl restart nginx       Restart nginx service',
        '  df -h                         Show disk utilization',
        '  clear                         Clear terminal buffer',
      ].join('\n');
    } else if (cmd === 'whoami') {
      output = 'sysadmin';
    } else if (cmd === 'pwd') {
      output = '/home/sysadmin';
    } else if (cmd.startsWith('ss')) {
      output = [
        'Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port  Process',
        'tcp    LISTEN  0       128      0.0.0.0:22            0.0.0.0:*          users:(("sshd",pid=912,fd=3))',
        'tcp    LISTEN  0       511      0.0.0.0:8080          0.0.0.0:*          users:(("node-api",pid=2418,fd=18))',
        nginxActive
          ? 'tcp    LISTEN  0       511      0.0.0.0:80            0.0.0.0:*          users:(("nginx",pid=3104,fd=6))'
          : '# Note: nginx (port 80) is currently stopped',
      ].join('\n');
      markLinuxTaskDone('lnx-port');
    } else if (cmd.startsWith('ps')) {
      output = [
        'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND',
        'root       912  0.0  0.2  15420  5210 ?        Ss   08:00   0:00 sshd: /usr/sbin/sshd -D',
        'appuser   2418  0.4  1.8 684210 74100 ?        Ssl  08:01   0:04 /usr/bin/node /srv/api/server.js --port 8080',
        nginxActive
          ? 'www-data  3104  0.1  0.4  56210 14200 ?        S    08:15   0:00 nginx: worker process'
          : '',
      ]
        .filter(Boolean)
        .join('\n');
    } else if (cmd.startsWith('ls')) {
      if (cmd.includes('/opt/backup')) {
        output = scriptExecutable
          ? '-rwxr-xr-x 1 sysadmin sysadmin 418 Nov 13 07:50 /opt/backup/run.sh'
          : '-rw-r--r-- 1 sysadmin sysadmin 418 Nov 13 07:50 /opt/backup/run.sh';
      } else {
        output = 'notes.txt  /opt/backup/run.sh  /var/log/auth.log  /etc/hosts';
      }
    } else if (cmd === 'cat /etc/hosts') {
      output = '127.0.0.1 localhost\n10.20.4.15 fileserver01.corp.internal fileserver01';
    } else if (cmd.includes('/var/log/auth.log')) {
      if (cmd.startsWith('grep')) {
        output = INITIAL_AUTH_LOG.filter((line) => line.includes('Failed')).join('\n');
        markLinuxTaskDone('lnx-log');
      } else if (cmd.startsWith('tail')) {
        output = INITIAL_AUTH_LOG.slice(-4).join('\n');
        markLinuxTaskDone('lnx-log');
      } else if (cmd.startsWith('cat')) {
        output = INITIAL_AUTH_LOG.join('\n');
        markLinuxTaskDone('lnx-log');
      } else {
        output = INITIAL_AUTH_LOG.join('\n');
      }
    } else if (cmd === 'chmod +x /opt/backup/run.sh' || cmd === 'chmod 755 /opt/backup/run.sh') {
      setScriptExecutable(true);
      output = 'Permissions updated: -rwxr-xr-x /opt/backup/run.sh';
      if (nginxActive) {
        markLinuxTaskDone('lnx-chmod');
      }
    } else if (cmd === 'systemctl status nginx') {
      output = nginxActive
        ? '● nginx.service - A high performance web server\n   Loaded: loaded\n   Active: active (running)'
        : '○ nginx.service - A high performance web server\n   Loaded: loaded\n   Active: inactive (dead)';
    } else if (cmd === 'systemctl restart nginx' || cmd === 'systemctl start nginx') {
      setNginxActive(true);
      output = 'nginx.service restarted — active (running) on TCP port 80.';
      if (scriptExecutable) {
        markLinuxTaskDone('lnx-chmod');
      }
    } else if (cmd === 'df -h') {
      output = [
        'Filesystem      Size  Used Avail Use% Mounted on',
        '/dev/sda1        50G   18G   30G  38% /',
        '/dev/sdb1       200G   64G  136G  32% /mnt/backups',
      ].join('\n');
    } else {
      output = `bash: ${cmd.split(' ')[0]}: command not found or not enabled in this sandbox. Run 'help' for supported commands.`;
    }

    setLinuxHistory((prev) => [...prev, { command: cmd, output }]);
  };

  const handleLinuxSubmit = (e: FormEvent) => {
    e.preventDefault();
    executeLinuxCommand(linuxInput);
    setLinuxInput('');
  };

  const resetLinuxLab = () => {
    setScriptExecutable(false);
    setNginxActive(false);
    setCompletedLinuxTasks([]);
    setLinuxHistory([
      {
        command: 'whoami && uname -sr',
        output: 'sysadmin\nLinux 6.8.0-45-generic',
      },
    ]);
  };

  // Helper for SVG packet node highlighting
  const getNodeState = (nodeId: string): 'nominal' | 'blocked' | 'idle' => {
    if (traceStep < 0) return 'idle';
    if (activeNetScenario.failingHopId === nodeId) return 'blocked';
    const hopMap: Record<string, number> = {
      ws: 0,
      sw: 1,
      gw: 2,
      dns: 3,
      fs: 4,
      inet: 3,
    };
    const idx = hopMap[nodeId] ?? 99;
    if (activeNetScenario.failingHopId) {
      const failIdx = hopMap[activeNetScenario.failingHopId] ?? 99;
      if (idx > failIdx) return 'idle';
    }
    return traceStep >= idx ? 'nominal' : 'idle';
  };

  return (
    <section id="lab" className="border-b border-slate-200 bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header & Mode Switcher */}
        <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              02. Virtual IT Lab
            </h2>
            <p className="mt-2 text-base text-slate-600">
              Practice troubleshooting directly in the browser before touching production servers. Trace failing network hops, repair Windows subsystems, and run real Linux commands.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Virtual lab mode"
            className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={labMode === 'network'}
              onClick={() => setLabMode('network')}
              className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                labMode === 'network'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="h-3.5 w-3.5" />
              Network Simulator
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={labMode === 'windows'}
              onClick={() => setLabMode('windows')}
              className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                labMode === 'windows'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              Windows Scenarios
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={labMode === 'linux'}
              onClick={() => setLabMode('linux')}
              className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                labMode === 'linux'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              Linux Command Lab
            </button>
          </div>
        </div>

        {/* MODE 1: NETWORK TOPOLOGY SIMULATOR */}
        {labMode === 'network' && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Interactive Diagram Stage */}
            <div className="space-y-4 lg:col-span-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {NETWORK_SCENARIOS.map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => {
                        setScenarioId(sc.id);
                        setTraceStep(-1);
                        setIsTracing(false);
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        scenarioId === sc.id
                          ? 'border-blue-700 bg-blue-700 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleRunTrace}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 hover:bg-slate-800 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  Run Packet Trace
                </button>
              </div>

              {/* SVG Network Diagram */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
                <svg
                  viewBox="0 0 820 350"
                  className="h-auto w-full min-w-[640px]"
                  role="img"
                  aria-label="Simulated corporate network topology diagram"
                >
                  {/* Links */}
                  <line x1="135" y1="170" x2="270" y2="170" stroke="#CBD5E1" strokeWidth="3" />
                  <line
                    x1="330"
                    y1="170"
                    x2="470"
                    y2="170"
                    stroke={activeNetScenario.id === 'uplink-down' ? '#DC2626' : '#CBD5E1'}
                    strokeWidth="3"
                    strokeDasharray={activeNetScenario.id === 'uplink-down' ? '6 5' : undefined}
                  />
                  <line x1="530" y1="170" x2="660" y2="75" stroke="#CBD5E1" strokeWidth="2.5" />
                  <line
                    x1="530"
                    y1="170"
                    x2="660"
                    y2="175"
                    stroke={activeNetScenario.id === 'smb-acl-drop' ? '#DC2626' : '#CBD5E1'}
                    strokeWidth="2.5"
                    strokeDasharray={activeNetScenario.id === 'smb-acl-drop' ? '6 5' : undefined}
                  />
                  <line x1="530" y1="170" x2="660" y2="275" stroke="#CBD5E1" strokeWidth="2.5" />

                  {/* Animated active trace highlights */}
                  {traceStep >= 1 && (
                    <line x1="135" y1="170" x2="270" y2="170" stroke="#2563EB" strokeWidth="4" />
                  )}
                  {traceStep >= 2 && activeNetScenario.id !== 'uplink-down' && (
                    <line x1="330" y1="170" x2="470" y2="170" stroke="#2563EB" strokeWidth="4" />
                  )}
                  {traceStep >= 3 && activeNetScenario.id !== 'uplink-down' && (
                    <line
                      x1="530"
                      y1="170"
                      x2="660"
                      y2={activeNetScenario.targetType === 'internet' ? 275 : 75}
                      stroke={activeNetScenario.id === 'dns-mismatch' ? '#DC2626' : '#2563EB'}
                      strokeWidth="3.5"
                    />
                  )}
                  {traceStep >= 4 && activeNetScenario.id === 'healthy' && (
                    <line x1="530" y1="170" x2="660" y2="175" stroke="#059669" strokeWidth="4" />
                  )}

                  {/* Interactive Nodes */}
                  {NETWORK_NODES.map((node) => {
                    const state = getNodeState(node.id);
                    const isSelected = selectedNode.id === node.id;
                    const strokeColor =
                      state === 'blocked'
                        ? '#DC2626'
                        : state === 'nominal'
                        ? '#059669'
                        : isSelected
                        ? '#1D4ED8'
                        : '#94A3B8';
                    const fillColor =
                      state === 'blocked'
                        ? '#FEF2F2'
                        : state === 'nominal'
                        ? '#ECFDF5'
                        : '#FFFFFF';

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={() => setSelectedNode(node)}
                        className="cursor-pointer"
                      >
                        <rect
                          x="-62"
                          y="-32"
                          width="124"
                          height="64"
                          rx="10"
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth={isSelected ? '2.5' : '1.75'}
                        />
                        <text
                          x="0"
                          y="-6"
                          textAnchor="middle"
                          className="fill-slate-900 text-[12px] font-semibold"
                        >
                          {node.label}
                        </text>
                        <text
                          x="0"
                          y="12"
                          textAnchor="middle"
                          className="fill-slate-500 font-mono text-[10px]"
                        >
                          {node.ip}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-xs text-slate-600">
                  <span>Click any device node to inspect its IP, VLAN, and listening ports.</span>
                  <span className="font-mono text-slate-700">{activeNetScenario.packetSummary}</span>
                </div>
              </div>

              {/* Per-Hop Trace Readout */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="font-display text-sm font-semibold text-slate-900">
                  Hop-by-Hop Packet Inspection
                </h3>
                <div className="mt-3 divide-y divide-slate-100">
                  {activeNetScenario.hopDetails.map((hop, idx) => {
                    const visible = traceStep < 0 || traceStep >= idx;
                    return (
                      <div
                        key={hop.hop}
                        className={`flex flex-col justify-between gap-2 py-2.5 sm:flex-row sm:items-center ${
                          visible ? 'opacity-100' : 'opacity-35'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{hop.hop}</div>
                          <div className="text-xs text-slate-600">{hop.note}</div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 font-mono text-xs tabular-nums">
                          <span className="text-slate-500">{hop.latency}</span>
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              hop.status === 'Nominal'
                                ? 'text-emerald-700'
                                : hop.status === 'Blocked'
                                ? 'text-red-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {hop.status === 'Nominal' ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <AlertTriangle className="h-3.5 w-3.5" />
                            )}
                            {hop.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Node Inspector & Scenario Summary */}
            <div className="space-y-6 lg:col-span-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs font-medium text-slate-500">Selected Network Node</p>
                <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                  {selectedNode.label}
                </h3>
                <p className="text-xs text-slate-600">{selectedNode.role}</p>

                <dl className="mt-5 space-y-3 border-t border-slate-200 pt-4 text-xs">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">IP Address</dt>
                    <dd className="font-mono font-semibold text-slate-900 tabular-nums">{selectedNode.ip}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Subnet Mask</dt>
                    <dd className="font-mono text-slate-800 tabular-nums">{selectedNode.subnet}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">VLAN Scope</dt>
                    <dd className="font-mono text-slate-800">{selectedNode.vlan}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Interfaces / Ports</dt>
                    <dd className="text-right font-mono text-slate-800">{selectedNode.ports}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h4 className="font-display text-base font-semibold text-slate-900">
                  Active Condition: {activeNetScenario.label}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {activeNetScenario.description}
                </p>
                <div className="mt-4 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-700">
                  <strong className="text-slate-900">Remediation: </strong>
                  {activeNetScenario.remediationHint}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: WINDOWS TROUBLESHOOTING SCENARIOS */}
        {labMode === 'windows' && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-5">
              <div className="space-y-2">
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
                          ? 'border-blue-600 bg-blue-50/40'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-sm font-semibold text-slate-900">
                          {sc.title}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${
                            fixed ? 'text-emerald-700' : 'text-amber-700'
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
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{sc.symptom}</p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="font-display text-sm font-semibold text-slate-900">
                  Suggested Windows Commands
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  Click any command to run it in the Windows administrative console, or type directly.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeWinScenario.hintCommands.map((cmd) => (
                    <button
                      key={cmd}
                      type="button"
                      onClick={() => executeWindowsCommand(cmd)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-800 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3.5">
                <div className="text-xs">
                  <span className="text-slate-500">Subsystem: </span>
                  <strong className="text-slate-900">{activeWinScenario.serviceName}</strong>
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    isWinFixed ? 'text-emerald-700' : 'text-red-700'
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

              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-slate-100">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 text-xs text-slate-400">
                  <span className="font-mono">Administrator: Windows PowerShell / CMD</span>
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
                  className="h-[280px] space-y-4 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
                >
                  {currentWinLogs.length === 0 ? (
                    <div className="text-slate-400">
                      Microsoft Windows [Version 10.0.22631] — Interactive Troubleshooting Lab.
                      <br />
                      Type <span className="text-slate-200">help</span> or run a diagnostic command below.
                    </div>
                  ) : (
                    currentWinLogs.map((entry, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="text-blue-400">
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
                  className="flex items-center gap-2 border-t border-slate-800 bg-slate-900 px-4 py-2.5"
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
                    className="rounded bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 hover:bg-blue-600 cursor-pointer"
                  >
                    Run
                  </button>
                </form>
              </div>

              {isWinFixed && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs leading-relaxed text-emerald-900">
                  <strong className="font-semibold">Scenario Resolved: </strong>
                  {activeWinScenario.explanation}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODE 3: LINUX COMMAND LAB */}
        {labMode === 'linux' && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Guided Tasks */}
            <div className="space-y-4 lg:col-span-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Guided Linux Exercises
                </h3>
                <span className="font-mono text-xs text-slate-600 tabular-nums">
                  {completedLinuxTasks.length} / {LINUX_TASKS.length} Completed
                </span>
              </div>

              <div className="space-y-3">
                {LINUX_TASKS.map((task) => {
                  const done = completedLinuxTasks.includes(task.id);
                  return (
                    <div
                      key={task.id}
                      className={`rounded-xl border p-4 ${
                        done ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display text-sm font-semibold text-slate-900">
                          {task.title}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${
                            done ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        >
                          {done && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {done ? 'Passed' : 'Pending'}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                        {task.instruction}
                      </p>
                      <button
                        type="button"
                        onClick={() => executeLinuxCommand(task.hintCommand)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 font-mono text-[11px] text-slate-700 hover:border-blue-400 hover:text-blue-800 cursor-pointer"
                      >
                        Try: {task.hintCommand}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                <strong className="text-slate-900">Tip:</strong> Task 3 requires both{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-900">chmod +x /opt/backup/run.sh</code>{' '}
                and{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-900">systemctl restart nginx</code>.
              </div>
            </div>

            {/* Interactive Bash Terminal */}
            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-slate-100">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 text-xs text-slate-400">
                  <span className="font-mono">sysadmin@lab-srv01: ~ (Ubuntu 24.04 Sandbox)</span>
                  <button
                    type="button"
                    onClick={resetLinuxLab}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset Sandbox
                  </button>
                </div>

                <div className="h-[340px] space-y-4 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
                  {linuxHistory.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div>
                        <span className="text-emerald-400">sysadmin@lab-srv01</span>
                        <span className="text-slate-500">:~$ </span>
                        <span className="text-white">{item.command}</span>
                      </div>
                      <pre className="whitespace-pre-wrap text-slate-300">{item.output}</pre>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleLinuxSubmit}
                  className="flex items-center gap-2 border-t border-slate-800 bg-slate-900 px-4 py-2.5"
                >
                  <span className="font-mono text-xs text-emerald-400 shrink-0">~$</span>
                  <input
                    type="text"
                    maxLength={160}
                    autoComplete="off"
                    spellCheck={false}
                    value={linuxInput}
                    onChange={(e) => setLinuxInput(e.target.value)}
                    placeholder="Type bash command (try: ss -tulpn, grep, chmod, help)"
                    aria-label="Linux bash command input"
                    className="w-full bg-transparent font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 hover:bg-blue-600 cursor-pointer"
                  >
                    Execute
                  </button>
                </form>
              </div>

              {/* Quick command bar */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {['ls -la /opt/backup', 'systemctl status nginx', 'systemctl restart nginx', 'df -h', 'help'].map(
                  (quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => executeLinuxCommand(quick)}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-slate-700 hover:border-slate-300 hover:bg-slate-100 cursor-pointer"
                    >
                      {quick}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
