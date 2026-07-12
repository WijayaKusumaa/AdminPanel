export type Role = "Admin" | "Editor" | "Manager" | "Support" | "Finance" | "Developer" | "Viewer";
export type Status = "Active" | "Inactive" | "Suspended";

export interface User {
  id: number;
  name: string;
  initials: string;
  email: string;
  dept: string;
  role: Role;
  permissions: number;
  lastLogin: string;
  status: Status;
  mfa: boolean;
  created: string;
  flag: string;
  color: string;
  inheritedPerms?: string[];
}

export interface AuditLog {
  id: number;
  time: string;
  ip: string;
  browser: string;
  device: string;
  location: string;
  action: string;
  risk: "Low" | "Medium" | "High" | "Critical";
  severity: "success" | "warning" | "critical";
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  expiry: string;
  lastUsed: string;
  status: "Active" | "Revoked";
  scopes: string[];
}

export interface Team {
  id: number;
  name: string;
  code: string;
  description: string;
  lead: string;
  membersCount: number;
  color: string;
}
