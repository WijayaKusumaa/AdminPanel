import { useState } from "react";
import { ShieldCheck, Info, RotateCcw, Save, ShieldAlert, List, Lock, Key, Globe, Check } from "lucide-react";
import { toast } from "sonner";
import { Role } from "../types";

// Base roles
const ROLES: Role[] = ["Admin", "Editor", "Manager", "Support", "Finance", "Developer", "Viewer"];

// Permission descriptors with security threat levels
const PERMISSIONS_LIST = [
  { name: "Read", desc: "Read access to data grids and audit dashboards", threat: "Low", users: 10 },
  { name: "Write", desc: "Ability to invite users and generate resources", threat: "Medium", users: 7 },
  { name: "Edit", desc: "Modify parameters, update user roles, and adjust values", threat: "Medium", users: 7 },
  { name: "Delete", desc: "Permanently delete resources and remove operators", threat: "Critical", users: 1 },
  { name: "Billing", desc: "Read and write credit profiles, billing invoices, and plans", threat: "High", users: 2 },
  { name: "Analytics", desc: "Generate report downloads and access performance charts", threat: "Low", users: 8 },
  { name: "Security", desc: "Manage key rotation schedules and security incident alerts", threat: "Critical", users: 1 },
  { name: "API Access", desc: "Provision API keys, change developer scopes", threat: "High", users: 5 },
  { name: "Org Settings", desc: "Modify enterprise name, timezone, custom domains, and integration configurations", threat: "High", users: 1 }
];

// Initial default preset matrix
const INITIAL_MATRIX: Record<Role, Record<string, boolean>> = {
  Admin: {
    Read: true, Write: true, Edit: true, Delete: true,
    Billing: true, Analytics: true, Security: true, "API Access": true, "Org Settings": true
  },
  Manager: {
    Read: true, Write: true, Edit: true, Delete: false,
    Billing: false, Analytics: true, Security: false, "API Access": true, "Org Settings": false
  },
  Editor: {
    Read: true, Write: true, Edit: true, Delete: false,
    Billing: false, Analytics: false, Security: false, "API Access": false, "Org Settings": false
  },
  Developer: {
    Read: true, Write: true, Edit: true, Delete: false,
    Billing: false, Analytics: true, Security: false, "API Access": true, "Org Settings": false
  },
  Finance: {
    Read: true, Write: false, Edit: false, Delete: false,
    Billing: true, Analytics: true, Security: false, "API Access": false, "Org Settings": false
  },
  Support: {
    Read: true, Write: false, Edit: true, Delete: false,
    Billing: false, Analytics: false, Security: false, "API Access": false, "Org Settings": false
  },
  Viewer: {
    Read: true, Write: false, Edit: false, Delete: false,
    Billing: false, Analytics: false, Security: false, "API Access": false, "Org Settings": false
  }
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-8 rounded-full transition-colors duration-200 flex-shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${checked ? "bg-blue-600" : "bg-white/[0.12]"}`}
      style={{ height: "18px" }}
    >
      <span className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow transition-all duration-200 ${checked ? "left-[18px]" : "left-[2px]"}`} />
    </button>
  );
}

