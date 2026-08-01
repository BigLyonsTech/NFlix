import { Play } from 'lucide-react';
import { Movie } from '../types';
import { useState, useEffect } from 'react';

interface RowProps {
  title: string;
  movies: Movie[];
  navigateToWatch?: (movie: Movie) => void;
}

export function ContinueWatchingRow({ title, movies, navigateToWatch }: RowProps) {
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
              <div key={idx} className="relative rounded-2xl overflow-hidden aspect-video border border-transparent bg-[#1a1a1a]/40 animate-pulse">
                <div className="w-full h-full bg-white/10" />
              </div>
            ))
          : movies.map(movie => (
              <div key={movie.id} onClick={() => navigateToWatch?.(movie)} className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-video border border-transparent hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.03] hover:-translate-y-1">
                <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                
                <div className="absolute inset-0 bg-black/30 transition flex flex-col items-center justify-center pointer-events-none opacity-100 group-hover:bg-black/60 group-hover:backdrop-blur-sm z-10">
                    <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition duration-300 group-hover:bg-red-600 group-hover:scale-110 mb-1 sm:mb-2">
                      <Play className="w-3 h-3 sm:w-4 sm:h-4 fill-white ml-0.5" />
                    </button>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-2 sm:px-4 hidden sm:block">
                      <h3 className="text-white font-bold text-sm sm:text-lg leading-tight mb-1">{movie.title}</h3>
                      {movie.year && <span className="text-zinc-300 text-xs sm:text-sm font-medium">{movie.year}</span>}
                    </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 pt-6 sm:pt-8 bg-gradient-to-t from-black/90 to-transparent group-hover:opacity-0 transition-opacity duration-300 z-0">
                  <h3 className="text-white font-bold text-[10px] sm:text-xs mb-1 drop-shadow-md truncate">{movie.title}</h3>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 z-20">
                   <div className="h-full bg-red-600" style={{ width: `${movie.progress}%` }} />
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
