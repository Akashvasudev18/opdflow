"use client";

import React, { useState } from "react";
import { useAnimatedCounter } from "../lib/hooks";

interface KPICardProps {
  icon: string;
  label: string;
  value: number;
  color: string;
  delay?: string;
}

export default function KPICard({ icon, label, value, color, delay = "0s" }: KPICardProps) {
  const [hovered, setHovered] = useState(false);
  const animatedValue = useAnimatedCounter(value);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: 16,
        padding: "24px 24px 24px 28px",
        borderLeft: `4px solid ${color}`,
        border: `1px solid rgba(255, 255, 255, 0.4)`,
        borderLeftWidth: 4,
        borderLeftColor: color,
        boxShadow: hovered
          ? `0 12px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255,255,255,0.5)`
          : "0 4px 16px rgba(0, 0, 0, 0.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
        animationDelay: delay,
        animation: "fadeInUp 0.5s ease forwards",
        opacity: 0,
        display: "flex",
        alignItems: "center",
        gap: 18,
        minWidth: 0,
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Icon Circle */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Text Content */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#1e293b",
            lineHeight: 1.2,
            letterSpacing: "-0.5px",
          }}
        >
          {animatedValue.toLocaleString()}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#64748b",
            fontWeight: 500,
            marginTop: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
