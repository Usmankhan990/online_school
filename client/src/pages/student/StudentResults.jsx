import { useState, useEffect } from 'react';
import api from '../../services/api';
import { HiOutlineChartBar, HiOutlineAcademicCap } from 'react-icons/hi';

export default function StudentResults() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    api.get('/student/results')
      .then(res => setResults(res.data.results))
      .catch(console.error);
  }, []);

  const gradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'text-emerald-400';
    if (grade === 'B') return 'text-blue-400';
    if (grade === 'C') return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">📊 My Results</h1>
        <p className="text-dark-400 text-sm mt-1">View your exam results and grades</p>
      </div>

      {results.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HiOutlineChartBar className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400">No results yet. Take an exam first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map(result => (
            <div key={result.id} className="glass-card p-5 animate-slide-up">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-500/15 flex items-center justify-center">
                    <HiOutlineAcademicCap className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{result.exam?.title}</h3>
                    <p className="text-dark-400 text-xs">{result.exam?.course?.subject?.name} • {result.exam?.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-center">
                  <div>
                    <p className="text-xs text-dark-500">Obtained</p>
                    <p className="text-lg font-bold text-white">{result.total_obtained}/{result.exam?.total_marks}</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-500">Percentage</p>
                    <p className="text-lg font-bold text-primary-400">{parseFloat(result.percentage).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-500">Grade</p>
                    <p className={`text-2xl font-bold ${gradeColor(result.grade)}`}>{result.grade}</p>
                  </div>
                  <span className={`badge ${result.status === 'graded' ? 'badge-success' : 'badge-warning'}`}>{result.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
