import React, { useState, useRef } from 'react';
import { Product, ProductColor, getVariantKey } from '../data/products';
import { InventoryMap } from '../types';
import { Eye, Maximize2 } from 'lucide-react';
import { PhotoLightbox } from './PhotoLightbox';
import { formatTND } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  inventory?: InventoryMap;
  onSelectProduct: (product: Product, initialColor?: ProductColor) => void;
  onQuickAdd: (product: Product, color: ProductColor, size: string) => void;
  onNavigateToBundle?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  inventory,
  onSelectProduct,
  onQuickAdd,
  onNavigateToBundle,
}) => {
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isCardLightboxOpen, setIsCardLightboxOpen] = useState(false);

  const touchStartX = useRef<number | null>(null);

  const activeCardGallery =
    (product.colorImages && selectedColor?.name && product.colorImages[selectedColor.name]?.length > 0)
      ? product.colorImages[selectedColor.name]
      : selectedColor?.images && selectedColor.images.length > 0
      ? selectedColor.images
      : (product.colorImages && product.colors[0]?.name && product.colorImages[product.colors[0].name]?.length > 0)
      ? product.colorImages[product.colors[0].name]
      : product.colors[0]?.images && product.colors[0].images.length > 0
      ? product.colors[0].images
      : product.images;

  const currentImage = activeCardGallery[activeImageIndex] || activeCardGallery[0] || product.images[0];

  const handleCardAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedSize) {
      setValidationError('Veuillez choisir une taille');
      return;
    }
    const key = getVariantKey(product.id, selectedColor.name, selectedSize);
    const stock = inventory && inventory[key] !== undefined ? inventory[key] : 10;
    if (stock <= 0) {
      setValidationError('Cette taille est épuisée');
      return;
    }
    setValidationError('');
    onQuickAdd(product, selectedColor, selectedSize);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40 && activeCardGallery.length > 1) {
      if (diff > 0) {
        // Swipe Left -> Next Image
        setActiveImageIndex((prev) => (prev + 1) % activeCardGallery.length);
      } else {
        // Swipe Right -> Prev Image
        setActiveImageIndex((prev) => (prev - 1 + activeCardGallery.length) % activeCardGallery.length);
      }
    }
    touchStartX.current = null;
  };

  return (
    <article
      className="group flex flex-col bg-[#181818] border border-[#34312D] hover:border-[#B9A995]/70 transition-all duration-300 relative p-4 sm:p-6 md:p-8"
      onMouseEnter={() => {
        if (activeCardGallery.length > 1) {
          setActiveImageIndex(1);
        }
      }}
      onMouseLeave={() => {
        setActiveImageIndex(0);
      }}
    >
      {/* Visual Presentation (16:10 / 4:3 Aspect) with touch swipe support */}
      <div
        className="relative overflow-hidden group aspect-[16/10] sm:aspect-[4/3] w-full bg-[#141414] border border-[#34312D]/60 select-none touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#96918A] bg-[#161616]">
            <span
              className="text-2xl font-serif text-[#B9A995] mb-2"
              style={{ fontFamily: "'Playfair Display', 'Optima', serif" }}
            >
              KŪ
            </span>
            <span className="text-xs uppercase tracking-widest text-[#E8E4DD]">
              {product.name}
            </span>
            <span className="text-[11px] text-[#96918A] mt-1">{product.spec}</span>
          </div>
        ) : (
            <img
              src={currentImage}
              alt={`${product.name} en ${selectedColor.name}`}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              onClick={() => onSelectProduct(product, selectedColor)}
              className="w-full h-full object-cover object-center contrast-105 transition-transform duration-700 ease-out group-hover:scale-105 transform-gpu backface-hidden will-change-transform cursor-pointer"
              style={{ filter: 'none' }}
            />
        )}

        {/* Stitch Corner Metadata Badges (pointer-events-none to prevent hover flicker) */}
        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 bg-[#101010]/85 backdrop-blur-md px-2 sm:px-2.5 py-1 font-mono text-[9px] sm:text-[10px] text-[#B9A995] uppercase tracking-widest border border-[#34312D] pointer-events-none select-none">
          RÉF. KZ-{product.id.toUpperCase()}
        </div>

        {/* Top-Right Bundle Highlight Badge for Shelter Sweat and Rest Wide */}
        {(product.id === 'shelter-sweat' || product.id === 'rest-wide') ? (
          <div className="absolute top-2.5 sm:top-3 right-12 sm:right-14 bg-[#101010]/95 backdrop-blur-md px-2.5 py-1 font-mono text-[9px] sm:text-[10px] text-[#B9A995] font-semibold uppercase tracking-wider border border-[#B9A995]/60 pointer-events-none select-none z-10 shadow-md">
            [ ENSEMBLE : 135,000 DT LES 2 PIÈCES ]
          </div>
        ) : null}

        <div className="absolute bottom-2.5 sm:bottom-3 right-2.5 sm:right-3 bg-[#101010]/90 backdrop-blur-md px-2 sm:px-2.5 py-1 font-mono text-[9px] sm:text-[10px] text-[#E8E4DD] uppercase tracking-widest border border-[#34312D] pointer-events-none select-none">
          {product.spec}
        </div>

        {/* Touch / Swipe Indicator Dots (mobile & desktop) */}
        {activeCardGallery.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-[#101010]/70 backdrop-blur-xs px-2 py-1 border border-[#34312D]/60 pointer-events-none">
            {activeCardGallery.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  activeImageIndex === i ? 'bg-[#B9A995] w-3.5' : 'bg-[#E8E4DD]/40 w-1.5'
                }`}
                aria-label={`Vue ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Quick Zoom Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsCardLightboxOpen(true);
          }}
          className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 p-2 bg-[#101010]/85 border border-[#34312D] text-[#E8E4DD] hover:text-[#B9A995] hover:border-[#B9A995] transition-colors cursor-pointer touch-manipulation z-20"
          title="Inspecter en plein écran avec zoom haute précision"
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#B9A995]" />
        </button>
      </div>

      {/* Meta Header */}
      <div className="pt-4 sm:pt-6 flex items-baseline justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#96918A] uppercase tracking-[0.2em] block">
              KŪZA ÉDITION · {selectedColor.name}
            </span>
            {(product.id === 'shelter-sweat' || product.id === 'rest-wide') && (
              <span className="font-mono text-[9px] text-[#B9A995] uppercase tracking-wider px-1.5 py-0.5 bg-[#181818] border border-[#B9A995]/40">
                -20% EN DUO
              </span>
            )}
          </div>
          <h3
            onClick={() => onSelectProduct(product, selectedColor)}
            className="font-serif text-xl sm:text-2xl text-[#E8E4DD] uppercase tracking-tight hover:text-[#B9A995] transition-colors cursor-pointer mt-0.5"
            style={{ fontFamily: "'Playfair Display', 'Optima', serif" }}
          >
            {product.name}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <span
            className="font-mono text-xl sm:text-2xl text-[#E8E4DD] font-bold tracking-tight"
            style={{ fontFamily: "'IBM Plex Mono', 'Space Mono', monospace" }}
          >
            {formatTND(product.price)}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="pt-1.5 sm:pt-2 text-xs md:text-sm text-[#96918A] font-light leading-relaxed">
        {product.description}
      </p>

      {/* Technical Specification Matrix */}
      <div className="mt-3 sm:mt-4 bg-[#141414] border border-[#34312D]/60 p-3 sm:p-4 space-y-1.5 font-mono text-[10px] sm:text-[11px]">
        <div className="flex justify-between py-0.5 text-[#96918A] border-b border-[#34312D]/30">
          <span>MATIÈRE</span>
          <span className="text-[#E8E4DD]">{product.composition || 'Matière premium · 290 GSM'}</span>
        </div>
        <div className="flex justify-between py-0.5 text-[#96918A] border-b border-[#34312D]/30">
          <span>DENSITÉ</span>
          <span className="text-[#E8E4DD]">{product.spec}</span>
        </div>
        <div className="flex justify-between py-0.5 text-[#96918A] border-b border-[#34312D]/30">
          <span>CONFECTION</span>
          <span className="text-[#E8E4DD]">{product.origin || 'Stock Central Tunis 🇹🇳'}</span>
        </div>
        <div className="flex justify-between py-0.5 text-[#96918A]">
          <span>COUPE</span>
          <span className="text-[#E8E4DD]">{product.fit || 'Oversized Boxy Structure'}</span>
        </div>
      </div>

      {/* Action Matrix: Colors, Sizes, and Acquisition CTA */}
      <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-[#34312D]/60 space-y-3 sm:space-y-4">
        {/* Colors Selection & Swatches (Touch targets >= 44px equivalent spacing) */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#96918A] uppercase tracking-widest">
            COLORIS : <strong className="text-[#E8E4DD]">{selectedColor.name}</strong>
          </span>

          <div className="flex items-center gap-2.5">
            {product.colors.map((color) => {
              const isSelected = selectedColor.name === color.name;
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => {
                    setSelectedColor(color);
                    setActiveImageIndex(0);
                    setImageError(false);
                    setValidationError('');
                  }}
                  className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full border transition-all cursor-pointer flex items-center justify-center touch-manipulation ${
                    isSelected
                      ? 'border-[#E8E4DD] ring-2 ring-[#B9A995]'
                      : 'border-[#34312D] hover:border-[#96918A]'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={`Coloris ${color.name}`}
                  aria-label={`Sélectionner la couleur ${color.name}`}
                >
                  {color.name === 'Beige' && isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#101010]" />
                  )}
                  {color.name === 'Noir' && isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B9A995]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Baseline Separation: Variant Title & Price Indicator */}
        <div className="flex items-baseline justify-between pt-1 pb-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#96918A]">
            TAILLE : <strong className="text-[#E8E4DD]">{selectedSize ? selectedSize : 'CHOISIR'}</strong>
          </span>
          <span
            className="font-mono text-sm sm:text-base font-bold text-[#B9A995] tracking-tight"
            style={{ fontFamily: "'IBM Plex Mono', 'Space Mono', monospace" }}
          >
            {formatTND(product.price)}
          </span>
        </div>

        {/* Action Row: Sizes + Direct CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Size Selector with comfortable touch targets (44px height) */}
          <div className="grid grid-cols-5 sm:flex gap-1.5 w-full sm:w-auto">
            {product.sizes.map((size) => {
              const isSelected = selectedSize === size;
              const key = getVariantKey(product.id, selectedColor.name, size);
              const isOut = inventory && inventory[key] !== undefined ? inventory[key] <= 0 : false;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isOut) {
                      setSelectedSize(size);
                      setValidationError('');
                    }
                  }}
                  disabled={isOut}
                  className={`h-11 sm:h-11 sm:w-10 font-mono text-xs uppercase transition-colors flex items-center justify-center border touch-manipulation ${
                    isOut
                      ? 'bg-[#141414] text-[#96918A]/30 line-through cursor-not-allowed border-[#34312D]/40'
                      : isSelected
                      ? 'bg-[#E8E4DD] text-[#101010] border-[#E8E4DD] font-semibold cursor-pointer'
                      : 'bg-[#141414] text-[#E8E4DD] hover:bg-[#E8E4DD] hover:text-[#101010] border-[#34312D] hover:border-[#E8E4DD] cursor-pointer'
                  }`}
                  title={isOut ? `Taille ${size} épuisée` : `Sélectionner taille ${size}`}
                  aria-label={isOut ? `Taille ${size} épuisée` : `Sélectionner taille ${size}`}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {/* Primary CTA & Quick View */}
          <div className="flex items-center gap-2 flex-1">
            <button
              type="button"
              onClick={handleCardAddToCart}
              className="flex-1 h-11 px-4 py-2 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer touch-manipulation whitespace-nowrap shadow-sm"
              style={{ fontFamily: "'IBM Plex Mono', 'Space Mono', monospace" }}
            >
              <span>AJOUTER AU PANIER</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectProduct(product, selectedColor)}
              className="h-11 w-11 flex items-center justify-center bg-[#141414] border border-[#34312D] text-[#96918A] hover:text-[#E8E4DD] hover:border-[#B9A995] transition-colors cursor-pointer touch-manipulation shrink-0"
              title="Voir la fiche détaillée du produit"
              aria-label="Voir la fiche détaillée"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Validation Warning */}
        {validationError && (
          <p className="text-xs text-rose-400 font-mono mt-1 animate-fade-in">{validationError}</p>
        )}

        {/* Quick action link under card for bundle items */}
        {(product.id === 'shelter-sweat' || product.id === 'rest-wide') && (
          <div className="pt-2 text-center sm:text-left">
            <button
              type="button"
              onClick={() => {
                if (onNavigateToBundle) {
                  onNavigateToBundle();
                } else {
                  const target = document.getElementById('bundle-set');
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
              className="text-[11px] font-mono text-[#B9A995] hover:text-[#E8E4DD] tracking-wide inline-flex items-center gap-1 transition-colors cursor-pointer group/link underline-offset-4 hover:underline"
            >
              <span>Complétez la tenue et économisez 29,000 DT</span>
              <span className="transition-transform duration-200 group-hover/link:translate-x-0.5">→</span>
            </button>
          </div>
        )}
      </div>

      {/* Architectural Photo Lightbox from Card */}
      <PhotoLightbox
        isOpen={isCardLightboxOpen}
        images={activeCardGallery}
        initialIndex={activeImageIndex}
        productName={`${product.name} — ${selectedColor.name}`}
        subtitle={`${product.spec} · ${product.origin || 'Tunisie 🇹🇳'}`}
        onClose={() => setIsCardLightboxOpen(false)}
      />
    </article>
  );
};
