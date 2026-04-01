import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EditExam = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    startWindow: '',
    endWindow: '',
    randomizeQuestions: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const basePath = user.role === 'admin' ? '/admin' : '/teacher';

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`/api/exams/${id}`);
        const { title, description, duration, startWindow, endWindow, randomizeQuestions } = res.data.data;
        // Format dates for datetime-local input (Local time YYYY-MM-DDThh:mm)
        const formatForInput = (d) => {
          if (!d) return '';
          const date = new Date(d);
          if (isNaN(date.getTime())) return '';
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };
        
        setFormData({ 
          title, 
          description, 
          duration,
          startWindow: formatForInput(startWindow),
          endWindow: formatForInput(endWindow),
          randomizeQuestions: !!randomizeQuestions
        });
      } catch (err) {
        alert('Failed to fetch exam details');
        navigate(`${basePath}/exams`);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id, navigate, basePath]);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
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
      await axios.put(`/api/exams/${id}`, dataToSubmit);
      navigate(`${basePath}/exams`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update exam');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading exam details...</div>;

  return (
    <div className="edit-exam-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="page-title">Edit Exam</h1>
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
              <label className="form-label">Start Window</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={formData.startWindow}
                onChange={(e) => setFormData({...formData, startWindow: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Window</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={formData.endWindow}
                onChange={(e) => setFormData({...formData, endWindow: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save size={18} style={{marginRight: '0.5rem'}} />
            {saving ? 'Saving...' : 'Update Exam'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditExam;
