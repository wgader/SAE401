import { useState, useRef } from "react";
import { MEDIA_URL, type PostMedia as PostMediaApi } from "../../lib/api";
import { cn } from "../../lib/utils";
import { TweetInput } from "../ui/Input/TweetInput";
import { FiX, FiImage, FiBarChart2, FiGlobe } from "react-icons/fi";
import { useStore } from "../../store/StoreContext";
import { MediaGrid } from "../ui/MediaGrid";

import { Button } from "../ui/Button/Button";
const AVATAR_BASE_URL = `${MEDIA_URL}/uploads/avatars/`;
const POST_MEDIA_BASE_URL = `${MEDIA_URL}/uploads/posts/`;

interface PostComposerProps {
  initialContent?: string;
  initialMedia?: PostMediaApi[];
  placeholder?: string;
  submitLabel: string;
  title?: string;
  onClose: () => void;
  onSubmit: (formData: FormData, mediaToRemove: number[]) => Promise<void>;
  isLoading?: boolean;
  parentId?: number;
  isInline?: boolean;
}

export default function PostComposer({
  initialContent = "",
  initialMedia = [],
  placeholder = "Quoi de neuf ?",
  submitLabel = "POSTER",
  title,
  onClose,
  onSubmit,
  isLoading: externalIsLoading = false,
  parentId,
  isInline = false
}: PostComposerProps) {
  const [content, setContent] = useState(initialContent);
  const [existingMedia] = useState<PostMediaApi[]>(initialMedia);
  const [mediaToRemove, setMediaToRemove] = useState<number[]>([]);

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<{ url: string; type: 'image' | 'video' }[]>([]);

  const { currentUser } = useStore();
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = externalIsLoading || internalIsLoading;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const MAX_SIZE = 2 * 1024 * 1024; // 2Mo par défaut car MMI limite à 2Mo
    const oversizedFiles = files.filter(file => file.size > MAX_SIZE);
    if (oversizedFiles.length > 0) {
      setError("Le fichier dépasse la limite du serveur (2Mo).");
      return;
    }

    const currentTotalCount = (existingMedia.length - mediaToRemove.length) + mediaFiles.length;
    const remainingSlots = 4 - currentTotalCount;
    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      setError("Maximum 4 médias autorisés.");
    }

    const newFiles = [...mediaFiles, ...filesToAdd];
    const newPreviews = filesToAdd.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image' as 'image' | 'video'
    }));

    setMediaFiles(newFiles);
    setMediaPreviews([...mediaPreviews, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index: number) => {
    setError(null);
    const visibleExistingCount = existingMedia.length - mediaToRemove.length;

    if (index < visibleExistingCount) {
      const visibleExisting = existingMedia.filter(m => !mediaToRemove.includes(m.id));
      const mediaId = visibleExisting[index].id;
      setMediaToRemove(prev => [...prev, mediaId]);
    } else {
      const newIndex = index - visibleExistingCount;
      const newFiles = [...mediaFiles];
      const newPreviews = [...mediaPreviews];

      URL.revokeObjectURL(newPreviews[newIndex].url);
      newFiles.splice(newIndex, 1);
      newPreviews.splice(newIndex, 1);

      setMediaFiles(newFiles);
      setMediaPreviews(newPreviews);
    }
  };

  const handleAction = async () => {
    const currentTotalCount = (existingMedia.length - mediaToRemove.length) + mediaFiles.length;
    if (!content.trim() && currentTotalCount === 0) return;
    if (content.length > 280) return;

    setInternalIsLoading(true);
    setError(null);
    try {
      // Nettoyage des retours à la ligne excessifs (max 2 consécutifs)
      const sanitizedContent = content.trim().replace(/\n{3,}/g, '\n\n');

      const formData = new FormData();
      formData.append('content', sanitizedContent);

      if (parentId) {
        formData.append('parentId', parentId.toString());
      }

      mediaFiles.forEach(file => {
        formData.append('media[]', file);
      });

      await onSubmit(formData, mediaToRemove);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la publication.");
    } finally {
      setInternalIsLoading(false);
    }
  };

  const charCount = content.length;
  const isOverLimit = charCount > 280;
  const percentage = Math.min((charCount / 280) * 100, 100);

  const visibleExistingPreviews = existingMedia
    .filter(m => !mediaToRemove.includes(m.id))
    .map(m => ({ url: `${POST_MEDIA_BASE_URL}${m.url}`, type: m.type }));

  const allPreviews = [...visibleExistingPreviews, ...mediaPreviews];

  return (
    <form 
      onSubmit={(e) => { e.preventDefault(); handleAction(); }}
      className={cn(
        "bg-background w-full flex flex-col overflow-hidden hide-scrollbar transition-all",
        !isInline && "fixed inset-0 z-[100] md:relative md:inset-auto md:h-auto md:max-h-[90vh] md:max-w-xl md:rounded-2xl border border-border shadow-2xl animate-in fade-in zoom-in duration-200",
        isInline && "border-none shadow-none p-0"
      )}
    >
      {!isInline && (
        <header className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-border/50 md:border-none">
          <button
            onClick={onClose}
            className="p-[0.5rem] hover:bg-surface-hover rounded-full transition text-text-primary focus:outline-none"
            aria-label="Fermer"
          >
            <FiX className="w-[1.25rem] h-[1.25rem]" />
          </button>

          {title && (
            <h2 className="text-lg font-bold text-text-primary absolute left-1/2 -translate-x-1/2 pointer-events-none">
              {title}
            </h2>
          )}
        </header>
      )}

      <main className={cn(
        "flex-1 px-4 py-2 flex gap-3 overflow-y-auto hide-scrollbar",
        isInline && "px-0"
      )}>
        <figure className="shrink-0 pt-[0.25rem]">
          <img
            src={currentUser?.avatar ? `${AVATAR_BASE_URL}${currentUser.avatar}` : `${AVATAR_BASE_URL}default.png`}
            alt={`Avatar de ${currentUser?.name || 'utilisateur'}`}
            className="w-[2.5rem] h-[2.5rem] rounded-full border border-border object-cover bg-surface"
          />
        </figure>

        <section className="flex-1 min-w-0">
          <TweetInput
            autoFocus
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            error={error || undefined}
            className="mt-1"
          />

          {allPreviews.length > 0 && (
            <MediaGrid
              media={allPreviews}
              isEditable
              onRemove={removeMedia}
              className="mb-4"
            />
          )}
        </section>
      </main>

      {!isInline && (
        <section className="pl-[1rem] pb-[0.5rem] shrink-0">
          <p className="text-primary text-[0.875rem] font-medium flex items-center gap-[0.5rem] justify-start cursor-default hover:bg-primary/5 w-fit py-[0.25rem] px-[0.5rem] -ml-[0.5rem] rounded-full transition">
            <FiGlobe className="w-[1rem] h-[1rem]" />
            Tout le monde peut répondre
          </p>
        </section>
      )}

      <footer className={cn(
        "px-4 py-3 border-t border-border/50 flex items-center justify-between shrink-0 bg-background",
        isInline && "px-0 pb-0 border-t-0"
      )}>
        <nav className="flex items-center gap-[0.25rem] text-primary">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={(existingMedia.length - mediaToRemove.length + mediaFiles.length) >= 4}
            className="p-[0.5rem] hover:bg-primary/10 rounded-full transition focus:outline-none disabled:opacity-30"
            aria-label="Ajouter des médias"
          >
            <FiImage className="w-[1.25rem] h-[1.25rem]" />
          </button>
          <button type="button" className="p-[0.5rem] hover:bg-primary/10 rounded-full transition focus:outline-none" aria-label="Ajouter un sondage"><FiBarChart2 className="w-[1.25rem] h-[1.25rem]" /></button>
        </nav>

        <section className="flex items-center gap-[0.75rem]">
          <small className={cn(
            "text-[0.8125rem] font-medium transition-colors font-sf-pro",
            isOverLimit ? "text-red-500" : "text-text-secondary"
          )}>
            {charCount}/280
          </small>

          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-border" />
              <circle
                cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="2" fill="transparent"
                strokeDasharray={2 * Math.PI * 11}
                strokeDashoffset={2 * Math.PI * 11 * (1 - percentage / 100)}
                className={cn("transition-all duration-300", isOverLimit ? "text-red-500" : "text-primary shadow-[0_0_8px_rgba(166,253,122,0.4)]")}
              />
            </svg>
          </div>

          <Button
            onClick={handleAction}
            disabled={(!content.trim() && (existingMedia.length - mediaToRemove.length + mediaFiles.length) === 0) || isOverLimit || isLoading}
            className={cn(
              "px-[1.5rem] py-[0.5rem] h-auto min-h-0",
              (!isOverLimit && (content.trim() || (existingMedia.length - mediaToRemove.length + mediaFiles.length) > 0)) ? "" : "bg-text-primary text-background shadow-none"
            )}
          >
            {isLoading ? "..." : submitLabel}
          </Button>
        </section>
      </footer>
    </form>
  );
}
