import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { MEDIA_URL as BASE_URL, type User } from '../../../lib/api';

const AVATAR_BASE_URL = `${BASE_URL}/uploads/avatars/`;

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (value: string) => void;
    onClear: () => void;
    suggestions?: User[];
    placeholder?: string;
    className?: string;
}

export default function SearchBar({ value, onChange, onSearch, onClear, suggestions = [], placeholder = "Rechercher...", className }: SearchBarProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onSearch(value.trim());
            setShowSuggestions(false);
        }
    };

    return (
        <aside className={cn("relative z-40", className)} ref={searchRef}>
            <form onSubmit={handleSubmit} className="relative group">
                <FiSearch className={cn(
                    "absolute left-[1rem] top-1/2 -translate-y-1/2 transition-colors duration-200",
                    value ? "text-primary" : "text-text-secondary"
                )} />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => value.length > 0 && setShowSuggestions(true)}
                    className="w-full bg-surface-hover border-none rounded-full py-[0.625rem] pl-[3rem] pr-[3rem] focus:ring-2 focus:ring-primary/50 text-text-primary text-[0.9375rem] placeholder:text-text-secondary transition-all"
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => {
                            onClear();
                            setShowSuggestions(false);
                        }}
                        className="absolute right-[1rem] top-1/2 -translate-y-1/2 p-[0.25rem] rounded-full bg-primary hover:bg-primary-hover transition text-background"
                    >
                        <FiX size={14} />
                    </button>
                )}
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || value) && (
                <nav className="absolute top-full mt-[0.5rem] w-full bg-background border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50">
                    <ul className="list-none m-0 p-0">
                        <li
                            onClick={() => {
                                onSearch(value);
                                setShowSuggestions(false);
                            }}
                            className="px-[1rem] py-[0.75rem] hover:bg-surface-hover cursor-pointer border-b border-border flex items-center gap-[0.75rem] group"
                        >
                            <FiSearch className="text-text-secondary group-hover:text-primary" />
                            <strong className="text-text-primary font-medium italic">Chercher "{value}"</strong>
                        </li>

                        {suggestions.map(user => (
                            <li
                                key={user.id}
                                onClick={() => {
                                    navigate(`/profile/${user.username}`);
                                    setShowSuggestions(false);
                                }}
                                className="px-[1rem] py-[0.75rem] hover:bg-surface-hover cursor-pointer flex items-center gap-[0.75rem] transition-colors"
                            >
                                <img
                                    src={user.avatar ? `${AVATAR_BASE_URL}${user.avatar}` : '/default-avatar.png'}
                                    alt={user.username}
                                    className="w-[2.5rem] h-[2.5rem] rounded-full border border-border"
                                />
                                <hgroup className="flex flex-col min-w-0">
                                    <strong className="font-bold text-text-primary text-[0.9375rem] truncate block">{user.name}</strong>
                                    <p className="text-text-secondary text-[0.875rem] truncate m-0">@{user.username}</p>
                                </hgroup>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </aside>
    );
}
