import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Sparkles, Crown, Zap, ShieldCheck, Settings, Loader2, Truck, XCircle } from '../../constants/icons';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';


const AutoRefillPanel = ({ onOrderCreated }) => {
    const { user, hasPlan } = useAuth();
    const navigate = useNavigate();
    
    // Debug subscription plan
    console.log("User plan identity:", user?.plan);

    const isPro = hasPlan('PRO');
    
    const [enabled, setEnabled] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({
        minStockLevel: 10,
        preferredSupplier: '',
        defaultQuantity: 50
    });
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        if (isPro) {
            fetchInitialData();
        }
    }, [isPro]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [profileRes, suggestionsRes, suppliersRes] = await Promise.all([
                api.get('/auth/profile'),
                api.get('/purchase-orders/suggestions'),
                api.get('/suppliers')
            ]);
            
            const pharm = profileRes.data.data.pharmacy;
            setEnabled(pharm.autoRefillEnabled || false);
            setSettings(pharm.autoRefillSettings || settings);
            setSuggestions(suggestionsRes.data.data || []);
            setSuppliers(suppliersRes.data.data || []);
        } catch (err) {
            console.error("Failed to load Pro data", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleRefill = async () => {
        try {
            const nextState = !enabled;
            await api.post('/purchase-orders/refill-settings', { enabled: nextState, settings });
            setEnabled(nextState);
            toast.success(nextState ? 'Smart Refill Matrix Activated' : 'Smart Refill Suspended');
            if (nextState) fetchInitialData();
        } catch (err) {
            toast.error('Protocol Failure');
        }
    };

    const saveSettings = async (e) => {
        e.preventDefault();
        try {
            await api.post('/purchase-orders/refill-settings', { enabled, settings });
            toast.success('Protocol Settings Encrypted');
            setShowSettings(false);
            fetchInitialData();
        } catch (err) {
            toast.error('System Failure');
        }
    };

    const approveOrder = async (suggestion) => {
        try {
            await api.post('/purchase-orders', {
                supplier: suggestion.supplier || suppliers[0]?._id,
                medicines: [{ name: suggestion.medicine, quantity: suggestion.qty, price: 0 }],
                totalAmount: 0,
                totalItems: 1
            });
            toast.success('Suggestion Authorized');
            setSuggestions(suggestions.filter(s => s._id !== suggestion._id));
            if (onOrderCreated) onOrderCreated();
        } catch (err) {
            toast.error('Authorization Denied');
        }
    };

    if (!isPro) {
        return (
            <div className="bg-gradient-to-br from-pharmacy-900 via-slate-800 to-pharmacy-950 p-8 md:p-12 lg:p-16 rounded-2xl text-white relative overflow-hidden shadow-2xl group flex flex-col items-center text-center">
                <div className="absolute inset-0 bg-grid-white bg-[size:30px_30px] opacity-[0.03]"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-primary-400/30 transition-all duration-1000"></div>
                
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-primary-400 mb-6 md:mb-8 shadow-inner border border-white/10 group-hover:rotate-12 transition-transform">
                    <Sparkles size={32} className="animate-pulse" />
                </div>
                
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 leading-tight">Smart Stock Refill</h3>
                <p className="text-slate-400 font-medium italic mb-8 md:mb-10 max-w-xs text-xs md:text-sm">Full automated replenishment protocol is locked to Quantum Hub level authentication.</p>
                
                <button 
                    onClick={() => navigate('/subscription')}
                    className="flex items-center gap-3 bg-primary-600 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-2xl shadow-primary-500/30 hover:bg-primary-500 active:scale-95 transition-all"
                >
                    <Crown size={14} fill="white" />
                    Unlock Pro Protocol
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="bg-white border-2 border-primary-100 rounded-2xl p-6 md:p-8 shadow-xl shadow-primary-500/5 group relative overflow-hidden">
                <div className="flex justify-between items-start gap-4 mb-6 md:mb-10">
                    <div className="flex items-center gap-4">
                        <div className={clsx(
                            "w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-inner transition-all duration-500",
                            enabled ? "bg-emerald-50 text-emerald-600 rotate-3" : "bg-slate-100 text-slate-400"
                        )}>
                            <Zap size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">Smart Refill Matrix</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Automated suggestion protocol active</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowSettings(true)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all rotate-[15deg] group-hover:rotate-0"
                    >
                        <Settings size={18} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6 md:mb-10">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Matrix Status</span>
                    <button 
                        onClick={toggleRefill}
                        className={clsx(
                            "w-14 h-7 md:w-18 md:h-9 rounded-full relative transition-all duration-500 p-1 md:p-1.5",
                            enabled ? "bg-emerald-500" : "bg-slate-200"
                        )}
                    >
                        <div className={clsx(
                            "w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-lg transition-transform duration-500",
                            enabled ? "translate-x-7 md:translate-x-9" : "translate-x-0"
                        )}></div>
                    </button>
                </div>

                <div className="space-y-4 md:space-y-6">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-primary-600 flex items-center gap-2 md:gap-3">
                        <ShieldCheck size={14} /> Optimization Suggestions
                    </h4>
                    {suggestions.length > 0 ? suggestions.map((sug, i) => (
                        <div key={i} className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-transparent hover:border-primary-200 transition-all group/item hover:bg-white hover:shadow-2xl hover:shadow-primary-500/10 active:scale-[0.98]">
                            <div className="flex justify-between items-start mb-4 md:mb-6">
                                <div>
                                    <p className="font-black text-lg md:text-xl text-slate-900 uppercase tracking-tight">{sug.medicine}</p>
                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic mt-0.5 md:mt-1">{sug.currentStock} Units Left</p>
                                </div>
                                <div className="bg-primary-50 text-primary-600 text-[8px] md:text-[9px] font-black px-3 py-1.5 rounded-full border border-primary-100 uppercase tracking-widest">Suggested</div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 text-[9px] text-slate-400 font-black mb-6 md:mb-10 uppercase tracking-widest">
                                <Truck size={12} /> Refill Qty: {sug.qty} Units
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <button 
                                    onClick={() => approveOrder(sug)}
                                    className="py-3.5 md:py-4 bg-primary-600 text-white rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all border border-primary-500 shadow-xl shadow-primary-500/30"
                                >
                                    Approve Protocol
                                </button>
                                <button 
                                    className="py-3.5 md:py-4 bg-white text-slate-400 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200"
                                >
                                    Ignore Node
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="py-12 md:py-20 text-center opacity-30 flex flex-col items-center gap-4 md:gap-6 grayscale">
                            <ShieldCheck size={40} md:size={48} strokeWidth={1} />
                            <p className="text-[10px] font-black uppercase tracking-widest">All protocols optimal</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Settings Modal */}
            <Modal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                title="Matrix Refactor"
                maxWidth="max-w-xl"
                footer={
                    <button 
                        form="refill-settings-form"
                        className="w-full bg-primary-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary-500/30 hover:bg-primary-700 active:scale-95 transition-all"
                    >
                        Encrypt Settings
                    </button>
                }
            >
                <form id="refill-settings-form" onSubmit={saveSettings} className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Min Level</label>
                            <input 
                                type="number" 
                                value={settings.minStockLevel}
                                onChange={(e) => setSettings({...settings, minStockLevel: parseInt(e.target.value)})}
                                className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 font-black text-xs"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Default Qty</label>
                            <input 
                                type="number" 
                                value={settings.defaultQuantity}
                                onChange={(e) => setSettings({...settings, defaultQuantity: parseInt(e.target.value)})}
                                className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 font-black text-xs"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Preferred Supplier Node</label>
                        <select 
                            value={settings.preferredSupplier}
                            onChange={(e) => setSettings({...settings, preferredSupplier: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 font-black text-xs uppercase"
                        >
                            <option value="">Select Protocol Node...</option>
                            {suppliers.map(s => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </form>
            </Modal>

        </div>
    );
};

export default AutoRefillPanel;
