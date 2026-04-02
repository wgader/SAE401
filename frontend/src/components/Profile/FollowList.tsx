import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, type User } from '../../lib/api';
import { Button } from '../ui/Button/Button';
import { FiArrowLeft, FiSlash } from 'react-icons/fi';
import { useStore } from '../../store/StoreContext';
import { cn } from '../../lib/utils';
import { ConfirmModal } from '../ui/ConfirmModal';
import UserListItem from '../ui/UserListItem';

interface FollowListProps {
    type: 'followers' | 'following' | 'blocked';
}

export default function FollowList({ type: routeType }: FollowListProps) {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const [type, setType] = useState(routeType);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [unblockTarget, setUnblockTarget] = useState<string | null>(null);
    const { currentUser, toggleBlock, currentProfile } = useStore();

    const isOwnProfile = currentUser?.username === username;

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

    const handleUnblockConfirm = async () => {
        if (!unblockTarget) return;
        try {
            const data = await api.blockUser(unblockTarget);
            toggleBlock(unblockTarget, data);
            if (!data.isBlockedByMe) {
                setUsers(prev => prev.filter(u => u.username !== unblockTarget));
            }
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: `@${unblockTarget} a été débloqué`, variant: 'success' }
            }));
        } catch (error) {
            console.error(error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Erreur lors du déblocage", variant: 'error' }
            }));
        } finally {
            setUnblockTarget(null);
        }
    };

    const typeLabel = type === 'followers' ? 'Abonnés' : type === 'following' ? 'Abonnements' : 'Bloqués';

    return (
        <article className="w-full max-w-2xl mx-auto border-x border-border min-h-screen bg-background flex flex-col">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md flex flex-col border-b border-border">
                <section className="flex items-center h-[3.3rem] px-[1rem] gap-[2rem]">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-[0.5rem] hover:bg-surface-hover rounded-full transition"
                        aria-label="Retour"
                    >
                        <FiArrowLeft className="w-[1.25rem] h-[1.25rem] text-text-primary" />
                    </button>
                    <hgroup className="flex flex-col">
                        <h1 className="text-[1.25rem] font-bold text-text-primary leading-tight">
                            {currentProfile?.username === username ? currentProfile?.name : `@${username}`}
                        </h1>
                        <p className="text-text-secondary text-[0.875rem]">
                            {typeLabel}
                        </p>
                    </hgroup>
                </section>

                <nav className="flex">
                    <button
                        onClick={() => { setType('followers'); navigate(`/profile/${username}/followers`, { replace: true }); }}
                        className={cn(
                            "flex-1 py-[1rem] text-[0.875rem] font-bold transition-all relative hover:bg-surface-hover/50",
                            type === 'followers' ? "text-text-primary" : "text-text-secondary"
                        )}
                    >
                        Abonnés
                        {type === 'followers' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[3.5rem] h-[0.25rem] bg-primary rounded-full transition-all" />}
                    </button>
                    <button
                        onClick={() => { setType('following'); navigate(`/profile/${username}/following`, { replace: true }); }}
                        className={cn(
                            "flex-1 py-[1rem] text-[0.875rem] font-bold transition-all relative hover:bg-surface-hover/50",
                            type === 'following' ? "text-text-primary" : "text-text-secondary"
                        )}
                    >
                        Abonnements
                        {type === 'following' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[3.5rem] h-[0.25rem] bg-primary rounded-full transition-all" />}
                    </button>
                    {isOwnProfile && (
                        <button
                            onClick={() => { setType('blocked'); navigate(`/profile/${username}/blocked`, { replace: true }); }}
                            className={cn(
                                "flex-1 py-[1rem] text-[0.875rem] font-bold transition-all relative hover:bg-surface-hover/50",
                                type === 'blocked' ? "text-text-primary" : "text-text-secondary"
                            )}
                        >
                            Bloqués
                            {type === 'blocked' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[3.5rem] h-[0.25rem] bg-primary rounded-full transition-all" />}
                        </button>
                    )}
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
                            <UserListItem 
                                key={user.id} 
                                user={user}
                                onActionSuccess={() => {
                                    if (type === 'following') {
                                        setUsers(prev => prev.filter(u => u.username !== user.username));
                                    }
                                }}
                            >
                                {(type === 'blocked' || user.isBlockedByMe) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setUnblockTarget(user.username); }}
                                        className="h-[2rem] rounded-full text-[0.875rem] font-bold px-[1rem] border-red-500 text-red-500 hover:bg-red-500/10"
                                    >
                                        Débloquer
                                    </Button>
                                )}
                            </UserListItem>
                        ))}
                    </ul>
                ) : (
                    <section className="p-[3rem] text-center flex flex-col items-center gap-[1rem]">
                        <FiSlash className="w-[4rem] h-[4rem] text-text-tertiary/20" />
                        <h2 className="text-[1.5rem] font-black text-white uppercase tracking-tight font-druk opacity-50">Rien à voir ici</h2>
                        <p className="text-text-secondary text-[0.875rem]">
                            {type === 'blocked' ? "Vous n'avez bloqué aucun utilisateur." : "Cette liste est vide pour le moment."}
                        </p>
                    </section>
                )}
            </main>

            {unblockTarget && (
                <ConfirmModal
                    title={`Débloquer @${unblockTarget} ?`}
                    message="Cet utilisateur pourra à nouveau vous suivre, voir vos posts et interagir avec vous."
                    confirmLabel="Débloquer"
                    onConfirm={handleUnblockConfirm}
                    onCancel={() => setUnblockTarget(null)}
                    variant="primary"
                />
            )}
        </article>
    );
}
