"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("Login gagal:", error.message);
      return;
    }

    console.log("Login berhasil!");
    console.log("User ID:", data.user.id);

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("name, email, role, branch_id")
      .eq("id", data.user.id)
      .single();

    if (userError) {
      console.log("Data user tidak ditemukan:", userError.message);
      return;
    }

    console.log("Data user:", userData);
    console.log("Role:", userData.role);

    router.push("/");
    
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6">
        <h1 className="text-3xl font-bold">
          GymDesk
        </h1>

        <p className="mt-2 text-gray-500">
          Login ke dashboard GymDesk
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-4"
        >
          <div>
            <label className="block mb-2 text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}