# Sum Chenda Capital — Private Credit Platform

A complete web platform for Sum Chenda Capital containing 4 AI-powered tools.

## Apps Included
- 📋 **Deal Tracker** — manage all active and pipeline deals
- ⚡ **Loan Structuring Assistant** — AI-powered deal modelling
- 📊 **Investor Dashboard** — fund reporting and cashflow tracking  
- 🎯 **Borrower Assessment** — AI credit scoring tool

---

## DEPLOY TO VERCEL (10 minutes, free)

### Step 1 — Create GitHub account
Go to github.com → Sign up (free)

### Step 2 — Upload this folder to GitHub
1. Click **"New repository"**
2. Name it: `scc-platform`
3. Set to **Private**
4. Click **"uploading an existing file"**
5. Drag the entire contents of this folder → Click **"Commit changes"**

### Step 3 — Deploy on Vercel
1. Go to **vercel.com** → Sign up with your GitHub account
2. Click **"Add New Project"**
3. Select your `scc-platform` repository
4. Vercel auto-detects React — just click **"Deploy"**
5. Wait ~2 minutes → Your app is live!

### Step 4 — Set your API key (for AI features)
1. In Vercel dashboard → Your project → **Settings** → **Environment Variables**
2. Add: `REACT_APP_ANTHROPIC_KEY` = your Anthropic API key
3. Redeploy

### Step 5 — Custom domain (optional)
In Vercel → Settings → Domains → Add `platform.sumchendacapital.com`

---

## RUN LOCALLY (for developers)

```bash
npm install
npm start
```
Open http://localhost:3000

---

## USING THE AI FEATURES

The Loan Structuring Assistant and Borrower Assessment Tool use the Anthropic Claude API.

To enable:
1. Get an API key at console.anthropic.com
2. Add to environment: REACT_APP_ANTHROPIC_KEY=sk-ant-...
3. The apps will automatically use it

Without the key, the sliders and calculators still work — only the AI chat is disabled.

---

## FILE STRUCTURE

```
scc-platform/
├── public/
│   └── index.html
├── src/
│   ├── App.js           ← Main navigation
│   ├── index.js         ← Entry point
│   └── apps/
│       ├── DealTracker.jsx
│       ├── LoanAssistant.jsx
│       ├── InvestorDashboard.jsx
│       └── BorrowerAssessment.jsx
├── package.json
├── vercel.json
└── README.md
```

---

Built for Sum Chenda Capital | Phnom Penh, Cambodia | 2026
