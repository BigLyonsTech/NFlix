import { Play, LayoutGrid, User, Shield, LogOut } from 'lucide-react';
import { newTrailers } from '../data';
import { isAdmin } from '../api/authApi';

interface OuterSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  authed?: boolean;
  onSignOut?: () => void;
}

export function OuterSidebar({ activeTab, setActiveTab, authed, onSignOut }: OuterSidebarProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[240px] md:static md:translate-x-0 md:w-16 flex md:flex-col rounded-full bg-[#1e1e1e]/80 backdrop-blur-xl border border-white/10 items-center justify-around md:justify-start md:py-6 md:gap-6 h-12 md:h-max shadow-2xl md:my-auto z-50">
      <div 
        onClick={() => setActiveTab('home')}
        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center cursor-pointer shrink-0 transition ${activeTab === 'home' ? 'bg-red-600 shadow-lg shadow-red-600/30' : 'bg-transparent hover:bg-white/10'}`}
      >
        <Play className={`w-4 h-4 md:w-5 md:h-5 ml-0.5 md:ml-1 transition ${activeTab === 'home' ? 'text-white fill-white' : 'text-zinc-400 fill-zinc-400'}`} />
      </div>
      <div 
        onClick={() => setActiveTab('immersive')}
        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center cursor-pointer shrink-0 transition ${activeTab === 'immersive' ? 'bg-red-600 shadow-lg shadow-red-600/30' : 'bg-transparent hover:bg-white/10'}`}
      >
        <LayoutGrid className={`w-4 h-4 md:w-5 md:h-5 transition ${activeTab === 'immersive' ? 'text-white' : 'text-zinc-500'}`} />
      </div>

      {isAdmin() && (
        <div
          onClick={() => setActiveTab('admin')}
          className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center cursor-pointer shrink-0 transition ${activeTab === 'admin' ? 'bg-red-600 shadow-lg shadow-red-600/30' : 'bg-transparent hover:bg-white/10'}`}
          title="Admin panel"
        >
          <Shield className={`w-4 h-4 md:w-5 md:h-5 transition ${activeTab === 'admin' ? 'text-white' : 'text-zinc-500'}`} />
        </div>
      )}
      
      <div className="md:mt-4 md:pt-6 md:border-t border-white/10 w-8 md:w-10 flex flex-col items-center">
        <div
          onClick={() => (authed ? onSignOut?.() : setActiveTab('auth'))}
          title={authed ? 'Sign out' : 'Sign in'}
          className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center cursor-pointer shrink-0 transition ${activeTab === 'auth' ? 'bg-red-600 shadow-lg shadow-red-600/30' : 'bg-transparent hover:bg-white/10'}`}
        >
          {authed
            ? <LogOut className="w-4 h-4 md:w-5 md:h-5 transition text-zinc-500" />
            : <User className={`w-4 h-4 md:w-5 md:h-5 transition ${activeTab === 'auth' ? 'text-white' : 'text-zinc-500'}`} />}
        </div>
      </div>
    </div>
  );
}

export function InnerSidebar() {
  return (
    <div className="w-64 hidden lg:flex flex-shrink-0 flex-col py-8 px-6 border-r border-white/5 bg-black/10 overflow-y-auto scrollbar-hide">
      <h1 className="text-red-600 text-3xl font-black tracking-tighter mb-10">NETFLIX</h1>
      
      <nav className="flex flex-col gap-5 mb-10">
        <div className="flex items-center gap-3 text-white font-medium cursor-pointer">
          <div className="w-2 h-2 rounded-full bg-red-600" />
          Browse
        </div>
      </nav>

      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-base font-bold text-white">New Trailers</h2>
        <span className="text-lg">🔥</span>
      </div>

      <div className="flex flex-col gap-4">
        {newTrailers.map(trailer => (
          <div key={trailer.id} className="group cursor-pointer">
            <div className="w-full h-[100px] rounded-xl overflow-hidden mb-2 relative">
              <img src={trailer.thumbnailUrl} alt={trailer.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
