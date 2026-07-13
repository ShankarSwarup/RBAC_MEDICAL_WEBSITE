import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Activity } from 'lucide-react';
import { toast } from '../services/toast';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const verifyAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        if (isMounted) {
          setAuthenticated(false);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (isMounted) {
          const userData = response.data;
          setUser(userData);
          
          if (allowedRoles && !allowedRoles.includes(userData.role)) {
            toast.error(`Access Denied: ${userData.role} role is unauthorized here.`);
            setAuthenticated(false);
          } else {
            setAuthenticated(true);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth verification failed", err);
        if (isMounted) {
          localStorage.removeItem('access_token');
          setAuthenticated(false);
          setLoading(false);
        }
      }
    };

    verifyAuth();
    return () => {
      isMounted = false;
    };
  }, [allowedRoles]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen w-screen bg-slate-950 items-center justify-center relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-75"></div>

        <div className="flex flex-col items-center z-10">
          <div className="relative flex items-center justify-center">
            {/* Spinning/pulsing outer ring */}
            <div className="absolute h-24 w-24 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
            {/* Core pulsing circle */}
            <div className="h-16 w-16 bg-gradient-to-tr from-indigo-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
              <Activity className="h-9 w-9 text-white animate-bounce" />
            </div>
          </div>
          <h3 className="text-white text-lg font-bold mt-8 tracking-wide">Securing Portal Connection</h3>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-2 animate-pulse">Verifying Medical Credentials...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // Clone children and pass user as prop if needed, or just render children
  return children;
};

export default ProtectedRoute;
