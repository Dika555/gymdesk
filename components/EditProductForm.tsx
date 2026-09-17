"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";

type EditProductFormProps = {
  productId: string;
  onSuccess: () => void;
};

export default function EditProductForm({
  productId,
  onSuccess,
}: EditProductFormProps) {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [minStock, setMinStock] = useState("");
  const [status, setStatus] = useState("active");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  async function loadProduct() {
    const branchId = getActiveBranchId();

    if (!branchId) {
      alert("Cabang aktif belum dipilih.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("name, category, price, min_stock, status")
      .eq("id", productId)
      .eq("branch_id", branchId)
      .single();

    if (error || !data) {
      console.error(error);
      alert("Gagal mengambil data produk.");
      setLoading(false);
      return;
    }

    setName(data.name || "");
    setCategory(data.category || "");
    setPrice(String(data.price ?? ""));
    setMinStock(String(data.min_stock ?? ""));
    setStatus(data.status || "active");

    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama produk harus diisi.");
      return;
    }

    if (!price || Number(price) < 0) {
      alert("Harga produk tidak valid.");
      return;
    }

    if (!minStock || Number(minStock) < 0) {
      alert("Minimum stok tidak valid.");
      return;
    }

    setSaving(true);

    const branchId = getActiveBranchId();

    if (!branchId) {
      alert("Cabang aktif belum dipilih.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({
        name: name.trim(),
        category: category.trim() || null,
        price: Number(price),
        min_stock: Number(minStock),
        status,
      })
      .eq("id", productId)
      .eq("branch_id", branchId);

    if (error) {
      console.error(error);
      alert("Gagal mengubah produk.");
      setSaving(false);
      return;
    }

    alert("Produk berhasil diubah.");

    setSaving(false);
    onSuccess();
  }

  if (loading) {
    return (
      <p className="text-sm text-zinc-500">
        Memuat data produk...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Nama Produk
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={saving}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Kategori
        </label>

        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={saving}
          placeholder="Contoh: Minuman"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Harga
        </label>

        <input
          type="number"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={saving}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Minimum Stok
        </label>

        <input
          type="number"
          min="0"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
          disabled={saving}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Status
        </label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={saving}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        >
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}