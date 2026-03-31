import { api, type Post } from "../../lib/api";
import { useStore } from "../../store/StoreContext";
import PostComposer from "./PostComposer";
import { useState } from "react";
import { Toast } from "../ui/Toast";

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
}

export default function EditPostModal({ post, onClose }: EditPostModalProps) {
  const { updatePost } = useStore();
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = async (formData: FormData, mediaToRemove: number[]) => {
    mediaToRemove.forEach(id => {
      formData.append('removeMedia[]', id.toString());
    });
    
    const updated = await api.updatePost(post.id, formData);
    updatePost(post.id, updated);
    setShowSuccessToast(true);
    
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center md:items-center p-0 md:p-4 bg-background/60 backdrop-blur-sm md:backdrop-blur-md overflow-hidden hide-scrollbar font-sf-pro">
      <div className="absolute inset-0 -z-10" onClick={onClose} aria-hidden="true" />
      
      <PostComposer
        initialContent={post.content}
        initialMedia={post.media}
        placeholder="Modifier votre post..."
        submitLabel="MODIFIER"
        title="Modifier le post"
        onClose={onClose}
        onSubmit={handleSubmit}
      />

      <Toast 
        isVisible={showSuccessToast} 
        message="Votre post a bien été modifié" 
        onClose={() => setShowSuccessToast(false)} 
        type="success"
      />
    </div>
  );
}
