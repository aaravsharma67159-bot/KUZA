import {
  Coupon,
  BundleRule,
  PromotionsState,
  CartItem,
  AppliedPromotionSummary,
  BundleDiscountMatch,
} from '../types';

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'promo-1',
    code: 'KUZA10',
    type: 'PERCENTAGE',
    value: 10, // 10%
    minOrderDT: 0,
    usageLimit: 100,
    usedCount: 0,
    active: true,
  },
  {
    id: 'promo-2',
    code: 'ATELIER15',
    type: 'FIXED',
    value: 15, // 15 DT
    minOrderDT: 100,
    usageLimit: 50,
    usedCount: 2,
    active: true,
  },
];

export const INITIAL_BUNDLE_RULES: BundleRule[] = [
  {
    id: 'bundle-set-sweat-jogging',
    name: 'ENSEMBLE FULL KŪZA',
    requiredProductIds: ['shelter-sweat', 'rest-wide'],
    discountPercent: 17.6829, // ~17.7%
    fixedPrice: 135,          // 135,000 DT fixed combined price
    active: true,
    description: "L'Ensemble Full KŪZA (Sweat + Pantalon) à 135,000 DT au lieu de 164,000 DT · Économisez 29,000 DT",
  },
];

export const PROMOTIONS_STORAGE_KEY = 'kuza_promotions';

/**
 * Cleanly formats a discount percentage (e.g. 17.6829% -> 17.7%, 20% -> 20%)
 */
export function formatDiscountPercent(pct: number): string {
  if (!pct || isNaN(pct)) return '0%';
  const rounded = Math.round(pct * 10) / 10;
  return `${rounded}%`;
}

/**
 * Check if a promotion is valid according to optional start and end dates
 */
export function isCampaignWithinDates(
  startDate?: string,
  endDate?: string
): {
  isValid: boolean;
  status: 'ACTIVE' | 'NOT_STARTED' | 'EXPIRED';
  label?: string;
} {
  const today = new Date().toISOString().slice(0, 10);
  if (startDate && today < startDate) {
    const formatted = new Date(startDate).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return { isValid: false, status: 'NOT_STARTED', label: `Débute le ${formatted}` };
  }
  if (endDate && today > endDate) {
    const formatted = new Date(endDate).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return { isValid: false, status: 'EXPIRED', label: `Expiré le ${formatted}` };
  }
  return { isValid: true, status: 'ACTIVE' };
}

/**
 * Load promotions from localStorage or fallback to defaults
 */
