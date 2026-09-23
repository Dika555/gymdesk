type VisitReportItem = {
  id: string;
  memberName: string;
  visitDate: string;
  visitFee: number;
  paymentMethod: string | null;
  isMember: boolean;
};

type VisitsReportProps = {
  visits: VisitReportItem[];
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatPaymentMethod(method: string | null) {
  if (!method) return "-";

  if (method === "cash") return "Cash";
  if (method === "qris") return "QRIS";
  if (method === "transfer") return "Transfer";

  return method;
}

export default function VisitsReport({
  visits,
}: VisitsReportProps) {
  return (
    <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-zinc-900">
          Data Kunjungan
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Riwayat kunjungan berdasarkan periode yang dipilih.
        </p>
      </div>

      {visits.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-500">
          Tidak ada data kunjungan pada periode yang dipilih.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-sm text-zinc-500">
                <th className="px-4 py-3 font-medium">No</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">
                  Member / Pengunjung
                </th>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">Biaya</th>
                <th className="px-4 py-3 font-medium">
                  Pembayaran
                </th>
              </tr>
            </thead>

            <tbody>
              {visits.map((visit, index) => (
                <tr
                  key={visit.id}
                  className="border-b border-zinc-100 last:border-b-0"
                >
                  <td className="px-4 py-3 text-sm text-zinc-500">
                    {index + 1}
                  </td>

                  <td className="px-4 py-3 text-sm text-zinc-600">
                    {formatDate(visit.visitDate)}
                  </td>

                  <td className="px-4 py-3 text-sm font-medium text-zinc-900">
                    {visit.memberName}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <span
                      className={
                        visit.isMember
                          ? "rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700"
                          : "rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700"
                      }
                    >
                      {visit.isMember ? "Member" : "Non-Member"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm text-zinc-600">
                    {formatCurrency(visit.visitFee)}
                  </td>

                  <td className="px-4 py-3 text-sm text-zinc-600">
                    {formatPaymentMethod(visit.paymentMethod)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}