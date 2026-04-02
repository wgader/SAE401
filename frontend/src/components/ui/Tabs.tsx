import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

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

export default function Tabs({ items, activeTab, onTabChange, className, sticky = true, top = "0" }: TabsProps) {
    return (
        <nav className={cn(
            "flex border-b border-border bg-background/50 backdrop-blur-md z-30 transition-all duration-200",
            sticky && "sticky",
            className
        )}
        style={sticky ? { top } : {}}
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
                        <motion.div 
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
