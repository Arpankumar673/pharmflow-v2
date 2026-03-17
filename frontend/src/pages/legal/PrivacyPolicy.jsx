import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
    <section className="mb-10">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">
            {title}
        </h2>
        <div className="text-slate-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
);

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-['Inter']">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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

            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Title Block */}
                <div className="mb-14">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-3">Legal Document</p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Privacy Policy</h1>
                    <p className="text-slate-400 text-sm font-medium">
                        Last Updated: <strong>March 17, 2026</strong> &nbsp;·&nbsp; Effective: March 17, 2026
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">

                    <Section title="1. Introduction">
                        <p>
                            PharmFlow ("we", "us", "our") is a cloud-based SaaS platform designed for pharmacy and medical store management, operated from India. This Privacy Policy describes how we collect, use, store, and disclose information about you when you use our services available at <strong>https://pharmflow-v2.vercel.app</strong>.
                        </p>
                        <p>
                            By using PharmFlow, you agree to the collection and use of information in accordance with this policy. This policy complies with the <strong>Information Technology Act, 2000</strong> and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong> of India.
                        </p>
                    </Section>

                    <Section title="2. Information We Collect">
                        <p>We collect the following types of information:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Account Information:</strong> Name, email address, and pharmacy details provided during registration.</li>
                            <li><strong>Billing Information:</strong> Subscription plan details and payment transaction IDs processed through Razorpay. We do not store credit/debit card numbers on our servers.</li>
                            <li><strong>Usage Data:</strong> Pages visited, features used, session duration, and device/browser information (via logs).</li>
                            <li><strong>Business Data:</strong> Inventory records, sales data, supplier information, and billing records you enter into the platform. This data belongs to you.</li>
                            <li><strong>Communications:</strong> Messages sent to us via support channels.</li>
                        </ul>
                    </Section>

                    <Section title="3. How We Use Your Information">
                        <p>We use collected data to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide, maintain, and improve the PharmFlow platform.</li>
                            <li>Process subscription payments via Razorpay.</li>
                            <li>Send important service notifications, receipts, and updates.</li>
                            <li>Respond to support requests.</li>
                            <li>Monitor usage patterns to improve features and performance.</li>
                            <li>Comply with legal obligations.</li>
                        </ul>
                        <p>We do <strong>not</strong> sell, rent, or trade your personal data to any third parties for marketing purposes.</p>
                    </Section>

                    <Section title="4. Third-Party Services">
                        <p>We use the following third-party services that may receive your data:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Razorpay:</strong> Payment processing. Subject to <a href="https://razorpay.com/privacy/" target="_blank" rel="noreferrer" className="text-blue-600 underline">Razorpay's Privacy Policy</a>.</li>
                            <li><strong>Supabase:</strong> Authentication and user identity management.</li>
                            <li><strong>MongoDB Atlas:</strong> Cloud database hosting.</li>
                            <li><strong>Vercel / Render:</strong> Frontend and backend hosting infrastructure.</li>
                        </ul>
                        <p>These providers are contractually bound to protect your data and use it only to provide services to us.</p>
                    </Section>

                    <Section title="5. Data Storage & Security">
                        <p>
                            Your data is stored on secure cloud servers. We implement industry-standard security measures including HTTPS encryption, secure authentication tokens, and access controls. However, no method of transmission over the internet is 100% secure.
                        </p>
                        <p>
                            We retain your data for as long as your account is active. Upon account deletion, your personal data will be deleted within <strong>30 days</strong>, except where retention is required by law.
                        </p>
                    </Section>

                    <Section title="6. Your Rights">
                        <p>You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Access and review the personal information we hold about you.</li>
                            <li>Request correction of inaccurate data.</li>
                            <li>Request deletion of your account and personal data.</li>
                            <li>Withdraw consent for data processing (which may limit service availability).</li>
                            <li>Export your business data in standard formats.</li>
                        </ul>
                        <p>To exercise any of these rights, contact us at <strong>support@pharmflow.in</strong>.</p>
                    </Section>

                    <Section title="7. Cookies">
                        <p>
                            PharmFlow uses essential cookies and local storage to maintain your session and authentication state. We do not use advertising or tracking cookies. You can disable cookies in your browser, but this may affect functionality.
                        </p>
                    </Section>

                    <Section title="8. Children's Privacy">
                        <p>
                            PharmFlow is intended for business use by adults (18+). We do not knowingly collect personal information from individuals under 18 years of age.
                        </p>
                    </Section>

                    <Section title="9. Changes to This Policy">
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice within the application. Continued use of PharmFlow after changes constitutes acceptance of the updated policy.
                        </p>
                    </Section>

                    <Section title="10. Contact">
                        <p>For privacy-related queries, contact:</p>
                        <div className="bg-slate-50 rounded-2xl p-5 mt-3 space-y-1">
                            <p><strong>PharmFlow Support Team</strong></p>
                            <p>Email: <a href="mailto:support@pharmflow.in" className="text-blue-600">support@pharmflow.in</a></p>
                            <p>Website: <a href="https://pharmflow-v2.vercel.app" className="text-blue-600">pharmflow-v2.vercel.app</a></p>
                        </div>
                    </Section>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-white py-8 mt-8">
                <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
                    <span>© 2026 PharmFlow. All rights reserved.</span>
                    <div className="flex gap-6">
                        <Link to="/terms" className="hover:text-slate-600 transition-colors">Terms & Conditions</Link>
                        <Link to="/refund-policy" className="hover:text-slate-600 transition-colors">Refund Policy</Link>
                        <Link to="/contact" className="hover:text-slate-600 transition-colors">Contact Us</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
