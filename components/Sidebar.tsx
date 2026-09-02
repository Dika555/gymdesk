import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-black p-6 text-white">
      <h1 className="text-2xl font-bold">GymDesk</h1>

      <p className="mt-1 text-sm text-gray-400">
        Management System
      </p>

      <nav className="mt-10 space-y-2">
        <Link
          href="/"
          className="block rounded-lg px-4 py-3 hover:bg-gray-800"
        >
          Dashboard
        </Link>

        <Link
          href="/members"
          className="block rounded-lg px-4 py-3 hover:bg-gray-800"
        >
          Members
        </Link>

        <Link
          href="/visits"
          className="block rounded-lg px-4 py-3 hover:bg-gray-800"
        >
          Visits
        </Link>

        <Link
          href="/trainers"
          className="block rounded-lg px-4 py-3 hover:bg-gray-800"
        >
          Trainers
        </Link>

        <Link
          href="/reports"
          className="block rounded-lg px-4 py-3 hover:bg-gray-800"
        >
          Reports
        </Link>
      </nav>
    </aside>
  );
}