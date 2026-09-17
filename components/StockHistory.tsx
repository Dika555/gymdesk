"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";

type StockMovement = {
  id: string;
  type: string;
  quantity: number;
  description: string | null;
  created_at: string;
  products: {
    name: string;
  } | null;
};
export default function StockHistory() {
  const supabase = createClient();

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const branchId = getActiveBranchId();

    if (!branchId) {
      setMovements([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("stock_movements")
      .select(`
      id,
      type,
      quantity,
      description,
      created_at,
      products (
        name
      )
    `)
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error(error);
      alert("Gagal mengambil riwayat stok.");
    } else {
      setMovements(
        (data ?? []).map((movement) => ({
          ...movement,
          products: movement.products?.[0] ?? null,
        }))
      );
    }

    setLoading(false);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 p-5">
        <h2 className="text-lg font-semibold text-zinc-900">
          Riwayat Stok
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Riwayat stok masuk dan keluar.
        </p>
      </div>

      {loading ? (
        <div className="p-5 text-sm text-zinc-500">
          Memuat riwayat...
        </div>
      ) : movements.length === 0 ? (
        <div className="p-5 text-sm text-zinc-500">
          Belum ada riwayat stok.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-5 py-3 font-medium text-zinc-600">
                  Tanggal
                </th>
                <th className="px-5 py-3 font-medium text-zinc-600">
                  Produk
                </th>
                <th className="px-5 py-3 font-medium text-zinc-600">
                  Jenis
                </th>
                <th className="px-5 py-3 font-medium text-zinc-600">
                  Jumlah
                </th>
                <th className="px-5 py-3 font-medium text-zinc-600">
                  Keterangan
                </th>
              </tr>
            </thead>

            <tbody>
              {movements.map((movement) => (
                <tr
                  key={movement.id}
                  className="border-b border-zinc-100 last:border-0"
                >
                  <td className="px-5 py-4 text-zinc-600">
                    {formatDate(movement.created_at)}
                  </td>

                  <td className="px-5 py-4 font-medium text-zinc-900">
                    {movement.products?.name || "-"}
                  </td>

                  <td className="px-5 py-4">
                    {movement.type === "in" ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        Stok Masuk
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                        Stok Keluar
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 font-medium text-zinc-900">
                    {movement.type === "in" ? "+" : "-"}
                    {movement.quantity}
                  </td>

                  <td className="px-5 py-4 text-zinc-600">
                    {movement.description || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}