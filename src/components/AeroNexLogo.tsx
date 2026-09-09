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
  size = 46, 
  showTagline = true, 
  variant = 'full' 
}: LogoProps) {
  if (variant === 'icon') {
    return (
      <div className={cn("inline-flex items-center justify-center overflow-hidden rounded-2xl", className)}>
        <img 
          src="/assets/aeronex-icon.png" 
          alt="AeroNex Icon" 
          className="object-contain drop-shadow-[0_0_12px_rgba(23,136,255,0.4)]"
          style={{ width: size, height: size }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/aeronex-logo.png';
          }}
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="relative overflow-hidden rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/20 shadow-[0_0_15px_rgba(23,136,255,0.25)]">
          <img 
            src="/assets/aeronex-icon.png" 
            alt="AeroNex Logo" 
            className="object-contain"
            style={{ width: size, height: size }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/aeronex-logo.png';
            }}
          />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-2xl font-black tracking-wider text-white font-['Inter',sans-serif] flex items-center leading-none">
            AERO<span className="bg-gradient-to-r from-cyan-400 via-[#1788FF] to-[#4E55F5] bg-clip-text text-transparent">NEX</span>
          </span>
        </div>
      </div>
    );
  }

  // Full default variant
  return (
    <div className={cn("flex items-center gap-3.5", className)}>
      <div className="relative overflow-hidden rounded-2xl shrink-0 border border-blue-500/30 shadow-[0_0_20px_rgba(23,136,255,0.35)] bg-[#040D24]/60 p-0.5">
        <img 
          src="/assets/aeronex-icon.png" 
          alt="AeroNex Logo" 
          className="object-contain rounded-xl"
          style={{ width: size, height: size }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/aeronex-logo.png';
          }}
        />
      </div>
      <div className="flex flex-col text-left">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center leading-none">
          AERO<span className="bg-gradient-to-r from-cyan-400 via-[#1788FF] to-[#4E55F5] bg-clip-text text-transparent">NEX</span>
        </h1>
        {showTagline && (
          <p className="text-[10px] font-extrabold tracking-[0.22em] text-cyan-400 uppercase mt-1 flex items-center gap-1.5 leading-tight">
            <span className="w-1.5 h-0.5 bg-cyan-400 inline-block rounded-full" />
            FLY BEYOND LIMITS
            <span className="w-1.5 h-0.5 bg-cyan-400 inline-block rounded-full" />
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
