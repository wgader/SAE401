import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';
import { cn } from '../../lib/utils';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const variantStyles = {
    success: {
        bg: 'bg-emerald-500/90',
        border: 'border-emerald-400/20',
        icon: FiCheckCircle
    },
    error: {
        bg: 'bg-rose-500/90',
        border: 'border-rose-400/20',
        icon: FiAlertCircle
    },
    warning: {
        bg: 'bg-amber-500/90',
        border: 'border-amber-400/20',
        icon: FiAlertTriangle
    },
    info: {
        bg: 'bg-blue-500/90',
        border: 'border-blue-400/20',
        icon: FiInfo
    }
};

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  variant = 'success', 
  isVisible, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const Style = variantStyles[variant];
  const Icon = Style.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)', transition: { duration: 0.2 } }}
          style={{ x: '-50%' }}
          className="fixed bottom-12 left-1/2 z-[100] flex justify-center pointer-events-none"
        >
          <div className={cn(
            "pointer-events-auto flex items-center gap-3 px-6 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl border font-sf-pro text-white min-w-[18rem] max-w-[90vw]",
            Style.bg,
            Style.border
          )}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
            </div>
            <span className="font-semibold text-[0.9375rem] flex-1 leading-tight">{message}</span>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
              className="ml-2 p-1.5 hover:bg-white/20 rounded-xl transition-all duration-200 focus:outline-none"
              aria-label="Fermer"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
