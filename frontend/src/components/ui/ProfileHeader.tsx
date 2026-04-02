import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

interface ProfileHeaderProps {
    name: string;
    isBlocked: boolean;
    postCount: number;
}

export default function ProfileHeader({ name, isBlocked, postCount }: ProfileHeaderProps) {
    const navigate = useNavigate();
    
    return (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 hidden md:flex items-center gap-6">
            <button
                onClick={() => navigate(-1)}
                className="text-text-primary hover:bg-surface-hover p-2 rounded-full transition-colors flex-shrink-0"
                aria-label="Retour"
            >
                <FiArrowLeft className="w-5 h-5" />
            </button>
            <hgroup className="flex flex-col">
                <h1 className="text-[1.25rem] font-bold text-text-primary leading-none m-0">
                    {isBlocked ? 'Compte Suspendu' : name}
                </h1>
                {!isBlocked && (
                    <p className="text-[0.875rem] text-text-secondary m-0">
                        {postCount} {postCount > 1 ? 'posts' : 'post'}
                    </p>
                )}
            </hgroup>
        </header>
    );
}
