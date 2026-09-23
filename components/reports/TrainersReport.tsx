type TrainerReportItem = {
  id: string;
  name: string;
  memberCount: number;
  sessionCount: number;
  revenue: number;
};

type TrainersReportProps = {
  trainers: TrainerReportItem[];
};

function formatCurrency(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function TrainersReport({
  trainers,
}: TrainersReportProps) {
  const totalMembers = trainers.reduce(
    (total, trainer) => total + trainer.memberCount,
    0
  );

  const totalSessions = trainers.reduce(
    (total, trainer) => total + trainer.sessionCount,
    0
  );

  const totalRevenue = trainers.reduce(
    (total, trainer) => total + trainer.revenue,
    0
  );

  return (
    <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-zinc-900">
          Data Trainer
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Aktivitas trainer berdasarkan periode yang dipilih.
        </p>
      </div>

      {trainers.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-500">
          Tidak ada data trainer pada periode yang dipilih.
        </p>
      ) : (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 p-4">
              <p className="text-sm text-zinc-500">
                Total Member Ditangani
              </p>

              <p className="mt-1 text-xl font-semibold text-zinc-900">
                {totalMembers}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 p-4">
              <p className="text-sm text-zinc-500">
                Total Sesi
              </p>

              <p className="mt-1 text-xl font-semibold text-zinc-900">
                {totalSessions}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 p-4">
              <p className="text-sm text-zinc-500">
                Pendapatan Trainer
              </p>

              <p className="mt-1 text-xl font-semibold text-zinc-900">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-sm text-zinc-500">
                  <th className="px-4 py-3 font-medium">No</th>
                  <th className="px-4 py-3 font-medium">Trainer</th>
                  <th className="px-4 py-3 font-medium">
                    Member Ditangani
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Total Sesi
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Pendapatan
                  </th>
                </tr>
              </thead>

              <tbody>
                {trainers.map((trainer, index) => (
                  <tr
                    key={trainer.id}
                    className="border-b border-zinc-100 last:border-b-0"
                  >
                    <td className="px-4 py-3 text-sm text-zinc-500">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-zinc-900">
                      {trainer.name}
                    </td>

                    <td className="px-4 py-3 text-sm text-zinc-600">
                      {trainer.memberCount} member
                    </td>

                    <td className="px-4 py-3 text-sm text-zinc-600">
                      {trainer.sessionCount} sesi
                    </td>

                    <td className="px-4 py-3 text-sm text-zinc-600">
                      {formatCurrency(trainer.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}