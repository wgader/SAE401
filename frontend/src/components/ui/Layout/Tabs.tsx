import { cn } from '../../../lib/utils';
import { motion } from 'motion/react';
import { useScrollDirection } from '../../../hooks/useScrollDirection';

interface TabItem {
    id: string;
    label: string;
}

interface TabsProps {
    items: TabItem[];
    activeTab: string;
    onTabChange: (id: string | any) => void;
    className?: string;
    sticky?: boolean;
    top?: string;
}

export default function Tabs({ items, activeTab, onTabChange, className, sticky = true, top }: TabsProps) {
    const { isVisible } = useScrollDirection();
    const stickyTop = top || (isVisible ? '3.5rem' : '0');

    return (
        <nav className={cn(
            "flex border-b border-border bg-background/90 backdrop-blur-md z-30 transition-all duration-300 ease-in-out",
            sticky && "sticky",
            !isVisible && "max-md:-translate-y-full",
            className
        )}
            style={sticky ? { top: stickyTop } : {}}
        >
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                        "flex-1 py-[1rem] text-[0.9375rem] font-bold transition relative group cursor-pointer border-none bg-transparent",
                        activeTab === item.id ? "text-text-primary" : "text-text-secondary hover:bg-surface-hover/50"
                    )}
                >
                    {item.label}
                    {activeTab === item.id && (
                        <motion.mark
                            layoutId="activeTab"
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[3.5rem] h-[0.25rem] rounded-full bg-primary z-10"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                </button>
            ))}
        </nav>
    );
}
