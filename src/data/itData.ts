export interface DiagnosticCheck {
  id: string;
  label: string;
  command: string;
  output: string;
  finding: string;
  revealsClue: boolean;
}

export interface TicketHypothesis {
  id: string;
  title: string;
  summary: string;
  isCorrect: boolean;
  feedback: string;
}

export interface RealLifeTicket {
  id: string;
  number: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  reporter: string;
  department: string;
  device: string;
  os: string;
  networkContext: string;
  symptomSummary: string;
  userQuote: string;
  checks: DiagnosticCheck[];
  hypotheses: TicketHypothesis[];
  suggestedSolution: {
    rootCause: string;
    verification: string;
    remediationSteps: string[];
    commands: string[];
    prevention: string;
  };
}

export interface NetworkNode {
  id: string;
  label: string;
  role: string;
  ip: string;
  subnet: string;
  vlan: string;
  ports: string;
  x: number;
  y: number;
}

export interface NetworkFaultScenario {
  id: string;
  label: string;
  description: string;
  failingHopId: string | null;
  targetType: 'internet' | 'fileserver';
  packetSummary: string;
  hopDetails: {
    hop: string;
    status: 'Nominal' | 'Blocked' | 'Timeout';
    latency: string;
    note: string;
  }[];
  remediationHint: string;
}

export interface WindowsScenario {
  id: string;
  title: string;
  symptom: string;
  initialStatus: string;
  resolvedStatus: string;
  serviceName: string;
  expectedCommands: string[];
  acceptedCommands: {
    pattern: string;
    output: string;
    fixesIssue: boolean;
  }[];
  hintCommands: string[];
  explanation: string;
}

export interface LinuxTask {
  id: string;
  title: string;
  instruction: string;
  hintCommand: string;
  verifyType: 'command' | 'file_executable' | 'service_running';
  verifyValue: string;
}

export interface AwarenessClue {
  id: string;
  label: string;
  regionLabel: string;
  explanation: string;
  severity: 'High Risk' | 'Warning';
}

