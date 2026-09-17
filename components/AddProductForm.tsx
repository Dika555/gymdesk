"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";

type Props = {
  onSuccess: () => void;
};

export default function AddProductForm({ onSuccess }: Props) {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama produk harus diisi.");
      return;
    }

    if (!price || Number(price) < 0) {
      alert("Harga produk tidak valid.");
      return;
    }

    if (!stock || Number(stock) < 0) {
      alert("Stok produk tidak valid.");
      return;
    }

    if (!minStock || Number(minStock) < 0) {
      alert("Minimal stok tidak valid.");
      return;
    }

    setSaving(true);

    const branchId = getActiveBranchId();

    if (!branchId) {
      alert("Cabang aktif belum dipilih.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("products").insert({
      branch_id: branchId,
      name: name.trim(),
      category: category.trim() || null,
      price: Number(price),
      stock: Number(stock),
      min_stock: Number(minStock),
      status: "active",
    });

    if (error) {
      console.error("Gagal menyimpan produk:", error);
      alert("Gagal menyimpan produk.");
      setSaving(false);
      return;
    }

    alert("Produk berhasil ditambahkan.");

    setName("");
    setCategory("");
    setPrice("");
    setStock("");
    setMinStock("");
    setSaving(false);

    onSuccess();
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
          placeholder="Contoh: Air Mineral"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
          required
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
          placeholder="Contoh: Minuman"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
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
          placeholder="Contoh: 5000"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Stok Awal
          </label>

          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Contoh: 50"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Minimal Stok
          </label>

          <input
            type="number"
            min="0"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            placeholder="Contoh: 10"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Menyimpan..." : "Simpan Produk"}
      </button>
    </form>
  );
}