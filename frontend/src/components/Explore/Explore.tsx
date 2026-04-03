import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FiSearch } from 'react-icons/fi';
import { api, MEDIA_URL as BASE_URL } from '../../lib/api';
import type { User, Post } from '../../lib/api';
import TweetCard from '../ui/Post/TweetCard';
import UserListItem from '../ui/Profile/UserListItem';
import SearchBar from '../ui/Layout/SearchBar';
import Tabs from '../ui/Layout/Tabs';
import { useStore } from '../../store/StoreContext';
import { RenderErrorBoundary } from '../ui/Feedback/RenderErrorBoundary';

const AVATAR_BASE_URL = `${BASE_URL}/uploads/avatars/`;

export default function Explore() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'tweets' | 'users'>('tweets');
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [postResults, setPostResults] = useState<Post[]>([]);
  const [userResults, setUserResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { currentUser } = useStore();

  useEffect(() => {
    if (query.trim().length > 0) {
      const delayDebounceFn = setTimeout(async () => {
        try {
          const users = await api.searchUsers(query);
          setUserSuggestions(users);
        } catch (error) {
          console.error("Error fetching user suggestions:", error);
        }
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setUserSuggestions([]);
    }
  }, [query]);

  const handleSearch = async (val: string) => {
    const searchTerm = val || query;
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setIsLoading(true);

    try {
      const [posts, users] = await Promise.all([
        api.searchPosts(searchTerm),
        api.searchUsers(searchTerm)
      ]);
      setPostResults(posts);
      setUserResults(users);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setIsSearching(false);
    setPostResults([]);
    setUserResults([]);
    setUserSuggestions([]);
  };

  const tabItems = [
    { id: 'tweets', label: 'Tweets' },
    { id: 'users', label: 'Utilisateurs' }
  ];

  return (
    <RenderErrorBoundary>
      <article className="w-full max-w-2xl border-x border-border min-h-screen bg-background flex flex-col font-sf-pro">
        {/* Header with SearchBar */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-[1rem] py-[0.75rem] border-b border-border">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            onClear={clearSearch}
            suggestions={userSuggestions}
            placeholder="Chercher dans la Sphère..."
          />
        </header>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {!isSearching ? (
            <motion.section
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-[3rem] text-center flex flex-col items-center gap-[1rem]"
            >
              <div className="w-[4rem] h-[4rem] rounded-[1.5rem] border border-primary/30 bg-surface flex items-center justify-center text-primary relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-[image:var(--color-linear-gradient)] opacity-10" />
                <FiSearch className="w-[2.25rem] h-[2.25rem] relative z-10" />
              </div>
              <h2 className="text-[1.5rem] font-black font-druk uppercase m-0 leading-tight">Explore la Sphère</h2>
              <p className="text-text-secondary max-w-[20rem] text-[1rem]">Recherche des mots-clés, des hashtags ou tes créateurs préférés.</p>
            </motion.section>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col flex-1"
            >
              <Tabs
                items={tabItems}
                activeTab={activeTab}
                onTabChange={(id) => setActiveTab(id as any)}
              />

              <main className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center p-[3rem]">
                    <div className="w-[1.5rem] h-[1.5rem] border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : activeTab === 'tweets' ? (
                  postResults.length > 0 ? (
                    <motion.ul
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="list-none p-0 m-0 divide-y divide-border"
                    >
                      {postResults.map(post => (
                        <TweetCard
                          key={post.id}
                          id={post.id}
                          authorName={post.user.name}
                          username={post.user.username}
                          timeAgo={post.createdAt}
                          content={post.content}
                          avatarUrl={post.user.avatar ? `${AVATAR_BASE_URL}${post.user.avatar}` : undefined}
                          initialLikesCount={post.likesCount}
                          initialIsLiked={post.isLiked}
                          currentUserId={currentUser?.id}
                          currentUsername={currentUser?.username}
                          media={post.media}
                          isAuthorBlocked={post.user.isBlocked}
                          isCensored={post.isCensored}
                          isReadOnly={post.user.isReadOnly}
                          className="bg-transparent hover:bg-surface-hover/20"
                        />
                      ))}
                    </motion.ul>
                  ) : (
                    <div className="p-[3.5rem] text-center text-text-secondary text-[1rem]">Aucun tweet trouvé pour "{query}".</div>
                  )
                ) : (
                  userResults.length > 0 ? (
                    <motion.ul
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="list-none p-0 m-0 divide-y divide-border"
                    >
                      {userResults.map(user => (
                        <UserListItem
                          key={user.id}
                          user={user}
                          className="hover:bg-surface-hover/20"
                        />
                      ))}
                    </motion.ul>
                  ) : (
                    <div className="p-[3.5rem] text-center text-text-secondary text-[1rem]">Aucun utilisateur trouvé pour "{query}".</div>
                  )
                )}
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </RenderErrorBoundary>
  );
}
