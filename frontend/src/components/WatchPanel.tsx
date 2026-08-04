import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, SkipForward, Settings, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { updateProgress, fetchContinueWatching } from '../api/watchlistApi';
import { fetchContentById } from '../api/contentApi';

interface WatchPanelProps {
  authed: boolean;
}

const FALLBACK_VIDEO_URL = 'https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4';
const PLAYBACK_SPEEDS = [0.5, 1, 1.25, 1.5, 2];
const PROGRESS_SAVE_INTERVAL_MS = 5000;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const paddedSecs = secs.toString().padStart(2, '0');
  return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:${paddedSecs}` : `${minutes}:${paddedSecs}`;
}

export function WatchPanel({ authed }: WatchPanelProps) {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>((location.state as { movie?: Movie } | null)?.movie ?? null);
  const [isLoadingMovie, setIsLoadingMovie] = useState(!movie);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (movie && movie.id === id) return;
    if (!id) return;

    setIsLoadingMovie(true);
    setLoadError(false);

    Promise.all([
      fetchContentById(id),
      authed ? fetchContinueWatching().catch(() => []) : Promise.resolve([]),
    ])
      .then(([content, continueWatching]) => {
        const progressEntry = continueWatching.find((m) => m.id === id);
        setMovie({ ...content, progress: progressEntry?.progress });
      })
      .catch(() => setLoadError(true))
      .finally(() => setIsLoadingMovie(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasResumedRef = useRef(false);
  const lastSavedAtRef = useRef(0);

  const videoSrc = movie?.videoUrl || FALLBACK_VIDEO_URL;

  const saveProgress = (percent: number) => {
    if (!authed || !movie?.id) return;
    updateProgress(movie.id, Math.round(percent)).catch(() => {});
  };

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

  // Reset per-title playback state and persist final progress when navigating away/switching titles
  useEffect(() => {
    hasResumedRef.current = false;
    lastSavedAtRef.current = 0;
    setCurrentTime(0);
    setDuration(0);

    return () => {
      const video = videoRef.current;
      if (video && video.duration > 0) {
        saveProgress((video.currentTime / video.duration) * 100);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie?.id]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  };

  const seekTo = (clientX: number, bar: HTMLDivElement) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
  };

  const changeSpeed = (speed: number) => {
    const video = videoRef.current;
    if (video) video.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);

    if (!hasResumedRef.current && movie?.progress && movie.progress > 0 && movie.progress < 100) {
      video.currentTime = (movie.progress / 100) * video.duration;
    }
    hasResumedRef.current = true;
    video.play().catch(() => {});
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);

    const now = Date.now();
    if (video.duration > 0 && now - lastSavedAtRef.current >= PROGRESS_SAVE_INTERVAL_MS) {
      lastSavedAtRef.current = now;
      saveProgress((video.currentTime / video.duration) * 100);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    saveProgress(100);
  };

  const handleBack = () => {
    const video = videoRef.current;
    if (video && video.duration > 0) {
      saveProgress((video.currentTime / video.duration) * 100);
    }
    navigate('/');
  };

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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (loadError) {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-4 text-center px-6">
        <h2 className="text-white text-xl font-bold">Couldn't find that title</h2>
        <p className="text-zinc-400 text-sm">It may have been removed from the catalog.</p>
        <button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700 transition text-white font-bold px-6 py-2.5 rounded-full text-sm">
          Back to Home
        </button>
      </div>
    );
  }

  if (isLoadingMovie || !movie) {
    return <div className="w-full h-full bg-black animate-pulse" />;
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-black relative flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
      onClick={handleMouseMove}
    >
      <video
        ref={videoRef}
        key={movie?.id ?? videoSrc}
        src={videoSrc}
        poster={movie?.thumbnailUrl}
        className="w-full h-full object-contain bg-black"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Center Play/Pause indication */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        className={`absolute z-20 w-24 h-24 rounded-full bg-black/40 flex items-center justify-center text-white backdrop-blur-sm transition-all duration-300 ${!isPlaying && showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}
      >
        <Play className="w-12 h-12 ml-2" />
      </button>

      {/* Top Bar Navigation */}
      <div className={`absolute top-0 inset-x-0 p-8 flex items-center gap-6 z-30 transition-all duration-500 bg-gradient-to-b from-black/80 to-transparent ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <button onClick={handleBack} className="text-white hover:text-zinc-300 transition p-2 rounded-full hover:bg-white/10 backdrop-blur-md">
          <ArrowLeft className="w-8 h-8" />
        </button>
        <h2 className="text-white font-bold text-2xl drop-shadow-lg">{movie?.title || "Playing Now"}</h2>
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 inset-x-0 px-8 pb-8 pt-24 z-30 flex flex-col gap-4 transition-all duration-500 bg-gradient-to-t from-black/90 via-black/40 to-transparent ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
        {/* Progress Bar */}
        <div
          className="w-full flex items-center gap-4 group cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            seekTo(e.clientX, e.currentTarget.querySelector('[data-track]') as HTMLDivElement);
          }}
        >
          <span className="text-white text-sm font-medium w-12 text-right">{formatTime(currentTime)}</span>
          <div data-track className="flex-1 h-1.5 bg-white/20 rounded-full relative group-hover:h-2.5 transition-all">
            <div className="absolute inset-y-0 left-0 bg-red-600 rounded-full" style={{ width: `${progressPercent}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${progressPercent}%` }} />
          </div>
          <span className="text-white text-sm font-medium w-12">{formatTime(duration)}</span>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-between mt-2 relative">
          <div className="flex items-center gap-6">
            <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="text-white hover:text-zinc-300 transition">
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); skipForward(); }} className="text-white hover:text-zinc-300 transition">
              <SkipForward className="w-7 h-7 fill-current" />
            </button>
            <div className="flex items-center gap-3 group">
              <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="text-white hover:text-zinc-300 transition">
                {isMuted ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
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
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/10 transition text-left"
                    >
                      <span>{speed === 1 ? '1.0x (Normal)' : `${speed}x`}</span>
                      {playbackSpeed === speed && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
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
