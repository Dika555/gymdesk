"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  name: string;
  email: string;
  role: string;
};

export default function ProfilePage() {
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("users")
      .select("name, email, role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setProfile(data);
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Profil & Pengaturan
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Kelola informasi akun dan pengaturan GymDesk.
        </p>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            Profil Akun
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm text-zinc-500">Nama</p>
              <p className="mt-1 font-medium text-zinc-900">
                {profile?.name ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-zinc-500">Email</p>
              <p className="mt-1 font-medium text-zinc-900">
                {profile?.email ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-zinc-500">Role</p>
              <p className="mt-1 font-medium text-zinc-900">
                {profile?.role ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            Pengaturan
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Pengaturan GymDesk akan diletakkan di bagian ini.
          </p>
        </div>
      </div>
    </main>
  );
}