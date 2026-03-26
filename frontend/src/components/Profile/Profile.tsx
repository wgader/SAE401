import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, BASE_URL } from '../../lib/api';
import type { User } from '../../lib/api';
import TweetCard from '../ui/TweetCard';
import EditProfile from './EditProfile';
import { ProfileSkeleton } from '../ui/Skeletons';
import { Button } from '../ui/Button/Button';
import { useStore } from '../../store/StoreContext';
import { RenderErrorBoundary } from '../ui/RenderErrorBoundary';

// Reusable UI Components
import ProfileHeader from '../ui/ProfileHeader';
import ProfileBanner from '../ui/ProfileBanner';
import ProfileInfo from '../ui/ProfileInfo';
import BlockedProfileView from '../ui/BlockedProfileView';

const AVATAR_BASE_URL = `${BASE_URL}/uploads/avatars/`;

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { 
    currentProfile: profile, 
    setCurrentProfile, 
    profilePosts: posts, 
    setProfilePosts, 
    currentUser 
  } = useStore();
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (username) {
      loadProfile(username);
    }
  }, [username, navigate]);

  const loadProfile = async (targetUsername: string) => {
    const cleanUsername = targetUsername.startsWith('@') ? targetUsername.slice(1) : targetUsername;
    setLoading(true);
    try {
      const userData = await api.getUser(cleanUsername);
      setCurrentProfile(userData);

      try {
        const userPosts = await api.getUserPosts(cleanUsername);
        setProfilePosts(userPosts);
      } catch (postError) {
        console.warn("Could not load posts for this user:", postError);
        setProfilePosts([]);
      }
    } catch (error) {
      console.error("Profile load error:", error);
      setCurrentProfile(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (!profile) return (
    <main className="w-full min-h-screen bg-background flex flex-col items-center justify-center text-text-primary">
      <h2>Utilisateur introuvable</h2>
    </main>
  );

  const isOwnProfile = currentUser?.username === profile.username;
  const joinedDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : "";

  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentProfile(updatedUser);
  };

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      const data = await api.toggleFollow(profile.username);
      setCurrentProfile({ ...profile, ...data });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <RenderErrorBoundary>
      <article className="w-full max-w-2xl border-x border-border min-h-screen bg-background flex flex-col pb-20 font-sf-pro">
        <ProfileHeader 
          name={profile.name} 
          isBlocked={profile.isBlocked} 
          postCount={posts.length} 
        />

        <ProfileBanner 
          banner={profile.banner} 
          avatar={profile.avatar} 
          name={profile.name} 
          isBlocked={profile.isBlocked} 
          avatarBaseUrl={AVATAR_BASE_URL}
        />

        <menu className="flex justify-end px-4 md:px-6 mt-3 h-10 m-0 p-0 gap-2 pr-4 md:pr-6 list-none">
          {!profile.isBlocked && (
            isOwnProfile ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Éditer le profil
              </Button>
            ) : currentUser ? (
              <Button 
                  variant={profile.isFollowing ? "outline" : "primary"} 
                  size="sm" 
                  onClick={handleFollowToggle}
              >
                {profile.isFollowing ? 'Ne plus suivre' : 'Suivre'}
              </Button>
            ) : null
          )}
        </menu>

        <ProfileInfo profile={profile} joinedDate={joinedDate} />

        <section className="mt-4 border-t border-border relative overflow-hidden flex-1 flex flex-col">
          {profile.isBlocked ? (
            <BlockedProfileView />
          ) : (
            <>
              <h3 className="px-4 py-3 font-bold text-text-primary text-lg border-b border-border m-0">Posts</h3>
              {posts.length > 0 ? (
                <ul className="flex flex-col list-none m-0 p-0">
                  {posts.map(post => (
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
                    />
                  ))}
                </ul>
              ) : (
                <p className="p-8 text-center text-text-secondary m-0">Aucun post pour le moment.</p>
              )}
            </>
          )}
        </section>

        {isEditing && (
          <EditProfile user={profile} onClose={() => setIsEditing(false)} onUpdate={handleProfileUpdate} />
        )}
      </article>
    </RenderErrorBoundary>
  );
}
