import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
    <section className="mb-10">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">
            {title}
        </h2>
        <div className="text-slate-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
);

const TermsAndConditions = () => {
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
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Terms & Conditions</h1>
                    <p className="text-slate-400 text-sm font-medium">
                        Last Updated: <strong>March 17, 2026</strong> &nbsp;·&nbsp; Please read carefully before using PharmFlow.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">

                    <Section title="1. Acceptance of Terms">
                        <p>
                            By accessing or using PharmFlow ("Service"), you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the Service. These Terms apply to all users including pharmacy owners, pharmacists, and staff members.
                        </p>
                    </Section>

                    <Section title="2. Description of Service">
                        <p>PharmFlow is a SaaS platform providing:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Pharmacy inventory management</li>
                            <li>Billing and invoice generation</li>
                            <li>Sales analytics and reporting</li>
                            <li>Supplier management</li>
                            <li>Subscription-based access to premium features</li>
                        </ul>
                        <p>The Service is provided "as is" and we reserve the right to modify, suspend, or discontinue any feature at any time with reasonable notice.</p>
                    </Section>

                    <Section title="3. Account Registration">
                        <p>
                            To use PharmFlow, you must register with a valid email address and provide accurate pharmacy information. You are responsible for maintaining the confidentiality of your account credentials. You agree to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide accurate, current, and complete information during registration.</li>
                            <li>Maintain the security of your password and accept responsibility for all activities under your account.</li>
                            <li>Notify us immediately of any unauthorised use of your account.</li>
                            <li>Use the Service only for lawful pharmacy operations.</li>
                        </ul>
                    </Section>

                    <Section title="4. Subscription & Payment Terms">
                        <p>PharmFlow offers subscription-based plans:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>BASIC Plan:</strong> Monthly subscription with core features.</li>
                            <li><strong>PRO Plan:</strong> Monthly subscription with advanced analytics and AI features.</li>
                            <li><strong>ENTERPRISE Plan:</strong> Custom pricing with full feature access and priority support.</li>
                        </ul>
                        <p>
                            All payments are processed securely via <strong>Razorpay</strong>. By subscribing, you authorise us to charge your selected payment method on a recurring monthly basis. Subscriptions renew automatically unless cancelled.
                        </p>
                        <p>
                            Prices are displayed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change pricing with <strong>30 days' notice</strong>.
                        </p>
                    </Section>

                    <Section title="5. User Responsibilities">
                        <p>You agree not to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Use the Service for any illegal, fraudulent, or unauthorised purpose.</li>
                            <li>Share your account credentials with individuals outside your pharmacy.</li>
                            <li>Attempt to reverse-engineer, decompile, or gain unauthorised access to our systems.</li>
                            <li>Upload malicious code, viruses, or any software intended to damage the platform.</li>
                            <li>Violate any applicable Indian or international laws while using the platform.</li>
                            <li>Use the platform to store or process patient data in violation of applicable medical privacy laws.</li>
                        </ul>
                    </Section>

                    <Section title="6. Data Ownership">
                        <p>
                            All business data you enter into PharmFlow (inventory, billing records, supplier details) remains <strong>your property</strong>. We store and process it solely to provide the Service. We do not claim ownership of your business data. You may export your data at any time from within the application.
                        </p>
                    </Section>

                    <Section title="7. Intellectual Property">
                        <p>
                            The PharmFlow platform, including its logo, UI design, codebase, and all associated content, is the exclusive intellectual property of PharmFlow. You are granted a limited, non-exclusive, non-transferable licence to use the Service for your internal business purposes only. You may not copy, modify, distribute, or resell any part of the Service.
                        </p>
                    </Section>

                    <Section title="8. Service Availability">
                        <p>
                            We strive for 99.5% uptime but do not guarantee uninterrupted access. Planned maintenance windows will be communicated in advance. We are not liable for service interruptions caused by third-party infrastructure failures, natural disasters, or events beyond our reasonable control.
                        </p>
                    </Section>

                    <Section title="9. Limitation of Liability">
                        <p>
                            To the maximum extent permitted by applicable law, PharmFlow and its directors, employees, and partners shall not be liable for:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Indirect, incidental, or consequential damages arising from use of the Service.</li>
                            <li>Loss of data, revenue, or profits due to service interruptions.</li>
                            <li>Errors in billing calculations or reports generated by the platform.</li>
                            <li>Decisions made based on analytics or forecasts provided by the platform.</li>
                        </ul>
                        <p>
                            Our total liability in any event shall not exceed the amount paid by you for the Service in the <strong>3 months immediately preceding</strong> the claim.
                        </p>
                    </Section>

                    <Section title="10. Termination">
                        <p>
                            We may suspend or terminate your account immediately and without notice if you violate these Terms. You may cancel your subscription at any time from the Settings page. Upon termination, your access to the Service will cease and your data will be retained for 30 days before deletion.
                        </p>
                    </Section>

                    <Section title="11. Governing Law & Dispute Resolution">
                        <p>
                            These Terms are governed by the laws of India. Any disputes arising from or related to these Terms shall be subject to the exclusive jurisdiction of the courts in India. We encourage resolution of disputes through direct communication before initiating legal proceedings.
                        </p>
                    </Section>

                    <Section title="12. Changes to Terms">
                        <p>
                            We reserve the right to update these Terms at any time. Material changes will be communicated via email or in-app notification at least <strong>14 days in advance</strong>. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.
                        </p>
                    </Section>

                    <Section title="13. Contact">
                        <div className="bg-slate-50 rounded-2xl p-5 mt-3 space-y-1">
                            <p><strong>PharmFlow Support Team</strong></p>
                            <p>Email: <a href="mailto:support@pharmflow.in" className="text-blue-600">support@pharmflow.in</a></p>
                            <p>Website: <a href="https://pharmflow-v2.vercel.app" className="text-blue-600">pharmflow-v2.vercel.app</a></p>
                        </div>
                    </Section>
                </div>
            </div>

            <div className="border-t border-slate-100 bg-white py-8 mt-8">
                <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
                    <span>© 2026 PharmFlow. All rights reserved.</span>
                    <div className="flex gap-6">
                        <Link to="/privacy-policy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
                        <Link to="/refund-policy" className="hover:text-slate-600 transition-colors">Refund Policy</Link>
                        <Link to="/contact" className="hover:text-slate-600 transition-colors">Contact Us</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
