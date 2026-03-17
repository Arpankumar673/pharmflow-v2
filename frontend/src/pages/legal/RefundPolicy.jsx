import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
    <section className="mb-10">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">
            {title}
        </h2>
        <div className="text-slate-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
);

const Badge = ({ children, color = 'blue' }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        red: 'bg-red-50 text-red-700 border-red-100',
        orange: 'bg-orange-50 text-orange-700 border-orange-100',
    };
    return (
        <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${colors[color]}`}>
            {children}
        </span>
    );
};

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-['Inter']">
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
                <div className="mb-14">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-3">Legal Document</p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Refund & Cancellation Policy</h1>
                    <p className="text-slate-400 text-sm font-medium">
                        Last Updated: <strong>March 17, 2026</strong>
                    </p>
                </div>

                {/* Quick Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center">
                        <div className="text-2xl mb-2">✅</div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">Free Trial</p>
                        <p className="text-[11px] text-slate-400 font-medium">Cancel anytime during trial — no charge</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center">
                        <div className="text-2xl mb-2">⚠️</div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">Paid Plans</p>
                        <p className="text-[11px] text-slate-400 font-medium">No automatic refunds after billing cycle starts</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center">
                        <div className="text-2xl mb-2">🛡️</div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">Exceptions</p>
                        <p className="text-[11px] text-slate-400 font-medium">Refunds considered for service failures</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">

                    <Section title="1. Overview">
                        <p>
                            PharmFlow offers subscription-based services billed on a monthly cycle. Please read this policy carefully before subscribing. By making a payment, you acknowledge and agree to the terms described below. All payments are processed via <strong>Razorpay</strong> in Indian Rupees (INR).
                        </p>
                    </Section>

                    <Section title="2. Subscription Plans">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="text-left p-3 font-black uppercase tracking-widest text-slate-500 border border-slate-100">Plan</th>
                                        <th className="text-left p-3 font-black uppercase tracking-widest text-slate-500 border border-slate-100">Billing</th>
                                        <th className="text-left p-3 font-black uppercase tracking-widest text-slate-500 border border-slate-100">Refundable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="p-3 font-bold border border-slate-100">BASIC</td>
                                        <td className="p-3 border border-slate-100">Monthly</td>
                                        <td className="p-3 border border-slate-100"><Badge color="orange">Conditional</Badge></td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold border border-slate-100">PRO</td>
                                        <td className="p-3 border border-slate-100">Monthly</td>
                                        <td className="p-3 border border-slate-100"><Badge color="orange">Conditional</Badge></td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold border border-slate-100">ENTERPRISE</td>
                                        <td className="p-3 border border-slate-100">Monthly / Custom</td>
                                        <td className="p-3 border border-slate-100"><Badge color="blue">Per Agreement</Badge></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    <Section title="3. No Refund Policy (Standard)">
                        <p>
                            As a general rule, <strong>all subscription fees are non-refundable</strong> once a billing cycle has commenced. When you subscribe to a PharmFlow plan, you gain immediate access to all features of that plan, and the monthly subscription fee is charged accordingly.
                        </p>
                        <p>
                            We do not provide prorated refunds for partial months if you cancel your subscription before the end of a billing period. Your access will continue until the end of the paid billing cycle.
                        </p>
                    </Section>

                    <Section title="4. When Refunds Are Applicable">
                        <p>Refunds may be considered on a case-by-case basis in the following circumstances:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Duplicate Payment:</strong> If you were charged more than once for the same subscription period due to a technical error.
                            </li>
                            <li>
                                <strong>Service Unavailability:</strong> If PharmFlow was completely inaccessible for more than <strong>72 consecutive hours</strong> within a billing period due to issues on our end (not third-party infrastructure).
                            </li>
                            <li>
                                <strong>Unauthorised Transaction:</strong> If a payment was made without your authorisation and you notify us within <strong>7 days</strong> of the transaction.
                            </li>
                            <li>
                                <strong>Failed Upgrade:</strong> If you were charged for a plan upgrade that was not activated due to a technical failure on our systems.
                            </li>
                        </ul>
                        <p>
                            Approved refunds will be processed within <strong>7–10 business days</strong> to the original payment method via Razorpay.
                        </p>
                    </Section>

                    <Section title="5. Cancellation Policy">
                        <p>
                            You may cancel your PharmFlow subscription at any time from the <strong>Settings → Subscription</strong> section within the app. Cancellation will take effect at the end of your current billing period.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>After cancellation, you retain access to paid features until your billing period ends.</li>
                            <li>Your data will be retained for <strong>30 days</strong> post-cancellation, after which it will be permanently deleted.</li>
                            <li>You may re-subscribe at any time to restore access.</li>
                        </ul>
                    </Section>

                    <Section title="6. Free Trial">
                        <p>
                            If PharmFlow offers a free trial period, no payment will be charged during the trial. You may cancel at any time before the trial ends without any charge. If you do not cancel before the trial period expires, you will be automatically subscribed to the selected plan and charged accordingly.
                        </p>
                    </Section>

                    <Section title="7. How to Request a Refund">
                        <p>To request a refund, email us at <strong>support@pharmflow.in</strong> with:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Your registered email address</li>
                            <li>Razorpay payment ID / transaction reference</li>
                            <li>Reason for refund request</li>
                            <li>Date of transaction</li>
                        </ul>
                        <p>
                            We will review your request and respond within <strong>3–5 business days</strong>. Approved refunds will be initiated within 7 business days.
                        </p>
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mt-4">
                            <p className="font-bold text-blue-700">📧 Refund Requests: <a href="mailto:support@pharmflow.in" className="underline">support@pharmflow.in</a></p>
                        </div>
                    </Section>

                    <Section title="8. Chargebacks">
                        <p>
                            Initiating a chargeback or payment dispute without first contacting us to resolve the matter is considered a violation of these Terms. We reserve the right to suspend or terminate accounts associated with fraudulent chargeback attempts.
                        </p>
                    </Section>

                    <Section title="9. Changes to This Policy">
                        <p>
                            We may update this Refund Policy at any time. Significant changes will be communicated via email or in-app notice. Your continued use of the Service after changes indicates acceptance of the updated policy.
                        </p>
                    </Section>
                </div>
            </div>

            <div className="border-t border-slate-100 bg-white py-8 mt-8">
                <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
                    <span>© 2026 PharmFlow. All rights reserved.</span>
                    <div className="flex gap-6">
                        <Link to="/privacy-policy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-slate-600 transition-colors">Terms & Conditions</Link>
                        <Link to="/contact" className="hover:text-slate-600 transition-colors">Contact Us</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicy;
