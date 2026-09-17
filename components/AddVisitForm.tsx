"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";

type Member = {
  id: string;
  name: string;
  phone: string;
};

type Props = {
  onSuccess: () => void;
};

export default function AddVisitForm({ onSuccess }: Props) {
  const [visitType, setVisitType] = useState<"member" | "non-member">(
    "member"
  );

  const [members, setMembers] = useState<Member[]>([]);
  const [memberId, setMemberId] = useState("");
  const [memberHasActiveMembership, setMemberHasActiveMembership] =
    useState(false);
  const [checkingMembership, setCheckingMembership] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function getMembers() {
      const supabase = createClient();

      const branchId = getActiveBranchId();

      if (!branchId) {
        setMembers([]);
        return;
      }

      const { data, error } = await supabase
        .from("members")
        .select("id, name, phone")
        .eq("branch_id", branchId)
        .order("name");

      if (error) {
        console.error(error);
        return;
      }

      setMembers(data ?? []);
    }

    getMembers();
  }, []);

  async function checkMembership(memberId: string, date: string) {
    if (!memberId || !date) {
      setMemberHasActiveMembership(false);
      return;
    }

    setCheckingMembership(true);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("memberships")
      .select("id")
      .eq("member_id", memberId)
      .eq("status", "active")
      .lte("start_date", date)
      .gte("end_date", date)
      .limit(1);

    if (error) {
      console.error(error);
      setMemberHasActiveMembership(false);
    } else {
      setMemberHasActiveMembership((data ?? []).length > 0);
    }

    setCheckingMembership(false);
  }

  function handleTypeChange(type: "member" | "non-member") {
    setVisitType(type);
    setMemberId("");
    setVisitorName("");
    setPaymentMethod("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!visitDate) {
      alert("Pilih tanggal kunjungan terlebih dahulu.");
      return;
    }

    if (
      visitType === "member" &&
      !memberHasActiveMembership
    ) {
      alert("Member tidak memiliki membership aktif.");
      return;
    }

    if (visitType === "non-member" && !visitorName.trim()) {
      alert("Masukkan nama pengunjung.");
      return;
    }

    if (visitType === "non-member" && !paymentMethod) {
      alert("Pilih metode pembayaran.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      alert("Cabang aktif belum dipilih.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.rpc(
      "create_visit",
      {
        p_branch_id: branchId,
        p_member_id:
          visitType === "member" ? memberId : null,
        p_visitor_name:
          visitType === "member"
            ? ""
            : visitorName.trim(),
        p_visit_date: visitDate,
        p_payment_method:
          visitType === "member"
            ? null
            : paymentMethod,
      }
    );

    setSaving(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("Kunjungan berhasil dicatat.");

    setMemberId("");
    setVisitorName("");
    setVisitDate("");
    setPaymentMethod("");

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium">
          Tipe Pengunjung
        </label>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTypeChange("member")}
            className={`rounded-lg border px-4 py-2 ${visitType === "member"
              ? "border-orange-500 bg-orange-50 text-orange-600"
              : "border-gray-300"
              }`}
          >
            Member
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange("non-member")}
            className={`rounded-lg border px-4 py-2 ${visitType === "non-member"
              ? "border-orange-500 bg-orange-50 text-orange-600"
              : "border-gray-300"
              }`}
          >
            Non-member
          </button>
        </div>
      </div>

      {visitType === "member" ? (
        <div>
          <label className="mb-2 block text-sm font-medium">
            Member
          </label>

          <select
            value={memberId}
            onChange={(e) => {
              const id = e.target.value;
              setMemberId(id);
              checkMembership(id, visitDate);
            }}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">Pilih member</option>

            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} — {member.phone}
              </option>
            ))}
          </select>

          <p className="mt-2 text-sm text-gray-500">
            Member dengan membership aktif tidak dikenakan biaya
            kunjungan.
          </p>
        </div>
      ) : (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Nama Pengunjung
            </label>

            <input
              type="text"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="Masukkan nama pengunjung"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Biaya Kunjungan
            </label>

            <input
              type="text"
              value={
                checkingMembership
                  ? "Memeriksa..."
                  : memberHasActiveMembership
                    ? "Rp 0"
                    : "Tidak memiliki membership aktif"
              }
              readOnly
              className="w-full rounded-lg border bg-gray-100 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Metode Pembayaran
            </label>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">
                Pilih metode pembayaran
              </option>
              <option value="cash">Cash</option>
              <option value="qris">QRIS</option>
            </select>
          </div>
        </>
      )}

      {visitType === "member" && (
        <div>
          <label className="mb-2 block text-sm font-medium">
            Biaya Kunjungan
          </label>

          <input
            type="text"
            value={
              checkingMembership
                ? "Memeriksa..."
                : !memberId
                  ? "Pilih member"
                  : !visitDate
                    ? "Pilih tanggal kunjungan"
                    : memberHasActiveMembership
                      ? "Rp 0"
                      : "Tidak memiliki membership aktif"
            }
            readOnly
            className="w-full rounded-lg border bg-gray-100 px-3 py-2"
          />
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Tanggal Kunjungan
        </label>

        <input
          type="date"
          value={visitDate}
          onChange={(e) => {
            const date = e.target.value;
            setVisitDate(date);

            if (memberId) {
              checkMembership(memberId, date);
            }
          }}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {saving ? "Menyimpan..." : "Simpan Kunjungan"}
      </button>
    </form>
  );
}