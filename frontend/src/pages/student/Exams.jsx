import React from 'react';
import { Play, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useExams } from '../../hooks/useExamQueries';

const StudentExams = () => {
  const { data: exams = [], isLoading: loading, error } = useExams();

  return (
    <div className="exams-page">
      <header className="page-header">
        <h1 className="page-title">Available Exams</h1>
        <p className="page-subtitle">Choose an exam to begin your attempt</p>
      </header>

      {loading ? (
        <p>Loading available exams...</p>
      ) : error ? (
        <p>Error loading exams. Please try again.</p>
      ) : (
        <div className="exams-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem'}}>
          {exams.map((exam) => {
            const now = new Date();
            const start = exam.startWindow ? new Date(exam.startWindow) : null;
            const end = exam.endWindow ? new Date(exam.endWindow) : null;
            const isStarted = !start || now >= start;
            const isEnded = end && now > end;
            const isDisabled = !isStarted || isEnded;

            return (
              <div key={exam.id} className="exam-card card shadow-glass" style={{opacity: isDisabled ? 0.7 : 1}}>
                <h3 className="exam-title">{exam.title}</h3>
                <p className="exam-desc" style={{color: 'var(--text-muted)', fontSize: '0.9rem', margin: '1rem 0'}}>{exam.description}</p>
                
                <div className="exam-meta" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem'}}>
                  <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem'}}>
                    <Clock size={16} /> <strong>Duration:</strong> {exam.duration} mins
                  </span>
                  {start && (
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: !isStarted ? '#f59e0b' : 'inherit'}}>
                      <Play size={16} /> <strong>Starts:</strong> {start.toLocaleString()}
                    </span>
                  )}
                  {end && (
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: isEnded ? '#ef4444' : 'inherit'}}>
                      <ChevronRight size={16} /> <strong>Ends:</strong> {end.toLocaleString()}
                    </span>
                  )}
                </div>

                {!isStarted ? (
                  <button className="btn-secondary" style={{width: '100%', cursor: 'not-allowed'}} disabled>
                    Not Started
                  </button>
                ) : isEnded ? (
                  <button className="btn-secondary" style={{width: '100%', cursor: 'not-allowed'}} disabled>
                    Expired
                  </button>
                ) : (
                  <Link to={`/student/exams/${exam.id}`} className="btn-primary" style={{display: 'flex', justifyContent: 'center', gap: '0.5rem'}}>
                    Start Exam <ChevronRight size={18} />
                  </Link>
                )}
              </div>
            );
          })}
          {exams.length === 0 && <p className="text-muted">No exams available at the moment.</p>}
        </div>
      )}
    </div>
  );
};

export default StudentExams;

