"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";

type Product = {
  id: string;
  name: string;
  stock: number;
};

type AddStockFormProps = {
  onSuccess: () => void;
};

export default function AddStockForm({
  onSuccess,
}: AddStockFormProps) {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const branchId = getActiveBranchId();

    if (!branchId) {
      setProducts([]);
      setLoadingProducts(false);
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("id, name, stock")
      .eq("branch_id", branchId)
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      alert("Gagal mengambil data produk.");
    } else {
      setProducts(data || []);
    }

    setLoadingProducts(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!productId) {
      alert("Pilih produk terlebih dahulu.");
      return;
    }

    const amount = Number(quantity);

    if (!amount || amount <= 0) {
      alert("Jumlah stok harus lebih dari 0.");
      return;
    }

    setSaving(true);


    const branchId = getActiveBranchId();

    if (!branchId) {
      alert("Cabang aktif belum dipilih.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.rpc("add_stock", {
      p_branch_id: branchId,
      p_product_id: productId,
      p_quantity: amount,
      p_description: description.trim() || null,
    });

    if (error) {
      console.error("Gagal menambahkan stok:", error);
      alert(error.message);
      setSaving(false);
      return;
    }

    alert("Stok berhasil ditambahkan.");

    setProductId("");
    setQuantity("");
    setDescription("");
    setSaving(false);

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Produk
        </label>

        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          disabled={loadingProducts || saving}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        >
          <option value="">
            {loadingProducts
              ? "Memuat produk..."
              : "Pilih produk"}
          </option>

          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} — Stok saat ini: {product.stock}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Jumlah Stok
        </label>

        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={saving}
          placeholder="Masukkan jumlah stok"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Keterangan
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={saving}
          placeholder="Contoh: Restock dari supplier"
          rows={3}
          className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
      </div>

      <button
        type="submit"
        disabled={saving || loadingProducts}
        className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Menyimpan..." : "Simpan Stok"}
      </button>
    </form>
  );
}