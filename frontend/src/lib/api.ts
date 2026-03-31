const API_URL = import.meta.env.VITE_API_URL || "";
export const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || (API_URL ? API_URL.replace(/\/api\/?$/, "") : "");
export const BASE_URL = MEDIA_URL;

export interface User {
  id: number;
  username: string;
  name: string;
  email?: string;
  avatar: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string;
  banner?: string;
  isVerified?: boolean;
  isBlocked?: boolean; // Admin suspension
  isBlockedByMe?: boolean; // User-to-user blocking
  hasBlockedMe?: boolean;
  createdAt?: string;
  isFollowing?: boolean;
  isFollower?: boolean;
  followersCount?: number;
  followingCount?: number;
  blockedCount?: number;
}

export interface AuthResponse {
  status: string;
  message: string;
  token: string;
  user: User;
}

export interface PostMedia {
  id: number;
  url: string;
  type: 'image' | 'video';
}

export interface Post {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    name: string;
    avatar: string;
    isBlocked: boolean; // Admin suspension
    isBlockedByMe?: boolean;
    hasBlockedMe?: boolean;
    isFollowing?: boolean;
  };
  likesCount: number;
  isLiked: boolean;
  repliesCount: number;
  parentId?: number;
  media?: PostMedia[];
  isCensored: boolean;
}

const getHeaders = () => {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Accept": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      const isSuspended = data.message?.toLowerCase().includes("suspendu") ||
        data.message?.toLowerCase().includes("enfreint") ||
        data.message?.toLowerCase().includes("désactivé");

      if (response.status === 401 || isSuspended) {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event('auth-changed'));
        window.dispatchEvent(new CustomEvent('user-blocked', {
          detail: { message: data.message || "Ce compte est suspendu par l'administrateur." }
        }));
      }
      throw new Error(data.message || "Accès refusé");
    }

    if (!response.ok) {
      const error = new Error(data.message || "Une erreur est survenue") as any;
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (err: any) {
    console.error(`API Error (${path}):`, err);
    throw err;
  }
}

export const api = {

  async login(credentials: Record<string, string>): Promise<AuthResponse> {
    const formData = new FormData();
    Object.entries(credentials).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const data = await request<AuthResponse>('/login', {
      method: "POST",
      body: formData,
    });

    localStorage.setItem("token", data.token);
    window.dispatchEvent(new Event('auth-changed'));
    return data;
  },

  async register(userData: FormData): Promise<any> {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: userData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de l'inscription");
    }

    return data;
  },

  async getMe(): Promise<User> {
    return request<User>('/me');
  },

  async updateProfile(formData: FormData): Promise<User> {
    return request<User>('/me/update', {
      method: 'POST',
      body: formData,
    });
  },

  async getUser(username: string): Promise<User> {
    return request<User>(`/users/${username}`);
  },

  async getUserPosts(username: string): Promise<Post[]> {
    return request<Post[]>(`/users/${username}/posts`);
  },

  logout() {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event('auth-changed'));
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },

  async verifyCode(email: string, code: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/verify-code', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    if (data.token) {
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event('auth-changed'));
    }
    return data;
  },

  async checkAvailability(params: { username?: string; email?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params.username) queryParams.append("username", params.username);
    if (params.email) queryParams.append("email", params.email);
    return request<any>(`/check-availability?${queryParams.toString()}`);
  },

  async resendCode(email: string): Promise<any> {
    return request<any>('/resend-code', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  },

  async getPosts(feed: 'for-you' | 'following' = 'for-you'): Promise<Post[]> {
    const path = feed === 'following' ? '/posts?feed=following' : '/posts';
    return request<Post[]>(path);
  },

  async createPost(formData: FormData): Promise<Post> {
    return request<Post>('/posts', {
      method: 'POST',
      body: formData,
    });
  },

  async likePost(postId: number): Promise<{ likesCount: number; isLiked: boolean }> {
    return request<{ likesCount: number; isLiked: boolean }>(`/posts/${postId}/like`, {
      method: 'POST',
    });
  },

  async unlikePost(postId: number): Promise<{ likesCount: number; isLiked: boolean }> {
    return request<{ likesCount: number; isLiked: boolean }>(`/posts/${postId}/like`, {
      method: 'DELETE',
    });
  },

  async toggleFollow(username: string): Promise<{ isFollowing: boolean; followersCount: number; followingCount: number }> {
    return request<{ isFollowing: boolean; followersCount: number; followingCount: number }>(`/users/${username}/follow`, {
      method: 'POST',
    });
  },

  async blockUser(username: string): Promise<{ isBlockedByMe: boolean; followersCount: number; followingCount: number }> {
    return request<{ isBlockedByMe: boolean; followersCount: number; followingCount: number }>(`/users/${username}/block`, {
      method: 'POST',
    });
  },

  async getBlockedUsers(): Promise<User[]> {
    return request<User[]>('/me/blocked');
  },

  async getFollowers(username: string): Promise<User[]> {
    return request<User[]>(`/users/${username}/followers`);
  },

  async getFollowing(username: string): Promise<User[]> {
    return request<User[]>(`/users/${username}/following`);
  },

  async deletePost(postId: number): Promise<any> {
    return request<any>(`/posts/${postId}`, {
      method: "DELETE",
    });
  },

  async updatePost(postId: number, formData: FormData): Promise<Post> {
    return request<Post>(`/posts/${postId}`, {
      method: 'POST',
      body: formData,
    });
  },

  async getPostReplies(postId: number): Promise<Post[]> {
    return request<Post[]>(`/posts/${postId}/replies`);
  },

  async getPost(postId: number): Promise<Post> {
    return request<Post>(`/posts/${postId}`);
  }
};
