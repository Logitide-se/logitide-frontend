import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
const API_URL = 'https://web-production-2ab93.up.railway.app';
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
  return `${Math.round(n / 1000).toLocaleString('sv-SE')} tkr`;
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
  const [pos, setPos] = React.useState({ vertical: 'above', align: 'center' });
  const hideTimer = React.useRef(null);

  const handleEnter = () => {
    clearTimeout(hideTimer.current);
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;
      const vertical = spaceAbove < 220 ? 'below' : 'above';
      const align = spaceRight < 140 ? 'right' : spaceLeft < 140 ? 'left' : 'center';
      setPos({ vertical, align });
    }
    setVisible(true);
  };

  const handleLeave = () => {
    hideTimer.current = setTimeout(() => setVisible(false), 120);
  };

  const { vertical, align } = pos;
  const popupStyle = {
    position: 'absolute',
    ...(vertical === 'above' ? { bottom: '130%' } : { top: '130%' }),
    background: '#0f172a', border: '1px solid #334155', color: '#cbd5e1',
    borderRadius: 8, padding: '10px 14px', fontSize: 11, lineHeight: 1.6,
    width: 260, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    whiteSpace: 'pre-line', textAlign: 'left', fontWeight: 400,
    pointerEvents: 'auto', cursor: 'text', userSelect: 'text',
    ...(align === 'center' ? { left: '50%', transform: 'translateX(-50%)' } :
        align === 'right'  ? { right: 0, transform: 'none' } :
                             { left: 0, transform: 'none' }),
  };

  // Pil: pekar mot ikonen
  const arrowLeft = align === 'center' ? '50%' : align === 'right' ? 'auto' : '10px';
  const arrowRight = align === 'right' ? '10px' : 'auto';
  const arrowStyle = vertical === 'above'
    ? { top: '100%', borderColor: '#334155 transparent transparent transparent' }
    : { bottom: '100%', borderColor: 'transparent transparent #334155 transparent' };

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 4, cursor: 'help', verticalAlign: 'middle' }}
      onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <span style={{ color: '#64748b', display: 'flex' }}><Icon name="info" size={13} /></span>
      {visible && (
        <span style={popupStyle} onMouseEnter={() => clearTimeout(hideTimer.current)} onMouseLeave={handleLeave}>
          {text}
          <span style={{ position: 'absolute', left: arrowLeft, right: arrowRight,
            transform: align === 'center' ? 'translateX(-50%)' : 'none',
            borderWidth: 5, borderStyle: 'solid', pointerEvents: 'none', ...arrowStyle }} />
        </span>
      )}
    </span>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, missingReason, tooltip }) {
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
    <div className="kpi-card">
      <div className="kpi-label">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <div className="kpi-value" style={{ color }}>{value}</div>
      {sub && <div className="kpi-sub" style={{ whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{sub}</div>}
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
function UploadPage({ onAnalysis, auth, onLogout }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [showHistory, setShowHistory] = useState(false);
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
      <div className="upload-content">
        <div className="logo-area">
          <div className="logo-icon">📦</div>
          <div>
            <h1 className="logo-text">Logitide</h1>
            <p className="logo-sub">OPTIMIZER</p>
          </div>
        </div>

        {/* ── Tagline ── */}
        <h2 className="upload-headline">Förvandla din lagerfil till<br /><span className="highlight">handlingsbara beslut på 30 sekunder.</span></h2>

        {/* ── Value promises ── */}
        <div style={{ display: 'flex', gap: 16, margin: '24px 0', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { icon: '📊', title: 'ABC-analys', desc: 'Se vilka artiklar som driver 80 % av kapitalet' },
            { icon: '🛒', title: 'Inköpsförslag', desc: 'Rekommendationer baserade på ledtid och förbrukning' },
            { icon: '⚠️', title: 'Kapital & risk', desc: 'Identifiera kritiska artiklar och överlager direkt' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12,
              padding: '16px 20px', flex: '1 1 160px', maxWidth: 200, textAlign: 'center'
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>

        {!loading ? (
          <>
            <div
              className={`drop-zone ${dragging ? 'dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <Icon name="upload" size={40} />
              <p className="drop-text">Släpp filen här</p>
              <p className="drop-sub">Excel (.xlsx, .xls) eller CSV · Max 20 MB</p>
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
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: '#475569' }}>
          🔒 Din fil analyseras i systemet — inga data skickas vidare till tredje part.
        </div>
        <div className="supported" style={{ marginTop: 20 }}>
          <span>Stöder:</span>
          {['Jeeves', 'SAP', 'Visma', 'Pyramid', 'Monitor', 'Excel-exporter'].map(erp => (
            <span key={erp} className="erp-tag">{erp}</span>
          ))}
        </div>
        {auth && (
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#475569' }}>
            <span>Inloggad som {auth.email}{auth.company ? ` · ${auth.company}` : ''}</span>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowHistory(!showHistory)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                {showHistory ? 'Dölj historik' : 'Visa historik'}
              </button>
              <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 12 }}>Logga ut</button>
            </div>
          </div>
        )}
        {showHistory && auth && <div style={{ marginTop: 16 }}><HistoryTab token={auth.token} /></div>}
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────
function OverviewTab({ data, onLedtidChange, ledtidOverrides }) {
  const { summary, top_actions, abc_distribution, articles, data_quality } = data;
  const hasCost = summary.has_cost_data;
  const hasLoc = summary.has_location_data;
  return (
    <div className="tab-content">
      <DataQualityBanner summary={summary} dataQuality={data_quality} />
      {summary.critical > 0 && (
        <div className="alert-banner">
          <Icon name="alert" size={18} />
          {summary.critical} artiklar kräver omedelbar handling — lagret kan stanna.
        </div>
      )}
      <div className="kpi-grid">
        <KpiCard label="KRITISKA BRISTER" value={fmt(summary.critical)} sub={`${summary.watch} bevakas`} color="#ef4444"
          tooltip={"Kritisk = täcktid ≤ ledtid OCH ingen inköpsorder är lagd.\nBevaka = brist men order är redan på väg.\n\nBevaka-tröskel per ABC-klass:\nA-artiklar: täcktid < 2× ledtid (hög buffer)\nB-artiklar: täcktid < 1.5× ledtid (standard)\nC-artiklar: täcktid < 1.2× ledtid (lägre marginal)"} />
        <KpiCard label="ATT BESTÄLLA" value={fmt(summary.articles_to_order)}
          sub={hasCost ? fmtKr(summary.total_order_value_sek) : 'Lägg till inköpspris för ordervärde'}
          color="#f97316" />
        <KpiCard
          label="BUNDET KAPITAL"
          value={hasCost ? fmtKr(summary.total_stock_value_sek) : null}
          sub={hasCost ? `varav ${fmtKr(summary.overstock_value_sek)} överlager` : null}
          color="#a855f7"
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
          tooltip={"Artiklar med saldo > 0 men registrerad förbrukning = 0.\n\nKan bero på felregistrering, utgångna produkter eller kassationer som ej bokförts.\n\nDött lager binder kapital utan att bidra till servicenivån — överväg utförsäljning eller skrotning."} />
      </div>
      {top_actions?.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h3>Åtgärder idag</h3>
            <span className="badge">{top_actions.length} prioriterade</span>
          </div>
          <div className="actions-list">
            {top_actions.map((a, i) => (
              <div key={i} className="action-row">
                <span className="action-icon">{a.icon}</span>
                <div className="action-body">
                  <span className="action-name">{a.name || a.article}</span>
                  <span className="action-text">{a.action}</span>
                  <span className="action-reason">{a.reason}</span>
                </div>
                {hasCost && a.value_sek > 0 && <span className="action-value">{fmtKr(a.value_sek)}</span>}
              </div>
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
        <ArticleTable articles={articles} hasCost={hasCost} hasLoc={hasLoc} onLedtidChange={onLedtidChange} ledtidOverrides={ledtidOverrides} />
      </div>
    </div>
  );
}

// ─── ARTICLE TABLE ────────────────────────────────────────────────────────
function ArticleTable({ articles, showExplanation = true, hasCost = true, hasLoc = true, onLedtidChange, ledtidOverrides = {} }) {
  const [filter, setFilter] = useState('Alla');
  const [abcFilter, setAbcFilter] = useState('Alla');
  const [search, setSearch] = useState('');
  const [editingLedtid, setEditingLedtid] = useState(null); // article id
  const [editVal, setEditVal] = useState('');

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
      <div className="table-filters">
        <input className="search-input" placeholder="Sök på artikelnamn eller ID..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="filter-group">
          {statusFilters.map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <div className="filter-group">
          {abcFilters.map(f => (
            <button key={f} className={`filter-btn ${abcFilter === f ? 'active' : ''}`} onClick={() => setAbcFilter(f)}>{f}</button>
          ))}
        </div>
      </div>
      <table className="article-table">
        <thead>
          <tr>
            <th>ARTIKEL</th><th>KLASS</th><th>SALDO</th><th>TÄCKTID</th>
            {onLedtidChange && <th title="Klicka på ledtid för att redigera">LEDTID <span style={{fontSize:9,color:'#475569'}}>✎</span></th>}
            <th>STATUS</th><th>ÅTGÄRD</th>
          </tr>
        </thead>
        <tbody>
          {filtered.slice(0, 100).map((a, i) => (
            <React.Fragment key={i}>
              <tr>
                <td><div className="art-name">{a.name}</div><div className="art-id">{a.article}</div></td>
                <td><span className="abc-chip" style={{ background: abcColor(a.abc) }}>{a.abc}{a.xyz ? `/${a.xyz}` : ''}</span></td>
                <td>{fmt(a.stock)}</td>
                <td style={{ color: a.status === 'CRITICAL' ? '#ef4444' : a.status === 'WATCH' ? '#f97316' : '#94a3b8' }}>{fmtDays(a.coverage_days)}</td>
                {onLedtidChange && (
                  <td>
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
      {filtered.length > 100 && <p className="table-more">Visar 100 av {filtered.length} artiklar</p>}
    </div>
  );
}

// ─── PURCHASING TAB ────────────────────────────────────────────────────────
function PurchasingTab({ data }) {
  const { summary, articles } = data;
  const hasCost = summary.has_cost_data;
  const toOrder = articles?.filter(a => a.order_qty > 0).sort((a, b) => b.order_value - a.order_value) || [];
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async () => {
    if (!window._lastUploadedFile) {
      alert('Ladda upp filen igen för att exportera inköpslista.');
      return;
    }
    setExporting(true);
    try {
      const formData = new FormData();
      formData.append('file', window._lastUploadedFile);
      let res;
      try {
        res = await fetch(`${API_URL}/export-purchase-order`, { method: 'POST', body: formData });
      } catch (networkErr) {
        alert('Kunde inte nå servern. Kontrollera din internetanslutning och försök igen.');
        return;
      }
      if (!res.ok) {
        alert('Export misslyckades. Försök igen om en stund.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `logitide_inkopslista_${today}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="tab-content">
      {!hasCost && (
        <div className="info-banner">
          <Icon name="info" size={16} />
          Inköpspris saknas i filen — ordervärden kan inte beräknas. ABC-klassning baseras på förbrukning.
          Lägg till kolumnen <code>cost</code> (eller "inköpspris", "pris") för fullständig analys.
        </div>
      )}
      <div className="kpi-grid-3">
        <KpiCard label="ARTIKLAR ATT BESTÄLLA" value={fmt(summary.articles_to_order)} sub={`${summary.critical} kritiska · ${summary.watch} bevakas`} color="#f97316" />
        <KpiCard
          label="TOTALT ORDERVÄRDE"
          value={hasCost ? fmtKr(summary.total_order_value_sek) : null}
          missingReason={!hasCost ? 'Kräver inköpspris i filen' : null}
          color="#3b82f6"
        />
        <KpiCard
          label="SNITT PER ARTIKEL"
          value={hasCost ? fmtKr(Math.round(summary.total_order_value_sek / Math.max(summary.articles_to_order, 1))) : null}
          missingReason={!hasCost ? 'Kräver inköpspris i filen' : null}
          color="#8b5cf6"
        />
      </div>
      <div className="section">
        <div className="section-header">
          <h3>Inköpslista — {toOrder.length} artiklar att beställa</h3>
          <button
            className="export-btn"
            onClick={handleExport}
            disabled={exporting}
            style={{ background: '#3b82f6', color: '#fff', borderColor: '#3b82f6', fontWeight: 600 }}
          >
            <Icon name="download" size={14} />
            {exporting ? 'Exporterar...' : 'Exportera inköpslista (.xlsx)'}
          </button>
        </div>
        <table className="article-table">
          <thead>
            <tr>
              <th>ARTIKEL-ID</th><th>ARTIKELNAMN</th><th>ABC</th><th>SALDO</th>
              <th>TÄCKTID</th><th>DAGAR KVAR</th><th>BESTÄLL SENAST</th><th>ORDERKVANTITET</th>
              {hasCost && <th>ORDERVÄRDE</th>}
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {toOrder.slice(0, 100).map((a, i) => {
              const daysLeft = a.days_until_reorder ?? 0;
              const dagarKvarLabel = daysLeft <= 0 ? '0 d' : `${daysLeft} d`;
              const reorderLabel = a.reorder_date || 'Idag';
              const urgencyColor = daysLeft <= 0 ? '#ef4444'
                : daysLeft <= 3 ? '#f97316'
                : '#22c55e';
              return (
              <React.Fragment key={i}>
                <tr>
                  <td className="art-id">{a.article}</td>
                  <td><div className="art-name">{a.name}</div></td>
                  <td><span className="abc-chip" style={{ background: abcColor(a.abc) }}>{a.abc}</span></td>
                  <td>{fmt(a.stock)}</td>
                  <td style={{ color: a.status === 'CRITICAL' ? '#ef4444' : '#f97316' }}>{fmtDays(a.coverage_days)}</td>
                  <td style={{ color: urgencyColor, fontWeight: daysLeft <= 3 ? 700 : 400 }}>{dagarKvarLabel}</td>
                  <td style={{ color: urgencyColor, fontWeight: daysLeft <= 3 ? 700 : 400 }}>{reorderLabel}</td>
                  <td><b>{fmt(a.order_qty)} st</b></td>
                  {hasCost && <td>{fmtKr(a.order_value)}</td>}
                  <td><span className="status-chip" style={{ background: statusColor(a.status) + '22', color: statusColor(a.status), border: `1px solid ${statusColor(a.status)}44` }}>{statusLabel(a.status)}</span></td>
                </tr>
                {a.explanation && (
                  <tr className="explanation-row"><td colSpan={hasCost ? 10 : 9}><span className="explanation">{a.explanation}</span></td></tr>
                )}
              </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SLOTTING TAB ────────────────────────────────────────────────────────
function SlottingTab({ data }) {
  const { summary, articles } = data;
  const hasLoc = summary.has_location_data;
  const moves = articles?.filter(a => a.suggest_move).sort((a, b) => {
    const p = { CRITICAL: 0, MEDIUM: 1, LOW: 2 };
    return (p[a.move_priority] || 2) - (p[b.move_priority] || 2);
  }) || [];
  const priorityColor = { CRITICAL: '#ef4444', MEDIUM: '#f59e0b', LOW: '#6b7280' };
  const priorityLabel = { CRITICAL: 'KRITISK', MEDIUM: 'MEDEL', LOW: 'LÅG' };
  if (!hasLoc) {
    return (
      <div className="tab-content">
        <div className="empty-state">
          <div className="empty-icon">📍</div>
          <h3>Lagerposition saknas</h3>
          <p>Slottinganalys kräver en kolumn med nuvarande lagerposition (t.ex. "Zon", "Hyllplats", "Location").</p>
          <p className="empty-tip">Lägg till kolumnen i er exportfil och ladda upp på nytt — Logitide känner automatiskt igen: <code>loc, location, lagerposition, zon, hyllplats, plats</code></p>
        </div>
      </div>
    );
  }
  return (
    <div className="tab-content">
      <div className="kpi-grid-4">
        <KpiCard label="KORREKT PLACERADE" value={fmt(summary.total_articles - summary.articles_to_move)} color="#22c55e" />
        <KpiCard label="KRITISKA FLYTT" value={fmt(moves.filter(a => a.move_priority === 'CRITICAL').length)} color="#ef4444" />
        <KpiCard label="MEDELPRIORITET" value={fmt(moves.filter(a => a.move_priority === 'MEDIUM').length)} color="#f59e0b" />
        <KpiCard label="LÅGPRIORITERADE" value={fmt(moves.filter(a => a.move_priority === 'LOW').length)} color="#6b7280" />
      </div>
      <div className="section">
        <div className="section-header">
          <h3>Flyttlista — prioriterad</h3>
          <button className="export-btn" onClick={() => exportCSV(moves)}><Icon name="download" size={14} /> Exportera CSV</button>
        </div>
        <p className="section-desc">Slottinglistan baseras på ABC/XYZ-klassificering och förbrukningsmönster. Exakt placering bestäms av lageransvarig.</p>
        <table className="article-table">
          <thead>
            <tr><th>ARTIKEL</th><th>ABC</th><th>NUVARANDE</th><th>REKOMMENDERAD</th><th>PRIORITET</th><th>✓</th></tr>
          </thead>
          <tbody>
            {moves.map((a, i) => (
              <tr key={i}>
                <td><div className="art-name">{a.name}</div><div className="art-id">{a.article}</div></td>
                <td><span className="abc-chip" style={{ background: abcColor(a.abc) }}>{a.abc}{a.xyz ? `/${a.xyz}` : ''}</span></td>
                <td>Zon {a.loc}</td>
                <td style={{ color: '#3b82f6', fontWeight: 600 }}>Zon {a.recommended_zone}</td>
                <td><span className="status-chip" style={{ background: (priorityColor[a.move_priority] || '#6b7280') + '22', color: priorityColor[a.move_priority] || '#6b7280', border: `1px solid ${(priorityColor[a.move_priority] || '#6b7280')}44` }}>{priorityLabel[a.move_priority] || a.move_priority}</span></td>
                <td><button className="check-btn">✓</button></td>
              </tr>
            ))}
          </tbody>
        </table>
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

// ─── ABC/XYZ TAB ────────────────────────────────────────────────────────
function AbcXyzTab({ data }) {
  const { abc_distribution, articles, summary } = data;
  const hasCost = summary.has_cost_data;
  const xyzAvailable = summary.xyz_available === true;
  const [selected, setSelected] = useState('A');

  // ABC-only distribution (when no XYZ)
  const abcGroups = {};
  ['A', 'B', 'C'].forEach(abc => {
    abcGroups[abc] = articles?.filter(a => a.abc === abc) || [];
  });

  // ABC/XYZ matrix (when XYZ available)
  const matrix = {};
  ['A', 'B', 'C'].forEach(abc => {
    ['X', 'Y', 'Z'].forEach(xyz => {
      const key = abc + xyz;
      matrix[key] = articles?.filter(a => a.abc === abc && a.xyz === xyz) || [];
    });
  });

  return (
    <div className="tab-content">
      {!hasCost && (
        <div className="info-banner">
          <Icon name="info" size={16} />
          ABC-klassning baseras på förbrukning (demand_per_day) — inköpspris saknas i filen.
        </div>
      )}
      {!xyzAvailable && (
        <div className="info-banner xyz-missing-banner">
          <Icon name="info" size={16} />
          <div>
            <strong>XYZ-analys kräver historisk månadsdata</strong>
            <p>Lägg till kolumner för varje period (t.ex. <code>jan</code>, <code>feb</code>…<code>dec</code> eller <code>period_1</code>…<code>period_12</code>) med respektive månads förbrukning. Då beräknar Logitide variationskoefficienten och klassificerar X (stabil), Y (varierande) och Z (oregelbunden) automatiskt.</p>
          </div>
        </div>
      )}

      {xyzAvailable ? (
        <>
          <div className="section">
            <h3>ABC/XYZ-matris</h3>
            <table className="matrix-table">
              <thead>
                <tr>
                  <th></th>
                  <th>X — Stabil</th>
                  <th>Y — Varierande</th>
                  <th>Z — Oregelbunden</th>
                </tr>
              </thead>
              <tbody>
                {['A', 'B', 'C'].map(abc => (
                  <tr key={abc}>
                    <td className="matrix-label" style={{ color: abcColor(abc) }}>{abc}</td>
                    {['X', 'Y', 'Z'].map(xyz => {
                      const key = abc + xyz;
                      const count = matrix[key]?.length || 0;
                      const value = matrix[key]?.reduce((sum, a) => sum + (a.stock_value || 0), 0) || 0;
                      return (
                        <td
                          key={xyz}
                          className={`matrix-cell ${selected === key ? 'selected' : ''} ${count > 0 ? 'has-data' : ''}`}
                          onClick={() => count > 0 && setSelected(key)}
                        >
                          <div className="matrix-key">{key}</div>
                          <div className="matrix-count">{count}</div>
                          {hasCost && <div className="matrix-val">{fmtKr(value)}</div>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="section">
            <h3>{selected} — {matrix[selected]?.length || 0} artiklar</h3>
            <div className="article-chips">
              {matrix[selected]?.map((a, i) => (
                <span key={i} className="article-chip">{a.article} {a.name}</span>
              ))}
              {matrix[selected]?.length === 0 && <p className="empty-msg">Inga artiklar i denna kategori</p>}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              ABC-matris
              <InfoTooltip text={
                "ABC klassificerar artiklar efter årlig omsättningsvärde (förbrukning × pris):\n\n" +
                "A = topp 80 % av årsvolymen — prioritera alltid.\n" +
                "B = 80–95 % — bevaka noga.\n" +
                "C = 95–100 % — hantera kostnadseffektivt.\n\n" +
                "Pareto-regeln: ca 15–20 % av artiklarna driver 80 % av kapitalet."
              } />
            </h3>
            <table className="matrix-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Antal artiklar</th>
                  <th>Lagervärde</th>
                  <th>X — Stabil</th>
                  <th>Y — Varierande</th>
                  <th>Z — Oregelbunden</th>
                </tr>
              </thead>
              <tbody>
                {['A', 'B', 'C'].map(abc => {
                  const count = abcGroups[abc]?.length || 0;
                  const value = abcGroups[abc]?.reduce((sum, a) => sum + (a.stock_value || 0), 0) || 0;
                  return (
                    <tr key={abc}>
                      <td className="matrix-label" style={{ color: abcColor(abc) }}>{abc}</td>
                      <td
                        className={`matrix-cell has-data ${selected === abc ? 'selected' : ''}`}
                        onClick={() => setSelected(abc)}
                      >
                        <div className="matrix-count">{count}</div>
                        {hasCost && <div className="matrix-val">{fmtKr(value)}</div>}
                      </td>
                      <td className={`matrix-cell has-data ${selected === abc ? 'selected' : ''}`}
                        onClick={() => setSelected(abc)}>
                        {hasCost ? <div className="matrix-val">{fmtKr(value)}</div> : <div className="matrix-val">—</div>}
                      </td>
                      {['X', 'Y', 'Z'].map(xyz => (
                        <td key={xyz} className="matrix-cell xyz-unavailable" title="XYZ kräver historisk månadsdata">
                          <div className="matrix-key xyz-dash">—</div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="section">
            <h3>{selected}-artiklar — {abcGroups[selected]?.length || 0} st</h3>
            <div className="article-chips">
              {abcGroups[selected]?.map((a, i) => (
                <span key={i} className="article-chip">{a.article} {a.name}</span>
              ))}
              {abcGroups[selected]?.length === 0 && <p className="empty-msg">Inga artiklar i denna kategori</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── PDF RAPPORT ───────────────────────────────────────────────────────
async function openPDFReport() {
  if (!window._lastUploadedFile) {
    alert('Ladda upp filen igen för att generera rapporten.');
    return;
  }
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
function Dashboard({ data, onReset, auth, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [ledtidOverrides, setLedtidOverrides] = useState({});

  const handleLedtidChange = (articleId, newDays) => {
    setLedtidOverrides(prev => ({ ...prev, [articleId]: newDays }));
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
    { id: 'abcxyz', label: summary?.xyz_available ? 'ABC/XYZ' : 'ABC', icon: 'grid' },
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
            <span>SERVICENIVÅ (A-ART.) <InfoTooltip text="Andel A-artiklar där saldo + inkommande order täcker ledtiden. En A-artikel med order på väg räknas som täckt. Mål: ≥95%. Lagerhälsa (alla) visar samma mått för samtliga artiklar oavsett klass." /></span>
            <div className="sl-bars">
              <span className="sl-low">95%</span>
              <span className="sl-cur" style={{
                color: summary?.a_service_level_pct >= 95 ? '#22c55e'
                  : summary?.a_service_level_pct >= 85 ? '#f97316' : '#ef4444'
              }}>{summary?.a_service_level_pct ?? '—'}%</span>
              <span className="sl-high">99%</span>
            </div>
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, lineHeight: 1.4, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              A-artiklar med täckning över ledtid.
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>
              Lagerhälsa (alla): {summary?.service_level_pct}%
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
          <div className="top-tabs">
            {tabs.filter(t => t.id !== 'overview').map(t => (
              <button key={t.id} className={`top-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>
        {activeTab === 'overview' && <OverviewTab data={effectiveData} onLedtidChange={handleLedtidChange} ledtidOverrides={ledtidOverrides} />}
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

// ─── SPARKLINE ────────────────────────────────────────────────────────────
function Sparkline({ values, color = '#6366f1', width = 120, height = 36, inverted = false }) {
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
          <span style={{ color: '#94a3b8' }}>{labelB}</span> → <span style={{ color: '#60a5fa' }}>{labelA}</span>
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
      const idA = Math.max(compareSelected, h.id); // newer
      const idB = Math.min(compareSelected, h.id); // older
      const hA = history.find(x => x.id === idA);
      const hB = history.find(x => x.id === idB);
      setCompareIds({
        idA, idB,
        labelA: `${fmtDate(hA.created_at)} · ${hA.filename}`,
        labelB: `${fmtDate(hB.created_at)} · ${hB.filename}`,
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
                <Sparkline values={card.sparkValues} color={card.sparkColor} inverted={card.inverted} width={100} height={30} />
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
  if (analysisData) return <Dashboard data={analysisData} auth={auth} onReset={() => setAnalysisData(null)} onLogout={handleLogout} />;
  return <UploadPage onAnalysis={setAnalysisData} auth={auth} onLogout={handleLogout} />;
}
