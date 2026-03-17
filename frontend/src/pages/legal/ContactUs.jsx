import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ContactUs = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            return toast.error('Please fill in all required fields');
        }
        setSending(true);
        // Simulate submission — replace with real API/email call later
        await new Promise(r => setTimeout(r, 1200));
        toast.success('Message sent! We will get back to you within 2 business days.');
        setForm({ name: '', email: '', subject: '', message: '' });
        setSending(false);
    };

    const contacts = [
        {
            icon: '📧',
            label: 'Email Support',
            value: 'support@pharmflow.in',
            href: 'mailto:support@pharmflow.in',
            sub: 'Response within 2 business days'
        },
        {
            icon: '🌐',
            label: 'Website',
            value: 'pharmflow-v2.vercel.app',
            href: 'https://pharmflow-v2.vercel.app',
            sub: 'Visit our platform'
        },
        {
            icon: '🕒',
            label: 'Support Hours',
            value: 'Mon – Sat, 9 AM – 6 PM IST',
            href: null,
            sub: 'Indian Standard Time'
        },
    ];

    const faqs = [
        {
            q: 'How do I cancel my subscription?',
            a: 'Go to Settings → Subscription inside the app and click "Cancel Plan". Your access continues until the billing period ends.'
        },
        {
            q: 'Can I get a refund?',
            a: 'Refunds are assessed case-by-case. Please review our Refund Policy or contact us directly with your Razorpay transaction ID.'
        },
        {
            q: 'How do I reset my password?',
            a: 'Click "Forgot Password" on the login page. A reset link will be sent to your registered email address.'
        },
        {
            q: 'Can I export my pharmacy data?',
            a: 'Yes. Data export options are available from the Reports section within the app.'
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-['Inter']">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-sm">P</span>
                        </div>
                        <span className="font-black text-slate-900 tracking-tight">PharmFlow</span>
                    </Link>
                    <Link to="/login" className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest">
                        Back to App →
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-16">
                {/* Title */}
                <div className="text-center mb-16">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-3">We're Here to Help</p>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">Contact Us</h1>
                    <p className="text-slate-400 max-w-xl mx-auto text-sm font-medium leading-relaxed">
                        Have a question, issue, or feedback? Our support team is ready to help you get the most out of PharmFlow.
                    </p>
                </div>

                {/* Contact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16">
                    {contacts.map((c) => (
                        <div key={c.label} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-center">
                            <div className="text-3xl mb-3">{c.icon}</div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{c.label}</p>
                            {c.href ? (
                                <a href={c.href} className="font-bold text-blue-600 text-sm hover:underline break-all">{c.value}</a>
                            ) : (
                                <p className="font-bold text-slate-800 text-sm">{c.value}</p>
                            )}
                            <p className="text-[11px] text-slate-400 mt-2">{c.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Contact Form */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                        <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-6">Send a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                                    Full Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 font-bold text-slate-900 focus:ring-2 ring-blue-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                                    placeholder="Your name"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                                    Email Address <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 font-bold text-slate-900 focus:ring-2 ring-blue-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Subject</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 font-bold text-slate-900 focus:ring-2 ring-blue-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                                    placeholder="Billing issue, feature request..."
                                    value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                                    Message <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 font-bold text-slate-900 focus:ring-2 ring-blue-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal resize-none h-32"
                                    placeholder="Describe your issue or question..."
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {sending ? 'Sending...' : 'Send Message →'}
                            </button>
                        </form>
                    </div>

                    {/* FAQ Section */}
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqs.map((f, i) => (
                                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                    <p className="font-black text-slate-900 text-sm mb-2">{f.q}</p>
                                    <p className="text-slate-500 text-sm leading-relaxed">{f.a}</p>
                                </div>
                            ))}
                        </div>

                        {/* Legal Links */}
                        <div className="mt-8 bg-slate-900 rounded-2xl p-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Legal Documents</p>
                            <div className="space-y-3">
                                <Link to="/privacy-policy" className="flex items-center justify-between group p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                                    <span className="text-xs font-bold text-white">Privacy Policy</span>
                                    <span className="text-slate-400 group-hover:text-white transition-colors">→</span>
                                </Link>
                                <Link to="/terms" className="flex items-center justify-between group p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                                    <span className="text-xs font-bold text-white">Terms & Conditions</span>
                                    <span className="text-slate-400 group-hover:text-white transition-colors">→</span>
                                </Link>
                                <Link to="/refund-policy" className="flex items-center justify-between group p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                                    <span className="text-xs font-bold text-white">Refund & Cancellation Policy</span>
                                    <span className="text-slate-400 group-hover:text-white transition-colors">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-white py-8 mt-16">
                <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
                    <span>© 2026 PharmFlow. All rights reserved.</span>
                    <div className="flex gap-6">
                        <Link to="/privacy-policy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-slate-600 transition-colors">Terms & Conditions</Link>
                        <Link to="/refund-policy" className="hover:text-slate-600 transition-colors">Refund Policy</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
