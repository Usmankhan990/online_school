import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function StudentReportCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const r = await api.get('/student/report-card'); setData(r.data); }
      catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const gradeColors = { 'A+': '#10b981', 'A': '#059669', 'B': '#3b82f6', 'C': '#f59e0b', 'D': '#f97316', 'F': '#ef4444' };

  if (loading) return <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}</div>;

  if (!data || !data.subjects?.length) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🎓 Report Card</h1></div>
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🎓</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No graded results yet</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Your report card will appear once exam results are published.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🎓 Report Card</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Official academic report</p></div>
        <button className="btn btn-secondary" onClick={() => window.print()}>🖨 Print Report</button>
      </div>

      {/* Student Info Card */}
      <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, #1e3a5f, #0f172a)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>{data.student?.name}</h2>
            <p style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>Class: {data.student?.class} | Roll No: {data.student?.rollNo || '-'}</p>
            <p style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>Usman Online School — Punjab Board (PCTB)</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: gradeColors[data.summary?.grade] || 'white' }}>{data.summary?.grade}</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{data.summary?.percentage}%</div>
          </div>
        </div>
      </div>

      {/* Subject-wise Results */}
      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr><th>Subject</th><th>Marks Obtained</th><th>Total Marks</th><th>Percentage</th><th>Grade</th></tr>
          </thead>
          <tbody>
            {data.subjects.map((s, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{s.subject}</td>
                <td>{s.totalObtained}</td>
                <td>{s.totalMarks}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, maxWidth: 120, height: 8, background: 'var(--bg-surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(s.percentage, 100)}%`, height: '100%', background: gradeColors[s.grade] || '#6b7280', borderRadius: 99, transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{s.percentage}%</span>
                  </div>
                </td>
                <td><span style={{ fontSize: 18, fontWeight: 800, color: gradeColors[s.grade] || '#6b7280' }}>{s.grade}</span></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700, borderTop: '2px solid var(--border-light)' }}>
              <td>Grand Total</td>
              <td>{data.summary?.totalObtained}</td>
              <td>{data.summary?.totalMarks}</td>
              <td>{data.summary?.percentage}%</td>
              <td><span style={{ fontSize: 20, fontWeight: 800, color: gradeColors[data.summary?.grade] || '#6b7280' }}>{data.summary?.grade}</span></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Grading Scale */}
      <div className="card" style={{ padding: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>📐 Grading Scale</h4>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[{ g: 'A+', r: '90-100%' }, { g: 'A', r: '80-89%' }, { g: 'B', r: '70-79%' }, { g: 'C', r: '60-69%' }, { g: 'D', r: '50-59%' }, { g: 'F', r: 'Below 50%' }].map(x => (
            <span key={x.g} className="badge" style={{ background: `${gradeColors[x.g]}15`, color: gradeColors[x.g], padding: '4px 12px' }}>
              {x.g}: {x.r}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
