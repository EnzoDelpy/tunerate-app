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
  comment: string; // Changé de content à comment pour correspondre au backend
  content?: string; // Gardé pour la compatibilité en attendant la mise à jour de tous les composants
  rating: number;
  createdAt: string;
  updatedAt: string;
  albumId: number;
  userId: number;
  user: User;
  album: Album;
  likes?: number;
  userHasLiked?: boolean;
  parentReviewId?: number | null;
  replies?: Review[];
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

// Fonction utilitaire pour obtenir le profil utilisateur courant
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    return await authApi.getProfile();
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du profil utilisateur:",
      error
    );
    return null;
  }
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
    try {
      // Si l'id est numérique, c'est un ID interne
      if (!isNaN(Number(id))) {
        const response = await api.get(`/albums/${id}`);
        return response.data;
      } else {
        // Sinon c'est un ID externe (Spotify)
        const response = await api.get(`/albums/external/${id}`);
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching album:", error);
      throw error;
    }
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
export interface ReviewsResponse {
  reviews: Review[];
  hasMore: boolean;
  total: number;
}

export const reviewsApi = {
  getReviewsByAlbum: async (
    albumId: number,
    page: number = 1,
    limit: number = 5
  ): Promise<ReviewsResponse> => {
    const response = await api.get(
      `/reviews/album/${albumId}?page=${page}&limit=${limit}`
    );
    // Si l'API backend ne supporte pas encore la pagination, on simule la réponse
    if (Array.isArray(response.data)) {
      return {
        reviews: response.data,
        hasMore: false,
        total: response.data.length,
      };
    }
    return response.data;
  },
  createReview: async (
    albumId: number,
    content: string,
    rating: number,
    parentReviewId?: number
  ): Promise<Review> => {
    const response = await api.post("/reviews", {
      albumId,
      comment: content, // Utiliser 'comment' au lieu de 'content' pour correspondre au DTO backend
      rating,
      parentReviewId, // Pour les réponses à d'autres critiques
    });
    return response.data;
  },
  updateReview: async (
    reviewId: number,
    content: string,
    rating: number
  ): Promise<Review> => {
    const response = await api.patch(`/reviews/${reviewId}`, {
      comment: content, // Utiliser 'comment' au lieu de 'content' pour correspondre au DTO backend
      rating,
    });
    return response.data;
  },
  deleteReview: async (reviewId: number): Promise<void> => {
    await api.delete(`/reviews/${reviewId}`);
  },
  likeReview: async (reviewId: number): Promise<{ likes: number }> => {
    const response = await api.post(`/reviews/${reviewId}/like`);
    return response.data;
  },
};

export default api;
