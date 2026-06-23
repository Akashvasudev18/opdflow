"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import type { Doctor } from "../lib/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Specialization Color Map ──────────────────────────────────────────────────
const SPEC_COLORS: Record<string, { bg: string; text: string; avatar: string }> = {
  cardiology:          { bg: "#fee2e2", text: "#991b1b", avatar: "#ef4444" },
  neurology:           { bg: "#ede9fe", text: "#5b21b6", avatar: "#8b5cf6" },
  pediatrics:          { bg: "#dcfce7", text: "#15803d", avatar: "#22c55e" },
  orthopedics:         { bg: "#ffedd5", text: "#9a3412", avatar: "#f97316" },
  dermatology:         { bg: "#fef9c3", text: "#854d0e", avatar: "#eab308" },
  "general medicine":  { bg: "#dbeafe", text: "#1e40af", avatar: "#3b82f6" },
  psychiatry:          { bg: "#fce7f3", text: "#9d174d", avatar: "#ec4899" },
  ent:                 { bg: "#cffafe", text: "#0e7490", avatar: "#06b6d4" },
};
const DEFAULT_COLOR = { bg: "#e0e7ff", text: "#3730a3", avatar: "#6366f1" };

function getSpecColor(spec: string) {
  return SPEC_COLORS[spec?.toLowerCase().trim()] ?? DEFAULT_COLOR;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const formatDays = (daysStr: string) => {
  if (!daysStr) return "N/A";
  return daysStr.split(",").map(d => d.trim().substring(0, 3)).join(", ");
};

const SPECIALIZATIONS = [
  "Cardiology", "Neurology", "Pediatrics", "Orthopedics",
  "Dermatology", "General Medicine", "Psychiatry", "ENT",
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: "white",
      borderRadius: "20px",
      padding: "28px 24px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      border: "1px solid rgba(226,232,240,0.8)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
          backgroundSize: "400px 100%",
          animation: "shimmer 1.5s infinite",
          flexShrink: 0,
        }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{
            height: 16, borderRadius: 6, width: "70%",
            background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
            backgroundSize: "400px 100%",
            animation: "shimmer 1.5s infinite",
          }} />
          <div style={{
            height: 12, borderRadius: 6, width: "50%",
            background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
            backgroundSize: "400px 100%",
            animation: "shimmer 1.5s infinite",
          }} />
        </div>
      </div>
      <div style={{
        height: 28, borderRadius: 20, width: "55%",
        background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
        backgroundSize: "400px 100%",
        animation: "shimmer 1.5s infinite",
        marginBottom: "16px",
      }} />
      <div style={{
        height: 10, borderRadius: 6,
        background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
        backgroundSize: "400px 100%",
        animation: "shimmer 1.5s infinite",
      }} />
    </div>
  );
}

