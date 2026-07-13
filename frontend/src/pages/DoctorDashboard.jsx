import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPlus, Stethoscope, Clock, CheckCircle2, ChevronRight, LogOut, FileSearch, UserCircle, Menu, X, Users, Activity } from 'lucide-react';
import api from '../services/api';
import UserProfile from '../components/UserProfile';
import ThemeToggle from '../components/ThemeToggle';
import { toast } from '../services/toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule'); // tabs: schedule, profile, prescribe, order_scan
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [completedScans, setCompletedScans] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.role !== 'DOCTOR') return navigate('/login');
        setUser(response.data);
        const [patientRes, apptRes, scanRes] = await Promise.all([
          api.get('/doctor/patients'),
          api.get('/doctor/appointments'),
          api.get('/doctor/scans/completed')
        ]);
        setPatients(patientRes.data);
        setAppointments(apptRes.data);
        setCompletedScans(scanRes.data);
      } catch (err) { 
        navigate('/login'); 
      }
    };
    fetchData();
  }, [navigate, activeTab]);

  const handlePrescribe = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const patientId = formData.get('patientId');
    const medicineDetail = formData.get('medicineDetail')?.trim();
    const instructions = formData.get('instructions')?.trim();

    if (!patientId || !medicineDetail || !instructions) {
      toast.error("Please fill all prescription fields.");
      return;
    }

    try {
      await api.post(`/doctor/prescribe?patient_id=${patientId}&medicine_id=${medicineDetail}&instructions=${instructions}`);
      toast.success("Prescription transmitted to Pharmacy System securely.");
      setActiveTab('schedule');
    } catch(err) { 
      toast.error("Transmission failed. Please check connection."); 
    }
  };

  const handleOrderScan = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const patientId = formData.get('patientId');
    const scanType = formData.get('scanType');
    const justification = formData.get('justification')?.trim();

    if (!patientId || !scanType || !justification) {
      toast.error("Scan modality and justification are required.");
      return;
    }

    try {
      await api.post(`/doctor/request_scan?patient_id=${patientId}&scan_type=${scanType}`);
      toast.success("Diagnostic scan ordered & dispatched to Lab Tech Queue.");
      setActiveTab('schedule');
    } catch(err) { 
      toast.error("Failed to submit scan request."); 
    }
  };

  if (!user) return <div className="flex h-screen items-center justify-center font-bold text-slate-500 bg-slate-50 dark:bg-slate-950">Authorizing...</div>;

  // Process Recharts data from active appointments
  const deptCaseload = appointments.reduce((acc, appt) => {
    const dept = appt.department || 'General';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(deptCaseload).map((dept, index) => {
    const colors = ['#0d9488', '#0ea5e9', '#6366f1', '#a855f7'];
    return {
      name: dept,
      caseload: deptCaseload[dept],
      fill: colors[index % colors.length]
    };
  });

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 relative transition-colors duration-300">
      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 w-64 bg-gradient-to-b from-teal-950 to-slate-950 dark:from-slate-950 dark:to-slate-900 shadow-xl flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white"><Stethoscope className="text-teal-400 animate-pulse" /> MedConnect</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">Doctor Portal</p>
          </div>
          <button className="lg:hidden text-white hover:text-teal-300 transition" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            <button onClick={() => { setActiveTab('schedule'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${activeTab === 'schedule' ? 'bg-teal-600 shadow-lg text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}>
               <Clock className="h-5 w-5" /> Today's Schedule
            </button>
            <button onClick={() => { setActiveTab('prescribe'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${activeTab === 'prescribe' ? 'bg-teal-600 shadow-lg text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}>
               <ListPlus className="h-5 w-5" /> Prescribe Medicine
            </button>
            <button onClick={() => { setActiveTab('order_scan'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${activeTab === 'order_scan' ? 'bg-teal-600 shadow-lg text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}>
               <FileSearch className="h-5 w-5" /> Request MRI/Labs
            </button>
            <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${activeTab === 'profile' ? 'bg-teal-600 shadow-lg text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}>
               <UserCircle className="h-5 w-5" /> My Profile
            </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => { localStorage.removeItem('access_token'); navigate('/login'); }} className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl font-semibold text-sm transition">
             <LogOut className="h-5 w-5" /> Secure Logout
          </button>
        </div>
      </div>

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center shadow-sm sticky top-0 z-30 transition-colors duration-300">
           <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">
                 {activeTab === 'schedule' && "Schedule Overview"}
                 {activeTab === 'prescribe' && "Write Prescription"}
                 {activeTab === 'order_scan' && "Diagnostic Request Intake"}
                 {activeTab === 'profile' && "Doctor Credentials"}
              </h1>
           </div>
           
           <div className="flex items-center gap-3">
              <ThemeToggle />
              <button onClick={() => setActiveTab('profile')} className="flex items-center gap-4 hover:opacity-85 transition">
                 <span className="h-10 w-10 bg-teal-100 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 rounded-full flex items-center justify-center font-black text-lg border border-teal-200/50 dark:border-teal-800">{user.email.charAt(0).toUpperCase()}</span>
              </button>
           </div>
        </header>

        <div className="p-6 md:p-8 max-w-5xl w-full mx-auto flex-1">
            {activeTab === 'profile' && <UserProfile user={user} />}

            {activeTab === 'schedule' && (
                <div className="space-y-8">
                  {/* CASLOAD GRAPH */}
                  {chartData.length > 0 && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-[220px]">
                          <h3 className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-6">Today's Caseload Distribution</h3>
                          <div className="h-44">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={chartData} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
                                      <Bar dataKey="caseload" radius={[8, 8, 0, 0]} barSize={32}>
                                          {chartData.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={entry.fill} />
                                          ))}
                                      </Bar>
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* CONSULTATION QUEUE */}
                      <section className="md:col-span-2 space-y-4">
                        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight uppercase"><Clock className="h-5 w-5 text-teal-600 dark:text-teal-400"/> Appointment Queue</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {appointments.length > 0 ? appointments.map(appt => (
                                <div key={appt.id} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
                                    <div className="mb-4">
                                        <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">{appt.display_id}</p>
                                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-base">Slot: {new Date(appt.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h3>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-1">Dept: {appt.department}</p>
                                    </div>
                                    <div className="flex items-center gap-2 border-t dark:border-slate-800 pt-4">
                                        <button onClick={() => { setSelectedPatientId(appt.patient_id); setActiveTab('prescribe'); }} className="flex-1 bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white text-[10px] font-black py-2.5 rounded-xl transition uppercase tracking-wider">Prescribe</button>
                                        <button onClick={() => { setSelectedPatientId(appt.patient_id); setActiveTab('order_scan'); }} className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-[10px] font-black py-2.5 rounded-xl transition uppercase tracking-wider">Order Scan</button>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 border-dashed border-2 border-slate-200 dark:border-slate-800 rounded-3xl">
                                    <Clock className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700 mb-3"/>
                                    <p className="text-slate-400 dark:text-slate-500 font-bold text-sm">No consultations scheduled.</p>
                                </div>
                            )}
                        </div>
                      </section>

                      {/* PATIENT ROSTER */}
                      <section className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight uppercase"><Users className="h-5 w-5 text-teal-600 dark:text-teal-400"/> Roster</h2>
                            <input 
                                type="text" 
                                placeholder="Search email..." 
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-sm focus:ring-2 focus:ring-teal-500 outline-none w-full font-semibold text-xs text-slate-800 dark:text-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                           {patients.filter(p => p.email.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                             <div key={p.id} onClick={() => { setSelectedPatientId(p.id); setActiveTab('prescribe'); }} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                   <div className="h-9 w-9 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center font-black flex-shrink-0">{p.email.charAt(0).toUpperCase()}</div>
                                   <div className="overflow-hidden">
                                      <h3 className="font-bold text-slate-850 dark:text-slate-250 text-xs truncate w-32 group-hover:text-teal-500 transition">{p.full_name || p.email}</h3>
                                      <p className="text-[9px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">{p.display_id || 'REF-PAT'}</p>
                                   </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-teal-500 transition flex-shrink-0"/>
                             </div>
                           ))}
                           {patients.length === 0 && <p className="text-slate-400 dark:text-slate-500 italic text-xs py-4 text-center font-bold">No patients in roster.</p>}
                        </div>
                      </section>
                  </div>

                  {/* LAB DISPATCH CENTER */}
                  <section className="bg-slate-900 rounded-[2rem] p-8 shadow-xl overflow-hidden relative border border-white/5">
                    <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 tracking-tight uppercase relative z-10"><CheckCircle2 className="h-5 w-5 text-teal-400"/> Lab Dispatch Center</h2>
                    <div className="space-y-3 relative z-10">
                        {completedScans.length > 0 ? completedScans.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition group">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="p-2.5 bg-teal-400/10 rounded-xl text-teal-400 transition group-hover:scale-105 flex-shrink-0"><FileSearch className="h-5 w-5"/></div>
                                    <div className="overflow-hidden">
                                        <p className="font-black text-white uppercase tracking-wider text-xs">{s.scan_type} RESULT </p>
                                        <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5 truncate">ID: {s.display_id} • PATIENT REF: {s.patient_id}</p>
                                    </div>
                                </div>
                                <button className="bg-teal-500 text-white text-[9px] font-black px-4 py-2 rounded-xl hover:bg-teal-400 transition flex-shrink-0 uppercase tracking-widest">ACCESS</button>
                            </div>
                        )) : (
                            <div className="text-center py-8">
                                <FileSearch className="h-8 w-8 mx-auto text-white/10 mb-3"/>
                                <p className="text-slate-500 font-bold italic text-xs">Waiting for laboratory submissions...</p>
                            </div>
                        )}
                    </div>
                    <Activity className="absolute -right-12 -bottom-12 h-64 w-64 text-white/5 rotate-12 pointer-events-none" />
                  </section>
                </div>
            )}

            {activeTab === 'prescribe' && (
                <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-850 max-w-2xl mx-auto transition-colors duration-300">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight flex items-center gap-2"><ListPlus className="h-6 w-6 text-teal-600"/> Digital Prescription</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Transmit medical instructions securely to the pharmacy inventory node.</p>
                    </div>
                    <form onSubmit={handlePrescribe} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Select Patient</label>
                            {patients.length > 0 ? (
                                <select required name="patientId" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition font-semibold text-slate-700 dark:text-white border-r-[16px] border-r-transparent">
                                    <option value="">Select patient from your roster...</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.full_name || p.email} ({p.display_id || 'N/A'})</option>)}
                                </select>
                            ) : (
                                <input required name="patientId" type="text" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} placeholder="Patient ID (no patients loaded)" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition font-semibold text-slate-800 dark:text-white" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Pharmacopoeia Detail (Medicine Name)</label>
                            <input required name="medicineDetail" type="text" placeholder="e.g. Paracetamol 500mg" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition font-semibold text-slate-800 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Clinical Instructions</label>
                            <textarea required name="instructions" placeholder="Detailed dosage and periodicity..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition h-32 font-semibold text-slate-800 dark:text-white"></textarea>
                        </div>
                        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-teal-600/20 transition uppercase tracking-wider text-xs">Authorize & Transmit →</button>
                    </form>
                </div>
            )}

            {activeTab === 'order_scan' && (
                <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-855 max-w-2xl mx-auto transition-colors duration-300">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight flex items-center gap-2"><FileSearch className="h-6 w-6 text-slate-700 dark:text-slate-300"/> Diagnostic Requisition</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Submit imaging or lab report requisitions directly to Lab centers.</p>
                    </div>
                    <form onSubmit={handleOrderScan} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Select Patient</label>
                            {patients.length > 0 ? (
                                <select required name="patientId" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none transition font-semibold text-slate-700 dark:text-white border-r-[16px] border-r-transparent">
                                    <option value="">Select patient from your roster...</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.full_name || p.email} ({p.display_id || 'N/A'})</option>)}
                                </select>
                            ) : (
                                <input required name="patientId" type="text" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} placeholder="Patient ID" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition font-semibold text-slate-800 dark:text-white" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Modality / Diagnostic Tier</label>
                            <select required name="scanType" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition font-semibold text-slate-700 dark:text-white border-r-[16px] border-r-transparent">
                                 <option value="" disabled selected>Select Procedure</option>
                                 <option value="MRI">High-Res MRI</option>
                                 <option value="CT">Contrast CT Scan</option>
                                 <option value="XRAY">Diagnostic X-Ray</option>
                                 <option value="BLOOD_WORK">Comprehensive Blood Panel</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Clinical Justification</label>
                            <textarea required name="justification" placeholder="Indication for requested procedure..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition h-24 font-semibold text-slate-800 dark:text-white"></textarea>
                        </div>
                        <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-slate-900/20 transition transform hover:-translate-y-0.5 uppercase tracking-wider text-xs">Commit Request to Lab Queue →</button>
                    </form>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