export interface AwarenessLesson {
  id: string;
  weekLabel: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  keyTakeaways: string[];
  defenseChecklist: string[];
  simulationType: 'email' | 'mfa' | 'wifi';
  senderName: string;
  senderAddress: string;
  subject: string;
  bodyLines: string[];
  ctaText: string;
  ctaActualUrl: string;
  clues: AwarenessClue[];
  quizQuestion: string;
  quizOptions: {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export interface RoadmapStage {
  id: string;
  stepNumber: string;
  title: string;
  focus: string;
  timeline: string;
  description: string;
  coreSkills: string[];
  essentialTools: string[];
  milestones: {
    id: string;
    label: string;
  }[];
  practiceLink: {
    label: string;
    targetSection: string;
  };
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: 'Networking' | 'Windows' | 'Linux' | 'Identity & Access' | 'Security';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  updated: string;
  symptoms: string[];
  possibleCauses: string[];
  diagnosticCommands: {
    label: string;
    command: string;
  }[];
  solutions: string[];
  prevention: string[];
}

export const REAL_LIFE_TICKETS: RealLifeTicket[] = [
  {
    id: 'ticket-smb-dns',
    number: 'INC-2048',
    title: 'User can access the internet, but cannot open the company shared folder',
    category: 'Networking & Windows SMB',
    difficulty: 'Intermediate',
    estimatedTime: '8 min',
    reporter: 'Maya Lin',
    department: 'Finance Operations',
    device: 'FIN-WS-042',
    os: 'Windows 11 Enterprise 23H2',
    networkContext: 'On-premises Ethernet (VLAN 20) · Expected Subnet 10.20.4.0/24',
    symptomSummary:
      'Browser reaches external HTTPS sites normally, but opening \\\\fileserver01\\Finance fails with "Windows cannot access \\\\fileserver01\\Finance (0x80070035 — The network path was not found)."',
    userQuote:
      'I can open Gmail and search Google just fine, so my internet works. But every time I click our Finance shared drive, it spins for 15 seconds and says the network path was not found.',
    checks: [
      {
        id: 'chk-ipconfig',
        label: 'Inspect IP & DNS settings',
        command: 'ipconfig /all',
        output: `Ethernet adapter Ethernet0:
   Connection-specific DNS Suffix  . : corp.internal
   IPv4 Address. . . . . . . . . . . : 10.20.4.42(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.20.4.1
   DNS Servers . . . . . . . . . . . : 1.1.1.1
                                       8.8.8.8`,
        finding: 'Adapter points to public DNS (1.1.1.1 / 8.8.8.8) instead of internal Active Directory DNS (10.20.1.10).',
        revealsClue: true,
      },
      {
        id: 'chk-nslookup',
        label: 'Resolve file server hostname',
        command: 'nslookup fileserver01.corp.internal',
        output: `Server:  one.one.one.one
Address:  1.1.1.1

*** one.one.one.one can't find fileserver01.corp.internal: Non-existent domain`,
        finding: 'Public DNS cannot resolve internal private hostname fileserver01.corp.internal.',
        revealsClue: true,
      },
      {
        id: 'chk-ping-ip',
        label: 'Ping file server by IP',
        command: 'ping 10.20.4.15 -n 3',
        output: `Pinging 10.20.4.15 with 32 bytes of data:
Reply from 10.20.4.15: bytes=32 time<1ms TTL=128
Reply from 10.20.4.15: bytes=32 time<1ms TTL=128
Reply from 10.20.4.15: bytes=32 time<1ms TTL=128

Packets: Sent = 3, Received = 3, Lost = 0 (0% loss)`,
        finding: 'Layer 3 network reachability to 10.20.4.15 is healthy (<1ms).',
        revealsClue: true,
      },
      {
        id: 'chk-smb-port',
        label: 'Test SMB TCP Port 445',
        command: 'Test-NetConnection -ComputerName 10.20.4.15 -Port 445',
        output: `ComputerName     : 10.20.4.15
RemoteAddress    : 10.20.4.15
RemotePort       : 445
InterfaceAlias   : Ethernet0
SourceAddress    : 10.20.4.42
TcpTestSucceeded : True`,
        finding: 'SMB port 445 is open and listening on the file server; firewall is not blocking traffic.',
        revealsClue: false,
      },
      {
        id: 'chk-netuse',
        label: 'List existing SMB sessions',
        command: 'net use',
        output: `New connections will be remembered.

There are no entries in the list.`,
        finding: 'No stale or conflicting cached SMB credentials exist.',
        revealsClue: false,
      },
    ],
    hypotheses: [
      {
        id: 'hyp-dns',
        title: 'Static public DNS override preventing internal hostname resolution',
        summary: 'NIC DNS was manually set to 1.1.1.1 / 8.8.8.8, so internet sites resolve while internal AD/SMB names fail.',
        isCorrect: true,
        feedback:
          'Exact match. ipconfig /all shows 1.1.1.1 and 8.8.8.8, nslookup fails with NXDOMAIN for fileserver01.corp.internal, while direct IP ping and TCP 445 both succeed.',
      },
      {
        id: 'hyp-firewall',
        title: 'Host firewall blocking outbound TCP Port 445',
        summary: 'Windows Defender Firewall is dropping SMB traffic to the internal file server.',
        isCorrect: false,
        feedback:
          'Ruled out by diagnostics: Test-NetConnection -ComputerName 10.20.4.15 -Port 445 returned TcpTestSucceeded : True.',
      },
      {
        id: 'hyp-server-down',
        title: 'File server offline or SMB service crashed',
        summary: 'fileserver01 has crashed or its LanmanServer service is stopped.',
        isCorrect: false,
        feedback:
          'Ruled out: direct ICMP ping to 10.20.4.15 succeeds in <1ms and TCP 445 responds normally.',
      },
      {
        id: 'hyp-permissions',
        title: 'NTFS / Share permission revocation for Finance group',
        summary: 'User account lacks read access on the \\\\Finance share.',
        isCorrect: false,
        feedback:
          'Permissions errors return "Access is denied" (0x80070005), not "The network path was not found" (0x80070035) during name resolution.',
      },
    ],
    suggestedSolution: {
      rootCause:
        'Workstation Ethernet0 had hardcoded public DNS servers (1.1.1.1 / 8.8.8.8) instead of obtaining internal corporate DNS (10.20.1.10) via DHCP. Internet domains resolved normally, but internal hostnames like fileserver01.corp.internal could not resolve.',
      verification:
        'Confirm direct connectivity via \\\\10.20.4.15\\Finance, then compare nslookup output against the internal DNS server 10.20.1.10.',
      remediationSteps: [
        'Switch the Ethernet0 IPv4 DNS configuration back to "Obtain DNS server address automatically" (DHCP) or configure internal DNS 10.20.1.10.',
        'Flush the local Windows DNS client cache so negative NXDOMAIN entries are cleared.',
        'Re-test UNC path \\\\fileserver01\\Finance and confirm drive mapping mounts cleanly.',
      ],
      commands: [
        'netsh interface ip set dns "Ethernet0" dhcp',
        'ipconfig /flushdns',
        'nslookup fileserver01.corp.internal',
      ],
      prevention:
        'Enforce DHCP-assigned internal DNS via Group Policy / MDM and restrict local administrator overrides on standard user workstations.',
    },
  },
  {
    id: 'ticket-apipa-move',
    number: 'INC-2054',
    title: 'Workstation lost network access after moving to a newly patched desk port',
    category: 'Switching & DHCP',
    difficulty: 'Beginner',
    estimatedTime: '6 min',
    reporter: 'Devon Brooks',
    department: 'Product Design',
    device: 'DES-MAC-019 / DES-WS-019',
    os: 'Windows 11 Pro 23H2',
    networkContext: 'Floor 3 Wall Jack #3B-14 · Connected to Switch SW-FL3-02 Port Gi1/0/14',
    symptomSummary:
      'No internet and no internal resources after plugging into wall jack 3B-14. Network icon shows "Unidentified network — No internet".',
    userQuote:
      'Everything worked at my old desk this morning. I plugged my dock into the wall jack at my new desk and now nothing loads.',
    checks: [
      {
        id: 'chk-ipconfig-apipa',
        label: 'Check assigned IPv4 configuration',
        command: 'ipconfig /all',
        output: `Ethernet adapter Ethernet0:
   Media State . . . . . . . . . . . : Media connected
   DHCP Enabled. . . . . . . . . . . : Yes
   Autoconfiguration IPv4 Address. . : 169.254.88.14(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . : `,
        finding: 'Link is physically up (Media connected), but workstation fell back to APIPA 169.254.88.14 with no Default Gateway.',
        revealsClue: true,
      },
      {
        id: 'chk-renew',
        label: 'Attempt manual DHCP renewal',
        command: 'ipconfig /renew',
        output: `Windows IP Configuration

An error occurred while renewing interface Ethernet0 : unable to contact your DHCP server. Request has timed out.`,
        finding: 'DHCP Discover packets receive zero response from the DHCP server on this port.',
        revealsClue: true,
      },
      {
        id: 'chk-switch-port',
        label: 'Inspect switch port VLAN config',
        command: 'show interface Gi1/0/14 switchport',
        output: `Name: Gi1/0/14
Switchport: Enabled
Administrative Mode: static access
Operational Mode: static access
Access Mode VLAN: 999 (PARKING_BLACKHOLE)
Voice VLAN: none`,
        finding: 'Wall jack 3B-14 is mapped to unused VLAN 999 (PARKING_BLACKHOLE) with no DHCP relay or routing.',
        revealsClue: true,
      },
      {
        id: 'chk-cable',
        label: 'Check physical link speed',
        command: 'Get-NetAdapter | Select Name, Status, LinkSpeed',
        output: `Name       Status   LinkSpeed
----       ------   ---------
Ethernet0  Up       1 Gbps`,
        finding: 'Physical Layer 1 copper link negotiates cleanly at 1 Gbps; patch cable is good.',
        revealsClue: false,
      },
    ],
    hypotheses: [
      {
        id: 'hyp-vlan',
        title: 'Switch port assigned to isolated parking VLAN without DHCP',
        summary: 'Port Gi1/0/14 is still in VLAN 999 (PARKING_BLACKHOLE), preventing DHCP Discover from reaching the DHCP server.',
        isCorrect: true,
        feedback:
          'Correct. Physical link is 1 Gbps Up, so Layer 1 is fine, but Gi1/0/14 is in VLAN 999 with no DHCP helper, causing APIPA 169.254.x.x.',
      },
      {
        id: 'hyp-bad-cable',
        title: 'Damaged Ethernet patch cable or dead wall jack',
        summary: 'Layer 1 physical connection failed at the new desk.',
        isCorrect: false,
        feedback:
          'Ruled out: Get-NetAdapter confirms Ethernet0 Status is Up at 1 Gbps.',
      },
      {
        id: 'hyp-dhcp-down',
        title: 'Corporate DHCP server crashed across the whole building',
        summary: 'Central DHCP service is offline for all users.',
        isCorrect: false,
        feedback:
          'Other desks remain unaffected and the switch port itself is parked on VLAN 999 rather than the production user VLAN.',
      },
    ],
    suggestedSolution: {
      rootCause:
        'Wall jack 3B-14 terminated on switch port Gi1/0/14, which was left in security parking VLAN 999 (no DHCP relay/routing) prior to the desk move.',
      verification:
        'Verify physical link speed (1 Gbps Up) and inspect switch port VLAN assignment before dispatching desk-side cable replacements.',
      remediationSteps: [
        'Reassign switch port Gi1/0/14 from VLAN 999 to the Production Workstation VLAN (VLAN 30).',
        'Bounce the port or run ipconfig /release && ipconfig /renew on the workstation.',
        'Verify valid 10.20.30.x IP, gateway, and internal/external connectivity.',
      ],
      commands: [
        'interface Gi1/0/14 -> switchport access vlan 30',
        'ipconfig /release && ipconfig /renew',
      ],
      prevention:
        'Include switch port VLAN provisioning in the Facilities desk-move checklist and label active ports in the patch management system.',
    },
  },
  {
    id: 'ticket-vpn-mtu',
    number: 'INC-2061',
    title: 'Remote VPN connects, but internal web portal hangs on large pages',
    category: 'VPN & Routing',
    difficulty: 'Advanced',
    estimatedTime: '10 min',
    reporter: 'Elena Vance',
    department: 'Operations',
    device: 'OPS-LT-108',
    os: 'macOS / Windows Dual-Fleet VPN Client',
    networkContext: 'Home Fiber + Corporate WireGuard/IPsec VPN Tunnel',
    symptomSummary:
      'VPN shows Connected. Small internal API calls and ping work, but the internal ERP web portal stalls indefinitely after TLS handshake.',
    userQuote:
      'VPN says connected and I can ping the ERP server, but Chrome just spins forever on "Waiting for erp.corp.internal".',
    checks: [
      {
        id: 'chk-ping-small',
        label: 'Standard ping to ERP server',
        command: 'ping -n 3 erp.corp.internal',
        output: `Pinging erp.corp.internal [10.30.2.20] with 32 bytes of data:
Reply from 10.30.2.20: bytes=32 time=28ms TTL=62
Reply from 10.30.2.20: bytes=32 time=29ms TTL=62`,
        finding: 'DNS resolution and small 32-byte packets traverse the VPN tunnel smoothly.',
        revealsClue: false,
      },
      {
        id: 'chk-ping-df',
        label: 'Path MTU test with Don’t Fragment flag',
        command: 'ping erp.corp.internal -f -l 1472',
        output: `Pinging erp.corp.internal [10.30.2.20] with 1472 bytes of data:
Request timed out.
Request timed out.

ping erp.corp.internal -f -l 1350:
Reply from 10.30.2.20: bytes=1350 time=29ms TTL=62`,
        finding: '1472-byte unfragmented frames silently drop across the VPN tunnel, whereas 1350-byte frames succeed.',
        revealsClue: true,
      },
      {
        id: 'chk-curl-tls',
        label: 'Inspect HTTPS curl handshake',
        command: 'curl -vk https://erp.corp.internal/dashboard',
        output: `* Connected to erp.corp.internal (10.30.2.20) port 443
* TLSv1.3 (OUT), TLS handshake, Client hello (1)
* TLSv1.3 (IN), TLS handshake, Server hello (2)
* Operation timed out after 30001 milliseconds receiving Server Certificate`,
        finding: 'TCP 443 connects, but large Server Certificate / payload packets fail to arrive (classic Path MTU blackhole).',
        revealsClue: true,
      },
    ],
    hypotheses: [
      {
        id: 'hyp-mtu',
        title: 'VPN Tunnel MTU Blackhole dropping full-size encrypted packets',
        summary: 'Encapsulation overhead + dropped ICMP Fragmentation Needed packets cause large TLS/HTTP frames to hang.',
        isCorrect: true,
        feedback:
          'Spot on. Small pings pass, TLS handshake stalls when the larger certificate packet is sent, and ping -f -l 1472 times out while 1350 passes.',
      },
      {
        id: 'hyp-dns-vpn',
        title: 'Split-DNS failing to resolve internal ERP hostname',
        summary: 'VPN client is not pushing internal DNS server.',
        isCorrect: false,
        feedback:
          'Ruled out: both ping and curl resolved erp.corp.internal to 10.30.2.20 immediately.',
      },
      {
        id: 'hyp-erp-down',
        title: 'ERP Nginx web service stopped listening on Port 443',
        summary: 'Application server is down.',
        isCorrect: false,
        feedback:
          'Ruled out: curl completed TCP 3-way handshake and received Server Hello before timing out on large certificate frames.',
      },
    ],
    suggestedSolution: {
      rootCause:
        'PPPoE home ISP link (MTU 1492) combined with IPsec/VPN encapsulation overhead exceeded the tunnel path MTU while intermediate firewalls dropped ICMP Type 3 Code 4 (Fragmentation Needed) packets.',
      verification:
        'Test with ping -f -l <size> (Windows) or ping -D -s <size> (macOS/Linux) to find the exact ceiling where unfragmented packets drop.',
      remediationSteps: [
        'Lower the VPN tunnel interface MTU to 1360 bytes (or enable TCP MSS clamping to 1320 on the VPN gateway).',
        'Permit ICMP Type 3 Code 4 (Packet Too Big) on firewall policies along the tunnel edge.',
        'Re-test HTTPS portal loading over VPN.',
      ],
      commands: [
        'netsh interface ipv4 set subinterface "CorpVPN" mtu=1360 store=persistent',
        'curl -I https://erp.corp.internal/dashboard',
      ],
      prevention:
        'Configure VPN profile templates to push a conservative MTU (1360) and enable TCP MSS clamping on all remote-access concentrators.',
    },
  },
];

export const NETWORK_NODES: NetworkNode[] = [
  {
    id: 'ws',
    label: 'Workstation',
    role: 'Client Endpoint',
    ip: '10.20.4.42',
    subnet: '255.255.255.0',
    vlan: 'VLAN 20',
    ports: 'NIC Eth0: 1 Gbps',
    x: 80,
    y: 170,
  },
  {
    id: 'sw',
    label: 'Access Switch',
    role: 'L2 Switching',
    ip: '10.20.4.2',
    subnet: '255.255.255.0',
    vlan: 'Trunk + VLAN 20',
    ports: 'Gi1/0/12 -> Uplink Te1/0/1',
    x: 270,
    y: 170,
  },
  {
    id: 'gw',
    label: 'Core Router',
    role: 'L3 Gateway & Firewall',
    ip: '10.20.4.1',
    subnet: 'Inter-VLAN Routing',
    vlan: 'VLAN 10 / 20 / WAN',
    ports: 'ACL: SMB 445, DNS 53, HTTPS 443',
    x: 470,
    y: 170,
  },
  {
    id: 'dns',
    label: 'Internal DNS',
    role: 'Name Resolution',
    ip: '10.20.1.10',
    subnet: '255.255.255.0',
    vlan: 'VLAN 10 (Infra)',
    ports: 'UDP/TCP 53 Listening',
    x: 680,
    y: 75,
  },
  {
    id: 'fs',
    label: 'File Server',
    role: 'SMB Storage',
    ip: '10.20.4.15',
    subnet: '255.255.255.0',
    vlan: 'VLAN 20 (Servers)',
    ports: 'TCP 445 (SMB3) Listening',
    x: 680,
    y: 175,
  },
  {
    id: 'inet',
    label: 'Internet ISP',
    role: 'External WAN',
    ip: '203.0.113.1',
    subnet: 'Public BGP',
    vlan: 'WAN Edge',
    ports: 'TCP 443 Reachable',
    x: 680,
    y: 275,
  },
];

export const NETWORK_SCENARIOS: NetworkFaultScenario[] = [
  {
    id: 'healthy',
    label: 'All Systems Nominal',
    description: 'Clean end-to-end resolution and SMB file share reachability.',
    failingHopId: null,
    targetType: 'fileserver',
    packetSummary: 'DNS Query -> 10.20.1.10 resolves fileserver01 (10.20.4.15) -> SMB TCP 445 handshake completes in 1.4ms.',
    hopDetails: [
      { hop: 'Workstation (10.20.4.42)', status: 'Nominal', latency: '0.1ms', note: 'DHCP lease valid; DNS 10.20.1.10 configured' },
      { hop: 'Access Switch (SW-FL2)', status: 'Nominal', latency: '0.3ms', note: 'Port Gi1/0/12 forwarding on VLAN 20' },
      { hop: 'Core Router (10.20.4.1)', status: 'Nominal', latency: '0.6ms', note: 'ACL permits UDP/53 and TCP/445' },
      { hop: 'Internal DNS (10.20.1.10)', status: 'Nominal', latency: '0.9ms', note: 'A Record fileserver01 -> 10.20.4.15' },
      { hop: 'File Server (10.20.4.15)', status: 'Nominal', latency: '1.4ms', note: 'SMB3 session established on \\\\Finance' },
    ],
    remediationHint: 'No fault active. Inspect any node or inject a fault condition to observe failure behavior.',
  },
  {
    id: 'dns-mismatch',
    label: 'Public DNS Override',
    description: 'Workstation uses 1.1.1.1 instead of Internal DNS; internet works, shared folder fails.',
    failingHopId: 'dns',
    targetType: 'fileserver',
    packetSummary: 'Internet HTTPS passes, but query for fileserver01.corp.internal fails NXDOMAIN at DNS stage.',
    hopDetails: [
      { hop: 'Workstation (10.20.4.42)', status: 'Nominal', latency: '0.1ms', note: 'NIC DNS overridden to 1.1.1.1' },
      { hop: 'Access Switch (SW-FL2)', status: 'Nominal', latency: '0.3ms', note: 'L2 frames forwarding normally' },
      { hop: 'Core Router (10.20.4.1)', status: 'Nominal', latency: '0.6ms', note: 'Routes WAN & LAN traffic normally' },
      { hop: 'Internal DNS (10.20.1.10)', status: 'Blocked', latency: '—', note: 'Bypassed! Public resolver returns NXDOMAIN for internal host' },
      { hop: 'File Server (10.20.4.15)', status: 'Timeout', latency: '—', note: 'Never contacted because hostname did not resolve' },
    ],
    remediationHint: 'Restore workstation DNS to internal resolver 10.20.1.10 via DHCP and run ipconfig /flushdns.',
  },
  {
    id: 'smb-acl-drop',
    label: 'Firewall Drops Port 445',
    description: 'DNS resolves correctly, but Core Router ACL blocks TCP 445 SMB traffic.',
    failingHopId: 'gw',
    targetType: 'fileserver',
    packetSummary: 'DNS resolves 10.20.4.15, then TCP SYN to Port 445 is dropped by Core Router ACL.',
    hopDetails: [
      { hop: 'Workstation (10.20.4.42)', status: 'Nominal', latency: '0.1ms', note: 'Initiates TCP SYN to 10.20.4.15:445' },
      { hop: 'Access Switch (SW-FL2)', status: 'Nominal', latency: '0.3ms', note: 'Forwards frame to uplink' },
      { hop: 'Core Router (10.20.4.1)', status: 'Blocked', latency: '—', note: 'DENY TCP any any eq 445 matched on VLAN 20 inbound ACL' },
      { hop: 'File Server (10.20.4.15)', status: 'Timeout', latency: '—', note: 'SYN packet never reaches destination socket' },
    ],
    remediationHint: 'Permit TCP Port 445 between Workstation VLAN 20 and File Server 10.20.4.15 in router/host firewall rules.',
  },
  {
    id: 'uplink-down',
    label: 'Switch Uplink Disconnected',
    description: 'Access switch uplink port is err-disabled; local link up, upstream unreachable.',
    failingHopId: 'sw',
    targetType: 'internet',
    packetSummary: 'Frame reaches Access Switch Gi1/0/12, then drops because Uplink Te1/0/1 is down.',
    hopDetails: [
      { hop: 'Workstation (10.20.4.42)', status: 'Nominal', latency: '0.1ms', note: 'NIC link light green (1 Gbps)' },
      { hop: 'Access Switch (SW-FL2)', status: 'Blocked', latency: '—', note: 'Uplink Te1/0/1 state: down (err-disabled / BPDU guard)' },
      { hop: 'Core Router (10.20.4.1)', status: 'Timeout', latency: '—', note: 'Default gateway unreachable (ARP timeout)' },
      { hop: 'Internet ISP (203.0.113.1)', status: 'Timeout', latency: '—', note: 'No upstream path' },
    ],
    remediationHint: 'Inspect switch uplink logs, clear rogue loop/cable fault, and issue shutdown / no shutdown on Te1/0/1.',
  },
];

export const WINDOWS_SCENARIOS: WindowsScenario[] = [
  {
    id: 'win-spooler',
    title: 'Print Spooler Queue Hung',
    symptom: 'Documents stay stuck in "Printing" status across all printers and new jobs fail to queue.',
    initialStatus: 'Service: Spooler = Degraded (Hung PID 4120)',
    resolvedStatus: 'Service: Spooler = Running (Nominal)',
    serviceName: 'Print Spooler (spooler)',
    expectedCommands: ['net stop spooler', 'net start spooler'],
    acceptedCommands: [
      {
        pattern: 'sc query spooler',
        output: `SERVICE_NAME: spooler
        TYPE               : 110  WIN32_OWN_PROCESS (interactive)
        STATE              : 3  STOP_PENDING
        WIN32_EXIT_CODE    : 0  (0x0)`,
        fixesIssue: false,
      },
      {
        pattern: 'net stop spooler',
        output: `The Print Spooler service is stopping...
The Print Spooler service was stopped successfully.`,
        fixesIssue: false,
      },
      {
        pattern: 'del /Q /F %systemroot%\\System32\\spool\\PRINTERS\\*',
        output: `Cleared 3 corrupted .SPL / .SHD queue files from System32\\spool\\PRINTERS.`,
        fixesIssue: false,
      },
      {
        pattern: 'net start spooler',
        output: `The Print Spooler service is starting.
The Print Spooler service was started successfully.`,
        fixesIssue: true,
      },
      {
        pattern: 'restart-service spooler',
        output: `WARNING: Waiting for service 'Print Spooler (Spooler)' to stop...
Service 'Print Spooler (Spooler)' restarted cleanly.`,
        fixesIssue: true,
      },
    ],
    hintCommands: [
      'sc query spooler',
      'net stop spooler',
      'del /Q /F %systemroot%\\System32\\spool\\PRINTERS\\*',
      'net start spooler',
    ],
    explanation:
      'Corrupted .SPL/.SHD files in C:\\Windows\\System32\\spool\\PRINTERS lock the Print Spooler service. Stopping the service, clearing stuck queue files, and restarting restores printing.',
  },
  {
    id: 'win-dnscache',
    title: 'Stale DNS Resolver Cache After Server Migration',
    symptom: 'Intranet moved to new IP 10.20.8.50, but workstation still connects to retired 10.20.8.12.',
    initialStatus: 'DNS Cache: Stale Entry (intranet.corp -> 10.20.8.12)',
    resolvedStatus: 'DNS Cache: Flushed & Updated (10.20.8.50)',
    serviceName: 'DNS Client Cache',
    expectedCommands: ['ipconfig /flushdns'],
    acceptedCommands: [
      {
        pattern: 'ipconfig /displaydns',
        output: `intranet.corp.internal
----------------------------------------
Record Name . . . . . : intranet.corp.internal
Record Type . . . . . : 1 (A)
Time To Live  . . . . : 3120
A (Host) Record . . . : 10.20.8.12`,
        fixesIssue: false,
      },
      {
        pattern: 'ipconfig /flushdns',
        output: `Windows IP Configuration

Successfully flushed the DNS Resolver Cache.`,
        fixesIssue: true,
      },
      {
        pattern: 'clear-dnsclientcache',
        output: `PowerShell: DNS Client Cache cleared successfully.`,
        fixesIssue: true,
      },
    ],
    hintCommands: ['ipconfig /displaydns', 'ipconfig /flushdns'],
    explanation:
      'Windows caches DNS A records up to their TTL. Flushing the resolver cache forces an immediate fresh query to the authoritative internal DNS server.',
  },
  {
    id: 'win-cred',
    title: 'SMB Shared Folder Rejects Updated Domain Password',
    symptom: 'User changed password, but \\\\fileserver01 prompts repeatedly with "The specified network password is not correct."',
    initialStatus: 'Credential Manager: Cached Legacy Token',
    resolvedStatus: 'Credential Manager: Cleared & Re-authenticated',
    serviceName: 'Windows Credential Manager',
    expectedCommands: ['cmdkey /delete:fileserver01'],
    acceptedCommands: [
      {
        pattern: 'cmdkey /list',
        output: `Currently stored credentials:

    Target: Domain:target=fileserver01
    Type: Domain Password
    User: CORP\\mlin`,
        fixesIssue: false,
      },
      {
        pattern: 'net use * /delete',
        output: `Deleted cached network drive mappings cleanly.`,
        fixesIssue: false,
      },
      {
        pattern: 'cmdkey /delete:fileserver01',
        output: `CMDKEY: Credential deleted successfully. Fresh Kerberos/NTLM ticket negotiated.`,
        fixesIssue: true,
      },
    ],
    hintCommands: ['cmdkey /list', 'net use * /delete', 'cmdkey /delete:fileserver01'],
    explanation:
      'Stale saved credentials in Windows Credential Manager override active Kerberos sessions and repeatedly submit the old password until deleted.',
  },
];

export const LINUX_TASKS: LinuxTask[] = [
  {
    id: 'lnx-port',
    title: 'Task 1: Identify which process is listening on TCP port 8080',
    instruction: 'Run a socket inspection command to list listening TCP/UDP ports and process names.',
    hintCommand: 'ss -tulpn',
    verifyType: 'command',
    verifyValue: 'ss',
  },
  {
    id: 'lnx-log',
    title: 'Task 2: Inspect authentication logs for failed SSH logins',
    instruction: 'Search /var/log/auth.log for failed login attempts using grep or tail.',
    hintCommand: 'grep "Failed" /var/log/auth.log',
    verifyType: 'command',
    verifyValue: 'auth.log',
  },
  {
    id: 'lnx-chmod',
    title: 'Task 3: Make the backup script executable & restart nginx',
    instruction: 'Grant execute permission to /opt/backup/run.sh and start/restart the nginx service.',
    hintCommand: 'chmod +x /opt/backup/run.sh',
    verifyType: 'file_executable',
    verifyValue: '/opt/backup/run.sh',
  },
];

export const AWARENESS_LESSONS: AwarenessLesson[] = [
  {
    id: 'week-46-phishing',
    weekLabel: 'Week 46 Briefing',
    title: 'Lookalike Domains & MFA Fatigue Attacks',
    category: 'Identity & Phishing Defense',
    readTime: '3 min interactive check',
    summary:
      'Attackers combine typosquatted SSO login domains (like rnicrosoft instead of microsoft) with repeated midnight MFA push notifications hoping a tired employee taps "Approve".',
    keyTakeaways: [
      'Always verify the exact domain right before the first single slash (/) in any login URL.',
      'Never approve an unexpected MFA push prompt—repeated prompts mean someone already has your password.',
      'Prefer phishing-resistant FIDO2/Passkey hardware keys over push notifications whenever available.',
    ],
    defenseChecklist: [
      'Hover over links to inspect the true destination host before clicking.',
      'Report unsolicited MFA prompts immediately and rotate your password.',
      'Confirm urgent account suspension notices via official internal IT bookmarks, never email links.',
    ],
    simulationType: 'email',
    senderName: 'IT Identity Operations',
    senderAddress: 'security-alert@corp-sso-verify.co',
    subject: 'URGENT: Your SSO Password Expires in 2 Hours — Confirm MFA Device',
    bodyLines: [
      'Dear Team Member,',
      'Our directory detected an unverified login attempt from Frankfurt. To prevent immediate account lock at 17:00 UTC, re-verify your corporate MFA token below.',
      'If you receive multiple push requests on your phone, tap Approve to sync your session.',
    ],
    ctaText: 'Verify Corporate SSO Now',
    ctaActualUrl: 'https://login.corp-sso-verify.co/auth/session?id=9921',
    clues: [
      {
        id: 'clue-sender',
        label: 'Sender address: security-alert@corp-sso-verify.co',
        regionLabel: 'Sender Header',
        severity: 'High Risk',
        explanation:
          'External lookalike domain (.co) impersonating internal IT. Official corporate alerts always originate from your verified primary company domain.',
      },
      {
        id: 'clue-url',
        label: 'Button destination: login.corp-sso-verify.co',
        regionLabel: 'CTA Link URL',
        severity: 'High Risk',
        explanation:
          'Credential-harvesting reverse proxy domain designed to capture your password and real-time session cookie.',
      },
      {
        id: 'clue-mfa',
        label: 'Instruction: "If you receive multiple push requests, tap Approve"',
        regionLabel: 'Body Pretext',
        severity: 'Warning',
        explanation:
          'Classic MFA fatigue social engineering. Legitimate IT teams never ask users to blindly approve unexpected push notifications.',
      },
    ],
    quizQuestion: 'You receive three unexpected MFA push prompts at 11:30 PM after clicking nothing. What is the safest immediate action?',
    quizOptions: [
      {
        id: 'opt-approve',
        label: 'Tap Approve once so the notifications stop',
        isCorrect: false,
        feedback: 'Approving grants the attacker full access because they already possess your password.',
      },
      {
        id: 'opt-deny-reset',
        label: 'Deny the prompt, change your password immediately, and notify IT Security',
        isCorrect: true,
        feedback: 'Correct. Repeated unexpected prompts prove your password is compromised and must be rotated immediately.',
      },
      {
        id: 'opt-ignore',
        label: 'Silence your phone and wait until next week',
        isCorrect: false,
        feedback: 'Leaving a compromised password active risks session hijacking or eventual accidental approval.',
      },
    ],
  },
  {
    id: 'week-45-wifi',
    weekLabel: 'Week 45 Briefing',
    title: 'Rogue Public Wi-Fi & Evil-Twin Hotspots',
    category: 'Network & Travel Security',
    readTime: '3 min interactive check',
    summary:
      'Attackers set up open Wi-Fi hotspots named "Airport_Free_Guest" or "Cafe_5G" to intercept unencrypted traffic or inject fake captive portals requesting corporate credentials.',
    keyTakeaways: [
      'Disable auto-join for open Wi-Fi networks on laptops and phones.',
      'Always connect your company VPN before opening email or internal web portals on public networks.',
      'Never enter corporate SSO passwords into a Wi-Fi captive portal login screen.',
    ],
    defenseChecklist: [
      'Use cellular tethering when handling sensitive financial or administrative operations.',
      'Reject browser TLS certificate warnings on public Wi-Fi—they indicate active traffic interception.',
      'Verify corporate VPN shows Connected before accessing shared folders or admin consoles.',
    ],
    simulationType: 'wifi',
    senderName: 'Airport Guest Captive Portal',
    senderAddress: 'portal@airport-wifi-auth.net',
    subject: 'Free High-Speed Wi-Fi — Sign In With Your Microsoft / Work Email',
    bodyLines: [
      'Welcome to Terminal Wi-Fi. To unlock 1 Gbps complimentary internet access, authenticate with your corporate Microsoft 365 email and password.',
      'Notice: Your browser showed a security certificate warning—click "Proceed anyway" to continue.',
    ],
    ctaText: 'Continue With Work Account',
    ctaActualUrl: 'http://192.168.44.1/captive-login/office365',
    clues: [
      {
        id: 'clue-work-creds',
        label: 'Requests corporate work email & password for public Wi-Fi',
        regionLabel: 'Captive Portal Form',
        severity: 'High Risk',
        explanation:
          'Public airport/hotel Wi-Fi portals never require your corporate SSO password. This is an evil-twin credential trap.',
      },
      {
        id: 'clue-cert',
        label: 'Prompts you to bypass a TLS certificate warning',
        regionLabel: 'Security Notice',
        severity: 'High Risk',
        explanation:
          'Bypassing HTTPS certificate errors allows an attacker on the local hotspot to perform Man-in-the-Middle decryption.',
      },
    ],
    quizQuestion: 'When connecting at a hotel conference, a captive portal asks for your company SSO password. What should you do?',
    quizOptions: [
      {
        id: 'opt-use-hotspot',
        label: 'Disconnect immediately and switch to your mobile hotspot or ask front desk for verified guest code',
        isCorrect: true,
        feedback: 'Correct. Never enter corporate credentials into a third-party Wi-Fi captive portal.',
      },
      {
        id: 'opt-enter-once',
        label: 'Log in once and change your password next month',
        isCorrect: false,
        feedback: 'An attacker captures both your password and session token in real time.',
      },
    ],
  },
  {
    id: 'week-44-data',
    weekLabel: 'Week 44 Briefing',
    title: 'Password Reuse & Shadow Data Exposure',
    category: 'Data Protection & Hygiene',
    readTime: '3 min interactive check',
    summary:
      'Reusing a corporate password on external websites or pasting confidential customer records into unapproved web tools exposes company data during third-party breaches.',
    keyTakeaways: [
      'Use unique, 14+ character passphrases stored in an approved password manager for every single account.',
      'Never paste client PII, API keys, or private source code into unvetted public web converters or external tools.',
      'Check if personal or work emails appear in known credential-stuffing lists.',
    ],
    defenseChecklist: [
      'Enable unique random passwords for every SaaS and vendor portal.',
      'Sanitize customer names, IPs, and tokens before sharing logs externally.',
      'Store recovery codes inside your encrypted vault, never in plain desktop text files.',
    ],
    simulationType: 'email',
    senderName: 'Vendor Forum Digest',
    senderAddress: 'no-reply@dev-snippets-exchange.org',
    subject: 'Password Reset Confirmation & Shared Config Paste',
    bodyLines: [
      'You recently uploaded production_db_credentials.env to our public formatter tool for quick JSON validation.',
      'Remember to use the same corporate password you use on HR/Payroll so your team can access this shared link.',
    ],
    ctaText: 'View Public Paste Link',
    ctaActualUrl: 'https://dev-snippets-exchange.org/raw/88412-prod-env',
    clues: [
      {
        id: 'clue-paste',
        label: 'Confidential .env credentials pasted into a public web formatter',
        regionLabel: 'Data Exposure',
        severity: 'High Risk',
        explanation:
          'Public online formatters and paste sites often index or store submitted text, exposing API keys and database secrets.',
      },
      {
        id: 'clue-reuse',
        label: 'Reusing corporate HR/Payroll password on a third-party forum',
        regionLabel: 'Credential Reuse',
        severity: 'High Risk',
        explanation:
          'When any small third-party forum suffers a breach, automated credential-stuffing bots immediately test those passwords against corporate portals.',
      },
    ],
    quizQuestion: 'You need to format a JSON file containing customer emails and internal API tokens. What is the safest approach?',
    quizOptions: [
      {
        id: 'opt-local',
        label: 'Use a local offline editor (VS Code / jq) or redact all sensitive fields first',
        isCorrect: true,
        feedback: 'Correct. Keeping sensitive data local prevents accidental third-party retention or indexing.',
      },
      {
        id: 'opt-public',
        label: 'Paste it into the top Google search result for "Online JSON Formatter"',
        isCorrect: false,
        feedback: 'Public web utilities may log or cache requests containing customer PII and secret tokens.',
      },
    ],
  },
];

export const CAREER_ROADMAP: RoadmapStage[] = [
  {
    id: 'stage-1',
    stepNumber: '01',
    title: 'Computer Fundamentals',
    focus: 'Hardware, OS Internals & File Systems',
    timeline: 'Weeks 1–3',
    description:
      'Build rock-solid intuition for how CPU, RAM, storage, BIOS/UEFI, processes, permissions, and operating systems actually work beneath the GUI.',
    coreSkills: [
      'PC hardware components, POST, UEFI boot sequence, and storage partitioning',
      'Windows Registry, Event Viewer, Task Manager, and NTFS file permissions',
      'Linux directory hierarchy (/etc, /var/log, /opt) and POSIX rwx permissions',
    ],
    essentialTools: ['Task Manager / Resource Monitor', 'Event Viewer', 'ls / chmod / df'],
    milestones: [
      { id: 'm-1-1', label: 'Trace boot sequence from UEFI firmware to OS kernel init' },
      { id: 'm-1-2', label: 'Diagnose high CPU or disk I/O bottlenecks using system monitors' },
      { id: 'm-1-3', label: 'Configure file permissions accurately on Windows NTFS and Linux chmod' },
    ],
    practiceLink: { label: 'Practice Linux Permissions in Virtual Lab', targetSection: 'lab' },
  },
  {
    id: 'stage-2',
    stepNumber: '02',
    title: 'Helpdesk & Troubleshooting',
    focus: 'Structured Triage & Tier-1 Operations',
    timeline: 'Weeks 4–6',
    description:
      'Learn how professional engineers isolate issues fast: separate symptom from root cause, reproduce reliably, test one layer at a time, and document fixes clearly.',
    coreSkills: [
      'OSI bottom-up vs top-down isolation methodology',
      'Printer spoolers, mapped network drives, browser cache, and profile corruption',
      'Clear ticket documentation: symptom, diagnostic proof, resolution, prevention',
    ],
    essentialTools: ['sc / net services', 'cmdkey', 'sfc / dism', 'Remote Support Tools'],
    milestones: [
      { id: 'm-2-1', label: 'Resolve Print Spooler and Credential Manager faults in Windows Lab' },
      { id: 'm-2-2', label: 'Complete Ticket INC-2054 (APIPA 169.254.x.x desk move)' },
      { id: 'm-2-3', label: 'Write a concise root-cause ticket summary without jargon' },
    ],
    practiceLink: { label: 'Solve Real-Life Tickets', targetSection: 'tickets' },
  },
  {
    id: 'stage-3',
    stepNumber: '03',
    title: 'Networking Core',
    focus: 'TCP/IP, DNS, DHCP, VLANs & Firewalls',
    timeline: 'Weeks 7–11',
    description:
      'Master packet flow from workstation NIC to default gateway. Understand why DNS breaks more apps than anything else and how to prove where packets drop.',
    coreSkills: [
      'IPv4 subnetting, CIDR notation, default gateways, and ARP resolution',
      'DHCP DORA handshake, APIPA fallback, and switch access vs trunk VLANs',
      'DNS record types (A, AAAA, CNAME, MX, PTR) and TCP/UDP port diagnostics',
    ],
    essentialTools: ['ipconfig / ip addr', 'nslookup / dig', 'ping / traceroute', 'ss / netstat'],
    milestones: [
      { id: 'm-3-1', label: 'Solve Ticket INC-2048 (Internet works, shared folder fails)' },
      { id: 'm-3-2', label: 'Trace blocked Port 445 and DNS failures in the Network Simulator' },
      { id: 'm-3-3', label: 'Explain why VPN MTU blackholes stall TLS handshakes' },
    ],
    practiceLink: { label: 'Open Network Topology Simulator', targetSection: 'lab' },
  },
  {
    id: 'stage-4',
    stepNumber: '04',
    title: 'System Administration',
    focus: 'Active Directory, Linux Servers & Automation',
    timeline: 'Weeks 12–16',
    description:
      'Move from fixing single laptops to managing fleets of servers, identity directories, services, scheduled jobs, and automated scripts.',
    coreSkills: [
      'Active Directory users/groups, Group Policy Objects (GPO), and Kerberos auth',
      'Linux systemd service management, journalctl/var logs, and SSH hardening',
      'PowerShell & Bash scripting for repeatable diagnostics and fleet checks',
    ],
    essentialTools: ['PowerShell', 'Bash', 'systemctl', 'grep / awk / journalctl'],
    milestones: [
      { id: 'm-4-1', label: 'Inspect listening sockets and auth logs in the Linux Lab' },
      { id: 'm-4-2', label: 'Automate a recurring service health check with PowerShell or Bash' },
      { id: 'm-4-3', label: 'Audit DNS and DHCP leases across segmented server VLANs' },
    ],
    practiceLink: { label: 'Run Linux Command Exercises', targetSection: 'lab' },
  },
  {
    id: 'stage-5',
    stepNumber: '05',
    title: 'Cloud Infrastructure',
    focus: 'Virtual Networks, IAM, Containers & Storage',
    timeline: 'Weeks 17–21',
    description:
      'Translate on-prem networking and servers into AWS/Azure/GCP: VPCs, security groups, least-privilege IAM roles, object storage, and containerized workloads.',
    coreSkills: [
      'Cloud VPCs, public vs private subnets, NAT gateways, and security groups',
      'IAM policies, roles, temporary credentials, and federated SSO',
      'Docker containers, reverse proxies (Nginx), and TLS certificate lifecycle',
    ],
    essentialTools: ['AWS / Azure CLI', 'Docker', 'Terraform basics', 'curl / openssl'],
    milestones: [
      { id: 'm-5-1', label: 'Map on-prem VLAN & firewall rules to VPC subnets and security groups' },
      { id: 'm-5-2', label: 'Troubleshoot TLS certificate chains and reverse proxy 502 errors' },
      { id: 'm-5-3', label: 'Design an IAM policy following strict least-privilege principles' },
    ],
    practiceLink: { label: 'Browse Cloud & Network Runbooks', targetSection: 'kb' },
  },
  {
    id: 'stage-6',
    stepNumber: '06',
    title: 'Cybersecurity & Defense',
    focus: 'Hardening, Threat Detection & Incident Response',
    timeline: 'Weeks 22–26',
    description:
      'Protect identities, endpoints, and networks. Spot phishing infrastructure, contain compromised sessions, harden SSH/SMB, and read security telemetry accurately.',
    coreSkills: [
      'Phishing analysis, SPF/DKIM/DMARC headers, and FIDO2 phishing-resistant MFA',
      'Endpoint hardening, disabling legacy SMBv1, and firewall egress filtering',
      'Log triage for brute-force SSH attempts, lateral movement, and privilege escalation',
    ],
    essentialTools: ['grep / auth.log triage', 'TLS & Header Analyzers', 'Vulnerability Scanners'],
    milestones: [
      { id: 'm-6-1', label: 'Complete all interactive IT Awareness threat inspections' },
      { id: 'm-6-2', label: 'Hunt failed SSH brute-force IPs inside /var/log/auth.log' },
      { id: 'm-6-3', label: 'Document an end-to-end containment checklist for compromised credentials' },
    ],
    practiceLink: { label: 'Review IT Awareness Briefings', targetSection: 'awareness' },
  },
];

export const KNOWLEDGE_BASE: KnowledgeArticle[] = [
  {
    id: 'kb-smb-0x80070035',
    title: 'Error 0x80070035: Network Path Not Found on Windows File Shares',
    category: 'Networking',
    difficulty: 'Intermediate',
    updated: 'Nov 2026',
    symptoms: [
      'Internet browsing works normally, but \\\\fileserver\\share fails after ~15 seconds.',
      'Error dialog displays 0x80070035 "The network path was not found".',
      'Direct IP path (\\\\10.20.4.15\\share) opens immediately while hostname fails.',
    ],
    possibleCauses: [
      'Workstation NIC points to external public DNS (1.1.1.1 / 8.8.8.8) instead of internal AD DNS.',
      'Missing DNS search suffix preventing short hostname resolution.',
      'Firewall or router ACL blocking TCP Port 445 (SMB) between client and server VLANs.',
    ],
    diagnosticCommands: [
      { label: 'Inspect DNS & Gateway', command: 'ipconfig /all' },
      { label: 'Verify hostname lookup', command: 'nslookup fileserver01.corp.internal' },
      { label: 'Test SMB Port 445', command: 'Test-NetConnection -ComputerName 10.20.4.15 -Port 445' },
    ],
    solutions: [
      'Set workstation IPv4 DNS back to Obtain automatically (DHCP) or internal DNS server IP.',
      'Run ipconfig /flushdns to clear negative cached lookup results.',
      'If TCP 445 fails, permit SMB traffic on host firewall and inter-VLAN ACLs.',
    ],
    prevention: [
      'Lock NIC DNS settings via Group Policy / MDM so users cannot override to public resolvers.',
      'Monitor internal DNS availability and ensure DHCP options 006 and 015 push primary/secondary resolvers.',
    ],
  },
  {
    id: 'kb-apipa-169',
    title: 'Workstation Receives 169.254.x.x APIPA Address & No Gateway',
    category: 'Networking',
    difficulty: 'Beginner',
    updated: 'Nov 2026',
    symptoms: [
      'ipconfig shows IPv4 address starting with 169.254.x.x and subnet 255.255.0.0.',
      'Default Gateway field is blank and all network traffic fails.',
      'ipconfig /renew times out unable to contact DHCP server.',
    ],
    possibleCauses: [
      'Switch access port is assigned to an isolated/wrong VLAN lacking a DHCP relay (ip helper-address).',
      'DHCP scope exhaustion on the subnet.',
      'Broken patch cable, disabled NIC, or 802.1X port authentication failure.',
    ],
    diagnosticCommands: [
      { label: 'Verify DHCP & IP state', command: 'ipconfig /all' },
      { label: 'Force DHCP renewal', command: 'ipconfig /release && ipconfig /renew' },
      { label: 'Check adapter link speed', command: 'Get-NetAdapter | Select Name, Status, LinkSpeed' },
    ],
    solutions: [
      'Confirm physical link is Up; swap patch cable if Media Disconnected.',
      'Verify the switch port belongs to the active workstation VLAN and has DHCP snooping/relay configured.',
      'Check DHCP server lease pool utilization for scope exhaustion.',
    ],
    prevention: [
      'Enable DHCP pool utilization alerts at 80% capacity.',
      'Maintain accurate wall-jack to switch-port documentation for office moves.',
    ],
  },
  {
    id: 'kb-win-spooler',
    title: 'Windows Print Queue Stuck on "Deleting" or "Printing"',
    category: 'Windows',
    difficulty: 'Beginner',
    updated: 'Oct 2026',
    symptoms: [
      'Print jobs sit frozen in queue and cannot be cancelled from the GUI.',
      'All network printers appear unresponsive on the affected endpoint.',
    ],
    possibleCauses: [
      'Corrupted .SPL or .SHD spool file inside C:\\Windows\\System32\\spool\\PRINTERS.',
      'Hung third-party printer driver thread blocking the Print Spooler service.',
    ],
    diagnosticCommands: [
      { label: 'Check spooler state', command: 'sc query spooler' },
      { label: 'Stop spooler service', command: 'net stop spooler' },
      { label: 'Purge stuck files & restart', command: 'del /Q /F %systemroot%\\System32\\spool\\PRINTERS\\* && net start spooler' },
    ],
    solutions: [
      'Stop the Print Spooler service cleanly via elevated Command Prompt.',
      'Delete all temporary files in System32\\spool\\PRINTERS (do not delete the folder itself).',
      'Start the Print Spooler service and re-submit a test print.',
    ],
    prevention: [
      'Standardize on vendor Type-4 universal print drivers.',
      'Avoid mixing legacy 32-bit drivers on shared print servers.',
    ],
  },
  {
    id: 'kb-linux-port-conflict',
    title: 'Linux Service Fails to Start: "Address Already in Use" (Port Conflict)',
    category: 'Linux',
    difficulty: 'Intermediate',
    updated: 'Nov 2026',
    symptoms: [
      'systemctl start nginx fails immediately with bind() to 0.0.0.0:80 failed (98: Address already in use).',
      'Application health checks return connection refused or serve an unexpected response.',
    ],
    possibleCauses: [
      'Another web daemon (e.g., apache2 or an orphaned node/python process) already binds to the same port.',
      'An older container or zombie worker did not release the listening socket.',
    ],
    diagnosticCommands: [
      { label: 'List listening sockets & PIDs', command: 'sudo ss -tulpn | grep :80' },
      { label: 'Inspect systemd unit logs', command: 'sudo journalctl -u nginx -n 30 --no-pager' },
      { label: 'Verify nginx configuration', command: 'sudo nginx -t' },
    ],
    solutions: [
      'Identify the conflicting PID/process using ss -tulpn.',
      'Stop and disable the unintended service (e.g., systemctl disable --now apache2) or change the listening port.',
      'Run nginx -t to validate syntax, then systemctl restart nginx.',
    ],
    prevention: [
      'Track port allocations per host in configuration management (Ansible/Terraform).',
      'Disable default Apache/HTTP services in base OS images before provisioning.',
    ],
  },
  {
    id: 'kb-vpn-mtu',
    title: 'VPN Connects & Ping Works, but HTTPS Websites Hang Indefinitely',
    category: 'Networking',
    difficulty: 'Advanced',
    updated: 'Nov 2026',
    symptoms: [
      'ICMP ping succeeds for small packets, but internal HTTPS portals stall after TCP handshake.',
      'Issue occurs primarily on home fiber/PPPoE or cellular connections while on VPN.',
    ],
    possibleCauses: [
      'VPN encapsulation overhead reduces effective path MTU below 1500 bytes.',
      'Intermediate routers/firewalls drop ICMP Type 3 Code 4 (Fragmentation Needed), breaking Path MTU Discovery.',
    ],
    diagnosticCommands: [
      { label: 'Test unfragmented 1472B frame (Win)', command: 'ping erp.corp.internal -f -l 1472' },
      { label: 'Test lower 1350B frame (Win)', command: 'ping erp.corp.internal -f -l 1350' },
      { label: 'Inspect TLS handshake stall', command: 'curl -vk https://erp.corp.internal' },
    ],
    solutions: [
      'Reduce VPN virtual adapter MTU to 1360 bytes.',
      'Enable TCP MSS clamping (1320 bytes) on the corporate VPN gateway.',
      'Allow ICMP Type 3 Code 4 packets across edge firewalls.',
    ],
    prevention: [
      'Configure conservative MTU values in managed VPN client profiles by default.',
    ],
  },
  {
    id: 'kb-ad-lockout',
    title: 'Recurring Account Lockouts Every 15 Minutes After Password Change',
    category: 'Identity & Access',
    difficulty: 'Intermediate',
    updated: 'Oct 2026',
    symptoms: [
      'User account locks out repeatedly shortly after IT unlocks it in Active Directory.',
      'Usually happens immediately following a scheduled password rotation.',
    ],
    possibleCauses: [
      'Mobile phone email client or tablet still holds the old password and retries sync.',
      'Saved Windows Credential Manager entry or mapped drive holding stale credentials.',
      'Scheduled task or background service running under the user account with an old password.',
    ],
    diagnosticCommands: [
      { label: 'Inspect Windows Credential Manager', command: 'cmdkey /list' },
      { label: 'Check AD lockout source events', command: 'Get-WinEvent -FilterHashtable @{LogName="Security";ID=4740} -MaxEvents 5' },
      { label: 'Clear mapped drives', command: 'net use * /delete /y' },
    ],
    solutions: [
      'Check Security Event ID 4740 on the PDC Emulator to pinpoint the exact Caller Computer Name.',
      'Update or remove stale entries in Windows Credential Manager and mobile mail/VPN apps.',
      'Unlock the AD account only after clearing the offending cached source.',
    ],
    prevention: [
      'Use OAuth2/modern authentication tokens instead of basic auth/NTLM on mobile devices.',
      'Never run scheduled services under personal employee accounts—use Managed Service Accounts (gMSA).',
    ],
  },
  {
    id: 'kb-mfa-fatigue',
    title: 'Responding to Suspected Credential Compromise & MFA Push Bombing',
    category: 'Security',
    difficulty: 'Intermediate',
    updated: 'Nov 2026',
    symptoms: [
      'User reports receiving repeated uninitiated MFA push notifications at odd hours.',
      'Identity logs show failed or suspicious sign-in attempts from unfamiliar ASNs or countries.',
    ],
    possibleCauses: [
      'User credentials were harvested via a lookalike phishing page or credential-stuffing breach.',
      'Attacker is scripting continuous login attempts to trigger MFA fatigue.',
    ],
    diagnosticCommands: [
      { label: 'Check Linux SSH auth failures', command: 'grep "Failed password" /var/log/auth.log | tail -n 10' },
      { label: 'Revoke active sessions (CLI concept)', command: 'az ad user revoke-sign-in-session --id user@corp.internal' },
    ],
    solutions: [
      'Immediately revoke all active refresh tokens and SSO sessions.',
      'Force a password reset and audit newly registered MFA methods for unauthorized devices.',
      'Inspect inbox forwarding rules and OAuth app consents for persistence.',
    ],
    prevention: [
      'Require number-matching MFA or FIDO2 hardware security keys instead of simple Approve/Deny pushes.',
      'Deploy conditional access policies blocking legacy authentication and high-risk IP locations.',
    ],
  },
  {
    id: 'kb-linux-disk-full',
    title: 'Linux Server "No Space Left on Device" Despite Free Gigabytes in df -h',
    category: 'Linux',
    difficulty: 'Advanced',
    updated: 'Oct 2026',
    symptoms: [
      'Applications fail to write logs or temp files with ENOSPC errors.',
      'df -h shows 40% free disk space remaining.',
    ],
    possibleCauses: [
      'Filesystem ran out of inodes (100% IUse%) due to millions of tiny session or cache files.',
      'A deleted log file is still held open by a running daemon process.',
    ],
    diagnosticCommands: [
      { label: 'Check inode exhaustion', command: 'df -ih' },
      { label: 'Find deleted open files', command: 'sudo lsof +L1' },
      { label: 'Locate high file-count directories', command: 'sudo find /var -xdev -type f | cut -d "/" -f 1-4 | sort | uniq -c | sort -nr | head' },
    ],
    solutions: [
      'If inodes are 100%, remove accumulated tiny temp/session files in the offending directory.',
      'If lsof +L1 shows deleted files held open, gracefully reload or restart the holding daemon.',
    ],
    prevention: [
      'Configure logrotate with copytruncate or postrotate service reloads.',
      'Alert on both block usage (>85%) and inode usage (>85%).',
    ],
  },
];

export interface CourseModule {
  id: string;
  title: string;
  duration: string;
}

export interface FreeCourse {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate';
  duration: string;
  category: string;
  summary: string;
  outcomes: string[];
  modules: CourseModule[];
  practiceTarget: {
    label: string;
    sectionId: string;
  };
}

export interface TechnicalSolutionDomain {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  capabilities: string[];
  checklist: string[];
  relatedSection: {
    label: string;
    sectionId: string;
  };
}

export interface DigitalResourceItem {
  id: string;
  title: string;
  format: string;
  category: string;
  summary: string;
  fileName: string;
  content: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  published: string;
  readTime: string;
  excerpt: string;
  sections: {
    heading: string;
    body: string;
  }[];
  relatedSection: {
    label: string;
    sectionId: string;
  };
}

export const FREE_COURSES: FreeCourse[] = [
  {
    id: 'course-hardware-os',
    title: 'Computer Hardware & OS Internals',
    level: 'Beginner',
    duration: '4 Weeks · Self-Paced',
    category: 'Foundations',
    summary:
      'Understand PC architecture, UEFI/BIOS boot, RAM/storage health, Windows Registry basics, and Linux filesystem permissions from first principles.',
    outcomes: [
      'Troubleshoot boot failures and disk bottlenecks systematically',
      'Inspect Windows Event Viewer logs and Linux directory permissions',
    ],
    modules: [
      { id: 'c1-m1', title: '01. CPU, Memory, NVMe & Power Delivery Architecture', duration: '35 min' },
      { id: 'c1-m2', title: '02. UEFI Firmware, Partition Tables (GPT) & Boot Flow', duration: '40 min' },
      { id: 'c1-m3', title: '03. Windows Services, Registry & Event Logs', duration: '45 min' },
      { id: 'c1-m4', title: '04. Linux File Hierarchy & POSIX rwx Permissions', duration: '45 min' },
    ],
    practiceTarget: { label: 'Practice Permissions in Virtual Lab', sectionId: 'lab' },
  },
  {
    id: 'course-networking',
    title: 'Practical Networking & TCP/IP Troubleshooting',
    level: 'Beginner',
    duration: '5 Weeks · Self-Paced',
    category: 'Networking',
    summary:
      'Follow real packets across switches, VLANs, routers, DHCP, and DNS. Learn why name resolution causes half of helpdesk tickets and how to isolate faults fast.',
    outcomes: [
      'Read IPv4 subnets, default gateways, and ARP tables cleanly',
      'Diagnose DNS NXDOMAIN, APIPA 169.254.x.x, and firewall port blocks',
    ],
    modules: [
      { id: 'c2-m1', title: '01. OSI Model Applied to Real Helpdesk Triage', duration: '30 min' },
      { id: 'c2-m2', title: '02. IPv4 Subnetting, Gateways & DHCP DORA Flow', duration: '50 min' },
      { id: 'c2-m3', title: '03. DNS Resolution, Suffixes & Split-Horizon Records', duration: '40 min' },
      { id: 'c2-m4', title: '04. Switching, VLAN Tagging & SMB Port 445 Checks', duration: '45 min' },
    ],
    practiceTarget: { label: 'Open Network Packet Simulator', sectionId: 'lab' },
  },
  {
    id: 'course-sysadmin',
    title: 'Windows & Linux Systems Administration',
    level: 'Intermediate',
    duration: '6 Weeks · Self-Paced',
    category: 'Administration',
    summary:
      'Manage enterprise endpoints, Active Directory identity sessions, systemd daemons, socket listeners, and PowerShell/Bash diagnostic workflows.',
    outcomes: [
      'Resolve Print Spooler, Credential Manager, and AD lockouts via CLI',
      'Inspect Linux ports with ss, tail logs, and manage systemd services',
    ],
    modules: [
      { id: 'c3-m1', title: '01. Active Directory, Kerberos & Group Policy Fundamentals', duration: '50 min' },
      { id: 'c3-m2', title: '02. Windows PowerShell & Service Recovery Drills', duration: '45 min' },
      { id: 'c3-m3', title: '03. Linux systemd, Journalctl & Socket Inspection (ss)', duration: '45 min' },
      { id: 'c3-m4', title: '04. Automating Health Checks with Bash & PowerShell', duration: '55 min' },
    ],
    practiceTarget: { label: 'Solve Live Incident INC-2048', sectionId: 'tickets' },
  },
  {
    id: 'course-security-cloud',
    title: 'Cybersecurity Hygiene & Cloud Foundations',
    level: 'Intermediate',
    duration: '5 Weeks · Self-Paced',
    category: 'Security & Cloud',
    summary:
      'Bridge on-premises infrastructure to cloud virtual networks, least-privilege IAM policies, phishing defense, MFA hardening, and incident triage.',
    outcomes: [
      'Spot lookalike SSO phishing domains and contain MFA fatigue attempts',
      'Map VLANs and firewalls to cloud VPC subnets and security groups',
    ],
    modules: [
      { id: 'c4-m1', title: '01. Phishing Anatomy, DNS Spoofing & Email Headers', duration: '35 min' },
      { id: 'c4-m2', title: '02. Password Managers, FIDO2 Keys & MFA Hardening', duration: '40 min' },
      { id: 'c4-m3', title: '03. Cloud VPC Networking, Subnets & Security Groups', duration: '50 min' },
      { id: 'c4-m4', title: '04. Auth Log Threat Hunting & Containment Playbooks', duration: '45 min' },
    ],
    practiceTarget: { label: 'Run IT Awareness Drills', sectionId: 'awareness' },
  },
];

export const TECHNICAL_SOLUTIONS: TechnicalSolutionDomain[] = [
  {
    id: 'sol-networking',
    title: 'Networking & Wi-Fi Architecture',
    subtitle: 'VLAN Segmentation · DNS/DHCP · VPN Reliability',
    summary:
      'Structured campus and remote connectivity built around clean VLAN isolation, redundant internal DNS resolvers, and properly clamped VPN MTU paths.',
    capabilities: [
      'Office switch port provisioning, VLAN segmentation, and PoE planning',
      'Internal Active Directory DNS & DHCP scope high-availability design',
      'Remote-access VPN split-tunneling and Path MTU blackhole prevention',
    ],
    checklist: [
      'Verify internal DNS options (006/015) across every production DHCP scope',
      'Isolate guest Wi-Fi traffic completely from internal file server subnets',
      'Document wall-jack to switch-port mappings before desk reassignments',
    ],
    relatedSection: { label: 'Test in Network Simulator', sectionId: 'lab' },
  },
  {
    id: 'sol-hardware',
    title: 'Hardware & Endpoint Engineering',
    subtitle: 'Diagnostics · Fleet Health · Peripheral Reliability',
    summary:
      'Repeatable hardware triage covering SSD SMART health, thermal throttling, docking station NIC negotiation, and enterprise printer stability.',
    capabilities: [
      'Standardized Layer-1 cable, NIC link-speed, and dock firmware checks',
      'Type-4 universal printer driver deployment and spooler recovery automation',
      'Workstation imaging, BIOS/UEFI baseline hardening, and BitLocker recovery',
    ],
    checklist: [
      'Verify 1 Gbps link negotiation before replacing Ethernet runs',
      'Purge corrupted .SPL/.SHD queue files cleanly when print jobs stall',
      'Maintain offline recovery keys in centralized endpoint management',
    ],
    relatedSection: { label: 'Practice Windows Scenarios', sectionId: 'lab' },
  },
  {
    id: 'sol-software',
    title: 'Software, OS & Automation',
    subtitle: 'Windows 11 · Ubuntu/RHEL Linux · Scripting',
    summary:
      'Reliable operating system operations using deterministic CLI runbooks, clean service dependency management, and automated fleet verification.',
    capabilities: [
      'Windows service lifecycle, Credential Manager cleanup, and SMB3 enforcement',
      'Linux systemd daemon orchestration, Nginx reverse proxies, and logrotate',
      'Cross-platform PowerShell and Bash diagnostic scripts for Tier-1 teams',
    ],
    checklist: [
      'Validate Nginx syntax (nginx -t) before reloading production proxies',
      'Monitor both disk blocks (df -h) and inode availability (df -ih)',
      'Clear stale cached credentials after scheduled user password resets',
    ],
    relatedSection: { label: 'Open Knowledge Base', sectionId: 'kb' },
  },
  {
    id: 'sol-security',
    title: 'Infrastructure & Identity Security',
    subtitle: 'Zero-Trust Access · MFA Hardening · Log Triage',
    summary:
      'Defense-in-depth safeguards protecting user credentials, SSH endpoints, file shares, and remote sessions without slowing down legitimate work.',
    capabilities: [
      'FIDO2/number-matching MFA rollout to neutralize push-bombing fatigue',
      'SSH key-only authentication, fail2ban/auth.log auditing, and SMB signing',
      'Employee phishing readiness drills and safe data-handling guidelines',
    ],
    checklist: [
      'Revoke active refresh tokens immediately upon any unexpected MFA push',
      'Disable legacy SMBv1 and anonymous share enumeration across servers',
      'Audit /var/log/auth.log regularly for repeated invalid-user SSH probes',
    ],
    relatedSection: { label: 'Review Awareness Drills', sectionId: 'awareness' },
  },
];

export const DIGITAL_RESOURCES: DigitalResourceItem[] = [
  {
    id: 'res-ports-tcpip',
    title: 'TCP/IP, Subnets & Essential Ports Quick Guide',
    format: 'Study Guide (.md)',
    category: 'Networking Reference',
    summary:
      'Printable reference sheet covering common enterprise ports (DNS 53, HTTP/S 80/443, SMB 445, SSH 22, RDP 3389), CIDR masks, and APIPA rules.',
    fileName: 'Three-Angels-TCPIP-Ports-Guide.md',
    content: `# Three Angels IT Services — TCP/IP & Essential Ports Reference

## 1. Essential Infrastructure Ports
- Port 22 (TCP): SSH — Secure Linux/Network CLI Administration
- Port 53 (UDP/TCP): DNS — Hostname to IP Resolution
- Port 67/68 (UDP): DHCP — Dynamic IP Lease Assignment (DORA)
- Port 80 (TCP): HTTP — Unencrypted Web (Redirect to 443)
- Port 443 (TCP): HTTPS — TLS-Encrypted Web & APIs
- Port 445 (TCP): SMB3 — Windows Corporate Shared Folders
- Port 3389 (TCP/UDP): RDP — Windows Remote Desktop

## 2. Quick Triage Signals
- IP starts with 169.254.x.x -> APIPA fallback (DHCP server unreachable or wrong VLAN)
- Ping by IP works, hostname fails -> DNS resolver mismatch or suffix issue
- Small ping works, HTTPS stalls over VPN -> Path MTU blackhole (test ping -f -l 1350)
`,
  },
  {
    id: 'res-cli-cheatsheet',
    title: 'Windows & Linux Diagnostic Command Sheet',
    format: 'Command Sheet (.md)',
    category: 'SysAdmin Triage',
    summary:
      'Side-by-side Windows CMD/PowerShell and Linux Bash commands for inspecting IPs, DNS lookups, open sockets, disk space, and system services.',
    fileName: 'Three-Angels-CLI-Diagnostic-Sheet.md',
    content: `# Three Angels IT Services — Windows & Linux Triage Commands

## Network & DNS
- Windows: ipconfig /all | ipconfig /flushdns | nslookup host.corp.internal
- Windows Port Test: Test-NetConnection -ComputerName 10.20.4.15 -Port 445
- Linux: ip addr | ss -tulpn | dig host.corp.internal

## Services & Logs
- Windows: sc query spooler | net stop spooler && net start spooler
- Windows Creds: cmdkey /list | cmdkey /delete:target
- Linux Services: systemctl status nginx | journalctl -u nginx -n 30
- Linux Auth Hunt: grep "Failed password" /var/log/auth.log | tail -n 10

## Storage & Permissions
- Linux Disk & Inodes: df -h && df -ih
- Linux Permissions: ls -la /opt/backup/run.sh && chmod +x /opt/backup/run.sh
`,
  },
  {
    id: 'res-security-playbook',
    title: 'Phishing & MFA Fatigue Defense Checklist',
    format: 'Security Checklist (.md)',
    category: 'Cybersecurity',
    summary:
      'Practical daily verification habits for spotting lookalike SSO domains, rejecting evil-twin public Wi-Fi portals, and responding to push bombing.',
    fileName: 'Three-Angels-Security-Awareness-Playbook.md',
    content: `# Three Angels IT Services — Security Awareness Playbook

## 1. Before Entering Any Password
1. Inspect the exact host domain immediately before the first single slash (/).
2. Never follow urgent "Password Expires in 2 Hours" email links—open your saved corporate bookmark directly.
3. Never enter work credentials into airport, cafe, or hotel Wi-Fi captive portals.

## 2. If You Receive Unexpected MFA Push Prompts
1. Tap DENY immediately—never approve a prompt you did not initiate.
2. Rotate your primary SSO password right away (an attacker already possesses it).
3. Notify IT Security to revoke active session tokens and review registered MFA devices.
`,
  },
  {
    id: 'res-ticket-framework',
    title: '5-Step Helpdesk Ticket Resolution Framework',
    format: 'Workflow Guide (.md)',
    category: 'IT Support',
    summary:
      'A repeatable engineering method for moving from vague user complaints to verified root cause, clean remediation, and permanent prevention.',
    fileName: 'Three-Angels-Ticket-Resolution-Framework.md',
    content: `# Three Angels IT Services — 5-Step Ticket Resolution Method

1. Clarify Symptom & Scope: Single user or whole department? What changed recently?
2. Isolate by Layer: Physical Link -> IP/DHCP -> DNS -> Port/Firewall -> Permissions.
3. Capture Evidence: Save exact command output (ipconfig, nslookup, ss) before making changes.
4. Apply Minimal Fix & Verify: Confirm the user can complete their real task end-to-end.
5. Document Prevention: Record root cause, exact command fix, and preventive guardrails.
`,
  },
];

export const IT_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-dns-smb',
    title: 'Why Internet Browsing Works While Your Company Shared Folder Fails',
    category: 'Networking & Windows',
    published: 'November 2026',
    readTime: '4 min read',
    excerpt:
      'One of the most common helpdesk mysteries—error 0x80070035—almost always comes down to DNS resolver overrides rather than a crashed file server.',
    sections: [
      {
        heading: 'The Misleading Symptom',
        body: 'When a user can open external websites normally, it is tempting to assume the network is healthy and blame the file server or NTFS permissions. In reality, external sites resolve via public DNS (like 1.1.1.1 or 8.8.8.8), whereas internal hostnames such as fileserver01.corp.internal only exist inside your private Active Directory DNS zone.',
      },
      {
        heading: 'Proving the Root Cause in 60 Seconds',
        body: 'Run ipconfig /all first. If you see public DNS servers instead of your internal domain controller IP, test ping against the file server IP directly and verify TCP port 445 with Test-NetConnection. When the IP succeeds and nslookup returns Non-existent domain, you have 100% proof it is a DNS configuration fault.',
      },
      {
        heading: 'Permanent Fix',
        body: 'Restore DHCP-assigned DNS on the adapter, flush the negative DNS cache with ipconfig /flushdns, and lock DNS adapter settings via Group Policy so local overrides do not recur.',
      },
    ],
    relatedSection: { label: 'Try Ticket INC-2048 Now', sectionId: 'tickets' },
  },
  {
    id: 'blog-linux-triage',
    title: 'Three Linux Commands That Solve 80% of Service Outages',
    category: 'Linux Operations',
    published: 'November 2026',
    readTime: '5 min read',
    excerpt:
      'Before rebooting a Linux server during an outage, inspect listening sockets, service journals, and inode capacity to find the true culprit.',
    sections: [
      {
        heading: '1. Inspect Listening Sockets with ss -tulpn',
        body: 'Port conflicts happen frequently when two daemons compete for port 80 or 8080. Running ss -tulpn immediately reveals which process name and PID owns every listening TCP/UDP socket.',
      },
      {
        heading: '2. Read Recent Service Logs with journalctl & grep',
        body: 'Never guess why a daemon stopped. Check systemctl status and tail the relevant unit log or /var/log/auth.log to distinguish configuration syntax errors from permission failures or brute-force probes.',
      },
      {
        heading: '3. Check Both df -h and df -ih',
        body: 'A disk can report 40% free gigabytes and still fail writes with "No space left on device" if millions of tiny session files exhaust 100% of filesystem inodes.',
      },
    ],
    relatedSection: { label: 'Practice in Linux Lab', sectionId: 'lab' },
  },
  {
    id: 'blog-mfa-fatigue',
    title: 'How Lookalike SSO Pages & MFA Fatigue Bypass Standard Passwords',
    category: 'Cybersecurity',
    published: 'October 2026',
    readTime: '4 min read',
    excerpt:
      'Why modern attackers pair reverse-proxy login clones with midnight push notifications—and how number-matching MFA and FIDO2 keys stop them cold.',
    sections: [
      {
        heading: 'Anatomy of an MFA Push Attack',
        body: 'Once credentials are captured via a typosquatted domain or reused password breach, automated scripts submit login requests repeatedly late at night. An exhausted user who taps "Approve" just to silence their phone hands over a valid authenticated session.',
      },
      {
        heading: 'Practical Team Defenses',
        body: 'Enforce number-matching MFA or hardware FIDO2 passkeys, educate staff to deny unexpected prompts immediately, and treat any uninitiated MFA alert as a confirmed password compromise requiring immediate session revocation.',
      },
    ],
    relatedSection: { label: 'Inspect Phishing Drill', sectionId: 'awareness' },
  },
];

