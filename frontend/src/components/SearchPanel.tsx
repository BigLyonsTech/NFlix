import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Movie } from '../types';
import { fetchContent, searchContent } from '../api/contentApi';

interface SearchPanelProps {
  navigateToWatch?: (movie: Movie) => void;
}

export function SearchPanel({ navigateToWatch }: SearchPanelProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load a default set of movies when the panel opens
  useEffect(() => {
    fetchContent()
      .then(setResults)
      .finally(() => setIsLoading(false));
  }, []);

  // Debounced live search against the backend
  useEffect(() => {
    if (!query) {
      fetchContent().then(setResults);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      searchContent(query)
        .then(setResults)
        .finally(() => setIsLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full h-full bg-[#141414] text-white flex flex-col p-4 sm:p-8 md:p-12 relative overflow-hidden rounded-3xl md:rounded-[2.5rem]">
      <button onClick={() => navigate('/')} className="absolute top-4 right-4 sm:top-8 sm:right-8 text-zinc-400 hover:text-white transition z-10">
        <X className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Top Section: Search Input */}
      <div className="flex flex-col items-center mb-6 sm:mb-10 shrink-0 mt-8 sm:mt-4">
        <div className="flex items-center bg-white/10 rounded-md px-4 sm:px-6 py-3 sm:py-4 w-full max-w-2xl">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400 mr-3 sm:mr-4" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent border-none text-base sm:text-2xl outline-none w-full placeholder:text-zinc-500 font-medium tracking-wide"
            placeholder="Search movies..."
            autoFocus
          />
        </div>
      </div>

      <div className="w-full h-px bg-white/10 mb-4 sm:mb-8 shrink-0" />

      {/* Bottom Section: Results */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
          {query ? 'Search Results' : 'Recommended Movies'}
        </h2>
        
        {/* Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-12 pr-2 sm:pr-4">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div key={idx} className="aspect-video rounded-md bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className="text-zinc-500 text-sm">No titles found for "{query}".</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
              {results.map((movie) => (
                <div key={movie.id} onClick={() => navigateToWatch?.(movie)} className="relative group cursor-pointer aspect-video rounded-md overflow-hidden bg-zinc-900 border border-white/5 shadow-lg">
                  <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2 sm:p-4 text-center z-10 pointer-events-none">
                     <h3 className="text-white font-bold text-sm sm:text-lg leading-tight mb-1">{movie.title}</h3>
                     {movie.year && <span className="text-zinc-300 text-xs sm:text-sm font-medium">{movie.year}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
