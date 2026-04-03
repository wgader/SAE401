import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { type PostMedia as PostMediaApi, type User, api, MEDIA_URL } from "../../lib/api";
import { cn } from "../../lib/utils";
import { FiX, FiImage, FiBarChart2, FiGlobe } from "react-icons/fi";
import { useStore } from "../../store/StoreContext";
import { MediaGrid } from "../ui/Media/MediaGrid";
import { Button } from "../ui/Button/Button";
import { IconButton } from "../ui/Button/IconButton";
import { MentionSuggestions } from "./MentionSuggestions";
import { useDebounce } from "../../hooks/useDebounce";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // États pour les mentions
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionDropdownPos, setMentionDropdownPos] = useState({ top: 0, left: 0 });
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);


  const debouncedQuery = useDebounce(mentionQuery, 200);

  const isLoading = externalIsLoading || internalIsLoading;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const MAX_SIZE = 2 * 1024 * 1024;
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

  // Recherche des utilisateurs quand la requête change
  useEffect(() => {
    if (showMentions && debouncedQuery !== undefined) {
      const fetchUsers = async () => {
        try {
          const users = await api.searchUsers(debouncedQuery);
          setSuggestedUsers(users);
        } catch (err) {
          console.error("Erreur recherche utilisateurs:", err);
        }
      };
      fetchUsers();
    }
  }, [debouncedQuery, showMentions]);

  /**
   * Calcule la position ABSOLUE (fixed) sur l'écran pour le dropdown de mentions.
   * On utilise getBoundingClientRect qui donne les coordonnées viewport.
   */
  const updateMentionDropdownPosition = (textarea: HTMLTextAreaElement) => {
    const textareaRect = textarea.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 24;
    const { selectionStart, value } = textarea;
    const textBeforeCursor = value.substring(0, selectionStart);
    const lines = textBeforeCursor.split('\n').length;
    const cursorY = textareaRect.top + (lines * lineHeight) - textarea.scrollTop;
    const cursorX = textareaRect.left;

    setMentionDropdownPos({
      top: cursorY + 4,
      left: cursorX
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const target = e.target;

    // Auto-height
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;

    setContent(value);
    if (error) setError(null);

    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, selectionStart);

    // Detection mention pour bandeau suggestions
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      setShowMentions(true);
      setMentionQuery(mentionMatch[1]);
      updateMentionDropdownPosition(e.target);
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectUser = (user: User) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const { selectionStart, value } = textarea;
    const textBeforeCursor = value.substring(0, selectionStart);
    const textAfterCursor = value.substring(selectionStart);

    const newTextBefore = textBeforeCursor.replace(/@\w*$/, `@${user.username} `);
    const newContent = newTextBefore + textAfterCursor;

    setContent(newContent);
    setShowMentions(false);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = newTextBefore.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleAction = async () => {
    const currentTotalCount = (existingMedia.length - mediaToRemove.length) + mediaFiles.length;
    if (!content.trim() && currentTotalCount === 0) return;
    if (content.length > 280) return;

    setInternalIsLoading(true);
    setError(null);
    try {
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

  // Rendu du dropdown de mentions via un Portal (pour échapper au overflow-hidden du form)
  const mentionPortal = showMentions ? createPortal(
    <div
      style={{
        position: 'fixed',
        top: mentionDropdownPos.top,
        left: mentionDropdownPos.left,
        zIndex: 99999,
      }}
    >
      <MentionSuggestions
        users={suggestedUsers}
        onSelect={handleSelectUser}
        className="shadow-2xl border border-border bg-background"
      />
    </div>,
    document.body
  ) : null;

  return (
    <>
      <form
        onSubmit={(e) => { e.preventDefault(); handleAction(); }}
        className={cn(
          "bg-background w-full flex flex-col transition-all",
          !isInline && "fixed inset-0 z-[100] md:relative md:inset-auto md:h-auto md:max-h-[90vh] md:max-w-xl md:rounded-2xl border border-border shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden",
          isInline && "border-none shadow-none p-0 overflow-visible"
        )}
      >
        {!isInline && (
          <header className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-border/50 md:border-none">
            <IconButton
              type="button"
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-text-primary"
              aria-label="Fermer"
            >
              <FiX className="w-5 h-5" />
            </IconButton>

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
          <figure className="shrink-0 pt-1">
            <img
              src={currentUser?.avatar ? `${AVATAR_BASE_URL}${currentUser.avatar}` : `${AVATAR_BASE_URL}default.png`}
              alt={`Avatar de ${currentUser?.name || 'utilisateur'}`}
              className="w-10 h-10 rounded-full border border-border object-cover bg-surface"
            />
          </figure>

          <section className="flex-1 min-w-0">
            <textarea
              autoFocus
              ref={textareaRef}
              rows={1}
              value={content}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="w-full bg-transparent border-none text-base font-sf-pro text-text-primary placeholder:text-text-secondary focus:ring-0 focus:outline-none focus-visible:outline-none resize-none min-h-[7.5rem] p-0 mt-1 hide-scrollbar shadow-none"
            />

            {error && (
              <p role="alert" className="text-sm text-danger font-sf-pro mt-2">
                {error}
              </p>
            )}

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
          <section className="pl-4 pb-2 shrink-0">
            <p className="text-primary text-sm font-medium flex items-center gap-2 justify-start cursor-default hover:bg-primary/5 w-fit py-1 px-2 -ml-2 rounded-full transition">
              <FiGlobe className="w-4 h-4" />
              Tout le monde peut répondre
            </p>
          </section>
        )}

        <footer className={cn(
          "px-4 py-3 border-t border-border/50 flex items-center justify-between shrink-0 bg-background",
          isInline && "px-0 pb-0 border-t-0"
        )}>
          <nav className="flex items-center gap-1 text-primary">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <IconButton
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={(existingMedia.length - mediaToRemove.length + mediaFiles.length) >= 4}
              variant="soft"
              size="sm"
              aria-label="Ajouter des médias"
            >
              <FiImage className="w-5 h-5" />
            </IconButton>
            <IconButton 
                type="button" 
                variant="soft" 
                size="sm" 
                aria-label="Ajouter un sondage"
            >
                <FiBarChart2 className="w-5 h-5" />
            </IconButton>
          </nav>

          <section className="flex items-center gap-3">
            <small className={cn(
              "text-sm font-medium transition-colors font-sf-pro",
              isOverLimit ? "text-danger" : "text-text-secondary"
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
                  className={cn("transition-all duration-300", isOverLimit ? "text-danger" : "text-primary shadow-[0_0_8px_rgba(166,253,122,0.4)]")}
                />
              </svg>
            </div>

            <Button
              onClick={handleAction}
              disabled={(!content.trim() && (existingMedia.length - mediaToRemove.length + mediaFiles.length) === 0) || isOverLimit || isLoading}
              className={cn(
                "px-6 py-2 h-auto min-h-0",
                (!isOverLimit && (content.trim() || (existingMedia.length - mediaToRemove.length + mediaFiles.length) > 0)) ? "" : "bg-text-primary text-background shadow-none"
              )}
            >
              {isLoading ? "..." : submitLabel}
            </Button>
          </section>
        </footer>
      </form>

      {/* Le portal rend le dropdown de mentions HORS du form, directement dans le body */}
      {mentionPortal}
    </>
  );
}
