import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { QuickState } from '@/lib/types';
import { STATE_DEFS } from '@/lib/states';
import { cn } from '@/lib/utils';

interface OrbVideoProps {
  state?: QuickState;
  className?: string;
  /** Optional pixel size for both width & height. If omitted, the orb fills its parent. */
  size?: number;
}

// Preload orb videos once so swaps are instant. Skipped on iOS/Safari, where
// five simultaneous media elements starve the decoder and break playback.
let preloaded = false;
const isAppleWebkit = () =>
  typeof navigator !== 'undefined' &&
  /iP(hone|ad|od)/.test(navigator.userAgent) ||
  (typeof navigator !== 'undefined' &&
    /Safari/.test(navigator.userAgent) &&
    !/Chrome|Chromium|Android/.test(navigator.userAgent));

function preloadOrbVideos() {
  if (preloaded || typeof document === 'undefined' || isAppleWebkit()) return;
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
  size,
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

  const hasExplicitSize = typeof size === 'number';
  const wrapperStyle = hasExplicitSize ? { width: size, height: size } : undefined;

  return (
    <div
      className={cn('relative overflow-hidden rounded-full isolate', className)}
      style={{
        ...wrapperStyle,
        // border-radius alone doesn't always clip a transformed <video>;
        // clip-path guarantees the circle on every engine.
        clipPath: 'circle(50% at 50% 50%)',
      }}
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
          className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full object-cover object-center pointer-events-none"
          style={{
            transform: 'translate(-50%, -50%) scale(1.6)',
            transformOrigin: 'center center',
          }}
        />
      </AnimatePresence>
    </div>
  );
});

export default OrbVideo;
