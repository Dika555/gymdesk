"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";

type UserProfile = {
  name: string;
  email: string;
  role: string;
};

export default function ProfilePage() {
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingBranch, setIsEditingBranch] = useState(false);

  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [savingBranch, setSavingBranch] = useState(false);

  const [branchInfo, setBranchInfo] = useState<{
    name: string;
    address: string | null;
    phone: string | null;
  } | null>(null);

  useEffect(() => {
    loadProfile();
    loadBranchInfo();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setProfile(data);
    setName(data.name ?? "");
    setEmail(data.email ?? "");
  }

  async function handleSaveProfile() {
    if (!profile) return;

    setSavingProfile(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("User tidak ditemukan.");
      setSavingProfile(false);
      return;
    }

    // Update email di Supabase Auth jika email berubah
    if (email !== profile.email) {
      const { error: authError } = await supabase.auth.updateUser({
        email,
      });

      if (authError) {
        console.error(authError);
        alert(authError.message);
        setSavingProfile(false);
        return;
      }
    }

    // Update data profil di tabel users
    const { error: userError } = await supabase
      .from("users")
      .update({
        name,
        email,
      })
      .eq("id", user.id);

    if (userError) {
      console.error(userError);
      alert(userError.message);
      setSavingProfile(false);
      return;
    }

    // Ambil ulang data yang sudah tersimpan
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("name, email, role")
      .eq("id", user.id)
      .single();

    if (fetchError) {
      console.error(fetchError);
      alert(fetchError.message);
      setSavingProfile(false);
      return;
    }

    setProfile(data);
    setName(data.name);
    setEmail(data.email);

    setIsEditing(false);
    alert("Profil berhasil diperbarui.");

    setSavingProfile(false);
  }

  async function loadBranchInfo() {
    const branchId = getActiveBranchId();

    if (!branchId) return;

    const { data, error } = await supabase
      .from("branches")
      .select("name, address, phone")
      .eq("id", branchId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setBranchInfo(data);
    setBranchName(data.name ?? "");
    setBranchAddress(data.address ?? "");
    setBranchPhone(data.phone ?? "");
  }

  const hasChanges =
    profile &&
    (name !== profile.name || email !== profile.email);

  async function handleSaveBranch() {
  const branchId = getActiveBranchId();

  if (!branchId) {
    alert("Cabang aktif tidak ditemukan.");
    return;
  }

  setSavingBranch(true);

  const { error: updateError } = await supabase
    .from("branches")
    .update({
      name: branchName,
      address: branchAddress,
      phone: branchPhone,
    })
    .eq("id", branchId);

  if (updateError) {
    console.error(updateError);
    alert(updateError.message);
    setSavingBranch(false);
    return;
  }

  // Ambil ulang data setelah berhasil di-update
  const { data, error: fetchError } = await supabase
    .from("branches")
    .select("name, address, phone")
    .eq("id", branchId)
    .single();

  if (fetchError) {
    console.error(fetchError);
    alert(fetchError.message);
    setSavingBranch(false);
    return;
  }

  setBranchInfo(data);
  setBranchName(data.name ?? "");
  setBranchAddress(data.address ?? "");
  setBranchPhone(data.phone ?? "");

  setIsEditingBranch(false);
  alert("Informasi gym berhasil diperbarui.");

  setSavingBranch(false);
}

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-8 md:px-10">
      <div className="mx-auto max-w-5xl">
        {/* Judul */}
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Profil & Pengaturan
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Kelola informasi akun dan pengaturan GymDesk.
          </p>
        </div>

        {/* Avatar */}
        <div className="mt-8 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="h-14 w-14"
            >
              <path
                fillRule="evenodd"
                d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM4 20a8 8 0 1 1 16 0v1H4v-1Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Profil Akun */}
        <section className="mt-8 rounded-xl border border-zinc-200 bg-red p-6 md:p-8">
          <h2 className="text-lg font-semibold text-zinc-900">
            Profil Akun
          </h2>

          {/* Nama */}
          <div className="md:col-span-2">
            <div>
              <label className="text-sm font-medium text-zinc-600">
                Nama
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                className="mt-2 w-full rounded-lg border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:bg-white disabled:cursor-default disabled:bg-zinc-100"
              />
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-zinc-600">
                Email
              </label>

              <input
                type="email"
                value={email}
                disabled={!isEditing}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:bg-white disabled:bg-zinc-100"
              />
            </div>

            {/* Role */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-zinc-600">
                Role
              </label>

              <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm font-medium text-zinc-900 bg-zinc-100">
                {profile?.role ?? "-"}
              </div>
            </div>
          </div>

          {/* Tombol */}
          <div className="mt-6">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-orange-600"
              >
                Edit Profil
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            )}
          </div>
        </section>

        {/* Informasi Gym */}
        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 md:p-8">
          <h2 className="text-lg font-semibold uppercase text-zinc-900">
            Informasi Gym
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {/* Nama Gym */}
            <div>
              <label className="text-sm font-medium text-zinc-600">
                Nama Gym
              </label>

              {isEditingBranch ? (
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-500 focus:bg-white"
                />
              ) : (
                <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900">
                  {branchInfo?.name ?? "-"}
                </div>
              )}
            </div>

            {/* Nomor Telepon */}
            <div>
              <label className="text-sm font-medium text-zinc-600">
                Nomor Telepon
              </label>

              {isEditingBranch ? (
                <input
                  type="text"
                  value={branchPhone}
                  onChange={(e) => setBranchPhone(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-500 focus:bg-white"
                />
              ) : (
                <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900">
                  {branchInfo?.phone ?? "-"}
                </div>
              )}
            </div>

            {/* Alamat */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-zinc-600">
                Alamat
              </label>

              {isEditingBranch ? (
                <textarea
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-500 focus:bg-white"
                />
              ) : (
                <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900">
                  {branchInfo?.address ?? "-"}
                </div>
              )}
            </div>

            <div className="mt-6">
              {!isEditingBranch ? (
                <button
                  type="button"
                  onClick={() => setIsEditingBranch(true)}
                  className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-orange-600"
                >
                  Edit Informasi
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveBranch}
                  disabled={savingBranch}
                  className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingBranch ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}