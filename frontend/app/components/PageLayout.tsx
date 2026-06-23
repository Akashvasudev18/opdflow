"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

interface PageLayoutProps {
  activePage: string;
  children: React.ReactNode;
}

export default function PageLayout({ activePage, children }: PageLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 50%, #f0f4f8 100%)",
      }}
    >
      {/* Mobile Hamburger */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 200,
            width: 44,
            height: 44,
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #0f172a, #1e3a5f)",
            color: "#ffffff",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            transition: "transform 0.2s ease",
          }}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>
      )}

      {/* Sidebar - desktop always visible, mobile slide-in */}
      {isMobile ? (
        <>
          {/* Backdrop */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(4px)",
                zIndex: 99,
                transition: "opacity 0.3s ease",
              }}
            />
          )}
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 101,
            }}
          >
            <Sidebar activePage={activePage} />
          </div>
        </>
      ) : (
        <Sidebar activePage={activePage} />
      )}

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : 260,
          padding: isMobile ? "72px 16px 32px" : "32px 40px",
          minHeight: "100vh",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        {children}
      </main>
    </div>
  );
}
