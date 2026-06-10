import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPlus, Stethoscope, Clock, CheckCircle2, ChevronRight, LogOut, FileSearch, UserCircle, Menu, X, Users, Activity } from 'lucide-react';
import api from '../services/api';
import UserProfile from '../components/UserProfile';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule'); // tabs: schedule, profile, prescribe, order_scan
  const [statusMessage, setStatusMessage] = useState("");
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
      } catch (err) { navigate('/login'); }
    };
    fetchData();
  }, [navigate]);

  const handlePrescribe = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await api.post(`/doctor/prescribe?patient_id=${formData.get('patientId')}&medicine_id=${formData.get('medicineDetail')}&instructions=${formData.get('instructions')}`);
      setStatusMessage("Prescription transmitted to Pharma System securely.");
      setTimeout(() => setActiveTab('schedule'), 2500);
    } catch(err) { setStatusMessage("Transmission Failed."); }
  };

  const handleOrderScan = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await api.post(`/doctor/request_scan?patient_id=${formData.get('patientId')}&scan_type=${formData.get('scanType')}`);
      setStatusMessage("Scan ordered and injected into Lab Technician Pending Queue.");
      setTimeout(() => setActiveTab('schedule'), 2500);
    } catch(err) { setStatusMessage("Failed to order scan."); }
  };

  if (!user) return <div className="flex h-screen items-center justify-center font-bold text-slate-500">Authorizing...</div>;

  return (
    <div className="flex h-screen bg-slate-50 relative">
      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-200 flex flex-col shadow-xl z-50 transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white"><Stethoscope className="text-teal-400" /> MedConnect</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Doctor Portal</p>
          </div>
          <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
           <button onClick={() => { setActiveTab('schedule'); setStatusMessage(""); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'schedule' ? 'bg-teal-500/20 text-teal-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <Clock className="h-5 w-5" /> Today's Schedule
            </button>
            <button onClick={() => { setActiveTab('prescribe'); setStatusMessage(""); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'prescribe' ? 'bg-teal-500/20 text-teal-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <ListPlus className="h-5 w-5" /> Prescribe Medicine
            </button>
            <button onClick={() => { setActiveTab('order_scan'); setStatusMessage(""); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'order_scan' ? 'bg-teal-500/20 text-teal-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <FileSearch className="h-5 w-5" /> Request MRI/Labs
            </button>
            <button onClick={() => { setActiveTab('profile'); setStatusMessage(""); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'profile' ? 'bg-teal-500/20 text-teal-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <UserCircle className="h-5 w-5" /> My Profile
            </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => { localStorage.removeItem('access_token'); navigate('/login'); }} className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 font-medium">
             <LogOut className="h-5 w-5" /> Log Out
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 p-6 flex justify-between items-center shadow-sm sticky top-0 z-30">
           <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                 {activeTab === 'schedule' && "Schedule Overview"}
                 {activeTab === 'prescribe' && "Write Prescription"}
                 {activeTab === 'order_scan' && "Diagnostic Request Intake"}
                 {activeTab === 'profile' && "Doctor Credentials"}
              </h1>
           </div>
           <button onClick={() => setActiveTab('profile')} className="flex items-center gap-4 hover:opacity-80 transition cursor-pointer">
              <span className="h-10 w-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-lg">{user.email.charAt(0).toUpperCase()}</span>
           </button>
        </header>

        <div className="p-8 max-w-5xl mx-auto space-y-8">
            {activeTab === 'profile' && <UserProfile user={user} />}

            {activeTab === 'schedule' && (
                <>
                  <section className="mb-10">
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 tracking-tight"><Clock className="h-6 w-6 text-teal-600"/> Appointment Queue</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {appointments.length > 0 ? appointments.map(appt => (
                            <div key={appt.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">{appt.display_id}</p>
                                        <h3 className="font-black text-slate-800 text-lg">Slot: {new Date(appt.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Dept: {appt.department}</p>
                                    </div>
                                    <div className="bg-teal-50 text-teal-600 p-2 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition"><Users className="h-5 w-5"/></div>
                                </div>
                                <div className="flex items-center gap-3 border-t pt-4">
                                    <button onClick={() => { setSelectedPatientId(appt.patient_id); setActiveTab('prescribe'); }} className="flex-1 bg-teal-600 text-white text-[10px] font-black py-2 rounded-lg hover:bg-teal-700 transition uppercase tracking-widest">Prescribe</button>
                                    <button onClick={() => { setSelectedPatientId(appt.patient_id); setActiveTab('order_scan'); }} className="flex-1 bg-slate-900 text-white text-[10px] font-black py-2 rounded-lg hover:bg-slate-800 transition uppercase tracking-widest">Order Scan</button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-dashed border-2 border-slate-200">
                                <Clock className="h-10 w-10 mx-auto text-slate-300 mb-3"/>
                                <p className="text-slate-400 font-bold">No consultations scheduled for today.</p>
                            </div>
                        )}
                    </div>
                  </section>

                  <section className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 tracking-tight"><Users className="h-5 w-5 text-teal-600"/> My Patient Roster</h2>
                        <input 
                            type="text" 
                            placeholder="Locate patient by email..." 
                            className="bg-white border-slate-200 p-3 rounded-2xl shadow-sm focus:ring-2 focus:ring-teal-500 outline-none w-full md:w-80 font-bold text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {patients.filter(p => p.email.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                         <div key={p.id} onClick={() => { setSelectedPatientId(p.id); setActiveTab('prescribe'); }} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between transition hover:-translate-y-1 hover:shadow-md cursor-pointer group">
                            <div className="flex items-center gap-4">
                               <div className="h-10 w-10 bg-gradient-to-tr from-teal-500 to-emerald-400 text-white rounded-full flex items-center justify-center font-black shadow-sm">{p.email.charAt(0).toUpperCase()}</div>
                               <div className="overflow-hidden">
                                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-teal-600 transition truncate w-32">{p.email}</h3>
                                  <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{p.display_id || 'REF-PAT'}</p>
                               </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-teal-500 transition"/>
                         </div>
                       ))}
                    </div>
                  </section>

                  <section className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative border border-white/5">
                    <h2 className="text-xl font-black text-white mb-8 flex items-center gap-2 tracking-tight relative z-10"><CheckCircle2 className="h-6 w-6 text-teal-400"/> Lab Dispatch Center</h2>
                    <div className="space-y-4 relative z-10">
                        {completedScans.length > 0 ? completedScans.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition group">
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-teal-400/10 rounded-2xl text-teal-400 transition group-hover:scale-110"><FileSearch className="h-6 w-6"/></div>
                                    <div>
                                        <p className="font-black text-white uppercase tracking-widest text-xs mb-1">{s.scan_type} RESULT </p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {s.display_id} • PATIENT REF: {s.patient_id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="bg-teal-500 text-white text-[10px] font-black px-5 py-2.5 rounded-xl hover:bg-teal-400 transition shadow-lg shadow-teal-500/20">ACCESS REPORT</button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <FileSearch className="h-10 w-10 mx-auto text-white/10 mb-4"/>
                                <p className="text-slate-500 font-bold italic text-sm">Waiting for laboratory submissions...</p>
                            </div>
                        )}
                    </div>
                    <Activity className="absolute -right-12 -bottom-12 h-64 w-64 text-white/5 rotate-12 pointer-events-none" />
                  </section>
                <section className="bg-white border rounded-2xl p-6 shadow-sm">
                   <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-teal-600"/> Rapid Actions</h2>
                   <div className="flex gap-4">
                      <button onClick={() => setActiveTab('prescribe')} className="flex-1 bg-slate-50 border border-slate-200 hover:border-teal-500 rounded-xl p-4 flex flex-col items-center text-center transition group">
                          <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:bg-teal-50 group-hover:text-teal-600 transition text-slate-500"><ListPlus className="h-6 w-6"/></div>
                          <span className="font-bold text-slate-700">Write Prescription</span>
                      </button>
                      <button onClick={() => setActiveTab('order_scan')} className="flex-1 bg-slate-50 border border-slate-200 hover:border-teal-500 rounded-xl p-4 flex flex-col items-center text-center transition group">
                          <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:bg-teal-50 group-hover:text-teal-600 transition text-slate-500"><FileSearch className="h-6 w-6"/></div>
                          <span className="font-bold text-slate-700">Order Lab/MRI Scan</span>
                      </button>
                   </div>
                </section>
                </>
            )}

            {activeTab === 'prescribe' && (
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-2xl mx-auto transform transition-all">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight flex items-center gap-2"><ListPlus className="h-6 w-6 text-teal-600"/> Digital Prescription</h2>
                        <p className="text-slate-500 font-medium">Transmit medical instructions securely to the centralized pharmacy node.</p>
                    </div>
                    <form onSubmit={handlePrescribe} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-widest text-[10px]">Select Patient</label>
                            {patients.length > 0 ? (
                                <select required name="patientId" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition font-bold text-slate-700 border-r-[16px] border-r-transparent">
                                    <option value="">Select patient from your roster...</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.full_name || p.email} ({p.display_id || 'N/A'})</option>)}
                                </select>
                            ) : (
                                <input required name="patientId" type="text" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} placeholder="Patient ID (no patients loaded)" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition font-bold" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-widest text-[10px]">Pharmacopoeia Detail (Medicine)</label>
                            <input required name="medicineDetail" type="text" placeholder="e.g. Paracetamol 500mg" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-widest text-[10px]">Clinical Instructions</label>
                            <textarea required name="instructions" placeholder="Detailed dosage and periodicity..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition h-32 font-medium"></textarea>
                        </div>
                        {statusMessage && <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl text-center font-black text-sm border border-teal-100 animate-pulse">{statusMessage}</div>}
                        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-teal-600/20 transition transform hover:-translate-y-1">Authorize & Transmit to Pharma →</button>
                    </form>
                </div>
            )}

            {activeTab === 'order_scan' && (
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-2xl mx-auto transform transition-all">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight flex items-center gap-2"><FileSearch className="h-6 w-6 text-slate-800"/> Diagnostic Requisition</h2>
                        <p className="text-slate-500 font-medium">Provision imaging or laboratory requests to the diagnostic sub-system.</p>
                    </div>
                    <form onSubmit={handleOrderScan} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-widest text-[10px]">Select Patient</label>
                            {patients.length > 0 ? (
                                <select required name="patientId" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition font-bold text-slate-700 border-r-[16px] border-r-transparent">
                                    <option value="">Select patient from your roster...</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.full_name || p.email} ({p.display_id || 'N/A'})</option>)}
                                </select>
                            ) : (
                                <input required name="patientId" type="text" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} placeholder="Patient ID" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition font-bold" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-widest text-[10px]">Modality / Diagnostic Tier</label>
                            <select required name="scanType" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition font-bold text-slate-700 border-r-[16px] border-r-transparent">
                                 <option value="" disabled selected>Select Procedure</option>
                                 <option value="MRI">High-Res MRI</option>
                                 <option value="CT">Contrast CT Scan</option>
                                 <option value="XRAY">Diagnostic X-Ray</option>
                                 <option value="BLOOD_WORK">Comprehensive Blood Panel</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-widest text-[10px]">Clinical Justification</label>
                            <textarea placeholder="Indication for requested procedure..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition h-24 font-medium"></textarea>
                        </div>
                        {statusMessage && <div className="p-4 bg-slate-100 text-slate-800 rounded-2xl text-center font-black text-sm border border-slate-200 animate-pulse">{statusMessage}</div>}
                        <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-slate-900/20 transition transform hover:-translate-y-1">Commit Request to Lab Queue →</button>
                    </form>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
