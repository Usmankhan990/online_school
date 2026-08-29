import { useState, useEffect } from 'react';
import api from '../../services/api';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineCheck } from 'react-icons/hi';

export default function TeacherExams() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ course_id: '', title: '', type: 'quiz', total_marks: 10, duration_minutes: 30, questions: [{ question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '', marks: 1 }] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teacher/exams').then(res => setExams(res.data.exams)).catch(console.error).finally(() => setLoading(false));
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
      api.get('/teacher/exams').then(res => setExams(res.data.exams));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const handlePublish = async (id) => {
    try {
      await api.put(`/teacher/exams/${id}/publish`);
      api.get('/teacher/exams').then(res => setExams(res.data.exams));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Exams & Papers</h1>
          <p className="text-dark-400 text-sm mt-1">Create online exams and papers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-glow flex items-center gap-2 text-sm">
          <HiOutlinePlus className="w-4 h-4" /> Create Exam
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Exam</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select className="input-dark" value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})} required>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <input className="input-dark" placeholder="Exam Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              <select className="input-dark" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="quiz">Quiz</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="paper">Paper</option>
              </select>
              <input className="input-dark" type="number" placeholder="Total Marks" value={form.total_marks} onChange={e => setForm({...form, total_marks: parseInt(e.target.value)})} />
              <input className="input-dark" type="number" placeholder="Duration (min)" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: parseInt(e.target.value)})} />
            </div>

            <div className="border-t border-dark-800 pt-4">
              <h4 className="text-sm font-semibold text-primary-400 mb-3">Questions</h4>
              {form.questions.map((q, qi) => (
                <div key={qi} className="mb-4 p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-dark-400 font-medium">Q{qi + 1}</span>
                    <select className="input-dark w-auto text-xs py-1 px-2" value={q.question_type} onChange={e => updateQuestion(qi, 'question_type', e.target.value)}>
                      <option value="mcq">MCQ</option>
                      <option value="true_false">True/False</option>
                      <option value="subjective">Subjective</option>
                    </select>
                  </div>
                  <textarea className="input-dark h-16 resize-none mb-2" placeholder="Question text..." value={q.question_text} onChange={e => updateQuestion(qi, 'question_text', e.target.value)} />
                  {(q.question_type === 'mcq') && (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {q.options.map((opt, oi) => (
                        <input key={oi} className="input-dark text-xs py-2" placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt} onChange={e => updateOption(qi, oi, e.target.value)} />
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input-dark text-xs py-2" placeholder="Correct Answer" value={q.correct_answer} onChange={e => updateQuestion(qi, 'correct_answer', e.target.value)} />
                    <input className="input-dark text-xs py-2" type="number" placeholder="Marks" value={q.marks} onChange={e => updateQuestion(qi, 'marks', parseInt(e.target.value))} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addQuestion} className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
                <HiOutlinePlus className="w-4 h-4" /> Add Question
              </button>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-glow text-sm">Create Exam</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-dark-800 text-dark-300 text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Exams List */}
      <div className="space-y-3">
        {exams.map(exam => (
          <div key={exam.id} className="glass-card p-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400">
                  <HiOutlinePencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{exam.title}</h3>
                  <p className="text-dark-400 text-xs">{exam.course?.class?.display_name} • {exam.course?.subject?.name} • {exam.questions?.length || 0} questions • {exam.total_marks} marks</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${exam.is_published ? 'badge-success' : 'badge-warning'}`}>
                  {exam.is_published ? 'Published' : 'Draft'}
                </span>
                <span className="badge badge-info">{exam.attempts?.length || 0} attempts</span>
                {!exam.is_published && (
                  <button onClick={() => handlePublish(exam.id)} className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs font-medium flex items-center gap-1">
                    <HiOutlineCheck className="w-3 h-3" /> Publish
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {exams.length === 0 && !loading && (
          <div className="glass-card p-12 text-center">
            <HiOutlinePencil className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">No exams yet. Create your first exam!</p>
          </div>
        )}
      </div>
    </div>
  );
}
