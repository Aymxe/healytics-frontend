import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MedicalFile from './pages/MedicalFile';
import Appointments from './pages/Appointments';
import Doctors from './pages/Doctors';
import Pharmacies from './pages/Pharmacies';
import Hospitals from './pages/Hospitals';
import DoctorSchedule from './pages/DoctorSchedule';
import DoctorPatients from './pages/DoctorPatients';
import DoctorMessages from './pages/DoctorMessages';
import AdminDoctors from './pages/AdminDoctors';
import AdminPatients from './pages/AdminPatients';
import AdminLogs from './pages/AdminLogs';
import AdminMessages from './pages/AdminMessages';
import HelpCenter from './pages/HelpCenter';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <ToastProvider>
      <NotificationProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient/medical-file" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <MedicalFile />
            </ProtectedRoute>
          } />
          <Route path="/patient/appointments" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <Appointments />
            </ProtectedRoute>
          } />
          <Route path="/patient/doctors" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <Doctors />
            </ProtectedRoute>
          } />
          <Route path="/patient/pharmacies" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <Pharmacies />
            </ProtectedRoute>
          } />
          <Route path="/patient/hospitals" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <Hospitals />
            </ProtectedRoute>
          } />
          <Route path="/patient/help" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <HelpCenter />
            </ProtectedRoute>
          } />
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor/schedule" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <DoctorSchedule />
            </ProtectedRoute>
          } />
          <Route path="/doctor/patients" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <DoctorPatients />
            </ProtectedRoute>
          } />
          <Route path="/doctor/messages" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <DoctorMessages />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/doctors" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDoctors />
            </ProtectedRoute>
          } />
          <Route path="/admin/patients" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminPatients />
            </ProtectedRoute>
          } />
          <Route path="/admin/logs" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLogs />
            </ProtectedRoute>
          } />
          <Route path="/admin/messages" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminMessages />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
      </NotificationProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
