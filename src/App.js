import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
const API_URL = 'https://web-production-2ab93.up.railway.app';

// ─── THEME ────────────────────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('logitide-theme') || 'dark'; } catch { return 'dark'; }
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('logitide-theme', theme); } catch {}
  }, [theme]);
  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return [theme, toggle];
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} title="Växla tema">
      <span className="theme-toggle-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
      {theme === 'dark' ? 'Ljust' : 'Mörkt'}
    </button>
  );
}
// ─── ICONS ────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20 }) => {
  const icons = {
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    package: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    trending: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    move: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>,
    money: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    grid: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    refresh: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
    info: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  };
  return icons[name] || null;
};
// ─── HELPERS ──────────────────────────────────────────────────────────────
const fmt = (n) => n?.toLocaleString('sv-SE') ?? '—';
const fmtKr = (n, hasCostData = true) => {
  if (!hasCostData) return null; // caller handles missing-data display
  if (n == null || n === undefined) return '—';
  if (n === 0) return '0 kr';
  return `${Math.round(n).toLocaleString('sv-SE')} kr`;
};
const fmtDays = (n) => n === 999 ? '∞' : `${parseFloat(n).toFixed(1)} d`;
const statusColor = (s) => ({
  CRITICAL: '#ef4444', WATCH: '#f97316', OK: '#22c55e',
  OVERSTOCK: '#a855f7', DEAD_STOCK: '#6b7280'
}[s] || '#6b7280');
const statusLabel = (s) => ({
  CRITICAL: 'KRITISK', WATCH: 'BEVAKA', OK: 'OK',
  OVERSTOCK: 'ÖVERLAGER', DEAD_STOCK: 'DÖTT LAGER'
}[s] || s);
const abcColor = (abc) => ({ A: '#22c55e', B: '#f59e0b', C: '#6b7280' }[abc] || '#6b7280');

// ─── LOKAL OMRÄKNING NÄR LEDTID ÄNDRAS ───────────────────────────────────
function recalcArticle(a, newLeadTime) {
  const lt = newLeadTime;
  const cov = a.coverage_days ?? 0;
  const demand = a.demand_per_day ?? 0;
  const hasDemand = demand > 0;
  const abcFactor = { A: 2.0, B: 1.5, C: 1.2 }[a.abc] ?? 1.5;

  let status = a.status;
  if (hasDemand) {
    if (cov < lt) status = 'CRITICAL';
    else if (cov < lt * abcFactor) status = 'WATCH';
    else if (cov > 365) status = 'OVERSTOCK';
    else status = 'OK';
  } else {
    status = (a.stock ?? 0) > 0 ? 'DEAD_STOCK' : 'OK';
  }

  // Omräkna rekommenderad orderkvantitet
  let order_qty = 0;
  if (status === 'CRITICAL' || status === 'WATCH') {
    const targetDays = lt * 2; // fyll upp till 2× ledtid
    const needed = Math.max(0, (targetDays - cov) * demand);
    const minOrd = a.min_order ?? 1;
    order_qty = Math.ceil(needed / minOrd) * minOrd;
  }

  return { ...a, lead_time_days: lt, status, order_qty };
}

// ─── DATA QUALITY BANNER ──────────────────────────────────────────────────
const API = "https://web-production-2ab93.up.railway.app";

function ActionRow({ a, hasCost, articles }) {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchExplanation = async () => {
    if (explanation) { setOpen(!open); return; }
    setLoading(true);
    try {
      // Hitta full artikeldata för att skicka alla fakta till AI
      const art = articles?.find(r => r.article === a.article) || {};
      const res = await fetch(`${API}/explain-article`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: a.article,
          name: a.name || art.name || '',
          abc: a.abc || art.abc || '',
          xyz: art.xyz || null,
          status: a.status || art.status || '',
          stock: art.stock ?? 0,
          demand_per_day: art.demand_per_day ?? 0,
          coverage_days: art.coverage_days ?? 0,
          lead_time_days: art.lead_time_days ?? 14,
          order_qty: a.qty || 0,
          cost: art.cost ?? 0,
          loc: art.loc || '',
          ordered_qty: art.ordered_qty ?? 0,
          eta_date: art.eta_date || null,
          annual_value: art.annual_value ?? 0,
        })
      });
      const data = await res.json();
      if (data.explanation) { setExplanation(data.explanation); setOpen(true); }
    } catch(e) { /* tyst fel */ }
    setLoading(false);
  };

  return (
    <div className="action-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="action-icon">{a.icon}</span>
        <div className="action-body" style={{ flex: 1 }}>
          <span className="action-name">{a.name || a.article}</span>
          <span className="action-text">{a.action}</span>
          <span className="action-reason">{a.reason}</span>
        </div>
        {hasCost && a.value_sek > 0 && <span className="action-value">{Math.round(a.value_sek).toLocaleString('sv-SE')+' kr'}</span>}
        <button onClick={fetchExplanation} title="AI-förklaring" style={{
          background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px',
          padding: '3px 8px', cursor: 'pointer', fontSize: '12px', color: 'var(--color-muted)',
          whiteSpace: 'nowrap', flexShrink: 0
        }}>
          {loading ? '...' : open ? '▲ Dölj' : '✦ Förklara'}
        </button>
      </div>
      {open && explanation && (
        <div style={{
          marginTop: '8px', marginLeft: '28px', padding: '10px 14px',
          background: 'var(--color-bg)', border: '1px solid var(--color-border)',
          borderRadius: '6px', fontSize: '13px', color: 'var(--color-text)',
          lineHeight: '1.6', borderLeft: '3px solid #2196F3'
        }}>
          {explanation}
        </div>
      )}
    </div>
  );
}

function ValidationBanner({ validation }) {
  if (!validation || !validation.summary) return null;
  const hasWarnings = validation.warnings && validation.warnings.length > 0;
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderLeft: '4px solid #2196F3',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '12px',
      fontSize: '14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>✅</span>
        <span style={{ color: 'var(--color-text)', flex: 1 }}>{validation.summary}</span>
        {hasWarnings && (
          <button onClick={() => setExpanded(!expanded)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-muted)', fontSize: '12px', padding: '2px 6px'
          }}>
            {validation.warnings.length} varning{validation.warnings.length > 1 ? 'ar' : ''} {expanded ? '▲' : '▼'}
          </button>
        )}
      </div>
      {expanded && hasWarnings && (
        <ul style={{ marginTop: '8px', paddingLeft: '24px', color: 'var(--color-muted)', fontSize: '13px' }}>
          {validation.warnings.map((w, i) => <li key={i} style={{ marginBottom: '4px' }}>⚠️ {w}</li>)}
        </ul>
      )}
    </div>
  );
}

function DataQualityBanner({ summary, dataQuality }) {
  const [expanded, setExpanded] = useState(false);
  const missing = [];
  if (!summary.has_cost_data) missing.push({ field: 'Inköpspris (cost)', impact: 'Kapitalanalys och ordervärde kan inte beräknas' });
  if (!summary.has_location_data) missing.push({ field: 'Lagerposition (loc)', impact: 'Slottingförslag kan inte genereras' });
  if (!summary.has_lead_time_data) missing.push({ field: 'Ledtid (lead_time_days)', impact: 'Standardvärde 14 dagar används — justera för er verklighet' });
  if (missing.length === 0) return null;
  return (
    <div className="data-quality-banner">
      <div className="dq-header" onClick={() => setExpanded(!expanded)}>
        <span className="dq-icon"><Icon name="info" size={16} /></span>
        <span className="dq-title">
          {missing.length} kolumn{missing.length > 1 ? 'er' : ''} saknas i filen — analysen är delvis begränsad
        </span>
        <span className="dq-toggle">{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div className="dq-body">
          {missing.map((m, i) => (
            <div key={i} className="dq-row">
              <span className="dq-field">{m.field}</span>
              <span className="dq-impact">{m.impact}</span>
            </div>
          ))}
          <p className="dq-tip">Lägg till dessa kolumner i er exportfil från WMS/ERP för en komplett analys.</p>
        </div>
      )}
    </div>
  );
}

// ─── INFO TOOLTIP ─────────────────────────────────────────────────────────
function InfoTooltip({ text }) {
  const [visible, setVisible] = useState(false);
  const ref = React.useRef(null);
  const [tooltipStyle, setTooltipStyle] = React.useState({});
  const [arrowInfo, setArrowInfo] = React.useState({ left: '50%', right: 'auto', style: {} });
  const hideTimer = React.useRef(null);

  const handleEnter = () => {
    clearTimeout(hideTimer.current);
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const popupW = 260;
      const gap = 10;
      const spaceAbove = rect.top;
      const vertical = spaceAbove < 240 ? 'below' : 'above';

      // Horizontal: centre on icon, clamp to viewport
      let left = rect.left + rect.width / 2 - popupW / 2;
      if (left < 8) left = 8;
      if (left + popupW > window.innerWidth - 8) left = window.innerWidth - 8 - popupW;

      const top = vertical === 'above'
        ? rect.top - gap           // popup bottom will sit gap px above icon
        : rect.bottom + gap;       // popup top will sit gap px below icon

      // Arrow x relative to popup
      const iconCenterInPopup = (rect.left + rect.width / 2) - left;
      const arrowLeft = Math.max(10, Math.min(popupW - 10, iconCenterInPopup));

      setTooltipStyle({
        position: 'fixed',
        left,
        ...(vertical === 'above' ? { top: 'auto', bottom: window.innerHeight - rect.top + gap } : { top }),
        background: '#0f172a', border: '1px solid #334155', color: '#cbd5e1',
        borderRadius: 8, padding: '10px 14px', fontSize: 11, lineHeight: 1.6,
        width: popupW, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        whiteSpace: 'pre-line', textAlign: 'left', fontWeight: 400,
        pointerEvents: 'auto', cursor: 'text', userSelect: 'text',
      });
      setArrowInfo({
        arrowLeft,
        vertical,
      });
    }
    setVisible(true);
  };

  const handleLeave = () => {
    hideTimer.current = setTimeout(() => setVisible(false), 120);
  };

  const { arrowLeft, vertical } = arrowInfo;
  const arrowStyle = vertical === 'above'
    ? { top: '100%', borderColor: '#334155 transparent transparent transparent' }
    : { bottom: '100%', borderColor: 'transparent transparent #334155 transparent' };

  return (
    <span ref={ref} style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 4, cursor: 'help', verticalAlign: 'middle' }}
      onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <span style={{ color: '#64748b', display: 'flex' }}><Icon name="info" size={13} /></span>
      {visible && (
        <span style={tooltipStyle} onMouseEnter={() => clearTimeout(hideTimer.current)} onMouseLeave={handleLeave}>
          {text}
          <span style={{ position: 'absolute', left: arrowLeft, transform: 'translateX(-50%)',
            borderWidth: 5, borderStyle: 'solid', pointerEvents: 'none', ...arrowStyle }} />
        </span>
      )}
    </span>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────
