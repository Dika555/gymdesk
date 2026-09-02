"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AddMemberFormProps = {
  onSuccess: () => void;
};

export default function AddMemberForm({
  onSuccess,
}: AddMemberFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [membership, setMembership] = useState("Premium");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.from("members").insert({
      name,
      phone,
      membership,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setName("");
    setPhone("");
    setMembership("Premium");

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">
          Nama Member
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border p-3"
          placeholder="Masukkan nama"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Nomor HP
        </label>

        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full rounded-lg border p-3"
          placeholder="08xxxxxxxxxx"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Membership
        </label>

        <select
          value={membership}
          onChange={(e) => setMembership(e.target.value)}
          className="w-full rounded-lg border p-3"
        >
          <option value="Premium">Premium</option>
          <option value="Student">Student</option>
          <option value="Basic">Basic</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-black px-4 py-3 text-white"
      >
        {loading ? "Menyimpan..." : "Simpan Member"}
      </button>
    </form>
  );
}