import { useState, useEffect } from 'react';
import api, { FILE_BASE } from '../../services/api';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineEye, HiOutlineEyeOff, HiOutlinePencil, HiOutlineUser, HiOutlineX } from 'react-icons/hi';

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [previewTeacher, setPreviewTeacher] = useState(null);
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
  const [showPassword, setShowPassword] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [genderFilter, setGenderFilter] = useState('all');

  const fetchTeachers = () => {
    api.get('/admin/teachers').then(res => setTeachers(res.data.teachers || [])).catch(console.error);
  };
  useEffect(() => { fetchTeachers(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'easypaisa_number') {
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 11);
      setForm(f => ({ ...f, [name]: numbersOnly }));
      return;
    }
    if (['full_name', 'qualification', 'specialization', 'account_holder_name', 'city', 'address'].includes(name)) {
      const capitalized = value.replace(/(^|\s)([a-z\u00E0-\u00FC])/g, (m, p, c) => p + c.toUpperCase());
      setForm(f => ({ ...f, [name]: capitalized }));
      return;
    }
    setForm(f => ({ ...f, [name]: value }));
  };

  // Validate photo background: Blue, White, or Black
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

          // Sample corner and top border areas (background behind head/shoulders)
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

            // 1. Blue background
            const isBlue = (b > r + 15 && b > g - 20) || (b > 110 && r < 140 && g < 180);
            // 2. White / Light background
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const isWhite = (r > 185 && g > 185 && b > 185 && (max - min) < 45);
            // 3. Black / Dark background
            const isBlack = (r < 65 && g < 65 && b < 65);

            if (isBlue) blueCount++;
            else if (isWhite) whiteCount++;
            else if (isBlack) blackCount++;
          }

          const validSamples = blueCount + whiteCount + blackCount;
          const validPercentage = (validSamples / totalSamples) * 100;

          if (validPercentage >= 40) {
            let detected = 'Blue';
            if (whiteCount > blueCount && whiteCount > blackCount) detected = 'White';
            else if (blackCount > blueCount && blackCount > whiteCount) detected = 'Black';
            else if (blueCount >= whiteCount && blueCount >= blackCount) detected = 'Blue';
            return resolve({ valid: true, detectedBg: detected });
          }

          return resolve({
            valid: false,
            error: '❌ Invalid Photo Background: Only Blue, White, or Black plain background is accepted for passport photos.'
          });
        } catch {
          return resolve({ valid: true });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ valid: false, error: 'Failed to load photo image.' });
      };
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const check = await validatePhotoBackground(file);
      if (!check.valid) {
        alert(check.error || 'Invalid background. Only Blue, White, or Black background is accepted.');
        e.target.value = '';
        return;
      }
      setPhotoFile(file);
      setPhotoBgDetected(check.detectedBg || 'Accepted');
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCnicChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const validNewFiles = selectedFiles.filter(f => f.type.startsWith('image/') || f.type === 'application/pdf');
    if (validNewFiles.length === 0) {
      alert('Please upload image (JPG/PNG) or PDF copy of CNIC.');
      e.target.value = '';
      return;
    }

    let updatedFiles = [];
    if (selectedFiles.length >= 2) {
      updatedFiles = validNewFiles.slice(0, 2);
    } else {
      if (cnicFiles.length >= 2) {
        updatedFiles = [validNewFiles[0]];
      } else {
        updatedFiles = [...cnicFiles, validNewFiles[0]];
      }
    }

    if (updatedFiles.length > 2) {
      alert('Maximum 2 CNIC pictures (Front & Back) or 1 PDF document can be uploaded.');
      updatedFiles = updatedFiles.slice(0, 2);
    }

    setCnicFiles(updatedFiles);

    const newPreviews = [];
    updatedFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          newPreviews.push({ type: 'image', url: reader.result, name: file.name });
          if (newPreviews.length === updatedFiles.length) {
            setCnicPreviews([...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push({ type: 'pdf', url: null, name: file.name });
        if (newPreviews.length === updatedFiles.length) {
          setCnicPreviews([...newPreviews]);
        }
      }
    });

    e.target.value = '';
  };

  const removeCnicFile = (index) => {
    const newFiles = cnicFiles.filter((_, i) => i !== index);
    const newPreviews = cnicPreviews.filter((_, i) => i !== index);
    setCnicFiles(newFiles);
    setCnicPreviews(newPreviews);
  };

  const hasMinLength = form.password.length >= 8;
  const hasUpper = /[A-Z]/.test(form.password);
  const hasLower = /[a-z]/.test(form.password);
  const hasNumber = /\d/.test(form.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(form.password);
  const isPasswordValid = hasUpper && hasLower && hasNumber && hasSpecial && hasMinLength;

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({
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
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoBgDetected(null);
    setCnicFiles([]);
    setCnicPreviews([]);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!editingId && !isPasswordValid) {
      alert('Password does not meet all requirements.');
      return;
    }
    if (editingId && form.password && !isPasswordValid) {
      alert('Password does not meet all requirements.');
      return;
    }
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'password' && editingId && !form[key]) {
          return; // Keep existing password if left blank
        }
        if (form[key] !== null && form[key] !== undefined) {
          formData.append(key, form[key]);
        }
      });
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      if (cnicFiles.length > 0) {
        cnicFiles.forEach((file) => {
          formData.append('cnic', file);
        });
      }

      const headers = { 'Content-Type': 'multipart/form-data' };

      if (editingId) {
        await api.put(`/admin/teachers/${editingId}`, formData, { headers });
      } else {
        await api.post('/admin/teachers', formData, { headers });
      }
      resetForm();
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const handleEdit = (t) => {
    const prof = t.teacherProfile || t.profile || {};
    setEditingId(t.id);
    setForm({
      full_name: t.full_name || '',
      email: t.email || '',
      password: '',
      phone: t.phone || '',
      city: prof.city || '',
      address: prof.address || '',
      gender: t.gender || prof.gender || '',
      qualification: prof.qualification || '',
      specialization: prof.specialization || '',
      experience_years: (prof.experience_years !== undefined && prof.experience_years !== null) ? prof.experience_years : '',
      easypaisa_number: prof.easypaisa_number || '',
      account_title: prof.account_title || '',
      account_holder_name: prof.account_holder_name || '',
    });
    setPhotoFile(null);
    setPhotoBgDetected(null);
    setCnicFiles([]);
    const existingPhoto = prof.photo || t.avatar;
    if (existingPhoto) {
      setPhotoPreview(`${FILE_BASE}/uploads/${existingPhoto}`);
      setPhotoBgDetected('Current Photo');
    } else {
      setPhotoPreview(null);
    }
    const existingCnic = prof.cnic_file;
    if (existingCnic) {
      const files = existingCnic.split(',').map(s => s.trim()).filter(Boolean);
      setCnicPreviews(files.map((fname, idx) => ({
        type: fname.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
        url: `${FILE_BASE}/uploads/${fname}`,
        name: files.length > 1 ? (idx === 0 ? 'CNIC Front Side' : 'CNIC Back Side') : 'CNIC Document'
      })));
    } else {
      setCnicPreviews([]);
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this teacher?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const maleCount = teachers.filter(t => t.gender === 'male').length;
  const femaleCount = teachers.filter(t => t.gender === 'female').length;

  const filteredTeachers = teachers.filter(t => {
    if (genderFilter === 'all') return true;
    return t.gender === genderFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Teachers</h1>
          <p className="text-dark-400 text-sm mt-1">{teachers.length} teachers registered</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm flex items-center gap-2">
            <HiOutlinePlus className="w-4 h-4" /> Add Teacher
          </button>
        )}
      </div>

      {/* Gender Filter Tabs */}
      {!showForm && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          {[
            { key: 'all', label: 'All Teachers', count: teachers.length },
            { key: 'male', label: 'Male Teachers', count: maleCount },
            { key: 'female', label: 'Female Teachers', count: femaleCount },
          ].map(tab => {
            const isActive = genderFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setGenderFilter(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: isActive ? '2px solid var(--color-primary-600, #1e3a5f)' : '1px solid var(--border-light, #e2e8f0)',
                  background: isActive ? 'var(--color-primary-50, #eff6ff)' : 'var(--bg-card, #ffffff)',
                  color: isActive ? 'var(--color-primary-700, #1d4ed8)' : 'var(--text-secondary, #64748b)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    style={{
                      background: isActive ? 'var(--color-primary-600, #1e3a5f)' : 'var(--bg-surface-2, #e2e8f0)',
                      color: isActive ? '#ffffff' : 'var(--text-secondary, #64748b)',
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 800
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="glass-card p-6 animate-slide-up" style={{ marginBottom: 14 }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit Teacher' : 'Create New Teacher'}</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Passport Size Photo Upload */}
            <div className="md:col-span-2" style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-surface-2, #f8fafc)', padding: '12px 16px', borderRadius: 12, border: '1px dashed var(--border-light, #cbd5e1)' }}>
              <div style={{ position: 'relative', width: 68, height: 68, borderRadius: 10, overflow: 'hidden', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #3b82f6', flexShrink: 0 }}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Teacher Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <HiOutlineUser className="w-7 h-7 text-gray-400" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    📷 Passport Size Photo *
                  </label>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: 999, border: '1px solid #bae6fd' }}>
                    {photoBgDetected ? `✅ ${photoBgDetected} Background Verified` : 'Blue, White, or Black Background'}
                  </span>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => { setPhotoFile(null); setPhotoPreview(null); setPhotoBgDetected(null); }}
                      style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2, marginBottom: 6 }}>
                  Upload clear passport-size photo (Blue, White, or Black background only).
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="file"
                    id="teacher-photo-input"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="teacher-photo-input"
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 14px' }}
                  >
                    <span>📁 {photoFile ? 'Change Photo' : 'Upload Passport Photo'}</span>
                  </label>
                  {photoFile && (
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {photoFile.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Upload CNIC Section */}
            <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg-surface-2, #f8fafc)', padding: '14px 16px', borderRadius: 12, border: '1px dashed var(--border-light, #cbd5e1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    🪪 Upload CNIC (Front & Back) *
                  </label>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cnicPreviews.length === 2 ? '#059669' : (cnicPreviews.length === 1 ? '#d97706' : '#0369a1'), background: cnicPreviews.length === 2 ? '#ecfdf5' : (cnicPreviews.length === 1 ? '#fffbeb' : '#e0f2fe'), padding: '2px 8px', borderRadius: 999, border: `1px solid ${cnicPreviews.length === 2 ? '#a7f3d0' : (cnicPreviews.length === 1 ? '#fde68a' : '#bae6fd')}` }}>
                    {cnicPreviews.length === 2 ? '✅ Both Sides Uploaded (2/2)' : (cnicPreviews.length === 1 ? '🟡 1 Side Uploaded (Add Back Side)' : 'Max 2 Photos (Front + Back) or 1 PDF')}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0 }}>
                Select 2 photos together (Front & Back) or select them one by one.
              </p>

              {/* CNIC Previews (Front and Back cards) */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
                {/* Slot 1: Front */}
                <div style={{ flex: 1, minWidth: 160, background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 10, display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                    {cnicPreviews[0] ? (
                      cnicPreviews[0].type === 'image' ? (
                        <img src={cnicPreviews[0].url} alt="CNIC Front" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 20 }}>📄</span>
                      )
                    ) : (
                      <span style={{ fontSize: 20 }}>🪪</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {cnicPreviews[0] ? '🪪 Side 1 (Front)' : '🪪 Front Side'}
                    </p>
                    <p style={{ fontSize: 11, color: cnicPreviews[0] ? '#059669' : 'var(--text-tertiary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cnicPreviews[0] ? (cnicPreviews[0].name || 'Front side attached') : 'Not uploaded yet'}
                    </p>
                  </div>
                  {cnicPreviews[0] && (
                    <button
                      type="button"
                      onClick={() => removeCnicFile(0)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '50%', width: 22, height: 22, fontSize: 11, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Remove"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Slot 2: Back */}
                <div style={{ flex: 1, minWidth: 160, background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 10, display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                    {cnicPreviews[1] ? (
                      cnicPreviews[1].type === 'image' ? (
                        <img src={cnicPreviews[1].url} alt="CNIC Back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 20 }}>📄</span>
                      )
                    ) : (
                      <span style={{ fontSize: 20 }}>🪪</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {cnicPreviews[1] ? '🪪 Side 2 (Back)' : '🪪 Back Side'}
                    </p>
                    <p style={{ fontSize: 11, color: cnicPreviews[1] ? '#059669' : 'var(--text-tertiary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cnicPreviews[1] ? (cnicPreviews[1].name || 'Back side attached') : (cnicPreviews[0] ? 'Upload 2nd photo' : 'Not uploaded yet')}
                    </p>
                  </div>
                  {cnicPreviews[1] && (
                    <button
                      type="button"
                      onClick={() => removeCnicFile(1)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '50%', width: 22, height: 22, fontSize: 11, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Remove"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* File input button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <input
                  type="file"
                  id="teacher-cnic-input"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleCnicChange}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="teacher-cnic-input"
                  className="btn btn-secondary btn-sm"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 14px' }}
                >
                  <span>📁 {cnicPreviews.length === 0 ? 'Select CNIC Photos (Front & Back)' : (cnicPreviews.length === 1 ? '➕ Add CNIC Back Side Photo' : '🔄 Replace CNIC Photos')}</span>
                </label>
                {cnicPreviews.length > 0 && (
                  <span style={{ fontSize: 11.5, color: '#059669', fontWeight: 700 }}>
                    {cnicPreviews.length} of 2 file(s) attached
                  </span>
                )}
              </div>
            </div>

            <input className="form-input" name="full_name" placeholder="Full Name *" value={form.full_name} onChange={handleChange} required />
            <input className="form-input" name="email" type="email" placeholder="Email *" value={form.email} onChange={handleChange} required />
            
            <div>
              <div style={{ position: 'relative' }}>
                <input 
                  className="form-input" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder={editingId ? "Password (leave blank to keep current)" : "Password *"} 
                  value={form.password} 
                  onChange={handleChange} 
                  required={!editingId}
                  style={{ width: '100%', paddingRight: '40px' }} 
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
                <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
                  {!hasUpper ? 'Password must contain at least one uppercase letter.' :
                   !hasLower ? 'Password must contain at least one lowercase letter.' :
                   !hasNumber ? 'Password must contain at least one number.' :
                   !hasSpecial ? 'Password must contain at least one special character.' :
                   'Password must be at least 8 characters.'}
                </div>
              )}
            </div>

            <input className="form-input" name="phone" placeholder="Phone (11 digits) *" maxLength={11} inputMode="numeric" value={form.phone} onChange={handleChange} />
            <input className="form-input" name="city" placeholder="City *" value={form.city} onChange={handleChange} required />
            <input className="form-input md:col-span-2" name="address" placeholder="Address (as per CNIC) *" value={form.address} onChange={handleChange} required />
            <select
              className="form-input"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              style={{
                color: form.gender ? 'var(--text-primary)' : 'var(--text-tertiary, #94a3b8)'
              }}
            >
              <option value="" style={{ color: 'var(--text-tertiary, #94a3b8)' }}>Gender *</option>
              <option value="male" style={{ color: 'var(--text-primary)' }}>Male</option>
              <option value="female" style={{ color: 'var(--text-primary)' }}>Female</option>
            </select>
            <input className="form-input" name="qualification" placeholder="Qualification *" value={form.qualification} onChange={handleChange} />
            <input className="form-input" name="specialization" placeholder="Specialization *" value={form.specialization} onChange={handleChange} />
            <input className="form-input" name="experience_years" type="number" min="0" placeholder="Experience (Years) *" value={form.experience_years} onChange={handleChange} />

            {/* Salary Receive & Easypaisa Section */}
            <div className="md:col-span-2" style={{ borderTop: '1px solid var(--border-light, #e2e8f0)', paddingTop: 14, marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16 }}>💳</span>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Salary & Payment Details (Easypaisa)
                </h4>
                <span style={{ fontSize: 11, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                  For Salary Receive
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Easypaisa Account Number (11 digits) *
                  </label>
                  <input
                    className="form-input"
                    name="easypaisa_number"
                    placeholder="03XXXXXXXXX"
                    maxLength={11}
                    inputMode="numeric"
                    value={form.easypaisa_number}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Account Title *
                  </label>
                  <input
                    className="form-input"
                    name="account_title"
                    placeholder="e.g. Easypaisa Account"
                    value={form.account_title}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Account Holder Name *
                  </label>
                  <input
                    className="form-input"
                    name="account_holder_name"
                    placeholder="Full Name as on Account"
                    value={form.account_holder_name}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3" style={{ marginTop: 10, marginBottom: 2 }}>
              <button type="submit" className="btn btn-primary btn-sm">{editingId ? 'Update Teacher' : 'Create Teacher'}</button>
              <button type="button" onClick={resetForm} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="glass-card table-responsive">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Qualification</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Easypaisa / Salary Account</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map(t => {
                const photo = t.avatar || t.teacherProfile?.photo;
                return (
                  <tr key={t.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {photo ? (
                          <img
                            src={`${FILE_BASE}/uploads/${photo}`}
                            alt={t.full_name}
                            className="w-10 h-10 rounded-lg object-cover"
                            style={{ border: '1px solid var(--border-light)' }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
                            {t.full_name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <p className="text-gray-900 text-sm font-medium">{t.full_name}</p>
                            {t.gender && (
                              <span style={{ fontSize: 10.5, padding: '1px 6px', borderRadius: 999, fontWeight: 700, background: t.gender === 'female' ? '#fdf2f8' : '#eff6ff', color: t.gender === 'female' ? '#db2777' : '#2563eb', border: `1px solid ${t.gender === 'female' ? '#fbcfe8' : '#bfdbfe'}` }}>
                                {t.gender === 'female' ? 'Female' : 'Male'}
                              </span>
                            )}
                          </div>
                          <p className="text-dark-500 text-xs">{t.email}</p>
                          {t.phone && <p className="text-dark-400 text-xs mt-0.5">📞 {t.phone}</p>}
                          {(t.teacherProfile?.city || t.teacherProfile?.address) && (
                            <p className="text-dark-400 text-xs mt-0.5">
                              📍 {[t.teacherProfile.city, t.teacherProfile.address].filter(Boolean).join(', ')}
                            </p>
                          )}
                          {t.teacherProfile?.cnic_file && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 3 }}>
                              {t.teacherProfile.cnic_file.split(',').map((f, i, arr) => (
                                <a
                                  key={i}
                                  href={`${FILE_BASE}/uploads/${f.trim()}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#059669', textDecoration: 'none' }}
                                >
                                  🪪 {arr.length > 1 ? (i === 0 ? 'CNIC Front' : 'CNIC Back') : 'View CNIC'}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-dark-300 text-sm">{t.teacherProfile?.qualification || '-'}</td>
                    <td className="text-dark-300 text-sm">{t.teacherProfile?.specialization || '-'}</td>
                    <td className="text-dark-300 text-sm">{t.teacherProfile?.experience_years ? `${t.teacherProfile.experience_years} years` : '-'}</td>
                    <td className="text-dark-300 text-sm">
                      {t.teacherProfile?.easypaisa_number ? (
                        <div>
                          <div style={{ fontWeight: 700, color: '#059669', fontSize: 13 }}>
                            📱 {t.teacherProfile.easypaisa_number}
                          </div>
                          {t.teacherProfile?.account_holder_name && (
                            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                              👤 {t.teacherProfile.account_holder_name}
                            </div>
                          )}
                          {t.teacherProfile?.account_title && (
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                              🏷️ {t.teacherProfile.account_title}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-dark-500 text-xs">Not Set</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setPreviewTeacher(t)} className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors" title="Preview Teacher Profile">
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(t)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors" title="Edit Teacher">
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors" title="Delete Teacher">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTeachers.length === 0 && (
                <tr><td colSpan="6" className="text-center text-dark-500 py-8">No teachers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Teacher Profile Preview Modal */}
      {previewTeacher && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setPreviewTeacher(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-scale-up"
            style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>👨‍🏫</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Teacher Profile Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTeacher(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: '#64748b', display: 'flex', alignItems: 'center' }}
                title="Close"
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Profile Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#f8fafc', padding: '16px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                {previewTeacher.avatar || previewTeacher.teacherProfile?.photo ? (
                  <img
                    src={`${FILE_BASE}/uploads/${previewTeacher.avatar || previewTeacher.teacherProfile?.photo}`}
                    alt={previewTeacher.full_name}
                    style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover', border: '2px solid #3b82f6', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: 14, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: 24, fontWeight: 800, flexShrink: 0 }}>
                    {previewTeacher.full_name?.charAt(0)}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {previewTeacher.full_name}
                    </h2>
                    {previewTeacher.gender && (
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 700, background: previewTeacher.gender === 'female' ? '#fdf2f8' : '#eff6ff', color: previewTeacher.gender === 'female' ? '#db2777' : '#2563eb', border: `1px solid ${previewTeacher.gender === 'female' ? '#fbcfe8' : '#bfdbfe'}` }}>
                        {previewTeacher.gender === 'female' ? 'Female Teacher' : 'Male Teacher'}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, margin: 0 }}>✉️ {previewTeacher.email}</p>
                  {previewTeacher.phone && (
                    <p style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, marginTop: 2 }}>📞 {previewTeacher.phone}</p>
                  )}
                </div>
              </div>

              {/* Personal & Location Info */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px', background: '#ffffff' }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1e3a5f', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📍 Location & CNIC Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ fontSize: 12.5 }}>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>City:</span>
                    <p style={{ color: '#0f172a', fontWeight: 700, marginTop: 2 }}>{previewTeacher.teacherProfile?.city || '-'}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Address (as per CNIC):</span>
                    <p style={{ color: '#0f172a', fontWeight: 700, marginTop: 2 }}>{previewTeacher.teacherProfile?.address || '-'}</p>
                  </div>
                  <div className="md:col-span-2" style={{ marginTop: 4 }}>
                    <span style={{ color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>CNIC Document:</span>
                    {previewTeacher.teacherProfile?.cnic_file ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {previewTeacher.teacherProfile.cnic_file.split(',').map((fname, idx, arr) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0fdf4', padding: '10px 14px', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                            <span style={{ fontSize: 22 }}>🪪</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 12, fontWeight: 700, color: '#166534', margin: 0 }}>
                                {arr.length > 1 ? (idx === 0 ? '🪪 CNIC Front Side' : '🪪 CNIC Back Side') : 'CNIC Document'}
                              </p>
                              <p style={{ fontSize: 11, color: '#15803d', margin: 0 }}>
                                {fname.trim()}
                              </p>
                            </div>
                            <a
                              href={`${FILE_BASE}/uploads/${fname.trim()}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '6px 14px', borderRadius: 8, background: '#16a34a',
                                color: '#ffffff', fontSize: 12, fontWeight: 700, textDecoration: 'none'
                              }}
                            >
                              <HiOutlineEye size={16} /> View {arr.length > 1 ? (idx === 0 ? 'Front' : 'Back') : 'CNIC'}
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: 12, fontStyle: 'italic' }}>No CNIC document uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic & Professional Info */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px', background: '#ffffff' }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1e3a5f', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🎓 Qualification & Experience
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ fontSize: 12.5 }}>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Qualification:</span>
                    <p style={{ color: '#0f172a', fontWeight: 700, marginTop: 2 }}>{previewTeacher.teacherProfile?.qualification || '-'}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Specialization:</span>
                    <p style={{ color: '#0f172a', fontWeight: 700, marginTop: 2 }}>{previewTeacher.teacherProfile?.specialization || '-'}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Experience:</span>
                    <p style={{ color: '#0f172a', fontWeight: 700, marginTop: 2 }}>
                      {previewTeacher.teacherProfile?.experience_years ? `${previewTeacher.teacherProfile.experience_years} Years` : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Salary Receive (Easypaisa) */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px', background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 16 }}>💳</span>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1e3a5f', margin: 0 }}>
                    Salary Account Details (Easypaisa)
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ fontSize: 12.5 }}>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Easypaisa Number:</span>
                    <p style={{ color: '#059669', fontWeight: 800, fontSize: 13, marginTop: 2 }}>
                      {previewTeacher.teacherProfile?.easypaisa_number || '-'}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Account Title:</span>
                    <p style={{ color: '#0f172a', fontWeight: 700, marginTop: 2 }}>
                      {previewTeacher.teacherProfile?.account_title || '-'}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Account Holder Name:</span>
                    <p style={{ color: '#0f172a', fontWeight: 700, marginTop: 2 }}>
                      {previewTeacher.teacherProfile?.account_holder_name || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 8, background: '#f8fafc' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPreviewTeacher(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const target = previewTeacher;
                  setPreviewTeacher(null);
                  handleEdit(target);
                }}
              >
                Edit Teacher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
