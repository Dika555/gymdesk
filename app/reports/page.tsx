"use client";

import SummaryReport from "@/components/reports/SummaryReport";
import MembersReport from "@/components/reports/MembersReport";
import MembershipReport from "@/components/reports/MembershipReport";
import VisitsReport from "@/components/reports/VisitsReport";
import TrainersReport from "@/components/reports/TrainersReport";
{/*kela

import TransactionReport from "@/components/reports/TransactionReport"
import ProductReport from "@/components/reports/ProductReport"
 */}


import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";

const reportOptions = [
  { id: "summary", label: "Ringkasan" },
  { id: "members", label: "Data Member" },
  { id: "membership", label: "Data Membership" },
  { id: "visits", label: "Data Kunjungan" },
  { id: "trainers", label: "Data Trainer" },
  { id: "transactions", label: "Data Transaksi" },
  { id: "products", label: "Data Produk & Stok" },
];

export default function ReportsPage() {
  const [selectedReports, setSelectedReports] = useState<string[]>(
    reportOptions.map((report) => report.id)
  );

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [message, setMessage] = useState("");

  const [summary, setSummary] = useState({
    newMembers: 0,
    newMemberships: 0,
    totalVisits: 0,
    totalTransactions: 0,
    totalRevenue: 0,
  });

  const [memberReport, setMemberReport] = useState<
    {
      id: string;
      name: string;
      phone: string | null;
      email: string | null;
      gender: string | null;
      address: string | null;
      status: string | null;
      created_at: string;
    }[]
  >([]);

  const [visitReport, setVisitReport] = useState<
    {
      id: string;
      memberName: string;
      visitDate: string;
      visitFee: number;
      paymentMethod: string | null;
      isMember: boolean;
    }[]
  >([]);

  const [membershipReport, setMembershipReport] = useState<
    {
      id: string;
      memberName: string;
      planName: string;
      startDate: string;
      endDate: string;
      status: string;
    }[]
  >([]);

  const [trainerReport, setTrainerReport] = useState<
    {
      id: string;
      name: string;
      memberCount: number;
      sessionCount: number;
      revenue: number;
    }[]
  >([]);

  const [showReport, setShowReport] = useState(false);

  function toggleReport(id: string) {
    setSelectedReports((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleAllReports() {
    if (selectedReports.length === reportOptions.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reportOptions.map((report) => report.id));
    }
  }

  async function loadSummary() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setMessage("Cabang aktif belum dipilih.");
      return;
    }

    const { count: newMembers, error: memberError } = await supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", branchId)
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`);

    if (memberError) {
      console.error(memberError);
      setMessage("Gagal mengambil data member.");
      return;
    }

    const { count: newMemberships, error: membershipError } = await supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", branchId)
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`);

    if (membershipError) {
      console.error(membershipError);
      setMessage("Gagal mengambil data membership.");
      return;
    }

    const { count: totalVisits, error: visitError } = await supabase
      .from("visits")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", branchId)
      .gte("visit_date", startDate)
      .lte("visit_date", endDate);

    if (visitError) {
      console.error(visitError);
      setMessage("Gagal mengambil data kunjungan.");
      return;
    }

    const { data: transactions, error: transactionError } = await supabase
      .from("transactions")
      .select("id, total_amount")
      .eq("branch_id", branchId)
      .gte("transaction_date", `${startDate}T00:00:00`)
      .lte("transaction_date", `${endDate}T23:59:59`)
      .eq("status", "completed");

    if (transactionError) {
      console.error(transactionError);
      setMessage("Gagal mengambil data transaksi.");
      return;
    }

    const totalRevenue = (transactions ?? []).reduce(
      (total, transaction) => total + Number(transaction.total_amount ?? 0),
      0
    );

    setSummary({
      newMembers: newMembers ?? 0,
      newMemberships: newMemberships ?? 0,
      totalVisits: totalVisits ?? 0,
      totalTransactions: transactions?.length ?? 0,
      totalRevenue,
    });

    setMessage("Laporan berhasil diperbarui.");
  }

  async function loadMemberReport() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setMessage("Cabang aktif belum dipilih.");
      return;
    }

    const { data, error } = await supabase
      .from("members")
      .select(`
      id,
      name,
      phone,
      email,
      gender,
      address,
      status,
      created_at
    `)
      .eq("branch_id", branchId)
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Gagal mengambil data member.");
      return;
    }

    setMemberReport(data ?? []);
  }

  async function handleShowReport() {
    setMessage("");

    if (!startDate || !endDate) {
      setMessage("Silakan pilih tanggal mulai dan tanggal akhir.");
      return;
    }

    if (startDate > endDate) {
      setMessage("Tanggal mulai tidak boleh lebih besar dari tanggal akhir.");
      return;
    }

    if (selectedReports.length === 0) {
      setMessage("Pilih minimal satu jenis laporan.");
      return;
    }

    setShowReport(true);

    if (selectedReports.includes("summary")) {
      await loadSummary();
    }

    if (selectedReports.includes("members")) {
      await loadMemberReport();
    }

    if (selectedReports.includes("membership")) {
      await loadMembershipReport();
    }

    if (selectedReports.includes("visits")) {
      await loadVisitReport();
    }

    if (selectedReports.includes("trainers")) {
      await loadTrainerReport();
    }
  }

  async function loadMembershipReport() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setMessage("Cabang aktif belum dipilih.");
      return;
    }

    const { data: memberships, error: membershipError } = await supabase
      .from("memberships")
      .select(`
      id,
      member_id,
      plan_id,
      start_date,
      end_date,
      status
    `)
      .eq("branch_id", branchId)
      .lte("start_date", endDate)
      .gte("end_date", startDate)
      .order("start_date", { ascending: false });

    if (membershipError) {
      console.error(membershipError);
      setMessage("Gagal mengambil data membership.");
      return;
    }

    const memberIds = [
      ...new Set(
        (memberships ?? []).map((membership) => membership.member_id)
      ),
    ];

    const planIds = [
      ...new Set(
        (memberships ?? []).map((membership) => membership.plan_id)
      ),
    ];

    const { data: members, error: memberError } = await supabase
      .from("members")
      .select("id, name")
      .eq("branch_id", branchId)
      .in("id", memberIds);

    if (memberError) {
      console.error(memberError);
      setMessage("Gagal mengambil data member membership.");
      return;
    }

    const { data: plans, error: planError } = await supabase
      .from("membership_plans")
      .select("id, name, price")
      .eq("branch_id", branchId)
      .in("id", planIds);

    if (planError) {
      console.error(planError);
      setMessage("Gagal mengambil data paket membership.");
      return;
    }

    const memberMap = new Map(
      (members ?? []).map((member) => [member.id, member.name])
    );

    const planMap = new Map(
      (plans ?? []).map((plan) => [
        plan.id,
        {
          name: plan.name,
          price: Number(plan.price ?? 0),
        },
      ])
    );

    setMembershipReport(
      (memberships ?? []).map((membership) => {
        const plan = planMap.get(membership.plan_id);

        return {
          id: membership.id,
          memberName:
            memberMap.get(membership.member_id) ?? "Member tidak ditemukan",
          planName: plan?.name ?? "Paket tidak ditemukan",
          startDate: membership.start_date,
          endDate: membership.end_date,
          status: membership.status,
        };
      })
    );
  }

  async function loadVisitReport() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setMessage("Cabang aktif belum dipilih.");
      return;
    }

    const { data: visits, error: visitError } = await supabase
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
      .gte("visit_date", startDate)
      .lte("visit_date", endDate)
      .order("visit_date", { ascending: false });

    if (visitError) {
      console.error(visitError);
      setMessage("Gagal mengambil data kunjungan.");
      return;
    }

    const memberIds = [
      ...new Set(
        (visits ?? [])
          .map((visit) => visit.member_id)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    let members: { id: string; name: string }[] = [];

    if (memberIds.length > 0) {
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .select("id, name")
        .eq("branch_id", branchId)
        .in("id", memberIds);

      if (memberError) {
        console.error(memberError);
        setMessage("Gagal mengambil data member kunjungan.");
        return;
      }

      members = memberData ?? [];
    }

    const memberMap = new Map(
      members.map((member) => [member.id, member.name])
    );

    setVisitReport(
      (visits ?? []).map((visit) => ({
        id: visit.id,
        memberName: visit.member_id
          ? memberMap.get(visit.member_id) ?? "Member tidak ditemukan"
          : visit.visitor_name ?? "Pengunjung",
        visitDate: visit.visit_date,
        visitFee: Number(visit.visit_fee ?? 0),
        paymentMethod: visit.payment_method,
        isMember: Boolean(visit.member_id),
      }))
    );
  }

  async function loadTrainerReport() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setMessage("Cabang aktif belum dipilih.");
      return;
    }

    // Ambil trainer pada cabang aktif
    const { data: trainers, error: trainerError } = await supabase
      .from("trainers")
      .select("id, name")
      .eq("branch_id", branchId)
      .order("name", { ascending: true });

    if (trainerError) {
      console.error(trainerError);
      setMessage("Gagal mengambil data trainer.");
      return;
    }

    if (!trainers || trainers.length === 0) {
      setTrainerReport([]);
      return;
    }

    const trainerIds = trainers.map((trainer) => trainer.id);

    // Ambil hubungan trainer dengan member
    const { data: trainerMembers, error: trainerMemberError } =
      await supabase
        .from("trainer_members")
        .select("trainer_id, member_id")
        .in("trainer_id", trainerIds);

    if (trainerMemberError) {
      console.error(trainerMemberError);
      setMessage("Gagal mengambil data member trainer.");
      return;
    }

    // Ambil sesi trainer pada periode laporan
    const { data: sessions, error: sessionError } = await supabase
      .from("trainer_sessions")
      .select("trainer_id")
      .in("trainer_id", trainerIds)
      .gte("session_date", startDate)
      .lte("session_date", endDate)
      .eq("status", "completed");

    if (sessionError) {
      console.error(sessionError);
      setMessage("Gagal mengambil data sesi trainer.");
      return;
    }

    // Ambil paket trainer yang dibeli pada periode laporan
    const { data: packageMembers, error: packageMemberError } =
      await supabase
        .from("trainer_package_members")
        .select(`
        trainer_id,
        transaction_id
      `)
        .in("trainer_id", trainerIds)
        .gte("purchase_date", startDate)
        .lte("purchase_date", endDate);

    if (packageMemberError) {
      console.error(packageMemberError);
      setMessage("Gagal mengambil data paket trainer.");
      return;
    }

    // Ambil transaksi dari pembelian paket trainer
    const transactionIds = [
      ...new Set(
        (packageMembers ?? [])
          .map((item) => item.transaction_id)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    let transactions: {
      id: string;
      total_amount: number | null;
    }[] = [];

    if (transactionIds.length > 0) {
      const { data: transactionData, error: transactionError } =
        await supabase
          .from("transactions")
          .select("id, total_amount")
          .in("id", transactionIds)
          .eq("status", "completed");

      if (transactionError) {
        console.error(transactionError);
        setMessage("Gagal mengambil transaksi trainer.");
        return;
      }

      transactions = transactionData ?? [];
    }

    // Buat map jumlah member per trainer
    const memberCountMap = new Map<string, number>();

    for (const item of trainerMembers ?? []) {
      memberCountMap.set(
        item.trainer_id,
        (memberCountMap.get(item.trainer_id) ?? 0) + 1
      );
    }

    // Buat map jumlah sesi per trainer
    const sessionCountMap = new Map<string, number>();

    for (const session of sessions ?? []) {
      sessionCountMap.set(
        session.trainer_id,
        (sessionCountMap.get(session.trainer_id) ?? 0) + 1
      );
    }

    // Buat map transaksi berdasarkan ID
    const transactionMap = new Map(
      transactions.map((transaction) => [
        transaction.id,
        Number(transaction.total_amount ?? 0),
      ])
    );

    // Hitung pendapatan masing-masing trainer
    const revenueMap = new Map<string, number>();

    for (const packageMember of packageMembers ?? []) {
      if (!packageMember.transaction_id) {
        continue;
      }

      const amount =
        transactionMap.get(packageMember.transaction_id) ?? 0;

      revenueMap.set(
        packageMember.trainer_id,
        (revenueMap.get(packageMember.trainer_id) ?? 0) + amount
      );
    }

    // Gabungkan seluruh data untuk laporan
    setTrainerReport(
      trainers.map((trainer) => ({
        id: trainer.id,
        name: trainer.name,
        memberCount: memberCountMap.get(trainer.id) ?? 0,
        sessionCount: sessionCountMap.get(trainer.id) ?? 0,
        revenue: revenueMap.get(trainer.id) ?? 0,
      }))
    );
  }

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">
          Laporan
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Tampilkan dan export laporan berdasarkan periode yang dipilih.
        </p>
      </div>

      {/* Filter Periode */}
      <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">
          Periode Laporan
        </h2>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Dari
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Sampai
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </section>

      {/* Pilihan Laporan */}
      <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Pilih Laporan
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Pilih data yang ingin ditampilkan atau diexport.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleAllReports}
            className="text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            {selectedReports.length === reportOptions.length
              ? "Batalkan Semua"
              : "Pilih Semua"}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reportOptions.map((report) => (
            <label
              key={report.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 p-3 hover:bg-zinc-50"
            >
              <input
                type="checkbox"
                checked={selectedReports.includes(report.id)}
                onChange={() => toggleReport(report.id)}
                className="h-4 w-4 accent-orange-500"
              />

              <span className="text-sm font-medium text-zinc-700">
                {report.label}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Tombol Aksi */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleShowReport}
          className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Tampilkan Laporan
        </button>

        <button
          type="button"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          Export XLSX
        </button>
      </div>

      {selectedReports.includes("summary") && showReport && (
        <SummaryReport
          newMembers={summary.newMembers}
          newMemberships={summary.newMemberships}
          totalVisits={summary.totalVisits}
          totalTransactions={summary.totalTransactions}
          totalRevenue={summary.totalRevenue}
        />
      )}

      {selectedReports.includes("members") && showReport && (
        <MembersReport members={memberReport} />
      )}

      {selectedReports.includes("membership") && showReport && (
        <MembershipReport memberships={membershipReport} />
      )}

      {selectedReports.includes("visits") && showReport && (
        <VisitsReport visits={visitReport} />
      )}

      {selectedReports.includes("trainers") && showReport && (
        <TrainersReport trainers={trainerReport} />
      )}

      {/* Pesan */}
      {message && (
        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          {message}
        </div>
      )}
    </main>
  );
}