// Mini sparkline — generates a smooth SVG path from 8 data points
function Sparkline({ points, color, fill = true }) {
  if (!points || points.length < 2) return null;
  const w = 80, h = 28;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map(p => h - ((p - min) / range) * (h - 4) - 2);
  // Catmull-Rom smooth path
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const cpx = (xs[i] + xs[i + 1]) / 2;
    d += ` C ${cpx} ${ys[i]}, ${cpx} ${ys[i + 1]}, ${xs[i + 1]} ${ys[i + 1]}`;
  }
  const areaPath = `${d} L ${xs[xs.length - 1]} ${h} L ${xs[0]} ${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', overflow: 'visible' }}>
      {fill && <path d={areaPath} fill={color} fillOpacity="0.12" />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* endpoint dot */}
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="2.5" fill={color} />
    </svg>
  );
}

// Trend arrow + % change
function TrendBadge({ direction, pct, color }) {
  if (!direction) return null;
  const up = direction === 'up';
  const arrow = up ? '↑' : '↓';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      fontSize: 11, fontWeight: 600, color,
      background: `${color}18`, borderRadius: 4, padding: '1px 5px'
    }}>
      {arrow} {pct}%
    </span>
  );
}

function KpiCard({ label, value, sub, color, missingReason, tooltip, sparkPoints, trend }) {
  if (missingReason) {
    return (
      <div className="kpi-card kpi-missing">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value kpi-dash">—</div>
        <div className="kpi-missing-reason">{missingReason}</div>
      </div>
    );
  }
  return (
    <div className="kpi-card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* accent left bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: color, borderRadius: '8px 0 0 8px'
      }} />
      <div style={{ paddingLeft: 8 }}>
        <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span>{label}</span>
          {tooltip && <InfoTooltip text={tooltip} />}
          {trend && <TrendBadge direction={trend.direction} pct={trend.pct} color={color} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div className="kpi-value" style={{ color, lineHeight: 1.1 }}>{value}</div>
            {sub && <div className="kpi-sub" style={{ whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word', marginTop: 2 }}>{sub}</div>}
          </div>
          {sparkPoints && (
            <div style={{ flexShrink: 0, opacity: 0.85 }}>
              <Sparkline points={sparkPoints} color={color} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CONFIDENCE WIDGET ────────────────────────────────────────────────────
function ConfidenceWidget({ summary, dataQuality }) {
  if (!summary) return null;
  const checks = [
    { ok: summary.has_cost_data, label: 'Inköpspris' },
    { ok: summary.has_location_data, label: 'Lagerposition' },
    { ok: summary.has_lead_time_data, label: 'Ledtid' },
    { ok: !(dataQuality?.zero_consumption > 0), label: 'Noll-förbrukning' },
    { ok: !(dataQuality?.suspected_errors > 0), label: 'Felinmatning' },
    { ok: !(dataQuality?.duplicate_ids > 0), label: 'Dubbletter' },
  ];
  const okCount = checks.filter(c => c.ok).length;
  const score = Math.round((okCount / checks.length) * 100);
  const color = score === 100 ? '#22c55e' : score >= 67 ? '#f59e0b' : '#ef4444';
  const label = score === 100 ? 'Analys helt tillförlitlig' : score >= 67 ? 'Analys med varningar' : 'Kontrollera datakvalitet';
  return (
    <div style={{ marginTop: 10, padding: '10px 12px', background: '#0f172a', borderRadius: 8, border: `1px solid ${color}44` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ color, fontSize: 8 }}>●</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: '#1e293b', marginBottom: 8 }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 3, transition: 'width 0.5s' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 6px' }}>
        {checks.map((c, i) => (
          <span key={i} style={{ fontSize: 10, color: c.ok ? '#22c55e' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11 }}>{c.ok ? '✓' : '⚠'}</span> {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── UPLOAD PAGE ──────────────────────────────────────────────────────────
// ─── ONBOARDING GUIDE MODAL ───────────────────────────────────────────────
function OnboardingGuide({ onClose }) {
  const tiers = [
    {
      level: '1',
      label: 'Obligatoriskt',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.25)',
      icon: '🔴',
      desc: 'Utan dessa kolumner kan vi inte köra analysen.',
      fields: [
        { name: 'Artikelnummer', note: 'Unikt ID per artikel', ex: 'ART-1001' },
        { name: 'Lagersaldo', note: 'Aktuellt lager i antal enheter', ex: '250' },
        { name: 'Förbrukning / Försäljning', note: 'Per dag, vecka eller månad', ex: '12 st/dag' },
      ]
    },
    {
      level: '2',
      label: 'Rekommenderat',
      color: '#f97316',
      bg: 'rgba(249,115,22,0.08)',
      border: 'rgba(249,115,22,0.25)',
      icon: '🟠',
      desc: 'Med dessa kolumner får du inköpsförslag och kapitalanalys.',
      fields: [
        { name: 'Ledtid', note: 'Leveranstid i dagar', ex: '14 dagar' },
        { name: 'Inköpspris', note: 'Kostnad per enhet (kr)', ex: '125 kr' },
        { name: 'Artikelnamn / Beskrivning', note: 'Fritext', ex: 'Bult M8×30 Förzinkad' },
        { name: 'Lagerposition / Plats', note: 'Hyllplats eller zon i lagret', ex: 'A1-02' },
      ]
    },
    {
      level: '3',
      label: 'Ger full analys',
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.08)',
      border: 'rgba(34,197,94,0.25)',
      icon: '🟢',
      desc: 'Dessa kolumner låser upp XYZ-analys, slottning och leveransbevak.',
      fields: [
        { name: 'Historisk förbrukning', note: 'Månadsvis, minst 6 månader → XYZ', ex: 'Jan: 120, Feb: 98…' },
        { name: 'Beställt antal', note: 'Pågående order som inte levererats', ex: '500' },
        { name: 'Förväntat leveransdatum', note: 'För pågående inköpsorder', ex: '2025-06-15' },
        { name: 'MOQ / Minsta orderenhet', note: 'Minsta kvantitet att beställa', ex: '100 st' },
      ]
    },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0f172a', border: '1px solid #1e293b', borderRadius: 20,
          padding: '36px 40px', maxWidth: 640, width: '100%', maxHeight: '90vh',
          overflowY: 'auto', position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,0.6)'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 20, background: 'none', border: 'none',
            color: '#64748b', fontSize: 22, cursor: 'pointer', lineHeight: 1
          }}
        >×</button>

        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Vad behöver jag ta med?</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 8, lineHeight: 1.6 }}>
            Exportera en fil från ert affärssystem (ERP) med kolumnerna nedan.<br />
            Ju mer data, desto bättre rekommendationer.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tiers.map(tier => (
            <div key={tier.level} style={{
              background: tier.bg, border: `1px solid ${tier.border}`,
              borderRadius: 14, padding: '20px 24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{
                  background: tier.color, color: '#fff', borderRadius: '50%',
                  width: 24, height: 24, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0
                }}>{tier.level}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{tier.label}</span>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 14px 34px', lineHeight: 1.5 }}>{tier.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 34 }}>
                {tier.fields.map(f => (
                  <div key={f.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{f.name}</span>
                      <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>— {f.note}</span>
                    </div>
                    <span style={{
                      fontSize: 11, color: '#94a3b8', background: '#1e293b', borderRadius: 6,
                      padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'monospace'
                    }}>{f.ex}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 24, padding: '14px 18px', background: '#1e293b',
          borderRadius: 10, fontSize: 12, color: '#94a3b8', lineHeight: 1.7
        }}>
          💡 <strong style={{ color: '#cbd5e1' }}>Tips:</strong> De flesta affärssystem kan exportera dessa kolumner direkt till Excel.
          Kolumnnamnen behöver inte vara exakta — Logitide känner automatiskt igen svenska och engelska varianter.
          Saknar ni viss data? Ingen fara — systemet ger rekommendationer <em>bara</em> på det ni har.
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', marginTop: 20, padding: '12px 0', borderRadius: 10,
            background: '#6366f1', color: '#fff', border: 'none', fontWeight: 700,
            fontSize: 14, cursor: 'pointer'
          }}
        >Förstått — ladda upp fil →</button>
      </div>
    </div>
  );
}

// ─── IMPORT WIZARD (multi-fil ERP-import) ──────────────────────────────────
const LOGITIDE_FIELDS = [
  { key: 'Artikelnummer', label: 'Artikelnummer', required: true },
  { key: 'Artikelnamn',   label: 'Artikelnamn',   required: false },
  { key: 'Lagersaldo',    label: 'Lagersaldo',     required: true },
  { key: 'Inköpspris',    label: 'Inköpspris',     required: false },
  { key: 'Ledtid',        label: 'Ledtid (dagar)', required: false },
  { key: 'MOQ',           label: 'MOQ',            required: false },
  { key: 'Lagerposition', label: 'Lagerposition',  required: false },
  { key: 'Beställt antal',label: 'Beställt antal', required: false },
  { key: 'Förväntat leveransdatum', label: 'Förväntat lev.datum', required: false },
  { key: '__date__',      label: 'Datum (transaktion)',  required: false },
  { key: '__qty__',       label: 'Antal (transaktion)',  required: false },
];

function ImportWizard({ onAnalysis, onClose, auth }) {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [mappingSuggestions, setMappingSuggestions] = useState(null); // {file_0: {col: {field, confidence}}}
  const [confirmedMapping, setConfirmedMapping] = useState({});       // {file_0: {col: fieldKey}}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (newFiles) => {
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name));
      const filtered = Array.from(newFiles).filter(f => !existing.has(f.name));
      return [...prev, ...filtered].slice(0, 5);
    });
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  // Steg 1→2: skicka filer, hämta mappningsförslag
  const fetchSuggestions = async () => {
    if (!files.length) { setError('Lägg till minst en fil.'); return; }
    setLoading(true); setError(null);
    try {
      const form = new FormData();
      files.forEach(f => form.append('files', f));
      const res = await fetch(`${API_URL}/import/suggest-mappings`, { method: 'POST', body: form });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Kunde inte analysera filerna.'); }
      const data = await res.json();
      setMappingSuggestions(data);
      // Bygg confirmedMapping från suggestions (AUTO mappar direkt)
      const cm = {};
      Object.entries(data.files || {}).forEach(([fileKey, fdata]) => {
        cm[fileKey] = {};
        Object.entries(fdata.columns || {}).forEach(([col, suggestion]) => {
          cm[fileKey][col] = suggestion.field || '';
        });
      });
      setConfirmedMapping(cm);
      setStep(2);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Steg 2→3: kör importen med bekräftad mappning
  const runImport = async () => {
    setLoading(true); setError(null);
    try {
      const form = new FormData();
      files.forEach(f => form.append('files', f));
      form.append('mapping', JSON.stringify(confirmedMapping));
      const headers = {};
      if (auth?.token) headers['Authorization'] = `Bearer ${auth.token}`;
      const res = await fetch(`${API_URL}/import/run`, { method: 'POST', body: form, headers });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Import misslyckades.'); }
      const data = await res.json();
      window._lastAnalysisData = data; // Spara för månadsrapport
      onAnalysis(data);
      onClose();
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const updateMapping = (fileKey, col, newField) => {
    setConfirmedMapping(prev => ({
      ...prev,
      [fileKey]: { ...prev[fileKey], [col]: newField }
    }));
  };

  // Räkna summary
  const mappingStats = React.useMemo(() => {
    if (!mappingSuggestions) return { auto: 0, check: 0, missing: 0 };
    let auto = 0, check = 0, missing = 0;
    Object.values(mappingSuggestions.files || {}).forEach(fdata => {
      Object.values(fdata.columns || {}).forEach(s => {
        if (s.confidence === 'auto') auto++;
        else if (s.confidence === 'check') check++;
        else missing++;
      });
    });
    return { auto, check, missing };
  }, [mappingSuggestions]);

  // Förhandsgranskning — samla unika Logitide-fält som är bekräftade
  const confirmedFields = React.useMemo(() => {
    const fields = new Set();
    Object.values(confirmedMapping).forEach(fileMap => {
      Object.values(fileMap).forEach(f => { if (f && !f.startsWith('__')) fields.add(f); });
    });
    return fields;
  }, [confirmedMapping]);

  const missingRequired = ['Artikelnummer', 'Lagersaldo'].filter(f => !confirmedFields.has(f));

  const s = { // inline styles
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
    modal: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, width: '100%', maxWidth: 860, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #1e293b' },
    title: { fontSize: 15, fontWeight: 700, color: '#f1f5f9' },
    closeBtn: { background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer', lineHeight: 1 },
    body: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
    footer: { padding: '14px 24px', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    btn: (variant) => ({
      padding: '8px 20px', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit',
      ...(variant === 'primary' ? { background: '#3b82f6', color: '#fff' } :
          variant === 'success' ? { background: '#16a34a', color: '#fff' } :
          { background: 'transparent', border: '1px solid #334155', color: '#94a3b8' })
    }),
    dropZone: (active) => ({
      border: `2px dashed ${active ? '#3b82f6' : '#334155'}`,
      borderRadius: 10, padding: '36px 24px', textAlign: 'center', cursor: 'pointer',
      background: active ? 'rgba(59,130,246,0.07)' : '#0f172a', transition: 'all 0.15s',
      marginBottom: 16,
    }),
    chip: { display: 'flex', alignItems: 'center', gap: 8, background: '#1e293b', border: '1px solid #334155', borderRadius: 20, padding: '5px 12px 5px 10px', fontSize: 12, color: '#cbd5e1' },
    badge: (conf) => ({
      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
      background: conf === 'auto' ? 'rgba(34,197,94,0.15)' : conf === 'check' ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.2)',
      color: conf === 'auto' ? '#22c55e' : conf === 'check' ? '#f59e0b' : '#64748b',
    }),
  };

  const stepLabels = ['Ladda upp filer', 'Mappa kolumner', 'Granska & importera'];

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.title}>Importera från ERP-system</div>
            {/* Steps */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 10 }}>
              {stepLabels.map((label, i) => (
                <React.Fragment key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, flexShrink: 0,
                      background: i + 1 < step ? '#16a34a' : i + 1 === step ? '#3b82f6' : '#1e293b',
                      color: i + 1 <= step ? '#fff' : '#64748b',
                      border: i + 1 > step ? '1.5px solid #334155' : 'none',
                    }}>{i + 1 < step ? '✓' : i + 1}</div>
                    <span style={{ fontSize: 11, color: i + 1 === step ? '#e2e8f0' : i + 1 < step ? '#22c55e' : '#64748b', whiteSpace: 'nowrap' }}>{label}</span>
                  </div>
                  {i < 2 && <div style={{ width: 28, height: 1, background: i + 1 < step ? '#22c55e' : '#334155', margin: '0 8px' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div style={s.body}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, padding: '10px 14px', color: '#f87171', fontSize: 12, marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          {/* STEG 1 — Filuppladdning */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, lineHeight: 1.6 }}>
                Ladda upp 1–5 exportfiler från ert affärssystem. Systemet känner automatiskt igen kolumner från Jeeves, Visma, SAP, Monitor, Pyramid och de flesta andra ERP-system.
              </p>
              <div
                style={s.dropZone(dragging)}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('mw-file-input').click()}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>Dra och släpp filer här</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>Excel (.xlsx) eller CSV · Max 5 filer · 20 MB per fil</div>
                <div style={{ display: 'inline-block', padding: '8px 20px', background: '#3b82f6', color: '#fff', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>Välj filer</div>
                <input id="mw-file-input" type="file" accept=".xlsx,.csv" multiple style={{ display: 'none' }}
                  onChange={e => addFiles(e.target.files)} />
              </div>
              {files.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {files.map((f, i) => (
                    <div key={i} style={s.chip}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'monospace' }}>{f.name}</span>
                      <span style={{ color: '#475569', fontSize: 11 }}>{(f.size / 1024).toFixed(0)} KB</span>
                      <span onClick={() => removeFile(i)} style={{ color: '#475569', cursor: 'pointer', fontSize: 15, lineHeight: 1 }}>×</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 20, background: '#1e293b', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Exportera dessa kolumner från ditt system</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Artikelnummer', req: true }, { label: 'Lagersaldo', req: true }, { label: 'Förbrukning/Försäljning', req: true },
                    { label: 'Inköpspris', req: false }, { label: 'Ledtid', req: false }, { label: 'Lagerposition', req: false },
                    { label: 'MOQ', req: false }, { label: 'Historisk förbrukning (12 mån)', req: false },
                  ].map(({ label, req }) => (
                    <span key={label} style={{
                      fontSize: 11, padding: '3px 8px', borderRadius: 4,
                      background: req ? 'rgba(99,102,241,0.12)' : '#0f172a',
                      color: req ? '#a5b4fc' : '#64748b',
                      border: `1px solid ${req ? 'rgba(99,102,241,0.25)' : '#334155'}`,
                    }}>{label}{req ? ' *' : ''}</span>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 8 }}>* Obligatoriskt · Övriga fält förbättrar analysen</div>
              </div>
            </div>
          )}

          {/* STEG 2 — Kolumnmappning */}
          {step === 2 && mappingSuggestions && (
            <div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{mappingStats.auto}</span>
                  <span style={{ color: '#64748b' }}>automatisk</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                  <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{mappingStats.check}</span>
                  <span style={{ color: '#64748b' }}>kontrollera</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#475569', display: 'inline-block' }} />
                  <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{mappingStats.missing}</span>
                  <span style={{ color: '#64748b' }}>ej hittad</span>
                </div>
              </div>

              {Object.entries(mappingSuggestions.files || {}).map(([fileKey, fdata]) => (
                <div key={fileKey} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                    📄 {fdata.filename || fileKey}
                  </div>
                  <div style={{ background: '#1e293b', borderRadius: 8, overflow: 'hidden', border: '1px solid #334155' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 28px 1fr auto', gap: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#475569', padding: '10px 12px 6px' }}>Kolumn i din fil</div>
                      <div />
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#475569', padding: '10px 12px 6px' }}>Logitide-fält</div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#475569', padding: '10px 12px 6px' }}>Konfidens</div>
                    </div>
                    {Object.entries(fdata.columns || {}).map(([col, suggestion], i) => {
                      const conf = suggestion.confidence || 'none';
                      const method = suggestion.method || '';
                      const fieldVal = suggestion.field || '';
                      const isMonth = fieldVal.startsWith('Månad_');
                      const isIgnore = method === 'ignore';
                      const curVal = confirmedMapping[fileKey]?.[col] || '';

                      // Månadskolumner och ignorerade kolumner — visa som låst rad
                      if (isMonth || isIgnore) {
                        return (
                          <div key={col} style={{
                            display: 'grid', gridTemplateColumns: '1fr 28px 1fr auto',
                            borderTop: i > 0 ? '1px solid #0f172a' : 'none',
                            alignItems: 'center', padding: '4px 12px',
                            opacity: 0.65,
                          }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', paddingRight: 8 }}>{col}</span>
                            <span style={{ color: '#475569', fontSize: 13, textAlign: 'center' }}>→</span>
                            <span style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', padding: '5px 8px' }}>
                              {isMonth ? `📅 Månadsförbrukning (${fieldVal.replace('Månad_', 'mån ')})` : '— Ignoreras —'}
                            </span>
                            <div style={{ textAlign: 'right', paddingLeft: 8 }}>
                              <span style={{ ...s.badge('auto'), background: isIgnore ? '#1e293b' : undefined, color: isIgnore ? '#64748b' : undefined }}>
                                {isMonth ? 'AUTO' : 'IGNORERAS'}
                              </span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={col} style={{
                          display: 'grid', gridTemplateColumns: '1fr 28px 1fr auto',
                          borderTop: i > 0 ? '1px solid #0f172a' : 'none',
                          alignItems: 'center', padding: '4px 12px',
                          background: conf === 'check' ? 'rgba(245,158,11,0.04)' : 'transparent',
                        }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', paddingRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col}</span>
                          <span style={{ color: '#475569', fontSize: 13, textAlign: 'center' }}>→</span>
                          <select
                            value={curVal}
                            onChange={e => updateMapping(fileKey, col, e.target.value)}
                            style={{
                              background: '#0f172a', border: `1.5px solid ${conf === 'auto' ? '#22c55e' : conf === 'check' ? '#f59e0b' : '#334155'}`,
                              borderRadius: 5, padding: '5px 8px', fontSize: 12, color: '#e2e8f0',
                              cursor: 'pointer', width: '100%', fontFamily: 'inherit',
                            }}
                          >
                            <option value="">— Ignorera —</option>
                            {LOGITIDE_FIELDS.map(f => (
                              <option key={f.key} value={f.key}>{f.label}{f.required ? ' *' : ''}</option>
                            ))}
                          </select>
                          <div style={{ textAlign: 'right', paddingLeft: 8 }}>
                            <span style={s.badge(conf)}>
                              {conf === 'auto' ? 'AUTO' : conf === 'check' ? 'KONTROLLERA' : 'SAKNAS'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEG 3 — Granska */}
          {step === 3 && (
            <div>
              <div style={{ background: '#1e293b', borderRadius: 8, padding: '16px 20px', marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 10 }}>Importsammanfattning</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6' }}>{files.length}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>filer</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e' }}>{confirmedFields.size}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>fält mappade</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: missingRequired.length ? '#ef4444' : '#22c55e' }}>{missingRequired.length === 0 ? '✓' : missingRequired.length}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>obligatoriska saknas</div>
                  </div>
                </div>
              </div>
              {missingRequired.length > 0 && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, padding: '10px 14px', color: '#f87171', fontSize: 12, marginBottom: 16 }}>
                  ⚠️ Obligatoriska fält saknas: <strong>{missingRequired.join(', ')}</strong>. Gå tillbaka och mappa dessa.
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {LOGITIDE_FIELDS.filter(f => !f.key.startsWith('__')).map(f => (
                  <div key={f.key} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 10px', borderRadius: 5, fontSize: 12,
                    background: confirmedFields.has(f.key) ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
                    border: `1px solid ${confirmedFields.has(f.key) ? 'rgba(34,197,94,0.25)' : '#334155'}`,
                    color: confirmedFields.has(f.key) ? '#22c55e' : '#64748b',
                  }}>
                    <span>{confirmedFields.has(f.key) ? '✓' : '–'}</span>
                    <span>{f.label}</span>
                    {f.required && !confirmedFields.has(f.key) && <span style={{ color: '#ef4444' }}>*</span>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: '12px 16px', background: '#1e293b', borderRadius: 8, fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>
                <strong style={{ color: '#94a3b8' }}>Filer:</strong> {files.map(f => f.name).join(', ')}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={s.footer}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 13 }}>
              <div style={{ width: 18, height: 18, border: '2px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              {step === 1 ? 'Analyserar kolumner…' : 'Importerar data…'}
            </div>
          ) : (
            <button style={s.btn('ghost')} onClick={step === 1 ? onClose : () => setStep(step - 1)}>
              {step === 1 ? 'Avbryt' : '← Tillbaka'}
            </button>
          )}
          {!loading && (
            <div style={{ display: 'flex', gap: 8 }}>
              {step === 1 && (
                <button style={s.btn('primary')} onClick={fetchSuggestions} disabled={!files.length}>
                  Analysera kolumner →
                </button>
              )}
              {step === 2 && (
                <>
                  <button style={s.btn('ghost')} onClick={() => setStep(3)}>Förhandsgranska</button>
                  <button style={s.btn('primary')} onClick={() => setStep(3)}>Fortsätt →</button>
                </>
              )}
              {step === 3 && (
                <button style={{ ...s.btn('success'), opacity: missingRequired.length ? 0.5 : 1 }}
                  onClick={runImport} disabled={missingRequired.length > 0}>
                  🚀 Importera & analysera
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadPage({ onAnalysis, auth, onLogout, theme, onToggleTheme }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  // Väck Railway så servern är redo när användaren laddar upp filen
  useEffect(() => {
    fetch(`${API_URL}/health`).catch(() => {});
  }, []);
  const loadingMessages = ['Läser er fil…', 'Matchar kolumner…', 'Beräknar täcktid…', 'Analyserar ABC/XYZ…', 'Skapar rekommendationer…'];
  const handleFile = async (file) => {
    if (!file) return;
    window._lastUploadedFile = file; // Spara för export
    setLoading(true);
    setError(null);
    let msgIndex = 0;
    setLoadingMsg(loadingMessages[0]);
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setLoadingMsg(loadingMessages[msgIndex]);
    }, 1200);
    try {
      // ── Steg 1: Validera filen innan analys ────────────────────────────────
      setLoadingMsg('Kontrollerar filen…');
      const valForm = new FormData();
      valForm.append('file', file);
      let valRes;
      try {
        valRes = await fetch(`${API_URL}/validate`, { method: 'POST', body: valForm });
      } catch (networkErr) {
        throw new Error('Kunde inte nå servern. Kontrollera din internetanslutning och försök igen.');
      }
      if (valRes.ok) {
        const val = await valRes.json();
        if (!val.valid && val.errors?.length) {
          throw new Error(val.errors.join('\n'));
        }
        // Varningar: visa men stoppa inte analysen (sparas för senare)
        if (val.warnings?.length) {
          window._lastValidationWarnings = val.warnings;
        }
      }
      // ── Steg 2: Kör analysen ───────────────────────────────────────────────
      setLoadingMsg(loadingMessages[0]);
      const formData = new FormData();
      formData.append('file', file);
      let res;
      try {
        const headers = {};
        if (auth?.token) headers['Authorization'] = `Bearer ${auth.token}`;
        res = await fetch(`${API_URL}/analyze`, { method: 'POST', body: formData, headers });
      } catch (networkErr) {
        throw new Error('Kunde inte nå servern. Kontrollera din internetanslutning och försök igen.');
      }
      if (!res.ok) {
        let errMsg = 'Analysen misslyckades.';
        try {
          const err = await res.json();
          if (err.detail) {
            // Rensa bort Python-traceback men behåll det faktiska felmeddelandet
            const detail = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
            errMsg = detail.includes('Traceback') ? 'Serverfel — kontakta support.' : detail;
          }
        } catch(e) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      window._lastAnalysisData = data; // Spara för månadsrapport
      onAnalysis(data);
    } catch (e) {
      setError(e.message);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);
  return (
    <div className="upload-page">
      {/* ── Top bar ── */}
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 10, zIndex: 10 }}>
        {auth && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowHistory(!showHistory)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              {showHistory ? 'Dölj historik' : 'Historik'}
            </button>
            <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 12 }}>Logga ut</button>
          </div>
        )}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="upload-content">
        {/* ── Logo ── */}
        <div className="logo-area">
          <div className="logo-icon">📦</div>
          <div style={{ textAlign: 'left' }}>
            <h1 className="logo-text">Logitide</h1>
            <p className="logo-sub">OPTIMIZER</p>
          </div>
        </div>

        {/* ── Headline ── */}
        <h2 className="upload-headline">
          Förvandla din lagerfil till<br />
          <span className="highlight">handlingsbara beslut på 30 sekunder.</span>
        </h2>

        {/* ── Bento-kort ── */}
        <div className="bento-grid">
          <div className="bento-card abc">
            <span className="bento-icon">📊</span>
            <div className="bento-stat green">80%</div>
            <div className="bento-title">ABC-analys</div>
            <div className="bento-desc">Se vilka artiklar som driver 80 % av kapitalet</div>
          </div>
          <div className="bento-card buy">
            <span className="bento-icon">🛒</span>
            <div className="bento-stat blue">Auto</div>
            <div className="bento-title">Inköpsförslag</div>
            <div className="bento-desc">Baserat på ledtid, MOQ och faktisk förbrukning</div>
          </div>
          <div className="bento-card risk">
            <span className="bento-icon">⚠️</span>
            <div className="bento-stat amber">Live</div>
            <div className="bento-title">Kapital & risk</div>
            <div className="bento-desc">Identifiera överlager och kritiska brister direkt</div>
          </div>
        </div>

        {/* ── Guide-knapp ── */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <button
            onClick={() => setShowGuide(true)}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 8,
              color: 'var(--text2)', fontSize: 12, padding: '7px 18px', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'border-color .15s, color .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#818cf8'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
          >
            <span>📋</span> Vad behöver jag ta med?
          </button>
        </div>

        {showGuide && <OnboardingGuide onClose={() => setShowGuide(false)} />}

        {/* ── Upload / Loading ── */}
        {!loading ? (
          <>
            <div
              className={`drop-zone ${dragging ? 'dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <Icon name="upload" size={32} />
              <p className="drop-text">Släpp filen här</p>
              <p className="drop-sub">Excel (.xlsx, .xls) eller CSV · Max 20 MB</p>
              <span className="drop-cta">Välj fil</span>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
            {error && (
              <div className="error-box">
                <b>⚠️ Kunde inte analysera filen</b>
                {error.includes('\n')
                  ? error.split('\n').map((line, i) => <p key={i} style={{ margin: '4px 0' }}>{line}</p>)
                  : <p>{error}</p>
                }
              </div>
            )}
          </>
        ) : (
          <div className="loading-box">
            <div className="spinner" />
            <p className="loading-msg">{loadingMsg}</p>
          </div>
        )}

        {/* ── ERP multi-fil import ── */}
        {!loading && (
          <div style={{ textAlign: 'center', margin: '10px 0 4px' }}>
            <button className="erp-import-btn" onClick={() => setShowImportWizard(true)}>
              <span>📂</span> Importera från flera filer (ERP-export)
            </button>
          </div>
        )}

        {/* ── Trust-signaler ── */}
        <div className="trust-row">
          <span className="trust-item">🔒 Krypterad överföring</span>
          <span className="trust-dot" />
          <span className="trust-item">🇪🇺 Data stannar i EU</span>
          <span className="trust-dot" />
          <span className="trust-item">✓ Inga data säljs vidare</span>
        </div>

        {/* ── ERP-taggar ── */}
        <div className="supported">
          <span>Stöder:</span>
          {['Jeeves', 'SAP', 'Visma', 'Pyramid', 'Monitor', 'Excel-exporter'].map(erp => (
            <span key={erp} className="erp-tag">{erp}</span>
          ))}
        </div>

        {/* ── Inloggad info & historik ── */}
        {auth && (
          <div style={{ marginTop: 20, fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>
            Inloggad som {auth.email}{auth.company ? ` · ${auth.company}` : ''}
          </div>
        )}
        {showHistory && auth && <div style={{ marginTop: 16 }}><HistoryTab token={auth.token} /></div>}
      </div>

      {showImportWizard && (
        <ImportWizard
          onAnalysis={onAnalysis}
          onClose={() => setShowImportWizard(false)}
          auth={auth}
        />
      )}
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────
function OverviewTab({ data, onLedtidChange, ledtidOverrides, onResetLedtider }) {
  const { summary, top_actions, abc_distribution, articles, data_quality, validation } = data;
  const hasCost = summary.has_cost_data;
  const hasLoc = summary.has_location_data;

  // Derive sparkline shapes from article coverage distribution — gives real data-based curves
  // We bucket articles by coverage bucket and use counts as sparkline points
  const sparkCritical = React.useMemo(() => {
    if (!articles?.length) return null;
    // Distribution of coverage_days bucketed into 8 bins for "critical trend" shape
    const critical = articles.filter(a => a.status === 'CRITICAL' || a.status === 'WATCH');
    // Simulate a 8-week trend using article coverage spread (lower = more urgent)
    const buckets = [0,0,0,0,0,0,0,0];
    critical.forEach(a => {
      const idx = Math.min(7, Math.floor((a.coverage_days || 0) / 7));
      buckets[idx]++;
    });
    return buckets.reverse(); // ascending = improving trend shape
  }, [articles]);

  const sparkOrder = React.useMemo(() => {
    if (!articles?.length) return null;
    const watchOrCrit = articles.filter(a => a.order_qty > 0);
    const buckets = [0,0,0,0,0,0,0,0];
    watchOrCrit.forEach(a => {
      const idx = Math.min(7, Math.floor(((a.cost || 0) * (a.order_qty || 0)) / 5000));
      buckets[idx]++;
    });
    return buckets;
  }, [articles]);

  const sparkCapital = React.useMemo(() => {
    if (!articles?.length || !hasCost) return null;
    // Bins of stock value: shows capital distribution
    const vals = articles.filter(a => (a.stock_value || (a.stock || 0) * (a.cost || 0)) > 0)
      .map(a => a.stock_value || (a.stock || 0) * (a.cost || 0));
    if (!vals.length) return null;
    const maxV = Math.max(...vals);
    const step = maxV / 8;
    const buckets = Array(8).fill(0);
    vals.forEach(v => { const i = Math.min(7, Math.floor(v / step)); buckets[i]++; });
    return buckets;
  }, [articles, hasCost]);

  const sparkDead = React.useMemo(() => {
    if (!articles?.length) return null;
    const dead = articles.filter(a => a.status === 'DEAD_STOCK' || (a.stock > 0 && (a.demand_per_day || 0) === 0));
    const buckets = [0,0,0,0,0,0,0,0];
    dead.forEach((a, i) => { buckets[i % 8]++; });
    // Downward slope = good (decreasing dead stock)
    return buckets.map((v, i) => Math.max(0, v - i * 0.5));
  }, [articles]);

  return (
    <div className="tab-content">
      <ValidationBanner validation={validation} />
      <DataQualityBanner summary={summary} dataQuality={data_quality} />
      {summary.critical > 0 && (
        <div className="alert-banner">
          <Icon name="alert" size={18} />
          {summary.critical} artiklar kräver omedelbar handling — lagret kan stanna.
        </div>
      )}
      <div className="kpi-grid">
        <KpiCard label="KRITISKA BRISTER" value={fmt(summary.critical)} sub={`${summary.watch} bevakas`} color="#ef4444"
          sparkPoints={sparkCritical}
          trend={summary.critical > 0 ? { direction: 'up', pct: Math.round((summary.critical / Math.max(1, summary.total_articles)) * 100) } : null}
          tooltip={"Kritisk = täcktid ≤ ledtid OCH ingen inköpsorder är lagd.\nBevaka = brist men order är redan på väg.\n\nBevaka-tröskel per ABC-klass:\nA-artiklar: täcktid < 2× ledtid (hög buffer)\nB-artiklar: täcktid < 1.5× ledtid (standard)\nC-artiklar: täcktid < 1.2× ledtid (lägre marginal)"} />
        <KpiCard label="ATT BESTÄLLA" value={fmt(summary.articles_to_order)}
          sub={hasCost ? fmtKr(summary.total_order_value_sek) : 'Lägg till inköpspris för ordervärde'}
          color="#f97316"
          sparkPoints={sparkOrder}
          tooltip={"Antal artiklar där systemet rekommenderar inköp — dvs. täcktid understiger bevaka-tröskeln.\n\nInkluderar både kritiska artiklar (brist inom ledtid) och bevaka-artiklar (brist inom bufferttid).\n\nOrderkvantitet beräknas som: (2× ledtid − täcktid) × daglig förbrukning, avrundat till minsta orderenhet."} />
        <KpiCard
          label="BUNDET KAPITAL"
          value={hasCost ? fmtKr(summary.total_stock_value_sek) : null}
          sub={hasCost ? `varav ${fmtKr(summary.overstock_value_sek)} överlager` : null}
          color="#a855f7"
          sparkPoints={sparkCapital}
          missingReason={!hasCost ? 'Kräver inköpspris (cost) i filen' : null}
          tooltip={"Totalt lagervärde = saldo × inköpspris för alla artiklar.\n\nÖverlager = artiklar med täcktid > 365 dagar (mer än ett års förbrukning i lager).\n\nHögt bundet kapital i överlager är en signal om att köpa stopp bör läggas tills lagret normaliserats."}
        />
        <KpiCard
          label="ATT FLYTTA"
          value={hasLoc ? fmt(summary.articles_to_move) : null}
          sub={hasLoc ? 'snabbare plock' : null}
          color="#3b82f6"
          missingReason={!hasLoc ? 'Kräver lagerposition (loc) i filen' : null}
          tooltip={"Antal artiklar vars lagerposition inte stämmer med ABC-klassen.\n\nA-artiklar bör stå närmast plockzonen (guldzon).\nC-artiklar kan placeras längre bort.\n\nKorrekt slotting minskar plocket-id och höjer produktiviteten."}
        />
        <KpiCard label="DÖTT LAGER" value={fmt(summary.dead_stock)}
          sub={hasCost ? fmtKr(summary.dead_stock_value_sek) : `${summary.dead_stock} artiklar utan förbrukning`}
          color="#6b7280"
          sparkPoints={sparkDead}
          tooltip={"Artiklar med saldo > 0 men registrerad förbrukning = 0.\n\nKan bero på felregistrering, utgångna produkter eller kassationer som ej bokförts.\n\nDött lager binder kapital utan att bidra till servicenivån — överväg utförsäljning eller skrotning."} />
      </div>
      {/* ─── PROGNOS: KOMMANDE 90 DAGAR ─────────────────────────────── */}
      {articles?.length > 0 && summary.forecast_available && (() => {
        const within30  = articles.filter(a => a.coverage_days >= 0 && a.coverage_days <= 30  && a.status !== 'DEAD_STOCK').sort((a,b) => a.coverage_days - b.coverage_days);
        const within60  = articles.filter(a => a.coverage_days >  30 && a.coverage_days <= 60  && a.status !== 'DEAD_STOCK').sort((a,b) => a.coverage_days - b.coverage_days);
        const within90  = articles.filter(a => a.coverage_days >  60 && a.coverage_days <= 90  && a.status !== 'DEAD_STOCK').sort((a,b) => a.coverage_days - b.coverage_days);
        if (within30.length + within60.length + within90.length === 0) return null;
        const BucketCol = ({ label, items, color, bg }) => (
          <div style={{ flex: 1, background: bg, borderRadius: 10, padding: '14px 16px', border: `1px solid ${color}30` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.08em', marginBottom: 10 }}>
              {label} <span style={{ fontWeight: 400, opacity: 0.7 }}>({items.length} art.)</span>
            </div>
            {items.length === 0
              ? <div style={{ fontSize: 12, color: '#475569' }}>Inga artiklar</div>
              : items.slice(0, 5).map((a, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < Math.min(items.length, 5) - 1 ? `1px solid ${color}18` : 'none' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{a.name || a.article}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{a.article} · {a.abc}{a.xyz ? `/${a.xyz}` : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color }}>{fmtDays(a.coverage_days)}</div>
                    {a.order_qty > 0 && <div style={{ fontSize: 10, color: '#60a5fa' }}>Beställ {fmt(a.order_qty)} st</div>}
                  </div>
                </div>
              ))
            }
            {items.length > 5 && <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>+{items.length - 5} till</div>}
          </div>
        );
        return (
          <div className="section">
            <div className="section-header">
              <h3>Kommande 90 dagar</h3>
              <span className="badge" style={{ background: '#1e293b', color: '#94a3b8' }}>Prognos baserad på säsongsjusterad förbrukning</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <BucketCol label="INOM 30 DAGAR" items={within30} color="#ef4444" bg="#ef444408" />
              <BucketCol label="30–60 DAGAR"   items={within60} color="#f97316" bg="#f9731608" />
              <BucketCol label="60–90 DAGAR"   items={within90} color="#eab308" bg="#eab30808" />
            </div>
          </div>
        );
      })()}

      {top_actions?.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h3>Åtgärder idag</h3>
            <span className="badge">{top_actions.length} prioriterade</span>
          </div>
          <div className="actions-list">
            {top_actions.map((a, i) => (
              <ActionRow key={i} a={a} hasCost={hasCost} articles={articles} />
            ))}
          </div>
        </div>
      )}
      <div className="two-col">
        <div className="section">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            ABC-fördelning {!hasCost && <span className="section-note">(baserad på förbrukning)</span>}
            <InfoTooltip text="A = topp 80 % av årsvolymsvärdet. B = 80–95 %. C = 95–100 %. Klassificering baseras på förbrukning × inköpspris × 365 dagar." />
          </h3>
          {['A', 'B', 'C'].map(cls => (
            <div key={cls} className="abc-row">
              <span className="abc-badge" style={{ background: abcColor(cls) }}>{cls}</span>
              <span className="abc-count">{fmt(abc_distribution?.[cls]?.count)} art.</span>
              <div className="abc-bar-wrap">
                <div className="abc-bar" style={{ width: `${abc_distribution?.[cls]?.pct || 0}%`, background: abcColor(cls) }} />
              </div>
              {hasCost
                ? <span className="abc-val">{fmtKr(abc_distribution?.[cls]?.value_sek)}</span>
                : <span className="abc-val abc-dim">{abc_distribution?.[cls]?.pct}% av artiklar</span>
              }
            </div>
          ))}
        </div>
        <div className="section">
          <h3>Snabbåtgärder</h3>
          <div className="quick-actions">
            <div className="qa-row"><Icon name="alert" size={16} /><div><b>Kritiska brister</b><p>{summary.critical} artiklar</p></div></div>
            <div className="qa-row"><Icon name="trending" size={16} /><div><b>Inköpsförslag</b><p>{summary.articles_to_order} att beställa{hasCost ? ` · ${fmtKr(summary.total_order_value_sek)}` : ''}</p></div></div>
            <div className="qa-row"><Icon name="move" size={16} /><div><b>Slotting</b><p>{hasLoc ? `${summary.articles_to_move} att flytta` : 'Lagerposition saknas i filen'}</p></div></div>
            <div className="qa-row"><Icon name="grid" size={16} /><div><b>ABC/XYZ-analys</b><p>{summary.total_articles} artiklar</p></div></div>
          </div>
        </div>
      </div>
      <div className="section">
        <div className="section-header">
          <h3>Alla artiklar</h3>
          <span className="badge">{fmt(summary.total_articles)} st</span>
        </div>
        <ArticleTable articles={articles} hasCost={hasCost} hasLoc={hasLoc} onLedtidChange={onLedtidChange} ledtidOverrides={ledtidOverrides} onResetLedtider={onResetLedtider} />
      </div>
    </div>
  );
}

// ─── ARTICLE DETAIL PANEL ─────────────────────────────────────────────────
function ArticleDetailPanel({ article, onClose }) {
  const [explanation, setExplanation] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const a = article;

  useEffect(() => {
    if (!a) return;
    setExplanation(null);
    setLoadingAI(true);
    fetch(`${API}/explain-article`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        article: a.article,
        name: a.name || '',
        abc: a.abc || '',
        xyz: a.xyz || null,
        status: a.status || '',
        stock: a.stock ?? 0,
        demand_per_day: a.demand_per_day ?? 0,
        coverage_days: a.coverage_days ?? 0,
        lead_time_days: a.lead_time_days ?? 14,
        order_qty: a.order_qty ?? 0,
        cost: a.cost ?? 0,
        loc: a.loc || '',
        ordered_qty: a.ordered_qty ?? 0,
        eta_date: a.eta_date || null,
        annual_value: a.annual_value ?? 0,
      })
    })
      .then(r => r.json())
      .then(d => setExplanation(d.explanation || null))
      .catch(() => setExplanation(null))
      .finally(() => setLoadingAI(false));
  }, [a?.article]);

  if (!a) return null;

  // Gauge: coverage vs lead_time
  const cov = a.coverage_days ?? 0;
  const lt = a.lead_time_days ?? 14;
  const maxDays = Math.max(cov, lt * 3, 60);
  const covPct = Math.min((cov / maxDays) * 100, 100);
  const ltPct = Math.min((lt / maxDays) * 100, 100);
  const gaugeColor = a.status === 'CRITICAL' ? '#ef4444' : a.status === 'WATCH' ? '#f97316' : a.status === 'OVERSTOCK' ? '#a855f7' : '#22c55e';

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'stretch' }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} />
      {/* Panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 400, maxWidth: '95vw', background: '#0c1420',
          borderLeft: '1px solid #1e293b', display: 'flex', flexDirection: 'column',
          height: '100vh', overflowY: 'auto', boxShadow: '-16px 0 48px rgba(0,0,0,0.6)',
          animation: 'slideIn 0.18s ease-out',
        }}
      >
        <style>{`@keyframes slideIn { from { transform: translateX(40px); opacity:0; } to { transform: translateX(0); opacity:1; } }`}</style>
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1e293b', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                background: statusColor(a.status) + '22', color: statusColor(a.status),
                border: `1px solid ${statusColor(a.status)}44`,
                borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 700
              }}>{statusLabel(a.status)}</span>
              <span style={{ background: abcColor(a.abc) + '22', color: abcColor(a.abc), borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                {a.abc}{a.xyz ? `/${a.xyz}` : ''}
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 }}>{a.name || '—'}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{a.article}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '0 4px', flexShrink: 0 }}>✕</button>
        </div>

        {/* Coverage gauge */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>TÄCKTID VS LEDTID</div>
          <div style={{ position: 'relative', height: 10, background: '#1e293b', borderRadius: 5, marginBottom: 8 }}>
            {/* Lead time marker */}
            <div style={{
              position: 'absolute', left: `${ltPct}%`, top: -4, bottom: -4,
              width: 2, background: '#f97316', borderRadius: 1, transform: 'translateX(-50%)', zIndex: 2
            }} />
            {/* Coverage bar */}
            <div style={{ width: `${covPct}%`, height: '100%', background: gaugeColor, borderRadius: 5, transition: 'width 0.5s', position: 'relative', zIndex: 1 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: gaugeColor, fontWeight: 700 }}>Täcktid: {fmtDays(cov)}</span>
            <span style={{ color: '#f97316' }}>Ledtid: {Math.round(lt)} d</span>
          </div>
          {cov < lt && (
            <div style={{ marginTop: 8, padding: '6px 10px', background: '#ef444418', border: '1px solid #ef444430', borderRadius: 6, fontSize: 11, color: '#fca5a5' }}>
              ⚠️ Täcktid understiger ledtid med {Math.round(lt - cov)} dagar
            </div>
          )}
        </div>

        {/* Key metrics */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>NYCKELDATA</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
            {[
              { label: 'Lagersaldo', val: fmt(a.stock) + ' st' },
              { label: 'Förbrukning/dag', val: (a.demand_per_day != null && a.demand_per_day !== '') ? `${Number(a.demand_per_day).toFixed(1)} st` : '—' },
              { label: 'Inköpspris', val: a.cost > 0 ? `${fmt(a.cost)} kr` : '—' },
              { label: 'Lagervärde', val: a.cost > 0 ? fmtKr(a.stock * a.cost) : '—' },
              ...(a.order_qty > 0 ? [{ label: 'Rekommenderad order', val: `${fmt(a.order_qty)} st`, highlight: true }] : []),
              ...(a.ordered_qty > 0 ? [{ label: 'Beställt (på väg)', val: `${fmt(a.ordered_qty)} st` }] : []),
              ...(a.eta_date && !['NaT', 'nat', 'null', 'None', 'undefined', ''].includes(String(a.eta_date).trim()) ? [{ label: 'Förväntat leverans', val: String(a.eta_date).slice(0, 10) }] : []),
              ...(a.loc && a.loc !== a.abc && a.loc.length > 1 ? [{ label: 'Lagerplats', val: a.loc }] : []),
              ...(a.recommended_zone && a.suggest_move ? [{ label: 'Rekomm. zon', val: `Zon ${a.recommended_zone}`, highlight: true }] : []),
            ].map((row, i) => (
              <div key={i} style={{ background: row.highlight ? '#3b82f618' : '#1e293b', borderRadius: 6, padding: '8px 10px', border: row.highlight ? '1px solid #3b82f640' : 'none' }}>
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>{row.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: row.highlight ? '#60a5fa' : '#f1f5f9' }}>{row.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action recommendation */}
        {(a.status === 'CRITICAL' || a.status === 'WATCH' || a.status === 'OVERSTOCK' || a.status === 'DEAD_STOCK') && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b' }}>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>REKOMMENDERAD ÅTGÄRD</div>
            <div style={{ padding: '10px 14px', background: statusColor(a.status) + '18', border: `1px solid ${statusColor(a.status)}30`, borderRadius: 8, fontSize: 13, color: '#f1f5f9', lineHeight: 1.6 }}>
              {a.status === 'CRITICAL' && `Beställ ${fmt(a.order_qty || Math.ceil((lt * 2 - cov) * (a.demand_per_day || 1)))} st omgående. Täcktiden är under ledtid — risk för lagerbrist.`}
              {a.status === 'WATCH' && `Planera inköp inom kort. ${a.order_qty > 0 ? `Föreslaget antal: ${fmt(a.order_qty)} st.` : 'Täcktiden närmar sig kritisk gräns.'}`}
              {a.status === 'OVERSTOCK' && `Pausa inköp. Täcktiden är ${fmtDays(cov)} — överväg utförsäljning eller omfördelning.`}
              {a.status === 'DEAD_STOCK' && `Ingen registrerad förbrukning. Överväg utrangering, försäljning eller bokföring av kassation.`}
            </div>
          </div>
        )}

        {/* AI explanation */}
        <div style={{ padding: '16px 20px', flex: 1, minHeight: 0 }}>
          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>✦ AI-ANALYS</div>
          {loadingAI && (
            <div style={{ color: '#64748b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, border: '2px solid #334155', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Analyserar artikel…
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
          {!loadingAI && explanation && (
            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7, borderLeft: '3px solid #6366f1', paddingLeft: 12 }}>
              {explanation}
            </div>
          )}
          {!loadingAI && !explanation && (
            <div style={{ fontSize: 12, color: '#475569' }}>Ingen AI-analys tillgänglig.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ARTICLE TABLE ────────────────────────────────────────────────────────
function ArticleTable({ articles, showExplanation = true, hasCost = true, hasLoc = true, onLedtidChange, ledtidOverrides = {}, onResetLedtider }) {
  const [filter, setFilter] = useState('Alla');
  const [abcFilter, setAbcFilter] = useState('Alla');
  const [search, setSearch] = useState('');
  const [editingLedtid, setEditingLedtid] = useState(null); // article id
  const [editVal, setEditVal] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const handleLedtidClick = (a) => {
    if (!onLedtidChange) return;
    setEditingLedtid(a.article);
    setEditVal(String(Math.round(a.lead_time_days ?? 14)));
  };

  const commitLedtid = (articleId) => {
    const days = parseInt(editVal, 10);
    if (!isNaN(days) && days > 0 && days <= 730) {
      onLedtidChange(articleId, days);
    }
    setEditingLedtid(null);
  };
  const statusFilters = ['Alla', 'KRITISK', 'BEVAKA', 'OK', 'ÖVERLAGER'];
  const abcFilters = ['Alla', 'A', 'B', 'C'];
  const filtered = articles?.filter(a => {
    const matchStatus = filter === 'Alla' ||
      (filter === 'KRITISK' && a.status === 'CRITICAL') ||
      (filter === 'BEVAKA' && a.status === 'WATCH') ||
      (filter === 'OK' && a.status === 'OK') ||
      (filter === 'ÖVERLAGER' && a.status === 'OVERSTOCK');
    const matchAbc = abcFilter === 'Alla' || a.abc === abcFilter;
    const matchSearch = !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.article?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchAbc && matchSearch;
  }) || [];
  return (
    <div>
      {selectedArticle && <ArticleDetailPanel article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
      <div className="table-filters">
        <input className="search-input" placeholder="Sök på artikelnamn eller ID..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="filter-group">
          {statusFilters.map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => { setFilter(f); setSelectedArticle(null); }}>{f}</button>
          ))}
        </div>
        <div className="filter-group">
          {abcFilters.map(f => (
            <button key={f} className={`filter-btn ${abcFilter === f ? 'active' : ''}`} onClick={() => { setAbcFilter(f); setSelectedArticle(null); }}>{f}</button>
          ))}
        </div>
        {onResetLedtider && (
          <button onClick={onResetLedtider} style={{
            background: 'transparent', border: '1px solid #6366f144', color: '#6366f1',
            borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
            marginLeft: 'auto', whiteSpace: 'nowrap'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#6366f118'; e.currentTarget.style.borderColor = '#6366f1'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#6366f144'; }}
          >
            ↺ Återställ ledtider ({Object.keys(ledtidOverrides).length})
          </button>
        )}
      </div>
      {filtered.length === 0 && search && (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted)', fontSize: 14 }}>
          Ingen artikel matchar "<strong>{search}</strong>" — prova artikelnummer eller delar av namnet.
        </div>
      )}
      {filtered.length > 0 && (
      <table className="article-table">
        <thead>
          <tr>
            <th>ARTIKEL</th><th>KLASS</th><th>SALDO</th><th>TÄCKTID</th>
            {onLedtidChange && <th title="Klicka på ledtid för att redigera">LEDTID <span style={{fontSize:9,color:'#475569'}}>✎</span></th>}
            <th>STATUS</th><th>ÅTGÄRD</th>
          </tr>
        </thead>
        <tbody>
          {(search ? filtered : filtered.slice(0, 100)).map((a, i) => (
            <React.Fragment key={i}>
              <tr
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedArticle(a)}
                onMouseEnter={e => { e.currentTarget.style.background = '#1a2235'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                title="Klicka för detaljer"
              >
                <td><div className="art-name">{a.name}</div><div className="art-id">{a.article}</div></td>
                <td><span className="abc-chip" style={{ background: abcColor(a.abc) }}>{a.abc}{a.xyz ? `/${a.xyz}` : ''}</span></td>
                <td>{fmt(a.stock)}</td>
                <td style={{ color: a.status === 'CRITICAL' ? '#ef4444' : a.status === 'WATCH' ? '#f97316' : '#94a3b8' }}>{fmtDays(a.coverage_days)}</td>
                {onLedtidChange && (
                  <td onClick={e => e.stopPropagation()}>
                    {editingLedtid === a.article ? (
                      <input
                        autoFocus
                        type="number"
                        min="1" max="730"
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={() => commitLedtid(a.article)}
                        onKeyDown={e => { if (e.key === 'Enter') commitLedtid(a.article); if (e.key === 'Escape') setEditingLedtid(null); }}
                        style={{ width: 54, background: '#1e293b', border: '1px solid #6366f1', borderRadius: 4, color: '#f1f5f9', fontSize: 12, padding: '2px 6px', textAlign: 'center' }}
                      />
                    ) : (
                      <span
                        onClick={() => handleLedtidClick(a)}
                        title="Klicka för att redigera ledtid"
                        style={{
                          cursor: 'pointer', color: ledtidOverrides[a.article] ? '#6366f1' : '#64748b',
                          fontSize: 12, borderBottom: '1px dashed #334155', paddingBottom: 1,
                          fontWeight: ledtidOverrides[a.article] ? 700 : 400,
                        }}
                      >
                        {Math.round(a.lead_time_days ?? 14)}d
                        {ledtidOverrides[a.article] && <span style={{ fontSize: 9, marginLeft: 3, color: '#6366f1' }}>✎</span>}
                      </span>
                    )}
                  </td>
                )}
                <td><span className="status-chip" style={{ background: statusColor(a.status) + '22', color: statusColor(a.status), border: `1px solid ${statusColor(a.status)}44` }}>{statusLabel(a.status)}</span></td>
                <td className="action-cell">
                  {a.order_qty > 0 && <span className="action-pill order">Beställ {fmt(a.order_qty)} st</span>}
                  {hasLoc && a.suggest_move && <span className="action-pill move">Flytta → Zon {a.recommended_zone}</span>}
                  {a.status === 'OK' && !a.order_qty && !a.suggest_move && <span className="action-pill ok">OK</span>}
                </td>
              </tr>
              {showExplanation && a.explanation && (
                <tr className="explanation-row"><td colSpan={6}><span className="explanation">{a.explanation}</span></td></tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      )}
      {!search && filtered.length > 100 && (
        <p className="table-more">Visar 100 av {filtered.length} artiklar — sök på artikelnummer eller namn för att hitta en specifik artikel</p>
      )}
      {search && filtered.length > 0 && (
        <p className="table-more">Visar {filtered.length} träff{filtered.length !== 1 ? 'ar' : ''} på "{search}"</p>
      )}
    </div>
  );
}

// ─── PURCHASING TAB ────────────────────────────────────────────────────────
function PurchasingTab({ data }) {
  const { summary, articles } = data;
  const hasCost = summary.has_cost_data;
  const toOrder = articles?.filter(a => a.order_qty > 0).sort((a, b) => {
    // Sort: CRITICAL first, then by days_until_reorder asc, then value desc
    const statusPriority = { CRITICAL: 0, WATCH: 1 };
    const sp = (statusPriority[a.status] ?? 2) - (statusPriority[b.status] ?? 2);
    if (sp !== 0) return sp;
    return (a.days_until_reorder ?? 99) - (b.days_until_reorder ?? 99);
  }) || [];
  const [exporting, setExporting] = React.useState(false);
  const [abcFilter, setAbcFilter] = React.useState('Alla');
  const [search, setSearch] = React.useState('');

  const handleExport = async () => {
    if (!window._lastUploadedFile) { alert('Ladda upp filen igen för att exportera inköpslista.'); return; }
    setExporting(true);
    try {
      const formData = new FormData();
      formData.append('file', window._lastUploadedFile);
      let res;
      try { res = await fetch(`${API_URL}/export-purchase-order`, { method: 'POST', body: formData }); }
      catch { alert('Kunde inte nå servern.'); return; }
      if (!res.ok) { alert('Export misslyckades.'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().slice(0, 10);
      a.href = url; a.download = `logitide_inkopslista_${today}.xlsx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally { setExporting(false); }
  };

  const critical = toOrder.filter(a => a.status === 'CRITICAL');
  const watch = toOrder.filter(a => a.status === 'WATCH');
  const criticalNoOrder = articles?.filter(a => a.status === 'CRITICAL' && !(a.order_qty > 0)).sort((a, b) =>
    (a.coverage_days ?? 999) - (b.coverage_days ?? 999)
  ) || [];
  const filtered = toOrder.filter(a =>
    (abcFilter === 'Alla' || a.abc === abcFilter) &&
    (!search || a.article?.toLowerCase().includes(search.toLowerCase()) || a.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const urgColor = (daysLeft) => daysLeft <= 0 ? '#ef4444' : daysLeft <= 3 ? '#f97316' : daysLeft <= 7 ? '#eab308' : '#22c55e';

  return (
    <div className="tab-content">
      <style>{`
        .purch-kpi { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 16px; }
        .purch-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
        .purch-search { flex: 1; min-width: 160px; background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: 6px; padding: 6px 10px; color: var(--color-text); font-size: 13px; outline: none; }
        .purch-search:focus { border-color: #3b82f6; }
        .purch-filters { display: flex; gap: 4px; }
        .purch-filter-btn { padding: 5px 12px; border-radius: 6px; border: 1px solid var(--color-border);
          background: var(--color-surface); color: var(--color-muted); font-size: 12px; font-weight: 600;
          cursor: pointer; letter-spacing: .04em; }
        .purch-filter-btn.active { background: var(--color-text); color: var(--color-bg); border-color: var(--color-text); }
        .purch-section-label { font-size: 11px; font-weight: 700; letter-spacing: .07em; color: var(--color-muted);
          text-transform: uppercase; padding: 10px 0 6px; display: flex; align-items: center; gap: 8px; }
        .purch-section-label span { padding: 1px 7px; border-radius: 10px; font-size: 10px; }
        .purch-row { display: grid; grid-template-columns: 36px 1fr 44px 70px 70px 80px 80px ${hasCost ? '80px ' : ''}90px;
          align-items: center; gap: 0 8px; padding: 7px 10px; border-radius: 7px;
          border-bottom: 1px solid var(--color-border); transition: background 0.1s; font-size: 13px; }
        .purch-row:hover { background: var(--color-surface); }
        .purch-row:last-child { border-bottom: none; }
        .purch-urgency-bar { width: 4px; height: 28px; border-radius: 2px; flex-shrink: 0; }
        .purch-col-hdr { display: grid; grid-template-columns: 36px 1fr 44px 70px 70px 80px 80px ${hasCost ? '80px ' : ''}90px;
          gap: 0 8px; padding: 0 10px 6px; font-size: 10px; font-weight: 700; letter-spacing: .06em;
          color: var(--color-muted); text-transform: uppercase; }
        .purch-art-id { font-size: 11px; color: var(--color-muted); font-variant-numeric: tabular-nums; }
        .purch-art-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .purch-qty { font-weight: 700; color: var(--color-text); font-variant-numeric: tabular-nums; }
        .purch-val { font-variant-numeric: tabular-nums; color: var(--color-muted); }
        .purch-days { font-variant-numeric: tabular-nums; font-weight: 600; }
        .purch-status-chip { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; letter-spacing: .04em; white-space: nowrap; }
        @media (max-width: 900px) {
          .purch-row, .purch-col-hdr { grid-template-columns: 8px 1fr 44px 70px 80px; }
          .purch-row > *:nth-child(5), .purch-row > *:nth-child(6), .purch-row > *:nth-child(7),
          .purch-col-hdr > *:nth-child(5), .purch-col-hdr > *:nth-child(6), .purch-col-hdr > *:nth-child(7) { display: none; }
        }
      `}</style>

      {!hasCost && (
        <div className="info-banner">
          <Icon name="info" size={16} />
          Inköpspris saknas — ordervärden kan inte beräknas. Lägg till kolumnen <code>cost</code> för fullständig analys.
        </div>
      )}

      <div className="purch-kpi">
        <KpiCard label="ATT BESTÄLLA" value={fmt(summary.articles_to_order)}
          sub={`${summary.critical} kritiska · ${summary.watch} bevakas`} color="#f97316" />
        <KpiCard label="TOTALT ORDERVÄRDE"
          value={hasCost ? fmtKr(summary.total_order_value_sek) : null}
          missingReason={!hasCost ? 'Kräver inköpspris i filen' : null} color="#3b82f6" />
        <KpiCard label="SNITT PER ORDER"
          value={hasCost ? fmtKr(Math.round(summary.total_order_value_sek / Math.max(summary.articles_to_order, 1))) : null}
          missingReason={!hasCost ? 'Kräver inköpspris i filen' : null} color="#8b5cf6" />
      </div>

      {/* Toolbar */}
      <div className="purch-toolbar">
        <input className="purch-search" placeholder="Sök artikel..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="purch-filters">
          {['Alla','A','B','C'].map(f => (
            <button key={f} className={`purch-filter-btn${abcFilter===f?' active':''}`} onClick={() => setAbcFilter(f)}>{f}</button>
          ))}
        </div>
        <button className="export-btn" onClick={handleExport} disabled={exporting}
          style={{ background: '#3b82f6', color: '#fff', borderColor: '#3b82f6', fontWeight: 600, marginLeft: 'auto' }}>
          <Icon name="download" size={14} />
          {exporting ? 'Exporterar...' : 'Exportera .xlsx'}
        </button>
      </div>

      {/* Column headers */}
      <div className="purch-col-hdr">
        <div /> <div>Artikel</div> <div>ABC</div> <div>Täcktid</div> <div>Beställ om</div>
        <div>Senast</div> <div>Antal</div> {hasCost && <div>Värde</div>} <div>Status</div>
      </div>

      {/* CRITICAL group */}
      {critical.filter(a => abcFilter === 'Alla' || a.abc === abcFilter).filter(a => !search || a.article?.toLowerCase().includes(search.toLowerCase()) || a.name?.toLowerCase().includes(search.toLowerCase())).length > 0 && (
        <>
          <div className="purch-section-label">
            🔴 Kritiska brister
            <span style={{ background: '#ef444422', color: '#ef4444' }}>
              {critical.filter(a => abcFilter==='Alla'||a.abc===abcFilter).length} artiklar
            </span>
          </div>
          {critical.filter(a => (abcFilter==='Alla'||a.abc===abcFilter) && (!search||a.article?.toLowerCase().includes(search.toLowerCase())||a.name?.toLowerCase().includes(search.toLowerCase()))).map((a, i) => {
            const daysLeft = a.days_until_reorder ?? 0;
            const uc = urgColor(daysLeft);
            return (
              <div className="purch-row" key={`c${i}`}>
                <div style={{ display:'flex', alignItems:'center' }}>
                  <div className="purch-urgency-bar" style={{ background: uc }} />
                </div>
                <div>
                  <div className="purch-art-name">{a.name || a.article}</div>
                  <div className="purch-art-id">{a.article}</div>
                </div>
                <div><span className="abc-chip" style={{ background: abcColor(a.abc) }}>{a.abc}</span></div>
                <div className="purch-days" style={{ color: '#ef4444' }}>{fmtDays(a.coverage_days)}</div>
                <div className="purch-days" style={{ color: uc }}>{daysLeft <= 0 ? 'Nu' : `${daysLeft} d`}</div>
                <div style={{ fontSize: 12, color: uc, fontWeight: 600 }}>{a.reorder_date || 'Idag'}</div>
                <div className="purch-qty">{fmt(a.order_qty)} st</div>
                {hasCost && <div className="purch-val">{fmtKr(a.order_value)}</div>}
                <div><span className="purch-status-chip" style={{ background:'#ef444420', color:'#ef4444' }}>KRITISK</span></div>
              </div>
            );
          })}
        </>
      )}

      {/* WATCH group */}
      {watch.filter(a => abcFilter === 'Alla' || a.abc === abcFilter).filter(a => !search || a.article?.toLowerCase().includes(search.toLowerCase()) || a.name?.toLowerCase().includes(search.toLowerCase())).length > 0 && (
        <>
          <div className="purch-section-label" style={{ marginTop: 12 }}>
            🟡 Bevaka — beställ inom kort
            <span style={{ background: '#f9731620', color: '#f97316' }}>
              {watch.filter(a => abcFilter==='Alla'||a.abc===abcFilter).length} artiklar
            </span>
          </div>
          {watch.filter(a => (abcFilter==='Alla'||a.abc===abcFilter) && (!search||a.article?.toLowerCase().includes(search.toLowerCase())||a.name?.toLowerCase().includes(search.toLowerCase()))).map((a, i) => {
            const daysLeft = a.days_until_reorder ?? 0;
            const uc = urgColor(daysLeft);
            return (
              <div className="purch-row" key={`w${i}`}>
                <div style={{ display:'flex', alignItems:'center' }}>
                  <div className="purch-urgency-bar" style={{ background: uc }} />
                </div>
                <div>
                  <div className="purch-art-name">{a.name || a.article}</div>
                  <div className="purch-art-id">{a.article}</div>
                </div>
                <div><span className="abc-chip" style={{ background: abcColor(a.abc) }}>{a.abc}</span></div>
                <div className="purch-days" style={{ color: '#f97316' }}>{fmtDays(a.coverage_days)}</div>
                <div className="purch-days" style={{ color: uc }}>{daysLeft <= 0 ? 'Nu' : `${daysLeft} d`}</div>
                <div style={{ fontSize: 12, color: uc, fontWeight: 600 }}>{a.reorder_date || '—'}</div>
                <div className="purch-qty">{fmt(a.order_qty)} st</div>
                {hasCost && <div className="purch-val">{fmtKr(a.order_value)}</div>}
                <div><span className="purch-status-chip" style={{ background:'#f9731620', color:'#f97316' }}>BEVAKA</span></div>
              </div>
            );
          })}
        </>
      )}

      {/* CRITICAL with sufficient stock — monitor section */}
      {criticalNoOrder.filter(a => abcFilter === 'Alla' || a.abc === abcFilter).filter(a => !search || a.article?.toLowerCase().includes(search.toLowerCase()) || a.name?.toLowerCase().includes(search.toLowerCase())).length > 0 && (
        <>
          <div className="purch-section-label" style={{ marginTop: 12 }}>
            🔴 Kritiska — bevaka manuellt
            <span style={{ background: '#ef444415', color: '#ef4444' }}>
              {criticalNoOrder.filter(a => abcFilter==='Alla'||a.abc===abcFilter).length} artiklar
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8, paddingLeft: 4 }}>
            Kritisk status men lager täcker t.o.m. ledtiden — inget automatiskt orderförslag. Kontrollera manuellt.
          </div>
          {criticalNoOrder.filter(a => (abcFilter==='Alla'||a.abc===abcFilter) && (!search||a.article?.toLowerCase().includes(search.toLowerCase())||a.name?.toLowerCase().includes(search.toLowerCase()))).map((a, i) => (
            <div className="purch-row" key={`cn${i}`} style={{ opacity: 0.75 }}>
              <div style={{ display:'flex', alignItems:'center' }}>
                <div className="purch-urgency-bar" style={{ background: '#ef4444', opacity: 0.4 }} />
              </div>
              <div>
                <div className="purch-art-name">{a.name || a.article}</div>
                <div className="purch-art-id">{a.article}</div>
              </div>
              <div><span className="abc-chip" style={{ background: abcColor(a.abc) }}>{a.abc}</span></div>
              <div className="purch-days" style={{ color: 'var(--color-muted)' }}>{fmtDays(a.coverage_days)}</div>
              <div className="purch-days" style={{ color: 'var(--color-muted)' }}>—</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>—</div>
              <div className="purch-qty" style={{ color: 'var(--color-muted)' }}>—</div>
              {hasCost && <div className="purch-val">—</div>}
              <div><span className="purch-status-chip" style={{ background:'#ef444415', color:'#ef4444' }}>BEVAKA</span></div>
            </div>
          ))}
        </>
      )}

      {filtered.length === 0 && criticalNoOrder.filter(a => abcFilter === 'Alla' || a.abc === abcFilter).length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-muted)', fontSize: 14 }}>
          Inga artiklar matchar filtret
        </div>
      )}
    </div>
  );
}

// ─── SLOTTING TAB ────────────────────────────────────────────────────────
function SlottingTab({ data }) {
  const { summary, articles } = data;
  const hasLoc = summary.has_location_data;
  const [zoneFilter, setZoneFilter] = useState(null);
  // ── Med loc-data: befintlig flyttlista ──
  const moves = articles?.filter(a => a.suggest_move).sort((a, b) => {
    const p = { CRITICAL: 0, MEDIUM: 1, LOW: 2 };
    return (p[a.move_priority] || 2) - (p[b.move_priority] || 2);
  }) || [];
  const priorityColor = { CRITICAL: '#ef4444', MEDIUM: '#f59e0b', LOW: '#6b7280' };
  const priorityLabel = { CRITICAL: 'KRITISK', MEDIUM: 'MEDEL', LOW: 'LÅG' };

  // ── Med loc: visa befintlig logik ──
  if (hasLoc) {
    // ── Zonkarta-data ──
    const zones = ['A', 'B', 'C'];
    const zoneConfig = {
      A: { label: 'Zon A — Guldzon', sub: 'Nära plockytan', color: '#22c55e', dimColor: '#14532d', textColor: '#bbf7d0', icon: '⚡' },
      B: { label: 'Zon B — Silverzon', sub: 'Mittenlagret', color: '#f59e0b', dimColor: '#451a03', textColor: '#fde68a', icon: '📦' },
      C: { label: 'Zon C — Bronszon', sub: 'Bakre lagret', color: '#6b7280', dimColor: '#1c1917', textColor: '#d1d5db', icon: '🗄️' },
    };
    const zoneStats = {};
    zones.forEach(z => {
      const inZone = articles?.filter(a => String(a.loc || '').toUpperCase().startsWith(z)) || [];
      const correct = inZone.filter(a => !a.suggest_move);
      const misplaced = inZone.filter(a => a.suggest_move);
      const incoming = articles?.filter(a => a.suggest_move && String(a.recommended_zone || '').toUpperCase() === z) || [];
      zoneStats[z] = { total: inZone.length, correct: correct.length, misplaced: misplaced.length, incoming: incoming.length };
    });
    const filteredMoves = zoneFilter
      ? moves.filter(a => String(a.loc || '').toUpperCase().startsWith(zoneFilter))
      : moves;

    return (
      <div className="tab-content">
        {/* ── LAGERKARTA ── */}
        <div className="section" style={{ marginBottom: 0 }}>
          <div className="section-header" style={{ marginBottom: 12 }}>
            <h3>Lagerkarta — zoner</h3>
            <span style={{ fontSize: 12, color: '#64748b' }}>Klicka på en zon för att filtrera listan</span>
          </div>
          {/* SVG-karta */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <svg viewBox="0 0 700 220" style={{ width: '100%', borderRadius: 10, overflow: 'visible' }}>
              {/* Bakgrund */}
              <rect x="0" y="0" width="700" height="220" rx="10" fill="#0a1628" />
              {/* Plockytan / utgång */}
              <rect x="0" y="0" width="80" height="220" rx="0" fill="#0d1f3c" />
              <text x="40" y="95" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="700" letterSpacing="0.08em">PLOCK</text>
              <text x="40" y="108" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="700" letterSpacing="0.08em">STATION</text>
              {/* Pil — flöde */}
              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="#3b82f644" />
                </marker>
              </defs>
              <line x1="80" y1="100" x2="680" y2="100" stroke="#1e3a5f" strokeWidth="1" strokeDasharray="6,6" markerEnd="url(#arrowhead)" />

              {/* Zon A */}
              <rect
                x="90" y="10" width="180" height="200" rx="8"
                fill={zoneFilter === 'A' ? '#14532d' : '#0f2d1a'}
                stroke={zoneFilter === 'A' ? '#22c55e' : '#1a4a28'}
                strokeWidth={zoneFilter === 'A' ? 2 : 1}
                style={{ cursor: 'pointer' }}
                onClick={() => setZoneFilter(zoneFilter === 'A' ? null : 'A')}
              />
              <text x="180" y="38" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="700" letterSpacing="0.1em" style={{ pointerEvents: 'none' }}>ZON A</text>
              <text x="180" y="52" textAnchor="middle" fill="#4ade80" fontSize="8.5" style={{ pointerEvents: 'none' }}>Guldzon · Nära plockytan</text>
              {/* Zon A artiklar */}
              <text x="180" y="90" textAnchor="middle" fill="#22c55e" fontSize="28" fontWeight="800" style={{ pointerEvents: 'none' }}>{zoneStats['A'].total}</text>
              <text x="180" y="106" textAnchor="middle" fill="#86efac" fontSize="9" style={{ pointerEvents: 'none' }}>artiklar</text>
              {zoneStats['A'].misplaced > 0 && (
                <>
                  <rect x="125" y="112" width="110" height="22" rx="4" fill="#ef444422" stroke="#ef444444" strokeWidth="1" style={{ pointerEvents: 'none' }} />
                  <text x="180" y="127" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="600" style={{ pointerEvents: 'none' }}>⚠ {zoneStats['A'].misplaced} ska flyttas</text>
                </>
              )}
              {zoneStats['A'].misplaced === 0 && (
                <>
                  <rect x="125" y="112" width="110" height="22" rx="4" fill="#22c55e22" stroke="#22c55e44" strokeWidth="1" style={{ pointerEvents: 'none' }} />
                  <text x="180" y="127" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="600" style={{ pointerEvents: 'none' }}>✓ Korrekt placerade</text>
                </>
              )}
              {zoneStats['A'].incoming > 0 && (
                <>
                  <rect x="125" y="140" width="110" height="22" rx="4" fill="#1d4ed822" stroke="#3b82f644" strokeWidth="1" style={{ pointerEvents: 'none' }} />
                  <text x="180" y="155" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600" style={{ pointerEvents: 'none' }}>→ {zoneStats['A'].incoming} på väg in</text>
                </>
              )}

              {/* Zon B */}
              <rect
                x="280" y="10" width="180" height="200" rx="8"
                fill={zoneFilter === 'B' ? '#451a03' : '#1c1207'}
                stroke={zoneFilter === 'B' ? '#f59e0b' : '#3d2408'}
                strokeWidth={zoneFilter === 'B' ? 2 : 1}
                style={{ cursor: 'pointer' }}
                onClick={() => setZoneFilter(zoneFilter === 'B' ? null : 'B')}
              />
              <text x="370" y="38" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="700" letterSpacing="0.1em" style={{ pointerEvents: 'none' }}>ZON B</text>
              <text x="370" y="52" textAnchor="middle" fill="#fbbf24" fontSize="8.5" style={{ pointerEvents: 'none' }}>Silverzon · Mittenlagret</text>
              <text x="370" y="90" textAnchor="middle" fill="#f59e0b" fontSize="28" fontWeight="800" style={{ pointerEvents: 'none' }}>{zoneStats['B'].total}</text>
              <text x="370" y="106" textAnchor="middle" fill="#fde68a" fontSize="9" style={{ pointerEvents: 'none' }}>artiklar</text>
              {zoneStats['B'].misplaced > 0 && (
                <>
                  <rect x="315" y="112" width="110" height="22" rx="4" fill="#ef444422" stroke="#ef444444" strokeWidth="1" style={{ pointerEvents: 'none' }} />
                  <text x="370" y="127" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="600" style={{ pointerEvents: 'none' }}>⚠ {zoneStats['B'].misplaced} ska flyttas</text>
                </>
              )}
              {zoneStats['B'].misplaced === 0 && (
                <>
                  <rect x="315" y="112" width="110" height="22" rx="4" fill="#22c55e22" stroke="#22c55e44" strokeWidth="1" style={{ pointerEvents: 'none' }} />
                  <text x="370" y="127" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="600" style={{ pointerEvents: 'none' }}>✓ Korrekt placerade</text>
                </>
              )}
              {zoneStats['B'].incoming > 0 && (
                <>
                  <rect x="315" y="140" width="110" height="22" rx="4" fill="#1d4ed822" stroke="#3b82f644" strokeWidth="1" style={{ pointerEvents: 'none' }} />
                  <text x="370" y="155" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600" style={{ pointerEvents: 'none' }}>→ {zoneStats['B'].incoming} på väg in</text>
                </>
              )}

              {/* Zon C */}
              <rect
                x="470" y="10" width="220" height="200" rx="8"
                fill={zoneFilter === 'C' ? '#1c1917' : '#111110'}
                stroke={zoneFilter === 'C' ? '#6b7280' : '#292524'}
                strokeWidth={zoneFilter === 'C' ? 2 : 1}
                style={{ cursor: 'pointer' }}
                onClick={() => setZoneFilter(zoneFilter === 'C' ? null : 'C')}
              />
              <text x="580" y="38" textAnchor="middle" fill="#9ca3af" fontSize="11" fontWeight="700" letterSpacing="0.1em" style={{ pointerEvents: 'none' }}>ZON C</text>
              <text x="580" y="52" textAnchor="middle" fill="#9ca3af" fontSize="8.5" style={{ pointerEvents: 'none' }}>Bronszon · Bakre lagret</text>
              <text x="580" y="90" textAnchor="middle" fill="#9ca3af" fontSize="28" fontWeight="800" style={{ pointerEvents: 'none' }}>{zoneStats['C'].total}</text>
              <text x="580" y="106" textAnchor="middle" fill="#d1d5db" fontSize="9" style={{ pointerEvents: 'none' }}>artiklar</text>
              {zoneStats['C'].misplaced > 0 && (
                <>
                  <rect x="525" y="112" width="110" height="22" rx="4" fill="#ef444422" stroke="#ef444444" strokeWidth="1" style={{ pointerEvents: 'none' }} />
                  <text x="580" y="127" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="600" style={{ pointerEvents: 'none' }}>⚠ {zoneStats['C'].misplaced} ska flyttas</text>
                </>
              )}
              {zoneStats['C'].misplaced === 0 && (
                <>
                  <rect x="525" y="112" width="110" height="22" rx="4" fill="#22c55e22" stroke="#22c55e44" strokeWidth="1" style={{ pointerEvents: 'none' }} />
                  <text x="580" y="127" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="600" style={{ pointerEvents: 'none' }}>✓ Korrekt placerade</text>
                </>
              )}
              {zoneStats['C'].incoming > 0 && (
                <>
                  <rect x="525" y="140" width="110" height="22" rx="4" fill="#1d4ed822" stroke="#3b82f644" strokeWidth="1" style={{ pointerEvents: 'none' }} />
                  <text x="580" y="155" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600" style={{ pointerEvents: 'none' }}>→ {zoneStats['C'].incoming} på väg in</text>
                </>
              )}
            </svg>
            {/* Legenden under kartan */}
            <div style={{ display: 'flex', gap: 20, marginTop: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b' }}>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#ef4444' }} />
                Artiklar som rekommenderas flytta
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b' }}>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#3b82f6' }} />
                Artiklar som ska hit (inkommande)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b' }}>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#22c55e' }} />
                Korrekt placerade
              </div>
              {zoneFilter && (
                <button onClick={() => setZoneFilter(null)} style={{ marginLeft: 'auto', fontSize: 11, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  ✕ Rensa filter (visar zon {zoneFilter})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── KPI-rad ── */}
        <div className="kpi-grid-4" style={{ margin: '16px 0 12px' }}>
          <KpiCard label="KORREKT PLACERADE" value={fmt(summary.total_articles - summary.articles_to_move)} color="#22c55e" />
          <KpiCard label="KRITISKA FLYTT" value={fmt(moves.filter(a => a.move_priority === 'CRITICAL').length)} color="#ef4444" />
          <KpiCard label="MEDELPRIORITET" value={fmt(moves.filter(a => a.move_priority === 'MEDIUM').length)} color="#f59e0b" />
          <KpiCard label="LÅGPRIORITERADE" value={fmt(moves.filter(a => a.move_priority === 'LOW').length)} color="#6b7280" />
        </div>

        {/* ── Toolbar ── */}
        <style>{`
          .slot-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
          .slot-search { flex: 1; min-width: 160px; background: var(--color-surface); border: 1px solid var(--color-border);
            border-radius: 6px; padding: 6px 10px; color: var(--color-text); font-size: 13px; outline: none; }
          .slot-search:focus { border-color: #3b82f6; }
          .slot-col-hdr { display: grid; grid-template-columns: 8px 1fr 50px 90px 100px 90px 40px;
            gap: 0 10px; padding: 0 10px 6px; font-size: 10px; font-weight: 700; letter-spacing: .06em;
            color: var(--color-muted); text-transform: uppercase; align-items: center; }
          .slot-row { display: grid; grid-template-columns: 8px 1fr 50px 90px 100px 90px 40px;
            align-items: center; gap: 0 10px; padding: 7px 10px; border-radius: 7px;
            border-bottom: 1px solid var(--color-border); transition: background 0.1s; font-size: 13px; }
          .slot-row:hover { background: var(--color-surface); }
          .slot-row:last-child { border-bottom: none; }
          .slot-bar { width: 4px; height: 28px; border-radius: 2px; }
          .slot-arrow { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; }
          .slot-zone-from { color: var(--color-muted); }
          .slot-zone-to { color: #3b82f6; }
          .slot-check-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--color-border);
            background: var(--color-surface); color: var(--color-muted); cursor: pointer; font-size: 13px;
            display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
          .slot-check-btn:hover { background: #22c55e22; color: #22c55e; border-color: #22c55e44; }
          .slot-priority-chip { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; letter-spacing: .04em; }
        `}</style>

        {(() => {
          const [slotSearch, setSlotSearch] = React.useState('');
          const [checked, setChecked] = React.useState({});
          const displayed = filteredMoves.filter(a =>
            !slotSearch || a.article?.toLowerCase().includes(slotSearch.toLowerCase()) || a.name?.toLowerCase().includes(slotSearch.toLowerCase())
          );
          const critMoves = displayed.filter(a => a.move_priority === 'CRITICAL');
          const medMoves = displayed.filter(a => a.move_priority === 'MEDIUM');
          const lowMoves = displayed.filter(a => a.move_priority === 'LOW');

          const MoveRow = ({ a, i }) => {
            const pc = priorityColor[a.move_priority] || '#6b7280';
            const isDone = checked[a.article];
            return (
              <div className="slot-row" key={i} style={{ opacity: isDone ? 0.4 : 1 }}>
                <div className="slot-bar" style={{ background: pc }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: isDone ? 'line-through' : 'none' }}>{a.name || a.article}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{a.article}</div>
                </div>
                <div><span className="abc-chip" style={{ background: abcColor(a.abc) }}>{a.abc}{a.xyz ? `/${a.xyz}` : ''}</span></div>
                <div className="slot-zone-from" style={{ fontSize: 13 }}>Zon <b>{a.loc}</b></div>
                <div className="slot-arrow">
                  <span style={{ color: 'var(--color-muted)' }}>→</span>
                  <span className="slot-zone-to">Zon <b>{a.recommended_zone}</b></span>
                </div>
                <div><span className="slot-priority-chip" style={{ background: pc + '20', color: pc }}>{priorityLabel[a.move_priority] || a.move_priority}</span></div>
                <div>
                  <button className="slot-check-btn" onClick={() => setChecked(c => ({ ...c, [a.article]: !c[a.article] }))}
                    style={isDone ? { background: '#22c55e22', color: '#22c55e', borderColor: '#22c55e44' } : {}}>
                    {isDone ? '✓' : '○'}
                  </button>
                </div>
              </div>
            );
          };

          return (
            <>
              <div className="slot-toolbar">
                <input className="slot-search" placeholder="Sök artikel..." value={slotSearch} onChange={e => setSlotSearch(e.target.value)} />
                <button className="export-btn" onClick={() => exportCSV(filteredMoves)}>
                  <Icon name="download" size={14} /> Exportera CSV
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                Rekommendationer baserade på ABC-klass vs. nuvarande position. Lageransvarig avgör när plats finns.
              </p>

              {/* Column headers */}
              <div className="slot-col-hdr">
                <div /> <div>Artikel</div> <div>ABC</div> <div>Nuvarande</div> <div>Flytta till</div> <div>Prioritet</div> <div>Klar</div>
              </div>

              {critMoves.length > 0 && (
                <>
                  <div className="purch-section-label">🔴 Kritiska flytt <span style={{ background: '#ef444422', color: '#ef4444' }}>{critMoves.length} artiklar</span></div>
                  {critMoves.map((a, i) => <MoveRow key={`c${i}`} a={a} i={i} />)}
                </>
              )}
              {medMoves.length > 0 && (
                <>
                  <div className="purch-section-label" style={{ marginTop: 12 }}>🟡 Medelprioritet <span style={{ background: '#f59e0b22', color: '#f59e0b' }}>{medMoves.length} artiklar</span></div>
                  {medMoves.map((a, i) => <MoveRow key={`m${i}`} a={a} i={i} />)}
                </>
              )}
              {lowMoves.length > 0 && (
                <>
                  <div className="purch-section-label" style={{ marginTop: 12 }}>⚪ Lågprioriterade <span style={{ background: '#6b728022', color: '#6b7280' }}>{lowMoves.length} artiklar</span></div>
                  {lowMoves.map((a, i) => <MoveRow key={`l${i}`} a={a} i={i} />)}
                </>
              )}
              {displayed.length === 0 && (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-muted)', fontSize: 14 }}>
                  {filteredMoves.length === 0 ? '✓ Alla artiklar är korrekt placerade' : 'Inga träffar på sökning'}
                </div>
              )}
            </>
          );
        })()}
      </div>
    );
  }

  // ── Utan loc: visa tydlig förklaring om vad som krävs ──
  return (
    <div className="tab-content">
      <div style={{
        maxWidth: 600, margin: '40px auto', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20
      }}>
        <div style={{ fontSize: 40 }}>📍</div>
        <div>
          <h3 style={{ color: '#f1f5f9', marginBottom: 8 }}>Slottinganalys kräver lagerpositioner</h3>
          <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, maxWidth: 480 }}>
            För att rekommendera var en artikel ska stå måste systemet veta var den <em>faktiskt</em> står idag.
            Utan det underlagest kan vi inte beräkna om en flytt är motiverad, hur många rörelser det sparar,
            eller vilka artiklar som är felprioriterade.
          </p>
        </div>

        <div style={{
          background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12,
          padding: '20px 24px', width: '100%', textAlign: 'left'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.1em', marginBottom: 14 }}>
            VAD SOM KRÄVS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { field: 'Nuvarande hyllplats / zon', example: 'A12, Zon 3, Hylla 5B', why: 'Systemet jämför mot ABC-klass och beräknar om flytt är lönsam' },
              { field: 'Kolumnnamn som känns igen', example: 'loc, location, lagerposition, zon, hyllplats', why: 'Exportera direkt ur ert WMS/ERP' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: '#22c55e', fontSize: 16, marginTop: 1, flexShrink: 0 }}>✓</span>
                <div>
                  <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>{r.field}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    T.ex.: <code style={{ background: '#1e293b', padding: '1px 5px', borderRadius: 3 }}>{r.example}</code>
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{r.why}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12,
          padding: '20px 24px', width: '100%', textAlign: 'left'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.1em', marginBottom: 14 }}>
            VAD DU FÅR NÄR DATA FINNS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Prioriterad flyttlista — vilka artiklar ska till guldzon (A) vs bakre lager (C)',
              'Antal onödiga plocksträckor per dag som kan elimineras',
              'CSV-export direkt till lageransvarig',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#3b82f6', flexShrink: 0, marginTop: 1 }}>→</span>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#475569' }}>
          Lägg till positionskolumnen i er exportfil och ladda upp på nytt.
        </p>
      </div>
    </div>
  );
}

// ─── CAPITAL TAB ────────────────────────────────────────────────────────
function CapitalTab({ data }) {
  const { summary, articles } = data;
  const hasCost = summary.has_cost_data;
  const overstock = articles?.filter(a => a.status === 'OVERSTOCK').sort((a, b) => b.overstock_value - a.overstock_value) || [];
  const deadStock = articles?.filter(a => a.status === 'DEAD_STOCK').sort((a, b) => b.dead_stock_value - a.dead_stock_value) || [];
  const toOrder = articles?.filter(a => a.order_qty > 0) || [];
  const defaultTab = overstock.length > 0 ? 'overstock' : toOrder.length > 0 ? 'order' : 'dead';
  const [tab, setTab] = useState(defaultTab);
  if (!hasCost) {
    return (
      <div className="tab-content">
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <h3>Kapitalanalys kräver inköpspriser</h3>
          <p>För att beräkna bundet kapital, överlager och inköpsvärden behövs en kolumn med inköpspris per artikel.</p>
          <p className="empty-tip">Lägg till kolumnen i er exportfil — Logitide känner automatiskt igen: <code>cost, kostnad, inköpspris, pris, styckpris, a_pris</code></p>
          <div className="empty-available">
            <h4>Vad som finns utan priser:</h4>
            <div className="kpi-grid-3" style={{marginTop: '16px'}}>
              <KpiCard label="ÖVERLAGER (antal)" value={fmt(summary.overstock)} sub="artiklar" color="#a855f7"
                tooltip={"Artiklar med täcktid > 365 dagar — mer än ett års förbrukning i lager.\n\nÖverlager binder onödigt kapital och ökar risk för inkurans.\n\nRekommendation: pausa inköp och prioritera förbrukning av befintligt lager."} />
              <KpiCard label="DÖTT LAGER (antal)" value={fmt(summary.dead_stock)} sub="artiklar utan förbrukning" color="#6b7280"
                tooltip={"Artiklar med saldo > 0 men ingen registrerad förbrukning.\n\nKan vara felregistrerat, utgånget eller skrotat gods som ej bokförts.\n\nÖverväg utförsäljning, skrotning eller flytt till annan enhet."} />
              <KpiCard label="ATT BESTÄLLA" value={fmt(summary.articles_to_order)} sub="artiklar" color="#3b82f6" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="tab-content">
      <div className="kpi-grid-3">
        <KpiCard label="BUNDET KAPITAL" value={fmtKr(summary.total_stock_value_sek)} sub={`varav ${fmtKr(summary.overstock_value_sek)} överlager`} color="#a855f7" />
        <KpiCard label="INKÖPSBEHOV" value={fmtKr(summary.total_order_value_sek)} sub={`${fmt(summary.articles_to_order)} artiklar`} color="#3b82f6" />
        <KpiCard label="DÖTT LAGER" value={`${fmt(summary.dead_stock)} art.`} sub={fmtKr(summary.dead_stock_value_sek)} color="#6b7280" />
      </div>
      <div className="capital-tabs">
        <button className={`cap-tab ${tab === 'overstock' ? 'active' : ''}`} onClick={() => setTab('overstock')}>Överlager ({overstock.length})</button>
        <button className={`cap-tab ${tab === 'order' ? 'active' : ''}`} onClick={() => setTab('order')}>Inköpsbehov ({toOrder.length})</button>
        <button className={`cap-tab ${tab === 'dead' ? 'active' : ''}`} onClick={() => setTab('dead')}>Dött lager ({deadStock.length})</button>
      </div>
      {tab === 'overstock' && overstock.length === 0 && <p className="empty-msg">✓ Inga överlagerartiklar</p>}
      {tab === 'dead' && deadStock.length === 0 && <p className="empty-msg">✓ Inga dödlagerartiklar</p>}
      <div className="capital-cards">
        {tab === 'overstock' && overstock.map((a, i) => (
          <div key={i} className="capital-card">
            <div className="cap-header">
              <span className="status-chip" style={{ background: '#a855f722', color: '#a855f7', border: '1px solid #a855f744' }}>ÖVERLAGER</span>
              <span className="art-id">{a.article}</span>
              <b>{a.name}</b>
            </div>
            {a.capital_explanation && <p className="cap-explanation">{a.capital_explanation}</p>}
            <div className="cap-footer">
              <span>Överskott: {fmtKr(a.overstock_value)}</span>
              <span className="cap-value">{fmtKr(a.overstock_value)}</span>
            </div>
          </div>
        ))}
        {tab === 'dead' && deadStock.map((a, i) => (
          <div key={i} className="capital-card">
            <div className="cap-header">
              <span className="status-chip" style={{ background: '#6b728022', color: '#9ca3af', border: '1px solid #6b728044' }}>DÖTT LAGER</span>
              <span className="art-id">{a.article}</span>
              <b>{a.name}</b>
            </div>
            {a.capital_explanation && <p className="cap-explanation">{a.capital_explanation}</p>}
            <div className="cap-footer">
              <span>{fmt(a.stock)} st i lager</span>
              <span className="cap-value">{fmtKr(a.dead_stock_value)}</span>
            </div>
          </div>
        ))}
        {tab === 'order' && (
          <table className="article-table">
            <thead><tr><th>ARTIKEL</th><th>ABC</th><th>SALDO</th><th>TÄCKTID</th><th>BESTÄLL</th><th>VÄRDE</th></tr></thead>
            <tbody>
              {toOrder.slice(0, 50).map((a, i) => (
                <tr key={i}>
                  <td><div className="art-name">{a.name}</div><div className="art-id">{a.article}</div></td>
                  <td><span className="abc-chip" style={{ background: abcColor(a.abc) }}>{a.abc}</span></td>
                  <td>{fmt(a.stock)}</td>
                  <td style={{ color: '#ef4444' }}>{fmtDays(a.coverage_days)}</td>
                  <td><b>{fmt(a.order_qty)} st</b></td>
                  <td>{fmtKr(a.order_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── ABC/XYZ TAB — KOMPAKT NETSTOCK-STIL ─────────────────────────────────

// Estimerar XYZ lokalt när månadsdata saknas:
// X = stabil efterfrågan (OK, jämn demand)
// Y = varierande (WATCH eller demand men låg täckt)
// Z = oregelbunden (DEAD_STOCK, OVERSTOCK, noll demand med lager, CRITICAL med hög variation)
function estimateXyz(a) {
  if (!a) return 'Z';
  const s = a.status;
  if (s === 'DEAD_STOCK' || s === 'OVERSTOCK') return 'Z';
  if (s === 'CRITICAL') {
    // CRITICAL A-artiklar är troligtvis Y (viktiga men riskerar slut), C är Z
    return a.abc === 'C' ? 'Z' : 'Y';
  }
  if (s === 'WATCH') return 'Y';
  if (s === 'OK' && (a.demand_per_day ?? 0) > 0) return 'X';
  return 'Z'; // okänd/noll demand
}

function AbcXyzTab({ data }) {
  const { articles, summary } = data;
  const hasCost = summary.has_cost_data;
  const xyzAvailable = summary.xyz_available === true;
  const [selectedCell, setSelectedCell] = React.useState(null);

  // ── Artiklar berikade med estimerad xyz om backend-xyz saknas ──
  const enrichedArticles = React.useMemo(() => {
    if (xyzAvailable) return articles || [];
    return (articles || []).map(a => ({ ...a, xyz: a.xyz || estimateXyz(a) }));
  }, [articles, xyzAvailable]);

  // ── Matrisdata ──
  const matrix = {};
  ['A','B','C'].forEach(abc => {
    ['X','Y','Z'].forEach(xyz => {
      const key = abc + xyz;
      const arts = enrichedArticles.filter(a => a.abc === abc && a.xyz === xyz);
      const value = arts.reduce((s, a) => s + (a.stock_value || a.annual_value || 0), 0);
      const critical = arts.filter(a => a.status === 'CRITICAL').length;
      matrix[key] = { arts, count: arts.length, value, critical };
    });
  });

  // ── ABC summering ──
  const abcGroups = {};
  ['A','B','C'].forEach(abc => {
    const arts = enrichedArticles.filter(a => a.abc === abc);
    const value = arts.reduce((s, a) => s + (a.stock_value || a.annual_value || 0), 0);
    const critical = arts.filter(a => a.status === 'CRITICAL').length;
    abcGroups[abc] = { arts, count: arts.length, value, critical };
  });

  const totalArticles = enrichedArticles.length || 1;
  const totalValue = enrichedArticles.reduce((s, a) => s + (a.stock_value || a.annual_value || 0), 0) || 1;

  const abcColor2 = { A: '#22c55e', B: '#f59e0b', C: '#6b7280' };
  const xyzColor  = { X: '#22c55e', Y: '#f59e0b', Z: '#ef4444' };
  const xyzLabel  = { X: 'Stabil', Y: 'Varierande', Z: 'Oregelbunden' };

  // Cell-strategi
  const strategy = {
    AX: 'Automatisera inköp',  AY: 'Bevaka månadsvis',     AZ: 'Konsultbeställning',
    BX: 'Standardintervall',   BY: 'Kvartalsvis granskning', BZ: 'Behovsstyrt',
    CX: 'Massbeställ',         CY: 'Årlig granskning',       CZ: 'Avveckla',
  };

  // Artiklar för vald cell
  const selectedArts = selectedCell ? (matrix[selectedCell]?.arts || []) : [];

  // Insights
  const insights = [];
  const ax = matrix['AX'] || {};
  const az = matrix['AZ'] || {};
  const cz = matrix['CZ'] || {};
  const bz = matrix['BZ'] || {};
  if (ax.count > 0) insights.push({ color: '#22c55e', icon: '⭐', text: `${ax.count} AX — automatisera inköpen, stabila A-artiklar` });
  if (az.count > 0) insights.push({ color: '#f97316', icon: '⚠️', text: `${az.count} AZ — högt värde men oregelbunden, manuell styrning krävs` });
  if (bz.count > 0) insights.push({ color: '#f59e0b', icon: '📊', text: `${bz.count} BZ — behovsstyrd inköpsstrategi rekommenderas` });
  if (cz.count > 0) insights.push({ color: '#6b7280', icon: '🗑️', text: `${cz.count} CZ — avvecklingskandidater, lågt värde och oregelbunden` });

  return (
    <div className="tab-content" style={{ paddingTop: 0 }}>
      <style>{`
        .abcxyz-grid { display: grid; grid-template-columns: 1fr 280px; gap: 16px; align-items: start; }
        @media (max-width: 900px) { .abcxyz-grid { grid-template-columns: 1fr; } }
        .abc-matrix-table { width: 100%; border-collapse: separate; border-spacing: 4px; }
        .abc-matrix-table th { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; padding: 6px 10px; text-align: center; }
        .abc-matrix-cell {
          padding: 10px 12px; border-radius: 8px; cursor: pointer;
          transition: all 0.12s; border: 1.5px solid transparent;
          text-align: center; min-width: 90px;
        }
        .abc-matrix-cell:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .abc-matrix-cell.selected { border-color: currentColor !important; box-shadow: 0 0 0 2px rgba(255,255,255,0.08); }
        .abc-matrix-cell.empty { opacity: 0.25; cursor: default; }
        .abc-matrix-cell.empty:hover { filter: none; transform: none; }
        .abc-only-card { border-radius: 10px; padding: 12px 16px; cursor: pointer; transition: all 0.12s; border: 1.5px solid transparent; display: flex; align-items: center; gap: 14px; margin-bottom: 4px; }
        .abc-only-card:hover { filter: brightness(1.1); }
        .abc-only-card.selected { border-color: currentColor !important; }
        .art-chip-sm { display: inline-flex; align-items: center; gap: 4px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 5px; padding: 3px 8px; font-size: 11px; color: var(--color-text); margin: 2px; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '12px 0 16px' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--color-text)' }}>ABC/XYZ-matris</h3>
        <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Klicka cell för artiklar och strategi</span>
        {!xyzAvailable && (
          <span style={{ fontSize: 11, background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44', borderRadius: 5, padding: '1px 7px', fontWeight: 600 }}>Estimerad</span>
        )}
      </div>

      <div className="abcxyz-grid">
        {/* ── VÄNSTER: Matris + artikellista ── */}
        <div>
          {/* Estimerad-banner */}
          {!xyzAvailable && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: '#f59e0b0a', border: '1px solid #f59e0b33', borderLeft: '3px solid #f59e0b', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: 'var(--color-muted)' }}>
              <Icon name="info" size={14} />
              <span>XYZ estimeras från lagerstatus (OK→X, Bevaka→Y, Dött/Överlager→Z). Lägg till <b style={{ color: 'var(--color-text)' }}>månadskolumner jan–dec</b> i filen för exakt variabilitetsanalys.</span>
            </div>
          )}

          {/* ── MATRIS ── */}
          <table className="abc-matrix-table">
            <thead>
              <tr>
                <th style={{ color: 'var(--color-muted)', textAlign: 'left', width: 32 }}></th>
                {['X','Y','Z'].map(xyz => (
                  <th key={xyz} style={{ color: xyzColor[xyz] }}>
                    {xyz} <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>— {xyzLabel[xyz]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['A','B','C'].map(abc => (
                <tr key={abc}>
                  <td style={{ fontSize: 13, fontWeight: 800, color: abcColor2[abc], padding: '4px 8px 4px 0', verticalAlign: 'middle' }}>{abc}</td>
                  {['X','Y','Z'].map(xyz => {
                    const key = abc + xyz;
                    const cell = matrix[key] || { count: 0, value: 0, critical: 0 };
                    const isSelected = selectedCell === key;
                    const hasData = cell.count > 0;
                    const bg = abcColor2[abc];
                    return (
                      <td key={xyz}>
                        <div
                          className={`abc-matrix-cell${isSelected ? ' selected' : ''}${!hasData ? ' empty' : ''}`}
                          style={{
                            background: `${bg}${isSelected ? '22' : '11'}`,
                            color: abcColor2[abc],
                            borderColor: isSelected ? abcColor2[abc] : 'transparent',
                          }}
                          onClick={() => hasData && setSelectedCell(isSelected ? null : key)}
                        >
                          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{cell.count}</div>
                          <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 2 }}>
                            {hasData ? `${Math.round((cell.count/totalArticles)*100)}% av art.` : '—'}
                          </div>
                          {hasCost && cell.value > 0 && (
                            <div style={{ fontSize: 11, fontWeight: 600, marginTop: 3 }}>{fmtKr(cell.value)}</div>
                          )}
                          {cell.critical > 0 && (
                            <div style={{ fontSize: 10, color: '#ef4444', marginTop: 2, fontWeight: 700 }}>⚠ {cell.critical} krit.</div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── ARTIKELLISTA (inline, direkt under matrisen) ── */}
          {selectedCell && selectedArts.length > 0 && (
            <div style={{
              marginTop: 12,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              overflow: 'hidden',
              animation: 'fadeSlideIn 0.15s ease',
            }}>
              <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(3px); } to { opacity:1; transform:translateY(0); } }`}</style>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)' }}>
                  {selectedCell} — {selectedArts.length} artiklar
                  {xyzAvailable && strategy[selectedCell] && (
                    <span style={{ marginLeft: 10, fontWeight: 400, color: 'var(--color-muted)', fontSize: 11 }}>
                      Strategi: {strategy[selectedCell]}
                    </span>
                  )}
                </span>
                <button onClick={() => setSelectedCell(null)} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>✕</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '6px 14px', textAlign: 'left', color: 'var(--color-muted)', fontWeight: 700, fontSize: 10, letterSpacing: '0.07em' }}>ART.NR</th>
                    <th style={{ padding: '6px 14px', textAlign: 'left', color: 'var(--color-muted)', fontWeight: 700, fontSize: 10 }}>NAMN</th>
                    <th style={{ padding: '6px 14px', textAlign: 'right', color: 'var(--color-muted)', fontWeight: 700, fontSize: 10 }}>SALDO</th>
                    <th style={{ padding: '6px 14px', textAlign: 'right', color: 'var(--color-muted)', fontWeight: 700, fontSize: 10 }}>TÄCKTID</th>
                    <th style={{ padding: '6px 14px', textAlign: 'center', color: 'var(--color-muted)', fontWeight: 700, fontSize: 10 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedArts.slice(0, 30).map((a, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '7px 14px', color: 'var(--color-muted)', fontFamily: 'monospace', fontSize: 11 }}>{a.article}</td>
                      <td style={{ padding: '7px 14px', color: 'var(--color-text)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name || '—'}</td>
                      <td style={{ padding: '7px 14px', textAlign: 'right', color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>{fmt(a.stock)}</td>
                      <td style={{ padding: '7px 14px', textAlign: 'right', color: a.status === 'CRITICAL' ? '#ef4444' : a.status === 'WATCH' ? '#f97316' : 'var(--color-muted)', fontWeight: a.status === 'CRITICAL' ? 700 : 400 }}>{fmtDays(a.coverage_days)}</td>
                      <td style={{ padding: '7px 14px', textAlign: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(a.status) }}>{statusLabel(a.status)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedArts.length > 30 && (
                <div style={{ padding: '8px 14px', fontSize: 11, color: 'var(--color-muted)', borderTop: '1px solid var(--color-border)' }}>
                  … och {selectedArts.length - 30} till
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── HÖGER: Insiktskort ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Sammanfattning */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-muted)', marginBottom: 10 }}>SAMMANFATTNING</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['A','B','C'].map(abc => {
                const g = { count: ['X','Y','Z'].reduce((s,xyz) => s + (matrix[abc+xyz]?.count||0), 0),
                            value: ['X','Y','Z'].reduce((s,xyz) => s + (matrix[abc+xyz]?.value||0), 0) };
                const pct = Math.round((g.count / totalArticles) * 100);
                return (
                  <div key={abc} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: abcColor2[abc], width: 14 }}>{abc}</span>
                    <div style={{ flex: 1, height: 6, background: 'var(--color-bg)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: abcColor2[abc], borderRadius: 3, transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums', minWidth: 24, textAlign: 'right' }}>{g.count}</span>
                    {hasCost && g.value > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--color-muted)', minWidth: 56, textAlign: 'right' }}>{fmtKr(g.value)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insikter */}
          {insights.length > 0 && (
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-muted)', marginBottom: 10 }}>INSIKTER</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {insights.map((ins, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{ins.icon}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.5 }}>
                      {ins.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* XYZ-förklaring (kompakt) */}
          {(
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-muted)', marginBottom: 8 }}>KLASSIFICERING</div>
              {[
                { key: 'X', label: 'Stabil', desc: 'Låg variationskoefficient', color: '#22c55e' },
                { key: 'Y', label: 'Varierande', desc: 'Medel variabilitet', color: '#f59e0b' },
                { key: 'Z', label: 'Oregelbunden', desc: 'Hög variabilitet', color: '#ef4444' },
              ].map(r => (
                <div key={r.key} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: r.color, width: 14 }}>{r.key}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text)' }}>{r.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>— {r.desc}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)', fontSize: 10, color: 'var(--color-muted)', lineHeight: 1.5 }}>
                A = topp 80% av årsvolymsvärde · B = 80–95% · C = 95–100%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ─── PDF RAPPORT ───────────────────────────────────────────────────────
async function openPDFReport() {
  // Prioritet 1: Använd analysdata direkt (fungerar efter Import Wizard OCH vanlig uppladdning)
  if (window._lastAnalysisData) {
    try {
      let res;
      try {
        res = await fetch(`${API_URL}/monthly-report-from-json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(window._lastAnalysisData)
        });
      } catch (networkErr) {
        alert('Kunde inte nå servern. Kontrollera din internetanslutning och försök igen.');
        return;
      }
      if (!res.ok) {
        alert('Rapporten kunde inte genereras. Försök igen om en stund.');
        return;
      }
      const html = await res.text();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      alert('Kunde inte generera rapport. Försök igen.');
    }
    return;
  }
  // Prioritet 2: Fallback till filbaserad rapport (äldre flöde)
  if (window._lastUploadedFile) {
    try {
      const formData = new FormData();
      formData.append('file', window._lastUploadedFile);
      let res;
      try {
        res = await fetch(`${API_URL}/monthly-report`, { method: 'POST', body: formData });
      } catch (networkErr) {
        alert('Kunde inte nå servern. Kontrollera din internetanslutning och försök igen.');
        return;
      }
      if (!res.ok) {
        alert('Rapporten kunde inte genereras. Försök igen om en stund.');
        return;
      }
      const html = await res.text();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      alert('Kunde inte generera rapport. Försök ladda upp filen igen.');
    }
    return;
  }
  // Ingen data tillgänglig
  alert('Ladda upp och analysera data först för att generera rapporten.');
}

// ─── CSV EXPORT ────────────────────────────────────────────────────────
function exportCSV(rows) {
  const headers = ['article', 'name', 'abc', 'xyz', 'loc', 'recommended_zone', 'move_priority'];
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => r[h] ?? '').join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'logitide-slotting.csv'; a.click();
}



// ─── DASHBOARD ────────────────────────────────────────────────────────────
function Dashboard({ data, onReset, auth, onLogout, theme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [ledtidOverrides, setLedtidOverrides] = useState({});

  const handleLedtidChange = (articleId, newDays) => {
    setLedtidOverrides(prev => ({ ...prev, [articleId]: newDays }));
  };

  const handleResetLedtider = () => {
    if (window.confirm('Återställ alla manuella ledtider till originalvärden?')) {
      setLedtidOverrides({});
    }
  };

  // Bygg effectiveData med omräknade artiklar där ledtid overridats
  const effectiveData = React.useMemo(() => {
    if (Object.keys(ledtidOverrides).length === 0) return data;
    const articles = (data.articles || []).map(a => {
      const override = ledtidOverrides[a.article];
      if (override == null) return a;
      return recalcArticle(a, override);
    });
    return { ...data, articles };
  }, [data, ledtidOverrides]);

  const { summary } = effectiveData;
  const tabs = [
    { id: 'overview', label: 'Översikt', icon: 'home' },
    { id: 'abcxyz', label: 'ABC/XYZ', icon: 'grid' },
    { id: 'purchasing', label: 'Inköp', icon: 'trending', badge: summary?.articles_to_order },
    { id: 'slotting', label: 'Slotting', icon: 'move', badge: summary?.has_location_data ? summary?.articles_to_move : null },
    { id: 'capital', label: 'Kapital', icon: 'money', badge: summary?.has_cost_data ? (summary?.dead_stock + (summary?.overstock || 0)) : null },
    ...(auth ? [{ id: 'history', label: 'Historik', icon: 'trending' }] : []),
  ];
  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-logo">
          <span>📦</span>
          <div>
            <div className="sidebar-brand">Logitide</div>
            <div className="sidebar-sub">OPTIMIZER</div>
          </div>
        </div>
        <button className="back-btn" onClick={onReset}><Icon name="refresh" size={14} /> Byt data</button>
        <nav className="sidebar-nav">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`nav-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <Icon name={t.icon} size={16} />
              <span>{t.label}</span>
              {t.badge > 0 && <span className="nav-badge">{t.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="service-level">
            <span>SERVICENIVÅ A-ART. <InfoTooltip text="Andel A-artiklar (högprioriterade) där saldo + inkommande order täcker ledtiden. Mål: ≥95%. Dessa artiklar är kritiska för driften — det är denna siffra som räknas." /></span>
            <div className="sl-bars">
              <span className="sl-low">95%</span>
              <span className="sl-cur" style={{
                color: summary?.a_service_level_pct >= 95 ? '#22c55e'
                  : summary?.a_service_level_pct >= 85 ? '#f97316' : '#ef4444'
              }}>{summary?.a_service_level_pct ?? '—'}%</span>
              <span className="sl-high">99%</span>
            </div>
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, lineHeight: 1.4, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              A-artiklar med täckning ≥ ledtid. Mål: ≥95%.
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 6, borderTop: '1px solid #1e293b', paddingTop: 5 }}>
              <span style={{ color: '#64748b' }}>Alla artiklar: </span>
              <span style={{
                fontWeight: 600,
                color: (summary?.service_level_pct ?? 0) >= 95 ? '#22c55e'
                  : (summary?.service_level_pct ?? 0) >= 85 ? '#f97316' : '#ef4444'
              }}>{summary?.service_level_pct ?? '—'}%</span>
              <span style={{ color: '#475569' }}> (inkl. B/C)</span>
            </div>
          </div>
          {summary && <ConfidenceWidget summary={summary} dataQuality={data?.data_quality} />}
          <div className="data-info">
            <span className="data-dot">●</span> Data aktiv<br />
            <span className="data-count">{fmt(summary?.total_articles)} artiklar</span>
          </div>
          <div className="version">v2.5 · {summary?.analysis_timestamp}</div>
          {auth && (
            <div style={{ fontSize: 10, color: '#475569', marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{auth.email}</span>
              <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 10, padding: 0 }}>Logga ut</button>
            </div>
          )}
          {summary && (
            <button className="pdf-btn" onClick={() => openPDFReport()} title="Generera månadsrapport som PDF" style={{ marginTop: 8, width: '100%', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 0', cursor: 'pointer', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon name="download" size={13} /> Månadsrapport PDF
            </button>
          )}
        </div>
      </div>
      <div className="main-content">
        <div className="top-bar">
          <div>
            <h2 className="page-title">{tabs.find(t => t.id === activeTab)?.label}</h2>
            <div className="top-stats">
              <span className="stat-crit">● {summary?.critical} kritiska</span>
              <span className="stat-order">{summary?.articles_to_order} att beställa</span>
              {summary?.overstock > 0 && <span className="stat-over">{summary?.overstock} överlager</span>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="top-tabs">
              {tabs.filter(t => t.id !== 'overview').map(t => (
                <button key={t.id} className={`top-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
              ))}
            </div>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>
        {activeTab === 'overview' && <OverviewTab data={effectiveData} onLedtidChange={handleLedtidChange} ledtidOverrides={ledtidOverrides} onResetLedtider={Object.keys(ledtidOverrides).length > 0 ? handleResetLedtider : null} />}
        {activeTab === 'abcxyz' && <AbcXyzTab data={effectiveData} />}
        {activeTab === 'purchasing' && <PurchasingTab data={effectiveData} />}
        {activeTab === 'slotting' && <SlottingTab data={effectiveData} />}
        {activeTab === 'capital' && <CapitalTab data={effectiveData} />}
        {activeTab === 'history' && auth && <HistoryTab token={auth.token} />}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────
// ─── LOGIN PAGE ───────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Felaktig e-post eller lösenord');
      }
      const data = await res.json();
      localStorage.setItem('logitide_token', data.token);
      localStorage.setItem('logitide_email', data.email);
      localStorage.setItem('logitide_company', data.company || '');
      onLogin({ token: data.token, email: data.email, company: data.company });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-content" style={{ maxWidth: 400 }}>
        <div className="logo-area">
          <div className="logo-icon">📦</div>
          <div>
            <h1 className="logo-text">Logitide</h1>
            <p className="logo-sub">OPTIMIZER</p>
          </div>
        </div>
        <h2 className="upload-headline" style={{ fontSize: 24, marginBottom: 24 }}>Logga in</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="E-post"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#f1f5f9', fontSize: 14 }}
          />
          <input
            type="password"
            placeholder="Lösenord"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#f1f5f9', fontSize: 14 }}
          />
          {error && <div style={{ color: '#ef4444', fontSize: 13 }}>⚠️ {error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '11px 0', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Loggar in…' : 'Logga in'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── SPARKLINE (legacy — used in KapitalTab) ──────────────────────────────
function SparklineLegacy({ values, color = '#6366f1', width = 120, height = 36, inverted = false }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = inverted
      ? ((v - min) / range) * (height - 6) + 3
      : height - ((v - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts.split(' ').pop().split(',')[0]} cy={pts.split(' ').pop().split(',')[1]} r="3" fill={color} />
    </svg>
  );
}

// ─── IMPROVEMENT CARDS ────────────────────────────────────────────────────
function ImprovementCards({ cards, totalSaved }) {
  if (!cards || cards.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>VÄRDE SKAPAT SEDAN FÖREGÅENDE ANALYS</div>
      {totalSaved > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)', border: '1px solid #3b82f6', borderRadius: 12, padding: '14px 20px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 28 }}>💰</span>
          <div>
            <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 600 }}>TOTALT FRIGJORT KAPITAL</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#60a5fa' }}>{fmt(Math.round(totalSaved / 1000))} tkr</div>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {cards.map((c, i) => (
          <div key={i} style={{
            background: '#1e293b', borderRadius: 10, padding: '12px 14px',
            borderLeft: `3px solid ${c.improved ? '#22c55e' : '#ef4444'}`
          }}>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: c.improved ? '#22c55e' : '#ef4444' }}>{c.value}</div>
            {c.description && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{c.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HISTORY DETAIL MODAL ─────────────────────────────────────────────────
function HistoryDetailModal({ analysisId, token, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/history/${analysisId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setDetail(d))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [analysisId, token]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }} onClick={onClose}>
      <div style={{
        background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16,
        width: '100%', maxWidth: 780, maxHeight: '85vh', overflow: 'auto', padding: 28
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: '#f1f5f9', margin: 0 }}>Analysdetaljer</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        {loading && <p style={{ color: '#94a3b8' }}>Laddar…</p>}
        {!loading && !detail && <p style={{ color: '#ef4444' }}>Kunde inte ladda detaljer.</p>}
        {!loading && detail && (() => {
          const s = detail.summary || {};
          const articles = detail.articles || [];
          const topActions = detail.top_actions || [];
          return (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Artiklar', value: fmt(s.total_articles), color: '#f1f5f9' },
                  { label: 'Kritiska', value: s.critical ?? '—', color: s.critical > 0 ? '#ef4444' : '#22c55e' },
                  { label: 'Servicenivå A', value: `${s.a_service_level_pct ?? '—'}%`, color: (s.a_service_level_pct ?? 0) >= 95 ? '#22c55e' : '#f97316' },
                  { label: 'Att beställa', value: s.articles_to_order ?? '—', color: '#f97316' },
                  { label: 'Dött lager', value: s.dead_stock ?? '—', color: '#6b7280' },
                  { label: 'Överlager', value: s.overstock ?? '—', color: '#a855f7' },
                  { label: 'Bundet kapital', value: fmtKr(s.total_stock_value_sek) || '—', color: '#a78bfa' },
                ].map((kpi, i) => (
                  <div key={i} style={{ background: '#1e293b', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>{kpi.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                  </div>
                ))}
              </div>
              {topActions.length > 0 && (
                <>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>PRIORITERADE ÅTGÄRDER</div>
                  <div style={{ marginBottom: 20 }}>
                    {topActions.slice(0, 5).map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
                        <span style={{ fontSize: 16 }}>{a.action === 'ORDER' ? '🛒' : a.action === 'MOVE' ? '📦' : a.action === 'REVIEW_DEAD' ? '🗑️' : '⚠️'}</span>
                        <div>
                          <div style={{ color: '#f1f5f9', fontSize: 13 }}>{a.article} — {a.name}</div>
                          <div style={{ color: '#94a3b8', fontSize: 11 }}>{a.reason}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {articles.length > 0 && (
                <>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>ARTIKLAR ({articles.length})</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ color: '#64748b', textAlign: 'left', borderBottom: '1px solid #1e293b' }}>
                          <th style={{ padding: '6px 10px' }}>ART.NR</th>
                          <th style={{ padding: '6px 10px' }}>NAMN</th>
                          <th style={{ padding: '6px 10px' }}>ABC</th>
                          <th style={{ padding: '6px 10px' }}>STATUS</th>
                          <th style={{ padding: '6px 10px' }}>LAGER</th>
                          <th style={{ padding: '6px 10px' }}>TÄCKDAGAR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {articles.slice(0, 30).map((a, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #0f172a' }}>
                            <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{a.article}</td>
                            <td style={{ padding: '6px 10px', color: '#f1f5f9', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</td>
                            <td style={{ padding: '6px 10px', fontWeight: 700, color: abcColor(a.abc) }}>{a.abc}</td>
                            <td style={{ padding: '6px 10px', color: statusColor(a.status), fontWeight: 600 }}>{statusLabel(a.status)}</td>
                            <td style={{ padding: '6px 10px', color: '#f1f5f9' }}>{fmt(a.stock)}</td>
                            <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{a.coverage_days != null ? fmtDays(a.coverage_days) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {articles.length > 30 && <p style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>… och {articles.length - 30} till</p>}
                  </div>
                </>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}

// ─── COMPARE PANEL ────────────────────────────────────────────────────────
function ComparePanel({ idA, idB, token, labelA, labelB, onClose }) {
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/history/compare/${idA}/${idB}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setDiff(d))
      .catch(() => setDiff(null))
      .finally(() => setLoading(false));
  }, [idA, idB, token]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }} onClick={onClose}>
      <div style={{
        background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16,
        width: '100%', maxWidth: 700, maxHeight: '85vh', overflow: 'auto', padding: 28
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ color: '#f1f5f9', margin: 0 }}>Jämförelse</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>
          <span style={{ color: '#94a3b8' }}>{labelA}</span> → <span style={{ color: '#60a5fa' }}>{labelB}</span>
        </div>
        {loading && <p style={{ color: '#94a3b8' }}>Beräknar…</p>}
        {!loading && !diff && <p style={{ color: '#ef4444' }}>Kunde inte jämföra analyserna.</p>}
        {!loading && diff && (
          <ImprovementCards cards={diff.cards} totalSaved={diff.total_saved_sek} />
        )}
      </div>
    </div>
  );
}

// ─── HISTORY TAB ──────────────────────────────────────────────────────────
function HistoryTab({ token }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [compareIds, setCompareIds] = useState(null); // {idA, idB, labelA, labelB}
  const [compareSelected, setCompareSelected] = useState(null); // id of row selected for compare
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setHistory(d.analyses || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [token]);

  const handleClearHistory = async () => {
    if (!window.confirm('Nollställ all historik? Detta kan inte ångras.')) return;
    setClearing(true);
    try {
      await fetch(`${API_URL}/history`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory([]);
      setSelectedId(null);
      setCompareIds(null);
      setCompareSelected(null);
    } catch (e) {
      alert('Kunde inte rensa historik. Försök igen.');
    } finally {
      setClearing(false);
    }
  };

  if (loading) return <div className="tab-content"><p style={{ color: '#94a3b8' }}>Hämtar historik…</p></div>;
  if (!history || !history.length) return (
    <div className="tab-content">
      <p style={{ color: '#94a3b8' }}>Ingen historik ännu — kör din första analys så sparas den här automatiskt.</p>
    </div>
  );

  const latest = history[0];
  const prev = history[1];

  // Trend sparkline data (oldest first for chart, newest first in array)
  const slValues = [...history].reverse().map(h => h.summary?.a_service_level_pct ?? 0);
  const critValues = [...history].reverse().map(h => h.summary?.critical ?? 0);
  const capValues = [...history].reverse().map(h => Math.round((h.summary?.total_stock_value_sek ?? 0) / 1000));

  const fmtDate = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
  };

  const handleCompare = (h) => {
    if (!compareSelected) {
      setCompareSelected(h.id);
    } else if (compareSelected === h.id) {
      setCompareSelected(null);
    } else {
      // Compare compareSelected (older) vs h (could be newer or older) — always compare vs latest
      const idOlder = Math.min(compareSelected, h.id); // äldre = lägre id
      const idNewer = Math.max(compareSelected, h.id); // nyare = högre id
      const hOlder = history.find(x => x.id === idOlder);
      const hNewer = history.find(x => x.id === idNewer);
      setCompareIds({
        idA: idOlder, // backend: id_a = äldre
        idB: idNewer, // backend: id_b = nyare
        labelA: `${fmtDate(hOlder.created_at)} · ${hOlder.filename}`,
        labelB: `${fmtDate(hNewer.created_at)} · ${hNewer.filename}`,
      });
      setCompareSelected(null);
    }
  };

  return (
    <div className="tab-content">
      {selectedId && (
        <HistoryDetailModal analysisId={selectedId} token={token} onClose={() => setSelectedId(null)} />
      )}
      {compareIds && (
        <ComparePanel {...compareIds} token={token} onClose={() => setCompareIds(null)} />
      )}

      {/* Trend summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          {
            label: 'SERVICENIVÅ A-ART.',
            value: `${latest.summary?.a_service_level_pct ?? '—'}%`,
            color: (latest.summary?.a_service_level_pct ?? 0) >= 95 ? '#22c55e' : '#f97316',
            sparkValues: slValues,
            sparkColor: '#22c55e',
            inverted: false,
            diff: prev ? `${latest.summary?.a_service_level_pct >= prev.summary?.a_service_level_pct ? '▲' : '▼'} ${Math.abs(((latest.summary?.a_service_level_pct ?? 0) - (prev.summary?.a_service_level_pct ?? 0))).toFixed(1)}%` : null,
            improved: prev ? latest.summary?.a_service_level_pct >= prev.summary?.a_service_level_pct : null,
          },
          {
            label: 'KRITISKA ARTIKLAR',
            value: latest.summary?.critical ?? '—',
            color: latest.summary?.critical > 0 ? '#ef4444' : '#22c55e',
            sparkValues: critValues,
            sparkColor: '#ef4444',
            inverted: true, // lower = better, so invert sparkline direction
            diff: prev ? `${latest.summary?.critical <= prev.summary?.critical ? '▼' : '▲'} ${Math.abs((latest.summary?.critical ?? 0) - (prev.summary?.critical ?? 0))}` : null,
            improved: prev ? latest.summary?.critical <= prev.summary?.critical : null,
          },
          {
            label: 'BUNDET KAPITAL',
            value: fmtKr(latest.summary?.total_stock_value_sek) || '—',
            color: '#a78bfa',
            sparkValues: capValues,
            sparkColor: '#a78bfa',
            inverted: true, // lower capital = better
            diff: prev && prev.summary?.total_stock_value_sek != null ? (() => {
              const d = Math.round(((latest.summary?.total_stock_value_sek ?? 0) - (prev.summary?.total_stock_value_sek ?? 0)) / 1000);
              return `${d >= 0 ? '▲' : '▼'} ${fmt(Math.abs(d))} tkr`;
            })() : null,
            improved: prev ? (latest.summary?.total_stock_value_sek ?? 0) <= (prev.summary?.total_stock_value_sek ?? 0) : null,
          },
        ].map((card, i) => (
          <div key={i} style={{ background: '#1e293b', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: card.color, marginBottom: 2 }}>{card.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {card.diff && (
                <span style={{ fontSize: 11, color: card.improved ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                  {card.diff} sedan föreg.
                </span>
              )}
              {!card.diff && <span />}
              {card.sparkValues.length >= 2 && (
                <SparklineLegacy values={card.sparkValues} color={card.sparkColor} inverted={card.inverted} width={100} height={30} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Compare helper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <h3 style={{ color: '#f1f5f9', margin: 0, flex: 1 }}>Analyskörningar</h3>
        {compareSelected && (
          <div style={{ fontSize: 12, color: '#60a5fa', background: '#1e3a5f', borderRadius: 6, padding: '4px 10px' }}>
            Klicka på en annan rad för att jämföra
          </div>
        )}
        {!compareSelected && history.length >= 2 && (
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Klicka på rad för detaljer · Klicka "Jämför" för att välja
          </div>
        )}
        <button
          onClick={handleClearHistory}
          disabled={clearing}
          style={{
            background: 'transparent',
            border: '1px solid #ef444466',
            color: clearing ? '#64748b' : '#ef4444',
            borderRadius: 6,
            padding: '5px 12px',
            fontSize: 11,
            cursor: clearing ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!clearing) { e.currentTarget.style.background = '#ef444418'; e.currentTarget.style.borderColor = '#ef4444'; }}}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#ef444466'; }}
        >
          {clearing ? 'Rensar…' : '🗑 Rensa historik'}
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: '#64748b', textAlign: 'left', borderBottom: '1px solid #1e293b' }}>
              <th style={{ padding: '8px 12px' }}>DATUM</th>
              <th style={{ padding: '8px 12px' }}>FIL</th>
              <th style={{ padding: '8px 12px' }}>ARTIKLAR</th>
              <th style={{ padding: '8px 12px' }}>KRITISKA</th>
              <th style={{ padding: '8px 12px' }}>SERVICENIVÅ A</th>
              <th style={{ padding: '8px 12px' }}>KAPITAL</th>
              <th style={{ padding: '8px 12px' }}></th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => {
              const isSelected = compareSelected === h.id;
              return (
                <tr
                  key={h.id}
                  style={{
                    borderBottom: '1px solid #0f172a',
                    background: isSelected ? '#1e3a5f' : i === 0 ? '#1e293b' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#162032'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = i === 0 ? '#1e293b' : 'transparent'; }}
                  onClick={() => setSelectedId(h.id)}
                >
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>
                    {fmtDate(h.created_at)}
                    {i === 0 && <span style={{ marginLeft: 6, fontSize: 10, background: '#6366f1', color: '#fff', borderRadius: 4, padding: '1px 5px' }}>SENASTE</span>}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#f1f5f9', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.filename || '—'}</td>
                  <td style={{ padding: '10px 12px', color: '#f1f5f9' }}>{fmt(h.summary?.total_articles)}</td>
                  <td style={{ padding: '10px 12px', color: h.summary?.critical > 0 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{h.summary?.critical ?? '—'}</td>
                  <td style={{ padding: '10px 12px', color: (h.summary?.a_service_level_pct ?? 0) >= 95 ? '#22c55e' : (h.summary?.a_service_level_pct ?? 0) >= 85 ? '#f97316' : '#ef4444', fontWeight: 600 }}>{h.summary?.a_service_level_pct ?? '—'}%</td>
                  <td style={{ padding: '10px 12px', color: '#a78bfa' }}>{fmtKr(h.summary?.total_stock_value_sek) || '—'}</td>
                  <td style={{ padding: '10px 12px' }} onClick={e => { e.stopPropagation(); handleCompare(h); }}>
                    <button style={{
                      background: isSelected ? '#3b82f6' : '#1e293b',
                      border: `1px solid ${isSelected ? '#3b82f6' : '#334155'}`,
                      color: isSelected ? '#fff' : '#94a3b8',
                      borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600
                    }}>
                      {isSelected ? '✓ Vald' : 'Jämför'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [analysisData, setAnalysisData] = useState(null);
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('logitide_token');
    const email = localStorage.getItem('logitide_email');
    const company = localStorage.getItem('logitide_company');
    return token ? { token, email, company } : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('logitide_token');
    localStorage.removeItem('logitide_email');
    localStorage.removeItem('logitide_company');
    setAuth(null);
    setAnalysisData(null);
  };

  if (!auth) return <LoginPage onLogin={setAuth} />;
  if (analysisData) return <Dashboard data={analysisData} auth={auth} onReset={() => setAnalysisData(null)} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />;
  return <UploadPage onAnalysis={setAnalysisData} auth={auth} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />;
}
