import type { User, Post } from '../lib/api';

export interface AppState {
    currentUser: User | null;
    posts: Post[];
    currentProfile: User | null;
    profilePosts: Post[];
}

export interface StoreActions {
    login: (user: User) => void;
    logout: () => void;
    setCurrentUser: (user: User | null) => void;
    setPosts: (posts: Post[]) => void;
    addPost: (post: Post) => void;
    deletePost: (postId: number) => void;
    setCurrentProfile: (user: User | null) => void;
    setProfilePosts: (posts: Post[]) => void;
    toggleLike: (postId: number, isLiked: boolean, likesCount: number) => void;
}

export type StoreContextType = AppState & StoreActions;
