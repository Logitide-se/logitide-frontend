import React, { useState, useCallback } from 'react';
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

// ─── KPI CARD ─────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, missingReason }) {
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
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color }}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

// ─── UPLOAD PAGE ──────────────────────────────────────────────────────────
function UploadPage({ onAnalysis }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState('');
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
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/analyze`, { method: 'POST', body: formData });
      if (!res.ok) {
        let errMsg = 'Något gick fel';
        try { const err = await res.json(); errMsg = err.detail || errMsg; } catch(e) {}
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
        <h2 className="upload-headline">Från rådata<br /><span className="highlight">till beslut.</span></h2>
        <p className="upload-desc">Ladda upp er lagerdata — analysen är klar på 60 sekunder.</p>
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
                <p>{error}</p>
              </div>
            )}
          </>
        ) : (
          <div className="loading-box">
            <div className="spinner" />
            <p className="loading-msg">{loadingMsg}</p>
          </div>
        )}
        <div className="supported">
          <span>Fungerar med:</span>
          {['Jeeves', 'Monitor', 'SAP', 'Visma', 'Excel'].map(erp => (
            <span key={erp} className="erp-tag">{erp}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────
function OverviewTab({ data }) {
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
        <KpiCard label="KRITISKA BRISTER" value={fmt(summary.critical)} sub={`${summary.watch} bevakas`} color="#ef4444" />
        <KpiCard label="ATT BESTÄLLA" value={fmt(summary.articles_to_order)}
          sub={hasCost ? fmtKr(summary.total_order_value_sek) : 'Lägg till inköpspris för ordervärde'}
          color="#f97316" />
        <KpiCard
          label="BUNDET KAPITAL"
          value={hasCost ? fmtKr(summary.total_stock_value_sek) : null}
          sub={hasCost ? `varav ${fmtKr(summary.overstock_value_sek)} överlager` : null}
          color="#a855f7"
          missingReason={!hasCost ? 'Kräver inköpspris (cost) i filen' : null}
        />
        <KpiCard
          label="ATT FLYTTA"
          value={hasLoc ? fmt(summary.articles_to_move) : null}
          sub={hasLoc ? 'snabbare plock' : null}
          color="#3b82f6"
          missingReason={!hasLoc ? 'Kräver lagerposition (loc) i filen' : null}
        />
        <KpiCard label="DÖTT LAGER" value={fmt(summary.dead_stock)}
          sub={hasCost ? fmtKr(summary.dead_stock_value_sek) : `${summary.dead_stock} artiklar utan förbrukning`}
          color="#6b7280" />
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
          <h3>ABC-fördelning {!hasCost && <span className="section-note">(baserad på förbrukning)</span>}</h3>
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
        <ArticleTable articles={articles} hasCost={hasCost} hasLoc={hasLoc} />
      </div>
    </div>
  );
}

// ─── ARTICLE TABLE ────────────────────────────────────────────────────────
function ArticleTable({ articles, showExplanation = true, hasCost = true, hasLoc = true }) {
  const [filter, setFilter] = useState('Alla');
  const [abcFilter, setAbcFilter] = useState('Alla');
  const [search, setSearch] = useState('');
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
            <th>ARTIKEL</th><th>KLASS</th><th>SALDO</th><th>TÄCKTID</th><th>STATUS</th><th>ÅTGÄRD</th>
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
      const res = await fetch(`${API_URL}/export-purchase-order`, { method: 'POST', body: formData });
      if (!res.ok) {
        let errMsg = 'Export misslyckades';
        try { const err = await res.json(); errMsg = err.detail || errMsg; } catch(e) {}
        alert(errMsg);
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
              <KpiCard label="ÖVERLAGER (antal)" value={fmt(summary.overstock)} sub="artiklar" color="#a855f7" />
              <KpiCard label="DÖTT LAGER (antal)" value={fmt(summary.dead_stock)} sub="artiklar utan förbrukning" color="#6b7280" />
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
            <h3>ABC-matris</h3>
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
    const res = await fetch(`${API_URL}/monthly-report`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Serverfel vid rapport');
    const html = await res.text();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (e) {
    alert('Kunde inte generera rapport: ' + e.message);
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
function Dashboard({ data, onReset }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { summary } = data;
  const tabs = [
    { id: 'overview', label: 'Översikt', icon: 'home' },
    { id: 'abcxyz', label: summary?.xyz_available ? 'ABC/XYZ' : 'ABC', icon: 'grid' },
    { id: 'purchasing', label: 'Inköp', icon: 'trending', badge: summary?.articles_to_order },
    { id: 'slotting', label: 'Slotting', icon: 'move', badge: summary?.has_location_data ? summary?.articles_to_move : null },
    { id: 'capital', label: 'Kapital', icon: 'money', badge: summary?.has_cost_data ? (summary?.dead_stock + (summary?.overstock || 0)) : null },
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
            <span>SERVICENIVÅ</span>
            <div className="sl-bars">
              <span className="sl-low">95%</span>
              <span className="sl-cur">{summary?.service_level_pct}%</span>
              <span className="sl-high">99%</span>
            </div>
          </div>
          <div className="data-info">
            <span className="data-dot">●</span> Data aktiv<br />
            <span className="data-count">{fmt(summary?.total_articles)} artiklar</span>
          </div>
          <div className="version">v2.2 · {summary?.analysis_timestamp}</div>
          <button className="pdf-btn" onClick={() => openPDFReport()} title="Generera månadsrapport som PDF">
            <Icon name="download" size={13} /> Månadsrapport PDF
          </button>
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
        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'abcxyz' && <AbcXyzTab data={data} />}
        {activeTab === 'purchasing' && <PurchasingTab data={data} />}
        {activeTab === 'slotting' && <SlottingTab data={data} />}
        {activeTab === 'capital' && <CapitalTab data={data} />}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [analysisData, setAnalysisData] = useState(null);
  return analysisData
    ? <Dashboard data={analysisData} onReset={() => setAnalysisData(null)} />
    : <UploadPage onAnalysis={setAnalysisData} />;
}