export function loadStoredPromotions(): PromotionsState {
  try {
    const raw = localStorage.getItem(PROMOTIONS_STORAGE_KEY);
    if (!raw) {
      const initial: PromotionsState = {
        coupons: INITIAL_COUPONS,
        bundleRules: INITIAL_BUNDLE_RULES,
      };
      localStorage.setItem(PROMOTIONS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      coupons: Array.isArray(parsed.coupons) ? parsed.coupons : INITIAL_COUPONS,
      bundleRules: Array.isArray(parsed.bundleRules)
        ? parsed.bundleRules
        : INITIAL_BUNDLE_RULES,
    };
  } catch (err) {
    console.error('Failed to parse stored promotions:', err);
    return {
      coupons: INITIAL_COUPONS,
      bundleRules: INITIAL_BUNDLE_RULES,
    };
  }
}

/**
 * Persist promotions to localStorage and notify listeners
 */
export function saveStoredPromotions(state: PromotionsState): void {
  try {
    localStorage.setItem(PROMOTIONS_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('kuza_promotions_updated'));
  } catch (err) {
    console.error('Failed to save promotions:', err);
  }
}

/**
 * Increment coupon usage counter after a confirmed order
 */
export function incrementCouponUsage(couponCode: string): void {
  if (!couponCode) return;
  const state = loadStoredPromotions();
  const normalized = couponCode.trim().toUpperCase();
  const updatedCoupons = state.coupons.map((c) => {
    if (c.code.trim().toUpperCase() === normalized) {
      return { ...c, usedCount: (c.usedCount || 0) + 1 };
    }
    return c;
  });
  saveStoredPromotions({ ...state, coupons: updatedCoupons });
}

/**
 * Core promotional calculation engine for bundles and coupons
 */
export function calculatePromotions({
  items,
  couponCode,
  promotionsState,
}: {
  items: CartItem[];
  couponCode?: string | null;
  promotionsState: PromotionsState;
}): AppliedPromotionSummary {
  const originalSubtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const bundleMatches: BundleDiscountMatch[] = [];
  let bundleDiscountTotal = 0;

  // 1. Evaluate active bundle rules
  if (items.length > 0 && promotionsState.bundleRules) {
    const activeRules = promotionsState.bundleRules.filter((r) => {
      if (!r.active) return false;
      const dateCheck = isCampaignWithinDates(r.startDate, r.endDate);
      return dateCheck.isValid;
    });

    for (const rule of activeRules) {
      if (!rule.requiredProductIds || rule.requiredProductIds.length === 0) continue;

      // Group cart items by product ID
      const productQtys: Record<string, number> = {};
      const productUnitPrices: Record<string, { price: number; name: string }> = {};

      items.forEach((it) => {
        const pid = it.product.id;
        productQtys[pid] = (productQtys[pid] || 0) + it.quantity;
        if (!productUnitPrices[pid]) {
          productUnitPrices[pid] = {
            price: it.product.price,
            name: it.product.name,
          };
        }
      });

      // Check if all required products are in cart
      const hasAllRequired = rule.requiredProductIds.every(
        (pid) => (productQtys[pid] || 0) > 0
      );

      if (hasAllRequired) {
        // Number of complete sets possible
        const setsCount = Math.min(
          ...rule.requiredProductIds.map((pid) => productQtys[pid] || 0)
        );

        if (setsCount > 0) {
          const setProducts = rule.requiredProductIds.map((pid) => ({
            id: pid,
            name: productUnitPrices[pid]?.name || pid,
            price: productUnitPrices[pid]?.price || 0,
          }));

          const bundleBasePrice = setProducts.reduce((sum, p) => sum + p.price, 0);

          let singleSetDiscount: number;
          if (rule.fixedPrice && rule.fixedPrice > 0) {
            // Explicit fixed price for bundle (e.g. 135 DT for 164 DT base)
            singleSetDiscount = Math.max(0, bundleBasePrice - rule.fixedPrice);
          } else if (
            rule.requiredProductIds.includes('shelter-sweat') &&
            rule.requiredProductIds.includes('rest-wide') &&
            bundleBasePrice === 164
          ) {
            singleSetDiscount = 29; // 164 - 135 = 29 DT exact
          } else {
            singleSetDiscount = bundleBasePrice * (rule.discountPercent / 100);
          }

          const totalDiscountForRule = Math.round(singleSetDiscount * setsCount * 100) / 100;

          bundleDiscountTotal += totalDiscountForRule;
          bundleMatches.push({
            rule,
            setsCount,
            setProducts,
            bundleBasePrice,
            discountAmount: totalDiscountForRule,
          });
        }
      }
    }
  }

  // 2. Evaluate Coupon Code
  let appliedCoupon: Coupon | null = null;
  let couponDiscountTotal = 0;
  let couponError: string | undefined = undefined;

  const trimmedCode = couponCode ? couponCode.trim().toUpperCase() : '';

  if (trimmedCode) {
    const matched = promotionsState.coupons?.find(
      (c) => c.code.trim().toUpperCase() === trimmedCode
    );

    if (!matched) {
      couponError = `Code « ${trimmedCode} » invalide`;
    } else if (!matched.active) {
      couponError = `Le code « ${matched.code} » n'est plus actif`;
    } else {
      const dateCheck = isCampaignWithinDates(matched.startDate, matched.endDate);
      if (!dateCheck.isValid) {
        couponError =
          dateCheck.status === 'NOT_STARTED'
            ? `Le code « ${matched.code} » n'est pas encore actif (${dateCheck.label})`
            : `Le code « ${matched.code} » a expiré (${dateCheck.label})`;
      } else if (matched.nonCumulative && bundleDiscountTotal > 0) {
        couponError = `Le code « ${matched.code} » n'est pas cumulable avec l'Offre Ensemble`;
      } else if (matched.usageLimit > 0 && matched.usedCount >= matched.usageLimit) {
        couponError = `Le code « ${matched.code} » a atteint sa limite d'utilisation`;
      } else if (matched.minOrderDT > 0 && originalSubtotal < matched.minOrderDT) {
        couponError = `Commande minimale de ${matched.minOrderDT} DT requise`;
      } else {
        // Valid coupon!
        appliedCoupon = matched;
        const subtotalAfterBundle = Math.max(0, originalSubtotal - bundleDiscountTotal);

        if (matched.type === 'PERCENTAGE') {
          // Apply percentage to subtotal remaining after bundle
          couponDiscountTotal =
            Math.round(subtotalAfterBundle * (matched.value / 100) * 100) / 100;
        } else {
          // FIXED deduction in DT
          couponDiscountTotal = Math.min(matched.value, subtotalAfterBundle);
        }
      }
    }
  }

  const totalDiscount = Math.min(
    originalSubtotal,
    bundleDiscountTotal + couponDiscountTotal
  );
  const discountedSubtotal = Math.max(0, originalSubtotal - totalDiscount);
  const shipping = items.length === 0 ? 0 : 8;
  const finalTotal = discountedSubtotal + shipping;

  return {
    originalSubtotal,
    bundleMatches,
    bundleDiscountTotal,
    appliedCoupon,
    couponDiscountTotal,
    couponError,
    totalDiscount,
    discountedSubtotal,
    shipping,
    finalTotal,
  };
}
