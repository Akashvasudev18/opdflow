"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import type { Doctor, Slot } from "../lib/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── OPD Types ─────────────────────────────────────────────────────────────────
const OPD_TYPES = [
  "General",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "ENT",
];

// ─── Specialization color helper ───────────────────────────────────────────────
const specializationColor = (spec: string) => {
  const map: Record<string, string> = {
    cardiology: "#e53e3e",
    neurology: "#805ad5",
    pediatrics: "#38a169",
    orthopedics: "#dd6b20",
    dermatology: "#d69e2e",
    general: "#3182ce",
    "general medicine": "#3182ce",
    psychiatry: "#ec4899",
    ent: "#06b6d4",
  };
  return map[spec?.toLowerCase()] || "#3182ce";
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatDate = (d: string) => {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ─── AnimatedValue ─────────────────────────────────────────────────────────────
function AnimatedValue({ val, placeholder }: { val: string; placeholder: string }) {
  const isEmpty = !val || val === "—";
  return (
    <span
      key={val || "__empty__"}
      style={{
        fontWeight: isEmpty ? 400 : 700,
        color: isEmpty ? "rgba(255,255,255,0.25)" : "white",
        fontSize: "14px",
        textAlign: "right",
        maxWidth: "180px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        display: "inline-block",
        animation: isEmpty ? "none" : "valuePop 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {isEmpty ? placeholder : val}
    </span>
  );
}

// ─── StepBadge ─────────────────────────────────────────────────────────────────
function StepBadge({ n, done }: { n: number; done: boolean }) {
  return (
    <div
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "10px",
        flexShrink: 0,
        background: done
          ? "linear-gradient(135deg, #4ade80, #22c55e)"
          : "linear-gradient(135deg, #1a2980, #26d0ce)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: 800,
        fontSize: "14px",
        boxShadow: done
          ? "0 4px 12px rgba(74,222,128,0.4)"
          : "0 4px 12px rgba(26,41,128,0.3)",
        transition: "all 0.4s ease",
      }}
    >
      {done ? "✓" : n}
    </div>
  );
}

// ─── Stepper ───────────────────────────────────────────────────────────────────
const STEPPER_STEPS = [
  { label: "Patient Details", icon: "👤", desc: "Name & OPD Type" },
  { label: "Doctor Selection", icon: "👨‍⚕️", desc: "Choose specialist" },
  { label: "Slot Selection", icon: "🕐", desc: "Pick date & time" },
  { label: "Confirmation", icon: "✅", desc: "Review & confirm" },
];

function AppointmentStepper({ currentStep }: { currentStep: number }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "20px",
        padding: "28px 32px",
        marginBottom: "28px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        border: "1px solid rgba(226,232,240,0.8)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #1a2980, #06b6d4, #4ade80)",
        }}
      />

      {/* Desktop stepper */}
      <div className="stepper-desktop">
        {STEPPER_STEPS.map((step, i) => {
          const stepNum = i + 1;
          const isDone = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          const isFuture = currentStep < stepNum;

          return (
            <div
              key={step.label}
              style={{
                display: "flex",
                alignItems: "center",
                flex: i < STEPPER_STEPS.length - 1 ? "1" : "0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  position: "relative",
                }}
              >
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      border: "2px solid rgba(6,182,212,0.4)",
                      animation: "stepRingPulse 1.8s ease-in-out infinite",
                      pointerEvents: "none",
                    }}
                  />
                )}
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isDone ? "18px" : "15px",
                    fontWeight: 800,
                    flexShrink: 0,
                    transition: "all 0.45s cubic-bezier(0.34,1.56,0.64,1)",
                    background: isDone
                      ? "linear-gradient(135deg, #4ade80, #22c55e)"
                      : isActive
                      ? "linear-gradient(135deg, #1a2980, #06b6d4)"
                      : "#f1f5f9",
                    color: isFuture ? "#94a3b8" : "white",
                    boxShadow: isDone
                      ? "0 6px 18px rgba(74,222,128,0.45)"
                      : isActive
                      ? "0 6px 20px rgba(6,182,212,0.5)"
                      : "none",
                    animation: isActive ? "stepBobble 2.5s ease-in-out infinite" : "none",
                  }}
                >
                  {isDone ? "✓" : isActive ? step.icon : stepNum}
                </div>
                <div style={{ textAlign: "center", minWidth: "80px" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      fontWeight: isDone || isActive ? 700 : 500,
                      color: isDone ? "#16a34a" : isActive ? "#0e7490" : "#94a3b8",
                      transition: "color 0.3s ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.label}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "10px",
                      color: isFuture ? "#cbd5e1" : "#94a3b8",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>

              {i < STEPPER_STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: "2px",
                    margin: "-22px 10px 0",
                    borderRadius: "2px",
                    overflow: "hidden",
                    background: "#f1f5f9",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "2px",
                      background: "linear-gradient(90deg, #4ade80, #06b6d4)",
                      width: isDone ? "100%" : isActive ? "50%" : "0%",
                      transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                      boxShadow: isDone
                        ? "0 0 8px rgba(74,222,128,0.5)"
                        : "0 0 8px rgba(6,182,212,0.4)",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile stepper */}
      <div className="stepper-mobile">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            marginBottom: "14px",
          }}
        >
          {STEPPER_STEPS.map((step, i) => {
            const stepNum = i + 1;
            const isDone = currentStep > stepNum;
            const isActive = currentStep === stepNum;
            return (
              <div
                key={step.label}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div
                  style={{
                    width: isActive ? "32px" : "28px",
                    height: isActive ? "32px" : "28px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 800,
                    background: isDone
                      ? "linear-gradient(135deg, #4ade80, #22c55e)"
                      : isActive
                      ? "linear-gradient(135deg, #1a2980, #06b6d4)"
                      : "#f1f5f9",
                    color: isActive || isDone ? "white" : "#94a3b8",
                    boxShadow: isActive
                      ? "0 4px 14px rgba(6,182,212,0.5)"
                      : isDone
                      ? "0 4px 10px rgba(74,222,128,0.4)"
                      : "none",
                    transition: "all 0.4s ease",
                    flexShrink: 0,
                  }}
                >
                  {isDone ? "✓" : isActive ? step.icon : stepNum}
                </div>
                {i < STEPPER_STEPS.length - 1 && (
                  <div
                    style={{
                      width: "20px",
                      height: "2px",
                      borderRadius: "2px",
                      background: isDone ? "#4ade80" : "#e2e8f0",
                      transition: "background 0.4s ease",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            fontWeight: 700,
            color: "#0e7490",
            margin: 0,
          }}
        >
          Step{" "}
          {currentStep > STEPPER_STEPS.length ? STEPPER_STEPS.length : currentStep}{" "}
          of {STEPPER_STEPS.length}:{" "}
          {STEPPER_STEPS[Math.min(currentStep - 1, STEPPER_STEPS.length - 1)]?.label}
        </p>
        <p style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", margin: "2px 0 0" }}>
          {STEPPER_STEPS[Math.min(currentStep - 1, STEPPER_STEPS.length - 1)]?.desc}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BookAppointment() {
  const [patientName, setPatientName] = useState("");
  const [opdType, setOpdType] = useState("General");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [dateError, setDateError] = useState("");

  const [message, setMessage] = useState("");
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await fetch(`${API}/doctors`);
      if (res.ok) {
        setDoctors(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Slot polling
  const fetchSlots = useCallback(async () => {
    try {
      if (!selectedDoctor || !selectedDate) return;
      const res = await fetch(
        `${API}/doctors/${selectedDoctor.id}/slots?date=${selectedDate}`
      );
      if (res.ok) {
        setSlots(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch slots:", err);
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (selectedDoctor && selectedDate && !dateError) {
      fetchSlots();
      interval = setInterval(fetchSlots, 3000);
    } else {
      setSlots([]);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedDoctor, selectedDate, dateError, fetchSlots]);

  const handleDoctorSelect = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setSelectedSlot(null);
    if (selectedDate) {
      const dt = new Date(selectedDate + "T00:00:00");
      const dayName = dt.toLocaleDateString("en-US", { weekday: "long" });
      if (doc.available_days && !doc.available_days.includes(dayName)) {
        setDateError(`This doctor is not available on ${dayName}`);
      } else {
        setDateError("");
      }
    }
  };

  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setSlots([]);
    setDateError("");

    if (!dateStr || !selectedDoctor) return;

    const dt = new Date(dateStr + "T00:00:00");
    const dayName = dt.toLocaleDateString("en-US", { weekday: "long" });
    if (
      selectedDoctor.available_days &&
      !selectedDoctor.available_days.includes(dayName)
    ) {
      setDateError(`This doctor is not available on ${dayName}`);
    }
  };

  const bookAppointment = async () => {
    if (!patientName.trim()) return alert("Please enter patient name");
    if (!selectedDoctor) return alert("Please select a doctor");
    if (!selectedDate || dateError)
      return alert("Please select a valid appointment date");
    if (!selectedSlot) return alert("Please select a time slot");

    setLoading(true);
    try {
      const res = await fetch(`${API}/appointments/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: patientName,
          opd_type: opdType,
          doctor_id: selectedDoctor.id,
          appointment_date: selectedDate,
          appointment_time: selectedSlot,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Appointment booked successfully!");
        setAppointmentId(data.appointment_id);
        setShowSuccess(true);
      } else {
        alert(data.detail || "Failed to book appointment");
      }
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const allDone =
    !!patientName.trim() &&
    !!selectedDate &&
    !dateError &&
    !!selectedDoctor &&
    !!selectedSlot;

  const completionPct =
    [
      !!patientName.trim(),
      !!selectedDoctor,
      !!selectedDate && !dateError,
      !!selectedSlot,
    ].filter(Boolean).length * 25;

  const currentStep = appointmentId
    ? 5
    : !patientName.trim()
    ? 1
    : !selectedDoctor
    ? 2
    : !selectedDate || !selectedSlot || dateError
    ? 3
    : 4;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eef2ff 0%, #e0f2fe 50%, #f0fdf4 100%)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── Sidebar ── */}
      <Sidebar activePage="book" />

      {/* ── Main Content ── */}
      <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #1a2980, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                boxShadow: "0 6px 20px rgba(26,41,128,0.3)",
              }}
            >
              📅
            </div>
            <div>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Book an Appointment
              </h1>
              <p style={{ fontSize: "14px", color: "#64748b", margin: "3px 0 0" }}>
                Complete all steps to confirm your appointment
              </p>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {showSuccess && appointmentId && (
          <div
            style={{
              background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
              border: "1px solid #6ee7b7",
              borderRadius: "20px",
              padding: "28px 32px",
              marginBottom: "32px",
              animation: "fadeSlideDown 0.5s ease forwards",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Success confetti dots */}
            <div style={{ position: "absolute", top: "10px", right: "40px", fontSize: "28px", animation: "bounceIn 0.6s ease 0.2s both" }}>🎊</div>
            <div style={{ position: "absolute", bottom: "10px", right: "120px", fontSize: "20px", animation: "bounceIn 0.6s ease 0.4s both", opacity: 0.6 }}>✨</div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              <div style={{ fontSize: "36px", animation: "bounceIn 0.6s ease" }}>
                🎉
              </div>
              <div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#065f46",
                    margin: 0,
                  }}
                >
                  Appointment Confirmed!
                </h2>
                <p
                  style={{
                    color: "#047857",
                    margin: "2px 0 0",
                    fontSize: "14px",
                  }}
                >
                  {message || "Your booking was successful. Please save your Appointment ID."}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[
                { label: "Patient", val: patientName },
                { label: "Doctor", val: `Dr. ${selectedDoctor?.name}` },
                { label: "Date", val: formatDate(selectedDate) },
                { label: "Time", val: selectedSlot || "" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "12px 18px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#6b7280",
                      margin: 0,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: "3px 0 0",
                      fontSize: "14px",
                    }}
                  >
                    {item.val}
                  </p>
                </div>
              ))}
              <div
                style={{
                  background: "linear-gradient(135deg, #1a2980, #06b6d4)",
                  borderRadius: "12px",
                  padding: "12px 20px",
                  boxShadow: "0 4px 16px rgba(26,41,128,0.35)",
                  animation: "successPulse 2s ease-in-out infinite",
                }}
              >
                <p
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.65)",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Appointment ID
                </p>
                <p
                  style={{
                    fontWeight: 900,
                    color: "white",
                    margin: "3px 0 0",
                    fontSize: "22px",
                    letterSpacing: "1px",
                  }}
                >
                  {appointmentId}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Stepper ── */}
        <AppointmentStepper currentStep={currentStep} />

        {/* Two-column grid: Form left, Summary right */}
        <div className="page-grid">
          {/* ── LEFT: Form Steps ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            {/* Step 1: Patient Details */}
            <section style={cardStyle}>
              <div style={stepHeaderStyle}>
                <StepBadge n={1} done={!!patientName.trim()} />
                <div>
                  <h2 style={stepTitleStyle}>Patient Information</h2>
                  <p style={stepSubStyle}>Enter patient details</p>
                </div>
              </div>
              <div style={{ position: "relative", marginBottom: "16px" }}>
                <span style={inputIconStyle}>👤</span>
                <input
                  type="text"
                  placeholder="Enter full patient name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.background = "white";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.background = "#f8fafc";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              <div style={{ position: "relative" }}>
                <span style={inputIconStyle}>🏥</span>
                <select
                  value={opdType}
                  onChange={(e) => setOpdType(e.target.value)}
                  style={{ ...inputStyle, appearance: "none" as const }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.background = "white";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.background = "#f8fafc";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  {OPD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  ▼
                </span>
              </div>
            </section>

            {/* Step 2: Doctor Selection */}
            <section style={cardStyle}>
              <div style={stepHeaderStyle}>
                <StepBadge n={2} done={!!selectedDoctor} />
                <div>
                  <h2 style={stepTitleStyle}>Select Your Doctor</h2>
                  <p style={stepSubStyle}>Choose a specialist for your consultation</p>
                </div>
              </div>
              {doctors.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#94a3b8",
                  }}
                >
                  <div style={{ fontSize: "44px", marginBottom: "12px" }}>👨‍⚕️</div>
                  <p style={{ margin: 0, fontSize: "14px" }}>
                    No doctors available. Please add doctors first.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "14px",
                    marginBottom: selectedDoctor ? "20px" : "0",
                  }}
                >
                  {doctors.map((doc) => {
                    const isSelected = selectedDoctor?.id === doc.id;
                    const color = specializationColor(doc.specialization);
                    return (
                      <button
                        key={doc.id}
                        onClick={() => handleDoctorSelect(doc)}
                        style={{
                          background: isSelected
                            ? `linear-gradient(135deg, ${color}12, ${color}22)`
                            : "white",
                          border: isSelected
                            ? `2px solid ${color}`
                            : "2px solid #e2e8f0",
                          borderRadius: "16px",
                          padding: "20px 16px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition:
                            "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                          position: "relative",
                          transform: isSelected ? "scale(1.04)" : "scale(1)",
                          boxShadow: isSelected
                            ? `0 8px 28px ${color}33`
                            : "0 2px 8px rgba(0,0,0,0.04)",
                          fontFamily: "inherit",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            const el = e.currentTarget as HTMLElement;
                            el.style.transform = "scale(1.02)";
                            el.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
                            el.style.borderColor = "#cbd5e1";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            const el = e.currentTarget as HTMLElement;
                            el.style.transform = "scale(1)";
                            el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                            el.style.borderColor = "#e2e8f0";
                          }
                        }}
                      >
                        {isSelected && (
                          <div
                            style={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              width: "24px",
                              height: "24px",
                              background: color,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "12px",
                              fontWeight: 800,
                              boxShadow: `0 4px 12px ${color}55`,
                            }}
                          >
                            ✓
                          </div>
                        )}
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "14px",
                            background: `linear-gradient(135deg, ${color}22, ${color}44)`,
                            border: `2px solid ${color}44`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "14px",
                            fontSize: "15px",
                            fontWeight: 800,
                            color: color,
                          }}
                        >
                          {getInitials(doc.name)}
                        </div>
                        <p
                          style={{
                            fontWeight: 700,
                            color: "#0f172a",
                            fontSize: "14px",
                            margin: "0 0 6px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          Dr. {doc.name}
                        </p>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "20px",
                            background: `${color}18`,
                            color: color,
                            fontSize: "11px",
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        >
                          {doc.specialization || "General"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Doctor Details Card */}
              {selectedDoctor && (
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "16px",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    animation: "fadeSlideDown 0.3s ease",
                  }}
                >
                  <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#334155" }}>
                    Doctor Details
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>Name</p>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#0f172a",
                          margin: "2px 0 0",
                        }}
                      >
                        Dr. {selectedDoctor.name}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>Specialization</p>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#0f172a",
                          margin: "2px 0 0",
                          textTransform: "capitalize",
                        }}
                      >
                        {selectedDoctor.specialization}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>Available Days</p>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#0f172a",
                          margin: "2px 0 0",
                        }}
                      >
                        {typeof selectedDoctor.available_days === "string"
                          ? selectedDoctor.available_days
                              .split(",")
                              .map((d) => d.trim().substring(0, 3))
                              .join(", ")
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>Available Time</p>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#0f172a",
                          margin: "2px 0 0",
                        }}
                      >
                        {selectedDoctor.start_time} – {selectedDoctor.end_time}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Step 3: Slot Selection */}
            <section
              style={{
                ...cardStyle,
                opacity: selectedDoctor ? 1 : 0.5,
                pointerEvents: selectedDoctor ? "auto" : "none",
                transition: "all 0.3s ease",
              }}
            >
              <div style={stepHeaderStyle}>
                <StepBadge
                  n={3}
                  done={!!selectedDate && !dateError && !!selectedSlot}
                />
                <div>
                  <h2 style={stepTitleStyle}>Slot Selection</h2>
                  <p style={stepSubStyle}>Select an available date and time</p>
                </div>
              </div>

              <div style={{ position: "relative", marginBottom: "20px" }}>
                <span style={inputIconStyle}>📆</span>
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  style={{ ...inputStyle, colorScheme: "light" }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.background = "white";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.background = "#f8fafc";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {dateError && (
                <div
                  style={{
                    color: "#ef4444",
                    background: "#fef2f2",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #fecaca",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginBottom: "20px",
                    animation: "fadeSlideDown 0.3s ease",
                  }}
                >
                  ⚠️ {dateError}
                </div>
              )}

              {selectedDate && !dateError && (
                <div style={{ animation: "fadeSlideDown 0.3s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <h3
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Available Time Slots
                    </h3>
                    {/* Polling indicator */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", animation: "pulseDot 1.5s infinite" }} />
                      <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 500 }}>Live updates</span>
                    </div>
                  </div>
                  {slots.length === 0 ? (
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                        margin: 0,
                        padding: "20px",
                        textAlign: "center",
                        background: "#f8fafc",
                        borderRadius: "12px",
                        border: "1px dashed #cbd5e1",
                      }}
                    >
                      Fetching available slots...
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                        gap: "10px",
                      }}
                    >
                      {slots.map((slot) => {
                        const isAvailable = slot.status === "Available";
                        const isSelected = selectedSlot === slot.time;
                        return (
                          <button
                            key={slot.time}
                            disabled={!isAvailable}
                            onClick={() => isAvailable && setSelectedSlot(slot.time)}
                            style={{
                              padding: "14px 8px",
                              borderRadius: "14px",
                              border: isSelected
                                ? "2px solid #3b82f6"
                                : isAvailable
                                ? "2px solid #22c55e"
                                : "2px solid #fca5a5",
                              background: isSelected
                                ? "linear-gradient(135deg, #1d4ed8, #3b82f6)"
                                : isAvailable
                                ? "white"
                                : "#fee2e2",
                              color: isSelected
                                ? "white"
                                : isAvailable
                                ? "#16a34a"
                                : "#ef4444",
                              fontWeight: 700,
                              fontSize: "14px",
                              cursor: isAvailable ? "pointer" : "not-allowed",
                              transition:
                                "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                              transform: isSelected ? "scale(1.05)" : "scale(1)",
                              opacity: isAvailable ? 1 : 0.7,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "4px",
                              boxShadow: isSelected
                                ? "0 4px 12px rgba(59,130,246,0.3)"
                                : "0 1px 4px rgba(0,0,0,0.02)",
                              fontFamily: "inherit",
                            }}
                          >
                            <span>{slot.time}</span>
                            {!isAvailable && (
                              <span
                                style={{
                                  fontSize: "9px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  fontWeight: 800,
                                }}
                              >
                                Booked
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Step 4: Confirmation */}
            <section
              style={{
                ...cardStyle,
                opacity: currentStep >= 4 ? 1 : 0.5,
                pointerEvents: currentStep >= 4 ? "auto" : "none",
                transition: "all 0.3s ease",
              }}
            >
              <div style={stepHeaderStyle}>
                <StepBadge n={4} done={!!appointmentId} />
                <div>
                  <h2 style={stepTitleStyle}>Confirmation</h2>
                  <p style={stepSubStyle}>Review your details before booking</p>
                </div>
              </div>

              {currentStep >= 4 ? (
                <div style={{ animation: "fadeSlideDown 0.4s ease" }}>
                  <div
                    style={{
                      background: "#f0fdf4",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid #bbf7d0",
                      marginBottom: "16px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#166534",
                        margin: 0,
                        fontWeight: 500,
                        lineHeight: 1.5,
                      }}
                    >
                      You are about to book a{" "}
                      <strong>{opdType}</strong> consultation for{" "}
                      <strong>{patientName}</strong> with{" "}
                      <strong>Dr. {selectedDoctor?.name}</strong> on{" "}
                      <strong>{formatDate(selectedDate)}</strong> at{" "}
                      <strong>{selectedSlot}</strong>.
                    </p>
                  </div>
                  <button
                    onClick={bookAppointment}
                    disabled={loading || !allDone}
                    style={{
                      width: "100%",
                      padding: "16px",
                      borderRadius: "14px",
                      border: "none",
                      background: loading
                        ? "#94a3b8"
                        : "linear-gradient(135deg, #06b6d4, #3b82f6, #1d4ed8)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "15px",
                      cursor: loading ? "not-allowed" : "pointer",
                      boxShadow: loading
                        ? "none"
                        : "0 8px 24px rgba(6,182,212,0.45)",
                      transition: "all 0.3s ease",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading && allDone) {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = "translateY(-2px)";
                        el.style.boxShadow = "0 12px 32px rgba(6,182,212,0.55)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading && allDone) {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = "translateY(0)";
                        el.style.boxShadow = "0 8px 24px rgba(6,182,212,0.45)";
                      }
                    }}
                  >
                    {loading ? "⏳ Booking Appointment..." : "✅ Confirm Appointment"}
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
                  Please complete the previous steps to unlock confirmation.
                </p>
              )}
            </section>
          </div>

          {/* ── RIGHT: Live Appointment Summary ── */}
          <div
            className="summary-col"
            style={{ position: "sticky", top: "40px", alignSelf: "start" }}
          >
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(30,58,95,0.92) 60%, rgba(14,116,144,0.88) 100%)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderRadius: "24px",
                padding: "28px",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow:
                  "0 24px 64px rgba(15,23,42,0.35), 0 4px 16px rgba(6,182,212,0.12), inset 0 1px 0 rgba(255,255,255,0.1)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Decorative glow blobs */}
              <div
                style={{
                  position: "absolute",
                  top: "-40px",
                  right: "-40px",
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-60px",
                  left: "-40px",
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      boxShadow: "0 4px 12px rgba(6,182,212,0.4)",
                    }}
                  >
                    📋
                  </div>
                  <div>
                    <h3
                      style={{
                        color: "white",
                        fontWeight: 800,
                        fontSize: "16px",
                        margin: 0,
                        letterSpacing: "-0.3px",
                      }}
                    >
                      Live Summary
                    </h3>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.45)",
                        fontSize: "11px",
                        margin: 0,
                      }}
                    >
                      Updates as you fill the form
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(74,222,128,0.12)",
                    border: "1px solid rgba(74,222,128,0.25)",
                    borderRadius: "20px",
                    padding: "4px 10px",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#4ade80",
                      boxShadow: "0 0 8px #4ade80",
                      animation: "pulseDot 1.5s infinite",
                    }}
                  />
                  <span
                    style={{ fontSize: "11px", color: "#4ade80", fontWeight: 600 }}
                  >
                    LIVE
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                  marginBottom: "22px",
                }}
              />

              {/* Summary fields */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  marginBottom: "24px",
                }}
              >
                {[
                  {
                    icon: "👤",
                    label: "Patient Name",
                    val: patientName.trim(),
                    placeholder: "Not entered yet",
                  },
                  {
                    icon: "🏥",
                    label: "OPD Type",
                    val: opdType,
                    placeholder: "—",
                  },
                  {
                    icon: "👨‍⚕️",
                    label: "Doctor",
                    val: selectedDoctor ? `Dr. ${selectedDoctor.name}` : "",
                    placeholder: "No doctor selected",
                  },
                  {
                    icon: "🏷️",
                    label: "Specialization",
                    val: selectedDoctor?.specialization
                      ? selectedDoctor.specialization.charAt(0).toUpperCase() +
                        selectedDoctor.specialization.slice(1)
                      : "",
                    placeholder: "—",
                  },
                  {
                    icon: "📆",
                    label: "Appointment Date",
                    val: selectedDate && !dateError ? formatDate(selectedDate) : "",
                    placeholder: "No date selected",
                  },
                  {
                    icon: "🕐",
                    label: "Appointment Time",
                    val: selectedSlot || "",
                    placeholder: "No slot chosen",
                  },
                ].map((field) => (
                  <div
                    key={field.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 16px",
                      background: field.val
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(255,255,255,0.03)",
                      borderRadius: "12px",
                      border: field.val
                        ? "1px solid rgba(255,255,255,0.12)"
                        : "1px solid rgba(255,255,255,0.05)",
                      transition: "all 0.35s ease",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "16px",
                          filter: field.val
                            ? "none"
                            : "grayscale(0.5) opacity(0.5)",
                        }}
                      >
                        {field.icon}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.5)",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {field.label}
                      </span>
                    </div>
                    <AnimatedValue val={field.val} placeholder={field.placeholder} />
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                  marginBottom: "22px",
                }}
              />

              {/* Progress */}
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.5)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontWeight: 600,
                    }}
                  >
                    Completion
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: completionPct === 100 ? "#4ade80" : "#06b6d4",
                      transition: "color 0.3s ease",
                      animation:
                        completionPct === 100 ? "valuePop 0.4s ease" : "none",
                    }}
                  >
                    {completionPct}%
                  </span>
                </div>
                <div
                  style={{
                    height: "6px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${completionPct}%`,
                      background:
                        completionPct === 100
                          ? "linear-gradient(90deg, #4ade80, #22c55e)"
                          : "linear-gradient(90deg, #06b6d4, #3b82f6)",
                      borderRadius: "10px",
                      transition:
                        "width 0.5s cubic-bezier(0.34,1.56,0.64,1)",
                      boxShadow:
                        completionPct === 100
                          ? "0 0 12px rgba(74,222,128,0.6)"
                          : "0 0 10px rgba(6,182,212,0.5)",
                    }}
                  />
                </div>
              </div>

              {/* Step checklist */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "16px",
                }}
              >
                {[
                  { label: "Patient details entered", done: !!patientName.trim() },
                  { label: "Doctor chosen", done: !!selectedDoctor },
                  { label: "Valid date selected", done: !!selectedDate && !dateError },
                  { label: "Time slot selected", done: !!selectedSlot },
                ].map((step, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: step.done
                          ? "linear-gradient(135deg, #4ade80, #22c55e)"
                          : "rgba(255,255,255,0.08)",
                        border: step.done
                          ? "none"
                          : "1px solid rgba(255,255,255,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        color: "white",
                        fontWeight: 800,
                        transition: "all 0.35s ease",
                        boxShadow: step.done
                          ? "0 0 10px rgba(74,222,128,0.4)"
                          : "none",
                      }}
                    >
                      {step.done ? (
                        "✓"
                      ) : (
                        <span
                          style={{
                            color: "rgba(255,255,255,0.3)",
                            fontSize: "9px",
                          }}
                        >
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: step.done
                          ? "rgba(255,255,255,0.9)"
                          : "rgba(255,255,255,0.3)",
                        fontWeight: step.done ? 600 : 400,
                        transition: "color 0.3s ease",
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }

        .page-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 28px;
          align-items: start;
        }

        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes valuePop {
          0%   { opacity: 0; transform: scale(0.7) translateY(6px); }
          60%  { transform: scale(1.08) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bounceIn {
          0%   { transform: scale(0.4); opacity: 0; }
          60%  { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px #4ade80; }
          50%       { opacity: 0.6; box-shadow: 0 0 14px #4ade80; }
        }
        @keyframes stepRingPulse {
          0%, 100% { transform: scale(1);    opacity: 0.7; }
          50%       { transform: scale(1.25); opacity: 0.2; }
        }
        @keyframes stepBobble {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-3px); }
        }
        @keyframes successPulse {
          0%, 100% { box-shadow: 0 4px 16px rgba(26,41,128,0.35); }
          50%       { box-shadow: 0 6px 24px rgba(6,182,212,0.55); }
        }

        /* Stepper responsive */
        .stepper-desktop { display: flex; align-items: flex-start; gap: 0; }
        .stepper-mobile  { display: none; }
        @media (max-width: 640px) {
          .stepper-desktop { display: none; }
          .stepper-mobile  { display: block; }
        }

        /* Tablet */
        @media (max-width: 1024px) {
          .page-grid {
            grid-template-columns: 1fr 320px !important;
          }
        }

        /* Mobile: summary moves below form */
        @media (max-width: 800px) {
          .page-grid {
            grid-template-columns: 1fr !important;
          }
          .summary-col {
            position: static !important;
          }
        }

        /* Hide sidebar on very small screens */
        @media (max-width: 600px) {
          aside { display: none !important; }
          main  { padding: 20px !important; }
        }
      `}</style>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  border: "1px solid rgba(226,232,240,0.8)",
};

const stepHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "14px",
  marginBottom: "22px",
};

const stepTitleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#0f172a",
  margin: 0,
};

const stepSubStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: "3px 0 0",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px 14px 50px",
  borderRadius: "12px",
  border: "2px solid #e2e8f0",
  fontSize: "15px",
  color: "#0f172a",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
  boxSizing: "border-box",
  background: "#f8fafc",
  fontFamily: "inherit",
};

const inputIconStyle: React.CSSProperties = {
  position: "absolute",
  left: "16px",
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: "18px",
  pointerEvents: "none",
};