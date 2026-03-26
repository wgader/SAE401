const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
export const BASE_URL = API_URL.replace(/\/api\/?$/, "");

export interface User {
  id: number;
  username: string;
  name: string;
  email?: string;
  avatar: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  banner?: string | null;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export interface AuthResponse {
  status: string;
  message: string;
  token: string;
  user: User;
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
    isBlocked: boolean;
  };
  likesCount: number;
  isLiked: boolean;
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
      if (data.message?.includes("bloqué") || response.status === 401) {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event('auth-changed'));
        window.dispatchEvent(new CustomEvent('user-blocked', {
          detail: { message: data.message || "Ce compte est suspendu." }
        }));
      }
      throw new Error(data.message || "Non autorisé");
    }

    if (!response.ok) {
      throw new Error(data.message || "Une erreur est survenue");
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

  async createPost(content: string): Promise<Post> {
    return request<Post>('/posts', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
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

  async deletePost(postId: number): Promise<any> {
    return request<any>(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }
};
