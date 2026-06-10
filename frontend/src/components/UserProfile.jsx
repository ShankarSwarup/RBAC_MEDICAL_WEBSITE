import React from 'react';
import { User, Mail, Shield, Building2 } from 'lucide-react';

const UserProfile = ({ user }) => {
  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-2xl mx-auto mt-8">
      <div className="flex items-center gap-6 mb-8 border-b border-slate-100 pb-8">
         <div className="h-24 w-24 bg-gradient-to-tr from-indigo-500 to-sky-400 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">
            {user.email.charAt(0).toUpperCase()}
         </div>
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Account Profile</h2>
            <p className="text-slate-500 font-medium">Verify your medical system credentials</p>
         </div>
      </div>

      <div className="space-y-6">
         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-white shadow-sm rounded-lg text-slate-500"><Mail className="h-5 w-5"/></div>
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p className="font-medium text-slate-800">{user.email}</p>
               </div>
            </div>
         </div>

         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-indigo-50 shadow-sm rounded-lg text-indigo-500"><Shield className="h-5 w-5"/></div>
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Role</p>
                  <p className="font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full text-sm inline-block mt-1">{user.role}</p>
               </div>
            </div>
         </div>

         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-white shadow-sm rounded-lg text-slate-500"><Building2 className="h-5 w-5"/></div>
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Hospital ID</p>
                  <p className="font-mono font-medium text-slate-700 mt-1">
                     {user.hospital_id ? user.hospital_id : "Central Administration"}
                  </p>
               </div>
            </div>
         </div>
         
         <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
             <div className="flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <p className="text-sm font-bold text-emerald-700">Account status is Active and securely authenticated.</p>
             </div>
         </div>
      </div>
    </div>
  );
};

export default UserProfile;
