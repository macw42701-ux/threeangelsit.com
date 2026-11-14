import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Lock,
  Plus,
  RotateCcw,
  Server,
  ShieldCheck,
  Unlock,
  Users,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface AdUserAccount {
  id: string;
  username: string;
  displayName: string;
  ou: 'Finance' | 'Engineering' | 'IT Support' | 'Service Accounts';
  groups: string[];
  locked: boolean;
  mustChangePassword: boolean;
}

const INITIAL_AD_USERS: AdUserAccount[] = [
  {
    id: 'u-maya',
    username: 'maya.lin',
    displayName: 'Maya Lin',
    ou: 'Finance',
    groups: ['Domain Users', 'Finance-Shares-RW'],
    locked: false,
    mustChangePassword: false,
  },
  {
    id: 'u-devon',
    username: 'devon.brooks',
    displayName: 'Devon Brooks',
    ou: 'Engineering',
    groups: ['Domain Users', 'VPN-Allowed'],
    locked: true,
    mustChangePassword: false,
  },
  {
    id: 'u-elena',
    username: 'elena.vance',
    displayName: 'Elena Vance',
    ou: 'IT Support',
    groups: ['Domain Users', 'IT-Helpdesk', 'Workstation-Admins'],
    locked: false,
    mustChangePassword: false,
  },
];

const SECURITY_GROUPS = [
  'Domain Users',
  'Finance-Shares-RW',
  'IT-Helpdesk',
  'VPN-Allowed',
  'Workstation-Admins',
];

