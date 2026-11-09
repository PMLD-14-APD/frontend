"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function EvidenceButton({ id, label }: { id: number; label: string }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <>
      <button type="button" aria-label={`Lihat dokumentasi #${id}`} className="inline-flex items-center gap-1 rounded-full bg-[#EEEAF0] px-3 py-1 text-xs text-[#4D0077]"
        onClick={() => { setFailed(false); setOpen(true); }}>
        <Eye size={13} /> Lihat
      </button>
      {open && (
        <Modal open onClose={() => setOpen(false)} title="Dokumentasi Pelanggaran" description={label} wide>
          {failed ? <p role="alert" className="p-6 text-center text-sm text-zinc-500">Foto bukti tidak dapat dimuat.</p> :
            <Image unoptimized src={`/api/monitoring/evidence/${id}`} alt={label} width={1280} height={720} onError={() => setFailed(true)} className="max-h-[70dvh] w-full object-contain" />}
          <div className="mt-4 flex justify-end"><Button variant="secondary" onClick={() => setOpen(false)}>Tutup</Button></div>
        </Modal>
      )}
    </>
  );
}
