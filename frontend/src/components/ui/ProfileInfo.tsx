import React from 'react';
import { FiMapPin, FiLink, FiCalendar, FiSlash } from 'react-icons/fi';
import type { User } from '../../lib/api';

interface ProfileInfoProps {
    profile: User;
    joinedDate: string;
}

export default function ProfileInfo({ profile, joinedDate }: ProfileInfoProps) {
    return (
        <section className="mt-2 text-text-primary px-4 md:px-6 flex flex-col gap-3">
            <hgroup className="flex flex-col">
                <h2 className="text-xl font-extrabold text-text-primary leading-tight m-0">
                    {profile.isBlocked ? 'Compte Suspendu' : profile.name}
                </h2>
                <p className="text-text-secondary m-0">@{profile.username}</p>
            </hgroup>

            {profile.isBlocked ? (
                <div className="flex flex-col gap-6 py-4">
                    <div className="flex flex-col gap-2 opacity-10">
                        <div className="h-4 w-full bg-text-tertiary rounded-full" />
                        <div className="h-4 w-5/6 bg-text-tertiary rounded-full" />
                        <div className="h-4 w-4/6 bg-text-tertiary rounded-full" />
                    </div>
                    <p className="text-red-500 font-black italic text-lg tracking-tight uppercase flex items-center gap-2">
                        <FiSlash className="w-5 h-5" />
                        Profil Neutralisé par la Sphère
                    </p>
                    <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
                        Ce sujet a été extrait de la Sphère pour avoir dérogé de manière critique aux protocoles de communication.
                        Toutes ses transmissions ont été révoquées.
                    </p>
                </div>
            ) : (
                <>
                    {profile.bio && (
                        <p className="text-text-primary text-[15px] whitespace-pre-wrap">{profile.bio}</p>
                    )}

                    <address className="flex flex-wrap gap-x-4 gap-y-2 text-text-secondary text-[15px] mb-2 not-italic">
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
                        <span className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            A rejoint en {joinedDate}
                        </span>
                    </address>

                    <ul className="flex gap-4 text-[15px] m-0 p-0 list-none mt-1">
                        <li>
                            <strong className="text-text-primary">{profile.followingCount ?? 0}</strong> <span className="text-text-secondary">abonnements</span>
                        </li>
                        <li>
                            <strong className="text-text-primary">{profile.followersCount ?? 0}</strong> <span className="text-text-secondary">abonnés</span>
                        </li>
                    </ul>
                </>
            )}
        </section>
    );
}
