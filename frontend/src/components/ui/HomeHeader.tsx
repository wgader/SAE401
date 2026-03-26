import { useScrollDirection } from "../../hooks/useScrollDirection";
import { cn } from "../../lib/utils";
import { FiRefreshCw } from "react-icons/fi";
import { useState } from "react";

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
        "sticky top-0 md:top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300 ease-in-out",
        !isVisible ? "-translate-y-full" : "translate-y-0",
        "md:translate-y-0 mobile-tabs-sticky"
      )}
      style={{ top: isVisible ? '3.5rem' : '-4rem' }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (min-width: 768px) {
          header.mobile-tabs-sticky { top: 0 !important; transform: none !important; }
        }
      `}} />

      <h1 className="sr-only">Fil d'actualité Sphere</h1>
      <nav className="flex w-full" aria-label="Fils d'actualité">
        <button
          onClick={() => setActiveFeed('for-you')}
          className="flex-1 flex flex-col items-center pt-4 group transition-colors hover:bg-surface-hover/50 h-14"
        >
          <p className={cn(
            "pb-3 font-bold text-[15px] transition-colors relative h-full flex items-center",
            activeFeed === 'for-you'
              ? "text-text-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary after:rounded-full"
              : "text-text-secondary group-hover:text-text-primary"
          )}>
            Pour vous
          </p>
        </button>
        <button
          onClick={() => setActiveFeed('following')}
          className="flex-1 flex flex-col items-center pt-4 group transition-colors hover:bg-surface-hover/50 h-14"
        >
          <p className={cn(
            "pb-3 font-bold text-[15px] transition-colors relative h-full flex items-center",
            activeFeed === 'following'
              ? "text-text-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary after:rounded-full"
              : "text-text-secondary group-hover:text-text-primary"
          )}>
            Abonné
          </p>
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
