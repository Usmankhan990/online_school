import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { HiOutlineUpload, HiOutlineCheckCircle, HiOutlineArrowLeft } from 'react-icons/hi';

const fallbackClasses = [
  { id: 1, display_name: 'KG / Pre-1' },
  { id: 2, display_name: 'Class 1' },
  { id: 3, display_name: 'Class 2' },
  { id: 4, display_name: 'Class 3' },
  { id: 5, display_name: 'Class 4' },
  { id: 6, display_name: 'Class 5' },
  { id: 7, display_name: 'Class 6' },
  { id: 8, display_name: 'Class 7' },
  { id: 9, display_name: 'Class 8' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm_password: '',
    father_name: '', mother_name: '', father_cnic: '',
    contact_number_1: '', contact_number_2: '',
    class_id: '', medium: 'English', date_of_birth: '', address: '',
  });
  const [documents, setDocuments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/classes')
      .then(res => setClasses(res.data.classes || fallbackClasses))
      .catch(() => setClasses(fallbackClasses));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'father_cnic') {
      let v = value.replace(/[^0-9]/g, '');
      if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
      if (v.length > 13) v = v.slice(0, 13) + '-' + v.slice(13);
      if (v.length > 15) v = v.slice(0, 15);
      setForm(f => ({ ...f, [name]: v }));
      return;
    }

    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (!/^\d{5}-\d{7}-\d{1}$/.test(form.father_cnic)) {
      return setError('Father CNIC format must be: 00000-0000000-0');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key !== 'confirm_password') formData.append(key, val);
      });
      documents.forEach(file => formData.append('documents', file));

      const res = await api.post('/auth/register/student', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(`${res.data.message} Roll Number: ${res.data.roll_number}`);
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="auth-page">
        <section className="auth-success-card">
          <HiOutlineCheckCircle className="auth-success-icon" />
          <h1>Registration Submitted</h1>
          <p>{success}</p>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-aside">
          <Link to="/" className="auth-back-link">
            <HiOutlineArrowLeft />
            Home
          </Link>
          <div className="auth-brand">
            <div className="auth-brand-mark">U</div>
            <div>
              <h1>Student Admission</h1>
              <p>Usman Online School</p>
            </div>
          </div>
          <div className="auth-aside-copy">
            <h2>KG to 8th Punjab Board admissions</h2>
            <p>Fill the student and guardian details carefully. Your application will be reviewed by the school admin.</p>
          </div>
          <div className="auth-note">
            Documents are optional, but school leaving certificates help the admission team verify records faster.
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-form-header">
            <div>
              <p className="auth-eyebrow">Admission Form</p>
              <h2>Apply for Admission</h2>
            </div>
            <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <FormSection title="Student Information" tone="primary">
              <Field label="Full Name *">
                <input name="full_name" value={form.full_name} onChange={handleChange} className="form-input" placeholder="Student full name" required />
              </Field>
              <Field label="Email *">
                <input name="email" type="email" value={form.email} onChange={handleChange} className="form-input" placeholder="student@email.com" required />
              </Field>
              <Field label="Password *">
                <input name="password" type="password" value={form.password} onChange={handleChange} className="form-input" placeholder="Min 6 characters" required />
              </Field>
              <Field label="Confirm Password *">
                <input name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange} className="form-input" placeholder="Confirm password" required />
              </Field>
              <Field label="Date of Birth">
                <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} className="form-input" />
              </Field>
            </FormSection>

            <FormSection title="Parent / Guardian Information" tone="accent">
              <Field label="Father Name *">
                <input name="father_name" value={form.father_name} onChange={handleChange} className="form-input" placeholder="Father's full name" required />
              </Field>
              <Field label="Mother Name *">
                <input name="mother_name" value={form.mother_name} onChange={handleChange} className="form-input" placeholder="Mother's full name" required />
              </Field>
              <Field label="Father CNIC *">
                <input name="father_cnic" value={form.father_cnic} onChange={handleChange} className="form-input" placeholder="00000-0000000-0" required />
              </Field>
              <Field label="Contact Number 1 *">
                <input name="contact_number_1" value={form.contact_number_1} onChange={handleChange} className="form-input" placeholder="03001234567" required />
              </Field>
              <Field label="Contact Number 2">
                <input name="contact_number_2" value={form.contact_number_2} onChange={handleChange} className="form-input" placeholder="Optional" />
              </Field>
            </FormSection>

            <FormSection title="Academic Information" tone="warm">
              <Field label="Class *">
                <select name="class_id" value={form.class_id} onChange={handleChange} className="form-select" required>
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
                </select>
              </Field>
              <Field label="Medium *">
                <select name="medium" value={form.medium} onChange={handleChange} className="form-select">
                  <option value="English">English Medium</option>
                  <option value="Urdu">Urdu Medium</option>
                </select>
              </Field>
              <Field label="Address" wide>
                <input name="address" value={form.address} onChange={handleChange} className="form-input" placeholder="Home address" />
              </Field>
            </FormSection>

            <div className="auth-upload">
              <div className="auth-upload-icon"><HiOutlineUpload /></div>
              <div>
                <h3>Documents Upload</h3>
                <p>PDF, JPG, PNG. Max 50MB each, up to 5 files.</p>
              </div>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setDocuments([...e.target.files])}
                id="doc-upload"
              />
              <label htmlFor="doc-upload" className="btn btn-secondary btn-sm">Choose Files</label>
              {documents.length > 0 && (
                <div className="auth-file-list">
                  {Array.from(documents).map((file, i) => (
                    <span key={i}>{file.name}</span>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg auth-submit">
              {loading ? 'Submitting...' : 'Submit Admission Application'}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

function FormSection({ title, tone, children }) {
  return (
    <section className="auth-section">
      <h3 className={`auth-section-title ${tone}`}>{title}</h3>
      <div className="auth-grid">{children}</div>
    </section>
  );
}

function Field({ label, wide, children }) {
  return (
    <label className={wide ? 'auth-field wide' : 'auth-field'}>
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}
