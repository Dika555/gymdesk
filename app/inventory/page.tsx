"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import AddProductButton from "@/components/AddProductButton";
import AddStockButton from "@/components/AddStockButton";
import StockHistory from "@/components/StockHistory";
import EditProductButton from "@/components/EditProductButton";
import DeleteProductButton from "@/components/DeleteProductButton";

type Product = {
  id: string;
  name: string;
  category: string | null;
  price: number;
  stock: number;
  min_stock: number;
  status: string;
};

export default function InventoryPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function getProducts() {
    setLoading(true);

    const branchId = getActiveBranchId();

    if (!branchId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("id, name, category, price, stock, min_stock, status")
      .eq("branch_id", branchId)
      .order("name", { ascending: true });

    if (error) {
      console.error("Gagal mengambil produk:", error);
      setLoading(false);
      return;
    }

    setProducts(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    getProducts();
  }, []);

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return (
    <main className="min-h-screen bg-white p-6 text-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventory</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Kelola produk dan stok gym.
          </p>
        </div>

        <div className="flex gap-2">
          <AddStockButton />
          <AddProductButton onSuccess={() => window.location.reload()} />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr className="border-b border-zinc-200 text-left text-sm">
              <th className="px-5 py-4 font-medium text-zinc-600">
                Produk
              </th>
              <th className="px-5 py-4 font-medium text-zinc-600">
                Kategori
              </th>
              <th className="px-5 py-4 font-medium text-zinc-600">
                Harga
              </th>
              <th className="px-5 py-4 font-medium text-zinc-600">
                Stok
              </th>
              <th className="px-5 py-4 font-medium text-zinc-600">
                Status
              </th>
              <th className="px-5 py-3 font-medium text-zinc-600">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-sm text-zinc-500"
                >
                  Memuat produk...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-sm text-zinc-500"
                >
                  Belum ada produk.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-zinc-100 last:border-0"
                >
                  <td className="px-5 py-4 text-sm font-medium">
                    {product.name}
                  </td>

                  <td className="px-5 py-4 text-sm text-zinc-600">
                    {product.category ?? "-"}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {formatRupiah(product.price)}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {product.stock}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    <span
                      className={
                        product.stock <= product.min_stock
                          ? "rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                          : "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                      }
                    >
                      {product.stock <= product.min_stock
                        ? "Stok Menipis"
                        : "Tersedia"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex gap-3">
                      <EditProductButton productId={product.id} />

                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                        onSuccess={() => window.location.reload()}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <StockHistory />
    </main>
  );
}