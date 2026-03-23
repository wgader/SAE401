const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
export const BASE_URL = API_URL.replace(/\/api\/?$/, "");

export interface User {
  id: number;
  username: string;
  name: string;
  email?: string;
  avatar: string | null;
  isVerified: boolean;
  createdAt: string;
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
    };
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

export const api = {
  
  async login(credentials: Record<string, string>): Promise<AuthResponse> {
    const formData = new FormData();
    Object.entries(credentials).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la connexion");
    }

    localStorage.setItem("token", data.token);
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
    const response = await fetch(`${API_URL}/me`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la récupération du profil");
    }

    return data;
  },

  logout() {
    localStorage.removeItem("token");
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },

  async verifyCode(email: string, code: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/verify-code`, {
      method: "POST",
      headers: { 
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Code de vérification invalide");
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  },

  async checkAvailability(params: { username?: string; email?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params.username) queryParams.append("username", params.username);
    if (params.email) queryParams.append("email", params.email);

    const response = await fetch(`${API_URL}/check-availability?${queryParams.toString()}`, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    return await response.json();
  },

  async resendCode(email: string): Promise<any> {
    const response = await fetch(`${API_URL}/resend-code`, {
      method: "POST",
      headers: { 
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de l'envoi du code");
    }
    return data;
  },

  async getPosts(): Promise<Post[]> {
    const response = await fetch(`${API_URL}/posts`, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  async createPost(content: string): Promise<Post> {
    const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
            ...getHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create post');
    }
    return response.json();
  }
};
