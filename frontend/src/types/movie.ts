export interface Movie {
  _id: string;
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  rating: number;
  poster: string;
  backdrop?: string;
  videoUrl: string;
  featured: boolean;
  trending: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MovieFormData {
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  rating: number;
  poster: string;
  backdrop: string;
  videoUrl: string;
  featured: boolean;
  trending: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  movieCount: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CatalogStats {
  totalMovies: number;
  averageRating: number;
  featuredCount: number;
  trendingCount: number;
}

export interface MoviesResponse {
  movies: Movie[];
  pagination: PaginationInfo;
  stats: CatalogStats;
}
