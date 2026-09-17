"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type PaymentMethodChartProps = {
  data: {
    method: string;
    total: number;
  }[];
};

export default function PaymentMethodChart({
  data,
}: PaymentMethodChartProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-900">
          Metode Pembayaran
        </h2>

        <p className="text-sm text-zinc-500">
          Total pendapatan berdasarkan metode pembayaran.
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="method" />

            <YAxis />

            <Tooltip
              formatter={(value) =>
                `Rp ${Number(value).toLocaleString("id-ID")}`
              }
            />

            <Bar
              dataKey="total"
              fill="#f97316"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}