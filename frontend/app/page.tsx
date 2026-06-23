"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Sidebar from "./components/Sidebar"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"

// ─── API Base ─────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// ─── Types ────────────────────────────────────────────────────────────────────
interface OpdStats {
  total_appointments: number
  today_appointments: number
  waiting_today: number
  in_consultation_today: number
  completed_today: number
  total_doctors: number
  active_doctors: number
  available_doctors: number
  avg_waiting_time: number
  total_slots_today: number
  booked_slots_today: number
  remaining_slots_today: number
}

interface DailyAppointment {
  day: string
  date: string
  appointments: number
}

interface HourlyFlow {
  time: string
  patients: number
}

interface DeptDistribution {
  dept: string
  count: number
}

interface DoctorWorkload {
  name: string
  patients: number
}

interface StatusDistribution {
  name: string
  value: number
}

interface Patient {
  id: number
  name: string
  status: string
  opd_type: string
  doctor: string
  appointment_id: number
}

interface Doctor {
  id?: number
  name: string
  specialization?: string
  status: "available" | "busy"
}

interface TodayAppointment {
  appointment_id: string
  patient_name: string
  doctor_name: string
  opd_type: string
  appointment_time: string
  status: string
}

// ─── Animated Counter Hook ────────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 900): number {
  const [current, setCurrent] = useState(0)
  const prevTarget = useRef(0)

  useEffect(() => {
    if (target === prevTarget.current) return
    const from = prevTarget.current
    prevTarget.current = target
    const start = performance.now()

    const tick = (now: number) => {
      const pct = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - pct, 3)
      setCurrent(Math.round(from + eased * (target - from)))
      if (pct < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return current
}

// ─── Skeleton / Shimmer ───────────────────────────────────────────────────────
function Skeleton({ width = "100%", height = 20, radius = 8 }: { width?: string | number; height?: number; radius?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #eef2ff 0%, #e0f2fe 50%, #f0fdf4 100%)" }}>
      <div style={{ width: "260px", background: "linear-gradient(180deg, #0f172a 0%, #1e3a5f 60%, #0e7490 100%)", padding: "32px 24px", flexShrink: 0 }}>
        <Skeleton width="120px" height={28} />
        <div style={{ marginTop: "48px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={36} radius={12} />
          ))}
        </div>
      </div>
      <div style={{ flex: 1, padding: "40px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <Skeleton height={40} width="300px" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} height={140} radius={20} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
          <Skeleton height={320} radius={20} />
          <Skeleton height={320} radius={20} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <Skeleton height={280} radius={20} />
          <Skeleton height={280} radius={20} />
        </div>
        <Skeleton height={300} radius={20} />
      </div>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  icon,
  label,
  value,
  suffix,
  color,
  delay = "0ms",
}: {
  icon: string
  label: string
  value: number
  suffix?: string
  color: string
  delay?: string
}) {
  const animated = useAnimatedCounter(value)

  const borderColors: Record<string, string> = {
    blue: "#3b82f6",
    green: "#22c55e",
    amber: "#f59e0b",
    purple: "#8b5cf6",
    red: "#ef4444",
    teal: "#06b6d4",
  }
  const bgColors: Record<string, string> = {
    blue: "#eff6ff",
    green: "#f0fdf4",
    amber: "#fffbeb",
    purple: "#f5f3ff",
    red: "#fef2f2",
    teal: "#f0fdfa",
  }
  const accent = borderColors[color] || "#3b82f6"
  const bg = bgColors[color] || "#eff6ff"

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: "20px",
        padding: "24px 20px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        border: "1px solid rgba(226,232,240,0.8)",
        borderLeft: `4px solid ${accent}`,
        position: "relative",
        overflow: "hidden",
        animation: `fadeSlideUp 0.5s ease ${delay} both`,
        cursor: "default",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = "translateY(-4px)"
        el.style.boxShadow = `0 12px 36px rgba(0,0,0,0.1), 0 0 0 1px ${accent}33`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = "translateY(0)"
        el.style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: accent,
          opacity: 0.06,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "44px",
          height: "44px",
          borderRadius: "14px",
          background: bg,
          fontSize: "20px",
          marginBottom: "14px",
          border: `1px solid ${accent}33`,
        }}
      >
        {icon}
      </div>

      <p
        style={{
          margin: "0 0 6px",
          fontSize: "12px",
          fontWeight: 600,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </p>
      <p style={{ margin: 0, fontSize: "34px", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
        {animated}
        {suffix && <span style={{ fontSize: "16px", fontWeight: 600, color: "#94a3b8", marginLeft: "4px" }}>{suffix}</span>}
      </p>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; border: string; label: string; icon: string }> = {
    waiting: { color: "#b45309", bg: "#fffbeb", border: "#fde68a", label: "Waiting", icon: "⏳" },
    in_consultation: { color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", label: "In Consultation", icon: "🩺" },
    completed: { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", label: "Completed", icon: "✅" },
    scheduled: { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", label: "Scheduled", icon: "📅" },
    cancelled: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", label: "Cancelled", icon: "❌" },
  }
  const s = map[status] || { color: "#64748b", bg: "#f8fafc", border: "#e2e8f0", label: status, icon: "•" }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 700,
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.icon} {s.label}
    </span>
  )
}

// ─── Glassmorphism Card ───────────────────────────────────────────────────────
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: "20px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        border: "1px solid rgba(226,232,240,0.8)",
        padding: "24px",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #1a2980, #06b6d4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          boxShadow: "0 4px 12px rgba(26,41,128,0.25)",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>{title}</h2>
        {subtitle && (
          <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{subtitle}</p>
        )}
      </div>
    </div>
  )
}

// ─── Chart Tooltip Helpers ────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, valueLabel, accentColor }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  valueLabel?: string
  accentColor?: string
}) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "12px 16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: "1px solid rgba(226,232,240,0.8)",
          minWidth: "140px",
        }}
      >
        <p
          style={{
            margin: "0 0 4px",
            fontSize: "11px",
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontWeight: 600,
          }}
        >
          {label}
        </p>
        <p style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: accentColor || "#3b82f6" }}>
          {payload[0].value}
          {valueLabel && (
            <span style={{ fontSize: "12px", fontWeight: 500, color: "#64748b", marginLeft: "4px" }}>
              {valueLabel}
            </span>
          )}
        </p>
      </div>
    )
  }
  return null
}

