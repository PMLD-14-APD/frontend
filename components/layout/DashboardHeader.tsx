
import { CircleUserRound } from "lucide-react";
import { USER_ROLE_LABELS } from "@/type/user";
import type { AuthUser } from "../../lib/auth";

type DashboardHeaderProps = {
  user: AuthUser;
};

export default function DashboardHeader({
  user,
}: DashboardHeaderProps) {
  const roleLabel = user.role === "admin" || user.role === "user" ? USER_ROLE_LABELS[user.role] : user.role;

  return (
    <header className="flex h-20 shrink-0 items-center justify-end border-b border-zinc-100 bg-white px-6 pl-16 sm:px-8 lg:px-10">
      <div className="flex items-center gap-3">
        <div className="min-w-0 text-right">
          <p className="max-w-48 truncate text-sm font-medium text-zinc-800">
            {user.name}
          </p>

          <p className="text-xs text-zinc-400">
            {roleLabel}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0EAF4] text-[#4D0077]">
          <CircleUserRound size={26} />
        </div>
      </div>
    </header>
  );
}
