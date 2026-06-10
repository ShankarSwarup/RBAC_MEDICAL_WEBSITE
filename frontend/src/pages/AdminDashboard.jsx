import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, PlusCircle, LogOut, CheckCircle2, UserCircle, Building2, Menu, X } from 'lucide-react';
import api from '../services/api';
import UserProfile from '../components/UserProfile';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, profile, add_hospital, add_user
  const [stats, setStats] = useState({ hospitals: 0, doctors: 0, patients: 0, other_staff: 0 });
  const [hospitals, setHospitals] = useState([]);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [hospitalData, setHospitalData] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.role !== 'SUPERADMIN' && response.data.role !== 'ADMIN') return navigate('/login');
        setUser(response.data);
        
        if (response.data.role === 'SUPERADMIN') {
            const [statRes, hospRes] = await Promise.all([
                api.get('/admin/analytics'),
                api.get('/hospitals/')
            ]);
            setStats(statRes.data);
            setHospitals(hospRes.data);
        } else if (response.data.role === 'ADMIN') {
            const hospRes = await api.get('/hospitals/me');
            setHospitalData(hospRes.data);
        }
      } catch (err) {
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  const handleUpdateDepartments = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const depts = formData.get('departments').split(',').map(d => d.trim()).filter(d => d);
    try {
        await api.put('/hospitals/me/departments', { departments: depts });
        setStatus({ message: "Network OPD configurations updated successfully.", type: 'success' });
        const hospRes = await api.get('/hospitals/me');
        setHospitalData(hospRes.data);
        setTimeout(() => setStatus({message:'', type:''}), 3000);
    } catch(err) { setStatus({ message: "Configuration update failed.", type: 'error' }); }
  };

  const handleAddHospital = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const depts = formData.get('departments').split(',').map(d => d.trim()).filter(d => d);
    try {
        await api.post('/hospitals/', {
            name: formData.get('name'),
            address: formData.get('address'),
            location_city: formData.get('city'),
            departments: depts,
            contact_email: formData.get('email'),
        });
        setStatus({ message: "Hospital node successfully integrated into the network.", type: 'success' });
        setTimeout(() => { setActiveTab('analytics'); setStatus({message:'', type:''}); }, 2500);
    } catch(err) { setStatus({ message: "Integration failed. Check network parameters.", type: 'error' }); }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const role = formData.get('role');
    const payload = {
        email: formData.get('email'),
        password: formData.get('password'),
        full_name: formData.get('full_name'),
        role: role,
        hospital_id: user.role === 'SUPERADMIN' ? (formData.get('hospital_id') || null) : user.hospital_id,
    };
    if (role === 'DOCTOR') {
        payload.specialty = formData.get('specialty');
    }
    try {
        await api.post('/auth/register', payload);
        setStatus({ message: `${role} account successfully provisioned.`, type: 'success' });
        setTimeout(() => { setActiveTab('analytics'); setStatus({message:'', type:''}); }, 2500);
    } catch(err) { setStatus({ message: err.response?.data?.detail || "Provisioning failed. Duplicate email or invalid data.", type: 'error' }); }
  };

  if (!user) return <div className="flex h-screen items-center justify-center font-bold text-slate-500">Security Check...</div>;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 relative">
      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 w-72 bg-gradient-to-b from-indigo-900 to-slate-900 shadow-xl flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 pb-4 flex justify-between items-center">
            <div>
                <h1 className="text-white text-2xl font-bold flex items-center gap-2 tracking-tight">
                <Activity className="text-indigo-400" /> MedicalAdmin
                </h1>
                <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mt-2">Executive Network</p>
            </div>
            <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
            </button>
        </div>
        
        <div className="px-6 py-6 border-b border-indigo-800/50 mb-4">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-full bg-indigo-500/30 flex items-center justify-center text-white font-bold border border-indigo-400/30">
                  {user.email.charAt(0).toUpperCase()}
               </div>
               <div>
                  <p className="text-sm font-bold text-white truncate w-40">{user.email}</p>
                  <p className="text-xs font-semibold text-indigo-300">{user.role}</p>
               </div>
            </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
            <button onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'analytics' ? 'bg-indigo-600 shadow-lg text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>
                <LayoutDashboard className="h-5 w-5" /> Sub-System View
            </button>
            <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'profile' ? 'bg-indigo-600 shadow-lg text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>
                <UserCircle className="h-5 w-5" /> Credentials
            </button>
            {user.role === 'SUPERADMIN' && (
                <>
                <button onClick={() => { setActiveTab('add_hospital'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'add_hospital' ? 'bg-indigo-600 shadow-lg text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>
                    <Building2 className="h-5 w-5" /> New Hospital
                </button>
                <button onClick={() => { setActiveTab('add_user'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'add_user' ? 'bg-indigo-600 shadow-lg text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>
                    <PlusCircle className="h-5 w-5" /> Provision Staff
                </button>
                </>
            )}
            {user.role === 'ADMIN' && (
                <>
                <button onClick={() => { setActiveTab('manage_hospital'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'manage_hospital' ? 'bg-indigo-600 shadow-lg text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>
                    <Building2 className="h-5 w-5" /> Hospital Config
                </button>
                <button onClick={() => { setActiveTab('add_user'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'add_user' ? 'bg-indigo-600 shadow-lg text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>
                    <PlusCircle className="h-5 w-5" /> Provision Staff
                </button>
                </>
            )}
        </nav>

        <div className="p-4 mt-auto">
            <button onClick={() => { localStorage.removeItem('access_token'); navigate('/login'); }} className="flex items-center gap-3 w-full px-4 py-3 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition">
               <LogOut className="h-5 w-5" /> Secure Exhaust
            </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
         <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 px-6 md:px-10 py-6 sticky top-0 z-20 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600" onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800">
                        {activeTab === 'analytics' && 'Operational Analytics'}
                        {activeTab === 'profile' && 'Administrative Credentials'}
                        {activeTab === 'manage_hospital' && 'Facility Configuration'}
                        {activeTab === 'add_hospital' && 'Add Hospital Node'}
                        {activeTab === 'add_user' && 'Provision Staff Account'}
                    </h1>
                    <p className="hidden md:block text-slate-500 text-sm font-medium">
                        {activeTab === 'manage_hospital' ? 'Manage your hospital departments and OPD services.' : 'Real-time health of the ecosystem.'}
                    </p>
                </div>
             </div>
             {activeTab === 'analytics' && user.role === 'SUPERADMIN' && (
                 <button onClick={() => setActiveTab('add_hospital')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" /> Add Hospital Node
                 </button>
             )}
         </header>

         <div className="p-10 max-w-6xl mx-auto">
            {activeTab === 'profile' && <UserProfile user={user} />}

            {activeTab === 'analytics' && (
                <>
                {user.role === 'SUPERADMIN' ? (
                   <>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                       <div className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-center">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="text-slate-500 font-bold text-sm">Total Network Hospitals</h3>
                              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Building2 className="h-5 w-5"/></div>
                           </div>
                           <p className="text-4xl font-black text-slate-800">{stats.hospitals}</p>
                           <p className="text-emerald-500 font-bold text-xs mt-2 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> System Online</p>
                       </div>
                       <div className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-center">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="text-slate-500 font-bold text-sm">Active Doctors</h3>
                              <div className="p-2 bg-sky-50 text-sky-600 rounded-lg"><Users className="h-5 w-5"/></div>
                           </div>
                           <p className="text-4xl font-black text-slate-800">{stats.doctors}</p>
                       </div>
                       <div className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-center">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="text-slate-500 font-bold text-sm">Total Patients</h3>
                              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Users className="h-5 w-5"/></div>
                           </div>
                           <p className="text-4xl font-black text-slate-800">{stats.patients}</p>
                       </div>
                       <div className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-center">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="text-slate-500 font-bold text-sm">Ancillary Staff</h3>
                              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users className="h-5 w-5"/></div>
                           </div>
                           <p className="text-4xl font-black text-slate-800">{stats.other_staff}</p>
                       </div>
                   </div>

                   <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                       <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                           <h3 className="font-black text-slate-800 tracking-tight flex items-center gap-2"><Users className="h-5 w-5 text-indigo-500"/> Global Patient Registry</h3>
                           <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-widest">{stats?.patient_list?.length || 0} Registered</span>
                       </div>
                       <div className="overflow-x-auto">
                           <table className="w-full text-left text-sm">
                               <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest">
                                   <tr>
                                       <th className="px-6 py-4">Display ID</th>
                                       <th className="px-6 py-4">Full Name</th>
                                       <th className="px-6 py-4">Identifier (Email)</th>
                                       <th className="px-6 py-4">Assigned Node</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100">
                                   {stats?.patient_list?.map(p => (
                                       <tr key={p.id} className="hover:bg-slate-50 transition">
                                           <td className="px-6 py-4 font-black text-indigo-600">{p.display_id || 'PAT-NEW'}</td>
                                           <td className="px-6 py-4 font-bold text-slate-800">{p.full_name || 'System Generated'}</td>
                                           <td className="px-6 py-4 font-medium text-slate-500">{p.email}</td>
                                           <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-black text-slate-600 uppercase tracking-tighter">{p.hospital_id || 'ROOT'}</span></td>
                                       </tr>
                                   ))}
                                   {(!stats?.patient_list || stats.patient_list.length === 0) && (
                                       <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-bold">No global patient data available.</td></tr>
                                   )}
                               </tbody>
                           </table>
                       </div>
                   </div>
                    </>
                 ) : (
                    <div className="space-y-8">
                        <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black mb-2">{hospitalData?.name || 'My Hospital'}</h2>
                                <p className="text-indigo-200 font-medium max-w-md">{hospitalData?.address}, {hospitalData?.location_city}</p>
                                <div className="mt-6 flex gap-3">
                                    <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold border border-white/10 uppercase tracking-widest text-indigo-300">Active Node</span>
                                    <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold border border-white/10 uppercase tracking-widest text-indigo-300">Local Admin: {user.email}</span>
                                </div>
                            </div>
                            <Building2 className="absolute -right-10 -bottom-10 h-64 w-64 text-white/5 -rotate-12" />
                        </div>

                        <div className="bg-white border rounded-3xl p-8 shadow-sm">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><Activity className="text-indigo-500 h-5 w-5"/> Registered OPD Services</h3>
                            <div className="flex flex-wrap gap-2">
                                {hospitalData?.departments?.map(d => (
                                    <span key={d} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-tight border border-slate-200">{d}</span>
                                ))}
                                {(!hospitalData?.departments || hospitalData.departments.length === 0) && <p className="text-slate-400 font-medium">No OPD services configured for this node yet.</p>}
                            </div>
                            <button onClick={() => setActiveTab('manage_hospital')} className="mt-8 text-indigo-600 font-black text-sm flex items-center gap-1 hover:underline">Provision New Services →</button>
                        </div>
                    </div>
                 )}
                 </>
            )}

            {activeTab === 'manage_hospital' && (
                <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-2xl mx-auto transform transition-all">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Facility Service Config</h2>
                        <p className="text-slate-500 font-medium">Dynamics update the OPD departments offered by your hospital node.</p>
                    </div>
                    <form onSubmit={handleUpdateDepartments} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1 text-indigo-600 uppercase tracking-widest text-[10px]">Operational OPD Departments (Comma separated)</label>
                            <textarea 
                                name="departments" 
                                required 
                                defaultValue={hospitalData?.departments?.join(', ')}
                                placeholder="Cardiology, Neurology, Pediatrics..." 
                                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition min-h-[120px] font-medium" 
                            />
                        </div>
                        {status.message && <div className={`p-4 rounded-2xl text-center font-bold text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{status.message}</div>}
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition transform hover:-translate-y-1">Commit Configuration Changes →</button>
                    </form>
                </div>
            )}

            {activeTab === 'add_hospital' && (
                <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-2xl mx-auto transform transition-all">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Hospital Node Integration</h2>
                        <p className="text-slate-500 font-medium">Register a primary healthcare facility to the network infrastructure.</p>
                    </div>
                    <form onSubmit={handleAddHospital} className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Entity Name</label>
                                <input name="name" required placeholder="e.g. City General Hospital" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">City</label>
                                <input name="city" required placeholder="e.g. New York" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Contact Email</label>
                                <input name="email" type="email" required placeholder="admin@hospital.com" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Facility Address</label>
                            <input name="address" required placeholder="Full physical address..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Departments (Comma separated)</label>
                            <input name="departments" required placeholder="Cardiology, Neurology, Orthopedics..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                        </div>
                        {status.message && <div className={`p-4 rounded-2xl text-center font-bold text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{status.message}</div>}
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition transform hover:-translate-y-1">Initialize Node Integration →</button>
                    </form>
                </div>
            )}

            {activeTab === 'add_user' && (
                <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-2xl mx-auto transform transition-all">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Credential Provisioning</h2>
                        <p className="text-slate-500 font-medium">
                          {user.role === 'ADMIN' ? `Provision staff for your hospital (${hospitalData?.name || 'My Hospital'}).` : 'Issue secure access credentials to medical and administrative staff.'}
                        </p>
                    </div>
                    <form onSubmit={handleAddUser} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                <input name="full_name" required placeholder="e.g. Dr. Sarah Johnson" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">User Identifier (Email)</label>
                                <input name="email" type="email" required placeholder="staff@hospital.com" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Initial Password</label>
                                <input name="password" type="password" required placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Access Tier</label>
                                <select name="role" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-700 border-r-[16px] border-r-transparent">
                                    <option value="DOCTOR">Medical Doctor</option>
                                    <option value="PHARMA">Pharmaceutical Staff</option>
                                    <option value="LAB_TECH">Lab Technician</option>
                                    <option value="PATIENT">Patient Account</option>
                                    {user.role === 'SUPERADMIN' && <option value="ADMIN">Local Administrator</option>}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Doctor Specialty <span className="text-slate-400 font-normal">(if role is Doctor)</span></label>
                            <input name="specialty" placeholder="e.g. Cardiology, Neurology..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Affiliated Hospital</label>
                            {user.role === 'SUPERADMIN' ? (
                                <select name="hospital_id" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-700 border-r-[16px] border-r-transparent">
                                    <option value="">Select Hospital (Optional for SuperAdmin)</option>
                                    {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select>
                            ) : (
                                <div className="w-full bg-slate-100 border border-slate-200 p-4 rounded-2xl text-slate-600 font-medium">
                                    🏥 {hospitalData?.name || 'Your Hospital'} <span className="text-xs text-slate-400 ml-2">(auto-assigned)</span>
                                </div>
                            )}
                        </div>
                        {status.message && <div className={`p-4 rounded-2xl text-center font-bold text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{status.message}</div>}
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition transform hover:-translate-y-1">Authorize Credential Issuance →</button>
                    </form>
                </div>
            )}
         </div>
      </main>
    </div>
  );
};
// Removed duplicated import
export default AdminDashboard;
