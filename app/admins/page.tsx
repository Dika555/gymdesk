"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AddAdminForm from "@/components/AddAdminForm";

type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
  branch_id: string | null;
  is_active: boolean;
};

type Branch = {
  id: string;
  name: string;
};

export default function AdminsPage() {
  const supabase = createClient();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // Cek user yang sedang login
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("User belum login.");
      setLoading(false);
      return;
    }

    // Cek role user
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Gagal mengambil profile:", profileError);
      setLoading(false);
      return;
    }

    // Halaman ini hanya untuk Super Admin
    if (profile.role !== "super_admin") {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    setAuthorized(true);

    // Ambil data admin
    const { data: adminData, error: adminError } = await supabase
      .from("users")
      .select("id, name, email, role, branch_id, is_active")
      .eq("role", "admin")
      .order("name");

    if (adminError) {
      console.error("Gagal mengambil admin:", adminError);
    }

    // Ambil data cabang
    const { data: branchData, error: branchError } = await supabase
      .from("branches")
      .select("id, name")
      .order("name");

    if (branchError) {
      console.error("Gagal mengambil cabang:", branchError);
    } else {
      console.log("Data cabang:", branchData);
    }

    setAdmins(adminData || []);
    setBranches(branchData || []);

    setLoading(false);
  }

  function getBranchName(branchId: string | null) {
    if (!branchId) {
      return "-";
    }

    const branch = branches.find((item) => item.id === branchId);

    return branch?.name || "-";
  }

  if (!loading && !authorized) {
    return (
      <main className="min-h-screen bg-white px-8 py-8 text-zinc-900">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Kelola Admin</h1>

          <p className="mt-2 text-sm text-red-500">
            Halaman ini hanya dapat diakses oleh Super Admin.
          </p>
        </div>
      </main>
    );
  }

  async function handleToggleStatus(admin: Admin) {
    const newStatus = !admin.is_active;

    const action = newStatus ? "mengaktifkan" : "menonaktifkan";

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin ${action} admin "${admin.name}"?`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({
        is_active: newStatus,
      })
      .eq("id", admin.id);

    if (error) {
      console.error("Gagal mengubah status admin:", error);
      alert("Gagal mengubah status admin: " + error.message);
      return;
    }

    alert(
      newStatus
        ? "Admin berhasil diaktifkan."
        : "Admin berhasil dinonaktifkan."
    );

    loadData();
  }

  async function handleSaveEdit() {
    if (!editingAdmin) return;

    setSavingEdit(true);

    const { error } = await supabase
      .from("users")
      .update({
        name: editingAdmin.name,
        email: editingAdmin.email,
        branch_id: editingAdmin.branch_id,
      })
      .eq("id", editingAdmin.id);

    if (error) {
      console.error(error);
      alert("Gagal memperbarui admin: " + error.message);
      setSavingEdit(false);
      return;
    }

    alert("Data admin berhasil diperbarui.");

    setEditingAdmin(null);
    setSavingEdit(false);

    loadData();
  }

  return (
    <main className="min-h-screen bg-white px-8 py-8 text-zinc-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Kelola Admin</h1>

            <p className="mt-1 text-sm text-zinc-500">
              Kelola akun admin dan cabang yang dikelola.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
          >
            + Tambah Admin
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">
                    Tambah Admin
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Buat akun Admin baru dan tentukan cabangnya.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-zinc-400 hover:text-zinc-900"
                >
                  ✕
                </button>
              </div>

              <AddAdminForm
                branches={branches}
                onSuccess={() => {
                  setShowForm(false);
                  loadData();
                }}
              />

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 w-full"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {editingAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">
                    Edit Admin
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Ubah informasi akun admin.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="text-zinc-400 hover:text-zinc-900"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Nama
                  </label>

                  <input
                    type="text"
                    value={editingAdmin.name}
                    onChange={(e) =>
                      setEditingAdmin({
                        ...editingAdmin,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={editingAdmin.email}
                    onChange={(e) =>
                      setEditingAdmin({
                        ...editingAdmin,
                        email: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Cabang
                  </label>

                  <select
                    value={editingAdmin.branch_id ?? ""}
                    onChange={(e) =>
                      setEditingAdmin({
                        ...editingAdmin,
                        branch_id: e.target.value || null,
                      })
                    }
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
                  >
                    <option value="">Tidak ada cabang</option>

                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-7 gap-3">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 w-full"
                >
                  {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 w-full mt-6"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          {loading ? (
            <div className="p-6 text-sm text-zinc-500">
              Memuat data admin...
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    No
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Nama
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Cabang
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Role
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-zinc-500"
                    >
                      Belum ada Admin.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin, index) => (
                    <tr
                      key={admin.id}
                      className="border-b border-zinc-100 last:border-b-0"
                    >
                      <td className="px-6 py-4 text-sm">
                        {index + 1}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium">
                        {admin.name}
                      </td>

                      <td className="px-6 py-4 text-sm text-zinc-600">
                        {admin.email}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {getBranchName(admin.branch_id)}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium">
                          Admin
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <span
                          className={
                            admin.is_active
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                              : "rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                          }
                        >
                          {admin.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setEditingAdmin(admin)}
                            className="text-orange-500 hover:text-orange-600"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(admin)}
                            className={
                              admin.is_active
                                ? "text-red-500 hover:text-red-600"
                                : "text-green-600 hover:text-green-700"
                            }
                          >
                            {admin.is_active ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}