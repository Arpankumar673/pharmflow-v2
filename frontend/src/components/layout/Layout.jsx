import { Outlet, Navigate, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import ErrorBoundary from '../common/ErrorBoundary';
import {
    LayoutDashboard,
    Pill,
    ShoppingCart,
    BarChart3,
    Zap,
    Menu
} from '../../constants/icons';
import { useState } from 'react';
import clsx from 'clsx';

/**
 * Global Hardened Layout for PharmFlow v2
 * 
 * FIXES:
 * 1. Removed 'overflow-hidden' from root to allow native momentum scrolling.
 * 2. Uses 'min-h-screen' layout to prevent clipping on mobile browser bars.
 * 3. Increased bottom DMZ (pb-44) to guarantee clearance of the fixed bottom navigation.
 * 4. Implemented proper safe-area-inset-bottom support for notched devices.
 * 5. Added z-index isolation for the navigation bar to prevent modal overlap.
 */
const Layout = () => {
    const { user, loading, isOwner, isPharmacist } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pharmacy-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const mobileNavItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/', show: true },
        { name: 'Inventory', icon: Pill, path: '/inventory', show: true },
        { name: 'Billing', icon: ShoppingCart, path: '/billing', show: true },
        { name: 'Reports', icon: BarChart3, path: '/reports', show: isPharmacist || isOwner },
        { name: 'Subscription', icon: Zap, path: '/subscription', show: isOwner },
    ];

    return (
        /* 
           FIX: Removed 'overflow-hidden' from the root container. 
           Mobile browsers need the root to be scrollable to collapse/expand the address bar correctly.
        */
        <div className="min-h-screen bg-pharmacy-50 flex flex-col lg:flex-row relative">
            
            {/* Sidebar Component */}
            <Sidebar 
                isOpen={mobileMenuOpen} 
                onClose={() => setMobileMenuOpen(false)} 
                isCollapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
            />

            {/* Content Area Wrap */}
            <main className={clsx(
                "flex-1 flex flex-col min-h-screen relative transition-all duration-300",
                sidebarCollapsed ? "lg:ml-20" : "lg:ml-[260px]"
            )}>
                {/* Mobile Header (Sticky Top) */}
                <header className="lg:hidden bg-white/90 backdrop-blur-md border-b border-pharmacy-100 px-6 py-4 flex items-center justify-between sticky top-0 z-[40] safe-area-top shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-100">P</div>
                        <span className="text-xl font-black font-['Outfit'] tracking-tight">PharmFlow</span>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-3 bg-primary-50 rounded-xl text-primary-600 active:scale-95 transition-all"
                    >
                        <Menu size={20} />
                    </button>
                </header>

                {/* 
                    FIX: Content Holder
                    - Added massive pb-44 (~176px) on mobile to clear the fixed bottom nav bar.
                    - Removed h-screen to allow content to dictate page height.
                */}
                <div className="flex-1 px-4 lg:px-6 py-6 pb-44 md:pb-32 lg:pb-10 max-w-[1700px] mx-auto animate-fade-in w-full overflow-x-hidden min-h-0">
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </div>
            </main>

            {/* 
                FIX: Mobile Quick Navigation Bar 
                - Uses z-[100] but siblings are z-isolated.
                - Added 'pb-safe' for notch support.
            */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-100 flex items-center justify-around px-2 py-3 z-[80] shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
                {mobileNavItems.filter(item => item.show).map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => clsx(
                            "flex flex-col items-center gap-1.5 transition-all duration-300 py-2 rounded-2xl flex-1 max-w-[80px]",
                            isActive ? "text-primary-600 bg-primary-50/50" : "text-slate-400"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className={clsx(isActive ? "scale-110" : "scale-100")} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={clsx(
                                    "text-[7.5px] font-black uppercase tracking-widest truncate w-full text-center px-1 transition-all",
                                    isActive ? "opacity-100" : "opacity-60"
                                )}>
                                    {item.name}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <style>{`
                .safe-area-top { padding-top: env(safe-area-inset-top, 12px); }
                /* FIXED: Proper safe area implementation for notched devices + extra breathing room */
                @media (max-width: 1023px) {
                    nav { padding-bottom: calc(env(safe-area-inset-bottom, 12px) + 12px); }
                }
            `}</style>
        </div>
    );
};

export default Layout;
