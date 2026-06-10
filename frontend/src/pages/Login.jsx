import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Activity } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2 expects 'username' instead of email
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      localStorage.setItem('access_token', response.data.access_token);
      
      // Fetch user profile to determine role
      const meResponse = await api.get('/auth/me');
      const role = meResponse.data.role;

      // Navigate based on role
      switch(role) {
        case 'SUPERADMIN':
        case 'ADMIN': navigate('/admin'); break;
        case 'DOCTOR': navigate('/doctor'); break;
        case 'PHARMA': navigate('/pharma'); break;
        case 'LAB_TECH': navigate('/lab'); break;
        case 'PATIENT': navigate('/patient'); break;
        default: navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid login credentials');
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-blue-100 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden shadow-blue-500/10">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
               <Activity className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Welcome Back</h2>
          <p className="text-center text-slate-500 mb-8 font-medium">Log in to your medical portal</p>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-medium text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-slate-800 font-medium"
                placeholder="doctor@hospital.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-slate-800 font-medium"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-md shadow-indigo-500/30 transform hover:-translate-y-0.5"
            >
              Secure Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
