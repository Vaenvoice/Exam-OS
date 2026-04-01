import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CreateExam = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const toUTC = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date.toISOString();
      };
      
      const dataToSubmit = {
        ...formData,
        startWindow: toUTC(formData.startWindow),
        endWindow: toUTC(formData.endWindow)
      };
      const res = await axios.post('/api/exams', dataToSubmit);
      const examId = res.data.data.id;
      const basePath = user.role === 'admin' ? '/admin' : '/teacher';
      navigate(`${basePath}/exams/${examId}/questions`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-exam-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="page-title">Create New Exam</h1>
      </header>

      <div className="card shadow-glass">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Exam Title</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g., Mathematics Midterm"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-input" 
              rows="4"
              placeholder="Detailed information about the exam..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
          <div className="form-row" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group">
              <label className="form-label">Duration (Minutes)</label>
              <input 
                type="number" 
                className="form-input" 
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                required 
              />
            </div>
            <div className="form-group" style={{display: 'flex', alignItems: 'center', marginTop: '2rem'}}>
              <label className="form-label" style={{marginRight: '1rem', marginBottom: 0}}>Randomize Questions</label>
              <input 
                type="checkbox" 
                checked={formData.randomizeQuestions}
                onChange={(e) => setFormData({...formData, randomizeQuestions: e.target.checked})}
              />
            </div>
          </div>

          <div className="form-row" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group">
              <label className="form-label">Start Window (Students can start after this)</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={formData.startWindow}
                onChange={(e) => setFormData({...formData, startWindow: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Window (Students cannot start after this)</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={formData.endWindow}
                onChange={(e) => setFormData({...formData, endWindow: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Create Exam'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;
