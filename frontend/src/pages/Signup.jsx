import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Pill, User, Mail, Lock, ChevronRight, Loader2, CheckCircle2, Eye, EyeOff } from '../constants/icons';
import { toast } from 'react-toastify';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setLoading(true);
        try {
            // Mapping existing backend register-pharmacy logic for now
            // In a real scenario, we might need a simpler /register-user endpoint
            // But for PharmFlow, every signup currently expects pharmacy details
            // I'll use the existing registerPharmacy logic but with dummy pharmacy data for now
            // to fulfill the user's UI request while keeping it functional.
            
            const signupPayload = {
                ...formData,
                ownerName: formData.name,
                // Dummy pharmacy data for rapid onboarding
                name: `${formData.name}'s Pharmacy`,
                phone: '0000000000',
                address: 'To be configured',
                subscriptionPlan: 'Basic'
            };

            const res = await api.post('/auth/register-pharmacy', signupPayload);
            localStorage.setItem('token', res.data.token);
            toast.success('Establishment Successful! Welcome to PharmFlow v2');
            navigate('/');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Node deployment failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { supabase } = await import('../lib/supabase');
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google'
            });
            if (error) throw error;
        } catch (err) {
            console.error(err);
            toast.error('Google Authentication Failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12 relative overflow-hidden font-['Inter']">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(14,165,233,0.1),transparent)] pointer-events-none"></div>

            <div className="max-w-[480px] w-full z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-[24px] shadow-xl shadow-primary-200 mb-6 transform transition hover:scale-110 duration-500">
                        <Pill className="text-white" size={40} />
                    </div>
                    <h1 className="text-[32px] font-black tracking-tight text-slate-900 leading-none mb-2">
                        Initialize <span className="text-primary-600">New Node</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Join the digital pharmacy revolution.</p>
                </div>

                <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.15)] border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name Field */}
                        <div className="relative group">
                            <input
                                name="name"
                                type="text"
                                id="name"
                                className={`peer w-full px-6 pt-6 pb-2 bg-white border-2 rounded-2xl font-semibold text-slate-800 outline-none transition-all placeholder-transparent ${errors.name ? 'border-red-100 focus:border-red-500 focus:ring-4 focus:ring-red-50' : 'border-slate-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-50'}`}
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <label 
                                htmlFor="name"
                                className="absolute left-6 top-2 text-xs font-bold text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold pointer-events-none"
                            >
                                Full Architect Name
                            </label>
                            <User className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={20} />
                            {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1 ml-4 uppercase">{errors.name}</p>}
                        </div>

                        {/* Email Field */}
                        <div className="relative group">
                            <input
                                name="email"
                                type="email"
                                id="email"
                                className={`peer w-full px-6 pt-6 pb-2 bg-white border-2 rounded-2xl font-semibold text-slate-800 outline-none transition-all placeholder-transparent ${errors.email ? 'border-red-100 focus:border-red-500 focus:ring-4 focus:ring-red-50' : 'border-slate-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-50'}`}
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <label 
                                htmlFor="email"
                                className="absolute left-6 top-2 text-xs font-bold text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold pointer-events-none"
                            >
                                Email Uplink
                            </label>
                            <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={20} />
                            {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1 ml-4 uppercase">{errors.email}</p>}
                        </div>

                        {/* Password Field */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative group">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className={`peer w-full px-6 pt-6 pb-2 bg-white border-2 rounded-2xl font-semibold text-slate-800 outline-none transition-all placeholder-transparent ${errors.password ? 'border-red-100 focus:border-red-500 focus:ring-4 focus:ring-red-50' : 'border-slate-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-50'}`}
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <label 
                                    htmlFor="password"
                                    className="absolute left-6 top-2 text-xs font-bold text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold pointer-events-none"
                                >
                                    Password
                                </label>
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            <div className="relative group">
                                <input
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    className={`peer w-full px-6 pt-6 pb-2 bg-white border-2 rounded-2xl font-semibold text-slate-800 outline-none transition-all placeholder-transparent ${errors.confirmPassword ? 'border-red-100 focus:border-red-500 focus:ring-4 focus:ring-red-50' : 'border-slate-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-50'}`}
                                    placeholder="Confirm"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <label 
                                    htmlFor="confirmPassword"
                                    className="absolute left-6 top-2 text-xs font-bold text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold pointer-events-none"
                                >
                                    Confirm
                                </label>
                            </div>
                        </div>
                        {errors.password && <p className="text-[10px] text-red-500 font-bold mt-1 ml-4 uppercase">{errors.password}</p>}
                        {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold mt-1 ml-4 uppercase">{errors.confirmPassword}</p>}

                        <div className="py-2">
                             <div className="flex items-start gap-3 bg-primary-50/30 p-4 rounded-2xl border border-primary-50">
                                <CheckCircle2 className="text-primary-600 shrink-0 mt-0.5" size={18} />
                                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                                    By building this node, you agree to our <span className="text-primary-600 font-bold">Standard Operating Protocols</span> and data encryption policies.
                                </p>
                             </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    Establish Node
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                            <span className="bg-white px-4">Cloud Bridge Authorization</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full py-4 border-2 border-slate-100 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold transition-all active:scale-[0.98]"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <div className="text-center mt-8">
                    <p className="text-sm font-semibold text-slate-400">
                        Node already established?{' '}
                        <Link to="/login" className="text-primary-600 font-black hover:text-primary-700 transition-colors uppercase tracking-widest text-xs ml-1">Authenticate Session</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
