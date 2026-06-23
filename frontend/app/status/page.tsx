"use client"

import { useState } from "react"
import Sidebar from "../components/Sidebar"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface StatusResult {
  appointment_id: string
  patient_name: string
  doctor_name: string
  status: string
  appointment_date?: string
  appointment_time?: string
  estimated_waiting_time: number
}

export default function StatusPage() {
  const [searchId, setSearchId] = useState("")
  const [result, setResult] = useState<StatusResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!searchId.trim()) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch(`${API}/appointments/status/${searchId.trim()}`)
      if (!res.ok) {
        if (res.status === 404) setError("Appointment not found")
        else setError("Something went wrong. Please try again.")
        return
      }
      const data = await res.json()
      setResult(data)
    } catch {
      setError("Unable to connect to the server.")
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    waiting: { bg: "#fffbeb", text: "#d97706", border: "#fbbf24" },
    in_consultation: { bg: "#eff6ff", text: "#2563eb", border: "#60a5fa" },
    completed: { bg: "#f0fdf4", text: "#16a34a", border: "#4ade80" },
  }

  const getStepState = (step: number) => {
    if (!result) return "future"
    const statusOrder: Record<string, number> = { waiting: 1, in_consultation: 2, completed: 3 }
    const current = statusOrder[result.status] || 0
    if (step < current) return "done"
    if (step === current) return "active"
    return "future"
  }

  const steps = [
    { num: 1, label: "Booked", icon: "📋" },
    { num: 2, label: "In Consultation", icon: "🩺" },
    { num: 3, label: "Completed", icon: "✅" },
  ]

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8" }}>
      <Sidebar activePage="status" />
      <main style={{ flex: 1, marginLeft: 260, padding: "32px 40px", animation: "fadeUp 0.4s ease" }}>
        <style>{`
          @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
          @keyframes shimmer { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
          @keyframes pulseGlow { 0%,100% { box-shadow:0 0 0 0 rgba(59,130,246,0.4); } 50% { box-shadow:0 0 20px 6px rgba(59,130,246,0.15); } }
          @keyframes scaleIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
          @media (max-width: 768px) { main { margin-left: 0 !important; padding: 20px !important; } }
        `}</style>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>
            🔍 Check Appointment Status
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>
            Enter your appointment ID to track your visit
          </p>
        </div>

        {/* Search Card */}
        <div style={{
          background: "white", borderRadius: 20, padding: "32px 36px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid rgba(226,232,240,0.8)",
          maxWidth: 600, margin: "0 auto 32px",
        }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
            Appointment ID
          </label>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter ID e.g., CF-20260605-001"
              style={{
                flex: 1, padding: "14px 18px", borderRadius: 12, border: "2px solid #e2e8f0",
                fontSize: 15, fontFamily: "inherit", color: "#0f172a", background: "#f8fafc",
                outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.1)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchId.trim()}
              style={{
                padding: "14px 28px", borderRadius: 12, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #2563eb, #06b6d4)", color: "white",
                fontWeight: 700, fontSize: 14, transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 4px 14px rgba(37,99,235,0.35)", opacity: loading || !searchId.trim() ? 0.5 : 1,
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.45)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.35)"; }}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                height: 24, borderRadius: 8, marginBottom: 16,
                background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
                backgroundSize: "800px 100%", animation: "shimmer 1.4s infinite",
                width: `${100 - i * 15}%`,
              }} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{
            maxWidth: 600, margin: "0 auto", background: "white", borderRadius: 20,
            padding: "48px 36px", textAlign: "center",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid rgba(226,232,240,0.8)",
            animation: "scaleIn 0.3s ease",
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>😔</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>
              Appointment Not Found
            </h3>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
              We couldn&apos;t find an appointment with that ID. Please double-check and try again.
            </p>
          </div>
        )}

        {/* Result Card */}
        {result && !loading && (
          <div style={{
            maxWidth: 600, margin: "0 auto", background: "white", borderRadius: 20,
            padding: "36px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            border: "1px solid rgba(226,232,240,0.8)", animation: "scaleIn 0.35s ease",
          }}>
            {/* Appointment ID Header */}
            <div style={{
              background: "linear-gradient(135deg, #0f172a, #1e3a5f)", borderRadius: 16,
              padding: "20px 24px", marginBottom: 24, display: "flex",
              justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Appointment ID</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: "white", margin: "4px 0 0", fontFamily: "monospace" }}>
                  {result.appointment_id}
                </p>
              </div>
              <div style={{
                padding: "8px 16px", borderRadius: 20,
                background: statusColors[result.status]?.bg || "#f1f5f9",
                color: statusColors[result.status]?.text || "#475569",
                border: `1px solid ${statusColors[result.status]?.border || "#e2e8f0"}`,
                fontWeight: 700, fontSize: 12, textTransform: "uppercase",
              }}>
                {result.status.replace("_", " ")}
              </div>
            </div>

            {/* Details Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
              {[
                { label: "Patient Name", value: result.patient_name, icon: "👤" },
                { label: "Doctor", value: result.doctor_name, icon: "👨‍⚕️" },
                { label: "Date", value: result.appointment_date || "N/A", icon: "📅" },
                { label: "Time", value: result.appointment_time || "N/A", icon: "🕐" },
              ].map((item, i) => (
                <div key={i} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{item.icon} {item.label}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "4px 0 0" }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Waiting Time */}
            {result.status === "waiting" && result.estimated_waiting_time > 0 && (
              <div style={{
                background: "#fffbeb", borderRadius: 12, padding: "14px 18px", marginBottom: 24,
                border: "1px solid #fde68a", display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontSize: 24 }}>⏱️</span>
                <div>
                  <p style={{ fontSize: 12, color: "#92400e", margin: 0 }}>Estimated Waiting Time</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "#d97706", margin: "2px 0 0" }}>
                    {result.estimated_waiting_time} minutes
                  </p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div style={{ padding: "20px 0 0" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Appointment Timeline
              </p>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
                {/* Connecting line */}
                <div style={{
                  position: "absolute", top: 20, left: 40, right: 40, height: 3,
                  background: "#e2e8f0", borderRadius: 2,
                }} />
                <div style={{
                  position: "absolute", top: 20, left: 40, height: 3, borderRadius: 2,
                  background: "linear-gradient(90deg, #22c55e, #3b82f6)",
                  width: result.status === "completed" ? "calc(100% - 80px)" : result.status === "in_consultation" ? "calc(50% - 40px)" : 0,
                  transition: "width 0.5s ease",
                }} />

                {steps.map((step) => {
                  const state = getStepState(step.num)
                  return (
                    <div key={step.num} style={{ textAlign: "center", zIndex: 1, flex: 1 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 14, margin: "0 auto 10px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: state === "done" ? 18 : 20,
                        background: state === "done" ? "linear-gradient(135deg, #22c55e, #16a34a)"
                          : state === "active" ? "linear-gradient(135deg, #3b82f6, #06b6d4)"
                          : "#f1f5f9",
                        color: state === "future" ? "#94a3b8" : "white",
                        fontWeight: 800,
                        boxShadow: state === "active" ? "0 4px 16px rgba(59,130,246,0.4)" : "none",
                        animation: state === "active" ? "pulseGlow 2s infinite" : "none",
                        transition: "all 0.3s ease",
                      }}>
                        {state === "done" ? "✓" : step.icon}
                      </div>
                      <p style={{
                        fontSize: 12, fontWeight: state === "active" ? 700 : 500, margin: 0,
                        color: state === "future" ? "#94a3b8" : state === "active" ? "#2563eb" : "#16a34a",
                      }}>
                        {step.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}