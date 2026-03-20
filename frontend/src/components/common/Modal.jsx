import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from '../../constants/icons';
import { clsx } from 'clsx';

/**
 * PRODUCTION-GRADE GLOBAL MODAL (PORTAL VERSION)
 * 
 * FIXES:
 * 1. React Portal: Moves modal to 'document.body' to escape layout z-index traps.
 * 2. Hardened Z-Index: Set to z-[9999] ensuring it covers the bottom navigation bar.
 * 3. Mobile Stability: Fixed max-h[85vh] prevents clipping from mobile browser bars.
 * 4. Flex-1 + min-h-0: Ensures internal scrolling works perfectly inside a constrained height.
 * 5. Safe Area: pb-48 in body and pb-20 in footer to clear all mobile navigation elements.
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
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = originalStyle; };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // We use createPortal to ensure the modal is handled natively by the document body
    // This solves the 'behind the bottom navbar' issue globally.
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-end sm:justify-center overflow-hidden outline-none pointer-events-none transition-all">
            
            {/* Backdrop: High visibility dimmed background covering all other UI */}
            <div 
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md pointer-events-auto animate-in fade-in duration-500"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className={clsx(
                "relative bg-white w-full flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.2)] transition-all duration-300 pointer-events-auto overflow-hidden",
                "rounded-t-[40px] sm:rounded-3xl",
                "max-h-[85vh] sm:max-h-[85vh]", // Hard height limit to ensure footer visibility
                "animate-in slide-in-from-bottom sm:zoom-in-95 duration-500",
                maxWidth
            )}>
                {/* Mobile Drag Indicator Handle */}
                <div className="sm:hidden flex justify-center py-5 flex-shrink-0 cursor-pointer" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors" />
                </div>

                {/* --- STICKY HEADER --- */}
                <div className="px-8 pb-6 pt-2 sm:pt-8 flex items-center justify-between border-b border-slate-50 flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{title}</h3>
                        <div className="h-1 w-12 bg-primary-600 rounded-full mt-1.5" />
                    </div>
                    {showClose && (
                        <button 
                            onClick={onClose}
                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all active:scale-90"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* --- HARDENED BODY (Flex-1 + Scrollable) --- */}
                {/* 
                   pb-56 ensures that even the final form field (the one at the bottom) 
                   can be scrolled high enough to clear the fixed footer on small screens.
                */}
                <div className="flex-1 min-h-0 overflow-y-auto px-8 pt-8 pb-56 sm:pb-12 overscroll-contain scrollbar-hide">
                    {children}
                </div>

                {/* --- STICKY FOOTER --- */}
                {footer && (
                    <div className="px-8 pb-12 sm:pb-8 pt-6 border-t border-slate-50 bg-white/95 backdrop-blur-sm flex-shrink-0 sticky bottom-0 z-50">
                        {/* Wrapper for action buttons */}
                        <div className="flex gap-4">
                            {footer}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>,
        document.body
    );
};

export default Modal;
