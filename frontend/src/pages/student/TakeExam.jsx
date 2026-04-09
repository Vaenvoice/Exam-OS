import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, Send, AlertTriangle, Save, Shield } from 'lucide-react';
import { useAutosave, useLogProctoring, useSubmitExam, useExamDraft } from '../../hooks/useExamQueries';

const AUTOSAVE_INTERVAL = 30000; // 30 seconds

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const answersRef = useRef(answers);

  // TanStack Query mutations
  const autosaveMutation = useAutosave(id);
  const proctorLogMutation = useLogProctoring(id);
  const submitMutation = useSubmitExam(id);

  // Keep ref in sync with state
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Fetch exam and draft on load
  useEffect(() => {
    const fetchExamAndDraft = async () => {
      try {
        const res = await axios.get(`/api/exams/${id}`);
        const examData = res.data.data;
        
        if (!examData.Questions || examData.Questions.length === 0) {
          alert('This exam currently has no questions. Please contact your instructor.');
          navigate('/student/dashboard');
          return;
        }

        // Randomize questions
        examData.Questions = [...examData.Questions].sort(() => Math.random() - 0.5);
        setExam(examData);

        // Try to recover draft answers
        try {
          const draftRes = await axios.get(`/api/exams/${id}/draft`);
          
          let timeLeftVal;
          const now = Date.now();
          
          if (draftRes.data.data && draftRes.data.data.answers) {
            setAnswers(draftRes.data.data.answers);
            setTabSwitchCount(draftRes.data.data.tabSwitchCount || 0);
            
            // Calculate remaining time from draft startedAt
            if (draftRes.data.data.startedAt) {
              const elapsedSecs = Math.floor((now - new Date(draftRes.data.data.startedAt).getTime()) / 1000);
              timeLeftVal = Math.max(0, examData.duration * 60 - elapsedSecs);
            } else {
              timeLeftVal = examData.duration * 60;
            }
          } else {
            timeLeftVal = examData.duration * 60;
          }

          // Cap timeLeft by endWindow if it exists
          if (examData.endWindow) {
            const endWindowTime = new Date(examData.endWindow).getTime();
            if (!isNaN(endWindowTime)) {
              const endWindowRemaining = Math.floor((endWindowTime - now) / 1000);
              if (endWindowRemaining >= 0 && endWindowRemaining < timeLeftVal) {
                console.log(`[DEBUG] Capping timeLeft by endWindow: ${endWindowRemaining}s instead of ${timeLeftVal}s`);
                timeLeftVal = endWindowRemaining;
              }
            }
          }
          
          setTimeLeft(isNaN(timeLeftVal) ? examData.duration * 60 : timeLeftVal);

        } catch (err) {
          // No draft found, start fresh
          let timeLeftVal = examData.duration * 60;
          const now = Date.now();
          
          if (examData.endWindow) {
            const endWindowTime = new Date(examData.endWindow).getTime();
            if (!isNaN(endWindowTime)) {
              const endWindowRemaining = Math.floor((endWindowTime - now) / 1000);
              if (endWindowRemaining >= 0 && endWindowRemaining < timeLeftVal) {
                timeLeftVal = endWindowRemaining;
              }
            }
          }
          setTimeLeft(isNaN(timeLeftVal) ? examData.duration * 60 : timeLeftVal);
        }

        // Create initial autosave to record start time
        autosaveMutation.mutate({});

      } catch (err) {
        alert(err.response?.data?.message || 'Failed to load exam.');
        navigate('/student/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchExamAndDraft();
  }, [id, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
      return;
    }
    if (!timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Autosave every 30 seconds
  useEffect(() => {
    if (!exam) return;

    const autosaveTimer = setInterval(() => {
      const currentAnswers = answersRef.current;
      if (Object.keys(currentAnswers).length > 0) {
        autosaveMutation.mutate(currentAnswers, {
          onSuccess: (data) => {
            setLastSaved(new Date());
          }
        });
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(autosaveTimer);
  }, [exam]);

  // Tab switch detection with backend logging
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        
        // Log to backend
        proctorLogMutation.mutate({
          eventType: 'TAB_SWITCH',
          message: 'User switched tab or minimized window'
        });

        alert('⚠️ Warning: Tab switching is monitored and logged. This event has been recorded.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Debounced autosave
  const debouncedAutosave = useCallback(
    (() => {
      let timeout;
      return (currentAnswers) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          autosaveMutation.mutate(currentAnswers, {
            onSuccess: () => setLastSaved(new Date())
          });
        }, 2000); // 2 seconds debounce
      };
    })(),
    []
  );

  const handleOptionChange = (questionId, option) => {
    const newAnswers = { ...answers, [questionId]: option };
    setAnswers(newAnswers);
    debouncedAutosave(newAnswers);
  };

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    
    try {
      const result = await submitMutation.mutateAsync({
        answers: answersRef.current,
        proctoringData: {
          tabSwitches: tabSwitchCount,
        }
      });
      navigate(`/student/result/${result.data.resultId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  }, [submitting, tabSwitchCount, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) return <div>Loading exam questions...</div>;
  if (!exam) return <div>Exam not found.</div>;

  return (
    <div className="exam-taker-page">
      <header className="exam-header">
        <div>
          <h1 className="exam-title">{exam.title}</h1>
          <p className="exam-info">{exam.Questions.length} Questions</p>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
          {lastSaved && (
            <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.8}}>
              <Save size={14} />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
          {tabSwitchCount > 0 && (
            <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#ef4444'}}>
              <Shield size={14} />
              <span>{tabSwitchCount} tab switch{tabSwitchCount !== 1 ? 'es' : ''}</span>
            </div>
          )}
          <div className={`exam-timer ${timeLeft < 60 ? 'urgent' : ''}`}>
            <Clock size={24} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="questions-container">
        {exam.Questions.map((q, index) => (
          <div key={q.id} className="question-card card">
            <div className="question-number">Question {index + 1}</div>
            <div 
              className="question-text" 
              dangerouslySetInnerHTML={{ __html: q.questionText }} 
            />
            <div className="options-grid">
              {['A', 'B', 'C', 'D'].map(opt => (
                <label key={opt} className={`option-item ${answers[q.id] === opt ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name={`question-${q.id}`} 
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => handleOptionChange(q.id, opt)}
                  />
                  <span className="option-label">{opt}.</span>
                  <span className="option-text">{q[`option${opt}`]}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="exam-footer">
          <div className="alert-info">
            <AlertTriangle size={20} />
            <span>Your progress is auto-saved every 30 seconds. Tab switches are monitored.</span>
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Exam'}
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default TakeExam;

