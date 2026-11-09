export type UserRole = "admin" | "user";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Super Admin",
  user: "Admin",
};

export type UserStatus =
  | "pending"
  | "active"
  | "rejected"
  | "inactive"
  | "deleted";

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}