export default function PermissionsView() {
  const [activeTab, setActiveTab] = useState<"matrix" | "rules" | "policies">("matrix");
  const [matrix, setMatrix] = useState<Record<Role, Record<string, boolean>>>(INITIAL_MATRIX);
  const [hasChanges, setHasChanges] = useState(false);

  // Access rules states
  const [rulesEnabled, setRulesEnabled] = useState<Record<string, boolean>>(
    PERMISSIONS_LIST.reduce((acc, p) => ({ ...acc, [p.name]: true }), {})
  );

  // Policies states
  const [mfaMandate, setMfaMandate] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [keyRotation, setKeyRotation] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState("192.168.1.0/24\n10.0.0.0/8");

  const handleToggleMatrixCell = (role: Role, permName: string) => {
    if (role === "Admin" && permName === "Security") {
      toast.warning("For safety reasons, the Administrator must retain core Security privileges.");
      return;
    }

    setMatrix(prev => {
      const next = {
        ...prev,
        [role]: {
          ...prev[role],
          [permName]: !prev[role][permName]
        }
      };
      setHasChanges(true);
      return next;
    });
  };

  const handleToggleRule = (name: string) => {
    setRulesEnabled(prev => {
      const next = { ...prev, [name]: !prev[name] };
      setHasChanges(true);
      return next;
    });
    const action = rulesEnabled[name] ? "disabled globally" : "enabled globally";
    toast.info(`Scope permission "${name}" has been ${action}`);
  };

  const handleSaveAll = () => {
    toast.loading("Applying authorizations parameters...", { id: "perms-save-toast" });
    
    setTimeout(() => {
      toast.success("Permissions console policies updated successfully", {
        id: "perms-save-toast",
        description: "Access control variables applied across active sessions."
      });
      setHasChanges(false);
    }, 1000);
  };

  const handleResetAll = () => {
    setMatrix(INITIAL_MATRIX);
    setRulesEnabled(PERMISSIONS_LIST.reduce((acc, p) => ({ ...acc, [p.name]: true }), {}));
    setMfaMandate(true);
    setSessionTimeout("30");
    setKeyRotation(true);
    setIpWhitelist("192.168.1.0/24\n10.0.0.0/8");
    setHasChanges(false);
    toast.info("Permissions console variables reset to defaults");
  };

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat" as const,
    backgroundPosition: "right 9px center",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ── Sub Navigation Menu ──────────────────────────────────────── */}
      <div className="flex border-b border-white/[0.06] gap-5 text-[13px] select-none">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`pb-2.5 font-semibold transition-all relative outline-none ${
            activeTab === "matrix" ? "text-blue-400 font-bold" : "text-[#64748B] hover:text-[#94A3B8]"
          }`}
        >
          <span>Role Matrix</span>
          {activeTab === "matrix" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full animate-in fade-in" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`pb-2.5 font-semibold transition-all relative outline-none ${
            activeTab === "rules" ? "text-blue-400 font-bold" : "text-[#64748B] hover:text-[#94A3B8]"
          }`}
        >
          <span>Access Rules</span>
          {activeTab === "rules" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full animate-in fade-in" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("policies")}
          className={`pb-2.5 font-semibold transition-all relative outline-none ${
            activeTab === "policies" ? "text-blue-400 font-bold" : "text-[#64748B] hover:text-[#94A3B8]"
          }`}
        >
          <span>Security Policies</span>
          {activeTab === "policies" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full animate-in fade-in" />
          )}
        </button>
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────── */}
      <div className="min-h-[300px]">
        {activeTab === "matrix" && (
          <div className="space-y-6 animate-fade-in">
            {/* Informative alert box */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-[13px] text-blue-400">
              <Info size={16} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Role Authorization Inheritances</span>
                <span>
                  Changes to the matrix below define the *default* parameters for newly invited users assigned to each role. Existing operators will retain their current custom overrides.
                </span>
              </div>
            </div>

            {/* Access Grid Controller */}
            <div className="bg-[#111318] border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-[#64748B] font-semibold bg-white/[0.01]">
                      <th className="p-4 w-[160px]">System Role</th>
                      {PERMISSIONS_LIST.map(p => (
                        <th key={p.name} className="p-4 text-center select-none" title={p.desc}>
                          <span className="border-b border-dashed border-white/20 cursor-help">{p.name}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {ROLES.map((role) => (
                      <tr key={role} className="hover:bg-white/[0.008] transition-colors">
                        <td className="p-4 font-semibold text-[#F8FAFC]">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck size={13} className="text-blue-400" />
                            <span>{role} Profile</span>
                          </div>
                        </td>
                        {PERMISSIONS_LIST.map(p => {
                          const isChecked = matrix[role]?.[p.name] || false;
                          return (
                            <td key={p.name} className="p-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleMatrixCell(role, p.name)}
                                className={`w-5 h-5 rounded border flex items-center justify-center mx-auto transition-all outline-none ${
                                  isChecked
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "border-white/[0.12] hover:border-white/[0.24] hover:bg-white/[0.02]"
                                }`}
                              >
                                {isChecked && <Check size={12} strokeWidth={3} />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "rules" && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 mb-4">
                <div>
                  <h3 className="text-[14px] font-semibold text-[#F8FAFC] flex items-center gap-2">
                    <List size={14} className="text-blue-400" />
                    <span>Global Access Rules</span>
                  </h3>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Globally enable or disable specific scope checking across the cluster.</p>
                </div>
                <span className="text-[11px] text-[#64748B] font-mono">Total scopes: {PERMISSIONS_LIST.length}</span>
              </div>

              <div className="space-y-2">
                {PERMISSIONS_LIST.map(p => {
                  const isEnabled = rulesEnabled[p.name];
                  return (
                    <div
                      key={p.name}
                      className="flex items-center justify-between p-3 bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.04] rounded-lg transition-colors"
                    >
                      <div className="space-y-0.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-[#F8FAFC]">{p.name} Scope</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                            p.threat === "Critical" ? "text-red-400 border-red-500/20 bg-red-500/10" :
                            p.threat === "High" ? "text-orange-400 border-orange-500/20 bg-orange-500/10" :
                            p.threat === "Medium" ? "text-amber-400 border-amber-500/20 bg-amber-500/10" :
                            "text-green-400 border-green-500/20 bg-green-500/10"
                          }`}>
                            Threat: {p.threat}
                          </span>
                        </div>
                        <span className="text-[12px] text-[#64748B] block leading-relaxed">{p.desc}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-[11px] font-mono text-[#64748B] hidden sm:inline">{p.users} active operators</span>
                        <Toggle checked={isEnabled} onChange={() => handleToggleRule(p.name)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "policies" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* General policies inputs */}
            <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5 space-y-4">
              <h3 className="text-[14px] font-semibold text-[#F8FAFC] flex items-center gap-2 border-b border-white/[0.04] pb-3">
                <Lock size={14} className="text-amber-400" />
                <span>Console Security Constraints</span>
              </h3>
              
              <div className="space-y-3.5">
                {/* MFA Mandate */}
                <div className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-lg">
                  <div className="space-y-0.5">
                    <span className="text-[13px] font-semibold text-[#F8FAFC] block">Mandatory MFA Enrollment</span>
                    <span className="text-[11px] text-[#64748B]">Force Admins and Managers to configure MFA</span>
                  </div>
                  <Toggle checked={mfaMandate} onChange={() => { setMfaMandate(!mfaMandate); setHasChanges(true); }} />
                </div>

                {/* Session Timeout */}
                <div className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-lg">
                  <div className="space-y-0.5">
                    <span className="text-[13px] font-semibold text-[#F8FAFC] block">Inactive Lock Timeout</span>
                    <span className="text-[11px] text-[#64748B]">Auto locks inactive sessions</span>
                  </div>
                  <select
                    value={sessionTimeout}
                    onChange={e => { setSessionTimeout(e.target.value); setHasChanges(true); }}
                    style={selectStyle}
                    className="h-8 pl-3 pr-8 bg-[#181C23] border border-white/[0.08] rounded-lg text-[12px] text-[#94A3B8] focus:outline-none focus:border-blue-500/40 cursor-pointer appearance-none focus:ring-1 focus:ring-blue-500/30"
                  >
                    <option value="15">15 mins</option>
                    <option value="30">30 mins</option>
                    <option value="60">1 hour</option>
                    <option value="240">4 hours</option>
                  </select>
                </div>

                {/* Key Rotations */}
                <div className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-lg">
                  <div className="space-y-0.5">
                    <span className="text-[13px] font-semibold text-[#F8FAFC] block">Auto Token Rotation</span>
                    <span className="text-[11px] text-[#64748B]">Rotate API keys every 90 days automatically</span>
                  </div>
                  <Toggle checked={keyRotation} onChange={() => { setKeyRotation(!keyRotation); setHasChanges(true); }} />
                </div>
              </div>
            </div>

            {/* Whitelisting block */}
            <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5 flex flex-col">
              <h3 className="text-[14px] font-semibold text-[#F8FAFC] flex items-center gap-2 border-b border-white/[0.04] pb-3 mb-4">
                <Globe size={14} className="text-blue-400" />
                <span>Console CIDR IP Whitelist</span>
              </h3>
              <div className="flex-1 flex flex-col space-y-2">
                <label htmlFor="whitelistTextarea" className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B]">Allowed CIDR Subnets</label>
                <textarea
                  id="whitelistTextarea"
                  rows={5}
                  value={ipWhitelist}
                  onChange={e => { setIpWhitelist(e.target.value); setHasChanges(true); }}
                  placeholder="e.g. 192.168.1.0/24"
                  className="w-full flex-1 bg-[#181C23] border border-white/[0.08] rounded-lg p-3 text-[12px] text-[#94A3B8] font-mono focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/30 resize-none"
                />
                <span className="text-[10px] text-[#64748B] leading-relaxed">
                  Connections from subnets outside of this list will receive a 403 Forbidden payload. Leave blank to disable whitelisting.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Action Toolbar ──────────────────────────────────────────── */}
      <div className="flex justify-end items-center gap-2.5 border-t border-white/[0.04] pt-4 mt-2">
        <button
          onClick={handleResetAll}
          disabled={!hasChanges}
          className="h-9 px-4 text-[13px] font-semibold text-[#64748B] hover:text-[#94A3B8] disabled:opacity-40 hover:bg-white/[0.03] disabled:hover:bg-transparent rounded-lg flex items-center gap-1.5 transition-all border border-transparent hover:border-white/[0.05]"
        >
          <RotateCcw size={13} />
          <span>Discard changes</span>
        </button>
        <button
          onClick={handleSaveAll}
          disabled={!hasChanges}
          className="h-9 px-4 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg flex items-center gap-1.5 transition-colors disabled:cursor-not-allowed"
        >
          <Save size={13} />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}
