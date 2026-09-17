"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";

type TrainerReport = {
  id: string;
  name: string;
  memberCount: number;
};

type ProductReport = {
  id: string;
  name: string;
  stock: number;
  min_stock: number;
  sold: number;
};

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [newMembers, setNewMembers] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [renewals, setRenewals] = useState(0);

  const [trainers, setTrainers] = useState<TrainerReport[]>([]);
  const [products, setProducts] = useState<ProductReport[]>([]);

  const [loading, setLoading] = useState(false);

  async function getReport() {
    if (!startDate || !endDate) {
      return;
    }

    setLoading(true);

    const supabase = createClient();

    // Mengambil cabang yang sedang dipilih di Switch Cabang.
    const branchId = getActiveBranchId();

    if (!branchId) {
      setLoading(false);
      return;
    }

    // Supaya tanggal akhir tetap ikut dihitung.
    const nextDate = new Date(`${endDate}T00:00:00`);
    nextDate.setDate(nextDate.getDate() + 1);

    const nextDateString = nextDate
      .toISOString()
      .split("T")[0];

    const [
      newMembersResult,
      visitsResult,
      revenueResult,
      membershipsResult,
      trainerResult,
      trainerMemberResult,
      productsResult,
      transactionResult,
      transactionItemsResult,
    ] = await Promise.all([
      // Member baru
      supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", branchId)
        .gte("created_at", `${startDate}T00:00:00`)
        .lt("created_at", nextDateString),

      // Total kunjungan
      supabase
        .from("visits")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", branchId)
        .gte("visit_date", startDate)
        .lt("visit_date", nextDateString),

      // Total pendapatan
      supabase
        .from("transactions")
        .select("total_amount")
        .eq("branch_id", branchId)
        .eq("status", "completed")
        .gte("transaction_date", `${startDate}T00:00:00`)
        .lt("transaction_date", nextDateString),

      // Membership pada periode tersebut
      supabase
        .from("memberships")
        .select("id, member_id, start_date")
        .eq("branch_id", branchId)
        .gte("start_date", startDate)
        .lt("start_date", nextDateString),

      // Trainer
      supabase
        .from("trainers")
        .select("id, name")
        .eq("branch_id", branchId)
        .eq("status", "active"),

      // Relasi trainer dengan member
      supabase
        .from("trainer_members")
        .select("trainer_id, member_id"),

      // Produk
      supabase
        .from("products")
        .select("id, name, stock, min_stock")
        .eq("branch_id", branchId)
        .eq("status", "active"),

      // Transaksi produk pada periode tersebut
      supabase
        .from("transactions")
        .select("id, transaction_date, status")
        .eq("branch_id", branchId)
        .eq("transaction_type", "product")
        .eq("status", "completed")
        .gte("transaction_date", `${startDate}T00:00:00`)
        .lt("transaction_date", nextDateString),

      // Detail produk yang terjual
      supabase
        .from("transaction_items")
        .select("transaction_id, product_id, quantity"),
    ]);

    // =========================
    // MEMBER BARU
    // =========================

    setNewMembers(newMembersResult.count ?? 0);

    // =========================
    // TOTAL VISIT
    // =========================

    setTotalVisits(visitsResult.count ?? 0);

    // =========================
    // TOTAL PENDAPATAN
    // =========================

    const revenue =
      revenueResult.data?.reduce(
        (total, transaction) =>
          total + Number(transaction.total_amount ?? 0),
        0,
      ) ?? 0;

    setTotalRevenue(revenue);

    // =========================
    // RENEWAL
    // =========================

    let renewalCount = 0;

    if (membershipsResult.data) {
      for (const membership of membershipsResult.data) {
        const { count } = await supabase
          .from("memberships")
          .select("*", { count: "exact", head: true })
          .eq("member_id", membership.member_id)
          .lt("start_date", membership.start_date);

        if ((count ?? 0) > 0) {
          renewalCount++;
        }
      }
    }

    setRenewals(renewalCount);

    // =========================
    // LAPORAN TRAINER
    // =========================

    const trainerReports: TrainerReport[] =
      trainerResult.data?.map((trainer) => {
        const memberCount =
          trainerMemberResult.data?.filter(
            (relation) => relation.trainer_id === trainer.id,
          ).length ?? 0;

        return {
          id: trainer.id,
          name: trainer.name,
          memberCount,
        };
      }) ?? [];

    setTrainers(trainerReports);

    // =========================
    // LAPORAN PRODUK
    // =========================

    const productReports: ProductReport[] =
      productsResult.data?.map((product) => {
        let sold = 0;

        const productItems =
          transactionItemsResult.data?.filter(
            (item) => item.product_id === product.id,
          ) ?? [];

        for (const item of productItems) {
          const isValidTransaction =
            transactionResult.data?.some(
              (transaction) =>
                transaction.id === item.transaction_id,
            );

          if (isValidTransaction) {
            sold += Number(item.quantity ?? 0);
          }
        }

        return {
          id: product.id,
          name: product.name,
          stock: product.stock,
          min_stock: product.min_stock,
          sold,
        };
      }) ?? [];

    setProducts(productReports);

    setLoading(false);
  }

  useEffect(() => {
    getReport();
  }, [startDate, endDate]);

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Laporan
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Ringkasan aktivitas dan transaksi gym berdasarkan periode.
          </p>
        </div>

        {/* FILTER PERIODE */}

        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-zinc-900">
            Filter Laporan
          </h2>

          <div className="mt-4 max-w-sm">
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Periode
            </label>

            <select
              value={selectedPeriod}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedPeriod(value);

                if (value === "custom") {
                  setStartDate("");
                  setEndDate("");
                  return;
                }

                if (!value) {
                  setStartDate("");
                  setEndDate("");
                  return;
                }

                const [year, month] = value.split("-");

                const firstDay = `${year}-${month}-01`;

                const lastDay = new Date(
                  Number(year),
                  Number(month),
                  0,
                )
                  .toISOString()
                  .split("T")[0];

                setStartDate(firstDay);
                setEndDate(lastDay);
              }}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-orange-500"
            >
              <option value="">Pilih periode</option>

              <option value="2026-01">Januari 2026</option>
              <option value="2026-02">Februari 2026</option>
              <option value="2026-03">Maret 2026</option>
              <option value="2026-04">April 2026</option>
              <option value="2026-05">Mei 2026</option>
              <option value="2026-06">Juni 2026</option>
              <option value="2026-07">Juli 2026</option>
              <option value="2026-08">Agustus 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-10">Oktober 2026</option>
              <option value="2026-11">November 2026</option>
              <option value="2026-12">Desember 2026</option>

              <option value="custom">Custom</option>
            </select>
          </div>

          {selectedPeriod === "custom" && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 max-w-lg">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Tanggal Mulai
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Tanggal Akhir
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* RINGKASAN */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">
              Member Baru
            </p>

            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {loading ? "..." : newMembers}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">
              Renewal
            </p>

            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {loading ? "..." : renewals}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">
              Total Visit
            </p>

            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {loading ? "..." : totalVisits}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">
              Pendapatan
            </p>

            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {loading
                ? "..."
                : `Rp ${totalRevenue.toLocaleString("id-ID")}`}
            </p>
          </div>
        </div>

        {/* TRAINER */}

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-5">
            <h2 className="text-lg font-semibold text-zinc-900">
              Laporan Trainer
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Jumlah member yang ditangani setiap trainer.
            </p>
          </div>

          {trainers.length === 0 ? (
            <div className="p-5 text-sm text-zinc-500">
              Belum ada data trainer.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50">
                  <tr>
                    <th className="px-5 py-3 font-medium text-zinc-600">
                      Trainer
                    </th>

                    <th className="px-5 py-3 font-medium text-zinc-600">
                      Member Ditangani
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {trainers.map((trainer) => (
                    <tr
                      key={trainer.id}
                      className="border-b border-zinc-100 last:border-0"
                    >
                      <td className="px-5 py-4 font-medium text-zinc-900">
                        {trainer.name}
                      </td>

                      <td className="px-5 py-4 text-zinc-600">
                        {trainer.memberCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PRODUK */}

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-5">
            <h2 className="text-lg font-semibold text-zinc-900">
              Laporan Produk & Stok
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Penjualan produk dan kondisi stok saat ini.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="p-5 text-sm text-zinc-500">
              Belum ada data produk.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50">
                  <tr>
                    <th className="px-5 py-3 font-medium text-zinc-600">
                      Produk
                    </th>

                    <th className="px-5 py-3 font-medium text-zinc-600">
                      Terjual
                    </th>

                    <th className="px-5 py-3 font-medium text-zinc-600">
                      Stok
                    </th>

                    <th className="px-5 py-3 font-medium text-zinc-600">
                      Minimum Stok
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-zinc-100 last:border-0"
                    >
                      <td className="px-5 py-4 font-medium text-zinc-900">
                        {product.name}
                      </td>

                      <td className="px-5 py-4 text-zinc-600">
                        {product.sold}
                      </td>

                      <td className="px-5 py-4 text-zinc-600">
                        {product.stock}
                      </td>

                      <td className="px-5 py-4 text-zinc-600">
                        {product.min_stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}