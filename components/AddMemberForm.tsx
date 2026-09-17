"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";

type Member = {
  id: string;
  name: string;
  phone: string;
  membership: string;
  status: string;
};

type Props = {
  onSuccess: () => void;
  member?: Member;
};

export default function AddMemberForm({
  onSuccess,
  member,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");

  const [registrationFee, setRegistrationFee] = useState("50000");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(member);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setPhone(member.phone);
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setGender("");
      setAddress("");
      setRegistrationFee("50000");
      setPaymentMethod("cash");
    }
  }, [member]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama member wajib diisi.");
      return;
    }

    if (!phone.trim()) {
      alert("Nomor HP wajib diisi.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    // =========================
    // EDIT MEMBER
    // =========================
    if (isEditing && member) {
      const branchId = getActiveBranchId();

      if (!branchId) {
        alert("Cabang aktif belum dipilih.");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("members")
        .update({
          name: name.trim(),
          phone: phone.trim(),
        })
        .eq("id", member.id)
        .eq("branch_id", branchId);

      if (error) {
        console.error(error);
        alert("Gagal mengubah data member.");
        setSaving(false);
        return;
      }

      alert("Data member berhasil diubah.");

      setSaving(false);
      onSuccess();

      return;
    }

    // =========================
    // TAMBAH MEMBER
    // =========================

    if (!registrationFee || Number(registrationFee) < 0) {
      alert("Biaya pendaftaran tidak valid.");
      setSaving(false);
      return;
    }

    const branchId = getActiveBranchId();

    if (!branchId) {
      alert("Cabang aktif belum dipilih.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.rpc(
      "create_member_registration",
      {
        p_branch_id: branchId,
        p_name: name.trim(),
        p_phone: phone.trim(),
        p_email: email.trim(),
        p_gender: gender,
        p_address: address.trim(),
        p_registration_fee: Number(registrationFee),
        p_payment_method: paymentMethod,
      },
    );

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    alert("Member berhasil didaftarkan.");

    setName("");
    setPhone("");
    setEmail("");
    setGender("");
    setAddress("");
    setRegistrationFee("50000");
    setPaymentMethod("cash");

    setSaving(false);

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nama */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Nama
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama lengkap"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
          required
        />
      </div>

      {/* Nomor HP */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          No. HP
        </label>

        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08xxxxxxxxxx"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="opsional"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Jenis Kelamin
        </label>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
        >
          <option value="">Pilih</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
      </div>

      {/* Alamat */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Alamat
        </label>

        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Alamat member"
          rows={3}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
        />
      </div>

      {/* Pendaftaran */}
      {!isEditing && (
        <>
          <div className="border-t border-zinc-200 pt-4">
            <p className="mb-3 text-sm font-semibold text-zinc-800">
              Pendaftaran Member
            </p>

            <div className="space-y-4">
              {/* Biaya */}
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Biaya Pendaftaran
                </label>

                <input
                  type="number"
                  min="0"
                  value={registrationFee}
                  onChange={(e) =>
                    setRegistrationFee(e.target.value)
                  }
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
                  required
                />

                <p className="mt-1 text-xs text-zinc-500">
                  Nilai Rp50.000 sementara digunakan sebagai contoh.
                </p>
              </div>

              {/* Pembayaran */}
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Metode Pembayaran
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
                >
                  <option value="cash">Cash</option>
                  <option value="qris">QRIS</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tombol */}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving
          ? "Menyimpan..."
          : isEditing
            ? "Simpan Perubahan"
            : "Daftarkan Member"}
      </button>
    </form>
  );
}