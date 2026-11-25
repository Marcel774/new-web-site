import { useCallback, useEffect, useState } from 'react';
import { Footer } from './components/Footer';
import { MoviePlayerModal } from './components/MoviePlayerModal';
import { Navbar, type AppRoute } from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AdminAuthPage } from './pages/AdminAuthPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { HomePage } from './pages/HomePage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import type { Movie } from './types/movie';

function parseRouteFromPath(): AppRoute {
  const path = window.location.pathname;
  if (path === '/admin') {
    return { name: 'admin' };
  }
  const movieMatch = path.match(/^\/movies\/([a-fA-F0-9]{24})$/);
  if (movieMatch) {
    return { name: 'movie', id: movieMatch[1] };
  }
  return { name: 'home' };
}

function MovieflixShell() {
  const { isAuthenticated } = useAuth();
  const [route, setRoute] = useState<AppRoute>(() => parseRouteFromPath());
  const [activePlayerMovie, setActivePlayerMovie] = useState<Movie | null>(null);

  const navigate = useCallback((target: AppRoute) => {
    setRoute(target);
    if (target.name === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (target.name === 'movie') {
      window.history.pushState({}, '', `/movies/${target.id}`);
    } else {
      window.history.pushState({}, '', '/');
    }
    if (target.name !== 'home' || !target.section) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRouteFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#08080A] text-[#F5F5F7]">
      <Navbar route={route} onNavigate={navigate} />

      <main className="flex-1">
        {route.name === 'home' && (
          <HomePage
            initialSection={route.section}
            onSelectMovie={(id) => navigate({ name: 'movie', id })}
            onWatchMovie={(movie) => setActivePlayerMovie(movie)}
          />
        )}

        {route.name === 'movie' && (
          <MovieDetailsPage
            movieId={route.id}
            onBack={() => navigate({ name: 'home' })}
            onSelectMovie={(id) => navigate({ name: 'movie', id })}
            onWatchMovie={(movie) => setActivePlayerMovie(movie)}
          />
        )}

        {route.name === 'admin' &&
          (isAuthenticated ? (
            <AdminDashboardPage onSelectMovie={(id) => navigate({ name: 'movie', id })} />
          ) : (
            <AdminAuthPage onSuccess={() => navigate({ name: 'admin' })} />
          ))}
      </main>

      <Footer onNavigate={navigate} />

      <MoviePlayerModal
        movie={activePlayerMovie}
        onClose={() => setActivePlayerMovie(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MovieflixShell />
      </AuthProvider>
    </ToastProvider>
  );
}
