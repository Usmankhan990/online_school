import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    schoolName: 'Taleem Ghar',
    academicYear: '2026-2027',
    contactEmail: 'admin@taleemghar.edu',
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

      <div className="glass-card p-6 md:p-8 mb-8">
        <form onSubmit={handleSave} className="flex flex-col gap-6 min-w-0">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-[15px] font-bold text-gray-900">School Name</label>
              <input type="text" name="schoolName" value={settings.schoolName} onChange={handleChange} className="form-input" />
            </div>
            
            <div>
              <label className="block mb-2 text-[15px] font-bold text-gray-900">Academic Year</label>
              <input type="text" name="academicYear" value={settings.academicYear} onChange={handleChange} className="form-input" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-[15px] font-bold text-gray-900">Contact Email</label>
              <input type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} className="form-input" />
            </div>
            
            <div>
              <label className="block mb-2 text-[15px] font-bold text-gray-900">Contact Phone</label>
              <input type="text" name="contactPhone" value={settings.contactPhone} onChange={handleChange} className="form-input" />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-[15px] font-bold text-gray-900">Address</label>
            <input type="text" name="address" value={settings.address} onChange={handleChange} className="form-input" />
          </div>

          {/* Payment Methods Section */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">💳 Payment Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: 36 }}>
              <div>
                <label className="block mb-2 text-[15px] font-bold text-gray-900">JazzCash Account</label>
                <input type="text" name="paymentJazzcashAcc" value={settings.paymentJazzcashAcc || ''} onChange={handleChange} placeholder="03XX-XXXXXXX" className="form-input" />
              </div>
              <div>
                <label className="block mb-2 text-[15px] font-bold text-gray-900">JazzCash Account Title</label>
                <input type="text" name="paymentJazzcashName" value={settings.paymentJazzcashName || ''} onChange={handleChange} placeholder="Taleem Ghar" className="form-input" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: 36 }}>
              <div>
                <label className="block mb-2 text-[15px] font-bold text-gray-900">EasyPaisa Account</label>
                <input type="text" name="paymentEasypaisaAcc" value={settings.paymentEasypaisaAcc || ''} onChange={handleChange} placeholder="03XX-XXXXXXX" className="form-input" />
              </div>
              <div>
                <label className="block mb-2 text-[15px] font-bold text-gray-900">EasyPaisa Account Title</label>
                <input type="text" name="paymentEasypaisaName" value={settings.paymentEasypaisaName || ''} onChange={handleChange} placeholder="Taleem Ghar" className="form-input" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block mb-2 text-[15px] font-bold text-gray-900">Bank Name</label>
                <input type="text" name="paymentBankName" value={settings.paymentBankName || ''} onChange={handleChange} placeholder="e.g. HBL / Meezan Bank" className="form-input" />
              </div>
              <div>
                <label className="block mb-2 text-[15px] font-bold text-gray-900">Bank Account (IBAN)</label>
                <input type="text" name="paymentBankAccount" value={settings.paymentBankAccount || ''} onChange={handleChange} placeholder="PK00XXXX..." className="form-input" />
              </div>
              <div>
                <label className="block mb-2 text-[15px] font-bold text-gray-900">Bank Account Title</label>
                <input type="text" name="paymentBankHolder" value={settings.paymentBankHolder || ''} onChange={handleChange} placeholder="Taleem Ghar" className="form-input" />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-gray-100">
            <label className="flex items-center gap-4 cursor-pointer p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode === 'true'} onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked ? 'true' : 'false'})} className="ml-4 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-600" />
              <div>
                <div className="text-[15px] font-bold text-gray-900">Maintenance Mode</div>
                <div className="text-sm text-gray-500 mt-1">Enable this to prevent students and parents from logging in during system updates.</div>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <button type="submit" disabled={saving} className="btn btn-primary px-8 py-2.5 shadow-sm">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {message && <span className={`text-sm font-medium ${message.includes('✅') ? 'text-emerald-600' : 'text-rose-600'}`}>{message}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
