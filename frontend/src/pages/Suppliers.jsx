import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Users, Edit2, Trash2, Phone, Mail, MapPin } from '../constants/icons';
import { toast } from 'react-toastify';
import Modal from '../components/common/Modal';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSup, setEditingSup] = useState(null);
    const { isOwner } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await api.get('/suppliers');
            setSuppliers(res.data.data);
        } catch (err) {
            toast.error('Failed to fetch suppliers');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSup) {
                await api.put(`/suppliers/${editingSup._id}`, formData);
                toast.success('Supplier updated successfully');
            } else {
                await api.post('/suppliers', formData);
                toast.success('Supplier added successfully');
            }
            setShowModal(false);
            fetchSuppliers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error saving supplier');
        }
    };

    const openEditModal = (sup) => {
        setEditingSup(sup);
        setFormData({
            name: sup.name,
            contactPerson: sup.contactPerson || '',
            email: sup.email || '',
            phone: sup.phone || '',
            address: sup.address || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            try {
                await api.delete(`/suppliers/${id}`);
                toast.warning('Supplier removed');
                fetchSuppliers();
            } catch (err) {
                toast.error('Error deleting supplier');
            }
        }
    };

    const filteredSuppliers = suppliers.filter(sup =>
        sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-pharmacy-900 tracking-tighter uppercase">Supplier Network</h1>
                    <p className="text-pharmacy-500 font-medium italic opacity-60 uppercase tracking-widest text-[10px] mt-2">Active Vendor Management Protocol</p>
                </div>
                {isOwner && (
                    <button
                        onClick={() => { setEditingSup(null); setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '' }); setShowModal(true); }}
                        className="w-full md:w-auto btn bg-pharmacy-900 text-white flex items-center justify-center gap-3 py-5 md:py-4 px-10 rounded-2xl md:rounded-[20px] shadow-2xl shadow-pharmacy-200 font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                    >
                        <Plus size={20} />
                        Register Provider
                    </button>
                )}
            </header>

            <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-pharmacy-50 flex flex-col lg:flex-row gap-4 lg:items-center justify-between relative overflow-hidden group">
                <div className="absolute inset-y-0 left-0 w-1.5 bg-primary-500 rounded-full group-focus-within:h-full h-12 transition-all duration-300 my-auto ml-1 md:ml-2"></div>
                <div className="relative w-full lg:w-[450px] md:ml-4">
                    <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-pharmacy-400">
                        <Search size={20} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search Provider Nodes..."
                        className="w-full bg-pharmacy-50/50 border-none rounded-2xl pl-14 pr-6 py-5 font-black text-pharmacy-900 outline-none focus:ring-4 ring-primary-50 placeholder:text-pharmacy-200 placeholder:font-bold italic transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-72 bg-white rounded-2xl animate-pulse border border-pharmacy-50 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-pharmacy-50 rounded-full -mr-16 -mt-16 opacity-40"></div>
                        </div>
                    ))
                ) : filteredSuppliers.map((sup) => (
                    <div key={sup._id} className="bg-white p-6 md:p-8 rounded-2xl border border-pharmacy-100 shadow-sm hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all group relative overflow-hidden active:scale-[0.98]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity -mr-12 -mt-12"></div>

                        <div className="flex justify-between items-start mb-8">
                            <div className="w-16 h-16 bg-white border-2 border-primary-50 text-primary-600 rounded-3xl flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                                <Users size={32} strokeWidth={2.5} />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openEditModal(sup)} className="p-3 text-primary-600 bg-primary-50 rounded-2xl hover:bg-primary-600 hover:text-white transition-all"><Edit2 size={18} /></button>
                                <button onClick={() => handleDelete(sup._id)} className="p-3 text-red-600 bg-red-50 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-pharmacy-900 uppercase tracking-tighter mb-6 leading-none">{sup.name}</h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-pharmacy-50/50 p-3 rounded-2xl border border-pharmacy-50">
                                <div className="p-2 bg-white rounded-xl shadow-sm"><Users size={16} className="text-primary-500" /></div>
                                <span className="text-[10px] font-black text-pharmacy-900 uppercase tracking-widest">{sup.contactPerson || 'Unknown Contact'}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <Phone size={14} className="text-primary-400" />
                                    <span className="text-[10px] font-bold text-pharmacy-500 tracking-widest">{sup.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail size={14} className="text-primary-400" />
                                    <span className="text-[10px] font-bold text-pharmacy-500 truncate tracking-widest">{sup.email || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-[10px] font-bold text-pharmacy-400 pt-6 border-t border-pharmacy-50 italic leading-relaxed">
                                <MapPin size={14} className="text-primary-400 shrink-0" />
                                <span className="line-clamp-2">{sup.address || 'Address not registered in terminal.'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSuppliers.length === 0 && !loading && (
                <div className="p-32 text-center opacity-30 grayscale flex flex-col items-center">
                    <div className="w-24 h-24 bg-pharmacy-50 rounded-[40px] flex items-center justify-center mb-10">
                        <Users size={60} strokeWidth={1} className="text-pharmacy-400" />
                    </div>
                    <p className="font-black uppercase tracking-[0.3em] text-[10px]">Registry is currently empty</p>
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingSup ? 'Update Supplier Node' : 'Register New Vendor'}
                maxWidth="max-w-xl"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] text-pharmacy-400 hover:bg-pharmacy-50 transition-colors"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            form="supplier-form"
                            className="flex-[2] py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] bg-primary-600 text-white shadow-xl shadow-primary-200 active:scale-95 transition-all"
                        >
                            {editingSup ? 'Commit Updates' : 'Authorize Registry'}
                        </button>
                    </>
                }

            >
                <form id="supplier-form" onSubmit={handleFormSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <div className="bg-pharmacy-50/50 p-4 md:p-6 rounded-2xl border border-pharmacy-50">
                            <label className="text-[10px] font-black uppercase tracking-widest text-pharmacy-400 mb-2 block">Corporate Identity</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-white border-2 border-transparent rounded-2xl p-5 font-black text-pharmacy-900 ring-1 ring-pharmacy-100 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all uppercase placeholder:italic placeholder:font-medium"
                                placeholder="Supplier Name..."
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-pharmacy-400 mb-2 block">Contact Point</label>
                                <input
                                    type="text"
                                    className="w-full bg-pharmacy-50 border-none rounded-2xl p-5 font-bold text-pharmacy-900 ring-1 ring-pharmacy-100 outline-none focus:ring-2 ring-primary-200"
                                    placeholder="Person Name"
                                    value={formData.contactPerson}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-pharmacy-400 mb-2 block">Voice Signal</label>
                                <input
                                    type="text"
                                    className="w-full bg-pharmacy-50 border-none rounded-2xl p-5 font-bold text-pharmacy-900 ring-1 ring-pharmacy-100 outline-none focus:ring-2 ring-primary-200"
                                    placeholder="+91..."
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-pharmacy-400 mb-2 block">Electronic Mail</label>
                            <input
                                type="email"
                                className="w-full bg-pharmacy-50 border-none rounded-2xl p-5 font-bold text-pharmacy-900 ring-1 ring-pharmacy-100 outline-none focus:ring-2 ring-primary-200"
                                placeholder="vendor@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-pharmacy-400 mb-2 block">Physical Location</label>
                            <textarea
                                className="w-full bg-pharmacy-50 border-none rounded-3xl p-6 font-bold text-pharmacy-900 ring-1 ring-pharmacy-100 outline-none focus:ring-2 ring-primary-200 resize-none h-32"
                                placeholder="Full Address..."
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            ></textarea>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};


export default Suppliers;
