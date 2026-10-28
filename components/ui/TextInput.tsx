
import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

interface TextInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
}

export default function TextInput({
  label,
  icon,
  error,
  className = "",
  id,
  ...props
}: TextInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-xs font-medium text-zinc-800"
      >
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`
            w-full rounded-xl border border-zinc-200
            bg-white py-2.5 text-sm text-zinc-900
            placeholder:text-zinc-400
            outline-none transition-colors
            focus-visible:border-[#4D0077]
            focus-visible:ring-2 focus-visible:ring-[#4D0077]/15
            disabled:opacity-60
            ${icon ? "pl-10" : "pl-3"}
            pr-3
            ${error ? "border-red-500" : ""}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
