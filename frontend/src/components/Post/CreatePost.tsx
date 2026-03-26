import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, BASE_URL } from "../../lib/api";
import { cn } from "../../lib/utils";
import { TweetInput } from "../ui/Input/TweetInput";
import { FiX, FiImage, FiBarChart2, FiGlobe } from "react-icons/fi";
import { useStore } from "../../store/StoreContext";

const AVATAR_BASE_URL = `${BASE_URL}/uploads/avatars/`;

export default function CreatePost() {
  const [content, setContent] = useState("");
  const { currentUser } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const handlePublish = async () => {
    if (!content.trim() || content.length > 280) return;

    setIsLoading(true);
    setError(null);
    try {
      await api.createPost(content);
      navigate("/home");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la publication");
      setIsLoading(false);
    }
  };

  const charCount = content.length;
  const isOverLimit = charCount > 280;
  const percentage = Math.min((charCount / 280) * 100, 100);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center md:items-center p-0 md:p-4 bg-background/60 backdrop-blur-md overflow-hidden hide-scrollbar font-sf-pro">

      <div
        className="absolute inset-0 -z-10"
        onClick={() => navigate(-1)}
        aria-hidden="true"
      />

      <article className={cn(
        "bg-background w-full h-full md:h-auto md:max-h-[90vh] md:max-w-xl md:rounded-2xl border border-border flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 hide-scrollbar"
      )}>

        <header className="flex items-center justify-between px-4 h-14 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-surface-hover rounded-full transition text-text-primary focus:outline-none"
            aria-label="Fermer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </header>


        <main className="flex-1 px-4 py-2 flex gap-3 overflow-y-auto hide-scrollbar">
          <figure className="shrink-0">
            <img
              src={currentUser?.avatar ? `${AVATAR_BASE_URL}${currentUser.avatar}` : `${AVATAR_BASE_URL}default.png`}
              alt={`Avatar de ${currentUser?.name || 'utilisateur'}`}
              className="w-10 h-10 rounded-full border border-border object-cover bg-surface"
            />
          </figure>

          <section className="flex-1 min-w-0">
            <TweetInput
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Quoi de neuf ?"
              error={error || undefined}
              className="mt-1"
            />
          </section>
        </main>

        <section className="pl-4 pb-2 shrink-0">
          <p className="text-primary text-[0.875rem] font-medium flex items-center gap-2 justify-start cursor-default hover:bg-primary/5 w-fit py-1 px-2 -ml-2 rounded-full transition">
            <FiGlobe className="w-4 h-4" />
            Tout le monde peut répondre
          </p>
        </section>

        <footer className="px-4 py-3 border-t border-border/50 flex items-center justify-between shrink-0 bg-background">
          <nav className="flex items-center gap-1 text-primary">
            <button type="button" className="p-2 hover:bg-primary/10 rounded-full transition focus:outline-none" aria-label="Ajouter une image"><FiImage className="w-5 h-5" /></button>
            <button type="button" className="p-2 hover:bg-primary/10 rounded-full transition focus:outline-none" aria-label="Ajouter un sondage"><FiBarChart2 className="w-5 h-5" /></button>
          </nav>

          <section className="flex items-center gap-3">
            <span className={cn(
              "text-[0.8125rem] font-medium transition-colors font-sf-pro",
              isOverLimit ? "text-red-500" : "text-text-secondary"
            )}>
              {charCount}/280
            </span>

            {/* Circle progress container */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="11"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  className="text-border"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="11"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 11}
                  strokeDashoffset={2 * Math.PI * 11 * (1 - percentage / 100)}
                  className={cn(
                    "transition-all duration-300",
                    isOverLimit ? "text-red-500" : "text-primary shadow-[0_0_8px_rgba(166,253,122,0.4)]"
                  )}
                />
              </svg>
            </div>

            <button
              onClick={handlePublish}
              disabled={!content.trim() || isOverLimit || isLoading}
              className={cn(
                "bg-text-primary text-background font-druk font-bold px-6 py-2 rounded-full transition hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-tight shadow-lg",
                !isOverLimit && content.trim() && "bg-[image:var(--color-linear-gradient)] shadow-primary/20"
              )}
            >
              {isLoading ? "..." : "POSTER"}
            </button>
          </section>
        </footer>
      </article>
    </div>

  );
}
