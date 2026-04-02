import { useNavigate } from 'react-router-dom';
import { MEDIA_URL as BASE_URL, type User } from '../../lib/api';
import { Button } from './Button/Button';
import { useStore } from '../../store/StoreContext';
import { cn } from '../../lib/utils';
import { FiCheck } from 'react-icons/fi';

interface UserListItemProps {
    user: User;
    showBio?: boolean;
    showAction?: boolean;
    onActionSuccess?: () => void;
    className?: string;
    children?: React.ReactNode;
}

export default function UserListItem({ user, showBio = true, showAction = true, onActionSuccess, className, children }: UserListItemProps) {
    const navigate = useNavigate();
    const { currentUser, toggleFollow } = useStore();
    
    const handleFollow = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            // Need to import api dynamically or use it from store/props to avoid circular deps if any
            // For now, let's assume it's available or use toggleFollow logic from store
            // Actually, toggleFollow in store already handles the API call if we pass it, 
            // but the store currently expects the DATA from API. 
            // Let's use the api object directly since it's a lib.
            const { api } = await import('../../lib/api');
            const data = await api.toggleFollow(user.username);
            toggleFollow(user.username, data);
            if (onActionSuccess) onActionSuccess();
        } catch (error) {
            console.error(error);
        }
    };

    const isOwnProfile = currentUser?.id === user.id;

    return (
        <li 
            onClick={() => navigate(`/profile/${user.username}`)}
            className={cn(
                "p-[1rem] hover:bg-surface-hover/30 transition-colors cursor-pointer group flex items-start gap-[0.75rem]",
                className
            )}
        >
            <figure className="m-0 relative flex-shrink-0">
                <img
                    src={`${BASE_URL}/uploads/avatars/${user.avatar || 'default.png'}`}
                    alt={user.name}
                    className="w-[2.5rem] h-[2.5rem] md:w-[3rem] md:h-[3rem] rounded-full object-cover border border-border group-hover:brightness-95 transition shadow-sm"
                />
            </figure>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-[0.5rem]">
                    <hgroup className="min-w-0">
                        <div className="flex items-center gap-[0.25rem]">
                            <h2 className="font-bold text-text-primary truncate m-0 text-[0.9375rem] hover:underline leading-tight">
                                {user.name}
                            </h2>
                            {user.isVerified && (
                                <div className="w-[0.9rem] h-[0.9rem] bg-primary rounded-full flex items-center justify-center text-[0.5rem] text-background flex-shrink-0">
                                    <FiCheck strokeWidth={4} />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-[0.25rem] mt-[0.125rem]">
                            <p className="text-text-secondary truncate m-0 text-[0.875rem]">@{user.username}</p>
                            {user.isFollower && (
                                <span className="bg-surface-hover text-text-secondary text-[0.75rem] px-[0.375rem] py-[0.125rem] rounded font-medium">Vous suit</span>
                            )}
                        </div>
                    </hgroup>

                    {showAction && !isOwnProfile && (
                        <div className="flex items-center gap-[0.5rem]">
                            {children ? children : (
                                <Button
                                    variant={user.isFollowing ? "outline" : "primary"}
                                    size="sm"
                                    onClick={handleFollow}
                                    className={cn(
                                        "h-[2rem] rounded-full text-[0.875rem] font-bold px-[1rem] transition-all",
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
                
                {showBio && user.bio && (
                    <p className="text-[0.875rem] text-text-primary mt-[0.25rem] line-clamp-2 leading-snug">
                        {user.bio}
                    </p>
                )}
            </div>
        </li>
    );
}
