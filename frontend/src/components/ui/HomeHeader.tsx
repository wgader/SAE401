import { useScrollDirection } from "../../hooks/useScrollDirection";
import { cn } from "../../lib/utils";
import { FiRefreshCw } from "react-icons/fi";
import { useState } from "react";
import { motion } from "motion/react";

interface HomeHeaderProps {
  activeFeed: 'for-you' | 'following';
  setActiveFeed: (feed: 'for-you' | 'following') => void;
  onRefresh?: () => void;
}

export default function HomeHeader({ activeFeed, setActiveFeed, onRefresh }: HomeHeaderProps) {
  const { isVisible } = useScrollDirection();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  return (
    <header
      className={cn(
        "sticky z-40 bg-background/95 backdrop-blur-md border-b border-border transition-all duration-300 ease-in-out",
        !isVisible && "max-md:-translate-y-full",
        isVisible ? "top-[3.5rem] md:top-0" : "top-0"
      )}
    >

      <h1 className="sr-only">Fil d'actualité Sphere</h1>
      <nav className="flex w-full" aria-label="Fils d'actualité">
        <button
          onClick={() => setActiveFeed('for-you')}
          className="flex-1 flex flex-col items-center pt-4 group transition-colors hover:bg-surface-hover/50 h-14"
        >
          <span className={cn(
            "pb-3 font-bold text-sm transition-colors relative h-full flex items-center",
            activeFeed === 'for-you' ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"
          )}>
            Pour vous
            {activeFeed === 'for-you' && (
              <motion.div 
                layoutId="activeHomeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" 
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveFeed('following')}
          className="flex-1 flex flex-col items-center pt-4 group transition-colors hover:bg-surface-hover/50 h-14"
        >
          <span className={cn(
            "pb-3 font-bold text-sm transition-colors relative h-full flex items-center",
            activeFeed === 'following' ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"
          )}>
            Abonné
            {activeFeed === 'following' && (
              <motion.div 
                layoutId="activeHomeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" 
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </span>
        </button>

        {/* Desktop Refresh Button */}
        <section className="hidden md:flex items-center px-4">
          <button
            onClick={handleRefreshClick}
            className="p-2 rounded-full hover:bg-surface-hover transition-colors text-text-secondary hover:text-primary"
            title="Rafraîchir"
          >
            <FiRefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
          </button>
        </section>
      </nav>
    </header>
  );
}
