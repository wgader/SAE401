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
import { FiMoreHorizontal, FiSlash } from 'react-icons/fi';
import { ConfirmModal } from '../ui/ConfirmModal';

const AVATAR_BASE_URL = `${BASE_URL}/uploads/avatars/`;

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const {
    currentProfile: profile,
    setCurrentProfile,
    profilePosts: posts,
    setProfilePosts,
    currentUser,
    setCurrentUser,
    toggleFollow,
    toggleBlock
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [hoverBlocked, setHoverBlocked] = useState(false);

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
    setCurrentUser(updatedUser);
    window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: "Profil mis à jour !", variant: 'success' } 
    }));
  };

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      const data = await api.toggleFollow(profile.username);
      toggleFollow(profile.username, data);
    } catch (error: any) {
      console.error(error);
      window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: error.message || "Action non autorisée", variant: 'error' } 
      }));
    }
  };

  const handleBlockToggle = async () => {
    if (!profile) return;
    try {
      const data = await api.blockUser(profile.username);
      toggleBlock(profile.username, data);
      setShowBlockConfirm(false);
      window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { 
              message: data.isBlockedByMe ? "Utilisateur bloqué" : "Utilisateur débloqué", 
              variant: data.isBlockedByMe ? 'error' : 'success' 
          } 
      }));
    } catch (error: any) {
      console.error(error);
      window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: error.message || "Erreur lors du blocage", variant: 'error' } 
      }));
    }
  };

  return (
    <RenderErrorBoundary>
      <article className="w-full max-w-2xl border-x border-border min-h-screen bg-background flex flex-col pb-20 font-sf-pro">
        <ProfileHeader
          name={profile.name}
          isBlocked={!!profile.isBlocked}
          postCount={posts.length}
        />

        <ProfileBanner
          banner={profile.banner}
          avatar={profile.avatar}
          name={profile.name}
          isBlocked={!!profile.isBlocked}
          avatarBaseUrl={AVATAR_BASE_URL}
        />

        <menu className="flex justify-end px-4 md:px-6 mt-3 h-10 m-0 p-0 gap-2 pr-4 md:pr-6 list-none relative">
          {!profile.isBlocked && (
            <>
              {isOwnProfile ? (
                 <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Éditer le profil
                 </Button>
              ) : currentUser ? (
                <>
                   {/* 3 Dots Menu */}
                   <div className="relative">
                      <button 
                        onClick={() => setShowBlockMenu(!showBlockMenu)}
                        className="p-2 rounded-full border border-border hover:bg-surface-hover transition flex items-center justify-center h-full aspect-square"
                        aria-label="Plus d'options"
                      >
                         <FiMoreHorizontal className="w-5 h-5 text-text-primary" />
                      </button>

                      {showBlockMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowBlockMenu(false)} />
                          <ul className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden m-0 p-1 list-none animate-in fade-in zoom-in-95 duration-100">
                             <li>
                                <button 
                                  onClick={() => { setShowBlockMenu(false); setShowBlockConfirm(true); }}
                                  className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 transition flex items-center gap-3 text-red-500 font-bold text-sm"
                                >
                                   <FiSlash className="w-4 h-4" />
                                   {profile.isBlockedByMe ? `Débloquer @${profile.username}` : `Bloquer @${profile.username}`}
                                </button>
                             </li>
                          </ul>
                        </>
                      )}
                   </div>

                   {/* Follow/Block Button */}
                   {profile.isBlockedByMe ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onMouseEnter={() => setHoverBlocked(true)}
                        onMouseLeave={() => setHoverBlocked(false)}
                        onClick={handleBlockToggle}
                        className="min-w-[100px] border-none bg-red-600 hover:bg-red-700 text-white font-bold"
                      >
                        {hoverBlocked ? 'Débloquer' : 'Bloqué'}
                      </Button>
                   ) : (
                      <Button
                        variant={profile.isFollowing ? "outline" : "primary"}
                        size="sm"
                        onClick={handleFollowToggle}
                        className="font-bold"
                      >
                        {profile.isFollowing ? 'Ne plus suivre' : 'Suivre'}
                      </Button>
                   )}
                </>
              ) : null}
            </>
          )}
        </menu>

        <ProfileInfo 
          profile={profile} 
          joinedDate={joinedDate} 
          onShowList={(type) => navigate(`/profile/${profile.username}/${type}`)}
        />

        <section className="mt-4 border-t border-border relative overflow-hidden flex-1 flex flex-col">
          {profile.isBlocked ? (
            <BlockedProfileView type="suspended" />
          ) : (
            <>
              {profile.hasBlockedMe && (
                <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-8 text-center animate-in fade-in duration-300">
                   <FiSlash className="w-12 h-12 text-red-500/30 mx-auto mb-3" />
                   <h3 className="text-xl font-black text-white uppercase font-druk m-0 leading-none">Accès restreint</h3>
                   <p className="text-sm text-text-secondary mt-2 max-w-xs mx-auto">Cet utilisateur vous a bloqué. Vous pouvez voir ses posts mais les interactions sont limitées.</p>
                </div>
              )}
              
              <header className="px-4 py-3 border-b border-border flex items-center justify-between bg-background sticky top-0 z-10">
                 <h3 className="font-bold text-text-primary text-lg m-0">Posts</h3>
              </header>

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
                      media={post.media}
                      isAuthorBlocked={post.user.isBlocked || post.user.isBlockedByMe}
                      className="border-b border-border"
                    />
                  ))}
                </ul>
              ) : (
                <p className="p-12 text-center text-text-secondary m-0">Aucun post pour le moment.</p>
              )}
            </>
          )}
        </section>


        {showBlockConfirm && (
           <ConfirmModal 
              title={profile.isBlockedByMe ? `Débloquer @${profile.username} ?` : `Bloquer @${profile.username} ?`}
              message={profile.isBlockedByMe 
                ? "Ils pourront à nouveau vous suivre et voir vos posts. Vous pourrez aussi à nouveau vous suivre mutuellement."
                : `Ils ne pourront plus vous suivre, voir vos posts ou vous taguer. Cette action est réversible.`}
              confirmLabel={profile.isBlockedByMe ? "Débloquer" : "Bloquer"}
              onConfirm={handleBlockToggle}
              onCancel={() => setShowBlockConfirm(false)}
              variant={profile.isBlockedByMe ? "primary" : "danger"}
           />
        )}

        {isEditing && (
          <EditProfile user={profile} onClose={() => setIsEditing(false)} onUpdate={handleProfileUpdate} />
        )}
      </article>
    </RenderErrorBoundary>
  );
}
