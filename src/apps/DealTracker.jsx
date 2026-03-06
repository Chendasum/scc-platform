import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "scc-deals-v1";

const STATUS_CONFIG = {
  Pipeline:   { color: "#C9A84C", bg: "#1B2A4A", dot: "#C9A84C" },
  "Due Diligence": { color: "#4A90D9", bg: "#1A2E42", dot: "#4A90D9" },
  Active:     { color: "#4CAF82", bg: "#1A2E28", dot: "#4CAF82" },
  Monitoring: { color: "#9B6FD4", bg: "#231A38", dot: "#9B6FD4" },
  Repaid:     { color: "#888", bg: "#1A1A1A", dot: "#888" },
  Defaulted:  { color: "#E05050", bg: "#2E1A1A", dot: "#E05050" },
};

const EMPTY_DEAL = {
  borrower: "", ref: "", type: "SME", amount: "", rate: "", term: "",
  ltv: "", collateral: "", status: "Pipeline", startDate: "", notes: ""
};

const BORROWER_TYPES = ["SME", "Real Estate", "Trade Finance", "Other"];
const STATUSES = Object.keys(STATUS_CONFIG);

function formatUSD(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatPct(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return n + "%";
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pipeline;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, color: cfg.color,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
      border: `1px solid ${cfg.color}33`
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

function Modal({ children, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20, backdropFilter: "blur(4px)"
    }} onClick={onClose}>
      <div style={{ maxHeight: "90vh", overflowY: "auto", width: "100%", maxWidth: 640 }}
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function DealForm({ deal, onSave, onCancel }) {
  const [form, setForm] = useState(deal || EMPTY_DEAL);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputStyle = {
    width: "100%", background: "#0D1626", border: "1px solid #2A3A55",
    color: "#E0E8F0", padding: "9px 12px", borderRadius: 8,
    fontSize: 13, outline: "none", boxSizing: "border-box",
    fontFamily: "inherit"
  };
  const labelStyle = { fontSize: 11, color: "#7A8EAA", fontWeight: 700, letterSpacing: 1, marginBottom: 5, display: "block" };

  return (
    <div style={{ background: "#101B2E", border: "1px solid #2A3A55", borderRadius: 16, padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#E0E8F0" }}>
          {deal?.id ? "Edit Deal" : "New Deal"}
        </div>
        <button onClick={onCancel} style={{ background: "none", border: "none", color: "#7A8EAA", cursor: "pointer", fontSize: 20 }}>✕</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          ["BORROWER NAME", "borrower", "text", "e.g. ABC Construction Co."],
          ["DEAL REF #", "ref", "text", "DEAL-001"],
          ["LOAN AMOUNT (USD)", "amount", "number", "500000"],
          ["INTEREST RATE (%)", "rate", "number", "18"],
          ["TERM (MONTHS)", "term", "number", "12"],
          ["LTV (%)", "ltv", "number", "60"],
        ].map(([label, key, type, placeholder]) => (
          <div key={key}>
            <label style={labelStyle}>{label}</label>
            <input type={type} placeholder={placeholder} value={form[key]}
              onChange={e => set(key, e.target.value)} style={inputStyle} />
          </div>
        ))}

        <div>
          <label style={labelStyle}>BORROWER TYPE</label>
          <select value={form.type} onChange={e => set("type", e.target.value)}
            style={{ ...inputStyle, appearance: "none" }}>
            {BORROWER_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>STATUS</label>
          <select value={form.status} onChange={e => set("status", e.target.value)}
            style={{ ...inputStyle, appearance: "none" }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>START DATE</label>
          <input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)}
            style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>COLLATERAL TYPE</label>
          <input placeholder="Property / Equipment / Inventory" value={form.collateral}
            onChange={e => set("collateral", e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label style={labelStyle}>NOTES</label>
        <textarea rows={3} placeholder="Deal notes, conditions, observations..." value={form.notes}
          onChange={e => set("notes", e.target.value)}
          style={{ ...inputStyle, resize: "vertical" }} />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{
          background: "none", border: "1px solid #2A3A55", color: "#7A8EAA",
          padding: "10px 22px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600
        }}>Cancel</button>
        <button onClick={() => onSave(form)} style={{
          background: "linear-gradient(135deg, #C9A84C, #E8C97A)", border: "none", color: "#0D1020",
          padding: "10px 28px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800
        }}>Save Deal</button>
      </div>
    </div>
  );
}

export default function DealTracker() {
  const [deals, setDeals] = useState([]);
  const [modal, setModal] = useState(null); // null | "add" | {deal}
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [viewDeal, setViewDeal] = useState(null);
  const nextId = useRef(1);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setDeals(parsed);
        if (parsed.length > 0) nextId.current = Math.max(...parsed.map(d => d.id)) + 1;
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(deals)); } catch {}
  }, [deals]);

  function saveDeal(form) {
    if (modal?.deal) {
      setDeals(d => d.map(x => x.id === modal.deal.id ? { ...form, id: x.id } : x));
    } else {
      setDeals(d => [...d, { ...form, id: nextId.current++ }]);
    }
    setModal(null);
  }

  function deleteDeal(id) {
    setDeals(d => d.filter(x => x.id !== id));
    setViewDeal(null);
  }

  const filtered = deals.filter(d => {
    const matchStatus = filter === "All" || d.status === filter;
    const matchSearch = !search || d.borrower.toLowerCase().includes(search.toLowerCase()) ||
      d.ref.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Portfolio metrics
  const active = deals.filter(d => d.status === "Active");
  const totalDeployed = active.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);
  const totalIncome = active.reduce((s, d) => {
    const a = parseFloat(d.amount) || 0, r = parseFloat(d.rate) || 0;
    return s + a * r / 100;
  }, 0);
  const avgLTV = active.length > 0
    ? (active.reduce((s, d) => s + (parseFloat(d.ltv) || 0), 0) / active.length).toFixed(1)
    : "—";

  const metrics = [
    { label: "Total Deployed", value: formatUSD(totalDeployed), sub: `${active.length} active deals` },
    { label: "Est. Annual Income", value: formatUSD(totalIncome), sub: "interest income" },
    { label: "Avg LTV", value: avgLTV === "—" ? "—" : avgLTV + "%", sub: "active portfolio" },
    { label: "Total Deals", value: deals.length, sub: `${deals.filter(d => d.status === "Pipeline").length} in pipeline` },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#080E1A",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#E0E8F0"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, #0D1626 0%, #080E1A 100%)",
        borderBottom: "1px solid #1A2A40", padding: "18px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <div style={{ fontSize: 11, color: "#C9A84C", fontWeight: 800, letterSpacing: 3 }}>SUM CHENDA CAPITAL</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#FFFFFF", letterSpacing: -0.5 }}>Deal Tracker</div>
        </div>
        <button onClick={() => setModal("add")} style={{
          background: "linear-gradient(135deg, #C9A84C, #E8C97A)", border: "none", color: "#0D1020",
          padding: "10px 22px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 800,
          display: "flex", alignItems: "center", gap: 6
        }}>+ New Deal</button>
      </div>

      <div style={{ padding: "24px 28px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {metrics.map((m, i) => (
            <div key={i} style={{
              background: "#0D1626", border: "1px solid #1A2A40",
              borderRadius: 12, padding: "18px 20px"
            }}>
              <div style={{ fontSize: 11, color: "#7A8EAA", fontWeight: 700, letterSpacing: 1 }}>{m.label.toUpperCase()}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#C9A84C", margin: "6px 0 2px" }}>{m.value}</div>
              <div style={{ fontSize: 11, color: "#445577" }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input placeholder="Search borrower or ref..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: "#0D1626", border: "1px solid #2A3A55", color: "#E0E8F0",
              padding: "9px 14px", borderRadius: 8, fontSize: 13, outline: "none",
              fontFamily: "inherit", width: 220
            }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["All", ...STATUSES].map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                background: filter === s ? "#C9A84C" : "#0D1626",
                color: filter === s ? "#0D1020" : "#7A8EAA",
                border: `1px solid ${filter === s ? "#C9A84C" : "#2A3A55"}`,
                padding: "7px 14px", borderRadius: 20, cursor: "pointer",
                fontSize: 12, fontWeight: filter === s ? 800 : 500
              }}>{s} {s !== "All" ? `(${deals.filter(d => d.status === s).length})` : `(${deals.length})`}</button>
            ))}
          </div>
        </div>

        {/* Deal Table */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            background: "#0D1626", borderRadius: 16, border: "1px solid #1A2A40"
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#E0E8F0", marginBottom: 6 }}>No deals yet</div>
            <div style={{ color: "#445577", fontSize: 13 }}>Click "+ New Deal" to add your first deal</div>
          </div>
        ) : (
          <div style={{ background: "#0D1626", border: "1px solid #1A2A40", borderRadius: 16, overflow: "hidden" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1.2fr 0.8fr 0.8fr 0.8fr 1.2fr 0.6fr",
              padding: "12px 20px",
              background: "#080E1A",
              fontSize: 10, color: "#445577", fontWeight: 800, letterSpacing: 1
            }}>
              {["BORROWER", "REF", "AMOUNT", "RATE", "TERM", "LTV", "STATUS", ""].map((h, i) => (
                <div key={i}>{h}</div>
              ))}
            </div>
            {filtered.map((d, i) => (
              <div key={d.id} onClick={() => setViewDeal(d)} style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1.2fr 0.8fr 0.8fr 0.8fr 1.2fr 0.6fr",
                padding: "14px 20px", alignItems: "center",
                borderTop: "1px solid #121E30",
                cursor: "pointer",
                transition: "background 0.15s",
                background: i % 2 === 0 ? "transparent" : "#0A1220",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#142030"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "#0A1220"}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#E0E8F0" }}>{d.borrower || "—"}</div>
                  <div style={{ fontSize: 11, color: "#445577", marginTop: 2 }}>{d.type}</div>
                </div>
                <div style={{ fontSize: 12, color: "#7A8EAA" }}>{d.ref || "—"}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#C9A84C" }}>{formatUSD(d.amount)}</div>
                <div style={{ fontSize: 13, color: "#E0E8F0" }}>{formatPct(d.rate)}</div>
                <div style={{ fontSize: 13, color: "#E0E8F0" }}>{d.term ? d.term + "m" : "—"}</div>
                <div style={{ fontSize: 13, color: parseFloat(d.ltv) > 65 ? "#E05050" : "#4CAF82" }}>
                  {formatPct(d.ltv)}
                </div>
                <StatusBadge status={d.status} />
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={e => { e.stopPropagation(); setModal({ deal: d }); }} style={{
                    background: "none", border: "1px solid #2A3A55", color: "#7A8EAA",
                    width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 13
                  }}>✏</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <Modal onClose={() => setModal(null)}>
          <DealForm
            deal={modal?.deal || null}
            onSave={saveDeal}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {/* View Deal Modal */}
      {viewDeal && (
        <Modal onClose={() => setViewDeal(null)}>
          <div style={{ background: "#101B2E", border: "1px solid #2A3A55", borderRadius: 16, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF" }}>{viewDeal.borrower}</div>
                <div style={{ fontSize: 12, color: "#7A8EAA", marginTop: 4 }}>{viewDeal.ref} · {viewDeal.type}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <StatusBadge status={viewDeal.status} />
                <button onClick={() => setViewDeal(null)} style={{ background: "none", border: "none", color: "#7A8EAA", cursor: "pointer", fontSize: 20 }}>✕</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                ["Loan Amount", formatUSD(viewDeal.amount)],
                ["Interest Rate", formatPct(viewDeal.rate)],
                ["Term", viewDeal.term ? viewDeal.term + " months" : "—"],
                ["LTV", formatPct(viewDeal.ltv)],
                ["Collateral", viewDeal.collateral || "—"],
                ["Start Date", viewDeal.startDate || "—"],
              ].map(([label, val]) => (
                <div key={label} style={{ background: "#0D1626", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: "#445577", fontWeight: 700, letterSpacing: 1 }}>{label.toUpperCase()}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#C9A84C", marginTop: 4 }}>{val}</div>
                </div>
              ))}
            </div>

            {viewDeal.notes && (
              <div style={{ background: "#0A1525", border: "1px solid #1A2A40", borderRadius: 10, padding: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: "#445577", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>NOTES</div>
                <div style={{ fontSize: 13, color: "#A0B0C8", lineHeight: 1.6 }}>{viewDeal.notes}</div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => { deleteDeal(viewDeal.id); }} style={{
                background: "none", border: "1px solid #E05050", color: "#E05050",
                padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600
              }}>Delete</button>
              <button onClick={() => { setModal({ deal: viewDeal }); setViewDeal(null); }} style={{
                background: "linear-gradient(135deg, #C9A84C, #E8C97A)", border: "none", color: "#0D1020",
                padding: "9px 22px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800
              }}>Edit Deal</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
