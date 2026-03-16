import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, Pill, ChevronRight, Eye, EyeOff } from '../constants/icons';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const loginAttemptedRef = useRef(false);

    // Navigate to dashboard only after user state is fully propagated in context
    useEffect(() => {
        if (loginAttemptedRef.current && user) {
            loginAttemptedRef.current = false;
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const loginWithGoogle = async () => {
        setIsSubmitting(true);
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) {
            console.error(error);
            toast.error("Google Authentication Failed");
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);

        try {
            loginAttemptedRef.current = true;
            await login(email, password);
            toast.success('Welcome back to PharmFlow v2');
            // navigate() is handled by the useEffect watching user state above
        } catch (err) {
            loginAttemptedRef.current = false;
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
                    <p className="text-slate-500 font-medium">Elevating pharmacy operations through innovation.</p>
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
                                Secure Password
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
                                    Validating...
                                </>
                            ) : (
                                <>
                                    Login to Terminal
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
                            <span className="bg-white px-4">OR CONTINUE WITH</span>
                        </div>
                    </div>

                    <button
                        onClick={loginWithGoogle}
                        disabled={isSubmitting}
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
                        New deployment?{' '}
                        <Link to="/signup" className="text-primary-600 font-black hover:text-primary-700 transition-colors uppercase tracking-widest text-xs ml-1">Establish Node</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
