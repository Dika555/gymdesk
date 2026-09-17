"use client";

import EditProductForm from "./EditProductForm";

type EditProductModalProps = {
  open: boolean;
  onClose: () => void;
  productId: string;
};

export default function EditProductModal({
  open,
  onClose,
  productId,
}: EditProductModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            Edit Produk
          </h2>

          <button
            onClick={onClose}
            className="text-xl text-zinc-400 hover:text-zinc-700"
          >
            ×
          </button>
        </div>

        <EditProductForm
          productId={productId}
          onSuccess={onClose}
        />
      </div>
    </div>
  );
}