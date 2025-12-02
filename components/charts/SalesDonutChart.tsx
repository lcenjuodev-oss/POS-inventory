"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Completed", value: 80 },
  { name: "Distributed", value: 15 },
  { name: "Returned", value: 5 }
];

const COLORS = ["#22C55E", "#F97316", "#6366F1"];

export function SalesDonutChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          innerRadius={55}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              stroke="transparent"
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}


