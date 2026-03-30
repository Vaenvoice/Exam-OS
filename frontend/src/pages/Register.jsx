import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await register(formData);
      if (res.token) {
        // This only happens for auto-approved admins (if any)
        if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (res.user.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setMessage(res.message || 'Registration successful. Waiting for admin approval.');
        setFormData({ username: '', email: '', password: '', role: 'student' });
        // Ensure we don't redirect
        return;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: '500' }}>
          <span style={{ color: '#4285F4' }}>E</span>
          <span style={{ color: '#EA4335' }}>x</span>
          <span style={{ color: '#FBBC05' }}>a</span>
          <span style={{ color: '#34A853' }}>m</span>
          <span style={{ color: '#5f6368', marginLeft: '4px' }}>OS</span>
        </div>
        <h2 className="auth-title">Create your Account</h2>
        <p className="auth-subtitle">Continue to ExamOS</p>
        
        {error && <div className="error-message" style={{color: '#ef4444', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
        {message && <div className="success-message" style={{color: '#34a853', marginBottom: '1rem', textAlign: 'center', padding: '0.75rem', background: '#e6f4ea', borderRadius: '4px'}}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select 
              className="form-input"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Register</button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
