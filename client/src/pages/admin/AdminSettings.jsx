import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    schoolName: 'Usman Online School',
    academicYear: '2026-2027',
    contactEmail: 'admin@usmanschool.edu',
    contactPhone: '+92 300 1234567',
    address: '123 Education Street, Lahore',
    maintenanceMode: 'false'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings');
      if (data.settings && Object.keys(data.settings).length > 0) {
        setSettings({ ...settings, ...data.settings });
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.post('/admin/settings', { settings });
      setMessage('✅ Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading settings...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
      <div className="page-header">
        <h1>⚙️ System Settings</h1>
        <p>Configure school settings, academic year, and system preferences.</p>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <form onSubmit={handleSave} className="flex flex-col gap-5 min-w-0">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>School Name</label>
              <input type="text" name="schoolName" value={settings.schoolName} onChange={handleChange} className="input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Academic Year</label>
              <input type="text" name="academicYear" value={settings.academicYear} onChange={handleChange} className="input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)' }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Contact Email</label>
              <input type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} className="input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Contact Phone</label>
              <input type="text" name="contactPhone" value={settings.contactPhone} onChange={handleChange} className="input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Address</label>
            <input type="text" name="address" value={settings.address} onChange={handleChange} className="input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)' }} />
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', margin: '10px 0', padding: '10px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode === 'true'} onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked ? 'true' : 'false'})} style={{ width: 18, height: 18 }} />
              <div>
                <div style={{ fontWeight: 600 }}>Maintenance Mode</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Enable this to prevent students and parents from logging in during system updates.</div>
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: 8, background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {message && <span style={{ fontSize: 14, fontWeight: 500, color: message.includes('✅') ? '#10b981' : '#ef4444' }}>{message}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
