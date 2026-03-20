import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import api from '../services/api';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import {
    Search,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    Printer,
    Download,
    CreditCard,
    Banknote,
    Smartphone,
    X,
    CheckCircle2,
    QrCode,
    Loader2,
    Camera,
    ChevronRight,
    Pill,
    Activity,
    AlertCircle
} from '../constants/icons';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import useDebounce from '../hooks/useDebounce';
import { generateReceipt } from '../utils/ReceiptGenerator';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';


// Lazy load BarcodeScanner
const BarcodeScanner = lazy(() => import('../components/BarcodeScanner'));

const Billing = () => {
    const { user } = useAuth();
    const location = useLocation();
    const scannedMedicines = location.state?.medicines || [];

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('Walking Customer');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastSale, setLastSale] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [showCartMobile, setShowCartMobile] = useState(false);
    const [discountPercentage, setDiscountPercentage] = useState(0);

    // Manual Medicine State
    const [showManualModal, setShowManualModal] = useState(false);
    const [manualMed, setManualMed] = useState({ name: '', price: '', quantity: 1 });

    const searchInputRef = useRef(null);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const res = await api.get('/pharmacy');
                if (res.data.success && res.data.data) {
                    setDiscountPercentage(res.data.data.preferences?.discountPercentage || parseInt(res.data.data.preferences?.defaultDiscount) || 0);
                }
            } catch (err) {
                console.error('Failed to fetch preferences', err);
            }
        };
        fetchPreferences();
    }, []);

    useEffect(() => {
        if (scannedMedicines.length > 0) {
            const newItems = scannedMedicines.map(med => ({
                id: med._id,
                name: med.name,
                barcode: med.barcode,
                price: med.sellingPrice,
                quantity: 1,
                maxStock: med.quantity,
                batch: med.batchNumber
            }));
            
            setCart(prevCart => {
                const existingIds = new Set(prevCart.map(item => item.id));
                const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
                return [...prevCart, ...uniqueNewItems];
            });
            toast.success(`Synced ${newItems.length} items from scan`);
        }
    }, [scannedMedicines.length]);

    useEffect(() => {
        // Keyboard shortcuts
        const handleKeyDown = (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'F4') {
                e.preventDefault();
                setIsScannerOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const searchMedicines = async () => {
            if (debouncedSearchTerm.length > 1) {
                try {
                    const res = await api.get(`/inventory/search?q=${debouncedSearchTerm}`);
                    setSearchResults(res.data.data);
                } catch (err) {
                    console.error('Search error', err);
                }
            } else {
                setSearchResults([]);
            }
        };
        searchMedicines();
    }, [debouncedSearchTerm]);

    const handleBarcodeScan = async (scannedBarcode) => {
        if (!scannedBarcode) return;
        try {
            const res = await api.get(`/inventory/barcode/${scannedBarcode}`);
            const med = res.data.data;
            if (med) {
                addToCart(med);
                setIsScannerOpen(false);
            }
        } catch (err) {
            toast.error(`Barcode ${scannedBarcode} not found`);
        }
    };

    const addToCart = (med) => {
        const existing = cart.find(item => item.id === med._id);
        if (existing) {
            if (existing.quantity < med.quantity) {
                updateQuantity(med._id, 1);
            } else {
                toast.warning('Not enough stock');
            }
        } else {
            setCart([...cart, {
                id: med._id,
                name: med.name,
                barcode: med.barcode,
                price: med.sellingPrice,
                quantity: 1,
                maxStock: med.quantity,
                batch: med.batchNumber
            }]);
        }
        setSearchTerm('');
        setSearchResults([]);
    };

    const addManualToCart = () => {
        if (!manualMed.name.trim() || manualMed.price <= 0 || manualMed.quantity < 1) {
            return toast.warning('Invalid manual medicine details');
        }

        const newId = 'manual-' + Date.now();
        setCart([...cart, {
            id: newId,
            name: manualMed.name,
            barcode: 'MANUAL',
            price: Number(manualMed.price),
            quantity: Number(manualMed.quantity),
            maxStock: 9999,
            batch: 'MANUAL',
            manual: true
        }]);

        setShowManualModal(false);
        setManualMed({ name: '', price: '', quantity: 1 });
        setSearchTerm('');
        setSearchResults([]);
    };

    const updateQuantity = (id, change) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + change;
                if (newQty > 0 && newQty <= item.maxStock) {
                    return { ...item, quantity: newQty };
                }
                if (newQty > item.maxStock) {
                    toast.warning('Stock limit reached');
                }
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const originalSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discountAmountTotal = Math.round((originalSubtotal * discountPercentage) / 100);
    const subtotal = originalSubtotal - discountAmountTotal;
    const tax = Math.round(subtotal * 0.12);
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (cart.length === 0) return toast.info('Cart is empty');
        setLoading(true);
        try {
            const res = await api.post('/billing/create', {
                items: cart.map(item => ({
                    id: item.manual ? undefined : item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    manual: item.manual || false
                })),
                customerName,
                customerPhone,
                paymentMethod
            });
            setLastSale(res.data.data);
            setShowSuccess(true);
            setCart([]);
            setCustomerName('Walking Customer');
            setCustomerPhone('');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Billing <span className="text-blue-600">POS</span></h1>
                    <p className="text-sm font-bold text-slate-400 italic">Universal checkout terminal node.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setShowManualModal(true)}
                        className="flex-1 md:flex-none btn bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-sm transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Add Manual
                    </button>
                    <button
                        onClick={() => setIsScannerOpen(true)}
                        className="flex-1 md:flex-none btn bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95"
                    >
                        <Camera size={18} />
                        Scan [F4]
                    </button>
                    <button
                        onClick={() => setShowCartMobile(!showCartMobile)}
                        className="lg:hidden p-4 bg-slate-100 text-slate-900 rounded-2xl relative active:scale-90 transition-transform"
                    >
                        <ShoppingCart size={24} />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
                                {cart.length}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Section: Cart & Search */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search medicine or scan barcode [F2]..."
                            className="w-full bg-white border-none rounded-2xl pl-16 pr-8 py-5 font-bold text-lg text-slate-900 ring-1 ring-slate-100 focus:ring-4 ring-blue-50 focus:border-blue-500 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        {/* Dropdown Results */}
                        {debouncedSearchTerm.length > 1 && (
                            <div className="absolute z-[100] w-full mt-3 bg-white rounded-2xl shadow-2xl border border-slate-50 overflow-hidden max-h-[400px] overflow-y-auto scrollbar-hide">
                                {searchResults.length > 0 ? (
                                    searchResults.map(m => (
                                        <div
                                            key={m._id}
                                            className="p-5 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-all group border-b border-slate-50 last:border-none"
                                            onClick={() => addToCart(m)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                                    <Pill size={22} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 uppercase tracking-tight">{m.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Stock: {m.quantity} • {m.batchNumber}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-slate-900 text-xl tracking-tighter">₹{m.sellingPrice}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center bg-slate-50">
                                        <AlertCircle size={32} className="mx-auto text-slate-400 mb-3" />
                                        <p className="font-black text-slate-900 uppercase tracking-tight mb-4">
                                            Medicine not found in inventory
                                        </p>
                                        <button
                                            onClick={() => {
                                                setManualMed(prev => ({ ...prev, name: searchTerm }));
                                                setShowManualModal(true);
                                                setSearchResults([]);
                                            }}
                                            className="bg-blue-600 text-white py-3 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                                        >
                                            <Plus size={14} /> Add as Manual Medicine
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Cart Table */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 uppercase tracking-tighter text-xl">Terminal Cart</h3>
                            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg uppercase tracking-widest">{cart.length} ITEMS</span>
                        </div>

                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5">Medicine</th>
                                        <th className="px-8 py-5 text-center">Price</th>
                                        <th className="px-8 py-5 text-center">Quantity</th>
                                        <th className="px-8 py-5 text-center">Total</th>
                                        <th className="px-8 py-5 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {cart.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-32 text-center opacity-20 italic">
                                                <ShoppingCart size={48} className="mx-auto mb-4" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Hardware Idle</p>
                                            </td>
                                        </tr>
                                    ) : cart.map(item => (
                                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <p className="font-black text-slate-900 uppercase tracking-tight">
                                                    {item.name}
                                                    {item.manual && <span className="ml-2 text-[8px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">(MANUAL)</span>}
                                                </p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{item.barcode || item.batch}</p>
                                            </td>
                                            <td className="px-8 py-6 text-center font-bold text-slate-600">₹{item.price}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-4 bg-slate-50 w-fit mx-auto p-1.5 rounded-xl border border-slate-100">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-rose-500 hover:bg-white rounded-lg transition-all"><Minus size={14} /></button>
                                                    <span className="font-black text-slate-900 text-lg w-8 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-emerald-600 hover:bg-white rounded-lg transition-all"><Plus size={14} /></button>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center font-black text-slate-900 text-lg tracking-tighter">₹{(item.price * item.quantity).toLocaleString()}</td>
                                            <td className="px-8 py-6 text-right">
                                                <button onClick={() => removeFromCart(item.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Section: Summary */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-6">
                        <div className="p-6 bg-slate-900 text-white">
                            <h3 className="font-black text-xl uppercase tracking-widest text-white/90">Bill Summary</h3>
                            <p className="text-[10px] text-blue-400 font-bold uppercase mt-1 tracking-widest">Transaction Sequence ID: PR-1029</p>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Customer Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Customer Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border-none rounded-xl p-4 font-bold text-slate-900 focus:ring-2 ring-blue-500 transition-all"
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                        placeholder="Optional Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Phone Number</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border-none rounded-xl p-4 font-bold text-slate-900 focus:ring-2 ring-blue-500 transition-all"
                                        value={customerPhone}
                                        onChange={e => setCustomerPhone(e.target.value)}
                                        placeholder="Optional Phone"
                                    />
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Payment Mode</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Cash', 'Card', 'UPI', 'Other'].map(method => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={clsx(
                                                "p-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2",
                                                paymentMethod === method ? "bg-blue-50 border-blue-600 text-blue-700" : "bg-white border-slate-50 text-slate-400"
                                            )}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="pt-6 border-t border-slate-100 space-y-4">
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900">₹{originalSubtotal.toLocaleString()}</span>
                                </div>
                                {discountPercentage > 0 && (
                                    <div className="flex justify-between text-[10px] font-black uppercase text-emerald-500 tracking-widest">
                                        <span>Discount ({discountPercentage}%)</span>
                                        <span>-₹{discountAmountTotal.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    <span>GST (12%)</span>
                                    <span className="text-slate-900">₹{tax.toLocaleString()}</span>
                                </div>
                                <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Amount</p>
                                        <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{total.toLocaleString()}</p>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mb-2"></div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || loading}
                                className="w-full bg-slate-900 hover:bg-black text-white p-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        Generate Invoice [F8]
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <Modal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="Verified"
                maxWidth="max-w-sm"
                footer={
                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={() => { generateReceipt(lastSale, user?.pharmacy); toast.info('Printing Receipt...'); }}
                            className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                        >
                            <Printer size={18} />
                            Print Receipt
                        </button>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="w-full bg-slate-50 text-slate-500 p-5 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                        >
                            Reset Terminal
                        </button>
                    </div>
                }
            >
                <div className="text-center py-4">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-emerald-500" />
                    </div>
                    <p className="text-slate-400 font-bold text-xs italic uppercase tracking-widest">Transaction Synced to Ledger</p>
                </div>
            </Modal>


            {/* Manual Medicine Modal */}
            <Modal
                isOpen={showManualModal}
                onClose={() => setShowManualModal(false)}
                title="Manual Item"
                maxWidth="max-w-md"
                footer={
                    <button
                        onClick={addManualToCart}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                        Add to Bill
                    </button>
                }
            >
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 -mt-4 italic">Bypass Inventory Sync</p>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Item Name</label>
                        <input
                            type="text"
                            value={manualMed.name}
                            onChange={e => setManualMed({ ...manualMed, name: e.target.value })}
                            className="w-full bg-slate-50 rounded-xl px-5 py-4 font-bold text-slate-900 outline-none focus:ring-2 ring-blue-500"
                            placeholder="E.g. VITAMIN C 500MG"
                            autoFocus
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Price (₹)</label>
                            <input
                                type="number"
                                value={manualMed.price}
                                onChange={e => setManualMed({ ...manualMed, price: e.target.value })}
                                className="w-full bg-slate-50 rounded-xl px-5 py-4 font-bold text-slate-900 outline-none focus:ring-2 ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Quantity</label>
                            <input
                                type="number"
                                value={manualMed.quantity}
                                onChange={e => setManualMed({ ...manualMed, quantity: e.target.value })}
                                className="w-full bg-slate-50 rounded-xl px-5 py-4 font-bold text-slate-900 outline-none focus:ring-2 ring-blue-500"
                                placeholder="1"
                            />
                        </div>
                    </div>
                </div>
            </Modal>


            <Suspense fallback={null}>
                {isScannerOpen && (
                    <BarcodeScanner
                        onScan={handleBarcodeScan}
                        onClose={() => setIsScannerOpen(false)}
                    />
                )}
            </Suspense>
        </div>
    );
};

export default Billing;
