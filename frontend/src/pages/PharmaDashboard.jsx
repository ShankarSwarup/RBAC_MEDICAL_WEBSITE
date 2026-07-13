import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, LogOut, FileText, Database, PackagePlus, Search, PlusCircle, UserCircle, CheckCircle, Menu, X } from 'lucide-react';
import api from '../services/api';
import UserProfile from '../components/UserProfile';
import ThemeToggle from '../components/ThemeToggle';
import { toast } from '../services/toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const PharmaDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('inventory'); // tabs: inventory, profile, pending, add_med
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
  }, [navigate, activeTab]);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/pharma/inventory');
      setInventory(res.data);
    } catch(err) { 
      console.error(err); 
    }
  };

  const fetchPending = async () => {
    try {
      const res = await api.get('/pharma/prescriptions/pending');
      setPendingPrescriptions(res.data);
    } catch(err) { 
      console.error(err); 
    }
  };

  const handleAddMedication = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name')?.trim();
      const desc = formData.get('desc')?.trim();
      const stockVal = formData.get('stock');
      const priceVal = formData.get('price');

      if (!name || !desc || !stockVal || !priceVal) {
        toast.error("Please fill in all drug intake fields.");
        return;
      }

      const stock = parseInt(stockVal);
      const price = parseFloat(priceVal);

      if (isNaN(stock) || stock < 0) {
        toast.error("Stock level must be a non-negative integer.");
        return;
      }

      if (isNaN(price) || price <= 0) {
        toast.error("MSRP price must be a positive decimal value.");
        return;
      }

      try {
          await api.post('/pharma/inventory/add', {
              name,
              description: desc,
              stock_level: stock,
              price: price
          });
          toast.success("Medicine successfully imported to the database!");
          fetchInventory();
          setActiveTab('inventory');
      } catch(err) { 
        toast.error("Failed to insert medicine into inventory database."); 
      }
  };

  const handleDispense = async (prescriptionId) => {
      try {
          await api.post(`/pharma/dispense?prescription_id=${prescriptionId}`);
          toast.success("Medication dispensed. Invoices successfully output.");
          fetchPending();
      } catch(err) { 
        toast.error("Dispensing fulfillment failed."); 
      }
  };

  const filteredInventory = inventory.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-950 font-bold text-slate-500">Loading Pharmaceutical Portal...</div>;

  // Process stock data for Recharts
  const chartData = inventory.map(item => ({
    name: item.name,
    stock: item.stock_level,
    fill: item.stock_level < 15 ? '#ef4444' : '#f97316'
  }));

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
      <div className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-50 transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center bg-slate-900 border-b border-slate-800">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white"><Pill className="text-orange-400 animate-pulse" /> PharmaCore</h2>
          <button className="lg:hidden text-white hover:text-orange-300 transition" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-2">
            <button onClick={() => { setActiveTab('inventory'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${activeTab === 'inventory' ? 'bg-orange-500/20 text-orange-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <Database className="h-5 w-5" /> Live Inventory
            </button>
            <button onClick={() => { setActiveTab('pending'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${activeTab === 'pending' ? 'bg-orange-500/20 text-orange-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <FileText className="h-5 w-5" /> Active Prescriptions
            </button>
            <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${activeTab === 'profile' ? 'bg-orange-500/20 text-orange-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
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
                <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">
                   {activeTab === 'inventory' && 'Inventory Control'}
                   {activeTab === 'profile' && 'Pharma Credentials'}
                   {activeTab === 'pending' && 'Fulfillment Queue'}
                   {activeTab === 'add_med' && 'New Medication Ingestion'}
                </h1>
             </div>
             
             <div className="flex items-center gap-3">
                <ThemeToggle />
                {activeTab === 'inventory' && (
                   <button onClick={() => setActiveTab('add_med')} className="hidden sm:flex bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition items-center gap-2 uppercase tracking-wider">
                      <PlusCircle className="h-4 w-4"/> Add Medication
                   </button>
                )}
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {activeTab === 'profile' && <UserProfile user={user} />}
              
              {activeTab === 'add_med' && (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-200/50 dark:border-slate-800 max-w-2xl mx-auto transition-colors duration-300">
                      <h2 className="text-2xl font-black mb-4 tracking-tight text-slate-800 dark:text-white">Stock Incoming Medication</h2>
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-6">Register a clinical drug entity to local pharmaceutical stores.</p>
                      <form onSubmit={handleAddMedication} className="space-y-4">
                          <input required name="name" type="text" placeholder="Drug Name (e.g. Amoxicillin)" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition font-semibold text-slate-800 dark:text-white" />
                          <input required name="desc" type="text" placeholder="Description/Use Case (e.g. Antibiotic)" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition font-semibold text-slate-800 dark:text-white" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <input required name="stock" type="number" placeholder="Stock Units" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition font-semibold text-slate-800 dark:text-white" />
                             <input required name="price" type="number" step="0.01" placeholder="Price ($)" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition font-semibold text-slate-800 dark:text-white" />
                          </div>
                          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-orange-500/20 transition transform hover:-translate-y-0.5 uppercase tracking-wider text-xs">Initiate Intake Process →</button>
                      </form>
                  </div>
              )}

               {activeTab === 'pending' && (
                  <div className="space-y-6 max-w-5xl mx-auto">
                     <h2 className="text-lg font-black text-slate-800 dark:text-white mb-2 tracking-tight flex items-center gap-2 uppercase tracking-wider"><CheckCircle className="h-5 w-5 text-orange-500" /> Dispensing Queue</h2>
                     {pendingPrescriptions.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 p-16 rounded-[2.5rem] text-center shadow-sm">
                            <Pill className="h-12 w-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                            <p className="font-black text-slate-400 dark:text-slate-500 text-sm uppercase tracking-widest">All Prescriptions Fulfilled</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 gap-4">
                         {pendingPrescriptions.map(p => (
                            <div key={p.id} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition group">
                              <div className="flex items-center gap-6 overflow-hidden">
                                 <div className="h-14 w-14 bg-orange-50 dark:bg-orange-950/50 text-orange-500 dark:text-orange-400 rounded-2xl flex items-center justify-center flex-shrink-0"><FileText className="h-6 w-6"/></div>
                                 <div className="space-y-1 overflow-hidden">
                                    <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight">Prescription: {p.display_id || 'REF-PRSC'}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient ID: {p.patient_id}</span>
                                        <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 uppercase tracking-wider">Doc ID: {p.doctor_id}</span>
                                    </div>
                                    <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-2 bg-orange-50/55 dark:bg-orange-950/20 px-3 py-2 rounded-xl inline-block italic border border-orange-100/50 dark:border-orange-900/30">Formula Details: {p.medicine_id} &bull; {p.instructions}</p>
                                 </div>
                              </div>
                              <button onClick={() => handleDispense(p.id)} className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-black px-6 py-3.5 rounded-2xl shadow-lg transition uppercase tracking-wider text-xs flex-shrink-0">Verify & Dispense →</button>
                            </div>
                         ))}
                        </div>
                     )}
                  </div>
               )}
               
               {activeTab === 'inventory' && (
                    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                    
                    {/* Recharts Analytics Bar */}
                    {chartData.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm min-h-[220px]">
                            <h3 className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-6">Live stock levels (Items &lt; 15 units flagged red)</h3>
                            <div className="h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
                                        <Bar dataKey="stock" radius={[8, 8, 0, 0]} barSize={28}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                       <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl"><Search className="h-5 w-5 text-slate-400" /></div>
                       <input type="text" placeholder="Filter inventory by name or display ID..." className="flex-1 outline-none text-slate-800 dark:text-white bg-transparent font-bold placeholder:text-slate-350" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                       <div className="hidden md:block text-[9px] font-black text-slate-400 uppercase tracking-widest mr-4">{filteredInventory.length} SKUs Listed</div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                        {filteredInventory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                                <PackagePlus className="h-16 w-16 mb-4 text-slate-100 dark:text-slate-800" />
                                <p className="font-black text-lg text-slate-650 uppercase tracking-widest">No Inventory Records</p>
                                <p className="text-slate-400 font-medium mt-2">Ingest incoming medication nodes to display listing.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[700px]">
                                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-8 py-5">Display ID</th>
                                        <th className="px-8 py-5">Medication Name</th>
                                        <th className="px-8 py-5">System Description</th>
                                        <th className="px-8 py-5">Real-time Stock</th>
                                        <th className="px-8 py-5 text-right">MSRP Unit Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                     {filteredInventory.map(item => (
                                         <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors group">
                                             <td className="px-8 py-5 font-black text-orange-650 dark:text-orange-400 tabular-nums">{item.display_id || 'SKU-000'}</td>
                                             <td className="px-8 py-5 font-black text-slate-800 dark:text-white text-base">{item.name}</td>
                                             <td className="px-8 py-5 max-w-xs font-medium text-slate-500 dark:text-slate-400 truncate">{item.description}</td>
                                             <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-black text-xs px-3.5 py-1.5 rounded-2xl uppercase tracking-wider ${item.stock_level < 15 ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'}`}>
                                                        {item.stock_level} Units
                                                    </span>
                                                    {item.stock_level < 15 && <div className="h-2 w-2 bg-red-500 rounded-full animate-ping"></div>}
                                                </div>
                                             </td>
                                             <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-slate-100 text-base">${item.price.toFixed(2)}</td>
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
