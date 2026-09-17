"use client";

import { useEffect } from "react";
import AddTransactionForm from "@/components/AddTransactionForm";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddTransactionModal({
  onClose,
  onSuccess,
}: Props) {
  useEffect(() => {
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = "";
  };
}, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-zinc-900">
            Tambah Transaksi
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-zinc-400 hover:text-zinc-700"
          >
            ×
          </button>
        </div>

        {/* Form - bagian ini yang bisa scroll */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <AddTransactionForm onSuccess={onSuccess} />
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-zinc-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}