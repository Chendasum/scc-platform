import { useState, useRef, useEffect } from "react";

const GOLD = "#C9A84C";
const GREEN = "#4CAF82";
const RED = "#E05050";

const CRITERIA = [
  { key: "trackRecord", label: "Borrower Track Record", desc: "Years in business, payment history, references", max: 20 },
  { key: "cashflow", label: "Cashflow & Revenue Quality", desc: "Consistency, growth, DSCR adequacy", max: 20 },
  { key: "collateral", label: "Collateral Quality", desc: "Asset type, title clarity, liquidity, LTV", max: 20 },
  { key: "management", label: "Management & Governance", desc: "Owner experience, transparency, key person risk", max: 15 },
  { key: "legal", label: "Legal & Compliance", desc: "KYC/AML, no adverse findings, charge enforceability", max: 15 },
  { key: "market", label: "Market & Sector Risk", desc: "Industry outlook, concentration, cyclicality", max: 10 },
];

const DEFAULTS = { trackRecord: 14, cashflow: 15, collateral: 16, management: 11, legal: 12, market: 7 };

function ScoreSlider({ criterion, value, onChange }) {
  const pct = (value / criterion.max) * 100;
  const color = pct >= 75 ? GREEN : pct >= 50 ? GOLD : RED;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#E0E8F0" }}>{criterion.label}</div>
          <div style={{ fontSize: 11, color: "#445577", marginTop: 1 }}>{criterion.desc}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color }}>{value}</span>
          <span style={{ fontSize: 11, color: "#445577" }}>/{criterion.max}</span>
        </div>
      </div>
      <div style={{ position: "relative", height: 8, background: "#0A1220", borderRadius: 999, marginTop: 6 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${GOLD}88, ${color})`, borderRadius: 999, transition: "all 0.2s" }} />
      </div>
      <input type="range" min={0} max={criterion.max} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: "pointer", marginTop: 4 }} />
    </div>
  );
}

function GaugeMeter({ score, max = 100 }) {
  const pct = score / max;
  const rating = pct >= 0.80 ? { label: "STRONG BUY", color: GREEN } :
    pct >= 0.65 ? { label: "APPROVE", color: GREEN } :
    pct >= 0.50 ? { label: "CONDITIONAL", color: GOLD } :
    pct >= 0.35 ? { label: "HIGH RISK", color: "#E87040" } :
    { label: "DECLINE", color: RED };

  const r = 70, cx = 100, cy = 100;
  const startAngle = -210, endAngle = 30;
  const range = endAngle - startAngle;
  const angle = startAngle + range * pct;
  const toRad = a => (a * Math.PI) / 180;
  const arcX = cx + r * Math.cos(toRad(angle));
  const arcY = cy + r * Math.sin(toRad(angle));

  const arcPath = (a1, a2, col) => {
    const x1 = cx + r * Math.cos(toRad(a1)), y1 = cy + r * Math.sin(toRad(a1));
    const x2 = cx + r * Math.cos(toRad(a2)), y2 = cy + r * Math.sin(toRad(a2));
    const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} stroke={col} strokeWidth={12} fill="none" strokeLinecap="round" />;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={200} height={130} viewBox="0 60 200 110">
        {arcPath(-210, 30, "#1A2A40")}
        {pct > 0 && arcPath(-210, angle, rating.color)}
        <circle cx={arcX} cy={arcY} r={6} fill={rating.color} />
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={36} fontWeight={900} fill={rating.color} fontFamily="DM Sans, sans-serif">{score}</text>
        <text x={cx} y={cy + 28} textAnchor="middle" fontSize={11} fill="#445577" fontFamily="DM Sans, sans-serif">out of {max}</text>
      </svg>
      <div style={{
        background: rating.color + "22", border: `1px solid ${rating.color}55`,
        color: rating.color, padding: "6px 20px", borderRadius: 20,
        fontSize: 13, fontWeight: 900, letterSpacing: 1, marginTop: 4
      }}>{rating.label}</div>
    </div>
  );
}

export default function BorrowerAssessment() {
  const [scores, setScores] = useState(DEFAULTS);
  const [borrowerName, setBorrowerName] = useState("Sample Borrower Co.");
  const [loanAmount, setLoanAmount] = useState(500000);
  const [ltv, setLtv] = useState(62);
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "I'm your AI Borrower Assessment Engine.\n\nScore the borrower across 6 criteria using the sliders on the left. I'll generate a professional credit assessment.\n\nYou can also ask me:\n• \"Generate full credit assessment report\"\n• \"What are the main risks for this borrower?\"\n• \"Is this borrower creditworthy?\"\n• \"What conditions should we attach to this loan?\""
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  const totalScore = Object.values(scores).reduce((s, v) => s + v, 0);
  const maxScore = CRITERIA.reduce((s, c) => s + c.max, 0);
  const scorePct = ((totalScore / maxScore) * 100).toFixed(0);

  const setScore = (key, val) => setScores(s => ({ ...s, [key]: val }));

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  const dealContext = `
BORROWER ASSESSMENT DATA:
Borrower: ${borrowerName}
Loan Amount: $${loanAmount.toLocaleString()}
LTV: ${ltv}%

SCORING (each out of max shown):
${CRITERIA.map(c => `- ${c.label}: ${scores[c.key]}/${c.max} (${((scores[c.key] / c.max) * 100).toFixed(0)}%)`).join("\n")}

COMPOSITE SCORE: ${totalScore}/${maxScore} (${scorePct}%)
RATING: ${
  scorePct >= 80 ? "STRONG APPROVE" :
  scorePct >= 65 ? "APPROVE" :
  scorePct >= 50 ? "CONDITIONAL APPROVE" :
  scorePct >= 35 ? "HIGH RISK — DECLINE RECOMMENDED" :
  "DECLINE"
}

Sum Chenda Capital Standards:
- Minimum composite score to approve: 65/100
- Cambodia / Southeast Asia private credit market
- Collateral-first mandate, LTV cap 65%
`;

  async function send() {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a senior credit analyst at Sum Chenda Capital, a private lending firm in Phnom Penh, Cambodia. You specialize in borrower credit assessment for secured private lending across Southeast Asia.

Use the scoring data provided to generate professional credit analysis. Be direct, specific, and actionable. Flag key risks. Recommend conditions where appropriate. Write like a senior credit professional would.

${dealContext}`,
          messages: [...messages.filter(m => m.role !== "system"), { role: "user", content: msg }]
        })
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "assistant", content: data.content?.[0]?.text || "Error." }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  }

  const totalScoreColor = scorePct >= 65 ? GREEN : scorePct >= 50 ? GOLD : RED;

  return (
    <div style={{ minHeight: "100vh", background: "#080E1A", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#E0E8F0" }}>
      <div style={{ background: "#0D1626", borderBottom: "1px solid #1A2A40", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: GOLD, fontWeight: 800, letterSpacing: 3 }}>SUM CHENDA CAPITAL</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF" }}>🎯 AI Borrower Assessment</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#445577" }}>Composite Score</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: totalScoreColor }}>{totalScore}/{maxScore}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 70px)", overflow: "hidden" }}>
        {/* Left: Scoring Panel */}
        <div style={{ width: 360, flexShrink: 0, background: "#0D1626", borderRight: "1px solid #1A2A40", padding: "20px 20px", overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "#445577", fontWeight: 800, letterSpacing: 2, marginBottom: 14 }}>BORROWER DETAILS</div>
          <input placeholder="Borrower Name" value={borrowerName} onChange={e => setBorrowerName(e.target.value)}
            style={{ width: "100%", background: "#080E1A", border: "1px solid #2A3A55", color: "#E0E8F0", padding: "9px 12px", borderRadius: 8, fontSize: 13, marginBottom: 10, boxSizing: "border-box", fontFamily: "inherit", outline: "none" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, color: "#445577", marginBottom: 4, fontWeight: 700, letterSpacing: 1 }}>LOAN (USD)</div>
              <input type="number" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))}
                style={{ width: "100%", background: "#080E1A", border: "1px solid #2A3A55", color: GOLD, padding: "9px 12px", borderRadius: 8, fontSize: 13, boxSizing: "border-box", fontFamily: "inherit", outline: "none", fontWeight: 700 }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#445577", marginBottom: 4, fontWeight: 700, letterSpacing: 1 }}>LTV (%)</div>
              <input type="number" value={ltv} onChange={e => setLtv(Number(e.target.value))} min={0} max={100}
                style={{ width: "100%", background: "#080E1A", border: `1px solid ${ltv > 65 ? RED : "#2A3A55"}`, color: ltv > 65 ? RED : GOLD, padding: "9px 12px", borderRadius: 8, fontSize: 13, boxSizing: "border-box", fontFamily: "inherit", outline: "none", fontWeight: 700 }} />
            </div>
          </div>

          <div style={{ fontSize: 10, color: "#445577", fontWeight: 800, letterSpacing: 2, marginBottom: 14 }}>CREDIT SCORING</div>
          {CRITERIA.map(c => (
            <ScoreSlider key={c.key} criterion={c} value={scores[c.key]} onChange={v => setScore(c.key, v)} />
          ))}

          {/* Gauge */}
          <div style={{ background: "#080E1A", border: "1px solid #1A2A40", borderRadius: 14, padding: "16px 10px", marginTop: 8 }}>
            <div style={{ fontSize: 10, color: "#445577", fontWeight: 800, letterSpacing: 2, textAlign: "center", marginBottom: 8 }}>ASSESSMENT RESULT</div>
            <GaugeMeter score={totalScore} max={maxScore} />
            <div style={{ marginTop: 14 }}>
              {CRITERIA.map(c => {
                const pct2 = (scores[c.key] / c.max) * 100;
                const col = pct2 >= 75 ? GREEN : pct2 >= 50 ? GOLD : RED;
                return (
                  <div key={c.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: "#7A8EAA" }}>{c.label.split(" ").slice(0, 2).join(" ")}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 60, height: 4, background: "#1A2A40", borderRadius: 999 }}>
                        <div style={{ width: `${pct2}%`, height: "100%", background: col, borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: 11, color: col, fontWeight: 700, minWidth: 28 }}>{scores[c.key]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: AI Chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            {messages.map((m, i) => {
              const isAI = m.role === "assistant";
              return (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 16, flexDirection: isAI ? "row" : "row-reverse" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: isAI ? "#1B2A4A" : "#1A2A40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, border: `1px solid ${isAI ? GOLD + "66" : "#2A3A55"}` }}>
                    {isAI ? "🎯" : "SC"}
                  </div>
                  <div style={{ background: isAI ? "#0D1E30" : "#1A2A40", border: `1px solid ${isAI ? "#1A3A50" : "#2A3A55"}`, borderRadius: isAI ? "4px 14px 14px 14px" : "14px 4px 14px 14px", padding: "12px 16px", maxWidth: "80%", fontSize: 13, color: "#D0DCF0", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                    {m.content}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1B2A4A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, border: `1px solid ${GOLD}66` }}>🎯</div>
                <div style={{ background: "#0D1E30", border: "1px solid #1A3A50", borderRadius: "4px 14px 14px 14px", padding: "12px 16px", fontSize: 13, color: "#7A8EAA" }}>Analysing borrower...</div>
              </div>
            )}
          </div>

          <div style={{ padding: "0 24px 10px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Generate credit assessment", "Main risks?", "Approve or decline?", "Suggested conditions", "IC memo summary"].map(p => (
              <button key={p} onClick={() => setInput(p)} style={{ background: "#0D1626", border: "1px solid #2A3A55", color: "#7A8EAA", padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>{p}</button>
            ))}
          </div>

          <div style={{ padding: "10px 24px 20px", borderTop: "1px solid #1A2A40", display: "flex", gap: 10 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask about this borrower's creditworthiness..."
              style={{ flex: 1, background: "#0D1626", border: "1px solid #2A3A55", color: "#E0E8F0", padding: "12px 16px", borderRadius: 10, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            <button onClick={send} disabled={loading || !input.trim()} style={{ background: loading ? "#1A2A40" : `linear-gradient(135deg, ${GOLD}, #E8C97A)`, border: "none", color: "#0D1020", padding: "12px 22px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>
              {loading ? "..." : "Assess"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
