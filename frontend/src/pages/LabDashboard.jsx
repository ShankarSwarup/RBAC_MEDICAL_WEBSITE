import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, UploadCloud, FileStack, Microscope, CheckCircle2, User, Search, UserCircle, Menu, X } from 'lucide-react';
import api from '../services/api';
import UserProfile from '../components/UserProfile';
import ThemeToggle from '../components/ThemeToggle';
import { toast } from '../services/toast';

const LabDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [patientId, setPatientId] = useState("");
  const [scanType, setScanType] = useState("MRI");
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
      } catch (err) { 
        navigate('/login'); 
      }
    };
    fetchUser();
  }, [navigate, activeTab]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a diagnostic file to upload.");
      return;
    }
    if (!patientId || !patientId.trim()) {
      toast.error("Please enter a valid Patient ID.");
      return;
    }

    // Frontend File Verification
    const allowedExtensions = /(\.pdf|\.png|\.jpg|\.jpeg|\.dcm|\.dicom)$/i;
    if (!allowedExtensions.exec(selectedFile.name)) {
      toast.error("Unsupported file format. Supported: PDF, PNG, JPG, DICOM.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("File size exceeds 10MB limits.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      toast.info("Uploading file...");
      await api.post(`/labs/upload_scan?patient_id=${patientId}&scan_type=${scanType}`, formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Success! Diagnostic scan securely linked to patient EHR.");
      setSelectedFile(null);
      setPatientId("");
      setActiveTab('pending');
    } catch(err) { 
      toast.error("Upload failed. Verify permissions or file size."); 
    }
  };

  if (!user) return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-950 font-bold text-slate-500">Authorizing...</div>;

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
      <div className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-200 dark:border-slate-850 flex flex-col shadow-xl z-50 transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center bg-slate-900 border-b border-slate-805">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white"><Microscope className="text-rose-450 animate-pulse" /> LabSystem</h2>
            <p className="text-slate-400 text-xs mt-1 font-semibold uppercase tracking-wider">Diagnostic Portal</p>
          </div>
          <button className="lg:hidden text-white hover:text-rose-300 transition" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-2">
            <button onClick={() => { setActiveTab('upload'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${activeTab === 'upload' ? 'bg-rose-500/20 text-rose-450 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <UploadCloud className="h-5 w-5" /> Image & Doc Upload
            </button>
            <button onClick={() => { setActiveTab('pending'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${activeTab === 'pending' ? 'bg-rose-500/20 text-rose-450 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <FileStack className="h-5 w-5" /> Pending MRI Requests
            </button>
            <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${activeTab === 'profile' ? 'bg-rose-500/20 text-rose-450 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <UserCircle className="h-5 w-5" /> My Profile
            </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => { localStorage.removeItem('access_token'); navigate('/login'); }} className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl font-semibold text-sm transition">
             <LogOut className="h-5 w-5" /> Secure Logout
          </button>
        </div>
      </div>
      
      <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center shadow-sm sticky top-0 z-30 transition-colors duration-300">
             <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">Diagnostic Center</h1>
             </div>
             
             <div className="flex items-center gap-3">
                 <ThemeToggle />
             </div>
          </header>

          <div className="p-6 md:p-8 max-w-4xl w-full mx-auto flex-1 overflow-y-auto pb-24">
              {activeTab === 'profile' && <UserProfile user={user} />}

                 {activeTab === 'pending' && (
                   <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
                       <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                           <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-wider"><FileStack className="h-6 w-6 text-rose-500" /> Diagnostic Queue</h2>
                           <div className="flex bg-white dark:bg-slate-900 border dark:border-slate-800 p-1.5 rounded-2xl shadow-sm">
                               {['ALL', 'MRI', 'XRAY', 'BLOOD_WORK'].map(type => (
                                   <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filterType === type ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'}`}>{type}</button>
                               ))}
                           </div>
                       </div>
                       
                       <div className="grid grid-cols-1 gap-4">
                       {pendingRequests.filter(r => filterType === "ALL" || r.scan_type === filterType).length > 0 ? pendingRequests.filter(r => filterType === "ALL" || r.scan_type === filterType).map(req => (
                            <div key={req.id} onClick={() => { setPatientId(req.patient_id); setScanType(req.scan_type); setActiveTab('upload'); }} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition cursor-pointer group">
                              <div className="flex items-center gap-6">
                                 <div className="h-14 w-14 bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-450 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-rose-550 group-hover:text-white transition"><Microscope className="h-6 w-6"/></div>
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight">Request: {req.display_id || 'REF-SCAN'}</h3>
                                        <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 text-[8px] font-black uppercase rounded border border-rose-100 dark:border-rose-900/30 tracking-widest">{req.scan_type}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl text-slate-500 dark:text-slate-400 uppercase tracking-widest">Patient Ref: {req.patient_id}</span>
                                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ordered: {new Date(req.date_requested).toLocaleTimeString()}</span>
                                    </div>
                                 </div>
                              </div>
                              <button className="w-full md:w-auto bg-slate-900 dark:bg-rose-500 dark:hover:bg-rose-600 hover:bg-slate-800 text-white font-black px-6 py-3.5 rounded-2xl shadow-lg transition uppercase tracking-wider text-xs flex-shrink-0">Ingest Intake →</button>
                            </div>
                        )) : (
                            <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 p-20 rounded-[3rem] text-center shadow-sm">
                              <CheckCircle2 className="h-16 w-16 mx-auto text-slate-200 dark:text-slate-800 mb-6" />
                              <p className="font-black text-slate-400 dark:text-slate-500 text-sm uppercase tracking-widest">Diagnostic Wing Clear</p>
                            </div>
                        )}
                        </div>
                    </div>
                 )}

                {activeTab === 'upload' && (
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden max-w-2xl mx-auto transition-colors duration-300">
                    <div className="bg-slate-900 dark:bg-slate-950 p-10 text-white relative overflow-hidden">
                       <div className="relative z-10">
                         <h2 className="text-3xl font-black flex items-center gap-3 tracking-tighter"><UploadCloud className="h-10 w-10 text-rose-450 animate-pulse"/> Reports Ingestion</h2>
                         <p className="text-slate-400 mt-2 font-semibold max-w-sm text-sm">Upload high-resolution clinical imaging or documents linked to patient EHR.</p>
                       </div>
                       <Microscope className="absolute -right-12 -bottom-12 h-64 w-64 text-white/5 rotate-12 pointer-events-none" />
                    </div>

                    <form onSubmit={handleUpload} className="p-8 md:p-10 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Target Patient ID</label>
                                <div className="flex bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-rose-500 transition shadow-inner">
                                   <div className="pl-4 flex items-center text-slate-400"><User className="h-5 w-5"/></div>
                                   <input type="text" required value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="e.g. PAT-1001" className="w-full bg-transparent px-4 py-4 outline-none text-slate-850 dark:text-white font-semibold text-sm placeholder:text-slate-350" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Procedure Modality</label>
                                <select value={scanType} onChange={(e) => setScanType(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-5 py-4 outline-none text-slate-850 dark:text-white font-semibold text-sm rounded-2xl focus:ring-2 focus:ring-rose-500 shadow-inner border-r-[16px] border-r-transparent transition">
                                    <option value="MRI">High-Res MRI</option>
                                    <option value="CT">Contrast CT Scan</option>
                                    <option value="XRAY">Diagnostic X-Ray</option>
                                    <option value="BLOOD_WORK">Comprehensive Blood Work</option>
                                </select>
                            </div>
                        </div>

                        <div className="border-4 border-dotted border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center justify-center bg-slate-50/20 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-950 transition group cursor-pointer" onClick={() => document.getElementById('file-input').click()}>
                            <div className="h-16 w-16 bg-white dark:bg-slate-900 rounded-2xl shadow-md flex items-center justify-center mb-4 group-hover:scale-105 transition">
                                <UploadCloud className="h-8 w-8 text-rose-500" />
                            </div>
                            <p className="font-black text-slate-800 dark:text-white text-base uppercase tracking-tight">Drop diagnostic asset here</p>
                            <p className="text-slate-400 dark:text-slate-500 font-bold mb-4 text-[10px] uppercase tracking-wider mt-1">PDF, PNG, JPG, or DICOM &bull; Max 10MB</p>
                            <input id="file-input" type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
                            {selectedFile && (
                                <div className="mt-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 border border-emerald-100 dark:border-emerald-900/30 italic">
                                    <CheckCircle2 className="h-4 w-4"/> Selected: {selectedFile.name.toUpperCase()}
                                </div>
                            )}
                        </div>

                        <button type="submit" className="w-full bg-slate-900 hover:bg-black dark:bg-rose-500 dark:hover:bg-rose-600 text-rose-400 dark:text-white font-black py-4.5 rounded-[1.25rem] shadow-xl transition uppercase tracking-widest text-xs">Ingest Asset Core →</button>
                    </form>
                </div>
                )}
          </div>
      </main>
    </div>
  );
};

export default LabDashboard;
