import { useState, useEffect, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useLocation } from "react-router-dom";
import TweetCard from "../ui/Post/TweetCard";
import HomeHeader from "../ui/Layout/HomeHeader";
import RefreshLoader from "../ui/Feedback/RefreshLoader";
import { TweetSkeleton } from "../ui/Feedback/Skeletons";
import { api, MEDIA_URL as BASE_URL } from "../../lib/api";
import { useStore } from "../../store/StoreContext";
import { RenderErrorBoundary } from "../ui/Feedback/RenderErrorBoundary";
import { Toast } from "../ui/Feedback/Toast";

const AVATAR_BASE_URL = `${BASE_URL}/uploads/avatars/`;

interface LocationState {
  postCreated?: boolean;
}

export default function Home() {
  const { posts, setPosts, currentUser } = useStore();
  const [activeFeed, setActiveFeed] = useState<'for-you' | 'following'>('for-you');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [settingsRevision, setSettingsRevision] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const location = useLocation();
  const state = location.state as LocationState;
  const mainRef = useRef<HTMLElement>(null);

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
      setPullDistance(0);
    }
  };

  const handleRefresh = () => {
    fetchPosts(activeFeed, true);
  };

  useEffect(() => {
    const element = mainRef.current;
    if (!element) return;

    let localStartY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (window.pageYOffset === 0) {
        localStartY = e.touches[0].pageY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (localStartY > 0) {
        const currentY = e.touches[0].pageY;
        const distance = currentY - localStartY;

        if (distance > 0 && window.pageYOffset === 0) {
          const pull = Math.pow(distance, 0.85);
          setPullDistance(Math.min(pull, 120));

          if (distance > 10 && e.cancelable) {
            e.preventDefault();
          }
        }
      }
    };

    const onTouchEnd = () => {
      localStartY = 0;
    };

    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchmove', onTouchMove, { passive: false });
    element.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const handleTouchEndInReact = () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      handleRefresh();
    } else {
      setPullDistance(0);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  useEffect(() => {
    const handleSettingsChange = () => setSettingsRevision(p => p + 1);
    window.addEventListener('settings-changed', handleSettingsChange);

    if (state?.postCreated) {
      setShowToast(true);
      window.history.replaceState({}, document.title);
    }

    return () => window.removeEventListener('settings-changed', handleSettingsChange);
  }, [state, location]);

  useEffect(() => {
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
      ref={mainRef}
      className="w-full max-w-2xl border-x border-border min-h-screen bg-background flex flex-col pt-0 relative"
      onTouchEnd={handleTouchEndInReact}
    >
      <HomeHeader activeFeed={activeFeed} setActiveFeed={setActiveFeed} onRefresh={handleRefresh} />

      <RefreshLoader isRefreshing={isRefreshing} pullDistance={pullDistance} />

      <section className="flex flex-col">
        <RenderErrorBoundary>
          <motion.ul
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col m-0 p-0 overflow-hidden list-none"
          >
            {loading ? (
              <>
                {[...Array(5)].map((_, i) => <TweetSkeleton key={i} />)}
              </>
            ) : posts.length === 0 ? (
              <li className="flex flex-col items-center justify-center p-20 text-center">
                <p className="text-text-secondary font-sf-pro text-[1.125rem]">Il n'y a pas encore de posts. Soyez le premier à en publier un !</p>
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
                  media={post.media}
                  isAuthorBlocked={post.user.isBlocked}
                  isCensored={post.isCensored}
                  isReadOnly={post.user.isReadOnly}
                />
              ))
            )}
          </motion.ul>
        </RenderErrorBoundary>
      </section>

      <Toast
        isVisible={showToast}
        message="Ton post a été envoyé !"
        onClose={() => setShowToast(false)}
      />
    </main>
  );
}
