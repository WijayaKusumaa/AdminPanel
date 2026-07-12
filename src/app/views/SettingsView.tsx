import { useState } from "react";
import { Save, Lock, Globe, Bell, Shield, Info } from "lucide-react";
import { toast } from "sonner";

export default function SettingsView() {
  const [orgName, setOrgName] = useState("Acme Corporation");
  const [domain, setDomain] = useState("acme.com");
  const [timeout, setTimeoutVal] = useState("60");
  const [forceMfa, setForceMfa] = useState(true);
  const [notifySlack, setNotifySlack] = useState(false);
  const [slackUrl, setSlackUrl] = useState("https://hooks.slack.com/services/wk/...");
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    toast.loading("Applying configuration parameters...", { id: "settings-toast" });

    setTimeout(() => {
      toast.success("Organization settings saved successfully", { id: "settings-toast" });
      setSaving(false);
    }, 1000);
  };

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat" as const,
    backgroundPosition: "right 9px center",
  };

  return (
    <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl animate-fade-in">
      {/* 1. Organization details */}
      <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5 space-y-4">
        <h3 className="text-[14px] font-semibold text-[#F8FAFC] flex items-center gap-2 border-b border-white/[0.04] pb-3">
          <Globe size={15} className="text-blue-400" />
          <span>Organization Profile</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="orgNameInput" className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B]">Organization Name</label>
            <input
              id="orgNameInput"
              type="text"
              required
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              className="w-full h-9 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 text-[13px] text-[#F8FAFC] focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="domainInput" className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B]">Primary Web Domain</label>
            <input
              id="domainInput"
              type="text"
              required
              value={domain}
              onChange={e => setDomain(e.target.value)}
              className="w-full h-9 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 text-[13px] text-[#F8FAFC] focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
        </div>
      </div>

      {/* 2. Security Parameters */}
      <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5 space-y-4">
        <h3 className="text-[14px] font-semibold text-[#F8FAFC] flex items-center gap-2 border-b border-white/[0.04] pb-3">
          <Lock size={15} className="text-amber-400" />
          <span>Console Security Guidelines</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="timeoutSelect" className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B]">Inactive Session Expiry</label>
            <select
              id="timeoutSelect"
              value={timeout}
              onChange={e => setTimeoutVal(e.target.value)}
              style={selectStyle}
              className="w-full h-9 pl-3 pr-8 bg-white/[0.03] border border-white/[0.08] rounded-lg text-[13px] text-[#94A3B8] focus:outline-none focus:border-blue-500/40 cursor-pointer appearance-none focus:ring-1 focus:ring-blue-500/30"
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
              <option value="240">4 Hours</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-lg">
            <div className="space-y-0.5">
              <span className="text-[13px] font-semibold text-[#F8FAFC] block">Mandatory MFA Enrollment</span>
              <span className="text-[11px] text-[#64748B]">Requires MFA to sign into console admin panel</span>
            </div>
            <button
              type="button"
              onClick={() => setForceMfa(!forceMfa)}
              className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${forceMfa ? "bg-blue-600" : "bg-white/[0.12]"}`}
            >
              <span className={`absolute top-[3px] w-[14px] h-[14px] bg-white rounded-full transition-all duration-200 ${forceMfa ? "left-[19px]" : "left-[3px]"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Notifications/Slack Integration */}
      <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5 space-y-4">
        <h3 className="text-[14px] font-semibold text-[#F8FAFC] flex items-center gap-2 border-b border-white/[0.04] pb-3">
          <Bell size={15} className="text-purple-400" />
          <span>Webhook Dispatchers</span>
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-lg">
            <div className="space-y-0.5">
              <span className="text-[13px] font-semibold text-[#F8FAFC] block">Slack Security Alerting Channel</span>
              <span className="text-[11px] text-[#64748B]">Forward critical risk logs directly into workspace channels</span>
            </div>
            <button
              type="button"
              onClick={() => setNotifySlack(!notifySlack)}
              className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${notifySlack ? "bg-blue-600" : "bg-white/[0.12]"}`}
            >
              <span className={`absolute top-[3px] w-[14px] h-[14px] bg-white rounded-full transition-all duration-200 ${notifySlack ? "left-[19px]" : "left-[3px]"}`} />
            </button>
          </div>

          {notifySlack && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-150">
              <label htmlFor="slackUrlInput" className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B]">Slack Webhook Endpoint</label>
              <input
                id="slackUrlInput"
                type="url"
                required
                value={slackUrl}
                onChange={e => setSlackUrl(e.target.value)}
                className="w-full h-9 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 text-[13px] text-[#F8FAFC] focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/30 font-mono"
              />
            </div>
          )}
        </div>
      </div>

      {/* Form Submit bar */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="h-9 px-5 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Save size={13} />
          <span>{saving ? "Saving Changes..." : "Apply Configurations"}</span>
        </button>
      </div>
    </form>
  );
}
