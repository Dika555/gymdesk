"use client";

import { useState } from "react";

type Branch = {
  id: string;
  name: string;
};

type AddAdminFormProps = {
  branches: Branch[];
  onSuccess: () => void;
};

export default function AddAdminForm({
  branches,
  onSuccess,
}: AddAdminFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branchId, setBranchId] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !email || !password || !branchId) {
      alert("Semua data wajib diisi.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/admins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        branch_id: branchId,
      }),
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(result.error || "Gagal membuat Admin.");
      return;
    }

    alert("Admin berhasil dibuat.");

    setName("");
    setEmail("");
    setPassword("");
    setBranchId("");

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium">
          Nama Admin
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Budi"
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@gmail.com"
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Password Awal
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimal 6 karakter"
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Cabang
        </label>

        <select
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 outline-none focus:border-orange-500"
        >
          <option value="">Pilih cabang</option>

          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {loading ? "Membuat Admin..." : "Buat Admin"}
      </button>
    </form>
  );
}