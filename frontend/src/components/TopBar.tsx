import { ChevronLeft, ChevronRight, Mic, Bell, Search, LogOut } from 'lucide-react';
import { getCurrentUser } from '../api/authApi';

interface TopBarProps {
  navigateToAuth?: (isLogin: boolean) => void;
  navigateToSearch?: () => void;
  authed?: boolean;
  onSignOut?: () => void;
}

export function TopBar({ navigateToAuth, navigateToSearch, authed, onSignOut }: TopBarProps) {
  const user = authed ? getCurrentUser() : null;

  return (
    <div className="flex items-center justify-between mb-6 sm:mb-8">
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        <div className="lg:hidden shrink-0 mr-2">
          <h1 className="text-red-600 text-xl font-black tracking-tighter drop-shadow-lg">NETFLIX</h1>
        </div>
        <button className="hidden md:flex w-8 h-8 rounded-full bg-white/5 items-center justify-center hover:bg-white/10 transition text-zinc-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button className="hidden md:flex w-8 h-8 rounded-full bg-white/5 items-center justify-center hover:bg-white/10 transition text-zinc-400 hover:text-white">
          <ChevronRight className="w-5 h-5" />
        </button>
        
        <div className="relative ml-0 md:ml-4 flex-1 max-w-sm cursor-pointer" onClick={() => navigateToSearch?.()}>
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-zinc-500" />
          </div>
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-white/5 border border-white/5 rounded-full py-2 px-10 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 transition cursor-pointer pointer-events-none"
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 pl-4">
        <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition text-zinc-400 hover:text-white relative shrink-0">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-red-600 border border-[#2a2a2a]" />
        </button>
        
        {authed ? (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0" title={user?.fullName}>
              {(user?.fullName?.[0] || '?').toUpperCase()}
            </div>
            <span className="hidden md:block text-xs sm:text-sm font-medium text-white max-w-[120px] truncate">
              {user?.fullName}
            </span>
            <button
              onClick={() => onSignOut?.()}
              title="Sign out"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition text-zinc-400 hover:text-white shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => navigateToAuth?.(true)} className="text-xs sm:text-sm font-medium text-white hover:text-zinc-300 transition px-2 sm:px-3 py-2 hidden sm:block">
              Log In
            </button>
            <button onClick={() => navigateToAuth?.(false)} className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium px-4 sm:px-5 py-1.5 sm:py-2 rounded-full transition shadow-lg shadow-red-600/30">
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
