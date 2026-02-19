import { useState, useEffect, useCallback } from "react";

// ─── Styles ───────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; }

    body {
      background: #05080f;
      color: #e2e8f0;
      font-family: 'Manrope', sans-serif;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #05080f; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; } 50% { opacity: 0.35; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-8px); }
    }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes ticker {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    .card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      padding: 20px 22px;
      transition: border-color 0.25s, background 0.25s, transform 0.2s;
      cursor: default;
    }
    .card:hover {
      transform: translateY(-2px);
    }
    .skeleton {
      background: linear-gradient(90deg, #0f172a 25%, #1e293b 50%, #0f172a 75%);
      background-size: 400px 100%;
      animation: shimmer 1.4s infinite;
      border-radius: 8px;
    }
    .tab-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-family: 'Manrope', sans-serif;
      transition: all 0.2s;
    }
    .ticker-wrap {
      overflow: hidden;
      white-space: nowrap;
    }
    .ticker-inner {
      display: inline-flex;
      gap: 48px;
      animation: ticker 28s linear infinite;
    }
  `}</style>
);

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCENT = { hashtags: "#0ea5e9", skills: "#a78bfa", industries: "#34d399" };
const CATEGORIES = [
  { id: "hashtags",   label: "Trending Hashtags",     icon: "#️⃣" },
  { id: "skills",     label: "Skills in Demand",       icon: "⚡" },
  { id: "industries", label: "Top Industries Hiring",  icon: "🏢" },
];

const TICKER_ITEMS = [
  "#AIFirst", "#FutureOfWork", "#TechHiring2025", "Prompt Engineering ↑89%",
  "AI & ML: 48K roles", "#GrowthMindset", "Data Science ↑43%", "#OpenToWork",
  "#Leadership", "Cloud Architects in demand", "#Innovation", "FinTech ↑31%",
];

const SYSTEM_PROMPT = `You are a LinkedIn trends analyst. Return ONLY valid JSON, no markdown, no code fences.

For "hashtags": {"items":[{"tag":"#ExampleTag","posts":"12.4K posts","growth":"+34%","category":"Technology","momentum":"rising"}]} — 8 items.
For "skills":   {"items":[{"skill":"Prompt Engineering","demand":"Very High","growth":"+89%","salaryRange":"$95K–$180K","topHiringCompany":"Google"}]} — 8 items.
For "industries":{"items":[{"industry":"AI & Machine Learning","openRoles":"48,200","growth":"+23%","avgSalary":"$145K","hotRole":"ML Engineer"}]} — 8 items.

momentum values: "viral" | "rising" | "steady". Make data realistic for 2025.`;

// ─── Micro components ─────────────────────────────────────────────────────────
function SparkLine({ color }) {
  const pts = Array.from({ length: 9 }, (_, i) => ({
    x: i * 12,
    y: 18 - Math.random() * 12 + i * 1.2,
  }));
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${Math.max(2, Math.min(20, p.y))}`).join(" ");
  return (
    <svg width="104" height="24" viewBox="0 0 104 24" fill="none">
      <path d={d} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`${d} L 104 24 L 0 24 Z`} fill={color} opacity="0.08" />
    </svg>
  );
}

function Badge({ value }) {
  const up = value?.startsWith("+");
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.03em",
      color: up ? "#34d399" : "#f87171",
      background: up ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
      border: `1px solid ${up ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
      borderRadius: 5, padding: "2px 7px", display: "inline-flex", alignItems: "center", gap: 3,
    }}>
      {up ? "▲" : "▼"} {value}
    </span>
  );
}

function Dot({ momentum }) {
  const map = { viral: "#f59e0b", rising: "#34d399", steady: "#64748b" };
  const c = map[momentum] || "#64748b";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: c, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}`, display: "inline-block" }} />
      {momentum}
    </span>
  );
}

function Skeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 148, animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────────
function HashtagCard({ item, i }) {
  const c = ACCENT.hashtags;
  return (
    <div className="card" style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 55}ms` }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${c}55`; e.currentTarget.style.background = `${c}08`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", fontFamily: "'DM Mono', monospace", letterSpacing: "-0.02em" }}>{item.tag}</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{item.category}</div>
        </div>
        <Dot momentum={item.momentum} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>{item.posts}</span>
        <Badge value={item.growth} />
      </div>
      <SparkLine color={c} />
    </div>
  );
}

function SkillCard({ item, i }) {
  const c = ACCENT.skills;
  const demandColor = { "Very High": "#f59e0b", "High": "#34d399", "Medium": "#64748b" }[item.demand] || "#64748b";
  return (
    <div className="card" style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 55}ms` }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${c}55`; e.currentTarget.style.background = `${c}08`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", maxWidth: "68%", lineHeight: 1.3 }}>{item.skill}</div>
        <span style={{ fontSize: 10, fontWeight: 700, color: demandColor, background: `${demandColor}18`, border: `1px solid ${demandColor}40`, borderRadius: 4, padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.05em", height: "fit-content" }}>{item.demand}</span>
      </div>
      <div style={{ display: "flex", gap: 18, marginBottom: 10 }}>
        {[["Salary", item.salaryRange], ["Top Hirer", item.topHiringCompany]].map(([label, val]) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SparkLine color={c} />
        <Badge value={item.growth} />
      </div>
    </div>
  );
}

function IndustryCard({ item, i }) {
  const c = ACCENT.industries;
  return (
    <div className="card" style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 55}ms` }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${c}55`; e.currentTarget.style.background = `${c}08`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", maxWidth: "68%", lineHeight: 1.3 }}>{item.industry}</div>
        <Badge value={item.growth} />
      </div>
      <div style={{ display: "flex", gap: 18, marginBottom: 10 }}>
        {[["Open Roles", item.openRoles, c], ["Avg Salary", item.avgSalary, null], ["Hot Role", item.hotRole, null]].map(([label, val, col]) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: col || "#94a3b8" }}>{val}</div>
          </div>
        ))}
      </div>
      <SparkLine color={c} />
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("hashtags");
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const fetchData = useCallback(async (category, force = false) => {
    if (cache[category] && !force) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Generate trending ${category} data for LinkedIn 2025. Return ONLY JSON.` }],
        }),
      });
      const json = await res.json();
      const raw = json.content?.[0]?.text || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setCache(p => ({ ...p, [category]: parsed.items || [] }));
      setUpdatedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch {
      setError("Could not load trend data. Check your API connection.");
    } finally {
      setLoading(false);
    }
  }, [cache]);

  useEffect(() => { fetchData(tab); }, [tab]);

  const handleRefresh = () => {
    setCache(p => { const n = { ...p }; delete n[tab]; return n; });
    setTimeout(() => fetchData(tab, true), 80);
  };

  const items = cache[tab] || [];
  const accent = ACCENT[tab];

  return (
    <>
      <GlobalStyles />

      {/* Ambient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -300, left: -200, width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${accent}0e 0%, transparent 65%)`, transition: "background 0.7s ease" }} />
        <div style={{ position: "absolute", bottom: -200, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 900, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>

        {/* ── Nav ── */}
        <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, backdropFilter: "blur(12px)", background: "rgba(5,8,15,0.8)", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "linear-gradient(135deg, #0077b5, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 15, color: "#fff" }}>in</div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "-0.03em", color: "#f1f5f9" }}>Mini<span style={{ color: accent, transition: "color 0.4s" }}>Trends</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: loading ? "#f59e0b" : "#34d399", display: "inline-block", animation: loading ? "pulse 1s infinite" : "none", boxShadow: `0 0 6px ${loading ? "#f59e0b" : "#34d399"}` }} />
            <span style={{ fontSize: 11, color: "#475569", fontFamily: "'DM Mono',monospace" }}>AI LIVE</span>
          </div>
        </nav>

        {/* ── Ticker ── */}
        <div style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "7px 0", overflow: "hidden" }}>
          <div className="ticker-wrap">
            <div className="ticker-inner">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
                <span key={i} style={{ fontSize: 11, color: "#334155", fontFamily: "'DM Mono',monospace", letterSpacing: "0.04em" }}>
                  <span style={{ color: accent, marginRight: 6 }}>◆</span>{t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Hero ── */}
        <div style={{ textAlign: "center", padding: "64px 24px 48px", animation: "fadeUp 0.6s ease both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "5px 14px", marginBottom: 24, fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 6px #34d399", display: "inline-block", animation: "pulse 2s infinite" }} />
            Powered by Claude AI · Updated in Real Time
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(36px,6vw,68px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 18, color: "#f8fafc" }}>
            LinkedIn<br />
            <span style={{ background: `linear-gradient(135deg, ${accent}, #0077b5)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", transition: "all 0.4s" }}>Mini Trends</span>
          </h1>
          <p style={{ fontSize: "clamp(14px,2vw,17px)", color: "#64748b", maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.7, fontWeight: 500 }}>
            AI-generated insights on what's trending across LinkedIn — hashtags, skills, and industries shaping the 2025 job market.
          </p>

          {/* Stats strip */}
          <div style={{ display: "inline-flex", gap: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", marginBottom: 0 }}>
            {[["8 Hashtags", "Tracked live"], ["8 Skills", "In demand"], ["8 Industries", "Hiring now"]].map(([val, sub], i) => (
              <div key={i} style={{ padding: "14px 24px", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none", textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne',sans-serif" }}>{val}</div>
                <div style={{ fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Trends Panel ── */}
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 20px 80px" }}>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 5, width: "fit-content", animation: "fadeUp 0.5s ease 0.2s both" }}>
            {CATEGORIES.map(cat => {
              const active = tab === cat.id;
              const c = ACCENT[cat.id];
              return (
                <button key={cat.id} className="tab-btn" onClick={() => setTab(cat.id)} style={{
                  padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                  color: active ? "#fff" : "#475569",
                  background: active ? c : "transparent",
                  boxShadow: active ? `0 2px 16px ${c}45` : "none",
                  display: "flex", alignItems: "center", gap: 7, transition: "all 0.22s",
                }}>
                  <span>{cat.icon}</span>{cat.label}
                </button>
              );
            })}
          </div>

          {/* Status bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, padding: "9px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, animation: "fadeUp 0.5s ease 0.25s both" }}>
            <span style={{ fontSize: 12, color: "#334155", fontFamily: "'DM Mono',monospace" }}>
              {loading ? "⚙ Generating AI insights..." : updatedAt ? `✓ Updated at ${updatedAt}` : "Ready"}
            </span>
            <button onClick={handleRefresh} disabled={loading} style={{
              background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7,
              padding: "5px 13px", fontSize: 11, color: "#475569", cursor: "pointer",
              fontFamily: "'Manrope',sans-serif", fontWeight: 700, letterSpacing: "0.05em",
              display: "flex", alignItems: "center", gap: 5, opacity: loading ? 0.45 : 1,
              transition: "opacity 0.2s",
            }}>
              <span style={{ display: "inline-block", animation: loading ? "spin 0.9s linear infinite" : "none" }}>↻</span>
              REFRESH
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 12, padding: "14px 18px", color: "#f87171", fontSize: 13, marginBottom: 18 }}>
              ⚠ {error}
            </div>
          )}

          {/* Cards grid */}
          {loading && items.length === 0 ? <Skeleton /> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 14 }}>
              {items.map((item, i) =>
                tab === "hashtags"   ? <HashtagCard   key={i} item={item} i={i} /> :
                tab === "skills"     ? <SkillCard     key={i} item={item} i={i} /> :
                                       <IndustryCard  key={i} item={item} i={i} />
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 5, background: "linear-gradient(135deg,#0077b5,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 11, color: "#fff" }}>in</div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: "#334155" }}>MiniTrends</span>
          </div>
          <span style={{ fontSize: 11, color: "#1e293b", fontFamily: "'DM Mono',monospace" }}>
            AI-POWERED LINKEDIN INTELLIGENCE · 2025
          </span>
        </footer>
      </div>
    </>
  );
}
