
"use client";

import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Cari data...",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <Search
        size={17}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
      />

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="
          w-full rounded-lg border border-zinc-100
          bg-white py-2.5 pl-10 pr-10 text-sm
          text-zinc-800 outline-none
          placeholder:text-zinc-400
          focus:border-[#4D0077]
          focus:ring-2 focus:ring-[#4D0077]/10
          transition-all
        "
      />

      {value && (
        <button
          type="button"
          aria-label="Hapus pencarian"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 hover:text-zinc-700"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
