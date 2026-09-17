"use client";

import AddProductForm from "@/components/AddProductForm";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddProductModal({
  onClose,
  onSuccess,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900">
            Tambah Produk
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-zinc-400 hover:text-zinc-700"
          >
            ×
          </button>
        </div>

        <AddProductForm onSuccess={onSuccess} />

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-lg border border-zinc-300 px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Batal
        </button>
      </div>
    </div>
  );
}