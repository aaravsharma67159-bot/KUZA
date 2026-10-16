import React, { useState } from 'react';
import {
  X,
  Check,
  ShoppingBag,
  Printer,
  FileText,
  User,
  Phone,
  Tag,
  DollarSign,
  Package,
  Layers,
  ShieldCheck,
  Building2,
  AlertTriangle,
  ArrowRight,
  HandCoins,
} from 'lucide-react';
import { Product, ProductColor, getVariantKey } from '../data/products';
import { InventoryMap, OrderDetails, SalesTransaction, StockMovementLog } from '../types';
import { formatTND } from '../utils/currency';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { InvoiceModal } from './InvoiceModal';

export interface DirectSaleModalProps {
  products: Product[];
  inventory: InventoryMap;
  orders: OrderDetails[];
  salesHistory: SalesTransaction[];
  stockLogs: StockMovementLog[];
  onUpdateInventory: (newInv: InventoryMap) => void;
  onUpdateOrders: (newOrders: OrderDetails[]) => void;
  onUpdateSalesHistory: (newHist: SalesTransaction[]) => void;
  onUpdateStockLogs: (newLogs: StockMovementLog[]) => void;
  onClose: () => void;
  showNotice: (msg: string) => void;
}

export type DirectPaymentMethod = 'cash_atelier' | 'virement_biat' | 'offert';

