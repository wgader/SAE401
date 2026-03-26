import { api } from '../lib/api';
import { createResource } from './createResource';

let realMeResource = createResource(api.isAuthenticated() ? api.getMe() : Promise.resolve(null));

export const getMeResource = () => realMeResource;

export const resetMeResource = () => {
    realMeResource = createResource(api.isAuthenticated() ? api.getMe() : Promise.resolve(null));
};

export const createPostsResource = (feed: 'for-you' | 'following' = 'for-you') => createResource(api.getPosts(feed));
export const createProfileResource = (username: string) => createResource(api.getUser(username));
export const createProfilePostsResource = (username: string) => createResource(api.getUserPosts(username));
