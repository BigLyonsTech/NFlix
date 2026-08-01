import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, SkipForward, Settings, MessageSquare, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Movie } from '../types';

interface WatchPanelProps {
  movie: Movie | null;
  onBack: () => void;
}

export function WatchPanel({ movie, onBack }: WatchPanelProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-hide controls after 3 seconds of inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettingsMenu) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    handleMouseMove();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, showSettingsMenu]);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.log("Error attempting to enable full-screen mode:", err.message);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-black relative flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
      onClick={handleMouseMove}
    >
      {/* Background simulating video */}
      <img 
        src={movie?.thumbnailUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80"} 
        alt={movie?.title} 
        className={`w-full h-full object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-80' : 'opacity-40 blur-sm'}`} 
      />
      
      {/* Overlay to darken background slightly always */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Center Play/Pause indication */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsPlaying(!isPlaying);
        }}
        className={`absolute z-20 w-24 h-24 rounded-full bg-black/40 flex items-center justify-center text-white backdrop-blur-sm transition-all duration-300 ${!isPlaying && showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}
      >
        <Play className="w-12 h-12 ml-2" />
      </button>

      {/* Top Bar Navigation */}
      <div className={`absolute top-0 inset-x-0 p-8 flex items-center gap-6 z-30 transition-all duration-500 bg-gradient-to-b from-black/80 to-transparent ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <button onClick={onBack} className="text-white hover:text-zinc-300 transition p-2 rounded-full hover:bg-white/10 backdrop-blur-md">
          <ArrowLeft className="w-8 h-8" />
        </button>
        <h2 className="text-white font-bold text-2xl drop-shadow-lg">{movie?.title || "Playing Now"}</h2>
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 inset-x-0 px-8 pb-8 pt-24 z-30 flex flex-col gap-4 transition-all duration-500 bg-gradient-to-t from-black/90 via-black/40 to-transparent ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
        {/* Progress Bar */}
        <div className="w-full flex items-center gap-4 group cursor-pointer">
          <span className="text-white text-sm font-medium w-12 text-right">24:12</span>
          <div className="flex-1 h-1.5 bg-white/20 rounded-full relative group-hover:h-2.5 transition-all">
            <div className="absolute inset-y-0 left-0 bg-red-600 rounded-full w-1/3" />
            <div className="absolute top-1/2 -translate-y-1/2 left-1/3 w-4 h-4 bg-red-600 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-white text-sm font-medium w-12">1:45:00</span>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-between mt-2 relative">
          <div className="flex items-center gap-6">
            <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} className="text-white hover:text-zinc-300 transition">
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
            </button>
            <button className="text-white hover:text-zinc-300 transition">
              <SkipForward className="w-7 h-7 fill-current" />
            </button>
            <div className="flex items-center gap-3 group">
              <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="text-white hover:text-zinc-300 transition">
                {isMuted ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
              </button>
              <div className="w-0 group-hover:w-24 overflow-hidden transition-all duration-300 h-1.5 bg-white/20 rounded-full relative cursor-pointer">
                <div className={`absolute inset-y-0 left-0 bg-white rounded-full ${isMuted ? 'w-0' : 'w-2/3'} transition-all duration-300`} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-white hover:text-zinc-300 transition">
              <MessageSquare className="w-6 h-6" />
            </button>
            
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowSettingsMenu(!showSettingsMenu); }} 
                className={`text-white hover:text-zinc-300 transition ${showSettingsMenu ? 'text-zinc-300 rotate-90' : ''} duration-300`}
              >
                <Settings className="w-6 h-6" />
              </button>
              
              {/* Settings Menu Popup */}
              {showSettingsMenu && (
                <div 
                  className="absolute bottom-12 right-0 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 w-48 text-sm text-white shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 text-zinc-400 font-medium text-xs uppercase tracking-wider">Playback Speed</div>
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/10 transition text-left">
                    <span>1.0x (Normal)</span>
                    <Check className="w-4 h-4 text-white" />
                  </button>
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/10 transition text-left">
                    <span>1.25x</span>
                  </button>
                  <div className="h-px bg-white/10 my-1 mx-2" />
                  <div className="px-3 py-2 text-zinc-400 font-medium text-xs uppercase tracking-wider">Quality</div>
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/10 transition text-left">
                    <span>1080p HD</span>
                    <Check className="w-4 h-4 text-white" />
                  </button>
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/10 transition text-left">
                    <span>Auto</span>
                  </button>
                </div>
              )}
            </div>

            <button onClick={(e) => { e.stopPropagation(); handleFullscreen(); }} className="text-white hover:text-zinc-300 transition">
              <Maximize className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
