"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState("");
  const [branchId, setBranchId] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const [gymName, setGymName] = useState("");
  const [gymEmail, setGymEmail] = useState("");
  const [gymPhone, setGymPhone] = useState("");
  const [gymAddress, setGymAddress] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
  setLoading(true);

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      alert("Gagal mengambil akun: " + authError.message);
      console.error("AUTH ERROR:", authError);
      return;
    }

    if (!user) {
      alert("Tidak ada akun yang sedang login.");
      return;
    }

    setUserId(user.id);

    console.log("AUTH USER:", user);

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, name, email, role, branch_id")
      .eq("id", user.id)
      .maybeSingle();

    console.log("PROFILE:", profile);
    console.log("PROFILE ERROR:", profileError);

    if (profileError) {
      alert("Gagal mengambil data profil: " + profileError.message);
      return;
    }

    if (!profile) {
      alert("Data profil tidak ditemukan di tabel users.");
      return;
    }

    setName(profile.name || "");
    setEmail(profile.email || "");
    setRole(profile.role || "");

    let selectedBranchId = profile.branch_id;

    // Super Admin belum memiliki branch_id.
    // Untuk sementara gunakan cabang pertama.
    if (!selectedBranchId && profile.role === "super_admin") {
      const { data: mainBranch, error: branchError } = await supabase
        .from("branches")
        .select("id, name")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      console.log("MAIN BRANCH:", mainBranch);
      console.log("BRANCH ERROR:", branchError);

      if (branchError) {
        alert("Gagal mengambil cabang: " + branchError.message);
        return;
      }

      if (mainBranch) {
        selectedBranchId = mainBranch.id;
        setBranchId(mainBranch.id);
      }
    } else if (selectedBranchId) {
      setBranchId(selectedBranchId);
    }

    if (selectedBranchId) {
      const { data: gym, error: gymError } = await supabase
        .from("gym_settings")
        .select("gym_name, email, phone, address")
        .eq("branch_id", selectedBranchId)
        .maybeSingle();

      console.log("GYM SETTINGS:", gym);
      console.log("GYM ERROR:", gymError);

      if (gymError) {
        alert("Gagal mengambil informasi gym: " + gymError.message);
        return;
      }

      if (gym) {
        setGymName(gym.gym_name || "");
        setGymEmail(gym.email || "");
        setGymPhone(gym.phone || "");
        setGymAddress(gym.address || "");
      }
    }
  } finally {
    setLoading(false);
  }
}

  async function saveProfile() {
    setSaving(true);

    const { error } = await supabase
      .from("users")
      .update({
        name,
        email,
      })
      .eq("id", userId);

    setSaving(false);

    if (error) {
      alert("Gagal menyimpan profil.");
      console.error(error);
      return;
    }

    alert("Profil berhasil disimpan.");
  }

  async function saveGymInfo() {
    if (!branchId) {
      alert("Akun ini belum memiliki cabang.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("gym_settings")
      .upsert(
        {
          branch_id: branchId,
          gym_name: gymName,
          email: gymEmail,
          phone: gymPhone,
          address: gymAddress,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "branch_id",
        }
      );

    setSaving(false);

    if (error) {
      alert("Gagal menyimpan informasi gym.");
      console.error(error);
      return;
    }

    alert("Informasi gym berhasil disimpan.");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-8 py-8 text-zinc-900">
        <p className="text-zinc-500">Memuat pengaturan...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-8 py-8 text-zinc-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profil & Pengaturan</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Kelola informasi akun admin dan informasi gym.
          </p>
        </div>

        {/* Profil Admin */}
        <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Profil Admin</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Informasi akun yang sedang digunakan.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Nama
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Role
              </label>

              <input
                type="text"
                value={role}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-zinc-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Cabang
              </label>

              <input
                type="text"
                value={branchId ? "GymDesk - Cabang Utama" : "Belum ada cabang"}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-zinc-500"
              />
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="mt-6 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </section>

        {/* Informasi Gym */}
        <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Informasi Gym</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Informasi gym pada cabang yang sedang dikelola.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Nama Gym
              </label>

              <input
                type="text"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email Gym
              </label>

              <input
                type="email"
                value={gymEmail}
                onChange={(e) => setGymEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                No. Telepon
              </label>

              <input
                type="text"
                value={gymPhone}
                onChange={(e) => setGymPhone(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Alamat
              </label>

              <input
                type="text"
                value={gymAddress}
                onChange={(e) => setGymAddress(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <button
            onClick={saveGymInfo}
            disabled={saving || !branchId}
            className="mt-6 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Informasi Gym"}
          </button>
        </section>

        {/* Keamanan */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Keamanan</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Pengaturan password akun admin akan kita tambahkan setelah
            pengaturan profil selesai.
          </p>
        </section>
      </div>
    </main>
  );
}