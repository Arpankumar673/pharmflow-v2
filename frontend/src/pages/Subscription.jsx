import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    CheckCircle2,
    Zap,
    Crown,
    Rocket,
    ShieldCheck,
    CreditCard,
    AlertTriangle,
    Loader2,
    ArrowUpRight,
    Tag,
    Sparkles
} from '../constants/icons';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

const Subscription = () => {
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const { user, refreshUser } = useAuth();
    const [promoCode, setPromoCode] = useState('');
    const [applyingPromo, setApplyingPromo] = useState(false);
    const [promoData, setPromoData] = useState(null);

    useEffect(() => {
        fetchSubscriptionStatus();
    }, []);

    const fetchSubscriptionStatus = async () => {
        try {
            const res = await api.get('/subscription/status');
            setCurrentSubscription(res.data.data);
        } catch (err) {
            console.error('Error fetching subscription', err);
        } finally {
            setLoading(false);
        }
    };

    const loadRazorpay = (orderData, plan) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
            amount: orderData.amount,
            currency: "INR",
            name: "PharmFlow SaaS",
            description: `${plan} Subscription`,
            image: "https://example.com/logo.png",
            order_id: orderData.id,
            handler: async (response) => {
                try {
                    setProcessing(true);
                    const verifyRes = await api.post('/subscription/verify-payment', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    });

                    if (verifyRes.data.success) {
                        toast.success('Subscription activated successfully!');
                        fetchSubscriptionStatus();
                        window.location.reload();
                    }
                } catch (err) {
                    toast.error('Payment verification failed');
                } finally {
                    setProcessing(false);
                }
            },
            prefill: {
                name: user?.name,
                email: user?.email,
                contact: user?.phone
            },
            theme: {
                color: "#0ea5e9"
            }
        };

        if (!window.Razorpay) {
            toast.error('Razorpay SDK failed to load. Please check your connection.');
            return;
        }

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const handleSubscribe = async (plan) => {
        try {
            setProcessing(true);
            const payload = { plan };
            if (promoData && promoCode) {
                payload.promoCode = promoCode;
            }
            const res = await api.post('/subscription/create-order', payload);
            
            if (res.data.noPaymentRequired) {
                toast.success('Subscription activated successfully!');
                fetchSubscriptionStatus();
                window.location.reload();
                return;
            }
            
            loadRazorpay(res.data.order, plan);
        } catch (err) {
            toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to initiate payment');
        } finally {
            setProcessing(false);
        }
    };

    const activatePlan = async (plan) => {
        try {
            setProcessing(true);
            const res = await api.post("/subscription/activate", { plan });
            if (res.data.success) {
                await refreshUser();
                toast.success(`${plan} Activated!`);
                fetchSubscriptionStatus();
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Activation failed");
        } finally {
            setProcessing(false);
        }
    };

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) {
            toast.warning('Enter promo code');
            return;
        }

        try {
            setApplyingPromo(true);
            const res = await api.post('/subscription/apply-promo', { 
                code: promoCode,
                planPrice: 399 // Providing a default plan price to satisfy backend calculations
            });
            
            if (res.data.success || res.data.valid) {
                toast.success(res.data.message || 'Promo applied!');
                setPromoData(res.data);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Invalid code');
        } finally {
            setApplyingPromo(false);
        }
    };

    const currentPlan = user?.plan || "BASIC";

    const plans = [
        {
            id: 'BASIC',
            name: 'Standard Node',
            price: 0,
            icon: Zap,
            color: 'from-blue-600 to-cyan-500',
            features: [
                'Full Inventory Management',
                'Point of Sale & Billing',
                'Financial Reports',
                'Core Data Logs',
                '1 Neural Staff Link'
            ]
        },
        {
            id: 'PRO',
            name: 'Quantum Hub',
            price: 399,
            recommended: true,
            icon: Rocket,
            color: 'from-primary-600 to-emerald-500',
            features: [
                'Everything in BASIC',
                'AI Demand Forecasting',
                'Price Intelligence',
                'OCR Scanner Node',
                'Deep Neural Analytics'
            ]
        },
        {
            id: 'ENTERPRISE',
            name: 'Empire Grid',
            price: 799,
            icon: Crown,
            color: 'from-purple-600 to-pink-500',
            features: [
                'Everything in PRO',
                'Global Multi-store Grid',
                'Pharmacy Network Sync',
                'Unlimited System Links',
                'Priority Architect Support'
            ]
        }
    ];

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-16 h-16 text-primary-600 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-600 italic">Accessing grid...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-12 animate-fade-in">
            <header className="text-center max-w-3xl mx-auto pt-6 px-4">
                <div className="inline-block px-4 py-1.5 bg-primary-50 rounded-full text-[9px] font-black text-primary-600 uppercase tracking-widest mb-6 border border-primary-100/50">Subscription Terminal</div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-pharmacy-900 tracking-tighter mb-4 uppercase leading-none">Upgrade Your<br /><span className="text-primary-600">Pharmacy Core</span></h1>
                <p className="text-xs md:text-sm text-pharmacy-500 font-medium italic opacity-70">Scale your operations with advanced AI protocols and enterprise-grade infrastructure.</p>
            </header>

            {currentSubscription?.status === 'active' && (
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-emerald-600 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-grid-white opacity-[0.05]"></div>
                        <div className="flex items-center gap-5 relative z-10 text-white text-center md:text-left">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center shadow-inner">
                                <ShieldCheck size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter">{currentSubscription.plan} Identity Active</h3>
                                <p className="text-[10px] text-emerald-100 font-black uppercase tracking-widest opacity-80 mt-1 italic">Active until {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <button className="relative z-10 w-full md:w-auto bg-white text-emerald-600 font-black uppercase tracking-widest text-[9px] px-8 py-3.5 rounded-xl hover:bg-emerald-50 transition-all active:scale-95 shadow-lg">Manage Billing</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={clsx(
                            "relative flex flex-col p-8 md:p-10 rounded-2xl transition-all duration-300 group overflow-hidden bg-white border border-slate-100",
                            currentPlan === plan.id ? "ring-4 ring-emerald-500 shadow-2xl scale-[1.02]" : "hover:shadow-xl hover:-translate-y-1",
                            plan.recommended && currentPlan !== plan.id && "ring-2 ring-primary-500"
                        )}
                    >
                        {currentPlan === plan.id && (
                            <div className="absolute top-6 right-6">
                                <span className="bg-emerald-600 text-white text-[8px] font-black py-1.5 px-3 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                                    <ShieldCheck size={10} />
                                    Active
                                </span>
                            </div>
                        )}
                        
                        {plan.recommended && currentPlan !== plan.id && (
                            <div className="absolute top-6 right-6">
                                <span className="bg-primary-600 text-white text-[8px] font-black py-1.5 px-3 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                                    <Zap size={10} />
                                    Popular
                                </span>
                            </div>
                        )}

                        <div className={clsx(
                            "w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-8 shadow-lg shadow-inner group-hover:rotate-3 transition-transform",
                            plan.color
                        )}>
                            <plan.icon size={28} />
                        </div>

                        <h3 className="text-2xl font-black text-pharmacy-900 mb-1 tracking-tighter uppercase">{plan.name}</h3>
                        <p className="text-[9px] font-black text-pharmacy-400 uppercase tracking-widest mb-8 italic">Tier: PF-{plan.id}</p>

                        <div className="flex items-baseline gap-2 p-4 bg-slate-50 rounded-xl justify-center border border-slate-100">
                            {promoData ? (
                                <>
                                    <span className="text-xl font-bold text-slate-400 line-through">₹{plan.price}</span>
                                    <span className="text-4xl font-black text-emerald-600 tracking-tighter">
                                        ₹{plan.price - (plan.price * (promoData.discountPercent / 100))}
                                    </span>
                                </>
                            ) : (
                                <span className="text-4xl font-black text-pharmacy-900 tracking-tighter">₹{plan.price}</span>
                            )}
                            <span className="text-[10px] font-black text-pharmacy-400 uppercase tracking-widest">/mo</span>
                        </div>
                        {promoData && promoData.durationMonths > 0 && (
                            <p className="text-[9px] font-black text-emerald-500 text-center uppercase tracking-widest mb-4 italic mt-2">
                                For the first {promoData.durationMonths} month(s)
                            </p>
                        )}
                        {!promoData && <div className="mb-8"></div>}

                        <ul className="space-y-4 mb-10 flex-1 mt-4">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-[10px] font-black text-pharmacy-700 uppercase tracking-tighter">
                                    <div className="w-5 h-5 min-w-[20px] flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                        <CheckCircle2 size={12} />
                                    </div>
                                    <span className="truncate">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            disabled={currentPlan === plan.id || processing}
                            onClick={() => plan.id === "BASIC" ? activatePlan("BASIC") : handleSubscribe(plan.id)}
                            className={clsx(
                                "w-full py-4 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all active:scale-95 flex items-center justify-center gap-2",
                                plan.id === "PRO" ? "bg-primary-600 text-white shadow-lg shadow-primary-100" :
                                plan.id === "ENTERPRISE" ? "bg-slate-900 text-white shadow-lg shadow-slate-100" :
                                "bg-slate-100 text-slate-900",
                                currentPlan === plan.id && "bg-emerald-500 text-white cursor-default shadow-none"
                            )}
                        >
                            {processing ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    {currentPlan === plan.id ? "Current Architecture" : "Initialize Link"}
                                    {currentPlan !== plan.id && <ArrowUpRight size={16} />}
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Promo Code */}
            <div className="max-w-3xl mx-auto px-4 mt-8">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Authorization Override</h3>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest italic font-bold">Enter promo code to unlock protocols.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                placeholder="PROMO CODE"
                                className="w-full bg-white border border-slate-200 rounded-xl px-6 py-3.5 text-slate-800 font-black focus:ring-2 ring-primary-100 focus:border-primary-400 outline-none transition-all placeholder:text-slate-300 uppercase tracking-widest text-sm"
                            />
                            {promoCode && (
                                <Sparkles size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 animate-pulse" />
                            )}
                        </div>
                        <button 
                            onClick={handleApplyPromo}
                            disabled={applyingPromo || !promoCode}
                            className="bg-primary-600 text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-primary-700 disabled:bg-slate-200 transition-all active:scale-95 shadow-lg shadow-primary-100 flex items-center justify-center gap-2"
                        >
                            {applyingPromo ? <Loader2 size={16} className="animate-spin" /> : "Apply Link"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Enterprise Grid */}
            <div className="max-w-6xl mx-auto mt-16 px-4">
                <div className="bg-slate-900 p-8 md:p-16 lg:p-20 rounded-2xl text-white relative overflow-hidden group">
                    <div className="absolute inset-0 bg-grid-white opacity-[0.03]"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[100px] rounded-full -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-primary-600/20"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/5 py-1.5 px-3 rounded-full text-[8px] font-black uppercase tracking-widest mb-6 border border-white/10">
                                <AlertTriangle size={12} className="text-amber-400" />
                                Enterprise Scale Grid
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">Need Unlimited<br /><span className="text-primary-400">Scale?</span></h2>
                            <p className="text-xs md:text-sm text-slate-400 font-medium italic mb-10 max-w-lg mx-auto lg:mx-0">For hospital networks and national chains, we provide dedicated cloud instances and custom protocol integration.</p>
                            <button className="w-full sm:w-auto bg-white text-slate-900 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-50 active:scale-95 transition-all shadow-xl">Contact Systems Architect</button>
                        </div>
                        <div className="hidden lg:flex justify-center">
                            <div className="w-48 h-48 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-3xl group-hover:rotate-6 transition-transform duration-1000 relative">
                                <CreditCard size={64} className="text-white opacity-10" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-primary-500/10 blur-[30px] rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
