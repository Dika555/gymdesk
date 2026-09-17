"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Plan = {
  id: string;
  name: string;
  duration: number;
  price: number;
};

type Props = {
  memberId: string;
  branchId: string;
};

export default function AddMemberMembershipForm({
  memberId,
  branchId,
}: Props) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function getPlans() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("membership_plans")
        .select("id, name, duration, price")
        .eq("branch_id", branchId)
        .order("price", { ascending: true });

      if (error) {
        console.error(error);
        return;
      }

      setPlans(data ?? []);
    }

    getPlans();
  }, [branchId]);

  const selectedPlan = plans.find(
    (plan) => plan.id === planId,
  );

  function calculateEndDate() {
    if (!selectedPlan || !startDate) {
      return "";
    }

    const [year, month, day] = startDate
      .split("-")
      .map(Number);

    const date = new Date(year, month - 1, day);

    date.setMonth(date.getMonth() + selectedPlan.duration);

    const resultYear = date.getFullYear();
    const resultMonth = String(
      date.getMonth() + 1,
    ).padStart(2, "0");
    const resultDay = String(
      date.getDate(),
    ).padStart(2, "0");

    return `${resultYear}-${resultMonth}-${resultDay}`;
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!planId || !startDate) {
      alert(
        "Pilih paket dan tanggal mulai terlebih dahulu.",
      );
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const { error } = await supabase.rpc(
      "create_membership_transaction",
      {
        p_branch_id: branchId,
        p_member_id: memberId,
        p_plan_id: planId,
        p_start_date: startDate,
        p_payment_method: paymentMethod,
        p_notes: notes.trim() || null,
      },
    );

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    alert(
      "Membership berhasil ditambahkan dan pembayaran berhasil dicatat.",
    );

    setPlanId("");
    setStartDate("");
    setPaymentMethod("cash");
    setNotes("");
    setSaving(false);

    window.location.reload();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Paket Membership */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Paket Membership
        </label>

        <select
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          required
        >
          <option value="">Pilih paket</option>

          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} — Rp{" "}
              {plan.price.toLocaleString("id-ID")} (
              {plan.duration} bulan)
            </option>
          ))}
        </select>
      </div>

      {/* Tanggal Mulai */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Tanggal Mulai
        </label>

        <input
          type="date"
          value={startDate}
          onChange={(e) =>
            setStartDate(e.target.value)
          }
          className="w-full rounded-lg border px-3 py-2"
          required
        />
      </div>

      {/* Tanggal Berakhir */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Tanggal Berakhir
        </label>

        <input
          type="date"
          value={calculateEndDate()}
          readOnly
          className="w-full rounded-lg border bg-gray-100 px-3 py-2"
        />
      </div>

      {/* Metode Pembayaran */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Metode Pembayaran
        </label>

        <select
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(e.target.value)
          }
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value="cash">Cash</option>
          <option value="qris">QRIS</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>

      {/* Total */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Total Pembayaran
        </label>

        <input
          type="text"
          value={
            selectedPlan
              ? `Rp ${selectedPlan.price.toLocaleString(
                  "id-ID",
                )}`
              : ""
          }
          readOnly
          placeholder="Pilih paket terlebih dahulu"
          className="w-full rounded-lg border bg-gray-100 px-3 py-2"
        />
      </div>

      {/* Catatan */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Catatan
        </label>

        <textarea
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          placeholder="Opsional"
          rows={3}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {/* Tombol */}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving
          ? "Menyimpan..."
          : "Simpan Membership"}
      </button>
    </form>
  );
}