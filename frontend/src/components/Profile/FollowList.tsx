import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, BASE_URL, type User } from '../../lib/api';
import { Button } from '../ui/Button/Button';
import { FiArrowLeft, FiSlash } from 'react-icons/fi';
import { useStore } from '../../store/StoreContext';
import { cn } from '../../lib/utils';

interface FollowListProps {
    type: 'followers' | 'following' | 'blocked';
}

export default function FollowList({ type: routeType }: FollowListProps) {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const [type, setType] = useState(routeType);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { currentUser, toggleFollow, toggleBlock, currentProfile } = useStore();


    useEffect(() => {
        const fetchUsers = async () => {
            if (!username) return;
            setLoading(true);
            try {
                let data: User[] = [];
                if (type === 'followers') data = await api.getFollowers(username);
                else if (type === 'following') data = await api.getFollowing(username);
                else if (type === 'blocked') data = await api.getBlockedUsers();
                setUsers(data);
            } catch (error) {
                console.error(error);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [username, type]);

    const handleFollow = async (e: React.MouseEvent, targetUsername: string) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const data = await api.toggleFollow(targetUsername);
            toggleFollow(targetUsername, data);
            
            if (type === 'following' && !data.isFollowing) {
                // Remove from list if we unfollow in the following tab
                setUsers(prev => prev.filter(u => u.username !== targetUsername));
            } else {
                setUsers(prev => prev.map(u => u.username === targetUsername ? { ...u, isFollowing: data.isFollowing } : u));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleBlock = async (e: React.MouseEvent, targetUsername: string) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const data = await api.blockUser(targetUsername);
            toggleBlock(targetUsername, data);
            if (!data.isBlockedByMe) {
                // Removed from list if unblocked in blocked tab, or just remove if blocked in other tabs
                setUsers(prev => prev.filter(u => u.username !== targetUsername));
            } else {
                setUsers(prev => prev.map(u => u.username === targetUsername ? { ...u, isBlockedByMe: data.isBlockedByMe } : u));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <article className="w-full max-w-2xl mx-auto border-x border-border min-h-screen bg-background flex flex-col">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md flex flex-col border-b border-border">
                <section className="flex items-center h-[3.3rem] px-4 gap-8">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2 hover:bg-surface-hover rounded-full transition"
                        aria-label="Retour"
                    >
                        <FiArrowLeft className="w-5 h-5 text-text-primary" />
                    </button>
                    <hgroup className="flex flex-col">
                        <h1 className="text-[1.25rem] font-bold text-text-primary leading-tight">
                            {currentProfile?.username === username ? currentProfile?.name : `@${username}`}
                        </h1>
                        <p className="text-text-secondary text-[13px]">
                            {type === 'followers' ? 'Abonnés' : 'Abonnements'}
                        </p>
                    </hgroup>
                </section>

                <nav className="flex">
                    <button 
                        onClick={() => { setType('followers'); navigate(`/profile/${username}/followers`, { replace: true }); }}
                        className={cn(
                            "flex-1 py-4 text-sm font-bold transition-all relative hover:bg-surface-hover/50",
                            type === 'followers' ? "text-text-primary" : "text-text-secondary"
                        )}
                    >
                        Abonnés
                        {type === 'followers' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-primary rounded-full transition-all" />}
                    </button>
                    <button 
                        onClick={() => { setType('following'); navigate(`/profile/${username}/following`, { replace: true }); }}
                        className={cn(
                            "flex-1 py-4 text-sm font-bold transition-all relative hover:bg-surface-hover/50",
                            type === 'following' ? "text-text-primary" : "text-text-secondary"
                        )}
                    >
                        Abonnements
                        {type === 'following' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-primary rounded-full transition-all" />}
                    </button>
                </nav>
            </header>

            <main className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                ) : users.length > 0 ? (
                    <ul className="list-none m-0 p-0 divide-y divide-border">
                        {users.map(user => (
                            <li key={user.id} className="p-4 hover:bg-surface-hover/30 transition-colors cursor-pointer group" onClick={() => { navigate(`/profile/${user.username}`); }}>
                                <section className="flex items-start gap-3">
                                    <figure className="m-0 relative flex-shrink-0">
                                        <img 
                                          src={`${BASE_URL}/uploads/avatars/${user.avatar || 'default.png'}`} 
                                          alt={user.name} 
                                          className="w-10 h-10 rounded-full object-cover border border-border group-hover:brightness-95 transition"
                                        />
                                    </figure>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <hgroup className="min-w-0">
                                                <div className="flex items-center gap-1">
                                                    <h2 className="font-bold text-text-primary truncate m-0 text-[15px] hover:underline leading-tight">{user.name}</h2>
                                                </div>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <p className="text-text-secondary truncate m-0 text-sm">@{user.username}</p>
                                                    {user.isFollower && (
                                                        <span className="bg-surface-hover text-text-secondary text-[11px] px-1.5 py-0.5 rounded font-medium">Vous suit</span>
                                                    )}
                                                </div>
                                            </hgroup>
                                            
                                            {currentUser?.id !== user.id && (
                                                <div className="flex items-center gap-2">
                                                    {type === 'blocked' || user.isBlockedByMe ? (
                                                        <Button 
                                                            variant="danger" 
                                                            size="sm" 
                                                            onClick={(e) => handleBlock(e, user.username)} 
                                                            className="h-8 rounded-full text-[13px] font-bold px-4 bg-transparent border border-danger text-danger hover:bg-danger/10"
                                                        >
                                                            Débloquer
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                          variant={user.isFollowing ? "outline" : "primary"} 
                                                          size="sm" 
                                                          onClick={(e) => handleFollow(e, user.username)}
                                                          className={cn(
                                                              "h-8 rounded-full text-[13px] font-bold px-4",
                                                              user.isFollowing ? "border-border text-text-primary hover:border-red-500 hover:text-red-500 hover:bg-red-500/5 group/unfollow" : ""
                                                          )}
                                                        >
                                                            <span className={user.isFollowing ? "group-hover/unfollow:hidden" : ""}>
                                                                {user.isFollowing ? 'Abonné' : 'Suivre'}
                                                            </span>
                                                            {user.isFollowing && (
                                                                <span className="hidden group-hover/unfollow:inline">Quitter</span>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {user.bio && (
                                            <p className="text-[14px] text-text-primary mt-1 line-clamp-2 leading-snug">{user.bio}</p>
                                        )}
                                    </div>
                                </section>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <section className="p-12 text-center flex flex-col items-center gap-4">
                        <FiSlash className="w-16 h-16 text-text-tertiary/20" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight font-druk opacity-50">Rien à voir ici</h2>
                        <p className="text-text-secondary text-sm">Cette liste est vide pour le moment.</p>
                    </section>
                )}
            </main>
        </article>
    );
}
