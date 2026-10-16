import { Product, ProductColor } from './data/products';

export type InventoryMap = Record<string, number>;

export interface CartItem {
  id: string; // unique cart line id: `${productId}-${color.name}-${size}`
  product: Product;
  selectedColor: ProductColor;
  selectedSize: string;
  quantity: number;
}

export type LogisticsStatus =
  | 'En préparation'
  | 'Remis au livreur'
  | 'En cours de livraison'
  | 'Livrée (Encaissé)'
  | 'Refusé / Retour'
  | string;

export type OrderStatus =
  | 'received' // Commande reçue
  | 'confirmed' // Commande confirmée
  | 'preparing' // En préparation
  | 'shipped' // Expédiée
  | 'delivered' // Livrée
  | 'Commande reçue'
  | 'Confirmation en cours'
  | 'Commande confirmée'
  | 'En préparation'
  | 'Expédiée'
  | 'Livrée'
  | 'Refusé / Retour'
  | LogisticsStatus
  | string;

export interface OrderDetails {
  id?: string;
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerId?: string;
  phone: string;
  phoneSecondary?: string;
  governorate: string;
  address: string;
  deliveryNotes?: string;
  paymentMethod: 'cod' | 'cash_atelier' | 'virement_biat' | 'offert' | string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discountAmount?: number;
  appliedCouponCode?: string;
  appliedBundleName?: string;
  total: number;
  createdAt: string;
  status: OrderStatus;
  courierName?: string;
  courierTrackingRef?: string;
  logisticsStatus?: LogisticsStatus;
}

export type UserRole = 'customer' | 'admin';

export interface CustomerUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  governorate: string;
  address: string;
  password?: string;
  createdAt: string;
  role?: UserRole;
}

// ==========================================
// SALES HISTORY LEDGER & AUDIT TRAIL MODELS
// ==========================================

export interface SalesLedgerItem {
  productId: string;
  name: string;
  color: string;
  size: string;
  qty: number;
  unitPrice: number;
}

export type PaymentStatus = 'EN_ATTENTE_LIVRAISON' | 'ENCAISSÉ' | 'ANNULÉE' | 'RETOUR_NON_LIVRÉ';

export interface SalesTransaction {
  transactionId: string; // Unique reference: TX-KZ-XXXX
  orderId: string;       // Linked Order Reference: KZ-XXXX
  timestamp: string;     // ISO Date/Time string
  client: {
    name: string;
    phone: string;
    phoneSecondary?: string;
    governorate: string;
    address: string;
  };
  items: SalesLedgerItem[];
  subtotal: number;      // Total items in TND
  shippingFee: number;   // Flat 8 TND
  discountAmount?: number; // Total promotional discount in TND
  promoCode?: string;    // Coupon code if applied
  bundleOffer?: string;  // Bundle name if applied
  totalAmount: number;   // Sum in TND
  paymentStatus: PaymentStatus;
  orderStatus:
    | 'Commande reçue'
    | 'Confirmation en cours'
    | 'Commande confirmée'
    | 'En préparation'
    | 'Expédiée'
    | 'Livrée'
    | 'Annulée'
    | 'Refusé / Retour'
    | LogisticsStatus
    | string;
  courierName?: string;
  courierTrackingRef?: string;
  logisticsStatus?: LogisticsStatus;
}

export type StockMovementType =
  | 'VENTE'
  | 'VENTE DIRECTE'
  | 'ANNULATION_RESTOCK'
  | 'RÉAPPROVISIONNEMENT'
  | 'AJUSTEMENT_MANUEL'
  | string;

export interface StockMovementLog {
  logId: string;
  timestamp: string;
  sku: string;           // Variant Key (e.g. shelter-sweat:Noir:M)
  productName: string;   // Model name (e.g. SHELTER SWEAT)
  color: string;
  size: string;
  type: StockMovementType;
  changeQty: number;     // Numeric delta (e.g. -1, +5, -2)
  previousStock: number;
  newStock: number;
  reference: string;     // Order ID (KZ-8682) or 'Atelier Admin'
  operator?: string;     // Operator or Source (e.g. 'Admin (Mehdi)', 'Automatique (Boutique COD)', 'Atelier Confection (BE-2026-001)')
  reason?: string;       // Compulsory tag or note for manual adjustments (e.g. 'PERTE', 'DÉFECTUEUX', 'INVENTAIRE')
}

// ==========================================
// BON D'ENTRÉE (STOCK RECEIPT / ENTRY NOTE)
// ==========================================

export type StockEntryStatus = 'VALIDATED' | 'DRAFT';

export interface StockEntryItem {
  productId: string;
  productName: string;
  color: string;
  size: string;
  quantityAdded: number;
  unitCost?: number;       // e.g. 22.000 DT / piece
  totalCost?: number;      // e.g. quantityAdded * unitCost
}

export interface StockEntryNote {
  id: string;              // e.g. "BE-2026-001"
  date: string;            // ISO Date or formatted date string
  supplierAtelier: string; // e.g. "Atelier Confection Tunis"
  referenceBatch: string;  // e.g. "LOT-290GSM-04"
  createdByName: string;   // e.g. "Maître Mehdi - Atelier 01"
  items: StockEntryItem[];
  totalPieces: number;
  unitCostDefault?: number; // e.g. 22 DT
  totalCost?: number;      // Total receipt manufacturing valuation (e.g. 770.000 DT)
  status: StockEntryStatus; // "VALIDATED" | "DRAFT"
  notes?: string;
}


// ==========================================
// PROMOTIONS & AUTOMATIC BUNDLE MODELS
// ==========================================

export type CouponType = 'PERCENTAGE' | 'FIXED';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number; // e.g. 10 (%) or 15 (DT)
  minOrderDT: number;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  startDate?: string;      // YYYY-MM-DD
  endDate?: string;        // YYYY-MM-DD
  nonCumulative?: boolean; // Empêcher le cumul avec l'Offre Ensemble
}

export interface BundleRule {
  id: string;
  name: string;
  requiredProductIds: string[]; // Both/All required in cart (e.g. ["shelter-sweat", "rest-wide"])
  discountPercent: number;      // e.g. 17.6829 or 20 (%)
  fixedPrice?: number;          // e.g. 135 TND fixed combined price
  active: boolean;
  description?: string;
  startDate?: string;           // YYYY-MM-DD
  endDate?: string;             // YYYY-MM-DD
}

export interface PromotionsState {
  coupons: Coupon[];
  bundleRules: BundleRule[];
}

export interface BundleDiscountMatch {
  rule: BundleRule;
  setsCount: number;
  setProducts: Array<{ id: string; name: string; price: number }>;
  bundleBasePrice: number;
  discountAmount: number;
}

export interface AppliedPromotionSummary {
  originalSubtotal: number;
  bundleMatches: BundleDiscountMatch[];
  bundleDiscountTotal: number;
  appliedCoupon: Coupon | null;
  couponDiscountTotal: number;
  couponError?: string;
  totalDiscount: number;
  discountedSubtotal: number;
  shipping: number;
  finalTotal: number;
}


