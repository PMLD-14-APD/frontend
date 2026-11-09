
"use client";

import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import TextInput from "./TextInput";

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

export default function PasswordInput({
  label,
  error,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <TextInput
        {...props}
        label={label}
        error={error}
        icon={<LockKeyhole size={17} />}
        type={visible ? "text" : "password"}
        className="pr-11"
      />

      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        aria-pressed={visible}
        disabled={props.disabled}
        className="
          absolute right-3 top-[30px]
          cursor-pointer text-zinc-400
          hover:text-[#4D0077]
          focus-visible:rounded
          focus-visible:outline-2
          focus-visible:outline-[#4D0077]
        "
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
