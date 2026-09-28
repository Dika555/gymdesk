"use client";

type TransactionReportItem = {
  id: string;
  transactionDate: string;
  transactionType: string;
  memberName: string;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  notes: string | null;
};

type Props = {
  transactions: TransactionReportItem[];
};

export default function TransactionReport({
  transactions,
}: Props) {
  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatCurrency(amount: number) {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  }

  function formatType(type: string) {
    switch (type) {
      case "registration":
        return "Pendaftaran";

      case "membership":
        return "Membership";

      case "product":
        return "Produk";

      case "trainer":
        return "Trainer";

      default:
        return "Lainnya";
    }
  }

  function formatPaymentMethod(method: string) {
    switch (method) {
      case "cash":
        return "Cash";

      case "qris":
        return "QRIS";

      case "transfer":
        return "Transfer";

      default:
        return method;
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-900">
          Data Transaksi
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Daftar transaksi berdasarkan periode yang dipilih.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500">
              <th className="px-4 py-3 font-medium">No</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Jenis</th>
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium">
                Pembayaran
              </th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-zinc-500"
                >
                  Tidak ada transaksi pada periode ini.
                </td>
              </tr>
            ) : (
              transactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className="border-b border-zinc-100"
                >
                  <td className="px-4 py-3 text-zinc-500">
                    {index + 1}
                  </td>

                  <td className="px-4 py-3 text-zinc-700">
                    {formatDate(transaction.transactionDate)}
                  </td>

                  <td className="px-4 py-3 text-zinc-700">
                    {formatType(transaction.transactionType)}
                  </td>

                  <td className="px-4 py-3 text-zinc-700">
                    {transaction.memberName}
                  </td>

                  <td className="px-4 py-3 text-zinc-700">
                    {formatPaymentMethod(
                      transaction.paymentMethod
                    )}
                  </td>

                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {formatCurrency(transaction.totalAmount)}
                  </td>

                  <td className="px-4 py-3 text-zinc-700">
                    {transaction.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}