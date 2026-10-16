import React from 'react';
import atelierDefaultImage from '../assets/images/kuza_atelier_tunisia_1791199887567.jpg';
import { KuzaMonogram } from './KuzaMonogram';
import { useSiteConfig } from '../context/SiteConfigContext';

export const AtelierSection: React.FC = () => {
  const { siteConfig } = useSiteConfig();
  const atelier = siteConfig.atelier;
  const photoSrc = atelier?.photoUrl || atelierDefaultImage;

  return (
    <section
      id="editorial"
      className="relative w-full border-b border-[#34312D] bg-[#101010] py-24 md:py-28"
    >
      <div id="lookbook" className="absolute -top-20" />
      <div className="max-w-[1920px] mx-auto px-6 lg:px-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#34312D] pb-6 mb-12 gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#141414] border border-[#34312D] shrink-0 hidden sm:block">
              <KuzaMonogram className="w-8 h-8 text-[#B9A995]" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#B9A995] font-mono block">
                {atelier?.subTitle || 'MANUFACTURE ARCHITECTURALE // ÉDITORIAL'}
              </span>
              <h2
                className="text-3xl md:text-5xl font-serif text-[#E8E4DD] mt-1 uppercase tracking-tight"
              >
                {atelier?.title || 'Philosophie & Confection Tunisienne'}
              </h2>
            </div>
          </div>
          <span className="text-xs uppercase tracking-widest text-[#96918A] font-mono">
            Tunisie 🇹🇳 · Confection à échelle humaine
          </span>
        </div>

        {/* Top Grid: Atelier Visual + Story */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-12">
          <div className="lg:col-span-7 relative">
            <div className="relative overflow-hidden group aspect-[16/10] bg-[#181818] border border-[#34312D]">
              <img
                src={photoSrc}
                alt="Atelier de confection textile indépendant à Tunis - Couture artisanale KŪZA"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover contrast-105 transition-transform duration-700 ease-out group-hover:scale-105 transform-gpu backface-hidden will-change-transform"
                style={{ filter: 'none' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101010]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 text-xs font-mono tracking-widest uppercase text-[#E8E4DD] bg-[#101010]/80 px-3 py-1 border border-[#34312D] pointer-events-none select-none">
                {atelier?.badge || 'ATELIER 01 — TUNIS SUD · CONTRÔLE QUALITÉ'}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5 text-xs md:text-sm text-[#96918A] leading-relaxed font-light">
            <h3
              className="text-xl md:text-3xl font-serif text-[#E8E4DD]"
            >
              L'excellence textile au cœur de la Méditerranée
            </h3>
            <p className="whitespace-pre-line">
              {atelier?.narrative || "Chaque vêtement KŪZA défie l'obsolescence de l'industrie textile standard. Nous refusons les matières plastiques synthétiques et les coupes réductrices. Nos pièces sont développées à échelle 1:1 sur mannequin vivant dans nos ateliers historiques de Tunis.\n\nDe la découpe des patrons aux derniers points de broderie, chaque étape est exécutée dans un rayon resserré, sans sous-traitance opaque ni surproduction."}
            </p>
            <p>
              De la découpe des patrons aux derniers points de broderie, chaque étape est exécutée dans un rayon resserré, sans sous-traitance opaque ni surproduction.
            </p>

            <div className="p-4 bg-[#181818] border border-[#34312D] space-y-2 text-xs">
              <span className="text-[#B9A995] font-mono uppercase tracking-wider block">
                Engagements de Traçabilité Totale
              </span>
              <ul className="space-y-1.5 text-[#E8E4DD] text-[11px]">
                <li>✦ 100% de la confection réalisée en Tunisie</li>
                <li>✦ Teintures certifiées sans métaux lourds</li>
                <li>✦ Séries mesurées pour zéro gaspillage textile</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Confection Atelier Metrics Banner from Stitch */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#141414] border border-[#34312D] p-6 lg:p-8 mb-16">
          <div className="p-4 flex flex-col gap-1 border-r border-[#34312D]/40">
            <div className="flex items-center gap-2 text-[#B9A995] mb-1 font-mono text-[10px] tracking-widest uppercase">
              <span>GRAMMAGE</span>
            </div>
            <span className="font-serif text-2xl text-[#E8E4DD]">
              290–310 GSM
            </span>
            <span className="text-xs text-[#96918A]">Densité supérieure compacte, infroissable et isolante.</span>
          </div>

          <div className="p-4 flex flex-col gap-1 border-r border-[#34312D]/40">
            <div className="flex items-center gap-2 text-[#B9A995] mb-1 font-mono text-[10px] tracking-widest uppercase">
              <span>QUALITÉ TEXTILE</span>
            </div>
            <span className="font-serif text-2xl text-[#E8E4DD]">
              290 GSM
            </span>
            <span className="text-xs text-[#96918A]">Matière premium · 290 GSM peignée, filée sans aucun polyester.</span>
          </div>

          <div className="p-4 flex flex-col gap-1 border-r border-[#34312D]/40">
            <div className="flex items-center gap-2 text-[#B9A995] mb-1 font-mono text-[10px] tracking-widest uppercase">
              <span>LOCALISATION</span>
            </div>
            <span className="font-serif text-2xl text-[#E8E4DD]">
              CIRCUIT COURT
            </span>
            <span className="text-xs text-[#96918A]">Filage, coupe et couture à moins de 35 km de Tunis.</span>
          </div>

          <div className="p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#B9A995] mb-1 font-mono text-[10px] tracking-widest uppercase">
              <span>LOGISTIQUE</span>
            </div>
            <span className="font-serif text-2xl text-[#E8E4DD]">
              24–48 HEURES
            </span>
            <span className="text-xs text-[#96918A]">Expédition express sécurisée sur toute la Tunisie.</span>
          </div>
        </div>

        {/* Section: Artisanat, Matière & Coupe */}
        <div id="details" className="pt-12 border-t border-[#34312D] space-y-8">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#96918A] font-mono block">
              SAVOIR-FAIRE & EXIGENCE
            </span>
            <h3
              className="text-2xl font-serif text-[#E8E4DD] mt-1"
            >
              Matière & Confection d'Atelier
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 01: Étoffe & Densité (290 GSM) */}
            <div className="p-6 bg-[#181818] border border-[#34312D] flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between border-b border-[#34312D]/60 pb-3 mb-4">
                  <span className="text-xs uppercase font-mono tracking-widest text-[#B9A995]">
                    Étoffe & Densité
                  </span>
                  <span className="text-xs font-mono text-[#96918A]">290 GSM</span>
                </div>

                <div className="space-y-3">
                  <h4 className="font-serif text-xl text-[#E8E4DD]">
                    Étoffe & Densité (290 GSM)
                  </h4>
                  <p className="text-xs text-[#96918A] leading-relaxed font-light">
                    Sélectionnée pour sa tenue structurée et son toucher naturel. Un textile lourd pensé pour offrir confort, chaleur et pérennité sans déformer la silhouette.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#101010] border border-[#34312D] text-xs font-mono text-[#96918A]">
                290 GSM · Structure & Douceur
              </div>
            </div>

            {/* Card 02: Confection Localisée & Détails */}
            <div className="p-6 bg-[#181818] border border-[#34312D] flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between border-b border-[#34312D]/60 pb-3 mb-4">
                  <span className="text-xs uppercase font-mono tracking-widest text-[#B9A995]">
                    Provenance
                  </span>
                  <span className="text-xs font-mono text-[#96918A]">Circuit Court</span>
                </div>

                <div className="space-y-3">
                  <h4 className="font-serif text-xl text-[#E8E4DD]">
                    Confection Localisée & Détails
                  </h4>
                  <p className="text-xs text-[#96918A] leading-relaxed font-light">
                    Assemblé en Tunisie avec une attention méticuleuse portée aux coutures renforcées, aux finitions intérieures douces et aux proportions décontractées.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#101010] border border-[#34312D] text-xs font-mono text-[#96918A]">
                Made in Tunisia 🇹🇳 · Traçabilité
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
