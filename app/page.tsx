import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/StatCard";
import VisitChart from "@/components/VisitChart";
import RecentActivity from "@/components/RecentActivity";

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();

  const today = now.toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });

  const sevenDaysAgo = new Date();

  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() - 6
  );

    const startDate = sevenDaysAgo.toLocaleDateString(
      "en-CA",
      {
        timeZone: "Asia/Jakarta",
      }
    );

    const { data: visits } = await supabase
      .from("visits")
      .select("visit_date")
      .gte("visit_date", startDate)
      .lte("visit_date", today);

    const visitChartData = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);

      date.setDate(
        sevenDaysAgo.getDate() + i
      );

      const dateString =
        date.toISOString().split("T")[0];

      const total =
        visits?.filter(
          (visit) =>
            visit.visit_date === dateString
        ).length ?? 0;

      visitChartData.push({
        date: dateString,
        total,
      });
    }

    const { data: recentTransactions } = await supabase
      .from("transactions")
      .select(`
        id,
        transaction_type,
        total_amount,
        transaction_date,
        members (
          name
        )
      `)
      .order("transaction_date", {
        ascending: false,
      })
      .limit(5);

  const [
    { count: totalMember },
    { count: activeMember },
    { count: todayVisits },
    { count: todayTransactions },
  ] = await Promise.all([
    supabase
      .from("members")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("status", "aktif"),

    supabase
      .from("visits")
      .select("*", { count: "exact", head: true })
      .eq("visit_date", today),

    supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .gte("transaction_date", `${today}T00:00:00`)
      .lt("transaction_date", `${today}T23:59:59.999`),
  ]);

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="mt-1 text-gray-500">
          Ringkasan aktivitas GymDesk hari ini.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Member" value={totalMember ?? 0} />
        <StatCard title="Member Aktif" value={activeMember ?? 0} />
        <StatCard title="Kunjungan Hari Ini" value={todayVisits ?? 0} />
        <StatCard title="Transaksi Hari Ini" value={todayTransactions ?? 0} />
      </div>

      <div className="mt-6">
        <VisitChart data={visitChartData} />
      </div>

      <div className="mt-6">
        <RecentActivity
          transactions={(recentTransactions ?? []).map((transaction) => ({
            ...transaction,
            members: transaction.members?.[0] ?? null,
          }))}
        />
      </div>
    </main>
  );
}