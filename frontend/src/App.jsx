import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PharmaDashboard from './pages/PharmaDashboard';
import LabDashboard from './pages/LabDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/patient/*" element={<PatientDashboard />} />
        <Route path="/doctor/*" element={<DoctorDashboard />} />
        <Route path="/pharma/*" element={<PharmaDashboard />} />
        <Route path="/lab/*" element={<LabDashboard />} />
        
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
