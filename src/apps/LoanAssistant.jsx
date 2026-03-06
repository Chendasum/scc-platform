import { useState, useRef, useEffect } from "react";

const GOLD = "#C9A84C";
const NAVY = "#1B2A4A";

function formatUSD(n) {
  if (!n || isNaN(n)) return "$0";
  return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function Stat({ label, value, sub, highlight }) {
  return (
    <div style={{
      background: highlight ? "linear-gradient(135deg, #1A2E18, #1E3820)" : "#0D1626",
      border: `1px solid ${highlight ? "#4CAF8244" : "#1A2A40"}`,
      borderRadius: 12, padding: "16px 18px"
    }}>
      <div style={{ fontSize: 10, color: "#7A8EAA", fontWeight: 700, letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: highlight ? "#4CAF82" : GOLD, margin: "5px 0 2px" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#445577" }}>{sub}</div>}
    </div>
  );
}

function Slider({ label, min, max, step, value, onChange, format }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "#7A8EAA", fontWeight: 700, letterSpacing: 1 }}>{label}</span>
        <span style={{ fontSize: 13, color: GOLD, fontWeight: 800 }}>{format ? format(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: GOLD, cursor: "pointer" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#2A3A55", marginTop: 2 }}>
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
}

function ChatBubble({ role, content, typing }) {
  const isAI = role === "assistant";
  return (
    <div style={{
      display: "flex", gap: 10, marginBottom: 16,
      flexDirection: isAI ? "row" : "row-reverse"
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        background: isAI ? NAVY : "#1A2A40",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, border: `1px solid ${isAI ? GOLD + "66" : "#2A3A55"}`
      }}>
        {isAI ? "⚡" : "SC"}
      </div>
      <div style={{
        background: isAI ? "#0D1E30" : "#1A2A40",
        border: `1px solid ${isAI ? "#1A3A50" : "#2A3A55"}`,
        borderRadius: isAI ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
        padding: "12px 16px", maxWidth: "80%",
        fontSize: 13, color: "#D0DCF0", lineHeight: 1.65,
        whiteSpace: "pre-wrap"
      }}>
        {typing ? <span style={{ opacity: 0.6 }}>Analysing deal<span className="dots">...</span></span> : content}
      </div>
    </div>
  );
}

export default function LoanStructuringAssistant() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [rate, setRate] = useState(18);
  const [term, setTerm] = useState(12);

  const [originationFee, setOriginationFee] = useState(2);
  const [repaymentType, setRepaymentType] = useState("Bullet");
  const [collateralValue, setCollateralValue] = useState(850000);

  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hello. I'm your AI Loan Structuring Assistant for Sum Chenda Capital.\n\nAdjust the deal parameters on the left, then ask me anything:\n• \"Is this deal structured correctly?\"\n• \"What's the risk profile on this deal?\"\n• \"How can I improve the yield?\"\n• \"Generate a deal summary for my IC memo\""
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  // Calculated metrics
  const annualInterest = loanAmount * rate / 100;
  const monthlyInterest = annualInterest / 12;
  const originationIncome = loanAmount * originationFee / 100;
  const totalIncome = annualInterest * (term / 12) + originationIncome;
  const effectiveYield = (totalIncome / loanAmount) * (12 / term) * 100;
  const ltvCalc = (loanAmount / collateralValue) * 100;
  const ltvStatus = ltvCalc <= 65 ? "PASS" : ltvCalc <= 70 ? "REVIEW" : "FAIL";
  const monthlyPrincipal = repaymentType === "Amortizing" ? loanAmount / term : 0;
  const monthlyPayment = repaymentType === "Amortizing" ? monthlyInterest + monthlyPrincipal : monthlyInterest;

  const schedule = Array.from({ length: term }, (_, i) => {
    const month = i + 1;
    const opening = repaymentType === "Amortizing" ? loanAmount - monthlyPrincipal * i : loanAmount;
    const interest = opening * rate / 100 / 12;
    const principal = repaymentType === "Bullet" ? (month === term ? loanAmount : 0) : monthlyPrincipal;
    const total = interest + principal;
    return { month, opening, interest, principal, total };
  });

  const dealContext = `
CURRENT DEAL PARAMETERS:
- Loan Amount: $${loanAmount.toLocaleString()}
- Interest Rate: ${rate}% per annum
- Loan Term: ${term} months
- Repayment Type: ${repaymentType}
- Origination Fee: ${originationFee}%
- Collateral Value: $${collateralValue.toLocaleString()}
- Calculated LTV: ${ltvCalc.toFixed(1)}% (${ltvStatus})
- Annual Interest Income: $${annualInterest.toLocaleString()}
- Total Income over Term: $${Math.round(totalIncome).toLocaleString()}
- Effective Annualised Yield: ${effectiveYield.toFixed(1)}%
- Monthly Payment (Borrower): $${Math.round(monthlyPayment).toLocaleString()}

Sum Chenda Capital Standards:
- Max LTV: 65% (hard cap)
- Min Gross Yield: 15%
- Target Yield: 15-22%
- Min DSCR: 1.25x
- Market: Cambodia / Southeast Asia private credit
`;

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an expert private credit loan structuring assistant for Sum Chenda Capital, a private lending firm based in Phnom Penh, Cambodia. You specialize in secured lending, collateral control, and structured cashflow systems across Southeast Asia.

You have access to the current deal parameters and provide concise, professional analysis. Be direct and specific. Flag risks clearly. Use financial terminology appropriate for a sophisticated private credit operator. Keep responses focused and actionable — max 3-4 paragraphs unless generating a full IC memo or repayment schedule.

${dealContext}`,
          messages: [
            ...messages.filter(m => m.role !== "system"),
            { role: "user", content: userMsg }
          ]
        })
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Unable to generate response.";
      setMessages(m => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#080E1A",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#E0E8F0",
      display: "flex", flexDirection: "column"
    }}>
      {/* Header */}
      <div style={{
        background: "#0D1626", borderBottom: "1px solid #1A2A40",
        padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: 10, color: GOLD, fontWeight: 800, letterSpacing: 3 }}>SUM CHENDA CAPITAL</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF" }}>⚡ AI Loan Structuring Assistant</div>
        </div>
        <div style={{
          background: ltvStatus === "PASS" ? "#1A3A28" : ltvStatus === "REVIEW" ? "#2A2A10" : "#2E1A1A",
          border: `1px solid ${ltvStatus === "PASS" ? "#4CAF82" : ltvStatus === "REVIEW" ? "#C9A84C" : "#E05050"}`,
          color: ltvStatus === "PASS" ? "#4CAF82" : ltvStatus === "REVIEW" ? GOLD : "#E05050",
          padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 800
        }}>
          LTV {ltvCalc.toFixed(1)}% — {ltvStatus}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 70px)" }}>
        {/* Left Panel: Deal Parameters */}
        <div style={{
          width: 340, flexShrink: 0, background: "#0D1626",
          borderRight: "1px solid #1A2A40", padding: "20px 18px",
          overflowY: "auto"
        }}>
          <div style={{ fontSize: 10, color: "#445577", fontWeight: 800, letterSpacing: 2, marginBottom: 16 }}>DEAL PARAMETERS</div>

          <Slider label="LOAN AMOUNT" min={50000} max={2000000} step={10000}
            value={loanAmount} onChange={setLoanAmount} format={v => "$" + (v / 1000) + "K"} />
          <Slider label="COLLATERAL VALUE" min={50000} max={5000000} step={50000}
            value={collateralValue} onChange={setCollateralValue} format={v => "$" + (v / 1000) + "K"} />
          <Slider label="INTEREST RATE (% P.A.)" min={8} max={36} step={0.5}
            value={rate} onChange={setRate} format={v => v + "%"} />
          <Slider label="LOAN TERM (MONTHS)" min={1} max={36} step={1}
            value={term} onChange={setTerm} format={v => v + "m"} />
          <Slider label="ORIGINATION FEE (%)" min={0} max={5} step={0.25}
            value={originationFee} onChange={setOriginationFee} format={v => v + "%"} />

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#7A8EAA", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>REPAYMENT TYPE</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Bullet", "Amortizing"].map(t => (
                <button key={t} onClick={() => setRepaymentType(t)} style={{
                  flex: 1, padding: "9px 0", borderRadius: 8,
                  background: repaymentType === t ? GOLD : "#0A1220",
                  color: repaymentType === t ? "#0D1020" : "#7A8EAA",
                  border: `1px solid ${repaymentType === t ? GOLD : "#2A3A55"}`,
                  cursor: "pointer", fontSize: 12, fontWeight: 700
                }}>{t}</button>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div style={{ fontSize: 10, color: "#445577", fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>DEAL METRICS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Stat label="ANNUAL INCOME" value={formatUSD(annualInterest)} />
            <Stat label="TOTAL INCOME" value={formatUSD(totalIncome)} sub={`over ${term}m`} />
            <Stat label="EFF. YIELD" value={effectiveYield.toFixed(1) + "%"} highlight={effectiveYield >= 15} />
            <Stat label="MONTHLY PMT" value={formatUSD(monthlyPayment)} sub="borrower pays" />
          </div>

          {/* Mini schedule */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, color: "#445577", fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>REPAYMENT PREVIEW</div>
            <div style={{ background: "#080E1A", borderRadius: 10, overflow: "hidden", border: "1px solid #1A2A40" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "8px 10px", background: "#0A1220", fontSize: 9, color: "#445577", fontWeight: 800, letterSpacing: 1 }}>
                <span>MONTH</span><span>INTEREST</span><span>TOTAL DUE</span>
              </div>
              {schedule.slice(0, 6).map(r => (
                <div key={r.month} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "7px 10px", borderTop: "1px solid #111A28", fontSize: 11, color: "#A0B0C8" }}>
                  <span>M{r.month}</span>
                  <span>{formatUSD(r.interest)}</span>
                  <span style={{ color: r.principal > 0 ? GOLD : "#A0B0C8", fontWeight: r.principal > 0 ? 700 : 400 }}>{formatUSD(r.total)}</span>
                </div>
              ))}
              {term > 6 && <div style={{ padding: "6px 10px", fontSize: 10, color: "#2A3A55", borderTop: "1px solid #111A28" }}>+{term - 6} more months…</div>}
            </div>
          </div>
        </div>

        {/* Right Panel: AI Chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            {messages.map((m, i) => (
              <ChatBubble key={i} role={m.role} content={m.content} />
            ))}
            {loading && <ChatBubble role="assistant" typing />}
          </div>

          {/* Quick prompts */}
          <div style={{ padding: "0 24px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              "Analyse this deal structure",
              "Generate IC memo summary",
              "What's the risk profile?",
              "How to improve yield?",
              "Show full repayment schedule",
            ].map(p => (
              <button key={p} onClick={() => { setInput(p); }}
                style={{
                  background: "#0D1626", border: "1px solid #2A3A55", color: "#7A8EAA",
                  padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 600
                }}>{p}</button>
            ))}
          </div>

          <div style={{ padding: "12px 24px 20px", borderTop: "1px solid #1A2A40", display: "flex", gap: 10 }}>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask about this deal… (e.g. 'Is the LTV acceptable?')"
              style={{
                flex: 1, background: "#0D1626", border: "1px solid #2A3A55",
                color: "#E0E8F0", padding: "12px 16px", borderRadius: 10,
                fontSize: 13, outline: "none", fontFamily: "inherit"
              }} />
            <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
              background: loading ? "#1A2A40" : "linear-gradient(135deg, #C9A84C, #E8C97A)",
              border: "none", color: "#0D1020", padding: "12px 22px", borderRadius: 10,
              cursor: loading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 800
            }}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
