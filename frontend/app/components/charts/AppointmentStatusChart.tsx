"use client"

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"

const COLORS = ["#f59e0b", "#3b82f6", "#22c55e"]
const LABELS = ["Waiting", "In Consultation", "Completed"]
const ICONS  = ["⏳", "🩺", "✅"]

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const entry = payload[0]
    return (
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "10px 16px",
        boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
        border: `2px solid ${entry.payload.fill}`,
        minWidth: "130px",
      }}>
        <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{entry.name}</p>
        <p style={{ margin: 0, fontSize: "22px", fontWeight: 900, color: entry.payload.fill }}>{entry.value}</p>
      </div>
    )
  }
  return null
}

function CenterLabel({ cx, cy, total }: { cx: number; cy: number; total: number }) {
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#0f172a" fontSize={28} fontWeight={800}>
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize={11} fontWeight={500}>
        TOTAL
      </text>
    </g>
  )
}

export default function AppointmentStatusChart({ data }: { data: any[] }) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0)

  // Ensure data has correct shape: [{name, value}]
  const chartData = data.length > 0 && data[0].name
    ? data
    : [
        { name: "Waiting", value: data[0]?.waiting ?? 23 },
        { name: "In Consultation", value: data[1]?.in_consultation ?? 8 },
        { name: "Completed", value: data[2]?.completed ?? 111 },
      ]

  const totalVal = chartData.reduce((s, d) => s + (d.value || 0), 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "280px" }}>
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={900}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="white"
                  strokeWidth={3}
                  style={{ filter: `drop-shadow(0 4px 8px ${COLORS[index % COLORS.length]}44)` }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {/* @ts-ignore */}
            <CenterLabel cx={0} cy={0} total={totalVal} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", paddingTop: "8px" }}>
        {chartData.map((entry, index) => (
          <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "10px", height: "10px", borderRadius: "50%",
              background: COLORS[index % COLORS.length],
              boxShadow: `0 0 6px ${COLORS[index % COLORS.length]}66`,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>{entry.name}</span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: COLORS[index % COLORS.length] }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
