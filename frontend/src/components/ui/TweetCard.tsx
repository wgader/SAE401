import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FiMoreHorizontal, FiTrash2, FiSlash } from "react-icons/fi";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { api, BASE_URL } from "../../lib/api";
import { useStore } from "../../store/StoreContext";

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
    onDelete,
    isAuthorBlocked = false,
}: TweetCardProps) {
    const { currentUser, toggleLike, deletePost, posts, profilePosts } = useStore();
    const [isAnimating, setIsAnimating] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Find current state in store (for cross-component sync)
    const storePost = [...posts, ...profilePosts].find(p => p.id === id);
    const isLiked = storePost ? storePost.isLiked : initialIsLiked;
    const likesCount = storePost ? storePost.likesCount : initialLikesCount;

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!api.isAuthenticated()) {
            return;
        }

        const newIsLiked = !isLiked;
        const newCount = newIsLiked ? likesCount + 1 : likesCount - 1;
        
        // Optimistic update in store
        toggleLike(id, newIsLiked, newCount);
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

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDeleting(true);
        try {
            await api.deletePost(id);
            deletePost(id);
            if (onDelete) onDelete(id);
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la suppression du post");
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    const shortUsername = username.length > 12 ? `${username.slice(0, 12)}…` : username;
    const formattedDate = timeAgo.includes("T") ? formatDate(timeAgo) : timeAgo;

    return (
        <li
            className={cn(
                'block p-3 border-b border-border list-none hover:bg-surface-hover/20 transition-colors',
                className,
            )}
            aria-label="Tweet card"
        >
            <article className="flex items-start gap-3 w-full relative text-left">
                <Link to={`/profile/${username}`} className="shrink-0 w-12 h-12 sm:w-10 sm:h-10 rounded-full overflow-hidden m-0 block hover:opacity-80 transition-opacity">
                    <img
                        src={avatarUrl ?? DEFAULT_AVATAR}
                        alt={`${authorName} avatar`}
                        className="w-full h-full object-cover block"
                    />
                </Link>

                <section className="flex-1 min-w-0">
                    <header className="flex items-center gap-2 min-w-0 flex-nowrap pr-8">
                        <Link to={`/profile/${username}`} className="text-text-primary truncate text-sm sm:text-base m-0 font-semibold leading-tight hover:underline">
                            <h3 className="m-0 text-inherit leading-none font-semibold">
                                {authorName}
                            </h3>
                        </Link>

                        <Link to={`/profile/${username}`} className="text-text-secondary truncate max-w-[7rem] text-sm m-0 hover:underline">
                            @{shortUsername}
                        </Link>

                        {formattedDate ? (
                            <time className="text-text-secondary ml-1 whitespace-nowrap text-sm" dateTime={timeAgo}>
                                · {formattedDate}
                            </time>
                        ) : null}
                    </header>

                    <div className="absolute right-0 top-0">
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
                            className="p-2 rounded-full hover:bg-surface-hover/50 text-text-secondary hover:text-primary transition-colors"
                            aria-label="Plus d'options"
                        >
                            <FiMoreHorizontal className="w-5 h-5" />
                        </button>

                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                <menu className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden m-0 p-1 font-sf-pro">
                                    {(currentUser?.username === username) ? (
                                        <li>
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); setShowConfirm(true); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-bold rounded-lg"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                                Supprimer le post
                                            </button>
                                        </li>
                                    ) : (
                                        <li className="px-3 py-2.5 text-text-secondary text-sm">
                                            Aucune option disponible
                                        </li>
                                    )}
                                </menu>
                            </>
                        )}
                    </div>

                    {isAuthorBlocked ? (
                        <div className="mt-2 p-4 bg-surface/50 rounded-xl border border-border flex items-center gap-3 text-left">
                            <FiSlash className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-text-secondary text-[13px] font-medium leading-tight">
                                Contenu indisponible. Cet utilisateur a été suspendu pour non-respect des règles.
                            </p>
                        </div>
                    ) : (
                        <p className="mt-1 text-text-primary text-sm sm:text-base whitespace-pre-wrap break-words leading-normal text-left">
                            {content}
                        </p>
                    )}

                    {!isAuthorBlocked && (
                        <footer className="mt-3 flex items-center gap-1 group">
                            <button
                                onClick={handleLike}
                                className={cn(
                                    "flex items-center text-text-secondary transition-colors duration-200 focus:outline-none",
                                    isLiked ? "text-primary" : "hover:text-primary"
                                )}
                                aria-label={isLiked ? "Unlike" : "Like"}
                            >
                                <div className="relative flex items-center justify-center p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                                    <motion.div
                                        initial={false}
                                        animate={isLiked ? { scale: [0.7, 1.2, 1] } : { scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        onAnimationComplete={() => setIsAnimating(false)}
                                    >
                                        {isLiked ? (
                                            <FaHeart className="w-4 h-4 fill-current" />
                                        ) : (
                                            <FaRegHeart className="w-4 h-4" />
                                        )}
                                    </motion.div>

                                    <AnimatePresence>
                                        {isAnimating && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0.5 }}
                                                animate={{ scale: 2, opacity: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute w-4 h-4 rounded-full bg-primary/30"
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="relative h-4 w-6 overflow-hidden flex items-center">
                                    <AnimatePresence mode="popLayout">
                                        <motion.span
                                            key={likesCount}
                                            initial={{ y: 15, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -15, opacity: 0 }}
                                            className={cn(
                                                "text-xs absolute left-0 w-full text-left",
                                                isLiked && "text-primary transition-colors"
                                            )}
                                        >
                                            {likesCount > 0 ? likesCount : ""}
                                        </motion.span>
                                    </AnimatePresence>
                                </div>
                            </button>
                        </footer>
                    )}
                </section>
            </article>

            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px]" onClick={(e) => e.stopPropagation()}>
                    <dialog
                        open
                        className="relative bg-background border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl m-0 flex flex-col gap-4 font-sf-pro"
                    >
                        <hgroup>
                            <h4 className="text-xl font-bold text-text-primary m-0">Supprimer le post ?</h4>
                            <p className="text-text-secondary text-[15px] mt-2 leading-tight">
                                Cette action est irréversible et supprimera le post de votre profil et du fil d'actualité.
                            </p>
                        </hgroup>

                        <div className="flex flex-col gap-3 mt-2">
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-full transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? "Suppression..." : "Supprimer"}
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={isDeleting}
                                className="w-full bg-transparent border border-border text-text-primary font-bold py-3 rounded-full hover:bg-surface-hover transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    </dialog>
                </div>
            )}
        </li>
    );
}
