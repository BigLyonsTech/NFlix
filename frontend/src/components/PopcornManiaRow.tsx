import { Movie } from '../types';
import { useState, useEffect } from 'react';

interface RowProps {
  title: string;
  movies: Movie[];
  navigateToWatch?: (movie: Movie) => void;
}

export function PopcornManiaRow({ title, movies, navigateToWatch }: RowProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mb-6 sm:mb-10 shrink-0">
      <h2 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-[#1a1a1a]/40 border border-white/5 rounded-2xl overflow-hidden aspect-video animate-pulse">
                <div className="w-full h-full bg-white/10" />
              </div>
            ))
          : movies.map(movie => (
              <div key={movie.id} onClick={() => navigateToWatch?.(movie)} className="bg-[#1a1a1a]/40 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.03] hover:-translate-y-1 group flex flex-col backdrop-blur-sm relative">
                <div className="w-full aspect-video overflow-hidden shrink-0 relative">
                  <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  {/* Refined semi-transparent tooltip */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center z-10 pointer-events-none">
                    <h3 className="text-white font-bold text-lg leading-tight mb-1">{movie.title}</h3>
                    {movie.year && <span className="text-zinc-300 text-sm font-medium">{movie.year}</span>}
                  </div>
                </div>
                <div className="p-2 sm:p-3">
                  <h3 className="text-white font-bold text-xs sm:text-sm truncate">{movie.title}</h3>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
