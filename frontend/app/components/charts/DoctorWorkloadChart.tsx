"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Cell,
} from "recharts"

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "10px 14px",
        boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
        border: "1px solid rgba(226,232,240,0.8)",
        minWidth: "140px",
      }}>
        <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
          Dr. {label}
        </p>
        <p style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#1d4ed8" }}>
          {payload[0]?.value}
          <span style={{ fontSize: "11px", fontWeight: 500, color: "#64748b", marginLeft: "4px" }}>patients</span>
        </p>
      </div>
    )
  }
  return null
}

export default function DoctorWorkloadChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data}
        margin={{ top: 24, right: 16, left: -20, bottom: 0 }}
        barSize={38}
        barCategoryGap="35%"
      >
        <defs>
          <linearGradient id="doctorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity={1} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#475569", fontSize: 11, fontWeight: 500 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8", fontSize: 11 }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(241,245,249,0.8)" }} />
        <Bar
          dataKey="patients"
          fill="url(#doctorGrad)"
          radius={[6, 6, 0, 0]}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
        >
          <LabelList
            dataKey="patients"
            position="top"
            style={{
              fill: "#1d4ed8",
              fontSize: "11px",
              fontWeight: 700,
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
