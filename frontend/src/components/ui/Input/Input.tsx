import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { cn } from "../../../lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, type, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    
    // Generate a fallback ID if none is provided
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    const isPassword = type === "password";
    const currentType = isPassword && showPassword ? "text" : type;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label 
          htmlFor={inputId} 
          className="text-[0.875rem] font-sf-pro text-text-secondary pl-1"
        >
          {label}
        </label>
        <div className="relative flex items-center">
          <input
            id={inputId}
            type={currentType}
            className={cn(
              "flex h-12 w-full rounded-xl border border-border bg-background px-4 py-2 font-sf-pro text-text-primary text-[1rem] ring-offset-background file:border-0 file:bg-transparent file:text-[0.875rem] file:font-medium placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
              isPassword && "pr-12",
              error && "border-red-500 focus-visible:ring-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? (
                <FiEyeOff className="w-5 h-5 pointer-events-none" />
              ) : (
                <FiEye className="w-5 h-5 pointer-events-none" />
              )}
            </button>
          )}
        </div>
        {error && (
          <span className="text-[0.875rem] text-red-500 font-sf-pro pl-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
