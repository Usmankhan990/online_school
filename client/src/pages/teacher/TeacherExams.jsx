import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { HiOutlinePlus, HiOutlineCheck } from 'react-icons/hi';

export default function TeacherExams() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    course_id: '', title: '', type: 'quiz', total_marks: 10, duration_minutes: 30,
    start_time: '', end_time: '',
    questions: [{ question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '', marks: 1 }]
  });
  const [loading, setLoading] = useState(true);
  const [viewExam, setViewExam] = useState(null);
  const dateTimerRef = useRef({});

  const handleDateTimeChange = (field, e) => {
    const val = e.target.value;
    const target = e.target;
    setForm(prev => ({ ...prev, [field]: val }));

    if (dateTimerRef.current[field]) {
      clearTimeout(dateTimerRef.current[field]);
    }

    if (val && val.length >= 16) {
      dateTimerRef.current[field] = setTimeout(() => {
        try {
          target.blur();
        } catch {}
      }, 500);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length === 0) return;
      let startIndex = lines[0].toLowerCase().includes('question') ? 1 : 0;
      
      const newQuestions = [];
      for (let i = startIndex; i < lines.length; i++) {
        const row = [];
        let curr = '';
        let inQuotes = false;
        for (let char of lines[i]) {
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) { row.push(curr); curr = ''; }
          else curr += char;
        }
        row.push(curr);
        const cleanRow = row.map(r => r.replace(/^"|"$/g, '').trim());
        
        if (cleanRow.length >= 6) {
          const opts = [cleanRow[1], cleanRow[2], cleanRow[3], cleanRow[4]].filter(Boolean);
          newQuestions.push({
            question_text: cleanRow[0],
            question_type: opts.length > 0 ? 'mcq' : 'subjective',
            options: opts.length > 0 ? (opts.length < 4 ? [...opts, '', '', ''] : opts).slice(0,4) : ['', '', '', ''],
            correct_answer: cleanRow[5] || '',
            marks: parseInt(cleanRow[6]) || 1
          });
        }
      }
      if (newQuestions.length > 0) {
        setForm(f => {
          const isEmpty = f.questions.length === 1 && !f.questions[0].question_text;
          return { ...f, questions: isEmpty ? newQuestions : [...f.questions, ...newQuestions] };
        });
        alert(`Successfully added ${newQuestions.length} questions from sheet!`);
      } else {
        alert('Invalid CSV format. Please ensure columns are: Question, OptA, OptB, OptC, OptD, Correct Answer, Marks');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const loadExams = () => api.get('/teacher/exams').then(res => setExams(res.data.exams)).catch(console.error);

  useEffect(() => {
    loadExams().finally(() => setLoading(false));
    api.get('/teacher/courses').then(res => setCourses(res.data.courses)).catch(() => {});
  }, []);

  const addQuestion = () => {
    setForm(f => ({ ...f, questions: [...f.questions, { question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '', marks: 1 }] }));
  };

  const updateQuestion = (idx, field, value) => {
    setForm(f => {
      const qs = [...f.questions];
      qs[idx] = { ...qs[idx], [field]: value };
      return { ...f, questions: qs };
    });
  };

  const updateOption = (qIdx, oIdx, value) => {
    setForm(f => {
      const qs = [...f.questions];
      const opts = [...qs[qIdx].options];
      opts[oIdx] = value;
      qs[qIdx] = { ...qs[qIdx], options: opts };
      return { ...f, questions: qs };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teacher/exams', form);
      setShowForm(false);
      loadExams();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const handlePublish = async (id) => {
    try {
      await api.put(`/teacher/exams/${id}/publish`);
      loadExams();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams & Papers</h1>
          <p className="text-dark-400 text-sm mt-1">Create online exams and papers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> Add Exam
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="glass-card p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Exam</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select className="form-input" value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})} required>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <input className="form-input" placeholder="Exam Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="quiz">📝 Daily Test / Quiz</option>
                <option value="first_term">🥇 1st Term Exam</option>
                <option value="second_term">🥈 2nd Term Exam</option>
                <option value="final_exam">🏆 Final Exam</option>
                <option value="paper">📄 Practice Paper</option>
              </select>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type="number" placeholder="Total Marks" value={form.total_marks} onChange={e => setForm({...form, total_marks: parseInt(e.target.value)})} style={{ paddingRight: 60 }} />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 600, color: '#94a3b8', pointerEvents: 'none' }}>Marks</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type="number" placeholder="Duration" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: parseInt(e.target.value)})} style={{ paddingRight: 46 }} />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 600, color: '#94a3b8', pointerEvents: 'none' }}>Min</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={form.start_time}
                  onChange={e => handleDateTimeChange('start_time', e)}
                  onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                  required
                  style={{ paddingRight: 75 }}
                />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 600, color: '#94a3b8', pointerEvents: 'none' }}>Start Time</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={form.end_time}
                  onChange={e => handleDateTimeChange('end_time', e)}
                  onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                  required
                  style={{ paddingRight: 70 }}
                />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 600, color: '#94a3b8', pointerEvents: 'none' }}>End Time</span>
              </div>
            </div>

            <div style={{ paddingTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h4 className="text-sm font-semibold text-primary-400">Questions</h4>
                <div style={{ position: 'relative' }}>
                  <input type="file" accept=".csv" onChange={handleFileUpload} style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer' }} title="Upload CSV Sheet" />
                  <button type="button" style={{ padding: '6px 12px', background: '#e2e8f0', color: '#475569', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer', border: 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                    Upload CSV Sheet
                  </button>
                </div>
              </div>
              {form.questions.map((q, qi) => (
                <div key={qi} className="mb-4 p-5 rounded-xl bg-dark-800/50">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>Q{qi + 1}</span>
                    <select
                      style={{
                        padding: '6px 42px 6px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--border-input, #e8edf3)',
                        fontSize: 12,
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-input, #fff)',
                        cursor: 'pointer',
                        outline: 'none',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1.5 1.5L6 6L10.5 1.5' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 18px center'
                      }}
                      value={q.question_type}
                      onChange={e => updateQuestion(qi, 'question_type', e.target.value)}
                    >
                      <option value="mcq">MCQ</option>
                      <option value="true_false">True/False</option>
                      <option value="subjective">Subjective</option>
                    </select>
                  </div>
                  <textarea className="form-input h-16 resize-none" style={{ marginBottom: 10 }} placeholder="Question text..." value={q.question_text} onChange={e => updateQuestion(qi, 'question_text', e.target.value)} />
                  {q.question_type === 'mcq' && (
                    <>
                      <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 10 }}>
                        {q.options.map((opt, oi) => (
                          <input key={oi} className="form-input text-xs py-2" placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt} onChange={e => updateOption(qi, oi, e.target.value)} />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4" style={{ marginTop: 0 }}>
                        <input className="form-input text-xs py-2" placeholder="Correct Answer" value={q.correct_answer} onChange={e => updateQuestion(qi, 'correct_answer', e.target.value)} />
                        <input className="form-input text-xs py-2" type="number" placeholder="Marks" value={q.marks} onChange={e => updateQuestion(qi, 'marks', parseInt(e.target.value))} />
                      </div>
                    </>
                  )}
                  {q.question_type === 'true_false' && (
                    <div className="grid grid-cols-2 gap-4" style={{ marginTop: 0 }}>
                      <select className="form-input text-xs py-2" value={q.correct_answer} onChange={e => updateQuestion(qi, 'correct_answer', e.target.value)}>
                        <option value="">Select Correct Answer (True / False)</option>
                        <option value="True">True</option>
                        <option value="False">False</option>
                      </select>
                      <input className="form-input text-xs py-2" type="number" placeholder="Marks" value={q.marks} onChange={e => updateQuestion(qi, 'marks', parseInt(e.target.value))} />
                    </div>
                  )}
                </div>
              ))}
              <button type="button" onClick={addQuestion} className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1" style={{ marginTop: 16, marginBottom: 8 }}>
                <HiOutlinePlus className="w-4 h-4" /> Add Question
              </button>
            </div>

            <div className="mt-4 flex gap-3">
              <button type="submit" className="btn btn-primary btn-sm">Create Exam</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Exams Table */}
      <div className="glass-card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
              {['Exam Title', 'Class', 'Subject', 'Questions', 'Marks', 'Attempts', 'Status', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exams.map(exam => (
              <tr key={exam.id}
                style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{exam.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: 0, marginTop: 2 }}>{exam.type || 'Online'}</p>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{exam.course?.class?.display_name || '—'}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{exam.course?.subject?.name || '—'}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>{exam.questions?.length || 0}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>{exam.total_marks}</td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 99, color: '#3b82f6', background: '#eff6ff' }}>{exam.attempts?.length || 0}</span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99, color: exam.is_published ? '#10b981' : '#f59e0b', background: exam.is_published ? '#ecfdf5' : '#fffbeb' }}>
                    {exam.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', display: 'flex', gap: 8 }}>
                  <button onClick={() => setViewExam(exam)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, border: '1px solid #bfdbfe', background: '#eff6ff', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onMouseOver={e => e.currentTarget.style.background = '#dbeafe'}
                    onMouseOut={e => e.currentTarget.style.background = '#eff6ff'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> View
                  </button>
                  {!exam.is_published && (
                    <button onClick={() => handlePublish(exam.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, border: '1px solid #d1fae5', background: '#ecfdf5', color: '#059669', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                      onMouseOver={e => e.currentTarget.style.background = '#d1fae5'}
                      onMouseOut={e => e.currentTarget.style.background = '#ecfdf5'}>
                      <HiOutlineCheck style={{ width: 12, height: 12 }} /> Publish
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {exams.length === 0 && !loading && (
              <tr>
                <td colSpan="8" style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>📝</span>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>No exams yet. Click "Add Exam" to start!</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Exam Modal */}
      {viewExam && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card animate-slide-up hide-scrollbar" style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', padding: 32, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 16, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: 16, marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{viewExam.title}</h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Time Limit: {viewExam.duration_minutes} minutes • Total Marks: {viewExam.total_marks}</p>
              </div>
              <button onClick={() => setViewExam(null)} className="btn btn-secondary btn-sm">Close</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {viewExam.questions?.map((q, i) => (
                <div key={q.id} style={{ background: 'var(--bg-surface-2)', padding: 24, borderRadius: 12, border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Q{i + 1}. {q.question_text}</h4>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{q.marks} Marks</span>
                  </div>

                  {q.question_type === 'mcq' && q.options && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                      {JSON.parse(q.options).map((opt, oi) => (
                        <div key={oi} style={{ padding: 12, background: q.correct_answer === opt ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-surface)', border: `1px solid ${q.correct_answer === opt ? '#22c55e' : 'var(--border-light)'}`, borderRadius: 8 }}>
                          <span style={{ fontSize: 14, color: q.correct_answer === opt ? '#22c55e' : 'var(--text-primary)', fontWeight: q.correct_answer === opt ? 700 : 400 }}>{opt} {q.correct_answer === opt && '✓'}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.question_type === 'true_false' && (
                    <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                      {['True', 'False'].map(opt => (
                        <div key={opt} style={{ padding: '10px 20px', background: q.correct_answer === opt ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-surface)', border: `1px solid ${q.correct_answer === opt ? '#22c55e' : 'var(--border-light)'}`, borderRadius: 8 }}>
                          <span style={{ fontSize: 14, color: q.correct_answer === opt ? '#22c55e' : 'var(--text-primary)', fontWeight: q.correct_answer === opt ? 700 : 400 }}>{opt} {q.correct_answer === opt && '✓'}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.question_type === 'subjective' && (
                    <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                      [Subjective Question - Answer Area]
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
