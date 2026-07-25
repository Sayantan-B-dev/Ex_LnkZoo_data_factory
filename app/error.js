'use client';

export default function Error({ error, reset }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0c0c14', color: '#c0caf5', fontFamily: '"Cascadia Code","Fira Code","JetBrains Mono","Consolas",monospace',
      gap: 16, padding: 20, textAlign: 'center',
    }}>
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ff2d55" strokeWidth="1.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <h1 style={{ fontSize: 22, color: '#ff2d55', margin: 0 }}>Something went wrong</h1>
      <p style={{ color: '#565f89', fontSize: 12, margin: 0, maxWidth: 400 }}>{error?.message || 'An unexpected error occurred'}</p>
      <button onClick={reset}
        style={{ marginTop: 8, padding: '8px 20px', background: '#1a1a2e', border: '1px solid #2a2a3d', color: '#c0caf5', fontFamily: 'inherit', fontSize: 12, borderRadius: 6, cursor: 'pointer' }}>
        Try again
      </button>
    </div>
  );
}
