"use client";

import { useState } from "react";
import AddProductModal from "@/components/AddProductModal";

type Props = {
  onSuccess: () => void;
};

export default function AddProductButton({ onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
      >
        + Tambah Produk
      </button>

      {isOpen && (
        <AddProductModal
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