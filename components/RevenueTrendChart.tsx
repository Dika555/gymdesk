"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type RevenueTrendChartProps = {
  data: {
    date: string;
    total: number;
  }[];
};

export default function RevenueTrendChart({
  data,
}: RevenueTrendChartProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-900">
          Revenue Trend
        </h2>

        <p className="text-sm text-zinc-500">
          Pendapatan berdasarkan periode yang dipilih.
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis />

            <Tooltip
              formatter={(value) =>
                `Rp ${Number(value).toLocaleString("id-ID")}`
              }
            />

            <Line
              type="monotone"
              dataKey="total"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}