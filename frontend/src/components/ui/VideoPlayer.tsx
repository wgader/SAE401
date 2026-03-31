import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FiPlay, FiPause, FiMaximize, FiVolume2, FiVolumeX, FiSettings, FiExternalLink } from 'react-icons/fi';
import { cn } from '../../lib/utils';

interface VideoPlayerProps {
  src: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => { });
        else video.pause();
      },
      { threshold: 0.1 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  const revealControls = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 2500);
  }, []);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    revealControls();
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime, duration: total } = videoRef.current;
      if (!isNaN(total) && total > 0) setProgress((currentTime / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (videoRef.current && duration) {
      videoRef.current.currentTime = (parseFloat(e.target.value) / 100) * duration;
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (containerRef.current) {
      if (document.fullscreenElement) document.exitFullscreen();
      else containerRef.current.requestFullscreen();
    }
  };

  const togglePiP = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) await document.exitPictureInPicture();
        else await videoRef.current.requestPictureInPicture();
      } catch (err) {
        console.error('PiP error:', err);
      }
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full bg-black cursor-pointer rounded-xl overflow-hidden select-none flex items-center justify-center', className)}
      style={{ minHeight: '12.5rem', maxHeight: '37.5rem' }}
      onClick={togglePlay}
      onMouseMove={revealControls}
      onMouseLeave={() => { if (hideTimer.current) clearTimeout(hideTimer.current); setShowControls(false); }}
    >
      <video
        ref={videoRef}
        src={src}
        className="max-w-full max-h-full w-auto h-auto object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
      />

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-0.875rem">
          <p className="m-0">Impossible de charger la vidéo.</p>
        </div>
      )}

      {/* Controls bar — appears on hover, hides after 2.5s with slide animation */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute bottom-50 left-0 right-0 z-20 flex flex-col gap-2"
            style={{
              padding: '2.5rem 0.75rem 0.75rem',
              background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)',
            }}
            onClick={e => e.stopPropagation()}
            onMouseMove={e => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div className="relative h-1 w-full bg-white/25 rounded-full">
              <div
                className="absolute top-0 left-0 h-full bg-white rounded-full pointer-events-none"
                style={{ width: `${progress}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                step="0.01"
                value={progress}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {/* Controls row */}
            <div className=" flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="hover:opacity-75 transition-opacity focus:outline-none">
                  {isPlaying
                    ? <FiPause style={{ width: 22, height: 22, strokeWidth: 2.5 }} />
                    : <FiPlay style={{ width: 22, height: 22, strokeWidth: 2.5, fill: 'white' }} />
                  }
                </button>
                <time className="text-white text-0.8125rem font-semibold letter-spacing-[0.02em] opacity-90 font-variant-numeric-tabular-nums">
                  {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                </time>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={toggleMute} className="hover:opacity-75 transition-opacity focus:outline-none">
                  {isMuted
                    ? <FiVolumeX style={{ width: 20, height: 20, strokeWidth: 2 }} />
                    : <FiVolume2 style={{ width: 20, height: 20, strokeWidth: 2 }} />
                  }
                </button>
                <button className="hover:opacity-75 transition-opacity focus:outline-none">
                  <FiSettings style={{ width: 20, height: 20, strokeWidth: 2 }} />
                </button>
                <button onClick={togglePiP} className="hover:opacity-75 transition-opacity focus:outline-none">
                  <FiExternalLink style={{ width: 20, height: 20, strokeWidth: 2 }} />
                </button>
                <button onClick={toggleFullscreen} className="hover:opacity-75 transition-opacity focus:outline-none">
                  <FiMaximize style={{ width: 20, height: 20, strokeWidth: 2 }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
