import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LogoProps {
  className?: string;
  size?: number | string;
  showTagline?: boolean;
  variant?: 'full' | 'compact' | 'icon';
}

export function AeroNexLogo({ 
  className, 
  size = 52, 
  showTagline = true, 
  variant = 'full' 
}: LogoProps) {
  if (variant === 'icon') {
    return (
      <div className={cn("inline-flex items-center justify-center overflow-hidden rounded-xl", className)}>
        <img 
          src="/assets/aeronex-logo.png" 
          alt="AeroNex Icon" 
          className="object-contain"
          style={{ width: size, height: size }}
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="relative overflow-hidden rounded-xl flex items-center justify-center">
          <img 
            src="/assets/aeronex-logo.png" 
            alt="AeroNex Logo" 
            className="object-contain"
            style={{ width: size, height: size }}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-wider text-white font-['Inter',sans-serif] flex items-center">
            AERO<span className="bg-gradient-to-r from-cyan-400 to-[#1788FF] bg-clip-text text-transparent">NEX</span>
          </span>
        </div>
      </div>
    );
  }

  // Full default variant
  return (
    <div className={cn("flex items-center gap-3.5", className)}>
      <div className="relative overflow-hidden rounded-xl shrink-0">
        <img 
          src="/assets/aeronex-logo.png" 
          alt="AeroNex Logo" 
          className="object-cover rounded-xl shadow-[0_0_20px_rgba(23,136,255,0.2)]"
          style={{ width: size, height: size }}
        />
      </div>
      <div className="flex flex-col">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center leading-none">
          AERO<span className="bg-gradient-to-r from-cyan-400 to-[#1788FF] bg-clip-text text-transparent">NEX</span>
        </h1>
        {showTagline && (
          <p className="text-[11px] font-bold tracking-[0.25em] text-cyan-400 uppercase mt-1.5 flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-cyan-400 inline-block rounded-full" />
            FLY BEYOND LIMITS
            <span className="w-2 h-0.5 bg-cyan-400 inline-block rounded-full" />
          </p>
        )}
      </div>
    </div>
  );
}

export function AeroNexLogoCompact(props: LogoProps) {
  return <AeroNexLogo {...props} variant="compact" />;
}

export function AeroNexLogoIcon(props: LogoProps) {
  return <AeroNexLogo {...props} variant="icon" showTagline={false} />;
}
