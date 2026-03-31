import React from 'react';
import { Button } from './Button/Button';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmModalProps {
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'primary' | 'danger';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    title,
    message,
    confirmLabel,
    cancelLabel = "Annuler",
    onConfirm,
    onCancel,
    variant = "danger"
}) => {
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => { e.stopPropagation(); onCancel(); }}
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative bg-background border border-border p-6 md:p-8 rounded-3xl shadow-2xl max-w-sm w-full font-sf-pro"
                >
                    <h2 className="text-xl font-black text-text-primary mb-2 uppercase tracking-tight">{title}</h2>
                    <p className="text-text-secondary text-sm leading-relaxed mb-8">{message}</p>
                    
                    <div className="flex flex-col gap-3">
                        <Button 
                            variant={variant} 
                            onClick={(e) => { e.stopPropagation(); onConfirm(); }}
                            className="w-full font-black tracking-widest"
                        >
                            {confirmLabel}
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={(e) => { e.stopPropagation(); onCancel(); }}
                            className="w-full font-bold"
                        >
                            {cancelLabel}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
