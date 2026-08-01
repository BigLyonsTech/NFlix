import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Movie } from '../types';
import { fetchRecommendations } from '../api/recommendationApi';
import { isAuthenticated } from '../api/authApi';

interface RecommendedRowProps {
  navigateToWatch?: (movie: Movie) => void;
}

export function RecommendedRow({ navigateToWatch }: RecommendedRowProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      setVisible(false);
      setIsLoading(false);
      return;
    }

    fetchRecommendations()
      .then((res) => {
        setMovies(res.recommendations);
        setReason(res.reason);
      })
      .catch(() => setVisible(false))
      .finally(() => setIsLoading(false));
  }, []);

  if (!visible || (!isLoading && movies.length === 0)) return null;

  return (
    <div className="mb-6 sm:mb-10 shrink-0">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
        <h2 className="text-base sm:text-lg font-bold text-white">Recommended For You</h2>
      </div>
      {reason && <p className="text-xs sm:text-sm text-zinc-400 mb-3 sm:mb-4">{reason}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden aspect-video bg-[#1a1a1a]/40 animate-pulse">
                <div className="w-full h-full bg-white/10" />
              </div>
            ))
          : movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => navigateToWatch?.(movie)}
                className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-video border border-white/5 hover:border-red-500/40 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1"
              >
                <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 pt-6 sm:pt-8 bg-gradient-to-t from-black/90 to-transparent">
                  <h3 className="text-white font-bold text-[10px] sm:text-xs truncate">{movie.title}</h3>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
