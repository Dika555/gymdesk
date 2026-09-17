"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Transaction = {
  id: string;
  transaction_type: string;
  payment_method: string;
  total_amount: number;
  status: string;
  transaction_date: string;
  notes: string | null;
  members: {
  id: string;
  name: string;
  phone: string | null;
} | null;
};

type Membership = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  membership_plans: {
    name: string;
    duration: number;
    price: number;
  }[] | null;
};

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [transaction, setTransaction] =
    useState<Transaction | null>(null);

  const [membership, setMembership] =
    useState<Membership | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTransaction() {
      const { id } = await params;

      const supabase = createClient();

      const { data, error } = await supabase
        .from("transactions")
        .select(`
          id,
          transaction_type,
          payment_method,
          total_amount,
          status,
          transaction_date,
          notes,
          members!transactions_member_id_fkey (
            id,
            name,
            phone
          )
        `)
        .eq("id", id)
        .single();

     if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setTransaction(data);

    setTransaction(data);

      if (
        data.transaction_type === "membership" &&
        data.members
      ) {
        const {
          data: membershipData,
          error: membershipError,
        } = await supabase
          .from("memberships")
          .select(`
            id,
            start_date,
            end_date,
            status,
            membership_plans (
              name,
              duration,
              price
            )
          `)
          .eq("member_id", data.members.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (membershipError) {
          console.error(
            "Gagal mengambil membership:",
            membershipError,
          );
        } else {
          setMembership(membershipData);
        }
      }

      setLoading(false);
    }

    getTransaction();
  }, [params]);

  function formatType(type: string) {
    switch (type) {
      case "registration":
        return "Pendaftaran";
      case "membership":
        return "Membership";
      case "product":
        return "Produk";
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

  function formatStatus(status: string) {
    switch (status) {
      case "completed":
        return "Selesai";
      case "pending":
        return "Menunggu";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status;
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDateOnly(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "id-ID",
      {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "long",
        year: "numeric",
      },
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p className="text-gray-500">
          Memuat transaksi...
        </p>
      </main>
    );
  }

  if (!transaction) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p className="text-red-500">
          Transaksi tidak ditemukan.
        </p>
      </main>
    );
  }

  const memberName =
  transaction.members?.name ?? "Non-member";

  const membershipPlan =
    membership?.membership_plans?.[0];

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <h1 className="text-3xl font-bold">
        Detail Transaksi
      </h1>

      <p className="mt-1 text-gray-500">
        Informasi transaksi GymDesk.
      </p>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          Informasi Transaksi
        </h2>

        <div className="mt-6 space-y-3">
          <p>
            <span className="font-medium">ID:</span>{" "}
            {transaction.id}
          </p>

          <p>
            <span className="font-medium">Tanggal:</span>{" "}
            {formatDate(transaction.transaction_date)}
          </p>

          <p>
            <span className="font-medium">Jenis:</span>{" "}
            {formatType(transaction.transaction_type)}
          </p>

          <p>
            <span className="font-medium">Member:</span>{" "}
            {memberName}
          </p>

          <p>
            <span className="font-medium">
              Pembayaran:
            </span>{" "}
            {formatPaymentMethod(
              transaction.payment_method,
            )}
          </p>

          <p>
            <span className="font-medium">Total:</span>{" "}
            Rp{" "}
            {transaction.total_amount.toLocaleString(
              "id-ID",
            )}
          </p>

          <p>
            <span className="font-medium">Status:</span>{" "}
            {formatStatus(transaction.status)}
          </p>

          {transaction.notes && (
            <p>
              <span className="font-medium">
                Catatan:
              </span>{" "}
              {transaction.notes}
            </p>
          )}
        </div>
      </div>

      {transaction.transaction_type === "membership" &&
        membership && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">
              Detail Membership
            </h2>

            <div className="mt-6 space-y-3">
              <p>
                <span className="font-medium">
                  Paket:
                </span>{" "}
                {membershipPlan?.name ?? "-"}
              </p>

              <p>
                <span className="font-medium">
                  Durasi:
                </span>{" "}
                {membershipPlan?.duration ?? "-"} bulan
              </p>

              <p>
                <span className="font-medium">
                  Mulai:
                </span>{" "}
                {formatDateOnly(
                  membership.start_date,
                )}
              </p>

              <p>
                <span className="font-medium">
                  Berakhir:
                </span>{" "}
                {formatDateOnly(
                  membership.end_date,
                )}
              </p>

              <p>
                <span className="font-medium">
                  Status:
                </span>{" "}
                {formatStatus(membership.status)}
              </p>
            </div>
          </div>
        )}
    </main>
  );
}