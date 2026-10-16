import React from 'react';
import { ArrowDown } from 'lucide-react';
import heroBrutalistStudio from '../assets/images/kuza_brutalist_studio_1791897575205.jpg';
import { useSiteConfig } from '../context/SiteConfigContext';
import { KuzaLogo } from './KuzaLogo';

interface HeroProps {
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  const { siteConfig } = useSiteConfig();
  const heroData = siteConfig.hero;

  const bgImage = heroData.bgImageUrl || heroBrutalistStudio;

  return (
    <section className="min-h-[560px] sm:min-h-[700px] lg:h-[calc(100vh-5rem)] w-full relative flex flex-col justify-between p-4 sm:p-8 md:p-16 lg:p-20 bg-[#101010] overflow-hidden select-none border-b border-[#34312D]">
      {/* Atmospheric Visual Layer */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-35 mix-blend-luminosity scale-105 pointer-events-none transition-transform duration-1000 ease-out"
        style={{ backgroundImage: `url(${bgImage})` }}
        role="img"
        aria-label="KŪZA Marque contemporaine tunisienne - Collection Streetwear Oversize 290 GSM"
      />
      {/* Editorial Architectural Grid Overlay & High-Contrast Dark Wabi-Sabi Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/70 to-[#101010]/50 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#101010_90%)] pointer-events-none opacity-80" />

      {/* Top Coordinate Bar */}
      <div className="relative z-10 flex items-center justify-between font-mono text-[10px] sm:text-xs text-[#96918A] tracking-[0.25em] uppercase">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-[#B9A995]" />
          <span
            className="text-[#E8E4DD] font-mono tracking-[0.25em]"
            style={{ fontFamily: "'IBM Plex Mono', 'Space Mono', monospace" }}
          >
            {heroData.coordinatesText || 'LOC: 36.8065° N, 10.1815° E / TUNIS'}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[#96918A]">
          <span>SÉRIE LIMITÉE: 180 EX.</span>
          <span>POIDS TEXTILE: 290–310 GSM</span>
          <span className="text-[#B9A995]">ARCHIVÉ MARS 2025</span>
        </div>
      </div>

      {/* Centerpiece Typography & Manifesto (Monogram removed from above title) */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-5xl mx-auto px-4 pt-10 pb-6">
        <span
          className="font-mono text-[10px] sm:text-xs text-[#B9A995] tracking-[0.4em] uppercase mb-4 sm:mb-6"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          ÉDITION ARCHIVALE SS25
        </span>

        {/* Brand Title: Official Vector Logotype KŪZA */}
        <div className="mb-4 sm:mb-6 flex flex-col items-center">
          <KuzaLogo className="h-12 md:h-16 w-auto text-[#E8E4DD] mx-auto mb-4" />
          <h1 className="sr-only">KŪZA</h1>
        </div>

        <div className="w-12 sm:w-16 h-[1px] bg-[#B9A995]/50 mb-4 sm:mb-6" />

        {/* Sub-Headline (Optima / Italic): FORM NEEDS SPACE. */}
        <p
          className="text-2xl sm:text-4xl md:text-5xl italic text-[#E8E4DD] font-light max-w-3xl leading-snug tracking-wide"
          style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
        >
          {heroData.tagline || 'FORM NEEDS SPACE.'}
        </p>

        {/* Supporting Narrative (Avenir Next W1G) */}
        <p className="font-sans text-xs sm:text-sm text-[#B9A995] tracking-[0.25em] max-w-2xl mt-4 uppercase font-medium">
          {heroData.subTagline || "MARQUE CONTEMPORAINE TUNISIENNE · DESIGN ARCHITECTURAL & COUTURE D'EXCEPTION"}
        </p>

        {/* Origin Badge */}
        <p
          className="font-mono text-[10px] sm:text-xs text-[#96918A] tracking-wider max-w-xl mt-3 uppercase font-light"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {heroData.originBadge || 'CONÇU À TUNIS · FAÇONNÉ DANS NOS ATELIERS PARTENAIRES EN TUNISIE 🇹🇳'}
        </p>
      </div>

      {/* Bottom Framing Metas & Action */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 sm:gap-6 pt-4 sm:pt-6">
        {/* Bottom Left: Collection indicator */}
        <div className="space-y-1 max-w-sm hidden sm:block">
          <div className="font-mono text-[10px] text-[#B9A995] uppercase tracking-[0.25em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9A995]" />
            <span>COLLECTION ESSENTIELS</span>
          </div>
          <p className="text-xs text-[#96918A] font-light leading-relaxed">
            ARCHIVE 01. Volumes purs et patronage architectural, façonnés avec exigence dans nos ateliers de couture partenaires à Tunis.
          </p>
        </div>

        {/* Center Subtle Progress Specimen */}
        <div className="hidden lg:flex items-center gap-4 text-[#96918A] font-mono text-xs tracking-widest">
          <span>01</span>
          <div className="w-32 h-[1px] bg-[#34312D] relative">
            <div className="absolute left-0 top-0 h-[1px] w-14 bg-[#B9A995]" />
          </div>
          <span className="text-[#E8E4DD]">02</span>
        </div>

        {/* Bottom Right: Solid Ivory CTA Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
          <div className="hidden sm:flex font-mono text-[10px] text-[#96918A] uppercase tracking-[0.22em] items-center gap-2">
            <span>CONÇU À TUNIS · FAÇONNÉ EN TUNISIE</span>
            <span>🇹🇳</span>
          </div>
          <button
            onClick={onExplore}
            className="w-full sm:w-auto h-12 md:h-14 px-8 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] font-sans font-bold text-xs uppercase tracking-[0.2em] transition-colors duration-200 flex items-center justify-center gap-3 cursor-pointer shadow-lg touch-manipulation whitespace-nowrap"
          >
            <span>{heroData.buttonText || 'EXPLORER LA COLLECTION ↓'}</span>
            <ArrowDown className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </section>
  );
};
