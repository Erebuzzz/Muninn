import React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

// Precision geometric faceted icon suite matching the Norse Raven visual identity
export const MythicIcon = {
  // Acoustic Microphone with Runic Tuning Forks
  Mic: ({ size = 18, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <path d="M8 22h8" />
      <path d="M12 5l2 2m-4 0l2-2" strokeWidth="1.2" opacity="0.6" />
    </svg>
  ),

  // Faceted Search Oracle
  Search: ({ size = 18, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="11 3 16 6 18 11 16 16 11 19 6 16 4 11 6 6" />
      <line x1="16" y1="16" x2="22" y2="22" strokeWidth="2.2" />
      <circle cx="11" cy="11" r="2" fill="currentColor" fillOpacity="0.4" />
    </svg>
  ),

  // Runic Aegis Shield / Privacy
  Shield: ({ size = 18, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 20 5 20 11 12 22 4 11 4 5" />
      <line x1="12" y1="2" x2="12" y2="22" strokeWidth="1.2" opacity="0.5" />
      <path d="M8 8l4 3 4-3" strokeWidth="1.2" opacity="0.6" />
    </svg>
  ),

  // Living Codex / Scroll Book
  Book: ({ size = 18, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="4 4 12 2 20 4 20 20 12 18 4 20" />
      <line x1="12" y1="2" x2="12" y2="18" />
      <path d="M6 8l4-1m-4 5l4-1m6-3l4 1m-4 4l4 1" strokeWidth="1.2" opacity="0.5" />
    </svg>
  ),

  // Relational Constellation Nodes
  Constellation: ({ size = 18, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3" />
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="7" r="2" />
      <circle cx="18" cy="18" r="2" />
      <circle cx="6" cy="17" r="2" />
      <line x1="7" y1="7" x2="10" y2="10.5" strokeDasharray="1 2" />
      <line x1="17" y1="8" x2="13.5" y2="10.5" strokeDasharray="1 2" />
      <line x1="16.5" y1="16.5" x2="13.5" y2="13.5" strokeDasharray="1 2" />
      <line x1="7.5" y1="16" x2="10.5" y2="13.5" strokeDasharray="1 2" />
    </svg>
  ),

  // Temporal Clock / Timestamp Provenance
  Temporal: ({ size = 18, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 19 6 22 12 19 18 12 22 5 18 2 12 5 6" />
      <polyline points="12 6 12 12 16 14" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),

  // Dynamic Radar Antenna Pulse
  Radar: ({ size = 18, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" strokeDasharray="2 2" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <line x1="12" y1="12" x2="19" y2="6" strokeWidth="1.5" />
    </svg>
  ),

  // Celestial Sun / Helios
  Sun: ({ size = 18, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.25" />
      <line x1="12" y1="2" x2="12" y2="4" strokeWidth="2" />
      <line x1="12" y1="20" x2="12" y2="22" strokeWidth="2" />
      <line x1="2" y1="12" x2="4" y2="12" strokeWidth="2" />
      <line x1="20" y1="12" x2="22" y2="12" strokeWidth="2" />
      <line x1="4.9" y1="4.9" x2="6.3" y2="6.3" strokeWidth="2" />
      <line x1="17.7" y1="17.7" x2="19.1" y2="19.1" strokeWidth="2" />
      <line x1="4.9" y1="19.1" x2="6.3" y2="17.7" strokeWidth="2" />
      <line x1="17.7" y1="6.3" x2="19.1" y2="4.9" strokeWidth="2" />
    </svg>
  ),

  // Celestial Moon / Nyx
  Moon: ({ size = 18, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" fillOpacity="0.2" />
      <circle cx="15" cy="8" r="1" fill="currentColor" />
      <circle cx="17" cy="13" r="1.5" fill="currentColor" />
    </svg>
  ),

  // Runic Arrow Right
  ArrowRight: ({ size = 16, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="4" y1="12" x2="18" y2="12" />
      <polyline points="12 6 18 12 12 18" />
    </svg>
  ),

  // Precision Cross / Close
  Close: ({ size = 16, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),

  // Check / Verified
  Check: ({ size = 16, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),

  // Sync / Refresh Circular Conduit
  Refresh: ({ size = 16, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.5 2v6h-6" />
      <path d="M2.5 22v-6h6" />
      <path d="M21.34 15.57a10 10 0 0 1-17.9-3.57M2.66 8.43a10 10 0 0 1 17.9 3.57" />
    </svg>
  ),

  // Sovereign Sign In Gateway
  SignIn: ({ size = 16, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="15 3 21 3 21 21 15 21" strokeDasharray="30" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" strokeWidth="2" />
    </svg>
  ),

  // External Link Conduit
  External: ({ size = 14, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),

  // Tactical Terminal Prompt
  Terminal: ({ size = 16, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="3 3 21 3 21 21 3 21" />
      <polyline points="7 8 11 12 7 16" />
      <line x1="13" y1="16" x2="17" y2="16" strokeWidth="2" />
    </svg>
  ),

  // Database Vault Cylinder
  Database: ({ size = 16, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),

  // Starlight Sparkle
  Sparkle: ({ size = 16, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9" fill="currentColor" fillOpacity="0.3" />
    </svg>
  ),
};
