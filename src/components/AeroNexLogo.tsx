import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface LogoProps {
  className?: string;
  size?: number | string;
  showTagline?: boolean;
  variant?: 'full' | 'compact' | 'icon' | 'horizontal' | 'stacked';
  alt?: string;
}

export function AeroNexLogo({ 
  className, 
  size = 42, 
  showTagline = true, 
  variant = 'full',
  alt = "AeroNex — Fly Beyond Limits"
}: LogoProps) {
  // 1. Standalone 3D Icon Variant
  if (variant === 'icon') {
    return (
      <div className={cn("inline-flex items-center justify-center shrink-0", className)}>
        <img 
          src="/assets/aeronex-icon.png" 
          alt={alt}
          className="object-contain drop-shadow-[0_0_14px_rgba(23,136,255,0.4)] transition-transform duration-300 hover:scale-105"
          style={{ width: size, height: size }}
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // 2. Vertical Stacked Artwork Variant (Centered 3D icon on top, metallic wordmark & tagline below)
  if (variant === 'stacked') {
    return (
      <div className={cn("inline-flex flex-col items-center justify-center shrink-0", className)}>
        <img 
          src="/assets/aeronex-logo.png" 
          alt={alt}
          className="aeronex-logo-dark object-contain drop-shadow-[0_4px_24px_rgba(0,163,255,0.22)] select-none"
          style={{ height: size, width: 'auto' }}
          loading="eager"
          decoding="async"
        />
        <img 
          src="/assets/aeronex-logo-light.png" 
          alt={alt}
          className="aeronex-logo-light object-contain drop-shadow-[0_2px_10px_rgba(15,23,42,0.1)] select-none"
          style={{ height: size, width: 'auto' }}
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // 3. Compact Variant (Icon + Text without tagline)
  if (variant === 'compact' || !showTagline) {
    const iconDimension = typeof size === 'number' ? Math.max(28, Math.round(size * 0.85)) : size;
    return (
      <div className={cn("inline-flex items-center gap-3 shrink-0", className)}>
        <div className="relative overflow-hidden rounded-2xl flex items-center justify-center shrink-0">
          <img 
            src="/assets/aeronex-icon.png" 
            alt="AeroNex Icon" 
            className="object-contain drop-shadow-[0_0_12px_rgba(23,136,255,0.35)]"
            style={{ width: iconDimension, height: iconDimension }}
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="flex flex-col text-left select-none">
          <span className="text-2xl font-black tracking-wider text-slate-900 dark:text-white font-['Inter',sans-serif] flex items-center leading-none">
            AERO<span className="bg-gradient-to-r from-cyan-400 via-[#1788FF] to-[#4E55F5] bg-clip-text text-transparent">NEX</span>
          </span>
        </div>
      </div>
    );
  }

  // 4. Full / Horizontal Lockup (Default)
  // Renders the exact 3D emblem + metallic chrome wordmark + cyan tagline from the user's PNG artwork
  // Automatically switches to dark navy typography when light mode is active
  return (
    <div className={cn("inline-flex items-center shrink-0", className)}>
      <img 
        src="/assets/aeronex-horizontal.png" 
        alt={alt}
        className="aeronex-logo-dark object-contain drop-shadow-[0_2px_14px_rgba(0,163,255,0.2)] select-none transition-opacity duration-200"
        style={{ height: size, width: 'auto' }}
        loading="eager"
        decoding="async"
      />
      <img 
        src="/assets/aeronex-horizontal-light.png" 
        alt={alt}
        className="aeronex-logo-light object-contain drop-shadow-[0_1px_8px_rgba(15,23,42,0.08)] select-none transition-opacity duration-200"
        style={{ height: size, width: 'auto' }}
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

export function AeroNexLogoCompact(props: LogoProps) {
  return <AeroNexLogo {...props} variant="compact" showTagline={false} />;
}

export function AeroNexLogoIcon(props: LogoProps) {
  return <AeroNexLogo {...props} variant="icon" showTagline={false} />;
}

export function AeroNexLogoStacked(props: LogoProps) {
  return <AeroNexLogo {...props} variant="stacked" />;
}
