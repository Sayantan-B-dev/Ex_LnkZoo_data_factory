'use client';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0c0c14', color: '#c0caf5', fontFamily: '"Cascadia Code","Fira Code","JetBrains Mono","Consolas",monospace',
      gap: 16, padding: 20, textAlign: 'center',
    }}>
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#565f89" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h1 style={{ fontSize: 28, color: '#ff2d55', margin: 0 }}>404</h1>
      <p style={{ color: '#565f89', fontSize: 13, margin: 0 }}>Page not found</p>
    </div>
  );
}
