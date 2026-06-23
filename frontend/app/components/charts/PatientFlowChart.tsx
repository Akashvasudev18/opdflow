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
        padding: "10px 14px",
        boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
        border: "1px solid rgba(226,232,240,0.8)",
      }}>
        <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#8b5cf6" }}>
          {payload[0].value}
          <span style={{ fontSize: "11px", fontWeight: 500, color: "#64748b", marginLeft: "4px" }}>patients</span>
        </p>
      </div>
    )
  }
  return null
}

export default function PatientFlowChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8", fontSize: 11 }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#8b5cf6", strokeWidth: 1, strokeDasharray: "4 4" }} />
        <Area
          type="monotone"
          dataKey="patients"
          stroke="#8b5cf6"
          strokeWidth={2.5}
          fill="url(#flowGrad)"
          dot={false}
          activeDot={{ r: 6, fill: "#8b5cf6", stroke: "white", strokeWidth: 2 }}
          isAnimationActive={true}
          animationDuration={900}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
