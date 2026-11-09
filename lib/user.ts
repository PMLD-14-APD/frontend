import "server-only";

import type { User } from "@/type/user";
import { BackendError } from "./backend";
import { readBackendList } from "./backend-list";

export async function getUsers(): Promise<User[]> {
  const users = await readBackendList("/users/");
  if (!Array.isArray(users) || !users.every((user) =>
    user && typeof user === "object" && "id" in user && typeof user.id === "string" &&
    "name" in user && typeof user.name === "string" && "username" in user && typeof user.username === "string" &&
    "role" in user && ["admin", "user"].includes(String(user.role)) &&
    "status" in user && ["pending", "active", "rejected", "inactive", "deleted"].includes(String(user.status))
  )) throw new BackendError("Respons daftar pengguna tidak valid.", 502);
  return users as User[];
}
