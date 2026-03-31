import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none font-bold cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-[image:var(--color-linear-gradient)] text-background hover:opacity-90 shadow-[0_4px_14px_0_rgba(166,253,122,0.39)] font-druk tracking-wide",
        outline: "bg-surface border border-border text-text-primary hover:bg-surface-hover font-sf-pro",
        ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface font-sf-pro",
        danger: "bg-red-600 text-white hover:bg-red-700 font-sf-pro",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-3",
        lg: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> { }

export function Button({
  className,
  variant,
  size,
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  );
}
