import { useState } from "react";
import { FaHeart, FaRegHeart, FaRegComment } from "react-icons/fa";
import { FiMoreHorizontal, FiTrash2, FiEdit2, FiSlash } from "react-icons/fi";
import { UnifiedBlockUI } from "./UnifiedBlockUI";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL, api } from "../../lib/api";
import type { Post } from "../../lib/api";
import { MediaGrid } from "./MediaGrid";
import { useStore } from "../../store/StoreContext";
import { cn } from "../../lib/utils";
import { Button } from "./Button/Button";
import EditPostModal from "../Post/EditPostModal";
import { ConfirmModal } from "./ConfirmModal";

const DEFAULT_AVATAR = `${BASE_URL}/uploads/avatars/default.png`;

interface ThreadMainPostProps {
  post: Post;
  onReplyClick?: () => void;
  onLike?: () => void;
  onDelete?: (id: number) => void;
  isAuthorBlocked?: boolean;
}

export default function ThreadMainPost({ post, onReplyClick, onLike, onDelete, isAuthorBlocked: propsIsAuthorBlocked = false }: ThreadMainPostProps) {
  const { currentUser, deletePost, toggleBlock, posts, profilePosts, currentPost } = useStore();
  const latestPost = (currentPost?.id === post.id) ? currentPost : ([...posts, ...profilePosts].find(p => p.id === post.id) || post);
  const isAuthorBlocked = latestPost.user.isBlocked || propsIsAuthorBlocked;
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const avatarUrl = post.user.avatar ? `${BASE_URL}/uploads/avatars/${post.user.avatar}` : DEFAULT_AVATAR;

  // Format date: 11:29 PM · Mar 22, 2026
  const date = new Date(post.createdAt);
  const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const formattedDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deletePost(post.id);
      deletePost(post.id);
      if (onDelete) {
        onDelete(post.id);
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression du post");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const isAuthor = currentUser?.username === post.user.username;

  return (
    <article className="px-[1rem] py-[0.75rem] bg-background w-full flex items-start gap-3 relative text-left border-b border-border">
      {/* Left Column: Avatar */}
      <Link
        to={`/profile/${post.user.username}`}
        className="shrink-0 w-[3rem] h-[3rem] sm:w-[2.5rem] sm:h-[2.5rem] rounded-full overflow-hidden m-0 block hover:opacity-80 transition-opacity"
      >
        <img
          src={avatarUrl}
          alt={`Avatar de ${post.user.name}`}
          className="w-full h-full object-cover block"
        />
      </Link>

      <section className="flex-1 min-w-0">
        <header className="flex items-center justify-between mb-1 min-w-0">
          <hgroup className="flex flex-col min-w-0">
            <Link to={`/profile/${post.user.username}`} className="hover:underline">
              <strong className="text-text-primary text-[0.875rem] sm:text-[1rem] font-bold leading-tight block truncate">
                {post.user.name}
              </strong>
            </Link>
            <p className="text-text-secondary text-[0.875rem] leading-tight m-0 truncate">
              @{post.user.username}
            </p>
          </hgroup>

          <nav className="relative shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-[0.5rem] -mr-[0.5rem] text-text-secondary hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
              aria-label="Plus d'actions"
            >
              <FiMoreHorizontal className="w-[1.25rem] h-[1.25rem]" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); }} />
                <menu className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden m-0 p-1 font-sf-pro">
                  {isAuthor ? (
                    <>
                      <li className="list-none">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setShowMenu(false); setShowEdit(true); }}
                          className="w-full justify-start gap-3 h-auto py-2.5 px-3 rounded-lg text-text-primary hover:bg-surface-hover"
                        >
                          <FiEdit2 className="w-4 h-4" />
                          <p className="m-0 text-inherit font-bold text-sm">Modifier le post</p>
                        </Button>
                      </li>
                      <li className="list-none">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setShowMenu(false); setShowConfirm(true); }}
                          className="w-full justify-start gap-3 h-auto py-2.5 px-3 rounded-lg text-red-500 hover:bg-red-500/10"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <p className="m-0 text-inherit font-bold text-sm">Supprimer le post</p>
                        </Button>
                      </li>
                    </>
                  ) : (
                    <li className="list-none">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async (e) => { 
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                                const data = await api.blockUser(post.user.username);
                                toggleBlock(post.user.username, data);
                                setShowMenu(false);
                                window.dispatchEvent(new CustomEvent('show-toast', { 
                                    detail: { 
                                        message: data.isBlockedByMe ? `Vous avez bloqué @${post.user.username}` : `Vous avez débloqué @${post.user.username}`,
                                        variant: data.isBlockedByMe ? 'error' : 'success'
                                    } 
                                }));
                            } catch (err) {
                                console.error(err);
                            }
                          }}
                          className="w-full justify-start gap-3 h-auto py-2.5 px-3 rounded-lg text-red-500 hover:bg-red-500/10"
                        >
                          <FiSlash className="w-4 h-4 text-inherit" />
                          <p className="m-0 text-inherit font-bold text-sm">
                            {latestPost.user.isBlockedByMe ? `Débloquer @${latestPost.user.username.length > 10 ? latestPost.user.username.slice(0, 10) + '…' : latestPost.user.username}` : `Bloquer @${latestPost.user.username.length > 10 ? latestPost.user.username.slice(0, 10) + '…' : latestPost.user.username}`}
                          </p>
                        </Button>
                    </li>
                  )}
                </menu>
              </>
            )}
          </nav>
        </header>

        {post.parentId && (
          <aside className="mb-[0.25rem] font-sf-pro">
            <small className="text-text-secondary text-[1rem] text-inherit">En réponse à </small>
            <Link to={`/profile/${post.user.username}`} className="text-primary hover:underline">
              <strong className="font-sf-pro text-[1rem] ">@{post.user.username}</strong>
            </Link>
          </aside>
        )}

        {isAuthorBlocked ? (
          <UnifiedBlockUI className="mt-2" />
        ) : (
          <>
            <div className="mt-[0.25rem] text-text-primary text-[0.875rem] sm:text-[1rem] whitespace-pre-wrap break-words leading-normal text-left overflow-hidden relative">
              {post.content}
            </div>

            {post.media && post.media.length > 0 && (
              <figure className="mt-[0.75rem]">
                <div className="max-w-[32rem]">
                  <MediaGrid
                    media={post.media.map(m => ({
                      url: `${BASE_URL}/uploads/posts/${m.url}`,
                      type: m.type
                    }))}
                    className="mt-3"
                  />
                </div>
              </figure>
            )}
          </>
        )}

        {/* The "Added Value" - Expanded Metadata for Thread Detail */}
        <footer className="mt-[0.75rem]">
          <section className="text-text-secondary text-[0.8125rem] sm:text-[0.875rem] font-sf-pro flex gap-[0.25rem] items-center px-[0.125rem] mb-[0.75rem]">
            <time dateTime={post.createdAt}>{formattedTime}</time>
            <span aria-hidden="true" className="mx-[0.25rem]">·</span>
            <time dateTime={post.createdAt}>{formattedDate}</time>
          </section>

          {/* Action Navigation (Identical to Card Layout) */}
          {!isAuthorBlocked && (
            <nav className="flex items-center gap-[3rem] py-[0.75rem] border-y border-border group">
              <button
                onClick={() => {
                    if (latestPost.user.isBlockedByMe || latestPost.user.hasBlockedMe) {
                        window.dispatchEvent(new CustomEvent('show-toast', { 
                            detail: { 
                                message: latestPost.user.isBlockedByMe ? `Vous avez bloqué @${latestPost.user.username}` : `Vous avez été bloqué par @${latestPost.user.username}`,
                                variant: 'error'
                            } 
                        }));
                        return;
                    }
                    if (onReplyClick) onReplyClick();
                }}
                className="group/reply flex items-center gap-[0.25rem] text-text-secondary transition-colors focus:outline-none"
                title="Répondre"
              >
                <div className="w-[2.125rem] h-[2.125rem] flex items-center justify-center rounded-full group-hover/reply:bg-primary/10 group-hover/reply:text-primary transition-colors">
                  <FaRegComment className="w-[1.125rem] h-[1.125rem]" />
                </div>
                {post.repliesCount > 0 && (
                  <small className="text-[0.8125rem] font-sf-pro text-left min-w-[1rem]">
                    {post.repliesCount}
                  </small>
                )}
              </button>

              <button
                onClick={() => {
                    if (latestPost.user.isBlockedByMe || latestPost.user.hasBlockedMe) {
                        window.dispatchEvent(new CustomEvent('show-toast', { 
                            detail: { 
                                message: latestPost.user.isBlockedByMe ? `Vous avez bloqué @${latestPost.user.username}` : `Vous avez été bloqué par @${latestPost.user.username}`,
                                variant: 'error'
                            } 
                        }));
                        return;
                    }
                    if (onLike) onLike();
                }}
                className={cn(
                  "group/like flex items-center gap-[0.25rem] transition-colors focus:outline-none",
                  latestPost.isLiked ? 'text-primary' : 'text-text-secondary'
                )}
                title="J'aime"
              >
                <div className="w-[2.125rem] h-[2.125rem] flex items-center justify-center rounded-full group-hover/like:bg-primary/10 group-hover/like:text-primary transition-colors">
                  {latestPost.isLiked ? <FaHeart className="w-[1.125rem] h-[1.125rem]" /> : <FaRegHeart className="w-[1.125rem] h-[1.125rem]" />}
                </div>
                {latestPost.likesCount > 0 && (
                  <small className="text-[0.8125rem] font-sf-pro text-left min-w-[1rem]">
                    {latestPost.likesCount}
                  </small>
                )}
              </button>
            </nav>
          )}
        </footer>

        {/* Modals Section */}
        <aside aria-label="Modals">
          {showEdit && (
            <EditPostModal
              post={post}
              onClose={() => setShowEdit(false)}
            />
          )}

          {showConfirm && (
            <ConfirmModal
              title="Supprimer le post ?"
              message="Cette action est irréversible et supprimera le post de votre profil et du fil d'actualité."
              confirmLabel={isDeleting ? "Suppression..." : "Supprimer"}
              onConfirm={handleDelete}
              onCancel={() => setShowConfirm(false)}
              variant="danger"
            />
          )}
        </aside>
      </section>
    </article>
  );
}
