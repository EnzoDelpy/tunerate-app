import axios from "axios";

// Définition des types pour les entités principales
export type Album = {
  id: number | string;
  externalId?: string;
  name?: string;
  title?: string; // Pour la compatibilité avec l'API
  releaseDate?: string;
  genres?: string[];
  coverImageUrl?: string;
  coverUrl?: string; // Pour la compatibilité avec l'API
  artist?: Artist;
  artistId?: number;
  artistName?: string; // Pour la compatibilité avec l'API
  artistExternalId?: string; // Pour la compatibilité avec l'API
  _uniqueId?: string; // Identifiant unique généré côté backend pour éviter les doublons
  albumType?: "album" | "single" | "ep" | "compilation"; // Type d'album depuis Spotify
  totalTracks?: number; // Nombre total de pistes
};

export type Artist = {
  id: number;
  name: string;
  genres: string[];
  imageUrl?: string;
};

export type Review = {
  id: number;
  content: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  albumId: number;
  userId: number;
  user: User;
  album: Album;
};

export type User = {
  id: number;
  email: string;
  username: string;
};

export type AuthResponse = {
  access_token: string;
  user: User;
};

// Configuration de l'API
const API_URL = "http://localhost:4000";

// Création de l'instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("401 Unauthorized Error");
      // Si le serveur répond avec 401, le token est probablement expiré ou invalide
    }
    return Promise.reject(error);
  }
);

// API pour l'authentification
export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  },
  register: async (
    email: string,
    password: string,
    username: string
  ): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", {
      email,
      password,
      username,
    });
    return response.data;
  },
  getProfile: async (): Promise<User> => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

// API pour les utilisateurs
export const usersApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    return authApi.login(username, password);
  },
  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    return authApi.register(email, password, username);
  },
  getProfile: async (): Promise<User> => {
    return authApi.getProfile();
  },
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.patch("/users/profile", userData);
    return response.data;
  },
};

// API pour les albums
export const albumsApi = {
  getAllAlbums: async (page = 1, limit = 10): Promise<Album[]> => {
    const response = await api.get(`/albums?page=${page}&limit=${limit}`);
    return response.data;
  },
  searchAlbums: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<Album[]> => {
    // Utiliser la pagination du backend
    const response = await api.get(
      `/albums/search?query=${query}&page=${page}&limit=${limit}`
    );
    return response.data;
  },
  getAlbumById: async (id: number | string): Promise<Album> => {
    const response = await api.get(`/albums/${id}`);
    return response.data;
  },
};

// API pour les artistes
export const artistsApi = {
  getAllArtists: async (page = 1, limit = 10): Promise<Artist[]> => {
    const response = await api.get(`/artists?page=${page}&limit=${limit}`);
    return response.data;
  },
  searchArtists: async (query: string): Promise<Artist[]> => {
    const response = await api.get(`/artists/search?q=${query}`);
    return response.data;
  },
  getArtistById: async (id: number): Promise<Artist> => {
    const response = await api.get(`/artists/${id}`);
    return response.data;
  },
};

// API pour les reviews
export const reviewsApi = {
  getReviewsByAlbum: async (albumId: number): Promise<Review[]> => {
    const response = await api.get(`/reviews/album/${albumId}`);
    return response.data;
  },
  createReview: async (
    albumId: number,
    content: string,
    rating: number
  ): Promise<Review> => {
    const response = await api.post("/reviews", { albumId, content, rating });
    return response.data;
  },
  updateReview: async (
    reviewId: number,
    content: string,
    rating: number
  ): Promise<Review> => {
    const response = await api.patch(`/reviews/${reviewId}`, {
      content,
      rating,
    });
    return response.data;
  },
  deleteReview: async (reviewId: number): Promise<void> => {
    await api.delete(`/reviews/${reviewId}`);
  },
};

export default api;
