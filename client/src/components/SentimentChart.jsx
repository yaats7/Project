import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function SentimentChart({ data }) {
  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 14, margin: "0 0 14px" }}>
        Sentiment breakdown
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="sentiment"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.sentiment} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} messages`, name]}
            contentStyle={{ borderRadius: 10, border: "1px solid #e3e6ec", fontSize: 13 }}
          />
          <Legend
            verticalAlign="bottom"
            height={24}
            formatter={(value) => <span style={{ textTransform: "capitalize" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
