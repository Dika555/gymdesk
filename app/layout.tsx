import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BranchSwitcher from "@/components/BranchSwitcher";

export const metadata: Metadata = {
  title: "GymDesk",
  description: "Gym Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <Sidebar />

        <div className="ml-64">
          <div className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6">
            <BranchSwitcher />

            <a
              href="/profile"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              Profil & Pengaturan
            </a>
          </div>

          {children}
        </div>
      </body>
    </html>
  );
}