"use client";

import { useState } from "react";
import AddStockModal from "./AddStockModal";

export default function AddStockButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
      >
        + Tambah Stok
      </button>

      <AddStockModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}