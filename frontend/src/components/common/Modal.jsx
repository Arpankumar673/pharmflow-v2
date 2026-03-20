import React, { useEffect } from 'react';
import { X } from '../../constants/icons';
import { clsx } from 'clsx';

/**
 * Production-Ready Reusable Modal Component
 * 
 * Features:
 * - Mobile-first: Slides from bottom on mobile, centers on desktop.
 * - Sticky Header & Footer: Actions always visible regardless of field count.
 * - Smart Scroll: Content area is the only part that scrolls.
 * - Viewport Awareness: Uses 'dvh' to handle mobile browser chrome / bottom navbars.
 * - Bottom Guardrail: Uses safe-area-inset and extra padding to clear mobile navigation.
 * - Body Lock: Prevents background jumping when modal is open.
 */
const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    footer, 
    maxWidth = 'max-w-xl',
    showClose = true 
}) => {
    // Body Scroll Lock
    useEffect(() => {
        if (isOpen) {
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden outline-none focus:outline-none">
            {/* Backdrop with fade animation */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card - The Container */}
            <div className={clsx(
                "relative bg-white w-full flex flex-col shadow-2xl transition-all duration-300",
                "rounded-t-[32px] sm:rounded-3xl",
                "max-h-[90dvh] sm:max-h-[90vh]", // Never exceeds screen height
                "animate-in slide-in-from-bottom sm:zoom-in-95 duration-500",
                maxWidth
            )}>
                {/* Mobile Handle - Visual indicator */}
                <div className="sm:hidden flex justify-center py-4 flex-shrink-0 cursor-pointer" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors" />
                </div>

                {/* --- HEADER (Sticky) --- */}
                <div className="px-8 pb-6 pt-2 sm:pt-8 flex items-center justify-between border-b border-slate-50 flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{title}</h3>
                        <div className="h-1 w-12 bg-primary-600 rounded-full mt-1.5" />
                    </div>
                    {showClose && (
                        <button 
                            onClick={onClose}
                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-90"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* --- BODY (Scrollable) --- */}
                <div className="flex-1 overflow-y-auto px-8 pt-8 pb-32 sm:pb-8 overscroll-contain scrollbar-hide">
                    {/* The pb-32 guardrail ensures content isn't hidden by sticky footer or mobile bars */}
                    {children}
                </div>

                {/* --- FOOTER (Sticky Actions) --- */}
                {footer && (
                    <div className="px-8 py-6 sm:py-7 border-t border-slate-50 bg-white/80 backdrop-blur-md flex-shrink-0 safe-area-bottom">
                        {/* Wrapper for the buttons */}
                        <div className="flex gap-4">
                            {footer}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .safe-area-bottom {
                    padding-bottom: calc(env(safe-area-inset-bottom, 20px) + 24px);
                }
            `}</style>
        </div>
    );
};

export default Modal;
