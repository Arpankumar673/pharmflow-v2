import React, { useEffect } from 'react';
import { X } from '../../constants/icons';
import { clsx } from 'clsx';

/**
 * Reusable Modal — mobile-first sheet + desktop dialog
 *
 * Layout (flex-col, fixed max-height):
 * ┌──────────────────────┐
 * │  sticky header       │  ← never scrolls away
 * ├──────────────────────┤
 * │  scrollable body     │  ← overflow-y-auto, fills remaining space
 * ├──────────────────────┤
 * │  sticky footer       │  ← always visible (action buttons live here)
 * └──────────────────────┘
 *
 * Props:
 *  isOpen   – boolean
 *  onClose  – fn
 *  title    – string
 *  footer   – ReactNode  (optional — render Cancel/Submit buttons here)
 *  maxWidth – Tailwind class (default "max-w-md")
 *  children – form fields / body content
 */
const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-md' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        /*
         * On mobile  → sheet anchored to bottom (items-end)
         * On desktop → centred dialog (sm:items-center)
         */
        <div className="fixed inset-0 h-[100dvh] z-[200] flex items-end sm:items-center justify-center overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-primary-950/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal card — flex-col so header/footer stay sticky */}
            <div className={clsx(
                'relative bg-white w-full shadow-[0_-20px_60px_rgba(0,0,0,0.15)] sm:shadow-2xl',
                // Mobile: slides up from bottom, rounded top corners only
                // Desktop: centred, rounded all corners
                'rounded-t-[32px] sm:rounded-[32px]',
                // Critical: max-height prevents overflow off-screen
                // Small/Dynamic viewport height adjusts for mobile browser chrome
                'max-h-[85dvh] sm:max-h-[85vh]',
                // flex-col makes the body the only growing section
                'flex flex-col overflow-hidden',

                // Slide-up on mobile, scale on desktop
                'animate-slide-up-modal sm:animate-scale-up-modal',
                maxWidth
            )}>
                {/* ── Mobile drag handle ── */}
                <div className="sm:hidden flex justify-center pt-4 pb-1 flex-shrink-0">
                    <div className="w-12 h-1.5 bg-pharmacy-100/50 rounded-full" />
                </div>


                {/* ── Sticky Header ── */}
                <div className="flex-shrink-0 px-8 pb-5 pt-2 sm:pt-7 flex items-center justify-between border-b border-pharmacy-50">
                    <div>
                        <h3 className="text-xl font-black text-pharmacy-900 uppercase tracking-tight">{title}</h3>
                        <div className="h-1 w-12 bg-primary-600 rounded-full mt-1.5" />
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-3 bg-pharmacy-50 text-pharmacy-400 rounded-2xl hover:bg-pharmacy-100 transition-colors active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-8 scrollbar-hide">
                    {children}
                </div>

                {/* ── Sticky Footer (action buttons) ── */}
                {footer && (
                    <div className="flex-shrink-0 px-8 pt-5 pb-10 sm:pb-7 border-t border-pharmacy-50 bg-white">
                        {footer}
                    </div>
                )}

            </div>


            <style>{`
                @keyframes slide-up-modal {
                    from { transform: translateY(100%); }
                    to   { transform: translateY(0); }
                }
                @keyframes scale-up-modal {
                    from { transform: scale(0.95); opacity: 0; }
                    to   { transform: scale(1);    opacity: 1; }
                }
                .animate-slide-up-modal {
                    animation: slide-up-modal 0.45s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .animate-scale-up-modal {
                    animation: scale-up-modal 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
};

export default Modal;
