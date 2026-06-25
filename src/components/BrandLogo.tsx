import { useState } from 'react';
import orbLogoAsset from '@/assets/inner-wake-logo-transparent.png.asset.json';
import localOrbLogo from '@/assets/inner-wake-orb-logo.png';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<Size, string> = {
  // Inline / decorative
  xs: 'h-3 w-3',
  // Small badge
  sm: 'h-10 w-10',
  // Header / form
  md: 'h-44 w-44 sm:h-52 sm:w-52 md:h-60 md:w-60',
  // Landing hero
  lg: 'h-52 w-52 sm:h-60 sm:w-60 md:h-72 md:w-72',
  // Splash
  xl: 'h-64 w-64 sm:h-72 sm:w-72 md:h-80 md:w-80',
};

// Per-size internal padding so the orb sits cleanly inside its box without
// touching the edges at any breakpoint. PNG already has transparent bleed,
// but a tiny inset prevents anti-aliased pixels from clipping.
const PADDING_CLASSES: Record<Size, string> = {
  xs: 'p-0',
  sm: 'p-1',
  md: 'p-2 sm:p-2.5 md:p-3',
  lg: 'p-2.5 sm:p-3 md:p-4',
  xl: 'p-3 sm:p-4 md:p-5',
};

// Tuned shadow: softer than drop-shadow-2xl so the logo lifts off the dark
// background without producing a hard halo. Inline filter for fine control.
const SHADOW_STYLE: React.CSSProperties = {
  filter:
    'drop-shadow(0 6px 18px rgba(0,0,0,0.45)) drop-shadow(0 2px 6px rgba(201,148,58,0.18))',
};

interface BrandLogoProps {
  size?: Size;
  alt?: string;
  className?: string;
  withShadow?: boolean;
}

/**
 * Shared Inner Wake brand logo.
 * - Tries CDN asset first (production), falls back to bundled local PNG
 *   so the logo renders in the sandbox preview and offline.
 * - Responsive sizing presets with matching padding rules.
 */
export default function BrandLogo({
  size = 'md',
  alt = 'Inner Wake',
  className = '',
  withShadow = true,
}: BrandLogoProps) {
  const [src, setSrc] = useState<string>(orbLogoAsset.url);

  return (
    <div className={`${SIZE_CLASSES[size]} ${PADDING_CLASSES[size]} ${className}`}>
      <img
        src={src}
        alt={alt}
        onError={() => {
          if (src !== localOrbLogo) setSrc(localOrbLogo);
        }}
        className="h-full w-full object-contain"
        style={withShadow ? SHADOW_STYLE : undefined}
        draggable={false}
      />
    </div>
  );
}
