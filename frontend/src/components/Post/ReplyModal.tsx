import PostComposer from "./PostComposer";
import { api, MEDIA_URL as BASE_URL } from "../../lib/api";
import type { Post } from "../../lib/api";
import { useStore } from "../../store/StoreContext";

const DEFAULT_AVATAR = `${BASE_URL}/uploads/avatars/default.png`;

interface ReplyModalProps {
  parentPost: Post;
  onClose: () => void;
}

export default function ReplyModal({ parentPost, onClose }: ReplyModalProps) {
  const { addReply } = useStore();

  const handleSubmit = async (formData: FormData) => {
    try {
      const newReply = await api.createPost(formData);
      addReply(parentPost.id, newReply);
      onClose();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  return (
    <aside 
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-[2px]" 
      onClick={onClose}
      role="dialog"
      aria-labelledby="reply-modal-title"
    >
      <article className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        <PostComposer
          title="Répondre"
          placeholder="Postez votre réponse"
          submitLabel="REPONDRE"
          onSubmit={handleSubmit}
          onClose={onClose}
          parentId={parentPost.id}
        />
        
        {/* Visual context of the post we're replying to */}
        <section className="hidden md:block absolute left-1/2 -translate-x-1/2 bottom-full mb-4 w-full max-w-xl bg-background border border-border rounded-2xl p-4 shadow-xl animate-in slide-in-from-bottom-4 duration-300">
          <header className="flex gap-3">
            <figure className="shrink-0">
              <img
                src={parentPost.user.avatar ? `${BASE_URL}/uploads/avatars/${parentPost.user.avatar}` : DEFAULT_AVATAR}
                className="w-10 h-10 rounded-full object-cover border border-border"
                alt={`Avatar de ${parentPost.user.name}`}
              />
            </figure>
            <div className="flex-1 min-w-0">
              <hgroup className="flex items-center gap-1">
                <strong className="text-text-primary text-[0.875rem]">{parentPost.user.name}</strong>
                <span className="text-text-secondary text-[0.875rem]">@{parentPost.user.username}</span>
              </hgroup>
              <p className="text-text-primary text-[0.875rem] mt-1 line-clamp-2">{parentPost.content}</p>
              <footer className="mt-2">
                <p className="text-text-secondary text-[0.875rem]">
                  En réponse à <strong className="text-primary hover:underline">@{parentPost.user.username}</strong>
                </p>
              </footer>
            </div>
          </header>
        </section>
      </article>
    </aside>
  );
}
