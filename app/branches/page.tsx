"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Branch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
};

export default function BranchesPage() {
  const supabase = createClient();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadBranches() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "super_admin") {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    setAuthorized(true);

    const { data, error } = await supabase
      .from("branches")
      .select("id, name, address, phone, is_active")
      .order("name");

    if (error) {
      console.error(error);
      alert("Gagal mengambil data cabang.");
      setLoading(false);
      return;
    }

    setBranches(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadBranches();
  }, []);

  function openAddForm() {
    setEditingId(null);
    setName("");
    setAddress("");
    setPhone("");
    setShowForm(true);
  }

  function openEditForm(branch: Branch) {
    setEditingId(branch.id);
    setName(branch.name);
    setAddress(branch.address || "");
    setPhone(branch.phone || "");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setAddress("");
    setPhone("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama cabang wajib diisi.");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("branches")
        .update({
          name: name.trim(),
          address: address.trim() || null,
          phone: phone.trim() || null,
        })
        .eq("id", editingId);

      if (error) {
        console.error(error);
        alert("Gagal mengubah cabang.");
        return;
      }

      alert("Cabang berhasil diubah.");
    } else {
      const { error } = await supabase
        .from("branches")
        .insert({
          name: name.trim(),
          address: address.trim() || null,
          phone: phone.trim() || null,
        });

      if (error) {
        console.error(error);
        alert("Gagal menambahkan cabang.");
        return;
      }

      alert("Cabang berhasil ditambahkan.");
    }

    closeForm();
    loadBranches();
  }

  async function handleToggleStatus(branch: Branch) {
    const newStatus = !branch.is_active;

    const action = newStatus
      ? "mengaktifkan"
      : "menonaktifkan";

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin ${action} cabang "${branch.name}"?`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("branches")
      .update({
        is_active: newStatus,
      })
      .eq("id", branch.id);

    if (error) {
      console.error("Gagal mengubah status cabang:", error);
      alert("Gagal mengubah status cabang: " + error.message);
      return;
    }

    alert(
      newStatus
        ? "Cabang berhasil diaktifkan."
        : "Cabang berhasil dinonaktifkan."
    );

    loadBranches();
  }

  return (
    <main className="min-h-screen bg-white p-8 text-zinc-900">
      {authorized === null ? (
        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-zinc-500">Memeriksa akses...</p>
        </div>
      ) : authorized === false ? (
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Akses Ditolak</h1>

            <p className="mt-2 text-zinc-500">
              Halaman ini hanya dapat diakses oleh Super Admin.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Kelola Cabang</h1>

              <p className="mt-2 text-zinc-500">
                Kelola daftar cabang gym yang terdaftar di GymDesk.
              </p>
            </div>

            <button
              onClick={openAddForm}
              className="rounded-lg bg-orange-500 px-5 py-3 font-medium text-white hover:bg-orange-600"
            >
              + Tambah Cabang
            </button>
          </div>

          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
              <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {editingId ? "Edit Cabang" : "Tambah Cabang"}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      {editingId
                        ? "Ubah informasi cabang."
                        : "Tambahkan cabang baru ke GymDesk."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeForm}
                    className="text-zinc-400 hover:text-zinc-900"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                      Nama Cabang
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama cabang"
                      className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                      Alamat
                    </label>

                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Alamat cabang"
                      rows={3}
                      className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                      Nomor Telepon
                    </label>

                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nomor telepon"
                      className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
                    >
                      {editingId ? "Simpan Perubahan" : "Simpan Cabang"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-zinc-200">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr className="border-b border-zinc-200 text-left">
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">Nama Cabang</th>
                  <th className="px-6 py-4">Alamat</th>
                  <th className="px-6 py-4">Telepon</th>
                  <th className="px-6 py4">Status</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-zinc-500"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : branches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-zinc-500"
                    >
                      Belum ada cabang.
                    </td>
                  </tr>
                ) : (
                  branches.map((branch, index) => (
                    <tr
                      key={branch.id}
                      className="border-b border-zinc-100 last:border-0"
                    >
                      <td className="px-6 py-4">{index + 1}</td>

                      <td className="px-6 py-4 font-medium">
                        {branch.name}
                      </td>

                      <td className="px-6 py-4 text-zinc-600">
                        {branch.address || "-"}
                      </td>

                      <td className="px-6 py-4 text-zinc-600">
                        {branch.phone || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={
                            branch.is_active
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                              : "rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                          }
                        >
                          {branch.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditForm(branch)}
                            className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleToggleStatus(branch)}
                            className={
                              branch.is_active
                                ? "rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                : "rounded-md border border-green-300 px-3 py-2 text-sm text-green-600 hover:bg-green-50"
                            }
                          >
                            {branch.is_active ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </div>
                      </td> 
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}