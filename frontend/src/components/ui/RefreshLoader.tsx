import React from "react";
import { FiLoader } from "react-icons/fi";
import { cn } from "../../lib/utils";

interface RefreshLoaderProps {
  isRefreshing: boolean;
  pullDistance: number;
}

export default function RefreshLoader({ isRefreshing, pullDistance }: RefreshLoaderProps) {
  return (
    <section
      className={cn(
        "overflow-hidden transition-all duration-300 ease-out flex items-center justify-center bg-surface-hover/30 border-b border-border/50",
        isRefreshing ? "h-16" : ""
      )}
      style={{
        height: isRefreshing ? '64px' : `${pullDistance}px`,
        opacity: pullDistance > 0 || isRefreshing ? 1 : 0
      }}
    >
      <article className={cn(
        "flex flex-col items-center gap-1",
        pullDistance > 60 ? "scale-125" : "scale-100"
      )}>
        <FiLoader
          className={cn(
            "w-7 h-7 text-primary",
            isRefreshing ? "animate-spin" : ""
          )}
          style={{ 
            transform: !isRefreshing ? `rotate(${pullDistance * 6}deg)` : undefined 
          }}
        />
      </article>
    </section>
  );
}
