"use client";

import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
  onSuccess: () => void;
};

export default function DeleteProductButton({
  productId,
  productName,
  onSuccess,
}: DeleteProductButtonProps) {
  const supabase = createClient();

  async function handleDelete() {
    const confirmed = window.confirm(
      `Yakin ingin menghapus produk "${productName}"?`
    );

    if (!confirmed) return;

    const branchId = getActiveBranchId();

    if (!branchId) {
      alert("Cabang aktif belum dipilih.");
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("branch_id", branchId);

    if (error) {
      console.error(error);

      alert(
        "Produk tidak dapat dihapus. Jika produk sudah pernah digunakan dalam transaksi, gunakan status Nonaktif."
      );

      return;
    }

    alert("Produk berhasil dihapus.");

    onSuccess();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm font-medium text-red-600 hover:text-red-700"
    >
      Hapus
    </button>
  );
}