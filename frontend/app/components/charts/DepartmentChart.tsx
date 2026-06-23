"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts"

const PALETTE = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"]

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "10px 14px",
        boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
        border: "1px solid rgba(226,232,240,0.8)",
      }}>
        <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
          {payload[0]?.payload?.dept}
        </p>
        <p style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: payload[0]?.fill || "#3b82f6" }}>
          {payload[0]?.value}
          <span style={{ fontSize: "11px", fontWeight: 500, color: "#64748b", marginLeft: "4px" }}>patients</span>
        </p>
      </div>
    )
  }
  return null
}

// Custom rounded right-corner bar shape
function RoundedBar(props: any) {
  const { x, y, width, height, fill } = props
  const radius = 6
  if (!width || !height) return null
  return (
    <path
      d={`M${x},${y + height} L${x},${y} L${x + width - radius},${y} Q${x + width},${y} ${x + width},${y + radius} L${x + width},${y + height} Z`}
      fill={fill}
    />
  )
}

export default function DepartmentChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
        barSize={18}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8", fontSize: 11 }}
        />
        <YAxis
          type="category"
          dataKey="dept"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#475569", fontSize: 11, fontWeight: 500 }}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(241,245,249,0.8)" }} />
        <Bar
          dataKey="count"
          shape={<RoundedBar />}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
