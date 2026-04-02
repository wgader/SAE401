import { FiMapPin, FiLink, FiCalendar, FiSlash } from 'react-icons/fi';
import type { User } from '../../lib/api';

interface ProfileInfoProps {
    profile: User;
    joinedDate: string;
    onShowList?: (type: 'followers' | 'following' | 'blocked') => void;
    isOwnProfile?: boolean;
}

export default function ProfileInfo({ profile, joinedDate, onShowList, isOwnProfile }: ProfileInfoProps) {
    return (
        <section className="mt-2 text-text-primary px-4 md:px-6 flex flex-col gap-3">
            <hgroup className="flex flex-col">
                <h2 className="text-[1.25rem] font-extrabold text-text-primary leading-tight m-0">
                    {profile.isBlocked ? 'Compte Suspendu' : profile.name}
                </h2>
                <p className="text-text-secondary text-[0.875rem] m-0">@{profile.username}</p>
            </hgroup>

            {profile.isBlocked ? (
                <div className="flex flex-col gap-6 py-4">
                    <div className="flex flex-col gap-2 opacity-10">
                        <div className="h-4 w-full bg-text-tertiary rounded-full" />
                        <div className="h-4 w-5/6 bg-text-tertiary rounded-full" />
                        <div className="h-4 w-4/6 bg-text-tertiary rounded-full" />
                    </div>
                    <p className="text-red-500 font-black text-[1.125rem] tracking-tight uppercase flex items-center gap-2">
                        <FiSlash className="w-5 h-5" />
                        Profil Neutralisé par la Sphère
                    </p>
                    <p className="text-text-secondary text-[0.875rem] leading-relaxed max-w-sm">
                        Ce sujet a été extrait de la Sphère pour avoir dérogé de manière critique aux protocoles de communication.
                        Toutes ses transmissions ont été révoquées.
                    </p>
                </div>
            ) : (
                <>
                    {profile.bio && (
                        <p className="text-text-primary text-[0.9375rem] whitespace-pre-wrap">{profile.bio}</p>
                    )}

                    <address className="flex flex-wrap gap-x-4 gap-y-2 text-text-secondary text-[0.9375rem] mb-2 not-italic">
                        {profile.location && (
                            <span className="flex items-center gap-1">
                                <FiMapPin className="w-4 h-4" />
                                {profile.location}
                            </span>
                        )}
                        {profile.website && (
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                <FiLink className="w-4 h-4" />
                                {profile.website.replace(/^https?:\/\//, '')}
                            </a>
                        )}
                        {joinedDate ? (
                            <span className="flex items-center gap-1">
                                <FiCalendar className="w-4 h-4" />
                                A rejoint la Sphère en {joinedDate}
                            </span>
                        ) : null}
                    </address>

                    <ul className="flex gap-4 text-[0.9375rem] m-0 p-0 list-none mt-1">
                        <li 
                          className="hover:underline cursor-pointer transition" 
                          onClick={() => onShowList?.('following')}
                        >
                            <strong className="text-text-primary">{profile.followingCount ?? 0}</strong> <span className="text-text-secondary">abonnements</span>
                        </li>
                        <li 
                          className="hover:underline cursor-pointer transition" 
                          onClick={() => onShowList?.('followers')}
                        >
                            <strong className="text-text-primary">{profile.followersCount ?? 0}</strong> <span className="text-text-secondary">abonnés</span>
                        </li>
                        {isOwnProfile && (
                            <li 
                              className="hover:underline cursor-pointer transition" 
                              onClick={() => onShowList?.('blocked')}
                            >
                                <strong className="text-text-primary">{profile.blockedCount ?? 0}</strong> <span className="text-text-secondary">bloqués</span>
                            </li>
                        )}
                    </ul>
                </>
            )}
        </section>
    );
}