// ─── Doctor Card ───────────────────────────────────────────────────────────────
function DoctorCard({
  doc,
  index,
  onDelete,
}: {
  doc: Doctor;
  index: number;
  onDelete: (doc: Doctor) => void;
}) {
  const colors = getSpecColor(doc.specialization);
  const initials = getInitials(doc.name);
  const [hovered, setHovered] = useState(false);
  const isAvailable = doc.status === "Available";
  const todayPatients = doc.today_patients ?? 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        borderRadius: "20px",
        padding: "28px 24px",
        boxShadow: hovered
          ? "0 16px 48px rgba(0,0,0,0.14), 0 0 0 1px rgba(99,102,241,0.15)"
          : "0 4px 24px rgba(0,0,0,0.06)",
        border: "1px solid rgba(226,232,240,0.8)",
        transform: hovered ? "scale(1.02) translateY(-4px)" : "scale(1) translateY(0)",
        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        cursor: "default",
        animation: `fadeUp 0.45s ease ${index * 60}ms both`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: `linear-gradient(90deg, ${colors.avatar}, ${colors.avatar}99)`,
        borderRadius: "20px 20px 0 0",
      }} />

      {/* Delete button */}
      <button
        onClick={() => onDelete(doc)}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          background: "rgba(239, 68, 68, 0.1)",
          border: "none",
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#ef4444",
          transition: "all 0.2s ease",
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(239, 68, 68, 0.2)";
          (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(239, 68, 68, 0.1)";
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        }}
        title="Delete Doctor"
      >
        🗑️
      </button>

      {/* Header: avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", marginTop: "4px" }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: `linear-gradient(135deg, ${colors.avatar}, ${colors.avatar}bb)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 800, fontSize: "18px",
          flexShrink: 0,
          boxShadow: `0 4px 14px ${colors.avatar}55`,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, paddingRight: "30px" }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: "16px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Dr. {doc.name}
          </p>
          <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>
            Medical Professional
          </p>
        </div>
      </div>

      {/* Specialization badge */}
      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          padding: "5px 12px", borderRadius: "20px",
          fontSize: "12px", fontWeight: 700,
          background: colors.bg, color: colors.text,
          border: `1px solid ${colors.avatar}33`,
        }}>
          🏷️ {doc.specialization}
        </span>
        {/* Status badge */}
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          padding: "5px 12px", borderRadius: "20px",
          fontSize: "11px", fontWeight: 700,
          background: isAvailable ? "#f0fdf4" : "#fef2f2",
          color: isAvailable ? "#15803d" : "#991b1b",
          border: `1px solid ${isAvailable ? "#bbf7d0" : "#fecaca"}`,
        }}>
          <div style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: isAvailable ? "#22c55e" : "#ef4444",
            boxShadow: isAvailable ? "0 0 6px #22c55e" : "0 0 6px #ef4444",
          }} />
          {isAvailable ? "Available" : "Busy"}
        </span>
      </div>

      {/* Schedule Details */}
      <div style={{
        padding: "14px",
        background: "#f8fafc",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "15px" }}>📅</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
            Days: {formatDays(doc.available_days)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "15px" }}>⏰</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
            Time: {doc.start_time || "09:00"} – {doc.end_time || "17:00"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "15px" }}>⏱️</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
            Duration: {doc.appointment_duration || 30}m
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "15px" }}>📊</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
            Capacity: {doc.daily_capacity || 10}/day
          </span>
        </div>
      </div>

      {/* Today's Patients footer */}
      <div style={{
        marginTop: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        background: "linear-gradient(90deg, #eef2ff, #e0f2fe)",
        borderRadius: "12px",
        border: "1px solid #c7d2fe",
      }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>Today&apos;s Patients</span>
        <span style={{ fontSize: "18px", fontWeight: 900, color: "#1a2980" }}>{todayPatients}</span>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [duration, setDuration] = useState("30");
  const [dailyCapacity, setDailyCapacity] = useState("10");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: "", desc: "" });

  const [nameFocused, setNameFocused] = useState(false);
  const [specFocused, setSpecFocused] = useState(false);

  const [doctorToDelete, setDoctorToDelete] = useState<{ id: number; name: string } | null>(null);

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await fetch(`${API}/doctors`);
      const data: Doctor[] = await res.json();
      setDoctors(data);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const toast = (title: string, desc: string) => {
    setToastMsg({ title, desc });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2800);
  };

  const addDoctor = async () => {
    if (!name || !specialization || availableDays.length === 0 || !startTime || !endTime || !duration) {
      alert("Please fill all required fields");
      return;
    }
    setAdding(true);
    try {
      await fetch(`${API}/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          specialization,
          available_days: availableDays.join(","),
          start_time: startTime,
          end_time: endTime,
          appointment_duration: parseInt(duration, 10),
          daily_capacity: parseInt(dailyCapacity, 10),
        }),
      });
      setName("");
      setSpecialization("");
      setAvailableDays([]);
      setStartTime("09:00");
      setEndTime("17:00");
      setDuration("30");
      setDailyCapacity("10");
      await fetchDoctors();
      toast("Doctor added successfully!", "The staff roster has been updated.");
    } finally {
      setAdding(false);
    }
  };

  const confirmDelete = async () => {
    if (!doctorToDelete) return;
    try {
      await fetch(`${API}/doctors/${doctorToDelete.id}`, { method: "DELETE" });
      await fetchDoctors();
      toast("Doctor removed successfully!", "The staff roster has been updated.");
    } catch (e) {
      console.error(e);
    } finally {
      setDoctorToDelete(null);
    }
  };

  const totalDoctors = doctors.length;
  const availableNow = doctors.filter((d) => d.status === "Available").length;
  const busyNow = doctors.filter((d) => d.status === "Busy").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .doctors-layout {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #eef2ff 0%, #e0f2fe 50%, #f0fdf4 100%);
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        }

        .doctors-main {
          flex: 1;
          overflow-y: auto;
          padding: 36px 40px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .stats-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .doctor-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-schedule-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .doctor-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .doctors-layout { flex-direction: column; }
          .doctors-main { padding: 20px; }
          .stats-bar { grid-template-columns: 1fr 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .doctor-grid { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .form-schedule-row { grid-template-columns: 1fr; }
          .stats-bar { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="doctors-layout">

        {/* ── Sidebar ── */}
        <Sidebar activePage="doctors" />

        {/* ── Main Content ── */}
        <main className="doctors-main">

          {/* ── Page Header ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            animation: "fadeSlideUp 0.4s ease both",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "16px",
                background: "linear-gradient(135deg, #1a2980, #06b6d4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "24px", boxShadow: "0 6px 20px rgba(26,41,128,0.3)",
                flexShrink: 0,
              }}>👨‍⚕️</div>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1.1 }}>
                  Doctor Management
                </h1>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
                  Manage your medical staff roster
                </p>
              </div>
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "10px 18px", borderRadius: "20px",
              background: "white", border: "1px solid rgba(226,232,240,0.8)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              <span style={{ fontSize: "20px" }}>👨‍⚕️</span>
              <span style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a" }}>{totalDoctors}</span>
              <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>Doctors</span>
            </div>
          </div>

          {/* ── Stats Bar ── */}
          <div className="stats-bar" style={{ animation: "fadeSlideUp 0.45s ease 60ms both" }}>
            {[
              { label: "Total Doctors", value: totalDoctors, icon: "🏥", accentColor: "#3b82f6", bgColor: "#eff6ff", borderColor: "#bfdbfe" },
              { label: "Available Now", value: availableNow, icon: "✅", accentColor: "#22c55e", bgColor: "#f0fdf4", borderColor: "#bbf7d0" },
              { label: "Busy Now", value: busyNow, icon: "⚡", accentColor: "#ef4444", bgColor: "#fef2f2", borderColor: "#fecaca" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "white",
                  borderRadius: "18px",
                  padding: "20px 24px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(226,232,240,0.8)",
                  borderLeft: `4px solid ${stat.accentColor}`,
                  display: "flex", alignItems: "center", gap: "16px",
                  position: "relative", overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: "-16px", right: "-16px",
                  width: "70px", height: "70px", borderRadius: "50%",
                  background: stat.accentColor, opacity: 0.07,
                  pointerEvents: "none",
                }} />
                <div style={{
                  width: "44px", height: "44px", borderRadius: "14px",
                  background: stat.bgColor,
                  border: `1px solid ${stat.borderColor}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", flexShrink: 0,
                }}>
                  {stat.icon}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {stat.label}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "32px", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Add Doctor Panel (Expandable) ── */}
          <div style={{
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            border: "1px solid rgba(226,232,240,0.8)",
            overflow: "hidden",
            animation: "fadeSlideUp 0.5s ease 120ms both",
          }}>
            {/* Gradient top accent */}
            <div style={{
              height: "4px",
              background: "linear-gradient(90deg, #1a2980, #06b6d4, #22c55e)",
            }} />

            {/* Toggle header */}
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                width: "100%",
                padding: "20px 28px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #1a2980, #06b6d4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", boxShadow: "0 4px 12px rgba(26,41,128,0.25)",
                }}>➕</div>
                <div style={{ textAlign: "left" }}>
                  <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                    Add New Doctor
                  </h2>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                    Register a new medical professional
                  </p>
                </div>
              </div>
              <span style={{
                fontSize: "18px",
                color: "#94a3b8",
                transition: "transform 0.3s ease",
                transform: showForm ? "rotate(180deg)" : "rotate(0deg)",
              }}>
                ▼
              </span>
            </button>

            {/* Expandable form */}
            <div style={{
              maxHeight: showForm ? "800px" : "0px",
              overflow: "hidden",
              transition: "max-height 0.4s ease, opacity 0.3s ease",
              opacity: showForm ? 1 : 0,
            }}>
              <div style={{ padding: "0 28px 32px" }}>

                {/* Basic Inputs row */}
                <div className="form-row" style={{ marginBottom: "20px" }}>
                  {/* Doctor Name */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Doctor Name
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                        fontSize: "16px", pointerEvents: "none",
                      }}>👤</span>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Sarah Johnson"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setNameFocused(true)}
                        onBlur={() => setNameFocused(false)}
                        style={{
                          width: "100%",
                          padding: "13px 14px 13px 42px",
                          borderRadius: "12px",
                          border: nameFocused ? "2px solid #06b6d4" : "2px solid #e2e8f0",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#0f172a",
                          background: nameFocused ? "#f0fdfe" : "#f8fafc",
                          outline: "none",
                          transition: "all 0.2s ease",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                  </div>

                  {/* Specialization */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Specialization
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                        fontSize: "16px", pointerEvents: "none",
                      }}>🏷️</span>
                      <input
                        type="text"
                        list="spec-suggestions"
                        placeholder="e.g. Cardiology"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        onFocus={() => setSpecFocused(true)}
                        onBlur={() => setSpecFocused(false)}
                        style={{
                          width: "100%",
                          padding: "13px 14px 13px 42px",
                          borderRadius: "12px",
                          border: specFocused ? "2px solid #06b6d4" : "2px solid #e2e8f0",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#0f172a",
                          background: specFocused ? "#f0fdfe" : "#f8fafc",
                          outline: "none",
                          transition: "all 0.2s ease",
                          fontFamily: "inherit",
                        }}
                      />
                      <datalist id="spec-suggestions">
                        {SPECIALIZATIONS.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* Available Days */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Available Days
                  </label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {DAYS_OF_WEEK.map((day) => {
                      const isActive = availableDays.includes(day);
                      return (
                        <button
                          key={day}
                          onClick={() => {
                            setAvailableDays((prev) =>
                              isActive ? prev.filter((d) => d !== day) : [...prev, day]
                            );
                          }}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "10px",
                            border: isActive ? "2px solid #06b6d4" : "2px solid #e2e8f0",
                            background: isActive ? "#f0fdfe" : "#f8fafc",
                            color: isActive ? "#0e7490" : "#64748b",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: isActive ? "0 2px 8px rgba(6,182,212,0.15)" : "none",
                          }}
                        >
                          {day.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Times, Duration, Capacity */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      style={{
                        width: "100%", padding: "13px 14px", borderRadius: "12px",
                        border: "2px solid #e2e8f0", fontSize: "14px", fontWeight: 500,
                        color: "#0f172a", background: "#f8fafc", outline: "none",
                        fontFamily: "inherit", transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#06b6d4")}
                      onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      style={{
                        width: "100%", padding: "13px 14px", borderRadius: "12px",
                        border: "2px solid #e2e8f0", fontSize: "14px", fontWeight: 500,
                        color: "#0f172a", background: "#f8fafc", outline: "none",
                        fontFamily: "inherit", transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#06b6d4")}
                      onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      min="5" max="120" step="5"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      style={{
                        width: "100%", padding: "13px 14px", borderRadius: "12px",
                        border: "2px solid #e2e8f0", fontSize: "14px", fontWeight: 500,
                        color: "#0f172a", background: "#f8fafc", outline: "none",
                        fontFamily: "inherit", transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#06b6d4")}
                      onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Daily Capacity
                    </label>
                    <input
                      type="number"
                      min="1" max="100"
                      value={dailyCapacity}
                      onChange={(e) => setDailyCapacity(e.target.value)}
                      style={{
                        width: "100%", padding: "13px 14px", borderRadius: "12px",
                        border: "2px solid #e2e8f0", fontSize: "14px", fontWeight: 500,
                        color: "#0f172a", background: "#f8fafc", outline: "none",
                        fontFamily: "inherit", transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#06b6d4")}
                      onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={addDoctor}
                  disabled={adding}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "13px 28px",
                    borderRadius: "12px",
                    border: "none",
                    background: adding
                      ? "linear-gradient(135deg, #94a3b8, #64748b)"
                      : "linear-gradient(135deg, #1a2980, #06b6d4)",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: adding ? "not-allowed" : "pointer",
                    boxShadow: adding ? "none" : "0 6px 20px rgba(6,182,212,0.35)",
                    transition: "all 0.2s ease",
                    fontFamily: "inherit",
                    opacity: adding ? 0.8 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!adding) {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 28px rgba(6,182,212,0.45)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!adding) {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(6,182,212,0.35)";
                    }
                  }}
                >
                  {adding ? (
                    <>
                      <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite", fontSize: "15px" }}>⏳</span>
                      Adding Doctor…
                    </>
                  ) : (
                    <>➕ Add Doctor</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── Doctors Grid ── */}
          <div style={{ animation: "fadeSlideUp 0.55s ease 180ms both" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                  Medical Staff
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                  {loading ? "Loading..." : `${doctors.length} registered doctor${doctors.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              {!loading && doctors.length > 0 && (
                <span style={{
                  padding: "5px 14px", borderRadius: "20px", fontSize: "12px",
                  fontWeight: 700, background: "#f0fdf4", color: "#15803d",
                  border: "1px solid #bbf7d0",
                }}>
                  🟢 {availableNow} Available
                </span>
              )}
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="doctor-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Empty state */}
            {!loading && doctors.length === 0 && (
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "64px 40px",
                textAlign: "center",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                border: "1px solid rgba(226,232,240,0.8)",
                animation: "fadeUp 0.5s ease both",
              }}>
                <div style={{ fontSize: "72px", marginBottom: "20px", lineHeight: 1 }}>👨‍⚕️</div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>
                  No Doctors Yet
                </h3>
                <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 24px", maxWidth: "360px", marginLeft: "auto", marginRight: "auto" }}>
                  Your medical staff roster is empty. Add your first doctor using the form above.
                </p>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "10px 20px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #eef2ff, #e0f2fe)",
                  color: "#3730a3", fontSize: "13px", fontWeight: 700,
                  border: "1px solid #c7d2fe",
                }}>
                  ↑ Use the form above to add your first doctor
                </span>
              </div>
            )}

            {/* Doctor cards */}
            {!loading && doctors.length > 0 && (
              <div className="doctor-grid">
                {doctors.map((doc, i) => (
                  <DoctorCard key={doc.id ?? i} doc={doc} index={i} onDelete={(d) => setDoctorToDelete({ id: d.id, name: d.name })} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Confirmation Modal ── */}
      {doctorToDelete && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.2s ease",
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            borderRadius: "24px",
            padding: "32px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.4)",
            animation: "scaleUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
            textAlign: "center",
          }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              background: "#fee2e2", color: "#ef4444",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "32px", margin: "0 auto 20px",
            }}>
              ⚠️
            </div>
            <h3 style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
              Remove Dr. {doctorToDelete.name}?
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#64748b", lineHeight: 1.5 }}>
              This will remove the doctor from your roster. Please ensure no upcoming appointments remain.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => setDoctorToDelete(null)}
                style={{
                  padding: "12px 24px", borderRadius: "12px", border: "1px solid #e2e8f0",
                  background: "white", color: "#475569", fontSize: "14px", fontWeight: 600,
                  cursor: "pointer", flex: 1, transition: "all 0.2s",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: "12px 24px", borderRadius: "12px", border: "none",
                  background: "#ef4444", color: "white", fontSize: "14px", fontWeight: 600,
                  cursor: "pointer", flex: 1, transition: "all 0.2s",
                  boxShadow: "0 4px 14px rgba(239,68,68,0.4)",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {showToast && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 1000,
          background: "white",
          borderRadius: "16px",
          padding: "16px 22px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 0 0 1px rgba(34,197,94,0.2)",
          border: "1px solid #bbf7d0",
          display: "flex", alignItems: "center", gap: "12px",
          animation: "toastIn 0.3s ease both",
          minWidth: "280px",
        }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", flexShrink: 0,
          }}>✅</div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>
              {toastMsg.title}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>
              {toastMsg.desc}
            </p>
          </div>
        </div>
      )}
    </>
  );
}