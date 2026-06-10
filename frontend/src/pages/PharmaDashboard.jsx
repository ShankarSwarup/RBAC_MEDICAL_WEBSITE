import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, LogOut, FileText, Database, PackagePlus, Search, PlusCircle, UserCircle, CheckCircle, Menu, X } from 'lucide-react';
import api from '../services/api';
import UserProfile from '../components/UserProfile';

const PharmaDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('inventory'); // tabs: inventory, profile, pending, add_med
  const [statusMessage, setStatusMessage] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const userRes = await api.get('/auth/me');
        if (userRes.data.role !== 'PHARMA') return navigate('/login');
        setUser(userRes.data);
        fetchInventory();
        fetchPending();
      } catch (err) {
        navigate('/login');
      }
    };
    fetchInit();
  }, [navigate]);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/pharma/inventory');
      setInventory(res.data);
    } catch(err) { console.error(err); }
  };

  const fetchPending = async () => {
    try {
      const res = await api.get('/pharma/prescriptions/pending');
      setPendingPrescriptions(res.data);
    } catch(err) { console.error(err); }
  };

  const handleAddMedication = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      try {
          await api.post('/pharma/inventory/add', {
              name: formData.get('name'),
              description: formData.get('desc'),
              stock_level: parseInt(formData.get('stock')),
              price: parseFloat(formData.get('price'))
          });
          setStatusMessage("Medicine successfully imported to the database!");
          fetchInventory();
          setTimeout(() => setActiveTab('inventory'), 2000);
      } catch(err) { setStatusMessage("Failed to insert into inventory."); }
  };

  const handleDispense = async (prescriptionId) => {
      try {
          await api.post(`/pharma/dispense?prescription_id=${prescriptionId}`);
          alert("Medication Dispensed! Billing Invoice locally automatically generated.");
          fetchPending();
      } catch(err) { alert("Dispense failed."); }
  };

  const filteredInventory = inventory.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return <div className="flex justify-center items-center h-screen bg-slate-50 font-bold text-slate-500">Loading Pharmaceutical Portal...</div>;

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
        <div className="p-6 flex justify-between items-center bg-slate-900 border-b border-slate-800">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white"><Pill className="text-orange-400" /> PharmaCore</h2>
          <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-2">
           <button onClick={() => { setActiveTab('inventory'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'inventory' ? 'bg-orange-500/20 text-orange-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <Database className="h-5 w-5" /> Live Inventory
            </button>
            <button onClick={() => { setActiveTab('pending'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'pending' ? 'bg-orange-500/20 text-orange-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <FileText className="h-5 w-5" /> Active Prescriptions
            </button>
            <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'profile' ? 'bg-orange-500/20 text-orange-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
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
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                   {activeTab === 'inventory' && 'Inventory Control'}
                   {activeTab === 'profile' && 'Pharma Credentials'}
                   {activeTab === 'pending' && 'Fulfillment Queue'}
                   {activeTab === 'add_med' && 'New Medication Intake'}
                </h1>
             </div>
             {activeTab === 'inventory' && (
                <button onClick={() => { setStatusMessage(""); setActiveTab('add_med'); }} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition flex items-center gap-2">
                   <PlusCircle className="h-4 w-4"/> Add New Medication
                </button>
             )}
          </header>

          <div className="flex-1 overflow-y-auto p-8">
              {activeTab === 'profile' && <UserProfile user={user} />}
              
              {activeTab === 'add_med' && (
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
                      <h2 className="text-xl font-bold mb-4">Stock Incoming Medication</h2>
                      <form onSubmit={handleAddMedication} className="space-y-4">
                          <input required name="name" type="text" placeholder="Drug Name" className="w-full border p-3 rounded-xl focus:ring-2 outline-none" />
                          <input required name="desc" type="text" placeholder="Description/Use Case" className="w-full border p-3 rounded-xl focus:ring-2 outline-none" />
                          <div className="flex gap-4">
                             <input required name="stock" type="number" placeholder="Stock Units" className="w-full border p-3 rounded-xl focus:ring-2 outline-none" />
                             <input required name="price" type="number" step="0.01" placeholder="Price ($)" className="w-full border p-3 rounded-xl focus:ring-2 outline-none" />
                          </div>
                          {statusMessage && <p className="text-emerald-600 font-bold">{statusMessage}</p>}
                          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl transition">Initiate System Intake</button>
                      </form>
                  </div>
              )}

               {activeTab === 'pending' && (
                  <div className="space-y-6 max-w-5xl mx-auto">
                     <h2 className="text-xl font-black text-slate-800 mb-2 tracking-tight flex items-center gap-2"><CheckCircle className="h-6 w-6 text-orange-500" /> Dispensing Queue</h2>
                     {pendingPrescriptions.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-slate-200 p-16 rounded-[2.5rem] text-center shadow-sm">
                            <Pill className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                            <p className="font-black text-slate-400 text-lg uppercase tracking-widest">All Prescriptions Fulfilled</p>
                        </div>
                     ) : (
                        pendingPrescriptions.map(p => (
                           <div key={p.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-xl transition group">
                              <div className="flex items-center gap-6">
                                 <div className="h-14 w-14 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-orange-500 group-hover:text-white transition"><FileText className="h-7 w-7"/></div>
                                 <div className="space-y-1">
                                    <h3 className="font-black text-slate-800 text-xl tracking-tight">Prescription: {p.display_id || 'REF-PRSC'}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-widest">Patient: {p.patient_id}</span>
                                        <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-widest">Doctor Ref: {p.doctor_id}</span>
                                    </div>
                                    <p className="text-sm font-bold text-orange-600 mt-2 bg-orange-50 px-3 py-2 rounded-xl inline-block italic border border-orange-100">Instructions: {p.instructions}</p>
                                 </div>
                              </div>
                              <button onClick={() => handleDispense(p.id)} className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-4 rounded-2xl shadow-lg transition transform hover:-translate-y-1 uppercase tracking-widest text-xs">Verify & Dispense Medication →</button>
                           </div>
                        ))
                     )}
                  </div>
               )}
               
               {activeTab === 'inventory' && (
                   <div className="max-w-6xl mx-auto">
                   <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 mb-8">
                      <div className="p-2 bg-slate-50 rounded-xl"><Search className="h-5 w-5 text-slate-400" /></div>
                      <input type="text" placeholder="Filter inventory by name or internal display ID..." className="flex-1 outline-none text-slate-800 bg-transparent font-bold placeholder:text-slate-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      <div className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{filteredInventory.length} SKUs Listed</div>
                   </div>
                   
                   <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                       {filteredInventory.length === 0 ? (
                           <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                               <PackagePlus className="h-16 w-16 mb-4 text-slate-100" />
                               <p className="font-black text-xl text-slate-600 uppercase tracking-widest">No Inventory Records found</p>
                               <p className="text-slate-400 font-medium mt-2">Adjust search parameters or ingest new medication node.</p>
                           </div>
                       ) : (
                           <div className="overflow-x-auto">
                           <table className="w-full text-left text-sm">
                               <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-200">
                                   <tr>
                                       <th className="px-8 py-5">Display ID</th>
                                       <th className="px-8 py-5">Medication Node</th>
                                       <th className="px-8 py-5">System Description</th>
                                       <th className="px-8 py-5">Real-time Stock</th>
                                       <th className="px-8 py-5 text-right">MSRP Unit Price</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100">
                                    {filteredInventory.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-8 py-5 font-black text-orange-600 tabular-nums">{item.display_id || 'SKU-000'}</td>
                                            <td className="px-8 py-5 font-black text-slate-800 text-base">{item.name}</td>
                                            <td className="px-8 py-5 max-w-xs font-medium text-slate-500">{item.description}</td>
                                            <td className="px-8 py-5">
                                               <div className="flex items-center gap-3">
                                                   <span className={`font-black text-sm px-3 py-1 rounded-full ${item.stock_level < 10 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                       {item.stock_level} UNITS
                                                   </span>
                                                   {item.stock_level < 10 && <div className="h-2 w-2 bg-red-500 rounded-full animate-ping"></div>}
                                               </div>
                                            </td>
                                            <td className="px-8 py-5 text-right font-black text-slate-900 text-base">${item.price.toFixed(2)}</td>
                                        </tr>
                                    ))}
                               </tbody>
                           </table>
                           </div>
                       )}
                   </div>
                   </div>
               )}
          </div>
      </main>
    </div>
  );
};

export default PharmaDashboard;
