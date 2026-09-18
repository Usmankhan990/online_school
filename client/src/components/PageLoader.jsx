import logoImg from '../assets/logo.jpg';

export default function PageLoader({ text = 'Loading...', fullScreen = false }) {
  const containerStyle = fullScreen
    ? { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }
    : { minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' };

  return (
    <div style={containerStyle} className="animate-fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 68, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={logoImg}
            alt="Taleem Ghar"
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              objectFit: 'cover',
              background: '#ffffff',
              padding: 2,
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.06)'
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: 18,
              border: '2.5px solid transparent',
              borderTopColor: '#10b981',
              borderRightColor: '#10b981',
              animation: 'spin 1.2s linear infinite'
            }}
          />
        </div>
        {text && <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', margin: 0 }}>{text}</p>}
      </div>
    </div>
  );
}
