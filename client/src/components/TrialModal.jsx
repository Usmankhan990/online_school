import React, { useState, useEffect } from 'react';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import api from '../services/api';

const fallbackClasses = [
  { id: 1, display_name: 'KG / Pre-1' },
  { id: 2, display_name: 'Class 1' },
  { id: 3, display_name: 'Class 2' },
  { id: 4, display_name: 'Class 3' },
  { id: 5, display_name: 'Class 4' },
  { id: 6, display_name: 'Class 5' },
  { id: 7, display_name: 'Class 6' },
  { id: 8, display_name: 'Class 7' },
  { id: 9, display_name: 'Class 8' },
];

export default function TrialModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    full_name: '',
    email_or_phone: '',
    class_id: '',
    password: '',
    confirm_password: '',
  });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    api.get('/classes')
      .then(res => setClasses(res.data.classes || fallbackClasses))
      .catch(() => setClasses(fallbackClasses));
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.location.href = '/online_school/';
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const hasUppercase = /[A-Z]/.test(form.password);
    const hasLowercase = /[a-z]/.test(form.password);
    const hasNumberOrSpecial = /[\d!@#$%^&*()_+={}\[\]:;"'<>,.?/\\]/.test(form.password);
    const hasMinLength = form.password.length >= 8;

    if (!hasUppercase || !hasLowercase || !hasNumberOrSpecial || !hasMinLength) {
      setError('Please meet all password requirements.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/register/trial', form);
      // Auto-login the user immediately
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/online_school/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start trial. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      <div 
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', padding: 20 }}
      >
        <div className="animate-fade-in hide-scrollbar" style={{ width: '100%', maxWidth: 540, background: '#e2e5e8', borderRadius: 16, position: 'relative', overflowY: 'auto', maxHeight: 'calc(100vh - 40px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
          
          {/* Close Button */}
        <button onClick={handleClose} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: 'none', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', fontSize: 18, transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}>
          ✕
        </button>

        <div style={{ padding: '32px 32px 24px' }}>
          
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', color: '#3b82f6', padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 20, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            3-DAY FREE TRIAL
          </div>

          {/* Title & Subtitle */}
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 12, lineHeight: 1.2 }}>
            Experience Taleem Ghar Free!
          </h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, marginBottom: 24 }}>
            Get instant 3-day full access to video lectures, practice quizzes, and study material for KG to 8th Punjab Board.
          </p>

          {/* Features Box */}
          <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 12, padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginBottom: 24, border: '1px solid rgba(0,0,0,0.06)' }}>
            {[
              '66+ Books & Video Lessons',
              'Live Exams & Results',
              'Parent Dashboard Access',
              'No Credit Card Needed'
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500, color: '#334155' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                {feature}
              </div>
            ))}
          </div>

          {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 20, border: '1px solid #fecaca' }}>{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Student / Parent Full Name *</label>
              <input type="text" name="full_name" required value={form.full_name} onChange={handleChange} placeholder="Enter full name" style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.03)', fontSize: 15, color: '#1e293b', outline: 'none', transition: 'border-color 0.2s, background 0.2s' }} onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.background = 'rgba(0,0,0,0.03)'; }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Email or Phone Number *</label>
                <input type="text" name="email_or_phone" required value={form.email_or_phone} onChange={handleChange} placeholder="e.g., student@gmail.com" style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.03)', fontSize: 15, color: '#1e293b', outline: 'none', transition: 'border-color 0.2s, background 0.2s' }} onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.background = 'rgba(0,0,0,0.03)'; }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Select Class Level *</label>
                <select name="class_id" required value={form.class_id} onChange={handleChange} style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.03)', fontSize: 15, color: '#1e293b', outline: 'none', appearance: 'none', transition: 'border-color 0.2s, background 0.2s' }} onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.background = 'rgba(0,0,0,0.03)'; }}>
                  <option value="" disabled>Choose Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? "text" : "password"} name="password" required value={form.password} onChange={handleChange} placeholder="Create password" style={{ width: '100%', padding: '12px 40px 12px 16px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.03)', fontSize: 15, color: '#1e293b', outline: 'none', transition: 'border-color 0.2s, background 0.2s' }} onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.background = 'rgba(0,0,0,0.03)'; }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirmPassword ? "text" : "password"} name="confirm_password" required value={form.confirm_password} onChange={handleChange} placeholder="Confirm password" style={{ width: '100%', padding: '12px 40px 12px 16px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.03)', fontSize: 15, color: '#1e293b', outline: 'none', transition: 'border-color 0.2s, background 0.2s' }} onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.background = 'rgba(0,0,0,0.03)'; }} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {showConfirmPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            {form.password && (
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: '8+ characters', met: form.password.length >= 8 },
                  { label: 'Uppercase letter', met: /[A-Z]/.test(form.password) },
                  { label: 'Lowercase letter', met: /[a-z]/.test(form.password) },
                  { label: 'Number/Special', met: /[\d!@#$%^&*()_+={}\[\]:;"'<>,.?/\\]/.test(form.password) }
                ].map((req, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: req.met ? '#16a34a' : '#ef4444' }}>
                    {!req.met && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    )}
                    {req.label}
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, marginTop: 8, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, transition: 'background 0.2s' }} onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#2563eb')} onMouseOut={(e) => !loading && (e.currentTarget.style.background = '#3b82f6')}>
              {loading ? 'Processing...' : 'Start My Free Trial Now'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 16, fontWeight: 500 }}>
            By starting trial, you agree to our Terms of Service & Privacy Policy.
          </p>

        </div>
      </div>
      </div>
    </>
  );
}
