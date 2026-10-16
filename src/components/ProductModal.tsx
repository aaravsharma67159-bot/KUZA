import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductColor, getVariantKey } from '../data/products';
import { InventoryMap } from '../types';
import { X, Check, Ruler, ShieldCheck, Truck, RefreshCw, Maximize2, Scissors, Banknote } from 'lucide-react';
import { PhotoLightbox } from './PhotoLightbox';
import { formatTND } from '../utils/currency';

interface ProductModalProps {
  product: Product | null;
  initialColor?: ProductColor;
  inventory?: InventoryMap;
  onClose: () => void;
  onAddToCart: (product: Product, color: ProductColor, size: string) => void;
  onOpenSizeGuide: (productId: string) => void;
  onDirectCheckout: (product: Product, color: ProductColor, size: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  initialColor,
  inventory,
  onClose,
  onAddToCart,
  onOpenSizeGuide,
  onDirectCheckout,
}) => {
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const galleryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      setSelectedColor(null);
      setSelectedSize(null);
      setValidationError('');
      setSelectedImageIndex(0);
      setIsLightboxOpen(false);
    }
  }, [product]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  if (!product) return null;

  const activeColor = selectedColor || initialColor || product.colors[0];

  const activeGallery =
    (product.colorImages && activeColor?.name && product.colorImages[activeColor.name]?.length > 0)
      ? product.colorImages[activeColor.name]
      : selectedColor?.images && selectedColor.images.length > 0
      ? selectedColor.images
      : initialColor?.images && initialColor.images.length > 0
      ? initialColor.images
      : product.colors[0]?.images && product.colors[0].images.length > 0
      ? product.colors[0].images
      : product.images;

  // Compute stock for current selection
  const currentKey = selectedSize ? getVariantKey(product.id, activeColor.name, selectedSize) : null;
  const hasAnyStockInColor = product.sizes.some((s) => {
    const k = getVariantKey(product.id, activeColor.name, s);
    return inventory && inventory[k] !== undefined ? inventory[k] > 0 : true;
  });
  const currentVariantStock = selectedSize
    ? (currentKey && inventory && inventory[currentKey] !== undefined ? inventory[currentKey] : 10)
    : (hasAnyStockInColor ? 1 : 0);
  const isCurrentOutOfStock = Boolean(selectedSize && currentVariantStock <= 0);

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    if (!selectedColor && !selectedSize) {
      setValidationError('Veuillez sélectionner une couleur et une taille');
      return;
    }
    if (!selectedColor) {
      setValidationError('Veuillez sélectionner une couleur');
      return;
    }
    if (!selectedSize) {
      setValidationError('Veuillez sélectionner une taille');
      return;
    }

    if (isCurrentOutOfStock) {
      setValidationError('Cette taille est actuellement épuisée en atelier');
      return;
    }

    setValidationError('');
    onAddToCart(product, selectedColor, selectedSize);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2400);
  };

  const handleBuyNow = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    if (!selectedColor && !selectedSize) {
      setValidationError('Veuillez sélectionner une couleur et une taille');
      return;
    }
    if (!selectedColor) {
      setValidationError('Veuillez sélectionner une couleur');
      return;
    }
    if (!selectedSize) {
      setValidationError('Veuillez sélectionner une taille');
      return;
    }

    if (isCurrentOutOfStock) {
      setValidationError('Cette taille est actuellement épuisée en atelier');
      return;
    }

    setValidationError('');
    onDirectCheckout(product, selectedColor, selectedSize);
  };

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollLeft = target.scrollLeft;
    const width = target.clientWidth;
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== selectedImageIndex && newIndex >= 0 && newIndex < activeGallery.length) {
        setSelectedImageIndex(newIndex);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#101010] md:bg-black/90 md:backdrop-blur-md md:flex md:items-center md:justify-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
    >
      {/* Modal Container: Fullscreen on mobile (< md), Boxed Modal on desktop (>= md) */}
      <div className="relative w-full max-w-5xl bg-[#101010] md:border md:border-[#34312D] text-[#E8E4DD] min-h-screen md:min-h-0 md:max-h-[92vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        {/* Pinned Top-Right Close Button (Touch Friendly) */}
        <button
          onClick={onClose}
          className="fixed md:absolute top-3 right-3 z-30 p-2.5 bg-[#181818]/90 border border-[#34312D] hover:border-[#B9A995] text-[#E8E4DD] transition-colors cursor-pointer touch-manipulation backdrop-blur-md shadow-lg"
          aria-label="Fermer la vue produit"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Left Column: Visual Gallery with Swipe & Snap on Mobile */}
        <div className="w-full md:w-7/12 bg-[#141414] p-4 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#34312D] overflow-y-auto">
          {/* Mobile Swipeable Gallery (< md: Snap Scroll) */}
          <div className="md:hidden relative w-full aspect-[3/4] bg-[#181818] border border-[#34312D] overflow-hidden">
            <div
              ref={galleryScrollRef}
              onScroll={handleMobileScroll}
              className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
            >
              {activeGallery.map((img, idx) => (
                <div
                  key={idx}
                  className="w-full h-full shrink-0 snap-center relative flex items-center justify-center cursor-zoom-in"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${activeColor.name} vue ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center contrast-105"
                    style={{ filter: 'none' }}
                  />
                </div>
              ))}
            </div>

            {/* Micro Badge Origin */}
            <div className="absolute top-3 left-3 bg-[#101010]/85 border border-[#34312D] px-2.5 py-1 text-[9px] uppercase font-mono tracking-widest text-[#B9A995] pointer-events-none">
              Stock Central Tunis · 290 GSM
            </div>

            {/* Mobile Snap Dot Indicators */}
            {activeGallery.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-[#101010]/75 backdrop-blur-xs px-2.5 py-1 border border-[#34312D]/60 pointer-events-none">
                {activeGallery.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      selectedImageIndex === i ? 'bg-[#B9A995] w-3.5' : 'bg-[#E8E4DD]/40 w-1.5'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop Main Visual (>= md) */}
          <div className="hidden md:block relative overflow-hidden group aspect-[3/4] w-full bg-[#181818] border border-[#34312D]">
            <img
              src={activeGallery[selectedImageIndex] || activeGallery[0] || product.images[0]}
              alt={`${product.name} ${activeColor.name} vue ${selectedImageIndex + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center contrast-105 transition-transform duration-700 ease-out group-hover:scale-105 transform-gpu backface-hidden will-change-transform cursor-zoom-in"
              style={{ filter: 'none' }}
              onClick={() => setIsLightboxOpen(true)}
            />

            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute bottom-3 right-3 p-2 bg-[#101010]/85 border border-[#34312D] text-[#E8E4DD] text-xs hover:border-[#B9A995] hover:text-[#B9A995] transition-colors flex items-center gap-1.5 pointer-events-auto cursor-pointer shadow-lg backdrop-blur-sm z-20"
              title="Ouvrir le visualiseur plein écran haute précision"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#B9A995]" />
              <span className="text-[10px] tracking-widest uppercase font-mono">
                Plein Écran & Zoom
              </span>
            </button>

            {/* Micro Badge for Craftsmanship Origin (pointer-events-none) */}
            <div className="absolute top-3 left-3 bg-[#101010]/85 border border-[#34312D] px-2.5 py-1 text-[10px] uppercase font-mono tracking-widest text-[#B9A995] pointer-events-none select-none">
              Stock Central Tunis · 290 GSM
            </div>
          </div>

          {/* Desktop Thumbnails */}
          {activeGallery.length > 1 && (
            <div className="hidden md:flex mt-4 items-center gap-3">
              {activeGallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 aspect-square border overflow-hidden transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-[#B9A995] ring-1 ring-[#B9A995]'
                      : 'border-[#34312D] opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Afficher vue ${idx + 1} (${activeColor.name})`}
                >
                  <img
                    src={img}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    style={{ filter: 'none' }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Technical schematic note */}
          <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-[#34312D]/60 text-[10px] sm:text-[11px] text-[#96918A] flex items-center justify-between font-mono">
            <span>Réf. KZ-{product.id.toUpperCase()}</span>
            <span>Tissé & Confectionné à Tunis 🇹🇳</span>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="w-full md:w-5/12 bg-[#101010] p-4 sm:p-6 md:p-8 flex flex-col justify-between overflow-y-auto space-y-6 pb-36 md:pb-8">
          <div className="space-y-4 sm:space-y-5">
            {/* [1] COLLECTION & BRAND TAG */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-widest text-[#8C8275] font-mono">
              <span>KŪZA ÉDITION · {product.spec || 'PREMIUM FABRIC · 290 GSM'}</span>
              {(product.id === 'shelter-sweat' || product.id === 'rest-wide') && (
                <span className="text-[#B9A995] border border-[#B9A995]/40 px-2 py-0.5 bg-[#181818]">
                  -20% EN ENSEMBLE
                </span>
              )}
            </div>

            {/* [2] PRODUCT TITLE & PRICE BLOCK */}
            <div className="space-y-1.5 sm:space-y-2">
              <h2
                id="pdp-title"
                className="text-2xl sm:text-3xl font-serif tracking-wide text-[#E8E4DD] uppercase"
                style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
              >
                {product.name}
              </h2>

              <div className="flex items-baseline gap-3 pt-0.5">
                <span className="text-xl sm:text-2xl font-mono font-bold text-[#E8E4DD] tabular-nums">
                  {formatTND(product.price)}
                </span>
                <span className="text-xs text-[#8C8275]">
                  TVA incluse · Paiement à la livraison
                </span>
              </div>

              {/* Subtle 1px divider hairline */}
              <div className="border-b border-[#34312D] pt-2" />
            </div>

            {/* [3] DESCRIPTION */}
            <p className="text-xs sm:text-sm text-[#A0988E] leading-relaxed font-light">
              {product.description} {product.fit}
            </p>

            {/* [4] COLOR SELECTION (COLORIS) with Enlarged Touch Targets (>= 44px) */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-widest text-[#8C8275] font-mono text-[11px]">
                  COLORIS : <strong className="text-[#E8E4DD]">{selectedColor ? selectedColor.name.toUpperCase() : 'SÉLECTIONNER UN COLORIS'}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {product.colors.map((color) => {
                  const isSelected = selectedColor?.name === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedColor(color);
                        setSelectedImageIndex(0);
                        setValidationError('');
                      }}
                      className={`h-11 px-4 border transition-all cursor-pointer flex items-center gap-2.5 touch-manipulation ${
                        isSelected
                          ? 'border-[#B9A995] ring-2 ring-[#B9A995] ring-offset-2 ring-offset-[#101010] bg-[#181818] text-[#E8E4DD] shadow-sm font-semibold'
                          : 'border-[#34312D] bg-[#141414] text-[#A0988E] hover:border-[#8C8275] hover:text-[#E8E4DD]'
                      }`}
                      aria-label={`Sélectionner couleur ${color.name}`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border shrink-0 transition-transform ${
                          isSelected ? 'border-[#E8E4DD] scale-110' : 'border-[#34312D]'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs uppercase tracking-wider font-mono font-medium">{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* [5] SIZE SELECTION (TAILLE) & SIZE GUIDE (Touch-friendly 48px height) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-widest text-[#8C8275] font-mono text-[11px]">
                  TAILLE : <strong className="text-[#E8E4DD]">{selectedSize ? selectedSize.toUpperCase() : 'SÉLECTIONNER'}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => onOpenSizeGuide(product.id)}
                  className="flex items-center gap-1.5 text-xs text-[#B9A995] hover:text-[#E8E4DD] underline underline-offset-4 cursor-pointer transition-colors touch-manipulation py-1"
                >
                  <Ruler className="w-3.5 h-3.5 text-[#B9A995]" />
                  <span>Guide des tailles</span>
                </button>
              </div>

              {/* Grid of Sizes with 48px Height Touch Targets */}
              <div className="grid grid-cols-5 gap-2 my-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  const colorForCheck = selectedColor ? selectedColor.name : product.colors[0].name;
                  const key = getVariantKey(product.id, colorForCheck, size);
                  const stock = inventory && inventory[key] !== undefined ? inventory[key] : 10;
                  const isOut = stock <= 0;

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
                      className={`h-12 text-xs font-mono uppercase tracking-wider transition-all border flex flex-col items-center justify-center touch-manipulation ${
                        isOut
                          ? 'bg-[#141414] text-[#8C8275]/40 border-[#34312D]/40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#E8E4DD] text-[#101010] border-[#E8E4DD] font-bold shadow-sm cursor-pointer'
                          : 'bg-[#181818] text-[#E8E4DD] border-[#34312D] hover:border-[#B9A995] cursor-pointer'
                      }`}
                      aria-label={`Sélectionner la taille ${size} ${isOut ? '(Épuisé)' : ''}`}
                    >
                      <span className={isOut ? 'line-through' : ''}>[ {size} ]</span>
                      {isOut && (
                        <span className="text-[8px] font-sans text-rose-400/80 leading-none mt-0.5">
                          Épuisé
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Minimal Warning Text if validationError */}
              {validationError && (
                <p className="text-xs text-rose-400 font-mono mt-1 animate-fade-in">{validationError}</p>
              )}

              {/* [6] AVAILABILITY STATUS */}
              {currentVariantStock > 0 ? (
                <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>• Disponible en stock</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-xs font-mono text-rose-400 mt-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Épuisé</span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Inline Actions (>= md) */}
          <div className="hidden md:block pt-5 border-t border-[#34312D] space-y-3">
            {addedNotice && (
              <div className="p-2.5 bg-[#181818] border border-[#B9A995] text-xs text-[#B9A995] flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-[#B9A995]" />
                <span>Pièce ajoutée au panier avec succès</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isCurrentOutOfStock}
              className={`w-full py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                isCurrentOutOfStock
                  ? 'bg-[#181818] text-[#8C8275] border border-[#34312D] cursor-not-allowed opacity-60'
                  : 'bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] cursor-pointer shadow-md'
              }`}
            >
              <span>{isCurrentOutOfStock ? 'ÉPUISÉ EN STOCK' : 'AJOUTER AU PANIER'}</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isCurrentOutOfStock}
              className={`w-full py-3.5 text-xs uppercase tracking-[0.18em] transition-all border ${
                isCurrentOutOfStock
                  ? 'bg-[#141414] text-[#8C8275]/40 border-[#34312D]/40 cursor-not-allowed'
                  : 'bg-transparent hover:bg-[#181818] text-[#E8E4DD] border-[#34312D] hover:border-[#B9A995] cursor-pointer'
              }`}
            >
              COMMANDER MAINTENANT (PAIEMENT À LA LIVRAISON)
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-center text-[10px] text-[#96918A]">
              <div className="flex flex-col items-center gap-1 p-2 bg-[#141414] border border-[#34312D]/60">
                <Truck className="w-3.5 h-3.5 text-[#B9A995]" />
                <span className="font-mono font-semibold text-[#E8E4DD] text-[9px] uppercase">LIVRAISON 24/48H</span>
                <span className="text-[8px] text-[#96918A]">Expédition Tunisie</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-[#141414] border border-[#34312D]/60">
                <RefreshCw className="w-3.5 h-3.5 text-[#B9A995]" />
                <span className="font-mono font-semibold text-[#E8E4DD] text-[9px] uppercase">ÉCHANGE FACILE</span>
                <span className="text-[8px] text-[#96918A]">Service client réactif</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-[#141414] border border-[#34312D]/60">
                <Scissors className="w-3.5 h-3.5 text-[#B9A995]" />
                <span className="font-mono font-semibold text-[#E8E4DD] text-[9px] uppercase">GARANTIE STOCK CENTRAL</span>
                <span className="text-[8px] text-[#96918A]">Contrôle qualité certifié</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-[#141414] border border-[#34312D]/60">
                <Banknote className="w-3.5 h-3.5 text-[#B9A995]" />
                <span className="font-mono font-semibold text-[#E8E4DD] text-[9px] uppercase">PAIEMENT SÉCURISÉ</span>
                <span className="text-[8px] text-[#96918A]">Espèces à la livraison</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom Bar (CTA Pinned on screens < md) */}
      <div className="fixed bottom-0 left-0 right-0 p-3.5 bg-[#101010]/95 backdrop-blur-md border-t border-[#34312D] z-40 flex flex-col gap-2 md:hidden">
        {addedNotice && (
          <div className="p-2 bg-[#181818] border border-[#B9A995] text-xs text-[#B9A995] flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-[#B9A995]" />
            <span>Ajouté au panier !</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isCurrentOutOfStock}
          className={`w-full h-12 text-sm font-bold uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 touch-manipulation ${
            isCurrentOutOfStock
              ? 'bg-[#181818] text-[#8C8275] border border-[#34312D] cursor-not-allowed opacity-60'
              : 'bg-[#E8E4DD] active:bg-[#B9A995] text-[#101010] cursor-pointer shadow-lg'
          }`}
        >
          <span>{isCurrentOutOfStock ? 'ÉPUISÉ EN STOCK' : 'AJOUTER AU PANIER'}</span>
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isCurrentOutOfStock}
          className={`w-full h-10 text-xs font-mono uppercase tracking-wider transition-all border touch-manipulation ${
            isCurrentOutOfStock
              ? 'bg-[#141414] text-[#8C8275]/40 border-[#34312D]/40 cursor-not-allowed'
              : 'bg-transparent text-[#E8E4DD] border-[#34312D] active:border-[#B9A995] cursor-pointer'
          }`}
        >
          COMMANDER (PAIEMENT À LA LIVRAISON)
        </button>
      </div>

      {/* Architectural Full-Screen Photo Lightbox & Deep Zoom */}
      <PhotoLightbox
        isOpen={isLightboxOpen}
        images={activeGallery}
        initialIndex={selectedImageIndex}
        productName={`${product.name} — ${activeColor.name}`}
        subtitle={`${product.spec || 'Matière premium · 290 GSM'} · ${product.origin || 'Made in Tunisia 🇹🇳'}`}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
};
