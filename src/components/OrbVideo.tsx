import React from 'react';
import type { QuickState } from '@/lib/types';
import { STATE_DEFS } from '@/lib/states';
import { cn } from '@/lib/utils';

interface OrbVideoProps {
  state?: QuickState;
  className?: string;
  /** Pixel size for both width & height. Defaults to 96. */
  size?: number;
}

/**
 * Living Orb — loops the state-matched mp4 muted and autoplay.
 * Falls back to the static png if the video can't load.
 */
const OrbVideo = React.memo(function OrbVideo({
  state = 'flat',
  className,
  size = 96,
}: OrbVideoProps) {
  const def = STATE_DEFS[state];
  return (
    <video
      key={def.id}
      src={def.orbVideo}
      width={size}
      height={size}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      className={cn('rounded-full object-cover pointer-events-none', className)}
      style={{ width: size, height: size }}
    />
  );
});

export default OrbVideo;
