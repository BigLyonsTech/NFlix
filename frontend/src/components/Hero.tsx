import { Plus } from 'lucide-react';
import { Movie } from '../types';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HeroProps {
  navigateToWatch?: (movie: Movie) => void;
  movies?: Movie[];
}

const fallbackHeroMovies: Movie[] = [
  {
    id: 'hero-1',
    title: 'Peaky Blinders',
    thumbnailUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=1200&q=80',
    year: '2013',
    seasons: '6 Seasons',
    ageRating: 'A'
  },
  {
    id: 'hero-2',
    title: 'Stranger Things',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614145266184-a1599a0edb88?auto=format&fit=crop&w=1200&q=80',
    year: '2016',
    seasons: '4 Seasons',
    ageRating: 'U/A'
  },
  {
    id: 'hero-3',
    title: 'Breaking Bad',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574347710313-8b7466eb4b12?auto=format&fit=crop&w=1200&q=80',
    year: '2008',
    seasons: '5 Seasons',
    ageRating: 'A'
  }
];

export default function Hero({ navigateToWatch, movies }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const heroMovies = movies && movies.length > 0 ? movies : fallbackHeroMovies;

  useEffect(() => {
    setCurrentIndex(0);
  }, [heroMovies.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroMovies.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [heroMovies.length]);

  const currentMovie = heroMovies[currentIndex];

  const formatTitle = (title: string) => {
    const words = title.split(' ');
    if (words.length > 1) {
      return (
        <>
          {words[0]}<br />{words.slice(1).join(' ')}
        </>
      );
    }
    return title;
  };

  return (
    <div className="relative w-full h-[200px] sm:h-[280px] md:h-[360px] rounded-2xl md:rounded-3xl overflow-hidden mb-6 sm:mb-10 group shrink-0 bg-zinc-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img 
            src={currentMovie.thumbnailUrl} 
            alt={currentMovie.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-center max-w-xl">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif font-bold text-white mb-1 sm:mb-2 tracking-wide uppercase drop-shadow-lg" style={{ fontFamily: 'Times New Roman, serif' }}>
              {formatTitle(currentMovie.title)}
            </h1>
            <div className="flex items-center gap-3 mt-2 sm:mt-4">
              <button 
                onClick={() => navigateToWatch?.(currentMovie)}
                className="flex items-center justify-center bg-red-600 text-white px-6 sm:px-8 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm hover:bg-red-700 transition shadow-lg shadow-red-600/30"
              >
                Watch
              </button>
              <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition text-white">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
