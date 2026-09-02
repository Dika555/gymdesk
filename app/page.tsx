import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("id, name, phone, membership");

  const { data: visits } = await supabase
    .from("visits")
    .select("id, visit_date, members(name)")
    .order("visit_date", { ascending: false });

  const totalMember = members?.length ?? 0;

  const totalPremium =
    members?.filter(
      (member) => member.membership === "Premium"
    ).length ?? 0;

  const totalStudent =
    members?.filter(
      (member) => member.membership === "Student"
    ).length ?? 0;

  const totalVisit = visits?.length ?? 0;

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <p className="mt-1 text-gray-600">
          Ringkasan aktivitas GymDesk
        </p>
      </div>

      {/* Statistik */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Total Member
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalMember}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Member Premium
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalPremium}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Member Student
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalStudent}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Total Kunjungan
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalVisit}
          </p>
        </div>
      </div>

      {/* Member terbaru */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Member Terbaru
          </h2>

          <a
            href="/members"
            className="rounded-lg bg-black px-4 py-2 text-sm text-white"
          >
            Lihat Semua
          </a>
        </div>

        <div className="mt-4 space-y-3">
          {members?.slice(0, 5).map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-semibold">
                  {member.name}
                </p>

                <p className="text-sm text-gray-500">
                  {member.phone}
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                {member.membership}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Kunjungan terbaru */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Kunjungan Terbaru
          </h2>

          <a
            href="/visits"
            className="rounded-lg bg-black px-4 py-2 text-sm text-white"
          >
            Lihat Semua
          </a>
        </div>

        <div className="mt-4 space-y-3">
          {visits?.slice(0, 5).map((visit) => (
            <div
              key={visit.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <p className="font-semibold">
                {visit.members?.[0]?.name ?? "Member"}
              </p>

              <p className="text-sm text-gray-500">
                {visit.visit_date}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}