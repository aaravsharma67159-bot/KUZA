import React from 'react';
import textileImage from '../assets/images/kuza_textile_macro_1791199876246.jpg';
import { KuzaMonogram } from './KuzaMonogram';
import { useSiteConfig } from '../context/SiteConfigContext';

export const Manifesto: React.FC = () => {
  const { siteConfig } = useSiteConfig();
  const philo = siteConfig.philosophie;

  return (
    <section
      id="philosophie"
      className="w-full border-b border-[#34312D] bg-[#101010] py-24 md:py-28"
    >
      <div className="max-w-[1920px] mx-auto px-6 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#34312D] pb-6 mb-12 gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#141414] border border-[#34312D] shrink-0 hidden sm:block">
              <KuzaMonogram className="w-8 h-8 text-[#B9A995]" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#B9A995] font-mono block">
                {philo?.subTitle || 'Philosophie // Identité'}
              </span>
              <h2
                className="text-3xl md:text-5xl font-serif text-[#E8E4DD] mt-1 uppercase tracking-tight"
                style={{ fontFamily: "'Playfair Display', 'Optima', 'Cormorant Garamond', serif" }}
              >
                {philo?.headline || 'FORM NEEDS SPACE.'}
              </h2>
            </div>
          </div>
          <span className="text-xs uppercase tracking-widest text-[#96918A] font-mono">
            {philo?.originBadge || 'KŪZA · Tunisie 🇹🇳'}
          </span>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Textile Texture Macro */}
          <div className="lg:col-span-5 relative">
            <div className="relative overflow-hidden group aspect-[4/3] bg-[#181818] border border-[#34312D]">
              <img
                src={textileImage}
                alt="Détail de la matière · Coton gratté 290 GSM KŪZA"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover contrast-110 transition-transform duration-700 ease-out group-hover:scale-105 transform-gpu backface-hidden will-change-transform"
                style={{ filter: 'none' }}
              />
              <div className="absolute bottom-3 left-3 bg-[#101010]/85 border border-[#34312D] px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase text-[#E8E4DD] pointer-events-none select-none">
                Coton gratté · 290 GSM
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-[#96918A] font-mono">
              <span>Coton gratté : 290 GSM</span>
              <span>Confort au quotidien</span>
            </div>
          </div>

          {/* Right Column: Editorial Prose */}
          <div className="lg:col-span-7 space-y-6 text-[#96918A] text-sm md:text-base leading-relaxed font-light">
            <p className="text-lg md:text-xl text-[#E8E4DD] font-serif leading-snug">
              {philo?.quote || "« Le vêtement ne doit pas contraindre la silhouette. Il accompagne le corps, lui offre du confort et laisse à la forme l'espace nécessaire. »"}
            </p>

            <div className="space-y-4 font-light">
              <p className="text-sm md:text-base text-[#E8E4DD]/90 leading-relaxed whitespace-pre-line">
                {philo?.paragraph || "Marque tunisienne contemporaine, KŪZA explore un vestiaire pensé autour du confort et de la simplicité. Nos pièces privilégient des volumes équilibrés qui laissent de l'espace au corps, façonnés dans un coton gratté de 290 GSM."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-[#181818] border border-[#34312D]">
                  <h3 className="text-sm font-serif font-bold text-[#B9A995] mb-1">KŪ (空)</h3>
                  <p className="text-xs text-[#96918A]">L'espace et le vide. Des volumes pensés pour laisser au corps son aisance naturelle.</p>
                </div>
                <div className="p-4 bg-[#181818] border border-[#34312D]">
                  <h3 className="text-sm font-serif font-bold text-[#B9A995] mb-1">ZA (座)</h3>
                  <p className="text-xs text-[#96918A]">La place, l'assise et l'ancrage. La présence sobre et le tombé du vêtement.</p>
                </div>
                <div className="p-4 bg-[#181818] border border-[#34312D]">
                  <h3 className="text-sm font-serif font-bold text-[#B9A995] mb-1">VALEUR</h3>
                  <p className="text-xs text-[#96918A]">Une recherche de simplicité au quotidien, guidée par le confort et la justesse des formes.</p>
                </div>
              </div>
              <p className="pt-2 text-xs font-mono tracking-widest uppercase text-[#B9A995]">
                DÉCLARATION D'INTENTION : FORM NEEDS SPACE.
              </p>
            </div>

            {/* Principles Triple */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-[#34312D]">
              <div>
                <h4 className="text-xs uppercase tracking-widest font-mono text-[#E8E4DD]">
                  01. Sobriété
                </h4>
                <p className="text-xs text-[#96918A] mt-1.5">
                  Une esthétique minimaliste où le vêtement s'exprime par sa ligne et ses proportions.
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-widest font-mono text-[#E8E4DD]">
                  02. Matière
                </h4>
                <p className="text-xs text-[#96918A] mt-1.5">
                  Un coton gratté en 290 GSM, choisi pour sa texture douce et son confort au porté.
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-widest font-mono text-[#E8E4DD]">
                  03. Présence
                </h4>
                <p className="text-xs text-[#96918A] mt-1.5">
                  Des coupes contemporaines inspirées d'un wabi-sabi discret, conçues en Tunisie pour le quotidien.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
