'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import rawData from '../links-categorized.json';

const CAT_ORDER = [];
const CAT_COUNTS = {};
const ALL_LINKS = [];
for (const [cat, data] of Object.entries(rawData.categories)) {
  const links = Array.isArray(data.links) ? data.links : [data.links];
  CAT_ORDER.push(cat);
  CAT_COUNTS[cat] = links.length;
  for (const url of links) {
    ALL_LINKS.push({ url, category: cat });
  }
}
CAT_ORDER.sort((a, b) => CAT_COUNTS[b] - CAT_COUNTS[a]);

function Svg({ name, size = 14 }) {
  const paths = {
    menu: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    back: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
    warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    analytics: '<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    next: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle' }} dangerouslySetInnerHTML={{ __html: paths[name] || '' }} />;
}

export default function Home() {
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(null);
  const [savedMeta, setSavedMeta] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [genResult, setGenResult] = useState(null);
  const [genLoading, setGenLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalyticsPage, setShowAnalyticsPage] = useState(false);
  const [toast, setToast] = useState(null);
  const [pasteContent, setPasteContent] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const toastTimer = useRef(null);

  useEffect(() => {
    fetch('/api/saved').then(r => r.json()).then(data => {
      if (data && !data.error) setSavedMeta(data);
    }).catch(() => {}).finally(() => setLoading(false));
    if (CAT_ORDER.length) setCurrentCategory(CAT_ORDER[0]);
  }, []);

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const downloadAllSaved = useCallback(() => {
    const saved = {};
    for (const [url, data] of Object.entries(savedMeta)) saved[url] = data;
    if (!Object.keys(saved).length) { showToast('Nothing saved yet', 'info'); return; }
    const blob = new Blob([JSON.stringify(saved, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
      a.download = 'datafactory-saved-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Downloaded!', 'success');
  }, [savedMeta, showToast]);

  const clearAllSaved = useCallback(() => {
    setConfirm({
      title: 'Clear All Saved',
      msg: 'Permanently delete ' + Object.keys(savedMeta).length + ' saved entries?',
      onYes: () => {
        fetch('/api/saved', { method: 'DELETE' }).catch(() => {});
        setSavedMeta({});
        setGenResult(null);
        showToast('All cleared', 'info');
      },
    });
  }, [savedMeta, showToast]);

  const saveToDb = useCallback(async (url, data) => {
    try {
      await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, ...data, savedAt: data.savedAt }),
      });
    } catch (e) { /* background sync — user will retry if needed */ }
  }, []);

  const handleSave = useCallback(() => {
    const url = currentUrl;
    if (!url) return;
    const existing = savedMeta[url];
    if (!genResult && !existing) { showToast('Generate content first', 'error'); return; }
    if (genResult) {
      const data = { ...genResult, savedAt: new Date().toISOString() };
      saveToDb(url, data);
      setSavedMeta(prev => ({ ...prev, [url]: data }));
      showToast('Generated and saved!', 'success');
    } else if (existing) {
      const { dead: _, flaggedAt: __, ...clean } = existing;
      const data = { ...clean, savedAt: new Date().toISOString() };
      saveToDb(url, data);
      setSavedMeta(prev => ({ ...prev, [url]: data }));
      showToast('Saved!', 'success');
    }
  }, [currentUrl, savedMeta, genResult, showToast, saveToDb]);

  const handleGenerate = useCallback(async () => {
    const content = pasteContent.trim();
    if (!content) { showToast('Paste some content first', 'error'); return; }
    if (!currentUrl) return;
    setGenLoading(true);
    setGenResult(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: currentUrl, content }),
      });
      const data = await res.json();
      if (data.error) {
        showToast(data.error, 'error');
      } else {
        setGenResult({ topic: data.topic, description: data.description, tags: data.tags });
        const saveData = { topic: data.topic, description: data.description, tags: data.tags, savedAt: new Date().toISOString() };
        saveToDb(currentUrl, saveData);
        setSavedMeta(prev => ({ ...prev, [currentUrl]: saveData }));
        showToast('Generated and saved!', 'success');
      }
    } catch (e) {
      showToast('Network error - check console', 'error');
    } finally {
      setGenLoading(false);
    }
  }, [pasteContent, currentUrl, showToast, saveToDb]);

  const handleFlagDead = useCallback(async () => {
    if (!currentUrl) return;
    const isDead = savedMeta[currentUrl]?.dead;
    if (isDead) {
      await fetch('/api/saved?url=' + encodeURIComponent(currentUrl), { method: 'DELETE' });
      setSavedMeta(prev => { const n = { ...prev }; delete n[currentUrl]; return n; });
      showToast('Link unmarked', 'info');
    } else {
      const body = { url: currentUrl, dead: true, flaggedAt: new Date().toISOString() };
      if (savedMeta[currentUrl]) { body.topic = savedMeta[currentUrl].topic; body.description = savedMeta[currentUrl].description; body.tags = savedMeta[currentUrl].tags; body.savedAt = savedMeta[currentUrl].savedAt; }
      await fetch('/api/saved', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      setSavedMeta(prev => ({ ...prev, [currentUrl]: { ...prev[currentUrl], dead: true, flaggedAt: body.flaggedAt } }));
      showToast('Link flagged as dead', 'info');
    }
  }, [currentUrl, savedMeta, showToast]);

  const savedEntries = Object.entries(savedMeta).filter(([,d]) => !d.dead);
  const savedCount = savedEntries.length;
  const totalLinks = CAT_ORDER.reduce((s, c) => s + CAT_COUNTS[c], 0);
  const deadLinks = {}; for (const [u, d] of Object.entries(savedMeta)) { if (d.dead) deadLinks[u] = true; }

  const filteredCats = CAT_ORDER.filter(cat => !searchQuery || cat.includes(searchQuery.toLowerCase()));

  const currentLinks = currentCategory ? ALL_LINKS.filter(l => l.category === currentCategory) : [];

  return (
    <>
      <div id="load-bar" className={loading ? 'loading' : 'done'}></div>
      {loading && <div id="load-screen"><span className="spin" style={{width:24,height:24,borderWidth:3}}></span><div>loading data...</div></div>}
      <button id="hamburger" onClick={() => setSidebarOpen(true)}><Svg name="menu" size={18} /></button>
      <div id="sidebar-overlay" className={sidebarOpen ? 'visible' : ''} onClick={() => setSidebarOpen(false)}></div>
      <aside id="sidebar" className={sidebarOpen ? 'open' : ''}>
         <div className="brand" onClick={() => { setCurrentCategory(CAT_ORDER[0]); setCurrentUrl(null); setShowAnalyticsPage(false); }}>
          ex-lnkzoo <span className="badge">{totalLinks}</span>
        </div>
        <div className="search-wrap">
          <input type="text" placeholder="search categories..." spellCheck="false"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="cat-list">
          {filteredCats.map(cat => {
            const savedInCat = ALL_LINKS.filter(l => l.category === cat && savedMeta[l.url] && !savedMeta[l.url].dead).length;
            const deadInCat = ALL_LINKS.filter(l => l.category === cat && savedMeta[l.url]?.dead).length;
            const processed = savedInCat + deadInCat;
            const total = CAT_COUNTS[cat];
            const complete = processed >= total;
            const active = cat === currentCategory;
            return (
              <div key={cat} className={'cat-item' + (active ? ' active' : '') + (complete ? ' complete' : '')}
                onClick={() => { setCurrentCategory(cat); setCurrentUrl(null); setShowAnalyticsPage(false); setSidebarOpen(false); setGenResult(null); setPasteContent(''); }}>
                <span className={'saved-dot' + (savedInCat > 0 ? '' : ' hidden')}></span>
                {cat}
                <span className="count">{processed}/{total}</span>
              </div>
            );
          })}
        </div>
        <div className="bottom-actions">
          <button onClick={() => { setShowAnalyticsPage(true); setCurrentUrl(null); setSidebarOpen(false); }}>
            <Svg name="analytics" size={14} /> Analytics
          </button>
        </div>
      </aside>
      <main id="main">
        <div className="toolbar">
          {(currentUrl || showAnalyticsPage) && (
            <button className="back-btn" onClick={() => { setCurrentUrl(null); setShowAnalyticsPage(false); setGenResult(null); setPasteContent(''); }}>
              <Svg name="back" size={14} /> back
            </button>
          )}
          <div className="title">
            {showAnalyticsPage
              ? <>Analytics <span className="sub">({savedCount} saved)</span></>
              : currentUrl
                ? <>Link <span className="sub">{currentUrl.length > 50 ? currentUrl.slice(0, 47) + '...' : currentUrl}</span></>
                : <>{currentCategory || 'ex-lnkzoo'} <span className="sub">({currentCategory ? (() => {const sc = ALL_LINKS.filter(l => l.category === currentCategory && savedMeta[l.url] && !savedMeta[l.url].dead).length; const dc = ALL_LINKS.filter(l => l.category === currentCategory && savedMeta[l.url]?.dead).length; return (sc+dc) + '/' + CAT_COUNTS[currentCategory];})() : ''})</span></>
            }
          </div>
          <div className="spacer"></div>
          <span className="saved-count" onClick={() => { setShowAnalyticsPage(true); setCurrentUrl(null); }} title="Saved analytics">
            {savedCount > 0 && <><Svg name="check" size={10} /> saved: {savedCount}</>}
          </span>
          <button className="gear-btn" onClick={() => setShowSettings(true)} title="Settings"><Svg name="gear" size={16} /></button>
        </div>
        <div id="content">
          {showAnalyticsPage && (() => {
            const allEntries = Object.entries(savedMeta);
            const liveEntries = allEntries.filter(([, d]) => !d.dead);
            const deadEntries = allEntries.filter(([, d]) => d.dead);
            const totalSize = new Blob([JSON.stringify(savedMeta)]).size;
            const catData = {};
            for (const [catKey, catTotal] of Object.entries(CAT_COUNTS)) {
              catData[catKey] = { total: catTotal, saved: 0, dead: 0 };
            }
            for (const [url] of allEntries) {
              const link = ALL_LINKS.find(l => l.url === url);
              const cat = link ? link.category : 'other';
              if (!catData[cat]) catData[cat] = { total: CAT_COUNTS[cat] || 0, saved: 0, dead: 0 };
              if (savedMeta[url]?.dead) catData[cat].dead++;
              else if (savedMeta[url]?.savedAt) catData[cat].saved++;
            }
            for (const [url] of deadEntries) {
              const link = ALL_LINKS.find(l => l.url === url);
              const cat = link ? link.category : 'other';
              if (!catData[cat]) catData[cat] = { total: CAT_COUNTS[cat] || 0, saved: 0, dead: 0 };
              catData[cat].dead++;
            }
            const catList = Object.entries(catData).filter(([,c]) => c.saved + c.dead > 0).sort((a, b) => (b[1].saved + b[1].dead) - (a[1].saved + a[1].dead));
            const dates = liveEntries.map(([, d]) => new Date(d.savedAt).getTime()).filter(Boolean).sort();
            const firstDate = dates.length ? new Date(dates[0]) : null;
            const lastDate = dates.length ? new Date(dates[dates.length - 1]) : null;
            const tagCounts = {};
            for (const [, d] of liveEntries) {
              if (d.tags) for (const t of d.tags) { const k = t.toLowerCase().trim(); if (k) tagCounts[k] = (tagCounts[k] || 0) + 1; }
            }
            const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 30);
            const recentAll = allEntries.sort((a, b) => new Date(b[1]?.flaggedAt || b[1]?.savedAt) - new Date(a[1]?.flaggedAt || a[1]?.savedAt)).slice(0, 15);
            const pieColors = ['#22c55e','#3b82f6','#a855f7','#f59e0b','#ef4444','#06b6d4','#f97316','#84cc16','#d946ef','#14b8a6','#ec4899','#8b5cf6'];
            const totalProcessed = liveEntries.length + deadEntries.length;
            const totalAllLinks = Object.values(CAT_COUNTS).reduce((s, v) => s + v, 0);
            function PieSvg({ slices, centerText, subText, size = 180 }) {
              if (!slices.length || slices.reduce((s, s2) => s + s2.value, 0) === 0) return null;
              const sz = size, cx = sz/2, cy = sz/2, r = sz/2 - 4;
              let ang = -Math.PI/2;
              const total = slices.reduce((s, s2) => s + s2.value, 0);
              return (
                <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ display:'block', margin:'0 auto' }}>
                  {slices.map((sl, i) => {
                    const a = (sl.value / total) * 2 * Math.PI;
                    if (a === 0) return null;
                    const la = a > Math.PI ? 1 : 0;
                    const x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang);
                    const x2 = cx + r * Math.cos(ang + a), y2 = cy + r * Math.sin(ang + a);
                    ang += a;
                    return <path key={i} d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${la} 1 ${x2} ${y2} Z`} fill={sl.color} stroke="var(--bg)" strokeWidth={2} />;
                  })}
                  <circle cx={cx} cy={cy} r={r*0.4} fill="var(--bg)" />
                  {centerText && <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="var(--text)" fontSize={14} fontFamily="var(--font)" fontWeight={600}>{centerText}</text>}
                  {subText && <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" fill="var(--muted)" fontSize={9} fontFamily="var(--font)">{subText}</text>}
                </svg>
              );
            }
            return (
            <div className="analytics-full">
              {firstDate && lastDate && (
                <div className="analytics-date">
                  first save: {firstDate.toLocaleDateString()} &middot; last save: {lastDate.toLocaleDateString()} &middot; span: {Math.ceil((lastDate - firstDate) / 86400000)} day(s)
                </div>
              )}
              <div className="analytics-cols">
                <div className="analytics-left">
                  <div className="analytics-grid">
                    <div className="analytics-card"><div className="label">Saved</div><div className="value">{liveEntries.length}</div></div>
                    <div className="analytics-card"><div className="label">Dead</div><div className="value red">{deadEntries.length}</div></div>
                    <div className="analytics-card"><div className="label">Completion</div><div className="value blue">{totalAllLinks ? Math.round(totalProcessed / totalAllLinks * 100) : 0}%</div></div>
                    <div className="analytics-card"><div className="label">Storage</div><div className="value amber">{totalSize < 1024 ? totalSize + ' B' : (totalSize / 1024).toFixed(1) + ' KB'}</div></div>
                    <div className="analytics-card"><div className="label">Categories</div><div className="value purple">{catList.length}/{CAT_ORDER.length}</div></div>
                    <div className="analytics-card"><div className="label">Unique Tags</div><div className="value pink">{topTags.length}</div></div>
                  </div>
                  <div className="analytics-section">
                    <h3><Svg name="analytics" size={12} /> Processed per Category</h3>
                    {catList.map(([cat, c]) => {
                      const pct = c.total ? ((c.saved + c.dead) / c.total * 100) : 0;
                      return (
                      <div key={cat} className="analytics-bar-wrap">
                        <span className="cat-name" onClick={() => { setCurrentCategory(cat); setCurrentUrl(null); setShowAnalyticsPage(false); }}>{cat}</span>
                        <div className="analytics-bar-bg">
                          <div className="analytics-bar-fill green" style={{ width: (c.total ? c.saved / c.total * 100 : 0) + '%' }}></div>
                          {c.dead > 0 && <div className="analytics-bar-fill red" style={{ width: (c.dead / c.total * 100) + '%', marginLeft: (c.saved / c.total * 100) + '%' }}></div>}
                        </div>
                        <span className="analytics-bar-count">{c.saved + c.dead}/{c.total}</span>
                      </div>
                      );
                    })}
                  </div>
                </div>
                <div className="analytics-right">
                  {topTags.length > 0 && (
                    <div className="analytics-section">
                      <h3><Svg name="zap" size={12} /> Top Tags</h3>
                      <div className="tag-cloud">{topTags.map(([tag, count]) => <span key={tag}>{tag} ({count})</span>)}</div>
                    </div>
                  )}
                  <div className="analytics-section">
                    <h3><Svg name="warning" size={12} /> Pie Charts</h3>
                    <div className="analytics-pie-grid">
                      {deadEntries.length > 0 && (
                        <div className="analytics-pie-card">
                          <div className="pie-title">Saved vs Dead</div>
                          <PieSvg slices={[{value:liveEntries.length,color:'#22c55e'},{value:deadEntries.length,color:'#ef4444'}]} centerText={liveEntries.length} subText="live" size={140} />
                          <div className="pie-legend">
                            <div><span style={{ background:'#22c55e' }}></span><span className="pie-label">Saved</span> <span className="pie-count">{liveEntries.length}</span></div>
                            <div><span style={{ background:'#ef4444' }}></span><span className="pie-label">Dead</span> <span className="pie-count">{deadEntries.length}</span></div>
                          </div>
                        </div>
                      )}
                      {deadEntries.length > 0 && (() => {
                        const deadCats = {};
                        for (const [url] of deadEntries) {
                          const link = ALL_LINKS.find(l => l.url === url);
                          const cat = link ? link.category : 'other';
                          deadCats[cat] = (deadCats[cat] || 0) + 1;
                        }
                        const deadCatList = Object.entries(deadCats).sort((a, b) => b[1] - a[1]);
                        const deadTotal = deadCatList.reduce((s, [,v]) => s + v, 0);
                        return (
                          <div className="analytics-pie-card">
                            <div className="pie-title">Dead by Domain</div>
                            <PieSvg slices={deadCatList.slice(0, 10).map(([cat, v], i) => ({ value: v, color: pieColors[i % pieColors.length] }))} centerText={deadTotal} subText="dead" size={140} />
                            <div className="pie-legend">
                              {deadCatList.slice(0, 5).map(([cat, v], i) => (
                                <div key={cat}><span style={{ background:pieColors[i % pieColors.length] }}></span><span className="pie-label" onClick={() => { setCurrentCategory(cat); setCurrentUrl(null); setShowAnalyticsPage(false); }} style={{cursor:'pointer'}}>{cat}</span> <span className="pie-count">{v}</span></div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                      <div className="analytics-pie-card">
                        <div className="pie-title">Domain Completion</div>
                        <PieSvg slices={catList.slice(0, 12).map(([cat, c], i) => ({ value: Math.max(c.saved + c.dead, 1), color: (c.saved + c.dead) >= c.total ? '#22c55e' : pieColors[i % pieColors.length] }))} centerText={catList.length} subText="active" size={140} />
                        <div className="pie-legend">
                          {catList.slice(0, 5).map(([cat, c], i) => (
                            <div key={cat}><span style={{ background: (c.saved + c.dead) >= c.total ? '#22c55e' : pieColors[i % pieColors.length] }}></span><span className="pie-label" onClick={() => { setCurrentCategory(cat); setCurrentUrl(null); setShowAnalyticsPage(false); }} style={{cursor:'pointer'}}>{cat}</span> <span className="pie-count">{c.saved + c.dead}/{c.total}</span></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {recentAll.length > 0 && (
                    <div className="analytics-section">
                      <h3><Svg name="clock" size={12} /> Recent Activity</h3>
                      <div className="recent-list">{recentAll.map(([url, d]) => {
                        const domain = (() => { try { return new URL(url).hostname; } catch { return ''; } })();
                        const label = url.length > 50 ? url.slice(0, 47) + '...' : url;
                        const isDead = d.dead;
                        return (
                          <div key={url} className={'recent-item' + (isDead ? ' dead' : '')} onClick={() => { setCurrentUrl(url); setGenResult(isDead ? null : d); setShowAnalyticsPage(false); }}>
                            <span className="recent-domain">{domain}</span>
                            <span>{isDead ? <><Svg name="flag" size={8} /> </> : ''}{label}</span>
                            <span className="recent-date">{new Date(d.flaggedAt || d.savedAt).toLocaleString()}</span>
                          </div>
                        );
                      })}</div>
                    </div>)}
                    <div className="analytics-section" style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border)' }}>
                      <button className="primary" onClick={downloadAllSaved} style={{ padding: '8px 16px', background: 'var(--green)', border: '1px solid var(--green)', color: 'var(--bg)', fontFamily: 'var(--font)', fontSize: 11, borderRadius: 6, cursor: 'pointer' }}>
                        <Svg name="download" size={12} /> Download All Saved
                      </button>
                      <button onClick={clearAllSaved} style={{ padding: '8px 16px', background: 'rgba(255,45,85,.1)', border: '1px solid var(--red)', color: 'var(--red)', fontFamily: 'var(--font)', fontSize: 11, borderRadius: 6, cursor: 'pointer' }}>
                        <Svg name="close" size={12} /> Clear All
                      </button>
                    </div>
                  </div>
              </div>
            </div>
            );
          })()}
          {!currentUrl && !showAnalyticsPage && (
            <div id="grid-view">
              {currentCategory && (() => {
                const counts = { all: currentLinks.length, done: 0, dead: 0, notdone: 0 };
                for (const l of currentLinks) {
                  if (savedMeta[l.url] && !savedMeta[l.url].dead && savedMeta[l.url].savedAt) counts.done++;
                  else if (savedMeta[l.url]?.dead) counts.dead++;
                  else counts.notdone++;
                }
                const filteredLinks = currentLinks.filter(l => {
                  if (statusFilter === 'done') return savedMeta[l.url] && !savedMeta[l.url].dead && savedMeta[l.url].savedAt;
                  if (statusFilter === 'dead') return savedMeta[l.url]?.dead;
                  if (statusFilter === 'notdone') return !savedMeta[l.url] || (!savedMeta[l.url].savedAt && !savedMeta[l.url].dead);
                  return true;
                });
                return (
                <><div className="filter-bar">
                  {['all','done','dead','notdone'].map(f => (
                    <button key={f} className={'filter-btn' + (statusFilter === f ? ' active' : '')}
                      onClick={() => setStatusFilter(f)}>
                      {f === 'all' ? 'All' : f === 'done' ? 'Done' : f === 'dead' ? 'Dead' : 'Not Done'}
                      <span className="filter-count">{counts[f]}</span>
                    </button>
                  ))}
                </div>
                <div className="card-grid">
                  {currentLinks.length === 0 && (
                    <div className="empty" style={{ gridColumn: '1 / -1' }}>
                      <div className="icon"><Svg name="info" size={32} /></div>
                      <div>no links in this category</div>
                    </div>
                  )}
                  {filteredLinks.length === 0 && currentLinks.length > 0 && (
                    <div className="empty" style={{ gridColumn: '1 / -1' }}>
                      <div className="icon"><Svg name="info" size={32} /></div>
                      <div>no {statusFilter === 'done' ? 'saved' : statusFilter === 'dead' ? 'dead' : 'unsaved'} links</div>
                    </div>
                  )}
                  {filteredLinks.map(link => {
                    const saved = savedMeta[link.url] && !savedMeta[link.url].dead && savedMeta[link.url].savedAt ? savedMeta[link.url] : null;
                    const dead = savedMeta[link.url]?.dead;
                    const domain = (() => { try { return new URL(link.url).hostname; } catch { return link.url; } })();
                    const label = link.url.length > 60 ? link.url.slice(0, 57) + '...' : link.url;
                    return (
                      <div key={link.url} className={'card' + (saved ? ' saved' : '') + (dead ? ' dead' : '')}
                        onClick={() => { setCurrentUrl(link.url); setGenResult(saved || null); }}>
                        <div className="card-domain">
                          <img src={'https://www.google.com/s2/favicons?domain=' + domain + '&sz=16'} alt=""
                            onError={e => e.target.style.display = 'none'} />
                          {domain}
                        </div>
                        <div className="card-url">{label}</div>
                        <div className="card-meta">
                          {dead && <span className="card-dead"><Svg name="flag" size={10} /> dead</span>}
                          {saved
                            ? <span className="card-saved"><Svg name="check" size={10} /> saved {new Date(saved.savedAt).toLocaleDateString()}</span>
                            : !dead && <span className="card-unsaved">not saved</span>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div></>
                );
              })()}
            </div>
          )}
          {currentUrl && !showAnalyticsPage && (
            <div id="detail-view" className="visible">
              <div className="detail-header">
                <div className="detail-url">
                  <a href={currentUrl} target="_blank" rel="noopener">{currentUrl}</a>
                  {deadLinks[currentUrl] && <span className="dead-badge"><Svg name="flag" size={10} /> dead</span>}
                </div>
                <div className="detail-actions">
                  <a className="open-link" href={currentUrl} target="_blank" rel="noopener"><Svg name="external" /> Open Original</a>
                  <button className={'flag-btn' + (deadLinks[currentUrl] ? ' flagged' : '')}
                    onClick={handleFlagDead}>
                    <Svg name="flag" size={12} />
                    {deadLinks[currentUrl] ? ' Unflag' : ' Flag Dead'}
                  </button>
                  <button className={'save-btn' + (savedMeta[currentUrl] ? ' saved' : '')}
                    onClick={handleSave} disabled={genLoading}>
                    <Svg name={savedMeta[currentUrl] ? 'refresh' : 'save'} />
                    {savedMeta[currentUrl] ? ' Update Save' : ' Save'}
                  </button>
                </div>
                <div className={'detail-status' + (savedMeta[currentUrl] ? ' saved' : '')}>
                  {savedMeta[currentUrl]
                    ? <><Svg name="check" /> saved on {new Date(savedMeta[currentUrl].savedAt).toLocaleString()}</>
                    : 'not saved yet'}
                </div>
              </div>
              <div className="detail-input">
                <label>paste content about this link</label>
                <textarea placeholder="Paste what you found interesting... description, summary, key points..."
                  value={pasteContent} onChange={e => setPasteContent(e.target.value)}></textarea>
              </div>
              <div className="detail-actions">
                <button className="gen-btn" onClick={handleGenerate} disabled={genLoading}>
                  <Svg name="zap" /> {genLoading ? 'Generating...' : 'Generate Topic & Description & Tags'}
                </button>
              </div>
              {(genResult || savedMeta[currentUrl]) && (
                <div className="gen-result visible">
                  {(genResult || savedMeta[currentUrl]).topic && (
                    <>
                      <div className="gen-label">Topic</div>
                      <div className="topic">{(genResult || savedMeta[currentUrl]).topic}</div>
                    </>
                  )}
                  {(genResult || savedMeta[currentUrl]).description && (
                    <>
                      <div className="gen-label" style={{ marginTop: 12 }}>Description</div>
                      <div className="desc">{(genResult || savedMeta[currentUrl]).description}</div>
                    </>
                  )}
                  {(genResult || savedMeta[currentUrl]).tags?.length > 0 && (
                    <>
                      <div className="gen-label" style={{ marginTop: 12 }}>Tags</div>
                      <div className="tags">
                        {(genResult || savedMeta[currentUrl]).tags.map((t, i) => <span key={i}>{t}</span>)}
                      </div>
                    </>
                  )}
                </div>
              )}
              {genLoading && (
                <div className="loader"><span className="spin"></span> generating...</div>
              )}
              {(() => {
                const idx = currentLinks.findIndex(l => l.url === currentUrl);
                const goTo = (url) => { setCurrentUrl(url); setGenResult(savedMeta[url] || null); setPasteContent(''); };
                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <button className="nav-btn" disabled={idx <= 0} onClick={() => goTo(currentLinks[idx - 1].url)}>
                      <Svg name="back" size={12} /> Prev
                    </button>
                    <span className="nav-counter">{idx + 1} / {currentLinks.length}</span>
                    <button className="nav-btn" disabled={idx < 0 || idx >= currentLinks.length - 1} onClick={() => goTo(currentLinks[idx + 1].url)}>
                      Next <Svg name="next" size={12} />
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </main>
      <div className={'modal-overlay' + (showSettings ? ' visible' : '')}>
        <div className="modal">
          <h2>
            <Svg name="gear" size={16} /> Settings
            <button className="close" onClick={() => setShowSettings(false)}><Svg name="close" size={16} /></button>
          </h2>
          <p className="info">API keys are stored <span className="key">server-side</span> via environment variables (<code>.env</code>). No key configuration needed in the browser.</p>
          <div className="section">
            <button className="primary" onClick={() => { downloadAllSaved(); setShowSettings(false); }} style={{ padding: '8px 16px', background: 'var(--green)', border: '1px solid var(--green)', color: 'var(--bg)', fontFamily: 'var(--font)', fontSize: '11px', borderRadius: '6px', cursor: 'pointer' }}>
              <Svg name="download" size={12} /> Download All Saved
            </button>
          </div>
          <div className="modal-actions">
            <button className="secondary" onClick={() => setShowSettings(false)}>Close</button>
          </div>
        </div>
      </div>
      {confirm && (
        <div className="confirm-overlay visible">
          <div className="confirm-box">
            <h3>{confirm.title}</h3>
            <p>{confirm.msg}</p>
            <div className="actions">
              <button className="confirm-yes" onClick={() => { confirm.onYes(); setConfirm(null); }}>Yes</button>
              <button className="confirm-no" onClick={() => setConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className={'toast' + (toast ? ' ' + toast.type + ' visible' : '')}>
        {toast && <><Svg name={toast.type === 'error' ? 'warning' : toast.type === 'success' ? 'check' : 'info'} size={12} /> {toast.msg}</>}
      </div>
    </>
  );
}
