"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import AddVisitButton from "@/components/AddVisitButton";

type Visit = {
  id: string;
  member_id: string | null;
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

  // Ambil data kunjungan
  const { data: visitData, error: visitError } = await supabase
    .from("visits")
    .select(`
      id,
      member_id,
      visitor_name,
      visit_date,
      visit_fee,
      payment_method
    `)
    .eq("branch_id", branchId)
    .order("visit_date", { ascending: false });

  if (visitError) {
    console.error(visitError);
    return;
  }

  // Ambil data member dari cabang aktif
  const { data: memberData, error: memberError } = await supabase
    .from("members")
    .select("id, name")
    .eq("branch_id", branchId);

  if (memberError) {
    console.error(memberError);
    return;
  }

  // Buat pasangan ID member → nama member
  const membersMap = new Map(
    (memberData ?? []).map((member) => [
      member.id,
      member.name,
    ])
  );

  // Gabungkan data visit dengan nama member
  const formattedVisits: Visit[] = (visitData ?? []).map((visit) => ({
    id: visit.id,
    member_id: visit.member_id,
    visitor_name: visit.visitor_name,
    visit_date: visit.visit_date,
    visit_fee: visit.visit_fee,
    payment_method: visit.payment_method,

    member: visit.member_id
      ? {
          name:
            membersMap.get(visit.member_id) ??
            "Member tidak ditemukan",
        }
      : null,
  }));

  setVisits(formattedVisits);
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