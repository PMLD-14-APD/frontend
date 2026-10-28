
import type { ReactNode } from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[170px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
        {icon ?? <FolderOpen size={20} strokeWidth={1.7} />}
      </div>

      <h3 className="text-sm font-semibold text-zinc-800">
        {title}
      </h3>

      {description && (
        <p className="mt-1 max-w-md text-xs leading-relaxed text-zinc-400">
          {description}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
