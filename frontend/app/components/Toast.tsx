"use client";

import React, { useEffect, useRef } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  visible: boolean;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: "✅",
    bg: "linear-gradient(135deg, #065f46, #047857)",
    border: "#10b981",
  },
  error: {
    icon: "❌",
    bg: "linear-gradient(135deg, #7f1d1d, #991b1b)",
    border: "#ef4444",
  },
  info: {
    icon: "ℹ️",
    bg: "linear-gradient(135deg, #1e3a5f, #1e40af)",
    border: "#3b82f6",
  },
};

export default function Toast({ message, type, visible, onClose }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const config = toastConfig[type];

  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(() => {
        onClose();
      }, 3000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible, onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        zIndex: 9999,
        transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.95)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        style={{
          background: config.bg,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${config.border}40`,
          borderRadius: 14,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
          minWidth: 280,
          maxWidth: 420,
        }}
      >
        <span style={{ fontSize: 20, flexShrink: 0 }}>{config.icon}</span>
        <span
          style={{
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 500,
            flex: 1,
            lineHeight: 1.4,
          }}
        >
          {message}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            border: "none",
            borderRadius: 8,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#ffffff",
            fontSize: 14,
            flexShrink: 0,
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = "rgba(255, 255, 255, 0.25)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = "rgba(255, 255, 255, 0.15)";
          }}
          aria-label="Close toast"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
