import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Clock, FileText, Download, Activity, FileStack, UserCircle, Menu, X } from 'lucide-react';
import api from '../services/api';
import UserProfile from '../components/UserProfile';

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.role !== 'PATIENT') return navigate('/login');
        setUser(response.data);
        fetchData();
        // Load available cities dynamically from the backend
        const cityRes = await api.get('/hospitals/cities');
        setCities(cityRes.data.cities || []);
      } catch (err) { navigate('/login'); }
    };
    fetchUser();
  }, [navigate]);

  const fetchData = async () => {
      try {
          const recRes = await api.get('/patients/my_records');
          setRecords(recRes.data);
          const apptRes = await api.get('/patients/my_appointments');
          setAppointments(apptRes.data);
      } catch(err) { console.error(err); }
  };

  const handleSearchHospitals = async (city) => {
    setSelectedCity(city);
    try {
      // If city is empty, fetch ALL hospitals (no filter)
      const url = city ? `/hospitals/?city=${city}` : `/hospitals/`;
      const res = await api.get(url);
      setHospitals(res.data);
      setSelectedHospital(null);
      setDoctors([]);
    } catch(err) { console.error(err); }
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
    } catch(err) { console.error(err); }
  };

  const handleBook = async (docId) => {
    try {
      await api.post('/patients/book_appointment', {
        doctor_id: docId,
        hospital_id: selectedHospital.id,
        appointment_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        department: department
      });
      alert("Appointment booked successfully!");
      setShowBooking(false);
      fetchData();
    } catch(err) { alert("Booking failed"); }
  };

  const handleSearchMedicine = async (e) => {
    e.preventDefault();
    if (!medQuery) return;
    setMedLoading(true);
    setMedInfo(null);
    try {
        const res = await api.get(`/patients/medicine_info?query=${medQuery}`);
        setMedInfo(res.data);
    } catch(err) { alert("Could not retrieve medicine data."); }
    setMedLoading(false);
  };

  const handleDownloadEHR = async () => {
     try {
       const response = await api.get('/patients/export_ehr', { responseType: 'blob' });
       const url = window.URL.createObjectURL(new Blob([response.data]));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download', `EHR_${user.id}.md`);
       document.body.appendChild(link);
       link.click();
       link.remove();
     } catch (err) { alert("Failed to export record."); }
  };

  if (!user) return <div className="flex h-screen items-center justify-center font-bold text-slate-500">Loading Portal...</div>;

  return (
    <div className="flex h-screen bg-slate-50 relative">
      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-200 flex flex-col shadow-xl z-50 transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="p-8 border-b border-slate-800 flex flex-col items-center relative">
            <button className="lg:hidden absolute top-4 right-4 text-white" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </button>
            <div className="h-16 w-16 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl mb-3">{(user.full_name || user.email).charAt(0).toUpperCase()}</div>
            <h2 className="text-white font-bold text-lg">{user.full_name || 'Patient'}</h2>
            <p className="text-slate-400 text-xs">{user.display_id || 'Patient Portal'}</p>
         </div>
         <nav className="flex-1 p-4 space-y-2 mt-4">
            <button onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'overview' ? 'bg-sky-500/20 text-sky-400 shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
               <Activity className="h-5 w-5" /> Health Overview
            </button>
            <button onClick={() => { setActiveTab('appointments'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'appointments' ? 'bg-sky-500/20 text-sky-400 shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
               <Calendar className="h-5 w-5" /> Appointments
            </button>
            <button onClick={() => { setActiveTab('records'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'records' ? 'bg-sky-500/20 text-sky-400 shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
               <FileStack className="h-5 w-5" /> Records & Scans
            </button>
            <button onClick={() => { setActiveTab('medicine'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'medicine' ? 'bg-sky-500/20 text-sky-400 shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
               <Activity className="h-5 w-5" /> Medicine Guide
            </button>
            <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'profile' ? 'bg-sky-500/20 text-sky-400 shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
               <UserCircle className="h-5 w-5" /> Verification
            </button>
         </nav>
         <div className="p-4 border-t border-slate-800">
             <button onClick={() => { localStorage.removeItem('access_token'); navigate('/login'); }} className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-xl transition font-medium">
               <LogOut className="h-5 w-5" /> Secure Logout
             </button>
         </div>
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm border-b border-slate-200 p-6 flex justify-between items-center sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                    {activeTab === 'overview' && "Welcome Back"}
                    {activeTab === 'appointments' && "Appointment Schedule"}
                    {activeTab === 'records' && "Document Archive"}
                    {activeTab === 'medicine' && "Pharmacological Guide"}
                    {activeTab === 'profile' && "Patient Protocol Config"}
                </h1>
            </div>
            <div className="flex gap-2">
                {activeTab === 'appointments' && (
                    <button onClick={() => setShowBooking(true)} className="bg-sky-500 text-white text-sm font-bold shadow-lg px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-sky-600 transition">
                       <Calendar className="h-4 w-4"/> Book New
                    </button>
                )}
                <button onClick={handleDownloadEHR} className="bg-white border text-sm font-bold shadow-sm px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition">
                   <Download className="h-4 w-4"/> EHR Export (MD)
                </button>
            </div>
         </header>

         <div className="p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto h-full pb-24">
             {showBooking && (
                 <div className="bg-white border border-sky-100 rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Find Care Near You</h2>
                        <button onClick={() => setShowBooking(false)} className="text-slate-400 hover:text-slate-600 transition"><X /></button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">1. Select City</label>
                            <select onChange={(e) => handleSearchHospitals(e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 transition outline-none font-bold text-slate-700">
                                <option value="">ALL CITIES / SHOW ALL</option>
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2 transition-opacity">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">2. Select Hospital</label>
                            <select onChange={(e) => handleSelectHospital(hospitals.find(h => h.id === e.target.value))} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 transition outline-none font-bold text-slate-700">
                                <option value="">{hospitals.length === 0 ? 'SELECT CITY FIRST...' : 'CHOOSE HOSPITAL...'}</option>
                                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name} — {h.location_city}</option>)}
                            </select>
                        </div>

                        <div className={`space-y-2 transition-opacity ${!selectedHospital ? 'opacity-30 pointer-events-none' : ''}`}>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">3. Department</label>
                            <select onChange={(e) => fetchDoctors(e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 transition outline-none font-bold text-slate-700">
                                <option value="">CHOOSE OPD...</option>
                                {selectedHospital?.departments?.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    {doctors.length > 0 && (
                        <div className="pt-6 border-t animate-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Available Specialists</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {doctors.map(doc => (
                                    <div key={doc.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center group hover:border-sky-400 transition cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold">{doc.full_name?.charAt(0) || 'D'}</div>
                                            <div>
                                                <p className="font-bold text-slate-800">{doc.full_name || 'Specialist'}</p>
                                                <p className="text-xs text-slate-500 font-medium">{doc.specialty}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleBook(doc.id)} className="bg-white border text-sky-600 text-xs font-black px-4 py-2 rounded-lg hover:bg-sky-600 hover:text-white hover:border-sky-600 transition shadow-sm">BOOK SLOT</button>
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
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 font-black tracking-tight"><Calendar className="h-6 w-6 text-sky-500" /> Upcoming Consultations</h2>
                    {appointments.length > 0 ? appointments.map(appt => (
                        <div key={appt.id} className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-800 shadow-sm hover:shadow-md transition">
                           <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="text-sky-600 font-black text-xs uppercase tracking-widest mb-1">{appt.display_id || 'Booking ID'}</p>
                                <h3 className="text-xl font-bold">Consultation - {appt.department || 'General'}</h3>
                                <p className="text-slate-500 text-sm font-medium">Doctor Ref: {appt.doctor_id}</p>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${appt.status === 'SCHEDULED' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{appt.status}</div>
                           </div>
                           <div className="flex gap-4 border-t pt-4">
                              <span className="flex items-center gap-2 text-slate-500 text-sm font-bold"><Calendar className="h-4 w-4 text-sky-500"/> {new Date(appt.appointment_date).toLocaleDateString()}</span>
                              <span className="flex items-center gap-2 text-slate-500 text-sm font-bold"><Clock className="h-4 w-4 text-sky-500"/> Morning Slot</span>
                           </div>
                        </div>
                    )) : (
                        <div className="bg-slate-50 p-12 rounded-3xl text-center border-dashed border-2 border-slate-200">
                           <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                           <p className="font-bold text-slate-400">No appointments scheduled.</p>
                           <button onClick={() => setShowBooking(true)} className="mt-4 text-sky-500 font-black text-sm hover:underline">Book Your First Appointment →</button>
                        </div>
                    )}
                 </div>
             )}

             {activeTab === 'records' && (
                 <div className="space-y-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 font-black tracking-tight"><FileStack className="h-6 w-6 text-sky-500" /> My Prescriptions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {records.prescriptions.length > 0 ? records.prescriptions.map(p => (
                                <div key={p.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:border-sky-200 transition">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="h-8 w-8 bg-sky-50 rounded-lg flex items-center justify-center"><Activity className="h-4 w-4 text-sky-500"/></div>
                                        <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase">{p.display_id}</span>
                                    </div>
                                    <h4 className="font-black text-slate-800 mb-1">{p.medicine_id}</h4>
                                    <p className="text-xs text-slate-500 font-medium mb-4">{p.instructions}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{p.status}</span>
                                        <span className="text-[10px] text-slate-400 font-bold">{new Date(p.date_prescribed).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )) : <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border-dashed border-2">No prescriptions recorded.</div>}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 font-black tracking-tight"><Activity className="h-6 w-6 text-indigo-500" /> Lab Observations</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {records.scans.length > 0 ? records.scans.map(s => (
                                <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex justify-between items-center group hover:bg-slate-800 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition"><FileText className="h-6 w-6"/></div>
                                        <div>
                                            <p className="text-white font-black tracking-tight">{s.scan_type}</p>
                                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{s.display_id || 'REF-SCN'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-400 text-xs font-bold mb-2">{new Date(s.upload_date).toLocaleDateString()}</p>
                                        <button className="bg-sky-500/10 text-sky-400 text-[10px] font-black px-3 py-1.5 rounded-lg border border-sky-400/20 group-hover:bg-sky-400 group-hover:text-white transition">SECURE VIEW</button>
                                    </div>
                                </div>
                            )) : <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border-dashed border-2">No imaging records found.</div>}
                        </div>
                    </div>
                 </div>
             )}

             {activeTab === 'overview' && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-8 relative overflow-hidden shadow-xl border border-white/10">
                        <div className="relative z-10">
                            <h3 className="text-indigo-300 text-sm font-black uppercase tracking-widest mb-2">Health Snapshot</h3>
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome back, <br/>{user.full_name || user.email}.</h2>
                            <p className="text-slate-400 text-sm mb-6 font-medium">{user.display_id} &bull; {appointments.length} appointment(s) on record</p>
                            <div className="flex gap-4">
                                <button onClick={() => setActiveTab('records')} className="bg-white text-indigo-950 px-6 py-3 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-50 transition">View Full EHR</button>
                                <button onClick={() => { setActiveTab('appointments'); setShowBooking(true); }} className="bg-white/10 text-white px-6 py-3 rounded-2xl font-black text-sm border border-white/10 hover:bg-white/20 transition">Book Appointment</button>
                            </div>
                        </div>
                        <Activity className="absolute -right-8 -bottom-8 h-48 w-48 text-white/5 rotate-12" />
                     </div>
                     <div className="bg-white border rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                        <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner"><Activity className="h-10 w-10"/></div>
                        <div>
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Medical Summary</p>
                            <h4 className="text-xl font-black text-slate-800">{records.prescriptions.length} Prescriptions</h4>
                            <p className="text-slate-400 text-sm mt-1">{records.scans.length} Lab Reports</p>
                        </div>
                        <button onClick={() => setActiveTab('medicine')} className="text-sky-500 text-sm font-black hover:underline uppercase tracking-tighter">Drug Guide →</button>
                     </div>
                 </div>
             )}

             {activeTab === 'medicine' && (
                 <div className="space-y-8 max-w-3xl mx-auto">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2 tracking-tight">
                            <Activity className="text-sky-500 h-6 w-6"/> Drug Information Lookup
                        </h2>
                        <form onSubmit={handleSearchMedicine} className="flex gap-2">
                            <input 
                                value={medQuery}
                                onChange={(e) => setMedQuery(e.target.value)}
                                placeholder="Enter medicine name (e.g. Aspirin, Ibuprofen)..." 
                                className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none transition font-medium"
                            />
                            <button type="submit" disabled={medLoading} className="bg-sky-500 hover:bg-sky-600 text-white px-8 rounded-2xl font-black transition disabled:opacity-50">
                                {medLoading ? 'SEARCHING...' : 'ENQUIRE'}
                            </button>
                        </form>
                    </div>

                    {medInfo ? (
                        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Pharmacological Identity</h3>
                                <h2 className="text-3xl font-black text-slate-800">{medInfo.name}</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-6">
                                <div className="p-6 bg-sky-50 rounded-2xl border border-sky-100">
                                    <h4 className="font-black text-sky-800 text-sm mb-2 uppercase tracking-tight flex items-center gap-2"><Activity className="h-4 w-4"/> Indications & Usage</h4>
                                    <p className="text-sky-900 text-sm leading-relaxed font-medium">{medInfo.indications || medInfo.purpose || "Clinical indications not specified."}</p>
                                </div>

                                {medInfo.warnings && (
                                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                                        <h4 className="font-black text-red-800 text-sm mb-2 uppercase tracking-tight flex items-center gap-2"><X className="h-4 w-4"/> Critical Warnings</h4>
                                        <p className="text-red-900 text-sm leading-relaxed font-medium">{medInfo.warnings}</p>
                                    </div>
                                )}

                                {medInfo.dosage && (
                                    <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <h4 className="font-black text-emerald-800 text-sm mb-2 uppercase tracking-tight">Administrative Protocol</h4>
                                        <p className="text-emerald-900 text-sm leading-relaxed font-medium">{medInfo.dosage}</p>
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase text-center border-t pt-6 tracking-widest">Data Source: US National Library of Medicine (OpenFDA API)</p>
                        </div>
                    ) : !medLoading && (
                        <div className="py-20 text-center text-slate-400">
                            <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="font-bold">Search for any medicine to view indications, warnings, and usage protocols.</p>
                        </div>
                    )}
                 </div>
             )}
         </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
