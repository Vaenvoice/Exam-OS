import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Eye, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminExams = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const basePath = user?.role === 'admin' ? '/admin' : '/teacher';

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await axios.get('/api/exams');
      setExams(res.data.data);
    } catch (err) {
      console.error('Error fetching exams', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteExam = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await axios.delete(`/api/exams/${id}`);
        setExams(exams.filter(exam => exam.id !== id));
      } catch (err) {
        alert('Failed to delete exam');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="exams-page">
      <header className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1 className="page-title">Manage Exams</h1>
          <p className="page-subtitle">Create and update examination papers</p>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button 
            className="btn-primary-outline" 
            onClick={() => window.open('/api/bulk/questions/export', '_blank')}
            title="Download all questions as CSV"
          >
            Export Questions
          </button>
          <button 
            className="btn-primary-outline" 
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = async (e) => {
                const file = e.target.files[0];
                const formData = new FormData();
                formData.append('file', file);
                try {
                  await axios.post('/api/bulk/questions/import', formData);
                  alert('Questions imported successfully');
                  fetchExams();
                } catch (err) {
                  alert('Import failed');
                }
              };
              input.click();
            }}
            title="Upload questions from CSV"
          >
            Import Questions
          </button>
          <Link to={`${basePath}/exams/new`} className="btn-primary" style={{width: 'auto', padding: '0.75rem 1.5rem'}}>
            <Plus size={20} /> New Exam
          </Link>
        </div>
      </header>

      {loading ? (
        <p>Loading exams...</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Duration</th>
                <th>Questions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td>{exam.title}</td>
                  <td>{exam.duration} mins</td>
                  <td>{exam.Questions?.length || 0}</td>
                  <td className="table-actions">
                    <Link to={`${basePath}/exams/${exam.id}/questions`} className="icon-btn" title="Add/Edit Questions" style={{ color: 'var(--primary)' }}>
                      <Plus size={18} />
                      <span style={{ fontSize: '0.7rem' }}>Questions</span>
                    </Link>
                    <Link to={`${basePath}/exams/${exam.id}/edit`} className="icon-btn edit" title="Edit Exam Details">
                      <Edit2 size={18} />
                      <span style={{ fontSize: '0.7rem' }}>Details</span>
                    </Link>
                    <Link to={`${basePath}/exams/${exam.id}/assign`} className="icon-btn" title="Assign Students">
                      <UserPlus size={18} color="#4285f4" />
                    </Link>
                    <button className="icon-btn delete" onClick={() => deleteExam(exam.id)} title="Delete Exam">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No exams found. Create your first one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminExams;
