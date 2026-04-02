import React from 'react';
import type { User } from '../../lib/api';
import { MEDIA_URL } from '../../lib/api';
import { cn } from '../../lib/utils';

interface MentionSuggestionsProps {
  users: User[];
  onSelect: (user: User) => void;
  isLoading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const AVATAR_BASE_URL = `${MEDIA_URL}/uploads/avatars/`;

/**
 * Composant de bandeau flottant pour les suggestions de mentions.
 * Affiche jusqu'à 4 utilisateurs avec un scroll personnalisé.
 */
export const MentionSuggestions: React.FC<MentionSuggestionsProps> = ({ 
  users, 
  onSelect, 
  isLoading = false,
  className = "",
  style
}) => {
  // On ne retourne plus null si users est vide afin de montrer l'état "Aucun résultat"
  // sauf si on ne veut rien afficher du tout (ex: initialement)

  return (
    <article 
      className={cn(
        "bg-background border border-border rounded-xl shadow-2xl overflow-hidden z-[200] w-64 animate-in fade-in zoom-in duration-150",
        className
      )}
      style={style}
    >
      <header className="px-3 py-2 border-b border-border bg-surface/30">
        <h4 className="text-[0.875rem] font-bold text-text-secondary uppercase tracking-wider m-0">
          {isLoading ? "Recherche..." : "Suggestions"}
        </h4>
      </header>
      
      {isLoading ? (
        <div className="p-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-surface shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="h-3 bg-surface rounded-full w-24" />
                <div className="h-2.5 bg-surface rounded-full w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length > 0 ? (
        <ul className="m-0 p-0 list-none max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40 scrollbar-track-transparent">
          {users.map((user) => (
            <li key={user.id} className="list-none">
              <button
                type="button"
                onClick={() => onSelect(user)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-hover transition-colors text-left group focus:outline-none focus:bg-surface-hover"
              >
                <figure className="shrink-0">
                  <img
                    src={user.avatar ? `${AVATAR_BASE_URL}${user.avatar}` : `${AVATAR_BASE_URL}default.png`}
                    alt={`Avatar de ${user.name}`}
                    className="w-9 h-9 rounded-full border border-border object-cover bg-surface"
                  />
                </figure>
                <div className="flex flex-col min-w-0">
                  <strong className="text-[0.875rem] font-bold text-text-primary truncate m-0 group-hover:text-primary transition-colors">
                    {user.name}
                  </strong>
                  <span className="text-[0.875rem] text-text-secondary truncate">
                    @{user.username}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-3 py-4 text-center text-[0.875rem] text-text-secondary font-sf-pro">
          Aucun utilisateur trouvé.
        </div>
      )}
    </article>
  );
};
