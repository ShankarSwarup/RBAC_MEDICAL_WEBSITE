import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, UploadCloud, FileStack, Microscope, CheckCircle2, User, Search, UserCircle, Menu, X } from 'lucide-react';
import api from '../services/api';
import UserProfile from '../components/UserProfile';

const LabDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [patientId, setPatientId] = useState("");
  const [scanType, setScanType] = useState("MRI");
  const [uploadStatus, setUploadStatus] = useState("");
  const [activeTab, setActiveTab] = useState('upload'); // upload, pending, profile
  const [pendingRequests, setPendingRequests] = useState([]);
  const [filterType, setFilterType] = useState("ALL");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.role !== 'LAB_TECH') return navigate('/login');
        setUser(response.data);
        const reqRes = await api.get('/labs/requests/pending');
        setPendingRequests(reqRes.data);
      } catch (err) { navigate('/login'); }
    };
    fetchUser();
  }, [navigate, activeTab === 'pending']);

  const handleUpload = async (e) => {
    e.preventDefault();
    if(!selectedFile || !patientId) return setUploadStatus("Please provide a file and a Patient ID.");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploadStatus("Uploading...");
      await api.post(`/labs/upload_scan?patient_id=${patientId}&scan_type=${scanType}`, formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus("Success! Scan securely linked to patient record.");
      setSelectedFile(null);
      setPatientId("");
      setTimeout(() => setUploadStatus(""), 4000);
    } catch(err) { setUploadStatus("Error uploading file. Please verify permissions."); }
  };

  if (!user) return <div className="flex justify-center items-center h-screen bg-slate-50 font-bold text-slate-500">Authorizing...</div>;

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
        <div className="p-6 flex justify-between items-center bg-slate-900 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white"><Microscope className="text-rose-400" /> LabSystem</h2>
            <p className="text-slate-400 text-xs mt-1 font-medium">Diagnostic Portal</p>
          </div>
          <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-2">
           <button onClick={() => { setActiveTab('upload'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'upload' ? 'bg-rose-500/20 text-rose-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <UploadCloud className="h-5 w-5" /> Image & Doc Upload
            </button>
            <button onClick={() => { setActiveTab('pending'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'pending' ? 'bg-rose-500/20 text-rose-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <FileStack className="h-5 w-5" /> Pending MRI Requests
            </button>
            <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'profile' ? 'bg-rose-500/20 text-rose-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <UserCircle className="h-5 w-5" /> My Profile
            </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => { localStorage.removeItem('access_token'); navigate('/login'); }} className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl font-medium transition">
             <LogOut className="h-5 w-5" /> Secure Logout
          </button>
        </div>
      </div>
      
      <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-slate-200 p-6 flex justify-between items-center shadow-sm sticky top-0 z-30">
             <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">Diagnostic Center</h1>
             </div>
          </header>

          <div className="p-8 max-w-4xl mx-auto">
              {activeTab === 'profile' && <UserProfile user={user} />}

                 {activeTab === 'pending' && (
                   <div className="space-y-6 max-w-5xl mx-auto">
                       <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                           <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 tracking-tight"><FileStack className="h-7 w-7 text-rose-500" /> Diagnostic Queue</h2>
                           <div className="flex bg-white border p-1.5 rounded-2xl shadow-sm">
                               {['ALL', 'MRI', 'XRAY', 'BLOOD_WORK'].map(type => (
                                   <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filterType === type ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>{type}</button>
                               ))}
                           </div>
                       </div>
                       
                       <div className="grid grid-cols-1 gap-4">
                       {pendingRequests.filter(r => filterType === "ALL" || r.scan_type === filterType).length > 0 ? pendingRequests.filter(r => filterType === "ALL" || r.scan_type === filterType).map(req => (
                           <div key={req.id} onClick={() => { setPatientId(req.patient_id); setScanType(req.scan_type); setActiveTab('upload'); }} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-xl transition group group-hover:border-rose-200">
                              <div className="flex items-center gap-6">
                                 <div className="h-14 w-14 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-rose-500 group-hover:text-white transition"><Microscope className="h-7 w-7"/></div>
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-black text-slate-800 text-xl tracking-tight">Request: {req.display_id || 'REF-SCAN'}</h3>
                                        <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[8px] font-black uppercase rounded border border-rose-100 tracking-widest">{req.scan_type}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-widest">Patient Ref: {req.patient_id}</span>
                                        <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-widest">Ordered: {new Date(req.date_requested).toLocaleTimeString()}</span>
                                    </div>
                                 </div>
                              </div>
                              <button className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-3 rounded-2xl shadow-lg transition transform hover:-translate-y-1 uppercase tracking-widest text-xs">Execute Diagnostic Intake →</button>
                           </div>
                       )) : (
                           <div className="bg-white border-2 border-dashed border-slate-200 p-20 rounded-[3rem] text-center shadow-sm">
                              <CheckCircle2 className="h-16 w-16 mx-auto text-slate-200 mb-6" />
                              <p className="font-black text-slate-400 text-xl uppercase tracking-widest">Diagnostic Wing Clear</p>
                              <p className="text-slate-400 font-medium mt-2 italic">Waiting for incoming requisition signals from medical nodes.</p>
                           </div>
                       )}
                       </div>
                   </div>
                )}

               {activeTab === 'upload' && (
               <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden max-w-2xl mx-auto">
                   <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                      <div className="relative z-10">
                        <h2 className="text-3xl font-black flex items-center gap-3 tracking-tighter"><UploadCloud className="h-10 w-10 text-rose-400"/> Reports Injection</h2>
                        <p className="text-slate-400 mt-2 font-bold max-w-sm">Authorize and upload high-resolution diagnostic assets to the patient's identity node.</p>
                      </div>
                      <Microscope className="absolute -right-12 -bottom-12 h-64 w-64 text-white/5 rotate-12 pointer-events-none" />
                   </div>

                   <form onSubmit={handleUpload} className="p-10 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Patient Identity</label>
                               <div className="flex bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-rose-500 transition-all shadow-inner">
                                  <div className="pl-4 flex items-center text-slate-300"><User className="h-5 w-5"/></div>
                                  <input type="text" required value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="e.g. PAT-1001" className="w-full bg-transparent px-4 py-4 outline-none text-slate-800 font-black text-sm placeholder:text-slate-200" />
                               </div>
                           </div>
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Modal Modality</label>
                               <select value={scanType} onChange={(e) => setScanType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-5 py-4 outline-none text-slate-800 font-black text-sm rounded-2xl focus:ring-2 focus:ring-rose-500 shadow-inner border-r-[16px] border-r-transparent transition-all">
                                   <option value="MRI">High-Res MRI</option>
                                   <option value="XRAY">Diagnostic X-Ray</option>
                                   <option value="BLOOD_WORK">Comprehensive Blood Work</option>
                               </select>
                           </div>
                       </div>

                       <div className="border-4 border-dotted border-slate-100 rounded-[2rem] p-12 flex flex-col items-center justify-center bg-slate-50/30 hover:bg-slate-50 transition-all group cursor-pointer" onClick={() => document.getElementById('file-input').click()}>
                           <div className="h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                               <UploadCloud className="h-10 w-10 text-rose-500" />
                           </div>
                           <p className="font-black text-slate-800 text-lg uppercase tracking-tight">Drop Assets Here</p>
                           <p className="text-slate-400 font-bold mb-4 text-xs">Maximum payload size: 256MB</p>
                           <input id="file-input" type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
                           {selectedFile && (
                               <div className="mt-2 bg-emerald-50 text-emerald-600 px-6 py-2 rounded-2xl font-black text-xs flex items-center gap-2 border border-emerald-100 italic animate-bounce">
                                   <CheckCircle2 className="h-4 w-4"/> READY: {selectedFile.name.toUpperCase()}
                               </div>
                           )}
                       </div>

                       {uploadStatus && <div className={`p-5 rounded-2xl text-center text-xs font-black uppercase tracking-widest shadow-inner ${uploadStatus.includes('Error') ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>{uploadStatus}</div>}
                       <button type="submit" className="w-full bg-slate-900 hover:bg-black text-rose-400 font-black py-5 rounded-[1.5rem] shadow-2xl transition transform hover:-translate-y-1 uppercase tracking-[0.2em] text-xs">Authorize Secure Injection →</button>
                   </form>
               </div>
               )}
          </div>
      </main>
    </div>
  );
};

export default LabDashboard;
