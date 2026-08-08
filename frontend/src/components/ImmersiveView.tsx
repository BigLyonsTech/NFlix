import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Bell, LogOut } from 'lucide-react';
import { Movie } from '../types';
import { getCurrentUser } from '../api/authApi';
import { fetchContentByCategory } from '../api/contentApi';

interface ImmersiveViewProps {
  navigateToWatch?: (movie: Movie) => void;
  authed?: boolean;
  onSignOut?: () => void;
}

export function ImmersiveView({ navigateToWatch, authed, onSignOut }: ImmersiveViewProps) {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);
  const user = authed ? getCurrentUser() : null;

  useEffect(() => {
    fetchContentByCategory('HERO').then((results) => {
      setMovies(results);
      setActiveMovie((prev) => prev ?? results[0] ?? null);
    }).catch(() => {});
  }, []);

  if (!activeMovie) {
    return <div className="w-full h-full rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-black" />;
  }

  return (
    <div className="relative w-full h-full rounded-3xl md:rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-700 bg-black">
      {/* Background Image that fades when changed */}
      {movies.map(movie => (
        <div 
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeMovie.id === movie.id ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
        >
          <img src={movie.backgroundUrl || movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover" />
          {/* Gradients for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent h-48" />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col p-4 sm:p-8 lg:p-12 overflow-y-auto overflow-x-hidden">
        {/* Top Navigation */}
        <div className="flex items-center justify-between shrink-0 mb-4 sm:mb-0">
          <div className="hidden sm:flex gap-4 sm:gap-6 lg:gap-8 text-sm font-medium">
          </div>
          
          <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 mt-1 sm:mt-0">
            <h1 className="text-red-600 text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter drop-shadow-lg">NETFLIX</h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 mt-1 sm:mt-0">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white cursor-pointer hover:text-zinc-300 transition drop-shadow-md" onClick={() => navigate('/search')} />
            <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition text-white relative shrink-0 backdrop-blur-md shadow-lg border border-white/5">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-red-600 border border-[#2a2a2a]" />
            </button>
            {authed ? (
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0" title={user?.fullName}>
                  {(user?.fullName?.[0] || '?').toUpperCase()}
                </div>
                <span className="hidden md:block text-xs sm:text-sm font-medium text-white max-w-[120px] truncate drop-shadow-md">
                  {user?.fullName}
                </span>
                <button
                  onClick={() => onSignOut?.()}
                  title="Sign out"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition text-white shrink-0 backdrop-blur-md"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => navigate('/login')} className="text-xs sm:text-sm font-medium text-white hover:text-zinc-300 transition px-2 sm:px-3 py-2 hidden sm:block drop-shadow-md">
                  Log In
                </button>
                <button onClick={() => navigate('/signup')} className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium px-4 sm:px-5 py-1.5 sm:py-2 rounded-full transition shadow-lg shadow-red-600/30">
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Content Area */}
        <div className="flex-1 flex flex-col xl:flex-row items-start xl:items-end justify-between w-full pb-4 gap-6 sm:gap-8 mt-auto pt-8 sm:pt-16">
          
          {/* Left Details */}
          <div className="max-w-3xl w-full">
            <h2 
              className="text-4xl sm:text-6xl lg:text-7xl xl:text-[5rem] font-serif text-white mb-2 sm:mb-4 leading-[1.1] drop-shadow-2xl font-bold" 
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {activeMovie.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm lg:text-base text-zinc-300 mb-6 sm:mb-8 font-medium drop-shadow-md">
              {activeMovie.genres && activeMovie.genres.length > 0 && <span>{activeMovie.genres.join(' • ')}</span>}
              {activeMovie.year && <span>{activeMovie.year}</span>}
              {activeMovie.duration && <span>{activeMovie.duration}</span>}
            </div>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <button 
                onClick={() => navigateToWatch?.(activeMovie)}
                className="bg-red-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-sm hover:bg-red-700 transition shadow-lg shadow-red-600/30"
              >
                WATCH TRAILER
              </button>
              <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-sm hover:bg-white/20 transition shadow-lg">
                VIEW INFO
              </button>
              <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition backdrop-blur-md shadow-lg">
                +
              </button>
            </div>
            
            <div className="flex items-center gap-1 drop-shadow-md hidden sm:flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-4 h-4 sm:w-5 sm:h-5 ${star <= (activeMovie.rating ?? 0) ? 'text-red-500 fill-red-500' : 'text-zinc-500 fill-zinc-500'}`} />
              ))}
            </div>
          </div>

          {/* Right Carousel */}
          <div className="w-full xl:w-auto flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide py-4 px-2 -mx-2 xl:mx-0 snap-x">
            {movies.map((movie) => (
              <div 
                key={movie.id} 
                onClick={() => setActiveMovie(movie)}
                className={`shrink-0 w-24 sm:w-36 lg:w-40 aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] snap-start ${activeMovie.id === movie.id ? 'ring-2 ring-red-600 scale-105 shadow-[0_0_20px_rgba(255,0,0,0.3)]' : 'opacity-60 hover:opacity-100'}`}
              >
                <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
}
