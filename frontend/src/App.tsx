import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { OuterSidebar, InnerSidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import Hero from './components/Hero';
import { PopcornManiaRow } from './components/PopcornManiaRow';
import { ContinueWatchingRow } from './components/ContinueWatchingRow';
import { RecommendedRow } from './components/RecommendedRow';
import { AdminPanel } from './components/AdminPanel';
import { ImmersiveView } from './components/ImmersiveView';
import { AuthPage } from './components/Auth';
import { SearchPanel } from './components/SearchPanel';
import { WatchPanel } from './components/WatchPanel';
import { ChatAssistant } from './components/ChatAssistant';
import { Movie } from './types';
import { fetchContentByCategory } from './api/contentApi';
import { fetchContinueWatching } from './api/watchlistApi';
import { isAuthenticated, getCurrentUser, clearSession } from './api/authApi';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoginView, setIsLoginView] = useState(true);
  const [activeMovieToWatch, setActiveMovieToWatch] = useState<Movie | null>(null);

  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  const [popcornMania, setPopcornMania] = useState<Movie[]>([]);
  const [continueWatching, setContinueWatching] = useState<Movie[]>([]);
  const [authed, setAuthed] = useState(isAuthenticated());
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [homeDataError, setHomeDataError] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const loadHomeData = () => {
    setHomeDataError(false);
    fetchContentByCategory('HERO').then(setHeroMovies).catch(() => setHomeDataError(true));
    fetchContentByCategory('POPCORN_MANIA').then(setPopcornMania).catch(() => setHomeDataError(true));

    if (isAuthenticated()) {
      fetchContinueWatching().then(setContinueWatching).catch(() => {});
    } else {
      setContinueWatching([]);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const navigateToAuth = (isLogin: boolean) => {
    setIsLoginView(isLogin);
    setActiveTab('auth');
  };

  const navigateToSearch = () => {
    setActiveTab('search');
  };

  const navigateToWatch = (movie: Movie) => {
    setActiveMovieToWatch(movie);
    setActiveTab('watch');
  };

  const handleAuthSuccess = () => {
    const user = getCurrentUser();
    setAuthed(true);
    setActiveTab(user?.role === 'ADMIN' ? 'admin' : 'home');
    loadHomeData();
    setWelcomeMessage(user?.role === 'ADMIN' ? `Welcome back, ${user.fullName}` : `Welcome, ${user?.fullName ?? 'there'}!`);
    setTimeout(() => setWelcomeMessage(null), 3500);
  };

  const handleSignOut = () => {
    clearSession();
    setAuthed(false);
    setActiveTab('home');
    setContinueWatching([]);
  };

  return (
    <div className={`h-[100dvh] sm:min-h-screen ${theme === 'light' ? 'bg-zinc-100' : 'bg-black'} flex flex-col md:flex-row items-center justify-center p-2 sm:p-4 md:p-8 font-sans selection:bg-red-600 selection:text-white relative overflow-hidden transition-colors duration-300`}>
      {/* Background Image simulating a room */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=2560&q=80" 
          alt="Room Background" 
          className={`w-full h-full object-cover saturate-[0.5] transition-all duration-300 ${theme === 'light' ? 'brightness-[0.9]' : 'brightness-[0.15]'}`} 
          style={{ width: '2829.411743px' }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'light' ? 'from-zinc-100 via-zinc-100/40' : 'from-[#111] via-transparent'} to-transparent`} />
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`fixed top-3 right-3 sm:top-6 sm:right-6 z-[60] w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors duration-300 ${
          theme === 'light'
            ? 'bg-white/80 border-black/10 text-zinc-800 hover:bg-white'
            : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
        }`}
      >
        {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
      </button>

      {/* Post-auth welcome toast */}
      <AnimatePresence>
        {welcomeMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-[70] bg-red-600 text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-lg shadow-red-600/40 backdrop-blur-md"
          >
            {welcomeMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <ChatAssistant authed={authed} />

      <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-[1600px] h-full sm:h-[95vh] md:h-[92vh] pb-[88px] sm:pb-4 md:pb-0">
        {/* Floating Outer Sidebar */}
        <OuterSidebar activeTab={activeTab} setActiveTab={setActiveTab} authed={authed} onSignOut={handleSignOut} />

        {/* Main App Window */}
        <div className="flex-1 bg-[#1a1a1a]/80 backdrop-blur-2xl rounded-3xl md:rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl shadow-black/50 relative flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'home' ? (
              <motion.div 
                key="home"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full h-full flex flex-col lg:flex-row"
              >
                <InnerSidebar />
                
                {/* Main Content */}
                <div className="flex-1 flex flex-col p-3 sm:p-6 md:p-8 overflow-y-auto scrollbar-hide">
                  <TopBar navigateToAuth={navigateToAuth} navigateToSearch={navigateToSearch} authed={authed} onSignOut={handleSignOut} />
                  {homeDataError && (
                    <div className="mb-4 sm:mb-6 shrink-0 bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm rounded-lg px-4 py-3 flex items-center justify-between gap-4">
                      <span>Couldn't load the catalog. The server may be unreachable.</span>
                      <button onClick={loadHomeData} className="shrink-0 bg-red-600 hover:bg-red-700 transition text-white font-bold px-4 py-1.5 rounded-full text-xs">
                        Retry
                      </button>
                    </div>
                  )}
                  <Hero navigateToWatch={navigateToWatch} movies={heroMovies} />
                  {authed && <RecommendedRow navigateToWatch={navigateToWatch} />}
                  <PopcornManiaRow title="Popcorn Mania" movies={popcornMania} navigateToWatch={navigateToWatch} />
                  {authed && continueWatching.length > 0 && (
                    <ContinueWatchingRow title="Continue Watching" movies={continueWatching} navigateToWatch={navigateToWatch} />
                  )}
                </div>
              </motion.div>
            ) : activeTab === 'immersive' ? (
              <motion.div
                key="immersive"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full h-full"
              >
                <ImmersiveView navigateToAuth={navigateToAuth} navigateToSearch={navigateToSearch} navigateToWatch={navigateToWatch} authed={authed} onSignOut={handleSignOut} />
              </motion.div>
            ) : activeTab === 'search' ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full h-full"
              >
                <SearchPanel onClose={() => setActiveTab('home')} navigateToWatch={navigateToWatch} />
              </motion.div>
            ) : activeTab === 'watch' ? (
              <motion.div
                key="watch"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full h-full"
              >
                <WatchPanel movie={activeMovieToWatch} authed={authed} onBack={() => setActiveTab('home')} />
              </motion.div>
            ) : activeTab === 'admin' ? (
              <motion.div
                key="admin"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full h-full"
              >
                <AdminPanel onBack={() => { setActiveTab('home'); loadHomeData(); }} />
              </motion.div>
            ) : (
              <motion.div
                key="auth"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full h-full"
              >
                <AuthPage isLogin={isLoginView} setIsLogin={setIsLoginView} onAuthSuccess={handleAuthSuccess} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
