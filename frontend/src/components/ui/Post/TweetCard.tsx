import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaHeart, FaRegHeart, FaRegComment } from "react-icons/fa";
import { FiMoreHorizontal, FiTrash2, FiSlash, FiEdit2 } from "react-icons/fi";
import { BsPinFill, BsPinAngle } from "react-icons/bs";
import { ModerationUI } from "./ModerationUI";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { api, MEDIA_URL as BASE_URL } from "../../../lib/api";
import type { PostMedia } from "../../../lib/api";
import { useStore } from "../../../store/StoreContext";
import { MediaGrid } from "../Media/MediaGrid";
import { RichText } from "./RichText";
import { Button } from "../Button/Button";
import { PostActions } from "../../Post/PostActions";
import type { PostActionsRef } from "../../Post/PostActions";

const DEFAULT_AVATAR = `${BASE_URL}/uploads/avatars/default.png`;

export interface TweetCardProps {
    id: number;
    authorName: string;
    username: string;
    timeAgo: string;
    content: string;
    avatarUrl?: string;
    className?: string;
    initialLikesCount?: number;
    initialIsLiked?: boolean;
    currentUserId?: number;
    currentUsername?: string;
    onDelete?: (id: number) => void;
    isAuthorBlocked?: boolean;
    initialRepliesCount?: number;
    media?: PostMedia[];
    isCensored?: boolean;
    onLike?: (id: number, isLiked: boolean, likesCount: number) => void;
    isReadOnly?: boolean;
    showPinnedIndicator?: boolean;
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
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

export default function TweetCard({
    id,
    authorName,
    username,
    timeAgo = "",
    content,
    avatarUrl,
    className,
    initialLikesCount = 0,
    initialIsLiked = false,
    initialRepliesCount = 0,
    onDelete,
    isAuthorBlocked = false,
    media = [],
    isCensored = false,
    onLike,
    isReadOnly: initialIsReadOnly = false,
    showPinnedIndicator = false,
}: TweetCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const actionsRef = useRef<PostActionsRef>(null);
    const navigate = useNavigate();
    const { currentUser, toggleLike, posts, profilePosts } = useStore();

    // Find current state in store (for cross-component sync)
    const storePost = [...posts, ...profilePosts].find(p => p.id === id);
    const isLiked = storePost ? storePost.isLiked : initialIsLiked;
    const likesCount = storePost ? storePost.likesCount : initialLikesCount;
    const repliesCount = storePost ? storePost.repliesCount : initialRepliesCount;
    const isReadOnly = storePost?.user?.isReadOnly ?? initialIsReadOnly;
    const isPinned = storePost?.isPinned ?? false;

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!api.isAuthenticated()) {
            return;
        }

