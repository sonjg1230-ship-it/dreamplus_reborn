import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3, Sparkles } from 'lucide-react';

interface MobileFloatingApplyButtonProps {
  onScrollToForm: () => void;
}

export const MobileFloatingApplyButton: React.FC<MobileFloatingApplyButtonProps> = ({
  onScrollToForm,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show FAB after user has scrolled down a bit (past initial hero top)
      const currentScrollY = window.scrollY;
      
      // Check if user is already looking directly at the form
      const formEl = document.getElementById('application-form');
      if (formEl) {
        const rect = formEl.getBoundingClientRect();
        // If form is prominently in the middle of viewport, temporarily hide to avoid clutter
        const isFormActive = rect.top <= 250 && rect.bottom >= 250;
        if (isFormActive) {
          setIsVisible(false);
          return;
        }
      }

      if (currentScrollY > 180) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="md:hidden">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            className="fixed bottom-20 right-4 z-40 flex flex-col items-end"
          >
            {/* Quick Conversion CTA Pill/Button */}
            <motion.button
              type="button"
              onClick={onScrollToForm}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              aria-label="지원 신청서로 이동"
              className="group relative flex items-center gap-2 bg-gradient-to-r from-blue-700 via-indigo-700 to-[#00288e] text-white px-3.5 py-2.5 rounded-full shadow-[0_8px_20px_rgba(0,40,142,0.38)] border-2 border-white/90 active:brightness-95 cursor-pointer backdrop-blur-xs"
            >
              {/* Pulsing Badge Indicator */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
              </span>

              {/* Icon */}
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Edit3 className="w-3.5 h-3.5 text-white" />
              </div>

              {/* Text Label */}
              <div className="flex flex-col items-start leading-none pr-0.5">
                <span className="text-[9px] font-bold text-amber-300 tracking-tight flex items-center gap-0.5">
                  100% 전액지원 <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                </span>
                <span className="text-xs font-extrabold text-white tracking-tight mt-0.5">
                  간편신청
                </span>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
