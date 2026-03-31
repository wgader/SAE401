import { FiSlash } from 'react-icons/fi';
import { motion } from 'motion/react';

interface BlockedProfileViewProps {
    type?: 'suspended' | 'blocked';
}

export default function BlockedProfileView({ type = 'suspended' }: BlockedProfileViewProps) {
    const isSuspended = type === 'suspended';

    return (
        <div className={`flex-1 flex flex-col items-center justify-center p-12 md:p-24 text-center gap-8 ${isSuspended ? 'bg-surface/10' : 'bg-red-500/5'} relative overflow-hidden`}>
            {/* Scanner Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: `linear-gradient(${isSuspended ? 'var(--color-text-primary)' : 'var(--color-danger)'} 1px, transparent 1px), linear-gradient(90deg, ${isSuspended ? 'var(--color-text-primary)' : 'var(--color-danger)'} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

        {/* Visual Icon with Motion */}
        <div className="relative group/icon">
            <FiSlash className="w-32 h-32 text-red-500/5 transition-transform duration-700 group-hover/icon:rotate-90" />
            <motion.div 
                animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
            >
                    <FiSlash className="w-20 h-20 text-red-500/10 blur-md" />
            </motion.div>
        </div>
        
        <hgroup className="relative z-10 flex flex-col gap-3">
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase font-druk">Silence Absolu</h3>
            <p className="text-text-secondary max-w-sm mx-auto text-base font-bold uppercase tracking-tight">
                Cette unité a été déconnectée. Les archives sont inaccessibles.
            </p>
        </hgroup>
    </div>
  );
}
