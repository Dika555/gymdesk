"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import AddProductTransactionForm from "@/components/AddProductTransactionForm";

type Member = {
  id: string;
  name: string;
};

type MembershipPlan = {
  id: string;
  name: string;
  duration: number;
  price: number;
};

type Props = {
  onSuccess: () => void;
};

export default function AddTransactionForm({ onSuccess }: Props) {
  const supabase = createClient();

  const [members, setMembers] = useState<Member[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>(
    [],
  );

  const [transactionType, setTransactionType] = useState("membership");
  const [memberId, setMemberId] = useState("");
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [totalAmount, setTotalAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function getData() {
      const branchId = getActiveBranchId();

      if (!branchId) {
        setMembers([]);
        setMembershipPlans([]);
        return;
      }

      const [
        { data: membersData, error: membersError },
        { data: plansData, error: plansError },
      ] = await Promise.all([
        supabase
          .from("members")
          .select("id, name")
          .eq("branch_id", branchId)
          .order("name", { ascending: true }),

        supabase
          .from("membership_plans")
          .select("id, name, duration, price")
          .eq("branch_id", branchId)
          .order("price", { ascending: true }),
      ]);

      if (membersError) {
        console.error("Gagal mengambil member:", membersError);
      } else {
        setMembers(membersData ?? []);
      }

      if (plansError) {
        console.error("Gagal mengambil paket membership:", plansError);
      } else {
        setMembershipPlans(plansData ?? []);
      }
    }

    getData();
  }, []);

  function handleTransactionTypeChange(value: string) {
    setTransactionType(value);

    setMemberId("");
    setPlanId("");
    setStartDate("");
    setTotalAmount("");
    setNotes("");
  }

  function handlePlanChange(value: string) {
    setPlanId(value);

    const selectedPlan = membershipPlans.find(
      (plan) => plan.id === value,
    );

    if (selectedPlan) {
      setTotalAmount(String(selectedPlan.price));
    } else {
      setTotalAmount("");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!totalAmount || Number(totalAmount) <= 0) {
      alert("Total transaksi harus lebih dari 0.");
      return;
    }

    if (transactionType === "membership") {
      if (!memberId) {
        alert("Silakan pilih member terlebih dahulu.");
        return;
      }

      if (!planId) {
        alert("Silakan pilih paket membership terlebih dahulu.");
        return;
      }

      if (!startDate) {
        alert("Silakan pilih tanggal mulai membership.");
        return;
      }
    }

    setSaving(true);

    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      alert("Cabang aktif belum dipilih.");
      setSaving(false);
      return;
    }

    const transactionNote =
      transactionType === "membership"
        ? `Pembayaran membership${notes.trim() ? ` - ${notes.trim()}` : ""
        }`
        : notes.trim() || null;

    let error;

    if (transactionType === "membership") {
      const { error: rpcError } = await supabase.rpc(
        "create_membership_transaction",
        {
          p_branch_id: branchId,
          p_member_id: memberId,
          p_plan_id: planId,
          p_start_date: startDate,
          p_payment_method: paymentMethod,
          p_notes: transactionNote,
        },
      );

      error = rpcError;
    } else {
      const { error: insertError } = await supabase
        .from("transactions")
        .insert({
          branch_id: branchId,
          member_id: memberId || null,
          transaction_type: "other",
          payment_method: paymentMethod,
          total_amount: Number(totalAmount),
          status: "completed",
          notes: transactionNote,
        });

      error = insertError;
    }

    if (error) {
      console.error("Gagal menyimpan transaksi:", error);
      alert(error.message);
      setSaving(false);
      return;
    }

    alert("Transaksi berhasil disimpan.");

    setTransactionType("membership");
    setMemberId("");
    setPlanId("");
    setStartDate("");
    setPaymentMethod("cash");
    setTotalAmount("");
    setNotes("");
    setSaving(false);

    onSuccess();
  }

  /*
   * Kalau jenis transaksi = Produk,
   * gunakan form khusus produk.
   */
  if (transactionType === "product") {
    return (
      <div className="space-y-4">
        {/* Jenis Transaksi */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Jenis Transaksi
          </label>

          <select
            value={transactionType}
            onChange={(e) => handleTransactionTypeChange(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
          >
            <option value="membership">Membership</option>
            <option value="product">Produk</option>
            <option value="other">Lainnya</option>
          </select>
        </div>

        <AddProductTransactionForm
          onSuccess={onSuccess}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Jenis Transaksi */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Jenis Transaksi
        </label>

        <select
          value={transactionType}
          onChange={(e) => handleTransactionTypeChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
        >
          <option value="membership">Membership</option>
          <option value="product">Produk</option>
          <option value="other">Lainnya</option>
        </select>
      </div>

      {/* Member */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Member
        </label>

        <select
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
        >
          <option value="">Non-member</option>

          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>

        {transactionType === "membership" && (
          <p className="mt-1 text-xs text-zinc-500">
            Pembayaran membership harus dikaitkan dengan member.
          </p>
        )}
      </div>

      {/* Detail Membership */}
      {transactionType === "membership" && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Paket Membership
            </label>

            <select
              value={planId}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
              required
            >
              <option value="">Pilih paket membership</option>

              {membershipPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - Rp{" "}
                  {plan.price.toLocaleString("id-ID")} (
                  {plan.duration} bulan)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Tanggal Mulai
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
              required
            />
          </div>
        </>
      )}

      {/* Informasi Lainnya */}
      {transactionType === "other" && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm font-medium text-zinc-800">
            Transaksi Lainnya
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Gunakan jenis ini untuk transaksi yang tidak termasuk
            membership atau produk.
          </p>
        </div>
      )}

      {/* Metode Pembayaran */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Metode Pembayaran
        </label>

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
        >
          <option value="cash">Cash</option>
          <option value="qris">QRIS</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>

      {/* Total */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Total Transaksi
        </label>

        <input
          type="number"
          min="1"
          value={totalAmount}
          readOnly={transactionType === "membership"}
          onChange={(e) => setTotalAmount(e.target.value)}
          placeholder="Contoh: 50000"
          className={`w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500 ${transactionType === "membership"
            ? "bg-zinc-100 text-zinc-600"
            : ""
            }`}
          required
        />
      </div>

      {/* Catatan */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Catatan
        </label>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Opsional"
          rows={3}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Menyimpan..." : "Simpan Transaksi"}
      </button>
    </form>
  );
}