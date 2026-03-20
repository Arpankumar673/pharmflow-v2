import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, Pill, ChevronRight, Eye, EyeOff } from '../constants/icons';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { login, user } = useAuth();
    const navigate = useNavigate();
    // Navigate to dashboard automatically as soon as the user is authenticated (Email or Google)
    useEffect(() => {
        if (user) {
            navigate('/dashboard', { replace: true });
        }
     }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);

        try {
            await login(email, password);
            toast.success('Welcome back to PharmFlow v2');
            // navigate() is handled by the useEffect watching user state above
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12 relative overflow-hidden font-['Inter']">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(14,165,233,0.1),transparent)] pointer-events-none"></div>
            
            <div className="max-w-[440px] w-full z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-[24px] shadow-xl shadow-primary-200 mb-6 transform transition hover:scale-110 duration-500">
                        <Pill className="text-white" size={40} />
                    </div>
                    <h1 className="text-[32px] font-black tracking-tight text-slate-900 leading-none mb-2">
                        Welcome to <span className="text-primary-600">PharmFlow</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Elevating your pharmacy operations.</p>
                </div>

                <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.15)] border border-slate-100">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-shake">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-semibold text-red-600">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field with Floating Label */}
                        <div className="relative group">
                            <input
                                type="email"
                                id="email"
                                className={`peer w-full px-6 pt-6 pb-2 bg-white border-2 rounded-2xl font-semibold text-slate-800 outline-none transition-all placeholder-transparent ${error ? 'border-red-100 focus:border-red-500 focus:ring-4 focus:ring-red-50' : 'border-slate-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-50'}`}
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <label 
                                htmlFor="email"
                                className="absolute left-6 top-2 text-xs font-bold text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold pointer-events-none"
                            >
                                Email Address
                            </label>
                            <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={20} />
                        </div>

                        {/* Password Field with Floating Label */}
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className={`peer w-full px-6 pt-6 pb-2 bg-white border-2 rounded-2xl font-semibold text-slate-800 outline-none transition-all placeholder-transparent ${error ? 'border-red-100 focus:border-red-500 focus:ring-4 focus:ring-red-50' : 'border-slate-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-50'}`}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        className="peer sr-only" 
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <div className="w-5 h-5 bg-slate-100 border-2 border-slate-200 rounded-md peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-all"></div>
                                    <svg className="absolute w-3 h-3 text-white top-1 left-1 scale-0 peer-checked:scale-100 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700">Remember me</span>
                            </label>
                            <Link to="/forgot-password" size={20} className="text-xs font-black text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-wider">Forgot Password?</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Login
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8">
                    <p className="text-sm font-semibold text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary-600 font-black hover:text-primary-700 transition-colors uppercase tracking-widest text-xs ml-1">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
