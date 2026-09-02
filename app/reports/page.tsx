import { createClient } from "@/lib/supabase/server";

type Visit = {
  id: string;
  visit_date: string;
  members: {
    name: string;
  }[] | null;
};

export default async function ReportsPage() {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("id, name, membership");

  const { data: visits } = await supabase
    .from("visits")
    .select("id, visit_date, members(name)")
    .order("visit_date", { ascending: false });

  const { data: trainers } = await supabase
    .from("trainers")
    .select("id");

  const totalMember = members?.length ?? 0;
  const totalVisit = visits?.length ?? 0;
  const totalTrainer = trainers?.length ?? 0;

  const totalPremium =
    members?.filter(
      (member) => member.membership === "Premium"
    ).length ?? 0;

  const totalStudent =
    members?.filter(
      (member) => member.membership === "Student"
    ).length ?? 0;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div>
        <h1 className="text-3xl font-bold">
          Reports
        </h1>

        <p className="mt-1 text-gray-600">
          Ringkasan data GymDesk
        </p>
      </div>

      {/* Statistik */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 text-black">
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
            Premium
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalPremium}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Student
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

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Total Trainer
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalTrainer}
          </p>
        </div>
      </div>

      {/* Riwayat kunjungan */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-bold">
          Riwayat Kunjungan
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="px-4 py-3">
                  Member
                </th>

                <th className="px-4 py-3">
                  Tanggal
                </th>
              </tr>
            </thead>

            <tbody>
              {visits?.map((visit: Visit) => (
                <tr
                  key={visit.id}
                  className="border-b"
                >
                  <td className="px-4 py-3">
                    {visit.members?.[0]?.name ??
                      "Member"}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {visit.visit_date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalVisit === 0 && (
            <p className="py-6 text-center text-gray-500">
              Belum ada data kunjungan.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}