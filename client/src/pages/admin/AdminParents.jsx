import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminParents() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const { data } = await api.get('/admin/parents');
      setParents(data.parents || []);
    } catch (err) {
      setError('Failed to load parents.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <h1>👨‍👩‍👧‍👦 Parents Management</h1>
        <p>View all registered parents and their details.</p>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <h2 style={{ padding: 20, borderBottom: '1px solid var(--border-color)', margin: 0, fontSize: 16 }}>Registered Parents</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</div>
        ) : error ? (
          <div style={{ padding: 16, background: '#fee2e2', color: '#b91c1c', margin: 20, borderRadius: 8 }}>{error}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Relation</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>CNIC</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Occupation</th>
                </tr>
              </thead>
              <tbody>
                {parents.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>No parents found.</td>
                  </tr>
                ) : (
                  parents.map(parent => (
                    <tr key={parent.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 500 }}>{parent.full_name}</td>
                      <td style={{ padding: '12px 20px' }}>{parent.email}</td>
                      <td style={{ padding: '12px 20px' }}>{parent.parent_profile?.relation || '-'}</td>
                      <td style={{ padding: '12px 20px' }}>{parent.parent_profile?.cnic || '-'}</td>
                      <td style={{ padding: '12px 20px' }}>{parent.parent_profile?.occupation || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
