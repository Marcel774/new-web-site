import type {
  AdminUser,
  Category,
  Movie,
  MovieFormData,
  MoviesResponse,
} from '../types/movie';

// Keep JWT strictly in JS memory rather than localStorage/sessionStorage
let inMemoryToken: string | null = null;

export function setAuthToken(token: string | null): void {
  inMemoryToken = token;
}

export function getAuthToken(): string | null {
  return inMemoryToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (inMemoryToken) {
    headers.set('Authorization', `Bearer ${inMemoryToken}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload?.error === 'string'
        ? payload.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export interface MovieQueryParams {
  search?: string;
  genre?: string;
  featured?: boolean;
  trending?: boolean;
  sort?: 'newest' | 'rating' | 'year' | 'title';
  page?: number;
  limit?: number;
}

export const api = {
  getMovies(params: MovieQueryParams = {}): Promise<MoviesResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.genre && params.genre !== 'All') query.set('genre', params.genre);
    if (params.featured) query.set('featured', 'true');
    if (params.trending) query.set('trending', 'true');
    if (params.sort) query.set('sort', params.sort);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    return request<MoviesResponse>(`/api/movies${qs ? `?${qs}` : ''}`);
  },

  getMovieById(id: string): Promise<{ movie: Movie; relatedMovies: Movie[] }> {
    return request<{ movie: Movie; relatedMovies: Movie[] }>(`/api/movies/${encodeURIComponent(id)}`);
  },

  createMovie(data: MovieFormData): Promise<{ message: string; movie: Movie }> {
    return request<{ message: string; movie: Movie }>('/api/movies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateMovie(id: string, data: MovieFormData): Promise<{ message: string; movie: Movie }> {
    return request<{ message: string; movie: Movie }>(`/api/movies/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteMovie(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/api/movies/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  getCategories(): Promise<{ categories: Category[] }> {
    return request<{ categories: Category[] }>('/api/categories');
  },

  createCategory(name: string): Promise<{ message: string; category: Category }> {
    return request<{ message: string; category: Category }>('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  deleteCategory(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/api/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  getAuthStatus(): Promise<{ adminCount: number; hasAdmin: boolean }> {
    return request<{ adminCount: number; hasAdmin: boolean }>('/api/auth/status');
  },

  registerAdmin(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ message: string; token: string; admin: AdminUser }> {
    return request<{ message: string; token: string; admin: AdminUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  loginAdmin(data: {
    email: string;
    password: string;
  }): Promise<{ message: string; token: string; admin: AdminUser }> {
    return request<{ message: string; token: string; admin: AdminUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe(): Promise<{ admin: AdminUser }> {
    return request<{ admin: AdminUser }>('/api/auth/me');
  },
};
