import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History as HistoryIcon, TrendingUp, Calendar, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ResultHistory = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get('/api/exams/results');
        setResults(res.data.data);
      } catch (err) {
        console.error('Error fetching history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="history-page">
      <header className="page-header">
        <h1 className="page-title">Result History</h1>
        <p className="page-subtitle">Track performance over time</p>
      </header>

      {loading ? (
        <p>Loading your results...</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Exam Title</th>
                {isAdmin && <th>Student</th>}
                <th>Date Submitted</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id}>
                  <td>{result.Exam?.title || 'Deleted Exam'}</td>
                  {isAdmin && (
                    <td>
                      <div style={{display: 'flex', alignItems: 'center'}}>
                        <User size={14} style={{marginRight: '0.5rem', color: 'var(--text-muted)'}} />
                        {result.User?.username || 'Unknown User'}
                      </div>
                    </td>
                  )}
                  <td>{result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : 'N/A'}</td>
                  <td>{result.score} / {result.totalQuestions}</td>
                  <td>{result.percentage?.toFixed(1) || 0}%</td>
                  <td>
                    <span className={`score-badge ${result.percentage >= 50 ? 'pass' : 'fail'}`}>
                      {result.percentage >= 50 ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? "6" : "5"} style={{textAlign: 'center', padding: '2rem'}}>No exam attempts recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResultHistory;
