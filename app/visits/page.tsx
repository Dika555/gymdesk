"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import AddVisitButton from "@/components/AddVisitButton";

type Visit = {
  id: string;
  visitor_name: string | null;
  visit_date: string;
  visit_fee: number;
  payment_method: string | null;
  member: {
    name: string;
  } | null;
};

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);

  async function getVisits() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setVisits([]);
      return;
    }

    const { data, error } = await supabase
      .from("visits")
      .select(`
        id,
        visitor_name,
        visit_date,
        visit_fee,
        payment_method,
        member:members (
          name
        )
      `)
      .eq("branch_id", branchId)
      .order("visit_date", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setVisits(
      (data ?? []).map((visit) => ({
        ...visit,
        member: visit.member?.[0] ?? null,
      }))
    );
  }

  useEffect(() => {
    getVisits();
  }, []);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatCurrency(amount: number) {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Kunjungan
          </h1>

          <p className="mt-1 text-gray-500">
            Catat dan lihat riwayat kunjungan gym.
          </p>
        </div>

        <AddVisitButton onSuccess={getVisits} />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Tanggal
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium">
                Nama
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium">
                Tipe
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium">
                Biaya
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium">
                Pembayaran
              </th>
            </tr>
          </thead>

          <tbody>
            {visits.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  Belum ada data kunjungan.
                </td>
              </tr>
            ) : (
              visits.map((visit) => {
                const isMember = visit.member !== null;

                return (
                  <tr
                    key={visit.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-4 py-3 text-sm">
                      {formatDate(visit.visit_date)}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium">
                      {visit.member?.name ?? visit.visitor_name}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {isMember ? "Member" : "Non-member"}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {formatCurrency(visit.visit_fee)}
                    </td>

                    <td className="px-4 py-3 text-sm capitalize">
                      {visit.payment_method ?? "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}