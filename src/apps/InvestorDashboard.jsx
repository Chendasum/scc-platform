import { useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const GOLD = "#C9A84C";
const NAVY = "#1B2A4A";
const GREEN = "#4CAF82";
const BLUE = "#4A90D9";
const RED = "#E05050";

// Sample portfolio data
const PORTFOLIO = {
  fundName: "Sum Chenda Private Credit Fund I",
  reportDate: "Q1 2026",
  navTotal: 2850000,
  deployedCapital: 2340000,
  cashReserve: 510000,
  totalInvestors: 8,
  inceptionDate: "Jan 2025",
  targetSize: 5000000,
};

const DEALS = [
  { id: 1, borrower: "Phnom Penh Developments", type: "Real Estate", amount: 500000, rate: 18, term: 12, ltv: 62, status: "Active", disbursed: "Mar 2025", maturity: "Mar 2026", paidMonths: 12, totalDue: 12 },
  { id: 2, borrower: "Golden Trade Co.", type: "Trade Finance", amount: 200000, rate: 20, term: 6, ltv: 55, status: "Repaid", disbursed: "Jan 2025", maturity: "Jul 2025", paidMonths: 6, totalDue: 6 },
  { id: 3, borrower: "Mekong SME Ltd.", type: "SME", amount: 350000, rate: 17, term: 18, ltv: 60, status: "Active", disbursed: "Apr 2025", maturity: "Oct 2026", paidMonths: 9, totalDue: 18 },
  { id: 4, borrower: "Kampot Logistics", type: "SME", amount: 150000, rate: 22, term: 9, ltv: 58, status: "Active", disbursed: "Jun 2025", maturity: "Mar 2026", paidMonths: 7, totalDue: 9 },
  { id: 5, borrower: "Siem Reap Properties", type: "Real Estate", amount: 480000, rate: 16, term: 24, ltv: 63, status: "Active", disbursed: "Aug 2025", maturity: "Aug 2027", paidMonths: 5, totalDue: 24 },
  { id: 6, borrower: "Delta Trading SEA", type: "Trade Finance", amount: 300000, rate: 19, term: 6, ltv: 52, status: "Pipeline", disbursed: "—", maturity: "—", paidMonths: 0, totalDue: 6 },
  { id: 7, borrower: "Battambang Mills", type: "SME", amount: 180000, rate: 21, term: 12, ltv: 59, status: "Due Diligence", disbursed: "—", maturity: "—", paidMonths: 0, totalDue: 12 },
];

const CASHFLOW_DATA = [
  { month: "Jan", income: 38500, principal: 200000 },
  { month: "Feb", income: 36200, principal: 0 },
  { month: "Mar", income: 41800, principal: 500000 },
  { month: "Apr", income: 44100, principal: 0 },
  { month: "May", income: 44100, principal: 0 },
  { month: "Jun", income: 47300, principal: 200000 },
  { month: "Jul", income: 45600, principal: 0 },
  { month: "Aug", income: 48900, principal: 0 },
  { month: "Sep", income: 50200, principal: 0 },
  { month: "Oct", income: 50200, principal: 0 },
  { month: "Nov", income: 50200, principal: 0 },
  { month: "Dec", income: 50200, principal: 0 },
];

const NAV_DATA = [
  { month: "Q1'25", nav: 800000 },
  { month: "Q2'25", nav: 1350000 },
  { month: "Q3'25", nav: 2100000 },
  { month: "Q4'25", nav: 2650000 },
  { month: "Q1'26", nav: 2850000 },
];

const STATUS_COLORS = { Active: GREEN, Repaid: "#888", Pipeline: GOLD, "Due Diligence": BLUE, Defaulted: RED };

function formatK(v) { return v >= 1000000 ? "$" + (v / 1000000).toFixed(2) + "M" : "$" + (v / 1000).toFixed(0) + "K"; }
function pct(v) { return v + "%"; }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0D1626", border: "1px solid #2A3A55", borderRadius: 8, padding: "10px 14px" }}>
      <div style={{ fontSize: 11, color: "#7A8EAA", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, color: p.color || GOLD, fontWeight: 700 }}>
          {p.name}: {p.name === "nav" ? formatK(p.value) : p.name === "income" ? formatK(p.value) : formatK(p.value)}
        </div>
      ))}
    </div>
  );
};

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#E0E8F0", letterSpacing: 0.3 }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: "#445577", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: "#0D1626", border: "1px solid #1A2A40", borderRadius: 14,
      padding: "20px 22px", ...style
    }}>{children}</div>
  );
}

