import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { QuickState } from '@/lib/types';
import { STATE_DEFS } from '@/lib/states';
import { cn } from '@/lib/utils';

interface OrbVideoProps {
  state?: QuickState;
  className?: string;
  /** Pixel size for both width & height. Defaults to 96. */
  size?: number;
}

// Preload all orb videos once so swaps are instant + autoplay-safe on mobile.
let preloaded = false;
function preloadOrbVideos() {
  if (preloaded || typeof document === 'undefined') return;
  preloaded = true;
  Object.values(STATE_DEFS).forEach((def) => {
    const v = document.createElement('video');
    v.src = def.orbVideo;
    v.preload = 'auto';
    v.muted = true;
    (v as HTMLVideoElement & { playsInline: boolean }).playsInline = true;
    v.load();
  });
}

/**
 * Living Orb — loops the state-matched mp4 muted and autoplay.
 * Crossfades between states, shows a soft fallback until the first frame is ready.
 */
const OrbVideo = React.memo(function OrbVideo({
  state = 'flat',
  className,
  size = 96,
}: OrbVideoProps) {
  const def = STATE_DEFS[state];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    preloadOrbVideos();
  }, []);

  useEffect(() => {
    setReady(false);
  }, [def.id]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // Ensure mobile autoplay constraints are met before play().
    v.muted = true;
    v.defaultMuted = true;
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // Autoplay blocked — retry on next user interaction.
          const resume = () => {
            v.play().catch(() => {});
            window.removeEventListener('touchstart', resume);
            window.removeEventListener('click', resume);
          };
          window.addEventListener('touchstart', resume, { once: true });
          window.addEventListener('click', resume, { once: true });
        });
      }
    };
    if (v.readyState >= 2) {
      setReady(true);
      tryPlay();
    } else {
      const onReady = () => {
        setReady(true);
        tryPlay();
      };
      v.addEventListener('loadeddata', onReady, { once: true });
      return () => v.removeEventListener('loadeddata', onReady);
    }
  }, [def.id]);

  return (
    <div
      className={cn('relative overflow-hidden rounded-full', className)}
      style={{ width: size, height: size }}
    >
      {/* Soft fallback shimmer while the video buffers */}
      <AnimatePresence>
        {!ready && (
          <motion.div
            key="fallback"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: [0.55, 0.9, 0.55] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/25 via-soul-violet/20 to-soul-blue/20"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="sync">
        <motion.video
          key={def.id}
          ref={videoRef}
          src={def.orbVideo}
          width={size}
          height={size}
          autoPlay
          loop
          muted
          playsInline
          {...({ 'webkit-playsinline': 'true' } as Record<string, string>)}
          disablePictureInPicture
          preload="auto"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0 h-full w-full rounded-full object-cover pointer-events-none"
          style={{
            width: size,
            height: size,
            transform: 'scale(2.2)',
            transformOrigin: 'center',
          }}
        />
      </AnimatePresence>
    </div>
  );
});

export default OrbVideo;
