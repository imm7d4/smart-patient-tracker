import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTreatment from './pages/doctor/CreateTreatment';
import DoctorPatientDetail from './pages/doctor/DoctorPatientDetail';
import AlertsPage from './pages/doctor/AlertsPage';
import TreatmentPlanDetail from './pages/doctor/TreatmentPlanDetail';
import DailyCheckIn from './pages/patient/DailyCheckIn';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import PatientProfile from './pages/patient/PatientProfile';
import ChatPage from './pages/common/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';

import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

import Navbar from './components/Navbar';
import NotificationManager from './components/common/NotificationManager';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <NotificationManager />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard - accessible to all authenticated users */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Doctor-only routes */}
            <Route path="/doctor/create-treatment" element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <CreateTreatment />
              </ProtectedRoute>
            } />
            <Route path="/doctor/patient/:id" element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorPatientDetail />
              </ProtectedRoute>
            } />
            <Route path="/doctor/treatment-plan/:patientId" element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <TreatmentPlanDetail />
              </ProtectedRoute>
            } />
            <Route path="/doctor/alerts" element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <AlertsPage />
              </ProtectedRoute>
            } />

            {/* Patient-only routes */}
            <Route path="/patient/checkin" element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DailyCheckIn />
              </ProtectedRoute>
            } />
            <Route path="/patient/profile" element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientProfile />
              </ProtectedRoute>
            } />

            {/* Shared routes - both patient and doctor */}
            <Route path="/chat" element={
              <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR']}>
                <ChatPage />
              </ProtectedRoute>
            } />

            {/* Admin-only routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/audit-logs" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AuditLogsPage />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
