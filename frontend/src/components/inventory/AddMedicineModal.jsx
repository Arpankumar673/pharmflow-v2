import React, { useState, useEffect } from 'react';
import { X, QrCode } from '../../constants/icons';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AddMedicineModal = ({ isOpen, onClose, onSuccess, editingMed, suppliers }) => {
    const [formData, setFormData] = useState({
        name: '',
        batchNumber: '',
        barcode: '',
        expiryDate: '',
        quantity: 0,
        purchasePrice: 0,
        sellingPrice: 0,
        supplier: '',
        category: 'General',
        lowStockThreshold: 10
    });

    useEffect(() => {
        if (editingMed) {
            setFormData({
                name: editingMed.name,
                batchNumber: editingMed.batchNumber,
                barcode: editingMed.barcode || '',
                expiryDate: editingMed.expiryDate ? editingMed.expiryDate.split('T')[0] : '',
                quantity: editingMed.quantity,
                purchasePrice: editingMed.purchasePrice,
                sellingPrice: editingMed.sellingPrice,
                supplier: editingMed.supplier?._id || editingMed.supplier || '',
                category: editingMed.category,
                lowStockThreshold: editingMed.lowStockThreshold || 10
            });
        } else {
            setFormData({
                name: '',
                batchNumber: '',
                barcode: '',
                expiryDate: '',
                quantity: 0,
                purchasePrice: 0,
                sellingPrice: 0,
                supplier: suppliers[0]?._id || '',
                category: 'General',
                lowStockThreshold: 10
            });
        }
    }, [editingMed, suppliers, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend Validation
        if (!formData.name) {
            return toast.error("Medicine name is required");
        }
        if (formData.quantity < 0) {
            return toast.error("Stock quantity cannot be negative");
        }
        if (formData.purchasePrice <= 0 || formData.sellingPrice <= 0) {
            return toast.error("Price must be greater than 0");
        }

        try {
            // Strip empty barcode — sending '' causes E11000 duplicate key on sparse index
            const payload = { ...formData };
            if (!payload.barcode || payload.barcode.trim() === '') {
                delete payload.barcode;
            }

            if (editingMed) {
                await api.put(`/inventory/${editingMed._id}`, payload);
                toast.success('Medicine updated successfully');
            } else {
                await api.post('/inventory', payload);
                toast.success('Medicine added successfully');
            }
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error saving medicine');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                        {editingMed ? 'Edit Medicine' : 'Add New Medicine'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto scrollbar-hide">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Medicine Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-none rounded-xl p-3.5 font-bold text-slate-900 focus:ring-2 ring-blue-500 transition-all"
                                    placeholder="Enter name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Category</label>
                                <select 
                                    className="w-full bg-slate-50 border-none rounded-xl p-3.5 font-bold text-slate-900 focus:ring-2 ring-blue-500 transition-all"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {['General', 'Tablet', 'Capsule', 'Syrup', 'Injection'].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Barcode Identification</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border-none rounded-xl p-3.5 font-mono text-slate-900 focus:ring-2 ring-blue-500 transition-all"
                                        placeholder="Scan or type barcode"
                                        value={formData.barcode}
                                        onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                                    />
                                    <QrCode className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                </div>
                            </div>
                             <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Batch Number</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-none rounded-xl p-3.5 font-bold text-slate-900 focus:ring-2 ring-blue-500 transition-all uppercase"
                                    placeholder="e.g. B-90"
                                    value={formData.batchNumber}
                                    onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Inventory & Pricing */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Stock Quantity</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border-none rounded-xl p-3.5 font-black text-slate-900 focus:ring-2 ring-blue-500 transition-all"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Expiry Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 border-none rounded-xl p-3.5 font-bold text-slate-900 focus:ring-2 ring-blue-500 transition-all"
                                        value={formData.expiryDate}
                                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Purchase Price</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border-none rounded-xl p-3.5 font-black text-slate-900 focus:ring-2 ring-blue-500 transition-all"
                                        value={formData.purchasePrice}
                                        onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Selling Price</label>
                                    <input
                                        type="number"
                                        className="w-full bg-emerald-50 border-none rounded-xl p-3.5 font-black text-emerald-700 focus:ring-2 ring-emerald-500 transition-all"
                                        value={formData.sellingPrice}
                                        onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Supplier Source</label>
                                <select 
                                    className="w-full bg-slate-50 border-none rounded-xl p-3.5 font-bold text-slate-900 focus:ring-2 ring-blue-500 transition-all"
                                    value={formData.supplier}
                                    onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                                >
                                    <option value="" disabled>Select Supplier</option>
                                    {suppliers.map(sup => (
                                        <option key={sup._id} value={sup._id}>{sup.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Low Stock Alert</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-50 border-none rounded-xl p-3.5 font-bold text-slate-900 focus:ring-2 ring-blue-500 transition-all"
                                    value={formData.lowStockThreshold}
                                    onChange={e => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 shadow-xl shadow-blue-200 active:scale-95 transition-all"
                        >
                            {editingMed ? 'Commit Updates' : 'Add Medicine'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMedicineModal;
