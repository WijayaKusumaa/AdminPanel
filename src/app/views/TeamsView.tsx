import { useState } from "react";
import { Users, UserPlus, Search, ArrowUpRight, Shield, Target, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Team } from "../types";

const INITIAL_TEAMS: Team[] = [
  { id: 1, name: "Core Engineering", code: "ENG-CORE", description: "Main systems, database management, backend APIs, architecture guidelines.", lead: "Wijaya Kusuma", membersCount: 14, color: "#3B82F6" },
  { id: 2, name: "Product Design", code: "DSN-PROD", description: "Design systems, UI components library, user research, wireframes validation.", lead: "Emma Johnson", membersCount: 6, color: "#8B5CF6" },
  { id: 3, name: "Customer Support Team", code: "SPT-CUST", description: "Customer satisfaction, technical assistance, service SLAs management.", lead: "Farida Rachmawati", membersCount: 8, color: "#F59E0B" },
  { id: 4, name: "Global Finance Unit", code: "FIN-GLOB", description: "Enterprise billing, accounts reconciliations, payrolls & legal audits.", lead: "Daniel Kim", membersCount: 4, color: "#F43F5E" },
  { id: 5, name: "Growth & Product", code: "PRD-GROW", description: "Telemetry analysis, funnel experiments, features planning & release notes.", lead: "Michael Ross", membersCount: 7, color: "#10B981" },
  { id: 6, name: "Security & Devops", code: "SEC-OPS", description: "Infrastructure compliance, cloud routing, key rotation policies, monitoring.", lead: "Oktavia Wulandari", membersCount: 3, color: "#06B6D4" }
];

export default function TeamsView() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [search, setSearch] = useState("");

  const handleAddTeam = () => {
    toast.prompt("Create New Team", {
      description: "Enter a team name to initialize a division:",
      action: {
        label: "Create",
        onClick: (name) => {
          if (!name || typeof name !== "string") return;
          const newTeam: Team = {
            id: Date.now(),
            name: name,
            code: name.substring(0, 3).toUpperCase() + "-" + Math.floor(Math.random() * 900 + 100),
            description: "New team division recently established.",
            lead: "Unassigned",
            membersCount: 1,
            color: ["#3B82F6", "#10B981", "#8B5CF6", "#F43F5E", "#F59E0B", "#06B6D4"][Math.floor(Math.random() * 6)]
          };
          setTeams(prev => [...prev, newTeam]);
          toast.success(`Division "${name}" created successfully`);
        }
      }
    });
  };

  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.code.toLowerCase().includes(search.toLowerCase()) ||
    t.lead.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search and Action Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-[#111318] border border-white/[0.05] rounded-xl p-4">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search teams..."
            className="w-[200px] h-8 bg-white/[0.03] border border-white/[0.08] rounded-lg pl-8 pr-3 text-[13px] text-[#94A3B8] placeholder:text-[#64748B] focus:outline-none focus:border-blue-500/40 transition-all focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
        <button
          onClick={handleAddTeam}
          className="h-8 px-3.5 flex items-center gap-1.5 text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors active:scale-[0.98]"
        >
          <UserPlus size={13} />
          <span>Establish Team</span>
        </button>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className="bg-[#111318] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-5 flex flex-col justify-between transition-all duration-150 hover:shadow-[0_4px_25px_rgba(0,0,0,0.5)] group cursor-default"
          >
            <div>
              {/* Header: Badge & Code */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-semibold font-mono border"
                  style={{ color: team.color, backgroundColor: team.color + "12", borderColor: team.color + "25" }}
                >
                  {team.code}
                </span>
                <span className="text-[12px] text-[#64748B] font-semibold flex items-center gap-1">
                  <Users size={12} /> {team.membersCount} members
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-[15px] font-semibold text-[#F8FAFC] group-hover:text-white transition-colors flex items-center gap-1.5">
                {team.name}
              </h3>
              <p className="text-[12px] text-[#64748B] mt-2 leading-relaxed">
                {team.description}
              </p>
            </div>

            {/* Bottom info section */}
            <div className="border-t border-white/[0.04] pt-4 mt-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase tracking-wider block font-medium">Division Lead</span>
                <span className="text-[13px] text-[#94A3B8] font-semibold">{team.lead}</span>
              </div>
              <button
                onClick={() => toast.info(`Access policies loaded for team ${team.code}`)}
                className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] hover:text-[#F8FAFC] flex items-center justify-center text-[#64748B] transition-colors active:scale-95"
              >
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
