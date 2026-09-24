import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const DEFAULT_TIMETABLE = {
  columns: [
    { key: 'class', label: 'Class', time: '' },
    { key: 'p1', label: 'P1', time: '8:15 - 8:50' },
    { key: 'p2', label: 'P2', time: '8:50 - 9:25' },
    { key: 'p3', label: 'P3', time: '9:25 - 10:00' },
    { key: 'p4', label: 'P4', time: '10:00 - 10:20' },
    { key: 'break', label: 'BREAK', time: '10:20 - 10:40' },
    { key: 'p5', label: 'P5', time: '10:40 - 11:15' },
    { key: 'p6', label: 'P6', time: '11:15 - 11:50' },
    { key: 'p7', label: 'P7', time: '11:50 - 12:25' },
    { key: 'p8', label: 'P8', time: '12:25 - 1:00' },
  ],
  scheduleData: [
    {
      class: 'Class 1',
      p1: 'English',
      p2: 'Maths',
      p3: 'Urdu',
      p4: 'Nazra Quran',
      break: 'RECESS',
      p5: 'GK',
      p6: 'Drawing',
      p7: 'Story / Activity',
      p8: 'Games / PT',
    },
    {
      class: 'Class 2',
      p1: 'Maths',
      p2: 'Urdu',
      p3: 'English',
      p4: 'GK',
      break: 'RECESS',
      p5: 'Nazra Quran',
      p6: 'Islamiat',
      p7: 'Drawing',
      p8: 'Activity / PT',
    },
    {
      class: 'Class 3',
      p1: 'Urdu',
      p2: 'Science',
      p3: 'Maths',
      p4: 'English',
      break: 'RECESS',
      p5: 'History/Geo',
      p6: 'Nazra Quran',
      p7: 'Islamiat',
      p8: 'Computer',
    },
    {
      class: 'Class 4',
      p1: 'Science',
      p2: 'English',
      p3: 'GK/S.St',
      p4: 'Urdu',
      break: 'RECESS',
      p5: 'Maths',
      p6: 'Computer',
      p7: 'Nazra Quran',
      p8: 'Drawing / PT',
    },
    {
      class: 'Class 5',
      p1: 'History/Geo',
      p2: 'Science',
      p3: 'Urdu',
      p4: 'Maths',
      break: 'RECESS',
      p5: 'English',
      p6: 'Islamiat',
      p7: 'Computer',
      p8: 'Activity / Test',
    },
    {
      class: 'Class 6',
      p1: 'Computer',
      p2: 'History/Geo',
      p3: 'Science',
      p4: 'Islamiat',
      break: 'RECESS',
      p5: 'Urdu',
      p6: 'Maths',
      p7: 'English',
      p8: 'Library / PT',
    },
    {
      class: 'Class 7',
      p1: 'Islamiat',
      p2: 'Computer',
      p3: 'History/Geo',
      p4: 'Science',
      break: 'RECESS',
      p5: 'Maths',
      p6: 'English',
      p7: 'Urdu',
      p8: 'Sports / PT',
    },
    {
      class: 'Class 8',
      p1: 'Drawing / Art',
      p2: 'Islamiat',
      p3: 'Computer',
      p4: 'History/Geo',
      break: 'RECESS',
      p5: 'Science',
      p6: 'Urdu',
      p7: 'Maths',
      p8: 'English',
    },
  ],
};

