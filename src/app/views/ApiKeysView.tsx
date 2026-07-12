import { useState } from "react";
import { Copy, Plus, Trash2, Key, Calendar, Eye, ShieldAlert, Check } from "lucide-react";
import { toast } from "sonner";
import { ApiKey } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "../components/ui/dialog";

const INITIAL_KEYS: ApiKey[] = [
  { id: "key_1", name: "Production Ingest Hook", key: "wk_live_••••••••••••••••3a9b", created: "Jan 12, 2026", expiry: "Never", lastUsed: "4 min ago", status: "Active", scopes: ["Read", "Write", "Security"] },
  { id: "key_2", name: "Telemetry Export Daemon", key: "wk_live_••••••••••••••••7f2e", created: "Mar 30, 2026", expiry: "Sep 30, 2026", lastUsed: "3 hours ago", status: "Active", scopes: ["Read", "Analytics"] },
  { id: "key_3", name: "Stripe Billing Bridge", key: "wk_live_••••••••••••••••1c8d", created: "May 15, 2026", expiry: "Nov 15, 2026", lastUsed: "Yesterday", status: "Active", scopes: ["Billing"] }
];

export default function ApiKeysView() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [isOpen, setIsOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [expiry, setExpiry] = useState("Never");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["Read"]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, token: string) => {
    // Copy fake token
    const valToCopy = token.startsWith("wk_live") ? "wk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0" : token;
    navigator.clipboard.writeText(valToCopy);
    setCopiedId(id);
    toast.success("API key copied to clipboard");

    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  const handleRevoke = (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke the API token "${name}"? System workloads using this token will fail immediately.`)) {
      setKeys(prev => prev.map(k => k.id === id ? { ...k, status: "Revoked" as const } : k));
      toast.error(`API token "${name}" has been revoked`);
    }
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) {
      toast.error("Please provide an API token descriptor.");
      return;
    }

    const randToken = "wk_live_" + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const maskedToken = `wk_live_••••••••••••••••${randToken.slice(-4)}`;

    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: keyName,
      key: maskedToken,
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      expiry: expiry === "Never" ? "Never" : new Date(Date.now() + Number(expiry) * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      lastUsed: "Never used",
      status: "Active",
      scopes: selectedScopes
    };

    setKeys(prev => [newKey, ...prev]);
    setIsOpen(false);
    setKeyName("");
    setSelectedScopes(["Read"]);

    // Display raw token once
    toast.success(`API token "${keyName}" generated successfully`, {
      description: `Token: ${randToken}`,
      duration: 10000 // Show longer so they can read/copy it
    });
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Alert banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-[13px] text-amber-400">
        <ShieldAlert size={16} className="shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block mb-0.5">Protect your API Secrets</span>
          <span>
            API tokens provide programmatic system access. Never share them in public repositories or commit them directly. Keep tokens restricted to the narrowest functional scope required.
          </span>
        </div>
      </div>

      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-[#111318] border border-white/[0.05] rounded-xl p-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[#F8FAFC]">Active Operator Tokens</h3>
          <p className="text-[12px] text-[#64748B] mt-0.5">Developer tokens currently authenticated to make requests</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="h-8 px-3.5 flex items-center gap-1.5 text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors active:scale-95"
        >
          <Plus size={13} />
          <span>Generate API Key</span>
        </button>
      </div>

      {/* Grid records table */}
      <div className="bg-[#111318] border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.06] text-[#64748B] font-semibold bg-white/[0.01]">
                <th className="p-4">Token Name</th>
                <th className="p-4 w-[220px]">Key Secret</th>
                <th className="p-4 w-[110px]">Created</th>
                <th className="p-4 w-[110px]">Expires</th>
                <th className="p-4 w-[110px]">Last Used</th>
                <th className="p-4">Authorizations</th>
                <th className="p-4 w-[90px]">Status</th>
                <th className="p-4 w-[90px] text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] text-[#94A3B8]">
              {keys.map(k => {
                const isActive = k.status === "Active";
                return (
                  <tr key={k.id} className={`hover:bg-white/[0.008] transition-colors ${!isActive ? "opacity-50" : ""}`}>
                    <td className="p-4 font-semibold text-[#F8FAFC]">{k.name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] text-[#64748B]">{k.key}</span>
                        {isActive && (
                          <button
                            onClick={() => handleCopy(k.id, k.key)}
                            title="Copy key"
                            className="w-5.5 h-5.5 rounded hover:bg-white/[0.04] text-[#64748B] hover:text-[#94A3B8] flex items-center justify-center transition-colors"
                          >
                            {copiedId === k.id ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[12px]">{k.created}</td>
                    <td className="p-4 font-mono text-[12px]">{k.expiry}</td>
                    <td className="p-4 font-mono text-[12px]">{k.lastUsed}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {k.scopes.map(s => (
                          <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.04] text-[#94A3B8] border border-white/[0.05] font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${isActive ? "text-green-400 bg-green-500/10" : "text-slate-400 bg-slate-500/10"}`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {isActive && (
                        <button
                          onClick={() => handleRevoke(k.id, k.name)}
                          title="Revoke key"
                          className="w-6 h-6 rounded hover:bg-white/[0.04] text-[#64748B] hover:text-red-400 inline-flex items-center justify-center transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards List View */}
        <div className="lg:hidden p-4 space-y-4">
          {keys.map(k => {
            const isActive = k.status === "Active";
            return (
              <div
                key={k.id}
                className={`bg-white/[0.01] border border-white/[0.04] rounded-lg p-4 space-y-3 ${!isActive ? "opacity-50" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-[13px] font-semibold text-[#F8FAFC]">{k.name}</h4>
                    <span className="text-[11px] font-mono text-[#64748B] block mt-1">{k.key}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${isActive ? "text-green-400 bg-green-500/10" : "text-slate-400 bg-slate-500/10"}`}>
                    {k.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[12px] pt-2 border-t border-white/[0.03]">
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-medium">Created</span>
                    <span className="text-[#94A3B8]">{k.created}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-medium">Expires</span>
                    <span className="text-[#94A3B8]">{k.expiry}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-medium">Last Used</span>
                    <span className="text-[#94A3B8]">{k.lastUsed}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-medium">Scopes</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {k.scopes.map(s => (
                        <span key={s} className="px-1 py-0.2 rounded text-[9px] bg-white/[0.04] text-[#94A3B8] border border-white/[0.05]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {isActive && (
                  <div className="flex items-center gap-2 pt-2 border-t border-white/[0.03]">
                    <button
                      onClick={() => handleCopy(k.id, k.key)}
                      className="flex-1 h-8 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] rounded text-[11px] font-semibold text-[#94A3B8] flex items-center justify-center gap-1 transition-colors"
                    >
                      {copiedId === k.id ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                      <span>{copiedId === k.id ? "Copied" : "Copy Token"}</span>
                    </button>
                    <button
                      onClick={() => handleRevoke(k.id, k.name)}
                      className="h-8 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-[11px] font-semibold text-red-400 flex items-center justify-center gap-1 transition-colors"
                    >
                      <Trash2 size={11} />
                      <span>Revoke</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Generate Key Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[400px] bg-[#111318] border border-white/[0.08] text-[#F8FAFC]">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold">Generate API Access Token</DialogTitle>
            <DialogDescription className="text-[12px] text-[#64748B]">
              This token will have full read/write abilities matching checking scopes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateKey} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label htmlFor="tokenName" className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B]">Token Name</label>
              <input
                id="tokenName"
                type="text"
                required
                value={keyName}
                onChange={e => setKeyName(e.target.value)}
                placeholder="e.g. Analytics Webhook Router"
                className="w-full h-9 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 text-[13px] placeholder:text-[#64748B] focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/30 text-[#F8FAFC]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tokenExpiry" className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B]">Key Expiration</label>
              <select
                id="tokenExpiry"
                value={expiry}
                onChange={e => setExpiry(e.target.value)}
                className="w-full h-9 bg-white/[0.03] border border-white/[0.08] rounded-lg px-2 text-[13px] focus:outline-none text-[#94A3B8]"
              >
                <option value="Never">Indefinite (Never Expires)</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="365">1 Year</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B] block mb-2">Scope Permissions</span>
              <div className="grid grid-cols-2 gap-2 text-[13px]">
                {["Read", "Write", "Admin", "Billing", "Security", "Analytics"].map(s => {
                  const hasScope = selectedScopes.includes(s);
                  return (
                    <label key={s} className="flex items-center gap-2 cursor-pointer hover:text-white select-none">
                      <input
                        type="checkbox"
                        checked={hasScope}
                        onChange={() => toggleScope(s)}
                        className="accent-blue-500 cursor-pointer"
                      />
                      <span>{s}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <button
                  type="button"
                  className="h-9 px-4 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] text-[#94A3B8] text-[12px] font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </DialogClose>
              <button
                type="submit"
                className="h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-semibold rounded-lg transition-colors"
              >
                Generate Token
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
