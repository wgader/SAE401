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

    const addPost = useCallback((post: Post) => {
        setState(prev => ({ ...prev, posts: [post, ...prev.posts] }));
    }, []);

    const deletePost = useCallback((postId: number) => {
        setState(prev => ({
            ...prev,
            posts: prev.posts.filter(p => p.id !== postId),
            profilePosts: prev.profilePosts.filter(p => p.id !== postId)
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
            profilePosts: updatePosts(prev.profilePosts)
        }));
    }, []);

    const value: StoreContextType = {
        ...state,
        login,
        logout,
        setCurrentUser,
        setPosts,
        addPost,
        deletePost,
        setCurrentProfile,
        setProfilePosts,
        toggleLike,
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
