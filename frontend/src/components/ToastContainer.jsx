import React, { useState, useEffect } from 'react';
import { toast } from '../services/toast';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((newToast) => {
      setToasts((prevToasts) => [...prevToasts, newToast]);

      // Remove after 4 seconds
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== newToast.id));
      }, 4000);
    });

    return () => unsubscribe();
  }, []);

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((t) => {
        let icon = <Info className="h-5 w-5 text-sky-500" />;
        let borderClass = "border-l-4 border-l-sky-500";
        let bgClass = "bg-white/95 dark:bg-slate-900/95";
        let textClass = "text-slate-800 dark:text-slate-100";

        if (t.type === 'success') {
          icon = <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
          borderClass = "border-l-4 border-l-emerald-500";
        } else if (t.type === 'error') {
          icon = <AlertCircle className="h-5 w-5 text-rose-500" />;
          borderClass = "border-l-4 border-l-rose-500";
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 ${bgClass} ${borderClass} transition-all duration-300 transform translate-x-0 animate-slide-in`}
            style={{
              animation: 'slideIn 0.3s ease-out forwards'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">{icon}</div>
              <p className={`text-sm font-semibold tracking-tight ${textClass}`}>{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-4 flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;
