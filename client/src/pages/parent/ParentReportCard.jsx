import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ParentReportCard() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const r = await api.get('/parent/dashboard'); setChildren(r.data.children || []); }
      catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const gradeColors = { 'A+': '#10b981', 'A': '#059669', 'B': '#3b82f6', 'C': '#f59e0b', 'D': '#f97316', 'F': '#ef4444' };
  const getGrade = (p) => { if(p>=90) return 'A+'; if(p>=80) return 'A'; if(p>=70) return 'B'; if(p>=60) return 'C'; if(p>=50) return 'D'; return 'F'; };

  if (loading) return <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🎓 Child Report Card</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Academic performance summary</p></div>
        <button className="btn btn-secondary" onClick={() => window.print()}>🖨 Print</button>
      </div>
      {children.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🎓</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No linked children found</p></div>
      ) : children.map(child => {
        const results = child.results || [];
        // Group by subject
        const subjectMap = {};
        results.forEach(r => {
          const sn = r.exam?.course?.subject?.name || 'Unknown';
          if (!subjectMap[sn]) subjectMap[sn] = { subject: sn, totalObtained: 0, totalMarks: 0 };
          subjectMap[sn].totalObtained += (r.total_obtained || 0);
          subjectMap[sn].totalMarks += (r.exam?.total_marks || 0);
        });
        const subjects = Object.values(subjectMap).map(s => ({ ...s, pct: s.totalMarks > 0 ? ((s.totalObtained / s.totalMarks) * 100).toFixed(1) : 0 }));
        const grandO = subjects.reduce((a, s) => a + s.totalObtained, 0);
        const grandM = subjects.reduce((a, s) => a + s.totalMarks, 0);
        const overallPct = grandM > 0 ? ((grandO / grandM) * 100).toFixed(1) : 0;
        const overallGrade = getGrade(overallPct);

        return (
          <div key={child.profile.user_id} className="card" style={{ overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #0f172a)', padding: 20, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div><h3 style={{ fontSize: 18, fontWeight: 800 }}>{child.profile.user?.full_name}</h3>
                <p style={{ fontSize: 13, opacity: 0.7 }}>Class: {child.profile.class?.display_name} | Roll No: {child.profile.roll_number || '-'}</p></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 36, fontWeight: 900, color: gradeColors[overallGrade] }}>{overallGrade}</div>
                <div style={{ fontSize: 13 }}>{overallPct}%</div></div>
            </div>
            <div style={{ padding: 0, overflow: 'auto' }}>
              {subjects.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>No graded results yet</div>
              ) : (
                <table className="data-table"><thead><tr><th>Subject</th><th>Obtained</th><th>Total</th><th>%</th><th>Grade</th></tr></thead>
                  <tbody>{subjects.map((s, i) => (
                    <tr key={i}><td style={{ fontWeight: 600 }}>{s.subject}</td><td>{s.totalObtained}</td><td>{s.totalMarks}</td>
                      <td>{s.pct}%</td><td style={{ fontWeight: 800, color: gradeColors[getGrade(s.pct)] }}>{getGrade(s.pct)}</td></tr>
                  ))}</tbody>
                  <tfoot><tr style={{ fontWeight: 700 }}><td>Total</td><td>{grandO}</td><td>{grandM}</td><td>{overallPct}%</td><td style={{ fontWeight: 800, color: gradeColors[overallGrade] }}>{overallGrade}</td></tr></tfoot>
                </table>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
