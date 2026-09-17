"use client";

import { useState } from "react";
import EditProductModal from "./EditProductModal";

type EditProductButtonProps = {
  productId: string;
};

export default function EditProductButton({
  productId,
}: EditProductButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-orange-600 hover:text-orange-700"
      >
        Edit
      </button>

      <EditProductModal
        open={open}
        onClose={() => setOpen(false)}
        productId={productId}
      />
    </>
  );
}