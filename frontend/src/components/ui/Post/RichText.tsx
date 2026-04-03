import React from 'react';
import { Link } from 'react-router-dom';

interface RichTextProps {
  text: string;
  className?: string;
}

/**
 * Composant pour rendre le texte avec des hashtags (#) et des mentions (@) cliquables.
 * Utilise la couleur primaire pour les éléments identifiés.
 */
export const RichText: React.FC<RichTextProps> = ({ text, className = "" }) => {
  // Regex pour capturer les mentions (@user) et les hashtags (#tag)
  // On utilise des groupes de capture pour garder les délimiteurs
  const parts = text.split(/(@\w+|#\w+)/g);

  return (
    <p className={`whitespace-pre-wrap break-words ${className}`}>
      {parts.map((part, index) => {
        // Gestion des mentions
        if (part.startsWith('@')) {
          const username = part.slice(1);
          return (
            <Link
              key={index}
              to={`/profile/${username}`}
              className="text-primary hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }

        // Gestion des hashtags
        if (part.startsWith('#')) {
          const hashtag = part.slice(1);
          return (
            <Link
              key={index}
              to={`/hashtag/${hashtag}`}
              className="text-primary hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }

        // Texte normal
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
};
