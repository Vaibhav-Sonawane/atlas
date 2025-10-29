import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './components/student/StudentDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import TaskList from './components/student/TaskList';
import TaskDetail from './components/student/TaskDetail';
import TaskManager from './components/teacher/TaskManager';
import SubmissionReview from './components/teacher/SubmissionReview';
import GlobalOverview from './components/admin/GlobalOverview';
import GlobalLeaderboard from './components/admin/GlobalLeaderboard';
import StudentLeaderboard from './components/student/StudentLeaderboard';
import SubmittedTasksList from './components/student/SubmittedTaskList';
import './App.css';

function AppRoutes() {
  const { user } = useAuth();

  const getDashboardComponent = () => {
    if (!user) return null;
    switch (user.role) {
      case 'student':
        return StudentDashboard;
      case 'teacher':
        return TeacherDashboard;
      case 'admin':
        return AdminDashboard;
      default:
        return StudentDashboard;
    }
  };

  const DashboardComponent = getDashboardComponent();

  return (
    <>
    {/* <div className="test">Tailwind is working ✅</div> */}

    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <AuthLayout>
          <Login />
        </AuthLayout>
      } />
      <Route path="/register" element={
        <AuthLayout>
          <Register />
        </AuthLayout>
      } />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout>
            {DashboardComponent && <DashboardComponent />}
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Student Routes */}
      <Route path="/tasks" element={
        <ProtectedRoute allowedRoles={['student']}>
          <DashboardLayout>
            <TaskList />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/tasks/:id" element={
        <ProtectedRoute allowedRoles={['student']}>
          <DashboardLayout>
            <TaskDetail />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/submitted" element={
        <ProtectedRoute allowedRoles={['student']}>
          <DashboardLayout>
            <SubmittedTasksList />
          </DashboardLayout>
        </ProtectedRoute>
      } />


      {/* Teacher Routes */}
      <Route path="/manage-tasks" element={
        <ProtectedRoute allowedRoles={['teacher', 'admin']}>
          <DashboardLayout>
            <TaskManager />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/submissions" element={
        <ProtectedRoute allowedRoles={['teacher', 'admin']}>
          <DashboardLayout>
            <SubmissionReview />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/overview" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout>
            <GlobalOverview />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/global-leaderboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout>
            <GlobalLeaderboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/leaderboard" element={
        <ProtectedRoute allowedRoles={['student']}>
          <DashboardLayout>
            <StudentLeaderboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;