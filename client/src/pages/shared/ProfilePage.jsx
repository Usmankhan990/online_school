import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const roleBg = { super_admin: '#1e3a5f', teacher: '#7c3aed', student: '#10b981', parent: '#f59e0b' };
  const roleLabel = { super_admin: 'Super Admin', teacher: 'Teacher', student: 'Student', parent: 'Parent' };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 700 }}>
      <div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>👤 My Profile</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Your account information</p></div>
      <div className="card table-responsive">
        <div style={{ background: `linear-gradient(135deg, ${roleBg[user?.role] || '#1e3a5f'}, #0f172a)`, padding: 32, color: 'white', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, flexShrink: 0 }}>
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>{user?.full_name || 'User'}</h2>
            <p style={{ fontSize: 14, opacity: 0.8 }}>{user?.email}</p>
            <span style={{ display: 'inline-block', marginTop: 6, background: 'rgba(255,255,255,0.2)', padding: '2px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
              {roleLabel[user?.role] || user?.role}
            </span>
          </div>
        </div>
        <div style={{ padding: 24, display: 'grid', gap: 16 }}>
          {[
            { label: 'Full Name', value: user?.full_name },
            { label: 'Email', value: user?.email },
            { label: 'Role', value: roleLabel[user?.role] || user?.role },
            { label: 'Account Status', value: user?.status },
            { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-PK', { dateStyle: 'long' }) : '-' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{f.label}</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{f.value || '-'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>🛡 Security</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Password management and account security options are coming soon.</p>
      </div>
    </div>
  );
}
