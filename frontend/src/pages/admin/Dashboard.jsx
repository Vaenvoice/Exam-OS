import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Users, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const AdminDashboard = () => {
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

  const chartData = [
    { name: 'Exams', value: stats.exams, color: '#4285F4' },
    { name: 'Results', value: stats.results, color: '#EA4335' },
    { name: 'Students', value: stats.students, color: '#34A853' }
  ];

  const statCards = [
    { label: 'Total Exams', value: stats.exams, icon: <BookOpen className="text-primary" /> },
    { label: 'Total Results', value: stats.results, icon: <FileText style={{ color: '#EA4335' }} /> },
    { label: 'Active Students', value: stats.students, icon: <Users style={{ color: '#34A853' }} /> }
  ];

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Overview of system activity and management</p>
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

      <div className="dashboard-row" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card chart-card">
          <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>System Engagement Overview</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
        </div>
        <div className="actions-grid">
          <button className="action-card btn-primary-outline" onClick={() => navigate('/admin/exams/new')}>
            <Plus size={24} />
            <span>Create New Exam</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
