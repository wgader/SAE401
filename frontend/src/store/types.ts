import type { User, Post } from '../lib/api';

export interface AppState {
    currentUser: User | null;
    posts: Post[];
    currentPost: Post | null;
    currentProfile: User | null;
    profilePosts: Post[];
}

export interface StoreActions {
    login: (user: User) => void;
    logout: () => void;
    setCurrentUser: (user: User | null) => void;
    setPosts: (posts: Post[]) => void;
    setCurrentPost: (post: Post | null) => void;
    addPost: (post: Post) => void;
    deletePost: (postId: number) => void;
    setCurrentProfile: (user: User | null) => void;
    setProfilePosts: (posts: Post[]) => void;
    toggleLike: (postId: number, isLiked: boolean, likesCount: number) => void;
    updatePost: (postId: number, updatedPost: Post) => void;
    addReply: (parentId: number, reply: Post) => void;
    toggleFollow: (username: string, data: { isFollowing: boolean; followersCount: number; followingCount: number }) => void;
    toggleBlock: (username: string, data: { isBlockedByMe: boolean; followersCount: number; followingCount: number }) => void;
}

export type StoreContextType = AppState & StoreActions;