export default function InvestorDashboard() {
  const [tab, setTab] = useState("overview");
  const activeDeals = DEALS.filter(d => d.status === "Active");
  const totalInterestIncome = CASHFLOW_DATA.reduce((s, m) => s + m.income, 0);
  const avgYield = activeDeals.length > 0
    ? (activeDeals.reduce((s, d) => s + d.rate, 0) / activeDeals.length).toFixed(1)
    : 0;
  const avgLTV = activeDeals.length > 0
    ? (activeDeals.reduce((s, d) => s + d.ltv, 0) / activeDeals.length).toFixed(1)
    : 0;

  const sectorData = [
    { name: "Real Estate", value: DEALS.filter(d => d.type === "Real Estate").reduce((s, d) => s + d.amount, 0) },
    { name: "SME", value: DEALS.filter(d => d.type === "SME").reduce((s, d) => s + d.amount, 0) },
    { name: "Trade Finance", value: DEALS.filter(d => d.type === "Trade Finance").reduce((s, d) => s + d.amount, 0) },
  ];
  const SECTOR_COLORS = [GOLD, BLUE, GREEN];

  return (
    <div style={{
      minHeight: "100vh", background: "#080E1A",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#E0E8F0"
    }}>
      {/* Header */}
      <div style={{ background: "#0D1626", borderBottom: "1px solid #1A2A40", padding: "16px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: GOLD, fontWeight: 800, letterSpacing: 3 }}>SUM CHENDA CAPITAL</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF" }}>📊 Investor Dashboard</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#445577" }}>Report Period</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: GOLD }}>{PORTFOLIO.reportDate}</div>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginTop: 14 }}>
          {[["overview", "Overview"], ["portfolio", "Portfolio"], ["cashflow", "Cashflow"], ["deals", "Deal Table"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: tab === key ? GOLD : "none",
              color: tab === key ? "#0D1020" : "#7A8EAA",
              border: `1px solid ${tab === key ? GOLD : "#2A3A55"}`,
              padding: "7px 18px", borderRadius: 8, cursor: "pointer",
              fontSize: 12, fontWeight: tab === key ? 800 : 500
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 28px", maxWidth: 1300, margin: "0 auto" }}>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <>
            {/* KPI Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Fund NAV", value: formatK(PORTFOLIO.navTotal), sub: "total fund value", color: GOLD },
                { label: "Deployed Capital", value: formatK(PORTFOLIO.deployedCapital), sub: `${((PORTFOLIO.deployedCapital / PORTFOLIO.navTotal) * 100).toFixed(0)}% of NAV`, color: BLUE },
                { label: "Annual Income (est.)", value: formatK(totalInterestIncome), sub: "interest + fees", color: GREEN },
                { label: "Avg Portfolio Yield", value: pct(avgYield), sub: "gross p.a.", color: GOLD },
                { label: "Avg LTV", value: pct(avgLTV), sub: "active deals", color: avgLTV <= 65 ? GREEN : RED },
              ].map((k, i) => (
                <Card key={i}>
                  <div style={{ fontSize: 10, color: "#7A8EAA", fontWeight: 700, letterSpacing: 1 }}>{k.label.toUpperCase()}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: k.color, margin: "5px 0 2px" }}>{k.value}</div>
                  <div style={{ fontSize: 11, color: "#445577" }}>{k.sub}</div>
                </Card>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 20 }}>
              {/* NAV Chart */}
              <Card>
                <SectionHeader title="Fund NAV Growth" sub="Since inception" />
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={NAV_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A2A40" />
                    <XAxis dataKey="month" tick={{ fill: "#445577", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => "$" + (v / 1000000).toFixed(1) + "M"} tick={{ fill: "#445577", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="nav" stroke={GOLD} strokeWidth={2.5} dot={{ fill: GOLD, r: 4 }} name="nav" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Sector allocation */}
              <Card>
                <SectionHeader title="Sector Allocation" sub="By deployed capital" />
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={sectorData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                      dataKey="value" nameKey="name" paddingAngle={3}>
                      {sectorData.map((_, i) => <Cell key={i} fill={SECTOR_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={v => formatK(v)} contentStyle={{ background: "#0D1626", border: "1px solid #2A3A55" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {sectorData.map((s, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: SECTOR_COLORS[i] }} />
                        <span style={{ fontSize: 12, color: "#A0B0C8" }}>{s.name}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: SECTOR_COLORS[i] }}>{formatK(s.value)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Fund progress */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <SectionHeader title="Fund Deployment Progress" />
                <span style={{ fontSize: 12, color: "#7A8EAA" }}>Target: {formatK(PORTFOLIO.targetSize)}</span>
              </div>
              <div style={{ background: "#080E1A", borderRadius: 999, height: 12, overflow: "hidden" }}>
                <div style={{
                  width: `${(PORTFOLIO.deployedCapital / PORTFOLIO.targetSize) * 100}%`,
                  height: "100%", background: `linear-gradient(90deg, ${NAVY}, ${GOLD})`,
                  borderRadius: 999, transition: "width 1s ease"
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: "#445577" }}>Deployed: {formatK(PORTFOLIO.deployedCapital)} ({((PORTFOLIO.deployedCapital / PORTFOLIO.targetSize) * 100).toFixed(0)}%)</span>
                <span style={{ fontSize: 11, color: "#445577" }}>Available: {formatK(PORTFOLIO.targetSize - PORTFOLIO.deployedCapital)}</span>
              </div>
            </Card>
          </>
        )}

        {/* CASHFLOW TAB */}
        {tab === "cashflow" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Total Interest Income (YTD)", value: formatK(totalInterestIncome), color: GREEN },
                { label: "Total Principal Received (YTD)", value: formatK(CASHFLOW_DATA.reduce((s, m) => s + m.principal, 0)), color: BLUE },
                { label: "Total Cash Received (YTD)", value: formatK(CASHFLOW_DATA.reduce((s, m) => s + m.income + m.principal, 0)), color: GOLD },
              ].map((k, i) => (
                <Card key={i}>
                  <div style={{ fontSize: 10, color: "#7A8EAA", fontWeight: 700, letterSpacing: 1 }}>{k.label.toUpperCase()}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: k.color, margin: "5px 0" }}>{k.value}</div>
                </Card>
              ))}
            </div>
            <Card style={{ marginBottom: 20 }}>
              <SectionHeader title="Monthly Interest Income" sub="2025 full year" />
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={CASHFLOW_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2A40" />
                  <XAxis dataKey="month" tick={{ fill: "#445577", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} tick={{ fill: "#445577", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" fill={GOLD} radius={[4, 4, 0, 0]} name="income" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <SectionHeader title="Monthly Cashflow Detail" />
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#080E1A" }}>
                      {["Month", "Interest Income", "Principal Received", "Total Cash", "Cumulative Income"].map(h => (
                        <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, color: "#445577", fontWeight: 800, letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CASHFLOW_DATA.map((r, i) => {
                      const cumulative = CASHFLOW_DATA.slice(0, i + 1).reduce((s, m) => s + m.income, 0);
                      return (
                        <tr key={i} style={{ borderTop: "1px solid #111A28", background: i % 2 === 0 ? "transparent" : "#0A1220" }}>
                          <td style={{ padding: "10px 12px", color: "#A0B0C8" }}>{r.month}</td>
                          <td style={{ padding: "10px 12px", color: GREEN, fontWeight: 700 }}>{formatK(r.income)}</td>
                          <td style={{ padding: "10px 12px", color: r.principal > 0 ? BLUE : "#445577", fontWeight: r.principal > 0 ? 700 : 400 }}>{r.principal > 0 ? formatK(r.principal) : "—"}</td>
                          <td style={{ padding: "10px 12px", color: GOLD, fontWeight: 700 }}>{formatK(r.income + r.principal)}</td>
                          <td style={{ padding: "10px 12px", color: "#A0B0C8" }}>{formatK(cumulative)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* PORTFOLIO TAB */}
        {tab === "portfolio" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Active Deals", value: DEALS.filter(d => d.status === "Active").length, color: GREEN },
                { label: "In Pipeline", value: DEALS.filter(d => ["Pipeline", "Due Diligence"].includes(d.status)).length, color: GOLD },
                { label: "Repaid", value: DEALS.filter(d => d.status === "Repaid").length, color: "#888" },
                { label: "Total Deals", value: DEALS.length, color: BLUE },
              ].map((k, i) => (
                <Card key={i}>
                  <div style={{ fontSize: 10, color: "#7A8EAA", fontWeight: 700, letterSpacing: 1 }}>{k.label.toUpperCase()}</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: k.color, margin: "5px 0" }}>{k.value}</div>
                </Card>
              ))}
            </div>
            <Card>
              <SectionHeader title="Deal Payment Status" sub="Progress for active deals" />
              {DEALS.filter(d => d.status === "Active").map(d => {
                const progress = (d.paidMonths / d.totalDue) * 100;
                return (
                  <div key={d.id} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#E0E8F0" }}>{d.borrower}</span>
                        <span style={{ fontSize: 11, color: "#445577", marginLeft: 8 }}>{d.type}</span>
                      </div>
                      <div style={{ fontSize: 12, color: GOLD, fontWeight: 700 }}>{d.paidMonths}/{d.totalDue} months</div>
                    </div>
                    <div style={{ background: "#080E1A", borderRadius: 999, height: 8 }}>
                      <div style={{ width: `${progress}%`, height: "100%", background: `linear-gradient(90deg, ${NAVY}, ${GREEN})`, borderRadius: 999 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: "#2A3A55" }}>Disbursed: {d.disbursed}</span>
                      <span style={{ fontSize: 10, color: "#2A3A55" }}>Maturity: {d.maturity}</span>
                    </div>
                  </div>
                );
              })}
            </Card>
          </>
        )}

        {/* DEALS TABLE TAB */}
        {tab === "deals" && (
          <Card>
            <SectionHeader title="Full Deal Table" sub={`${DEALS.length} total deals`} />
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#080E1A" }}>
                    {["Borrower", "Type", "Amount", "Rate", "Term", "LTV", "Disbursed", "Maturity", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, color: "#445577", fontWeight: 800, letterSpacing: 1, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEALS.map((d, i) => (
                    <tr key={d.id} style={{ borderTop: "1px solid #111A28", background: i % 2 === 0 ? "transparent" : "#0A1220" }}>
                      <td style={{ padding: "11px 12px", color: "#E0E8F0", fontWeight: 600 }}>{d.borrower}</td>
                      <td style={{ padding: "11px 12px", color: "#7A8EAA" }}>{d.type}</td>
                      <td style={{ padding: "11px 12px", color: GOLD, fontWeight: 700 }}>{formatK(d.amount)}</td>
                      <td style={{ padding: "11px 12px", color: "#A0B0C8" }}>{d.rate}%</td>
                      <td style={{ padding: "11px 12px", color: "#A0B0C8" }}>{d.term}m</td>
                      <td style={{ padding: "11px 12px", color: d.ltv > 65 ? RED : GREEN, fontWeight: 700 }}>{d.ltv}%</td>
                      <td style={{ padding: "11px 12px", color: "#445577" }}>{d.disbursed}</td>
                      <td style={{ padding: "11px 12px", color: "#445577" }}>{d.maturity}</td>
                      <td style={{ padding: "11px 12px" }}>
                        <span style={{
                          background: STATUS_COLORS[d.status] + "22",
                          color: STATUS_COLORS[d.status],
                          padding: "3px 10px", borderRadius: 12,
                          fontSize: 11, fontWeight: 700, border: `1px solid ${STATUS_COLORS[d.status]}44`
                        }}>{d.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
