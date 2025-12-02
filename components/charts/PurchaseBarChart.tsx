"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { month: "Jan", purchased: 30, sold: 18 },
  { month: "Feb", purchased: 45, sold: 26 },
  { month: "Mar", purchased: 38, sold: 20 },
  { month: "Apr", purchased: 52, sold: 34 },
  { month: "May", purchased: 44, sold: 28 },
  { month: "Jun", purchased: 61, sold: 40 }
];

export function PurchaseBarChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barSize={14} margin={{ top: 8, right: 16 }}>
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            borderRadius: 16,
            border: "none",
            boxShadow: "0 18px 45px rgba(15,23,42,0.15)"
          }}
        />
        <Bar dataKey="purchased" fill="#0EA5E9" radius={8} />
        <Bar dataKey="sold" fill="#22C55E" radius={8} />
      </BarChart>
    </ResponsiveContainer>
  );
}


