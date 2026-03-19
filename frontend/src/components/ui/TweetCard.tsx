import { cn } from "../../lib/utils";

const DEFAULT_AVATAR =
    "https://www.figma.com/api/mcp/asset/8f7c47fb-14e7-4104-ab7e-902258550bdc";

export interface TweetCardProps {
    authorName: string;
    username: string;
    timeAgo?: string;
    content: string;
    avatarUrl?: string;
    className?: string;
}

export default function TweetCard({
    authorName,
    username,
    timeAgo = "",
    content,
    avatarUrl,
    className,
}: TweetCardProps) {
    const shortUsername = username.length > 12 ? `${username.slice(0, 12)}…` : username;

    return (
        <li
            className={cn(
                'flex items-start gap-3 p-3 border-b border-border)]',
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

                    {timeAgo ? (
                        <time className="text-text-secondary ml-1 whitespace-nowrap text-sm sm:text-sm" dateTime={timeAgo}>
                            · {timeAgo}
                        </time>
                    ) : null}
                </header>

                <p className="mt-1 text-text-primary text-sm sm:text-base">{content}</p>
            </figcaption>
        </li>
    );
}
