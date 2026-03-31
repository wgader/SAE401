import React from 'react';
import { FiSlash } from 'react-icons/fi';
import { cn } from '../../lib/utils';

interface UnifiedBlockUIProps {
    className?: string;
}

export const UnifiedBlockUI: React.FC<UnifiedBlockUIProps> = ({ className }) => {
    return (
        <section className={cn(
            "mt-4 p-6 bg-surface/30 rounded-2xl border border-border/50 flex flex-col items-center justify-center gap-3 text-center animate-in fade-in zoom-in-95 duration-300",
            className
        )}>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-1">
                <FiSlash className="w-6 h-6 text-red-500/70" />
            </div>
            <hgroup>
                <h4 className="text-text-primary font-bold text-base m-0">Contenu indisponible</h4>
                <p className="text-text-secondary text-sm m-0 mt-1 leading-relaxed max-w-[20rem]">
                    Cet utilisateur a été suspendu pour non-respect des règles de la Sphère.
                </p>
            </hgroup>
        </section>
    );
};
