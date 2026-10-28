
"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
      className="
        fixed inset-0 m-auto
        w-[calc(100%-2rem)] max-w-[430px]
        max-h-[calc(100dvh-2rem)]
        overflow-y-auto rounded-xl
        border border-zinc-100 bg-white
        p-0 text-zinc-900 shadow-xl
        backdrop:bg-black/55
      "
    >
      <div className="px-8 py-8 sm:px-9">
        <div className="mb-8 text-center">
          <h2
            id="modal-title"
            className="text-xl font-semibold"
          >
            {title}
          </h2>

          {description && (
            <p
              id="modal-description"
              className="mt-1 text-sm text-zinc-500"
            >
              {description}
            </p>
          )}
        </div>

        {children}
      </div>
    </dialog>
  );
}
