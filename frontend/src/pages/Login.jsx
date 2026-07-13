import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Activity, Key, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '../services/toast';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoDrawer, setShowDemoDrawer] = useState(false);

  const demoAccounts = [
    { role: 'Super Admin', email: 'superadmin@medical.com', password: 'password123', color: 'border-l-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' },
    { role: 'Local Admin', email: 'admin@hospital.com', password: 'password123', color: 'border-l-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20' },
    { role: 'Doctor (Cardio)', email: 'doctor@hospital.com', password: 'password123', color: 'border-l-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20' },
    { role: 'Patient', email: 'patient@hospital.com', password: 'password123', color: 'border-l-sky-500 text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20' },
    { role: 'Pharmacist', email: 'pharma@hospital.com', password: 'password123', color: 'border-l-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20' },
    { role: 'Lab Tech', email: 'lab@hospital.com', password: 'password123', color: 'border-l-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20' },
  ];

  const handleDemoAutofill = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    toast.info(`Filled credentials for ${acc.role}`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Front-end Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email format.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2 expects 'username' instead of email
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      localStorage.setItem('access_token', response.data.access_token);
      toast.success('Login authorized successfully.');
      
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
      const errMsg = err.response?.data?.detail || 'Invalid login credentials';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 items-center justify-center p-4 relative overflow-hidden">
      {/* Animated lights */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl animate-pulse delay-100"></div>

      {/* Theme Switcher */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300">
        <div className="p-8 md:p-10">
          <div className="flex justify-center mb-6">
            <div className="h-14 w-14 bg-gradient-to-tr from-indigo-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
               <Activity className="h-9 w-9 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-center text-slate-800 dark:text-white mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-8 font-semibold text-sm">Log in to your secure medical workspace</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-950 text-slate-800 dark:text-white font-semibold transition"
                placeholder="doctor@hospital.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest ml-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-950 text-slate-800 dark:text-white font-semibold transition"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-4 rounded-2xl transition duration-200 shadow-lg shadow-indigo-600/20 transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Secure Login'
              )}
            </button>
          </form>

          {/* Collapsible Demo Login drawer */}
          <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
            <button 
              onClick={() => setShowDemoDrawer(!showDemoDrawer)}
              className="flex items-center justify-between w-full text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition font-bold text-sm bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50"
            >
              <span className="flex items-center gap-2">
                <Key className="h-4 w-4" /> Demo Portal Accounts
              </span>
              {showDemoDrawer ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showDemoDrawer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 animate-fade-in">
                {demoAccounts.map((acc, index) => (
                  <button
                    key={index}
                    onClick={() => handleDemoAutofill(acc)}
                    type="button"
                    className={`flex flex-col text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 hover:border-indigo-500 hover:shadow-md transition active:scale-95 ${acc.color}`}
                  >
                    <span className="text-xs font-black tracking-wide">{acc.role}</span>
                    <span className="text-[10px] opacity-75 font-semibold mt-1 truncate">{acc.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
