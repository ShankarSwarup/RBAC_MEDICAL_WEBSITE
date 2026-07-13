import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PharmaDashboard from './pages/PharmaDashboard';
import LabDashboard from './pages/LabDashboard';

import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ToastContainer';

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/*" 
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/*" 
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pharma/*" 
            element={
              <ProtectedRoute allowedRoles={['PHARMA']}>
                <PharmaDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lab/*" 
            element={
              <ProtectedRoute allowedRoles={['LAB_TECH']}>
                <LabDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
};

export default App;
