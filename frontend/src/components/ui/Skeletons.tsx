import { cn } from "../../lib/utils";

export function TweetSkeleton({ className }: { className?: string }) {
    return (
        <li className={cn("block p-3 border-b border-border list-none", className)} aria-label="Chargement du tweet">
            <article className="flex items-start gap-3 w-full">
                <div className="shrink-0 w-12 h-12 sm:w-10 sm:h-10 rounded-full animate-shimmer m-0"></div>
                <section className="flex-1 min-w-0 flex flex-col gap-2 pt-1">
                    <div className="flex items-center gap-2">
                        <div className="h-4 animate-shimmer rounded w-24"></div>
                        <div className="h-4 animate-shimmer rounded w-16"></div>
                    </div>
                    <div className="h-4 animate-shimmer rounded w-full mt-1"></div>
                    <div className="h-4 animate-shimmer rounded w-5/6"></div>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="w-8 h-8 rounded-full animate-shimmer"></div>
                    </div>
                </section>
            </article>
        </li>
    );
}

export function ProfileSkeleton() {
    return (
        <article className="w-full max-w-2xl border-x border-border min-h-screen bg-background flex flex-col pb-20 font-sf-pro">
            <header className="sticky top-0 z-40 bg-background/80 border-b border-border p-4 hidden md:flex items-center gap-6">
                <div className="w-8 h-8 rounded-full animate-shimmer shrink-0"></div>
                <div className="flex flex-col gap-2">
                    <div className="h-5 animate-shimmer rounded w-32"></div>
                    <div className="h-3 animate-shimmer rounded w-16"></div>
                </div>
            </header>
            
            <div className="md:hidden h-14 w-full"></div>

            <figure className="h-32 md:h-48 w-full animate-shimmer relative overflow-visible mt-2 md:mt-0 m-0">
                <div className="absolute -bottom-12 left-4 md:left-6 rounded-full p-1 bg-background">
                    <div className="w-24 h-24 rounded-full animate-shimmer"></div>
                </div>
            </figure>

            <div className="flex justify-end px-4 md:px-6 mt-3 h-10">
                <div className="w-28 h-8 rounded-full animate-shimmer"></div>
            </div>

            <section className="mt-2 px-4 md:px-6 flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                    <div className="h-6 animate-shimmer rounded w-40"></div>
                    <div className="h-4 animate-shimmer rounded w-24"></div>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                    <div className="h-4 animate-shimmer rounded w-full"></div>
                    <div className="h-4 animate-shimmer rounded w-4/5"></div>
                </div>
                <div className="flex gap-4 mt-2">
                    <div className="h-4 animate-shimmer rounded w-20"></div>
                    <div className="h-4 animate-shimmer rounded w-24"></div>
                </div>
            </section>

            <section className="mt-4 border-t border-border">
                <h3 className="px-4 py-3 font-bold text-transparent animate-shimmer rounded w-20 text-lg border-b border-border m-0 mb-3 mx-4">Posts</h3>
                <ul className="flex flex-col list-none m-0 p-0">
                    <TweetSkeleton />
                    <TweetSkeleton />
                    <TweetSkeleton />
                </ul>
            </section>
        </article>
    );
}
