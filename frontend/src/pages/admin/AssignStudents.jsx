import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AssignStudents = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignedStudentIds, setAssignedStudentIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [examRes, studentsRes, assignedRes] = await Promise.all([
        axios.get(`/api/exams/${id}`),
        axios.get('/api/users'), // This might need filtering for student role if getUsers doesn't
        axios.get(`/api/exams/${id}/assigned-students`)
      ]);

      setExam(examRes.data.data);
      // Filter the full list to only get students
      const onlyStudents = (studentsRes.data?.data || []).filter(u => u.role === 'student');
      setStudents(onlyStudents);
      setAssignedStudentIds(assignedRes.data.data.map(s => s.id));
    } catch (err) {
      console.error(err);
      alert('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (studentId) => {
    if (assignedStudentIds.includes(studentId)) {
      setAssignedStudentIds(assignedStudentIds.filter(id => id !== studentId));
    } else {
      setAssignedStudentIds([...assignedStudentIds, studentId]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`/api/exams/${id}/assign`, { studentIds: assignedStudentIds });
      alert('Assignments saved successfully');
      const basePath = user.role === 'admin' ? '/admin' : '/teacher';
      navigate(`${basePath}/exams`);
    } catch (err) {
      alert('Failed to save assignments');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-lg">Loading assignments...</div>;

  const basePath = user.role === 'admin' ? '/admin' : '/teacher';

  return (
    <div className="assign-students-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="page-title">Assign Students: {exam?.title}</h1>
        <p className="page-subtitle">Select students who are allowed to take this exam</p>
      </header>

      <div className="card shadow-glass" style={{maxWidth: '800px', margin: '0 auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
          <h2 className="section-title" style={{margin: 0}}>Students List ({students.length})</h2>
          <span className="text-muted" style={{fontSize: '0.9rem'}}>
            {assignedStudentIds.length} students selected
          </span>
        </div>

        <div className="students-selection-list" style={{maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--glass-border)', borderRadius: '8px'}}>
          {students.map(student => (
            <div 
              key={student.id} 
              className={`student-select-item ${assignedStudentIds.includes(student.id) ? 'selected' : ''}`}
              onClick={() => toggleStudent(student.id)}
              style={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '1rem',
                borderBottom: '1px solid var(--glass-border)',
                cursor: 'pointer',
                transition: 'background 0.2s',
                backgroundColor: assignedStudentIds.includes(student.id) ? '#f0f7ff' : 'transparent'
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <div className="user-avatar" style={{width: '40px', height: '40px', borderRadius: '50%', background: '#f1f3f4', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {student.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{fontWeight: '500'}}>{student.username}</div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{student.email}</div>
                </div>
              </div>
              {assignedStudentIds.includes(student.id) ? (
                <CheckCircle size={24} color="#34a853" />
              ) : (
                <div style={{width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #dadce0'}}></div>
              )}
            </div>
          ))}
          {students.length === 0 && <div className="p-8 text-center text-muted">No students found.</div>}
        </div>

        <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'flex-end'}}>
          <button 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={saving || loading}
            style={{padding: '0.75rem 2rem'}}
          >
            {saving ? 'Saving...' : 'Save Assignments'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignStudents;
