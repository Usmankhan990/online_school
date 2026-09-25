import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { PublicNav, Footer } from './LandingPage';
import api from '../../services/api';
import logoImg from '../../assets/logo.jpg';
import { t, getCurrentLanguage } from '../../utils/translate';
import {
  HiOutlineUser,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheckCircle,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineSparkles,
  HiOutlineSearch,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineClipboardList,
  HiOutlineDocumentText,
  HiOutlinePaperClip,
  HiOutlineX,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';

// Modular job postings list - easily expandable in future or fetched from API
const INITIAL_JOB_POSTS = [
  {
    id: 'math-senior',
    title: 'Senior Mathematics Teacher (Grade 6-8)',
    department: 'STEM',
    category: 'stem',
    type: 'Part-Time / Full-Time',
    location: 'Remote (100% Online)',
    qualification: 'BS / M.Sc Mathematics / Education',
    experience: '2+ Years Teaching Experience',
    description: 'Deliver engaging live video lectures, solve textbook exercises, and conduct interactive quizzes for Punjab Board Class 6th to 8th Mathematics curriculum.',
    skills: ['PCTB Curriculum', 'Live Online Teaching', 'Problem Solving', 'Exam Preparation'],
    featured: true,
  },
  {
    id: 'science-lead',
    title: 'General Science & Biology Educator (Grade 5-8)',
    department: 'Science',
    category: 'science',
    type: 'Part-Time (Evening Shift)',
    location: 'Remote (100% Online)',
    qualification: 'BS / M.Sc Biology, Chemistry or Physics',
    experience: '1+ Years Experience',
    description: 'Teach General Science following PCTB 2026 SLO-based syllabus. Explain scientific concepts with visual animations and interactive class sessions.',
    skills: ['Science Demonstrations', 'SLO-Based Teaching', 'Digital Presentation', 'Urdu / English Fluency'],
    featured: true,
  },
  {
    id: 'english-lit',
    title: 'English Language & Grammar Specialist (Grade 1-8)',
    department: 'Languages',
    category: 'languages',
    type: 'Flexible Hours',
    location: 'Remote (100% Online)',
    qualification: 'MA / BS English (Linguistics / Literature)',
    experience: '1+ Years Online Teaching',
    description: 'Instruct students in English reading, creative writing, spoken articulation, and textbook grammar for primary and middle school grades.',
    skills: ['Grammar & Composition', 'Pronunciation', 'Storytelling', 'Student Motivation'],
    featured: false,
  },
  {
    id: 'urdu-islamiyat',
    title: 'Urdu & Islamiyat / Nazra Quran Teacher (KG-8)',
    department: 'Humanities & Islamic Studies',
    category: 'humanities',
    type: 'Morning / Evening Slots',
    location: 'Remote (100% Online)',
    qualification: 'MA Urdu / Islamic Studies / Shahadat-ul-Almiyah',
    experience: '1+ Years Experience',
    description: 'Conduct classes for Urdu literature, translation of Holy Quran (PCTB Tarjuma-tul-Quran curriculum), and moral education.',
    skills: ['Tajweed & Nazra', 'Urdu Literature', 'Character Building', 'Patient Interaction'],
    featured: false,
  },
  {
    id: 'computer-tech',
    title: 'Computer Science & Digital Literacy Instructor (Grade 4-8)',
    department: 'IT & Computing',
    category: 'tech',
    type: 'Part-Time',
    location: 'Remote (100% Online)',
    qualification: 'BSCS / BSIT / Software Engineering',
    experience: 'Fresh or 1+ Years',
    description: 'Introduce fundamental programming logic, Microsoft Office, Internet safety, and PCTB Computer Education syllabus to young learners.',
    skills: ['Coding Basics', 'Scratch / Python Intro', 'Screen Sharing', 'Interactive Labs'],
    featured: false,
  },
  {
    id: 'primary-general',
    title: 'Junior Section Class Teacher (KG to Grade 3)',
    department: 'Early Childhood Education',
    category: 'primary',
    type: 'Morning Shift',
    location: 'Remote (100% Online)',
    qualification: 'B.A / B.Sc / B.Ed / Montessori Certified',
    experience: '1+ Years with Young Children',
    description: 'Conduct friendly, colorful, and engaging foundational sessions for English, Math, General Knowledge, and Phonics for early learners.',
    skills: ['Montessori Methods', 'Phonics', 'Kid Engagement', 'Visual Props'],
    featured: true,
  },
];

const TEACHING_PERKS = [
  {
    icon: '🏠',
    title: '100% Work from Home',
    desc: 'No daily commute. Conduct live online lectures and evaluate homework right from your home workstation.',
  },
  {
    icon: '💸',
    title: 'Guaranteed Payouts',
    desc: 'Automated, timely monthly salary transfers directly to your Easypaisa or bank account with complete transparency.',
  },
  {
    icon: '⚡',
    title: 'Smart Digital Platform',
    desc: 'Automated grading for MCQs, integrated timetable, digital attendance, and official Punjab Board e-books at your fingertips.',
  },
  {
    icon: '📜',
    title: 'Experience & Certificate',
    desc: 'Receive official Taleem Ghar teaching certification, career recognition, and performance incentives.',
  },
];

export default function CareersPage() {
  const [, setLang] = useState(() => getCurrentLanguage());
  const formRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleLangChange = (e) => {
      setLang(e.detail?.lang || getCurrentLanguage());
    };
    window.addEventListener('language-changed', handleLangChange);
    return () => window.removeEventListener('language-changed', handleLangChange);
  }, []);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    address: '',
    gender: '',
    qualification: '',
    specialization: '',
    experience_years: '',
    easypaisa_number: '',
    account_title: '',
    account_holder_name: '',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBgDetected, setPhotoBgDetected] = useState(null);
  
  const [cnicFiles, setCnicFiles] = useState([]);
  const [cnicPreviews, setCnicPreviews] = useState([]);

  // CV / Resume state
  const [cvFile, setCvFile] = useState(null);

  // Degree & Certification Documents state (up to 5)
  const [degreeFiles, setDegreeFiles] = useState([]);
  const [degreePreviews, setDegreePreviews] = useState([]);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [jobPosts, setJobPosts] = useState(INITIAL_JOB_POSTS);
  const [, setJobsLoading] = useState(true);

  useEffect(() => {
    const fetchLiveJobs = async () => {
      try {
        const { data } = await api.get('/jobs');
        if (data && Array.isArray(data.jobs) && data.jobs.length > 0) {
          setJobPosts(data.jobs);
        }
      } catch (err) {
        console.warn('Could not load live jobs from server, using default list:', err);
      } finally {
        setJobsLoading(false);
      }
    };
    fetchLiveJobs();
  }, []);

  const filteredJobs = jobPosts.filter((job) => {
    const matchCategory = activeCategory === 'all' || job.category === activeCategory;
    const skillsList = Array.isArray(job.skills) ? job.skills : [];
    const matchSearch =
      (job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      skillsList.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const openFormForPosition = (job = null) => {
    setSelectedPosition(job);
    if (job) {
      setForm((f) => ({
        ...f,
        specialization: job.title,
      }));
    }
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'easypaisa_number') {
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 11);
      setForm((f) => ({ ...f, [name]: numbersOnly }));
      return;
    }
    if (['full_name', 'qualification', 'specialization', 'account_holder_name', 'city', 'address'].includes(name)) {
      const capitalized = value.replace(/(^|\s)([a-z\u00E0-\u00FC])/g, (m, p, c) => p + c.toUpperCase());
      setForm((f) => ({ ...f, [name]: capitalized }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Validate photo background (Blue, White, or Black)
  const validatePhotoBackground = (file) => {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith('image/')) {
        return resolve({ valid: false, error: 'Please select a valid image file (JPG/PNG).' });
      }

      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;

      img.onload = () => {
        URL.revokeObjectURL(url);
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const w = 150;
          const h = 150;
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);

          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;

          const samplePoints = [];
          for (let y = 0; y < 30; y += 4) {
            for (let x = 0; x < 30; x += 4) {
              samplePoints.push((y * w + x) * 4);
            }
          }
          for (let y = 0; y < 30; y += 4) {
            for (let x = 120; x < 150; x += 4) {
              samplePoints.push((y * w + x) * 4);
            }
          }
          for (let y = 0; y < 15; y += 3) {
            for (let x = 50; x < 100; x += 4) {
              samplePoints.push((y * w + x) * 4);
            }
          }

          let blueCount = 0;
          let whiteCount = 0;
          let blackCount = 0;
          const totalSamples = samplePoints.length;

          for (const idx of samplePoints) {
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            const isBlue = (b > r + 15 && b > g - 20) || (b > 110 && r < 140 && g < 180);
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const isWhite = (r > 185 && g > 185 && b > 185 && (max - min) < 45);
            const isBlack = (r < 65 && g < 65 && b < 65);

            if (isBlue) blueCount++;
            else if (isWhite) whiteCount++;
            else if (isBlack) blackCount++;
          }

          const validSamples = blueCount + whiteCount + blackCount;
          const ratio = validSamples / totalSamples;

          if (ratio < 0.45) {
            return resolve({
              valid: false,
              error: 'Passport photo must have a Blue, White, or Black background.',
            });
          }

          let detected = 'White/Light';
          if (blueCount > whiteCount && blueCount > blackCount) detected = 'Blue';
          else if (blackCount > whiteCount && blackCount > blueCount) detected = 'Dark';

          return resolve({ valid: true, detectedBg: detected });
        } catch (e) {
          return resolve({ valid: true, detectedBg: 'Standard' });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ valid: false, error: 'Could not process photo.' });
      };
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size must be less than 5MB.');
      return;
    }

    const val = await validatePhotoBackground(file);
    if (!val.valid) {
      alert(val.error);
      e.target.value = '';
      return;
    }

    setPhotoFile(file);
    setPhotoBgDetected(val.detectedBg);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleCnicChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 2 - cnicFiles.length;
    if (remainingSlots <= 0) {
      alert('You have already added 2 CNIC files (Front and Back). Remove one first to replace it.');
      e.target.value = '';
      return;
    }

    const newFiles = files.slice(0, remainingSlots);
    for (const f of newFiles) {
      if (f.size > 10 * 1024 * 1024) {
        alert(`File ${f.name} exceeds 10MB limit.`);
        e.target.value = '';
        return;
      }
    }

    const updatedFiles = [...cnicFiles, ...newFiles];
    setCnicFiles(updatedFiles);

    const newPreviews = newFiles.map((file, idx) => ({
      type: file.type.startsWith('image/') ? 'image' : 'pdf',
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      side: (cnicFiles.length + idx === 0) ? 'Front Side' : 'Back Side',
    }));

    setCnicPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeCnicFile = (index) => {
    const updatedFiles = cnicFiles.filter((_, i) => i !== index);
    const updatedPreviews = cnicPreviews.filter((_, i) => i !== index);
    setCnicFiles(updatedFiles);
    setCnicPreviews(updatedPreviews);
  };

  // CV / Resume upload handler
  const handleCvChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('CV file size must be less than 15MB.');
      e.target.value = '';
      return;
    }
    setCvFile(file);
  };

  const removeCvFile = () => {
    setCvFile(null);
  };

  // Degree & Certificates upload handler (up to 5)
  const handleDegreeChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 5 - degreeFiles.length;
    if (remainingSlots <= 0) {
      alert('You can upload a maximum of 5 degree/certificate documents. Remove one first to add another.');
      e.target.value = '';
      return;
    }

    const newFiles = files.slice(0, remainingSlots);
    for (const f of newFiles) {
      if (f.size > 15 * 1024 * 1024) {
        alert(`File ${f.name} exceeds 15MB limit.`);
        e.target.value = '';
        return;
      }
    }

    const updatedFiles = [...degreeFiles, ...newFiles];
    setDegreeFiles(updatedFiles);

    const newPreviews = newFiles.map((file) => ({
      type: file.type.startsWith('image/') ? 'image' : 'pdf',
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
    }));

    setDegreePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeDegreeFile = (index) => {
    const updatedFiles = degreeFiles.filter((_, i) => i !== index);
    const updatedPreviews = degreePreviews.filter((_, i) => i !== index);
    setDegreeFiles(updatedFiles);
    setDegreePreviews(updatedPreviews);
  };

  // Password requirements check (matching Signup page)
  const passwordRules = [
    { label: 'Password must be at least 6 characters', valid: form.password.length >= 6 },
    { label: 'Password must contain at least one uppercase letter (A-Z)', valid: /[A-Z]/.test(form.password) },
    { label: 'Password must contain at least one lowercase letter (a-z)', valid: /[a-z]/.test(form.password) },
    { label: 'Password must contain at least one number (0-9)', valid: /[0-9]/.test(form.password) },
  ];
  const firstUnmetRule = passwordRules.find((r) => !r.valid);
  const isPasswordValid = !firstUnmetRule;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!photoFile) {
      setErrorMsg('Please upload a passport size photo with a Blue, White, or Black background.');
      return;
    }

    if (cnicFiles.length === 0) {
      setErrorMsg('Please upload your CNIC photo or document (Front and Back).');
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg(firstUnmetRule?.label || 'Password must meet all requirements.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(form).forEach((k) => {
        if (form[k] !== undefined && form[k] !== null) {
          formData.append(k, form[k]);
        }
      });

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      cnicFiles.forEach((file) => {
        formData.append('cnic', file);
      });

      if (cvFile) {
        formData.append('cv', cvFile);
      }

      degreeFiles.forEach((file) => {
        formData.append('degrees', file);
      });

      const res = await api.post('/auth/register/teacher', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessData(res.data);
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-body, #FAF6EE)', minHeight: '100vh', color: 'var(--text-primary, #1C1917)' }}>
      <PublicNav />

      <div style={{ paddingBottom: 60 }}>
        {/* ═════════ Hero Section ═════════ */}
        <section
          className="gradient-bg-hero"
          style={{
            padding: 'clamp(90px, 11vh, 120px) 20px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 2 }}>
            {/* 1:1 Aspect Ratio Logo on Top */}
            <div style={{ marginBottom: 16 }}>
              <img
                src={logoImg}
                alt="Taleem Ghar"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  objectFit: 'cover',
                  background: '#ffffff',
                  padding: 2,
                  margin: '0 auto',
                  display: 'inline-block',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  border: '2px solid rgba(255,204,77,0.4)',
                }}
              />
            </div>

            {/* Pill Badge with Text only */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,204,77,0.18)',
                borderRadius: 999,
                padding: '6px 20px',
                marginBottom: 16,
                border: '1px solid rgba(255,204,77,0.4)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              }}
            >
              <span style={{ color: '#FFCC4D', fontSize: 13, fontWeight: 700, letterSpacing: '0.3px' }}>
                {t('Taleem Ghar Careers & Teaching Faculty')}
              </span>
            </div>

            <h1
              style={{
                color: '#ffffff',
                fontSize: 'clamp(28px, 4.5vw, 44px)',
                fontWeight: 900,
                lineHeight: 1.25,
                marginBottom: 16,
              }}
            >
              {t('Shape The Future of Online Education')}
            </h1>

            <p
              style={{
                color: '#E7DFD5',
                fontSize: 'clamp(15px, 2vw, 17px)',
                lineHeight: 1.6,
                maxWidth: 680,
                margin: '0 auto',
              }}
            >
              {t('Join Punjab\'s leading online learning platform. Teach KG to 8th class students with verified PCTB 2026 books, earn attractive compensation, and work comfortably from home.')}
            </p>
          </div>
        </section>

        {/* ═════════ Teaching Perks / Highlights ═════════ */}
        <section style={{ maxWidth: 1600, width: '100%', margin: '-24px auto 48px', padding: '0 clamp(16px, 3.5vw, 48px)', position: 'relative', zIndex: 3 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
            }}
          >
            {TEACHING_PERKS.map((perk, i) => (
              <div
                key={i}
                className="card card-hover"
                style={{
                  padding: 20,
                  borderRadius: 16,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{perk.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {t(perk.title)}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {t(perk.desc)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ═════════ Open Positions / Job Posts ═════════ */}
        <section id="open-positions" style={{ maxWidth: 1600, width: '100%', margin: '0 auto 48px', padding: '0 clamp(16px, 3.5vw, 48px)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#C05621', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                <HiOutlineSparkles /> {t('Current Vacancies')}
              </div>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 800, color: 'var(--text-primary, #1C1917)', margin: 0 }}>
                {t('Available Teaching Opportunities')}
              </h2>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
              <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A8A29E', fontSize: 18 }} />
              <input
                type="text"
                placeholder={t('Search subject, grade, skill...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 38, borderRadius: 12, fontSize: 13 }}
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 8,
              marginBottom: 24,
              scrollbarWidth: 'none',
            }}
          >
            {[
              { id: 'all', label: 'All Openings' },
              { id: 'stem', label: 'Mathematics & STEM' },
              { id: 'science', label: 'General Science' },
              { id: 'languages', label: 'English & Urdu' },
              { id: 'humanities', label: 'Islamiyat & Quran' },
              { id: 'tech', label: 'Computer & IT' },
              { id: 'primary', label: 'Junior Primary' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: activeCategory === tab.id ? 700 : 500,
                  background: activeCategory === tab.id ? '#FFCC4D' : 'var(--bg-surface)',
                  color: activeCategory === tab.id ? '#1C1917' : 'var(--text-primary)',
                  border: activeCategory === tab.id ? '1px solid #FFCC4D' : '1px solid var(--border-medium)',
                  boxShadow: activeCategory === tab.id ? '0 4px 14px rgba(255, 204, 77, 0.3)' : 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {t(tab.label)}
              </button>
            ))}
          </div>

          {/* Job Post Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="card card-hover"
                style={{
                  borderRadius: 18,
                  padding: 24,
                  background: 'var(--bg-surface)',
                  border: (selectedPosition?.id === job.id && isFormOpen) ? '2px solid #FFCC4D' : '1px solid var(--border-medium)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: (selectedPosition?.id === job.id && isFormOpen) ? '0 8px 28px rgba(255,204,77,0.2)' : '0 4px 16px rgba(0,0,0,0.03)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: 'rgba(37,99,235,0.08)',
                          color: '#2563eb',
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: 6,
                        }}
                      >
                        {job.department}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary, #78716C)' }}>• {job.type}</span>
                    </div>

                    {job.featured && (
                      <span
                        style={{
                          background: 'rgba(255,204,77,0.25)',
                          color: '#B7791F',
                          border: '1px solid rgba(255,204,77,0.5)',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 999,
                          whiteSpace: 'nowrap',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          flexShrink: 0,
                        }}
                      >
                        ⭐ {t('Priority')}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary, #1C1917)', lineHeight: 1.35, marginBottom: 10 }}>
                    {job.title}
                  </h3>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary, #78716C)', lineHeight: 1.6, marginBottom: 16 }}>
                    {job.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, fontSize: 12, color: 'var(--text-secondary, #78716C)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HiOutlineAcademicCap style={{ color: '#C05621' }} />
                      <span>{job.qualification}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HiOutlineLocationMarker style={{ color: '#16a34a' }} />
                      <span>{job.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HiOutlineClock style={{ color: '#4f46e5' }} />
                      <span>{job.experience}</span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                    {(Array.isArray(job.skills) ? job.skills : []).map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 11,
                          background: 'var(--bg-surface-2)',
                          color: 'var(--text-primary)',
                          padding: '3px 8px',
                          borderRadius: 6,
                          border: '1px solid var(--border-medium)',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openFormForPosition(job)}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '10px 16px',
                    fontSize: 14,
                    fontWeight: 700,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <HiOutlineCheckCircle style={{ fontSize: 17 }} />
                  {t('Apply for this Role')}
                </button>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border-medium)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{t('No specific position found')}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                {t('You can still submit a general faculty registration below and specify your expertise.')}
              </p>
              <button
                type="button"
                onClick={() => openFormForPosition(null)}
                className="btn btn-secondary"
              >
                {t('Open General Application Form')}
              </button>
            </div>
          )}
        </section>

        {/* ═════════ Application Modal Popup ═════════ */}
        {(isFormOpen || successData) &&
          createPortal(
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.72)',
                backdropFilter: 'blur(6px)',
                overflowY: 'auto',
              }}
            >
              <div
                className="card animate-scale-in"
                style={{
                  width: '100%',
                  maxWidth: 900,
                  maxHeight: '92vh',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 20,
                  background: 'var(--bg-surface, #ffffff)',
                  border: '1px solid var(--border-medium)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                  overflow: 'hidden',
                  margin: 'auto',
                }}
              >
                {successData ? (
                  <div
                    style={{
                      padding: '48px 32px',
                      textAlign: 'center',
                      background: 'linear-gradient(180deg, #f0fdf4 0%, var(--bg-card, #ffffff) 100%)',
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: '#dcfce7',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 36,
                        margin: '0 auto 20px',
                      }}
                    >
                      <HiOutlineCheckCircle />
                    </div>

                    <h2 style={{ color: '#166534', fontSize: 26, fontWeight: 800, marginBottom: 10 }}>
                      {t('Teacher Application Submitted Successfully!')}
                    </h2>
                    <p style={{ color: '#374151', fontSize: 15, lineHeight: 1.6, maxWidth: 620, margin: '0 auto 24px' }}>
                      {t('Thank you for applying to join the Taleem Ghar teaching faculty. Our administrative panel will review your credentials, passport photograph, CNIC, CV, and degree documentation. You will receive an email and SMS update regarding your interview and orientation.')}
                    </p>

                    <div style={{ display: 'inline-flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSuccessData(null);
                          setIsFormOpen(false);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '10px 24px' }}
                      >
                        {t('Close')}
                      </button>
                      <Link to="/login" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                        {t('Go to Portal Login')}
                      </Link>
                    </div>
                  </div>
                ) : isFormOpen ? (
                  <>
                    {/* Form Title & Top Banner */}
                    <div
                      style={{
                        padding: '18px 24px',
                        background: '#1C1917',
                        color: 'white',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <img src={logoImg} alt="Taleem Ghar" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', background: '#ffffff', padding: 1 }} />
                          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0 }}>
                            {t('Teacher Application & Registration Form')}
                          </h2>
                        </div>
                        <p style={{ fontSize: 12.5, color: '#A8A29E', margin: 0 }}>
                          {t('Fill out all required details accurately. Applications are reviewed by the school administration.')}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        {selectedPosition && (
                          <div
                            style={{
                              background: 'rgba(255,204,77,0.15)',
                              border: '1px solid rgba(255,204,77,0.4)',
                              padding: '4px 12px',
                              borderRadius: 10,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <span style={{ fontSize: 12, color: '#FFCC4D', fontWeight: 600 }}>
                              💼 {t('Position:')} {selectedPosition.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedPosition(null)}
                              style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: 13, opacity: 0.7 }}
                            >
                              ✕
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setIsFormOpen(false)}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: '#ffffff',
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                          }}
                          title="Close"
                        >
                          <HiOutlineX />
                        </button>
                      </div>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, padding: '24px clamp(16px, 3vw, 32px)' }}>
                      <form onSubmit={handleSubmit} ref={formRef}>
                {errorMsg && (
                  <div
                    className="animate-fade-in"
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#b91c1c',
                      padding: '12px 16px',
                      borderRadius: 12,
                      fontSize: 14,
                      marginBottom: 24,
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                {/* ── Section 1: Passport Size Photo ── */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#1C1917', color: '#FFCC4D', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>1</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{t('Passport Size Photo')} *</h3>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary, #78716C)', background: 'var(--bg-body, #FAF6EE)', padding: '2px 8px', borderRadius: 6 }}>
                      Blue / White / Black Background
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
                    <div
                      style={{
                        width: 110,
                        height: 130,
                        borderRadius: 12,
                        border: '2px dashed var(--border-medium)',
                        background: photoPreview ? 'transparent' : 'var(--bg-surface-2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ textAlign: 'center', color: '#A8A29E', padding: 8 }}>
                          <HiOutlineUser style={{ fontSize: 32, margin: '0 auto 4px' }} />
                          <span style={{ fontSize: 10, display: 'block' }}>Photo</span>
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 240 }}>
                      <input
                        type="file"
                        id="photoUpload"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: 'none' }}
                      />
                      <label
                        htmlFor="photoUpload"
                        className="btn btn-secondary"
                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, borderRadius: 10 }}
                      >
                        📸 {photoPreview ? t('Change Photo') : t('Upload Passport Photo')}
                      </label>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary, #78716C)', marginTop: 8, lineHeight: 1.4 }}>
                        {t('Photo must be in JPG/PNG format with a solid Blue, White, or Black background (Max 5MB).')}
                        {photoBgDetected && (
                          <span style={{ display: 'block', color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
                            ✓ Background Verified: {photoBgDetected}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── Section 2: Personal & Contact Information ── */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#1C1917', color: '#FFCC4D', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>2</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{t('Personal & Contact Information')}</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                    <div>
                      <label className="form-label">{t('Full Name')} *</label>
                      <input
                        type="text"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Muhammad Ali"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">{t('Email Address')} *</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="teacher@example.com"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">{t('Password')} *</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          required
                          placeholder="Min. 6 characters"
                          className="form-input"
                          style={{
                            paddingRight: 40,
                            borderColor: form.password && !isPasswordValid ? '#ef4444' : undefined,
                            boxShadow: form.password && !isPasswordValid ? '0 0 0 3px rgba(239, 68, 68, 0.12)' : undefined,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#A8A29E',
                            cursor: 'pointer',
                          }}
                        >
                          {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                        </button>
                      </div>

                      {form.password.length > 0 && !isPasswordValid && (
                        <p style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: '#ef4444' }}>
                          <HiOutlineExclamationCircle size={14} style={{ flexShrink: 0 }} />
                          <span>{firstUnmetRule?.label}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="form-label">{t('Phone Number')} (11 digits) *</label>
                      <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        maxLength={11}
                        placeholder="03001234567"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">{t('Gender')} *</label>
                      <select name="gender" value={form.gender} onChange={handleChange} required className="form-select">
                        <option value="">{t('Select Gender')}</option>
                        <option value="male">{t('Male')}</option>
                        <option value="female">{t('Female')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">{t('City')} *</label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Lahore, Rawalpindi"
                        className="form-input"
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">{t('Full Residential Address')} *</label>
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                        placeholder="e.g. House # 12, Street 4, Sector G-9, Islamabad"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Section 3: Educational & Professional Experience ── */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#1C1917', color: '#FFCC4D', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>3</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{t('Education & Subject Specialization')}</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                    <div>
                      <label className="form-label">{t('Highest Qualification')} *</label>
                      <input
                        type="text"
                        name="qualification"
                        value={form.qualification}
                        onChange={handleChange}
                        required
                        placeholder="e.g. M.Sc Mathematics, BS English, B.Ed"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">{t('Subject Specialization')} *</label>
                      <input
                        type="text"
                        name="specialization"
                        value={form.specialization}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Mathematics, Science, Urdu, English, Islamiyat"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">{t('Years of Teaching Experience')} *</label>
                      <input
                        type="number"
                        name="experience_years"
                        value={form.experience_years}
                        onChange={handleChange}
                        required
                        min="0"
                        max="40"
                        placeholder="e.g. 3"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Section 4: CNIC Documentation ── */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#1C1917', color: '#FFCC4D', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>4</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{t('CNIC Front & Back Document')} *</h3>
                  </div>

                  <div style={{ border: '2px dashed var(--border-medium)', borderRadius: 16, padding: 20, background: 'var(--bg-surface-2)', textAlign: 'center' }}>
                    <input
                      type="file"
                      id="cnicUpload"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={handleCnicChange}
                      style={{ display: 'none' }}
                      disabled={cnicFiles.length >= 2}
                    />

                    {cnicPreviews.length < 2 ? (
                      <label
                        htmlFor="cnicUpload"
                        className="btn btn-secondary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 20px',
                          borderRadius: 10,
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: 13,
                          color: 'var(--text-primary)',
                        }}
                      >
                        🪪 {t('Upload CNIC Front / Back')} ({cnicPreviews.length}/2)
                      </label>
                    ) : (
                      <div style={{ color: '#16a34a', fontWeight: 600, fontSize: 13 }}>
                        ✓ {t('Both CNIC sides added (Front and Back)')}
                      </div>
                    )}

                    <p style={{ fontSize: 12, color: 'var(--text-secondary, #78716C)', marginTop: 8, marginBottom: 12 }}>
                      {t('Upload 2 images/PDFs: Slot 1 for CNIC Front, Slot 2 for CNIC Back (Max 10MB each).')}
                    </p>

                    {/* CNIC Preview Slots */}
                    {cnicPreviews.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
                        {cnicPreviews.map((doc, idx) => (
                          <div
                            key={idx}
                            style={{
                              border: '1px solid var(--border-medium)',
                              borderRadius: 10,
                              background: 'var(--bg-surface)',
                              padding: 8,
                              width: 140,
                              textAlign: 'center',
                              position: 'relative',
                            }}
                          >
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#C05621', display: 'block', marginBottom: 4 }}>
                              {idx === 0 ? t('CNIC Front') : t('CNIC Back')}
                            </span>
                            {doc.type === 'image' && doc.url ? (
                              <img src={doc.url} alt="CNIC" style={{ width: '100%', height: 75, objectFit: 'cover', borderRadius: 6 }} />
                            ) : (
                              <div style={{ height: 75, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface-2)', borderRadius: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                                📄 PDF Document
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeCnicFile(idx)}
                              style={{
                                marginTop: 6,
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                                padding: '3px 8px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                                width: '100%',
                              }}
                            >
                              {t('Remove')}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Section 5: CV / Resume & Degree Documents ── */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#1C1917', color: '#FFCC4D', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>5</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{t('Upload CV & Degree Documents')}</h3>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary, #78716C)', background: 'var(--bg-surface-2)', padding: '2px 8px', borderRadius: 6 }}>
                      {t('Recommended')}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    {/* CV / Resume Upload Box */}
                    <div
                      style={{
                        border: '2px dashed var(--border-medium)',
                        borderRadius: 16,
                        padding: 20,
                        background: 'var(--bg-surface-2)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <HiOutlineDocumentText style={{ color: '#2563eb', fontSize: 20 }} />
                          <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{t('CV / Resume Document')}</h4>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary, #78716C)', marginBottom: 14, lineHeight: 1.4 }}>
                          {t('Upload your latest Curriculum Vitae (PDF, DOCX, or Image, Max 15MB).')}
                        </p>
                      </div>

                      {cvFile ? (
                        <div
                          style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: 10,
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                            <span style={{ fontSize: 18 }}>📄</span>
                            <div style={{ overflow: 'hidden' }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {cvFile.name}
                              </span>
                              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                {(cvFile.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeCvFile}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              padding: '4px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            {t('Remove')}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            id="cvUpload"
                            accept=".pdf,.doc,.docx,image/*"
                            onChange={handleCvChange}
                            style={{ display: 'none' }}
                          />
                          <label
                            htmlFor="cvUpload"
                            className="btn btn-secondary"
                            style={{
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8,
                              padding: '10px 18px',
                              fontSize: 13,
                              fontWeight: 600,
                              borderRadius: 10,
                              width: '100%',
                            }}
                          >
                            <HiOutlinePaperClip style={{ fontSize: 16 }} />
                            {t('Upload CV / Resume')}
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Degree & Certificates Upload Box */}
                    <div
                      style={{
                        border: '2px dashed var(--border-medium)',
                        borderRadius: 16,
                        padding: 20,
                        background: 'var(--bg-surface-2)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <HiOutlineAcademicCap style={{ color: '#16a34a', fontSize: 20 }} />
                          <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
                            {t('Degrees & Academic Transcripts')} ({degreePreviews.length}/5)
                          </h4>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary, #78716C)', marginBottom: 14, lineHeight: 1.4 }}>
                          {t('Upload your academic degrees, transcripts or teaching certificates (PDF/Images, Max 15MB each).')}
                        </p>
                      </div>

                      <div>
                        <input
                          type="file"
                          id="degreesUpload"
                          multiple
                          accept=".pdf,image/*"
                          onChange={handleDegreeChange}
                          style={{ display: 'none' }}
                          disabled={degreeFiles.length >= 5}
                        />

                        {degreeFiles.length < 5 && (
                          <label
                            htmlFor="degreesUpload"
                            className="btn btn-secondary"
                            style={{
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8,
                              padding: '10px 18px',
                              fontSize: 13,
                              fontWeight: 600,
                              borderRadius: 10,
                              width: '100%',
                              marginBottom: degreePreviews.length > 0 ? 12 : 0,
                            }}
                          >
                            🎓 {t('Add Degree / Certificate')}
                          </label>
                        )}

                        {/* List of uploaded degrees */}
                        {degreePreviews.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {degreePreviews.map((doc, idx) => (
                              <div
                                key={idx}
                                style={{
                                  background: 'var(--bg-surface)',
                                  border: '1px solid var(--border-medium)',
                                  borderRadius: 8,
                                  padding: '6px 12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: 8,
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                                  <span style={{ fontSize: 14 }}>{doc.type === 'image' ? '🖼️' : '📄'}</span>
                                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    {doc.name} ({doc.size} MB)
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeDegreeFile(idx)}
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#ef4444',
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Section 6: Payment & Easypaisa Account Details ── */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#1C1917', color: '#FFCC4D', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>6</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{t('Remuneration & Easypaisa Account Details')}</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                    <div>
                      <label className="form-label">{t('Easypaisa Account Number')} (11 digits) *</label>
                      <input
                        type="text"
                        name="easypaisa_number"
                        value={form.easypaisa_number}
                        onChange={handleChange}
                        required
                        maxLength={11}
                        placeholder="03XXXXXXXXX"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">{t('Account Title / Bank Name')} *</label>
                      <input
                        type="text"
                        name="account_title"
                        value={form.account_title}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Easypaisa / JazzCash / HBL"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">{t('Account Holder Full Name')} *</label>
                      <input
                        type="text"
                        name="account_holder_name"
                        value={form.account_holder_name}
                        onChange={handleChange}
                        required
                        placeholder="As registered on bank / CNIC"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div style={{ borderTop: '1px solid var(--border-color, #E7DFD5)', paddingTop: 24, textAlign: 'center' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{
                      padding: '14px 44px',
                      fontSize: 16,
                      fontWeight: 800,
                      borderRadius: 12,
                      boxShadow: '0 6px 20px rgba(255,204,77,0.3)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      minWidth: 260,
                    }}
                  >
                    {loading ? t('Submitting Application...') : t('Submit Application')}
                  </button>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary, #78716C)', marginTop: 12 }}>
                    🔒 {t('Your credentials and documents are stored securely and reviewed exclusively by Taleem Ghar Administration.')}
                  </p>
                </div>
              </form>
            </div>
          </>
        ) : null}
      </div>
    </div>,
    document.body
  )}
      </div>

      <Footer />
    </div>
  );
}
