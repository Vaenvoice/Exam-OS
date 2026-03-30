import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, resultsRes] = await Promise.all([
          axios.get('/api/exams'),
          axios.get('/api/exams/results')
        ]);
        setExams(examsRes.data.data);
        setResults(resultsRes.data.data);
      } catch (err) {
        console.error('Error fetching student data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Available Exams', value: exams.length, icon: <Play className="text-primary" /> },
    { label: 'Exams Completed', value: results.length, icon: <CheckCircle className="text-green" /> }
  ];

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1 className="page-title">Student Dashboard</h1>
        <p className="page-subtitle">Ready for your next challenge?</p>
      </header>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
        <section className="dashboard-section card shadow-glass">
          <h2 className="section-title" style={{marginBottom: '1.5rem'}}>Recent Exams</h2>
          <div className="exam-list">
            {exams.slice(0, 3).map(exam => (
              <div key={exam.id} className="list-item" style={{display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--glass-border)'}}>
                <div>
                  <h4 style={{margin: 0}}>{exam.title}</h4>
                  <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}><Clock size={12} /> {exam.duration} mins</span>
                </div>
                <Link to={`/student/exams/${exam.id}`} className="btn-small">Start</Link>
              </div>
            ))}
            {exams.length === 0 && <p className="text-muted">No exams available yet.</p>}
          </div>
        </section>

        <section className="dashboard-section card shadow-glass">
          <h2 className="section-title" style={{marginBottom: '1.5rem'}}>Recent Results</h2>
          <div className="result-list">
            {results.slice(0, 3).map(result => (
              <div key={result.id} className="list-item" style={{display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--glass-border)'}}>
                <div>
                  <h4 style={{margin: 0}}>{result.Exam?.title || 'Unknown Exam'}</h4>
                  <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <span className={`score-badge ${result.percentage >= 50 ? 'pass' : 'fail'}`}>
                  {result.percentage?.toFixed(0) || 0}%
                </span>
              </div>
            ))}
            {results.length === 0 && <p className="text-muted">No results found.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
