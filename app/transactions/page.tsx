"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import AddTransactionButton from "@/components/AddTransactionButton";

type Transaction = {
  id: string;
  transaction_type: string;
  payment_method: string;
  total_amount: number;
  status: string;
  transaction_date: string;
  notes: string | null;
  members: {
    name: string;
  } | null;
};

const ITEMS_PER_PAGE = 10;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  async function getTransactions() {
    setLoading(true);

    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id,
        transaction_type,
        payment_method,
        total_amount,
        status,
        transaction_date,
        notes,
        members (
          name
        )
      `)
      .eq("branch_id", branchId)
      .order("transaction_date", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setTransactions(
      (data ?? []).map((transaction) => ({
        ...transaction,
        members: transaction.members?.[0] ?? null,
      }))
    );

    setLoading(false);
  }

  useEffect(() => {
    getTransactions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter]);

  const filteredTransactions = transactions.filter(
    (transaction) => {
      const memberName =
        transaction.members?.name?.toLowerCase() ?? "";

      const keyword = search.toLowerCase();

      const matchesSearch =
        memberName.includes(keyword) ||
        transaction.payment_method
          .toLowerCase()
          .includes(keyword);

      const matchesType =
        typeFilter === "all" ||
        transaction.transaction_type === typeFilter;

      return matchesSearch && matchesType;
    },
  );

  const totalPages = Math.ceil(
    filteredTransactions.length / ITEMS_PER_PAGE,
  );

  const startIndex =
    (currentPage - 1) * ITEMS_PER_PAGE;

  const currentTransactions =
    filteredTransactions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE,
    );

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    );
  }

  function formatCurrency(amount: number) {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  }

  function formatType(type: string) {
    switch (type) {
      case "registration":
        return "Pendaftaran";

      case "membership":
        return "Membership";

      case "product":
        return "Produk";

      default:
        return "Lainnya";
    }
  }

  function formatPaymentMethod(method: string) {
    switch (method) {
      case "cash":
        return "Cash";

      case "qris":
        return "QRIS";

      case "transfer":
        return "Transfer";

      default:
        return method;
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Transactions
          </h1>

          <p className="mt-1 text-gray-500">
            Riwayat seluruh transaksi GymDesk.
          </p>
        </div>

        <AddTransactionButton
          onSuccess={getTransactions}
        />
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        {/* Search & Filter */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari member atau metode pembayaran..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-orange-500 md:max-w-md"
          />

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-orange-500"
          >
            <option value="all">
              Semua Transaksi
            </option>

            <option value="registration">
              Pendaftaran
            </option>

            <option value="membership">
              Membership
            </option>

            <option value="product">
              Produk
            </option>

            <option value="other">
              Lainnya
            </option>
          </select>
        </div>

        {/* Loading */}
        {loading ? (
          <p className="py-10 text-center text-gray-500">
            Memuat transaksi...
          </p>
        ) : filteredTransactions.length === 0 ? (
          /* Empty State */
          <p className="py-10 text-center text-gray-500">
            Tidak ada transaksi ditemukan.
          </p>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b text-left text-sm text-gray-500">
                    <th className="px-4 py-3">
                      Tanggal
                    </th>

                    <th className="px-4 py-3">
                      Member
                    </th>

                    <th className="px-4 py-3">
                      Tipe
                    </th>

                    <th className="px-4 py-3">
                      Pembayaran
                    </th>

                    <th className="px-4 py-3">
                      Total
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {currentTransactions.map(
                    (transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 text-sm">
                          {formatDate(
                            transaction.transaction_date,
                          )}
                        </td>

                        <td className="px-4 py-4 font-medium">
                          {transaction.members?.name ??
                            "Non-member"}
                        </td>

                        <td className="px-4 py-4">
                          {formatType(
                            transaction.transaction_type,
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {formatPaymentMethod(
                            transaction.payment_method,
                          )}
                        </td>

                        <td className="px-4 py-4 font-medium">
                          {formatCurrency(
                            transaction.total_amount,
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={
                              transaction.status ===
                                "completed"
                                ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                                : "rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                            }
                          >
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Menampilkan{" "}
                {startIndex + 1} -{" "}
                {Math.min(
                  startIndex + ITEMS_PER_PAGE,
                  filteredTransactions.length,
                )}{" "}
                dari{" "}
                {filteredTransactions.length}{" "}
                transaksi
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(page - 1, 1),
                    )
                  }
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sebelumnya
                </button>

                <span className="px-2 text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(
                        page + 1,
                        totalPages,
                      ),
                    )
                  }
                  disabled={
                    currentPage === totalPages
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}