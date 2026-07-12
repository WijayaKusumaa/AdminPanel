import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Download, Calendar, RefreshCw, Eye } from "lucide-react";
import { User } from "../types";
import { toast } from "sonner";

interface AnalyticsViewProps {
  users: User[];
}

export default function AnalyticsView({ users }: AnalyticsViewProps) {
  const [timeframe, setTimeframe] = useState("Past 30 Days");
  const [isExporting, setIsExporting] = useState(false);

  // 1. Role distribution data
  const roleCounts: Record<string, number> = {};
  users.forEach(u => {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
  });
  const roleChartData = Object.entries(roleCounts).map(([name, value]) => ({ name, value }));

  const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#F43F5E", "#06B6D4", "#64748B"];

  // 2. Department representation
  const deptCounts: Record<string, number> = {};
  users.forEach(u => {
    deptCounts[u.dept] = (deptCounts[u.dept] || 0) + 1;
  });
  const deptChartData = Object.entries(deptCounts).map(([name, value]) => ({ name, count: value }));

  // 3. Simulated geographic data
  const geoData = [
    { country: "United States 🇺🇸", users: 48, percentage: "41.7%", avgLatency: "14ms" },
    { country: "United Kingdom 🇬🇧", users: 22, percentage: "19.1%", avgLatency: "24ms" },
    { country: "Germany 🇩🇪", users: 16, percentage: "13.9%", avgLatency: "28ms" },
    { country: "South Korea 🇰🇷", users: 12, percentage: "10.4%", avgLatency: "38ms" },
    { country: "France 🇫🇷", users: 9, percentage: "7.8%", avgLatency: "26ms" },
    { country: "Canada 🇨🇦", users: 8, percentage: "7.1%", avgLatency: "18ms" }
  ];

  // MFA Status Adoption
  const mfaOn = users.filter(u => u.mfa).length;
  const mfaOff = users.length - mfaOn;
  const mfaChartData = [
    { name: "MFA Enrolled", value: mfaOn },
    { name: "MFA Disabled", value: mfaOff }
  ];
  const MFA_COLORS = ["#10B981", "#EF4444"];

  const handleExportReport = () => {
    setIsExporting(true);
    toast.loading("Compiling system report data...", { id: "report-toast" });

    setTimeout(() => {
      toast.success("Security & analytics report downloaded successfully", {
        id: "report-toast",
        description: "PDF report has been saved to your downloads."
      });
      setIsExporting(false);
    }, 1500);
  };

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat" as const,
    backgroundPosition: "right 9px center",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#111318] border border-white/[0.05] rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-[#64748B]" />
          <span className="text-[13px] text-[#94A3B8]">Date Filter Profile</span>
          <select
            value={timeframe}
            onChange={e => setTimeframe(e.target.value)}
            style={selectStyle}
            className="h-8 pl-3 pr-8 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg text-[13px] text-[#F8FAFC] focus:outline-none focus:border-blue-500/40 cursor-pointer appearance-none transition-all"
          >
            <option value="Past 24 Hours">Past 24 Hours</option>
            <option value="Past 7 Days">Past 7 Days</option>
            <option value="Past 30 Days">Past 30 Days</option>
            <option value="Past 12 Months">Past 12 Months</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Syncing metrics...", { duration: 1000 })}
            className="h-8 w-8 flex items-center justify-center text-[#64748B] hover:text-[#94A3B8] bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] rounded-lg transition-colors"
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className="h-8 px-3.5 flex items-center gap-1.5 text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors active:scale-[0.98]"
          >
            <Download size={13} />
            <span>{isExporting ? "Exporting..." : "Generate PDF Report"}</span>
          </button>
        </div>
      </div>

      {/* Grid of graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department breakdown */}
        <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5 flex flex-col">
          <h3 className="text-[14px] font-semibold text-[#F8FAFC] mb-1">Accounts by Department</h3>
          <p className="text-[12px] text-[#64748B] mb-5">Number of users assigned to organization units</p>
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#181C23", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                  labelStyle={{ color: "#F8FAFC", fontSize: "11px", fontWeight: "bold" }}
                  itemStyle={{ fontSize: "12px", color: "#94A3B8" }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={30}>
                  {deptChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role breakdown */}
        <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5 flex flex-col">
          <h3 className="text-[14px] font-semibold text-[#F8FAFC] mb-1">Role Allocation Profile</h3>
          <p className="text-[12px] text-[#64748B] mb-4">Hierarchical role authorization distribution</p>
          <div className="h-[230px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleChartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {roleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#181C23", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                  itemStyle={{ fontSize: "12px", color: "#F8FAFC" }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", color: "#94A3B8" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MFA Adoption */}
        <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5 flex flex-col">
          <h3 className="text-[14px] font-semibold text-[#F8FAFC] mb-1">Multi-Factor Authentication (MFA) Status</h3>
          <p className="text-[12px] text-[#64748B] mb-4">Adoption rate of MFA credentials among accounts</p>
          <div className="h-[230px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mfaChartData}
                  cx="50%"
                  cy="45%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  dataKey="value"
                  labelLine={false}
                  style={{ fontSize: "10px", fill: "#94A3B8" }}
                >
                  {mfaChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MFA_COLORS[index % MFA_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#181C23", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                  itemStyle={{ fontSize: "12px", color: "#F8FAFC" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographic location and network latency table */}
        <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5 flex flex-col">
          <h3 className="text-[14px] font-semibold text-[#F8FAFC] mb-1">Geographic Activity & Latency</h3>
          <p className="text-[12px] text-[#64748B] mb-4">Regional routing load and server latency analytics</p>
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-white/[0.05] text-[#64748B] font-medium">
                  <th className="py-2 font-semibold">Location</th>
                  <th className="py-2 text-right font-semibold">Active Users</th>
                  <th className="py-2 text-right font-semibold">Load Ratio</th>
                  <th className="py-2 text-right font-semibold">Ping Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02] text-[#94A3B8]">
                {geoData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01]">
                    <td className="py-2.5 text-[#F8FAFC] font-medium">{item.country}</td>
                    <td className="py-2.5 text-right font-mono">{item.users}</td>
                    <td className="py-2.5 text-right">{item.percentage}</td>
                    <td className="py-2.5 text-right text-emerald-400 font-mono">{item.avgLatency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
