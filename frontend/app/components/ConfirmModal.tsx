"use client";

import React, { useState } from "react";

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  visible: boolean;
  danger?: boolean;
}

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  visible,
  danger = false,
}: ConfirmModalProps) {
  const [confirmHovered, setConfirmHovered] = useState(false);
  const [cancelHovered, setCancelHovered] = useState(false);

  if (!visible) return null;

  const confirmColor = danger ? "#ef4444" : "#3b82f6";
  const confirmHoverColor = danger ? "#dc2626" : "#2563eb";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onCancel}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: 20,
          padding: "32px",
          width: "100%",
          maxWidth: 420,
          margin: "0 16px",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.3)",
          animation: "scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: danger
              ? "rgba(239, 68, 68, 0.1)"
              : "rgba(59, 130, 246, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            marginBottom: 20,
          }}
        >
          {danger ? "⚠️" : "❓"}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#1e293b",
            margin: "0 0 8px 0",
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>

        {/* Message */}
        <p
          style={{
            fontSize: 14,
            color: "#64748b",
            lineHeight: 1.6,
            margin: "0 0 28px 0",
          }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            onMouseEnter={() => setCancelHovered(true)}
            onMouseLeave={() => setCancelHovered(false)}
            style={{
              padding: "10px 22px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: cancelHovered ? "#f1f5f9" : "#ffffff",
              color: "#475569",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            onMouseEnter={() => setConfirmHovered(true)}
            onMouseLeave={() => setConfirmHovered(false)}
            style={{
              padding: "10px 22px",
              borderRadius: 12,
              border: "none",
              background: confirmHovered ? confirmHoverColor : confirmColor,
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: `0 4px 12px ${confirmColor}40`,
            }}
          >
            {danger ? "Delete" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
