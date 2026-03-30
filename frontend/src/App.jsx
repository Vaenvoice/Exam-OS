import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import AdminExams from './pages/admin/Exams';
import CreateExam from './pages/admin/CreateExam';
import EditExam from './pages/admin/EditExam';
import ManageQuestions from './pages/admin/ManageQuestions';
import ManageUsers from './pages/admin/ManageUsers';
import AssignStudents from './pages/admin/AssignStudents';
import StudentExams from './pages/student/Exams';
import TakeExam from './pages/student/TakeExam';
import ResultPage from './pages/student/ResultPage';
import History from './pages/student/History';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
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

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
