import { useState } from 'react';
import { Search } from 'lucide-react';
import { popcornMania, continueWatching, newTrailers } from '../data';
import { login, signup, saveSession } from '../api/authApi';

interface AuthPageProps {
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
  onAuthSuccess?: () => void;
}

export function AuthPage({ isLogin, setIsLogin, onAuthSuccess }: AuthPageProps) {
  // Combine some movies for the background grid (purely decorative collage)
  const backgroundMovies = [...popcornMania, ...continueWatching, ...newTrailers, ...popcornMania, ...continueWatching, ...newTrailers];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || (!isLogin && !fullName)) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const auth = isLogin
        ? await login({ email, password })
        : await signup({ fullName, email, password });

      saveSession(auth);
      onAuthSuccess?.();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative bg-[#141414] overflow-hidden rounded-3xl md:rounded-[2.5rem]">
      {/* Left Side: Hero / Collage */}
      <div className="relative hidden md:flex flex-1 flex-col items-center justify-center overflow-hidden">
        {/* Collage Background */}
        <div className="absolute inset-0 z-0 grid grid-cols-3 lg:grid-cols-4 gap-3 p-3 opacity-60 transform scale-[1.1] -rotate-1">
          {backgroundMovies.map((movie, idx) => (
            <div key={idx} className="aspect-[2/3] rounded-md overflow-hidden bg-zinc-900">
              <img src={movie.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-black/40 z-0" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#141414] to-transparent z-0" />
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center text-center px-8 w-full max-w-xl">
          <h1 className="text-[#e50914] text-5xl md:text-6xl font-black tracking-tighter mb-4 drop-shadow-2xl">NETFLIX</h1>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg leading-tight">
            Unlimited Movies, TV Shows<br/>and more
          </h2>
          <p className="text-base md:text-lg text-white mb-8 drop-shadow-md font-medium">
            Watch anywhere. Cancel anytime.
          </p>
          
          <div className="w-full relative max-w-md">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-zinc-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-white text-black rounded-[4px] py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full md:w-[380px] lg:w-[420px] bg-[#141414] h-full flex flex-col px-6 sm:px-10 py-8 sm:py-16 overflow-y-auto scrollbar-hide z-10 relative shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
        <h2 className="text-2xl sm:text-[32px] font-bold text-white mb-6 sm:mb-8">{isLogin ? 'Sign In' : 'Sign Up'}</h2>
        
        <form className="flex flex-col gap-3 sm:gap-4 mb-4" onSubmit={handleSubmit}>
          {!isLogin && (
             <input 
               type="text" 
               placeholder="Full Name" 
               value={fullName}
               onChange={(e) => setFullName(e.target.value)}
               className="bg-white rounded-[4px] px-3 sm:px-4 py-2.5 sm:py-3.5 text-black text-xs sm:text-sm placeholder:text-zinc-500 focus:outline-none"
             />
          )}
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white rounded-[4px] px-3 sm:px-4 py-2.5 sm:py-3.5 text-black text-xs sm:text-sm placeholder:text-zinc-500 focus:outline-none"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white rounded-[4px] px-3 sm:px-4 py-2.5 sm:py-3.5 text-black text-xs sm:text-sm placeholder:text-zinc-500 focus:outline-none"
          />

          {error && <p className="text-red-500 text-xs sm:text-sm font-medium">{error}</p>}

          <button type="submit" disabled={isSubmitting} className="bg-[#e50914] text-white font-bold py-2.5 sm:py-3.5 text-sm sm:text-base rounded-[4px] mt-2 hover:bg-[#c11119] transition disabled:opacity-60 disabled:cursor-not-allowed">
            {isSubmitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center text-zinc-400 text-xs sm:text-[13px] my-2 font-medium">Or</div>

        <button className="bg-[#5c5c5c] text-white text-xs sm:text-sm font-medium py-2.5 sm:py-3.5 rounded-[4px] hover:bg-[#6c6c6c] transition mb-4 sm:mb-6">
          Use a Sign-In code
        </button>

        <div className="text-center mb-6 sm:mb-8">
          <a href="#" className="text-white hover:underline text-xs sm:text-sm transition">Forgot Password</a>
        </div>

        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <input type="checkbox" id="remember" className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-sm accent-zinc-500 bg-[#333] border-none" defaultChecked />
          <label htmlFor="remember" className="text-white text-xs sm:text-sm">Remember me</label>
        </div>

        <p className="text-zinc-400 text-xs sm:text-sm mb-4">
          {isLogin ? "New to Netflix? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-white hover:underline font-medium transition"
          >
            {isLogin ? 'Sign Up now' : 'Sign In now'}
          </button>
        </p>

        <p className="text-[10px] sm:text-[11px] text-zinc-500 leading-relaxed mb-8 sm:mb-12">
          This page is protected by Google reCAPTCHA to ensure you're not a bot. <a href="#" className="text-blue-500 hover:underline">Learn more.</a>
        </p>

        <div className="mt-auto text-center">
          <p className="text-[9px] sm:text-[10px] text-zinc-600">1997 - 2024 Netflix, Inc</p>
        </div>
      </div>
    </div>
  );
}
