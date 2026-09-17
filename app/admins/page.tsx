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
      .select("id, name, email, role, branch_id")
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
          <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Tambah Admin
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Buat akun Admin baru dan tentukan cabangnya.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="text-sm text-zinc-500 hover:text-zinc-900"
              >
                Batal
              </button>
            </div>

            <div className="max-w-xl">
              <AddAdminForm
                branches={branches}
                onSuccess={() => {
                  setShowForm(false);
                  loadData();
                }}
              />
            </div>
          </section>
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
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
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
                        <button className="text-orange-500 hover:text-orange-600">
                          Edit
                        </button>
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