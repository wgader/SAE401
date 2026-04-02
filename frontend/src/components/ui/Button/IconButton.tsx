import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";
import { motion, type HTMLMotionProps } from "motion/react";

const iconButtonVariants = cva(
    "inline-flex items-center justify-center rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none active:scale-95",
    {
        variants: {
            variant: {
                primary: "bg-[image:var(--color-linear-gradient)] text-background hover:opacity-90 shadow-lg shadow-primary/20",
                secondary: "bg-surface text-text-primary hover:bg-surface-hover border border-border",
                ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover/20",
                danger: "bg-danger/10 text-danger hover:bg-danger/20",
                soft: "bg-primary/10 text-primary hover:bg-primary/20",
            },
            size: {
                xs: "h-8 w-8 text-sm",
                sm: "h-9 w-9 text-base",
                md: "h-11 w-11 text-lg",
                lg: "h-14 w-14 text-xl",
            },
        },
        defaultVariants: {
            variant: "ghost",
            size: "md",
        },
    }
);

export interface IconButtonProps
    extends HTMLMotionProps<"button">,
    VariantProps<typeof iconButtonVariants> { }

export function IconButton({
    className,
    variant,
    size,
    ...props
}: IconButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className={cn(iconButtonVariants({ variant, size, className }))}
            {...props}
        />
    );
}
