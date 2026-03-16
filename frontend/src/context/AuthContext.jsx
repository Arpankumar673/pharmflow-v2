import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const hasSyncedRef = useRef(false);

    useEffect(() => {
        // --- Restore session on page load ---
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/auth/profile')
                .then(res => setUser(res.data.data))
                .catch(() => {
                    localStorage.removeItem('token');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }

        // --- Listen for OAuth (Google) sign-ins only ---
        // Email/password login is handled directly in login() below.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!session) return;
            if (event !== 'SIGNED_IN') return;
            if (hasSyncedRef.current) return;

            hasSyncedRef.current = true;

            try {
                const accessToken = session.access_token;
                const res = await api.post('/auth/login', { token: accessToken });
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
            } catch (err) {
                console.error('Auth sync failed (OAuth)', err);
                hasSyncedRef.current = false;
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const refreshUser = async () => {
        try {
            const res = await api.get('/auth/profile');
            setUser(res.data.data);
        } catch (err) {
            console.error('Failed to refresh user', err);
        }
    };

    const signup = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    };

    // login() does the FULL auth cycle:
    // 1. Supabase signIn  2. Backend sync  3. setUser
    // After this resolves, Login.jsx can safely navigate().
    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Mark synced so onAuthStateChange listener doesn't duplicate the POST
        hasSyncedRef.current = true;

        const accessToken = data.session.access_token;
        const res = await api.post('/auth/login', { token: accessToken });

        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);

        return res.data.user;
    };

    const setToken = async (token) => {
        localStorage.setItem('token', token);
        await refreshUser();
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('Supabase signout error', err);
        }
        localStorage.removeItem('token');
        setUser(null);
        hasSyncedRef.current = false;
    };

    const isSuperAdmin = user?.role === 'SuperAdmin';
    const isOwner = user?.role === 'PharmacyOwner' || user?.role === 'SuperAdmin';
    const isPharmacist = user?.role === 'Pharmacist' || isOwner;
    const isStaff = user?.role === 'Staff' || isPharmacist;

    const hasPlan = (required) => {
        if (isSuperAdmin) return true;
        
        // Check active status and expiration
        const isExpired = user?.subscriptionExpires && new Date(user.subscriptionExpires) < new Date();
        if (!user?.subscriptionActive || isExpired) return false;

        const levels = { BASIC: 1, PRO: 2, ENTERPRISE: 3 };

        const userLevel = levels[user?.plan?.toUpperCase()] || 0;
        const requiredLevel = levels[required?.toUpperCase()] || 0;

        return userLevel >= requiredLevel;
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signup,
            login,
            setToken,
            logout,
            refreshUser,
            isSuperAdmin,
            isOwner,
            isPharmacist,
            isStaff,
            hasPlan
        }}>
            {children}
        </AuthContext.Provider>
    );
};
