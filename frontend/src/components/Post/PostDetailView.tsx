import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, BASE_URL, type Post } from "../../lib/api";
import TweetCard from "../ui/TweetCard";
import ThreadMainPost from "../ui/ThreadMainPost";
import PostComposer from "./PostComposer";
import { FiArrowLeft } from "react-icons/fi";
import { useStore } from "../../store/StoreContext";
import { Button } from "../ui/Button/Button";
import { useRef } from "react";

const DEFAULT_AVATAR = `${BASE_URL}/uploads/avatars/default.png`;

export default function PostDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentPost, setCurrentPost, toggleLike, addReply, currentUser } = useStore();
  const [replies, setReplies] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  const composerRef = useRef<HTMLDivElement>(null);

  // Close composer if user blocks the author while writing
  useEffect(() => {
    if (currentPost?.user.isBlockedByMe) {
      setIsReplying(false);
    }
  }, [currentPost?.user.isBlockedByMe]);

  // Handle click outside to close composer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (composerRef.current && !composerRef.current.contains(event.target as Node)) {
        setIsReplying(false);
      }
    };

    if (isReplying) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isReplying]);
  const handleLike = async () => {
    if (!currentPost) return;
    try {
      const data = currentPost.isLiked 
        ? await api.unlikePost(currentPost.id) 
        : await api.likePost(currentPost.id);
      toggleLike(currentPost.id, data.isLiked, data.likesCount);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMainPostDelete = () => {
    if (!currentPost) return;
    window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: "Post supprimé !", variant: 'success' } 
    }));
    setTimeout(() => {
      navigate('/home');
    }, 1500);
  };

  const handleDeleteReply = (replyId: number) => {
    setReplies(prev => prev.filter(r => r.id !== replyId));
    window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: "Réponse supprimée !", variant: 'success' } 
    }));
  };

  const handleLikeReply = (replyId: number, isLiked: boolean, likesCount: number) => {
    setReplies(prev => prev.map(r => 
      r.id === replyId ? { ...r, isLiked, likesCount } : r
    ));
    toggleLike(replyId, isLiked, likesCount);
  };

  useEffect(() => {
    const fetchPostAndReplies = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const postData = await api.getPost(parseInt(id));
        setCurrentPost(postData);
        const repliesData = await api.getPostReplies(parseInt(id));
        setReplies(repliesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err) {
        console.error(err);
        navigate('/home');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostAndReplies();
  }, [id, navigate, setCurrentPost]);

  if (isLoading && !currentPost) {
    return <div className="p-8 text-center text-text-secondary">Chargement...</div>;
  }

  if (!currentPost) return null;

  return (
    <article className="bg-background pb-20 sm:pb-0 text-left w-full max-w-2xl mx-auto border-x border-border flex flex-col">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-hover rounded-full transition-colors">
          <FiArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <h1 className="text-xl font-bold font-sf-pro m-0">Post</h1>
      </header>

      <main className="flex-1">
        <ThreadMainPost 
          post={currentPost} 
          onReplyClick={() => setIsReplying(true)}
          onLike={handleLike}
          onDelete={handleMainPostDelete}
          isAuthorBlocked={currentPost.user.isBlocked}
        />

        {/* Comment Input Section */}
        {currentUser && !currentPost.user.isBlocked && (
          <section className="px-4 py-3 border-b border-border">
            {!isReplying ? (
              <hgroup className="flex items-center gap-3">
                <figure className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-surface">
                  <img 
                    src={currentUser.avatar ? `${BASE_URL}/uploads/avatars/${currentUser.avatar}` : DEFAULT_AVATAR} 
                    className="w-full h-full object-cover" 
                    alt={`Avatar de ${currentUser?.name || 'utilisateur'}`} 
                  />
                </figure>
                <button
                onClick={() => {
                    if (currentPost.user.isBlockedByMe || currentPost.user.hasBlockedMe) {
                        window.dispatchEvent(new CustomEvent('show-toast', { 
                            detail: { 
                                message: currentPost.user.isBlockedByMe ? `Vous avez bloqué @${currentPost.user.username}` : `Vous avez été bloqué par @${currentPost.user.username}`,
                                variant: 'error'
                            } 
                        }));
                        return;
                    }
                    setIsReplying(true);
                  }}
                  className="flex-1 text-left py-[0.5rem] text-text-secondary text-[0.9375rem] font-sf-pro hover:bg-surface-hover/50 transition rounded-lg px-[0.5rem]"
                >
                  Postez votre réponse
                </button>
                <Button 
                  onClick={() => {
                    if (currentPost.user.isBlockedByMe || currentPost.user.hasBlockedMe) {
                        window.dispatchEvent(new CustomEvent('show-toast', { 
                            detail: { 
                                message: currentPost.user.isBlockedByMe ? `Vous avez bloqué @${currentPost.user.username}` : `Vous avez été bloqué par @${currentPost.user.username}`,
                                variant: 'error'
                            } 
                        }));
                        return;
                    }
                    setIsReplying(true);
                  }}
                  className="hidden md:flex"
                >
                  REPONDRE
                </Button>
              </hgroup>
            ) : (
              <aside 
                ref={composerRef}
                className="animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <PostComposer
                  placeholder="Postez votre réponse"
                  submitLabel="REPONDRE"
                  isInline={true}
                  onSubmit={async (formData) => {
                    const newReply = await api.createPost(formData);
                    addReply(currentPost.id, newReply);
                    setReplies(prev => [newReply, ...prev]);
                    setIsReplying(false);
                  }}
                  onClose={() => setIsReplying(false)}
                  parentId={currentPost.id}
                />
              </aside>
            )}
          </section>
        )}

        {/* Replies List Section */}
        <section aria-label="Réponses">
          {replies.length > 0 ? (
            <ul className="m-0 p-0">
              {replies.map((reply: Post) => (
                <TweetCard
                  key={reply.id}
                  id={reply.id}
                  authorName={reply.user.name}
                  username={reply.user.username}
                  content={reply.content}
                  timeAgo={reply.createdAt}
                  avatarUrl={reply.user.avatar ? `${BASE_URL}/uploads/avatars/${reply.user.avatar}` : undefined}
                  initialLikesCount={reply.likesCount}
                  initialIsLiked={reply.isLiked}
                  initialRepliesCount={reply.repliesCount}
                  media={reply.media}
                  onDelete={handleDeleteReply}
                  onLike={handleLikeReply}
                  isAuthorBlocked={reply.user.isBlocked}
                  className="border-b border-border"
                />
              ))}
            </ul>
          ) : (
            <footer className="p-8 text-center text-text-secondary">
              <p>Aucune réponse pour le moment.</p>
            </footer>
          )}
        </section>
      </main>
    </article>
  );
}
