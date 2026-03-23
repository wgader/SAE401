import { cn } from "../../lib/utils";
import { BASE_URL } from "../../lib/api";

const DEFAULT_AVATAR = `${BASE_URL}/uploads/avatars/default.png`;

export interface TweetCardProps {
    authorName: string;
    username: string;
    timeAgo?: string;
    content: string;
    avatarUrl?: string;
    className?: string;
}

const formatDate = (dateString: string) => {
    if (!dateString) return "";
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    // Otherwise return Day Month (e.g., 12 oct.)
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

export default function TweetCard({
    authorName,
    username,
    timeAgo = "",
    content,
    avatarUrl,
    className,
}: TweetCardProps) {
    const shortUsername = username.length > 12 ? `${username.slice(0, 12)}…` : username;
    const formattedDate = timeAgo.includes("T") ? formatDate(timeAgo) : timeAgo;

    return (
        <li
            className={cn(
                'flex items-start gap-3 p-3 border-b border-border',
                className,
            )}
            aria-label="Tweet card"
        >
            <figure className="shrink-0 w-12 h-12 sm:w-10 sm:h-10 rounded-full overflow-hidden">
                <img
                    src={avatarUrl ?? DEFAULT_AVATAR}
                    alt={`${authorName} avatar`}
                    className="w-full h-full object-cover block"
                />
            </figure>

            <figcaption className="flex-1 min-w-0">
                <header className="flex items-center gap-2 min-w-0 flex-nowrap">
                    <strong className="text-text-primary truncate text-sm sm:text-base" style={{ fontWeight: 600 }}>
                        {authorName}
                    </strong>

                    <p className="text-text-secondary truncate max-w-[7rem] text-sm sm:text-sm">@{shortUsername}</p>

                    {formattedDate ? (
                        <time className="text-text-secondary ml-1 whitespace-nowrap text-sm sm:text-sm" dateTime={timeAgo}>
                            · {formattedDate}
                        </time>
                    ) : null}
                </header>

                <p className="mt-1 text-text-primary text-sm sm:text-base whitespace-pre-wrap break-words">{content}</p>
            </figcaption>
        </li>
    );
}
