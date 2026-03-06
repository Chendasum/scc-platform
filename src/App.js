import { useState } from "react";
import DealTracker from "./apps/DealTracker";
import LoanAssistant from "./apps/LoanAssistant";
import InvestorDashboard from "./apps/InvestorDashboard";
import BorrowerAssessment from "./apps/BorrowerAssessment";

const GOLD = "#C9A84C";
const NAVY = "#0D1626";

const APPS = [
  { key: "tracker",    label: "Deal Tracker",          icon: "📋", desc: "Manage all active deals" },
  { key: "loan",       label: "Loan Structuring",       icon: "⚡", desc: "AI deal modelling" },
  { key: "dashboard",  label: "Investor Dashboard",     icon: "📊", desc: "Fund reporting" },
  { key: "borrower",   label: "Borrower Assessment",    icon: "🎯", desc: "AI credit scoring" },
];

export default function App() {
  const [active, setActive] = useState("tracker");

  const renderApp = () => {
    switch (active) {
      case "tracker":   return <DealTracker />;
      case "loan":      return <LoanAssistant />;
      case "dashboard": return <InvestorDashboard />;
      case "borrower":  return <BorrowerAssessment />;
      default:          return <DealTracker />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#080E1A", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <div style={{
        width: 220, background: NAVY, borderRight: "1px solid #1A2A40",
        display: "flex", flexDirection: "column", flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid #1A2A40" }}>
          <div style={{ fontSize: 9, color: GOLD, fontWeight: 800, letterSpacing: 3, marginBottom: 2 }}>SUM CHENDA</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#FFFFFF", letterSpacing: -0.3 }}>Capital Platform</div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          <div style={{ fontSize: 9, color: "#2A3A55", fontWeight: 800, letterSpacing: 2, padding: "0 8px", marginBottom: 8 }}>TOOLS</div>
          {APPS.map(app => (
            <button key={app.key} onClick={() => setActive(app.key)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8, cursor: "pointer", border: "none",
              background: active === app.key ? `${GOLD}18` : "none",
              textAlign: "left", marginBottom: 2,
              borderLeft: active === app.key ? `2px solid ${GOLD}` : "2px solid transparent",
              transition: "all 0.15s"
            }}>
              <span style={{ fontSize: 16 }}>{app.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: active === app.key ? 800 : 600, color: active === app.key ? GOLD : "#A0B0C8" }}>{app.label}</div>
                <div style={{ fontSize: 10, color: "#445577", marginTop: 1 }}>{app.desc}</div>
              </div>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "14px 18px", borderTop: "1px solid #1A2A40" }}>
          <div style={{ fontSize: 9, color: "#2A3A55" }}>© 2026 Sum Chenda Capital</div>
          <div style={{ fontSize: 9, color: "#2A3A55" }}>Phnom Penh, Cambodia</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {renderApp()}
      </div>
    </div>
  );
}
