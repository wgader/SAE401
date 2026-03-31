import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useStore } from "../../store/StoreContext";
import PostComposer from "./PostComposer";

export default function CreatePost() {
  const { addPost } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (formData: FormData) => {
    const created = await api.createPost(formData);
    addPost(created);
    navigate("/home", { state: { postCreated: true } });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center md:items-center p-0 md:p-4 bg-background/60 backdrop-blur-sm md:backdrop-blur-md overflow-hidden hide-scrollbar font-sf-pro">
      <div className="absolute inset-0 -z-10" onClick={() => navigate(-1)} aria-hidden="true" />
      
      <PostComposer
        onClose={() => navigate(-1)}
        onSubmit={handleSubmit}
        placeholder="Quoi de neuf ?"
        submitLabel="POSTER"
      />
    </div>
  );
}
