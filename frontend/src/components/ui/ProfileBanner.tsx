import { FiSlash } from 'react-icons/fi';
import { MEDIA_URL as BASE_URL } from '../../lib/api';

interface ProfileBannerProps {
    banner?: string | null;
    avatar?: string | null;
    name: string;
    isBlocked: boolean;
    avatarBaseUrl: string;
}

export default function ProfileBanner({ banner, avatar, name, isBlocked, avatarBaseUrl }: ProfileBannerProps) {
    return (
        <figure className="h-32 md:h-48 w-full bg-surface-hover relative overflow-visible mt-2 md:mt-0">
            {banner && banner !== 'default_banniere.png' && banner !== '' && !isBlocked ? (
                <img
                    src={`${BASE_URL}/uploads/banners/${banner}`}
                    alt="Bannière"
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-linear-gradient opacity-30" />
            )}

            {/* Avatar overlapping banner */}
            <div className="absolute -bottom-12 left-4 md:left-6 rounded-full p-1 bg-background">
                <div className="w-24 h-24 rounded-full border-4 border-background bg-surface flex items-center justify-center overflow-hidden">
                    {isBlocked ? (
                        <div className="w-full h-full bg-surface-hover flex items-center justify-center">
                            <FiSlash className="w-10 h-10 text-text-tertiary" />
                        </div>
                    ) : (
                        <img
                            src={`${avatarBaseUrl}${avatar}`}
                            alt={`${name} avatar`}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
            </div>
        </figure>
    );
}
