import { AeroNexLogo } from './AeroNexLogo';

// Backward-compatible alias for existing components
export function AirFareLogo({ className, iconSize = 48, showTagline = true }: { className?: string; iconSize?: number; showTagline?: boolean }) {
  return (
    <AeroNexLogo 
      className={className} 
      size={iconSize} 
      showTagline={showTagline} 
    />
  );
}
