import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    User as UserIcon,
    Building2,
    Lock,
    Save,
    ShieldCheck,
    Mail,
    Phone,
    MapPin,
    FileText,
    Settings as SettingsIcon,
    Bell,
    IndianRupee,
    Clock,
    Users,
    Plus,
    Trash2,
    Download,
    Database,
    RefreshCw,
    LogOut,
    Trash,
    Loader2,
    Globe,
    Activity,
    CreditCard
} from '../constants/icons';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const Settings = () => {
    const { user, isOwner, refreshUser, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form States
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const [pharmacyData, setPharmacyData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        phone: '',
        licenseNumber: '',
        gstNumber: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [preferences, setPreferences] = useState({
        currency: '₹',
        timezone: 'UTC',
        lowStockThreshold: 10,
        expiryAlertDays: 30,
        discountPercentage: 0
    });

    const [staffList, setStaffList] = useState([]);
    const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'Staff' });
    const [showAddStaff, setShowAddStaff] = useState(false);

    useEffect(() => {
        fetchSettingsData();
    }, []);

    const fetchSettingsData = async () => {
        setLoading(true);
        try {
            if (user) {
                setProfileData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || ''
                });
            }

            const pharmRes = await api.get('/pharmacy').catch(() => ({ data: { success: false, data: null } }));
            if (pharmRes.data.success && pharmRes.data.data) {
                const pharmacy = pharmRes.data.data;
                setPharmacyData({
                    name: pharmacy.name || '',
                    address: pharmacy.address || '',
                    city: pharmacy.city || '',
                    state: pharmacy.state || '',
                    phone: pharmacy.phone || '',
                    licenseNumber: pharmacy.licenseNumber || '',
                    gstNumber: pharmacy.gstNumber || ''
                });
                setPreferences(pharmacy.preferences || {
                    currency: '₹',
                    timezone: 'UTC',
                    lowStockThreshold: 10,
                    expiryAlertDays: 30,
                    discountPercentage: 0
                });
            }

            if (isOwner) {
                const staffRes = await api.get('/staff');
                if (staffRes.data.success) {
                    setStaffList(staffRes.data.data);
                }
            }
        } catch (err) {
            console.error('Error fetching settings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put('/users/profile', profileData);
            await refreshUser();
            toast.success('Profile updated');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePharmacyUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put('/pharmacy', pharmacyData);
            toast.success('Pharmacy details updated');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update pharmacy');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setSubmitting(true);
        try {
            await api.put('/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password updated');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update password');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePreferencesUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put('/settings/preferences', preferences);
            toast.success('Preferences saved');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update preferences');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post('/staff', newStaff);
            if (res.data.success) {
                setStaffList([...staffList, res.data.data]);
                setNewStaff({ name: '', email: '', password: '', role: 'Staff' });
                setShowAddStaff(false);
                toast.success('Staff added');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add staff');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteStaff = async (id) => {
        if (!window.confirm('Remove this staff?')) return;
        try {
            await api.delete(`/staff/${id}`);
            setStaffList(staffList.filter(s => s._id !== id));
            toast.success('Staff removed');
        } catch (err) {
            toast.error('Failed to remove staff');
        }
    };

    const handleExportSnapshot = async () => {
        try {
            setSubmitting(true);
            const res = await api.get('/settings/export-snapshot');
            
            const dataStr = JSON.stringify(res.data, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            
            link.href = url;
            link.download = `pharmflow-backup-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast.success('Backup complete');
        } catch (err) {
            console.error('Export failed', err);
            toast.error('Export failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete your account? This action cannot be undone."
        );

        if (!confirmDelete) return;

        try {
            await api.delete("/auth/delete-account");
            localStorage.removeItem("token");
            toast.success("Account deleted successfully");
            navigate("/login");
        } catch (error) {
            console.error("Delete failed", error);
            toast.error(error.response?.data?.error || "Failed to delete account");
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-16 h-16 text-primary-600 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-600 italic">Syncing control grid...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8 pt-2">
                <div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-pharmacy-900 tracking-tighter uppercase leading-none">System <span className="text-primary-600">Control</span></h1>
                    <p className="text-xs md:text-sm text-pharmacy-500 font-medium italic mt-2 opacity-70">Architectural parameters and neural identity config.</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm w-fit">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase text-pharmacy-600 tracking-widest">Protocol Sync Nominal</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-10">
                <div className="lg:col-span-8 space-y-6 md:space-y-10">
                    {/* Neural Identity */}
                    <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-8 md:mb-10 relative z-10">
                            <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shadow-inner">
                                <UserIcon size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-black text-pharmacy-900 uppercase tracking-tighter leading-none">Neural Identity</h2>
                                <p className="text-[9px] text-pharmacy-400 font-black uppercase tracking-widest mt-1 italic">Authentication Metadata</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-pharmacy-400 ml-2 block italic">Formal Alias</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3.5 font-bold text-pharmacy-900 focus:border-primary-500 focus:bg-white outline-none transition-all"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-pharmacy-400 ml-2 block italic">Mail Link</label>
                                    <input
                                        type="email"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3.5 font-bold text-pharmacy-900 focus:border-primary-500 focus:bg-white outline-none transition-all"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-pharmacy-400 ml-2 block italic">Contact Frequency</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3.5 font-bold text-pharmacy-900 focus:border-primary-500 focus:bg-white outline-none transition-all"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-pharmacy-400 ml-2 block italic">Active Node Plan</label>
                                    <div className="w-full bg-slate-50 rounded-xl px-4 py-3.5 font-bold text-pharmacy-800 flex items-center justify-between border-2 border-transparent opacity-70">
                                        <span className="uppercase text-xs">{user?.role}</span>
                                        <span className="bg-primary-600 text-white text-[9px] px-2 py-0.5 rounded uppercase">{user?.plan}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
                            >
                                <Save size={16} />
                                {submitting ? 'Updating...' : 'Update Identity'}
                            </button>
                        </form>
                    </section>

                    {/* Pharmacy Architecture */}
                    {isOwner && (
                        <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-8 md:mb-10 relative z-10">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg md:text-xl font-black text-pharmacy-900 uppercase tracking-tighter leading-none">Pharmacy Architecture</h2>
                                    <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mt-1 italic">Global Operational Node</p>
                                </div>
                            </div>

                            <form onSubmit={handlePharmacyUpdate} className="space-y-6 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-pharmacy-400 ml-2 block italic">Station Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3.5 font-black text-pharmacy-900 focus:border-emerald-500 focus:bg-white outline-none transition-all uppercase"
                                            value={pharmacyData.name}
                                            onChange={(e) => setPharmacyData({ ...pharmacyData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-pharmacy-400 ml-2 block italic">Geospatial Address</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3.5 font-bold text-pharmacy-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                            value={pharmacyData.address}
                                            onChange={(e) => setPharmacyData({ ...pharmacyData, address: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-pharmacy-400 ml-2 block italic">City Node</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3.5 font-bold text-pharmacy-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                            value={pharmacyData.city}
                                            onChange={(e) => setPharmacyData({ ...pharmacyData, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-pharmacy-400 ml-2 block italic">State Sector</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3.5 font-bold text-pharmacy-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                            value={pharmacyData.state}
                                            onChange={(e) => setPharmacyData({ ...pharmacyData, state: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-pharmacy-400 ml-2 block italic">License Identifier</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3.5 font-bold text-pharmacy-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                            value={pharmacyData.licenseNumber}
                                            onChange={(e) => setPharmacyData({ ...pharmacyData, licenseNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-pharmacy-400 ml-2 block italic">GST Registration</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3.5 font-bold text-pharmacy-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                            value={pharmacyData.gstNumber}
                                            onChange={(e) => setPharmacyData({ ...pharmacyData, gstNumber: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
                                >
                                    <Save size={16} />
                                    {submitting ? 'Syncing...' : 'Sync Architecture'}
                                </button>
                            </form>
                        </section>
                    )}

                    {/* Access Controls */}
                    {isOwner && (
                        <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg md:text-xl font-black text-pharmacy-900 uppercase tracking-tighter leading-none">Access Controls</h2>
                                        <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest mt-1 italic">Authorized Personnel Nodes</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAddStaff(!showAddStaff)}
                                    className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {showAddStaff && (
                                <form onSubmit={handleAddStaff} className="mb-8 p-6 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4 animate-scale-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Staff Name"
                                            className="bg-white border-2 border-transparent rounded-xl px-4 py-3 font-bold outline-none focus:border-blue-500"
                                            value={newStaff.name}
                                            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="email"
                                            placeholder="Staff Email"
                                            className="bg-white border-2 border-transparent rounded-xl px-4 py-3 font-bold outline-none focus:border-blue-500"
                                            value={newStaff.email}
                                            onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            className="bg-white border-2 border-transparent rounded-xl px-4 py-3 font-bold outline-none focus:border-blue-500"
                                            value={newStaff.password}
                                            onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                            required
                                        />
                                        <select
                                            className="bg-white border-2 border-transparent rounded-xl px-4 py-3 font-bold outline-none focus:border-blue-500"
                                            value={newStaff.role}
                                            onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                        >
                                            <option value="Staff">Basic Staff</option>
                                            <option value="Pharmacist">Pharmacist</option>
                                            <option value="Cashier">Cashier Node</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-blue-700"
                                    >
                                        Authorize New Node
                                    </button>
                                </form>
                            )}

                            <div className="space-y-3 relative z-10">
                                {staffList.map((staff) => (
                                    <div key={staff._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-white group/staff">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-pharmacy-900 font-black text-base border border-slate-100 group-hover/staff:bg-blue-600 group-hover/staff:text-white transition-all shadow-sm">
                                                {staff.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-pharmacy-900 uppercase tracking-tighter text-sm">{staff.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[9px] text-pharmacy-400 font-bold italic">{staff.email}</p>
                                                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[7px] font-black uppercase tracking-widest">
                                                        {staff.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteStaff(staff._id)}
                                            className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all md:opacity-0 md:group-hover/staff:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                {staffList.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-xs text-pharmacy-400 font-medium italic">No personnel initialized.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-6 md:space-y-10">
                    {/* System Preferences */}
                    {isOwner && (
                        <section className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white relative group overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-grid-white opacity-[0.03]"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>

                            <div className="flex items-center gap-4 mb-8 relative z-10">
                                <div className="w-12 h-12 bg-white/5 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10">
                                    <SettingsIcon size={22} className="text-primary-400" />
                                </div>
                                <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter">System Grid</h2>
                            </div>

                            <form onSubmit={handlePreferencesUpdate} className="space-y-5 relative z-10">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-primary-400 ml-2 block italic">Currency</label>
                                    <div className="relative">
                                        <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                                        <select
                                            className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-3 font-bold text-white outline-none focus:ring-1 ring-primary-500 transition-all appearance-none text-sm"
                                            value={preferences.currency}
                                            onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                                        >
                                            <option value="₹" className="bg-slate-900">INR (₹)</option>
                                            <option value="$" className="bg-slate-900">USD ($)</option>
                                            <option value="€" className="bg-slate-900">EUR (€)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-primary-400 ml-2 block italic">Time Dilation</label>
                                    <div className="relative">
                                        <Clock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-3 font-bold text-white outline-none focus:ring-1 ring-primary-500 transition-all text-sm"
                                            value={preferences.timezone}
                                            onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-primary-400 ml-2 block italic">Stock Threshold</label>
                                    <div className="relative">
                                        <Bell size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                                        <input
                                            type="number"
                                            className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-3 font-bold text-white outline-none focus:ring-1 ring-primary-500 transition-all text-sm"
                                            value={preferences.lowStockThreshold}
                                            onChange={(e) => setPreferences({ ...preferences, lowStockThreshold: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-primary-400 ml-2 block italic">Default Discount (%)</label>
                                    <div className="relative">
                                        <Activity size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-3 font-bold text-white outline-none focus:ring-1 ring-primary-500 transition-all text-sm"
                                            value={preferences.discountPercentage}
                                            onChange={(e) => setPreferences({ ...preferences, discountPercentage: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-primary-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-primary-500 shadow-xl shadow-primary-950/20 mt-4 transition-all"
                                >
                                    Overload Grid
                                </button>
                            </form>
                        </section>
                    )}

                    {/* Cipher Shift */}
                    <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm relative group">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shadow-inner">
                                <Lock size={22} />
                            </div>
                            <h2 className="text-lg md:text-xl font-black text-pharmacy-900 uppercase tracking-tighter">Cipher Shift</h2>
                        </div>

                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-pharmacy-400 ml-2 block italic">Existing Cipher</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-pharmacy-900 focus:border-rose-400 outline-none transition-all text-sm"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-pharmacy-400 ml-2 block italic">New Cipher</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-pharmacy-900 focus:border-primary-400 outline-none transition-all text-sm"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-rose-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-rose-600 transition-all active:scale-95 shadow-xl shadow-rose-100 mt-2"
                            >
                                Rotate Cipher
                            </button>
                        </form>
                    </section>

                    {/* Data Management */}
                    {isOwner && (
                        <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm relative group overflow-hidden">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
                                    <Database size={22} />
                                </div>
                                <h2 className="text-lg md:text-xl font-black text-pharmacy-900 uppercase tracking-tighter">Data Grid</h2>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleExportSnapshot}
                                    disabled={submitting}
                                    className="w-full flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 font-black text-indigo-700 uppercase tracking-widest text-[9px] hover:bg-indigo-600 hover:text-white transition-all group/btn shadow-sm"
                                >
                                    <span>Export Snapshot</span>
                                    <Download size={16} className="opacity-40 group-hover/btn:opacity-100 md:animate-bounce" />
                                </button>
                                <button
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 font-black text-slate-400 uppercase tracking-widest text-[9px] cursor-not-allowed italic"
                                    disabled
                                >
                                    <span>Node Flush</span>
                                    <RefreshCw size={16} className="opacity-20" />
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Account Actions */}
                    <section className="space-y-3 pt-6">
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-slate-50 text-slate-900 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-100 transition-all shadow-sm"
                        >
                            <LogOut size={16} /> Sign Out Node
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            className="w-full flex items-center justify-center gap-3 py-4 text-rose-300 rounded-xl font-black uppercase tracking-widest text-[8px] hover:bg-rose-50 hover:text-rose-600 transition-all italic opacity-60 hover:opacity-100"
                        >
                            <Trash size={14} /> Permanent De-authorization
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Settings;
