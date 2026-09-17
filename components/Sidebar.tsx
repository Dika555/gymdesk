"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const menuItems = [
  { name: "Dashboard", href: "/" },
  { name: "Members", href: "/members" },
  { name: "Membership", href: "/membership" },
  { name: "Visits", href: "/visits" },
  { name: "Trainers", href: "/trainers" },
  { name: "Transactions", href: "/transactions" },
  { name: "Inventory", href: "/inventory" },
  { name: "Reports", href: "/reports" },
];

const superAdminMenuItems = [
  { name: "Kelola Admin", href: "/admins" },
  { name: "Kelola Cabang", href: "/branches" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Gagal mengambil role:", error);
        setRole(null);
        return;
      }

      console.log("Role user:", data.role);
      setRole(data.role);
    }

    // Ambil role saat Sidebar pertama kali dibuka
    loadRole();

    // Pantau perubahan login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setRole(null);
      }

      if (event === "SIGNED_IN") {
        setTimeout(() => {
          loadRole();
        }, 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    setRole(null);
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-black text-white">
      
      {/* Logo */}
      <div className="flex h-20 items-center justify-center border-b border-zinc-800">
        <Image
          src="/logo GymDesk.svg"
          alt="GymDesk"
          width={150}
          height={50}
          priority
        />
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-1">
          
          {menuItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-orange-500 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {/* Menu khusus Super Admin */}
          {role === "super_admin" && (
            <div className="mt-6 border-t border-zinc-800 pt-4">
              <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Super Admin
              </p>

              {superAdminMenuItems.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-orange-500 text-white"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-zinc-800 p-4">
        <button
          onClick={handleLogout}
          className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}