import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useSearch } from '../../contexts/SearchContext';
import { t } from '../../utils/translate';
import {
  HiOutlineBriefcase,
  HiOutlinePlus,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineSearch,
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineStar,
  HiOutlineX,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';

const CATEGORIES = [
  { id: 'stem', label: 'Mathematics & STEM' },
  { id: 'science', label: 'General Science' },
  { id: 'languages', label: 'English & Urdu' },
  { id: 'humanities', label: 'Islamiyat & Quran' },
  { id: 'tech', label: 'Computer & IT' },
  { id: 'primary', label: 'Junior Primary' },
  { id: 'other', label: 'Other Disciplines' },
];

const DEFAULT_FORM = {
  title: '',
  department: 'STEM',
  category: 'stem',
  type: 'Part-Time / Full-Time',
  location: 'Remote (100% Online)',
  qualification: '',
  experience: '',
  description: '',
  skillsInput: '',
  featured: false,
  is_active: true,
};

export default function AdminCareers() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchQuery } = useSearch();

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [localSearch, setLocalSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete State
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/jobs');
      setJobs(data.jobs || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setError('Failed to load job postings.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingJob(null);
    setFormData(DEFAULT_FORM);
    setModalError('');
    setShowModal(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    const skillsArr = Array.isArray(job.skills) ? job.skills : [];
    setFormData({
      title: job.title || '',
      department: job.department || 'STEM',
      category: job.category || 'stem',
      type: job.type || 'Part-Time / Full-Time',
      location: job.location || 'Remote (100% Online)',
      qualification: job.qualification || '',
      experience: job.experience || '',
      description: job.description || '',
      skillsInput: skillsArr.join(', '),
      featured: Boolean(job.featured),
      is_active: job.is_active !== undefined ? Boolean(job.is_active) : true,
    });
    setModalError('');
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.title.trim()) {
      setModalError('Please enter a job title.');
      return;
    }

    const skillsArray = formData.skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      department: formData.department.trim(),
      category: formData.category,
      type: formData.type.trim(),
      location: formData.location.trim(),
      qualification: formData.qualification.trim(),
      experience: formData.experience.trim(),
      description: formData.description.trim(),
      skills: skillsArray,
      featured: formData.featured,
      is_active: formData.is_active,
    };

    setSubmitting(true);
    try {
      if (editingJob) {
        const { data } = await api.put(`/admin/jobs/${editingJob.id}`, payload);
        setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? data.job : j)));
      } else {
        const { data } = await api.post('/admin/jobs', payload);
        setJobs((prev) => [data.job, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save job post:', err);
      setModalError(err.response?.data?.error || 'Failed to save job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (job) => {
    try {
      const { data } = await api.patch(`/admin/jobs/${job.id}/toggle-status`);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? data.job : j)));
    } catch (err) {
      console.error('Failed to toggle job status:', err);
      alert('Failed to update job status.');
    }
  };

  const handleToggleFeatured = async (job) => {
    try {
      const { data } = await api.patch(`/admin/jobs/${job.id}/toggle-featured`);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? data.job : j)));
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
      alert('Failed to update priority status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    try {
      await api.delete(`/admin/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      console.error('Failed to delete job:', err);
      alert('Failed to delete job post.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter and Search logic
  const query = (localSearch || searchQuery || '').trim().toLowerCase();

  const filteredJobs = jobs.filter((job) => {
    if (filterStatus === 'active' && !job.is_active) return false;
    if (filterStatus === 'inactive' && job.is_active) return false;
    if (filterCategory !== 'all' && job.category !== filterCategory) return false;

    if (query) {
      const title = (job.title || '').toLowerCase();
      const dept = (job.department || '').toLowerCase();
      const qual = (job.qualification || '').toLowerCase();
      const skills = Array.isArray(job.skills) ? job.skills.join(' ').toLowerCase() : '';
      return (
        title.includes(query) ||
        dept.includes(query) ||
        qual.includes(query) ||
        skills.includes(query)
      );
    }

    return true;
  });

  const handleViewPublic = (e) => {
    e.preventDefault();
    const targetUrl = window.location.pathname.includes('/online_school')
      ? '/online_school/careers'
      : '/careers';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.is_active).length;
  const priorityJobs = jobs.filter((j) => j.featured).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>
      {/* ═════════ Page Header ═════════ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'rgba(255, 204, 77, 0.18)',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                border: '1px solid rgba(255, 204, 77, 0.4)',
              }}
            >
              <HiOutlineBriefcase />
            </span>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {t('Careers & Job Postings')}
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 6, marginBottom: 0 }}>
            {t('Post new teaching positions and manage vacancies displayed on the public Careers page.')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <a
            href="/online_school/careers"
            onClick={handleViewPublic}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <HiOutlineEye style={{ fontSize: 17, color: '#10B981' }} />
            {t('View Public Page')}
          </a>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn btn-primary"
            style={{
              padding: '9px 18px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(255, 204, 77, 0.3)',
            }}
          >
            <HiOutlinePlus style={{ fontSize: 18 }} />
            {t('Post New Job')}
          </button>
        </div>
      </div>

      {/* ═════════ Stats Cards ═════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div
          className="card"
          style={{
            padding: '16px 20px',
            borderRadius: 14,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('Total Postings')}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {totalJobs}
            </div>
          </div>
          <span style={{ fontSize: 28, opacity: 0.9 }}>💼</span>
        </div>

        <div
          className="card"
          style={{
            padding: '16px 20px',
            borderRadius: 14,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('Active Vacancies')}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#10B981', marginTop: 4 }}>
              {activeJobs}
            </div>
          </div>
          <span style={{ fontSize: 28 }}>✅</span>
        </div>

        <div
          className="card"
          style={{
            padding: '16px 20px',
            borderRadius: 14,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('Priority Roles')}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#F59E0B', marginTop: 4 }}>
              {priorityJobs}
            </div>
          </div>
          <span style={{ fontSize: 28 }}>⭐</span>
        </div>
      </div>

      {/* ═════════ Filters & Search Toolbar ═════════ */}
      <div
        className="card"
        style={{
          padding: 16,
          borderRadius: 14,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
          <HiOutlineSearch
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
              fontSize: 16,
            }}
          />
          <input
            type="text"
            placeholder={t('Search title, department, skills...')}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="form-input"
            style={{
              width: '100%',
              paddingLeft: 36,
              paddingTop: 8,
              paddingBottom: 8,
              fontSize: 13,
              borderRadius: 10,
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-input)',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-select"
            style={{
              padding: '8px 12px',
              fontSize: 13,
              borderRadius: 10,
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-input)',
              minWidth: 160,
            }}
          >
            <option value="all">{t('All Categories')}</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-select"
            style={{
              padding: '8px 12px',
              fontSize: 13,
              borderRadius: 10,
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-input)',
              minWidth: 130,
            }}
          >
            <option value="all">{t('All Statuses')}</option>
            <option value="active">{t('Active Only')}</option>
            <option value="inactive">{t('Inactive Only')}</option>
          </select>
        </div>
      </div>

      {/* ═════════ Job Cards Grid ═════════ */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 110, borderRadius: 14 }}
            />
          ))}
        </div>
      ) : error ? (
        <div
          className="card"
          style={{
            padding: 24,
            textAlign: 'center',
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 14,
            color: '#DC2626',
          }}
        >
          <p style={{ fontWeight: 600, margin: 0 }}>{error}</p>
          <button
            type="button"
            onClick={fetchJobs}
            className="btn btn-sm btn-primary"
            style={{ marginTop: 12 }}
          >
            {t('Retry')}
          </button>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            borderRadius: 16,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>💼</div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            {t('No Job Postings Found')}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 18px' }}>
            {query || filterCategory !== 'all' || filterStatus !== 'all'
              ? t('No job posts match your active filters. Try adjusting your search.')
              : t('You have not created any job posts yet. Click the button below to publish your first opening.')}
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn btn-primary"
            style={{
              padding: '9px 20px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <HiOutlinePlus style={{ fontSize: 17 }} />
            {t('Post New Job')}
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 16,
          }}
        >
          {filteredJobs.map((job) => {
            const skills = Array.isArray(job.skills) ? job.skills : [];
            return (
              <div
                key={job.id}
                className="card card-hover"
                style={{
                  borderRadius: 16,
                  padding: 20,
                  background: 'var(--bg-surface)',
                  border: job.is_active ? '1px solid var(--border-medium)' : '1px dashed var(--border-medium)',
                  opacity: job.is_active ? 1 : 0.8,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  {/* Card Top Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: 'rgba(37, 99, 235, 0.1)',
                          color: '#2563EB',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: 6,
                        }}
                      >
                        {job.department}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                        • {job.type}
                      </span>
                      {job.featured && (
                        <span
                          style={{
                            background: 'rgba(255, 204, 77, 0.22)',
                            color: '#B45309',
                            border: '1px solid rgba(255, 204, 77, 0.5)',
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 999,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          ⭐ {t('Priority')}
                        </span>
                      )}
                    </div>

                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        background: job.is_active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: job.is_active ? '#059669' : '#DC2626',
                      }}
                    >
                      {job.is_active ? t('ACTIVE') : t('INACTIVE')}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                      marginBottom: 8,
                    }}
                  >
                    {job.title}
                  </h3>

                  <p
                    style={{
                      fontSize: 12.5,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55,
                      marginBottom: 14,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {job.description || t('No specific description provided.')}
                  </p>

                  {/* Requirements List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, fontSize: 12, color: 'var(--text-secondary)' }}>
                    {job.qualification && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <HiOutlineAcademicCap style={{ color: '#D97706', fontSize: 15, flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {job.qualification}
                        </span>
                      </div>
                    )}
                    {job.experience && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <HiOutlineClock style={{ color: '#4F46E5', fontSize: 15, flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {job.experience}
                        </span>
                      </div>
                    )}
                    {job.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <HiOutlineLocationMarker style={{ color: '#10B981', fontSize: 15, flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {job.location}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Skills tags */}
                  {skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
                      {skills.map((s, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            background: 'var(--bg-surface-2)',
                            color: 'var(--text-primary)',
                            padding: '3px 8px',
                            borderRadius: 6,
                            border: '1px solid var(--border-light)',
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div
                  style={{
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* Toggle Active Status */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(job)}
                      title={job.is_active ? 'Deactivate Post' : 'Activate Post'}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        background: job.is_active ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface-2)',
                        color: job.is_active ? '#059669' : 'var(--text-tertiary)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {job.is_active ? (
                        <HiOutlineCheckCircle style={{ fontSize: 15 }} />
                      ) : (
                        <HiOutlineXCircle style={{ fontSize: 15 }} />
                      )}
                      <span>{job.is_active ? t('Published') : t('Draft')}</span>
                    </button>

                    {/* Toggle Priority */}
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(job)}
                      title={job.featured ? 'Remove Priority' : 'Make Priority'}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        background: job.featured ? 'rgba(255, 204, 77, 0.22)' : 'var(--bg-surface-2)',
                        color: job.featured ? '#B45309' : 'var(--text-tertiary)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <HiOutlineStar style={{ fontSize: 15 }} />
                      <span>{t('Priority')}</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(job)}
                      className="btn btn-sm btn-secondary"
                      style={{
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 8,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <HiOutlinePencilAlt style={{ fontSize: 14 }} />
                      {t('Edit')}
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(job.id)}
                      disabled={deletingId === job.id}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'transparent',
                        color: '#EF4444',
                        cursor: 'pointer',
                        fontSize: 16,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      title="Delete Job"
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═════════ Create / Edit Modal ═════════ */}
      {showModal &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              overflowY: 'auto',
            }}
          >
            <div
              className="card"
              style={{
                width: '100%',
                maxWidth: 620,
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 18,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
                margin: 'auto',
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 22px',
                  borderBottom: '1px solid var(--border-light)',
                  background: 'var(--bg-surface-2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: 'rgba(255, 204, 77, 0.2)',
                      color: '#D97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 17,
                    }}
                  >
                    <HiOutlineBriefcase />
                  </span>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {editingJob ? t('Edit Job Posting') : t('Create New Job Posting')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    fontSize: 20,
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <HiOutlineX />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} style={{ padding: 22, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {modalError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#DC2626',
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    {modalError}
                  </div>
                )}

                {/* Job Title */}
                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>
                    {t('Job Title')} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Senior Mathematics Teacher (Grade 6-8)"
                    value={formData.title}
                    onChange={handleFormChange}
                    className="form-input"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: 13,
                      borderRadius: 10,
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-input)',
                    }}
                  />
                </div>

                {/* Department & Category */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>
                      {t('Department / Faculty')}
                    </label>
                    <input
                      type="text"
                      name="department"
                      placeholder="e.g. STEM, Science, Languages"
                      value={formData.department}
                      onChange={handleFormChange}
                      className="form-input"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 10,
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-input)',
                      }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>
                      {t('Category Tab')}
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="form-select"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 10,
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-input)',
                      }}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Type & Location */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>
                      {t('Job Type / Shift')}
                    </label>
                    <input
                      type="text"
                      name="type"
                      placeholder="e.g. Part-Time / Full-Time, Flexible Hours"
                      value={formData.type}
                      onChange={handleFormChange}
                      className="form-input"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 10,
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-input)',
                      }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>
                      {t('Location')}
                    </label>
                    <input
                      type="text"
                      name="location"
                      placeholder="e.g. Remote (100% Online)"
                      value={formData.location}
                      onChange={handleFormChange}
                      className="form-input"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 10,
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-input)',
                      }}
                    />
                  </div>
                </div>

                {/* Qualification & Experience */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>
                      {t('Required Qualification')}
                    </label>
                    <input
                      type="text"
                      name="qualification"
                      placeholder="e.g. BS / M.Sc Mathematics / Education"
                      value={formData.qualification}
                      onChange={handleFormChange}
                      className="form-input"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 10,
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-input)',
                      }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>
                      {t('Required Experience')}
                    </label>
                    <input
                      type="text"
                      name="experience"
                      placeholder="e.g. 2+ Years Online Teaching"
                      value={formData.experience}
                      onChange={handleFormChange}
                      className="form-input"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 10,
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-input)',
                      }}
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>
                    {t('Key Skills (comma separated)')}
                  </label>
                  <input
                    type="text"
                    name="skillsInput"
                    placeholder="e.g. PCTB Curriculum, Live Online Teaching, Problem Solving"
                    value={formData.skillsInput}
                    onChange={handleFormChange}
                    className="form-input"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: 13,
                      borderRadius: 10,
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-input)',
                    }}
                  />
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4, marginBottom: 0 }}>
                    {t('Separate skills with commas. These appear as tags on the vacancy card.')}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>
                    {t('Role Description & Expectations')}
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Provide a clear summary of teaching duties, class levels, and syllabus expectations..."
                    value={formData.description}
                    onChange={handleFormChange}
                    className="form-input"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: 13,
                      borderRadius: 10,
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-input)',
                      resize: 'none',
                    }}
                  />
                </div>

                {/* Checkboxes */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20, paddingTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleFormChange}
                      style={{ width: 16, height: 16, accentColor: '#FFCC4D' }}
                    />
                    {t('Publish immediately (Active)')}
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleFormChange}
                      style={{ width: 16, height: 16, accentColor: '#FFCC4D' }}
                    />
                    ⭐ {t('Mark as Priority Role')}
                  </label>
                </div>

                {/* Actions Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 10,
                    paddingTop: 14,
                    borderTop: '1px solid var(--border-light)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary"
                    style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600 }}
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, boxShadow: '0 4px 12px rgba(255, 204, 77, 0.3)' }}
                  >
                    {submitting
                      ? t('Saving...')
                      : editingJob
                      ? t('Update Job Post')
                      : t('Publish Job Post')}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
