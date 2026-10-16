import React, { useState } from 'react';
import { Sparkles, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product, ProductColor } from '../data/products';
import { InventoryMap } from '../types';
import { formatTND } from '../utils/currency';
import { useSiteConfig } from '../context/SiteConfigContext';
import shelterSweatNoir from '../assets/images/shelter_sweat_noir_1791729594321.jpg';
import shelterSweatBeige from '../assets/images/shelter_sweat_beige_1791729629495.jpg';
import restWideNoir from '../assets/images/rest_wide_noir_1791729608671.jpg';
import restWideBeige from '../assets/images/rest_wide_beige_1791729647894.jpg';

interface BundleBannerProps {
  products: Product[];
  inventory?: InventoryMap;
  onAddBundleToCart: (sweatColor: ProductColor, sweatSize: string, wideColor: ProductColor, wideSize: string) => void;
  onSelectProduct?: (product: Product, color?: ProductColor) => void;
}

export const BundleBanner: React.FC<BundleBannerProps> = ({
  products,
  inventory,
  onAddBundleToCart,
  onSelectProduct,
}) => {
  const { siteConfig } = useSiteConfig();
  const bundleData = siteConfig.bundle;

  if (!bundleData.visible) return null;
  const sweatProduct = products.find((p) => p.id === 'shelter-sweat');
  const wideProduct = products.find((p) => p.id === 'rest-wide');

  const [sweatColor, setSweatColor] = useState<ProductColor>(
    () => sweatProduct?.colors[0] || { name: 'Noir', hex: '#111111', images: [shelterSweatNoir] }
  );
  const [sweatSize, setSweatSize] = useState<string>('M');

  const [wideColor, setWideColor] = useState<ProductColor>(
    () => wideProduct?.colors[0] || { name: 'Noir', hex: '#111111', images: [restWideNoir] }
  );
  const [wideSize, setWideSize] = useState<string>('M');

  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  // Guarantee real KŪZA streetwear photography for Noir and Beige
  const sweatImage =
    sweatColor.name === 'Beige'
      ? shelterSweatBeige
      : shelterSweatNoir;

  const wideImage =
    wideColor.name === 'Beige'
      ? restWideBeige
      : restWideNoir;

  // Sanitize bundle title encoding strictly to "L'ENSEMBLE STRUCTURÉ KŪZA"
  const rawTitle = bundleData.title || "L'ENSEMBLE STRUCTURÉ KŪZA";
  const bundleTitle = rawTitle
    .replace(/STRUCTUR[\u0000-\uFFFF]?/gi, 'STRUCTURÉ')
    .replace(/STRUCTUR[^\s]*/gi, 'STRUCTURÉ')
    .replace("L'ENSEMBLE STRUCTURÉ KŪZA KŪZA", "L'ENSEMBLE STRUCTURÉ KŪZA")
    .replace("L'ENSEMBLE STRUCTURЙ KŪZA", "L'ENSEMBLE STRUCTURÉ KŪZA");

  const handleAddBundle = () => {
    onAddBundleToCart(sweatColor, sweatSize, wideColor, wideSize);
    setIsAddedSuccess(true);
    setTimeout(() => {
      setIsAddedSuccess(false);
    }, 2400);
  };

  return (
    <section
      id="bundle-set"
      className="w-full bg-[#101010] border-b border-[#34312D] py-10 sm:py-16 px-4 sm:px-6 lg:px-16"
    >
      <div className="max-w-[1920px] mx-auto">
        {/* Outer Highlight Card */}
        <div className="relative bg-[#181818] border border-[#34312D] p-5 sm:p-8 md:p-10 lg:p-12 overflow-hidden shadow-2xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#B9A995]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Pill / Badge Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#34312D]">
            <div className="inline-flex items-center gap-2">
              <span
                className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#A0988E]"
                style={{ fontFamily: "'IBM Plex Mono', 'Space Mono', monospace" }}
              >
                ✨ OFFRE EXCLUSIVE ATELIER // DUO ESSENTIEL
              </span>
            </div>

            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 border border-emerald-500/30 text-[#34D399] font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider"
              style={{ fontFamily: "'IBM Plex Mono', 'Space Mono', monospace" }}
            >
              REMISE AUTOMATIQUE DE 29,000 DT
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 items-center">
            {/* Visual Column: Dual Garment Showcase */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
              {/* Piece 1: Shelter Sweat */}
              <div className="group relative bg-[#141414] border border-[#34312D] p-3 flex flex-col justify-between">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#101010] mb-2.5">
                  <img
                    src={sweatImage}
                    alt={`KŪZA - SHELTER SWEAT ${sweatColor.name} 290 GSM`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 transform-gpu backface-hidden will-change-transform"
                    style={{ filter: 'none' }}
                  />
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#101010]/90 border border-[#34312D] text-[9px] font-mono text-[#E8E4DD] uppercase pointer-events-none">
                    01. SWEAT
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-serif text-xs sm:text-sm text-[#E8E4DD] tracking-wide">
                      SHELTER SWEAT
                    </span>
                    <span className="font-mono text-[11px] text-[#96918A] line-through">
                      79,000 DT
                    </span>
                  </div>
                  <span className="text-[10px] text-[#96918A] font-mono block">
                    290 GSM · {sweatColor.name} · {sweatSize}
                  </span>
                </div>
              </div>

              {/* Piece 2: Rest Wide */}
              <div className="group relative bg-[#141414] border border-[#34312D] p-3 flex flex-col justify-between">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#101010] mb-2.5">
                  <img
                    src={wideImage}
                    alt={`KŪZA - REST WIDE ${wideColor.name} 290 GSM`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 transform-gpu backface-hidden will-change-transform"
                    style={{ filter: 'none' }}
                  />
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#101010]/90 border border-[#34312D] text-[9px] font-mono text-[#E8E4DD] uppercase pointer-events-none">
                    02. PANTALON
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-serif text-xs sm:text-sm text-[#E8E4DD] tracking-wide">
                      REST WIDE
                    </span>
                    <span className="font-mono text-[11px] text-[#96918A] line-through">
                      85,000 DT
                    </span>
                  </div>
                  <span className="text-[10px] text-[#96918A] font-mono block">
                    290 GSM · {wideColor.name} · {wideSize}
                  </span>
                </div>
              </div>
            </div>

            {/* Content & Configuration Column */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              {/* Title & Description */}
              <div className="space-y-2">
                <h2
                  className="text-2xl sm:text-4xl lg:text-5xl font-serif text-[#E8E4DD] uppercase tracking-tight"
                  style={{ fontFamily: "'Optima', 'Cormorant Garamond', 'Playfair Display', serif" }}
                >
                  {bundleTitle}
                </h2>
                <p className="font-sans text-xs sm:text-sm uppercase tracking-[0.2em] text-[#B9A995] font-medium">
                  {bundleData.subTagline || 'SHELTER SWEAT (290 GSM) + REST WIDE (290 GSM)'}
                </p>
                <p className="text-xs sm:text-sm text-[#96918A] font-light leading-relaxed pt-1 max-w-xl">
                  {bundleData.description || "L'association architecturale complète de l'Archive 01. Deux pièces taillées dans le même molleton dense 290 GSM pour une silhouette homogène au tombé lourd et structuré."}
                </p>
              </div>

              {/* Variant Selectors: Sweat & Pants */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#141414] border border-[#34312D]">
                {/* 1. Sweat Config */}
                <div className="space-y-2">
                  <span className="font-mono text-[10px] uppercase text-[#B9A995] tracking-widest block">
                    CONFIGURER SHELTER SWEAT
                  </span>
                  {/* Colors */}
                  {sweatProduct && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#96918A] font-mono">Couleur :</span>
                      {sweatProduct.colors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSweatColor(c)}
                          className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                            sweatColor.name === c.name
                              ? 'border-[#E8E4DD] ring-2 ring-[#B9A995]'
                              : 'border-[#34312D]'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={`Sweat ${c.name}`}
                        />
                      ))}
                      <span className="text-[10px] text-[#E8E4DD] font-mono ml-1">{sweatColor.name}</span>
                    </div>
                  )}
                  {/* Sizes */}
                  <div className="flex gap-1">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSweatSize(sz)}
                        className={`h-7 px-2 font-mono text-[10px] uppercase border transition-colors cursor-pointer ${
                          sweatSize === sz
                            ? 'bg-[#E8E4DD] text-[#101010] border-[#E8E4DD] font-bold'
                            : 'bg-[#181818] text-[#96918A] border-[#34312D] hover:text-[#E8E4DD]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Pantalon Config */}
                <div className="space-y-2">
                  <span className="font-mono text-[10px] uppercase text-[#B9A995] tracking-widest block">
                    CONFIGURER REST WIDE
                  </span>
                  {/* Colors */}
                  {wideProduct && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#96918A] font-mono">Couleur :</span>
                      {wideProduct.colors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setWideColor(c)}
                          className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                            wideColor.name === c.name
                              ? 'border-[#E8E4DD] ring-2 ring-[#B9A995]'
                              : 'border-[#34312D]'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={`Pantalon ${c.name}`}
                        />
                      ))}
                      <span className="text-[10px] text-[#E8E4DD] font-mono ml-1">{wideColor.name}</span>
                    </div>
                  )}
                  {/* Sizes */}
                  <div className="flex gap-1">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setWideSize(sz)}
                        className={`h-7 px-2 font-mono text-[10px] uppercase border transition-colors cursor-pointer ${
                          wideSize === sz
                            ? 'bg-[#E8E4DD] text-[#101010] border-[#E8E4DD] font-bold'
                            : 'bg-[#181818] text-[#96918A] border-[#34312D] hover:text-[#E8E4DD]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing Display & Direct Acquisition CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-6 pt-6 border-t border-[#34312D]">
                {/* Pricing Display (IBM Plex Mono) - Single Clean Horizontal Baseline on Bottom Left */}
                <div className="flex items-baseline gap-3 sm:gap-4 flex-wrap">
                  {/* 1. Main Active Price */}
                  <span
                    className="text-3xl sm:text-4xl font-bold font-mono text-[#E8E4DD] leading-none whitespace-nowrap"
                    style={{ fontFamily: "'IBM Plex Mono', 'Space Mono', monospace" }}
                  >
                    {bundleData.specialPrice || '135,000 DT'}
                  </span>

                  {/* 2. Original Crossed Price */}
                  <span
                    className="line-through text-[#A0988E] text-sm sm:text-base font-mono leading-none whitespace-nowrap"
                    style={{ fontFamily: "'IBM Plex Mono', 'Space Mono', monospace" }}
                  >
                    {bundleData.originalPrice || '164,000 DT'}
                  </span>

                  {/* 3. Savings Badge */}
                  <span
                    className="bg-emerald-950/40 text-[#34D399] border border-emerald-500/30 px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ fontFamily: "'IBM Plex Mono', 'Space Mono', monospace" }}
                  >
                    {bundleData.discountBadge || '-29,000 DT ÉCONOMISÉS'}
                  </span>
                </div>

                {/* Primary Solid Ivory Button on Bottom Right */}
                <button
                  type="button"
                  onClick={handleAddBundle}
                  className="w-full md:w-auto px-8 h-12 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] font-mono text-[11px] uppercase tracking-widest font-bold transition-all whitespace-nowrap flex items-center justify-center cursor-pointer shadow-md shrink-0"
                >
                  {isAddedSuccess ? "ENSEMBLE AJOUTÉ AU PANIER ✓" : "AJOUTER L'ENSEMBLE AU PANIER"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
