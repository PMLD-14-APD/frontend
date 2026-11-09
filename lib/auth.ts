
import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { getBackendUrl } from "./backend";

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  role: string;
  status: string;
};

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("apd_access_token")?.value;

  if (!token) {
    return null;
  }

  const apiUrl = getBackendUrl();

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      return null;
    }

    const user: AuthUser = await response.json();

    if (user.status !== "active") {
      return null;
    }

    return user;
  } catch {
    return null;
  }
});