export default function ActiveDirectoryLab() {
  // Domain Join Workbench State
  const [workstationDns, setWorkstationDns] = useState<'1.1.1.1' | '10.20.1.10'>('1.1.1.1');
  const [targetDomain, setTargetDomain] = useState<string>('corp.internal');
  const [joinAdminUser, setJoinAdminUser] = useState<string>('corp\\svc-join');
  const [joinStage, setJoinStage] = useState<'workgroup' | 'pending-reboot' | 'joined'>(
    'workgroup'
  );
  const [joinError, setJoinError] = useState<string | null>(null);

  // AD Users & GPO State
  const [users, setUsers] = useState<AdUserAccount[]>(INITIAL_AD_USERS);
  const [selectedOu, setSelectedOu] = useState<string>('All');
  const [selectedUserId, setSelectedUserId] = useState<string>(INITIAL_AD_USERS[1].id);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newOu, setNewOu] = useState<AdUserAccount['ou']>('Engineering');
  const [adFeedback, setAdFeedback] = useState<string | null>(null);

  const [gpos, setGpos] = useState({
    passwordComplexity: true,
    autoMapFinanceDrive: true,
    enforceInternalDns: true,
    blockUsbStorage: false,
  });

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? users[0];

  const handleDomainJoin = (e: FormEvent) => {
    e.preventDefault();
    if (targetDomain.trim().toLowerCase() !== 'corp.internal') {
      setJoinError('Target domain must be "corp.internal" for this Active Directory forest.');
      return;
    }
    if (workstationDns !== '10.20.1.10') {
      setJoinError(
        'Domain Join Failed: An Active Directory Domain Controller (AD DC) for "corp.internal" could not be contacted. DNS SRV query (_ldap._tcp.dc._msdcs.corp.internal) failed against 1.1.1.1. Point Workstation DNS to 10.20.1.10 first.'
      );
      return;
    }
    setJoinError(null);
    setJoinStage('pending-reboot');
  };

  const handleSimulatedReboot = () => {
    setJoinStage('joined');
    setAdFeedback(
      'PC-LAB-01 restarted and joined OU=Workstations,DC=corp,DC=internal. Group Policies applied.'
    );
  };

  const handleCreateAdUser = (e: FormEvent) => {
    e.preventDefault();
    const first = newFirstName.trim();
    const last = newLastName.trim();
    if (!first || !last) {
      setAdFeedback('Enter both First Name and Last Name to create an AD account.');
      return;
    }
    const username = `${first.toLowerCase().replace(/[^a-z0-9]/g, '')}.${last
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')}`;
    const created: AdUserAccount = {
      id: `u-${Date.now()}`,
      username,
      displayName: `${first} ${last}`,
      ou: newOu,
      groups: ['Domain Users'],
      locked: false,
      mustChangePassword: true,
    };
    setUsers((prev) => [created, ...prev]);
    setSelectedUserId(created.id);
    setNewFirstName('');
    setNewLastName('');
    setAdFeedback(`Created AD user "${username}@corp.internal" inside OU=${newOu}.`);
  };

  const toggleUserLock = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, locked: !u.locked } : u))
    );
  };

  const resetUserPassword = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, locked: false, mustChangePassword: true } : u
      )
    );
    setAdFeedback('Password reset issued; account unlocked and flagged for password change at next logon.');
  };

  const toggleGroupMembership = (userId: string, groupName: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const exists = u.groups.includes(groupName);
        return {
          ...u,
          groups: exists
            ? u.groups.filter((g) => g !== groupName)
            : [...u.groups, groupName],
        };
      })
    );
  };

  const visibleUsers =
    selectedOu === 'All' ? users : users.filter((u) => u.ou === selectedOu);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-[#F8FAFC]">
            Active Directory (corp.internal), Domain Join & User Management
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Join a workstation from WORKGROUP to corp.internal, unlock accounts, manage security groups, and configure Group Policy Objects (GPO).
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setWorkstationDns('1.1.1.1');
            setJoinStage('workgroup');
            setJoinError(null);
            setUsers(INITIAL_AD_USERS);
            setAdFeedback('Active Directory forest reset to initial lab state.');
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0B1220] px-3 py-2 text-xs font-semibold text-[#CBD5E1] hover:border-cyan-400 hover:text-white cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset AD Lab
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Workstation Domain Join & GPO */}
        <div className="space-y-5 lg:col-span-5">
          <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-[#06B6D4]" />
                <h4 className="font-display text-base font-bold text-[#F8FAFC]">
                  Domain Join: PC-LAB-01
                </h4>
              </div>
              <span
                className={`text-xs font-semibold ${
                  joinStage === 'joined'
                    ? 'text-emerald-400'
                    : joinStage === 'pending-reboot'
                      ? 'text-amber-400'
                      : 'text-slate-400'
                }`}
              >
                {joinStage === 'joined'
                  ? 'Domain: corp.internal'
                  : joinStage === 'pending-reboot'
                    ? 'Reboot Required'
                    : 'WORKGROUP'}
              </span>
            </div>

            {joinStage === 'workgroup' && (
              <form onSubmit={handleDomainJoin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1]">
                    Workstation Preferred DNS Server
                  </label>
                  <select
                    value={workstationDns}
                    onChange={(e) => {
                      setWorkstationDns(e.target.value as '1.1.1.1' | '10.20.1.10');
                      setJoinError(null);
                    }}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-3 py-2 font-mono text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                  >
                    <option value="1.1.1.1">1.1.1.1 (Public DNS — Causes AD SRV Failure)</option>
                    <option value="10.20.1.10">10.20.1.10 (DC01.corp.internal AD DNS)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1]">Domain Name</label>
                    <input
                      type="text"
                      value={targetDomain}
                      onChange={(e) => setTargetDomain(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-3 py-2 font-mono text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1]">
                      Domain Join Account
                    </label>
                    <input
                      type="text"
                      value={joinAdminUser}
                      onChange={(e) => setJoinAdminUser(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-3 py-2 font-mono text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                    />
                  </div>
                </div>

                {joinError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/30 p-3 text-xs leading-relaxed text-red-200"
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{joinError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                >
                  Join PC-LAB-01 to corp.internal
                </button>
              </form>
            )}

            {joinStage === 'pending-reboot' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4 text-xs text-amber-200">
                  <strong>Welcome to the corp.internal domain.</strong> You must restart PC-LAB-01 to finish creating the computer object in Active Directory and apply GPOs.
                </div>
                <button
                  type="button"
                  onClick={handleSimulatedReboot}
                  className="w-full rounded-lg bg-[#F59E0B] px-4 py-2.5 text-xs font-semibold text-[#0B1220] hover:bg-amber-400 cursor-pointer"
                >
                  Simulate Workstation Reboot Now
                </button>
              </div>
            )}

            {joinStage === 'joined' && (
              <div className="space-y-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-xs text-emerald-200">
                <div className="flex items-center gap-2 font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Domain Membership Verified</span>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-[11px] text-emerald-100">
                  {`FQDN: PC-LAB-01.corp.internal\nDC:   \\\\DC01.corp.internal (10.20.1.10)\nOU:   OU=Workstations,DC=corp,DC=internal`}
                </pre>
              </div>
            )}
          </div>

          {/* Group Policy Objects */}
          <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <ShieldCheck className="h-4 w-4" />
              Active Directory Group Policy (GPO)
            </div>
            {(
              [
                ['passwordComplexity', 'Enforce 12-Character Password Policy'],
                ['autoMapFinanceDrive', 'Auto-Map \\\\fileserver01\\Finance (GPO Drive Map)'],
                ['enforceInternalDns', 'Lock NIC DNS to 10.20.1.10 via GPO'],
                ['blockUsbStorage', 'Block Removable USB Mass Storage'],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#0F1B2E] px-3.5 py-2.5 text-xs text-[#CBD5E1] cursor-pointer"
              >
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={gpos[key]}
                  onChange={(e) => setGpos((prev) => ({ ...prev, [key]: e.target.checked }))}
                  className="h-4 w-4 accent-[#2563EB]"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Right: Active Directory Users & Computers */}
        <div className="space-y-5 lg:col-span-7">
          <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#06B6D4]" />
                <h4 className="font-display text-base font-bold text-[#F8FAFC]">
                  Active Directory Users & Computers (corp.internal)
                </h4>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['All', 'Finance', 'Engineering', 'IT Support'].map((ou) => (
                  <button
                    key={ou}
                    type="button"
                    onClick={() => setSelectedOu(ou)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer ${
                      selectedOu === ou
                        ? 'bg-[#2563EB] text-white'
                        : 'border border-slate-700 bg-[#0F1B2E] text-slate-300 hover:text-white'
                    }`}
                  >
                    {ou}
                  </button>
                ))}
              </div>
            </div>

            {/* User List + Selected Inspector */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
              <div className="space-y-2 md:col-span-5">
                {visibleUsers.map((user) => {
                  const active = selectedUser?.id === user.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
                      className={`w-full rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                        active
                          ? 'border-[#06B6D4] bg-[#14243A]'
                          : 'border-slate-800 bg-[#0F1B2E] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#F8FAFC]">
                          {user.displayName}
                        </span>
                        <span
                          className={`text-[11px] font-semibold ${
                            user.locked ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {user.locked ? 'Locked' : 'Active'}
                        </span>
                      </div>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                        {user.username}@corp.internal · {user.ou}
                      </p>
                    </button>
                  );
                })}
              </div>

              {selectedUser && (
                <div className="space-y-4 rounded-xl border border-slate-800 bg-[#0F1B2E] p-4 md:col-span-7">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h5 className="font-display text-sm font-bold text-[#F8FAFC]">
                        {selectedUser.displayName}
                      </h5>
                      <p className="font-mono text-[11px] text-cyan-300">
                        UPN: {selectedUser.username}@corp.internal
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleUserLock(selectedUser.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#0B1220] px-2.5 py-1.5 text-[11px] font-semibold text-[#F8FAFC] hover:border-cyan-400 cursor-pointer"
                      >
                        {selectedUser.locked ? (
                          <>
                            <Unlock className="h-3 w-3 text-emerald-400" />
                            Unlock Account
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3 text-amber-400" />
                            Lock Account
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => resetUserPassword(selectedUser.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#0B1220] px-2.5 py-1.5 text-[11px] font-semibold text-cyan-300 hover:border-cyan-400 cursor-pointer"
                      >
                        <KeyRound className="h-3 w-3" />
                        Reset Password
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#CBD5E1]">
                      Security Group Memberships
                    </p>
                    <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {SECURITY_GROUPS.map((grp) => (
                        <label
                          key={grp}
                          className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0B1220] px-2.5 py-1.5 text-[11px] text-[#CBD5E1] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUser.groups.includes(grp)}
                            onChange={() => toggleGroupMembership(selectedUser.id, grp)}
                            className="h-3.5 w-3.5 accent-[#2563EB]"
                          />
                          <span className="font-mono truncate">{grp}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Password Flag:{' '}
                    <strong className="text-[#F8FAFC]">
                      {selectedUser.mustChangePassword
                        ? 'User must change password at next logon'
                        : 'Standard policy compliant'}
                    </strong>
                  </p>
                </div>
              )}
            </div>

            {/* Quick Create AD User */}
            <form
              onSubmit={handleCreateAdUser}
              className="grid grid-cols-1 gap-3 border-t border-slate-800 pt-4 sm:grid-cols-4 sm:items-end"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-300">First Name</label>
                <input
                  type="text"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  placeholder="Alex"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-2.5 py-1.5 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300">Last Name</label>
                <input
                  type="text"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  placeholder="Morgan"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-2.5 py-1.5 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300">OU</label>
                <select
                  value={newOu}
                  onChange={(e) => setNewOu(e.target.value as AdUserAccount['ou'])}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0F1B2E] px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Finance">Finance</option>
                  <option value="IT Support">IT Support</option>
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add AD User
              </button>
            </form>

            {adFeedback && (
              <div
                role="status"
                className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3.5 py-2.5 text-xs text-emerald-200"
              >
                {adFeedback}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
