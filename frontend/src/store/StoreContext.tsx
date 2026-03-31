import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AppState, StoreContextType } from './types';
import type { User, Post } from '../lib/api';
import { api } from '../lib/api';
import { resetMeResource } from './resources';

const StoreContext = createContext<StoreContextType | null>(null);

const initialState: AppState = {
    currentUser: null,
    posts: [],
    currentProfile: null,
    profilePosts: [],
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>(initialState);

    const login = useCallback((user: User) => {
        resetMeResource();
        setState(prev => ({ ...prev, currentUser: user }));
    }, []);

    const logout = useCallback(() => {
        api.logout();
        resetMeResource();
        setState(prev => ({ ...prev, currentUser: null }));
    }, []);

    const setCurrentUser = useCallback((user: User | null) => {
        setState(prev => ({ ...prev, currentUser: user }));
    }, []);

    const setPosts = useCallback((posts: Post[]) => {
        setState(prev => ({ ...prev, posts }));
    }, []);

    const setCurrentPost = useCallback((post: Post | null) => {
        setState(prev => ({ ...prev, currentPost: post }));
    }, []);

    const addPost = useCallback((post: Post) => {
        setState(prev => ({ ...prev, posts: [post, ...prev.posts] }));
    }, []);

    const deletePost = useCallback((postId: number) => {
        setState(prev => ({
            ...prev,
            posts: prev.posts.filter(p => p.id !== postId),
            profilePosts: prev.profilePosts.filter(p => p.id !== postId),
            currentPost: prev.currentPost?.id === postId ? null : prev.currentPost
        }));
    }, []);

    const setCurrentProfile = useCallback((user: User | null) => {
        setState(prev => ({ ...prev, currentProfile: user }));
    }, []);

    const setProfilePosts = useCallback((posts: Post[]) => {
        setState(prev => ({ ...prev, profilePosts: posts }));
    }, []);

    const toggleLike = useCallback((postId: number, isLiked: boolean, likesCount: number) => {
        const updatePosts = (posts: Post[]) => posts.map(post => {
            if (post.id === postId) {
                return { ...post, isLiked, likesCount };
            }
            return post;
        });

        setState(prev => ({
            ...prev,
            posts: updatePosts(prev.posts),
            profilePosts: updatePosts(prev.profilePosts),
            currentPost: prev.currentPost?.id === postId ? { ...prev.currentPost, isLiked, likesCount } : prev.currentPost
        }));
    }, []);

    const updatePost = useCallback((postId: number, updatedPost: Post) => {
        const update = (posts: Post[]) => posts.map(post => post.id === postId ? updatedPost : post);
        setState(prev => ({
            ...prev,
            posts: update(prev.posts),
            profilePosts: update(prev.profilePosts),
            currentPost: prev.currentPost?.id === postId ? updatedPost : prev.currentPost
        }));
    }, []);

    const addReply = useCallback((parentId: number, reply: Post) => {
        const update = (posts: Post[]) => posts.map(post => {
            if (post.id === parentId) {
                return { ...post, repliesCount: post.repliesCount + 1 };
            }
            return post;
        });

        setState(prev => ({
            ...prev,
            posts: [reply, ...update(prev.posts)],
            profilePosts: reply.user.id === prev.currentUser?.id
                ? [reply, ...update(prev.profilePosts)]
                : update(prev.profilePosts),
            currentPost: prev.currentPost?.id === parentId ? { ...prev.currentPost, repliesCount: prev.currentPost.repliesCount + 1 } : prev.currentPost
        }));
    }, []);

    const toggleFollow = useCallback((username: string, data: { isFollowing: boolean; followersCount: number; followingCount: number }) => {
        setState(prev => {
            const isTargetProfile = prev.currentProfile?.username === username;
            const updatedProfile = isTargetProfile ? { ...prev.currentProfile!, ...data } : prev.currentProfile;

            const updateInPosts = (posts: Post[]) => posts.map(p =>
                p.user.username === username ? { ...p, user: { ...p.user, isFollowing: data.isFollowing } } : p
            );

            return {
                ...prev,
                currentProfile: updatedProfile,
                posts: updateInPosts(prev.posts),
                profilePosts: updateInPosts(prev.profilePosts),
                currentPost: prev.currentPost?.user.username === username ? { ...prev.currentPost, user: { ...prev.currentPost.user, isFollowing: data.isFollowing } } : prev.currentPost
            };
        });
    }, []);

    const toggleBlock = useCallback((username: string, data: { isBlockedByMe: boolean; followersCount: number; followingCount: number }) => {
        setState(prev => {
            const isTargetProfile = prev.currentProfile?.username === username;
            const updatedProfile = isTargetProfile ? { ...prev.currentProfile!, ...data } : prev.currentProfile;

            // When blocking, set isFollowing to false in both directions (client logic)
            const updateInPosts = (posts: Post[]) => posts.map(p =>
                p.user.username === username ? { ...p, user: { ...p.user, isBlockedByMe: data.isBlockedByMe, isFollowing: data.isBlockedByMe ? false : p.user.isFollowing } } : p
            );

            const updateCurrentPost = () => {
                if (!prev.currentPost) return null;
                if (prev.currentPost.user.username === username) {
                    return { ...prev.currentPost, user: { ...prev.currentPost.user, isBlockedByMe: data.isBlockedByMe, isFollowing: data.isBlockedByMe ? false : prev.currentPost.user.isFollowing } };
                }
                return prev.currentPost;
            };

            return {
                ...prev,
                currentProfile: updatedProfile,
                posts: updateInPosts(prev.posts),
                profilePosts: updateInPosts(prev.profilePosts),
                currentPost: updateCurrentPost()
            };
        });
    }, []);

    const value: StoreContextType = {
        ...state,
        login,
        logout,
        setCurrentUser,
        setPosts,
        setCurrentPost,
        addPost,
        deletePost,
        setCurrentProfile,
        setProfilePosts,
        toggleLike,
        updatePost,
        addReply,
        toggleFollow,
        toggleBlock,
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};
