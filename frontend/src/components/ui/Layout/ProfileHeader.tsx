import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { IconButton } from '../Button/IconButton';

interface ProfileHeaderProps {
    name: string;
    isBlocked: boolean;
    postCount: number;
}

export default function ProfileHeader({ name, isBlocked, postCount }: ProfileHeaderProps) {
    const navigate = useNavigate();
    
    return (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 hidden md:flex items-center gap-6">
            <IconButton
                onClick={() => navigate(-1)}
                variant="ghost"
                size="sm"
                className="text-text-primary"
                aria-label="Retour"
            >
                <FiArrowLeft className="w-5 h-5" />
            </IconButton>
            <hgroup className="flex flex-col">
                <h1 className="text-xl font-bold text-text-primary leading-none m-0 uppercase tracking-tight">
                    {isBlocked ? 'Compte Suspendu' : name}
                </h1>
                {!isBlocked && (
                    <p className="text-sm text-text-secondary m-0">
                        {postCount} {postCount > 1 ? 'posts' : 'post'}
                    </p>
                )}
            </hgroup>
        </header>
    );
}