export const DirectSaleModal: React.FC<DirectSaleModalProps> = ({
  products,
  inventory,
  orders,
  salesHistory,
  stockLogs,
  onUpdateInventory,
  onUpdateOrders,
  onUpdateSalesHistory,
  onUpdateStockLogs,
  onClose,
  showNotice,
}) => {
  // 1. Customer Details (Default: Client Direct Atelier / Ami)
  const [customerName, setCustomerName] = useState('Client Direct Atelier / Ami');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  // 2. Product & Variant Selection
  const defaultProduct = products[0] || null;
  const [selectedProductId, setSelectedProductId] = useState<string>(defaultProduct?.id || '');
  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    () => currentProduct?.colors[0] || { name: 'Noir', hex: '#111111', images: [] }
  );
  const [selectedSize, setSelectedSize] = useState<string>(currentProduct?.sizes[0] || 'M');
  const [quantity, setQuantity] = useState<number>(1);

  // 3. Pricing & Friendly Discount Override
  const [isCustomPriceEnabled, setIsCustomPriceEnabled] = useState(false);
  const [customPriceInput, setCustomPriceInput] = useState<string>(
    String(currentProduct?.price || 79)
  );

  // 4. Payment Method
  const [paymentMethod, setPaymentMethod] = useState<DirectPaymentMethod>('cash_atelier');

  // 5. Completion State (Instant Receipt / Invoice view)
  const [createdOrder, setCreatedOrder] = useState<OrderDetails | null>(null);
  const [showThermalModal, setShowThermalModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Synchronize color & size when product changes
  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setSelectedColor(prod.colors[0]);
      setSelectedSize(prod.sizes[0] || 'M');
      if (!isCustomPriceEnabled) {
        setCustomPriceInput(String(prod.price));
      }
    }
  };

  // Stock inspection for selected variant
  const variantKey = currentProduct
    ? getVariantKey(currentProduct.id, selectedColor.name, selectedSize)
    : '';
  const currentStock = inventory[variantKey] !== undefined ? inventory[variantKey] : 10;
  const isOutOfStock = currentStock <= 0;

  // Compute final financial values
  const catalogUnitPrice = currentProduct ? currentProduct.price : 79;
  const parsedCustomPrice = parseFloat(customPriceInput);
  const effectiveUnitPrice =
    paymentMethod === 'offert'
      ? 0
      : isCustomPriceEnabled && !isNaN(parsedCustomPrice) && parsedCustomPrice >= 0
      ? parsedCustomPrice
      : catalogUnitPrice;

  const totalAmount = effectiveUnitPrice * quantity;
  const unitDiscount = Math.max(0, catalogUnitPrice - effectiveUnitPrice);
  const totalDiscount = unitDiscount * quantity;

  // Validation & Submission
  const handleValidateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    if (quantity < 1) {
      showNotice('La quantité doit être au minimum de 1');
      return;
    }

    const orderId = `KZ-DIR-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();
    const finalClientName = customerName.trim() || 'Client Direct (Retrait Dépôt)';
    const finalPhone = customerPhone.trim() || '+216 -- --- ---';

    let paymentLabel = 'Espèces Dépôt (Cash)';
    if (paymentMethod === 'virement_biat') paymentLabel = 'Virement Bancaire BIAT';
    if (paymentMethod === 'offert') paymentLabel = 'Offert / Cadeau Maison';

    // 1. Decrement Stock Quantity
    const nextStock = Math.max(0, currentStock - quantity);
    const updatedInventory: InventoryMap = {
      ...inventory,
      [variantKey]: nextStock,
    };
    onUpdateInventory(updatedInventory);

    // 2. Create Stock Movement Audit Log
    const newLog: StockMovementLog = {
      logId: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp,
      sku: variantKey,
      productName: currentProduct.name,
      color: selectedColor.name,
      size: selectedSize,
      type: 'VENTE DIRECTE',
      changeQty: -quantity,
      previousStock: currentStock,
      newStock: nextStock,
      reference: orderId,
      operator: 'Source: Responsable المخزن',
      reason: 'VENTE_DIRECTE_DEPOT',
    };
    onUpdateStockLogs([newLog, ...stockLogs]);

    // 3. Create Order in Order History (Preset to Livrée & Main Propre)
    const newOrder: OrderDetails = {
      id: orderId,
      orderId,
      customerName: finalClientName,
      phone: finalPhone,
      governorate: 'TUNIS (DÉPÔT / STOCK)',
      address: 'Remise en main propre · Stock Central Tunis (المخزن)',
      deliveryNotes: customerNote.trim()
        ? `[VENTE DIRECTE] ${customerNote.trim()} · Règl: ${paymentLabel}`
        : `[VENTE DIRECTE] Retrait المخزن / Main Propre · Règl: ${paymentLabel}`,
      paymentMethod,
      items: [
        {
          id: `${currentProduct.id}-${selectedColor.name}-${selectedSize}`,
          product: currentProduct,
          selectedColor,
          selectedSize,
          quantity,
        },
      ],
      subtotal: totalAmount,
      shipping: 0,
      discountAmount: totalDiscount,
      total: totalAmount,
      createdAt: timestamp,
      status: 'Livrée',
      courierName: 'MAIN PROPRE (RETRAIT المخزن / MAIN PROPRE)',
      courierTrackingRef: 'RETRAIT-DIRECT',
      logisticsStatus: 'Livrée (Encaissé)',
    };
    onUpdateOrders([newOrder, ...orders]);

    // 4. Create Transaction in Sales History (Direct to Chiffre d'Affaires Encaissé)
    const newTx: SalesTransaction = {
      transactionId: `TX-${orderId}`,
      orderId,
      timestamp,
      client: {
        name: finalClientName,
        phone: finalPhone,
        governorate: 'TUNIS (DÉPÔT / STOCK)',
        address: 'Remise en main propre · Stock Central Tunis (المخزن)',
      },
      items: [
        {
          productId: currentProduct.id,
          name: currentProduct.name,
          color: selectedColor.name,
          size: selectedSize,
          qty: quantity,
          unitPrice: effectiveUnitPrice,
        },
      ],
      subtotal: totalAmount,
      shippingFee: 0,
      discountAmount: totalDiscount,
      totalAmount,
      paymentStatus: 'ENCAISSÉ',
      orderStatus: 'Livrée',
      courierName: 'MAIN PROPRE (RETRAIT المخزن / MAIN PROPRE)',
      logisticsStatus: 'Livrée (Encaissé)',
    };
    onUpdateSalesHistory([newTx, ...salesHistory]);

    // 5. Update local state to show instant receipt/invoice actions
    setCreatedOrder(newOrder);
    showNotice(
      `Vente directe ${orderId} validée · ${formatTND(totalAmount)} encaissés · Stock décompté (-${quantity})`
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative w-full max-w-2xl bg-[#101010] border border-[#34312D] text-[#E8E4DD] shadow-2xl flex flex-col my-auto overflow-hidden animate-fade-in">
          {/* Top Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#34312D] bg-[#141414]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#B9A995]/15 border border-[#B9A995]/40 flex items-center justify-center text-[#B9A995]">
                <HandCoins className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div>
                <h3
                  className="font-serif text-lg sm:text-xl text-[#E8E4DD] uppercase tracking-wide"
                  style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
                >
                  NOUVELLE VENTE DIRECTE (REMISE EN MAIN PROPRE)
                </h3>
                <p className="text-[10px] font-mono text-[#B9A995] uppercase tracking-wider">
                  RETRAIT المخزن / MAIN PROPRE · ENCAISSEMENT IMMÉDIAT COMPTANT
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#96918A] hover:text-[#E8E4DD] hover:bg-[#181818] border border-transparent hover:border-[#34312D] transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* If sale is already confirmed, show success & print panel */}
          {createdOrder ? (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-5 bg-emerald-950/30 border border-emerald-500/40 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="font-serif text-xl text-[#E8E4DD] uppercase tracking-wide">
                  VENTE DIRECTE ENREGISTRÉE AVEC SUCCÈS
                </h4>
                <p className="text-xs font-mono text-emerald-400">
                  RÉFÉRENCE : <span className="font-bold">{createdOrder.orderId}</span> · ENCAISSEMENT COMPTABILISÉ
                </p>
              </div>

              {/* Order Recap */}
              <div className="p-4 bg-[#141414] border border-[#34312D] space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-[#34312D]/60 pb-2">
                  <span className="text-[#96918A]">CLIENT :</span>
                  <span className="text-[#E8E4DD] font-bold">{createdOrder.customerName}</span>
                </div>
                <div className="flex justify-between border-b border-[#34312D]/60 pb-2">
                  <span className="text-[#96918A]">ARTICLE :</span>
                  <span className="text-[#E8E4DD]">
                    {createdOrder.items[0]?.quantity}× {createdOrder.items[0]?.product.name} (
                    {createdOrder.items[0]?.selectedColor.name} · {createdOrder.items[0]?.selectedSize})
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#34312D]/60 pb-2">
                  <span className="text-[#96918A]">LIVRAISON :</span>
                  <span className="text-emerald-400">0,000 DT (Retrait المخزن / Main Propre)</span>
                </div>
                <div className="flex justify-between border-b border-[#34312D]/60 pb-2">
                  <span className="text-[#96918A]">MODE DE RÈGLEMENT :</span>
                  <span className="text-[#B9A995] uppercase font-bold">{createdOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-bold">
                  <span className="text-[#E8E4DD]">TOTAL ENCAISSÉ :</span>
                  <span className="text-[#B9A995] text-base">{formatTND(createdOrder.total)}</span>
                </div>
              </div>

              {/* Action Buttons for Printing */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowThermalModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-mono font-bold uppercase transition-colors cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>IMPRIMER TICKET (80MM)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#181818] hover:bg-[#222222] border border-[#34312D] hover:border-[#B9A995] text-[#E8E4DD] text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#B9A995]" />
                  <span>FACTURE OFFICIELLE A4</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 bg-[#141414] border border-[#34312D] text-xs font-mono text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer"
                >
                  TERMINER
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleValidateSale} className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[80vh]">
              {/* Preset Status Indicators */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#141414] border border-[#34312D] text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[#96918A]">STATUT LIVRAISON :</span>
                  <span className="text-emerald-400 font-bold uppercase">LIVRÉ DIRECT</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#B9A995]" />
                  <span className="text-[#96918A]">PAIEMENT :</span>
                  <span className="text-[#B9A995] font-bold uppercase">ENCAISSÉ</span>
                </div>
              </div>

              {/* 1. Customer Information */}
              <div className="space-y-3">
                <label className="text-[11px] font-mono uppercase text-[#B9A995] tracking-widest block font-semibold">
                  1. INFORMATIONS CLIENT (OPTIONNEL)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#96918A] uppercase mb-1 block">
                      Nom / Prénom / Réf client
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-[#96918A] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="ex: Mehdi (Ami) / Client Direct"
                        className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] pl-9 pr-3 py-2 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-[#96918A] uppercase mb-1 block">
                      Téléphone mobile (+216)
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-[#96918A] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+216 92 000 000"
                        className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] pl-9 pr-3 py-2 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Note interne (optionnel : remise en main propre showroom, échange, etc.)"
                    className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 py-1.5 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* 2. Product & Variant Selection */}
              <div className="space-y-3 pt-2 border-t border-[#34312D]/60">
                <label className="text-[11px] font-mono uppercase text-[#B9A995] tracking-widest block font-semibold">
                  2. PIÈCE & VARIANTE ATELIER
                </label>

                {/* Product Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono text-[#96918A] uppercase mb-1 block">
                      Modèle
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 py-2 text-xs text-[#E8E4DD] focus:outline-none font-mono uppercase"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} · {formatTND(p.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-[#96918A] uppercase mb-1 block">
                      Quantité
                    </label>
                    <div className="flex items-center border border-[#34312D] bg-[#181818]">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-3 py-2 text-[#96918A] hover:text-[#E8E4DD] font-mono cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full text-center bg-transparent text-xs text-[#E8E4DD] font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="px-3 py-2 text-[#96918A] hover:text-[#E8E4DD] font-mono cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Color & Size Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Colors */}
                  <div>
                    <label className="text-[10px] font-mono text-[#96918A] uppercase mb-1.5 block">
                      Couleur : <strong className="text-[#E8E4DD]">{selectedColor.name}</strong>
                    </label>
                    <div className="flex items-center gap-2">
                      {currentProduct?.colors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-mono transition-colors cursor-pointer ${
                            selectedColor.name === c.name
                              ? 'border-[#B9A995] bg-[#181818] text-[#E8E4DD]'
                              : 'border-[#34312D] text-[#96918A] hover:text-[#E8E4DD]'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/50"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <label className="text-[10px] font-mono text-[#96918A] uppercase mb-1.5 block">
                      Taille : <strong className="text-[#E8E4DD]">{selectedSize}</strong>
                    </label>
                    <div className="flex gap-1.5">
                      {(currentProduct?.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`h-8 px-3 font-mono text-xs uppercase border transition-colors cursor-pointer ${
                            selectedSize === sz
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

                {/* Real-time Available Stock Badge */}
                <div className="p-2.5 bg-[#141414] border border-[#34312D] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#96918A] flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#B9A995]" />
                    <span>STOCK DISPONIBLE STOCK / DÉPÔT :</span>
                  </span>
                  <span
                    className={`font-bold tabular-nums ${
                      isOutOfStock ? 'text-rose-400' : currentStock <= 2 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {currentStock} pièces
                  </span>
                </div>
                {isOutOfStock && (
                  <p className="text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Attention : Ce stock est actuellement à 0. La validation passera le stock en négatif si vous confirmez.</span>
                  </p>
                )}
              </div>

              {/* 3. Delivery & Price Configuration */}
              <div className="space-y-3 pt-2 border-t border-[#34312D]/60">
                <label className="text-[11px] font-mono uppercase text-[#B9A995] tracking-widest block font-semibold">
                  3. TARIFICATION & PRIX AMICAL
                </label>

                {/* Delivery Option: Fixed at 0 DT */}
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[#E8E4DD] font-bold block">
                      REMISE EN MAIN PROPRE (RETRAIT المخزن / MAIN PROPRE)
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      0,000 DT (Retrait المخزن / Main Propre) · Stock Central KŪZA Tunis
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm">0,000 DT</span>
                </div>

                {/* Friendly Discount / Price Override */}
                <div className="p-3 bg-[#141414] border border-[#34312D] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-[#E8E4DD]">
                      <input
                        type="checkbox"
                        checked={isCustomPriceEnabled}
                        onChange={(e) => {
                          setIsCustomPriceEnabled(e.target.checked);
                          if (!e.target.checked) {
                            setCustomPriceInput(String(catalogUnitPrice));
                          }
                        }}
                        className="rounded border-[#34312D] text-[#B9A995] focus:ring-0"
                      />
                      <span>Appliquer un tarif personnalisé / remise amicale</span>
                    </label>

                    <span className="text-xs font-mono text-[#96918A]">
                      Prix catalogue : {formatTND(catalogUnitPrice)}
                    </span>
                  </div>

                  {isCustomPriceEnabled && (
                    <div className="flex items-center gap-3 pt-2 border-t border-[#34312D]/60">
                      <div className="flex-1">
                        <label className="text-[10px] font-mono text-[#96918A] uppercase mb-1 block">
                          Nouveau prix unitaire (DT)
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={customPriceInput}
                          onChange={(e) => setCustomPriceInput(e.target.value)}
                          placeholder="ex: 70"
                          className="w-full bg-[#181818] border border-[#B9A995] px-3 py-2 text-xs text-[#E8E4DD] font-mono focus:outline-none"
                        />
                      </div>

                      {/* Quick Discount Presets */}
                      <div className="flex gap-1.5 pt-4">
                        <button
                          type="button"
                          onClick={() => setCustomPriceInput(String(Math.max(0, catalogUnitPrice - 10)))}
                          className="px-2.5 py-1.5 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-[10px] font-mono text-[#E8E4DD] cursor-pointer"
                        >
                          -10 DT
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomPriceInput(String(Math.max(0, catalogUnitPrice - 20)))}
                          className="px-2.5 py-1.5 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-[10px] font-mono text-[#E8E4DD] cursor-pointer"
                        >
                          -20 DT
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomPriceInput('70')}
                          className="px-2.5 py-1.5 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-[10px] font-mono text-[#E8E4DD] cursor-pointer"
                        >
                          70 DT
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Payment Method */}
              <div className="space-y-3 pt-2 border-t border-[#34312D]/60">
                <label className="text-[11px] font-mono uppercase text-[#B9A995] tracking-widest block font-semibold">
                  4. MODE DE RÈGLEMENT
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash_atelier')}
                    className={`p-3 border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'cash_atelier'
                        ? 'border-[#B9A995] bg-[#B9A995]/15 text-[#E8E4DD]'
                        : 'border-[#34312D] bg-[#141414] text-[#96918A] hover:text-[#E8E4DD]'
                    }`}
                  >
                    <span className="font-mono text-xs font-bold uppercase block">
                      💵 Espèces Dépôt / Main Propre (Cash)
                    </span>
                    <span className="text-[10px] font-mono text-[#96918A] mt-1">
                      Paiement direct en liquide
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('virement_biat')}
                    className={`p-3 border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'virement_biat'
                        ? 'border-[#B9A995] bg-[#B9A995]/15 text-[#E8E4DD]'
                        : 'border-[#34312D] bg-[#141414] text-[#96918A] hover:text-[#E8E4DD]'
                    }`}
                  >
                    <span className="font-mono text-xs font-bold uppercase block">
                      🏦 Virement BIAT
                    </span>
                    <span className="text-[10px] font-mono text-[#96918A] mt-1">
                      Virement bancaire instantané
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('offert')}
                    className={`p-3 border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'offert'
                        ? 'border-[#B9A995] bg-[#B9A995]/15 text-[#E8E4DD]'
                        : 'border-[#34312D] bg-[#141414] text-[#96918A] hover:text-[#E8E4DD]'
                    }`}
                  >
                    <span className="font-mono text-xs font-bold uppercase block">
                      🎁 Offert / Cadeau
                    </span>
                    <span className="text-[10px] font-mono text-[#96918A] mt-1">
                      Dotation créateur / 0 DT
                    </span>
                  </button>
                </div>
              </div>

              {/* 5. Summary & Total Box */}
              <div className="p-4 bg-[#141414] border border-[#34312D] space-y-2 font-mono text-xs">
                <div className="flex justify-between text-[#96918A]">
                  <span>Sous-total ({quantity} article{quantity > 1 ? 's' : ''}) :</span>
                  <span>{formatTND(effectiveUnitPrice * quantity)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Remise amicale accordée :</span>
                    <span>-{formatTND(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#96918A]">
                  <span>Frais de livraison :</span>
                  <span className="text-emerald-400 font-semibold">0,000 DT (Retrait المخزن / Main Propre)</span>
                </div>
                <div className="pt-2 border-t border-[#34312D] flex items-baseline justify-between">
                  <span className="font-bold text-sm text-[#E8E4DD]">NET À ENCAISSER :</span>
                  <span
                    className="font-bold text-xl sm:text-2xl text-[#B9A995]"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {formatTND(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 bg-[#141414] border border-[#34312D] hover:border-[#96918A] text-xs font-mono text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer"
                >
                  ANNULER
                </button>

                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>VALIDER LA VENTE DIRECTE ({formatTND(totalAmount)})</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Instant Thermal Receipt Modal if user clicks print 80mm */}
      {showThermalModal && createdOrder && (
        <ThermalReceiptModal
          order={createdOrder}
          onClose={() => setShowThermalModal(false)}
        />
      )}

      {/* Instant Official A4 Invoice Modal if user clicks A4 invoice */}
      {showInvoiceModal && createdOrder && (
        <InvoiceModal
          order={createdOrder}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </>
  );
};

export default DirectSaleModal;
