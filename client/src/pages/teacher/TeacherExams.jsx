import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { HiOutlinePlus, HiOutlineCheck } from 'react-icons/hi';

export default function TeacherExams() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    course_id: '', title: '', type: 'quiz', total_marks: 1, duration_minutes: 30,
    start_time: '', end_time: '',
    questions: [{ question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '', marks: 1 }]
  });
  const [loading, setLoading] = useState(true);
  const [viewExam, setViewExam] = useState(null);
  const [activeQuestionType, setActiveQuestionType] = useState('mcq');
  const dateTimerRef = useRef({});

  const isPastTime = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    return d.getTime() < Date.now();
  };

  const isEndTimeInvalid = (startTimeStr, endTimeStr) => {
    if (!startTimeStr || !endTimeStr) return false;
    const start = new Date(startTimeStr);
    const end = new Date(endTimeStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
    return end.getTime() <= start.getTime();
  };

  const getMinDateTime = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const calculateEndTime = (startTimeStr, minutes) => {
    if (!startTimeStr || !minutes || isNaN(minutes)) return '';
    const start = new Date(startTimeStr);
    if (isNaN(start.getTime())) return '';
    const end = new Date(start.getTime() + parseInt(minutes) * 60000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`;
  };

  const handleDateTimeChange = (field, e) => {
    const val = e.target.value;
    const target = e.target;
    setForm(prev => {
      const updated = { ...prev, [field]: val };
      if (field === 'start_time' && val && prev.duration_minutes > 0) {
        updated.end_time = calculateEndTime(val, prev.duration_minutes);
      }
      return updated;
    });

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
            marks: parseFloat(cleanRow[6]) || 1
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

  // Live real-time auto calculation of Total Marks from all questions
  useEffect(() => {
    if (form.questions && form.questions.length > 0) {
      const sum = form.questions.reduce((acc, q) => {
        const val = parseFloat(q.marks);
        return acc + (isNaN(val) ? 0 : val);
      }, 0);
      const rounded = Math.round(sum * 100) / 100;
      setForm(prev => (prev.total_marks === rounded ? prev : { ...prev, total_marks: rounded }));
    }
  }, [form.questions]);

  const addQuestion = (type = 'mcq') => {
    setActiveQuestionType(type);
    const newQ = {
      question_text: '',
      question_type: type,
      options: type === 'mcq' ? ['', '', '', ''] : (type === 'true_false' ? ['True', 'False'] : null),
      correct_answer: type === 'true_false' ? 'True' : '',
      marks: type === 'subjective' ? 5 : 1
    };
    setForm(f => ({ ...f, questions: [...f.questions, newQ] }));
  };

  const removeQuestion = (idx) => {
    if (form.questions.length <= 1) return;
    setForm(f => {
      const remaining = f.questions.filter((_, i) => i !== idx);
      if (remaining.length > 0) {
        // Auto sync active tab with the remaining question type
        const types = new Set(remaining.map(q => q.question_type));
        if (types.size === 1) {
          setActiveQuestionType(remaining[0].question_type);
        } else {
          setActiveQuestionType(remaining[remaining.length - 1].question_type);
        }
      }
      return { ...f, questions: remaining };
    });
  };

  const updateQuestion = (idx, field, value) => {
    setForm(f => {
      const qs = [...f.questions];
      if (field === 'question_type') {
        const prevQ = qs[idx];
        let newOptions = prevQ.options;
        let newCorrectAnswer = '';
        let newMarks = prevQ.marks || 1;

        if (value === 'mcq') {
          newOptions = (prevQ.options && prevQ.options.length === 4) ? prevQ.options : ['', '', '', ''];
        } else if (value === 'true_false') {
          newOptions = ['True', 'False'];
          newCorrectAnswer = 'True';
        } else if (value === 'subjective') {
          newOptions = null;
          newCorrectAnswer = '';
          if (newMarks < 2) newMarks = 5;
        }

        qs[idx] = {
          ...prevQ,
          question_type: value,
          options: newOptions,
          correct_answer: newCorrectAnswer,
          marks: newMarks
        };
      } else {
        qs[idx] = { ...qs[idx], [field]: value };
      }
      return { ...f, questions: qs };
    });
  };

  const updateOption = (qIdx, oIdx, value) => {
    setForm(f => {
      const qs = [...f.questions];
      const opts = [...(qs[qIdx].options || ['', '', '', ''])];
      opts[oIdx] = value;
      qs[qIdx] = { ...qs[qIdx], options: opts };
      return { ...f, questions: qs };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (isPastTime(form.start_time)) {
      alert('Past date/time cannot be selected. Please choose a valid upcoming time.');
      return;
    }
    if (isEndTimeInvalid(form.start_time, form.end_time)) {
      alert('End time must be after the start time.');
      return;
    }
    const payload = {
      ...form,
      total_marks: parseFloat(form.total_marks) || 0,
      duration_minutes: parseInt(form.duration_minutes) || 30,
      questions: form.questions.map(q => ({
        ...q,
        marks: parseFloat(q.marks) || 0
      }))
    };
    try {
      await api.post('/teacher/exams', payload);
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
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm flex items-center gap-2">
            <HiOutlinePlus className="w-4 h-4" /> Add Exam
          </button>
        )}
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
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  className="form-input"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Total Marks"
                  value={form.total_marks ?? ''}
                  onChange={e => setForm({ ...form, total_marks: e.target.value === '' ? '' : (parseFloat(e.target.value) >= 0 ? e.target.value : 0) })}
                  style={{ width: '100%', paddingRight: 60 }}
                />
                <span style={{ position: 'absolute', right: 14, fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary, #94a3b8)', pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>Marks</span>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Duration"
                  value={form.duration_minutes}
                  onChange={e => {
                    const mins = parseInt(e.target.value) || 0;
                    setForm(prev => {
                      const updated = { ...prev, duration_minutes: mins };
                      if (prev.start_time && mins > 0) {
                        updated.end_time = calculateEndTime(prev.start_time, mins);
                      }
                      return updated;
                    });
                  }}
                  style={{ width: '100%', paddingRight: 46 }}
                />
                <span style={{ position: 'absolute', right: 14, fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary, #94a3b8)', pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>Min</span>
              </div>
              <div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    className="form-input"
                    type="datetime-local"
                    min={getMinDateTime()}
                    value={form.start_time}
                    onChange={e => handleDateTimeChange('start_time', e)}
                    onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                    required
                    style={{
                      width: '100%',
                      paddingRight: 75,
                      borderColor: isPastTime(form.start_time) ? '#ef4444' : undefined
                    }}
                  />
                  <span style={{ position: 'absolute', right: 14, fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary, #94a3b8)', pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>Start Time</span>
                </div>
                {isPastTime(form.start_time) && (
                  <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block', fontWeight: 600 }}>
                    ⚠️ Past date/time cannot be selected.
                  </span>
                )}
              </div>
              <div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    className="form-input"
                    type="datetime-local"
                    min={form.start_time || getMinDateTime()}
                    value={form.end_time}
                    onChange={e => handleDateTimeChange('end_time', e)}
                    onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                    required
                    style={{
                      width: '100%',
                      paddingRight: 70,
                      borderColor: isEndTimeInvalid(form.start_time, form.end_time) ? '#ef4444' : undefined
                    }}
                  />
                  <span style={{ position: 'absolute', right: 14, fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary, #94a3b8)', pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>End Time</span>
                </div>
                {isEndTimeInvalid(form.start_time, form.end_time) && (
                  <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block', fontWeight: 600 }}>
                    ⚠️ End time must be after the start time.
                  </span>
                )}
              </div>
            </div>

            <div style={{ paddingTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <h4 className="text-sm font-semibold text-primary-400">Questions</h4>
                <div style={{ position: 'relative' }}>
                  <input type="file" accept=".csv" onChange={handleFileUpload} style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer' }} title="Upload CSV Sheet" />
                  <button type="button" style={{ padding: '6px 12px', background: 'var(--bg-surface-2, #e2e8f0)', color: 'var(--text-secondary, #475569)', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer', border: '1px solid var(--border-light, #cbd5e1)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                    Upload CSV Sheet
                  </button>
                </div>
              </div>

              {/* Question Type Selection Tabs under CSV Sheet */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10, padding: '10px 14px', background: 'var(--bg-surface-2, #f8fafc)', borderRadius: 10, border: '1px solid var(--border-light, #e2e8f0)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary, #64748b)' }}>Question Type:</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { id: 'mcq', label: 'MCQ' },
                      { id: 'true_false', label: 'True/False' },
                      { id: 'subjective', label: 'Subjective' },
                    ].map(t => {
                      const isActive = activeQuestionType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setActiveQuestionType(t.id);
                            if (form.questions.length === 1) {
                              updateQuestion(0, 'question_type', t.id);
                            }
                          }}
                          style={{
                            padding: '5px 14px',
                            borderRadius: 7,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: isActive ? '1px solid #6366f1' : '1px solid var(--border-input, #cbd5e1)',
                            background: isActive ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'var(--bg-card, #ffffff)',
                            color: isActive ? '#ffffff' : 'var(--text-primary, #334155)',
                            transition: 'all 0.15s ease',
                            boxShadow: isActive ? '0 2px 6px rgba(99, 102, 241, 0.25)' : 'none'
                          }}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => addQuestion(activeQuestionType)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid #6366f1',
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <HiOutlinePlus className="w-3.5 h-3.5" /> Add New {activeQuestionType === 'mcq' ? 'MCQ' : activeQuestionType === 'true_false' ? 'True/False' : 'Subjective'}
                </button>
              </div>
              {form.questions.map((q, qi) => (
                <div key={qi} style={{ border: '1px solid var(--border-light, #e2e8f0)', background: 'var(--bg-surface-2, #f8fafc)', borderRadius: 14, padding: '22px 24px', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 6 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--text-primary, #1e293b)' }}>Q{qi + 1}.</span>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: q.question_type === 'mcq' ? '#6366f1' : q.question_type === 'true_false' ? '#059669' : '#d97706',
                        background: q.question_type === 'mcq' ? 'rgba(99, 102, 241, 0.12)' : q.question_type === 'true_false' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        padding: '3px 9px',
                        borderRadius: 6,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        {q.question_type === 'mcq' ? 'Multiple Choice' : q.question_type === 'true_false' ? 'True / False' : 'Subjective'}
                      </span>
                    </div>

                    {form.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qi)}
                        style={{
                          padding: '5px 9px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s'
                        }}
                        title="Remove Question"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Question Textarea */}
                  <textarea
                    className="form-input h-16 resize-none"
                    style={{ marginBottom: 12 }}
                    placeholder={q.question_type === 'subjective' ? "Enter subjective / descriptive question text here..." : "Question text..."}
                    value={q.question_text}
                    onChange={e => updateQuestion(qi, 'question_text', e.target.value)}
                    required
                  />

                  {/* Format 1: MCQ Options & Correct Answer */}
                  {q.question_type === 'mcq' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(q.options || ['', '', '', '']).map((opt, oi) => (
                          <div key={oi} style={{ position: 'relative' }}>
                            <input
                              className="form-input text-xs py-2"
                              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                              value={opt}
                              onChange={e => updateOption(qi, oi, e.target.value)}
                              style={{ paddingLeft: 34 }}
                            />
                            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: '#6366f1', pointerEvents: 'none' }}>
                              {String.fromCharCode(65 + oi)}.
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginTop: 2 }}>
                        <select
                          className="form-input text-xs py-2"
                          value={q.correct_answer}
                          onChange={e => updateQuestion(qi, 'correct_answer', e.target.value)}
                          required
                        >
                          <option value="">Select Correct Answer Option *</option>
                          {(q.options || []).map((opt, oi) => (
                            <option key={oi} value={opt || `Option ${String.fromCharCode(65 + oi)}`}>
                              Option {String.fromCharCode(65 + oi)}: {opt ? (opt.length > 28 ? opt.substring(0, 28) + '...' : opt) : `(Option ${String.fromCharCode(65 + oi)})`}
                            </option>
                          ))}
                        </select>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            className="form-input text-xs py-2"
                            type="number"
                            step="any"
                            min="0"
                            placeholder="Marks (e.g. 1, 0.5)"
                            value={q.marks ?? ''}
                            onChange={e => updateQuestion(qi, 'marks', e.target.value === '' ? '' : (parseFloat(e.target.value) >= 0 ? e.target.value : 0))}
                            style={{ width: '100%', paddingRight: 50 }}
                            required
                          />
                          <span style={{ position: 'absolute', right: 12, fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary, #94a3b8)', pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>Marks</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Format 2: True / False */}
                  {q.question_type === 'true_false' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginTop: 6 }}>
                      <select
                        className="form-input text-xs py-2"
                        value={q.correct_answer}
                        onChange={e => updateQuestion(qi, 'correct_answer', e.target.value)}
                        required
                      >
                        <option value="">Select Correct Answer (True / False) *</option>
                        <option value="True">True</option>
                        <option value="False">False</option>
                      </select>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          className="form-input text-xs py-2"
                          type="number"
                          step="any"
                          min="0"
                          placeholder="Marks (e.g. 1, 0.5)"
                          value={q.marks ?? ''}
                          onChange={e => updateQuestion(qi, 'marks', e.target.value === '' ? '' : (parseFloat(e.target.value) >= 0 ? e.target.value : 0))}
                          style={{ width: '100%', paddingRight: 50 }}
                          required
                        />
                        <span style={{ position: 'absolute', right: 12, fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary, #94a3b8)', pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>Marks</span>
                      </div>
                    </div>
                  )}

                  {/* Format 3: Subjective Question */}
                  {q.question_type === 'subjective' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                      <textarea
                        className="form-input h-20 resize-none text-xs"
                        placeholder="Model / Reference Answer or Key Points for grading guidance (Optional)..."
                        value={q.correct_answer || ''}
                        onChange={e => updateQuestion(qi, 'correct_answer', e.target.value)}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            className="form-input text-xs py-2"
                            type="number"
                            step="any"
                            min="0"
                            placeholder="Question Marks (e.g. 5, 2.5)"
                            value={q.marks ?? ''}
                            onChange={e => updateQuestion(qi, 'marks', e.target.value === '' ? '' : (parseFloat(e.target.value) >= 0 ? e.target.value : 0))}
                            style={{ width: '100%', paddingRight: 50 }}
                            required
                          />
                          <span style={{ position: 'absolute', right: 12, fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary, #94a3b8)', pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>Marks</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 16, marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => addQuestion('mcq')}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}
                >
                  <HiOutlinePlus className="w-3.5 h-3.5" /> Add MCQ
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion('true_false')}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}
                >
                  <HiOutlinePlus className="w-3.5 h-3.5" /> Add True / False
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion('subjective')}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}
                >
                  <HiOutlinePlus className="w-3.5 h-3.5" /> Add Subjective
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button type="submit" className="btn btn-primary btn-sm">Create Exam</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Exams Table */}
      {!showForm && (
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
      )}

      {/* View Exam Modal */}
      {viewExam && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card animate-slide-up hide-scrollbar" style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', padding: 32, background: 'var(--bg-card, var(--bg-surface))', border: '1px solid var(--border-light)', borderRadius: 16, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                        <div key={oi} style={{ padding: 12, background: q.correct_answer === opt ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-card, var(--bg-surface))', border: `1px solid ${q.correct_answer === opt ? '#22c55e' : 'var(--border-light)'}`, borderRadius: 8 }}>
                          <span style={{ fontSize: 14, color: q.correct_answer === opt ? '#22c55e' : 'var(--text-primary)', fontWeight: q.correct_answer === opt ? 700 : 400 }}>{opt} {q.correct_answer === opt && '✓'}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.question_type === 'true_false' && (
                    <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                      {['True', 'False'].map(opt => (
                        <div key={opt} style={{ padding: '10px 20px', background: q.correct_answer === opt ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-card, var(--bg-surface))', border: `1px solid ${q.correct_answer === opt ? '#22c55e' : 'var(--border-light)'}`, borderRadius: 8 }}>
                          <span style={{ fontSize: 14, color: q.correct_answer === opt ? '#22c55e' : 'var(--text-primary)', fontWeight: q.correct_answer === opt ? 700 : 400 }}>{opt} {q.correct_answer === opt && '✓'}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.question_type === 'subjective' && (
                    <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-card, var(--bg-surface))', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
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