const getSubjectStyle = (subjectName) => {
  const s = (subjectName || '').toLowerCase();
  if (s.includes('recess') || s.includes('break')) {
    return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', fontWeight: '800' };
  }
  if (s.includes('english')) {
    return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
  }
  if (s.includes('math')) {
    return { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' };
  }
  if (s.includes('urdu')) {
    return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
  }
  if (s.includes('science')) {
    return { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' };
  }
  if (s.includes('quran') || s.includes('islam')) {
    return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
  }
  if (s.includes('computer')) {
    return { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' };
  }
  if (s.includes('history') || s.includes('geo') || s.includes('s.st') || s.includes('gk')) {
    return { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' };
  }
  if (s.includes('draw') || s.includes('art') || s.includes('story') || s.includes('games') || s.includes('pt') || s.includes('sport') || s.includes('activ')) {
    return { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' };
  }
  return { bg: '#f8fafc', text: '#334155', border: '#e2e8f0' };
};

export default function SchoolTimeTable() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [timetable, setTimetable] = useState(DEFAULT_TIMETABLE);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(DEFAULT_TIMETABLE);
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await api.get('/timetable');
      if (res.data?.timetable) {
        setTimetable(res.data.timetable);
        setEditData(JSON.parse(JSON.stringify(res.data.timetable)));
      }
    } catch (err) {
      console.error('Fetch timetable error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (rowIndex, colKey, value) => {
    setEditData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.scheduleData[rowIndex][colKey] = value;
      return copy;
    });
  };

  const handleHeaderTimeChange = (colIndex, timeValue) => {
    setEditData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.columns[colIndex].time = timeValue;
      return copy;
    });
  };

  const handleSave = async () => {
    if (!isSuperAdmin) return;
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await api.put('/timetable', { timetable: editData });
      setTimetable(JSON.parse(JSON.stringify(editData)));
      setEditing(false);
      setMsg({ type: 'success', text: '✅ Time Table updated successfully!' });
      setTimeout(() => setMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setMsg({ type: 'error', text: '❌ ' + (err.response?.data?.error || 'Failed to update timetable.') });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (!confirm('Reset schedule to official default timetable?')) return;
    setEditData(JSON.parse(JSON.stringify(DEFAULT_TIMETABLE)));
  };

  const handleCancelEdit = () => {
    setEditData(JSON.parse(JSON.stringify(timetable)));
    setEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const activeData = editing ? editData : timetable;

  const filteredSchedule = useMemo(() => {
    return activeData.scheduleData.filter((row) => {
      if (selectedClass !== 'all' && row.class !== selectedClass) return false;
      return true;
    });
  }, [activeData, selectedClass]);

  const classesList = useMemo(() => {
    return Array.from(new Set(activeData.scheduleData.map((r) => r.class)));
  }, [activeData]);

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 40, width: 280, borderRadius: 10 }} />
        <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              🗓️ Taleem Ghar — School Time Table
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 999,
                background: isSuperAdmin ? '#ecfdf5' : '#eff6ff',
                color: isSuperAdmin ? '#059669' : '#1d4ed8',
                border: `1px solid ${isSuperAdmin ? '#a7f3d0' : '#bfdbfe'}`,
              }}
            >
              {isSuperAdmin ? '👑 Super Admin (Full Edit Access)' : '📖 Official Academic Schedule'}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, margin: 0 }}>
            Daily class period timings, subject allocations & break schedule (Class 1 to Class 8)
          </p>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Print Timetable"
          >
            🖨️ Print
          </button>

          {isSuperAdmin && !editing && (
            <button
              type="button"
              onClick={() => {
                setEditData(JSON.parse(JSON.stringify(timetable)));
                setEditing(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              ✏️ Edit Time Table
            </button>
          )}

          {isSuperAdmin && editing && (
            <>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="btn btn-secondary btn-sm"
                style={{ color: '#d97706' }}
              >
                🔄 Reset Default
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn btn-secondary btn-sm"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-accent btn-sm"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}
                disabled={saving}
              >
                {saving ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {msg.text && (
        <div
          className="alert"
          style={{
            padding: 12,
            borderRadius: 10,
            background: msg.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: msg.type === 'success' ? '#059669' : '#dc2626',
            border: `1px solid ${msg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {msg.text}
        </div>
      )}

      {/* Class Filter Bar & Subject Highlight Search */}
      <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          {/* Class pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)', marginRight: 4 }}>
              🏫 Filter Class:
            </span>
            <button
              type="button"
              onClick={() => setSelectedClass('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                border: selectedClass === 'all' ? '2px solid #0f766e' : '1px solid var(--border-light)',
                background: selectedClass === 'all' ? '#ccfbf1' : 'var(--bg-card)',
                color: selectedClass === 'all' ? '#0f766e' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              All Classes ({activeData.scheduleData.length})
            </button>
            {classesList.map((clsName) => {
              const isSelected = selectedClass === clsName;
              return (
                <button
                  key={clsName}
                  type="button"
                  onClick={() => setSelectedClass(clsName)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    border: isSelected ? '2px solid #0f766e' : '1px solid var(--border-light)',
                    background: isSelected ? '#ccfbf1' : 'var(--bg-card)',
                    color: isSelected ? '#0f766e' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {clsName}
                </button>
              );
            })}
          </div>

          {/* Quick Subject Search */}
          <div style={{ minWidth: 200, maxWidth: 280, width: '100%' }}>
            <input
              type="text"
              placeholder="🔍 Highlight subject (e.g. Maths, Science)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ padding: '6px 12px', fontSize: 12, width: '100%', borderRadius: 8 }}
            />
          </div>
        </div>

        {editing && isSuperAdmin && (
          <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 12, color: '#92400e', fontWeight: 600 }}>
            ✏️ <strong>Edit Mode Active:</strong> You can edit any subject cell or period timing directly in the table below. Click <strong>"Save Changes"</strong> when finished.
          </div>
        )}
      </div>

      {/* Main Time Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1.5px solid #cbd5e1', borderRadius: 14 }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#0f766e', color: '#ffffff' }}>
                {activeData.columns.map((col, colIdx) => (
                  <th
                    key={col.key}
                    style={{
                      padding: '12px 10px',
                      borderRight: '1px solid rgba(255,255,255,0.18)',
                      minWidth: col.key === 'class' ? 110 : (col.key === 'break' ? 95 : 120),
                      verticalAlign: 'middle',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: col.key === 'break' ? 12 : 13.5, letterSpacing: '0.02em' }}>
                      {col.label}
                    </div>
                    {col.time && (
                      editing && isSuperAdmin ? (
                        <input
                          type="text"
                          value={col.time}
                          onChange={(e) => handleHeaderTimeChange(colIdx, e.target.value)}
                          style={{
                            width: '90%',
                            fontSize: 10.5,
                            marginTop: 4,
                            padding: '2px 4px',
                            borderRadius: 4,
                            border: '1px solid #99f6e4',
                            background: '#ffffff',
                            color: '#0f766e',
                            textAlign: 'center',
                            fontWeight: 700,
                          }}
                        />
                      ) : (
                        <div style={{ fontSize: 10.5, opacity: 0.9, marginTop: 2, fontWeight: 600 }}>
                          ({col.time})
                        </div>
                      )
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSchedule.map((row, rowIdx) => {
                const originalIndex = activeData.scheduleData.findIndex((r) => r.class === row.class);
                return (
                  <tr
                    key={row.class}
                    style={{
                      background: rowIdx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-surface-2)',
                      borderBottom: '1px solid var(--border-light)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Class Column */}
                    <td
                      style={{
                        padding: '12px 10px',
                        fontWeight: 900,
                        color: '#14b8a6',
                        background: rowIdx % 2 === 0 ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.06)',
                        borderRight: '2px solid var(--border-light)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      🏫 {row.class}
                    </td>

                    {/* Periods P1 to P8 and Break */}
                    {['p1', 'p2', 'p3', 'p4', 'break', 'p5', 'p6', 'p7', 'p8'].map((colKey) => {
                      const cellVal = row[colKey] || '';
                      const styleInfo = getSubjectStyle(cellVal);
                      const isHighlighted = searchQuery && cellVal.toLowerCase().includes(searchQuery.toLowerCase().trim());

                      if (editing && isSuperAdmin && colKey !== 'class') {
                        return (
                          <td key={colKey} style={{ padding: 6, borderRight: '1px solid var(--border-light)' }}>
                            <input
                              type="text"
                              value={cellVal}
                              onChange={(e) => handleCellChange(originalIndex, colKey, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                fontSize: 12,
                                fontWeight: 700,
                                borderRadius: 6,
                                border: '1px solid var(--border-input)',
                                background: 'var(--bg-input)',
                                color: 'var(--text-primary)',
                                textAlign: 'center',
                              }}
                            />
                          </td>
                        );
                      }

                      return (
                        <td
                          key={colKey}
                          style={{
                            padding: '10px 8px',
                            borderRight: '1px solid var(--border-light)',
                            verticalAlign: 'middle',
                            background: isHighlighted ? 'rgba(250, 204, 21, 0.3)' : (colKey === 'break' ? 'rgba(245, 158, 11, 0.15)' : undefined),
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '5px 10px',
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: styleInfo.fontWeight || '700',
                              background: isHighlighted ? '#fef08a' : styleInfo.bg,
                              color: isHighlighted ? '#854d0e' : styleInfo.text,
                              border: `1px solid ${isHighlighted ? '#eab308' : styleInfo.border}`,
                              maxWidth: '100%',
                              wordBreak: 'break-word',
                            }}
                          >
                            {cellVal}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timetable Legend */}
      <div className="card" style={{ padding: 14 }}>
        <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
          🎨 Subject Color Guide:
        </span>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { name: 'English', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
            { name: 'Mathematics', bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
            { name: 'Urdu', bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
            { name: 'General Science', bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' },
            { name: 'Nazra Quran / Islamiat', bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
            { name: 'Computer Science', bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' },
            { name: 'History / Geo / GK', bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
            { name: 'Recess / Break', bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
            { name: 'Arts / Activity / Sports / PT', bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
          ].map((item) => (
            <span
              key={item.name}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                background: item.bg,
                color: item.text,
                border: `1px solid ${item.border}`,
              }}
            >
              {item.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
