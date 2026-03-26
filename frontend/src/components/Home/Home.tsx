import { useState, useEffect } from "react";
import TweetCard from "../ui/TweetCard";
import HomeHeader from "../ui/HomeHeader";
import RefreshLoader from "../ui/RefreshLoader";
import { TweetSkeleton } from "../ui/Skeletons";
import { api, BASE_URL } from "../../lib/api";
import type { Post } from "../../lib/api";

const AVATAR_BASE_URL = `${BASE_URL}/uploads/avatars/`;

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFeed, setActiveFeed] = useState<'for-you' | 'following'>('for-you');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [settingsRevision, setSettingsRevision] = useState(0);

  const fetchPosts = async (feed: 'for-you' | 'following', silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await api.getPosts(feed);
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchPosts(activeFeed, true);
  };

  // Pull to refresh logic for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.pageYOffset === 0) {
      setStartY(e.touches[0].pageY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY) {
      const currentY = e.touches[0].pageY;
      const distance = currentY - startY;
      if (distance > 0 && window.pageYOffset === 0) {
        const pull = Math.pow(distance, 0.85);
        setPullDistance(Math.min(pull, 120));
        if (distance > 30) e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      handleRefresh();
    }
    setPullDistance(0);
    setStartY(0);
  };

  useEffect(() => {
    const handleSettingsChange = () => setSettingsRevision(p => p + 1);
    window.addEventListener('settings-changed', handleSettingsChange);
    return () => window.removeEventListener('settings-changed', handleSettingsChange);
  }, []);

  useEffect(() => {
    if (api.isAuthenticated()) {
      api.getMe().then(setCurrentUser).catch(console.error);
    }
    fetchPosts(activeFeed);

    const intervalStr = localStorage.getItem("refreshInterval") || "off";
    if (intervalStr !== "off") {
      const intervalMs = parseInt(intervalStr) * 60 * 1000;
      const interval = setInterval(() => {
        fetchPosts(activeFeed, true);
      }, intervalMs);
      return () => clearInterval(interval);
    }
  }, [activeFeed, settingsRevision]);

  return (
    <main
      className="w-full max-w-2xl border-x border-border min-h-screen bg-background flex flex-col pt-0 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <HomeHeader activeFeed={activeFeed} setActiveFeed={setActiveFeed} onRefresh={handleRefresh} />

      <RefreshLoader isRefreshing={isRefreshing} pullDistance={pullDistance} />

      <section className="flex flex-col">
        <ul className="flex flex-col m-0 p-0">
          {loading ? (
            <>
              {[...Array(5)].map((_, i) => <TweetSkeleton key={i} />)}
            </>
          ) : posts.length === 0 ? (
            <li className="flex flex-col items-center justify-center p-20 text-center">
              <p className="text-text-secondary font-sf-pro text-lg">Il n'y a pas encore de posts. Soyez le premier à en publier un !</p>
            </li>
          ) : (
            posts.map((post) => (
              <TweetCard
                key={post.id}
                id={post.id}
                authorName={post.user.name}
                username={post.user.username}
                timeAgo={post.createdAt}
                content={post.content}
                avatarUrl={`${AVATAR_BASE_URL}${post.user.avatar}`}
                initialLikesCount={post.likesCount}
                initialIsLiked={post.isLiked}
                currentUserId={currentUser?.id}
                currentUsername={currentUser?.username}
                onDelete={(deletedId) => setPosts(prev => prev.filter(p => p.id !== deletedId))}
                isAuthorBlocked={post.user.isBlocked}
              />
            ))
          )}
        </ul>
      </section>
    </main>
  );
}
