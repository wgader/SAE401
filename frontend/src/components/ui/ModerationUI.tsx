import React from 'react';
import { FiSlash, FiEyeOff } from 'react-icons/fi';
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const moderationVariants = cva(
    "mt-4 p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 text-center animate-in fade-in zoom-in-95 duration-300",
    {
        variants: {
            variant: {
                suspended: "bg-red-500/5 border-red-500/20",
                censored: "bg-orange-500/5 border-orange-500/20",
            }
        },
        defaultVariants: {
            variant: "suspended"
        }
    }
);

interface ModerationUIProps extends VariantProps<typeof moderationVariants> {
    className?: string;
    description?: string;
}

export const ModerationUI: React.FC<ModerationUIProps> = ({ 
    className, 
    variant = "suspended",
    description
}) => {
    const isSuspended = variant === "suspended";
    
    return (
        <section className={cn(moderationVariants({ variant, className }))}>
            <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-1",
                isSuspended ? "bg-red-500/10" : "bg-orange-500/10"
            )}>
                {isSuspended ? (
                    <FiSlash className="w-6 h-6 text-red-500/70" />
                ) : (
                    <FiEyeOff className="w-6 h-6 text-orange-500/70" />
                )}
            </div>
            <hgroup>
                <h4 className={cn(
                    "font-bold text-[1rem] m-0",
                    isSuspended ? "text-red-500/90" : "text-orange-500/90"
                )}>
                    {isSuspended ? "Contenu indisponible" : "Message modéré"}
                </h4>
                <p className="text-text-secondary text-[0.875rem] m-0 mt-1 leading-relaxed max-w-[20rem]">
                    {description || (isSuspended 
                        ? "Cet utilisateur a été suspendu pour non-respect des règles de la Sphère."
                        : "Ce message enfreint les conditions d’utilisation de la plateforme.")}
                </p>
            </hgroup>
        </section>
    );
};
