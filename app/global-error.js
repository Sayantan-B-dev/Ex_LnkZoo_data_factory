'use client';

export default function GlobalError({ error }) {
  return (
    <html>
      <body style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0c0c14', color: '#c0caf5', fontFamily: '"Cascadia Code","Fira Code","JetBrains Mono","Consolas",monospace', padding: 20, textAlign: 'center' }}>
        <div>
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ff2d55" strokeWidth="1.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <h1 style={{ fontSize: 22, color: '#ff2d55', margin: '16px 0 8px' }}>Fatal Error</h1>
          <p style={{ color: '#565f89', fontSize: 12, margin: 0 }}>{error?.message || 'The application failed to load'}</p>
        </div>
      </body>
    </html>
  );
}
