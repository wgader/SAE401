import { useState, useEffect } from "react";
import TweetCard from "../ui/TweetCard";
import { api } from "../../lib/api";
import type { Post } from "../../lib/api";

const AVATAR_BASE_URL = "http://localhost:8080/uploads/avatars/";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    try {
      const data = await api.getPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <main className="w-full max-w-2xl border-x border-border min-h-screen bg-background flex flex-col pt-[56px] md:pt-0">
      <header className="sr-only">
        <h1>Fil d'actualité Sphere</h1>
      </header>

      <section className="flex flex-col">
        <ul className="flex flex-col">
          {posts.map((post) => (
            <li key={post.id}>
              <TweetCard
                authorName={post.user.name}
                username={post.user.username}
                timeAgo={post.createdAt}
                content={post.content}
                avatarUrl={`${AVATAR_BASE_URL}${post.user.avatar}`}
              />
            </li>
          ))}
          {posts.length === 0 && (
            <li className="flex flex-col items-center justify-center p-20 text-center">
              <p className="text-text-secondary font-sf-pro text-lg">Il n'y a pas encore de posts. Soyez le premier à en publier un !</p>
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
