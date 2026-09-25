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
import ThemeToggle from '../../components/ThemeToggle';
import AuthBackgroundSlider from '../../components/AuthBackgroundSlider';

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
  const [fieldErrors, setFieldErrors] = useState({});
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

    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

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
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

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

  const performOcr = async () => {};

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
    if (fieldErrors.bFormDoc) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.bFormDoc;
        return next;
      });
    }
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
    if (fieldErrors.parentCnicFront) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.parentCnicFront;
        return next;
      });
    }
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
    if (fieldErrors.parentCnicBack) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.parentCnicBack;
        return next;
      });
    }
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

  const validateStep = (step) => {
    const errs = {};

    if (step === 1) {
      if (!form.full_name || !form.full_name.trim()) {
        errs.full_name = 'Full name is required';
      }
      if (!form.email || !form.email.trim()) {
        errs.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        errs.email = 'Please enter a valid email address';
      }
      if (!form.password) {
        errs.password = 'Password is required';
      } else if (!isPasswordValid) {
        errs.password = firstUnmetRule?.label || 'Password must meet all 4 requirements';
      }
      if (!form.confirm_password) {
        errs.confirm_password = 'Confirm password is required';
      } else if (form.password !== form.confirm_password) {
        errs.confirm_password = 'Passwords do not match';
      }
      if (!form.date_of_birth) {
        errs.date_of_birth = 'Date of birth is required';
      }
      if (!form.gender) {
        errs.gender = 'Gender is required';
      }
      if (!form.student_phone) {
        errs.student_phone = 'Student contact number is required';
      } else if (form.student_phone.length !== 11) {
        errs.student_phone = `Phone number must be exactly 11 digits (${form.student_phone.length}/11)`;
      }
      if (!form.address || !form.address.trim()) {
        errs.address = 'Current address is required';
      }
      if (!bFormDoc) {
        errs.bFormDoc = 'CNIC / B-Form document is required';
      }
    }

    if (step === 2) {
      if (!form.guardian_relation) {
        errs.guardian_relation = 'Guardian relation is required';
      }
      if (!form.father_name || !form.father_name.trim()) {
        errs.father_name = "Father's name is required";
      }
      if (!form.mother_name || !form.mother_name.trim()) {
        errs.mother_name = "Mother's name is required";
      }
      if (!form.father_cnic) {
        errs.father_cnic = `${form.guardian_relation || 'Parent'} CNIC is required`;
      } else if (!/^\d{5}-\d{7}-\d{1}$/.test(form.father_cnic)) {
        errs.father_cnic = 'CNIC format must be: 00000-0000000-0';
      }
      if (!form.contact_number_1) {
        errs.contact_number_1 = 'Contact number 1 is required';
      } else if (form.contact_number_1.length !== 11) {
        errs.contact_number_1 = `Contact number 1 must be exactly 11 digits (${form.contact_number_1.length}/11)`;
      }
      if (form.contact_number_2 && form.contact_number_2.length !== 11) {
        errs.contact_number_2 = `Contact number 2 must be exactly 11 digits (${form.contact_number_2.length}/11)`;
      }
      if (!form.parent_email || !form.parent_email.trim()) {
        errs.parent_email = 'Parent email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parent_email.trim())) {
        errs.parent_email = 'Please enter a valid email address';
      }
      if (!parentCnicFront) {
        errs.parentCnicFront = 'CNIC front side document is required';
      }
      if (!parentCnicBack) {
        errs.parentCnicBack = 'CNIC back side document is required';
      }

      if (!addressForm.current_city || !addressForm.current_city.trim()) {
        errs.current_city = 'Current city is required';
      }
      if (!addressForm.current_address || !addressForm.current_address.trim()) {
        errs.current_address = 'Current street / house address is required';
      }

      if (!addressForm.sameAsCurrent) {
        if (!addressForm.permanent_city || !addressForm.permanent_city.trim()) {
          errs.permanent_city = 'Permanent city is required';
        }
        if (!addressForm.permanent_address || !addressForm.permanent_address.trim()) {
          errs.permanent_address = 'Permanent street / house address is required';
        }
      }
    }

    if (step === 3) {
      if (!form.class_id) {
        errs.class_id = 'Please select a class';
      }
      if (!form.medium) {
        errs.medium = 'Please select a medium';
      }
    }

    return errs;
  };

  const handleNextStep = (targetStep) => {
    setError('');
    const currentErrs = validateStep(currentStep);
    if (Object.keys(currentErrs).length > 0) {
      setFieldErrors(prev => ({ ...prev, ...currentErrs }));
      setError('Please fill all required fields properly before proceeding.');
      if (currentStep === 2) {
        if (currentErrs.current_city || currentErrs.current_address) {
          setAddressTab('current');
        } else if (currentErrs.permanent_city || currentErrs.permanent_address) {
          setAddressTab('permanent');
        }
      }
      return false;
    }
    setFieldErrors({});
    setError('');
    setCurrentStep(targetStep);
    return true;
  };

  const handleTabClick = (targetStep) => {
    if (targetStep <= currentStep) {
      setError('');
      setCurrentStep(targetStep);
      return;
    }
    for (let s = 1; s < targetStep; s++) {
      const errs = validateStep(s);
      if (Object.keys(errs).length > 0) {
        setCurrentStep(s);
        setFieldErrors(errs);
        setError(`Please complete Step ${s} before proceeding.`);
        if (s === 2) {
          if (errs.current_city || errs.current_address) {
            setAddressTab('current');
          } else if (errs.permanent_city || errs.permanent_address) {
            setAddressTab('permanent');
          }
        }
        return;
      }
    }
    setFieldErrors({});
    setError('');
    setCurrentStep(targetStep);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const s1 = validateStep(1);
    if (Object.keys(s1).length > 0) {
      setCurrentStep(1);
      setFieldErrors(s1);
      setError('Please correct the errors in Step 1 (Personal Details).');
      return;
    }
    const s2 = validateStep(2);
    if (Object.keys(s2).length > 0) {
      setCurrentStep(2);
      setFieldErrors(s2);
      if (s2.current_city || s2.current_address) setAddressTab('current');
      else if (s2.permanent_city || s2.permanent_address) setAddressTab('permanent');
      setError('Please correct the errors in Step 2 (Parent Details).');
      return;
    }
    const s3 = validateStep(3);
    if (Object.keys(s3).length > 0) {
      setFieldErrors(s3);
      setError('Please select a class in Step 3 (Educational Details).');
      return;
    }

    setLoading(true);
    try {
      const currentPart = [addressForm.current_address, addressForm.current_city, addressForm.current_province].filter(Boolean).join(', ');
      const permPart = [addressForm.permanent_address, addressForm.permanent_city, addressForm.permanent_province].filter(Boolean).join(', ');
      const parentAddress = addressForm.sameAsCurrent
        ? `Current & Permanent: ${currentPart}`
        : `Current: ${currentPart}${permPart ? ` | Permanent: ${permPart}` : ''}`;

      const studentAddress = form.address ? form.address.trim() : '';
      const fullAddress = studentAddress
        ? (studentAddress === currentPart ? parentAddress : `Student: ${studentAddress} | Guardian: ${parentAddress}`)
        : parentAddress;

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
      <main className="auth-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', background: 'var(--bg-body, #FAF6EE)' }}>
        <section className="auth-success-card" style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-xl)',
          padding: '40px 32px',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <HiOutlineCheckCircle className="auth-success-icon" style={{ width: 64, height: 64, color: '#10b981', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>Registration Submitted</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>{success}</p>
          <Link to="/login" className="btn btn-primary" style={{ padding: '10px 28px', fontSize: '14px', fontWeight: 700, borderRadius: '10px', display: 'inline-block' }}>Go to Login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-aside" style={{ position: 'relative', overflow: 'hidden' }}>
          <AuthBackgroundSlider overlayOpacity={0.72} />

          {/* Top Branding matching screenshot */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                  flexShrink: 0,
                  overflow: 'hidden',
                  padding: 3,
                }}
              >
                <img
                  src={logoImg}
                  alt="Taleem Ghar"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>
              <div>
                <h1 style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                  Student Admission
                </h1>
                <p style={{ color: '#A8A29E', fontSize: 13.5, margin: '2px 0 0', fontWeight: 500 }}>
                  Taleem Ghar
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Heading & Description matching screenshot */}
          <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto', paddingTop: 16 }}>
            <h2 style={{ color: '#FFFFFF', fontSize: 'clamp(20px, 2.2vw, 26px)', fontWeight: 800, lineHeight: 1.25, marginBottom: 8 }}>
              Apka Ghar, Apka School<br />Admissions
            </h2>
            <p style={{ color: '#D6D3D1', fontSize: 13.5, lineHeight: 1.5, maxWidth: 330, margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              Fill the student and guardian details carefully. Your application will be reviewed by the school admin.
            </p>
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-form-header">
            <div>
              <p className="auth-eyebrow">Admission Form</p>
              <h2>Apply for Admission</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ThemeToggle />
              <LanguageToggle style={{ background: 'var(--bg-surface, #FFFFFF)', border: '1.5px solid var(--border-light, #EBE4D5)', color: 'var(--text-primary, #1C1917)', padding: '6px 14px', fontSize: 13, borderRadius: 9999 }} />
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ borderRadius: 9999, padding: '7px 18px', fontSize: 13, fontWeight: 700 }}>Sign In</Link>
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
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 8px',
            background: 'var(--bg-surface, #ffffff)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            border: '1.5px solid #EBE4D5',
            marginBottom: '10px',
            gap: '6px'
          }}>
            {/* Step 1: Personal Details */}
            <button
              type="button"
              onClick={() => handleTabClick(1)}
              style={{
                background: currentStep === 1 ? 'rgba(255, 204, 77, 0.15)' : 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                padding: '5px 8px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                outline: 'none',
                justifyContent: 'center'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: currentStep === 1 ? '#1C1917' : (currentStep > 1 ? '#FFCC4D' : '#F4EFE6'),
                color: currentStep === 1 ? '#FFCC4D' : (currentStep > 1 ? '#1C1917' : '#8C827A'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: currentStep === 1 ? '0 0 0 3px rgba(255, 204, 77, 0.35)' : 'none',
                flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <circle cx="12" cy="13" r="2.2" />
                  <path d="M8 19c0-1.8 1.8-3 4-3s4 1.2 4 3" />
                </svg>
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: currentStep === 1 ? 700 : 600,
                color: currentStep === 1 ? '#1C1917' : 'var(--text-secondary, #57534E)',
                textAlign: 'left',
                lineHeight: 1.2,
                whiteSpace: 'nowrap'
              }}>
                1. Personal Details
              </span>
            </button>

            {/* Step 2: Parent / Guarantor Details */}
            <button
              type="button"
              onClick={() => handleTabClick(2)}
              style={{
                background: currentStep === 2 ? 'rgba(255, 204, 77, 0.15)' : 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                padding: '5px 8px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                outline: 'none',
                justifyContent: 'center'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: currentStep === 2 ? '#1C1917' : (currentStep > 2 ? '#FFCC4D' : '#F4EFE6'),
                color: currentStep === 2 ? '#FFCC4D' : (currentStep > 2 ? '#1C1917' : '#8C827A'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: currentStep === 2 ? '0 0 0 3px rgba(255, 204, 77, 0.35)' : 'none',
                flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <circle cx="12" cy="9" r="2.2" />
                  <path d="M8 17c0-1.8 1.8-3 4-3s4 1.2 4 3" />
                </svg>
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: currentStep === 2 ? 700 : 600,
                color: currentStep === 2 ? '#1C1917' : 'var(--text-secondary, #57534E)',
                textAlign: 'left',
                lineHeight: 1.2,
                whiteSpace: 'nowrap'
              }}>
                2. Parents Details
              </span>
            </button>

            {/* Step 3: Educational Institution Detail */}
            <button
              type="button"
              onClick={() => handleTabClick(3)}
              style={{
                background: currentStep === 3 ? 'rgba(255, 204, 77, 0.15)' : 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                padding: '5px 8px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                outline: 'none',
                justifyContent: 'center'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: currentStep === 3 ? '#1C1917' : '#F4EFE6',
                border: currentStep === 3 ? 'none' : '1.5px solid #EBE4D5',
                color: currentStep === 3 ? '#FFCC4D' : '#8C827A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: currentStep === 3 ? '0 0 0 3px rgba(255, 204, 77, 0.35)' : 'none',
                flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                fontSize: '12px',
                fontWeight: currentStep === 3 ? 700 : 600,
                color: currentStep === 3 ? '#1C1917' : 'var(--text-secondary, #57534E)',
                textAlign: 'left',
                lineHeight: 1.2,
                whiteSpace: 'nowrap'
              }}>
                3. Education Details
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* STEP 1: Personal Details */}
            {currentStep === 1 && (
              <>
                <FormSection title="Student Information" tone="primary">
                  <Field label="Full Name *" error={fieldErrors.full_name}>
                    <input
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      autoCapitalize="words"
                      className="form-input"
                      placeholder="Student full name"
                      style={{
                        borderColor: fieldErrors.full_name ? '#ef4444' : undefined,
                        boxShadow: fieldErrors.full_name ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                      }}
                    />
                  </Field>
                  <Field label="Email *" error={fieldErrors.email}>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="student@email.com"
                      style={{
                        borderColor: fieldErrors.email ? '#ef4444' : undefined,
                        boxShadow: fieldErrors.email ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                      }}
                    />
                  </Field>
                  <Field label="Password *" error={fieldErrors.password}>
                    <div style={{ position: 'relative' }}>
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Min 6 characters"
                        style={{
                          paddingRight: 40,
                          borderColor: (form.password && !isPasswordValid) || fieldErrors.password ? '#ef4444' : undefined,
                          boxShadow: (form.password && !isPasswordValid) || fieldErrors.password ? '0 0 0 3px rgba(239, 68, 68, 0.12)' : undefined,
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
                  <Field label="Confirm Password *" error={fieldErrors.confirm_password}>
                    <div style={{ position: 'relative' }}>
                      <input
                        name="confirm_password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={form.confirm_password}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Confirm password"
                        style={{
                          paddingRight: 40,
                          borderColor: (form.confirm_password && form.password !== form.confirm_password) || fieldErrors.confirm_password ? '#ef4444' : undefined,
                          boxShadow: (form.confirm_password && form.password !== form.confirm_password) || fieldErrors.confirm_password ? '0 0 0 3px rgba(239, 68, 68, 0.12)' : undefined,
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
                  <Field label="Date of Birth *" error={fieldErrors.date_of_birth}>
                    <input
                      name="date_of_birth"
                      type="date"
                      max="9999-12-31"
                      min="1950-01-01"
                      value={form.date_of_birth}
                      onChange={handleChange}
                      className="form-input"
                      style={{
                        borderColor: fieldErrors.date_of_birth ? '#ef4444' : undefined,
                        boxShadow: fieldErrors.date_of_birth ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                      }}
                    />
                  </Field>
                  <Field label="Gender *" error={fieldErrors.gender}>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="form-select"
                      style={{
                        borderColor: fieldErrors.gender ? '#ef4444' : undefined,
                        boxShadow: fieldErrors.gender ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                      }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                  <Field label="Student Contact No *" error={fieldErrors.student_phone}>
                    <input
                      name="student_phone"
                      value={form.student_phone}
                      onChange={handleChange}
                      maxLength={11}
                      inputMode="numeric"
                      className="form-input"
                      placeholder="03001234567"
                      style={{
                        borderColor: fieldErrors.student_phone ? '#ef4444' : undefined,
                        boxShadow: fieldErrors.student_phone ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                      }}
                    />
                  </Field>
                  <Field label="Upload CNIC / B-Form *" error={fieldErrors.bFormDoc}>
                    {!bFormDoc ? (
                      <div>
                        <input
                          type="file"
                          id="bform-upload"
                          accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
                          onChange={handleBFormChange}
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="bform-upload"
                          className="auth-upload-box"
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: `1px dashed ${fieldErrors.bFormDoc ? '#ef4444' : 'var(--border-color, #cbd5e1)'}`,
                            background: fieldErrors.bFormDoc ? '#fef2f2' : 'var(--bg-surface-2, #f8fafc)',
                            color: fieldErrors.bFormDoc ? '#ef4444' : 'var(--text-primary)',
                            boxShadow: fieldErrors.bFormDoc ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : 'none',
                            fontSize: '13px',
                            fontWeight: 600,
                            width: '100%',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <HiOutlineUpload size={16} color={fieldErrors.bFormDoc ? '#ef4444' : 'var(--primary-color, #2563eb)'} /> Upload CNIC / B-Form
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
                  <Field label="Current Address *" wide error={fieldErrors.address}>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="House #, Street #, Sector / Area, City"
                      style={{
                        borderColor: fieldErrors.address ? '#ef4444' : undefined,
                        boxShadow: fieldErrors.address ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                      }}
                    />
                  </Field>
                </FormSection>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => handleNextStep(2)}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', fontSize: '13.5px', fontWeight: 600 }}
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
                  <Field label="Parent / Guardian *" error={fieldErrors.guardian_relation}>
                    <select
                      name="guardian_relation"
                      value={form.guardian_relation}
                      onChange={handleChange}
                      className="form-select"
                      style={{
                        borderColor: fieldErrors.guardian_relation ? '#ef4444' : undefined,
                        boxShadow: fieldErrors.guardian_relation ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                      }}
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                    </select>
                  </Field>
                  <Field label="Father Name *" error={fieldErrors.father_name}>
                    <input
                      name="father_name"
                      value={form.father_name}
                      onChange={handleChange}
                      autoCapitalize="words"
                      className="form-input"
                      placeholder="Father's full name"
                      style={{
                        borderColor: fieldErrors.father_name ? '#ef4444' : undefined,
                        boxShadow: fieldErrors.father_name ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                      }}
                    />
                  </Field>
                  <Field label="Mother Name *" error={fieldErrors.mother_name}>
                    <input
                      name="mother_name"
                      value={form.mother_name}
                      onChange={handleChange}
                      autoCapitalize="words"
                      className="form-input"
                      placeholder="Mother's full name"
                      style={{
                        borderColor: fieldErrors.mother_name ? '#ef4444' : undefined,
                        boxShadow: fieldErrors.mother_name ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                      }}
                    />
                  </Field>
                  <Field label={`${form.guardian_relation || 'Father'} CNIC *`} error={fieldErrors.father_cnic}>
                    <input
                      name="father_cnic"
                      value={form.father_cnic}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="00000-0000000-0"
                      style={{
                        borderColor: fieldErrors.father_cnic ? '#ef4444' : undefined,
                        boxShadow: fieldErrors.father_cnic ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                      }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4, display: 'block' }}>Fill this form as per CNIC</span>
                  </Field>
                  <Field label="Contact Number 1 *" error={fieldErrors.contact_number_1}>
                    <input
                      name="contact_number_1"
                      value={form.contact_number_1}
                      onChange={handleChange}
                      maxLength={11}
                      inputMode="numeric"
                      className="form-input"
                      placeholder="03001234567"
                      style={{
                        borderColor: fieldErrors.contact_number_1 ? '#ef4444' : undefined,
                        boxShadow: fieldErrors.contact_number_1 ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                      }}
                    />
                  </Field>
                  <Field label="Contact Number 2" error={fieldErrors.contact_number_2}>
                    <input
                      name="contact_number_2"
                      value={form.contact_number_2}
                      onChange={handleChange}
                      maxLength={11}
                      inputMode="numeric"
                      className="form-input"
                      placeholder="Optional"
                      style={{
                        borderColor: fieldErrors.contact_number_2 ? '#ef4444' : undefined,
                        boxShadow: fieldErrors.contact_number_2 ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                      }}
                    />
                  </Field>
                  <Field label="Parent Email *" wide error={fieldErrors.parent_email}>
                    <input
                      name="parent_email"
                      type="email"
                      value={form.parent_email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="parent@email.com"
                      style={{
                        borderColor: fieldErrors.parent_email ? '#ef4444' : undefined,
                        boxShadow: fieldErrors.parent_email ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                      }}
                    />
                  </Field>

                  <Field label="CNIC Front Side *" error={fieldErrors.parentCnicFront}>
                    {!parentCnicFront ? (
                      <div>
                        <input
                          type="file"
                          id="parent-cnic-front-upload"
                          accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
                          onChange={handleParentCnicFrontChange}
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="parent-cnic-front-upload"
                          className="auth-upload-box"
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: `1px dashed ${fieldErrors.parentCnicFront ? '#ef4444' : 'var(--border-color, #cbd5e1)'}`,
                            background: fieldErrors.parentCnicFront ? '#fef2f2' : 'var(--bg-surface-2, #f8fafc)',
                            color: fieldErrors.parentCnicFront ? '#ef4444' : 'var(--text-primary)',
                            boxShadow: fieldErrors.parentCnicFront ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : 'none',
                            fontSize: '13px',
                            fontWeight: 600,
                            width: '100%',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <HiOutlineUpload size={16} color={fieldErrors.parentCnicFront ? '#ef4444' : 'var(--primary-color, #2563eb)'} /> Upload CNIC Front
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

                  <Field label="CNIC Back Side *" error={fieldErrors.parentCnicBack}>
                    {!parentCnicBack ? (
                      <div>
                        <input
                          type="file"
                          id="parent-cnic-back-upload"
                          accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
                          onChange={handleParentCnicBackChange}
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="parent-cnic-back-upload"
                          className="auth-upload-box"
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: `1px dashed ${fieldErrors.parentCnicBack ? '#ef4444' : 'var(--border-color, #cbd5e1)'}`,
                            background: fieldErrors.parentCnicBack ? '#fef2f2' : 'var(--bg-surface-2, #f8fafc)',
                            color: fieldErrors.parentCnicBack ? '#ef4444' : 'var(--text-primary)',
                            boxShadow: fieldErrors.parentCnicBack ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : 'none',
                            fontSize: '13px',
                            fontWeight: 600,
                            width: '100%',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <HiOutlineUpload size={16} color={fieldErrors.parentCnicBack ? '#ef4444' : 'var(--primary-color, #2563eb)'} /> Upload CNIC Back
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
                        >
                          {Object.keys(PROVINCE_CITIES).map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="City (Type / Search) *" error={fieldErrors.current_city}>
                        <input
                          type="text"
                          name="current_city"
                          list="pakistan-cities-list"
                          value={addressForm.current_city}
                          onChange={handleAddressChange}
                          className="form-input"
                          placeholder="Type or select city (e.g. Gujranwala, Lahore)..."
                          autoComplete="off"
                          style={{
                            borderColor: fieldErrors.current_city ? '#ef4444' : undefined,
                            boxShadow: fieldErrors.current_city ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                          }}
                        />
                      </Field>
                      <Field label="Current Street / House Address *" wide error={fieldErrors.current_address}>
                        <input
                          name="current_address"
                          value={addressForm.current_address}
                          onChange={handleAddressChange}
                          className="form-input"
                          placeholder="House #, Street #, Sector / Area"
                          style={{
                            borderColor: fieldErrors.current_address ? '#ef4444' : undefined,
                            boxShadow: fieldErrors.current_address ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                          }}
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
                              if (checked) {
                                setFieldErrors(prev => {
                                  const next = { ...prev };
                                  delete next.permanent_city;
                                  delete next.permanent_address;
                                  return next;
                                });
                              }
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
                        >
                          {Object.keys(PROVINCE_CITIES).map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="City (Type / Search) *" error={fieldErrors.permanent_city}>
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
                          style={{
                            borderColor: fieldErrors.permanent_city ? '#ef4444' : undefined,
                            boxShadow: fieldErrors.permanent_city ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                          }}
                        />
                      </Field>
                      <Field label="Permanent Street / House Address *" wide error={fieldErrors.permanent_address}>
                        <input
                          name="permanent_address"
                          value={addressForm.sameAsCurrent ? addressForm.current_address : addressForm.permanent_address}
                          onChange={handleAddressChange}
                          className="form-input"
                          placeholder="Permanent House #, Street #, Village / Town"
                          disabled={addressForm.sameAsCurrent}
                          style={{
                            borderColor: fieldErrors.permanent_address ? '#ef4444' : undefined,
                            boxShadow: fieldErrors.permanent_address ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                          }}
                        />
                      </Field>
                    </>
                  )}
                </FormSection>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => { setError(''); setCurrentStep(1); }}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600 }}
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNextStep(3)}
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
                  <Field label="Class *" error={fieldErrors.class_id}>
                    <select
                      name="class_id"
                      value={form.class_id}
                      onChange={handleChange}
                      className="form-select"
                      style={{
                        borderColor: fieldErrors.class_id ? '#ef4444' : undefined,
                        boxShadow: fieldErrors.class_id ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                      }}
                    >
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
                    </select>
                  </Field>
                  <Field label="Medium *" error={fieldErrors.medium}>
                    <select
                      name="medium"
                      value={form.medium}
                      onChange={handleChange}
                      className="form-select"
                      style={{
                        borderColor: fieldErrors.medium ? '#ef4444' : undefined,
                        boxShadow: fieldErrors.medium ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : undefined
                      }}
                    >
                      <option value="English">English Medium</option>
                      <option value="Urdu">Urdu Medium</option>
                    </select>
                  </Field>
                </FormSection>

                {/* Review & Summary Card */}
                <div style={{
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginTop: '10px'
                }}>
                  <p style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    📋 Application Summary
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '12.5px' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Student: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{form.full_name || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Father: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{form.father_name || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>City: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{addressForm.current_city || addressForm.permanent_city || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Selected Class: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{classes.find(c => String(c.id) === String(form.class_id))?.display_name || 'Not selected'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => { setError(''); setCurrentStep(2); }}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', fontSize: '13.5px', fontWeight: 600 }}
                  >
                    ← Previous
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ padding: '9px 24px', fontSize: '14px', fontWeight: 700 }}
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

function Field({ label, wide, error, children }) {
  return (
    <label className={wide ? 'auth-field wide' : 'auth-field'}>
      <span className="form-label" style={{ color: error ? '#ef4444' : undefined }}>{label}</span>
      {children}
      {error && (
        <span style={{ fontSize: 11.5, color: '#ef4444', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          ⚠️ {error}
        </span>
      )}
    </label>
  );
}
