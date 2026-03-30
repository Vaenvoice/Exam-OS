import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Trophy, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

const ResultPage = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get('/api/exams/results');
        const found = (res.data.data || []).find(r => r.id === id);
        setResult(found);
      } catch (err) {
        console.error('Error fetching result', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) return <div>Loading results...</div>;
  if (!result) return <div>Result not found.</div>;

  const isPass = (result.percentage || 0) >= 50;

  return (
    <div className="result-page">
      <div className="result-card card shadow-glass text-center">
        <div className={`result-icon ${isPass ? 'success' : 'fail'}`}>
          {isPass ? <Trophy size={64} /> : <CheckCircle2 size={64} style={{color: '#94a3b8'}} />}
        </div>
        <h1 className="result-title">{isPass ? 'Congratulations!' : 'Exam Completed'}</h1>
        <p className="result-subtitle">You have completed the <strong>{result.Exam?.title || 'the'}</strong> exam.</p>

        <div className="result-stats">
          <div className="res-stat-item">
            <span className="res-label">Score</span>
            <span className="res-value">{result.score} / {result.totalQuestions}</span>
          </div>
          <div className="res-stat-item">
            <span className="res-label">Percentage</span>
            <span className="res-value">{result.percentage?.toFixed(1) || 0}%</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${result.percentage || 0}%`, background: isPass ? 'var(--primary)' : '#ef4444'}}></div>
            </div>
          </div>
        </div>

        <div className="result-actions">
          <Link to="/student/results" className="btn-primary">
            View All Results <ArrowRight size={18} />
          </Link>
          <Link to="/student/dashboard" className="btn-secondary">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
