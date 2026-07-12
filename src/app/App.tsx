import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, BarChart3, Users, UsersRound, ShieldCheck,
  FileText, CreditCard, Key, Settings, HelpCircle,
  Search, Bell, UserPlus, Menu, X, Command, Zap, Moon, Sun, Layers
} from "lucide-react";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { User, AuditLog } from "./types";

// Import custom modular views
import DashboardView from "./views/DashboardView";
import AnalyticsView from "./views/AnalyticsView";
import UsersView from "./views/UsersView";
import TeamsView from "./views/TeamsView";
import PermissionsView from "./views/PermissionsView";
import AuditLogsView from "./views/AuditLogsView";
import BillingView from "./views/BillingView";
import ApiKeysView from "./views/ApiKeysView";
import SettingsView from "./views/SettingsView";
import HelpView from "./views/HelpView";

// Shared initial mock data
const INITIAL_USERS: User[] = [
  { id: 1, name: "Oktavia Wulandari", initials: "SC", email: "oktavia.carter@acme.com", dept: "Engineering", role: "Admin", permissions: 9, lastLogin: "2 min ago", status: "Active", mfa: true, created: "Jan 12, 2024", flag: "🇺🇸", color: "#3B82F6", inheritedPerms: ["Read", "Write", "Edit", "Delete", "Billing", "Analytics", "Security", "API Access", "Org Settings"] },
  { id: 2, name: "Michael Ross", initials: "MR", email: "m.ross@acme.com", dept: "Product", role: "Manager", permissions: 5, lastLogin: "1 hr ago", status: "Active", mfa: true, created: "Mar 3, 2024", flag: "🇬🇧", color: "#10B981", inheritedPerms: ["Read", "Write", "Edit", "Analytics", "API Access"] },
  { id: 3, name: "Emma Johnson", initials: "EJ", email: "emma.j@acme.com", dept: "Design", role: "Editor", permissions: 3, lastLogin: "3 hr ago", status: "Active", mfa: false, created: "Feb 28, 2024", flag: "🇩🇪", color: "#8B5CF6", inheritedPerms: ["Read", "Write", "Edit"] },
  { id: 4, name: "Daniel Kim", initials: "DK", email: "d.kim@acme.com", dept: "Finance", role: "Finance", permissions: 3, lastLogin: "Yesterday", status: "Active", mfa: true, created: "Apr 15, 2024", flag: "🇰🇷", color: "#F43F5E", inheritedPerms: ["Read", "Billing", "Analytics"] },
  { id: 5, name: "Farida Rachmawati", initials: "OM", email: "farida.rach@acme.com", dept: "Support", role: "Support", permissions: 3, lastLogin: "2 days ago", status: "Inactive", mfa: false, created: "May 7, 2024", flag: "🇪🇸", color: "#F59E0B", inheritedPerms: ["Read", "Edit"] },
  { id: 6, name: "James Wilson", initials: "JW", email: "j.wilson@acme.com", dept: "Engineering", role: "Developer", permissions: 5, lastLogin: "4 hr ago", status: "Active", mfa: true, created: "Jan 30, 2024", flag: "🇦🇺", color: "#06B6D4", inheritedPerms: ["Read", "Write", "Edit", "Analytics", "API Access"] },
  { id: 7, name: "Ava Thompson", initials: "AT", email: "ava.t@acme.com", dept: "Marketing", role: "Viewer", permissions: 1, lastLogin: "1 week ago", status: "Suspended", mfa: false, created: "Jun 2, 2024", flag: "🇨🇦", color: "#64748B", inheritedPerms: ["Read"] },
  { id: 8, name: "Wijaya Kusuma", initials: "LD", email: "wijaya.k@acme.com", dept: "Engineering", role: "Developer", permissions: 5, lastLogin: "30 min ago", status: "Active", mfa: true, created: "Feb 14, 2024", flag: "🇺🇸", color: "#06B6D4", inheritedPerms: ["Read", "Write", "Edit", "Analytics", "API Access"] },
  { id: 9, name: "Isabella Brown", initials: "IB", email: "i.brown@acme.com", dept: "Sales", role: "Manager", permissions: 5, lastLogin: "6 hr ago", status: "Active", mfa: true, created: "Mar 19, 2024", flag: "🇫🇷", color: "#10B981", inheritedPerms: ["Read", "Write", "Edit", "Analytics", "API Access"] },
  { id: 10, name: "Noah Garcia", initials: "NG", email: "n.garcia@acme.com", dept: "Legal", role: "Viewer", permissions: 1, lastLogin: "3 days ago", status: "Active", mfa: false, created: "Jul 1, 2024", flag: "🇲🇽", color: "#64748B", inheritedPerms: ["Read"] },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 1, time: "14:32:01", ip: "192.168.1.105", browser: "Chrome 124", device: "MacBook Pro", location: "🇺🇸 New York", action: "Role changed: Viewer → Admin", risk: "High", severity: "warning" },
  { id: 2, time: "14:28:45", ip: "10.0.0.42", browser: "Safari 17", device: "iPhone 15", location: "🇬🇧 London", action: "Login successful", risk: "Low", severity: "success" },
  { id: 3, time: "14:15:22", ip: "203.0.113.45", browser: "Firefox 125", device: "Windows PC", location: "🇩🇪 Berlin", action: "Failed login attempt (×3)", risk: "Critical", severity: "critical" },
  { id: 4, time: "13:58:11", ip: "10.0.0.18", browser: "Edge 124", device: "Surface Pro", location: "🇰🇷 Seoul", action: "API key generated", risk: "Medium", severity: "warning" },
  { id: 5, time: "13:42:05", ip: "192.168.2.33", browser: "Chrome 124", device: "MacBook Air", location: "🇫🇷 Paris", action: "Permission matrix updated", risk: "Low", severity: "success" },
];

