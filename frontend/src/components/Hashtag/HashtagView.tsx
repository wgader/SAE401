import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { type Post, request, MEDIA_URL as BASE_URL } from "../../lib/api";
import TweetCard from "../ui/TweetCard";
import { FiArrowLeft, FiHash } from "react-icons/fi";
import { TweetSkeleton } from "../ui/Skeletons";
import { useStore } from "../../store/StoreContext";

const AVATAR_BASE_URL = `${BASE_URL}/uploads/avatars/`;

/**
 * Composant de vue pour afficher les posts liés à un hashtag spécifique.
 */
export default function HashtagView() {
  const { hashtag } = useParams<{ hashtag: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useStore();

  useEffect(() => {
    const fetchHashtagPosts = async () => {
      if (!hashtag) return;
      setIsLoading(true);
      try {
        // On appelle l'index des posts en passant le hashtag en paramètre
        const data = await request<Post[]>(`/posts?hashtag=${encodeURIComponent(hashtag)}`);
        setPosts(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des posts du hashtag:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHashtagPosts();
  }, [hashtag]);

  const handleDeletePost = (postId: number) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <article className="w-full max-w-2xl border-x border-border min-h-screen bg-background flex flex-col font-sf-pro">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-6">
        <button 
          onClick={() => navigate(-1)} 
          className="text-text-primary hover:bg-surface-hover p-2 rounded-full transition-colors"
          aria-label="Retour"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col text-left">
            <h1 className="text-[1.25rem] font-bold text-text-primary m-0 flex items-center gap-1">
                <FiHash className="text-primary w-5 h-5" />
                {hashtag}
            </h1>
            <p className="text-[0.875rem] text-text-secondary m-0">
                {posts.length} {posts.length > 1 ? 'posts' : 'post'}
            </p>
        </div>
      </header>

      <main className="flex-1">
        {isLoading ? (
          <ul className="flex flex-col m-0 p-0 overflow-hidden divide-y divide-border list-none">
            {[...Array(3)].map((_, i) => <TweetSkeleton key={i} />)}
          </ul>
        ) : posts.length > 0 ? (
          <ul className="flex flex-col m-0 p-0 overflow-hidden divide-y divide-border list-none">
            {posts.map((post) => (
              <TweetCard 
                key={post.id} 
                id={post.id}
                authorName={post.user.name}
                username={post.user.username}
                content={post.content}
                timeAgo={post.createdAt}
                avatarUrl={post.user.avatar ? `${AVATAR_BASE_URL}${post.user.avatar}` : undefined}
                initialLikesCount={post.likesCount}
                initialIsLiked={post.isLiked}
                initialRepliesCount={post.repliesCount}
                media={post.media}
                isCensored={post.isCensored}
                isReadOnly={post.user.isReadOnly}
                currentUserId={currentUser?.id}
                currentUsername={currentUser?.username}
                onDelete={handleDeletePost}
              />
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center flex flex-col items-center gap-4">
            <div className="p-4 bg-surface rounded-full">
                <FiHash className="w-8 h-8 text-text-secondary" />
            </div>
            <div>
                <h2 className="text-[1.25rem] font-bold text-text-primary mb-1">Aucun résultat pour #{hashtag}</h2>
                <p className="text-text-secondary text-[1rem]">Soyez le premier à utiliser ce hashtag !</p>
            </div>
          </div>
        )}
      </main>
    </article>
  );
}
