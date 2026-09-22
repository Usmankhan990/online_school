import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  scanCnicDocument,
  PROVINCE_CITIES,
  ALL_PAKISTAN_CITIES,
  getProvinceForCity,
} from '../../services/ocrService';
import {
  HiOutlineUpload,
  HiOutlineCamera,
  HiOutlineCheckCircle,
  HiOutlineArrowLeft,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineExclamationCircle,
  HiOutlineX,
  HiOutlineSparkles
} from 'react-icons/hi';
import logoImg from '../../assets/logo.jpg';
import LanguageToggle from '../../components/LanguageToggle';

const fallbackClasses = [
  { id: 1, display_name: 'KG / Pre-1' },
  { id: 2, display_name: 'Class 1' },
  { id: 3, display_name: 'Class 2' },
  { id: 4, display_name: 'Class 3' },
  { id: 4, display_name: 'Class 4' },
  { id: 5, display_name: 'Class 5' },
  { id: 6, display_name: 'Class 6' },
  { id: 7, display_name: 'Class 7' },
  { id: 8, display_name: 'Class 8' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm_password: '',
    gender: 'Male', student_phone: '',
    guardian_relation: 'Father',
    father_name: '', mother_name: '', father_cnic: '',
    contact_number_1: '', contact_number_2: '', parent_email: '',
    class_id: '', medium: 'English', date_of_birth: '', address: '',
  });
  const [bFormDoc, setBFormDoc] = useState(null);
  const [parentCnicFront, setParentCnicFront] = useState(null);
  const [parentCnicBack, setParentCnicBack] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Personal Details, 2: Parent / Guarantor Details, 3: Educational Institution Detail
  const [addressTab, setAddressTab] = useState('current');
  const [addressForm, setAddressForm] = useState({
    current_province: 'Punjab',
    current_city: '',
    current_address: '',
    permanent_province: 'Punjab',
    permanent_city: '',
    permanent_address: '',
    sameAsCurrent: false,
  });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [ocrStatus, setOcrStatus] = useState({ loading: false, message: '' });
  const [ocrProgress, setOcrProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/classes')
      .then(res => setClasses(res.data.classes || fallbackClasses))
      .catch(() => setClasses(fallbackClasses));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'father_cnic') {
      let v = value.replace(/[^0-9]/g, '');
      if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
      if (v.length > 13) v = v.slice(0, 13) + '-' + v.slice(13);
      if (v.length > 15) v = v.slice(0, 15);
      setForm(f => ({ ...f, [name]: v }));
      return;
    }

    if (['student_phone', 'contact_number_1', 'contact_number_2'].includes(name)) {
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 11);
      setForm(f => ({ ...f, [name]: numbersOnly }));
      return;
    }

    if (['full_name', 'father_name', 'mother_name'].includes(name)) {
      const capitalized = value.replace(/(^|\s)([a-z\u00E0-\u00FC])/g, (m, p, c) => p + c.toUpperCase());
      setForm(f => ({ ...f, [name]: capitalized }));
      return;
    }

    if (name === 'date_of_birth' && value) {
      const parts = value.split('-');
      if (parts[0] && parts[0].length > 4) {
        parts[0] = parts[0].slice(0, 4);
        setForm(f => ({ ...f, [name]: parts.join('-') }));
        return;
      }
    }

    setForm(f => ({ ...f, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm(prev => {
      const updated = { ...prev, [name]: value };

      if (name === 'current_city' && value && value !== 'Other') {
        const detectedProv = getProvinceForCity(value);
        if (detectedProv) updated.current_province = detectedProv;
      }

      if (name === 'permanent_city' && value && value !== 'Other') {
        const detectedProv = getProvinceForCity(value);
        if (detectedProv) updated.permanent_province = detectedProv;
      }

      if (prev.sameAsCurrent && name.startsWith('current_')) {
        const permField = name.replace('current_', 'permanent_');
        updated[permField] = value;
        if (name === 'current_city' && updated.current_province) {
          updated.permanent_province = updated.current_province;
        }
      }
      return updated;
    });
  };

  const performOcr = async (file, type) => {
    if (!file || !file.type.startsWith('image/')) return;
    setOcrStatus({ loading: true, message: `⚡ Scanning ${type} & auto-filling details...` });
    setOcrProgress(0);
    try {
      const parsed = await scanCnicDocument(file, type, (prog) => {
        setOcrProgress(prog);
      });
      let filledCount = 0;

      setForm(f => {
        const next = { ...f };

        if (type.includes('Back')) {
          // CNIC Back focuses on address; switch step to parent and tab to current address
          setCurrentStep(2);
          setAddressTab('current');
        } else if (type.includes('Parent') || type.includes('Father')) {
          // Parent CNIC Front: fills Parent / Guardian details
          setCurrentStep(2);
          const parentName = parsed.full_name || parsed.father_name;
          if (parentName) {
            next.father_name = parentName;
            filledCount++;
          }
          if (parsed.cnic) {
            next.father_cnic = parsed.cnic;
            filledCount++;
          }
        } else {
          // Student Smart CNIC / B-Form: fills Student details
          if (parsed.full_name && !next.full_name) { next.full_name = parsed.full_name; filledCount++; }
          if (parsed.father_name && !next.father_name) { next.father_name = parsed.father_name; filledCount++; }
          if (parsed.mother_name && !next.mother_name) { next.mother_name = parsed.mother_name; filledCount++; }
          if (parsed.gender) { next.gender = parsed.gender; filledCount++; }
          if (parsed.date_of_birth && !next.date_of_birth) { next.date_of_birth = parsed.date_of_birth; filledCount++; }
        }

        return next;
      });

      if (parsed.current_address || parsed.current_city || parsed.permanent_address || parsed.permanent_city) {
        setAddressTab('current');
        setAddressForm(prev => ({
          ...prev,
          current_address: parsed.current_address || prev.current_address,
          current_city: parsed.current_city || prev.current_city,
          current_province: parsed.current_province || prev.current_province,
          permanent_address: parsed.permanent_address || (parsed.current_address && prev.sameAsCurrent ? parsed.current_address : prev.permanent_address),
          permanent_city: parsed.permanent_city || (parsed.current_city && prev.sameAsCurrent ? parsed.current_city : prev.permanent_city),
          permanent_province: parsed.permanent_province || (parsed.current_province && prev.sameAsCurrent ? parsed.current_province : prev.permanent_province),
        }));
        filledCount++;
      }

      if (filledCount > 0) {
        setOcrStatus({ loading: false, message: `✨ Address & details successfully detected and filled! Please verify.` });
      } else {
        setOcrStatus({ loading: false, message: '' });
      }
    } catch (err) {
      console.warn('OCR error:', err);
      setOcrStatus({ loading: false, message: '' });
    }
  };

  const handleBFormChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isValidExt = ['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(ext);

    if (!isValidExt) {
      setError('Please upload a clear image (JPG, PNG, WebP) or PDF file of CNIC / B-Form.');
      e.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      setError('CNIC / B-Form file exceeds 50MB limit.');
      e.target.value = '';
      return;
    }

    setBFormDoc(file);
    performOcr(file, 'Student Smart CNIC / B-Form');
    e.target.value = '';
  };

  const handleParentCnicFrontChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isValidExt = ['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(ext);

    if (!isValidExt) {
      setError('Please upload a clear image (JPG, PNG, WebP) or PDF of CNIC Front.');
      e.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      setError('CNIC Front file exceeds 50MB limit.');
      e.target.value = '';
      return;
    }

    setParentCnicFront(file);
    performOcr(file, 'Parent CNIC Front');
    e.target.value = '';
  };

  const handleParentCnicBackChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isValidExt = ['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(ext);

    if (!isValidExt) {
      setError('Please upload a clear image (JPG, PNG, WebP) or PDF of CNIC Back.');
      e.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      setError('CNIC Back file exceeds 50MB limit.');
      e.target.value = '';
      return;
    }

    setParentCnicBack(file);
    performOcr(file, 'Parent CNIC Back');
    e.target.value = '';
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const passwordRules = [
    { label: 'Password must be at least 6 characters', valid: form.password.length >= 6 },
    { label: 'Password must contain at least one uppercase letter (A-Z)', valid: /[A-Z]/.test(form.password) },
    { label: 'Password must contain at least one lowercase letter (a-z)', valid: /[a-z]/.test(form.password) },
    { label: 'Password must contain at least one number (0-9)', valid: /[0-9]/.test(form.password) },
  ];
  const firstUnmetRule = passwordRules.find(r => !r.valid);
  const isPasswordValid = !firstUnmetRule;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      return setError('Password must meet all 4 requirements: at least 6 characters, uppercase, lowercase, and a number.');
    }
    if (form.password !== form.confirm_password) {
      return setError('Passwords do not match.');
    }
    if (!/^\d{5}-\d{7}-\d{1}$/.test(form.father_cnic)) {
      return setError(`${form.guardian_relation || 'Parent'} CNIC format must be: 00000-0000000-0`);
    }
    if (!form.parent_email || !form.parent_email.trim()) {
      return setError('Parent email is required.');
    }

    setLoading(true);
    try {
      const currentPart = [addressForm.current_address, addressForm.current_city, addressForm.current_province].filter(Boolean).join(', ');
      const permPart = [addressForm.permanent_address, addressForm.permanent_city, addressForm.permanent_province].filter(Boolean).join(', ');
      const fullAddress = addressForm.sameAsCurrent
        ? `Current & Permanent: ${currentPart}`
        : `Current: ${currentPart}${permPart ? ` | Permanent: ${permPart}` : ''}`;

      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key !== 'confirm_password' && key !== 'address') formData.append(key, val);
      });
      formData.append('address', fullAddress);

      if (bFormDoc) {
        formData.append('documents', bFormDoc);
      }
      if (parentCnicFront) {
        formData.append('documents', parentCnicFront);
      }
      if (parentCnicBack) {
        formData.append('documents', parentCnicBack);
      }

      const res = await api.post('/auth/register/student', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(`${res.data.message} Roll Number: ${res.data.roll_number}`);
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="auth-page">
        <section className="auth-success-card">
          <HiOutlineCheckCircle className="auth-success-icon" />
          <h1>Registration Submitted</h1>
          <p>{success}</p>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-aside">
          <Link to="/" className="auth-back-link">
            <HiOutlineArrowLeft />
            Home
          </Link>
          <div className="auth-brand">
            <img src={logoImg} alt="Taleem Ghar" className="auth-brand-mark" style={{ objectFit: 'cover', background: '#ffffff', padding: 2, borderRadius: 14 }} />
            <div>
              <h1>Student Admission</h1>
              <p>Taleem Ghar</p>
            </div>
          </div>
          <div className="auth-aside-copy">
            <h2>KG to 8th Punjab Board admissions</h2>
            <p>Fill the student and guardian details carefully. Your application will be reviewed by the school admin.</p>
          </div>
          <div className="auth-note">
            Documents are optional, but school leaving certificates help the admission team verify records faster.
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-form-header">
            <div>
              <p className="auth-eyebrow">Admission Form</p>
              <h2>Apply for Admission</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LanguageToggle style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface-2)' }} />
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {ocrStatus.loading && (
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              padding: '10px 14px',
              borderRadius: '10px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              fontWeight: 500
            }}>
              <span style={{
                width: '14px',
                height: '14px',
                border: '2px solid #3b82f6',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.8s linear infinite',
                flexShrink: 0
              }}></span>
              <span>{ocrStatus.message} {ocrProgress > 0 && `(${ocrProgress}%)`}</span>
            </div>
          )}

          {ocrStatus.message && !ocrStatus.loading && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#047857',
              padding: '10px 14px',
              borderRadius: '10px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              fontSize: '13px',
              fontWeight: 500
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HiOutlineSparkles size={16} color="#059669" />
                {ocrStatus.message}
              </span>
              <button
                type="button"
                onClick={() => setOcrStatus({ loading: false, message: '' })}
                style={{ background: 'transparent', border: 'none', color: '#047857', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Dismiss"
              >
                <HiOutlineX size={16} />
              </button>
            </div>
          )}

          {/* 3-Step Wizard Navigation Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-around',
            padding: '20px 12px',
            background: 'var(--bg-surface, #ffffff)',
            borderRadius: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            border: '1px solid var(--border-color, #e2e8f0)',
            marginBottom: '24px',
            gap: '8px'
          }}>
            {/* Step 1: Personal Details */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                padding: '4px',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
            >
              <div style={{
                width: '58px',
                height: '58px',
                borderRadius: '50%',
                background: currentStep === 1 ? '#3f7a1e' : (currentStep > 1 ? '#22c55e' : '#4b882d'),
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: currentStep === 1 ? '0 0 0 4px rgba(63, 122, 30, 0.25), 0 4px 12px rgba(63, 122, 30, 0.35)' : '0 2px 6px rgba(0,0,0,0.08)',
                transform: currentStep === 1 ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <circle cx="12" cy="13" r="2.2" />
                  <path d="M8 19c0-1.8 1.8-3 4-3s4 1.2 4 3" />
                </svg>
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: currentStep === 1 ? 700 : 600,
                color: currentStep === 1 ? '#0f172a' : 'var(--text-secondary, #64748b)',
                textAlign: 'center',
                lineHeight: 1.2
              }}>
                Personal Details
              </span>
            </button>

            {/* Step 2: Parent / Guarantor Details */}
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                padding: '4px',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
            >
              <div style={{
                width: '58px',
                height: '58px',
                borderRadius: '50%',
                background: currentStep === 2 ? '#1e6e73' : (currentStep > 2 ? '#0d9488' : '#227b80'),
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: currentStep === 2 ? '0 0 0 4px rgba(30, 110, 115, 0.25), 0 4px 12px rgba(30, 110, 115, 0.35)' : '0 2px 6px rgba(0,0,0,0.08)',
                transform: currentStep === 2 ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <circle cx="12" cy="9" r="2.2" />
                  <path d="M8 17c0-1.8 1.8-3 4-3s4 1.2 4 3" />
                </svg>
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: currentStep === 2 ? 700 : 600,
                color: currentStep === 2 ? '#0f172a' : 'var(--text-secondary, #64748b)',
                textAlign: 'center',
                lineHeight: 1.2
              }}>
                Parent / Guarantor Details
              </span>
            </button>

            {/* Step 3: Educational Institution Detail */}
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                padding: '4px',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
            >
              <div style={{
                width: '58px',
                height: '58px',
                borderRadius: '50%',
                background: currentStep === 3 ? '#2563eb' : '#f8fafc',
                border: currentStep === 3 ? 'none' : '2px solid #cbd5e1',
                color: currentStep === 3 ? '#ffffff' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: currentStep === 3 ? '0 0 0 4px rgba(37, 99, 235, 0.25), 0 4px 12px rgba(37, 99, 235, 0.35)' : 'none',
                transform: currentStep === 3 ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M3 10h18" />
                  <path d="M12 3l9 4.5H3L12 3z" />
                  <path d="M6 10v7" />
                  <path d="M10 10v7" />
                  <path d="M14 10v7" />
                  <path d="M18 10v7" />
                </svg>
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: currentStep === 3 ? 700 : 600,
                color: currentStep === 3 ? '#0f172a' : 'var(--text-secondary, #64748b)',
                textAlign: 'center',
                lineHeight: 1.2
              }}>
                Educational Institution Detail
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* STEP 1: Personal Details */}
            {currentStep === 1 && (
              <>
                <FormSection title="Student Information" tone="primary">
                  <Field label="Full Name *">
                    <input name="full_name" value={form.full_name} onChange={handleChange} autoCapitalize="words" className="form-input" placeholder="Student full name" required />
                  </Field>
                  <Field label="Email *">
                    <input name="email" type="email" value={form.email} onChange={handleChange} className="form-input" placeholder="student@email.com" required />
                  </Field>
                  <Field label="Password *">
                    <div style={{ position: 'relative' }}>
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Min 6 characters"
                        required
                        style={{
                          paddingRight: 40,
                          borderColor: form.password && !isPasswordValid ? '#ef4444' : undefined,
                          boxShadow: form.password && !isPasswordValid ? '0 0 0 3px rgba(239, 68, 68, 0.12)' : undefined,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                      </button>
                    </div>
                    {form.password.length > 0 && !isPasswordValid && (
                      <p className="form-error" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: '#ef4444' }}>
                        <HiOutlineExclamationCircle size={14} style={{ flexShrink: 0 }} />
                        <span>{firstUnmetRule?.label}</span>
                      </p>
                    )}
                  </Field>
                  <Field label="Confirm Password *">
                    <div style={{ position: 'relative' }}>
                      <input
                        name="confirm_password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={form.confirm_password}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Confirm password"
                        required
                        style={{
                          paddingRight: 40,
                          borderColor: form.confirm_password && form.password !== form.confirm_password ? '#ef4444' : undefined,
                          boxShadow: form.confirm_password && form.password !== form.confirm_password ? '0 0 0 3px rgba(239, 68, 68, 0.12)' : undefined,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                      </button>
                    </div>
                    {form.confirm_password.length > 0 && form.password !== form.confirm_password && (
                      <p className="form-error" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: '#ef4444' }}>
                        <HiOutlineExclamationCircle size={14} style={{ flexShrink: 0 }} />
                        <span>Passwords do not match</span>
                      </p>
                    )}
                  </Field>
                  <Field label="Date of Birth *">
                    <input
                      name="date_of_birth"
                      type="date"
                      max="9999-12-31"
                      min="1950-01-01"
                      value={form.date_of_birth}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </Field>
                  <Field label="Gender *">
                    <select name="gender" value={form.gender} onChange={handleChange} className="form-select" required>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                  <Field label="Student Contact No *">
                    <input name="student_phone" value={form.student_phone} onChange={handleChange} maxLength={11} inputMode="numeric" className="form-input" placeholder="03001234567" />
                  </Field>
                  <Field label="Upload CNIC / B-Form">
                    {!bFormDoc ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input
                          type="file"
                          id="bform-upload"
                          accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
                          onChange={handleBFormChange}
                          style={{ display: 'none' }}
                        />
                        <input
                          type="file"
                          id="bform-camera"
                          accept="image/*"
                          capture="environment"
                          onChange={handleBFormChange}
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="bform-upload"
                          className="auth-upload-box"
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 10px', borderRadius: '10px', border: '1px dashed var(--border-color, #cbd5e1)', background: 'var(--bg-surface-2, #f8fafc)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}
                        >
                          <HiOutlineUpload size={15} color="var(--primary-color, #2563eb)" /> Browse File
                        </label>
                        <label
                          htmlFor="bform-camera"
                          className="auth-upload-box"
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 10px', borderRadius: '10px', border: '1px dashed #10b981', background: '#ecfdf5', fontSize: '12px', fontWeight: 600, color: '#047857' }}
                        >
                          <HiOutlineCamera size={15} color="#059669" /> Camera Scan
                        </label>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#047857',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                          <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {bFormDoc.name}
                          </span>
                          <span style={{ opacity: 0.75, fontSize: '11px', flexShrink: 0 }}>
                            ({formatFileSize(bFormDoc.size)})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(bFormDoc)}
                            style={{
                              background: '#d1fae5',
                              border: 'none',
                              color: '#047857',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                            title="Preview CNIC / B-Form"
                          >
                            <HiOutlineEye size={13} /> Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => setBFormDoc(null)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#047857',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '2px',
                              borderRadius: '50%',
                            }}
                            title="Remove CNIC / B-Form"
                            aria-label="Remove CNIC / B-Form"
                          >
                            <HiOutlineX size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Field>
                </FormSection>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 600 }}
                  >
                    Next: Parent / Guarantor Details →
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: Parent / Guarantor Details */}
            {currentStep === 2 && (
              <>
                <FormSection title="Parent / Guardian Information" tone="accent">
                  <Field label="Parent / Guardian *">
                    <select name="guardian_relation" value={form.guardian_relation} onChange={handleChange} className="form-select" required>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                    </select>
                  </Field>
                  <Field label="Father Name *">
                    <input name="father_name" value={form.father_name} onChange={handleChange} autoCapitalize="words" className="form-input" placeholder="Father's full name" required />
                  </Field>
                  <Field label="Mother Name *">
                    <input name="mother_name" value={form.mother_name} onChange={handleChange} autoCapitalize="words" className="form-input" placeholder="Mother's full name" required />
                  </Field>
                  <Field label={`${form.guardian_relation || 'Father'} CNIC *`}>
                    <input name="father_cnic" value={form.father_cnic} onChange={handleChange} className="form-input" placeholder="00000-0000000-0" required />
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4, display: 'block' }}>Fill this form as per CNIC</span>
                  </Field>
                  <Field label="Contact Number 1 *">
                    <input name="contact_number_1" value={form.contact_number_1} onChange={handleChange} maxLength={11} inputMode="numeric" className="form-input" placeholder="03001234567" required />
                  </Field>
                  <Field label="Contact Number 2 *">
                    <input name="contact_number_2" value={form.contact_number_2} onChange={handleChange} maxLength={11} inputMode="numeric" className="form-input" placeholder="Optional" />
                  </Field>
                  <Field label="Parent Email *" wide>
                    <input name="parent_email" type="email" value={form.parent_email} onChange={handleChange} className="form-input" placeholder="parent@email.com" required />
                  </Field>

                  <Field label="CNIC Front Side">
                    {!parentCnicFront ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input
                          type="file"
                          id="parent-cnic-front-upload"
                          accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
                          onChange={handleParentCnicFrontChange}
                          style={{ display: 'none' }}
                        />
                        <input
                          type="file"
                          id="parent-cnic-front-camera"
                          accept="image/*"
                          capture="environment"
                          onChange={handleParentCnicFrontChange}
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="parent-cnic-front-upload"
                          className="auth-upload-box"
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 10px', borderRadius: '10px', border: '1px dashed var(--border-color, #cbd5e1)', background: 'var(--bg-surface-2, #f8fafc)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}
                        >
                          <HiOutlineUpload size={15} color="var(--primary-color, #2563eb)" /> Front File
                        </label>
                        <label
                          htmlFor="parent-cnic-front-camera"
                          className="auth-upload-box"
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 10px', borderRadius: '10px', border: '1px dashed #10b981', background: '#ecfdf5', fontSize: '12px', fontWeight: 600, color: '#047857' }}
                        >
                          <HiOutlineCamera size={15} color="#059669" /> Scan Front
                        </label>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#047857',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                          <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {parentCnicFront.name}
                          </span>
                          <span style={{ opacity: 0.75, fontSize: '11px', flexShrink: 0 }}>
                            ({formatFileSize(parentCnicFront.size)})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(parentCnicFront)}
                            style={{
                              background: '#d1fae5',
                              border: 'none',
                              color: '#047857',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                            title="Preview Front CNIC"
                          >
                            <HiOutlineEye size={13} /> Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => setParentCnicFront(null)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#047857',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '2px',
                              borderRadius: '50%',
                            }}
                            title="Remove Front Pic"
                            aria-label="Remove Front Pic"
                          >
                            <HiOutlineX size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Field>

                  <Field label="CNIC Back Side">
                    {!parentCnicBack ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input
                          type="file"
                          id="parent-cnic-back-upload"
                          accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
                          onChange={handleParentCnicBackChange}
                          style={{ display: 'none' }}
                        />
                        <input
                          type="file"
                          id="parent-cnic-back-camera"
                          accept="image/*"
                          capture="environment"
                          onChange={handleParentCnicBackChange}
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="parent-cnic-back-upload"
                          className="auth-upload-box"
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 10px', borderRadius: '10px', border: '1px dashed var(--border-color, #cbd5e1)', background: 'var(--bg-surface-2, #f8fafc)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}
                        >
                          <HiOutlineUpload size={15} color="var(--primary-color, #2563eb)" /> Back File
                        </label>
                        <label
                          htmlFor="parent-cnic-back-camera"
                          className="auth-upload-box"
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 10px', borderRadius: '10px', border: '1px dashed #10b981', background: '#ecfdf5', fontSize: '12px', fontWeight: 600, color: '#047857' }}
                        >
                          <HiOutlineCamera size={15} color="#059669" /> Scan Back
                        </label>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#047857',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                          <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {parentCnicBack.name}
                          </span>
                          <span style={{ opacity: 0.75, fontSize: '11px', flexShrink: 0 }}>
                            ({formatFileSize(parentCnicBack.size)})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(parentCnicBack)}
                            style={{
                              background: '#d1fae5',
                              border: 'none',
                              color: '#047857',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                            title="Preview Back CNIC"
                          >
                            <HiOutlineEye size={13} /> Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => setParentCnicBack(null)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#047857',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '2px',
                              borderRadius: '50%',
                            }}
                            title="Remove Back Pic"
                            aria-label="Remove Back Pic"
                          >
                            <HiOutlineX size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Field>

                  {/* Address Details inside Parent / Guardian Information */}
                  <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      background: 'var(--bg-surface-2, #f1f5f9)',
                      padding: '4px',
                      borderRadius: '12px',
                      marginBottom: '14px',
                      border: '1px solid var(--border-light, #e2e8f0)'
                    }}>
                      <button
                        type="button"
                        onClick={() => setAddressTab('current')}
                        style={{
                          flex: 1,
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: addressTab === 'current' ? '#ffffff' : 'transparent',
                          color: addressTab === 'current' ? '#2563eb' : 'var(--text-secondary, #64748b)',
                          boxShadow: addressTab === 'current' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        📍 Current Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddressTab('permanent')}
                        style={{
                          flex: 1,
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: addressTab === 'permanent' ? '#ffffff' : 'transparent',
                          color: addressTab === 'permanent' ? '#2563eb' : 'var(--text-secondary, #64748b)',
                          boxShadow: addressTab === 'permanent' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        🏛️ Permanent Address
                      </button>
                    </div>
                  </div>

                  <datalist id="pakistan-cities-list">
                    {ALL_PAKISTAN_CITIES.map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>

                  {addressTab === 'current' ? (
                    <>
                      <Field label="Province *">
                        <select
                          name="current_province"
                          value={addressForm.current_province}
                          onChange={handleAddressChange}
                          className="form-select"
                          required
                        >
                          {Object.keys(PROVINCE_CITIES).map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="City (Type / Search) *">
                        <input
                          type="text"
                          name="current_city"
                          list="pakistan-cities-list"
                          value={addressForm.current_city}
                          onChange={handleAddressChange}
                          className="form-input"
                          placeholder="Type or select city (e.g. Gujranwala, Lahore)..."
                          autoComplete="off"
                          required
                        />
                      </Field>
                      <Field label="Current Street / House Address *" wide>
                        <input
                          name="current_address"
                          value={addressForm.current_address}
                          onChange={handleAddressChange}
                          className="form-input"
                          placeholder="House #, Street #, Sector / Area"
                          required
                        />
                      </Field>
                    </>
                  ) : (
                    <>
                      <div style={{ gridColumn: '1 / -1', marginBottom: '6px' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
                          <input
                            type="checkbox"
                            checked={addressForm.sameAsCurrent}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setAddressForm(prev => ({
                                ...prev,
                                sameAsCurrent: checked,
                                permanent_province: checked ? prev.current_province : prev.permanent_province,
                                permanent_city: checked ? prev.current_city : prev.permanent_city,
                                permanent_address: checked ? prev.current_address : prev.permanent_address,
                              }));
                            }}
                            style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                          />
                          Same as Current Address
                        </label>
                      </div>
                      <Field label="Province *">
                        <select
                          name="permanent_province"
                          value={addressForm.sameAsCurrent ? addressForm.current_province : addressForm.permanent_province}
                          onChange={handleAddressChange}
                          className="form-select"
                          disabled={addressForm.sameAsCurrent}
                          required
                        >
                          {Object.keys(PROVINCE_CITIES).map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="City (Type / Search) *">
                        <input
                          type="text"
                          name="permanent_city"
                          list="pakistan-cities-list"
                          value={addressForm.sameAsCurrent ? addressForm.current_city : addressForm.permanent_city}
                          onChange={handleAddressChange}
                          className="form-input"
                          placeholder="Type or select city (e.g. Gujranwala, Lahore)..."
                          autoComplete="off"
                          disabled={addressForm.sameAsCurrent}
                          required
                        />
                      </Field>
                      <Field label="Permanent Street / House Address *" wide>
                        <input
                          name="permanent_address"
                          value={addressForm.sameAsCurrent ? addressForm.current_address : addressForm.permanent_address}
                          onChange={handleAddressChange}
                          className="form-input"
                          placeholder="Permanent House #, Street #, Village / Town"
                          disabled={addressForm.sameAsCurrent}
                          required
                        />
                      </Field>
                    </>
                  )}
                </FormSection>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600 }}
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 600 }}
                  >
                    Next: Educational Institution Detail →
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: Educational Institution Detail */}
            {currentStep === 3 && (
              <>
                <FormSection title="Academic Information" tone="warm">
                  <Field label="Class *">
                    <select name="class_id" value={form.class_id} onChange={handleChange} className="form-select" required>
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
                    </select>
                  </Field>
                  <Field label="Medium *">
                    <select name="medium" value={form.medium} onChange={handleChange} className="form-select">
                      <option value="English">English Medium</option>
                      <option value="Urdu">Urdu Medium</option>
                    </select>
                  </Field>
                </FormSection>

                {/* Review & Summary Card */}
                <div style={{
                  background: 'var(--bg-surface-2, #f8fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginTop: '16px'
                }}>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', marginBottom: '8px' }}>
                    📋 Application Summary
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: 'var(--text-tertiary, #64748b)' }}>Student: </span>
                      <strong>{form.full_name || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-tertiary, #64748b)' }}>Father: </span>
                      <strong>{form.father_name || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-tertiary, #64748b)' }}>City: </span>
                      <strong>{addressForm.current_city || addressForm.permanent_city || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-tertiary, #64748b)' }}>Selected Class: </span>
                      <strong>{classes.find(c => String(c.id) === String(form.class_id))?.display_name || 'Not selected'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600 }}
                  >
                    ← Previous
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-lg"
                    style={{ padding: '12px 32px', fontSize: '15px', fontWeight: 700 }}
                  >
                    {loading ? 'Submitting...' : 'Submit Admission Application'}
                  </button>
                </div>
              </>
            )}
          </form>
        </section>
      </section>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div
          onClick={() => setPreviewDoc(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface, #ffffff)',
              borderRadius: '16px',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              border: '1px solid var(--border-light, #e2e8f0)',
              overflow: 'hidden'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              borderBottom: '1px solid var(--border-light, #e2e8f0)',
              background: 'var(--bg-surface-2, #f8fafc)'
            }}>
              <div style={{ minWidth: 0, paddingRight: 12 }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Document Preview
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {previewDoc.name} ({formatFileSize(previewDoc.size)})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary, #64748b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                }}
                title="Close preview"
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            <div style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
              flex: 1,
              minHeight: '260px',
              background: '#0f172a08'
            }}>
              {previewDoc.type === 'application/pdf' || previewDoc.name.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={URL.createObjectURL(previewDoc)}
                  style={{ width: '100%', height: '65vh', border: 'none', borderRadius: '8px' }}
                  title="Document Preview"
                />
              ) : (
                <img
                  src={URL.createObjectURL(previewDoc)}
                  alt="Document Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '65vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function FormSection({ title, tone, children }) {
  return (
    <section className="auth-section">
      <h3 className={`auth-section-title ${tone}`}>{title}</h3>
      <div className="auth-grid">{children}</div>
    </section>
  );
}

function Field({ label, wide, children }) {
  return (
    <label className={wide ? 'auth-field wide' : 'auth-field'}>
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}
