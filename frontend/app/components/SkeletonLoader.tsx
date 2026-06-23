"use client";

import React from "react";

interface SkeletonLoaderProps {
  rows?: number;
  height?: number;
}

export default function SkeletonLoader({ rows = 3, height = 20 }: SkeletonLoaderProps) {
  // Vary widths for a more natural look
  const widths = [100, 85, 70, 92, 78, 88, 65, 95, 80, 72];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -400px 0;
          }
          100% {
            background-position: 400px 0;
          }
        }
      `}</style>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          style={{
            height,
            borderRadius: 8,
            width: `${widths[i % widths.length]}%`,
            background: `linear-gradient(
              90deg,
              #e2e8f0 0%,
              #f1f5f9 40%,
              #e2e8f0 80%
            )`,
            backgroundSize: "800px 100%",
            animation: "shimmer 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
