"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { month: "Jan", orders: 4000, profit: 2400 },
  { month: "Feb", orders: 3000, profit: 2210 },
  { month: "Mar", orders: 5000, profit: 2290 },
  { month: "Apr", orders: 4780, profit: 2000 },
  { month: "May", orders: 5890, profit: 2181 },
  { month: "Jun", orders: 7390, profit: 2500 },
  { month: "Jul", orders: 6490, profit: 2100 },
  { month: "Aug", orders: 7200, profit: 2600 }
];

export function OrdersLineChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
        <Tooltip
          contentStyle={{
            borderRadius: 16,
            border: "none",
            boxShadow: "0 18px 45px rgba(15,23,42,0.15)"
          }}
        />
        <Line
          type="monotone"
          dataKey="orders"
          stroke="#FFB020"
          strokeWidth={3}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#7C3AED"
          strokeWidth={3}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}