// Navigation configurations
const NAV_MAIN = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Users, label: "Users" },
  { icon: UsersRound, label: "Teams" },
  { icon: ShieldCheck, label: "Permissions" },
  { icon: FileText, label: "Audit Logs" },
  { icon: CreditCard, label: "Billing" },
  { icon: Key, label: "API Keys" },
];

const NAV_BOTTOM = [
  { icon: Settings, label: "Settings" },
  { icon: HelpCircle, label: "Help" },
];

// Helper nav-item component
function NavItem({ icon: Icon, label, active, onClick, collapsed }: {
  icon: React.ElementType; label: string; active: boolean; onClick: () => void; collapsed: boolean;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        title={collapsed ? label : undefined}
        className={`w-full h-10 flex items-center gap-3 rounded-lg transition-all relative ${collapsed ? "justify-center px-0 w-10" : "px-3 justify-start"
          } ${active ? "bg-blue-500/15 text-blue-400 font-semibold" : "text-[#64748B] hover:text-[#94A3B8] hover:bg-white/[0.04]"
          }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r-full" />
        )}
        <Icon size={16} strokeWidth={active ? 2.25 : 1.75} className="shrink-0" />
        {!collapsed && <span className="text-[13px]">{label}</span>}
      </button>

      {collapsed && (
        <div className="absolute left-[56px] top-1/2 -translate-y-1/2 bg-[#181C23] border border-white/10 text-[#F8FAFC] text-[11px] px-2.5 py-1.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-2xl">
          {label}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#181C23]" />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState("Dashboard");

  // Shared States
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // UI States
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Command palette logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commandItems = [
    { label: "Switch to Dashboard", category: "Navigation", action: () => setActiveNav("Dashboard") },
    { label: "Switch to Analytics Reports", category: "Navigation", action: () => setActiveNav("Analytics") },
    { label: "Switch to Users Database", category: "Navigation", action: () => setActiveNav("Users") },
    { label: "Switch to Team divisions", category: "Navigation", action: () => setActiveNav("Teams") },
    { label: "Switch to Permissions control", category: "Navigation", action: () => setActiveNav("Permissions") },
    { label: "Switch to Security Audit Logs", category: "Navigation", action: () => setActiveNav("Audit Logs") },
    { label: "Switch to Billing parameters", category: "Navigation", action: () => setActiveNav("Billing") },
    { label: "Switch to Developer API keys", category: "Navigation", action: () => setActiveNav("API Keys") },
    { label: "Switch to General Settings", category: "Navigation", action: () => setActiveNav("Settings") },
    { label: "Switch to Frequently Asked Questions", category: "Navigation", action: () => setActiveNav("Help") },
    { label: "Invite new console operator", category: "Actions", action: () => { setIsInviteOpen(true); setActiveNav("Users"); } }
  ];

  const filteredCommands = commandItems.filter(cmd =>
    cmd.label.toLowerCase().includes(commandSearch.toLowerCase()) ||
    cmd.category.toLowerCase().includes(commandSearch.toLowerCase())
  );

  const executeCommand = (action: () => void) => {
    action();
    setIsCommandPaletteOpen(false);
    setCommandSearch("");
  };

  const handleInviteOpen = useCallback(() => {
    setIsInviteOpen(true);
  }, []);

  const handleGenerateApiKeyRedirect = useCallback(() => {
    setActiveNav("API Keys");
  }, []);

  // Render view controller
  const renderActiveView = () => {
    switch (activeNav) {
      case "Dashboard":
        return <DashboardView users={users} auditLogs={auditLogs} onNavigate={setActiveNav} onInviteUser={handleInviteOpen} onGenerateApiKey={handleGenerateApiKeyRedirect} />;
      case "Analytics":
        return <AnalyticsView users={users} />;
      case "Users":
        return <UsersView users={users} setUsers={setUsers} selectedUser={selectedUser} setSelectedUser={setSelectedUser} isInviteOpen={isInviteOpen} setIsInviteOpen={setIsInviteOpen} />;
      case "Teams":
        return <TeamsView />;
      case "Permissions":
        return <PermissionsView />;
      case "Audit Logs":
        return <AuditLogsView auditLogs={auditLogs} />;
      case "Billing":
        return <BillingView />;
      case "API Keys":
        return <ApiKeysView />;
      case "Settings":
        return <SettingsView />;
      case "Help":
        return <HelpView />;
      default:
        return <DashboardView users={users} auditLogs={auditLogs} onNavigate={setActiveNav} onInviteUser={handleInviteOpen} onGenerateApiKey={handleGenerateApiKeyRedirect} />;
    }
  };

  return (
    <div
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
      className={`h-screen flex bg-[#09090B] text-[#F8FAFC] overflow-hidden ${!isDarkMode ? "invert hue-rotate-180" : ""}`}
    >
      <Toaster theme="dark" position="bottom-right" closeButton toastOptions={{ style: { backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.08)", color: "#F8FAFC" } }} />

      {/* ── Sidebar (Desktop) ─────────────────────────────────────────── */}
      <aside className="hidden md:flex w-[210px] flex-shrink-0 bg-[#0E1117] border-r border-white/[0.06] flex-col py-5 px-3.5 gap-0.5 z-25 justify-between">
        <div className="space-y-6">
          {/* Logo Branding */}
          <div className="flex items-center gap-2 px-1.5 select-none">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Layers size={14} className="text-white" strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-[13px] font-bold text-[#F8FAFC] block tracking-wide">WIJAYA KUSUMA</span>
              <span className="text-[10px] text-[#64748B] font-semibold tracking-wider uppercase block mt-0.5">Admin Console</span>
            </div>
          </div>

          <div className="w-full h-px bg-white/[0.04]" />

          {/* Navigation links */}
          <div className="flex flex-col gap-0.5">
            {NAV_MAIN.map(item => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                active={activeNav === item.label}
                onClick={() => { setActiveNav(item.label); setIsMobileSidebarOpen(false); }}
                collapsed={false}
              />
            ))}
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="space-y-4">
          <div className="flex flex-col gap-0.5">
            {NAV_BOTTOM.map(item => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                active={activeNav === item.label}
                onClick={() => { setActiveNav(item.label); setIsMobileSidebarOpen(false); }}
                collapsed={false}
              />
            ))}
          </div>
          <div className="w-full h-px bg-white/[0.04]" />
          <div className="flex items-center gap-3 px-1.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white uppercase">SC</div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0E1117]" />
            </div>
            <div className="min-w-0">
              <span className="text-[12px] font-bold text-[#F8FAFC] block truncate leading-none">Oktavia Wulandari</span>
              <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium leading-none">Super Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Sidebar Drawer overlay ────────────────────────────── */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 flex transition-opacity animate-in fade-in duration-150">
          <div
            className="w-[240px] bg-[#0E1117] border-r border-white/[0.08] p-5 flex flex-col justify-between animate-in slide-in-from-left duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
                    <Layers size={13} className="text-white" />
                  </div>
                  <span className="text-[13px] font-bold text-white tracking-wider">WK PANEL</span>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.05] text-[#64748B]"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {NAV_MAIN.map(item => (
                  <NavItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    active={activeNav === item.label}
                    onClick={() => { setActiveNav(item.label); setIsMobileSidebarOpen(false); }}
                    collapsed={false}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                {NAV_BOTTOM.map(item => (
                  <NavItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    active={activeNav === item.label}
                    onClick={() => { setActiveNav(item.label); setIsMobileSidebarOpen(false); }}
                    collapsed={false}
                  />
                ))}
              </div>
              <div className="w-full h-px bg-white/[0.04]" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white uppercase">SC</div>
                <div>
                  <span className="text-[12px] font-bold text-white block">Oktavia Wulandari</span>
                  <span className="text-[10px] text-[#64748B] block mt-0.5">Admin Operator</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileSidebarOpen(false)} />
        </div>
      )}

      {/* ── Content View Wrapper ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* ── Global Header ────────────────────────────────────────── */}
        <header className="h-[57px] flex-shrink-0 bg-[#0E1117] border-b border-white/[0.06] flex items-center px-4 md:px-6 gap-3 z-20 justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger menu trigger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open mobile menu"
              className="md:hidden w-8 h-8 flex items-center justify-center text-[#64748B] hover:text-[#94A3B8] hover:bg-white/[0.03] rounded-lg transition-colors border border-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Menu size={16} />
            </button>

            {/* Title segment */}
            <span className="hidden md:inline text-[13px] text-[#64748B] font-semibold">Console Console</span>
            <span className="hidden md:inline text-[#3D4B5C] font-semibold">/</span>
            <span className="hidden sm:inline-block text-[13px] text-[#F8FAFC] font-semibold">{activeNav} view</span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Search command shortcut trigger (Desktop) */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="relative hidden sm:block w-[140px] sm:w-[200px] h-8 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] rounded-lg pl-8 pr-12 text-[12px] text-[#64748B] hover:text-[#94A3B8] text-left transition-all"
            >
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
              <span>Search menu...</span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[9px] text-[#3D4B5C] pointer-events-none font-mono font-bold bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">
                <Command size={8} />K
              </span>
            </button>

            {/* Search Icon Trigger (Mobile) */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              aria-label="Search menu"
              className="sm:hidden w-8 h-8 flex items-center justify-center text-[#64748B] hover:text-[#94A3B8] hover:bg-white/[0.03] border border-white/[0.05] rounded-lg transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              title="Search menu"
            >
              <Search size={14} />
            </button>

            {/* Quick Actions command trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="h-8 w-8 md:w-auto md:px-3 flex items-center justify-center gap-1.5 text-[12px] text-[#64748B] bg-white/[0.03] border border-white/[0.08] rounded-lg hover:bg-white/[0.05] hover:text-[#94A3B8] transition-colors shrink-0"
              title="Shortcut Palette"
            >
              <Zap size={13} />
              <span className="hidden md:inline">Quick actions</span>
            </button>

            <div className="w-px h-4 bg-white/[0.06] shrink-0" />

            {/* Notifications */}
            <button aria-label="Notifications" className="relative w-8 h-8 flex items-center justify-center text-[#64748B] hover:text-[#94A3B8] hover:bg-white/[0.03] border border-white/[0.05] rounded-lg transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <Bell size={14} />
              <span className="absolute top-[8px] right-[8px] w-[5.5px] h-[5.5px] bg-blue-500 rounded-full" />
            </button>

            {/* Invert color profile theme toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle theme"
              className="w-8 h-8 flex items-center justify-center text-[#64748B] hover:text-[#94A3B8] hover:bg-white/[0.03] border border-white/[0.05] rounded-lg transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </header>

        {/* ── Main View Panel ────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto min-h-0 bg-[#09090B] p-4 md:p-8" style={{ scrollbarWidth: "none" }}>
          {/* Header Description Title */}
          <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-white/[0.03] pb-6">
            <div>
              <h1 className="text-[20px] font-bold text-[#F8FAFC] tracking-tight">{activeNav}</h1>
              <p className="text-[12px] text-[#64748B] mt-1 font-medium">
                {activeNav === "Dashboard" && "Real-time metrics, system health overview, and operator action items."}
                {activeNav === "Analytics" && "Advanced database distributions, multi-factor adoption, and regional latencies."}
                {activeNav === "Users" && "Enterprise registry panel for adding operators, revoking keys, and configuring access policies."}
                {activeNav === "Teams" && "Organize administrative operators into specific corporate units and budget profiles."}
                {activeNav === "Permissions" && "System-wide role presets matrices defining default user authorization settings."}
                {activeNav === "Audit Logs" && "System audit trail logs capturing location codes, risk flags, and parameters changed."}
                {activeNav === "Billing" && "Manage Stripe corporate subscriptions, monthly quotas, and payment profiles."}
                {activeNav === "API Keys" && "Manage developer secrets, configure access scopes, and revoke programmatic tools."}
                {activeNav === "Settings" && "Adjust inactive session times, session timeouts, and slack alert channels."}
                {activeNav === "Help" && "Review console instructions or file ticket inquiries directly to support engineering."}
              </p>
            </div>

            {activeNav === "Users" && (
              <button
                onClick={() => setIsInviteOpen(true)}
                className="h-8.5 px-4 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shrink-0 active:scale-95"
              >
                <UserPlus size={13} />
                <span>Invite Operator</span>
              </button>
            )}
          </div>

          {/* Sub-view injection with smooth framer-motion transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Cmd+K Keyboard Command Palette Modal */}
      {isCommandPaletteOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-150"
          onClick={() => setIsCommandPaletteOpen(false)}
        >
          <div
            className="w-full max-w-[460px] bg-[#111318] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[350px] animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Input search */}
            <div className="relative border-b border-white/[0.06] p-3 flex items-center gap-2">
              <Search size={14} className="text-[#64748B]" />
              <input
                type="text"
                autoFocus
                value={commandSearch}
                onChange={e => setCommandSearch(e.target.value)}
                placeholder="Type a console navigation command..."
                className="flex-1 bg-transparent text-[13px] text-white focus:outline-none placeholder:text-[#64748B]"
              />
              <span className="text-[10px] text-[#64748B] font-bold font-mono border border-white/[0.06] bg-white/[0.02] px-1.5 py-0.5 rounded uppercase">ESC</span>
            </div>

            {/* Command items list */}
            <div className="flex-1 overflow-y-auto p-2" style={{ scrollbarWidth: "none" }}>
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-[#64748B] text-[12px]">No matching console commands found</div>
              ) : (
                <div className="space-y-0.5">
                  {filteredCommands.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => executeCommand(cmd.action)}
                      className="w-full h-8.5 flex items-center justify-between px-3 text-[12px] text-[#94A3B8] hover:text-white bg-transparent hover:bg-white/[0.04] rounded-lg transition-colors text-left"
                    >
                      <span>{cmd.label}</span>
                      <span className="text-[10px] text-[#64748B] font-semibold uppercase bg-white/[0.02] px-1.5 py-0.5 rounded border border-white/[0.05]">
                        {cmd.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
