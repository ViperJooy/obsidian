"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  Loader2,
  X,
  Rewind,
  FastForward,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { emby } from "@/services/emby";
import Hls from "hls.js";
import { useTranslation } from "react-i18next";

interface WatchPageProps {
  onBack: () => void;
  itemId: string;
}

export default function WatchPage({ onBack, itemId }: WatchPageProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playSessionIdRef = useRef<string>(Date.now().toString());
  const hasReportedStartRef = useRef(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [item, setItem] = useState<any>(null);
  const [playbackInfo, setPlaybackInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [skipInterval, setSkipInterval] = useState(15);

  // Fetch item and playback info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemData, pbInfo] = await Promise.all([
          emby.getItem(itemId),
          emby.getPlaybackInfo(itemId)
        ]);
        setItem(itemData);
        setPlaybackInfo(pbInfo);
      } catch (err) {
        console.error("Failed to fetch item:", err);
        setError("Failed to load video info");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [itemId]);

  // Initialize player
  useEffect(() => {
    if (!item || !playbackInfo || !videoRef.current) return;

    const video = videoRef.current;
    const mediaSource = playbackInfo.MediaSources?.[0];
    if (!mediaSource) {
      setError("No media source available");
      return;
    }
    
    const container = mediaSource.Container;
    let streamUrl: string;
    
    if (container === 'mp4' || container === 'webm') {
      streamUrl = emby.getDirectStreamUrl(itemId, mediaSource.Id);
    } else {
      streamUrl = emby.getStreamWithTranscodeUrl(itemId, mediaSource.Id);
    }
    
    console.log("Stream URL:", streamUrl);
    console.log("Container:", container);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // For direct playback (browser-native formats)
    if (container === 'mp4' || container === 'webm') {
      const onLoadedMetadata = () => {
        console.log("MP4 metadata loaded, duration:", video.duration);
        setDuration(video.duration);
        setIsBuffering(false);
        
        const resumePositionTicks = item?.UserData?.PlaybackPositionTicks || 0;
        if (resumePositionTicks > 0 && !hasReportedStartRef.current) {
          video.currentTime = resumePositionTicks / 10000000;
        }

        // Autoplay
        video.play().catch(e => {
          console.log("Autoplay prevented, waiting for user interaction:", e);
        });
      };
      
      const onDurationChange = () => {
        setDuration(video.duration);
      };
      
      const onTimeUpdate = () => {
        setCurrentTime(video.currentTime);
        if (video.duration > 0) {
          setProgress((video.currentTime / video.duration) * 100);
        }
      };
      
      const onCanPlay = () => {
        console.log("MP4 can play");
        setIsBuffering(false);
      };
      
      const onWaiting = () => {
        console.log("MP4 buffering...");
        setIsBuffering(true);
      };
      
      const onPlaying = () => {
        console.log("MP4 playing");
        setIsPlaying(true);
        setIsBuffering(false);
        setHasStarted(true);
        
        // Report playback start to Emby
        if (!hasReportedStartRef.current && mediaSource) {
          hasReportedStartRef.current = true;
          playSessionIdRef.current = Date.now().toString();
          emby.reportPlaybackStart({
            ItemId: itemId,
            MediaSourceId: mediaSource.Id,
            PlaySessionId: playSessionIdRef.current,
            PositionTicks: Math.floor(video.currentTime * 10000000),
          });
        }
      };

      const onPause = () => {
        console.log("MP4 paused");
        setIsPlaying(false);
        // Progress will be reported by the interval
      };

      const onEnded = () => {
        console.log("MP4 ended");
        setIsPlaying(false);
        
        // Report playback stopped
        if (mediaSource) {
          emby.reportPlaybackStopped({
            ItemId: itemId,
            MediaSourceId: mediaSource.Id,
            PlaySessionId: playSessionIdRef.current,
            PositionTicks: Math.floor(video.duration * 10000000),
          });
          emby.markAsPlayed(itemId);
        }
      };

      const onVolumeChange = () => {
        setVolume(video.volume);
        setIsMuted(video.muted);
      };
      
      const onError = () => {
        console.error("Video error:", video.error);
        setIsBuffering(false);
        if (video.error) {
          switch (video.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              setError("Playback was aborted");
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              setError("Network error - unable to load video.");
              break;
            case MediaError.MEDIA_ERR_DECODE:
              setError("Video decoding error");
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              setError("Video format not supported");
              break;
            default:
              setError("Video playback error");
          }
        }
      };
      
      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('durationchange', onDurationChange);
      video.addEventListener('timeupdate', onTimeUpdate);
      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('waiting', onWaiting);
      video.addEventListener('playing', onPlaying);
      video.addEventListener('pause', onPause);
      video.addEventListener('ended', onEnded);
      video.addEventListener('volumechange', onVolumeChange);
      video.addEventListener('error', onError);
      
      video.src = streamUrl;
      video.load();
      
      return () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('durationchange', onDurationChange);
        video.removeEventListener('timeupdate', onTimeUpdate);
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('waiting', onWaiting);
        video.removeEventListener('playing', onPlaying);
        video.removeEventListener('pause', onPause);
        video.removeEventListener('ended', onEnded);
        video.removeEventListener('volumechange', onVolumeChange);
        video.removeEventListener('error', onError);
        
        // Report playback stopped when leaving
        if (hasReportedStartRef.current && mediaSource) {
          emby.reportPlaybackStopped({
            ItemId: itemId,
            MediaSourceId: mediaSource.Id,
            PlaySessionId: playSessionIdRef.current,
            PositionTicks: Math.floor(video.currentTime * 10000000),
          });
          emby.updatePlaystate(itemId, Math.floor(video.currentTime * 10000000));
          
        }
      };
    }

    // HLS playback for other formats
    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest loaded");
        setIsBuffering(false);
        
        const resumePositionTicks = item?.UserData?.PlaybackPositionTicks || 0;
        if (resumePositionTicks > 0 && !hasReportedStartRef.current) {
          video.currentTime = resumePositionTicks / 10000000;
        }

        video.play().catch(e => {
          console.log("HLS Autoplay prevented, waiting for user interaction:", e);
        });
      });

      let networkErrorCount = 0;
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              networkErrorCount++;
              if (networkErrorCount > 3) {
                setError("Transcoding failed - Emby server may not be configured properly.");
              } else {
                console.log(`Network error, retrying... (${networkErrorCount}/3)`);
                hls.startLoad();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              setError(`Playback error: ${data.details}`);
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else {
      setError("HLS playback not supported in this browser");
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [item, playbackInfo, itemId]);

  // Periodic progress reporting
  useEffect(() => {
    // Only report if we have video loaded and playback has started
    if (!videoRef.current || !item || !playbackInfo) return;

    const reportProgress = () => {
      if (!videoRef.current || !playbackInfo.MediaSources?.[0]) return;
      
      const mediaSource = playbackInfo.MediaSources[0];
      const positionTicks = Math.floor(videoRef.current.currentTime * 10000000);
      
      emby.reportPlaybackProgress({
        ItemId: itemId,
        MediaSourceId: mediaSource.Id,
        PlaySessionId: playSessionIdRef.current,
        PositionTicks: positionTicks,
        IsPaused: !isPlaying,
      });
    };

    // Report immediately when playback starts
    reportProgress();

    // Set up interval for periodic reporting (every 30 seconds)
    progressIntervalRef.current = setInterval(reportProgress, 30000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [item, playbackInfo, itemId, isPlaying]);

  // Report progress when playback state changes (play/pause)
  useEffect(() => {
    if (!videoRef.current || !item || !playbackInfo) return;

    const reportProgress = () => {
      if (!videoRef.current || !playbackInfo.MediaSources?.[0]) return;
      
      const mediaSource = playbackInfo.MediaSources[0];
      const positionTicks = Math.floor(videoRef.current.currentTime * 10000000);
      
      emby.reportPlaybackProgress({
        ItemId: itemId,
        MediaSourceId: mediaSource.Id,
        PlaySessionId: playSessionIdRef.current,
        PositionTicks: positionTicks,
        IsPaused: !isPlaying,
        EventName: isPlaying ? 'Unpause' : 'Pause',
      });
    };

    reportProgress();
  }, [isPlaying, item, playbackInfo, itemId]);

  // Auto-hide controls
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = () => showControlsTemporarily();
    const handleMouseLeave = () => {
      if (isPlaying) {
        setShowControls(false);
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControlsTemporarily, isPlaying]);

  // Playback controls
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(e => console.log("Play prevented:", e));
    }
  }, [isPlaying]);

  const reportCurrentProgress = useCallback(() => {
    if (!videoRef.current || !playbackInfo?.MediaSources?.[0]) return;
    
    const mediaSource = playbackInfo.MediaSources[0];
    const positionTicks = Math.floor(videoRef.current.currentTime * 10000000);
    
    emby.reportPlaybackProgress({
      ItemId: itemId,
      MediaSourceId: mediaSource.Id,
      PlaySessionId: playSessionIdRef.current,
      PositionTicks: positionTicks,
      IsPaused: !isPlaying,
    });
  }, [itemId, playbackInfo, isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !videoRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = percent * videoRef.current.duration;
    reportCurrentProgress();
  }, [reportCurrentProgress]);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressClick(e);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!videoRef.current || !videoRef.current.duration) return;
      const bar = document.querySelector('.progress-bar');
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      videoRef.current.currentTime = percent * videoRef.current.duration;
      setProgress(percent * 100);
      setCurrentTime(videoRef.current.currentTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      reportCurrentProgress();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleProgressClick, reportCurrentProgress]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    videoRef.current.muted = newVolume === 0;
  }, []);

  // Skip forward/backward (15 seconds)
  const skipForward = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + skipInterval);
    reportCurrentProgress();
  }, [skipInterval, reportCurrentProgress]);

  const skipBackward = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - skipInterval);
    reportCurrentProgress();
  }, [skipInterval, reportCurrentProgress]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(e => console.log("Fullscreen error:", e));
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT') return;
      
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
          }
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (showSettings) {
            setShowSettings(false);
          } else if (showInfo) {
            setShowInfo(false);
          } else if (!document.fullscreenElement) {
            onBack();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skipForward, skipBackward, toggleMute, toggleFullscreen, onBack, showSettings, showInfo]);

  const formatTime = (seconds: number | null | undefined): string => {
    if (seconds === null || seconds === undefined || isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={64} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-6">
        <p className="text-red-400 text-lg">{error}</p>
        <p className="text-white/40 text-sm max-w-md text-center">
          Item ID: {itemId}
        </p>
        <button onClick={onBack} className="bg-white text-black px-6 py-2 rounded-xl font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative h-screen w-screen bg-black overflow-hidden select-none"
    >
      {/* Video Element - Layer 0 */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain"
        onClick={togglePlay}
        playsInline
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* Initial Loading Indicator - Shows before video starts */}
      {!hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-white" size={48} />
            <span className="text-white/60 text-sm">Loading video...</span>
          </div>
        </div>
      )}

      {/* Center Play Button - Layer 20 (only show after started and not playing) */}
      {hasStarted && !isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 hover:scale-105 transition-all">
            <Play size={36} fill="white" className="text-white ml-1" />
          </div>
        </div>
      )}

      {/* Top Bar - Layer 30 */}
      <div 
        className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent px-8 pt-6 flex items-center justify-between z-30 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">{item?.Name}</h1>
            <p className="text-xs text-white/60">
              {item?.Type === 'Episode' 
                ? `S${item.ParentIndexNumber}:E${item.IndexNumber} • ${item.SeriesName}` 
                : item?.ProductionYear}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Controls - Layer 30 */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-8 pb-6 flex flex-col justify-end z-30 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div 
          className="progress-bar relative w-full h-2 bg-white/20 rounded-full mb-4 cursor-pointer group hover:h-3 transition-all"
          onClick={handleProgressClick}
          onMouseDown={handleProgressMouseDown}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-accent-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progress}%`, marginLeft: '-8px' }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Skip Back (15s) */}
            <button 
              onClick={skipBackward}
              className="flex items-center justify-center text-white hover:text-accent-primary transition-colors"
              title={t('watch.skip_back', { sec: skipInterval })}
            >
              <div className="relative">
                <Rewind size={28} className="fill-current" />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ marginTop: '1px' }}>
                  {skipInterval}
                </span>
              </div>
            </button>

            {/* Play/Pause */}
            <button 
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors"
            >
              {isPlaying ? (
                <Pause size={24} fill="black" className="text-black" />
              ) : (
                <Play size={24} fill="black" className="text-black ml-1" />
              )}
            </button>

            {/* Skip Forward (15s) */}
            <button 
              onClick={skipForward}
              className="flex items-center justify-center text-white hover:text-accent-primary transition-colors"
              title={t('watch.skip_forward', { sec: skipInterval })}
            >
              <div className="relative">
                <FastForward size={28} className="fill-current" />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ marginTop: '1px' }}>
                  {skipInterval}
                </span>
              </div>
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 ml-2">
              <button 
                onClick={toggleMute}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                  [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* Time Display */}
            <span className="text-sm text-white/80 ml-3 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Info */}
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${showInfo ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'}`}
              title={t('watch.info')}
            >
              <Info size={20} />
            </button>

            {/* Settings */}
            <button 
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <Settings size={20} />
            </button>

            {/* Fullscreen */}
            <button 
              onClick={toggleFullscreen}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-neutral-900 rounded-2xl p-6 w-80 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">{t('watch.settings')}</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Skip Interval Setting */}
                <div>
                  <label className="text-sm text-white/80 mb-2 block">{t('watch.skip_interval')}</label>
                  <div className="flex gap-2">
                    {[10, 15, 30, 60].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setSkipInterval(sec)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          skipInterval === sec 
                            ? 'bg-accent-primary text-white' 
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {t("watch.sec", { sec })}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Video Info */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-white/40">{t('watch.now_playing')}</p>
                  <p className="text-sm text-white mt-1 truncate">{item?.Name}</p>
                  <p className="text-xs text-white/60 mt-1">
                    {t('watch.duration')}: {formatTime(duration)} | {t('watch.format')}: {playbackInfo?.MediaSources?.[0]?.Container?.toUpperCase()}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && playbackInfo?.MediaSources?.[0] && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-28 right-8 z-50 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-80 max-h-[calc(100vh-16rem)] overflow-y-auto shadow-2xl pointer-events-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">{t('watch.media_info')}</h2>
              <button 
                onClick={() => setShowInfo(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

              <div className="space-y-4">
                {/* Basic Info */}
                <div>
                  <h3 className="text-sm font-semibold text-white/80 mb-2">{t('watch.basic_info')}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-white/60">{t('watch.filename')}</span>
                      <span className="text-xs text-white truncate max-w-[200px]">{item?.Name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-white/60">{t('watch.container')}</span>
                      <span className="text-xs text-white font-mono uppercase">{playbackInfo.MediaSources[0].Container}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-white/60">{t('watch.duration')}</span>
                      <span className="text-xs text-white">{formatTime(duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-white/60">{t('watch.media_id')}</span>
                      <span className="text-xs text-white font-mono truncate max-w-[150px]">{playbackInfo.MediaSources[0].Id}</span>
                    </div>
                  </div>
                </div>

                {/* Video Stream */}
                {playbackInfo.MediaSources[0].MediaStreams?.filter((s: any) => s.Type === 'Video').map((video: any, idx: number) => (
                  <div key={`video-${idx}`}>
                    <h3 className="text-sm font-semibold text-white/80 mb-2">{t('watch.video_stream', { idx: idx + 1 })}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">{t('watch.codec')}</span>
                        <span className="text-xs text-white font-mono">{video.Codec}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">{t('watch.resolution')}</span>
                        <span className="text-xs text-white">{video.Width}×{video.Height}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">{t('watch.bitrate')}</span>
                        <span className="text-xs text-white">{video.BitRate ? `${Math.round(video.BitRate / 1000)} kbps` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">{t('watch.framerate')}</span>
                        <span className="text-xs text-white">{video.FrameRate ? `${video.FrameRate} fps` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">{t('watch.pixel_format')}</span>
                        <span className="text-xs text-white">{video.PixelFormat || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">{t('watch.aspect_ratio')}</span>
                        <span className="text-xs text-white">{video.AspectRatio || 'N/A'}</span>
                      </div>
                      {video.VideoRange && (
                        <div className="flex justify-between">
                          <span className="text-xs text-white/60">{t('watch.color_range')}</span>
                          <span className="text-xs text-white">{video.VideoRange}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Audio Streams */}
                {playbackInfo.MediaSources[0].MediaStreams?.filter((s: any) => s.Type === 'Audio').map((audio: any, idx: number) => (
                  <div key={`audio-${idx}`}>
                    <h3 className="text-sm font-semibold text-white/80 mb-2">{t('watch.audio_stream', { idx: idx + 1 })}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">{t('watch.codec')}</span>
                        <span className="text-xs text-white font-mono">{audio.Codec}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">{t('watch.channels')}</span>
                        <span className="text-xs text-white">{audio.Channels ? t('watch.channels', { channels: audio.Channels }) : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">{t('watch.samplerate')}</span>
                        <span className="text-xs text-white">{audio.SampleRate ? `${audio.SampleRate} Hz` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">{t('watch.bitrate')}</span>
                        <span className="text-xs text-white">{audio.BitRate ? `${Math.round(audio.BitRate / 1000)} kbps` : 'N/A'}</span>
                      </div>
                      {audio.Language && (
                        <div className="flex justify-between">
                          <span className="text-xs text-white/60">{t('watch.language')}</span>
                          <span className="text-xs text-white">{audio.Language}</span>
                        </div>
                      )}
                      {audio.Default && (
                        <div className="flex justify-between">
                          <span className="text-xs text-white/60">{t('watch.is_default')}</span>
                          <span className="text-xs text-white">{t('watch.yes')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Subtitle Streams */}
                {playbackInfo.MediaSources[0].MediaStreams?.filter((s: any) => s.Type === 'Subtitle').map((sub: any, idx: number) => (
                  <div key={`sub-${idx}`}>
                    <h3 className="text-sm font-semibold text-white/80 mb-2">{t('watch.subtitle_stream', { idx: idx + 1 })}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">{t('watch.codec')}</span>
                        <span className="text-xs text-white font-mono">{sub.Codec}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">{t('watch.language')}</span>
                        <span className="text-xs text-white">{sub.Language || 'N/A'}</span>
                      </div>
                      {sub.Default && (
                        <div className="flex justify-between">
                          <span className="text-xs text-white/60">{t('watch.is_default')}</span>
                          <span className="text-xs text-white">{t('watch.yes')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* No Media Streams */}
                {!playbackInfo.MediaSources[0].MediaStreams?.length && (
                  <div className="text-center py-4">
                    <p className="text-xs text-white/40">{t('watch.no_streams')}</p>
                  </div>
                )}

                {/* Additional Info */}
                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-white/80 mb-2">{t('watch.additional_info')}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-white/60">{t('watch.play_method')}</span>
                      <span className="text-xs text-white">{playbackInfo.MediaSources[0].SupportsDirectStream ? t('watch.direct_play') : t('watch.transcode')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-white/60">{t('watch.media_type')}</span>
                      <span className="text-xs text-white">{playbackInfo.MediaSources[0].MediaType || 'N/A'}</span>
                    </div>
                    {playbackInfo.MediaSources[0].Size && (
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">{t('watch.file_size')}</span>
                        <span className="text-xs text-white">{(playbackInfo.MediaSources[0].Size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
