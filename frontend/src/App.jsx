import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { RoleProvider } from './context/RoleContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader2 } from './constants/icons';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layout and Core
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// TODO: [v2] Implement dynamic route loading and layout-based pre-fetching for better performance
// TODO: [v2] Add a global theme/branding provider for easier customization
// Pages - Lazy Loaded for PWA Performance
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Billing = lazy(() => import('./pages/Billing'));
const Subscription = lazy(() => import('./pages/Subscription'));
const SuperAdminAnalytics = lazy(() => import('./pages/SuperAdminAnalytics'));
const MultiStore = lazy(() => import('./pages/MultiStore'));
const PharmacyManagement = lazy(() => import('./pages/PharmacyManagement'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Placeholder components
const Suppliers = lazy(() => import('./pages/Suppliers'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const PrescriptionScanner = lazy(() => import('./pages/PrescriptionScanner'));
const PurchaseOrders = lazy(() => import('./pages/PurchaseOrders'));
const PharmacyNetwork = lazy(() => import('./pages/PharmacyNetwork'));
const PriceIntelligence = lazy(() => import('./pages/PriceIntelligence'));

// Legal Pages
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/legal/TermsAndConditions'));
const RefundPolicy = lazy(() => import('./pages/legal/RefundPolicy'));
const ContactUs = lazy(() => import('./pages/legal/ContactUs'));

const LoadingScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pharmacy-50 scale-90">
        <div className="w-16 h-16 bg-primary-600 rounded-[24px] flex items-center justify-center text-white shadow-2xl animate-bounce mb-8">
            <span className="text-3xl font-black">P</span>
        </div>
        <div className="flex items-center gap-3 text-primary-600">
            <Loader2 className="animate-spin" size={20} />
            <span className="font-black uppercase tracking-[0.3em] text-[10px]">Loading PharmFlow v2...</span>
        </div>
    </div>
);

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <RoleProvider>
                    <Router>
                        <Suspense fallback={<LoadingScreen />}>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password/:token" element={<ResetPassword />} />

                                <Route path="/unauthorized" element={<Unauthorized />} />

                                {/* Legal Pages — public, no auth required */}
                                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                                <Route path="/terms" element={<TermsAndConditions />} />
                                <Route path="/refund-policy" element={<RefundPolicy />} />
                                <Route path="/contact" element={<ContactUs />} />

                                <Route path="/" element={<Layout />}>
                                    <Route index element={<Navigate to="/dashboard" replace />} />
                                    <Route path="dashboard" element={
                                        <ProtectedRoute roles={['PharmacyOwner', 'Pharmacist', 'SuperAdmin']}>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="inventory" element={
                                        <ProtectedRoute roles={['PharmacyOwner', 'Pharmacist']}>
                                            <Inventory />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="billing" element={
                                        <ProtectedRoute roles={['PharmacyOwner', 'Pharmacist', 'Staff']}>
                                            <Billing />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="suppliers" element={
                                        <ProtectedRoute roles={['PharmacyOwner']}>
                                            <Suppliers />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="reports" element={
                                        <ProtectedRoute roles={['PharmacyOwner', 'Pharmacist']}>
                                            <Reports />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="settings" element={
                                        <ProtectedRoute roles={['PharmacyOwner']}>
                                            <Settings />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="subscription" element={
                                        <ProtectedRoute roles={['PharmacyOwner']}>
                                            <Subscription />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="multi-store" element={
                                        <ProtectedRoute roles={['PharmacyOwner']}>
                                            <MultiStore />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="superadmin-analytics" element={
                                        <ProtectedRoute roles={['SuperAdmin']}>
                                            <SuperAdminAnalytics />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="pharmacy-management" element={
                                        <ProtectedRoute roles={['SuperAdmin']}>
                                            <PharmacyManagement />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="prescription-scanner" element={
                                        <ProtectedRoute roles={['PharmacyOwner', 'Pharmacist']}>
                                            <PrescriptionScanner />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="purchase-orders" element={
                                        <ProtectedRoute roles={['PharmacyOwner']}>
                                            <PurchaseOrders />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="pharmacy-network" element={
                                        <ProtectedRoute roles={['PharmacyOwner']}>
                                            <PharmacyNetwork />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="price-intelligence" element={
                                        <ProtectedRoute roles={['PharmacyOwner']}>
                                            <PriceIntelligence />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Route>
                            </Routes>
                        </Suspense>
                    </Router>
                </RoleProvider>
                <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} theme="colored" />
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
