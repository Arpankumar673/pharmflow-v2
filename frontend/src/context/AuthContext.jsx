import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const token = await firebaseUser.getIdToken();
                    const res = await api.post('/auth/login', { token });
                    localStorage.setItem('token', res.data.token);
                    setUser(res.data.user);
                } catch (err) {
                    console.error('Firebase Auth sync failed', err);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const refreshUser = async () => {
        try {
            const res = await api.get('/auth/profile');
            setUser(res.data.data);
        } catch (err) {
            console.error('Failed to refresh user', err);
        }
    };

    const login = async (email, password) => {
        // Authenticate with Firebase natively
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        
        // Sync with backend API
        const res = await api.post('/auth/login', { token });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const setToken = async (token) => {
        localStorage.setItem('token', token);
        await refreshUser();
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error('Firebase signout error', err);
        }
        localStorage.removeItem('token');
        setUser(null);
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

        const levels = {
            BASIC: 1,
            PRO: 2,
            ENTERPRISE: 3
        };

        const userLevel = levels[user?.plan?.toUpperCase()] || 0;
        const requiredLevel = levels[required?.toUpperCase()] || 0;

        return userLevel >= requiredLevel;
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
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