        if (storePost?.user?.isBlockedByMe || storePost?.user?.hasBlockedMe) {
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: {
                    message: storePost?.user?.isBlockedByMe ? `Vous avez bloqué @${username}` : `Vous avez été bloqué par @${username}`,
                    type: 'error'
                }
            }));
            return;
        }

        const newIsLiked = !isLiked;
        const newCount = newIsLiked ? likesCount + 1 : likesCount - 1;

        // Optimistic update in store
        toggleLike(id, newIsLiked, newCount);
        if (onLike) onLike(id, newIsLiked, newCount);
        if (newIsLiked) setIsAnimating(true);

        try {
            if (newIsLiked) {
                await api.likePost(id);
            } else {
                await api.unlikePost(id);
            }
        } catch (err) {
            // Revert on error
            toggleLike(id, isLiked, likesCount);
            console.error(err);
        }
    };

    const shortUsername = username.length > 12 ? `${username.slice(0, 12)}…` : username;
    const formattedDate = timeAgo.includes("T") ? formatDate(timeAgo) : timeAgo;

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                type: "spring" as const,
                stiffness: 260,
                damping: 20
            }
        }
    };

    return (
        <motion.li
            variants={cardVariants}
            className={cn(
                'block p-3 border-b border-border list-none hover:bg-surface-hover/20 transition-colors cursor-pointer',
                className,
            )}
            onClick={() => navigate(`/post/${id}`)}
            aria-label="Tweet card"
        >
            {isPinned && showPinnedIndicator && (
                <header className="flex items-center gap-3 px-3 mb-1 -mt-1 ml-[2.5rem] sm:ml-[2.5rem]">
                    <BsPinFill className="w-3 h-3 text-primary rotate-45" />
                    <span className="text-xs font-bold text-primary">Post épinglé</span>
                </header>
            )}
            <article className="flex items-start gap-3 w-full relative text-left">
                <Link
                    to={`/profile/${username}`}
                    className="shrink-0 w-[3rem] h-[3rem] sm:w-[2.5rem] sm:h-[2.5rem] rounded-full overflow-hidden m-0 block hover:opacity-80 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={avatarUrl ?? DEFAULT_AVATAR}
                        alt={`${authorName} avatar`}
                        className="w-full h-full object-cover block"
                    />
                </Link>

                <section className="flex-1 min-w-0">
                    <header className="flex items-center justify-between gap-2 min-w-0 pr-1">
                        <hgroup className="flex items-center gap-2 min-w-0 flex-nowrap overflow-hidden">
                            <Link
                                to={`/profile/${username}`}
                                className="text-text-primary truncate text-sm sm:text-base m-0 font-semibold leading-tight hover:underline flex-shrink"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="m-0 text-inherit leading-none font-semibold truncate">
                                    {authorName}
                                </h3>
                            </Link>

                            <Link
                                to={`/profile/${username}`}
                                className="text-text-secondary truncate max-w-[7rem] text-sm m-0 hover:underline flex-shrink"
                                onClick={(e) => e.stopPropagation()}
                            >
                                @{shortUsername}
                            </Link>

                            {formattedDate ? (
                                <time className="text-text-secondary ml-1 whitespace-nowrap text-sm flex-shrink-0" dateTime={timeAgo}>
                                    · {formattedDate}
                                </time>
                            ) : null}
                        </hgroup>

                        <nav className="relative flex-shrink-0">
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
                                className="p-2 rounded-full hover:bg-surface-hover/50 text-text-secondary transition-colors"
                            >
                                <FiMoreHorizontal className="w-5 h-5" />
                            </button>

                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); }} />
                                    <menu className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden m-0 p-1 font-sf-pro">
                                        {currentUser?.username === username ? (
                                            <>
                                                <li>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); actionsRef.current?.openEdit(); }}
                                                        className="w-full justify-start gap-3 h-auto py-2.5 px-3 rounded-lg text-text-primary hover:bg-surface-hover"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                        <p className="m-0 text-inherit font-bold text-sm">Modifier le post</p>
                                                    </Button>
                                                </li>
                                                <li>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e: React.MouseEvent) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setShowMenu(false);
                                                            actionsRef.current?.openPinConfirm(isPinned);
                                                        }}
                                                        className="w-full justify-start gap-3 h-auto py-2.5 px-3 rounded-lg text-text-primary hover:bg-surface-hover"
                                                    >
                                                        <BsPinAngle className={cn("w-4 h-4", isPinned && "fill-current")} />
                                                        <p className="m-0 text-inherit font-bold text-sm">
                                                            {isPinned ? "Désépingler" : "Épingler"}
                                                        </p>
                                                    </Button>
                                                </li>
                                                <li>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e: React.MouseEvent) => { 
                                                            e.preventDefault(); 
                                                            e.stopPropagation(); 
                                                            setShowMenu(false); 
                                                            actionsRef.current?.openDeleteConfirm();
                                                        }}
                                                        className="w-full justify-start gap-3 h-auto py-2.5 px-3 rounded-lg text-danger hover:bg-danger/10"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                        <p className="m-0 text-inherit font-bold text-sm">Supprimer le post</p>
                                                    </Button>
                                                </li>
                                            </>
                                        ) : (
                                            <li>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e: React.MouseEvent) => { 
                                                        e.preventDefault(); 
                                                        e.stopPropagation(); 
                                                        setShowMenu(false); 
                                                        actionsRef.current?.openBlockConfirm(storePost?.user?.isBlockedByMe || false);
                                                    }}
                                                    className="w-full justify-start gap-3 h-auto py-2.5 px-3 rounded-lg text-danger hover:bg-danger/10"
                                                >
                                                    <FiSlash className="w-4 h-4" />
                                                    <p className="m-0 text-inherit font-bold text-sm">
                                                        {storePost?.user?.isBlockedByMe ? `Débloquer @${shortUsername}` : `Bloquer @${shortUsername}`}
                                                    </p>
                                                </Button>
                                            </li>
                                        )}
                                    </menu>
                                </>
                            )}
                        </nav>
                    </header>

                    {storePost?.user?.isBlocked ? (
                        <ModerationUI />
                    ) : isCensored ? (
                        <ModerationUI variant="censored" />
                    ) : (
                        <section className="flex flex-col">
                            <section className="mt-1 text-text-primary text-sm sm:text-base whitespace-pre-wrap break-words leading-normal text-left overflow-hidden relative">
                                {(() => {
                                    const lines = content.split('\n');
                                    const LINE_LIMIT = 6;
                                    const needsTruncation = lines.length > LINE_LIMIT;

                                    if (needsTruncation && !isExpanded) {
                                        return (
                                            <>
                                                <RichText text={lines.slice(0, LINE_LIMIT).join('\n')} />
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsExpanded(true); }}
                                                    className="text-primary hover:underline font-medium block mt-1"
                                                >
                                                    Voir plus
                                                </button>
                                            </>
                                        );
                                    }

                                    return (
                                        <>
                                            <RichText text={content} />
                                            {needsTruncation && isExpanded && (
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsExpanded(false); }}
                                                    className="text-primary hover:underline font-medium block mt-1"
                                                >
                                                    Voir moins
                                                </button>
                                            )}
                                        </>
                                    );
                                })()}
                            </section>

                            {media && media.length > 0 && (
                                <MediaGrid
                                    media={media.map(m => ({
                                        url: `${BASE_URL}/uploads/posts/${m.url}`,
                                        type: m.type
                                    }))}
                                    className="mt-3"
                                />
                            )}

                            <footer className="mt-3 flex items-center gap-12 group">
                                <button
                                    disabled={isCensored}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (isReadOnly) {
                                            window.dispatchEvent(new CustomEvent('show-toast', {
                                                detail: {
                                                    message: `Désolé, ce compte est en lecture seule.`,
                                                    type: 'info'
                                                }
                                            }));
                                            return;
                                        }
                                        if (storePost?.user?.isBlockedByMe || storePost?.user?.hasBlockedMe) {
                                            window.dispatchEvent(new CustomEvent('show-toast', {
                                                detail: {
                                                    message: storePost?.user?.isBlockedByMe ? `Vous avez bloqué @${username}` : `Vous avez été bloqué par @${username}`,
                                                    type: 'error'
                                                }
                                            }));
                                            return;
                                        }
                                        actionsRef.current?.openReply();
                                    }}
                                    className={cn(
                                        "flex items-center gap-1 text-text-secondary transition-colors group/reply focus:outline-none",
                                        (isCensored || isReadOnly) ? "opacity-50 cursor-not-allowed" : "hover:text-primary"
                                    )}
                                    aria-label="Reply"
                                >
                                    <div className="w-[2.125rem] h-[2.125rem] flex items-center justify-center rounded-full group-hover/reply:bg-primary/10 group-hover/reply:text-primary transition-colors">
                                        <FaRegComment className="w-[1.125rem] h-[1.125rem]" />
                                    </div>
                                    {!isCensored && (
                                        <small className="text-sm font-sf-pro min-w-[1rem] text-left">
                                            {repliesCount > 0 ? repliesCount : ""}
                                        </small>
                                    )}
                                </button>

                                <button
                                    disabled={isCensored}
                                    onClick={handleLike}
                                    className={cn(
                                        "flex items-center gap-1 text-text-secondary transition-colors duration-200 focus:outline-none group/like",
                                        isLiked ? "text-primary font-bold" : "",
                                        isCensored ? "opacity-50 cursor-not-allowed" : "hover:text-primary"
                                    )}
                                    aria-label={isLiked ? "Unlike" : "Like"}
                                >
                                    <div className="w-[2.125rem] h-[2.125rem] flex items-center justify-center rounded-full group-hover/like:bg-primary/10 group-hover/like:text-primary transition-colors">
                                        <motion.div
                                            initial={false}
                                            animate={isLiked ? { 
                                                scale: [1, 1.6, 1.2, 1], 
                                                rotate: [0, 20, -20, 0] 
                                            } : { scale: 1 }}
                                            transition={{ 
                                                type: "spring", 
                                                stiffness: 600, 
                                                damping: 10 
                                            }}
                                            onAnimationComplete={() => setIsAnimating(false)}
                                        >
                                            {isLiked ? (
                                                <FaHeart className="w-[1.125rem] h-[1.125rem] fill-current" />
                                            ) : (
                                                <FaRegHeart className="w-[1.125rem] h-[1.125rem]" />
                                            )}
                                        </motion.div>
                                        <AnimatePresence>
                                            {isAnimating && (
                                                <motion.div
                                                    initial={{ scale: 0.5, opacity: 1 }}
                                                    animate={{ scale: 2.5, opacity: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.4 }}
                                                    className="absolute w-[2rem] h-[2rem] rounded-full bg-primary/40 pointer-events-none"
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    {!isCensored && (
                                        <small className="text-sm font-sf-pro min-w-[1rem] text-left">
                                            <AnimatePresence mode="popLayout">
                                                <motion.span
                                                    key={likesCount}
                                                    initial={{ y: 15, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -15, opacity: 0 }}
                                                    className="block"
                                                >
                                                    {likesCount > 0 ? likesCount : ""}
                                                </motion.span>
                                            </AnimatePresence>
                                        </small>
                                    )}
                                </button>
                            </footer>
                        </section>
                    )}
                </section>
            </article>

            <PostActions
                ref={actionsRef}
                post={{ 
                    id, content, media: storePost?.media || media, 
                    user: { 
                        id: 0, username, name: authorName, avatar: avatarUrl || "", 
                        isBlocked: isAuthorBlocked, isReadOnly,
                        isBlockedByMe: storePost?.user?.isBlockedByMe,
                        hasBlockedMe: storePost?.user?.hasBlockedMe
                    }, 
                    likesCount, isLiked, repliesCount, createdAt: timeAgo 
                } as any}
                onDeleteSuccess={onDelete}
            />
        </motion.li>
    );
}
