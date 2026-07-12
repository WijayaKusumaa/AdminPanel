import { useState } from "react";
import { Search, Filter, Download, Eye, X, ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { AuditLog } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "../components/ui/dialog";

interface AuditLogsViewProps {
  auditLogs: AuditLog[];
}

export default function AuditLogsView({ auditLogs }: AuditLogsViewProps) {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All Risks");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter(log => {
    const q = search.toLowerCase();
    const matchesSearch = log.action.toLowerCase().includes(q) ||
                          log.ip.toLowerCase().includes(q) ||
                          log.location.toLowerCase().includes(q) ||
                          log.browser.toLowerCase().includes(q) ||
                          log.device.toLowerCase().includes(q);
    const matchesRisk = riskFilter === "All Risks" || log.risk === riskFilter;

    return matchesSearch && matchesRisk;
  });

  const handleExportJSON = () => {
    toast.success("Security logs exported as raw JSON document");
  };

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat" as const,
    backgroundPosition: "right 9px center",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters and export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#111318] border border-white/[0.05] rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search audit trail..."
              className="w-[220px] h-8 bg-white/[0.03] border border-white/[0.08] rounded-lg pl-8 pr-3 text-[13px] text-[#94A3B8] placeholder:text-[#64748B] focus:outline-none focus:border-blue-500/40 transition-all focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            style={selectStyle}
            className="h-8 pl-3 pr-8 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg text-[13px] text-[#94A3B8] focus:outline-none focus:border-blue-500/40 cursor-pointer appearance-none transition-all focus:ring-1 focus:ring-blue-500/30"
          >
            <option value="All Risks">All Risk Levels</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <button
          onClick={handleExportJSON}
          className="h-8 px-3.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#94A3B8] hover:text-white bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] rounded-lg transition-colors"
        >
          <Download size={13} />
          <span>Export Logs JSON</span>
        </button>
      </div>

      {/* Grid container */}
      <div className="bg-[#111318] border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
        
        {/* Desktop View Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.06] text-[#64748B] font-semibold uppercase tracking-wider bg-white/[0.01]">
                <th className="p-4 w-[90px]">Time</th>
                <th className="p-4 w-[130px]">IP Address</th>
                <th className="p-4 w-[110px]">Browser</th>
                <th className="p-4 w-[120px]">Device</th>
                <th className="p-4 w-[130px]">Location</th>
                <th className="p-4">Action Event</th>
                <th className="p-4 w-[90px]">Risk</th>
                <th className="p-4 w-[90px]">Status</th>
                <th className="p-4 w-[40px]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] text-[#94A3B8]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#64748B] text-[13px]">No audit logs match current filters</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/[0.01] transition-colors cursor-pointer" onClick={() => setSelectedLog(log)}>
                    <td className="p-4 font-mono text-[12px] text-[#64748B]">{log.time}</td>
                    <td className="p-4 font-mono text-[12px]">{log.ip}</td>
                    <td className="p-4 text-[12px]">{log.browser}</td>
                    <td className="p-4 text-[12px]">{log.device}</td>
                    <td className="p-4 text-[12px] flex items-center gap-1.5">
                      <span>{log.location.split(" ")[0]}</span>
                      <span>{log.location.split(" ").slice(1).join(" ")}</span>
                    </td>
                    <td className="p-4 text-[#F8FAFC] text-[13px] font-medium">{log.action}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        log.risk === "Critical" ? "text-red-400 bg-red-500/10 border-red-500/20" :
                        log.risk === "High"     ? "text-orange-400 bg-orange-500/10 border-orange-500/20" :
                        log.risk === "Medium"   ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                        "text-green-400 bg-green-500/10 border-green-500/20"
                      }`}>{log.risk}</span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 text-[12px] font-medium ${
                        log.severity === "success" ? "text-green-400" :
                        log.severity === "warning" ? "text-amber-400" :
                        "text-red-400"
                      }`}>
                        {log.severity === "success" && <><CheckCircle size={11} /> OK</>}
                        {log.severity === "warning" && <><AlertTriangle size={11} /> WARN</>}
                        {log.severity === "critical" && <><ShieldAlert size={11} /> CRIT</>}
                      </span>
                    </td>
                    <td className="p-4" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.04] text-[#64748B] hover:text-[#94A3B8]"
                      >
                        <Eye size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="lg:hidden p-4 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-[#64748B] text-[13px]">No audit logs match current filters</div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.02] rounded-lg p-4 space-y-2.5 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-[13px] font-semibold text-[#F8FAFC]">{log.action}</h4>
                  <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-semibold ${
                    log.risk === "Critical" ? "text-red-400 bg-red-500/10" :
                    log.risk === "High" ? "text-orange-400 bg-orange-500/10" :
                    "text-green-400 bg-green-500/10"
                  }`}>
                    {log.risk}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11.5px] text-[#94A3B8] border-t border-white/[0.03] pt-2">
                  <div>
                    <span className="text-[#64748B] block text-[9.5px] uppercase font-medium">Timestamp</span>
                    <span className="font-mono">{log.time}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[9.5px] uppercase font-medium">IP Address</span>
                    <span className="font-mono">{log.ip}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[9.5px] uppercase font-medium">Geo Location</span>
                    <span>{log.location}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[9.5px] uppercase font-medium">Device & Client</span>
                    <span className="truncate block">{log.device} · {log.browser}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Log Details Modal */}
      <Dialog open={selectedLog !== null} onOpenChange={o => !o && setSelectedLog(null)}>
        {selectedLog && (
          <DialogContent className="max-w-[450px] bg-[#111318] border border-white/[0.08] text-[#F8FAFC]">
            <DialogHeader>
              <DialogTitle className="text-[15px] font-bold">Audit Event Inspection</DialogTitle>
              <DialogDescription className="text-[12px] text-[#64748B]">
                Metadata log details for security correlation verification.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-[12px] text-[#94A3B8]">
              <div className="grid grid-cols-2 gap-4 bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg">
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Event Timestamp</span>
                  <span className="font-mono text-[#F8FAFC]">{selectedLog.time}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Risk Priority</span>
                  <span className={`font-semibold ${selectedLog.risk === "Critical" || selectedLog.risk === "High" ? "text-red-400" : "text-green-400"}`}>
                    {selectedLog.risk} Rating
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-b border-white/[0.04] pb-3">
                <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Executed Action</span>
                <span className="text-[13px] font-semibold text-[#F8FAFC] block">{selectedLog.action}</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5 border-b border-white/[0.04] pb-3">
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-semibold">IP Address Routing</span>
                  <span className="font-mono text-blue-400">{selectedLog.ip}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Geographic Location</span>
                  <span>{selectedLog.location}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Device Platform</span>
                  <span>{selectedLog.device}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Browser Client</span>
                  <span>{selectedLog.browser}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[#64748B] block text-[10px] uppercase font-semibold">User Agent Payload</span>
                <span className="font-mono text-[10.5px] bg-black/40 p-2.5 rounded-lg border border-white/[0.03] block text-slate-400 break-all leading-normal">
                  Mozilla/5.0 ({selectedLog.device}; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) {selectedLog.browser} Safari/537.36
                </span>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <button className="h-8.5 px-4 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] text-[#94A3B8] hover:text-white text-[12px] font-semibold rounded-lg transition-colors">
                  Close Audit Event
                </button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
