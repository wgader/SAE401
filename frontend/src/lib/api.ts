const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

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

  async register(userData: FormData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: userData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de l'inscription");
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
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
  }
};
