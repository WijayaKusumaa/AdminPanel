import React, { memo } from "react";
import { ArrowUpRight, ArrowDownRight, UserPlus, FileText, Key, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { User, AuditLog } from "../types";

// Sparkline helper
function Sparkline({ data, color, uid }: { data: number[]; color: string; uid: string }) {
  const W = 80; const H = 30;
  const max = Math.max(...data); const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * H * 0.8 + H * 0.1,
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const fillPath = `${linePath} L${W},${H} L0,${H} Z`;
  const gradId = `dash-sg-${uid}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }} className="opacity-80">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

interface DashboardProps {
  users: User[];
  auditLogs: AuditLog[];
  onNavigate: (tab: string) => void;
  onInviteUser: () => void;
  onGenerateApiKey: () => void;
}

const DashboardView = memo(function DashboardView({ users, auditLogs, onNavigate, onInviteUser, onGenerateApiKey }: DashboardProps) {
  // Compute metrics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "Active").length;
  const activeSessions = Math.round(activeUsers * 1.34) + 12; // simulated dynamic active session metrics
  const mfaEnabled = users.filter(u => u.mfa).length;
  const mfaPercentage = totalUsers > 0 ? Math.round((mfaEnabled / totalUsers) * 100) : 0;
  const activeAlerts = auditLogs.filter(log => log.risk === "Critical" || log.risk === "High").length;

  const KPI_DATA = [
    {
      label: "Total Accounts",
      value: totalUsers,
      change: "+12.5%",
      positive: true,
      sub: "vs last 30 days",
      sparkData: [45, 52, 60, 58, 68, 79, totalUsers],
      color: "#3B82F6"
    },
    {
      label: "Active Sessions",
      value: activeSessions,
      change: "+4.9%",
      positive: true,
      sub: "live right now",
      sparkData: [98, 105, 112, 120, 115, 122, activeSessions],
      color: "#22C55E"
    },
    {
      label: "MFA Enrollment",
      value: `${mfaPercentage}%`,
      change: mfaPercentage > 75 ? "Excellent" : "Attn.",
      positive: mfaPercentage > 75,
      sub: `${mfaEnabled} of ${totalUsers} users`,
      sparkData: [62, 64, 68, 70, 72, 75, mfaPercentage],
      color: "#F59E0B"
    },
    {
      label: "Security Incidents",
      value: activeAlerts,
      change: activeAlerts === 0 ? "0 Risk" : `${activeAlerts} Alerts`,
      positive: activeAlerts === 0,
      sub: "past 24 hours",
      sparkData: [3, 2, 1, 2, 0, 1, activeAlerts],
      color: activeAlerts === 0 ? "#10B981" : "#EF4444"
    }
  ];

  // Recharts simulation data
  const chartData = [
    { name: "Mon", sessions: 840, signups: 12 },
    { name: "Tue", sessions: 920, signups: 15 },
    { name: "Wed", sessions: 890, signups: 8 },
    { name: "Thu", sessions: 1100, signups: 22 },
    { name: "Fri", sessions: 1250, signups: 28 },
    { name: "Sat", sessions: 1050, signups: 10 },
    { name: "Sun", sessions: activeSessions, signups: 14 }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi, i) => (
          <div
            key={i}
            className={`bg-[#111318] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-default group animate-scale-in opacity-0 stagger-${Math.min(i + 1, 5)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#64748B] tracking-wider uppercase">{kpi.label}</span>
              <Sparkline data={kpi.sparkData} color={kpi.color} uid={`dash-${i}`} />
            </div>
            <div className="text-[28px] font-bold text-[#F8FAFC] tracking-tight leading-none mb-2 group-hover:text-white transition-colors">{kpi.value}</div>
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-0.5 text-[12px] font-medium ${kpi.positive ? "text-green-400" : "text-amber-400"}`}>
                {kpi.positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {kpi.change}
              </span>
              <span className="text-[12px] text-[#64748B]">{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart + Right Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharts active sessions */}
        <div className="lg:col-span-8 bg-[#111318] border border-white/[0.06] rounded-xl p-5 flex flex-col animate-slide-up opacity-0 stagger-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[15px] font-semibold text-[#F8FAFC]">System Traffic & Signups</h3>
              <p className="text-[12px] text-[#64748B]">Overview of hourly server requests and weekly member invitations</p>
            </div>
            <div className="flex items-center gap-4 text-[12px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[#94A3B8]">Active Sessions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[#94A3B8]">Signups</span>
              </div>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#181C23", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                  labelStyle={{ color: "#F8FAFC", fontSize: "11px", fontWeight: "bold" }}
                  itemStyle={{ fontSize: "12px", padding: "2px 0" }}
                />
                <Area type="monotone" dataKey="sessions" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorSessions)" />
                <Area type="monotone" dataKey="signups" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorSignups)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick action shortcuts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Shortcuts */}
          <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5 animate-slide-up opacity-0 stagger-3">
            <h3 className="text-[14px] font-semibold text-[#F8FAFC] mb-3">Operator Actions</h3>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={onInviteUser}
                className="w-full h-9 flex items-center justify-between px-3 text-[12px] text-[#94A3B8] hover:text-white bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] rounded-lg hover:bg-white/[0.04] transition-all group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <UserPlus size={14} className="text-blue-400" />
                  <span>Invite new operator</span>
                </div>
                <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-1" />
              </button>
              <button
                onClick={onGenerateApiKey}
                className="w-full h-9 flex items-center justify-between px-3 text-[12px] text-[#94A3B8] hover:text-white bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] rounded-lg hover:bg-white/[0.04] transition-all group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <Key size={14} className="text-amber-400" />
                  <span>Generate active API token</span>
                </div>
                <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-1" />
              </button>
              <button
                onClick={() => onNavigate("Audit Logs")}
                className="w-full h-9 flex items-center justify-between px-3 text-[12px] text-[#94A3B8] hover:text-white bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] rounded-lg hover:bg-white/[0.04] transition-all group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-purple-400" />
                  <span>Inspect full audit trails</span>
                </div>
                <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-1" />
              </button>
              <button
                onClick={() => onNavigate("Permissions")}
                className="w-full h-9 flex items-center justify-between px-3 text-[12px] text-[#94A3B8] hover:text-white bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] rounded-lg hover:bg-white/[0.04] transition-all group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-green-400" />
                  <span>Modify global security matrix</span>
                </div>
                <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-1" />
              </button>
            </div>
          </div>

          {/* System Services latency list */}
          <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5 animate-slide-up opacity-0 stagger-4">
            <h3 className="text-[14px] font-semibold text-[#F8FAFC] mb-3">Service Health Indicators</h3>
            <div className="space-y-2.5">
              {[
                { name: "Identity & RBAC Core", latency: "14ms", status: "Operational" },
                { name: "Console UI Gateway", latency: "8ms", status: "Operational" },
                { name: "PostgreSQL Database", latency: "22ms", status: "Operational" },
                { name: "Audit Trail Ingest Node", latency: "185ms", status: "Slowdown" }
              ].map((serv, idx) => (
                <div key={idx} className="flex items-center justify-between text-[12px] border-b border-white/[0.02] last:border-0 pb-2 last:pb-0">
                  <span className="text-[#94A3B8] font-medium">{serv.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#64748B]">{serv.latency}</span>
                    {serv.status === "Operational" ? (
                      <span className="flex items-center gap-1 text-[11px] text-green-400 font-medium">
                        <CheckCircle size={10} /> Live
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                        <AlertTriangle size={10} /> Warn
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section: Audit logs overview & Team info */}
      <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5 animate-slide-up opacity-0 stagger-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-[#F8FAFC]">Critical Audit Logs Summary</h3>
            <p className="text-[12px] text-[#64748B]">Recent actions requiring administrative awareness</p>
          </div>
          <button
            onClick={() => onNavigate("Audit Logs")}
            className="text-[12px] text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline transition-all"
          >
            <span>View all logs</span>
            <ArrowRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-white/[0.06] text-[#64748B] font-medium uppercase tracking-wider">
                <th className="py-2.5">Time</th>
                <th className="py-2.5">IP Address</th>
                <th className="py-2.5">Location</th>
                <th className="py-2.5">Action</th>
                <th className="py-2.5">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] text-[#94A3B8]">
              {auditLogs.slice(0, 3).map(log => (
                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-3 font-mono">{log.time}</td>
                  <td className="py-3 font-mono">{log.ip}</td>
                  <td className="py-3 flex items-center gap-1">
                    <span>{log.location.split(" ")[0]}</span>
                    <span>{log.location.split(" ").slice(1).join(" ")}</span>
                  </td>
                  <td className="py-3 text-[#F8FAFC]">{log.action}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      log.risk === "Critical" ? "text-red-400 bg-red-500/10" :
                      log.risk === "High" ? "text-orange-400 bg-orange-500/10" :
                      "text-amber-400 bg-amber-500/10"
                    }`}>
                      {log.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default DashboardView;
