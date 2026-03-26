import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FiSlash } from 'react-icons/fi';
import { api } from '../../lib/api';
import { Button } from './Button/Button';

interface BlockedModalProps {
    message: string;
    onClose: () => void;
}

export const BlockedModal: React.FC<BlockedModalProps> = ({ message, onClose }) => {
    const handleExit = () => {
        api.logout();
        onClose();
        window.location.href = '/login';
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/90 backdrop-blur-md"
                />

                <motion.article 
                    initial={{ scale: 0.9, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 40 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="relative w-full max-w-sm bg-surface border border-border rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center text-center gap-8 overflow-hidden"
                >
                    {/* Glass Light Reflection */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                    {/* Animated Icon Container */}
                    <motion.div
                        initial={{ rotate: -20, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="relative"
                    >
                        <div className="w-24 h-24 bg-red-500 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-red-500/40 relative z-10">
                            <FiSlash className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute inset-0 bg-red-500/30 rounded-3xl -rotate-6 scale-110 blur-sm" />
                    </motion.div>

                    <hgroup className="flex flex-col gap-2 relative z-10">
                        <h2 className="text-4xl font-druk font-black text-text-primary uppercase tracking-tight">
                            SIGNAL COUPE
                        </h2>
                        <p className="text-text-secondary text-base font-medium leading-relaxed">
                            {message || "Ce compte est suspendu par la modération."}
                        </p>
                    </hgroup>

                    <footer className="w-full relative z-10">
                        <Button 
                            variant="primary" 
                            size="lg" 
                            fullWidth 
                            onClick={handleExit}
                            className="text-lg tracking-widest"
                        >
                            DECONNEXION
                        </Button>
                    </footer>
                </motion.article>
            </div>
        </AnimatePresence>
    );
};
