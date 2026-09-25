import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [performanceFilter, setPerformanceFilter] = useState('all'); // 'all', 'passed', 'failed', 'high'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resResults, resClasses] = await Promise.all([
        api.get('/admin/results'),
        api.get('/admin/classes').catch(() => ({ data: { classes: [] } }))
      ]);
      setResults(resResults.data.results || []);
      setClassesList(resClasses.data.classes || []);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Build Classes and Subjects Map
  const classHierarchy = useMemo(() => {
    const map = {};

    // First populate from official classes list
    classesList.forEach(cls => {
      const cId = String(cls.id);
      map[cId] = {
        id: cId,
        name: cls.name || cls.display_name || `Class ${cls.grade_level}`,
        grade: cls.grade_level,
        subjects: new Set(),
        totalTests: 0,
      };
    });

    // Populate from actual exam results
    results.forEach(r => {
      const cls = r.exam?.course?.class;
      const subj = r.exam?.course?.subject;
      if (cls) {
        const cId = String(cls.id);
        if (!map[cId]) {
          map[cId] = {
            id: cId,
            name: cls.name || cls.display_name || `Class ${cls.grade_level}`,
            grade: cls.grade_level,
            subjects: new Set(),
            totalTests: 0,
          };
        }
        map[cId].totalTests += 1;
        if (subj?.name) {
          map[cId].subjects.add(subj.name);
        }
      }
    });

    return Object.values(map)
      .map(c => ({
        ...c,
        subjects: Array.from(c.subjects).sort(),
      }))
      .sort((a, b) => {
        const ga = parseInt(a.grade, 10) || 0;
        const gb = parseInt(b.grade, 10) || 0;
        return ga - gb;
      });
  }, [classesList, results]);

  // Available subjects based on selected class
  const availableSubjects = useMemo(() => {
    if (selectedClass === 'all') {
      const allSubjs = new Set();
      results.forEach(r => {
        if (r.exam?.course?.subject?.name) {
          allSubjs.add(r.exam.course.subject.name);
        }
      });
      classHierarchy.forEach(c => c.subjects.forEach(s => allSubjs.add(s)));
      return Array.from(allSubjs).sort();
    }
    const current = classHierarchy.find(c => c.id === selectedClass);
    return current ? current.subjects : [];
  }, [selectedClass, classHierarchy, results]);

  // Filtered results
  const filteredResults = useMemo(() => {
    return results.filter(attempt => {
      const clsId = String(attempt.exam?.course?.class?.id || '');
      const subjName = attempt.exam?.course?.subject?.name || '';
      const studentName = (attempt.student?.full_name || '').toLowerCase();
      const studentEmail = (attempt.student?.email || '').toLowerCase();
      const examTitle = (attempt.exam?.title || '').toLowerCase();
      const maxScore = attempt.exam?.total_marks || 1;
      const obtained = Number(attempt.total_obtained || attempt.score || 0);
      const pct = attempt.percentage != null && !isNaN(Number(attempt.percentage))
        ? Number(attempt.percentage)
        : Math.round((obtained / maxScore) * 100);
      const isPassed = pct >= 50;

      // Class Filter
      if (selectedClass !== 'all' && clsId !== selectedClass) return false;

      // Subject Filter
      if (selectedSubject !== 'all' && subjName !== selectedSubject) return false;

      // Performance Filter
      if (performanceFilter === 'passed' && !isPassed) return false;
      if (performanceFilter === 'failed' && isPassed) return false;
      if (performanceFilter === 'high' && pct < 80) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (
          !studentName.includes(q) &&
          !studentEmail.includes(q) &&
          !examTitle.includes(q) &&
          !subjName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [results, selectedClass, selectedSubject, performanceFilter, searchQuery]);

  // Analytics Metrics
  const metrics = useMemo(() => {
    const total = filteredResults.length;
    if (total === 0) {
      return {
        total: 0,
        avgPct: 0,
        passCount: 0,
        failCount: 0,
        passRate: 0,
        highestPct: 0,
        topStudent: '-',
        gradeDist: { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 }
      };
    }

    let sumPct = 0;
    let passCount = 0;
    let highestPct = -1;
    let topStudent = '-';
    const gradeDist = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };

    filteredResults.forEach(r => {
      const maxScore = r.exam?.total_marks || 1;
      const obtained = Number(r.total_obtained || r.score || 0);
      const pct = r.percentage != null && !isNaN(Number(r.percentage))
        ? Number(r.percentage)
        : Math.round((obtained / maxScore) * 100);

      sumPct += pct;
      if (pct >= 50) passCount++;

      if (pct > highestPct) {
        highestPct = pct;
        topStudent = r.student?.full_name || 'Anonymous';
      }

      // Grade calculation
      let calculatedGrade = r.grade;
      if (!calculatedGrade) {
        if (pct >= 90) calculatedGrade = 'A+';
        else if (pct >= 80) calculatedGrade = 'A';
        else if (pct >= 70) calculatedGrade = 'B';
        else if (pct >= 60) calculatedGrade = 'C';
        else if (pct >= 50) calculatedGrade = 'D';
        else calculatedGrade = 'F';
      }

      if (gradeDist[calculatedGrade] !== undefined) {
        gradeDist[calculatedGrade]++;
      } else {
        gradeDist['C']++;
      }
    });

    const avgPct = Math.round(sumPct / total);
    const passRate = Math.round((passCount / total) * 100);

    return {
      total,
      avgPct,
      passCount,
      failCount: total - passCount,
      passRate,
      highestPct: highestPct < 0 ? 0 : highestPct,
      topStudent,
      gradeDist
    };
  }, [filteredResults]);

  const getGradeBadgeStyle = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
      case 'B':
        return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
      case 'C':
        return { bg: '#fffbeb', text: '#d97706', border: '#fde68a' };
      case 'D':
        return { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' };
      case 'F':
      default:
        return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
    }
  };

  const resetFilters = () => {
    setSelectedClass('all');
    setSelectedSubject('all');
    setPerformanceFilter('all');
    setSearchQuery('');
  };

  const selectedClassName = selectedClass === 'all'
    ? 'All Classes'
    : classHierarchy.find(c => c.id === selectedClass)?.name || `Class ${selectedClass}`;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>📊</span>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Academic Results & Progress Analysis
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Monitor student exam results, analyze single class & subject performance, and track passing rates.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={fetchInitialData}
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
            🔄 {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

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

      {/* ── Class Quick Selection Bar ── */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          borderRadius: 14,
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-light, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🏫</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Select Class to Analyze
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
            {results.length} total graded exam records in database
          </span>
        </div>

        {/* Class Buttons / Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setSelectedClass('all');
              setSelectedSubject('all');
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: selectedClass === 'all'
                ? '2px solid var(--color-primary-600, #4f46e5)'
                : '1px solid var(--border-light, #cbd5e1)',
              background: selectedClass === 'all'
                ? 'var(--color-primary-50, #eef2ff)'
                : 'var(--bg-surface-2, #f8fafc)',
              color: selectedClass === 'all'
                ? 'var(--color-primary-700, #4338ca)'
                : 'var(--text-secondary, #475569)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease'
            }}
          >
            <span>🌐</span> All Classes
            <span
              style={{
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 12,
                background: selectedClass === 'all' ? '#4f46e5' : '#e2e8f0',
                color: selectedClass === 'all' ? '#ffffff' : '#64748b',
                fontWeight: 700
              }}
            >
              {results.length}
            </span>
          </button>

          {classHierarchy.map(cls => {
            const isSelected = selectedClass === cls.id;
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => {
                  setSelectedClass(cls.id);
                  setSelectedSubject('all');
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: isSelected
                    ? '2px solid var(--color-primary-600, #4f46e5)'
                    : '1px solid var(--border-light, #cbd5e1)',
                  background: isSelected
                    ? 'var(--color-primary-50, #eef2ff)'
                    : 'var(--bg-surface-2, #f8fafc)',
                  color: isSelected
                    ? 'var(--color-primary-700, #4338ca)'
                    : 'var(--text-secondary, #475569)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease'
                }}
              >
                <span>📘</span> {cls.name}
                {cls.totalTests > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 6px',
                      borderRadius: 12,
                      background: isSelected ? '#4f46e5' : '#e2e8f0',
                      color: isSelected ? '#ffffff' : '#64748b',
                      fontWeight: 700
                    }}
                  >
                    {cls.totalTests}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filter Bar: Subject, Performance & Search ── */}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, alignItems: 'end' }}>
          {/* Subject Filter */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              📚 Subject Filter:
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="form-input"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: 'var(--bg-surface-2, #f8fafc)'
              }}
            >
              <option value="all">🌐 All Subjects ({availableSubjects.length})</option>
              {availableSubjects.map(sub => (
                <option key={sub} value={sub}>
                  📖 {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Performance Filter */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              🎯 Performance Filter:
            </label>
            <select
              value={performanceFilter}
              onChange={(e) => setPerformanceFilter(e.target.value)}
              className="form-input"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: 'var(--bg-surface-2, #f8fafc)'
              }}
            >
              <option value="all">All Submissions</option>
              <option value="passed">✅ Passed (≥ 50%)</option>
              <option value="high">🌟 Top Scorers (≥ 80%)</option>
              <option value="failed">❌ Needs Support (&lt; 50%)</option>
            </select>
          </div>

          {/* Search Student or Test */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              🔍 Search Student / Exam:
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, email, exam..."
              className="form-input"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 13,
                background: 'var(--bg-surface-2, #f8fafc)'
              }}
            />
          </div>

          {/* Active Filter Clear */}
          {(selectedClass !== 'all' || selectedSubject !== 'all' || performanceFilter !== 'all' || searchQuery) && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-secondary btn-sm"
                style={{
                  height: 40,
                  width: '100%',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                ✕ Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Quick Subject Pills if subjects exist */}
        {availableSubjects.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingTop: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Quick Subject:
            </span>
            <button
              type="button"
              onClick={() => setSelectedSubject('all')}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                background: selectedSubject === 'all' ? '#4f46e5' : '#f1f5f9',
                color: selectedSubject === 'all' ? '#ffffff' : '#64748b',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              All
            </button>
            {availableSubjects.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSubject(s)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: selectedSubject === s ? '#4f46e5' : '#f1f5f9',
                  color: selectedSubject === s ? '#ffffff' : '#64748b',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Academic Analytics KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {/* Total Evaluated */}
        <div
          className="card"
          style={{
            padding: '16px 20px',
            borderRadius: 14,
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Exams Graded
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              📝
            </div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
              {metrics.total}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {selectedClassName} • {selectedSubject === 'all' ? 'All Subjects' : selectedSubject}
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div
          className="card"
          style={{
            padding: '16px 20px',
            borderRadius: 14,
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Average Score
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              📈
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: metrics.avgPct >= 60 ? '#059669' : '#dc2626' }}>
                {metrics.avgPct}%
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>overall class avg</span>
            </div>
            <div style={{ width: '100%', height: 6, borderRadius: 3, background: '#f1f5f9', marginTop: 6, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${metrics.avgPct}%`,
                  height: '100%',
                  borderRadius: 3,
                  background: metrics.avgPct >= 70 ? '#10b981' : metrics.avgPct >= 50 ? '#3b82f6' : '#ef4444'
                }}
              />
            </div>
          </div>
        </div>

        {/* Pass Rate */}
        <div
          className="card"
          style={{
            padding: '16px 20px',
            borderRadius: 14,
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Pass Rate
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              🎯
            </div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#16a34a' }}>
              {metrics.passRate}%
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              ✅ {metrics.passCount} Passed • ❌ {metrics.failCount} Failed
            </div>
          </div>
        </div>

        {/* Top Score */}
        <div
          className="card"
          style={{
            padding: '16px 20px',
            borderRadius: 14,
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Top Score
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              🏆
            </div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#d97706' }}>
              {metrics.highestPct}%
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              👤 {metrics.topStudent}
            </div>
          </div>
        </div>
      </div>

      {/* ── Grade Distribution Bar ── */}
      {metrics.total > 0 && (
        <div
          className="card"
          style={{
            padding: '14px 20px',
            borderRadius: 14,
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              📊 Grade Distribution Breakdown:
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Showing performance spread across {metrics.total} submissions
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {Object.entries(metrics.gradeDist).map(([grade, count]) => {
              const style = getGradeBadgeStyle(grade);
              const percentage = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
              return (
                <div
                  key={grade}
                  style={{
                    flex: '1 1 110px',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 800, color: style.text }}>
                    Grade {grade}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {count} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>({percentage}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Main Results Table ── */}
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
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Graded Exam Submissions ({filteredResults.length})
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Showing {selectedClassName} • {selectedSubject === 'all' ? 'All Subjects' : selectedSubject}
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
            <p style={{ fontWeight: 600 }}>Loading academic results and exam logs...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              No exam results found
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              No graded exam attempts match your selected class, subject, or search filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 12, borderRadius: 8 }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-2, #f8fafc)', borderBottom: '1px solid var(--border-light, #e2e8f0)' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Student</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Exam Title</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Class & Subject</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Score Obtained</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Percentage</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Grade</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((attempt) => {
                  const maxScore = attempt.exam?.total_marks || 1;
                  const obtained = Number(attempt.total_obtained || attempt.score || 0);
                  const pct = attempt.percentage != null && !isNaN(Number(attempt.percentage))
                    ? Number(attempt.percentage)
                    : Math.round((obtained / maxScore) * 100);

                  let calculatedGrade = attempt.grade;
                  if (!calculatedGrade) {
                    if (pct >= 90) calculatedGrade = 'A+';
                    else if (pct >= 80) calculatedGrade = 'A';
                    else if (pct >= 70) calculatedGrade = 'B';
                    else if (pct >= 60) calculatedGrade = 'C';
                    else if (pct >= 50) calculatedGrade = 'D';
                    else calculatedGrade = 'F';
                  }

                  const gradeStyle = getGradeBadgeStyle(calculatedGrade);
                  const isPassed = pct >= 50;
                  const dateStr = attempt.submitted_at || attempt.created_at;
                  const formattedDate = dateStr
                    ? new Date(dateStr).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : '-';

                  const studentName = attempt.student?.full_name || 'Student';
                  const studentInitial = studentName.charAt(0).toUpperCase();
                  const className = attempt.exam?.course?.class?.display_name || attempt.exam?.course?.class?.name || `Class ${attempt.exam?.course?.class?.grade_level || '-'}`;
                  const subjectName = attempt.exam?.course?.subject?.name || '-';

                  return (
                    <tr
                      key={attempt.id}
                      style={{
                        borderBottom: '1px solid var(--border-light, #f1f5f9)',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Student */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: '#e0e7ff',
                              color: '#3730a3',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: 13,
                              flexShrink: 0
                            }}
                          >
                            {studentInitial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {studentName}
                            </div>
                            {attempt.student?.email && (
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                                {attempt.student.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Exam Title */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {attempt.exam?.title || 'Untitled Exam'}
                        </div>
                        {attempt.exam?.type && (
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: 10,
                              textTransform: 'uppercase',
                              padding: '1px 6px',
                              borderRadius: 4,
                              background: '#f1f5f9',
                              color: '#475569',
                              fontWeight: 700,
                              marginTop: 2
                            }}
                          >
                            {attempt.exam.type}
                          </span>
                        )}
                      </td>

                      {/* Class & Subject */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 700,
                              color: 'var(--text-primary)'
                            }}
                          >
                            🏫 {className}
                          </span>
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: 11,
                              color: 'var(--text-secondary)',
                              fontWeight: 500
                            }}
                          >
                            📖 {subjectName}
                          </span>
                        </div>
                      </td>

                      {/* Score Obtained */}
                      <td style={{ padding: '12px 18px' }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>
                          {obtained}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {' '}/ {maxScore}
                        </span>
                      </td>

                      {/* Percentage */}
                      <td style={{ padding: '12px 18px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontWeight: 800,
                            fontSize: 12,
                            background: pct >= 70 ? '#ecfdf5' : pct >= 50 ? '#eff6ff' : '#fef2f2',
                            color: pct >= 70 ? '#059669' : pct >= 50 ? '#2563eb' : '#dc2626',
                            border: `1px solid ${pct >= 70 ? '#a7f3d0' : pct >= 50 ? '#bfdbfe' : '#fecaca'}`
                          }}
                        >
                          {pct}%
                        </span>
                      </td>

                      {/* Grade */}
                      <td style={{ padding: '12px 18px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 6,
                            fontWeight: 800,
                            fontSize: 12,
                            background: gradeStyle.bg,
                            color: gradeStyle.text,
                            border: `1px solid ${gradeStyle.border}`
                          }}
                        >
                          {calculatedGrade}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 18px' }}>
                        {isPassed ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 700,
                              color: '#059669'
                            }}
                          >
                            ✅ Passed
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 700,
                              color: '#dc2626'
                            }}
                          >
                            ❌ Needs Retest
                          </span>
                        )}
                      </td>

                      {/* Submitted At */}
                      <td style={{ padding: '12px 18px', color: 'var(--text-secondary)', fontSize: 12 }}>
                        {formattedDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
