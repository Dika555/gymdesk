type Transaction = {
  id: string;
  transaction_type: string;
  total_amount: number;
  transaction_date: string;
  members: {
    name: string;
  } | null;
};

type Props = {
  transactions: Transaction[];
};

export default function RecentActivity({
  transactions,
}: Props) {
  function formatType(type: string) {
    switch (type) {
      case "registration":
        return "Pendaftaran Member";
      case "membership":
        return "Pembayaran Membership";
      case "product":
        return "Pembelian Produk";
      default:
        return "Transaksi Lainnya";
    }
  }

  function formatCurrency(amount: number) {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-900">
          Aktivitas Terbaru
        </h2>

        <p className="text-sm text-zinc-500">
          5 transaksi terbaru di GymDesk.
        </p>
      </div>

      {transactions.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-500">
          Belum ada aktivitas.
        </p>
      ) : (
        <div className="divide-y divide-zinc-100">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div>
                <p className="font-medium text-zinc-900">
                  {formatType(transaction.transaction_type)}
                </p>

                <p className="text-sm text-zinc-500">
                  {transaction.members?.name ?? "Non-member"} ·{" "}
                  {formatDate(transaction.transaction_date)}
                </p>
              </div>

              <p className="shrink-0 font-medium text-zinc-900">
                {formatCurrency(transaction.total_amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}