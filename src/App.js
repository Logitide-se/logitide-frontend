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
const svNum = (n, d = 1) => Number(n).toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: d });
// Förbrukning i en enhet som inte avrundas till 0 (samma regel som motorn: st/dag, st/mån eller st/år)
function fmtRate(d) {
  const v = Number(d) || 0;
  if (v <= 0) return '0 st/dag';
  if (v >= 0.95) return `${svNum(v)} st/dag`;
  if (v * 365 / 12 >= 0.95) return `${svNum(v * 365 / 12)} st/mån`;
  return `${svNum(v * 365)} st/år`;
}
// Långa tider i år i stället för tusentals dagar
function fmtDuration(days) {
  const v = Number(days) || 0;
  if (v < 730) return `${Math.round(v)} dagar`;
  return `ca ${svNum(v / 365, v < 3650 ? 1 : 0)} år`;
}
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
  // Speglar motor 3.0: säkerhetslager, beställningspunkt och status räknas om med ny ledtid.
  const lt = newLeadTime;
  const d = a.demand_per_day ?? 0;
  const hasDemand = d > 0;
  const pos = a.effective_stock ?? a.stock ?? 0;
  const cov = hasDemand ? pos / d : 999;
  const raw = hasDemand ? (a.stock ?? 0) / d : 999;
  let ss = a.safety_stock_units ?? 0;
  const cvUsed = a.demand_cv_used ?? a.demand_cv;
  if (hasDemand && (a.safety_stock_method === 'STATISTISK' || a.safety_stock_method === 'ANTAGEN_VARIATION') && a.z_value != null && cvUsed != null) {
    const sigmaD = cvUsed * d * Math.sqrt(365 / 12);
    const sigmaLt = a.lead_time_std_source === 'fil' && a.lead_time_std_used != null ? Math.min(a.lead_time_std_used, lt * 0.5) : lt * 0.10;
    ss = Math.min(Math.max(a.z_value * Math.sqrt(lt * sigmaD ** 2 + d ** 2 * sigmaLt ** 2), 1), d * 180);
  } else if (hasDemand && a.safety_stock_days != null) {
    ss = d * a.safety_stock_days;
  }
  ss = Math.round(ss * 10) / 10;
  const rop = Math.round((d * lt + ss) * 10) / 10;
  const upto = Math.round((rop + d * 30) * 10) / 10;
  const abcFactor = { A: 2.0, B: 1.5, C: 1.2 }[a.abc] ?? 1.5;
  const belowRop = hasDemand && pos <= rop;
  const late = !!a.order_late && raw < lt;
  const confirmEta = hasDemand && !!a.order_no_eta && raw < lt;
  let status = 'OK';
  if (!hasDemand) status = (a.stock ?? 0) > 0 ? 'DEAD_STOCK' : 'OK';
  else if (cov < lt || a.out_of_stock || a.stockout_before_delivery || late) status = 'CRITICAL';
  else if (belowRop || cov < lt * abcFactor || confirmEta) status = 'WATCH';
  else if (cov > 365) status = 'OVERSTOCK';
  const moq = Math.max(1, a.moq ?? 1);
  const need = upto - pos;
  const order_qty = belowRop && need > 0 ? Math.ceil(need / moq) * moq : 0;
  const afterDays = hasDemand ? (pos + order_qty) / d : 0;
  const moq_warning = order_qty > 0 && moq > 1 && afterDays > 365;
  return {
    ...a, lead_time_days: lt, lead_time_source: 'fil', status, order_qty,
    order_value: order_qty * (a.cost ?? 0), safety_stock_units: ss,
    safety_stock_days: hasDemand ? Math.round(ss / d * 10) / 10 : 0,
    reorder_point: rop, order_up_to: upto, below_reorder_point: belowRop,
    order_confirm_eta: confirmEta && status !== 'CRITICAL',
    moq_warning, moq_warning_days: moq_warning ? Math.round(afterDays) : 0,
  };
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
          background: 'none', border: '1px solid var(--border)', borderRadius: '6px',
          padding: '3px 8px', cursor: 'pointer', fontSize: '12px', color: 'var(--text3)',
          whiteSpace: 'nowrap', flexShrink: 0
        }}>
          {loading ? '...' : open ? '▲ Dölj' : '✦ Förklara'}
        </button>
      </div>
      {open && explanation && (
        <div style={{
          marginTop: '8px', marginLeft: '28px', padding: '10px 14px',
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: '6px', fontSize: '13px', color: 'var(--text)',
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
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderLeft: '4px solid #2196F3',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '12px',
      fontSize: '14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>✅</span>
        <span style={{ color: 'var(--text)', flex: 1 }}>{validation.summary}</span>
        {hasWarnings && (
          <button onClick={() => setExpanded(!expanded)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text3)', fontSize: '12px', padding: '2px 6px'
          }}>
            {validation.warnings.length} varning{validation.warnings.length > 1 ? 'ar' : ''} {expanded ? '▲' : '▼'}
          </button>
        )}
      </div>
      {expanded && hasWarnings && (
        <ul style={{ marginTop: '8px', paddingLeft: '24px', color: 'var(--text3)', fontSize: '13px' }}>
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
      // Skicka zone_config från localStorage — backend gör ALL zonmappning
      try {
        const savedCfg = localStorage.getItem('logitide-slottingConfig');
        if (savedCfg) form.append('zone_config', savedCfg);
      } catch {}
      // Skicka leverantörsledtider — backend applicerar per artikel
      try {
        const supplierSettings = JSON.parse(localStorage.getItem('logitide-supplierSettings') || '{}');
        const validSupplier = Object.fromEntries(
          Object.entries(supplierSettings).filter(([, v]) => v != null && v !== '')
        );
        if (Object.keys(validSupplier).length > 0) {
          form.append('supplier_lead_times', JSON.stringify(validSupplier));
        }
        const globalSettings = JSON.parse(localStorage.getItem('logitide-globalSettings') || '{}');
        if (globalSettings.defaultLeadTime) {
          form.append('global_lead_time', String(globalSettings.defaultLeadTime));
        }
      } catch {}
      const headers = {};
      if (auth?.token) headers['Authorization'] = `Bearer ${auth.token}`;
      const res = await fetch(`${API_URL}/import/run`, { method: 'POST', body: form, headers });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Import misslyckades.'); }
      const data = await res.json();
      window._lastAnalysisData = data;
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
      // Skicka zone_config från localStorage — backend gör ALL zonmappning
      try {
        const savedCfg = localStorage.getItem('logitide-slottingConfig');
        if (savedCfg) formData.append('zone_config', savedCfg);
      } catch {}
      // Skicka leverantörsledtider — backend applicerar per artikel
      try {
        const supplierSettings = JSON.parse(localStorage.getItem('logitide-supplierSettings') || '{}');
        const validSupplier = Object.fromEntries(
          Object.entries(supplierSettings).filter(([, v]) => v != null && v !== '')
        );
        if (Object.keys(validSupplier).length > 0) {
          formData.append('supplier_lead_times', JSON.stringify(validSupplier));
        }
        const globalSettings = JSON.parse(localStorage.getItem('logitide-globalSettings') || '{}');
        if (globalSettings.defaultLeadTime) {
          formData.append('global_lead_time', String(globalSettings.defaultLeadTime));
        }
      } catch {}
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
// ─── ARTICLE DETAIL PANEL ─────────────────────────────────────────────────
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
      {selectedArticle && <ArticleDetailPanel
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onLedtidChange={onLedtidChange}
        ledtidOverride={ledtidOverrides[selectedArticle?.article]}
      />}
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
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>
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
// ─── INKÖP v4 — inköpslista per leverantör med beslut ────────────────────
const REJECT_REASONS = ['Finns redan i lager', 'Beställd utanför systemet', 'Artikeln ska fasas ut', 'Leverantören kan inte leverera', 'Annat skäl'];

const dayDiff = (iso) => {
  if (!iso) return null;
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
  return Math.round((d - t) / 86400000);
};
const relDay = (iso) => {
  const n = dayDiff(iso);
  if (n == null) return '—';
  if (n <= 0) return 'idag';
  if (n === 1) return 'i morgon';
  return `om ${n} dagar`;
};
const shortDate = (iso) => {
  if (!iso) return '';
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
  return `${d.getDate()} ${LT_MONTHS[d.getMonth()]}`;
};

function purchaseTag(a) {
  if (a.late_days > 0 && a.out_of_stock) return { label: 'Slut i lager', tone: 'crit' };
  if (a.late_days > 0) return { label: 'För sent', tone: 'crit' };
  if (a.moq_warning) return { label: 'Kontrollera MOQ', tone: 'warn' };
  const n = dayDiff(a.last_order_date);
  if (n != null && n <= 0) return { label: 'Sista dag idag', tone: 'warn' };
  if (n != null && n <= 7) return { label: 'Inom 7 dagar', tone: 'info' };
  return { label: 'Planera', tone: 'muted' };
}

function PurchaseLine({ a, dec, onDecide, hasCost }) {
  const [open, setOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const qty = dec?.qty ?? a.order_qty;
  const moq = Math.max(1, Number(a.moq) || 1);
  const offPack = moq > 1 && qty % moq !== 0;
  const d = Number(a.demand_per_day) || 0;
  const after = d > 0 ? ((Number(a.effective_stock) || 0) + Number(qty || 0)) / d : null;
  const tag = purchaseTag(a);
  const status = dec?.status || 'pending';
  const setQty = (v) => {
    const n = Math.max(0, Math.round(Number(String(v).replace(',', '.')) || 0));
    onDecide(a.article, { ...(dec || {}), qty: n, status: status === 'rejected' ? 'pending' : status });
  };
  return (
    <>
      <tr className={`lt-po-row is-${status}`}>
        <td className="lt-po-art">
          <button className="lt-po-name" onClick={() => setOpen(o => !o)} aria-expanded={open}>
            {a.name || a.article}
          </button>
          <div className="lt-mono lt-subtle lt-po-id">{a.article}{a.abc ? ` · ${a.abc}${a.xyz ? '/' + a.xyz : ''}` : ''}</div>
        </td>
        <td><span className={`lt-action-type ${tag.tone}`}>{tag.label}</span></td>
        <td className="lt-po-when">
          {a.late_days > 0 ? (
            <><b className="lt-crit-text">{a.late_days} {a.late_days === 1 ? 'dag' : 'dagar'} för sent</b>
              <span>brist även vid order idag</span></>
          ) : (
            <><b>{relDay(a.last_order_date)}</b><span>{shortDate(a.last_order_date)}</span></>
          )}
        </td>
        <td className="num lt-num lt-po-cov">
          <b>{nf(a.coverage_days, a.coverage_days < 10 ? 1 : 0)} d</b>
          <span>ledtid {nf(a.lead_time_days, 0)} d</span>
        </td>
        <td className="num">
          <input className="lt-input lt-po-qty lt-num" inputMode="numeric" value={qty} aria-label={`Antal för ${a.article}`}
            disabled={status === 'rejected'} onChange={e => setQty(e.target.value)} />
          <div className="lt-po-qty-note">
            {qty !== a.order_qty ? `förslag ${fmt(a.order_qty)}` : (moq > 1 ? `MOQ ${fmt(moq)}` : '')}
            {offPack && <span className="lt-warn-text"> · ej hel förp.</span>}
            {after != null && after > 365 && <span className="lt-warn-text"> · räcker {fmtDuration(after)}</span>}
          </div>
        </td>
        <td className="num lt-num">{hasCost ? fmtKr(qty * (Number(a.cost) || 0)) : '—'}</td>
        <td className="lt-po-dec">
          {status === 'pending' && !rejecting && (
            <div className="lt-po-btns">
              <button className="lt-btn lt-btn-primary lt-btn-sm" onClick={() => onDecide(a.article, { ...(dec || {}), qty, status: 'approved' })}>Godkänn</button>
              <button className="lt-btn lt-btn-ghost lt-btn-sm" onClick={() => setRejecting(true)}>Avfärda</button>
            </div>
          )}
          {rejecting && (
            <div className="lt-po-btns">
              <select className="lt-select lt-po-reason" autoFocus defaultValue="" aria-label="Skäl"
                onChange={e => { if (e.target.value) { onDecide(a.article, { ...(dec || {}), qty, status: 'rejected', reason: e.target.value }); setRejecting(false); } }}>
                <option value="" disabled>Välj skäl</option>
                {REJECT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button className="lt-btn lt-btn-ghost lt-btn-sm" onClick={() => setRejecting(false)}>Avbryt</button>
            </div>
          )}
          {status === 'approved' && (
            <div className="lt-po-btns"><span className="lt-po-state ok"><LtIcon name="check" size={12} stroke={2.4} /> Godkänd</span>
              <button className="lt-link-btn" onClick={() => onDecide(a.article, { ...(dec || {}), status: 'pending' })}>Ångra</button></div>
          )}
          {status === 'rejected' && (
            <div className="lt-po-btns"><span className="lt-po-state">Avfärdad · {dec.reason}</span>
              <button className="lt-link-btn" onClick={() => onDecide(a.article, { ...(dec || {}), status: 'pending', reason: undefined })}>Ångra</button></div>
          )}
        </td>
      </tr>
      {open && (
        <tr className="lt-po-detail">
          <td colSpan={7}>
            <div className="lt-po-timeline lt-num">
              <div><span>Saldot räcker till</span><b>{a.stockout_date ? `${shortDate(a.stockout_date)} (${relDay(a.stockout_date)})` : '—'}</b></div>
              <div><span>Beställ senast</span><b>{a.late_days > 0 ? 'redan passerat' : `${shortDate(a.last_order_date)} (${relDay(a.last_order_date)})`}</b></div>
              <div><span>Leverans om du beställer idag</span><b>{shortDate(a.arrival_if_ordered_today)}</b></div>
              <div><span>Räcker efter ordern</span><b>{after != null ? `${nf(after, 0)} dagar` : '—'}</b></div>
              {a.late_days > 0 && <div><span>Dagar utan lager</span><b className="lt-crit-text">ca {a.late_days}</b></div>}
            </div>
            <CalcBreakdown a={a} />
          </td>
        </tr>
      )}
    </>
  );
}

function PurchasingTab({ data }) {
  const { summary, articles = [] } = data;
  const hasCost = summary.has_cost_data;
  const fileKey = (data.import_meta?.filenames || []).join('+');
  const storeKey = `logitide-inkop|${summary.analysis_timestamp}|${fileKey}`;
  const [decisions, setDecisions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch { return {}; }
  });
  const [view, setView] = useState('order');
  const [abc, setAbc] = useState('Alla');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState({});
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(storeKey, JSON.stringify(decisions)); } catch {}
  }, [decisions, storeKey]);

  if (articles.length && articles[0].last_order_date === undefined) {
    return (
      <div className="tab-content">
        <section className="lt-panel lt-panel-pad">
          <h3 style={{ margin: 0 }}>Inköp</h3>
          <p className="lt-hint">Den här analysen gjordes med en äldre version. Kör analysen igen för att få sista beställningsdag och inköpslista per leverantör.</p>
        </section>
      </div>
    );
  }

  const decide = (art, patch) => setDecisions(prev => ({ ...prev, [art]: patch }));
  const qtyOf = (a) => decisions[a.article]?.qty ?? a.order_qty;
  const stOf = (a) => decisions[a.article]?.status || 'pending';

  const toOrder = articles.filter(a => a.order_qty > 0);
  const expedite = articles.filter(a => a.status === 'CRITICAL' && !(a.order_qty > 0) && a.ordered_qty > 0)
    .sort((a, b) => (a.raw_coverage_days ?? 999) - (b.raw_coverage_days ?? 999));
  const upcoming = articles.filter(a => !(a.order_qty > 0) && a.demand_per_day > 0 && a.status !== 'CRITICAL' && (a.days_until_reorder ?? 999) <= 14)
    .sort((a, b) => (a.days_until_reorder ?? 999) - (b.days_until_reorder ?? 999));
  const rejected = toOrder.filter(a => stOf(a) === 'rejected');
  const active = toOrder.filter(a => stOf(a) !== 'rejected');

  const q = query.trim().toLowerCase();
  const matches = (a) => (abc === 'Alla' || a.abc === abc) && (!q || String(a.article).toLowerCase().includes(q) || String(a.name || '').toLowerCase().includes(q) || String(a.supplier || '').toLowerCase().includes(q));
  const urgency = (a) => (a.late_days > 0 ? -1000 - a.late_days : dayDiff(a.last_order_date) ?? 999);

  const listForView = view === 'rejected' ? rejected : active;
  const groups = {};
  listForView.filter(matches).forEach(a => {
    const k = (a.supplier || '').trim() || 'Utan leverantör';
    (groups[k] = groups[k] || []).push(a);
  });
  Object.values(groups).forEach(g => g.sort((x, y) => urgency(x) - urgency(y) || (y.risk_sek || 0) - (x.risk_sek || 0)));
  const groupKeys = Object.keys(groups).sort((x, y) =>
    (x === 'Utan leverantör') - (y === 'Utan leverantör') || urgency(groups[x][0]) - urgency(groups[y][0]) || x.localeCompare(y, 'sv'));

  const valueOf = (list) => list.reduce((s, a) => s + qtyOf(a) * (Number(a.cost) || 0), 0);
  const todayCount = active.filter(a => a.late_days > 0 || (dayDiff(a.last_order_date) ?? 99) <= 0).length;
  const weekCount = active.filter(a => !(a.late_days > 0) && (dayDiff(a.last_order_date) ?? 99) > 0 && dayDiff(a.last_order_date) <= 7).length;
  const lateCount = active.filter(a => a.late_days > 0).length;
  const approved = active.filter(a => stOf(a) === 'approved');
  const reviewed = toOrder.filter(a => stOf(a) !== 'pending').length;
  const suppliers = new Set(active.map(a => (a.supplier || '').trim() || 'Utan leverantör')).size;
  const lateRisk = active.filter(a => a.late_days > 0).reduce((s, a) => s + (a.risk_sek || 0), 0);

  const doExport = async (list, onlyApproved) => {
    setExporting(true); setExportError(null);
    try {
      const lines = list.map(a => ({
        supplier: a.supplier, article: a.article, name: a.name, qty: qtyOf(a), suggested_qty: a.order_qty,
        moq: a.moq, unit_cost: a.cost, last_order_date: a.last_order_date, order_by_date: a.order_by_date,
        arrival: a.arrival_if_ordered_today, status: a.status, decision: stOf(a), reason: decisions[a.article]?.reason || '', abc: a.abc,
      }));
      const res = await fetch(`${API}/export/purchase-list`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: fileKey, analysis: summary.analysis_timestamp, only_approved: onlyApproved, lines }),
      });
      if (!res.ok) throw new Error(await readError(res, 'Exporten misslyckades.'));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const el = document.createElement('a');
      el.href = url; el.download = `logitide_bestallningsunderlag_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(el); el.click(); el.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setExportError(e.message || 'Exporten misslyckades. Försök igen.');
    }
    setExporting(false);
  };

  let brief;
  if (!toOrder.length && !expedite.length) {
    brief = { tone: 'good', title: 'Inget behöver beställas just nu',
      text: upcoming.length ? `${fmt(upcoming.length)} artiklar når beställningspunkten inom 14 dagar.` : 'Alla artiklar ligger över sin beställningspunkt.' };
  } else {
    brief = {
      tone: lateCount ? 'crit' : 'warn',
      title: `${fmt(active.length)} artiklar ska beställas${hasCost ? ` för ${fmtKr(valueOf(active))}` : ''}`,
      text: [
        lateCount ? `${fmt(lateCount)} är redan för sent: de hinner ta slut innan en ny leverans kommer${hasCost && lateRisk ? ` (${fmtKr(lateRisk)} i risk)` : ''}` : null,
        todayCount - lateCount > 0 ? `${fmt(todayCount - lateCount)} till har sista beställningsdag idag` : null,
        weekCount ? `${fmt(weekCount)} inom en vecka` : null,
        expedite.length ? `${fmt(expedite.length)} leveranser behöver påskyndas` : null,
      ].filter(Boolean).join('. ') + '.',
    };
  }

  const views = [
    ['order', `Att beställa (${fmt(active.length)})`],
    ...(expedite.length ? [['expedite', `Påskynda (${fmt(expedite.length)})`]] : []),
    ...(upcoming.length ? [['upcoming', `Inom 14 dagar (${fmt(upcoming.length)})`]] : []),
    ...(rejected.length ? [['rejected', `Avfärdade (${fmt(rejected.length)})`]] : []),
  ];
  const activeView = views.some(([k]) => k === view) ? view : 'order';

  return (
    <div className="tab-content lt-overview">
      <section className={`lt-brief ${brief.tone}`}>
        <div className="lt-brief-main">
          <div className="lt-eyebrow">Inköp</div>
          <h2>{brief.title}</h2>
          <p>{brief.text}</p>
          {toOrder.length > 0 && (
            <div className="lt-po-progress">
              <div className="lt-minibar" role="img" aria-label={`${reviewed} av ${toOrder.length} granskade`}>
                <span className="seg lt-po-progress-fill" style={{ width: `${Math.round(reviewed / toOrder.length * 100)}%` }} />
              </div>
              <span className="lt-hint lt-num">{fmt(reviewed)} av {fmt(toOrder.length)} granskade · {fmt(approved.length)} godkända{hasCost && approved.length ? ` för ${fmtKr(valueOf(approved))}` : ''}</span>
            </div>
          )}
        </div>
        {active.length > 0 && (
          <div className="lt-po-export">
            <button className="lt-btn lt-btn-primary lt-btn-lg" disabled={exporting}
              onClick={() => doExport(approved.length ? approved : active, approved.length > 0)}>
              {exporting ? <span className="lt-spinner" style={{ width: 14, height: 14 }} /> : null}
              {approved.length ? `Exportera godkända (${fmt(approved.length)})` : 'Exportera alla förslag'}
            </button>
            <span className="lt-hint">Excel med en flik per leverantör</span>
            {exportError && <span className="lt-hint lt-crit-text">{exportError}</span>}
          </div>
        )}
      </section>

      <div className="lt-kpi-row">
        <KpiTile label="Beställ idag" tone={todayCount ? 'warn' : null} value={fmt(todayCount)}
          sub={weekCount ? `${fmt(weekCount)} till inom 7 dagar` : 'sista dag är idag eller passerad'}
          tooltip={"Sista beställningsdag = den sista dagen du kan beställa utan att lagret tar slut:\nidag + (täcktid − ledtid). Täcktiden räknar med saldo och alla öppna order."} />
        <KpiTile label="För sent" tone={lateCount ? 'crit' : null} value={fmt(lateCount)}
          sub={lateCount ? 'tar slut innan ny leverans kan komma' : 'inga artiklar'}
          tooltip={"Täcktiden är kortare än ledtiden. Även om du beställer idag blir det brist i ungefär (ledtid − täcktid) dagar.\nPåskynda leveransen eller hitta en snabbare leverantör."} />
        <KpiTile label="Ordervärde" value={hasCost ? fmtMoney(valueOf(active)).v : '—'} unit={hasCost ? fmtMoney(valueOf(active)).u : null}
          sub={hasCost ? `${fmtKr(valueOf(approved))} godkänt` : 'Kräver inköpspris i filen'} />
        <KpiTile label="Leverantörer" value={fmt(suppliers)} sub={`${fmt(active.length)} orderrader`} />
        <KpiTile label="Påskynda" tone={expedite.length ? 'warn' : null} value={fmt(expedite.length)}
          sub="beställda men kommer för sent"
          tooltip={"Artiklar där en order redan är lagd men saldot tar slut innan leveransen kommer, eller där leveransen är försenad."} />
      </div>

      <section className="lt-panel">
        <div className="lt-panel-head lt-po-head">
          <div className="lt-seg" role="tablist">
            {views.map(([k, label]) => (
              <button key={k} role="tab" aria-selected={activeView === k} className={activeView === k ? 'is-active' : ''} onClick={() => setView(k)}>{label}</button>
            ))}
          </div>
          <div className="lt-po-filters">
            <div className="lt-seg" aria-label="ABC-klass">
              {['Alla', 'A', 'B', 'C'].map(c => (
                <button key={c} className={abc === c ? 'is-active' : ''} onClick={() => setAbc(c)}>{c}</button>
              ))}
            </div>
            <input className="lt-input lt-slot-search" placeholder="Sök artikel eller leverantör" value={query} onChange={e => setQuery(e.target.value)} aria-label="Sök" />
          </div>
        </div>

        {(activeView === 'order' || activeView === 'rejected') && (
          groupKeys.length === 0 ? <p className="lt-hint" style={{ padding: '16px 20px', margin: 0 }}>Inga artiklar matchar.</p> :
          groupKeys.map(k => {
            const list = groups[k];
            const pending = list.filter(a => stOf(a) === 'pending');
            const showAll = expanded[k];
            const shown = showAll ? list : list.slice(0, 25);
            const first = list[0];
            return (
              <div className="lt-po-group" key={k}>
                <div className="lt-po-group-head">
                  <div>
                    <h4>{k}</h4>
                    <span className="lt-hint lt-num">
                      {fmt(list.length)} {list.length === 1 ? 'rad' : 'rader'}{hasCost ? ` · ${fmtKr(valueOf(list))}` : ''} ·{' '}
                      {first.late_days > 0 ? 'redan för sent för några' : `första sista dag ${relDay(first.last_order_date)}`}
                    </span>
                  </div>
                  {activeView === 'order' && (
                    <div className="lt-po-btns">
                      {pending.length > 0 && (
                        <button className="lt-btn lt-btn-ghost lt-btn-sm" onClick={() => setDecisions(prev => {
                          const next = { ...prev };
                          pending.forEach(a => { next[a.article] = { ...(prev[a.article] || {}), qty: qtyOf(a), status: 'approved' }; });
                          return next;
                        })}>Godkänn alla ({fmt(pending.length)})</button>
                      )}
                      <button className="lt-btn lt-btn-ghost lt-btn-sm" disabled={exporting}
                        onClick={() => { const ap = list.filter(a => stOf(a) === 'approved'); doExport(ap.length ? ap : list, ap.length > 0); }}>Exportera</button>
                    </div>
                  )}
                </div>
                <div className="lt-slot-table-wrap">
                  <table className="lt-slot-table lt-po-table">
                    <thead>
                      <tr>
                        <th>Artikel</th><th>Läge</th><th>Beställ senast</th><th className="num">Räcker</th>
                        <th className="num">Antal</th><th className="num">Belopp</th><th>Beslut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map(a => <PurchaseLine key={a.article} a={a} dec={decisions[a.article]} onDecide={decide} hasCost={hasCost} />)}
                    </tbody>
                  </table>
                </div>
                {list.length > shown.length && (
                  <div className="lt-slot-more"><button className="lt-btn lt-btn-ghost lt-btn-sm" onClick={() => setExpanded(e => ({ ...e, [k]: true }))}>Visa alla {fmt(list.length)}</button></div>
                )}
              </div>
            );
          })
        )}

        {activeView === 'expedite' && (
          <div className="lt-slot-table-wrap">
            <table className="lt-slot-table">
              <thead><tr><th>Artikel</th><th>Leverantör</th><th className="num">Beställt</th><th>Leverans väntas</th><th>Saldot räcker till</th><th>Läge</th></tr></thead>
              <tbody>
                {expedite.filter(matches).map(a => (
                  <tr key={a.article}>
                    <td><div className="lt-slot-art">{a.name || a.article}</div><div className="lt-mono lt-subtle lt-slot-id">{a.article}</div></td>
                    <td>{a.supplier || '—'}</td>
                    <td className="num lt-num">{fmt(a.ordered_qty)} st</td>
                    <td className="lt-num">{a.eta_date ? `${shortDate(a.eta_date)}${a.order_late ? ' · försenad' : ''}` : 'datum saknas'}</td>
                    <td className="lt-num">{a.out_of_stock ? 'slut nu' : `${shortDate(a.stockout_date)} (${relDay(a.stockout_date)})`}</td>
                    <td className="lt-slot-reason">{a.order_late ? 'Leveransen är försenad — kontakta leverantören' : 'Saldot tar slut innan leveransen — be om tidigare leverans'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeView === 'upcoming' && (
          <div className="lt-slot-table-wrap">
            <table className="lt-slot-table">
              <thead><tr><th>Artikel</th><th>Leverantör</th><th>Beställ</th><th className="num">Räcker</th><th className="num">Förväntat antal</th></tr></thead>
              <tbody>
                {upcoming.filter(matches).map(a => {
                  const moq = Math.max(1, Number(a.moq) || 1);
                  const need = Math.max(0, (a.order_up_to ?? 0) - (a.effective_stock ?? 0));
                  return (
                    <tr key={a.article}>
                      <td><div className="lt-slot-art">{a.name || a.article}</div><div className="lt-mono lt-subtle lt-slot-id">{a.article}</div></td>
                      <td>{a.supplier || '—'}</td>
                      <td className="lt-num"><b>{relDay(a.order_by_date)}</b> <span className="lt-subtle">{shortDate(a.order_by_date)}</span></td>
                      <td className="num lt-num">{nf(a.coverage_days, 0)} d</td>
                      <td className="num lt-num">{fmt(Math.ceil(need / moq) * moq)} st</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="lt-hint lt-slot-method">
        Så räknar vi: en artikel ska beställas när lagerpositionen (saldo + alla öppna order) når beställningspunkten, alltså förbrukningen under ledtiden plus säkerhetslager.
        Förslaget fyller upp till beställningspunkten plus 30 dagars förbrukning, avrundat uppåt till hel förpackning. Sista beställningsdag är sista dagen du kan beställa innan lagret tar slut.
        Dina beslut sparas i den här webbläsaren för den här analysen.
      </p>
    </div>
  );
}


// ─── SLOTTING v4 — plockklass, zon efter kapacitet, klassbyten ───────────
const SLOT_DIR = { 'NÄRMARE': { label: 'Närmare', tone: 'info' }, 'LÄNGRE BORT': { label: 'Gör plats', tone: 'muted' } };
const CHG_LABEL = { UPP: 'Upp', NED: 'Ned' };

function slotCsv(rows) {
  const head = ['Ordning', 'Artikelnummer', 'Benämning', 'Plockklass', 'Plock per dag', 'Nuvarande plats', 'Nuvarande zon', 'Ny zon', 'Riktning', 'Gör först', 'Skäl'];
  const esc = (x) => { const t = String(x ?? ''); return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
  const lines = rows.map(a => [a.move_rank || '', a.article, a.name, a.slot_class, String(a.pick_velocity ?? '').replace('.', ','),
    a.loc_original, a.loc, a.recommended_zone, a.needs_location ? 'Placera' : (SLOT_DIR[a.move_direction]?.label || ''),
    a.move_top ? 'Ja' : '', a.move_reason].map(esc).join(';'));
  const blob = new Blob(['﻿' + [head.join(';'), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const el = document.createElement('a');
  el.href = url; el.download = 'logitide-flyttlista.csv'; el.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function SlottingTab({ data }) {
  const { summary, articles = [] } = data;
  const [view, setView] = useState('top');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(50);
  const [done, setDone] = useState({});

  if (summary.slotting_version !== '2') {
    return (
      <div className="tab-content">
        <section className="lt-panel lt-panel-pad">
          <h3 style={{ margin: 0 }}>Slotting</h3>
          <p className="lt-hint">Den här analysen gjordes med en äldre version. Kör analysen igen för att få plockklasser och flyttlista.</p>
        </section>
      </div>
    );
  }

  const placementKnown = summary.placement_known;
  const counts = summary.slot_class_counts || {};
  const zones = summary.slot_zones || [];
  const moves = articles.filter(a => a.suggest_move).sort((a, b) => (a.move_rank || 0) - (b.move_rank || 0));
  const unplaced = articles.filter(a => a.needs_location).sort((a, b) => (b.pick_velocity || 0) - (a.pick_velocity || 0));
  const changes = articles.filter(a => a.slot_class_change === 'UPP' || a.slot_class_change === 'NED')
    .sort((a, b) => (b.pick_velocity || 0) - (a.pick_velocity || 0));
  const noLocList = !placementKnown ? articles.filter(a => !a.special_zone && (a.pick_velocity || 0) > 0)
    .sort((a, b) => (b.pick_velocity || 0) - (a.pick_velocity || 0)) : [];

  const lists = {
    top: moves.filter(a => a.move_top),
    all: moves,
    changes,
    unplaced: placementKnown ? unplaced : noLocList,
  };
  const q = query.trim().toLowerCase();
  const rows = (lists[view] || []).filter(a => !q || String(a.article).toLowerCase().includes(q) || String(a.name || '').toLowerCase().includes(q));
  const zoneA = zones[0];
  const fmtV = (x) => nf(x, x < 1 ? 2 : 1);

  let brief;
  if (!placementKnown) {
    brief = { title: `${fmt(articles.length)} artiklar har fått en plockklass`,
      text: 'Filen saknar lagerplatser, så Logitide föreslår en zon per artikel utifrån hur ofta den plockas. Lägg till lagerposition i filen för att få en flyttlista.' };
  } else if (summary.articles_to_move === 0) {
    brief = { title: 'Alla artiklar står i rätt zon', text: 'Ingen flytt behövs utifrån plockfrekvensen just nu.' };
  } else {
    brief = { title: `${fmt(summary.moves_top_closer)} ${summary.moves_top_closer === 1 ? 'flytt ger' : 'flyttar ger'} 80 % av vinsten`,
      text: `${fmt(summary.articles_to_move)} artiklar står i fel zon utifrån plockfrekvens och utrymme. ` +
        (zoneA ? `Zon ${zoneA.zone} plockas i snitt ${fmtV(zoneA.avg_velocity)} st/dag per artikel i dag, ${fmtV(zoneA.avg_velocity_after)} efter flyttarna.` : '') };
  }

  const views = [
    ...(placementKnown ? [['top', `Gör först (${fmt(lists.top.length)})`], ['all', `Alla flyttar (${fmt(moves.length)})`]] : []),
    ...(changes.length ? [['changes', `Klassbyten (${fmt(changes.length)})`]] : []),
    ...((placementKnown ? unplaced.length : noLocList.length) ? [['unplaced', placementKnown ? `Saknar plats (${fmt(unplaced.length)})` : `Föreslagen zon (${fmt(noLocList.length)})`]] : []),
  ];
  const activeView = views.some(([k]) => k === view) ? view : (views[0]?.[0] || 'top');

  return (
    <div className="tab-content lt-overview">
      <section className="lt-brief good lt-slot-brief">
        <div className="lt-brief-main">
          <div className="lt-eyebrow">Slotting</div>
          <h2>{brief.title}</h2>
          <p>{brief.text}</p>
        </div>
        {(moves.length > 0 || noLocList.length > 0) && (
          <button className="lt-btn lt-btn-primary lt-btn-lg" onClick={() => slotCsv(placementKnown ? moves : noLocList)}>
            Exportera flyttlista
          </button>
        )}
      </section>

      <div className="lt-kpi-row">
        {['A', 'B', 'C', 'D'].map(c => (
          <KpiTile key={c} label={`Plockklass ${c}`} value={fmt(counts[c] || 0)}
            sub={{ A: 'de första 80 % av plocken', B: 'nästa 15 %', C: 'sista 5 %', D: 'ingen förbrukning' }[c]}
            tooltip={"Plockklass bygger på förbrukning per dag (hur ofta artikeln plockas), inte på värde.\nABC-klassen under ABC/XYZ bygger på värde och styr inköp."} />
        ))}
        <KpiTile label="Rätt zon" value={placementKnown ? `${fmt(summary.correct_zone_count)}` : '—'}
          unit={placementKnown ? ` av ${fmt(summary.placed_articles)}` : null}
          sub={placementKnown ? (summary.special_zone_articles ? `${fmt(summary.special_zone_articles)} i specialzoner räknas inte` : 'utifrån plockfrekvens och utrymme') : 'Kräver lagerposition i filen'}
          tooltip={"Zonerna fylls i ordning med de artiklar som plockas oftast, upp till det antal platser zonen har i dag.\nArtiklar inom 3 % från en zongräns står kvar för att undvika onödiga flyttar."} />
      </div>

      {placementKnown && zones.length > 0 && (
        <section className="lt-panel lt-panel-pad">
          <div className="lt-panel-head flat">
            <h3>Zoner</h3>
            <span className="lt-hint">plock per artikel och dag, i dag och efter flyttarna</span>
          </div>
          <div className="lt-slot-zones">
            {zones.map(z => {
              const pct = z.capacity ? Math.round(z.correct / z.capacity * 100) : 0;
              return (
                <div className="lt-slot-zone" key={z.zone}>
                  <span className="lt-abc-key kA">{z.zone}</span>
                  <div className="lt-slot-zone-main">
                    <div className="lt-slot-zone-top">
                      <b className="lt-num">{fmt(z.capacity)} platser</b>
                      <span className="lt-hint lt-num">{fmt(z.correct)} rätt · {fmt(z.move_in)} in · {fmt(z.move_out)} ut</span>
                    </div>
                    <div className="lt-abc-track" title={`${pct} % står rätt`}><i style={{ width: `${Math.max(2, pct)}%` }} /></div>
                  </div>
                  <div className="lt-slot-zone-v lt-num">
                    <span>{fmtV(z.avg_velocity)}</span><span className="lt-subtle">→</span><b>{fmtV(z.avg_velocity_after)}</b>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {summary.slot_prev_source && (
        <div className="lt-datacheck">
          <div className="lt-datacheck-row">
            <span className="lt-eyebrow">Klassbyten</span>
            <span className="lt-datacheck-text">
              Jämfört med {summary.slot_prev_source === 'fil' ? 'klasserna i er fil' : summary.slot_prev_source}:{' '}
              <b>{fmt(summary.slot_changes_up)}</b> upp, <b>{fmt(summary.slot_changes_down)}</b> ned
              {summary.slot_held_by_margin > 0 ? `, ${fmt(summary.slot_held_by_margin)} behåller sin klass eftersom de ligger nära gränsen` : ''}.
            </span>
          </div>
        </div>
      )}

      {views.length > 0 && (
        <section className="lt-panel">
          <div className="lt-panel-head">
            <div className="lt-seg" role="tablist">
              {views.map(([k, label]) => (
                <button key={k} role="tab" aria-selected={activeView === k} className={activeView === k ? 'is-active' : ''}
                  onClick={() => { setView(k); setLimit(50); }}>{label}</button>
              ))}
            </div>
            <input className="lt-input lt-slot-search" placeholder="Sök artikel" value={query} onChange={e => setQuery(e.target.value)} aria-label="Sök artikel" />
          </div>
          <div className="lt-slot-table-wrap">
            <table className="lt-slot-table">
              <thead>
                <tr>
                  {activeView !== 'changes' && activeView !== 'unplaced' && <th>#</th>}
                  <th>Artikel</th>
                  <th>Plockklass</th>
                  <th className="num">Plock/dag</th>
                  {activeView === 'changes' ? <th>Tidigare → nu</th> : <th>Zon</th>}
                  <th>Skäl</th>
                  {(activeView === 'top' || activeView === 'all') && <th>Klar</th>}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, limit).map(a => (
                  <tr key={a.article} className={done[a.article] ? 'is-done' : ''}>
                    {activeView !== 'changes' && activeView !== 'unplaced' && <td className="lt-mono lt-subtle">{a.move_rank}</td>}
                    <td>
                      <div className="lt-slot-art">{a.name || a.article}</div>
                      <div className="lt-mono lt-subtle lt-slot-id">{a.article}{a.loc_original && a.loc_original !== 'nan' && a.loc_original !== 'Okänd' ? ` · ${a.loc_original}` : ''}</div>
                    </td>
                    <td><span className={`lt-abc-key k${a.slot_class === 'D' ? 'C' : a.slot_class} sm`}>{a.slot_class}</span></td>
                    <td className="num lt-num">{fmtV(a.pick_velocity || 0)}</td>
                    {activeView === 'changes' ? (
                      <td><span className="lt-num">{a.slot_class_prev} → {a.slot_class}</span>{' '}
                        <span className={`lt-action-type ${a.slot_class_change === 'UPP' ? 'info' : 'muted'}`}>{CHG_LABEL[a.slot_class_change]}</span></td>
                    ) : (
                      <td className="lt-slot-zone-cell">
                        {a.suggest_move && <span className={`lt-action-type ${SLOT_DIR[a.move_direction]?.tone || 'muted'}`}>{SLOT_DIR[a.move_direction]?.label}</span>}
                        <span className="lt-num">{a.suggest_move ? `${a.loc} → ${a.recommended_zone}` : `Zon ${a.recommended_zone}`}</span>
                      </td>
                    )}
                    <td className="lt-slot-reason">{a.move_reason || (activeView === 'changes' ? `Plockas ${fmtRate(a.pick_velocity || 0)}` : '')}</td>
                    {(activeView === 'top' || activeView === 'all') && (
                      <td><input type="checkbox" checked={!!done[a.article]} aria-label={`Markera ${a.article} som flyttad`}
                        onChange={() => setDone(d => ({ ...d, [a.article]: !d[a.article] }))} /></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > limit && (
            <div className="lt-slot-more">
              <button className="lt-btn lt-btn-ghost lt-btn-sm" onClick={() => setLimit(l => l + 100)}>Visa fler ({fmt(rows.length - limit)} kvar)</button>
            </div>
          )}
          {rows.length === 0 && <p className="lt-hint" style={{ padding: '16px 20px', margin: 0 }}>Inga artiklar matchar.</p>}
        </section>
      )}

      <p className="lt-hint lt-slot-method">
        Så räknar vi: artiklarna sorteras efter förbrukning per dag. Plockklass A är de som står för de första 80 % av plocken, B nästa 15 %, C resten och D saknar förbrukning.
        Zonerna fylls i ordning med de snabbaste artiklarna upp till det antal platser zonen har i dag. En artikel byter klass eller zon först när den är mer än 3 % från gränsen, så att små svängningar inte ger nya flyttar.
        {summary.special_zone_articles > 0 ? ' Specialzoner som kyl och extern flyttas aldrig.' : ''}
      </p>
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
            <thead>
              <tr>
                <th>ARTIKEL</th><th>ABC</th><th>SALDO</th>
                <th>TÄCKTID</th><th>BESTÄLL</th><th>VÄRDE</th>
              </tr>
            </thead>
            <tbody>
              {toOrder.map((a, i) => (
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
      const value = arts.reduce((s, a) => s + (a.stock_value ?? 0), 0);
      const critical = arts.filter(a => a.status === 'CRITICAL').length;
      matrix[key] = { arts, count: arts.length, value, critical };
    });
  });

  // ── ABC summering ──
  const abcGroups = {};
  ['A','B','C'].forEach(abc => {
    const arts = enrichedArticles.filter(a => a.abc === abc);
    const value = arts.reduce((s, a) => s + (a.stock_value ?? 0), 0);
    const critical = arts.filter(a => a.status === 'CRITICAL').length;
    abcGroups[abc] = { arts, count: arts.length, value, critical };
  });

  const totalArticles = enrichedArticles.length || 1;
  const totalValue = enrichedArticles.reduce((s, a) => s + (a.stock_value ?? 0), 0) || 1;

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
      {!xyzAvailable && (
        <div style={{
          background: '#f59e0b11', border: '1px solid #f59e0b33',
          borderRadius: 8, padding: '10px 16px', marginBottom: 12,
          fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span>⚠️</span>
          <span>
            <strong>XYZ baseras på uppskattning</strong> — filen saknar månadshistorik.
            Lägg till kolumner för jan–dec (12 månaders förbrukning) för exakt XYZ-klassificering baserad på variationskoefficient.
          </span>
        </div>
      )}
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
        .art-chip-sm { display: inline-flex; align-items: center; gap: 4px; background: var(--bg2); border: 1px solid var(--border); border-radius: 5px; padding: 3px 8px; font-size: 11px; color: var(--text); margin: 2px; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '12px 0 16px' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>ABC/XYZ-matris</h3>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>Klicka cell för artiklar och strategi</span>
        {!xyzAvailable && (
          <span style={{ fontSize: 11, background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44', borderRadius: 5, padding: '1px 7px', fontWeight: 600 }}>Estimerad</span>
        )}
      </div>

      <div className="abcxyz-grid">
        {/* ── VÄNSTER: Matris + artikellista ── */}
        <div>
          {/* Estimerad-banner */}
          {!xyzAvailable && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: '#f59e0b0a', border: '1px solid #f59e0b33', borderLeft: '3px solid #f59e0b', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: 'var(--text3)' }}>
              <Icon name="info" size={14} />
              <span>XYZ estimeras från lagerstatus (OK→X, Bevaka→Y, Dött/Överlager→Z). Lägg till <b style={{ color: 'var(--text)' }}>månadskolumner jan–dec</b> i filen för exakt variabilitetsanalys.</span>
            </div>
          )}

          {/* ── MATRIS ── */}
          <table className="abc-matrix-table">
            <thead>
              <tr>
                <th style={{ color: 'var(--text3)', textAlign: 'left', width: 32 }}></th>
                {['X','Y','Z'].map(xyz => (
                  <th key={xyz} style={{ color: xyzColor[xyz] }}>
                    {xyz} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>— {xyzLabel[xyz]}</span>
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
                          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
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
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              overflow: 'hidden',
              animation: 'fadeSlideIn 0.15s ease',
            }}>
              <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(3px); } to { opacity:1; transform:translateY(0); } }`}</style>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                  {selectedCell} — {selectedArts.length} artiklar
                  {xyzAvailable && strategy[selectedCell] && (
                    <span style={{ marginLeft: 10, fontWeight: 400, color: 'var(--text3)', fontSize: 11 }}>
                      Strategi: {strategy[selectedCell]}
                    </span>
                  )}
                </span>
                <button onClick={() => setSelectedCell(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>✕</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '6px 14px', textAlign: 'left', color: 'var(--text3)', fontWeight: 700, fontSize: 10, letterSpacing: '0.07em' }}>ART.NR</th>
                    <th style={{ padding: '6px 14px', textAlign: 'left', color: 'var(--text3)', fontWeight: 700, fontSize: 10 }}>NAMN</th>
                    <th style={{ padding: '6px 14px', textAlign: 'right', color: 'var(--text3)', fontWeight: 700, fontSize: 10 }}>SALDO</th>
                    <th style={{ padding: '6px 14px', textAlign: 'right', color: 'var(--text3)', fontWeight: 700, fontSize: 10 }}>TÄCKTID</th>
                    <th style={{ padding: '6px 14px', textAlign: 'center', color: 'var(--text3)', fontWeight: 700, fontSize: 10 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedArts.slice(0, 30).map((a, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '7px 14px', color: 'var(--text3)', fontFamily: 'monospace', fontSize: 11 }}>{a.article}</td>
                      <td style={{ padding: '7px 14px', color: 'var(--text)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name || '—'}</td>
                      <td style={{ padding: '7px 14px', textAlign: 'right', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{fmt(a.stock)}</td>
                      <td style={{ padding: '7px 14px', textAlign: 'right', color: a.status === 'CRITICAL' ? '#ef4444' : a.status === 'WATCH' ? '#f97316' : 'var(--text3)', fontWeight: a.status === 'CRITICAL' ? 700 : 400 }}>{fmtDays(a.coverage_days)}</td>
                      <td style={{ padding: '7px 14px', textAlign: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(a.status) }}>{statusLabel(a.status)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedArts.length > 30 && (
                <div style={{ padding: '8px 14px', fontSize: 11, color: 'var(--text3)', borderTop: '1px solid var(--border)' }}>
                  … och {selectedArts.length - 30} till
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── HÖGER: Insiktskort ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Sammanfattning */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text3)', marginBottom: 10 }}>SAMMANFATTNING</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['A','B','C'].map(abc => {
                const g = { count: ['X','Y','Z'].reduce((s,xyz) => s + (matrix[abc+xyz]?.count||0), 0),
                            value: ['X','Y','Z'].reduce((s,xyz) => s + (matrix[abc+xyz]?.value||0), 0) };
                const pct = Math.round((g.count / totalArticles) * 100);
                return (
                  <div key={abc} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: abcColor2[abc], width: 14 }}>{abc}</span>
                    <div style={{ flex: 1, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: abcColor2[abc], borderRadius: 3, transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', minWidth: 24, textAlign: 'right' }}>{g.count}</span>
                    {hasCost && g.value > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--text3)', minWidth: 56, textAlign: 'right' }}>{fmtKr(g.value)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insikter */}
          {insights.length > 0 && (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text3)', marginBottom: 10 }}>INSIKTER</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {insights.map((ins, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{ins.icon}</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>
                      {ins.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* XYZ-förklaring (kompakt) */}
          {(
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text3)', marginBottom: 8 }}>KLASSIFICERING</div>
              {[
                { key: 'X', label: 'Stabil', desc: 'Låg variationskoefficient', color: '#22c55e' },
                { key: 'Y', label: 'Varierande', desc: 'Medel variabilitet', color: '#f59e0b' },
                { key: 'Z', label: 'Oregelbunden', desc: 'Hög variabilitet', color: '#ef4444' },
              ].map(r => (
                <div key={r.key} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: r.color, width: 14 }}>{r.key}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{r.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>— {r.desc}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text3)', lineHeight: 1.5 }}>
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



// ─── SETTINGS TAB ─────────────────────────────────────────────────────────
function SettingsTab({ data }) {
  const loadLS = (key, def) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
  };
  const saveLS = (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  };

  const [globalSettings, setGlobalSettings] = useState(() => loadLS('logitide-globalSettings', {
    defaultLeadTime: 14, serviceLevelA: 98, serviceLevelB: 95, serviceLevelC: 90,
  }));
  const [supplierSettings, setSupplierSettings] = useState(() => loadLS('logitide-supplierSettings', {}));
  const [slottingConfig, setSlottingConfig] = useState(() => loadLS('logitide-slottingConfig', {
    zoneA: { from: '1', to: '3' }, zoneB: { from: '4', to: '7' }, zoneC: { from: '8', to: '12' },
  }));
  const [articleOverrides, setArticleOverrides] = useState(() => loadLS('logitide-articleOverrides', {}));

  // Sparstatus per sektion
  const [savedSection, setSavedSection] = useState(null);
  // Vilka sektioner är öppna (accordion)
  const [open, setOpen] = useState({ global: true, supplier: true, article: true, zone: true });

  const suppliers = React.useMemo(() => {
    const s = new Set();
    (data?.articles || []).forEach(a => { if (a.supplier && a.supplier !== 'nan' && a.supplier !== '') s.add(a.supplier); });
    return [...s].sort();
  }, [data]);

  const uniqueLocs = React.useMemo(() => {
    const locs = new Set();
    (data?.articles || []).forEach(a => { if (a.loc && a.loc !== 'Okänd') locs.add(a.loc); });
    return [...locs].slice(0, 30);
  }, [data]);

  // Spara en sektion och visa bekräftelse
  const saveSection = (section) => {
    saveLS('logitide-globalSettings', globalSettings);
    saveLS('logitide-supplierSettings', supplierSettings);
    saveLS('logitide-slottingConfig', slottingConfig);
    saveLS('logitide-articleOverrides', articleOverrides);
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 2000);
  };

  // Spara allt
  const saveAll = () => saveSection('all');

  const toggleSection = (key) => setOpen(s => ({ ...s, [key]: !s[key] }));

  // ── Stilar ──────────────────────────────────────────────────────────────
  const cardStyle = {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  };

  const headerStyle = (isOpen) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px', cursor: 'pointer',
    borderBottom: isOpen ? '1px solid var(--border)' : 'none',
    userSelect: 'none',
  });

  const inputStyle = {
    background: 'var(--bg3)',
    border: '1.5px solid var(--border)',
    borderRadius: 8, padding: '9px 12px',
    color: 'var(--text)', fontSize: 13,
    fontFamily: 'inherit', width: '100%',
    transition: 'border-color 0.15s',
    outline: 'none',
  };

  const labelStyle = {
    fontSize: 11, fontWeight: 600,
    color: 'var(--text3)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    display: 'block', marginBottom: 5,
  };

  const SavedBadge = ({ section }) => savedSection === section || savedSection === 'all' ? (
    <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
      ✓ Sparat
    </span>
  ) : null;

  const SectionSaveBtn = ({ section }) => (
    <button
      onClick={(e) => { e.stopPropagation(); saveSection(section); }}
      style={{
        fontSize: 12, fontWeight: 600,
        background: savedSection === section ? '#16a34a22' : '#6366f122',
        color: savedSection === section ? '#22c55e' : '#818cf8',
        border: `1px solid ${savedSection === section ? '#22c55e44' : '#6366f144'}`,
        borderRadius: 6, padding: '4px 12px',
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
    >
      {savedSection === section ? '✓ Sparat' : 'Spara'}
    </button>
  );

  return (
    <div className="tab-content" style={{ maxWidth: 760 }}>

      {/* ═══ SEKTION 1: Globala standardvärden ═══════════════════════════ */}
      <div style={cardStyle}>
        <div style={headerStyle(open.global)} onClick={() => toggleSection('global')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>⚙️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Globala standardvärden</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>Används när leverantörs- eller artikelspecifik inställning saknas</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SavedBadge section="global" />
            <span style={{ color: 'var(--text3)', fontSize: 16, transition: 'transform 0.2s', transform: open.global ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
          </div>
        </div>

        {open.global && (
          <div style={{ padding: '16px 20px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Standard ledtid (dagar)</label>
                <input style={inputStyle} type="number" min="1" max="365"
                  value={globalSettings.defaultLeadTime ?? 14}
                  onChange={e => setGlobalSettings(s => ({ ...s, defaultLeadTime: parseInt(e.target.value) || 14 }))}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Används om filen saknar ledtidskolumn</div>
              </div>
              <div>
                <label style={labelStyle}>Servicenivå A-artiklar (%)</label>
                <input style={inputStyle} type="number" min="80" max="99"
                  value={globalSettings.serviceLevelA ?? 98}
                  onChange={e => setGlobalSettings(s => ({ ...s, serviceLevelA: parseInt(e.target.value) || 98 }))}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Rekommenderat: 95–99%</div>
              </div>
              <div>
                <label style={labelStyle}>Servicenivå B-artiklar (%)</label>
                <input style={inputStyle} type="number" min="70" max="99"
                  value={globalSettings.serviceLevelB ?? 95}
                  onChange={e => setGlobalSettings(s => ({ ...s, serviceLevelB: parseInt(e.target.value) || 95 }))}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Rekommenderat: 90–95%</div>
              </div>
              <div>
                <label style={labelStyle}>Servicenivå C-artiklar (%)</label>
                <input style={inputStyle} type="number" min="60" max="99"
                  value={globalSettings.serviceLevelC ?? 90}
                  onChange={e => setGlobalSettings(s => ({ ...s, serviceLevelC: parseInt(e.target.value) || 90 }))}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Rekommenderat: 85–92%</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <SectionSaveBtn section="global" />
            </div>
          </div>
        )}
      </div>

      {/* ═══ SEKTION 2: Ledtid per leverantör ═══════════════════════════ */}
      <div style={cardStyle}>
        <div style={headerStyle(open.supplier)} onClick={() => toggleSection('supplier')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>🚚</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Ledtid per leverantör</span>
                {suppliers.length > 0 && (
                  <span style={{ fontSize: 11, background: '#6366f122', color: '#818cf8', borderRadius: 5, padding: '1px 7px', fontWeight: 600 }}>
                    {suppliers.length} leverantörer
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>Åsidosätter global standard per leverantör</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SavedBadge section="supplier" />
            <span style={{ color: 'var(--text3)', fontSize: 16, transition: 'transform 0.2s', transform: open.supplier ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
          </div>
        </div>

        {open.supplier && (
          <div style={{ padding: '16px 20px 20px' }}>
            {suppliers.length === 0 ? (
              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '14px 16px', fontSize: 13, color: 'var(--text3)', border: '1px dashed var(--border)' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Ingen leverantörsdata i filen</div>
                <div>Lägg till kolumnen "Leverantör" i din Excel-fil för att konfigurera ledtider per leverantör.</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>
                  Ange specifik ledtid per leverantör. Tomt fält = global standard ({globalSettings.defaultLeadTime ?? 14} dagar).
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {suppliers.map(sup => {
                    const val = supplierSettings[sup];
                    const isCustom = val != null && val !== '';
                    return (
                      <div key={sup} style={{
                        display: 'flex', alignItems: 'center',
                        background: isCustom ? '#6366f108' : 'var(--bg3)',
                        border: `1.5px solid ${isCustom ? '#6366f144' : 'var(--border)'}`,
                        borderRadius: 8, padding: '10px 12px', gap: 10,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: isCustom ? '#818cf8' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sup}
                          </div>
                          {isCustom && (
                            <div style={{ fontSize: 10, color: '#818cf8', marginTop: 1 }}>Anpassad ledtid</div>
                          )}
                          {!isCustom && (
                            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>Standard: {globalSettings.defaultLeadTime ?? 14} dagar</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <input
                            type="number" min="1" max="365"
                            placeholder={globalSettings.defaultLeadTime ?? 14}
                            value={val ?? ''}
                            onChange={e => {
                              const v = e.target.value;
                              setSupplierSettings(s => ({ ...s, [sup]: v === '' ? undefined : parseInt(v) || undefined }));
                            }}
                            onFocus={e => e.target.style.borderColor = '#6366f1'}
                            onBlur={e => e.target.style.borderColor = isCustom ? '#6366f144' : 'var(--border)'}
                            style={{
                              width: 64, textAlign: 'center',
                              background: 'var(--bg2)',
                              border: `1.5px solid ${isCustom ? '#6366f166' : 'var(--border)'}`,
                              borderRadius: 6, padding: '6px 8px',
                              color: isCustom ? '#818cf8' : 'var(--text)',
                              fontSize: 14, fontWeight: 700,
                              fontFamily: 'inherit', outline: 'none',
                            }}
                          />
                          <span style={{ fontSize: 11, color: 'var(--text3)', minWidth: 28 }}>dagar</span>
                          {isCustom && (
                            <button
                              onClick={() => setSupplierSettings(s => { const n = { ...s }; delete n[sup]; return n; })}
                              title="Återställ till standard"
                              style={{ background: 'none', border: 'none', color: '#ef444488', cursor: 'pointer', fontSize: 14, padding: '0 2px', lineHeight: 1 }}>
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <SectionSaveBtn section="supplier" />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ═══ SEKTION 3: Artikelspecifika ledtider ════════════════════════ */}
      <div style={cardStyle}>
        <div style={headerStyle(open.article)} onClick={() => toggleSection('article')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>📌</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Artikelspecifika ledtider</span>
                {Object.keys(articleOverrides).length > 0 && (
                  <span style={{ fontSize: 11, background: '#6366f122', color: '#818cf8', borderRadius: 5, padding: '1px 7px', fontWeight: 600 }}>
                    {Object.keys(articleOverrides).length} satta
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>Sätts via artikelpanelen — har högsta prioritet</div>
            </div>
          </div>
          <span style={{ color: 'var(--text3)', fontSize: 16, transition: 'transform 0.2s', transform: open.article ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
        </div>

        {open.article && (
          <div style={{ padding: '16px 20px 20px' }}>
            {Object.keys(articleOverrides).length === 0 ? (
              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '14px 16px', fontSize: 13, color: 'var(--text3)', border: '1px dashed var(--border)' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Inga artikelspecifika ledtider satta ännu</div>
                <div>Klicka på en artikel i Inköp- eller Översikt-fliken och redigera ledtiden direkt i artikelpanelen.</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {Object.entries(articleOverrides).map(([art, days]) => (
                    <div key={art} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: '#6366f110', border: '1px solid #6366f133',
                      borderRadius: 8, padding: '8px 12px',
                    }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8' }}>{art}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{days} dagar</div>
                      </div>
                      <button
                        onClick={() => setArticleOverrides(s => { const n = { ...s }; delete n[art]; return n; })}
                        style={{ background: 'none', border: 'none', color: '#ef444488', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1, marginLeft: 4 }}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setArticleOverrides({})}
                    style={{ fontSize: 12, color: '#ef4444', background: 'none', border: '1px solid #ef444433', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>
                    Rensa alla
                  </button>
                  <SectionSaveBtn section="article" />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ═══ SEKTION 4: Lagerkarta — Zonkonfiguration ═══════════════════ */}
      <div style={cardStyle}>
        <div style={headerStyle(open.zone)} onClick={() => toggleSection('zone')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>🗺️</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Lagerkarta — Zonkonfiguration</span>
                {slottingConfig.zoneA?.from && (
                  <span style={{ fontSize: 11, background: '#16a34a22', color: '#4ade80', borderRadius: 5, padding: '1px 7px', fontWeight: 600 }}>Aktiv</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>Mappar lagerpositioner till zoner för slottinganalys</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SavedBadge section="zone" />
            <span style={{ color: 'var(--text3)', fontSize: 16, transition: 'transform 0.2s', transform: open.zone ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
          </div>
        </div>

        {open.zone && (
          <div style={{ padding: '16px 20px 20px' }}>
            {uniqueLocs.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 6 }}>
                  POSITIONER I ER DATA ({uniqueLocs.length > 29 ? '30+' : uniqueLocs.length} UNIKA)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {uniqueLocs.map(loc => (
                    <span key={loc} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 7px', fontSize: 11, color: 'var(--text3)' }}>{loc}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              {[
                ['zoneA', 'Zon A — Guldzon', '#22c55e', 'Nära plockytan'],
                ['zoneB', 'Zon B — Silverzon', '#f59e0b', 'Mittenlagret'],
                ['zoneC', 'Zon C — Bronszon', '#94a3b8', 'Bakre lagret'],
              ].map(([key, label, color, sub]) => (
                <div key={key} style={{
                  display: 'grid', gridTemplateColumns: '1fr 120px 120px',
                  alignItems: 'center', gap: 12,
                  background: 'var(--bg3)', borderRadius: 8,
                  padding: '12px 14px',
                  border: `1.5px solid ${color}33`,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>
                  </div>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 4 }}>Från stallage</label>
                    <input
                      style={{ ...inputStyle, textAlign: 'center', borderColor: `${color}44` }}
                      placeholder="1"
                      value={slottingConfig[key]?.from ?? ''}
                      onChange={e => setSlottingConfig(s => ({ ...s, [key]: { ...s[key], from: e.target.value } }))}
                      onFocus={e => e.target.style.borderColor = color}
                      onBlur={e => e.target.style.borderColor = `${color}44`}
                    />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 4 }}>Till stallage</label>
                    <input
                      style={{ ...inputStyle, textAlign: 'center', borderColor: `${color}44` }}
                      placeholder="12"
                      value={slottingConfig[key]?.to ?? ''}
                      onChange={e => setSlottingConfig(s => ({ ...s, [key]: { ...s[key], to: e.target.value } }))}
                      onFocus={e => e.target.style.borderColor = color}
                      onBlur={e => e.target.style.borderColor = `${color}44`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 14, padding: '10px 12px', background: 'var(--bg3)', borderRadius: 6 }}>
              <strong>Numeriska positioner</strong> (ex: "1-12-5"): ange första segmentet, ex. 1 till 3 för Zon A.<br/>
              <strong>Koordinater</strong> (ex: "A-12-3"): ingen konfiguration behövs — känns igen automatiskt.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setSlottingConfig({ zoneA: { from: '1', to: '3' }, zoneB: { from: '4', to: '7' }, zoneC: { from: '8', to: '12' } })}
                style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>
                Återställ standard
              </button>
              <SectionSaveBtn section="zone" />
            </div>
          </div>
        )}
      </div>

      {/* ═══ SPARA ALLT ══════════════════════════════════════════════════ */}
      <button onClick={saveAll} style={{
        width: '100%', padding: '13px 0', borderRadius: 10,
        background: savedSection === 'all' ? '#16a34a' : '#6366f1',
        color: '#fff', border: 'none', fontWeight: 700,
        fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
        transition: 'background 0.3s', marginTop: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        {savedSection === 'all' ? '✓ Alla inställningar sparade' : '💾 Spara alla inställningar'}
      </button>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD v3 — skal och Översikt
// Principer: värden i neutral text, färg bara som statusmarkör + etikett,
// inga simulerade trender, allt klickbart leder till rätt flik.
// ═══════════════════════════════════════════════════════════════════════════

const fixReason = (t) => String(t || '')
  .replace(/Brist om 0\.0 dagar/g, 'Slut i lager')
  .replace(/brist om 0\.0 dagar/g, 'slut i lager');

const fmtMoney = (n) => {
  if (n == null) return { v: '—', u: '' };
  const a = Math.abs(n);
  if (a >= 1e6) return { v: (n / 1e6).toLocaleString('sv-SE', { maximumFractionDigits: 1, minimumFractionDigits: 1 }), u: 'Mkr' };
  if (a >= 1e4) return { v: Math.round(n / 1e3).toLocaleString('sv-SE'), u: 'tkr' };
  return { v: Math.round(n).toLocaleString('sv-SE'), u: 'kr' };
};

// ─── Uträkning och säkerhet per artikel (motor v2.11) ─────────────────────
const nf = (n, d = 1) => (n == null || Number.isNaN(Number(n)) ? '—'
  : Number(n).toLocaleString('sv-SE', { maximumFractionDigits: d }));
const LT_SOURCE = { fil: 'från filen', 'leverantör': 'från leverantörsinställningen', standard: 'standardvärde – saknas i filen' };
const STATUS_SV = { CRITICAL: 'Kritisk', WATCH: 'Bevaka', OK: 'OK', OVERSTOCK: 'Överlager', DEAD_STOCK: 'Dött lager' };
const CONF_LABEL = { 'HÖG': 'Hög', MEDEL: 'Medel', 'LÅG': 'Låg' };
const CONF_TONE = { 'HÖG': 'good', MEDEL: 'warn', 'LÅG': 'crit' };

function ConfidenceChip({ a }) {
  if (!a?.confidence) return null;
  const reasons = a.confidence_reasons || [];
  return (
    <span className={`lt-conf ${CONF_TONE[a.confidence] || ''}`}
      title={reasons.length ? `Säkerhet ${CONF_LABEL[a.confidence].toLowerCase()}:\n${reasons.join('\n')}` : 'Säkerhet hög: komplett underlag'}>
      <span className={`lt-tone-dot ${CONF_TONE[a.confidence] || ''}`} />Säkerhet {CONF_LABEL[a.confidence]?.toLowerCase()}
    </span>
  );
}

function CalcBreakdown({ a, cycleDays = 30 }) {
  if (!a) return null;
  if (a.reorder_point == null) {
    return <p className="lt-calc-note">Uträkningen visas för analyser som körts efter uppdateringen. Kör analysen igen för att se den.</p>;
  }
  const d = Number(a.demand_per_day) || 0;
  if (d <= 0) {
    return (
      <div className="lt-calc">
        <p className="lt-calc-note">
          Ingen förbrukning registrerad{a.stock > 0 ? `, men ${nf(a.stock, 0)} st i lager (${fmtKr(a.stock_value)}). Därför räknas artikeln som dött lager.` : '.'}
        </p>
      </div>
    );
  }
  const dd = d < 0.1 ? 4 : d < 1 ? 3 : 2;
  const lt = Number(a.lead_time_days) || 0;
  const ss = Number(a.safety_stock_units) || 0;
  const rop = Number(a.reorder_point);
  const pos = Number(a.effective_stock ?? a.stock) || 0;
  const upto = Number(a.order_up_to ?? rop + d * cycleDays);
  const moq = Number(a.moq) || 1;
  const rows = [
    { k: 'Förbrukning', v: fmtRate(d),
      s: [a.demand_source, a.demand_method === 'trendnivå' ? `tydlig ${a.demand_trend === 'MINSKANDE' ? 'minskning' : 'ökning'} – nivån senaste månaden används` : null,
          d < 0.95 ? `${nf(d, dd)} st/dag` : null].filter(Boolean).join(' · ') },
    { k: 'Ledtid', v: `${nf(lt, 0)} dagar`, s: LT_SOURCE[a.lead_time_source] || '' },
    { k: 'Säkerhetslager', v: `${nf(ss)} st`,
      s: [`${nf(a.safety_stock_days)} dagars förbrukning · servicenivåmål ${nf(a.service_target_pct)} %${a.service_target_source === 'inställning' ? ' (din inställning)' : ''}`,
          a.demand_cv_used != null ? `variation ${nf(a.demand_cv_used, 2)}${a.demand_cv_source === 'antagen' ? ' (antagen – historik saknas)' : ''}` : null,
          a.lead_time_std_source === 'antagen' ? 'ledtidsvariation antagen 10 %' : null].filter(Boolean).join(' · ') },
    { k: 'Beställningspunkt', v: `${nf(rop)} st`, s: `${nf(d, dd)} × ${nf(lt, 0)} + ${nf(ss)}`, strong: true },
    { k: 'Lagerposition', v: `${nf(pos, 0)} st`,
      s: a.ordered_qty > 0 ? `saldo ${nf(a.stock, 0)} + beställt ${nf(a.ordered_qty, 0)}` : 'saldo, inget beställt' },
  ];
  if (a.order_qty > 0) {
    rows.push({ k: 'Beställ upp till', v: `${nf(upto)} st`, s: `beställningspunkt + ${cycleDays} dagars förbrukning` });
    rows.push({ k: 'Förslag', v: `${nf(a.order_qty, 0)} st`, strong: true,
      s: `${nf(upto)} − ${nf(pos, 0)} = ${nf(Math.max(0, upto - pos))}, ${moq > 1 ? `avrundat uppåt till hela ${nf(moq, 0)}-tal` : 'avrundat uppåt'}` });
  }
  let rule;
  if (a.order_qty > 0 && a.moq_warning) rule = `MOQ ${nf(moq, 0)} st gör att lagret räcker ${fmtDuration(a.moq_warning_days)}. Kontrollera med leverantören om mindre antal går, eller om artikeln ska beställas mot order.`;
  else if (a.order_confirm_eta) rule = `Saldot räcker ${nf(a.raw_coverage_days)} dagar och ledtiden är ${nf(lt, 0)} dagar. ${nf(a.ordered_qty, 0)} st är beställda men saknar leveransdatum – bekräfta datumet med leverantören.`;
  else if (a.order_qty > 0) rule = `Förslaget gäller så länge lagerpositionen är högst ${nf(rop, 0)} st. Ändras förbrukning eller ledtid räknas det om.`;
  else if (a.status === 'CRITICAL' && a.ordered_qty > 0) rule = 'Lagerpositionen räcker, men saldot tar slut innan leveransen kommer. Det som hjälper är en tidigare leverans.';
  else if (a.status === 'OVERSTOCK') rule = `Lagret räcker ${nf(a.coverage_days, 0)} dagar. Målet är högst 180 dagar – inget behöver köpas in.`;
  else rule = `Beställ när lagerpositionen når ${nf(rop, 0)} st${a.reorder_date && a.reorder_date !== 'Idag' ? `, omkring ${a.reorder_date}` : ''}.`;
  const reasons = a.confidence_reasons || [];
  return (
    <div className="lt-calc">
      <dl>
        {rows.map(r => (
          <div key={r.k} className={r.strong ? 'strong' : ''}>
            <dt>{r.k}</dt>
            <dd><b className="lt-num">{r.v}</b>{r.s && <span>{r.s}</span>}</dd>
          </div>
        ))}
      </dl>
      <p className="lt-calc-rule">{rule}</p>
      {a.confidence && (
        <div className="lt-calc-conf">
          <ConfidenceChip a={a} />
          <span>{reasons.length ? reasons.join(' · ') : 'Komplett underlag: historik, ledtid och pris finns.'}</span>
        </div>
      )}
    </div>
  );
}

// ─── Artikelpanel ─────────────────────────────────────────────────────────
function ArticleDetailPanel({ article, onClose, onLedtidChange, ledtidOverride }) {
  const [explanation, setExplanation] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiFailed, setAiFailed] = useState(false);
  const [editingLedtid, setEditingLedtid] = useState(false);
  const [ledtidInput, setLedtidInput] = useState('');
  const a = article;

  useEffect(() => { setExplanation(null); setAiFailed(false); }, [a?.article]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!a) return null;

  const askAI = () => {
    setLoadingAI(true); setAiFailed(false);
    fetch(`${API}/explain-article`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        article: a.article, name: a.name || '', abc: a.abc || '', xyz: a.xyz || null, status: a.status || '',
        stock: a.stock ?? 0, demand_per_day: a.demand_per_day ?? 0, coverage_days: a.coverage_days ?? 0,
        lead_time_days: a.lead_time_days ?? 14, order_qty: a.order_qty ?? 0, cost: a.cost ?? 0, loc: a.loc || '',
        ordered_qty: a.ordered_qty ?? 0, eta_date: a.eta_date || null, annual_value: a.annual_value ?? 0,
        demand_trend: a.demand_trend || '', forecast_next_30d: a.forecast_next_30d ?? 0,
        safety_stock_days: a.safety_stock_days ?? 0,
      }),
    })
      .then(r => r.json())
      .then(d => (d.explanation ? setExplanation(d.explanation) : setAiFailed(true)))
      .catch(() => setAiFailed(true))
      .finally(() => setLoadingAI(false));
  };

  const saveLedtid = () => {
    const days = parseInt(ledtidInput, 10);
    if (days > 0 && onLedtidChange) onLedtidChange(a.article, days);
    setEditingLedtid(false);
  };

  const cov = Number(a.coverage_days ?? 0);
  const raw = Number(a.raw_coverage_days ?? cov);
  const lt = Number(a.lead_time_days ?? 14);
  const hasDemand = (a.demand_per_day || 0) > 0;
  const scale = Math.max(lt * 2, Math.min(cov, 400), 30);
  const pct = (v) => `${Math.max(0, Math.min(100, v / scale * 100))}%`;
  const tone = { CRITICAL: 'crit', WATCH: 'warn', OVERSTOCK: 'over', DEAD_STOCK: 'dead' }[a.status] || 'good';
  const eta = a.eta_date && !['NaT', 'nat', 'null', 'None', 'undefined', ''].includes(String(a.eta_date).trim()) ? String(a.eta_date).slice(0, 10) : null;
  const kv = [
    ['Saldo', `${fmt(a.stock)} st`],
    ['Beställt', a.ordered_qty > 0 ? `${fmt(a.ordered_qty)} st${eta ? ` · ${eta}` : ''}${a.order_late ? ' · försenad' : ''}` : '—'],
    ['Förbrukning', hasDemand ? fmtRate(a.demand_per_day) : '—'],
    ['Inköpspris', a.cost > 0 ? `${nf(a.cost, 2)} kr` : '—'],
    ['Lagervärde', a.cost > 0 ? fmtKr(a.stock_value ?? a.stock * a.cost) : '—'],
    ['Plats', a.loc_original && a.loc_original !== 'nan' ? `${a.loc_original}${a.suggest_move ? ` → zon ${a.recommended_zone}` : ''}` : (a.loc || '—')],
  ];

  return (
    <div className="lt-drawer-wrap" onClick={onClose}>
      <aside className="lt-drawer" role="dialog" aria-modal="true" aria-label={`Artikel ${a.article}`} onClick={e => e.stopPropagation()}>
        <header className="lt-drawer-head">
          <div>
            <div className="lt-drawer-tags">
              <span className={`lt-status-pill ${tone}`}><span className={`lt-tone-dot ${tone}`} />{STATUS_SV[a.status] || a.status}</span>
              {a.abc && <span className={`lt-abc-key k${a.abc} sm`}>{a.abc}</span>}
              {a.xyz && <span className="lt-chip lt-mono">{a.xyz}</span>}
              <ConfidenceChip a={a} />
            </div>
            <h2>{a.name || a.article}</h2>
            <div className="lt-mono lt-subtle">{a.article}{a.supplier ? ` · ${a.supplier}` : ''}</div>
          </div>
          <button className="lt-icon-btn" onClick={onClose} aria-label="Stäng"><LtIcon name="x" /></button>
        </header>

        {hasDemand && (
          <section className="lt-drawer-sec">
            <div className="lt-drawer-label">Täcktid mot ledtid</div>
            <div className="lt-cov" role="img" aria-label={`Lagret räcker ${nf(cov)} dagar, ledtid ${nf(lt, 0)} dagar`}>
              <i className={tone} style={{ width: pct(cov) }} />
              {raw < cov && <i className="raw" style={{ width: pct(raw) }} />}
              <b style={{ left: pct(lt) }} />
            </div>
            <div className="lt-cov-legend">
              <span><b className="lt-num">{cov >= 999 ? '—' : nf(cov)}</b> dagar{raw < cov ? ` (saldo ${nf(raw)} + inkommande)` : ''}</span>
              {editingLedtid ? (
                <span className="lt-cov-edit">
                  <input type="number" min="1" max="365" value={ledtidInput} autoFocus aria-label="Ny ledtid i dagar"
                    onChange={e => setLedtidInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveLedtid(); if (e.key === 'Escape') setEditingLedtid(false); }} />
                  <button className="lt-btn lt-btn-primary lt-btn-sm" onClick={saveLedtid}>Spara</button>
                  <button className="lt-btn lt-btn-ghost lt-btn-sm" onClick={() => setEditingLedtid(false)}>Avbryt</button>
                </span>
              ) : (
                <button className="lt-link-btn" onClick={() => { setLedtidInput(String(Math.round(lt))); setEditingLedtid(true); }}
                  disabled={!onLedtidChange}>
                  Ledtid {nf(lt, 0)} dagar{ledtidOverride ? ' (ändrad)' : ''}{onLedtidChange ? ' · ändra' : ''}
                </button>
              )}
            </div>
          </section>
        )}

        {a.explanation && (
          <section className="lt-drawer-sec">
            <div className="lt-drawer-label">Rekommendation</div>
            <p className="lt-drawer-rec">{a.explanation}</p>
          </section>
        )}

        <section className="lt-drawer-sec">
          <div className="lt-drawer-label">Nyckeltal</div>
          <dl className="lt-kv">
            {kv.map(([k, v]) => <div key={k}><dt>{k}</dt><dd className="lt-num">{v}</dd></div>)}
          </dl>
        </section>

        <section className="lt-drawer-sec">
          <div className="lt-drawer-label">Så räknade vi</div>
          <CalcBreakdown a={a} />
        </section>

        <section className="lt-drawer-sec">
          {!explanation && (
            <button className="lt-btn lt-btn-ghost lt-btn-sm" onClick={askAI} disabled={loadingAI}>
              {loadingAI ? <span className="lt-spinner" style={{ width: 12, height: 12 }} /> : <LtIcon name="sparkle" size={13} />}
              Förklara med AI
            </button>
          )}
          {explanation && <div className="lt-action-ai" style={{ margin: 0 }}><span className="lt-chip lt-chip-ai">AI</span><p>{explanation}</p></div>}
          {aiFailed && <p className="lt-subtle" style={{ fontSize: 12.5 }}>Förklaringen kunde inte hämtas just nu.</p>}
        </section>
      </aside>
    </div>
  );
}

const ACTION_TYPES = {
  OUT_OF_STOCK:   { label: 'Slut i lager', tone: 'crit' },
  ORDER_CRITICAL: { label: 'Beställ nu', tone: 'crit' },
  ORDER_URGENT:   { label: 'Beställ', tone: 'warn' },
  EXPEDITE:       { label: 'Påskynda', tone: 'warn' },
  CONFIRM_ETA:    { label: 'Bekräfta datum', tone: 'warn' },
  MOVE:           { label: 'Flytta', tone: 'info' },
  REDUCE_STOCK:   { label: 'Kapital', tone: 'muted' },
};

// ─── KPI-kort ─────────────────────────────────────────────────────────────
function KpiTile({ label, value, unit, sub, tone, tooltip, onClick, missing, children }) {
  const Tag = onClick ? 'button' : 'div';
  if (missing) {
    return (
      <div className="lt-kpi-tile is-missing">
        <div className="lt-kpi-tile-label">{label}</div>
        <div className="lt-kpi-tile-value lt-subtle">—</div>
        <div className="lt-kpi-tile-sub">{missing}</div>
      </div>
    );
  }
  return (
    <Tag className={`lt-kpi-tile${onClick ? ' is-link' : ''}`} onClick={onClick} type={onClick ? 'button' : undefined}>
      <div className="lt-kpi-tile-label">
        {tone && <span className={`lt-tone-dot ${tone}`} />}
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <div className="lt-kpi-tile-value">{value}{unit && <span className="lt-unit">{unit}</span>}</div>
      {sub && <div className="lt-kpi-tile-sub">{sub}</div>}
      {children}
    </Tag>
  );
}

// ─── Lagerstatus som en stapel ────────────────────────────────────────────
const STATUS_SEGMENTS = [
  { key: 'critical', label: 'Kritisk', cls: 'crit' },
  { key: 'watch', label: 'Bevaka', cls: 'warn' },
  { key: 'ok', label: 'OK', cls: 'good' },
  { key: 'overstock', label: 'Överlager', cls: 'over' },
  { key: 'dead_stock', label: 'Dött lager', cls: 'dead' },
];
function StatusBar({ summary }) {
  const total = Math.max(1, summary.total_articles || 0);
  const segs = STATUS_SEGMENTS.map(s => ({ ...s, n: summary[s.key] || 0 })).filter(s => s.n > 0);
  return (
    <div>
      <div className="lt-statusbar" role="img"
        aria-label={segs.map(s => `${s.label} ${s.n}`).join(', ')}>
        {segs.map(s => (
          <span key={s.key} className={`seg ${s.cls}`} style={{ flexGrow: s.n }}
            title={`${s.label}: ${s.n} artiklar (${Math.round(s.n / total * 100)} %)`} />
        ))}
      </div>
      <div className="lt-statuslegend">
        {STATUS_SEGMENTS.map(s => (
          <div key={s.key}>
            <span className={`lt-tone-dot ${s.cls}`} />
            <span>{s.label}</span>
            <b className="lt-num">{fmt(summary[s.key] || 0)}</b>
            <span className="lt-subtle lt-num">{Math.round((summary[s.key] || 0) / total * 100)} %</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ABC-fördelning ───────────────────────────────────────────────────────
function AbcBars({ dist, hasCost, total }) {
  const maxPct = Math.max(1, ...['A', 'B', 'C'].map(c => dist?.[c]?.pct || 0));
  return (
    <div className="lt-abc">
      {['A', 'B', 'C'].map(c => {
        const d = dist?.[c] || {};
        const share = hasCost ? (d.pct || 0) : Math.round((d.count || 0) / Math.max(1, total) * 100);
        return (
          <div className="lt-abc-row" key={c}>
            <span className={`lt-abc-key k${c}`}>{c}</span>
            <div className="lt-abc-track" title={`${c}: ${fmt(d.count)} artiklar · ${share} %`}>
              <i style={{ width: `${Math.max(2, (hasCost ? share / maxPct : share / 100) * 100)}%` }} />
            </div>
            <span className="lt-abc-n lt-num">{fmt(d.count)} art.</span>
            <span className="lt-abc-v lt-num">{hasCost ? fmtKr(d.value_sek) : `${share} %`}</span>
            <span className="lt-abc-p lt-num lt-subtle">{hasCost ? `${share} %` : ''}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Åtgärdsrad ───────────────────────────────────────────────────────────
function ActionItem({ a, rank, hasCost, articles }) {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const t = ACTION_TYPES[a.type] || { label: 'Åtgärd', tone: 'muted' };
  const art = React.useMemo(() => articles?.find(r => r.article === a.article), [articles, a.article]);

  const explain = async () => {
    if (explanation) { setOpen(o => !o); return; }
    setLoading(true); setFailed(false);
    try {
      const art = articles?.find(r => r.article === a.article) || {};
      const res = await fetch(`${API}/explain-article`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: a.article, name: a.name || art.name || '', abc: a.abc || art.abc || '', xyz: art.xyz || null,
          status: art.status || '', stock: art.stock ?? 0, demand_per_day: art.demand_per_day ?? 0,
          coverage_days: art.coverage_days ?? 0, lead_time_days: art.lead_time_days ?? 14,
          order_qty: art.order_qty ?? 0, cost: art.cost ?? 0, loc: art.loc || '',
          ordered_qty: art.ordered_qty ?? 0, eta_date: art.eta_date || null, annual_value: art.annual_value ?? 0,
          demand_trend: art.demand_trend || '', forecast_next_30d: art.forecast_next_30d ?? 0,
          safety_stock_days: art.safety_stock_days ?? 0,
        })
      });
      const data = await res.json();
      if (data.explanation) { setExplanation(data.explanation); setOpen(true); } else setFailed(true);
    } catch { setFailed(true); }
    setLoading(false);
  };

  return (
    <li className="lt-action">
      <div className="lt-action-main">
        <span className="lt-action-rank lt-mono">{String(rank).padStart(2, '0')}</span>
        <span className={`lt-action-type ${t.tone}`}>{t.label}</span>
        <div className="lt-action-body">
          <div className="lt-action-title">
            <b>{a.name || a.article}</b>
            {a.name && <span className="lt-mono lt-subtle">{a.article}</span>}
            {a.abc && <span className={`lt-abc-key k${a.abc} sm`}>{a.abc}</span>}
          </div>
          <div className="lt-action-desc">
            <span className="lt-action-do">{a.action}</span> · {fixReason(a.reason)}
            {hasCost && a.risk_sek > 0 && <> · <span className="lt-action-risk">{fmtKr(a.risk_sek)} i risk</span></>}
          </div>
        </div>
        <span className="lt-action-value lt-num">
          {hasCost && a.value_sek > 0 && (
            <span className="lt-action-vwrap">{fmtKr(a.value_sek)}
              <span className="lt-action-vlabel">{a.type === 'REDUCE_STOCK' ? 'över målet' : 'ordervärde'}</span>
            </span>
          )}
          {art?.confidence && art.confidence !== 'HÖG' && <ConfidenceChip a={art} />}
        </span>
        <div className="lt-action-btns">
          {art && art.reorder_point != null && (
            <button className="lt-btn lt-btn-ghost lt-btn-sm" onClick={() => setShowCalc(v => !v)} aria-expanded={showCalc}>
              {showCalc ? 'Dölj uträkning' : 'Uträkning'}
            </button>
          )}
          <button className="lt-btn lt-btn-ghost lt-btn-sm" onClick={explain} disabled={loading} aria-expanded={open}>
            {loading ? <span className="lt-spinner" style={{ width: 12, height: 12 }} /> : <LtIcon name="sparkle" size={13} />}
            {open ? 'Dölj' : 'Förklara'}
          </button>
        </div>
      </div>
      {showCalc && art && <div className="lt-action-calc"><CalcBreakdown a={art} /></div>}
      {open && explanation && <div className="lt-action-ai"><span className="lt-chip lt-chip-ai">AI</span><p>{explanation}</p></div>}
      {failed && <div className="lt-action-ai"><p className="lt-subtle">Förklaringen kunde inte hämtas just nu.</p></div>}
    </li>
  );
}

const cleanAiText = (t) => String(t || '')
  .replace(/^#+[^\n]*\n+/, '')   // rubrikrad från AI
  .replace(/[#*_`]+/g, '')
  .replace(/\s+/g, ' ')
  .trim();

// ─── Datakontroll (ersätter två banners) ──────────────────────────────────
function DataCheck({ validation, summary }) {
  const [open, setOpen] = useState(false);
  const warnings = validation?.warnings || [];
  const missing = [];
  if (!summary.has_cost_data) missing.push('Inköpspris saknas — kapital och ordervärde kan inte räknas');
  if (!summary.has_location_data) missing.push('Lagerposition saknas — slotting kan inte räknas');
  if (!summary.has_lead_time_data) missing.push('Ledtid saknas — standard 14 dagar används');
  else if (summary.lead_time_default_count > 0) missing.push(`Ledtid saknas för ${fmt(summary.lead_time_default_count)} artiklar — standardvärde används för dem`);
  if (summary.orders_late > 0) missing.push(`${fmt(summary.orders_late)} öppna order har passerat leveransdatum — de räknas som på väg`);
  if (summary.orders_no_eta > 0) missing.push(`${fmt(summary.orders_no_eta)} öppna order saknar leveransdatum — de räknas som på väg`);
  if (summary.history_age_months >= 3 && summary.history_last_period) {
    const [hy, hm] = summary.history_last_period.split('-');
    missing.push(`Förbrukningshistoriken slutar ${LT_MONTHS[Number(hm) - 1]} ${hy}, ${summary.history_age_months} månader sedan — prognosen bygger på den`);
  }
  if (summary.moq_warning_count > 0) missing.push(`${fmt(summary.moq_warning_count)} inköpsförslag styrs av MOQ och ger lager för mer än ett år${summary.moq_warning_value_sek > 0 ? ` (${fmtKr(summary.moq_warning_value_sek)})` : ''} — kontrollera med leverantören`);
  if (summary.orders_confirm_eta > 0) missing.push(`${fmt(summary.orders_confirm_eta)} artiklar har order utan leveransdatum och saldo som inte räcker ledtiden — bekräfta datum`);
  if (summary.safety_stock_fallback > 0 && summary.xyz_available === false) missing.push(`Månadshistorik saknas — säkerhetslagret bygger på en antagen variation (${String(summary.safety_stock_assumed_cv ?? 0.5).replace('.', ',')}). Med 12 månaders historik blir det exaktare`);
  if (summary.confidence_low > 0) missing.push(`${fmt(summary.confidence_low)} förslag har låg säkerhet — se skälen under Uträkning`);
  const items = [...missing, ...warnings];
  if (!validation?.summary && !items.length) return null;
  return (
    <div className="lt-datacheck">
      <div className="lt-datacheck-row">
        <span className="lt-eyebrow">Datakontroll</span>
        {validation?.ai_generated && <span className="lt-chip lt-chip-ai"><LtIcon name="sparkle" size={11} /> AI</span>}
        <span className="lt-datacheck-text">{cleanAiText(validation?.summary) || `${items.length} saker att känna till om datan.`}</span>
        {items.length > 0 && (
          <button className="lt-link-btn" onClick={() => setOpen(o => !o)} aria-expanded={open}>
            {open ? 'Dölj' : `${items.length} ${items.length === 1 ? 'anmärkning' : 'anmärkningar'}`}
          </button>
        )}
      </div>
      {open && <ul className="lt-notes" style={{ marginTop: 8 }}>{items.map((w, i) => <li key={i}>{w}</li>)}</ul>}
    </div>
  );
}

// ─── Översikt ─────────────────────────────────────────────────────────────
function OverviewTab({ data, onLedtidChange, ledtidOverrides, onResetLedtider, onNavigate = () => {} }) {
  const { summary, top_actions, abc_distribution, articles, validation } = data;
  const hasCost = summary.has_cost_data;
  const hasLoc = summary.has_location_data;

  const facts = React.useMemo(() => {
    const crit = (articles || []).filter(a => a.status === 'CRITICAL');
    return {
      critA: crit.filter(a => a.abc === 'A').length,
      outOfStock: summary.out_of_stock ?? crit.filter(a => (a.stock || 0) <= 0).length,
      outNoOrder: summary.out_of_stock_no_order ?? null,
      incoming: (articles || []).filter(a => (a.ordered_qty || 0) > 0).length,
    };
  }, [articles]);

  const share = (v) => (hasCost && summary.total_stock_value_sek > 0 ? (v || 0) / summary.total_stock_value_sek * 100 : null);
  const pctLabel = (x) => (x == null ? '—' : x > 0 && x < 1 ? '<1' : String(Math.round(x)));
  const overRaw = share(summary.overstock_value_sek), deadRaw = share(summary.dead_stock_value_sek);
  const overPct = overRaw == null ? null : Math.round(overRaw);
  const deadPct = deadRaw == null ? null : Math.round(deadRaw);
  const cap = fmtMoney(summary.total_stock_value_sek);

  // Läget i en mening
  let brief;
  if (summary.critical > 0) {
    brief = {
      tone: 'crit',
      title: `${fmt(summary.critical)} av ${fmt(summary.articles_with_demand ?? summary.total_articles)} artiklar riskerar brist`,
      text: [
        facts.outOfStock > 0 ? `${fmt(facts.outOfStock)} är redan slut i lager${facts.outNoOrder ? ` (${fmt(facts.outNoOrder)} utan order)` : ''}` : null,
        facts.critA > 0 ? `${fmt(facts.critA)} är A-artiklar` : null,
      ].filter(Boolean).join(' och ') + (facts.outOfStock || facts.critA ? '. ' : '') +
        (hasCost && summary.total_risk_sek > 0 ? `Förbrukning för ${fmtKr(summary.total_risk_sek)} hinner inte täckas om inget görs. ` : '') +
        (hasCost && summary.total_order_value_sek > 0 ? `Inköpsförslaget: ${fmt(summary.articles_to_order)} artiklar för ${fmtKr(summary.total_order_value_sek)}${summary.moq_warning_value_sek > 0 ? `, varav ${fmtKr(summary.moq_warning_value_sek)} styrs av MOQ och bör kontrolleras` : ''}.` : 'Se inköpsförslaget för kvantiteter.'),
      cta: 'Öppna inköpslistan', tab: 'purchasing',
    };
  } else if (summary.articles_to_order > 0) {
    brief = { tone: 'warn', title: `${fmt(summary.articles_to_order)} artiklar bör beställas snart`,
      text: 'Ingen akut brist, men lagerpositionen har nått beställningspunkten för dessa artiklar.', cta: 'Öppna inköpslistan', tab: 'purchasing' };
  } else {
    brief = { tone: 'good', title: 'Lagret är i balans', text: `${fmt(summary.total_articles)} artiklar utan akut brist.`, cta: null };
  }

  return (
    <div className="tab-content lt-overview">
      <section className={`lt-brief ${brief.tone}`}>
        <div className="lt-brief-main">
          <div className="lt-eyebrow">Läget just nu</div>
          <h2>{brief.title}</h2>
          <p>{brief.text}</p>
          {overPct != null && overPct >= 10 && (
            <p className="lt-brief-second">
              {fmtKr(summary.overstock_value_sek)} ({overPct} % av lagervärdet) är bundet i överlager.{' '}
              <button className="lt-link-btn" onClick={() => onNavigate('capital')}>Se kapital</button>
            </p>
          )}
        </div>
        {brief.cta && (
          <button className="lt-btn lt-btn-primary lt-btn-lg" onClick={() => onNavigate(brief.tab)}>
            {brief.cta} <LtIcon name="arrow" />
          </button>
        )}
      </section>

      <DataCheck validation={validation} summary={summary} />

      <div className="lt-kpi-row">
        <KpiTile label="Kritiska brister" tone="crit" value={fmt(summary.critical)}
          sub={`${fmt(summary.watch)} bevakas${facts.outOfStock ? ` · ${fmt(facts.outOfStock)} slut i lager` : ''}`}
          onClick={() => onNavigate('purchasing')}
          tooltip={"Kritisk = slut i lager, tar slut innan inkommande leverans, eller saldo + inkommande räcker kortare än ledtiden.\nBevaka = lagerpositionen har nått beställningspunkten, eller täcktiden är under 2× (A), 1,5× (B), 1,2× (C) ledtiden."} />
        <KpiTile label="Att beställa" tone="warn" value={fmt(summary.articles_to_order)}
          sub={hasCost ? `Ordervärde ${fmtKr(summary.total_order_value_sek)}` : 'Lägg till inköpspris för ordervärde'}
          onClick={() => onNavigate('purchasing')}
          tooltip={"Lagerpositionen (saldo + alla öppna order) är nere på beställningspunkten: förbrukning × ledtid + säkerhetslager.\nKvantiteten fyller upp till beställningspunkten + 30 dagars förbrukning, avrundat uppåt till MOQ."} />
        <KpiTile label="Bundet kapital" value={hasCost ? cap.v : null} unit={hasCost ? cap.u : null}
          missing={!hasCost ? 'Kräver inköpspris i filen' : null}
          sub={hasCost ? `${fmtKr(summary.total_stock_value_sek)}` : null}
          onClick={hasCost ? () => onNavigate('capital') : undefined}
          tooltip={"Saldo × inköpspris för alla artiklar.\nÖverlager = täcktid över 365 dagar. Dött lager = saldo utan förbrukning."}>
          {hasCost && (
            <div className="lt-mini">
              <div className="lt-minibar" role="img" aria-label={`Överlager ${overPct} %, dött lager ${deadPct} %`}>
                <span className="seg over" style={{ width: `${overPct}%` }} />
                <span className="seg dead" style={{ width: `${deadRaw > 0 ? Math.max(1, deadRaw) : 0}%` }} />
              </div>
              <div className="lt-mini-legend">
                <span><span className="lt-tone-dot over" />Överlager {pctLabel(overRaw)} %</span>
                <span><span className="lt-tone-dot dead" />Dött {pctLabel(deadRaw)} %</span>
              </div>
            </div>
          )}
        </KpiTile>
        <KpiTile label="Att flytta" value={hasLoc ? fmt(summary.moves_top_closer ?? summary.articles_to_move) : null}
          missing={!hasLoc ? 'Kräver lagerposition i filen' : null}
          sub={summary.moves_top_closer != null ? `ger 80 % av vinsten · ${fmt(summary.articles_to_move)} totalt` : 'A-artiklar långt från plock'} onClick={hasLoc ? () => onNavigate('slotting') : undefined}
          tooltip={"Flyttar närmare plock för artiklar som plockas ofta. Antalet är de flyttar som tillsammans ger 80 % av vinsten i kortare plockväg."} />
        <KpiTile label="Dött lager" tone="dead" value={fmt(summary.dead_stock)}
          sub={hasCost ? `${fmtKr(summary.dead_stock_value_sek)} utan förbrukning` : 'artiklar utan förbrukning'}
          onClick={() => onNavigate('capital')}
          tooltip={"Saldo > 0 men ingen registrerad förbrukning. Binder kapital utan att bidra till servicenivån."} />
      </div>

      {top_actions?.length > 0 && (
        <section className="lt-panel lt-actionpanel">
          <div className="lt-panel-head">
            <div>
              <h3>Åtgärder i prioritetsordning</h3>
              <div className="lt-hint">Leveransrisk först, sorterad efter kronor i risk. Sedan kapital och flyttar.</div>
            </div>
            <span className="lt-chip lt-mono">{top_actions.length}</span>
          </div>
          <ol className="lt-action-list">
            {top_actions.map((a, i) => <ActionItem key={`${a.article}-${i}`} a={a} rank={i + 1} hasCost={hasCost} articles={articles} />)}
          </ol>
        </section>
      )}

      <div className="lt-two">
        <section className="lt-panel lt-panel-pad">
          <div className="lt-panel-head flat">
            <h3>Lagerstatus</h3>
            <span className="lt-hint lt-num">{fmt(summary.total_articles)} artiklar</span>
          </div>
          <StatusBar summary={summary} />
        </section>
        <section className="lt-panel lt-panel-pad">
          <div className="lt-panel-head flat">
            <h3>ABC-fördelning <InfoTooltip text="A = artiklar som står för 80 % av årsvärdet (förbrukning × pris). B = nästa 15 %. C = sista 5 %." /></h3>
            <span className="lt-hint">{hasCost ? 'andel av lagervärdet' : 'baserad på förbrukning'}</span>
          </div>
          <AbcBars dist={abc_distribution} hasCost={hasCost} total={summary.total_articles} />
          <button className="lt-link-btn" style={{ marginTop: 12 }} onClick={() => onNavigate('abcxyz')}>Öppna ABC/XYZ-matrisen →</button>
        </section>
      </div>

      <section className="section">
        <div className="section-header">
          <h3>Alla artiklar</h3>
          <span className="badge">{fmt(summary.total_articles)} st</span>
        </div>
        <ArticleTable articles={articles} hasCost={hasCost} hasLoc={hasLoc} onLedtidChange={onLedtidChange} ledtidOverrides={ledtidOverrides} onResetLedtider={onResetLedtider} />
      </section>
    </div>
  );
}

// ─── Sidomenyns servicenivå + datakvalitet ────────────────────────────────
function ServiceLevelCard({ summary }) {
  const v = summary?.a_service_level_pct;
  let target = Number(summary?.service_targets?.A) || 98;
  try { target = Number(JSON.parse(localStorage.getItem('logitide-globalSettings') || '{}').serviceLevelA) || target; } catch {}
  const tone = v >= target ? 'good' : v >= target - 10 ? 'warn' : 'crit';
  return (
    <div className="lt-sl">
      <div className="lt-sl-head">
        <span>Servicenivå A-artiklar</span>
        <InfoTooltip text={`Andel A-artiklar med förbrukning som klarar ledtiden: inte slut i lager, tar inte slut innan leverans och saldo + inkommande räcker över ledtiden. Mål: ${target} %.`} />
      </div>
      <div className="lt-sl-value lt-num">{v ?? '—'}<span className="lt-unit">%</span></div>
      <div className="lt-sl-track" role="img" aria-label={`Servicenivå ${v} procent, mål ${target} procent`}>
        <i className={tone} style={{ width: `${Math.min(100, v || 0)}%` }} />
        <b style={{ left: `${target}%` }} title={`Mål ${target} %`} />
      </div>
      <div className="lt-sl-foot">
        <span className={`lt-tone-dot ${tone}`} />{v >= target ? 'På mål' : `${(target - (v || 0)).toFixed(1).replace('.', ',')} procentenheter under mål ${target} %`}
      </div>
      <div className="lt-sl-all lt-num">Alla artiklar: <b>{summary?.service_level_pct ?? '—'} %</b>
        {summary?.a_in_stock_pct != null && <> · i lager nu: <b>{summary.a_in_stock_pct} %</b></>}</div>
    </div>
  );
}

function QualityChecks({ summary, dataQuality }) {
  const checks = [
    { ok: summary.has_cost_data, label: 'Inköpspris' },
    { ok: summary.has_location_data, label: 'Lagerposition' },
    { ok: summary.has_lead_time_data, label: summary.lead_time_default_count > 0 && summary.has_lead_time_data ? 'Ledtid (delvis)' : 'Ledtid',
      partial: summary.lead_time_default_count > 0 && summary.has_lead_time_data,
      title: summary.lead_time_default_count > 0 ? `Standardledtid används för ${fmt(summary.lead_time_default_count)} artiklar` : undefined },
    { ok: !!summary.xyz_available, label: 'Månadshistorik' },
  ];
  const ok = checks.filter(c => c.ok && !c.partial).length;
  return (
    <div className="lt-qc">
      <div className="lt-sl-head"><span>Dataunderlag</span><span className="lt-mono">{ok}/{checks.length}</span></div>
      {summary.confidence_high != null && (
        <div className="lt-qc-conf lt-num" title="Hur säkra förslagen är, baserat på historik, ledtid, pris och öppna order.">
          Säkerhet: <b>{fmt(summary.confidence_high)}</b> hög · <b>{fmt(summary.confidence_medium)}</b> medel · <b>{fmt(summary.confidence_low)}</b> låg
        </div>
      )}
      <ul>
        {checks.map(c => (
          <li key={c.label} className={c.ok && !c.partial ? '' : 'miss'} title={c.title}>
            <span className="mark">{c.ok && !c.partial ? <LtIcon name="check" size={12} stroke={2.4} /> : '–'}</span>{c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

const DASH_ICONS = { overview: 'home', abcxyz: 'grid', purchasing: 'trending', slotting: 'move', capital: 'money', history: 'refresh', settings: 'info' };

function Dashboard({ data, onReset, auth, onLogout, theme, onToggleTheme, onLoadAnalysis }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [ledtidOverrides, setLedtidOverrides] = useState({});
  const mainRef = React.useRef(null);

  const handleLedtidChange = (articleId, newDays) => {
    setLedtidOverrides(prev => ({ ...prev, [articleId]: newDays }));
  };
  const handleResetLedtider = () => {
    if (window.confirm('Återställ alla manuella ledtider till originalvärden?')) setLedtidOverrides({});
  };

  // Ledtids-overrides räknas om lokalt; övrig logik (zoner, slotting) görs i backend
  const effectiveData = React.useMemo(() => {
    if (Object.keys(ledtidOverrides).length === 0) return data;
    const articles = (data.articles || []).map(a => {
      const override = ledtidOverrides[a.article];
      return override != null ? recalcArticle(a, override) : a;
    });
    return { ...data, articles };
  }, [data, ledtidOverrides]);

  const go = (tab) => {
    setActiveTab(tab);
    try { window.scrollTo({ top: 0 }); } catch {}
  };

  const { summary } = effectiveData;
  const tabs = [
    { id: 'overview', label: 'Översikt' },
    { id: 'abcxyz', label: 'ABC/XYZ' },
    { id: 'purchasing', label: 'Inköp', badge: summary?.articles_to_order, tone: summary?.critical > 0 ? 'crit' : '' },
    { id: 'slotting', label: 'Slotting', badge: summary?.has_location_data ? (summary?.moves_top_closer ?? summary?.articles_to_move) : null },
    { id: 'capital', label: 'Kapital', badge: summary?.has_cost_data ? ((summary?.dead_stock || 0) + (summary?.overstock || 0)) : null },
    ...(auth ? [{ id: 'history', label: 'Historik' }] : []),
    { id: 'settings', label: 'Inställningar' },
  ];
  const current = tabs.find(t => t.id === activeTab);
  const meta = effectiveData?.import_meta;
  const sourceName = meta?.filenames?.length ? (meta.filenames.length === 1 ? meta.filenames[0] : `${meta.filenames[0]} + ${meta.filenames.length - 1}`) : null;

  return (
    <div className="lt-dash">
      <aside className="lt-side">
        <div className="lt-side-top">
          <Brand size={26} />
          <button className="lt-btn lt-btn-secondary lt-btn-block lt-side-new" onClick={onReset}>
            <LtIcon name="plus" size={14} /> Ny analys
          </button>
        </div>
        <nav className="lt-side-nav" aria-label="Flikar">
          {tabs.map(t => (
            <button key={t.id} className={`lt-nav${activeTab === t.id ? ' is-active' : ''}`} onClick={() => go(t.id)}
              aria-current={activeTab === t.id ? 'page' : undefined}>
              <Icon name={DASH_ICONS[t.id]} size={15} />
              <span>{t.label}</span>
              {t.badge > 0 && <span className={`lt-nav-badge ${t.tone || ''}`}>{t.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="lt-side-foot">
          {summary && <ServiceLevelCard summary={summary} />}
          {summary && <QualityChecks summary={summary} dataQuality={data?.data_quality} />}
          {summary && (
            <button className="lt-btn lt-btn-secondary lt-btn-block" onClick={() => openPDFReport()} title="Generera månadsrapport som PDF">
              <Icon name="download" size={13} /> Månadsrapport
            </button>
          )}
          {auth && (
            <div className="lt-side-user">
              <span title={auth.email}>{auth.email}</span>
              <button className="lt-link-btn" onClick={onLogout}>Logga ut</button>
            </div>
          )}
        </div>
      </aside>

      <main className="lt-main main-content" ref={mainRef}>
        <header className="lt-main-top">
          <div style={{ minWidth: 0 }}>
            <h1>{current?.label}</h1>
            <div className="lt-main-meta">
              {sourceName && <span className="lt-mono" title={sourceName}>{sourceName}</span>}
              <span className="lt-num">{fmt(summary?.total_articles)} artiklar</span>
              {summary?.analysis_timestamp && <span>Analyserad {summary.analysis_timestamp}</span>}
            </div>
          </div>
          <div className="lt-main-actions">
            {summary?.critical > 0 && (
              <button className="lt-chip lt-chip-err lt-chip-btn" onClick={() => go('purchasing')}><span className="dot" />{summary.critical} kritiska</button>
            )}
            {summary?.articles_to_order > 0 && (
              <button className="lt-chip lt-chip-warn lt-chip-btn" onClick={() => go('purchasing')}>{summary.articles_to_order} att beställa</button>
            )}
            {summary?.overstock > 0 && summary?.has_cost_data && (
              <button className="lt-chip lt-chip-btn" onClick={() => go('capital')}>{summary.overstock} överlager</button>
            )}
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </header>
        {activeTab === 'overview' && <OverviewTab data={effectiveData} onNavigate={go} onLedtidChange={handleLedtidChange} ledtidOverrides={ledtidOverrides} onResetLedtider={Object.keys(ledtidOverrides).length > 0 ? handleResetLedtider : null} />}
        {activeTab === 'abcxyz' && <AbcXyzTab data={effectiveData} />}
        {activeTab === 'purchasing' && <PurchasingTab data={effectiveData} />}
        {activeTab === 'slotting' && <SlottingTab data={effectiveData} />}
        {activeTab === 'capital' && <CapitalTab data={effectiveData} />}
        {activeTab === 'history' && auth && <HistoryTab token={auth.token} onLoadAnalysis={onLoadAnalysis} />}
        {activeTab === 'settings' && <SettingsTab data={effectiveData} />}
      </main>
    </div>
  );
}

// ─── DASHBOARD HOME (startsida efter inloggning) ─────────────────────────
// ─── DASHBOARD HOME ───────────────────────────────────────────────────────

// KPI-fält som behövs — visas visuellt på startsidan
const KPI_FIELDS = [
  { key: 'artikel',    label: 'Artikelnummer',    icon: '🔖', required: true,  desc: 'Unikt ID per artikel' },
  { key: 'saldo',     label: 'Lagersaldo',        icon: '📦', required: true,  desc: 'Aktuellt lagerantal' },
  { key: 'forbruk',   label: 'Förbrukning',       icon: '📈', required: true,  desc: 'Försäljning/uttag' },
  { key: 'pris',      label: 'Inköpspris',        icon: '💰', required: false, desc: 'Aktiverar kapital-KPI:er' },
  { key: 'ledtid',    label: 'Ledtid (dagar)',    icon: '🚚', required: false, desc: 'Förbättrar beställningsanalys' },
  { key: 'position',  label: 'Lagerposition',     icon: '📍', required: false, desc: 'Aktiverar slotting-analys' },
  { key: 'moq',       label: 'MOQ',               icon: '📋', required: false, desc: 'Minsta orderkvantitet' },
  { key: 'inkommande',label: 'Inkommande order',  icon: '🔄', required: false, desc: 'Förbättrar servicenivå' },
];

// ═══════════════════════════════════════════════════════════════════════════
// LOGITIDE V3 — inloggning, startsida och importstudio
// Stilar: logitide-v3.css (lt-*-klasser). All text på svenska.
// ═══════════════════════════════════════════════════════════════════════════

// Logotyp: tre staplar A/B/C — Pareto som varumärke
function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="var(--bg3)" stroke="var(--border-strong)" />
      <path d="M8.5 11h15" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M8.5 16h10" stroke="var(--text)" strokeOpacity=".8" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M8.5 21h5" stroke="var(--text)" strokeOpacity=".4" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function Brand({ size = 28 }) {
  return (
    <div className="lt-brand">
      <LogoMark size={size} />
      <div>
        <div className="lt-brand-name">Logitide</div>
        <div className="lt-brand-sub">OPTIMIZER</div>
      </div>
    </div>
  );
}

const LT_ICONS = {
  upload: <><path d="M12 15V3" /><path d="m7 8 5-5 5 5" /><path d="M20 15v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" /></>,
  x: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><path d="M12 16h.01" /></>,
  arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  back: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  sparkle: <path d="M12 3l1.8 4.9L19 9.7l-5.2 1.8L12 16.4l-1.8-4.9L5 9.7l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
};
function LtIcon({ name, size = 16, stroke = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {LT_ICONS[name]}
    </svg>
  );
}

// ─── Hjälpare för importflödet ────────────────────────────────────────────
const LT_MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const isPeriodField = (f) => !!f && (/^Period_\d{4}_\d{2}$/.test(f) || /^Månad_\d+$/.test(f));
function fieldLabel(f) {
  if (!f) return 'Ignorera';
  if (f === '__date__') return 'Transaktionsdatum';
  if (f === '__qty__') return 'Transaktionsantal';
  let m = f.match(/^Period_(\d{4})_(\d{2})$/);
  if (m) return `Förbrukning ${LT_MONTHS[+m[2] - 1]} ${m[1]}`;
  m = f.match(/^Månad_(\d+)$/);
  if (m) return `Förbrukning ${LT_MONTHS[+m[1] - 1]}`;
  return f;
}
const fmtBytes = (b) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} kB`;
const fmtInt = (n) => (n == null ? '—' : Math.round(n).toLocaleString('sv-SE'));
const LT_MAX_FILES = 5;
const LT_MAX_BYTES = 20 * 1024 * 1024;

function collectSettingsInto(form) {
  try { const cfg = localStorage.getItem('logitide-slottingConfig'); if (cfg) form.append('zone_config', cfg); } catch {}
  try {
    const sup = JSON.parse(localStorage.getItem('logitide-supplierSettings') || '{}');
    const valid = Object.fromEntries(Object.entries(sup).filter(([, v]) => v != null && v !== ''));
    if (Object.keys(valid).length) form.append('supplier_lead_times', JSON.stringify(valid));
    const gs = JSON.parse(localStorage.getItem('logitide-globalSettings') || '{}');
    if (gs.defaultLeadTime) form.append('global_lead_time', String(gs.defaultLeadTime));
    const sl = { A: gs.serviceLevelA, B: gs.serviceLevelB, C: gs.serviceLevelC };
    if (Object.values(sl).some(v => v != null && v !== '')) form.append('service_levels', JSON.stringify(sl));
  } catch {}
}

async function readError(res, fallback) {
  try { const e = await res.json(); return e.detail || fallback; } catch { return fallback; }
}

// Status för en kolumnrad
function rowStatus(sugg, value) {
  const changed = (sugg?.field || '') !== (value || '');
  if (changed) return value ? { cls: 'lt-chip', label: 'Manuell' } : { cls: 'lt-chip lt-chip-muted', label: 'Ignoreras' };
  if (!value) {
    if (sugg?.method === 'ignore') return { cls: 'lt-chip lt-chip-muted', label: 'Ignoreras' };
    if (sugg?.method === 'conflict') return { cls: 'lt-chip lt-chip-warn', label: 'Konflikt', review: true };
    if ((sugg?.samples || []).length === 0) return { cls: 'lt-chip lt-chip-muted', label: 'Tom' };
    return { cls: 'lt-chip lt-chip-muted', label: 'Ej mappad' };
  }
  if (sugg?.confidence === 'auto') return { cls: 'lt-chip lt-chip-ok', label: 'Säker' };
  if (sugg?.method === 'ai') return { cls: 'lt-chip lt-chip-ai', label: 'AI-förslag', review: true };
  return { cls: 'lt-chip lt-chip-warn', label: sugg?.ai_confirmed ? 'Kontrollera · AI håller med' : 'Kontrollera', review: true };
}

// ─── Poängring ────────────────────────────────────────────────────────────
function ScoreRing({ value = 0, size = 64, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value || 0));
  const color = v >= 80 ? 'var(--green)' : v >= 50 ? 'var(--accent)' : 'var(--orange)';
  return (
    <div className="lt-ring" style={{ width: size, height: size }} role="img" aria-label={`Analysgrad ${v} procent`}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg4)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .5s ease' }} />
      </svg>
      <div className="lt-ring-label" style={{ fontSize: size > 80 ? 22 : 15 }}>{v}%</div>
    </div>
  );
}

// ─── Tema-knapp (ersätter emoji-varianten) ────────────────────────────────
function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="lt-theme" onClick={onToggle} title={theme === 'dark' ? 'Byt till ljust läge' : 'Byt till mörkt läge'}
      aria-label={theme === 'dark' ? 'Byt till ljust läge' : 'Byt till mörkt läge'}>
      <LtIcon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
    </button>
  );
}

// ─── Inloggning ───────────────────────────────────────────────────────────
function ParetoIllustration() {
  // Principskiss: kumulativ andel av värdet mot andel av artiklarna (typisk 80/15/5-fördelning)
  const pts = [[0, 0], [5, 42], [10, 60], [20, 80], [35, 89], [50, 95], [70, 98.2], [100, 100]];
  const W = 480, H = 150, px = (x) => 28 + (x / 100) * (W - 40), py = (y) => H - 22 - (y / 100) * (H - 34);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${px(x).toFixed(1)},${py(y).toFixed(1)}`).join(' ');
  return (
    <figure className="lt-pareto" aria-label="Principskiss av ABC-fördelning">
      <div className="lt-pareto-head">
        <b>ABC-principen</b>
        <span className="lt-eyebrow">Andel av lagervärdet</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img">
        <rect x={px(0)} y={py(100)} width={px(20) - px(0)} height={py(0) - py(100)} fill="var(--accent-soft)" />
        {[0, 50, 100].map(y => (
          <g key={y}>
            <line x1={px(0)} x2={px(100)} y1={py(y)} y2={py(y)} stroke="var(--border)" />
            <text x={px(0) - 6} y={py(y) + 3} textAnchor="end" fontSize="9" fill="var(--text3)" fontFamily="var(--mono)">{y}</text>
          </g>
        ))}
        <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2" />
        <line x1={px(20)} x2={px(20)} y1={py(0)} y2={py(80)} stroke="var(--text3)" strokeDasharray="3 3" />
        <line x1={px(0)} x2={px(20)} y1={py(80)} y2={py(80)} stroke="var(--text3)" strokeDasharray="3 3" />
        <circle cx={px(20)} cy={py(80)} r="3.5" fill="var(--accent)" />
        <text x={px(20) + 10} y={py(80) + 20} fontSize="10.5" fill="var(--text)" fontFamily="var(--mono)">20 % av artiklarna ≈ 80 % av värdet</text>
        {[['A', 10], ['B', 35], ['C', 75]].map(([l, x]) => (
          <text key={l} x={px(x)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--text2)" fontFamily="var(--mono)">{l}</text>
        ))}
      </svg>
    </figure>
  );
}

function LoginPage({ onLogin, theme, onToggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
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
        body: JSON.stringify({ email: email.trim(), password })
      });
      if (!res.ok) throw new Error(await readError(res, 'Felaktig e-post eller lösenord'));
      const data = await res.json();
      localStorage.setItem('logitide_token', data.token);
      localStorage.setItem('logitide_email', data.email);
      localStorage.setItem('logitide_company', data.company || '');
      onLogin({ token: data.token, email: data.email, company: data.company });
    } catch (err) {
      setError(err instanceof TypeError
        ? 'Kunde inte nå servern. Kontrollera internetanslutningen och försök igen.'
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lt-auth">
      <aside className="lt-auth-brand">
        <Brand size={30} />
        <div className="lt-auth-pitch">
          <div className="lt-eyebrow">Lageroptimering för supply chain</div>
          <h1>Varje artikel på rätt nivå. Varje krona i arbete.</h1>
          <p>Ladda upp exporten från ert affärssystem. Logitide förstår kolumnerna, räknar säkerhetslager,
            inköpsbehov och kapitalbindning — och visar vad som ska göras först.</p>
        </div>
        <ParetoIllustration />
        <ul className="lt-auth-points">
          <li><b>ABC × XYZ</b>Servicenivå per segment, inte en siffra för hela lagret</li>
          <li><b>SS = Z·√(LT·σ²+d²·σ²LT)</b>Statistiskt säkerhetslager med ledtidsvariation</li>
          <li><b>AI-mappning</b>Förstår era kolumnnamn — ni behöver inte städa filen</li>
        </ul>
        <div className="lt-auth-foot"><span>Logitide Optimizer v3.0</span><span>Byggd för svenska lager</span></div>
      </aside>

      <main className="lt-auth-main">
        {onToggleTheme && <ThemeToggle theme={theme} onToggle={onToggleTheme} />}
        <form className="lt-auth-card" onSubmit={handleLogin} noValidate>
          <h2>Logga in</h2>
          <p>Fortsätt till din lageranalys.</p>
          <label className="lt-field">
            <span>E-post</span>
            <input id="lt-email" className="lt-input" type="email" autoComplete="email" autoFocus
              placeholder="namn@foretag.se" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label className="lt-field">
            <span>Lösenord</span>
            <div className="lt-input-wrap">
              <input id="lt-password" className="lt-input" type={showPw ? 'text' : 'password'} autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="lt-input-btn" onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Dölj lösenord' : 'Visa lösenord'}>{showPw ? 'Dölj' : 'Visa'}</button>
            </div>
          </label>
          {error && <div className="lt-alert lt-alert-error" role="alert"><LtIcon name="alert" /><span>{error}</span></div>}
          <button type="submit" className="lt-btn lt-btn-primary lt-btn-lg lt-btn-block"
            disabled={loading || !email || !password}>
            {loading ? <><span className="lt-spinner" /> Loggar in…</> : 'Logga in'}
          </button>
          <p className="lt-auth-help">Saknar du konto? Kontakta din Logitide-kontakt så skapar vi en inloggning för ert företag.</p>
        </form>
      </main>
    </div>
  );
}

// ─── Stegindikator (3 steg) ───────────────────────────────────────────────
const LT_STEPS = [['files', 'Ladda upp'], ['review', 'Granska'], ['run', 'Analys']];
function StepRail({ step }) {
  const idx = LT_STEPS.findIndex(([k]) => k === step);
  return (
    <nav className="lt-steps" aria-label="Steg">
      {LT_STEPS.map(([k, label], i) => (
        <React.Fragment key={k}>
          {i > 0 && <span className="lt-step-sep" />}
          <div className={`lt-step${i < idx ? ' is-done' : ''}${i === idx ? ' is-active' : ''}`} aria-current={i === idx ? 'step' : undefined}>
            <span className="lt-step-n">{i < idx ? <LtIcon name="check" size={12} stroke={2.4} /> : i + 1}</span>
            {label}
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
}

// ─── Framsteg under inläsning ─────────────────────────────────────────────
function ProgressList({ stages, active }) {
  return (
    <ul className="lt-progress" aria-live="polite">
      {stages.map((s, i) => (
        <li key={s} className={i < active ? 'is-done' : i === active ? 'is-active' : ''}>
          <span className="mark">
            {i < active ? <LtIcon name="check" size={14} stroke={2.4} /> : i === active ? <span className="lt-spinner" style={{ width: 12, height: 12 }} /> : null}
          </span>
          {s}
        </li>
      ))}
    </ul>
  );
}
function useStagedProgress(running, count, ms = 1400) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!running) { setI(0); return; }
    const t = setInterval(() => setI(v => Math.min(v + 1, count - 1)), ms);
    return () => clearInterval(t);
  }, [running, count, ms]);
  return i;
}

// ─── Mappningstabell för en fil ───────────────────────────────────────────
function MappingTable({ file, fileKey, values, onChange, fields, filter }) {
  const cols = Object.entries(file.columns || {});
  const counts = {};
  Object.values(values).forEach(v => { if (v && !v.startsWith('__') && !isPeriodField(v)) counts[v] = (counts[v] || 0) + 1; });
  const groups = [];
  fields.forEach(f => { let g = groups.find(x => x.name === f.group); if (!g) groups.push(g = { name: f.group, items: [] }); g.items.push(f); });

  const rows = cols.map(([col, s]) => {
    const v = values[col] || '';
    const st = rowStatus(s, v);
    const dup = v && counts[v] > 1;
    return { col, s, v, st, dup };
  }).filter(r => filter === 'all' || r.st.review || r.dup);

  if (!rows.length) return <div className="lt-empty">Inga kolumner behöver granskas i den här filen.</div>;

  return (
    <div className="lt-table-wrap">
      <table className="lt-table">
        <thead>
          <tr><th>Kolumn i filen</th><th>Exempelvärden</th><th>Ifyllt</th><th>Logitide-fält</th><th>Status</th></tr>
        </thead>
        <tbody>
          {rows.map(({ col, s, v, st, dup }) => {
            const inCatalog = (x) => fields.some(f => f.key === x);
            const extras = [...new Set([v, s.field, s.suggested].filter(x => x && !inCatalog(x)))];
            const why = dup ? `${fieldLabel(v)} används av flera kolumner — välj en` : s.explanation;
            return (
              <tr key={col} className={dup ? 'is-error' : st.review ? 'is-review' : ''}>
                <td>
                  <div className="lt-col-name">{col}</div>
                  {why && <div className="lt-col-why">{why}</div>}
                </td>
                <td>
                  <div className="lt-samples">
                    {(s.samples || []).slice(0, 3).map((x, i) => <span key={i} className="lt-sample" title={x}>{x}</span>)}
                    {!(s.samples || []).length && <span className="lt-subtle" style={{ fontSize: 12 }}>tom</span>}
                  </div>
                </td>
                <td>
                  <div className="lt-fill"><span className="lt-fill-bar"><i className={s.fill_pct < 70 ? 'low' : ''} style={{ width: `${s.fill_pct}%` }} /></span>{s.fill_pct}%</div>
                </td>
                <td className="lt-map-cell">
                  <label className="lt-sr" htmlFor={`map-${fileKey}-${col}`}>Logitide-fält för {col}</label>
                  <select id={`map-${fileKey}-${col}`} className={`lt-select${!v ? ' is-empty' : ''}${dup ? ' is-error' : ''}`}
                    value={v} onChange={e => onChange(col, e.target.value)}>
                    <option value="">Ignorera</option>
                    {extras.map(x => <option key={x} value={x}>{fieldLabel(x)}</option>)}
                    {groups.map(g => (
                      <optgroup key={g.name} label={g.name}>
                        {g.items.map(f => <option key={f.key} value={f.key}>{f.key}</option>)}
                      </optgroup>
                    ))}
                    {file.is_transaction_file && (
                      <optgroup label="Transaktioner">
                        {['__date__', '__qty__'].filter(x => !extras.includes(x)).map(x =>
                          <option key={x} value={x}>{fieldLabel(x)}</option>)}
                      </optgroup>
                    )}
                  </select>
                </td>
                <td><span className={dup ? 'lt-chip lt-chip-err' : st.cls}>{dup ? 'Dubblett' : st.label}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Konsultens bedömning — deterministisk text från täckningen ───────────
function adviceFor(cov, meta) {
  if (!cov) return [];
  const out = [];
  const byKey = Object.fromEntries(cov.analyses.map(a => [a.key, a]));
  if (!cov.base_ok) {
    out.push('Grunddata saknas: analysen kräver artikelnummer, lagersaldo och någon form av förbrukning.');
    return out;
  }
  if (cov.level === 3) out.push('Datan räcker för en fullständig analys — statistiskt säkerhetslager, trend och prognos, kapitalbindning och slotting kan räknas fram.');
  else if (cov.level === 2) out.push('Datan räcker för inköpsstyrning och kapitalanalys. Några analyser blir begränsade tills fler fält finns med.');
  else out.push('Datan räcker för en grundanalys: lagerstatus, täcktid och inköpsförslag. Värdebaserade analyser kräver inköpspris.');
  if (byKey.status?.notes?.length) out.push(`${byKey.status.notes[0]} — brist- och beställningsdatum blir därför ungefärliga.`);
  const top = (cov.suggestions || []).find(s => s.unlocks.length) || (cov.suggestions || [])[0];
  if (top) {
    const what = top.unlocks.length ? `låser upp ${top.unlocks.join(', ')}` : `förbättrar ${top.improves.slice(0, 3).join(', ')}`;
    out.push(`Viktigast att komplettera: ${top.label.toLowerCase()} — ${what}.`);
  }
  if (meta?.lowJoin) out.push(`Obs: ${meta.lowJoin}`);
  return out;
}

// ─── Importstudion v2 — släpp fil → granska → kör ─────────────────────────
const LOAD_STAGES = ['Läser filerna och hittar rubrikraden', 'Profilerar varje kolumns innehåll', 'Matchar mot Logitides datamodell', 'Beräknar analysförmåga'];
const RUN_STAGES = ['Slår ihop filerna per artikelnummer', 'Beräknar förbrukning och variation', 'ABC × XYZ och säkerhetslager', 'Inköpsförslag, kapital och slotting'];

function ImportStudio({ auth, onAnalysis, latest, analysisCount, onOpenLatest }) {
  const [step, setStep] = useState('files'); // files | review
  const [files, setFiles] = useState([]);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(null); // 'suggest' | 'run'
  const [error, setError] = useState(null);
  const [sugg, setSugg] = useState(null);
  const [mapping, setMapping] = useState({});
  const [active, setActive] = useState('file_0');
  const [showAll, setShowAll] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [coverage, setCoverage] = useState(null);
  const [covLoading, setCovLoading] = useState(false);
  const inputRef = React.useRef(null);
  const addRef = React.useRef(null);
  const firstRun = React.useRef(true);
  const authHeaders = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};

  const loadStage = useStagedProgress(busy === 'suggest', LOAD_STAGES.length, 900);
  const runStage = useStagedProgress(busy === 'run', RUN_STAGES.length, 1800);

  const validate = (list) => {
    const bad = list.find(f => !/\.(xlsx|xls|xlsm|csv)$/i.test(f.name));
    if (bad) return `${bad.name}: bara Excel (.xlsx, .xls) och CSV stöds.`;
    const big = list.find(f => f.size > LT_MAX_BYTES);
    if (big) return `${big.name} är ${fmtBytes(big.size)} — max 20 MB per fil.`;
    return null;
  };

  // Läs filerna direkt när de släpps — ingen extra knapp
  const readFiles = async (list) => {
    if (!list.length) return;
    setBusy('suggest'); setError(null);
    try {
      const form = new FormData();
      list.forEach(f => form.append('files', f));
      const res = await fetch(`${API_URL}/import/suggest-mappings`, { method: 'POST', body: form, headers: authHeaders });
      if (!res.ok) throw new Error(await readError(res, 'Kunde inte läsa filerna.'));
      const data = await res.json();
      const m = {};
      Object.entries(data.files || {}).forEach(([fk, fd]) => {
        m[fk] = {};
        Object.entries(fd.columns || {}).forEach(([col, s]) => { m[fk][col] = s.field || ''; });
      });
      firstRun.current = true;
      setSugg(data);
      setMapping(m);
      setCoverage(data.coverage || null);
      const firstReview = Object.entries(data.files || {}).find(([, fd]) =>
        Object.values(fd.columns).some(s => rowStatus(s, s.field || '').review));
      setActive(firstReview ? firstReview[0] : 'file_0');
      setShowAll(false);
      setStep('review');
    } catch (e) {
      setError(e instanceof TypeError ? 'Kunde inte nå servern. Försök igen om en stund.' : e.message);
    } finally {
      setBusy(null);
    }
  };

  const addFiles = (incomingList, { replace = false } = {}) => {
    setError(null);
    const incoming = Array.from(incomingList || []);
    if (!incoming.length) return;
    const err = validate(incoming);
    if (err) { setError(err); return; }
    const base = replace ? [] : files;
    const names = new Set(base.map(f => f.name));
    let merged = [...base, ...incoming.filter(f => !names.has(f.name))];
    if (merged.length > LT_MAX_FILES) {
      setError(`Max ${LT_MAX_FILES} filer per analys — de första ${LT_MAX_FILES} används.`);
      merged = merged.slice(0, LT_MAX_FILES);
    }
    setFiles(merged);
    readFiles(merged);
  };

  // Levande täckning när mappningen ändras
  const mappedFields = React.useMemo(() => {
    const set = new Set();
    let hasTrans = false;
    Object.values(mapping).forEach(fm => Object.values(fm).forEach(v => {
      if (!v) return;
      if (v === '__date__') hasTrans = true;
      if (!v.startsWith('__')) set.add(v);
    }));
    const periods = [...set].filter(isPeriodField).length;
    return { fields: [...set].sort(), periods: hasTrans ? Math.max(periods, 12) : periods };
  }, [mapping]);

  useEffect(() => {
    if (step !== 'review') return;
    if (firstRun.current) { firstRun.current = false; return; }
    const t = setTimeout(async () => {
      setCovLoading(true);
      try {
        const res = await fetch(`${API_URL}/import/coverage`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(mappedFields)
        });
        if (res.ok) setCoverage(await res.json());
      } catch {} finally { setCovLoading(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [mappedFields]);

  const setField = (fk, col, val) => setMapping(prev => ({ ...prev, [fk]: { ...prev[fk], [col]: val } }));

  const dupIssues = React.useMemo(() => {
    const out = [];
    Object.entries(mapping).forEach(([fk, fm]) => {
      const seen = {};
      Object.entries(fm).forEach(([col, v]) => {
        if (!v || v.startsWith('__') || isPeriodField(v)) return;
        if (seen[v]) out.push(`${fieldLabel(v)} i ${sugg?.files?.[fk]?.filename}`); else seen[v] = col;
      });
    });
    return out;
  }, [mapping, sugg]);

  const reviewCount = (fk) => {
    const fd = sugg?.files?.[fk];
    if (!fd) return 0;
    return Object.entries(fd.columns).filter(([col, s]) => rowStatus(s, mapping[fk]?.[col] || '').review).length;
  };

  const runAnalysis = async () => {
    setBusy('run'); setError(null);
    try {
      const form = new FormData();
      files.forEach(f => form.append('files', f));
      form.append('mapping', JSON.stringify(mapping));
      collectSettingsInto(form);
      const res = await fetch(`${API_URL}/import/run`, { method: 'POST', body: form, headers: authHeaders });
      if (!res.ok) throw new Error(await readError(res, 'Analysen misslyckades.'));
      const data = await res.json();
      window._lastAnalysisData = data;
      window._lastUploadedFile = files.length === 1 ? files[0] : null;
      onAnalysis(data);
    } catch (e) {
      setError(e instanceof TypeError ? 'Kunde inte nå servern. Försök igen om en stund.' : e.message);
      setBusy(null);
    }
  };

  const reset = () => { setStep('files'); setFiles([]); setSugg(null); setMapping({}); setCoverage(null); setError(null); };

  const dropProps = {
    onDragOver: e => { e.preventDefault(); setOver(true); },
    onDragLeave: () => setOver(false),
    onDrop: e => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files, { replace: step === 'files' }); },
  };

  // ════════ Steg 1: ladda upp ════════
  if (step === 'files') {
    return (
      <div className="lt-studio">
        <StepRail step="files" />
        <div className="lt-hero-center">
          <div className="lt-eyebrow">Ny analys</div>
          <h1>Släpp er lagerfil. Resten sköter Logitide.</h1>
          <p>Excel eller CSV direkt från affärssystemet — en eller flera filer. Kolumnerna tolkas automatiskt och ni ser direkt vad datan räcker till.</p>
        </div>

        <div className={`lt-drop lt-drop-xl${over ? ' is-over' : ''}${busy ? ' is-busy' : ''}`}
          role="button" tabIndex={0} aria-label="Välj filer att analysera"
          onClick={() => !busy && inputRef.current?.click()}
          onKeyDown={e => { if (!busy && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); inputRef.current?.click(); } }}
          {...(busy ? {} : dropProps)}>
          {busy === 'suggest' ? (
            <>
              <div className="lt-drop-files">
                {files.map(f => <span key={f.name} className="lt-chip lt-mono">{f.name}</span>)}
              </div>
              <ProgressList stages={LOAD_STAGES} active={loadStage} />
            </>
          ) : (
            <>
              <div className="lt-drop-icon"><LtIcon name="upload" size={22} /></div>
              <h3>Släpp filer här</h3>
              <p>eller <span className="lt-link">välj från datorn</span> · .xlsx .xls .csv · upp till {LT_MAX_FILES} filer</p>
            </>
          )}
          <input ref={inputRef} type="file" multiple accept=".xlsx,.xls,.xlsm,.csv" hidden
            onChange={e => { addFiles(e.target.files, { replace: true }); e.target.value = ''; }} />
        </div>

        {error && <div className="lt-alert lt-alert-error" role="alert" style={{ marginTop: 12 }}><LtIcon name="alert" /><span>{error}</span></div>}

        <div className="lt-needs">
          <span className="lt-subtle">Behövs:</span>
          <span className="lt-need req">Artikelnummer</span>
          <span className="lt-need req">Lagersaldo</span>
          <span className="lt-need req">Förbrukning</span>
          <span className="lt-sep">·</span>
          <button className="lt-link-btn" onClick={() => setShowGuide(v => !v)} aria-expanded={showGuide}>
            {showGuide ? 'Dölj' : 'Vad låser upp mer?'}
          </button>
        </div>
        {showGuide && (
          <div className="lt-guide-grid">
            {[['Inköpspris', 'Kapitalbindning och värdebaserad ABC'], ['Ledtid', 'Exakta brist- och beställningsdatum'],
              ['6–12 månaders historik', 'XYZ, trend och statistiskt säkerhetslager'], ['Lagerposition', 'Slotting'],
              ['MOQ · Beställt · ETA', 'Exakta orderförslag'], ['Leverantör', 'Ledtid per leverantör']].map(([k, v]) => (
              <div key={k}><b>{k}</b><span>{v}</span></div>
            ))}
          </div>
        )}

        {latest?.summary && (
          <section className="lt-latest-row" aria-label="Senaste analys">
            <div className="lt-latest-meta">
              <div className="lt-eyebrow">Senaste analys</div>
              <div className="lt-latest-name">{latest.filename || 'Analys'}</div>
              <div className="lt-hint">
                {latest.created_at ? new Date(latest.created_at).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' }) : ''}
                {analysisCount > 1 ? ` · ${analysisCount} sparade` : ''}
              </div>
            </div>
            <div className="lt-latest-kpis">
              {[
                ['Artiklar', fmtInt(latest.summary.total_articles), ''],
                ['Kritiska', fmtInt(latest.summary.critical), latest.summary.critical > 0 ? 'crit' : 'good'],
                ['Att beställa', fmtInt(latest.summary.articles_to_order), latest.summary.articles_to_order > 0 ? 'warn' : ''],
                ['Servicenivå A', latest.summary.a_service_level_pct != null ? `${latest.summary.a_service_level_pct} %` : '—', latest.summary.a_service_level_pct >= 95 ? 'good' : 'warn'],
                ['Bundet kapital', latest.summary.has_cost_data ? `${fmtInt(latest.summary.total_stock_value_sek / 1000)} tkr` : '—', ''],
              ].map(([l, v, c]) => (
                <div key={l}><div className="lt-kpi-label">{l}</div><div className={`lt-kpi-value ${c}`}>{v}</div></div>
              ))}
            </div>
            <button className="lt-btn lt-btn-secondary" onClick={onOpenLatest} disabled={!latest.full_data?.articles}>
              Öppna <LtIcon name="arrow" />
            </button>
          </section>
        )}
      </div>
    );
  }

  // ════════ Steg 2: granska och kör — allt på en sida ════════
  const fileEntries = Object.entries(sugg?.files || {});
  const cur = sugg?.files?.[active];
  const allCols = fileEntries.reduce((n, [, fd]) => n + Object.keys(fd.columns).length, 0);
  const totalReview = fileEntries.reduce((n, [fk]) => n + reviewCount(fk), 0);
  const primary = fileEntries.map(([, fd]) => fd).find(fd => fd.join?.primary) || fileEntries[0]?.[1];
  const articleCount = primary?.join?.total ?? primary?.rows;
  const hasTrans = fileEntries.some(([, fd]) => fd.is_transaction_file);
  const lowJoin = fileEntries.map(([, fd]) => fd).find(fd => fd.join?.matched_pct != null && fd.join.matched_pct < 80);
  const advice = adviceFor(coverage, { lowJoin: lowJoin ? `bara ${lowJoin.join.matched_pct} % av artiklarna i ${lowJoin.filename} finns i huvudfilen — kontrollera att artikelnumren har samma format.` : null });
  const blockReason = !coverage?.base_ok
    ? 'Artikelnummer, lagersaldo och förbrukning behövs. Välj rätt fält för kolumnerna nedan.'
    : dupIssues.length ? `Samma fält är valt för flera kolumner: ${dupIssues.join(', ')}.` : null;
  const canRun = !!coverage?.base_ok && !dupIssues.length && !busy;
  const nFields = mappedFields.fields.filter(f => !isPeriodField(f)).length;
  const needsAttention = totalReview > 0 || !!blockReason;

  return (
    <div className={`lt-studio${over ? ' is-over' : ''}`} {...dropProps}>
      <StepRail step={busy === 'run' ? 'run' : 'review'} />

      {/* Filrad */}
      <div className="lt-filebar">
        {fileEntries.map(([fk, fd]) => (
          <div key={fk} className="lt-filepill">
            <span className={`lt-file-ico ${/\.csv$/i.test(fd.filename) ? 'csv' : 'xls'}`}>{(fd.filename.split('.').pop() || '').toUpperCase().slice(0, 4)}</span>
            <div style={{ minWidth: 0 }}>
              <div className="lt-file-name" title={fd.filename}>{fd.filename}</div>
              <div className="lt-file-meta">{fd.role_label} · {fmtInt(fd.rows)} rader{fd.join?.matched_pct != null ? ` · ${fd.join.matched_pct} % matchar` : ''}</div>
            </div>
          </div>
        ))}
        <div className="lt-filebar-actions">
          {files.length < LT_MAX_FILES && (
            <button className="lt-btn lt-btn-ghost lt-btn-sm" onClick={() => addRef.current?.click()} disabled={!!busy}>
              <LtIcon name="plus" size={14} /> Lägg till fil
            </button>
          )}
          <button className="lt-btn lt-btn-ghost lt-btn-sm" onClick={reset} disabled={!!busy}>Börja om</button>
          <input ref={addRef} type="file" multiple accept=".xlsx,.xls,.xlsm,.csv" hidden
            onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
        </div>
      </div>

      {busy === 'suggest' && (
        <div className="lt-panel lt-panel-pad" style={{ textAlign: 'center', marginBottom: 16 }}>
          <ProgressList stages={LOAD_STAGES} active={loadStage} />
        </div>
      )}

      {/* Beslutspanel */}
      {coverage && busy !== 'suggest' && (
        <section className="lt-panel lt-decision">
          <div className="lt-decision-main">
            <ScoreRing value={coverage.score} size={88} stroke={7} />
            <div className="lt-decision-text">
              <div className="lt-eyebrow">{covLoading ? 'Räknar om…' : 'Analysförmåga'}</div>
              <h2>{coverage.base_ok ? coverage.level_label : 'Grunddata saknas'}</h2>
              <p className="lt-muted">
                {coverage.ready_count} av {coverage.total} analyser fullt tillgängliga
                {coverage.partial_count ? ` · ${coverage.partial_count} begränsade` : ''}
                {coverage.locked_count ? ` · ${coverage.locked_count} låsta` : ''}
              </p>
              <div className="lt-cap-facts">
                <span><b>{fmtInt(articleCount)}</b> artiklar</span>
                <span><b>{allCols}</b> kolumner tolkade</span>
                <span><b>{nFields}</b> datafält</span>
                {hasTrans ? <span><b>Transaktioner</b> → historik</span> : <span><b>{mappedFields.periods}</b> mån historik</span>}
              </div>
            </div>
            <div className="lt-decision-cta">
              <button className="lt-btn lt-btn-primary lt-btn-xl" onClick={runAnalysis} disabled={!canRun}>
                {busy === 'run' ? <><span className="lt-spinner" /> Analyserar…</> : <>Kör analysen <LtIcon name="arrow" /></>}
              </button>
              {busy === 'run' ? <ProgressList stages={RUN_STAGES} active={runStage} />
                : blockReason ? <div className="lt-hint lt-hint-warn">{blockReason}</div>
                : <div className="lt-hint">{totalReview ? `${totalReview} ${totalReview === 1 ? 'kolumn' : 'kolumner'} har förslag att bekräfta — analysen kan köras ändå.` : 'Alla kolumner är tolkade.'}</div>}
            </div>
          </div>

          {advice.length > 0 && (
            <div className="lt-advice">{advice.map((t, i) => <p key={i}>{t}</p>)}</div>
          )}

          <div className="lt-analysis-strip">
            {coverage.analyses.map(a => (
              <div key={a.key} className={`lt-an ${a.status}`}
                title={a.status === 'locked' ? `Kräver ${a.missing_required.join(', ')}` : a.status === 'partial' ? (a.notes[0] || `Blir bättre med ${a.missing_recommended.join(', ')}`) : a.description}>
                <span className={`lt-status-dot ${a.status}`} />{a.name}
              </div>
            ))}
          </div>
        </section>
      )}

      {error && <div className="lt-alert lt-alert-error" role="alert" style={{ marginTop: 12 }}><LtIcon name="alert" /><span>{error}</span></div>}

      {/* Kolumner — bara det som behöver uppmärksamhet visas direkt */}
      {cur && busy !== 'suggest' && (
        <section className="lt-panel" style={{ marginTop: 16, overflow: 'hidden' }}>
          <div className="lt-colhead">
            <div>
              <div className="lt-panel-title" style={{ margin: 0 }}>
                {needsAttention && !showAll ? `${totalReview} ${totalReview === 1 ? 'kolumn' : 'kolumner'} att bekräfta` : 'Kolumner'}
              </div>
              <div className="lt-hint">
                {needsAttention && !showAll ? 'Logitide har gissat — ändra om något är fel.' : `${allCols} kolumner i ${fileEntries.length} ${fileEntries.length === 1 ? 'fil' : 'filer'}. Ändra ett fält så räknas analysförmågan om.`}
                {sugg?.ai?.enabled ? ' AI har granskat osäkra kolumner.' : ''}
              </div>
            </div>
            <button className="lt-btn lt-btn-secondary lt-btn-sm" onClick={() => setShowAll(v => !v)} aria-expanded={showAll}>
              {showAll ? 'Visa bara det som behöver granskas' : `Visa alla ${allCols} kolumner`}
            </button>
          </div>

          {(showAll || needsAttention) && (
            <>
              {fileEntries.length > 1 && (
                <div className="lt-tabs" role="tablist">
                  {fileEntries.map(([fk, fd]) => {
                    const n = reviewCount(fk);
                    return (
                      <button key={fk} role="tab" aria-selected={active === fk} className={`lt-tab${active === fk ? ' is-active' : ''}`} onClick={() => setActive(fk)}>
                        {fd.filename}
                        <span className={`lt-count${n ? '' : ' ok'}`}>{n ? n : <LtIcon name="check" size={10} stroke={3} />}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {(cur.ai_summary || cur.notes?.length > 0 || cur.header_row > 0) && (
                <div className="lt-filehead">
                  {cur.ai_summary && <div className="lt-ai-note"><span className="lt-chip lt-chip-ai"><LtIcon name="sparkle" size={11} /> AI</span><span>{cur.ai_summary}</span></div>}
                  {(cur.notes?.length > 0 || cur.header_row > 0) && (
                    <ul className="lt-notes">
                      {cur.header_row > 0 && <li>Rubrikerna hittades på rad {cur.header_row + 1}</li>}
                      {(cur.notes || []).map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  )}
                </div>
              )}
              <MappingTable file={cur} fileKey={active} values={mapping[active] || {}} fields={sugg.fields || []}
                filter={showAll ? 'all' : 'review'} onChange={(col, v) => setField(active, col, v)} />
            </>
          )}
        </section>
      )}

      {/* Så får ni ut mer */}
      {coverage?.suggestions?.length > 0 && busy !== 'suggest' && (
        <details className="lt-panel lt-more">
          <summary>
            <span className="lt-panel-title" style={{ margin: 0 }}>Så får ni ut mer nästa gång</span>
            <span className="lt-hint">{coverage.suggestions.length} förslag</span>
          </summary>
          {coverage.suggestions.slice(0, 4).map(s => (
            <div className="lt-unlock-row" key={s.field}>
              <span className="lt-unlock-plus"><LtIcon name="plus" size={14} /></span>
              <div>
                <b>{s.label}</b>
                <p>
                  {s.unlocks.length > 0 && <>Låser upp {s.unlocks.join(', ')}. </>}
                  {s.improves.length > 0 && <>Förbättrar {s.improves.join(', ')}.</>}
                </p>
              </div>
            </div>
          ))}
        </details>
      )}

    </div>
  );
}

// ─── Startsida ────────────────────────────────────────────────────────────
function DashboardHome({ onAnalysis, onOpenAnalysis, existingData, auth, onLogout, theme, onToggleTheme }) {
  const [latest, setLatest] = useState(null);
  const [analysisCount, setAnalysisCount] = useState(0);

  useEffect(() => {
    if (!auth?.token) return;
    let alive = true;
    const headers = { Authorization: `Bearer ${auth.token}` };
    fetch(`${API_URL}/history`, { headers })
      .then(r => (r.ok ? r.json() : { analyses: [] }))
      .then(async d => {
        const list = d.analyses || [];
        if (!alive) return;
        setAnalysisCount(list.length);
        if (!list.length) return;
        const detail = await fetch(`${API_URL}/history/${list[0].id}`, { headers }).then(r => (r.ok ? r.json() : null));
        if (alive && detail) setLatest(detail);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [auth]);

  const openLatest = () => {
    const d = latest?.full_data;
    if (d?.articles) (onOpenAnalysis || onAnalysis)(d);
  };

  return (
    <div className="lt-app">
      <header className="lt-topbar">
        <Brand />
        <div className="lt-topbar-right">
          {auth?.company && <span className="lt-chip">{auth.company}</span>}
          {auth?.email && <span className="lt-user">{auth.email}</span>}
          {existingData && (
            <button className="lt-btn lt-btn-secondary lt-btn-sm" onClick={() => (onOpenAnalysis || onAnalysis)(existingData)}>
              Tillbaka till analysen
            </button>
          )}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button className="lt-btn lt-btn-ghost lt-btn-sm" onClick={onLogout}>Logga ut</button>
        </div>
      </header>
      <main className="lt-page">
        <ImportStudio auth={auth} onAnalysis={onAnalysis} latest={latest} analysisCount={analysisCount} onOpenLatest={openLatest} />
      </main>
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
                        <tr style={{ color: 'var(--text3)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
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

  const deltaCard = (label, valA, valB, unit = '', lowerIsBetter = false) => {
    if (valA == null || valB == null) return null;
    const delta = valB - valA;
    const improved = lowerIsBetter ? delta < 0 : delta > 0;
    const neutral = delta === 0;
    const color = neutral ? '#64748b' : improved ? '#22c55e' : '#ef4444';
    const arrow = neutral ? '→' : delta > 0 ? '▲' : '▼';
    const absVal = Math.abs(delta);
    const fmtVal = (v) => unit === 'kr' ? `${Math.round(v).toLocaleString('sv-SE')} kr` : unit === '%' ? `${v.toFixed(1)}%` : `${Math.round(v)}`;
    return (
      <div style={{ background: '#1e293b', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: 0.5 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: color }}>
            {arrow} {fmtVal(absVal)}{unit !== 'kr' ? unit : ''}
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#475569' }}>
          <span style={{ color: '#64748b' }}>{fmtVal(valA)}{unit !== 'kr' ? unit : ''}</span>
          <span style={{ color: '#334155' }}> → </span>
          <span style={{ color: '#94a3b8' }}>{fmtVal(valB)}{unit !== 'kr' ? unit : ''}</span>
        </div>
        {!neutral && (
          <div style={{ fontSize: 10, fontWeight: 600, color }}>
            {improved ? '✓ Förbättring' : '✕ Försämring'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: 14,
      padding: 24,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>Jämförelse</div>
          <div style={{ fontSize: 11, color: '#475569' }}>
            <span style={{ color: '#64748b' }}>{labelA}</span>
            <span style={{ color: '#334155' }}> → </span>
            <span style={{ color: '#60a5fa' }}>{labelB}</span>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
      </div>

      {loading && (
        <div style={{ padding: '20px 0', color: '#64748b', fontSize: 13 }}>Beräknar delta…</div>
      )}
      {!loading && !diff && (
        <div style={{ padding: '20px 0', color: '#ef4444', fontSize: 13 }}>Kunde inte jämföra analyserna.</div>
      )}
      {!loading && diff && (() => {
        // Backend returns diff.cards OR we build from diff.summary_a / diff.summary_b
        const sA = diff.summary_a || {};
        const sB = diff.summary_b || {};
        const cards = diff.cards;

        if (cards && cards.length) {
          // Use backend-computed cards if available
          return (
            <div>
              <ImprovementCards cards={cards} totalSaved={diff.total_saved_sek} />
            </div>
          );
        }

        // Fallback: build delta cards from summary objects
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {deltaCard('Servicenivå A', sA.a_service_level_pct, sB.a_service_level_pct, '%', false)}
            {deltaCard('Kritiska artiklar', sA.critical, sB.critical, '', true)}
            {deltaCard('Att beställa', sA.articles_to_order, sB.articles_to_order, '', true)}
            {deltaCard('Dött lager', sA.dead_stock, sB.dead_stock, '', true)}
            {deltaCard('Överlager', sA.overstock, sB.overstock, '', true)}
            {deltaCard('Bundet kapital', sA.total_stock_value_sek, sB.total_stock_value_sek, 'kr', true)}
          </div>
        );
      })()}
    </div>
  );
}

// ─── HISTORY TAB ──────────────────────────────────────────────────────────
function HistoryTab({ token, onLoadAnalysis }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [compareIds, setCompareIds] = useState(null); // {idA, idB, labelA, labelB}
  const [compareSelected, setCompareSelected] = useState(null); // id of row selected for compare
  const [clearing, setClearing] = useState(false);
  const [openingId, setOpeningId] = useState(null); // which row is loading

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

  const handleOpenAnalysis = async (h) => {
    if (!onLoadAnalysis) return;
    setOpeningId(h.id);
    try {
      const res = await fetch(`${API_URL}/history/${h.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const detail = await res.json();
      const analysisData = detail.full_data || detail;
      if (analysisData && analysisData.articles) {
        onLoadAnalysis(analysisData);
      } else {
        alert('Kunde inte ladda analysen — analysen saknar fullständig data.');
      }
    } catch (e) {
      alert('Nätverksfel — försök igen.');
    } finally {
      setOpeningId(null);
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
  // Servicenivå och kritiska räknas annorlunda från motor 2.11 — jämför bara inom samma version
  const engineOf = (h) => h?.summary?.engine_version || '2.10';
  const sameEngine = history.filter(h => engineOf(h) === engineOf(latest));
  const prevSame = prev && engineOf(prev) === engineOf(latest) ? prev : null;
  const slValues = [...sameEngine].reverse().map(h => h.summary?.a_service_level_pct ?? 0);
  const critValues = [...sameEngine].reverse().map(h => h.summary?.critical ?? 0);
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
        <div style={{ marginBottom: 24 }}>
          <ComparePanel {...compareIds} token={token} onClose={() => { setCompareIds(null); setCompareSelected(null); }} />
        </div>
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
            diff: prevSame ? `${latest.summary?.a_service_level_pct >= prevSame.summary?.a_service_level_pct ? '▲' : '▼'} ${Math.abs(((latest.summary?.a_service_level_pct ?? 0) - (prevSame.summary?.a_service_level_pct ?? 0))).toFixed(1).replace('.', ',')} procentenheter` : null,
            improved: prevSame ? latest.summary?.a_service_level_pct >= prevSame.summary?.a_service_level_pct : null,
            note: prev && !prevSame ? 'Ny beräkning — jämförs inte med äldre analyser' : null,
          },
          {
            label: 'KRITISKA ARTIKLAR',
            value: latest.summary?.critical ?? '—',
            color: latest.summary?.critical > 0 ? '#ef4444' : '#22c55e',
            sparkValues: critValues,
            sparkColor: '#ef4444',
            inverted: true, // lower = better, so invert sparkline direction
            diff: prevSame ? `${latest.summary?.critical <= prevSame.summary?.critical ? '▼' : '▲'} ${Math.abs((latest.summary?.critical ?? 0) - (prevSame.summary?.critical ?? 0))}` : null,
            improved: prevSame ? latest.summary?.critical <= prevSame.summary?.critical : null,
            note: prev && !prevSame ? 'Ny beräkning — jämförs inte med äldre analyser' : null,
          },
          {
            label: 'BUNDET KAPITAL',
            value: fmtKr(latest.summary?.total_stock_value_sek) || '—',
            color: 'var(--text)',
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
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: card.color, marginBottom: 2 }}>{card.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {card.diff && (
                <span style={{ fontSize: 11, color: card.improved ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                  {card.diff} sedan föreg.
                </span>
              )}
              {!card.diff && (card.note ? <span style={{ fontSize: 11, color: 'var(--text3)' }}>{card.note}</span> : <span />)}
              {card.sparkValues.length >= 2 && (
                <SparklineLegacy values={card.sparkValues} color={card.sparkColor} inverted={card.inverted} width={100} height={30} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Compare helper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <h3 style={{ color: 'var(--text)', margin: 0, flex: 1 }}>Analyskörningar</h3>
        {compareSelected && (
          <div style={{ fontSize: 12, color: '#60a5fa', background: '#1e3a5f', borderRadius: 6, padding: '4px 10px' }}>
            ✓ Välj en andra rad för att jämföra
          </div>
        )}
        {!compareSelected && history.length >= 2 && (
          <div style={{ fontSize: 11, color: '#64748b' }}>
            "Öppna" laddar analysen · "Jämför" visar delta
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
          {clearing ? 'Rensar…' : 'Rensa historik'}
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: 'var(--text3)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '8px 12px' }}>DATUM</th>
              <th style={{ padding: '8px 12px' }}>FIL</th>
              <th style={{ padding: '8px 12px' }}>ARTIKLAR</th>
              <th style={{ padding: '8px 12px' }}>KRITISKA</th>
              <th style={{ padding: '8px 12px' }}>SERVICENIVÅ A</th>
              <th style={{ padding: '8px 12px' }}>KAPITAL</th>
              <th style={{ padding: '8px 12px', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => {
              const isSelected = compareSelected === h.id;
              const isOpening = openingId === h.id;
              return (
                <tr
                  key={h.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: isSelected ? 'var(--accent-soft)' : i === 0 ? 'var(--bg3)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <td style={{ padding: '10px 12px', color: 'var(--text2)' }}>
                    {fmtDate(h.created_at)}
                    {i === 0 && <span style={{ marginLeft: 6, fontSize: 10, background: '#6366f1', color: '#fff', borderRadius: 4, padding: '1px 5px' }}>SENASTE</span>}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={h.filename || ''}>{h.filename || '—'}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{fmt(h.summary?.total_articles)}</td>
                  <td style={{ padding: '10px 12px', color: h.summary?.critical > 0 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{h.summary?.critical ?? '—'}</td>
                  <td style={{ padding: '10px 12px', color: (h.summary?.a_service_level_pct ?? 0) >= 95 ? '#22c55e' : (h.summary?.a_service_level_pct ?? 0) >= 85 ? '#f97316' : '#ef4444', fontWeight: 600 }}>{h.summary?.a_service_level_pct ?? '—'}%</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{fmtKr(h.summary?.total_stock_value_sek) || '—'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {/* Öppna-knapp */}
                      {onLoadAnalysis && (
                        <button
                          onClick={() => handleOpenAnalysis(h)}
                          disabled={isOpening}
                          style={{
                            background: isOpening ? '#1e293b' : '#6366f1',
                            border: 'none',
                            color: isOpening ? '#64748b' : '#fff',
                            borderRadius: 6,
                            padding: '4px 12px',
                            fontSize: 11,
                            cursor: isOpening ? 'wait' : 'pointer',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            minWidth: 64,
                          }}
                        >
                          {isOpening ? '…' : '↗ Öppna'}
                        </button>
                      )}
                      {/* Jämför-knapp */}
                      <button
                        onClick={() => handleCompare(h)}
                        style={{
                          background: isSelected ? '#3b82f6' : 'transparent',
                          border: `1px solid ${isSelected ? '#3b82f6' : '#334155'}`,
                          color: isSelected ? '#fff' : '#64748b',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 11,
                          cursor: 'pointer',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isSelected ? '✓ Vald' : 'Jämför'}
                      </button>
                    </div>
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
  const [showHome, setShowHome] = useState(true);
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
    setShowHome(true);
  };

  const handleAnalysis = (data) => {
    setAnalysisData(data);
    setShowHome(false);
  };

  const handleGoHome = () => {
    setShowHome(true);
  };

  const handleOpenFullAnalysis = (data) => {
    setAnalysisData(data);
    setShowHome(false);
  };

  const handleLoadHistoryAnalysis = (data) => {
    setAnalysisData(data);
    setShowHome(false);
  };

  if (!auth) return <LoginPage onLogin={setAuth} theme={theme} onToggleTheme={toggleTheme} />;
  if (!showHome && analysisData) return <Dashboard data={analysisData} auth={auth} onReset={handleGoHome} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} onLoadAnalysis={handleLoadHistoryAnalysis} />;
  return <DashboardHome onAnalysis={handleAnalysis} onOpenAnalysis={handleOpenFullAnalysis} existingData={analysisData} auth={auth} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />;
}
