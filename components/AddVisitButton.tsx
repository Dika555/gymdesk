"use client";

import { useState } from "react";
import AddVisitModal from "@/components/AddVisitModal";

type Props = {
  onSuccess: () => void;
};

export default function AddVisitButton({ onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
      >
        + Catat Kunjungan
      </button>

      {isOpen && (
        <AddVisitModal
          onClose={() => setIsOpen(false)}
          onSuccess={() => {
            setIsOpen(false);
            onSuccess();
          }}
        />
      )}
    </>
  );
}