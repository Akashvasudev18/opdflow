"use client"

import { useEffect, useState } from "react"

interface SidebarProps {
  activePage?: string
}

const NAV_ITEMS = [
  { href: "/", key: "dashboard", label: "Dashboard", icon: "📊" },
  { href: "/book", key: "book", label: "Book Appointment", icon: "📅" },
  { href: "/status", key: "status", label: "Check Status", icon: "🔍" },
  { href: "/doctors", key: "doctors", label: "Doctors", icon: "👨‍⚕️" },
]

export default function Sidebar({ activePage = "dashboard" }: SidebarProps) {
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString())
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <aside
      style={{
        width: "260px",
        flexShrink: 0,
        background: "linear-gradient(180deg, #0f172a 0%, #1e3a5f 60%, #0e7490 100%)",
        color: "white",
        padding: "32px 20px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "4px 0 32px rgba(15,23,42,0.25)",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              boxShadow: "0 4px 16px rgba(6,182,212,0.4)",
            }}
          >
            🏥
          </div>
          <span style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px" }}>
            CareFlux
          </span>
        </div>
        <p
          style={{
            fontSize: "10px",
            opacity: 0.4,
            marginLeft: "54px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Hospital Management
        </p>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === activePage
          return (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 14px",
                borderRadius: "12px",
                textDecoration: "none",
                color: "white",
                fontSize: "14px",
                fontWeight: isActive ? 700 : 400,
                background: isActive ? "rgba(6,182,212,0.2)" : "transparent",
                border: isActive
                  ? "1px solid rgba(6,182,212,0.35)"
                  : "1px solid transparent",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"
              }}
            >
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              {item.label}
              {isActive && (
                <div
                  style={{
                    marginLeft: "auto",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#06b6d4",
                    boxShadow: "0 0 8px #06b6d4",
                  }}
                />
              )}
            </a>
          )
        })}
      </nav>

      {/* System Status */}
      <div
        style={{
          padding: "16px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <p
          style={{
            fontSize: "10px",
            opacity: 0.5,
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          System Status
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#4ade80",
              boxShadow: "0 0 10px #4ade80",
              animation: "livePulse 2s infinite",
            }}
          />
          <span style={{ fontSize: "13px", fontWeight: 600 }}>All Systems Online</span>
        </div>
        <p style={{ fontSize: "10px", opacity: 0.4, marginTop: "8px" }}>
          Last sync: {time}
        </p>
      </div>
    </aside>
  )
}
