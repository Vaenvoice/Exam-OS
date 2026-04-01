import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

// Loading Component
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
    <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%' }}></div>
    <p style={{ color: '#666', fontWeight: 500 }}>Loading...</p>
  </div>
);

// Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const TeacherDashboard = lazy(() => import('./pages/teacher/Dashboard'));
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const AdminExams = lazy(() => import('./pages/admin/Exams'));
const CreateExam = lazy(() => import('./pages/admin/CreateExam'));
const EditExam = lazy(() => import('./pages/admin/EditExam'));
const ManageQuestions = lazy(() => import('./pages/admin/ManageQuestions'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const AssignStudents = lazy(() => import('./pages/admin/AssignStudents'));
const StudentExams = lazy(() => import('./pages/student/Exams'));
const TakeExam = lazy(() => import('./pages/student/TakeExam'));
const ResultPage = lazy(() => import('./pages/student/ResultPage'));
const History = lazy(() => import('./pages/student/History'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route index element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/admin/*" element={
              <ProtectedRoute role="admin">
                <MainLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="exams" element={<AdminExams />} />
                    <Route path="exams/new" element={<CreateExam />} />
                    <Route path="exams/:id/edit" element={<EditExam />} />
                    <Route path="exams/:id/questions" element={<ManageQuestions />} />
                    <Route path="exams/:id/assign" element={<AssignStudents />} />
                    <Route path="users" element={<ManageUsers />} />
                    <Route path="results" element={<History />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/teacher/*" element={
              <ProtectedRoute role={["admin", "teacher"]}>
                <MainLayout>
                  <Routes>
                    <Route path="dashboard" element={<TeacherDashboard />} />
                    <Route path="exams" element={<AdminExams />} />
                    <Route path="exams/new" element={<CreateExam />} />
                    <Route path="exams/:id/edit" element={<EditExam />} />
                    <Route path="exams/:id/questions" element={<ManageQuestions />} />
                    <Route path="exams/:id/assign" element={<AssignStudents />} />
                    <Route path="results" element={<History />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/student/*" element={
              <ProtectedRoute role="student">
                <MainLayout>
                  <Routes>
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="exams" element={<StudentExams />} />
                    <Route path="exams/:id" element={<TakeExam />} />
                    <Route path="results" element={<History />} />
                    <Route path="result/:id" element={<ResultPage />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
