"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "12px 16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        border: "1px solid rgba(226,232,240,0.8)",
        minWidth: "140px",
      }}>
        <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#3b82f6" }}>
          {payload[0].value}
          <span style={{ fontSize: "12px", fontWeight: 500, color: "#64748b", marginLeft: "4px" }}>appts</span>
        </p>
      </div>
    )
  }
  return null
}

export default function DailyAppointmentsChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="appointGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8", fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "4 4" }} />
        <Area
          type="monotone"
          dataKey="appointments"
          stroke="#3b82f6"
          strokeWidth={2.5}
          fill="url(#appointGrad)"
          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4, stroke: "white" }}
          activeDot={{ r: 6, fill: "#3b82f6", stroke: "white", strokeWidth: 2, filter: "drop-shadow(0 0 6px rgba(59,130,246,0.6))" }}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
