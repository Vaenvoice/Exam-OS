import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Users, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    exams: 0,
    results: 0,
    students: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/exams/dashboard/stats');
        setStats({
          exams: res.data.data.exams,
          results: res.data.data.results,
          students: res.data.data.students
        });
      } catch (err) {
        console.error('Error fetching stats', err);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Exams', value: stats.exams, icon: <BookOpen className="text-primary" />, color: 'blue' },
    { label: 'Total Results', value: stats.results, icon: <FileText className="text-purple" />, color: 'purple' },
    { label: 'Total Students', value: stats.students, icon: <Users className="text-green" />, color: 'green' }
  ];

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1 className="page-title">Teacher Dashboard</h1>
        <p className="page-subtitle">Manage your exams and view student performance</p>
      </header>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-info">
              <span className="stat-label">{card.label}</span>
              <span className="stat-value">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
        </div>
        <div className="actions-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem'}}>
          <button className="btn-primary-outline" onClick={() => navigate('/teacher/exams/new')} style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'}}>
            <Plus size={32} />
            <span>Create New Exam</span>
          </button>
          <button className="btn-primary-outline" onClick={() => navigate('/teacher/exams')} style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'}}>
            <BookOpen size={32} />
            <span>Manage Exams</span>
          </button>
          <button className="btn-primary-outline" onClick={() => navigate('/teacher/results')} style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'}}>
            <FileText size={32} />
            <span>View All Results</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default TeacherDashboard;
