import React, { useState, memo } from "react";
import {
  Search, UserPlus, Upload, Download, CheckSquare, MoreHorizontal,
  Shield, Smartphone, Globe, X, Save, RotateCcw, Check, ChevronRight,
  ChevronLeft, ArrowUpDown, ShieldAlert, Lock, Trash2, Edit
} from "lucide-react";
import { User, Role, Status } from "../types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "../components/ui/dialog";

// Styling constants
const ROLE_STYLES: Record<Role, { text: string; bg: string; border: string }> = {
  Admin:     { text: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  Editor:    { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  Manager:   { text: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20" },
  Support:   { text: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
  Finance:   { text: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/20" },
  Developer: { text: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20" },
  Viewer:    { text: "text-slate-400",  bg: "bg-slate-500/10",  border: "border-slate-500/20" },
};

const STATUS_STYLES: Record<Status, { text: string; bg: string; dot: string }> = {
  Active:    { text: "text-green-400", bg: "bg-green-500/10", dot: "bg-green-400" },
  Inactive:  { text: "text-slate-400", bg: "bg-slate-500/10", dot: "bg-slate-500" },
  Suspended: { text: "text-red-400",   bg: "bg-red-500/10",   dot: "bg-red-400" },
};

// Default permissions definition
const PERMS_DEFAULT = {
  Read: true, Write: true, Edit: true, Delete: false,
  Billing: false, Analytics: true, Security: false,
  "API Access": true, "Org Settings": false,
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-8 rounded-full transition-colors duration-200 flex-shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${checked ? "bg-blue-600" : "bg-white/[0.12]"}`}
      style={{ height: "18px" }}
    >
      <span className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow transition-all duration-200 ${checked ? "left-[18px]" : "left-[2px]"}`} />
    </button>
  );
}

interface UsersViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  selectedUser: User | null;
  setSelectedUser: (u: User | null) => void;
  isInviteOpen: boolean;
  setIsInviteOpen: (o: boolean) => void;
}

const UsersView = memo(function UsersView({
  users,
  setUsers,
  selectedUser,
  setSelectedUser,
  isInviteOpen,
  setIsInviteOpen
}: UsersViewProps) {
  // Filtering states
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [deptFilter, setDeptFilter] = useState("All Depts");

  // Sorting states
  const [sortField, setSortField] = useState<keyof User | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Invite states
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDept, setNewDept] = useState("Engineering");
  const [newRole, setNewRole] = useState<Role>("Developer");

  // Selection Matrix
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Permission panel drawer local state
  const [localRole, setLocalRole] = useState<Role>("Viewer");
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [localPerms, setLocalPerms] = useState<Record<string, boolean>>(PERMS_DEFAULT);
  const [hasChanges, setHasChanges] = useState(false);

  // Pagination states
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Synchronization helper when selecting a user
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setLocalRole(user.role);
    setIsEditingRole(false);
    
    // Load custom permissions or default
    const uPerms = user.inheritedPerms 
      ? Object.keys(PERMS_DEFAULT).reduce((acc, key) => ({
          ...acc,
          [key]: user.inheritedPerms!.includes(key)
        }), {} as Record<string, boolean>)
      : PERMS_DEFAULT;
      
    setLocalPerms(uPerms);
    setHasChanges(false);
  };

  const handleTogglePerm = (perm: string) => {
    setLocalPerms(prev => {
      const next = { ...prev, [perm]: !prev[perm] };
      setHasChanges(true);
      return next;
    });
  };

  const handleRoleChange = (role: Role) => {
    setLocalRole(role);
    setIsEditingRole(false);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    if (!selectedUser) return;

    // Update global user
    const updated = users.map(u => {
      if (u.id === selectedUser.id) {
        const activePerms = Object.entries(localPerms)
          .filter(([_, enabled]) => enabled)
          .map(([name]) => name);

        // Timeline updates log
        const newTimelineEvent = {
          action: `Permissions updated manually (Role: ${localRole})`,
          time: "Just now",
          iconName: "Shield",
          color: "#3B82F6"
        };

        const existingTimeline = u.inheritedPerms ? [] : [
          { action: "Role changed to " + localRole, time: "Just now", iconName: "Shield", color: "#3B82F6" }
        ];

        return {
          ...u,
          role: localRole,
          permissions: activePerms.length,
          inheritedPerms: activePerms,
        };
      }
      return u;
    });

    setUsers(updated);
    // Find updated user reference to keep selection active
    const newUserRef = updated.find(u => u.id === selectedUser.id) || null;
    setSelectedUser(newUserRef);
    setHasChanges(false);

    toast.success(`Access policy saved for ${selectedUser.name}`);
  };

  const handleResetChanges = () => {
    if (!selectedUser) return;
    handleSelectUser(selectedUser);
    toast.info("Changes discarded");
  };

  const handleDeleteUser = (userId: number, name: string) => {
    if (confirm(`Are you sure you want to revoke system access for ${name}?`)) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
      toast.error(`System access revoked for ${name}`);
    }
  };

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Sort and Filter Logic
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (roleFilter === "All Roles" || u.role === roleFilter) &&
      (statusFilter === "All Status" || u.status === statusFilter) &&
      (deptFilter === "All Depts" || u.dept === deptFilter)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === "string" && typeof valB === "string") {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === "number" && typeof valB === "number") {
      return sortAsc ? valA - valB : valB - valA;
    }
    if (typeof valA === "boolean" && typeof valB === "boolean") {
      return sortAsc ? (valA === valB ? 0 : valA ? 1 : -1) : (valA === valB ? 0 : valB ? 1 : -1);
    }
    return 0;
  });

  // Bulk selections
  const handleToggleSelectAll = () => {
    if (selectedIds.length === sorted.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sorted.map(u => u.id));
    }
  };

  const handleToggleSelectRow = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (status: Status) => {
    if (selectedIds.length === 0) return;
    setUsers(prev => prev.map(u => selectedIds.includes(u.id) ? { ...u, status } : u));
    toast.success(`Updated status of ${selectedIds.length} accounts to ${status}`);
    setSelectedIds([]);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newUser: User = {
      id: Date.now(),
      name: newName,
      initials: newName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
      email: newEmail,
      dept: newDept,
      role: newRole,
      permissions: Object.values(PERMS_DEFAULT).filter(Boolean).length,
      lastLogin: "Never logged in",
      status: "Active",
      mfa: false,
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      flag: "🇲🇾", // Default placeholder flag
      color: ["#3B82F6", "#10B981", "#8B5CF6", "#F43F5E", "#F59E0B", "#06B6D4"][Math.floor(Math.random() * 6)],
      inheritedPerms: Object.entries(PERMS_DEFAULT).filter(([_, val]) => val).map(([k]) => k)
    };

    setUsers(prev => [newUser, ...prev]);
    setIsInviteOpen(false);
    setNewName("");
    setNewEmail("");
    toast.success(`Invitation link dispatched to ${newEmail}`);
  };

  // Pagination bounds
  const totalPages = Math.ceil(sorted.length / rowsPerPage) || 1;
  const paginatedData = sorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat" as const,
    backgroundPosition: "right 9px center",
  };

  return (
    <div className="flex flex-1 min-h-0 relative animate-fade-in">
      {/* Table Section */}
      <div className="flex-1 overflow-y-auto min-w-0 p-8" style={{ scrollbarWidth: "none" }}>
        
        {/* Bulk tools or Filters */}
        <div className="flex items-center gap-2.5 mb-5 flex-wrap">
          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg animate-in fade-in zoom-in-95">
              <span className="text-[12px] text-blue-400 font-semibold">{selectedIds.length} users selected</span>
              <div className="w-px h-4 bg-blue-500/20 mx-2" />
              <button
                onClick={() => handleBulkStatusChange("Active")}
                className="text-[12px] text-green-400 hover:text-green-300 font-medium px-2 py-0.5 active:scale-[0.98] transition-transform"
              >
                Set Active
              </button>
              <button
                onClick={() => handleBulkStatusChange("Inactive")}
                className="text-[12px] text-slate-400 hover:text-slate-300 font-medium px-2 py-0.5 active:scale-[0.98] transition-transform"
              >
                Set Inactive
              </button>
              <button
                onClick={() => handleBulkStatusChange("Suspended")}
                className="text-[12px] text-red-400 hover:text-red-300 font-medium px-2 py-0.5 active:scale-[0.98] transition-transform"
              >
                Suspend
              </button>
              <button
                onClick={() => {
                  if (confirm(`Revoke access for ${selectedIds.length} operators?`)) {
                    setUsers(prev => prev.filter(u => !selectedIds.includes(u.id)));
                    setSelectedIds([]);
                    toast.error("Accounts permanently deleted");
                  }
                }}
                className="text-[12px] text-red-500 hover:text-red-400 font-semibold px-2 py-0.5 ml-2 flex items-center gap-1 active:scale-[0.98] transition-transform"
              >
                <Trash2 size={12} /> Revoke
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-[11px] text-[#64748B] hover:text-white px-2 py-0.5 ml-2"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              {/* Search input */}
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search user registry..."
                  className="w-[200px] h-8 bg-[#111318] border border-white/[0.08] rounded-lg pl-8 pr-3 text-[13px] text-[#94A3B8] placeholder:text-[#64748B] focus:outline-none focus:border-blue-500/40 transition-all focus:ring-1 focus:ring-blue-500/30"
                />
              </div>

              {/* Filters dropdowns */}
              {[
                { val: roleFilter, set: setRoleFilter, opts: ["All Roles", "Admin", "Editor", "Manager", "Support", "Finance", "Developer", "Viewer"] },
                { val: statusFilter, set: setStatusFilter, opts: ["All Status", "Active", "Inactive", "Suspended"] },
                { val: deptFilter, set: setDeptFilter, opts: ["All Depts", "Engineering", "Product", "Design", "Finance", "Support", "Sales", "Marketing", "Legal"] },
              ].map(({ val, set, opts }, i) => (
                <select
                  key={i}
                  value={val}
                  onChange={e => set(e.target.value)}
                  style={selectStyle}
                  className="h-8 pl-3 pr-7 bg-[#111318] border border-white/[0.08] rounded-lg text-[13px] text-[#94A3B8] focus:outline-none focus:border-blue-500/40 cursor-pointer appearance-none transition-all focus:ring-1 focus:ring-blue-500/30"
                >
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}

              {(search || roleFilter !== "All Roles" || statusFilter !== "All Status" || deptFilter !== "All Depts") && (
                <button
                  onClick={() => { setSearch(""); setRoleFilter("All Roles"); setStatusFilter("All Status"); setDeptFilter("All Depts"); }}
                  className="h-8 px-3 text-[13px] text-[#64748B] hover:text-[#94A3B8] transition-colors"
                >
                  Reset parameters
                </button>
              )}
            </>
          )}

          <div className="flex-1" />
          <span className="text-[12px] text-[#64748B] font-medium pr-1">
            Found {sorted.length} registry entries
          </span>
        </div>

        {/* Data Grid / Mobile List */}
        <div className="bg-[#111318] border border-white/[0.06] rounded-xl overflow-hidden mb-5">
          
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Table Head */}
              <div
                className="grid border-b border-white/[0.06] px-4 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider select-none bg-white/[0.01]"
                style={{ gridTemplateColumns: "36px 180px 1fr 100px 100px 60px 120px 80px 70px 32px" }}
              >
                <div className="py-3 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === sorted.length && sorted.length > 0}
                    onChange={handleToggleSelectAll}
                    className="accent-blue-500 cursor-pointer w-3.5 h-3.5"
                  />
                </div>
                <div onClick={() => handleSort("name")} className="py-3 flex items-center gap-1.5 cursor-pointer hover:text-[#94A3B8] transition-colors">
                  Name <ArrowUpDown size={11} />
                </div>
                <div onClick={() => handleSort("email")} className="py-3 flex items-center gap-1.5 cursor-pointer hover:text-[#94A3B8] transition-colors">
                  Email Address <ArrowUpDown size={11} />
                </div>
                <div onClick={() => handleSort("dept")} className="py-3 flex items-center gap-1.5 cursor-pointer hover:text-[#94A3B8] transition-colors">
                  Dept <ArrowUpDown size={11} />
                </div>
                <div onClick={() => handleSort("role")} className="py-3 flex items-center gap-1.5 cursor-pointer hover:text-[#94A3B8] transition-colors">
                  Role <ArrowUpDown size={11} />
                </div>
                <div onClick={() => handleSort("permissions")} className="py-3 flex items-center gap-1.5 cursor-pointer hover:text-[#94A3B8] transition-colors justify-center">
                  Rules <ArrowUpDown size={11} />
                </div>
                <div className="py-3 flex items-center gap-1">Logs Location</div>
                <div onClick={() => handleSort("status")} className="py-3 flex items-center gap-1.5 cursor-pointer hover:text-[#94A3B8] transition-colors">
                  Status <ArrowUpDown size={11} />
                </div>
                <div onClick={() => handleSort("mfa")} className="py-3 flex items-center gap-1.5 cursor-pointer hover:text-[#94A3B8] transition-colors">
                  MFA <ArrowUpDown size={11} />
                </div>
                <div className="py-3" />
              </div>

              {/* Rows */}
              {paginatedData.length === 0 ? (
                <div className="py-16 text-center text-[#64748B] text-[13px]">No operators match current filters</div>
              ) : (
                paginatedData.map((user, idx) => {
                  const rs = ROLE_STYLES[user.role] || { text: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" };
                  const ss = STATUS_STYLES[user.status] || { text: "text-slate-400", bg: "bg-slate-500/10", dot: "bg-slate-500" };
                  const isSel = selectedUser?.id === user.id;
                  const isRowChecked = selectedIds.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`grid px-4 border-b border-white/[0.04] last:border-0 cursor-pointer transition-all duration-100 animate-slide-up opacity-0 stagger-${Math.min((idx % rowsPerPage) + 1, 5)} ${
                        isSel
                          ? "bg-blue-500/[0.08] border-blue-500/20 shadow-[inset_3px_0_0_0_#3B82F6]"
                          : isRowChecked
                          ? "bg-blue-500/[0.03]"
                          : idx % 2 === 1
                          ? "bg-white/[0.008] hover:bg-white/[0.025]"
                          : "hover:bg-white/[0.018]"
                      }`}
                      style={{ gridTemplateColumns: "36px 180px 1fr 100px 100px 60px 120px 80px 70px 32px" }}
                    >
                      {/* Checkbox */}
                      <div className="py-3 flex items-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isRowChecked}
                          onChange={() => handleToggleSelectRow(user.id)}
                          className="accent-blue-500 cursor-pointer w-3.5 h-3.5"
                        />
                      </div>
                      
                      {/* Avatar & Name */}
                      <div className="py-3 flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                          style={{ backgroundColor: user.color + "20", color: user.color }}
                        >
                          {user.initials}
                        </div>
                        <span className="text-[13px] font-semibold text-[#F8FAFC] truncate group-hover:text-white">{user.name}</span>
                      </div>

                      {/* Email */}
                      <div className="py-3 flex items-center gap-1 min-w-0">
                        <span className="text-[13px] text-[#94A3B8] truncate">{user.email}</span>
                      </div>

                      {/* Department */}
                      <div className="py-3 flex items-center">
                        <span className="text-[13px] text-[#94A3B8]">{user.dept}</span>
                      </div>

                      {/* Role Badge */}
                      <div className="py-3 flex items-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${rs.text} ${rs.bg} ${rs.border}`}>
                          {user.role}
                        </span>
                      </div>

                      {/* Permissions Rules Count */}
                      <div className="py-3 flex items-center justify-center">
                        <span className="text-[13px] text-[#64748B] font-mono">{user.permissions}</span>
                      </div>

                      {/* Flag + Last login */}
                      <div className="py-3 flex items-center gap-1.5">
                        <span className="text-sm leading-none">{user.flag}</span>
                        <span className="text-[12px] text-[#64748B] truncate">{user.lastLogin}</span>
                      </div>

                      {/* Status Pill */}
                      <div className="py-3 flex items-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${ss.text} ${ss.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ss.dot}`} />
                          {user.status}
                        </span>
                      </div>

                      {/* MFA Badge */}
                      <div className="py-3 flex items-center">
                        {user.mfa ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
                            <Shield size={10} /> Active
                          </span>
                        ) : (
                          <span className="text-[12px] text-[#3D4B5C] font-semibold flex items-center gap-0.5">
                            <ShieldAlert size={10} /> Off
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="py-3 flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          aria-label={`Revoke operator credentials for ${user.name}`}
                          title="Revoke operator credentials"
                          className="w-6 h-6 flex items-center justify-center text-[#64748B] hover:text-red-400 hover:bg-white/[0.04] rounded transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Mobile Layout (Responsive List of Cards) */}
          <div className="lg:hidden p-4 space-y-3.5">
            {paginatedData.length === 0 ? (
              <div className="py-12 text-center text-[#64748B] text-[13px]">No operators match current filters</div>
            ) : (
              paginatedData.map(user => {
                const rs = ROLE_STYLES[user.role] || { text: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" };
                const ss = STATUS_STYLES[user.status] || { text: "text-slate-400", bg: "bg-slate-500/10", dot: "bg-slate-500" };
                const isSel = selectedUser?.id === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`bg-white/[0.01] border rounded-lg p-4 cursor-pointer transition-all animate-slide-up opacity-0 stagger-1 ${
                      isSel ? "border-blue-500/40 bg-blue-500/[0.03] shadow-md shadow-blue-500/10" : "border-white/[0.04] hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{ backgroundColor: user.color + "20", color: user.color }}
                        >
                          {user.initials}
                        </div>
                        <div>
                          <h4 className="text-[13px] font-semibold text-[#F8FAFC]">{user.name}</h4>
                          <span className="text-[11px] text-[#64748B]">{user.email}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${ss.text} ${ss.bg}`}>
                        <span className={`w-1.2 h-1.2 rounded-full ${ss.dot}`} />
                        {user.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[12px] border-t border-white/[0.03] pt-2.5 mt-2.5">
                      <div>
                        <span className="text-[#64748B] block text-[10px] uppercase font-medium">Department</span>
                        <span className="text-[#94A3B8]">{user.dept}</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block text-[10px] uppercase font-medium">System Role</span>
                        <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${rs.text} ${rs.bg} ${rs.border}`}>
                          {user.role}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block text-[10px] uppercase font-medium">Last Audit Log</span>
                        <span className="text-[#94A3B8]">{user.lastLogin} ({user.flag})</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block text-[10px] uppercase font-medium">MFA Security</span>
                        <span className="text-[#94A3B8]">{user.mfa ? "Active Secure" : "Unenrolled"}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          <span className="text-[12px] text-[#64748B]">Showing {Math.min(sorted.length, rowsPerPage)} of {sorted.length} active records</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-7 w-7 rounded bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-[#64748B] hover:text-[#94A3B8] hover:bg-white/[0.04] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 rounded text-[12px] font-medium transition-colors ${
                  currentPage === p ? "bg-blue-600 text-white" : "text-[#64748B] hover:bg-white/[0.04] hover:text-[#94A3B8]"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-7 w-7 rounded bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-[#64748B] hover:text-[#94A3B8] hover:bg-white/[0.04] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
            Page Size:
            <select
              value={rowsPerPage}
              onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="h-7 px-1.5 bg-[#111318] border border-white/[0.08] rounded text-[#94A3B8] text-[11px] focus:outline-none focus:border-blue-500/40"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Permission Drawer on the Right */}
      {selectedUser && (
        <div className="w-full md:w-[350px] flex-shrink-0 border-l border-white/[0.06] bg-[#0E1117] flex flex-col h-full animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="p-5 border-b border-white/[0.06] flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{ backgroundColor: selectedUser.color + "20", color: selectedUser.color }}
              >
                {selectedUser.initials}
              </div>
              <div className="min-w-0">
                <h3 className="text-[14px] font-bold text-[#F8FAFC] leading-tight truncate">{selectedUser.name}</h3>
                <span className="text-[11px] text-[#64748B] block truncate mt-0.5">{selectedUser.email}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="h-6 w-6 rounded hover:bg-white/[0.05] text-[#64748B] hover:text-[#94A3B8] flex items-center justify-center transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            {/* Quick Status Info */}
            <div className="p-5 border-b border-white/[0.04] grid grid-cols-2 gap-4 text-[12px]">
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase font-semibold">User Status</span>
                <span className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLES[selectedUser.status].text} ${STATUS_STYLES[selectedUser.status].bg}`}>
                  <span className={`w-1.2 h-1.2 rounded-full ${STATUS_STYLES[selectedUser.status].dot}`} />
                  {selectedUser.status}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Security MFA</span>
                <span className="text-[#94A3B8] font-medium block mt-1.5">{selectedUser.mfa ? "🔒 Active" : "🔓 Unsecured"}</span>
              </div>
            </div>

            {/* Assigned Role Modifier */}
            <div className="p-5 border-b border-white/[0.04]">
              <span className="text-[#64748B] block text-[10px] uppercase font-semibold mb-3">Operator System Role</span>
              {isEditingRole ? (
                <div className="flex items-center gap-1.5">
                  <select
                    value={localRole}
                    onChange={e => handleRoleChange(e.target.value as Role)}
                    className="flex-1 h-8 px-2 bg-[#111318] border border-white/[0.08] rounded text-[#F8FAFC] text-[13px] focus:outline-none"
                  >
                    {["Admin", "Editor", "Manager", "Support", "Finance", "Developer", "Viewer"].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsEditingRole(false)}
                    className="h-8 px-2 text-[11px] text-[#64748B] hover:text-[#94A3B8]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${ROLE_STYLES[localRole]?.text} ${ROLE_STYLES[localRole]?.bg} ${ROLE_STYLES[localRole]?.border}`}>
                    {localRole}
                  </span>
                  <button
                    onClick={() => setIsEditingRole(true)}
                    className="text-[12px] text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Change Role
                  </button>
                </div>
              )}
            </div>

            {/* Permission checklist */}
            <div className="p-5 border-b border-white/[0.04]">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Permissions Profile</span>
                <span className="text-[10px] text-[#3D4B5C] font-semibold">Active: {Object.values(localPerms).filter(Boolean).length}</span>
              </div>
              <div className="space-y-1">
                {Object.entries(localPerms).map(([perm, enabled]) => (
                  <div
                    key={perm}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                  >
                    <div>
                      <div className="text-[13px] text-[#F8FAFC] font-medium">{perm}</div>
                      <div className="text-[10px] text-[#3D4B5C] font-semibold">{enabled ? "Granted Access" : "Restricted"}</div>
                    </div>
                    <Toggle
                      checked={enabled}
                      onChange={() => handleTogglePerm(perm)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Activity History timeline summary */}
            <div className="p-5">
              <span className="text-[#64748B] block text-[10px] uppercase font-semibold mb-3">Operator Timeline</span>
              <div className="space-y-4">
                {[
                  { action: "Account security audit completed", time: "2 hours ago", icon: Shield, color: "#10B981" },
                  { action: "MFA credentials verified successfully", time: "Yesterday", icon: Smartphone, color: "#3B82F6" },
                  { action: `Logged into Console from ${selectedUser.flag} (${selectedUser.lastLogin})`, time: "Recent Session", icon: Globe, color: "#64748B" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div
                      className="w-5.5 h-5.5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: item.color + "15", color: item.color }}
                    >
                      <item.icon size={11} />
                    </div>
                    <div>
                      <span className="text-[12px] text-[#94A3B8] font-medium leading-tight block">{item.action}</span>
                      <span className="text-[10px] text-[#64748B] mt-0.5 block">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="p-5 border-t border-white/[0.06] flex gap-2.5 bg-white/[0.01]">
            <button
              onClick={handleSaveChanges}
              disabled={!hasChanges}
              className="flex-1 h-9 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-blue-600/20"
            >
              <Save size={13} />
              <span>Apply Changes</span>
            </button>
            <button
              onClick={handleResetChanges}
              disabled={!hasChanges}
              className="h-9 px-3 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] disabled:opacity-40 text-[#64748B] hover:text-[#94A3B8] text-[12px] font-semibold rounded-lg flex items-center justify-center transition-colors disabled:cursor-not-allowed"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="max-w-[400px] bg-[#111318] border border-white/[0.08] text-[#F8FAFC]">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold">Invite New Operator</DialogTitle>
            <DialogDescription className="text-[12px] text-[#64748B]">
              Dispatches a secure console access invitation link to the email below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInviteSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label htmlFor="fullname" className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B]">Full Name</label>
              <input
                id="fullname"
                type="text"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full h-9 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 text-[13px] placeholder:text-[#64748B] focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/30 text-[#F8FAFC]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B]">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="e.g. john.doe@wijayakusuma.com"
                className="w-full h-9 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 text-[13px] placeholder:text-[#64748B] focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/30 text-[#F8FAFC]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="dept" className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B]">Department</label>
                <select
                  id="dept"
                  value={newDept}
                  onChange={e => setNewDept(e.target.value)}
                  className="w-full h-9 bg-white/[0.03] border border-white/[0.08] rounded-lg px-2 text-[13px] focus:outline-none text-[#94A3B8]"
                >
                  {["Engineering", "Product", "Design", "Finance", "Support", "Sales", "Marketing", "Legal"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="role" className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B]">System Role</label>
                <select
                  id="role"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as Role)}
                  className="w-full h-9 bg-white/[0.03] border border-white/[0.08] rounded-lg px-2 text-[13px] focus:outline-none text-[#94A3B8]"
                >
                  {["Admin", "Editor", "Manager", "Support", "Finance", "Developer", "Viewer"].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
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
                Send Invite
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default UsersView;
