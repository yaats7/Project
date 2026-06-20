import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function CategoryChart({ data }) {
  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 14, margin: "0 0 14px" }}>
        Top categories by volume
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ left: 12, right: 24, top: 4, bottom: 4 }}>
          <CartesianGrid stroke="#e3e6ec" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#586174" }} />
          <YAxis
            type="category"
            dataKey="category"
            width={110}
            tick={{ fontSize: 12.5, fill: "#161b22" }}
          />
          <Tooltip
            cursor={{ fill: "#f3f4f7" }}
            contentStyle={{ borderRadius: 10, border: "1px solid #e3e6ec", fontSize: 13 }}
          />
          <Bar dataKey="count" fill="#2b3445" radius={[0, 6, 6, 0]} barSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
