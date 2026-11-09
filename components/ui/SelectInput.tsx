
import { ChevronDown } from "lucide-react";
import { useId } from "react";
import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export default function SelectInput({
  label,
  options,
  placeholder = "Pilih opsi",
  error,
  id,
  ...props
}: SelectInputProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={selectId}
        className="block text-xs font-medium text-zinc-800"
      >
        {label}
      </label>

      <div className="relative">
        <select
          {...props}
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className="
            w-full appearance-none rounded-xl
            border border-zinc-200 bg-white
            px-3 py-2.5 pr-9 text-sm
            text-zinc-800 outline-none
            focus-visible:border-[#4D0077]
            focus-visible:ring-2 focus-visible:ring-[#4D0077]/15
          "
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
      </div>

      {error && (
        <p id={`${selectId}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
