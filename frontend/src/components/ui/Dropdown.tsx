import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { cn } from "../../lib/utils";

interface DropdownOption {
  label: string;
  value: string | number;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string | number;
  onChange: (value: any) => void;
  label?: string;
  className?: string;
}

export default function Dropdown({ options, value, onChange, label, className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className={cn("flex flex-col gap-1.5 w-full", className)} ref={dropdownRef as any}>
      {label && <label className="text-[0.875rem] font-bold text-text-secondary px-1 uppercase tracking-wider">{label}</label>}
      <nav className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between px-4 py-3 bg-background border border-border rounded-xl text-text-primary hover:border-primary/50 transition-colors text-left"
        >
          <p className="m-0 truncate font-medium text-[1rem]">{selectedOption?.label || "Sélectionner..."}</p>
          <FiChevronDown className={cn("w-5 h-5 transition-transform text-primary", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <ul 
            role="listbox"
            className="absolute z-50 w-full mt-2 bg-background border border-border rounded-xl shadow-2xl max-h-60 overflow-auto m-0 p-1 list-none animate-in fade-in zoom-in-95 duration-200"
          >
            {options.map((option) => (
              <li key={option.value} role="option" aria-selected={option.value === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    // Dispatch custom event for auto-refresh reactivity
                    window.dispatchEvent(new Event('settings-changed'));
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 text-left rounded-lg transition-colors text-[0.875rem]",
                    option.value === value 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-text-primary hover:bg-surface-hover"
                  )}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </section>
  );
}