// ─── PIE CENTER LABEL ─────────────────────────────────────────────────────────
function PieCenterLabel({ viewBox, total }: { viewBox?: { cx: number; cy: number }; total: number }) {
  if (!viewBox) return null
  const { cx, cy } = viewBox
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

// ─── COMING SOON CARD ─────────────────────────────────────────────────────────
function ComingSoonCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid rgba(226,232,240,0.6)",
        position: "relative",
        overflow: "hidden",
        opacity: 0.75,
        transition: "opacity 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "1"
        e.currentTarget.style.transform = "translateY(-2px)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "0.75"
        e.currentTarget.style.transform = "translateY(0)"
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          fontSize: "9px",
          fontWeight: 800,
          color: "#8b5cf6",
          background: "#f5f3ff",
          border: "1px solid #ddd6fe",
          padding: "2px 8px",
          borderRadius: "20px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Coming Soon
      </span>
      <span style={{ fontSize: "28px", display: "block", marginBottom: "10px" }}>{icon}</span>
      <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{title}</p>
      <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>{desc}</p>
    </div>
  )
}

// ─── PIE CHART COLORS ─────────────────────────────────────────────────────────
const PIE_COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#ef4444", "#8b5cf6"]

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  // ── State ──
  const [stats, setStats] = useState<OpdStats | null>(null)
  const [dailyAppointments, setDailyAppointments] = useState<DailyAppointment[]>([])
  const [hourlyFlow, setHourlyFlow] = useState<HourlyFlow[]>([])
  const [deptDistribution, setDeptDistribution] = useState<DeptDistribution[]>([])
  const [doctorWorkload, setDoctorWorkload] = useState<DoctorWorkload[]>([])
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([])
  const [loaded, setLoaded] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const wsRef = useRef<WebSocket | null>(null)

  // ── Fetch All Data ──
  const fetchAll = useCallback(async () => {
    try {
      const endpoints = [
        { url: `${API}/opd/stats`, setter: setStats },
        { url: `${API}/analytics/daily-appointments`, setter: setDailyAppointments },
        { url: `${API}/analytics/hourly-flow`, setter: setHourlyFlow },
        { url: `${API}/analytics/department-distribution`, setter: setDeptDistribution },
        { url: `${API}/analytics/doctor-workload`, setter: setDoctorWorkload },
        { url: `${API}/analytics/status-distribution`, setter: setStatusDistribution },
        { url: `${API}/patients/list`, setter: setPatients },
        { url: `${API}/doctors`, setter: setDoctors },
        { url: `${API}/appointments/today`, setter: setTodayAppointments },
      ]

      const results = await Promise.allSettled(
        endpoints.map((ep) => fetch(ep.url).then((r) => (r.ok ? r.json() : Promise.reject(r.statusText))))
      )

      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(endpoints[i].setter as (v: any) => void)(result.value)
        }
      })
    } catch {
      // Network errors silently handled — data stays as last known
    } finally {
      setLoaded(true)
    }
  }, [])

  // ── Complete Appointment ──
  const completeAppointment = useCallback(async (appointmentId: string) => {
    try {
      const res = await fetch(`${API}/appointments/complete/${appointmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) {
        fetchAll() // Refresh all data immediately
      }
    } catch {
      // Silently handle — next poll will catch up
    }
  }, [fetchAll])

  // ── WebSocket + Polling ──
  useEffect(() => {
    fetchAll()
    const pollInterval = setInterval(fetchAll, 3000)

    // Attempt WebSocket connection for real-time updates
    try {
      const wsUrl = API.replace(/^http/, "ws") + "/ws/dashboard"
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.stats) setStats(data.stats)
          if (data.patients) setPatients(data.patients)
          if (data.doctors) setDoctors(data.doctors)
          if (data.todayAppointments) setTodayAppointments(data.todayAppointments)
        } catch {
          // Ignore malformed WS messages
        }
      }

      ws.onerror = () => {
        // WebSocket failed — polling fallback is already active
      }
    } catch {
      // WebSocket not available — polling continues
    }

    return () => {
      clearInterval(pollInterval)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [fetchAll])

  // ── Clock ──
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // ── Derived Values ──
  const s = stats || {
    total_appointments: 0,
    today_appointments: 0,
    waiting_today: 0,
    in_consultation_today: 0,
    completed_today: 0,
    total_doctors: 0,
    active_doctors: 0,
    available_doctors: 0,
    avg_waiting_time: 0,
    total_slots_today: 0,
    booked_slots_today: 0,
    remaining_slots_today: 0,
  }

  const slotPercentage = s.total_slots_today > 0 ? Math.round((s.booked_slots_today / s.total_slots_today) * 100) : 0
  const statusTotal = statusDistribution.reduce((sum, d) => sum + d.value, 0)

  // ── KPI Definitions ──
  const kpiRow1 = [
    { icon: "📋", label: "Total Appointments", value: s.total_appointments, color: "blue" },
    { icon: "📅", label: "Today's Appointments", value: s.today_appointments, color: "teal" },
    { icon: "⏳", label: "Waiting Patients", value: s.waiting_today, color: "amber" },
    { icon: "🩺", label: "In Consultation", value: s.in_consultation_today, color: "purple" },
  ]

  const kpiRow2 = [
    { icon: "✅", label: "Completed Today", value: s.completed_today, color: "green" },
    { icon: "👨‍⚕️", label: "Active Doctors", value: s.active_doctors, color: "blue" },
    { icon: "🟢", label: "Available Doctors", value: s.available_doctors, color: "green" },
    { icon: "⏱️", label: "Avg Wait Time", value: s.avg_waiting_time, color: "red", suffix: " min" },
  ]

  if (!loaded) return <LoadingSkeleton />

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50% { opacity: 0.8; transform: scale(1.1); box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
        @keyframes tableRowIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .cf-layout {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #eef2ff 0%, #e0f2fe 50%, #f0fdf4 100%);
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        }

        .cf-main {
          flex: 1;
          overflow-y: auto;
          padding: 36px 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .cf-kpi-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .cf-charts-2-1 {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }

        .cf-charts-1-1 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .cf-slots-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .cf-doctors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }

        .cf-coming-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .cf-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .cf-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .cf-table th:first-child { border-radius: 10px 0 0 10px; }
        .cf-table th:last-child { border-radius: 0 10px 10px 0; }
        .cf-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          animation: tableRowIn 0.3s ease both;
        }
        .cf-table tr:nth-child(even) td { background: #fafafa; }
        .cf-table tr:hover td { background: #f0f9ff; }

        @media (max-width: 1100px) {
          .cf-kpi-row { grid-template-columns: repeat(2, 1fr); }
          .cf-charts-2-1, .cf-charts-1-1 { grid-template-columns: 1fr; }
          .cf-slots-row { grid-template-columns: 1fr; }
          .cf-coming-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .cf-layout { flex-direction: column; }
          .cf-main { padding: 20px; }
          .cf-kpi-row { grid-template-columns: 1fr; }
          .cf-doctors-grid { grid-template-columns: 1fr; }
          .cf-coming-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="cf-layout">
        {/* ── Sidebar ── */}
        <Sidebar activePage="dashboard" />

        {/* ── Main Content ── */}
        <main className="cf-main">
          {/* ── HEADER ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              animation: "fadeSlideUp 0.4s ease both",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                CareFlux Dashboard
              </h1>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "20px",
                  padding: "8px 14px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#22c55e",
                    boxShadow: "0 0 8px #22c55e",
                    animation: "livePulse 1.5s infinite",
                  }}
                />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#15803d" }}>Live</span>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "12px",
                  padding: "8px 16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(226,232,240,0.8)",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#0f172a",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* ── KPI ROW 1 ── */}
          <div className="cf-kpi-row">
            {kpiRow1.map((card, i) => (
              <KpiCard
                key={card.label}
                icon={card.icon}
                label={card.label}
                value={card.value}
                color={card.color}
                delay={`${i * 60}ms`}
              />
            ))}
          </div>

          {/* ── KPI ROW 2 ── */}
          <div className="cf-kpi-row">
            {kpiRow2.map((card, i) => (
              <KpiCard
                key={card.label}
                icon={card.icon}
                label={card.label}
                value={card.value}
                suffix={card.suffix}
                color={card.color}
                delay={`${(i + 4) * 60}ms`}
              />
            ))}
          </div>

          {/* ── SLOT SUMMARY BAR ── */}
          <Card>
            <SectionTitle icon="🎫" title="Slot Summary" subtitle="Today's appointment slot utilization" />
            <div className="cf-slots-row">
              {/* Total Slots */}
              <div
                style={{
                  background: "#eff6ff",
                  borderRadius: "14px",
                  padding: "18px 20px",
                  border: "1px solid #bfdbfe",
                  textAlign: "center",
                }}
              >
                <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                  Total Slots Today
                </p>
                <p style={{ margin: "6px 0 0", fontSize: "28px", fontWeight: 900, color: "#1d4ed8" }}>
                  {s.total_slots_today}
                </p>
              </div>
              {/* Booked */}
              <div
                style={{
                  background: "#fffbeb",
                  borderRadius: "14px",
                  padding: "18px 20px",
                  border: "1px solid #fde68a",
                  textAlign: "center",
                }}
              >
                <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                  Booked Slots
                </p>
                <p style={{ margin: "6px 0 0", fontSize: "28px", fontWeight: 900, color: "#b45309" }}>
                  {s.booked_slots_today}
                </p>
              </div>
              {/* Remaining */}
              <div
                style={{
                  background: "#f0fdf4",
                  borderRadius: "14px",
                  padding: "18px 20px",
                  border: "1px solid #bbf7d0",
                  textAlign: "center",
                }}
              >
                <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                  Remaining Slots
                </p>
                <p style={{ margin: "6px 0 0", fontSize: "28px", fontWeight: 900, color: "#15803d" }}>
                  {s.remaining_slots_today}
                </p>
              </div>
            </div>
            {/* Progress Bar */}
            <div style={{ marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>Slot Utilization</span>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#1d4ed8" }}>{slotPercentage}%</span>
              </div>
              <div
                style={{
                  height: "10px",
                  borderRadius: "10px",
                  background: "#e2e8f0",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${slotPercentage}%`,
                    borderRadius: "10px",
                    background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          </Card>

          {/* ── CHARTS ROW 1: Daily Appointments + Status Distribution ── */}
          <div className="cf-charts-2-1">
            {/* Daily Appointments Area Chart */}
            <Card>
              <SectionTitle icon="📈" title="Daily Appointments" subtitle="This week's appointment trend" />
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dailyAppointments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
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
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip
                    content={<ChartTooltip valueLabel="appts" accentColor="#3b82f6" />}
                    cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#dailyGrad)"
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4, stroke: "white" }}
                    activeDot={{ r: 6, fill: "#3b82f6", stroke: "white", strokeWidth: 2 }}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Status Distribution Pie/Donut */}
            <Card>
              <SectionTitle icon="🍩" title="Status Distribution" subtitle="Live appointment status" />
              <div style={{ display: "flex", flexDirection: "column", height: "280px" }}>
                <div style={{ flex: 1 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        animationDuration={900}
                        animationEasing="ease-out"
                      >
                        {statusDistribution.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                            stroke="white"
                            strokeWidth={3}
                            style={{ filter: `drop-shadow(0 4px 8px ${PIE_COLORS[index % PIE_COLORS.length]}44)` }}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const entry = payload[0]
                            return (
                              <div
                                style={{
                                  background: "white",
                                  borderRadius: "12px",
                                  padding: "10px 16px",
                                  boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
                                  border: `2px solid ${String(entry.payload?.fill || "#3b82f6")}`,
                                }}
                              >
                                <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                                  {String(entry.name)}
                                </p>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: "22px",
                                    fontWeight: 900,
                                    color: String(entry.payload?.fill || "#3b82f6"),
                                  }}
                                >
                                  {Number(entry.value)}
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      {/* Center label */}
                      <Pie
                        data={[{ name: "center", value: 1 }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={0}
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        <Cell fill="transparent" />
                        {/* @ts-expect-error recharts label render prop */}
                        <PieCenterLabel viewBox={{ cx: 0, cy: 0 }} total={statusTotal} />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", paddingTop: "8px" }}>
                  {statusDistribution.map((entry, index) => (
                    <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: PIE_COLORS[index % PIE_COLORS.length],
                          boxShadow: `0 0 6px ${PIE_COLORS[index % PIE_COLORS.length]}66`,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>{entry.name}</span>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: PIE_COLORS[index % PIE_COLORS.length] }}>
                        {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* ── CHARTS ROW 2: Hourly Flow + Department Distribution ── */}
          <div className="cf-charts-1-1">
            {/* Hourly Patient Flow Area Chart */}
            <Card>
              <SectionTitle icon="🌊" title="Hourly Patient Flow" subtitle="Today's patient inflow pattern" />
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={hourlyFlow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip
                    content={<ChartTooltip valueLabel="patients" accentColor="#06b6d4" />}
                    cursor={{ stroke: "#06b6d4", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="patients"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fill="url(#flowGrad)"
                    dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4, stroke: "white" }}
                    activeDot={{ r: 6, fill: "#06b6d4", stroke: "white", strokeWidth: 2 }}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Department Distribution Horizontal Bar */}
            <Card>
              <SectionTitle icon="🏥" title="Department Distribution" subtitle="Patients per department" />
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="dept"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
                    width={100}
                  />
                  <Tooltip
                    content={<ChartTooltip valueLabel="patients" accentColor="#8b5cf6" />}
                    cursor={{ fill: "rgba(139,92,246,0.06)" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#8b5cf6"
                    radius={[0, 8, 8, 0]}
                    barSize={18}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {deptDistribution.map((_, index) => (
                      <Cell
                        key={`dept-${index}`}
                        fill={`hsl(${260 + index * 20}, 70%, ${55 + index * 3}%)`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* ── CHARTS ROW 3: Doctor Workload (full width) ── */}
          <Card>
            <SectionTitle icon="👨‍⚕️" title="Doctor Workload" subtitle="Current patient load per doctor" />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={doctorWorkload} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 11, fontWeight: 500 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  content={<ChartTooltip valueLabel="patients" accentColor="#3b82f6" />}
                  cursor={{ fill: "rgba(59,130,246,0.06)" }}
                />
                <Bar dataKey="patients" radius={[8, 8, 0, 0]} barSize={36} animationDuration={800} animationEasing="ease-out">
                  {doctorWorkload.map((_, index) => (
                    <Cell
                      key={`doc-${index}`}
                      fill={`hsl(${210 + index * 15}, 80%, ${50 + (index % 3) * 5}%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* ── DOCTOR STATUS PANEL ── */}
          <Card>
            <SectionTitle icon="🩺" title="Doctor Status Panel" subtitle="Real-time availability overview" />
            <div className="cf-doctors-grid">
              {doctors.map((doc, i) => {
                const isAvailable = doc.status === "available"
                return (
                  <div
                    key={doc.id ?? i}
                    style={{
                      background: isAvailable
                        ? "linear-gradient(135deg, #f0fdf4, #ecfdf5)"
                        : "linear-gradient(135deg, #fef2f2, #fff5f5)",
                      borderRadius: "14px",
                      padding: "18px 20px",
                      border: `1px solid ${isAvailable ? "#bbf7d0" : "#fecaca"}`,
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)"
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)"
                      e.currentTarget.style.boxShadow = "none"
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: isAvailable
                          ? "linear-gradient(135deg, #22c55e, #16a34a)"
                          : "linear-gradient(135deg, #ef4444, #dc2626)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "16px",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {doc.name?.charAt(0) || "D"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#0f172a",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {doc.name}
                      </p>
                      {doc.specialization && (
                        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>
                          {doc.specialization}
                        </p>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        padding: "4px 10px",
                        borderRadius: "20px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        flexShrink: 0,
                        ...(isAvailable
                          ? { color: "#15803d", background: "#dcfce7", border: "1px solid #bbf7d0" }
                          : { color: "#dc2626", background: "#fee2e2", border: "1px solid #fecaca" }),
                      }}
                    >
                      {isAvailable ? "Available" : "Busy"}
                    </span>
                  </div>
                )
              })}
              {doctors.length === 0 && (
                <p style={{ fontSize: "13px", color: "#94a3b8", padding: "20px", gridColumn: "1 / -1", textAlign: "center" }}>
                  No doctor data available
                </p>
              )}
            </div>
          </Card>

          {/* ── RECENT APPOINTMENTS TABLE ── */}
          <Card style={{ padding: 0 }}>
            <div style={{ padding: "24px 24px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <SectionTitle
                  icon="🗒️"
                  title="Recent Appointments"
                  subtitle={`${todayAppointments.length} appointments today · Live`}
                />
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: 700,
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  {todayAppointments.filter((a) => a.status === "waiting").length} waiting
                </span>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="cf-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppointments.map((apt, i) => (
                    <tr key={apt.appointment_id} style={{ animationDelay: `${i * 40}ms` }}>
                      <td style={{ color: "#94a3b8", fontWeight: 600, fontSize: "12px", fontVariantNumeric: "tabular-nums" }}>
                        #{apt.appointment_id}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "10px",
                              background: "linear-gradient(135deg, #1a2980, #06b6d4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "12px",
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {apt.patient_name?.charAt(0) || "?"}
                          </div>
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>{apt.patient_name}</span>
                        </div>
                      </td>
                      <td style={{ color: "#475569" }}>{apt.doctor_name}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#7c3aed",
                            background: "#f5f3ff",
                            border: "1px solid #ddd6fe",
                            padding: "3px 8px",
                            borderRadius: "8px",
                          }}
                        >
                          {apt.opd_type}
                        </span>
                      </td>
                      <td style={{ fontVariantNumeric: "tabular-nums", color: "#475569", fontSize: "12px", fontWeight: 600 }}>
                        {apt.appointment_time}
                      </td>
                      <td>
                        <StatusBadge status={apt.status} />
                      </td>
                      <td>
                        {apt.status === "in_consultation" ? (
                          <button
                            onClick={() => completeAppointment(apt.appointment_id)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "10px",
                              border: "none",
                              background: "linear-gradient(135deg, #22c55e, #16a34a)",
                              color: "white",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                              boxShadow: "0 2px 8px rgba(34,197,94,0.3)",
                              transition: "transform 0.15s, box-shadow 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-1px)";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(34,197,94,0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "0 2px 8px rgba(34,197,94,0.3)";
                            }}
                          >
                            ✓ Complete
                          </button>
                        ) : (
                          <span style={{ color: "#cbd5e1", fontSize: "12px" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {todayAppointments.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                        No appointments for today
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                Showing {todayAppointments.length} appointments
              </span>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Auto-refreshes every 3s</span>
            </div>
          </Card>

          {/* ── COMING SOON SECTION ── */}
          <div>
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                🚀 Upcoming Features
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#94a3b8" }}>
                Exciting features coming to CareFlux
              </p>
            </div>
            <div className="cf-coming-grid">
              <ComingSoonCard
                icon="🔔"
                title="Push Notifications"
                desc="Real-time alerts for appointments, queue updates, and emergencies"
              />
              <ComingSoonCard
                icon="💬"
                title="SMS Alerts"
                desc="Automated SMS reminders for patients before their appointment"
              />
              <ComingSoonCard
                icon="💡"
                title="Health Tips"
                desc="AI-powered health tips and preventive care recommendations"
              />
              <ComingSoonCard
                icon="🤖"
                title="AI Scheduling"
                desc="Smart appointment scheduling with ML-optimized slot allocation"
              />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}