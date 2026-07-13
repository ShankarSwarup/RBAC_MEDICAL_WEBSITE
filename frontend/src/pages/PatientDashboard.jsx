import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Clock, FileText, Download, Activity, FileStack, UserCircle, Menu, X, ChevronRight, Search } from 'lucide-react';
import api from '../services/api';
import UserProfile from '../components/UserProfile';
import ThemeToggle from '../components/ThemeToggle';
import { toast } from '../services/toast';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [records, setRecords] = useState({ prescriptions: [], scans: [] });
  const [appointments, setAppointments] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Booking state
  const [showBooking, setShowBooking] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [department, setDepartment] = useState("");
  
  // Medicine Search State
  const [medQuery, setMedQuery] = useState("");
  const [medInfo, setMedInfo] = useState(null);
  const [medLoading, setMedLoading] = useState(false);

  // EHR Preview Modal State
  const [showEHRPreview, setShowEHRPreview] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.role !== 'PATIENT') return navigate('/login');
        setUser(response.data);
        fetchData();
        const cityRes = await api.get('/hospitals/cities');
        setCities(cityRes.data.cities || []);
      } catch (err) { 
        navigate('/login'); 
      }
    };
    fetchUser();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const recRes = await api.get('/patients/my_records');
      setRecords(recRes.data);
      const apptRes = await api.get('/patients/my_appointments');
      setAppointments(apptRes.data);
    } catch(err) { 
      console.error(err); 
    }
  };

  const handleSearchHospitals = async (city) => {
    setSelectedCity(city);
    try {
      const url = city ? `/hospitals/?city=${city}` : `/hospitals/`;
      const res = await api.get(url);
      setHospitals(res.data);
      setSelectedHospital(null);
      setDoctors([]);
    } catch(err) { 
      toast.error("Could not fetch hospitals for selected location.");
    }
  };

  const handleSelectHospital = (hosp) => {
    setSelectedHospital(hosp);
    setDepartment("");
    setDoctors([]);
  };

  const fetchDoctors = async (dept) => {
    setDepartment(dept);
    try {
      const res = await api.get(`/patients/doctors?hospital_id=${selectedHospital.id}&department=${dept}`);
      setDoctors(res.data);
    } catch(err) { 
      toast.error("Failed to load specialty physicians.");
    }
  };

  const handleBook = async (docId) => {
    try {
      await api.post('/patients/book_appointment', {
        doctor_id: docId,
        hospital_id: selectedHospital.id,
        appointment_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        department: department
      });
      toast.success("Appointment booked successfully!");
      setShowBooking(false);
      fetchData();
    } catch(err) { 
      toast.error("Booking reservation failed."); 
    }
  };

  const handleSearchMedicine = async (e) => {
    e.preventDefault();
    const query = medQuery.trim();
    if (!query) {
      toast.error("Please enter a medicine name to lookup.");
      return;
    }
    setMedLoading(true);
    setMedInfo(null);
    try {
      const res = await api.get(`/patients/medicine_info?query=${query}`);
      if (res.data.error) {
        toast.error(res.data.error);
      } else {
        setMedInfo(res.data);
        toast.success("Medicine index retrieved successfully.");
      }
    } catch(err) { 
      toast.error("Could not retrieve medicine data."); 
    }
    setMedLoading(false);
  };

  const handleDownloadEHR = async () => {
     try {
       const response = await api.get('/patients/export_ehr', { responseType: 'blob' });
       const url = window.URL.createObjectURL(new Blob([response.data]));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download', `EHR_${user.display_id || user.id}.md`);
       document.body.appendChild(link);
       link.click();
       link.remove();
       toast.success("EHR export downloaded successfully.");
     } catch (err) { 
       toast.error("Failed to export record."); 
     }
  };

  if (!user) return <div className="flex h-screen items-center justify-center font-bold text-slate-500 bg-slate-50 dark:bg-slate-950">Loading Portal...</div>;

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
      <div className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-50 transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="p-8 border-b border-slate-800 flex flex-col items-center relative">
            <button className="lg:hidden absolute top-4 right-4 text-white hover:text-sky-300 transition" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </button>
            <div className="h-16 w-16 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl mb-3">{(user.full_name || user.email).charAt(0).toUpperCase()}</div>
            <h2 className="text-white font-bold text-base text-center truncate w-full px-2">{user.full_name || 'Patient'}</h2>
            <p className="text-slate-400 text-xs mt-1 font-semibold">{user.display_id || 'Patient Portal'}</p>
         </div>
         <nav className="flex-1 p-4 space-y-2 mt-4">
            <button onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${activeTab === 'overview' ? 'bg-sky-500/20 text-sky-400 shadow-sm' : 'text-slate-300 hover:bg-slate-850 hover:text-white'}`}>
               <Activity className="h-5 w-5" /> Health Overview
            </button>
            <button onClick={() => { setActiveTab('appointments'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${activeTab === 'appointments' ? 'bg-sky-500/20 text-sky-400 shadow-sm' : 'text-slate-300 hover:bg-slate-855 hover:text-white'}`}>
               <Calendar className="h-5 w-5" /> Appointments
            </button>
            <button onClick={() => { setActiveTab('records'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${activeTab === 'records' ? 'bg-sky-500/20 text-sky-400 shadow-sm' : 'text-slate-300 hover:bg-slate-855 hover:text-white'}`}>
               <FileStack className="h-5 w-5" /> Records & Scans
            </button>
            <button onClick={() => { setActiveTab('medicine'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${activeTab === 'medicine' ? 'bg-sky-500/20 text-sky-400 shadow-sm' : 'text-slate-300 hover:bg-slate-855 hover:text-white'}`}>
               <Activity className="h-5 w-5" /> Medicine Guide
            </button>
            <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${activeTab === 'profile' ? 'bg-sky-500/20 text-sky-400 shadow-sm' : 'text-slate-300 hover:bg-slate-855 hover:text-white'}`}>
               <UserCircle className="h-5 w-5" /> Verification
            </button>
         </nav>
         <div className="p-4 border-t border-slate-800">
              <button onClick={() => { localStorage.removeItem('access_token'); navigate('/login'); }} className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-850 rounded-xl transition font-semibold text-sm">
                <LogOut className="h-5 w-5" /> Secure Logout
              </button>
         </div>
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center sticky top-0 z-20 transition-colors duration-300">
            <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">
                    {activeTab === 'overview' && "Welcome Back"}
                    {activeTab === 'appointments' && "Appointment Schedule"}
                    {activeTab === 'records' && "Document Archive"}
                    {activeTab === 'medicine' && "Pharmacological Guide"}
                    {activeTab === 'profile' && "Patient Protocol Config"}
                </h1>
            </div>
            <div className="flex gap-2">
                <ThemeToggle />
                <button onClick={() => setShowEHRPreview(true)} className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-black shadow-lg shadow-sky-500/20 px-4 py-2.5 rounded-xl flex items-center gap-2 transition uppercase tracking-wider">
                   <FileText className="h-4 w-4"/> EHR Preview
                </button>
                <button onClick={handleDownloadEHR} className="hidden sm:flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black shadow-sm px-4 py-2.5 rounded-xl items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition uppercase tracking-wider">
                   <Download className="h-4 w-4"/> Export (MD)
                </button>
            </div>
          </header>

          <div className="p-6 md:p-8 max-w-6xl w-full mx-auto flex-1 overflow-y-auto pb-24">
              {showBooking && (
                  <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Find Care Nearby</h2>
                        <button onClick={() => setShowBooking(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"><X /></button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">1. Select City</label>
                            <select onChange={(e) => handleSearchHospitals(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 transition outline-none font-bold text-slate-700 dark:text-slate-350 border-r-[16px] border-r-transparent">
                                <option value="">ALL CITIES / SHOW ALL</option>
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">2. Select Hospital Node</label>
                            <select onChange={(e) => handleSelectHospital(hospitals.find(h => h.id === e.target.value))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 transition outline-none font-bold text-slate-700 dark:text-slate-350 border-r-[16px] border-r-transparent">
                                <option value="">{hospitals.length === 0 ? 'SELECT CITY...' : 'CHOOSE FACILITY...'}</option>
                                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name} ({h.location_city})</option>)}
                            </select>
                        </div>

                        <div className={`space-y-2 transition-all ${!selectedHospital ? 'opacity-40 pointer-events-none' : ''}`}>
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">3. Department specialty</label>
                            <select onChange={(e) => fetchDoctors(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 transition outline-none font-bold text-slate-700 dark:text-slate-350 border-r-[16px] border-r-transparent">
                                <option value="">CHOOSE OPD...</option>
                                {selectedHospital?.departments?.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    {doctors.length > 0 && (
                        <div className="pt-6 border-t dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 ml-1">Available Specialists</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {doctors.map(doc => (
                                    <div key={doc.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex justify-between items-center group hover:border-sky-400 dark:hover:border-sky-500 transition cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center font-bold">{doc.full_name?.charAt(0) || 'D'}</div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{doc.full_name || 'Specialist'}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{doc.specialty}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleBook(doc.id)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sky-600 dark:text-sky-400 text-xs font-black px-4 py-2 rounded-lg hover:bg-sky-500 dark:hover:bg-sky-600 hover:text-white transition shadow-sm uppercase tracking-wider">BOOK SLOT</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                  </div>
              )}

              {activeTab === 'profile' && <UserProfile user={user} />}

              {activeTab === 'appointments' && (
                  <div className="space-y-4">
                     <h2 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-wider"><Calendar className="h-5 w-5 text-sky-500" /> Upcoming Consultations</h2>
                     {appointments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                          {appointments.map(appt => (
                              <div key={appt.id} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6 text-slate-800 dark:text-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                                 <div>
                                    <div className="flex justify-between items-start mb-4">
                                      <div>
                                        <p className="text-sky-600 dark:text-sky-400 font-black text-[10px] uppercase tracking-widest mb-1">{appt.display_id || 'Booking ID'}</p>
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white">Consultation - {appt.department || 'General'}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mt-1">Doctor ID: {appt.doctor_id}</p>
                                      </div>
                                      <div className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${appt.status === 'SCHEDULED' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>{appt.status}</div>
                                    </div>
                                 </div>
                                 <div className="flex gap-4 border-t dark:border-slate-800 pt-4 mt-2">
                                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold"><Calendar className="h-4 w-4 text-sky-500"/> {new Date(appt.appointment_date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold"><Clock className="h-4 w-4 text-sky-500"/> {new Date(appt.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                 </div>
                              </div>
                          ))}
                        </div>
                     ) : (
                        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border-dashed border-2 border-slate-200 dark:border-slate-800 shadow-sm">
                           <Calendar className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                           <p className="font-bold text-slate-400 dark:text-slate-500">No appointments scheduled.</p>
                           <button onClick={() => setShowBooking(true)} className="mt-4 text-sky-500 dark:text-sky-400 font-black text-xs uppercase tracking-wider hover:underline">Book Your First Appointment →</button>
                        </div>
                     )}
                  </div>
              )}

              {activeTab === 'records' && (
                  <div className="space-y-8">
                     <div>
                        <h2 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wider"><FileStack className="h-5 w-5 text-sky-500" /> Medical Prescriptions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {records.prescriptions.length > 0 ? records.prescriptions.map(p => (
                                <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-sky-300 transition flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="h-8 w-8 bg-sky-50 dark:bg-sky-950/30 rounded-lg flex items-center justify-center"><Activity className="h-4.5 w-4.5 text-sky-500"/></div>
                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">{p.display_id}</span>
                                        </div>
                                        <h4 className="font-black text-slate-800 dark:text-white text-base mb-1">{p.medicine_id}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-4 leading-relaxed">{p.instructions}</p>
                                    </div>
                                    <div className="flex justify-between items-center border-t dark:border-slate-800 pt-4 mt-2">
                                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-1 rounded-xl uppercase tracking-wider">{p.status}</span>
                                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">{new Date(p.date_prescribed).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )) : <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 font-bold bg-white dark:bg-slate-900 rounded-3xl border-dashed border-2 dark:border-slate-850">No prescriptions found.</div>}
                        </div>
                     </div>
                     <div>
                        <h2 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wider"><Activity className="h-5 w-5 text-indigo-500" /> Lab Observations & Scans</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {records.scans.length > 0 ? records.scans.map(s => (
                                <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex justify-between items-center group hover:bg-slate-800 transition">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="h-11 w-11 bg-white/5 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-105 transition flex-shrink-0"><FileText className="h-5 w-5"/></div>
                                        <div className="overflow-hidden">
                                            <p className="text-white font-black tracking-tight text-sm truncate w-36">{s.scan_type}</p>
                                            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-0.5">{s.display_id || 'REF-SCN'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-3">
                                        <p className="text-slate-400 text-[10px] font-bold mb-2">{new Date(s.upload_date).toLocaleDateString()}</p>
                                        <button onClick={() => toast.info(`Viewing ${s.scan_type} report results.`)} className="bg-sky-500/10 text-sky-400 text-[9px] font-black px-3.5 py-2 rounded-xl border border-sky-400/20 group-hover:bg-sky-400 group-hover:text-white transition uppercase tracking-wider">VIEW</button>
                                    </div>
                                </div>
                            )) : <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 font-bold bg-white dark:bg-slate-900 rounded-3xl border-dashed border-2 dark:border-slate-850 shadow-sm">No clinical scan uploads.</div>}
                        </div>
                     </div>
                  </div>
              )}

              {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl border border-white/10">
                         <div className="relative z-10">
                             <h3 className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-2">Health Snapshot</h3>
                             <h2 className="text-3xl font-black text-white mb-2 leading-tight tracking-tight">Welcome back, <br/>{user.full_name || user.email}.</h2>
                             <p className="text-slate-400 text-xs font-semibold tracking-wider mt-1">{user.display_id} &bull; {appointments.length} appointment(s) registered</p>
                             <div className="flex flex-wrap gap-3 mt-8">
                                 <button onClick={() => setActiveTab('records')} className="bg-white text-indigo-950 hover:bg-slate-100 px-6 py-3 rounded-2xl font-black text-xs shadow-xl uppercase tracking-wider transition">View Full EHR</button>
                                 <button onClick={() => { setActiveTab('appointments'); setShowBooking(true); }} className="bg-white/10 text-white px-6 py-3 rounded-2xl font-black text-xs border border-white/10 hover:bg-white/20 uppercase tracking-wider transition">Book Appointment</button>
                             </div>
                         </div>
                         <Activity className="absolute -right-8 -bottom-8 h-48 w-48 text-white/5 rotate-12 pointer-events-none" />
                      </div>
                      
                      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4 transition">
                         <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner"><Activity className="h-8 w-8"/></div>
                         <div>
                             <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Clinical Ledger</p>
                             <h4 className="text-xl font-black text-slate-800 dark:text-white">{records.prescriptions.length} Prescriptions</h4>
                             <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">{records.scans.length} Lab Reports</p>
                         </div>
                         <button onClick={() => setActiveTab('medicine')} className="text-sky-500 dark:text-sky-400 text-xs font-black hover:underline uppercase tracking-wider">Open Drug Guide →</button>
                      </div>
                  </div>
              )}

              {activeTab === 'medicine' && (
                  <div className="space-y-8 max-w-3xl mx-auto">
                     <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-850">
                         <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2 tracking-tight">
                             <Activity className="text-sky-500 h-6 w-6"/> Drug Information Lookup
                         </h2>
                         <form onSubmit={handleSearchMedicine} className="flex flex-col sm:flex-row gap-3">
                             <input 
                                 value={medQuery}
                                 onChange={(e) => setMedQuery(e.target.value)}
                                 placeholder="Enter medicine (e.g. Advil, Aspirin)..." 
                                 className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none transition font-semibold text-slate-800 dark:text-white text-sm"
                             />
                             <button type="submit" disabled={medLoading} className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 sm:py-0 rounded-2xl font-black text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2">
                                 {medLoading ? (
                                     <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                 ) : 'SEARCH'}
                             </button>
                         </form>
                     </div>

                     {medInfo ? (
                         <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2.5rem] p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div>
                                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Pharmacological Profile</h3>
                                 <h2 className="text-2xl font-black text-slate-800 dark:text-white">{medInfo.name}</h2>
                             </div>
                             
                             <div className="grid grid-cols-1 gap-4">
                                 <div className="p-5 bg-sky-50 dark:bg-sky-950/20 rounded-2xl border border-sky-100 dark:border-sky-900/30">
                                     <h4 className="font-black text-sky-800 dark:text-sky-400 text-xs mb-2 uppercase tracking-wider flex items-center gap-2"><Activity className="h-4 w-4"/> Indications & Usage</h4>
                                     <p className="text-sky-900 dark:text-sky-300 text-sm leading-relaxed font-semibold">{medInfo.indications || medInfo.purpose || "Clinical indications not found."}</p>
                                 </div>

                                 {medInfo.warnings && (
                                     <div className="p-5 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                                         <h4 className="font-black text-red-800 dark:text-red-400 text-xs mb-2 uppercase tracking-wider flex items-center gap-2"><X className="h-4 w-4"/> Critical Warnings</h4>
                                         <p className="text-red-900 dark:text-red-300 text-sm leading-relaxed font-semibold">{medInfo.warnings}</p>
                                     </div>
                                 )}

                                 {medInfo.dosage && (
                                     <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                         <h4 className="font-black text-emerald-800 dark:text-emerald-400 text-xs mb-2 uppercase tracking-wider">Administrative Protocol</h4>
                                         <p className="text-emerald-900 dark:text-emerald-300 text-sm leading-relaxed font-semibold">{medInfo.dosage}</p>
                                     </div>
                                 )}
                             </div>
                             <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase text-center border-t dark:border-slate-800 pt-6 tracking-widest">Data Source: OpenFDA Pharmaceutical Index</p>
                         </div>
                     ) : !medLoading && (
                         <div className="py-16 text-center text-slate-400 dark:text-slate-500">
                             <Activity className="h-10 w-10 mx-auto mb-4 opacity-25" />
                             <p className="font-bold text-xs uppercase tracking-wider">Enquire brand/generic formulas above.</p>
                         </div>
                     )}
                  </div>
              )}
          </div>
      </main>

      {/* EHR PREVIEW MODAL */}
      {showEHRPreview && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
              <div className="bg-white text-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] animate-in zoom-in-95 duration-200">
                  <header className="bg-indigo-900 text-white p-6 flex justify-between items-center">
                      <div>
                          <h3 className="font-black tracking-tight text-xl">Electronic Health Record (EHR)</h3>
                          <p className="text-[10px] text-indigo-200 uppercase font-black tracking-widest mt-1">Official Clinical Document Preview</p>
                      </div>
                      <div className="flex items-center gap-3">
                          <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-black px-4.5 py-2.5 rounded-xl border border-white/10 transition uppercase tracking-wider">Print File</button>
                          <button onClick={() => setShowEHRPreview(false)} className="text-indigo-200 hover:text-white p-1 transition"><X className="h-6 w-6"/></button>
                      </div>
                  </header>
                  
                  <div className="p-8 overflow-y-auto space-y-6 text-sm text-slate-800 leading-relaxed font-semibold">
                      {/* Clinical Cover Header */}
                      <div className="border-b-2 border-slate-200 pb-6">
                          <div className="flex justify-between items-start">
                              <div>
                                  <h4 className="text-xs uppercase text-slate-400 font-black tracking-widest">Facility Patient Registry</h4>
                                  <h2 className="text-2xl font-black text-slate-900 mt-1">{user.full_name || 'Patient Profile'}</h2>
                                  <p className="text-xs text-slate-500 mt-1">Primary Email: {user.email}</p>
                              </div>
                              <div className="text-right">
                                  <span className="bg-slate-100 text-slate-800 text-[10px] font-black px-3.5 py-2 rounded-xl uppercase tracking-wider border">{user.display_id || 'ID-PENDING'}</span>
                                  <p className="text-[10px] text-slate-400 mt-2 font-bold">DATE: {new Date().toLocaleDateString()}</p>
                              </div>
                          </div>
                      </div>

                      {/* Prescriptions */}
                      <div>
                          <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100">Prescribed Medications</h3>
                          {records.prescriptions.length > 0 ? (
                              <div className="space-y-3">
                                  {records.prescriptions.map((p, idx) => (
                                      <div key={p.id} className="p-4 bg-slate-50 border rounded-2xl flex justify-between items-center text-xs">
                                          <div>
                                              <p className="font-black text-slate-950 text-sm">{idx + 1}. {p.medicine_id}</p>
                                              <p className="text-slate-500 font-bold mt-1">Instructions: {p.instructions}</p>
                                          </div>
                                          <div className="text-right">
                                              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 uppercase tracking-wider">{p.status}</span>
                                              <p className="text-[9px] text-slate-400 mt-1.5 font-bold">{new Date(p.date_prescribed).toLocaleDateString()}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <p className="text-slate-400 font-bold italic text-xs">No active medication records registered.</p>
                          )}
                      </div>

                      {/* Imaging & Scans */}
                      <div>
                          <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100">Imaging & Lab Observational Reports</h3>
                          {records.scans.length > 0 ? (
                              <div className="space-y-3">
                                  {records.scans.map((s, idx) => (
                                      <div key={s.id} className="p-4 bg-slate-50 border rounded-2xl flex justify-between items-center text-xs">
                                          <div>
                                              <p className="font-black text-slate-950 text-sm">{idx + 1}. {s.scan_type}</p>
                                              <p className="text-slate-500 font-bold mt-1">File Ref: {s.display_id}</p>
                                          </div>
                                          <p className="text-slate-400 font-bold text-[10px]">{new Date(s.upload_date).toLocaleDateString()}</p>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <p className="text-slate-400 font-bold italic text-xs">No clinical lab uploads registered.</p>
                          )}
                      </div>

                      {/* Policy Footnote */}
                      <div className="border-t border-slate-100 pt-6 text-[10px] text-slate-400 font-bold text-center leading-relaxed">
                          <p>CONFIDENTIAL HEALTHCARE RECORD</p>
                          <p className="mt-1">This medical documentation is securely compiled by RBAC Medical Platform policies.</p>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PatientDashboard;
