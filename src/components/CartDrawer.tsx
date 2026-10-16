import React, { useState, useEffect } from 'react';
import { CartItem, PromotionsState } from '../types';
import { Product } from '../data/products';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Tag,
  Check,
} from 'lucide-react';
import { formatTND } from '../utils/currency';
import { calculatePromotions } from '../utils/promotions';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
  promotionsState: PromotionsState;
  appliedCouponCode: string | null;
  onApplyCoupon: (code: string) => { success: boolean; error?: string };
  onRemoveCoupon: () => void;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  promotionsState,
  appliedCouponCode,
  onApplyCoupon,
  onRemoveCoupon,
  products = [],
  onSelectProduct,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedbackError, setCouponFeedbackError] = useState<string | null>(null);
  const [couponSuccessNotice, setCouponSuccessNotice] = useState<string | null>(null);

  // Prevent background scroll when cart drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCouponFeedbackError(null);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate promotional breakdown (bundle + coupons)
  const promoSummary = calculatePromotions({
    items,
    couponCode: appliedCouponCode,
    promotionsState,
  });

  const {
    originalSubtotal,
    bundleMatches,
    bundleDiscountTotal,
    appliedCoupon,
    couponDiscountTotal,
    totalDiscount,
    finalTotal,
  } = promoSummary;

  // Check for bundle upsell opportunity (e.g. has shelter-sweat but missing rest-wide, or vice-versa)
  const hasSweat = items.some((i) => i.product.id === 'shelter-sweat');
  const hasWide = items.some((i) => i.product.id === 'rest-wide');
  const showBundleUpsell =
    promotionsState.bundleRules.some(
      (r) =>
        r.active &&
        r.requiredProductIds.includes('shelter-sweat') &&
        r.requiredProductIds.includes('rest-wide')
    ) &&
    ((hasSweat && !hasWide) || (!hasSweat && hasWide));
  const isOneStepAway = (hasSweat && !hasWide) || (!hasSweat && hasWide);

  const missingProductId = hasSweat ? 'rest-wide' : 'shelter-sweat';
  const missingProduct = products.find((p) => p.id === missingProductId);

  const handleApplyCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponFeedbackError(null);
    setCouponSuccessNotice(null);

    const res = onApplyCoupon(couponInput.trim().toUpperCase());
    if (res.success) {
      setCouponSuccessNotice('Code promo appliqué avec succès !');
      setCouponInput('');
      setTimeout(() => setCouponSuccessNotice(null), 3000);
    } else {
      setCouponFeedbackError(res.error || 'Code invalide');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-xs flex justify-end animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Panier d'achats"
    >
      {/* Full width on mobile (< sm), fixed 440px on sm/desktop */}
      <div className="w-full sm:w-[440px] max-w-full bg-[#101010] border-l border-[#34312D] text-[#E8E4DD] h-full flex flex-col justify-between shadow-2xl animate-fade-in">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#34312D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-[#B9A995]" />
            <h2 className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase font-mono">
              Panier ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#96918A] hover:text-[#E8E4DD] hover:bg-[#181818] transition-colors cursor-pointer touch-manipulation"
            aria-label="Fermer le panier"
          >
            <X className="w-5 h-5 stroke-[1.25]" />
          </button>
        </div>

        {/* Flat Rate & Payment Notice */}
        <div className="px-4 sm:px-5 py-2.5 bg-[#181818] border-b border-[#34312D] text-[11px] font-mono text-[#96918A] flex items-center justify-between">
          <span>Expédition Tunisie : 8 TND</span>
          <span className="text-[#B9A995]">Paiement à la livraison (COD)</span>
        </div>

        {/* =========================================================================
            GAMIFIED BUNDLE PROGRESS BAR (KŪZA ENSEMBLE 135 DT)
            ========================================================================= */}
        {items.length > 0 && (
          <div className="mx-4 sm:mx-5 mt-3 p-3.5 bg-[#141414] border border-[#34312D] space-y-2.5 animate-fade-in">
            {/* Gamified Step Bar Header */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold text-[#E8E4DD]">
                <Sparkles className="w-3.5 h-3.5 text-[#B9A995]" />
                <span>OFFRE ENSEMBLE KŪZA (135 DT)</span>
              </span>
              <span
                className={`text-[11px] font-bold ${
                  hasSweat && hasWide ? 'text-emerald-400' : 'text-[#B9A995]'
                }`}
              >
                {hasSweat && hasWide ? '100% DÉBLOQUÉ' : isOneStepAway ? '1/2 ARTICLE' : '0/2 ARTICLE'}
              </span>
            </div>

            {/* Visual Two-Stage Progress Bar */}
            <div className="w-full h-2 bg-[#1f1f1f] border border-[#34312D] overflow-hidden flex gap-1 p-0.5">
              <div
                className={`h-full flex-1 transition-all duration-500 ${
                  hasSweat || hasWide ? 'bg-[#B9A995]' : 'bg-transparent'
                }`}
              />
              <div
                className={`h-full flex-1 transition-all duration-500 ${
                  hasSweat && hasWide ? 'bg-emerald-400' : 'bg-transparent'
                }`}
              />
            </div>

            {/* Case A: 1 Eligible Item in Cart -> Subtle Notification Bar */}
            {isOneStepAway && (
              <div className="space-y-2 pt-1">
                <div className="p-2.5 bg-[#181818] border border-[#B9A995]/50 text-xs text-[#E8E4DD] font-mono leading-relaxed">
                  <span>
                    {hasSweat
                      ? "✨ Ajoutez le pantalon REST WIDE pour débloquer l'Offre Ensemble à 135,000 DT (-29,000 DT) !"
                      : "✨ Ajoutez le pull SHELTER SWEAT pour débloquer l'Offre Ensemble à 135,000 DT (-29,000 DT) !"}
                  </span>
                </div>

                {missingProduct && onSelectProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectProduct(missingProduct);
                      onClose();
                    }}
                    className="w-full py-2 px-3 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-[11px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>+ DÉCOUVRIR LE {missingProduct.name.toUpperCase()} (DÈS {formatTND(missingProduct.price)}) →</span>
                  </button>
                )}
              </div>
            )}

            {/* Case B: 2 Eligible Items in Cart (Full Bundle) -> Active Success Badge */}
            {hasSweat && hasWide && (
              <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/50 text-xs font-mono space-y-1">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                  <span>🎉 Offre Ensemble 135 DT appliquée automatiquement (-29,000 DT)</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#A0988E]">
                  <span>Total Catalogue : 164,000 DT</span>
                  <span className="text-emerald-400 font-bold">Prix Pack Privilège : 135,000 DT</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 no-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-[#96918A] py-12">
              <span className="font-serif text-3xl text-[#34312D]">KZ</span>
              <p className="text-xs uppercase tracking-widest font-mono">Votre panier est vide</p>
              <p className="text-xs max-w-xs leading-relaxed font-light">
                Découvrez nos pièces fondamentales coupées dans notre molleton brut 290 GSM.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-3 bg-[#191919] border border-[#34312D] hover:border-[#B9A995] text-xs uppercase tracking-wider text-[#E8E4DD] transition-colors cursor-pointer touch-manipulation"
              >
                Explorer la collection
              </button>
            </div>
          ) : (
            items.map((item) => {
              const isPartOfBundle =
                bundleMatches.length > 0 &&
                bundleMatches.some((m) =>
                  m.rule.requiredProductIds.includes(item.product.id)
                );

              return (
                <div
                  key={item.id}
                  className={`p-3 bg-[#181818] border transition-all flex gap-3 items-center justify-between ${
                    isPartOfBundle ? 'border-[#B9A995]/50' : 'border-[#34312D]'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-20 bg-[#101010] border border-[#34312D] overflow-hidden shrink-0 relative">
                    <img
                      src={item.selectedColor.images?.[0] || item.product.images[0]}
                      alt={`${item.product.name} ${item.selectedColor.name}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      style={{ filter: 'none' }}
                    />
                    {isPartOfBundle && (
                      <span className="absolute bottom-0 inset-x-0 bg-[#B9A995] text-[#101010] text-[8px] font-mono font-bold uppercase text-center py-0.5">
                        SET -20%
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-semibold text-[#E8E4DD] tracking-wide truncate">
                      {item.product.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-[#96918A]">
                      <span className="flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-[#34312D]"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                        {item.selectedColor.name}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">Taille {item.selectedSize}</span>
                    </div>

                    <div className="text-xs font-mono font-medium text-[#E8E4DD] tabular-nums pt-0.5 flex items-center gap-2">
                      <span>{formatTND(item.product.price)}</span>
                      {isPartOfBundle && (
                        <span className="text-[10px] text-[#B9A995] font-mono font-normal">
                          (Éligible remise -20%)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stepper & Delete */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-[#96918A] hover:text-[#E8E4DD] p-1.5 cursor-pointer transition-colors touch-manipulation"
                      aria-label={`Supprimer ${item.product.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center border border-[#34312D] bg-[#101010]">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-[#96918A] hover:text-[#E8E4DD] hover:bg-[#191919] cursor-pointer touch-manipulation"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-mono text-xs tabular-nums text-[#E8E4DD]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-[#96918A] hover:text-[#E8E4DD] hover:bg-[#191919] cursor-pointer touch-manipulation"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* COUPON INPUT & SUMMARY FOOTER */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#34312D] bg-[#141414] space-y-3.5">
            {/* MANUAL COUPON INPUT SECTION */}
            <div className="space-y-1.5 pb-2 border-b border-[#34312D]/60">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-[#181818] border border-[#B9A995] text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#B9A995]" />
                    <span className="font-mono font-semibold text-[#E8E4DD]">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-[11px] text-[#B9A995] font-mono">
                      ({appliedCoupon.type === 'PERCENTAGE' ? `-${appliedCoupon.value}%` : `-${formatTND(appliedCoupon.value)}`})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onRemoveCoupon}
                    className="p-1 text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer"
                    title="Retirer ce code"
                    aria-label="Retirer le code promo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCouponSubmit} className="space-y-1">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="CODE PROMO (EX: KUZA10)"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponFeedbackError(null);
                        }}
                        className="w-full h-9 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs uppercase font-mono text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!couponInput.trim()}
                      className={`h-9 px-3.5 text-xs font-mono uppercase tracking-wider transition-colors border ${
                        couponInput.trim()
                          ? 'bg-[#181818] hover:bg-[#E8E4DD] hover:text-[#101010] text-[#E8E4DD] border-[#B9A995] cursor-pointer'
                          : 'bg-[#181818] text-[#96918A]/40 border-[#34312D] cursor-not-allowed'
                      }`}
                    >
                      Appliquer
                    </button>
                  </div>

                  {couponFeedbackError && (
                    <p className="text-[11px] font-mono text-rose-400 mt-1">
                      {couponFeedbackError}
                    </p>
                  )}
                  {couponSuccessNotice && (
                    <p className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>{couponSuccessNotice}</span>
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#96918A]">
                <span>Sous-total articles :</span>
                <span className="tabular-nums text-[#E8E4DD]">
                  {formatTND(originalSubtotal)}
                </span>
              </div>

              {bundleDiscountTotal > 0 && (
                <div className="flex justify-between text-[#B9A995]">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#B9A995]" />
                    <span>Remise Offre Ensemble Set :</span>
                  </span>
                  <span className="tabular-nums font-semibold">
                    -{formatTND(bundleDiscountTotal)}
                  </span>
                </div>
              )}

              {/* Explicit Total Articles Set when bundle is present */}
              {bundleDiscountTotal > 0 && (
                <div className="flex justify-between text-[#E8E4DD] py-0.5 border-y border-[#34312D]/40">
                  <span className="font-semibold">Total Articles Set :</span>
                  <span className="tabular-nums font-bold text-[#B9A995]">
                    {formatTND(originalSubtotal - bundleDiscountTotal)}
                  </span>
                </div>
              )}

              {appliedCoupon && couponDiscountTotal > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-400" />
                    <span>Code promo ({appliedCoupon.code}) :</span>
                  </span>
                  <span className="tabular-nums font-semibold">
                    -{formatTND(couponDiscountTotal)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[#96918A]">
                <span>Frais de livraison :</span>
                <span className="tabular-nums text-[#E8E4DD]">
                  {formatTND(8)}
                </span>
              </div>

              <div className="pt-2 border-t border-[#34312D] flex justify-between items-baseline text-sm font-semibold text-[#E8E4DD]">
                <div className="flex flex-col">
                  <span className="uppercase text-xs tracking-wider">NET À PAYER EN ESPÈCES (COD) :</span>
                  {totalDiscount > 0 && (
                    <span className="text-[10px] text-emerald-400 font-mono font-normal">
                      Économie totale : {formatTND(totalDiscount)}
                    </span>
                  )}
                </div>
                <span className="tabular-nums text-[#B9A995] text-base font-mono font-bold">
                  {formatTND(finalTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full h-12 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer flex items-center justify-center gap-2 touch-manipulation shadow-md"
            >
              <span>Passer la commande</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>

            <p className="text-center text-[10px] text-[#96918A] font-light font-mono">
              Paiement à la livraison · Vérification du colis autorisée.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
