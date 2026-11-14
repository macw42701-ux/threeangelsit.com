import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  HardDrive,
  Monitor,
  Network,
  Package,
  Play,
  RotateCcw,
  Server,
  Terminal,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import {
  LINUX_TASKS,
  NETWORK_NODES,
  NETWORK_SCENARIOS,
  type NetworkNode,
} from '../../data/itData';
import BrandLogo from '../BrandLogo';
import ActiveDirectoryLab from './ActiveDirectoryLab';
import DiskFormattingLab from './DiskFormattingLab';
import { LAB_MODULES, type LabModuleId } from './labTypes';
import SoftwarePackageLab from './SoftwarePackageLab';
import WindowsOsLab from './WindowsOsLab';

interface VirtualLabPageProps {
  initialModule?: LabModuleId;
  onSelectModuleUrl?: (moduleId: LabModuleId) => void;
  onBackToSite: () => void;
}

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

const TAB_ICONS: Record<LabModuleId, typeof Network> = {
  network: Network,
  windows: Monitor,
  linux: Terminal,
  disk: HardDrive,
  ad: Server,
  software: Package,
};

export default function VirtualLabPage({
  initialModule = 'network',
  onSelectModuleUrl,
  onBackToSite,
}: VirtualLabPageProps) {
  const [labMode, setLabMode] = useState<LabModuleId>(initialModule);

  useEffect(() => {
    setLabMode(initialModule);
  }, [initialModule]);

  const switchMode = (next: LabModuleId) => {
    setLabMode(next);
    onSelectModuleUrl?.(next);
  };

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
  const [linuxUsers, setLinuxUsers] = useState<string[]>(['sysadmin', 'deploy']);
  const [ufwHttpAllowed, setUfwHttpAllowed] = useState<boolean>(false);
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
        '  ss -tulpn                         Show listening TCP/UDP sockets & PIDs',
        '  ps aux                            Show running processes',
        '  ls -la /opt/backup                Inspect backup script permissions',
        '  cat /etc/hosts                    View local host mappings',
        '  tail -n 5 /var/log/auth.log       View recent auth log lines',
        '  grep "Failed" /var/log/auth.log   Filter failed SSH attempts',
        '  chmod +x /opt/backup/run.sh       Make backup script executable',
        '  systemctl status nginx            Check nginx service state',
        '  systemctl restart nginx           Restart nginx service',
        '  ufw status / ufw allow 80/tcp     Inspect or allow firewall HTTP port',
        '  useradd <name> / id <name>        Create or inspect Linux local user',
        '  lsblk / df -h                     Inspect block devices & mounts',
        '  ip addr / hostnamectl             View NIC addresses & OS hostname',
        '  clear                             Clear terminal buffer',
      ].join('\n');
    } else if (cmd === 'whoami') {
      output = 'sysadmin';
    } else if (cmd === 'pwd') {
      output = '/home/sysadmin';
    } else if (cmd === 'hostnamectl') {
      output = [
        '   Static hostname: lab-srv01',
        '         Icon name: computer-vm',
        '  Operating System: Ubuntu 24.04.1 LTS',
        '            Kernel: Linux 6.8.0-45-generic',
      ].join('\n');
    } else if (cmd === 'cat /etc/os-release') {
      output = 'PRETTY_NAME="Ubuntu 24.04.1 LTS"\nVERSION_ID="24.04"\nID=ubuntu';
    } else if (cmd === 'ip addr' || cmd === 'ip a') {
      output = [
        '1: lo: <LOOPBACK,UP> mtu 65536 state UNKNOWN',
        '    inet 127.0.0.1/8 scope host lo',
        '2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500 state UP',
        '    inet 10.20.4.25/24 brd 10.20.4.255 scope global eth0',
      ].join('\n');
    } else if (cmd.startsWith('ufw')) {
      if (cmd.includes('allow 80')) {
        setUfwHttpAllowed(true);
        output = 'Rule added\nRule added (v6) — 80/tcp ALLOW Anywhere';
      } else {
        output = [
          'Status: active',
          'To                         Action      From',
          '--                         ------      ----',
          '22/tcp                     ALLOW       10.20.0.0/16',
          ufwHttpAllowed ? '80/tcp                     ALLOW       Anywhere' : '# 80/tcp not yet allowed',
        ].join('\n');
      }
    } else if (cmd.startsWith('useradd ') || cmd.startsWith('sudo useradd ')) {
      const targetUser = cmd.split(' ').pop()?.replace(/[^a-z0-9_-]/gi, '') || '';
      if (!targetUser) {
        output = 'Usage: useradd <username>';
      } else if (linuxUsers.includes(targetUser)) {
        output = `useradd: user '${targetUser}' already exists`;
      } else {
        setLinuxUsers((prev) => [...prev, targetUser]);
        output = `Created user '${targetUser}' (/home/${targetUser}, shell /bin/bash).`;
      }
    } else if (cmd.startsWith('id')) {
      const targetUser = cmd.split(' ')[1] || 'sysadmin';
      const idx = linuxUsers.indexOf(targetUser);
      output =
        idx >= 0
          ? `uid=${1000 + idx}(${targetUser}) gid=${1000 + idx}(${targetUser}) groups=${1000 + idx}(${targetUser})`
          : `id: '${targetUser}': no such user`;
    } else if (cmd === 'lsblk') {
      output = [
        'NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS',
        'sda      8:0    0   50G  0 disk',
        '└─sda1   8:1    0   50G  0 part /',
        'sdb      8:16   0  200G  0 disk',
        '└─sdb1   8:17   0  200G  0 part /mnt/backups',
      ].join('\n');
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
      } else {
        output = INITIAL_AUTH_LOG.join('\n');
        markLinuxTaskDone('lnx-log');
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
    setUfwHttpAllowed(false);
    setLinuxUsers(['sysadmin', 'deploy']);
    setCompletedLinuxTasks([]);
    setLinuxHistory([
      {
        command: 'whoami && uname -sr',
        output: 'sysadmin\nLinux 6.8.0-45-generic',
      },
    ]);
  };

  const activeMeta = LAB_MODULES.find((m) => m.id === labMode) ?? LAB_MODULES[0];

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F8FAFC] flex flex-col">
      {/* Dedicated Top Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0B1220]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-3">
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-slate-700 bg-[#0F1B2E] px-3.5 py-1.5 text-xs font-semibold text-[#F8FAFC] whitespace-nowrap shrink-0 hover:border-cyan-400 hover:bg-[#14243A] cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-cyan-300" />
              Back to Website
            </button>

            <div className="hidden sm:block">
              <BrandLogo variant="horizontal" />
            </div>
          </div>

          <span className="font-mono text-xs text-slate-400 whitespace-nowrap shrink-0">
            Virtual IT Lab · Runs 100% in Browser (₹0 Cloud Cost)
          </span>
        </div>
      </header>

      {/* Main Dedicated Simulation Workspace */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 space-y-8">
        {/* Title & 6-Tab Switcher */}
        <div className="flex flex-col justify-between gap-6 border-b border-slate-800 pb-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold text-[#06B6D4]">
              Dedicated Interactive Sandbox · {activeMeta.category}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
              {activeMeta.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">{activeMeta.summary}</p>
          </div>

          <div
            role="tablist"
            aria-label="Virtual IT Lab simulations"
            className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-[#0F1B2E] p-1.5"
          >
            {LAB_MODULES.map((mod) => {
              const Icon = TAB_ICONS[mod.id];
              const isSelected = labMode === mod.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => switchMode(mod.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-[#CBD5E1] hover:bg-[#14243A] hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {mod.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Simulation Stage */}
        <section className="rounded-2xl border border-slate-800 bg-[#14243A]/75 p-6 sm:p-8">
          {labMode === 'network' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
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
                            ? 'border-[#06B6D4] bg-[#2563EB] text-white'
                            : 'border-slate-700 bg-[#0B1220] text-[#CBD5E1] hover:border-cyan-400 hover:text-white'
                        }`}
                      >
                        {sc.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleRunTrace}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#F59E0B] px-4 py-2 text-xs font-semibold text-[#070D18] whitespace-nowrap shrink-0 hover:bg-amber-400 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Run Packet Trace
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0B1220] p-4">
                  <svg
                    viewBox="0 0 820 350"
                    className="h-auto w-full min-w-[640px]"
                    role="img"
                    aria-label="Simulated corporate network topology diagram"
                  >
                    <line x1="135" y1="170" x2="270" y2="170" stroke="#334155" strokeWidth="3" />
                    <line
                      x1="330"
                      y1="170"
                      x2="470"
                      y2="170"
                      stroke={activeNetScenario.id === 'uplink-down' ? '#EF4444' : '#334155'}
                      strokeWidth="3"
                      strokeDasharray={activeNetScenario.id === 'uplink-down' ? '6 5' : undefined}
                    />
                    <line x1="530" y1="170" x2="660" y2="75" stroke="#334155" strokeWidth="2.5" />
                    <line
                      x1="530"
                      y1="170"
                      x2="660"
                      y2="175"
                      stroke={activeNetScenario.id === 'smb-acl-drop' ? '#EF4444' : '#334155'}
                      strokeWidth="2.5"
                      strokeDasharray={activeNetScenario.id === 'smb-acl-drop' ? '6 5' : undefined}
                    />
                    <line x1="530" y1="170" x2="660" y2="275" stroke="#334155" strokeWidth="2.5" />

                    {traceStep >= 1 && (
                      <line x1="135" y1="170" x2="270" y2="170" stroke="#06B6D4" strokeWidth="4" />
                    )}
                    {traceStep >= 2 && activeNetScenario.id !== 'uplink-down' && (
                      <line x1="330" y1="170" x2="470" y2="170" stroke="#06B6D4" strokeWidth="4" />
                    )}
                    {traceStep >= 3 && activeNetScenario.id !== 'uplink-down' && (
                      <line
                        x1="530"
                        y1="170"
                        x2="660"
                        y2={activeNetScenario.targetType === 'internet' ? 275 : 75}
                        stroke={activeNetScenario.id === 'dns-mismatch' ? '#EF4444' : '#06B6D4'}
                        strokeWidth="3.5"
                      />
                    )}
                    {traceStep >= 4 && activeNetScenario.id === 'healthy' && (
                      <line x1="530" y1="170" x2="660" y2="175" stroke="#10B981" strokeWidth="4" />
                    )}

                    {NETWORK_NODES.map((node) => {
                      const state = getNodeState(node.id);
                      const isSelected = selectedNode.id === node.id;
                      const strokeColor =
                        state === 'blocked'
                          ? '#EF4444'
                          : state === 'nominal'
                            ? '#10B981'
                            : isSelected
                              ? '#06B6D4'
                              : '#475569';
                      const fillColor =
                        state === 'blocked'
                          ? '#3B0D14'
                          : state === 'nominal'
                            ? '#062C22'
                            : '#0F1B2E';

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${node.x}, ${node.y})`}
                          onClick={() => setSelectedNode(node)}
                          className="cursor-pointer"
                        >
                          <rect
                            x="-64"
                            y="-32"
                            width="128"
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
                            className="fill-[#F8FAFC] text-[12px] font-semibold"
                          >
                            {node.label}
                          </text>
                          <text
                            x="0"
                            y="13"
                            textAnchor="middle"
                            className="fill-[#06B6D4] font-mono text-[10px]"
                          >
                            {node.ip}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-xs text-slate-400">
                    <span>Click any device node to inspect its IP, VLAN, and listening ports.</span>
                    <span className="font-mono font-medium text-cyan-300">{activeNetScenario.packetSummary}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-5">
                  <h3 className="font-display text-sm font-semibold text-[#F8FAFC]">
                    Hop-by-Hop Packet Inspection
                  </h3>
                  <div className="mt-3 divide-y divide-slate-800">
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
                            <div className="text-xs font-semibold text-[#F8FAFC]">{hop.hop}</div>
                            <div className="text-xs text-[#CBD5E1]">{hop.note}</div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 font-mono text-xs tabular-nums">
                            <span className="text-slate-400">{hop.latency}</span>
                            <span
                              className={`inline-flex items-center gap-1 font-semibold ${
                                hop.status === 'Nominal'
                                  ? 'text-emerald-400'
                                  : hop.status === 'Blocked'
                                    ? 'text-red-400'
                                    : 'text-[#F59E0B]'
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

              <div className="space-y-6 lg:col-span-4">
                <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-6">
                  <p className="text-xs font-medium text-[#06B6D4]">Selected Network Node</p>
                  <h3 className="mt-1 font-display text-xl font-bold text-[#F8FAFC]">
                    {selectedNode.label}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedNode.role}</p>

                  <dl className="mt-5 space-y-3 border-t border-slate-800 pt-4 text-xs">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-400">IP Address</dt>
                      <dd className="font-mono font-semibold text-[#F8FAFC] tabular-nums">
                        {selectedNode.ip}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-400">Subnet Mask</dt>
                      <dd className="font-mono text-[#CBD5E1] tabular-nums">
                        {selectedNode.subnet}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-400">VLAN Scope</dt>
                      <dd className="font-mono text-[#CBD5E1]">{selectedNode.vlan}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-400">Interfaces / Ports</dt>
                      <dd className="text-right font-mono font-medium text-cyan-300">{selectedNode.ports}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-6">
                  <h4 className="font-display text-base font-semibold text-[#F8FAFC]">
                    Active Condition: {activeNetScenario.label}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#CBD5E1]">
                    {activeNetScenario.description}
                  </p>
                  <div className="mt-4 border-t border-slate-800 pt-4 text-xs leading-relaxed text-[#CBD5E1]">
                    <strong className="text-[#F59E0B]">Remediation: </strong>
                    {activeNetScenario.remediationHint}
                  </div>
                </div>
              </div>
            </div>
          )}

          {labMode === 'windows' && <WindowsOsLab />}

          {labMode === 'linux' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
                    Guided Linux Exercises
                  </h3>
                  <span className="font-mono text-xs font-semibold text-cyan-300 tabular-nums">
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
                          done
                            ? 'border-emerald-500/40 bg-emerald-950/30'
                            : 'border-slate-800 bg-[#0B1220]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-display text-sm font-semibold text-[#F8FAFC]">
                            {task.title}
                          </h4>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${
                              done ? 'text-emerald-400' : 'text-[#F59E0B]'
                            }`}
                          >
                            {done && <CheckCircle2 className="h-3.5 w-3.5" />}
                            {done ? 'Passed' : 'Pending'}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#CBD5E1]">
                          {task.instruction}
                        </p>
                        <button
                          type="button"
                          onClick={() => executeLinuxCommand(task.hintCommand)}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-[#14243A] px-2.5 py-1 font-mono text-[11px] font-medium text-cyan-300 hover:border-cyan-400 cursor-pointer"
                        >
                          Try: {task.hintCommand}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0B1220] p-4 text-xs text-slate-400">
                  <strong className="text-[#F8FAFC]">Tip:</strong> Also try{' '}
                  <code className="rounded bg-[#14243A] border border-slate-700 px-1.5 py-0.5 text-cyan-300">
                    useradd alex
                  </code>
                  ,{' '}
                  <code className="rounded bg-[#14243A] border border-slate-700 px-1.5 py-0.5 text-cyan-300">
                    ufw allow 80/tcp
                  </code>
                  , or{' '}
                  <code className="rounded bg-[#14243A] border border-slate-700 px-1.5 py-0.5 text-cyan-300">lsblk</code>.
                </div>
              </div>

              {/* Realistic Dark Ubuntu 24.04 Bash Terminal */}
              <div className="lg:col-span-7">
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#070D18] text-slate-100">
                  <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 text-xs text-slate-400">
                    <span className="font-mono">
                      sysadmin@lab-srv01: ~ (Ubuntu 24.04 Sandbox)
                    </span>
                    <button
                      type="button"
                      onClick={resetLinuxLab}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset Sandbox
                    </button>
                  </div>

                  <div className="h-[360px] space-y-4 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
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
                    className="flex items-center gap-2 border-t border-slate-800 bg-[#0F1B2E] px-4 py-2.5"
                  >
                    <span className="font-mono text-xs text-emerald-400 shrink-0">~$</span>
                    <input
                      type="text"
                      maxLength={160}
                      autoComplete="off"
                      spellCheck={false}
                      value={linuxInput}
                      onChange={(e) => setLinuxInput(e.target.value)}
                      placeholder="Type bash command (try: ss -tulpn, useradd alex, lsblk, help)"
                      aria-label="Linux bash command input"
                      className="w-full bg-transparent font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 hover:bg-blue-500 cursor-pointer"
                    >
                      Execute
                    </button>
                  </form>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {[
                    'ls -la /opt/backup',
                    'systemctl restart nginx',
                    'ufw status',
                    'lsblk',
                    'ip addr',
                    'help',
                  ].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => executeLinuxCommand(quick)}
                      className="rounded-md border border-slate-700 bg-[#0B1220] px-2.5 py-1 font-mono text-[11px] font-medium text-cyan-300 hover:border-cyan-400 hover:bg-[#14243A] cursor-pointer"
                    >
                      {quick}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {labMode === 'disk' && <DiskFormattingLab />}

          {labMode === 'ad' && <ActiveDirectoryLab />}

          {labMode === 'software' && <SoftwarePackageLab />}
        </section>
      </main>
    </div>
  );
}
