export type LabModuleId =
  | 'network'
  | 'windows'
  | 'linux'
  | 'disk'
  | 'ad'
  | 'software';

export interface LabModuleMeta {
  id: LabModuleId;
  title: string;
  shortLabel: string;
  category: string;
  summary: string;
  skills: string[];
}

export const LAB_MODULES: LabModuleMeta[] = [
  {
    id: 'network',
    title: 'Network Topology Simulator',
    shortLabel: 'Network',
    category: 'Switching, DNS & Routing',
    summary:
      'Inspect workstations, switches, routers, DNS, and file servers. Inject network faults and run hop-by-hop packet traces.',
    skills: ['Packet Tracing', 'VLAN Inspection', 'DNS vs IP Testing'],
  },
  {
    id: 'windows',
    title: 'Windows OS & Config Lab',
    shortLabel: 'Windows OS',
    category: 'Windows 11 Administration',
    summary:
      'Configure DHCP/Static IPv4, DNS servers, hostname, firewall, and RDP, and fix real Windows faults in PowerShell/CMD.',
    skills: ['OS Configuration', 'ipconfig / netsh', 'Service Repair'],
  },
  {
    id: 'linux',
    title: 'Linux Command Lab',
    shortLabel: 'Linux Shell',
    category: 'Ubuntu 24.04 Administration',
    summary:
      'Run safe bash diagnostics in a simulated Ubuntu server: inspect sockets, auth logs, permissions, systemd services, and users.',
    skills: ['Bash Diagnostics', 'systemd & chmod', 'Auth Log Triage'],
  },
  {
    id: 'disk',
    title: 'Disk Formatting & Partitions',
    shortLabel: 'Disk & Format',
    category: 'Storage & Filesystems',
    summary:
      'Initialize GPT/MBR drives, create partitions, select NTFS/ext4/FAT32 filesystems, assign drive letters or mount paths, and format safely.',
    skills: ['GPT / MBR', 'NTFS & ext4 Format', 'diskpart / mkfs'],
  },
  {
    id: 'ad',
    title: 'Active Directory & Domain Join',
    shortLabel: 'Active Directory',
    category: 'Identity & GPO',
    summary:
      'Join a workstation from WORKGROUP to corp.internal, fix DNS SRV lookup errors, manage AD user accounts, groups, and Group Policy.',
    skills: ['Domain Join', 'User Management', 'Security Groups & GPO'],
  },
  {
    id: 'software',
    title: 'Software & Package Installer',
    shortLabel: 'Software Setup',
    category: 'winget & apt Deployment',
    summary:
      'Install, verify, and remove core IT engineering software across Windows (winget) and Linux (apt) with dependency checks.',
    skills: ['winget / apt CLI', 'Dependency Resolution', 'Version Checks'],
  },
];
