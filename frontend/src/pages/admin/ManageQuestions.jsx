import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ManageQuestions = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A'
  });

  useEffect(() => {
    fetchExam();
  }, [id]);

  const fetchExam = async () => {
    try {
      const res = await axios.get(`/api/exams/${id}`);
      setExam(res.data.data);
      setQuestions(res.data.data.Questions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/api/exams/${id}/questions`, newQuestion);
      setQuestions([...questions, res.data.data]);
      setNewQuestion({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A'
      });
    } catch (err) {
      alert('Failed to add question');
    }
  };

  const basePath = user.role === 'admin' ? '/admin' : '/teacher';

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'code-block'],
      ['clean']
    ],
  };

  return (
    <div className="manage-questions-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate(`${basePath}/exams`)}>
          <ArrowLeft size={20} /> Back to Exams
        </button>
        <h1 className="page-title">Manage Questions: {exam?.title}</h1>
      </header>

      <div className="grid-2-col" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
        <section className="add-question-section card">
          <h2 className="section-title">Add New Question</h2>
          <form onSubmit={handleAddQuestion}>
            <div className="form-group">
              <label className="form-label">Question Text (HTML/Rich Text Supported)</label>
              <textarea 
                className="form-input"
                rows="6"
                value={newQuestion.questionText}
                onChange={(e) => setNewQuestion({...newQuestion, questionText: e.target.value})}
                placeholder="Enter question text here..."
              />
            </div>
            <div className="options-input-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              {['A', 'B', 'C', 'D'].map(opt => (
                <div key={opt} className="form-group">
                  <label className="form-label">Option {opt}</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={newQuestion[`option${opt}`]}
                    onChange={(e) => setNewQuestion({...newQuestion, [`option${opt}`]: e.target.value})}
                    required
                  />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Correct Answer</label>
              <select 
                className="form-input"
                value={newQuestion.correctAnswer}
                onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">Add Question</button>
          </form>
        </section>

        <section className="questions-list-section card">
          <h2 className="section-title">Existing Questions ({questions.length})</h2>
          <div className="questions-scroll" style={{maxHeight: '600px', overflowY: 'auto'}}>
            {questions.map((q, index) => (
              <div key={q.id} className="question-item" style={{padding: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <strong>Q{index + 1}. <span dangerouslySetInnerHTML={{ __html: q.questionText }}></span></strong>
                  <span className="badge-primary">{q.correctAnswer}</span>
                </div>
                <div className="options-preview" style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>
                  A: {q.optionA} | B: {q.optionB} | C: {q.optionC} | D: {q.optionD}
                </div>
              </div>
            ))}
            {questions.length === 0 && <p className="text-muted">No questions added yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ManageQuestions;
