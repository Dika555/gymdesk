type SummaryReportProps = {
  newMembers: number;
  newMemberships: number;
  totalVisits: number;
  totalTransactions: number;
  totalRevenue: number;
};

export default function SummaryReport({
  newMembers,
  newMemberships,
  totalVisits,
  totalTransactions,
  totalRevenue,
}: SummaryReportProps) {
  return (
    <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-zinc-900">
          Ringkasan
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Ringkasan laporan berdasarkan periode yang dipilih.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">Member Baru</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            {newMembers}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">Membership Baru</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            {newMemberships}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">Total Kunjungan</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            {totalVisits}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">Total Transaksi</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            {totalTransactions}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">Total Pendapatan</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    </section>
  );
}