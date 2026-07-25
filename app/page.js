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
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    fetch('/api/saved').then(r => r.json()).then(data => {
      if (data && !data.error) setSavedMeta(data);
    }).catch(() => {});
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

  const handleImport = useCallback(() => {
    const text = importText.trim();
    if (!text) { showToast('Paste WhatsApp chat text first', 'error'); return; }
    const urlRegex = /https?:\/\/[^\s<>"']+/g;
    const raw = text.match(urlRegex) || [];
    const seen = new Set();
    const urls = [];
    for (const u of raw) {
      const cleaned = u.replace(/[.,;:!?)]+$/, '').split('?')[0];
      if (cleaned.length > 10 && !seen.has(cleaned)) { seen.add(cleaned); urls.push(cleaned); }
    }
    if (!urls.length) { showToast('No URLs found in text', 'error'); return; }
    const categories = {};
    for (const url of urls) {
      try {
        const domain = new URL(url).hostname.replace(/^www\./, '');
        if (!categories[domain]) categories[domain] = { links: [] };
        categories[domain].links.push(url);
      } catch { /* skip invalid */ }
    }
    const catKeys = Object.keys(categories).sort((a, b) => categories[b].links.length - categories[a].links.length);
    const total = Object.values(categories).reduce((s, c) => s + c.links.length, 0);
    setImportResult({
      total, domains: catKeys.length, categories,
      json: JSON.stringify({
        meta: { total_links: total, generated_at: new Date().toISOString(), unique_domains: catKeys.length, source_file: 'imported chat' },
        categories,
      }, null, 2),
    });
    showToast(`Parsed ${total} links across ${catKeys.length} domains`, 'success');
  }, [importText, showToast]);

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
      const data = { ...existing, savedAt: new Date().toISOString() };
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

  const savedCount = Object.keys(savedMeta).length;
  const totalLinks = CAT_ORDER.reduce((s, c) => s + CAT_COUNTS[c], 0);

  const filteredCats = CAT_ORDER.filter(cat => !searchQuery || cat.includes(searchQuery.toLowerCase()));

  const currentLinks = currentCategory ? ALL_LINKS.filter(l => l.category === currentCategory) : [];

  return (
    <>
      <button id="hamburger" onClick={() => setSidebarOpen(true)}><Svg name="menu" size={18} /></button>
      <div id="sidebar-overlay" className={sidebarOpen ? 'visible' : ''} onClick={() => setSidebarOpen(false)}></div>
      <aside id="sidebar" className={sidebarOpen ? 'open' : ''}>
         <div className="brand" onClick={() => { setCurrentCategory(CAT_ORDER[0]); setCurrentUrl(null); setShowAnalyticsPage(false); }}>
          LnkZoo Data Factory <span>v1</span><span className="badge">{totalLinks}</span>
        </div>
        <div className="search-wrap">
          <input type="text" placeholder="search categories..." spellCheck="false"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="cat-list">
          {filteredCats.map(cat => {
            const savedInCat = ALL_LINKS.filter(l => l.category === cat && savedMeta[l.url]).length;
            const active = cat === currentCategory;
            return (
              <div key={cat} className={'cat-item' + (active ? ' active' : '')}
                onClick={() => { setCurrentCategory(cat); setCurrentUrl(null); setShowAnalyticsPage(false); setSidebarOpen(false); setGenResult(null); setPasteContent(''); }}>
                <span className={'saved-dot' + (savedInCat > 0 ? '' : ' hidden')}></span>
                {cat}
                <span className="count">{CAT_COUNTS[cat]}</span>
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
                : <>{currentCategory || 'LnkZoo Data Factory'} <span className="sub">({currentCategory ? CAT_COUNTS[currentCategory] : ''})</span></>
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
            const entries = Object.entries(savedMeta);
            const totalSize = new Blob([JSON.stringify(savedMeta)]).size;
            const dates = entries.map(([, d]) => new Date(d.savedAt).getTime()).filter(Boolean).sort();
            const firstDate = dates.length ? new Date(dates[0]) : null;
            const lastDate = dates.length ? new Date(dates[dates.length - 1]) : null;
            const catSaved = {};
            for (const [url] of entries) {
              const link = ALL_LINKS.find(l => l.url === url);
              const cat = link ? link.category : 'other';
              catSaved[cat] = (catSaved[cat] || 0) + 1;
            }
            const catEntries = Object.entries(catSaved).sort((a, b) => b[1] - a[1]);
            const maxCatCount = catEntries.length ? catEntries[0][1] : 1;
            const tagCounts = {};
            for (const [, d] of entries) {
              if (d.tags) for (const t of d.tags) { const k = t.toLowerCase().trim(); if (k) tagCounts[k] = (tagCounts[k] || 0) + 1; }
            }
            const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 30);
            const recentEntries = entries.sort((a, b) => new Date(b[1].savedAt) - new Date(a[1].savedAt)).slice(0, 15);
            return (
            <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
              <div className="analytics-grid">
                <div className="analytics-card"><div className="label">Total Saved</div><div className="value">{entries.length}</div></div>
                <div className="analytics-card"><div className="label">Storage Size</div><div className="value amber">{totalSize < 1024 ? totalSize + ' B' : (totalSize / 1024).toFixed(1) + ' KB'}</div></div>
                <div className="analytics-card"><div className="label">Categories Used</div><div className="value blue">{catEntries.length}</div></div>
                <div className="analytics-card"><div className="label">Unique Tags</div><div className="value purple">{topTags.length}</div></div>
              </div>
              {firstDate && lastDate && (
                <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 16, textAlign: 'center' }}>
                  first save: {firstDate.toLocaleDateString()} &middot; last save: {lastDate.toLocaleDateString()} &middot; span: {Math.ceil((lastDate - firstDate) / 86400000)} day(s)
                </div>
              )}
              <div className="analytics-section">
                <h3><Svg name="analytics" size={12} /> Saved per Category</h3>
                {catEntries.map(([cat, count]) => (
                  <div key={cat} className="analytics-bar-wrap">
                    <span className="cat-name" onClick={() => { setCurrentCategory(cat); setCurrentUrl(null); setShowAnalyticsPage(false); }}>{cat}</span>
                    <div className="analytics-bar-bg"><div className="analytics-bar-fill green" style={{ width: (count / maxCatCount * 100) + '%' }}></div></div>
                    <span className="analytics-bar-count">{count}</span>
                  </div>
                ))}
              </div>
              {topTags.length > 0 && (
                <div className="analytics-section">
                  <h3><Svg name="zap" size={12} /> Top Tags</h3>
                  <div className="tag-cloud">{topTags.map(([tag, count]) => <span key={tag}>{tag} ({count})</span>)}</div>
                </div>
              )}
              <div className="analytics-section">
                <h3><Svg name="clock" size={12} /> Recent Saves</h3>
                <div className="recent-list">{recentEntries.map(([url, d]) => {
                  const domain = (() => { try { return new URL(url).hostname; } catch { return ''; } })();
                  const label = url.length > 50 ? url.slice(0, 47) + '...' : url;
                  return (
                    <div key={url} className="recent-item" onClick={() => { setCurrentUrl(url); setGenResult(d); setShowAnalyticsPage(false); }}>
                      <span className="recent-domain">{domain}</span>
                      <span>{label}</span>
                      <span className="recent-date">{new Date(d.savedAt).toLocaleString()}</span>
                    </div>
                  );
                })}</div>
              </div>
              <div className="analytics-section" style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <button className="primary" onClick={downloadAllSaved} style={{ padding: '8px 16px', background: 'var(--green)', border: '1px solid var(--green)', color: 'var(--bg)', fontFamily: 'var(--font)', fontSize: 11, borderRadius: 6, cursor: 'pointer' }}>
                  <Svg name="download" size={12} /> Download All Saved
                </button>
                <button onClick={clearAllSaved} style={{ padding: '8px 16px', background: 'rgba(255,45,85,.1)', border: '1px solid var(--red)', color: 'var(--red)', fontFamily: 'var(--font)', fontSize: 11, borderRadius: 6, cursor: 'pointer' }}>
                  <Svg name="close" size={12} /> Clear All Saved
                </button>
              </div>
            </div>
            );
          })()}
          {!currentUrl && !showAnalyticsPage && (
            <div id="grid-view">
              <div className="card-grid">
                {currentLinks.length === 0 && currentCategory && (
                  <div className="empty" style={{ gridColumn: '1 / -1' }}>
                    <div className="icon"><Svg name="info" size={32} /></div>
                    <div>no links in this category</div>
                  </div>
                )}
                {currentLinks.map(link => {
                  const saved = savedMeta[link.url];
                  const domain = (() => { try { return new URL(link.url).hostname; } catch { return link.url; } })();
                  const label = link.url.length > 60 ? link.url.slice(0, 57) + '...' : link.url;
                  return (
                    <div key={link.url} className={'card' + (saved ? ' saved' : '')}
                      onClick={() => { setCurrentUrl(link.url); setGenResult(saved || null); }}>
                      <div className="card-domain">
                        <img src={'https://www.google.com/s2/favicons?domain=' + domain + '&sz=16'} alt=""
                          onError={e => e.target.style.display = 'none'} />
                        {domain}
                      </div>
                      <div className="card-url">{label}</div>
                      <div className="card-meta">
                        {saved
                          ? <span className="card-saved"><Svg name="check" size={10} /> saved {new Date(saved.savedAt).toLocaleDateString()}</span>
                          : <span className="card-unsaved">not saved</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {currentUrl && !showAnalyticsPage && (
            <div id="detail-view" className="visible">
              <div className="detail-header">
                <div className="detail-url">
                  <a href={currentUrl} target="_blank" rel="noopener">{currentUrl}</a>
                </div>
                <div className="detail-actions">
                  <a className="open-link" href={currentUrl} target="_blank" rel="noopener"><Svg name="external" /> Open Original</a>
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
            <button className="primary" onClick={() => { downloadAllSaved(); setShowSettings(false); }} style={{ padding: '8px 16px', background: 'var(--green)', border: '1px solid var(--green)', color: 'var(--bg)', fontFamily: 'var(--font)', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', marginRight: 8 }}>
              <Svg name="download" size={12} /> Download All Saved
            </button>
            <button onClick={() => { clearAllSaved(); setShowSettings(false); }} style={{ padding: '8px 16px', background: 'rgba(255,45,85,.1)', border: '1px solid var(--red)', color: 'var(--red)', fontFamily: 'var(--font)', fontSize: '11px', borderRadius: '6px', cursor: 'pointer' }}>
              <Svg name="close" size={12} /> Clear All Saved
            </button>
          </div>
          <div className="section">
            <h3 style={{ fontSize: 12, color: 'var(--text)', marginBottom: 8 }}><Svg name="upload" size={12} /> Import WhatsApp Chat</h3>
            <textarea value={importText} onChange={e => { setImportText(e.target.value); setImportResult(null); }}
              placeholder="Paste WhatsApp chat export text here..." rows={4}
              style={{ width: '100%', padding: 8, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 11, borderRadius: 6, resize: 'vertical', outline: 'none', lineHeight: 1.5 }}></textarea>
            <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={handleImport} style={{ padding: '6px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 11, borderRadius: 6, cursor: 'pointer' }}>
                <Svg name="upload" size={11} /> Parse URLs
              </button>
              {importResult && (
                <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                  {importResult.total} links, {importResult.domains} domains
                  <button onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([importResult.json], {type:'application/json'})); a.download = 'links-categorized.json'; a.click(); URL.revokeObjectURL(a.href); }}
                    style={{ marginLeft: 6, padding: '3px 8px', background: 'var(--green)', border: 'none', color: 'var(--bg)', fontFamily: 'var(--font)', fontSize: 10, borderRadius: 4, cursor: 'pointer' }}>
                    Download JSON
                  </button>
                </span>
              )}
            </div>
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
