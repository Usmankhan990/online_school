import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';

export default function AdminLiveClasses() {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState('');

  // Filters
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'live', 'scheduled', 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  // Selected class for details modal
  const [selectedClassDetails, setSelectedClassDetails] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/admin/live-classes');
      setLiveClasses(data.liveClasses || []);
    } catch (err) {
      console.error('Failed to load live classes:', err);
      setError('Failed to load live classes.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to remove this live class session?')) return;
    try {
      await api.delete(`/admin/live-classes/${id}`);
      setMsg('✅ Live class session deleted successfully.');
      setLiveClasses(prev => prev.filter(c => c.id !== id));
      if (selectedClassDetails?.id === id) {
        setSelectedClassDetails(null);
      }
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      console.error('Delete live class error:', err);
      setMsg('❌ Failed to delete live class.');
    }
  };

  const handleCopyLink = (url, id) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Extract unique classes
  const classesList = useMemo(() => {
    const map = {};
    liveClasses.forEach(item => {
      const cls = item.course?.class;
      if (cls) {
        const cId = String(cls.id || cls.grade_level);
        if (!map[cId]) {
          map[cId] = {
            id: cId,
            grade: cls.grade_level,
            name: cls.display_name || cls.name || `Class ${cls.grade_level}`,
            count: 0
          };
        }
        map[cId].count += 1;
      }
    });
    return Object.values(map).sort((a, b) => (parseInt(a.grade, 10) || 0) - (parseInt(b.grade, 10) || 0));
  }, [liveClasses]);

  // Extract unique subjects
  const subjectsList = useMemo(() => {
    const set = new Set();
    liveClasses.forEach(item => {
      const subj = item.course?.subject?.name;
      if (subj) set.add(subj);
    });
    return Array.from(set).sort();
  }, [liveClasses]);

  // Filtered live classes
  const filteredClasses = useMemo(() => {
    return liveClasses.filter(item => {
      const clsId = String(item.course?.class?.id || item.course?.class?.grade_level || '');
      const subjName = item.course?.subject?.name || '';
      const teacherName = (item.teacher?.full_name || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      const meetingUrl = (item.meeting_url || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      if (selectedClass !== 'all' && clsId !== selectedClass) return false;
      if (selectedSubject !== 'all' && subjName !== selectedSubject) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;

      if (q && !title.includes(q) && !teacherName.includes(q) && !subjName.toLowerCase().includes(q) && !meetingUrl.includes(q)) {
        return false;
      }

      return true;
    });
  }, [liveClasses, selectedClass, selectedSubject, selectedStatus, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const liveNow = liveClasses.filter(c => c.status === 'live').length;
    const scheduled = liveClasses.filter(c => c.status === 'scheduled').length;
    const completed = liveClasses.filter(c => c.status === 'completed').length;
    const teachersSet = new Set(liveClasses.map(c => c.teacher_id).filter(Boolean));

    return {
      total: liveClasses.length,
      liveNow,
      scheduled,
      completed,
      teachersCount: teachersSet.size
    };
  }, [liveClasses]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#ef4444',
              fontWeight: 800,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.02em'
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.4)'
              }}
            />
            🔴 LIVE NOW
          </span>
        );
      case 'completed':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              color: '#10b981',
              fontWeight: 800,
              fontSize: 12,
              textTransform: 'uppercase'
            }}
          >
            ✅ COMPLETED
          </span>
        );
      case 'cancelled':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              color: '#64748b',
              fontWeight: 800,
              fontSize: 12,
              textTransform: 'uppercase'
            }}
          >
            ❌ CANCELLED
          </span>
        );
      case 'scheduled':
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              color: '#3b82f6',
              fontWeight: 800,
              fontSize: 12,
              textTransform: 'uppercase'
            }}
          >
            📅 SCHEDULED
          </span>
        );
    }
  };

  return (
    <div className="animate-fade-in admin-live-container" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Scoped Responsive Media Queries ── */}
      <style>{`
        .admin-live-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }
        .admin-live-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
        }
        .admin-live-filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          align-items: end;
        }
        .admin-live-modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .admin-live-status-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        @media (max-width: 768px) {
          .admin-live-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .admin-live-header button {
            width: 100%;
            justify-content: center;
          }
          .admin-live-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .admin-live-filters-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .admin-live-modal-panel {
            max-width: 95% !important;
            padding: 0 !important;
          }
        }
        @media (max-width: 520px) {
          .admin-live-kpi-grid {
            grid-template-columns: 1fr;
          }
          .admin-live-modal-grid {
            grid-template-columns: 1fr !important;
          }
          .admin-live-status-tabs {
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch;
          }
          .admin-live-status-tabs button {
            flex-shrink: 0;
          }
        }
      `}</style>

      {/* ── Page Header ── */}
      <div className="admin-live-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>📹</span>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Live Classes & Virtual Rooms
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Monitor all live classes created by teachers, view meeting links, class details, teacher profiles, and schedules.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLiveClasses}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer'
          }}
        >
          🔄 {loading ? 'Refreshing...' : 'Refresh Live Classes'}
        </button>
      </div>

      {msg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            background: msg.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
            color: msg.startsWith('✅') ? '#059669' : '#dc2626',
            border: `1px solid ${msg.startsWith('✅') ? '#a7f3d0' : '#fecaca'}`,
            fontWeight: 700,
            fontSize: 13
          }}
        >
          {msg}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            fontWeight: 600,
            fontSize: 13
          }}
        >
          {error}
        </div>
      )}

      {/* ── KPI Metric Summary Cards ── */}
      <div className="admin-live-kpi-grid">
        {/* Live Now */}
        <div
          className="card"
          style={{
            padding: '16px 18px',
            borderRadius: 14,
            background: 'var(--bg-card, #ffffff)',
            border: metrics.liveNow > 0 ? '2px solid #ef4444' : '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            🔴
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#dc2626' }}>{metrics.liveNow}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Active Live Now</div>
          </div>
        </div>

        {/* Scheduled */}
        <div
          className="card"
          style={{
            padding: '16px 18px',
            borderRadius: 14,
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            📅
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#2563eb' }}>{metrics.scheduled}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Upcoming Scheduled</div>
          </div>
        </div>

        {/* Completed */}
        <div
          className="card"
          style={{
            padding: '16px 18px',
            borderRadius: 14,
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            ✅
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>{metrics.completed}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Completed Classes</div>
          </div>
        </div>

        {/* Teachers Hosting */}
        <div
          className="card"
          style={{
            padding: '16px 18px',
            borderRadius: 14,
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            👨‍🏫
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{metrics.teachersCount}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Host Teachers</div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          borderRadius: 14,
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-light, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}
      >
        {/* Status Tabs */}
        <div className="admin-live-status-tabs">
          {[
            { key: 'all', label: 'All Sessions', icon: '🌐', count: liveClasses.length },
            { key: 'live', label: '🔴 Live Now', icon: '', count: metrics.liveNow },
            { key: 'scheduled', label: '📅 Scheduled', icon: '', count: metrics.scheduled },
            { key: 'completed', label: '✅ Completed', icon: '', count: metrics.completed },
          ].map(tab => {
            const isActive = selectedStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedStatus(tab.key)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: isActive ? '2px solid var(--color-primary-600, #4f46e5)' : '1px solid var(--border-light, #cbd5e1)',
                  background: isActive ? 'var(--color-primary-50, rgba(99, 102, 241, 0.15))' : 'var(--bg-surface-2, #f8fafc)',
                  color: isActive ? 'var(--color-primary-700, #4338ca)' : 'var(--text-secondary, #475569)',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>{tab.icon}</span> {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        <div className="admin-live-filters-grid">
          {/* Class Filter */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              🏫 Filter by Class:
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}
            >
              <option value="all">All Classes ({liveClasses.length})</option>
              {classesList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              📖 Filter by Subject:
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}
            >
              <option value="all">All Subjects ({subjectsList.length})</option>
              {subjectsList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              🔍 Search Session or Teacher:
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic, teacher, link..."
              className="form-input"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13 }}
            />
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div
        className="card"
        style={{
          borderRadius: 14,
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-light, #e2e8f0)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Live Classes Schedule ({filteredClasses.length})
          </h2>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Admin can directly launch, copy, or monitor any teacher&apos;s virtual classroom
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
            <p style={{ fontWeight: 600 }}>Loading live classes...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📹</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              No live classes found
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              No live class sessions match your selected class, subject, or search filters.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13, minWidth: 720 }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-2, #f8fafc)', borderBottom: '1px solid var(--border-light, #e2e8f0)' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Topic / Title</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Class & Subject</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Teacher (Host)</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Schedule & Duration</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Live Meeting Link</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map((item) => {
                  const className = item.course?.class?.display_name || item.course?.class?.name || `Class ${item.course?.class?.grade_level || '-'}`;
                  const subjectName = item.course?.subject?.name || '-';
                  const teacherName = item.teacher?.full_name || 'Teacher';
                  const teacherInitial = teacherName.charAt(0).toUpperCase();

                  const scheduledDate = item.scheduled_at ? new Date(item.scheduled_at) : null;
                  const dateStr = scheduledDate
                    ? scheduledDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '-';
                  const timeStr = scheduledDate
                    ? scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : '-';

                  const isLive = item.status === 'live';

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--border-light, #f1f5f9)',
                        background: isLive ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Topic */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.title}
                        </div>
                        {item.description && (
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.description}
                          </div>
                        )}
                      </td>

                      {/* Class & Subject */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 12 }}>
                            🏫 {className}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                            📖 {subjectName}
                          </span>
                        </div>
                      </td>

                      {/* Teacher Details */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              background: '#e0e7ff',
                              color: '#3730a3',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: 12,
                              flexShrink: 0
                            }}
                          >
                            {teacherInitial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {teacherName}
                            </div>
                            {item.teacher?.email && (
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                                {item.teacher.email}
                              </div>
                            )}
                            {item.teacher?.phone && (
                              <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                                📞 {item.teacher.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Schedule & Duration */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          📅 {dateStr}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                          ⏰ {timeStr} ({item.duration_minutes || 45} mins)
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 18px' }}>
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Meeting Link with Direct Launch & Copy */}
                      <td style={{ padding: '12px 18px' }}>
                        {item.meeting_url ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <a
                              href={item.meeting_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '5px 10px',
                                borderRadius: 6,
                                background: '#4f46e5',
                                color: '#ffffff',
                                fontSize: 12,
                                fontWeight: 700,
                                textDecoration: 'none',
                                boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'
                              }}
                            >
                              🚀 Join Class
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyLink(item.meeting_url, item.id)}
                              title="Copy Link"
                              className="btn btn-secondary btn-sm"
                              style={{
                                padding: '5px 10px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                color: copiedId === item.id ? '#10b981' : undefined
                              }}
                            >
                              {copiedId === item.id ? '✓ Copied' : '📋 Copy'}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>
                            No Link Set
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => setSelectedClassDetails(item)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            👁️ Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClass(item.id)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: 6,
                              background: '#fee2e2',
                              border: '1px solid #fca5a5',
                              color: '#dc2626',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Delete Live Class"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Details Modal ── */}
      {selectedClassDetails && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedClassDetails(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 14
          }}
        >
          <div
            className="modal-panel admin-live-modal-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card, #1e293b)',
              borderRadius: 16,
              width: '100%',
              maxWidth: 580,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-light, #334155)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-light, #334155)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-surface-2, #0f172a)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>📹</span>
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Live Class Session Details
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClassDetails(null)}
                style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Session Topic
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 3 }}>
                  {selectedClassDetails.title}
                </div>
              </div>

              {selectedClassDetails.description && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'var(--bg-surface-2, #0f172a)',
                    border: '1px solid var(--border-light, #334155)',
                    fontSize: 13,
                    color: 'var(--text-secondary)'
                  }}
                >
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>
                    Description / Instructions:
                  </strong>
                  {selectedClassDetails.description}
                </div>
              )}

              <div className="admin-live-modal-grid">
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'var(--bg-surface-2, #0f172a)',
                    border: '1px solid var(--border-light, #334155)'
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>🏫 CLASS</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 3 }}>
                    {selectedClassDetails.course?.class?.display_name || selectedClassDetails.course?.class?.name || `Class ${selectedClassDetails.course?.class?.grade_level || '-'}`}
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'var(--bg-surface-2, #0f172a)',
                    border: '1px solid var(--border-light, #334155)'
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>📖 SUBJECT</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 3 }}>
                    {selectedClassDetails.course?.subject?.name || '-'}
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'var(--bg-surface-2, #0f172a)',
                    border: '1px solid var(--border-light, #334155)'
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>👨‍🏫 TEACHER (HOST)</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 3 }}>
                    {selectedClassDetails.teacher?.full_name || 'Teacher'}
                  </div>
                  {selectedClassDetails.teacher?.email && (
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{selectedClassDetails.teacher.email}</div>
                  )}
                </div>

                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'var(--bg-surface-2, #0f172a)',
                    border: '1px solid var(--border-light, #334155)'
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>⏰ SCHEDULE & DURATION</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginTop: 3 }}>
                    {selectedClassDetails.scheduled_at ? new Date(selectedClassDetails.scheduled_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    Duration: {selectedClassDetails.duration_minutes || 45} mins
                  </div>
                </div>
              </div>

              {/* Meeting Link Box */}
              {selectedClassDetails.meeting_url && (
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: 'var(--bg-surface-2, #0f172a)',
                    border: '1px solid var(--border-light, #334155)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary-600, #818cf8)' }}>
                    🔗 Live Virtual Room URL:
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-primary)',
                      wordBreak: 'break-all',
                      fontWeight: 600,
                      background: 'var(--bg-card, #1e293b)',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--border-light, #334155)'
                    }}
                  >
                    {selectedClassDetails.meeting_url}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
                    <a
                      href={selectedClassDetails.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: '#4f46e5',
                        color: '#ffffff',
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      🚀 Open Live Class In New Tab ↗
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(selectedClassDetails.meeting_url, selectedClassDetails.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}
                    >
                      {copiedId === selectedClassDetails.id ? '✓ Link Copied' : '📋 Copy Link'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid var(--border-light, #334155)',
                display: 'flex',
                justifyContent: 'flex-end',
                background: 'var(--bg-surface-2, #0f172a)'
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedClassDetails(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '8px 18px', borderRadius: 8, fontWeight: 700 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
