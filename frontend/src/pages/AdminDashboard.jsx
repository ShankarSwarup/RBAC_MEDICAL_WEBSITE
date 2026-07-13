import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, PlusCircle, LogOut, CheckCircle2, UserCircle, Building2, Menu, X } from 'lucide-react';
import api from '../services/api';
import UserProfile from '../components/UserProfile';
import ThemeToggle from '../components/ThemeToggle';
import { toast } from '../services/toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, profile, add_hospital, add_user, manage_hospital
  const [stats, setStats] = useState({ hospitals: 0, doctors: 0, patients: 0, other_staff: 0, patient_list: [] });
  const [hospitals, setHospitals] = useState([]);
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
  }, [navigate, activeTab]);

  const handleUpdateDepartments = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawDepts = formData.get('departments');
    if (!rawDepts || !rawDepts.trim()) {
      toast.error("OPD departments list cannot be empty.");
      return;
    }
    const depts = rawDepts.split(',').map(d => d.trim()).filter(d => d);
    try {
      await api.put('/hospitals/me/departments', { departments: depts });
      toast.success("Network OPD configurations updated successfully.");
      const hospRes = await api.get('/hospitals/me');
      setHospitalData(hospRes.data);
      setActiveTab('analytics');
    } catch(err) { 
      toast.error("Configuration update failed."); 
    }
  };

  const handleAddHospital = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name')?.trim();
    const address = formData.get('address')?.trim();
    const city = formData.get('city')?.trim();
    const email = formData.get('email')?.trim();
    const rawDepts = formData.get('departments')?.trim();

    if (!name || !address || !city || !email || !rawDepts) {
      toast.error("All hospital registration fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid contact email format.");
      return;
    }

    const depts = rawDepts.split(',').map(d => d.trim()).filter(d => d);
    try {
      await api.post('/hospitals/', {
        name,
        address,
        location_city: city,
        departments: depts,
        contact_email: email,
      });
      toast.success("Hospital node successfully integrated into the network.");
      setActiveTab('analytics');
    } catch(err) { 
      toast.error("Integration failed. Check network parameters."); 
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const role = formData.get('role');
    const email = formData.get('email')?.trim();
    const password = formData.get('password');
    const fullName = formData.get('full_name')?.trim();

    if (!email || !password || !fullName) {
      toast.error("All user fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid user email format.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    const payload = {
      email,
      password,
      full_name: fullName,
      role: role,
      hospital_id: user.role === 'SUPERADMIN' ? (formData.get('hospital_id') || null) : user.hospital_id,
    };
    if (role === 'DOCTOR') {
      const spec = formData.get('specialty')?.trim();
      if (!spec) {
        toast.error("Doctor specialty is required.");
        return;
      }
      payload.specialty = spec;
    }

    try {
      await api.post('/auth/register', payload);
      toast.success(`${role} account successfully provisioned.`);
      setActiveTab('analytics');
    } catch(err) { 
      toast.error(err.response?.data?.detail || "Provisioning failed. Duplicate email or invalid data."); 
    }
  };

  if (!user) return <div className="flex h-screen items-center justify-center font-bold text-slate-500 bg-slate-50 dark:bg-slate-950">Security Check...</div>;

  // Recharts data setup
  const chartData = [
    { name: 'Hospitals', count: stats.hospitals || 0, fill: '#6366f1' },
    { name: 'Doctors', count: stats.doctors || 0, fill: '#0ea5e9' },
    { name: 'Patients', count: stats.patients || 0, fill: '#10b981' },
    { name: 'Other Staff', count: stats.other_staff || 0, fill: '#a855f7' },
  ];

  const pieData = [
    { name: 'Doctors', value: stats.doctors || 0, color: '#0ea5e9' },
    { name: 'Patients', value: stats.patients || 0, color: '#10b981' },
    { name: 'Ancillary Staff', value: stats.other_staff || 0, color: '#a855f7' },
  ].filter(item => item.value > 0);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 relative transition-colors duration-300">
      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 w-72 bg-gradient-to-b from-indigo-950 to-slate-950 dark:from-slate-950 dark:to-slate-900 shadow-xl flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 pb-4 flex justify-between items-center">
            <div>
                <h1 className="text-white text-2xl font-bold flex items-center gap-2 tracking-tight">
                <Activity className="text-indigo-400 animate-pulse" /> MedicalAdmin
                </h1>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mt-2">Executive Network</p>
            </div>
            <button className="lg:hidden text-white hover:text-indigo-300 transition" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
            </button>
        </div>
        
        <div className="px-6 py-6 border-b border-indigo-900/30 mb-4">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-white font-bold border border-indigo-400/30">
                  {user.email.charAt(0).toUpperCase()}
               </div>
               <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate w-40">{user.email}</p>
                  <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">{user.role}</p>
               </div>
            </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
            <button onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition font-semibold text-sm ${activeTab === 'analytics' ? 'bg-indigo-600 shadow-lg text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>
                <LayoutDashboard className="h-5 w-5" /> Sub-System View
            </button>
            <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition font-semibold text-sm ${activeTab === 'profile' ? 'bg-indigo-600 shadow-lg text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>
                <UserCircle className="h-5 w-5" /> Credentials
            </button>
            {user.role === 'SUPERADMIN' && (
                <>
                <button onClick={() => { setActiveTab('add_hospital'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition font-semibold text-sm ${activeTab === 'add_hospital' ? 'bg-indigo-600 shadow-lg text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>
                    <Building2 className="h-5 w-5" /> New Hospital
                </button>
                <button onClick={() => { setActiveTab('add_user'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition font-semibold text-sm ${activeTab === 'add_user' ? 'bg-indigo-600 shadow-lg text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>
                    <PlusCircle className="h-5 w-5" /> Provision Staff
                </button>
                </>
            )}
            {user.role === 'ADMIN' && (
                <>
                <button onClick={() => { setActiveTab('manage_hospital'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition font-semibold text-sm ${activeTab === 'manage_hospital' ? 'bg-indigo-600 shadow-lg text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>
                    <Building2 className="h-5 w-5" /> Hospital Config
                </button>
                <button onClick={() => { setActiveTab('add_user'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition font-semibold text-sm ${activeTab === 'add_user' ? 'bg-indigo-600 shadow-lg text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>
                    <PlusCircle className="h-5 w-5" /> Provision Staff
                </button>
                </>
            )}
        </nav>

        <div className="p-4 mt-auto">
            <button onClick={() => { localStorage.removeItem('access_token'); navigate('/login'); }} className="flex items-center gap-3 w-full px-4 py-3 text-indigo-200 hover:text-red-400 hover:bg-white/5 rounded-xl transition font-semibold text-sm">
               <LogOut className="h-5 w-5" /> Secure Logout
            </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto flex flex-col">
         <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 px-6 md:px-10 py-6 sticky top-0 z-20 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300" onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                        {activeTab === 'analytics' && 'Operational Analytics'}
                        {activeTab === 'profile' && 'Administrative Credentials'}
                        {activeTab === 'manage_hospital' && 'Facility Configuration'}
                        {activeTab === 'add_hospital' && 'Add Hospital Node'}
                        {activeTab === 'add_user' && 'Provision Staff Account'}
                    </h1>
                </div>
             </div>
             
             <div className="flex items-center gap-3">
                 <ThemeToggle />
                 {activeTab === 'analytics' && user.role === 'SUPERADMIN' && (
                     <button onClick={() => setActiveTab('add_hospital')} className="hidden sm:flex bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 transition items-center gap-2 uppercase tracking-wider">
                        <PlusCircle className="h-4 w-4" /> Add Node
                     </button>
                 )}
             </div>
         </header>

         <div className="p-6 md:p-10 max-w-6xl w-full mx-auto flex-1">
            {activeTab === 'profile' && <UserProfile user={user} />}

            {activeTab === 'analytics' && (
                <>
                {user.role === 'SUPERADMIN' ? (
                   <>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                       <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col justify-center transition hover:shadow-md">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Hospitals</h3>
                              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl"><Building2 className="h-5 w-5"/></div>
                           </div>
                           <p className="text-4xl font-black text-slate-800 dark:text-white">{stats.hospitals}</p>
                           <p className="text-emerald-500 font-bold text-[10px] mt-2 flex items-center gap-1 uppercase tracking-wider"><CheckCircle2 className="h-3.5 w-3.5"/> All Nodes Live</p>
                       </div>
                       <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col justify-center transition hover:shadow-md">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Doctors</h3>
                              <div className="p-2 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 rounded-xl"><Users className="h-5 w-5"/></div>
                           </div>
                           <p className="text-4xl font-black text-slate-800 dark:text-white">{stats.doctors}</p>
                           <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] mt-2 uppercase tracking-wider">OPD Providers</p>
                       </div>
                       <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col justify-center transition hover:shadow-md">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Patients</h3>
                              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl"><Users className="h-5 w-5"/></div>
                           </div>
                           <p className="text-4xl font-black text-slate-800 dark:text-white">{stats.patients}</p>
                           <p className="text-emerald-500 font-bold text-[10px] mt-2 uppercase tracking-wider">Encrypted EHRs</p>
                       </div>
                       <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col justify-center transition hover:shadow-md">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Staff</h3>
                              <div className="p-2 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-xl"><Users className="h-5 w-5"/></div>
                           </div>
                           <p className="text-4xl font-black text-slate-800 dark:text-white">{stats.other_staff}</p>
                           <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] mt-2 uppercase tracking-wider">Pharm & Lab Techs</p>
                       </div>
                   </div>

                   {/* Charts Layout Section */}
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                       <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6 shadow-sm lg:col-span-2 min-h-[300px]">
                           <h3 className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-6">Ecosystem Metric Distribution</h3>
                           <div className="h-64">
                               <ResponsiveContainer width="100%" height="100%">
                                   <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                       <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                       <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                       <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }} />
                                       <Bar dataKey="count" radius={[12, 12, 0, 0]} barSize={40}>
                                           {chartData.map((entry, index) => (
                                               <Cell key={`cell-${index}`} fill={entry.fill} />
                                           ))}
                                       </Bar>
                                   </BarChart>
                               </ResponsiveContainer>
                           </div>
                       </div>
                       
                       <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
                           <h3 className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-6">Personnel Composition</h3>
                           {pieData.length > 0 ? (
                               <div className="flex-1 flex flex-col justify-center items-center">
                                   <div className="h-44 w-full">
                                       <ResponsiveContainer width="100%" height="100%">
                                           <PieChart>
                                               <Pie
                                                   data={pieData}
                                                   cx="50%"
                                                   cy="50%"
                                                   innerRadius={50}
                                                   outerRadius={70}
                                                   paddingAngle={4}
                                                   dataKey="value"
                                               >
                                                   {pieData.map((entry, index) => (
                                                       <Cell key={`cell-${index}`} fill={entry.color} />
                                                   ))}
                                               </Pie>
                                               <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '11px' }} />
                                           </PieChart>
                                       </ResponsiveContainer>
                                   </div>
                                   <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                       {pieData.map((item, idx) => (
                                           <span key={idx} className="flex items-center gap-1.5">
                                               <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                                               {item.name}: {item.value}
                                           </span>
                                       ))}
                                   </div>
                               </div>
                           ) : (
                               <div className="flex-grow flex items-center justify-center text-slate-400 italic text-sm font-semibold py-12">
                                   No personnel data to map.
                               </div>
                           )}
                       </div>
                   </div>

                   <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                       <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                           <h3 className="font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2"><Users className="h-5 w-5 text-indigo-500"/> Global Patient Registry</h3>
                           <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stats?.patient_list?.length || 0} Registered</span>
                       </div>
                       <div className="overflow-x-auto">
                           <table className="w-full text-left text-sm min-w-[600px]">
                               <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-widest border-b dark:border-slate-850">
                                   <tr>
                                       <th className="px-6 py-4">Display ID</th>
                                       <th className="px-6 py-4">Full Name</th>
                                       <th className="px-6 py-4">Identifier (Email)</th>
                                       <th className="px-6 py-4">Assigned Node</th>
                                   </tr>
                                </thead>
                               <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                   {stats?.patient_list?.map(p => (
                                       <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition">
                                           <td className="px-6 py-4 font-black text-indigo-600 dark:text-indigo-400">{p.display_id || 'PAT-NEW'}</td>
                                           <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{p.full_name || 'System Generated'}</td>
                                           <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">{p.email}</td>
                                           <td className="px-6 py-4"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tighter">{p.hospital_id || 'ROOT'}</span></td>
                                       </tr>
                                   ))}
                                   {(!stats?.patient_list || stats.patient_list.length === 0) && (
                                       <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-bold dark:text-slate-600">No global patient data available.</td></tr>
                                   )}
                               </tbody>
                           </table>
                       </div>
                   </div>
                     </>
                  ) : (
                     <div className="space-y-8">
                         <div className="bg-gradient-to-tr from-indigo-900 to-indigo-850 dark:from-slate-900 dark:to-slate-850 rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
                             <div className="relative z-10">
                                 <h2 className="text-3xl font-black mb-2">{hospitalData?.name || 'My Hospital'}</h2>
                                 <p className="text-indigo-200 dark:text-slate-300 font-medium max-w-md">{hospitalData?.address}, {hospitalData?.location_city}</p>
                                 <div className="mt-6 flex flex-wrap gap-3">
                                     <span className="bg-white/10 px-3.5 py-1.5 rounded-2xl text-[10px] font-black border border-white/10 uppercase tracking-wider text-indigo-200 dark:text-slate-300">Active Node</span>
                                     <span className="bg-white/10 px-3.5 py-1.5 rounded-2xl text-[10px] font-black border border-white/10 uppercase tracking-wider text-indigo-200 dark:text-slate-300 truncate max-w-xs">Admin: {user.email}</span>
                                 </div>
                             </div>
                             <Building2 className="absolute -right-10 -bottom-10 h-64 w-64 text-white/5 -rotate-12 pointer-events-none" />
                         </div>

                         <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                             <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Activity className="text-indigo-500 h-5 w-5"/> Registered OPD Services</h3>
                             <div className="flex flex-wrap gap-2.5">
                                 {hospitalData?.departments?.map(d => (
                                     <span key={d} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider border border-slate-200/50 dark:border-slate-700/50">{d}</span>
                                 ))}
                                 {(!hospitalData?.departments || hospitalData.departments.length === 0) && <p className="text-slate-400 dark:text-slate-500 font-medium">No OPD services configured for this node yet.</p>}
                             </div>
                             <button onClick={() => setActiveTab('manage_hospital')} className="mt-8 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-wider flex items-center gap-1 hover:underline">Provision New Services →</button>
                         </div>
                     </div>
                  )}
                  </>
            )}

            {activeTab === 'manage_hospital' && (
                <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-850 max-w-2xl mx-auto transition-colors duration-300">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Facility Service Config</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Configure the active medical divisions or specialties offered at this location.</p>
                    </div>
                    <form onSubmit={handleUpdateDepartments} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest ml-1">OPD Departments (Comma separated)</label>
                            <textarea 
                                name="departments" 
                                required 
                                defaultValue={hospitalData?.departments?.join(', ')}
                                placeholder="Cardiology, Neurology, Pediatrics..." 
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition min-h-[120px] font-semibold text-slate-800 dark:text-white" 
                            />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition transform hover:-translate-y-0.5 uppercase tracking-wider text-xs">Commit Configurations →</button>
                    </form>
                </div>
            )}

            {activeTab === 'add_hospital' && (
                <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-855 max-w-2xl mx-auto transition-colors duration-300">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Hospital Node Integration</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium font-semibold">Integrate a healthcare entity into the distributed network core.</p>
                    </div>
                    <form onSubmit={handleAddHospital} className="space-y-6">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Entity Name</label>
                                <input name="name" required placeholder="e.g. City General Hospital" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-slate-800 dark:text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">City</label>
                                <input name="city" required placeholder="e.g. New York" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-slate-800 dark:text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                                <input name="email" type="email" required placeholder="admin@hospital.com" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-slate-800 dark:text-white" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Facility Physical Address</label>
                            <input name="address" required placeholder="Full physical address..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-slate-800 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Departments (Comma separated)</label>
                            <input name="departments" required placeholder="Cardiology, Neurology, Orthopedics..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-slate-800 dark:text-white" />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition transform hover:-translate-y-0.5 uppercase tracking-wider text-xs">Initialize Integration →</button>
                    </form>
                </div>
            )}

            {activeTab === 'add_user' && (
                <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-855 max-w-2xl mx-auto transition-colors duration-300">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Credential Provisioning</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
                          {user.role === 'ADMIN' ? `Provision staff access for hospital node.` : 'Issue secure tokens and roles to medical personnel.'}
                        </p>
                    </div>
                    <form onSubmit={handleAddUser} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input name="full_name" required placeholder="e.g. Dr. Sarah Johnson" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-slate-800 dark:text-white" />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">User Identifier (Email)</label>
                                <input name="email" type="email" required placeholder="staff@hospital.com" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-slate-800 dark:text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Initial Password</label>
                                <input name="password" type="password" required placeholder="••••••••" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-slate-800 dark:text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Access Tier (Role)</label>
                                <select name="role" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-slate-700 dark:text-white border-r-[16px] border-r-transparent">
                                    <option value="DOCTOR">Medical Doctor</option>
                                    <option value="PHARMA">Pharmaceutical Staff</option>
                                    <option value="LAB_TECH">Lab Technician</option>
                                    <option value="PATIENT">Patient Account</option>
                                    {user.role === 'SUPERADMIN' && <option value="ADMIN">Local Administrator</option>}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Doctor Specialty <span className="text-slate-400 dark:text-slate-500 font-normal font-semibold">(if Doctor)</span></label>
                            <input name="specialty" placeholder="e.g. Cardiology, Neurology..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-slate-800 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Affiliated Hospital Location</label>
                            {user.role === 'SUPERADMIN' ? (
                                <select name="hospital_id" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-slate-700 dark:text-white border-r-[16px] border-r-transparent">
                                    <option value="">Select Hospital Node (Or root platform)</option>
                                    {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select>
                            ) : (
                                <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-slate-600 dark:text-slate-300 font-semibold text-sm">
                                    🏥 {hospitalData?.name || 'Your Hospital'} <span className="text-xs text-slate-400 dark:text-slate-500 ml-2 font-bold">(Auto assigned)</span>
                                </div>
                            )}
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition transform hover:-translate-y-0.5 uppercase tracking-wider text-xs">Provision Security Token →</button>
                    </form>
                </div>
            )}
         </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
