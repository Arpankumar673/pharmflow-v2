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

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) return toast.error('Medicine name is required');
        if (formData.quantity < 0) return toast.error('Stock quantity cannot be negative');
        if (formData.purchasePrice <= 0 || formData.sellingPrice <= 0) {
            return toast.error('Price must be greater than 0');
        }

        try {
            // Strip empty barcode — '' hits E11000 on sparse unique index
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

    const inputCls = 'w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 font-bold text-slate-900 focus:ring-2 ring-blue-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal';
    const labelCls = 'text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block';

    return (
        /*
         * Overlay — on mobile: sheet anchored to bottom
         *            on desktop: centred dialog
         */
        <div className="fixed inset-0 h-[100dvh] z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            {/* Card — 3-zone flex column */}
            <div className="
                bg-white w-full sm:max-w-2xl
                rounded-t-[32px] sm:rounded-2xl
                shadow-[0_-20px_60px_rgba(0,0,0,0.15)] sm:shadow-2xl
                flex flex-col overflow-hidden
                max-h-[85dvh] sm:max-h-[85vh]
                animate-slide-up sm:animate-scale-up

            ">
                {/* ── Mobile drag handle ── */}
                <div className="sm:hidden flex justify-center pt-4 pb-1 flex-shrink-0">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>


                {/* ── Sticky Header ── */}
                <div className="flex-shrink-0 px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-[36px] sm:rounded-t-2xl">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                        {editingMed ? 'Edit Medicine' : 'Add New Medicine'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── Scrollable Form Body ── */}
                <form
                    id="medicine-form"
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto overscroll-contain p-6 scrollbar-hide"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ── Column 1: Basic Info ── */}
                        <div className="space-y-4">
                            <div>
                                <label className={labelCls}>Medicine Name</label>
                                <input
                                    type="text"
                                    className={inputCls}
                                    placeholder="Enter name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Category</label>
                                <select
                                    className={inputCls}
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {['General', 'Tablet', 'Capsule', 'Syrup', 'Injection'].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Barcode <span className="normal-case tracking-normal font-medium text-slate-300">(optional)</span></label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className={`${inputCls} font-mono pr-10`}
                                        placeholder="Scan or type barcode"
                                        value={formData.barcode}
                                        onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                                    />
                                    <QrCode className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Batch Number</label>
                                <input
                                    type="text"
                                    className={`${inputCls} uppercase`}
                                    placeholder="e.g. B-90"
                                    value={formData.batchNumber}
                                    onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* ── Column 2: Inventory & Pricing ── */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Stock Quantity</label>
                                    <input
                                        type="number"
                                        className={inputCls}
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Expiry Date</label>
                                    <input
                                        type="date"
                                        className={inputCls}
                                        value={formData.expiryDate}
                                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Purchase Price</label>
                                    <input
                                        type="number"
                                        className={inputCls}
                                        value={formData.purchasePrice}
                                        onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Selling Price</label>
                                    <input
                                        type="number"
                                        className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 font-black text-emerald-700 focus:ring-2 ring-emerald-500 outline-none transition-all"
                                        value={formData.sellingPrice}
                                        onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Supplier Source</label>
                                <select
                                    className={inputCls}
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
                                <label className={labelCls}>Low Stock Alert</label>
                                <input
                                    type="number"
                                    className={inputCls}
                                    value={formData.lowStockThreshold}
                                    onChange={e => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* ── Sticky Footer — always visible ── */}
                <div className="flex-shrink-0 px-6 pt-4 pb-12 sm:pb-5 border-t border-slate-100 bg-white flex gap-4">
                    <button


                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="medicine-form"
                        className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 shadow-xl shadow-blue-200 active:scale-95 transition-all"
                    >
                        {editingMed ? 'Commit Updates' : 'Add Medicine'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to   { transform: translateY(0); }
                }
                @keyframes scale-up {
                    from { transform: scale(0.95); opacity: 0; }
                    to   { transform: scale(1);    opacity: 1; }
                }
                .animate-slide-up  { animation: slide-up  0.45s cubic-bezier(0.16,1,0.3,1); }
                .animate-scale-up  { animation: scale-up  0.35s cubic-bezier(0.16,1,0.3,1); }
            `}</style>
        </div>
    );
};

export default AddMedicineModal;
