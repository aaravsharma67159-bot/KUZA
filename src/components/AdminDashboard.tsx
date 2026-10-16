import React, { useState, useRef, useEffect } from 'react';
import { Product, ProductColor, getVariantKey, INITIAL_INVENTORY } from '../data/products';
import {
  InventoryMap,
  OrderDetails,
  SalesTransaction,
  StockMovementLog,
  PaymentStatus,
  StockMovementType,
  Coupon,
  BundleRule,
  PromotionsState,
  StockEntryNote,
  StockEntryStatus,
} from '../types';
import { DEFAULT_SALES_HISTORY, DEFAULT_STOCK_LOGS, DEFAULT_STOCK_ENTRIES } from '../data/initialLedger';
import shelterSweatNoir from '../assets/images/shelter_sweat_noir_1791729594321.jpg';
import shelterSweatBeige from '../assets/images/shelter_sweat_beige_1791729629495.jpg';
import restWideNoir from '../assets/images/rest_wide_noir_1791729608671.jpg';
import restWideBeige from '../assets/images/rest_wide_beige_1791729647894.jpg';
import {
  loadStoredPromotions,
  saveStoredPromotions,
  INITIAL_COUPONS,
  INITIAL_BUNDLE_RULES,
} from '../utils/promotions';
import { PrintableStockEntryModal } from './PrintableStockEntryModal';
import { NewStockEntryModal } from './NewStockEntryModal';
import {
  ArrowLeft,
  Package,
  PackageCheck,
  Boxes,
  ClipboardList,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  Search,
  Lock,
  Unlock,
  SlidersHorizontal,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Star,
  Image as ImageIcon,
  Link as LinkIcon,
  Maximize2,
  Save,
  RefreshCw,
  TrendingUp,
  BarChart3,
  History,
  Download,
  DollarSign,
  CheckCircle2,
  Clock,
  Ban,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  FileSpreadsheet,
  ShieldCheck,
  Receipt,
  Tag,
  ShoppingBag,
  Wallet,
  Truck,
  Minus,
  Printer,
  Sparkles,
  Layout,
} from 'lucide-react';
import { SiteCmsTab } from './SiteCmsTab';
import { PieceManagement } from './PieceManagement';
import { OrderJournal } from './OrderJournal';
import { SalesJournal } from './SalesJournal';
import { AuditJournal } from './AuditJournal';
import { BonsEntree } from './BonsEntree';
import { PromotionsManagement } from './PromotionsManagement';
import { AdminAnalytics } from './AdminAnalytics';
import { KuzaMonogram } from './KuzaMonogram';
import { KuzaLogo } from './KuzaLogo';
import { fileToOptimizedDataUrl } from '../utils/imageUpload';
import { PhotoLightbox } from './PhotoLightbox';
import { PrintableBordereauModal, PrintableOrderModel } from './PrintableBordereauModal';
import { DirectSaleModal } from './DirectSaleModal';
import { formatTND } from '../utils/currency';

interface AdminDashboardProps {
  products: Product[];
  inventory: InventoryMap;
  orders: OrderDetails[];
  salesHistory?: SalesTransaction[];
  stockLogs?: StockMovementLog[];
  stockEntries?: StockEntryNote[];
  promotionsState?: PromotionsState;
  onUpdateInventory: (newInventory: InventoryMap) => void;
  onUpdateProducts: (newProducts: Product[]) => void;
  onUpdateOrders?: (newOrders: OrderDetails[]) => void;
  onUpdateSalesHistory?: (newHistory: SalesTransaction[]) => void;
  onUpdateStockLogs?: (newLogs: StockMovementLog[]) => void;
  onUpdateStockEntries?: (newEntries: StockEntryNote[]) => void;
  onUpdatePromotions?: (newPromos: PromotionsState) => void;
  onClose: () => void;
  onLogout: () => void;
  onResetDefaults: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  inventory,
  orders,
  salesHistory = DEFAULT_SALES_HISTORY,
  stockLogs = DEFAULT_STOCK_LOGS,
  stockEntries = DEFAULT_STOCK_ENTRIES,
  promotionsState,
  onUpdateInventory,
  onUpdateProducts,
  onUpdateOrders,
  onUpdateSalesHistory,
  onUpdateStockLogs,
  onUpdateStockEntries,
  onUpdatePromotions,
  onClose,
  onLogout,
  onResetDefaults,
}) => {
  // Active Tab: 'inventory' | 'products' | 'orders' | 'sales' | 'analytics' | 'audit' | 'promotions' | 'entries' | 'cms'
  const [activeTab, setActiveTab] = useState<'inventory' | 'products' | 'orders' | 'sales' | 'analytics' | 'audit' | 'promotions' | 'entries' | 'cms'>('inventory');
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState<PrintableOrderModel | null>(null);
  const [batchOrdersForSlip, setBatchOrdersForSlip] = useState<PrintableOrderModel[] | null>(null);
  const [isDirectSaleModalOpen, setIsDirectSaleModalOpen] = useState(false);

  // Stock Entries (Bons d'Entrée) state & modals
  const [localStockEntries, setLocalStockEntries] = useState<StockEntryNote[]>(() => stockEntries);
  const [selectedEntryForPrint, setSelectedEntryForPrint] = useState<StockEntryNote | null>(null);
  const [isCreatingStockEntry, setIsCreatingStockEntry] = useState(false);
  const [entrySearch, setEntrySearch] = useState('');
  const [entryStatusFilter, setEntryStatusFilter] = useState<'all' | 'VALIDATED' | 'DRAFT'>('all');

  // Promotions State & Local management
  const [localPromos, setLocalPromos] = useState<PromotionsState>(() => promotionsState || loadStoredPromotions());
  const [couponSearch, setCouponSearch] = useState('');
  const [couponFilter, setCouponFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [editingBundle, setEditingBundle] = useState<BundleRule | null>(null);
  const [isCreatingBundle, setIsCreatingBundle] = useState(false);

  // Multi-Select and Logistics Filters State
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersStatusFilter, setOrdersStatusFilter] = useState<string>('all');
  const [ordersCourierFilter, setOrdersCourierFilter] = useState<string>('all');

  // Search & Filter state for Sales History Ledger
  const [salesSearch, setSalesSearch] = useState('');
  const [salesDateFilter, setSalesDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [salesStatusFilter, setSalesStatusFilter] = useState<string>('all');

  // Search & Filter state for Stock Audit Trail
  const [auditSearch, setAuditSearch] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState<string>('all');
  const [auditModelFilter, setAuditModelFilter] = useState<string>('all');

  // Notification feedback
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 2500);
  };

  // Helper to record stock movement log
  const recordStockMovement = (
    key: string,
    delta: number,
    prevStock: number,
    nextStock: number,
    type: StockMovementType,
    ref = 'Atelier Admin',
    operator = 'Admin (Mehdi)',
    reason = 'AJUSTEMENT_MANUEL'
  ) => {
    const parts = key.split(':');
    const productId = parts[0] || 'produit';
    const color = parts[1] || 'Standard';
    const size = parts[2] || 'M';
    const prod = products.find((p) => p.id === productId);
    const productName = prod ? prod.name : productId.toUpperCase();

    const newLog: StockMovementLog = {
      logId: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      sku: key,
      productName,
      color,
      size,
      type,
      changeQty: delta,
      previousStock: prevStock,
      newStock: nextStock,
      reference: ref,
      operator,
      reason,
    };

    if (onUpdateStockLogs) {
      onUpdateStockLogs([newLog, ...stockLogs]);
    }
  };

  // Multi-select helpers for Orders and Sales lists
  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllOrders = (ids: string[]) => {
    const allSelected = ids.length > 0 && ids.every((id) => selectedOrderIds.includes(id));
    if (allSelected) {
      setSelectedOrderIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  // Comprehensive logistics updater with automatic restock on 'Refusé / Retour'
  const handleUpdateOrderLogistics = (
    orderId: string,
    updates: {
      courierName?: string;
      courierTrackingRef?: string;
      logisticsStatus?: string;
      status?: string;
    }
  ) => {
    const targetOrder = orders.find((o) => (o.id || o.orderId) === orderId || o.orderId === orderId);
    const targetTx = salesHistory.find((tx) => tx.orderId === orderId);

    const oldStatus = (targetOrder?.logisticsStatus || targetOrder?.status || targetTx?.orderStatus || 'En préparation') as string;
    const newStatus = (updates.logisticsStatus || updates.status || oldStatus) as string;

    const wasRefusedOrReturned = oldStatus === 'Refusé / Retour' || oldStatus === 'Annulée';
    const isNowRefusedOrReturned = newStatus === 'Refusé / Retour' || newStatus === 'Annulée';

    // 1. Update orders list
    const updatedOrders = orders.map((ord) => {
      const currentId = ord.id || ord.orderId;
      if (currentId === orderId || ord.orderId === orderId || ord.id === orderId) {
        return {
          ...ord,
          id: ord.id || ord.orderId,
          ...(updates.courierName !== undefined ? { courierName: updates.courierName } : {}),
          ...(updates.courierTrackingRef !== undefined ? { courierTrackingRef: updates.courierTrackingRef } : {}),
          ...(updates.logisticsStatus !== undefined ? { logisticsStatus: updates.logisticsStatus } : {}),
          status: (updates.status || updates.logisticsStatus || ord.status) as any,
        };
      }
      return ord;
    });

    if (onUpdateOrders) {
      onUpdateOrders(updatedOrders);
    }

    // 2. Compute Payment Status
    let paymentStatus: PaymentStatus = 'EN_ATTENTE_LIVRAISON';
    if (newStatus === 'Livrée (Encaissé)' || newStatus === 'Livrée') {
      paymentStatus = 'ENCAISSÉ';
    } else if (newStatus === 'Refusé / Retour') {
      paymentStatus = 'RETOUR_NON_LIVRÉ';
    } else if (newStatus === 'Annulée') {
      paymentStatus = 'ANNULÉE';
    }

    // 3. Update Sales History Ledger (kuza_sales_history)
    let nextSalesHistory = [...salesHistory];
    const txIndex = nextSalesHistory.findIndex((tx) => tx.orderId === orderId);
    if (txIndex >= 0) {
      nextSalesHistory[txIndex] = {
        ...nextSalesHistory[txIndex],
        ...(updates.courierName !== undefined ? { courierName: updates.courierName } : {}),
        ...(updates.courierTrackingRef !== undefined ? { courierTrackingRef: updates.courierTrackingRef } : {}),
        ...(updates.logisticsStatus !== undefined ? { logisticsStatus: updates.logisticsStatus } : {}),
        orderStatus: newStatus,
        paymentStatus,
      };
    } else if (targetOrder) {
      nextSalesHistory.unshift({
        transactionId: `TX-${targetOrder.orderId}`,
        orderId: targetOrder.orderId,
        timestamp: new Date().toISOString(),
        client: {
          name: targetOrder.customerName,
          phone: targetOrder.phone,
          phoneSecondary: targetOrder.phoneSecondary,
          governorate: targetOrder.governorate,
          address: targetOrder.address,
        },
        items: targetOrder.items.map((it) => ({
          productId: it.product.id,
          name: it.product.name,
          color: it.selectedColor.name,
          size: it.selectedSize,
          qty: it.quantity,
          unitPrice: it.product.price,
        })),
        subtotal: targetOrder.subtotal,
        shippingFee: targetOrder.shipping || 8,
        totalAmount: targetOrder.total,
        paymentStatus,
        orderStatus: newStatus,
        courierName: updates.courierName || targetOrder.courierName,
        courierTrackingRef: updates.courierTrackingRef || targetOrder.courierTrackingRef,
        logisticsStatus: updates.logisticsStatus || targetOrder.logisticsStatus,
      });
    }

    if (onUpdateSalesHistory) {
      onUpdateSalesHistory(nextSalesHistory);
    }

    // 4. Auto-restock logic on 'Refusé / Retour' or 'Annulée'
    let nextInventory = { ...inventory };
    let newLogs: StockMovementLog[] = [];
    const timestamp = new Date().toISOString();

    if (isNowRefusedOrReturned && !wasRefusedOrReturned) {
      // Restore inventory quantities automatically
      const itemsToRestore = targetOrder
        ? targetOrder.items.map((it) => ({
            id: it.product.id,
            name: it.product.name,
            color: it.selectedColor.name,
            size: it.selectedSize,
            quantity: it.quantity,
          }))
        : targetTx
        ? targetTx.items.map((it) => ({
            id: it.productId,
            name: it.name,
            color: it.color,
            size: it.size,
            quantity: it.qty,
          }))
        : [];

      itemsToRestore.forEach((item) => {
        const key = getVariantKey(item.id, item.color, item.size);
        const prevQty = nextInventory[key] ?? 0;
        const nextQty = prevQty + item.quantity;
        nextInventory[key] = nextQty;

        newLogs.push({
          logId: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp,
          sku: key,
          productName: item.name,
          color: item.color,
          size: item.size,
          type: 'ANNULATION_RESTOCK',
          changeQty: item.quantity,
          previousStock: prevQty,
          newStock: nextQty,
          reference: newStatus === 'Refusé / Retour' ? 'Retour Transporteur' : orderId,
          operator: 'Admin (Mehdi)',
          reason: newStatus === 'Refusé / Retour' ? 'RETOUR_TRANSPORT' : 'ANNULATION_COMMANDE',
        });
      });

      onUpdateInventory(nextInventory);
      if (newLogs.length > 0 && onUpdateStockLogs) {
        onUpdateStockLogs([...newLogs, ...stockLogs]);
      }
      showNotice(
        newStatus === 'Refusé / Retour'
          ? `Commande ${orderId} : Colis refusé/retourné · Stock réintégré (Retour Transporteur)`
          : `Commande ${orderId} annulée · Articles réintégrés au stock`
      );
    } else if (wasRefusedOrReturned && !isNowRefusedOrReturned) {
      // Re-deduct if reactivated
      const itemsToDeduct = targetOrder
        ? targetOrder.items.map((it) => ({
            id: it.product.id,
            name: it.product.name,
            color: it.selectedColor.name,
            size: it.selectedSize,
            quantity: it.quantity,
          }))
        : targetTx
        ? targetTx.items.map((it) => ({
            id: it.productId,
            name: it.name,
            color: it.color,
            size: it.size,
            quantity: it.qty,
          }))
        : [];

      itemsToDeduct.forEach((item) => {
        const key = getVariantKey(item.id, item.color, item.size);
        const prevQty = nextInventory[key] ?? 10;
        const nextQty = Math.max(0, prevQty - item.quantity);
        nextInventory[key] = nextQty;

        newLogs.push({
          logId: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp,
          sku: key,
          productName: item.name,
          color: item.color,
          size: item.size,
          type: 'VENTE',
          changeQty: -item.quantity,
          previousStock: prevQty,
          newStock: nextQty,
          reference: orderId,
          operator: 'Automatique (Boutique COD)',
          reason: 'RÉACTIVATION_COMMANDE',
        });
      });

      onUpdateInventory(nextInventory);
      if (newLogs.length > 0 && onUpdateStockLogs) {
        onUpdateStockLogs([...newLogs, ...stockLogs]);
      }
      showNotice(`Commande ${orderId} réactivée · Stock décompté`);
    } else if (newStatus === 'Livrée (Encaissé)' || newStatus === 'Livrée') {
      showNotice(`Commande ${orderId} livrée · Encaissement COD validé`);
    } else {
      showNotice(`Commande ${orderId} : Logistique mise à jour (${newStatus})`);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    handleUpdateOrderLogistics(orderId, { logisticsStatus: newStatus, status: newStatus });
  };

  // Inventory search / filter
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'low' | 'out'>('all');

  // Product Editing / Creation state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleLogout = () => {
    onLogout();
  };

  // Adjust stock for a variant with instant auto-save feedback & audit logging
  const handleStockChange = (key: string, delta: number) => {
    const current = inventory[key] || 0;
    const nextVal = Math.max(0, current + delta);
    const actualDelta = nextVal - current;
    if (actualDelta === 0) return;

    const updated = { ...inventory, [key]: nextVal };
    onUpdateInventory(updated);
    recordStockMovement(
      key,
      actualDelta,
      current,
      nextVal,
      actualDelta > 0 ? 'RÉAPPROVISIONNEMENT' : 'AJUSTEMENT_MANUEL',
      'Atelier Admin'
    );
    showNotice(`Stock ajusté (${nextVal} ex.) · Mouvement journalisé`);
  };

  const handleSetStockDirect = (key: string, value: number) => {
    const safeVal = Math.max(0, Math.floor(isNaN(value) ? 0 : value));
    const current = inventory[key] || 0;
    const actualDelta = safeVal - current;
    if (actualDelta === 0) return;

    const updated = { ...inventory, [key]: safeVal };
    onUpdateInventory(updated);
    recordStockMovement(
      key,
      actualDelta,
      current,
      safeVal,
      actualDelta > 0 ? 'RÉAPPROVISIONNEMENT' : 'AJUSTEMENT_MANUEL',
      'Atelier Admin'
    );
    showNotice(`Stock ajusté (${safeVal} ex.) · Mouvement journalisé`);
  };

  const handleSyncAllInventory = () => {
    onUpdateInventory({ ...inventory });
    showNotice('Matrice des stocks synchronisée et enregistrée');
  };

  const handleBatchAdjustCard = (keys: string[], delta: number, label: string) => {
    const updated = { ...inventory };
    const batchLogs: StockMovementLog[] = [];
    const timestamp = new Date().toISOString();

    keys.forEach((k) => {
      const current = updated[k] || 0;
      const nextVal = Math.max(0, current + delta);
      const actualDelta = nextVal - current;
      updated[k] = nextVal;

      if (actualDelta !== 0) {
        const parts = k.split(':');
        const productId = parts[0] || 'produit';
        const color = parts[1] || 'Standard';
        const size = parts[2] || 'M';
        const prod = products.find((p) => p.id === productId);

        batchLogs.push({
          logId: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp,
          sku: k,
          productName: prod ? prod.name : productId.toUpperCase(),
          color,
          size,
          type: actualDelta > 0 ? 'RÉAPPROVISIONNEMENT' : 'AJUSTEMENT_MANUEL',
          changeQty: actualDelta,
          previousStock: current,
          newStock: nextVal,
          reference: `Atelier Admin (${label})`,
          operator: 'Admin (Mehdi)',
          reason: actualDelta > 0 ? 'RÉAPPRO_LOT' : 'AJUSTEMENT_LOT',
        });
      }
    });

    onUpdateInventory(updated);
    if (batchLogs.length > 0 && onUpdateStockLogs) {
      onUpdateStockLogs([...batchLogs, ...stockLogs]);
    }
    showNotice(`Lot ${label} réapprovisionné (+${delta}/taille) · ${batchLogs.length} logs enregistrés`);
  };

  // Toggle Product Visibility (soft-delete / hide from storefront)
  const handleToggleVisibility = (productId: string) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const nextState = p.visible !== false ? false : true;
        return { ...p, visible: nextState };
      }
      return p;
    });
    onUpdateProducts(updated);
    showNotice('Visibilité de la pièce mise à jour');
  };

  // Delete product completely
  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    onUpdateProducts(updated);
    setConfirmDeleteId(null);
    showNotice('Pièce supprimée du catalogue');
  };

  // Save edited or created product
  const handleSaveProduct = (productData: Product, initialStockCount?: number) => {
    if (isCreatingNew) {
      // Add product
      const updatedProducts = [...products, productData];
      onUpdateProducts(updatedProducts);

      // Seed initial stock for new product variants
      const newInventory = { ...inventory };
      productData.colors.forEach((color) => {
        productData.sizes.forEach((size) => {
          const key = getVariantKey(productData.id, color.name, size);
          if (newInventory[key] === undefined) {
            newInventory[key] = initialStockCount ?? 8;
          }
        });
      });
      onUpdateInventory(newInventory);

      setIsCreatingNew(false);
      showNotice(`Pièce "${productData.name}" ajoutée au catalogue`);
    } else if (editingProduct) {
      // Update existing product
      const updatedProducts = products.map((p) =>
        p.id === productData.id ? productData : p
      );
      onUpdateProducts(updatedProducts);

      // Ensure variant stock matrix is updated for all colors and sizes of this product
      const updatedInventory = { ...inventory };
      productData.colors.forEach((color) => {
        productData.sizes.forEach((size) => {
          const key = getVariantKey(productData.id, color.name, size);
          if (updatedInventory[key] === undefined) {
            updatedInventory[key] = initialStockCount ?? 8;
          }
        });
      });
      onUpdateInventory(updatedInventory);

      setEditingProduct(null);
      showNotice(`Pièce "${productData.name}" mise à jour`);
    }
  };

  // ==========================================
  // PROMOTIONS & BUNDLE MANAGEMENT HANDLERS
  // ==========================================
  const handleToggleCoupon = (id: string) => {
    const updatedCoupons = localPromos.coupons.map((c) =>
      c.id === id ? { ...c, active: !c.active } : c
    );
    const updatedState: PromotionsState = { ...localPromos, coupons: updatedCoupons };
    setLocalPromos(updatedState);
    saveStoredPromotions(updatedState);
    if (onUpdatePromotions) onUpdatePromotions(updatedState);
    showNotice('Statut du code promo actualisé');
  };

  const handleDeleteCoupon = (id: string) => {
    const updatedCoupons = localPromos.coupons.filter((c) => c.id !== id);
    const updatedState: PromotionsState = { ...localPromos, coupons: updatedCoupons };
    setLocalPromos(updatedState);
    saveStoredPromotions(updatedState);
    if (onUpdatePromotions) onUpdatePromotions(updatedState);
    showNotice('Code promo supprimé');
  };

  const handleSaveCoupon = (coupon: Coupon) => {
    let updatedCoupons: Coupon[];
    if (editingCoupon) {
      updatedCoupons = localPromos.coupons.map((c) =>
        c.id === coupon.id ? coupon : c
      );
    } else {
      updatedCoupons = [coupon, ...localPromos.coupons];
    }
    const updatedState: PromotionsState = { ...localPromos, coupons: updatedCoupons };
    setLocalPromos(updatedState);
    saveStoredPromotions(updatedState);
    if (onUpdatePromotions) onUpdatePromotions(updatedState);
    setEditingCoupon(null);
    setIsCreatingCoupon(false);
    showNotice(`Code « ${coupon.code} » enregistré`);
  };

  const handleToggleBundle = (id: string) => {
    const updatedRules = localPromos.bundleRules.map((b) =>
      b.id === id ? { ...b, active: !b.active } : b
    );
    const updatedState: PromotionsState = { ...localPromos, bundleRules: updatedRules };
    setLocalPromos(updatedState);
    saveStoredPromotions(updatedState);
    if (onUpdatePromotions) onUpdatePromotions(updatedState);
    showNotice("Statut de l'offre bundle actualisé");
  };

  const handleUpdateBundlePercent = (id: string, newPercent: number) => {
    const updatedRules = localPromos.bundleRules.map((b) =>
      b.id === id ? { ...b, discountPercent: newPercent } : b
    );
    const updatedState: PromotionsState = { ...localPromos, bundleRules: updatedRules };
    setLocalPromos(updatedState);
    saveStoredPromotions(updatedState);
    if (onUpdatePromotions) onUpdatePromotions(updatedState);
    showNotice(`Remise bundle actualisée : -${newPercent}%`);
  };

  const handleDeleteBundle = (id: string) => {
    const updatedRules = localPromos.bundleRules.filter((b) => b.id !== id);
    const updatedState: PromotionsState = { ...localPromos, bundleRules: updatedRules };
    setLocalPromos(updatedState);
    saveStoredPromotions(updatedState);
    if (onUpdatePromotions) onUpdatePromotions(updatedState);
    showNotice('Règle de bundle supprimée');
  };

  const handleSaveBundle = (bundle: BundleRule) => {
    let updatedRules: BundleRule[];
    if (editingBundle) {
      updatedRules = localPromos.bundleRules.map((b) =>
        b.id === bundle.id ? bundle : b
      );
    } else {
      updatedRules = [bundle, ...localPromos.bundleRules];
    }
    const updatedState: PromotionsState = { ...localPromos, bundleRules: updatedRules };
    setLocalPromos(updatedState);
    saveStoredPromotions(updatedState);
    if (onUpdatePromotions) onUpdatePromotions(updatedState);
    setEditingBundle(null);
    setIsCreatingBundle(false);
    showNotice(`Offre bundle « ${bundle.name} » enregistrée`);
  };

  const handleResetPromotionsToDefault = () => {
    const initial: PromotionsState = {
      coupons: INITIAL_COUPONS,
      bundleRules: INITIAL_BUNDLE_RULES,
    };
    setLocalPromos(initial);
    saveStoredPromotions(initial);
    if (onUpdatePromotions) onUpdatePromotions(initial);
    showNotice("Promotions & bundles réinitialisés aux valeurs d'atelier");
  };

  // ==========================================
  // BON D'ENTRÉE (STOCK RECEIPT NOTE) HANDLERS
  // ==========================================
  const handleSaveStockEntry = (newEntry: StockEntryNote) => {
    const updatedEntries = [newEntry, ...localStockEntries];
    setLocalStockEntries(updatedEntries);
    localStorage.setItem('kuza_stock_entries', JSON.stringify(updatedEntries));
    if (onUpdateStockEntries) onUpdateStockEntries(updatedEntries);

    // If validated directly on creation, inject quantities into inventory and record movement logs
    if (newEntry.status === 'VALIDATED') {
      const nextInventory = { ...inventory };
      const newLogs: StockMovementLog[] = [];
      const timestamp = new Date().toISOString();

      newEntry.items.forEach((item) => {
        const key = getVariantKey(item.productId, item.color, item.size);
        const prevStock = nextInventory[key] ?? 0;
        const nextStock = prevStock + item.quantityAdded;
        nextInventory[key] = nextStock;

        newLogs.push({
          logId: `LOG-BE-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp,
          sku: key,
          productName: item.productName,
          color: item.color,
          size: item.size,
          type: 'RÉAPPROVISIONNEMENT',
          changeQty: item.quantityAdded,
          previousStock: prevStock,
          newStock: nextStock,
          reference: `[${newEntry.id}] Réception de +${newEntry.totalPieces} pièces depuis l'atelier partenaire.`,
        });
      });

      onUpdateInventory(nextInventory);
      if (onUpdateStockLogs) {
        onUpdateStockLogs([...newLogs, ...stockLogs]);
      }
      showNotice(`Bon d'Entrée ${newEntry.id} validé · +${newEntry.totalPieces} pièces injectées en stock`);
    } else {
      showNotice(`Bon d'Entrée ${newEntry.id} enregistré comme brouillon`);
    }

    setIsCreatingStockEntry(false);
  };

  const handleValidateDraftEntry = (entryId: string) => {
    const target = localStockEntries.find((e) => e.id === entryId);
    if (!target || target.status === 'VALIDATED') return;

    const nextInventory = { ...inventory };
    const newLogs: StockMovementLog[] = [];
    const timestamp = new Date().toISOString();

    target.items.forEach((item) => {
      const key = getVariantKey(item.productId, item.color, item.size);
      const prevStock = nextInventory[key] ?? 0;
      const nextStock = prevStock + item.quantityAdded;
      nextInventory[key] = nextStock;

      newLogs.push({
        logId: `LOG-BE-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp,
        sku: key,
        productName: item.productName,
        color: item.color,
        size: item.size,
        type: 'RÉAPPROVISIONNEMENT',
        changeQty: item.quantityAdded,
        previousStock: prevStock,
        newStock: nextStock,
        reference: `[${target.id}] Réception de +${target.totalPieces} pièces depuis l'atelier partenaire.`,
      });
    });

    onUpdateInventory(nextInventory);
    if (onUpdateStockLogs) {
      onUpdateStockLogs([...newLogs, ...stockLogs]);
    }

    const updatedEntries = localStockEntries.map((e) =>
      e.id === entryId ? { ...e, status: 'VALIDATED' as StockEntryStatus } : e
    );
    setLocalStockEntries(updatedEntries);
    localStorage.setItem('kuza_stock_entries', JSON.stringify(updatedEntries));
    if (onUpdateStockEntries) onUpdateStockEntries(updatedEntries);

    showNotice(`Brouillon ${target.id} validé · +${target.totalPieces} pièces injectées en stock`);
  };

  const handleDeleteStockEntry = (entryId: string) => {
    const updatedEntries = localStockEntries.filter((e) => e.id !== entryId);
    setLocalStockEntries(updatedEntries);
    localStorage.setItem('kuza_stock_entries', JSON.stringify(updatedEntries));
    if (onUpdateStockEntries) onUpdateStockEntries(updatedEntries);
    showNotice(`Bon d'Entrée ${entryId} retiré de l'historique`);
  };

  const exportStockEntriesCSV = () => {
    const headers = [
      'N° Bon d’Entrée',
      'Date / Heure',
      'Fournisseur / Atelier',
      'Lot Référence',
      'Responsable',
      'Articles Réceptionnés',
      'Total Pièces',
      'Statut',
      'Observations',
    ];
    const rows = filteredStockEntries.map((entry) => [
      entry.id,
      new Date(entry.date).toLocaleString('fr-FR'),
      `"${entry.supplierAtelier.replace(/"/g, '""')}"`,
      `"${entry.referenceBatch.replace(/"/g, '""')}"`,
      `"${entry.createdByName.replace(/"/g, '""')}"`,
      `"${entry.items.map((it) => `${it.productName} (${it.color} · ${it.size}) +${it.quantityAdded}`).join(' | ')}"`,
      entry.totalPieces,
      entry.status,
      `"${(entry.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `kuza_bons_entree_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice('Registre des Bons d’Entrée exporté au format CSV');
  };

  // Export full stock matrix report (CSV)
  const exportStockLevelsCSV = () => {
    const headers = [
      'ID Produit',
      'Modèle',
      'Coloris',
      'Taille',
      'SKU Complet',
      'Unités en Stock',
      'Prix Unitaire (TND)',
      'Valeur Stock (TND)',
      'Statut Stock',
    ];

    const rows: Array<Array<string | number>> = [];

    products.forEach((p) => {
      p.colors.forEach((c) => {
        p.sizes.forEach((s) => {
          const key = getVariantKey(p.id, c.name, s);
          const qty = inventory[key] || 0;
          const status = qty === 0 ? 'RUPTURE' : qty <= 3 ? 'STOCK_FAIBLE' : 'DISPONIBLE';
          const totalVal = qty * p.price;

          rows.push([
            p.id,
            `"${p.name.replace(/"/g, '""')}"`,
            `"${c.name.replace(/"/g, '""')}"`,
            s,
            `${p.id.toUpperCase()}-${c.name.toUpperCase()}-${s}`,
            qty,
            p.price,
            totalVal,
            status,
          ]);
        });
      });
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `kuza_rapport_stocks_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice('Rapport d’inventaire des stocks exporté (CSV)');
  };

  // Calculate Overview Stats
  const totalCatalogCount = products.length;
  const activeProductsCount = products.filter((p) => p.visible !== false).length;

  let totalUnitsInStock = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  products.forEach((p) => {
    p.colors.forEach((c) => {
      p.sizes.forEach((s) => {
        const key = getVariantKey(p.id, c.name, s);
        const qty = inventory[key] || 0;
        totalUnitsInStock += qty;
        if (qty === 0) outOfStockCount++;
        else if (qty <= 3) lowStockCount++;
      });
    });
  });

  // Grouped Product-Color Matrix Model
  interface ProductColorCardData {
    product: Product;
    color: ProductColor;
    cardKey: string;
    skuPrefix: string;
    thumbnail: string;
    sizes: Array<{
      size: string;
      key: string;
      qty: number;
    }>;
    totalUnits: number;
    hasLowStock: boolean;
    hasOutOfStock: boolean;
    isAllInStock: boolean;
    lowCount: number;
    outCount: number;
  }

  let totalCardsCount = 0;
  let lowStockCardsCount = 0;
  let outOfStockCardsCount = 0;

  const allMatrixCards: ProductColorCardData[] = [];

  products.forEach((p) => {
    p.colors.forEach((c) => {
      totalCardsCount++;
      const skuPrefix = `${p.id.toUpperCase()}-${c.name.toUpperCase()}`;
      
      // Guaranteed accurate product color photo mapping (No generic or mismatched placeholders)
      let thumbnail = '';
      if (p.id === 'shelter-sweat' || p.name.toUpperCase().includes('SHELTER')) {
        thumbnail = c.name.toLowerCase() === 'noir' ? shelterSweatNoir : shelterSweatBeige;
      } else if (p.id === 'rest-wide' || p.name.toUpperCase().includes('REST')) {
        thumbnail = c.name.toLowerCase() === 'noir' ? restWideNoir : restWideBeige;
      } else {
        thumbnail = (c as any).images?.[0] || p.colorImages?.[c.name]?.[0] || p.images[0] || '';
      }

      const sizesData = p.sizes.map((s) => {
        const key = getVariantKey(p.id, c.name, s);
        const qty = inventory[key] || 0;
        return { size: s, key, qty };
      });

      const totalUnits = sizesData.reduce((acc, curr) => acc + curr.qty, 0);
      const lowCount = sizesData.filter((s) => s.qty > 0 && s.qty <= 3).length;
      const outCount = sizesData.filter((s) => s.qty === 0).length;
      const hasLowStock = lowCount > 0;
      const hasOutOfStock = outCount > 0;
      const isAllInStock = sizesData.every((s) => s.qty > 3);

      if (hasLowStock) lowStockCardsCount++;
      if (hasOutOfStock) outOfStockCardsCount++;

      allMatrixCards.push({
        product: p,
        color: c,
        cardKey: `${p.id}:${c.name}`,
        skuPrefix,
        thumbnail,
        sizes: sizesData,
        totalUnits,
        hasLowStock,
        hasOutOfStock,
        isAllInStock,
        lowCount,
        outCount,
      });
    });
  });

  // Filter matrix cards based on search query and filter chips
  const filteredMatrixCards = allMatrixCards.filter((card) => {
    const q = inventorySearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      card.product.name.toLowerCase().includes(q) ||
      card.color.name.toLowerCase().includes(q) ||
      card.product.id.toLowerCase().includes(q) ||
      card.skuPrefix.toLowerCase().includes(q) ||
      (card.product.spec && card.product.spec.toLowerCase().includes(q)) ||
      card.sizes.some((s) => s.size.toLowerCase() === q);

    let matchesFilter = true;
    if (inventoryFilter === 'low') matchesFilter = card.hasLowStock;
    if (inventoryFilter === 'out') matchesFilter = card.hasOutOfStock;

    return matchesSearch && matchesFilter;
  });

  // Total revenue calculated from orders
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);

  // Compute Key Metrics for Sales History Ledger & Revenue
  const nonCancelledTransactions = salesHistory.filter(
    (t) => t.paymentStatus !== 'ANNULÉE' && t.orderStatus !== 'Annulée'
  );
  const totalRevenueLedger = nonCancelledTransactions.reduce(
    (acc, t) => acc + (t.totalAmount || 0),
    0
  );
  const totalCashCollected = salesHistory
    .filter(
      (t) =>
        t.paymentStatus === 'ENCAISSÉ' ||
        t.orderStatus === 'Livrée' ||
        t.orderStatus === 'delivered'
    )
    .reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  const inTransitAmount = salesHistory
    .filter(
      (t) =>
        t.paymentStatus === 'EN_ATTENTE_LIVRAISON' &&
        t.orderStatus !== 'Annulée' &&
        t.orderStatus !== 'cancelled'
    )
    .reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  const inTransitCount = salesHistory.filter(
    (t) =>
      t.paymentStatus === 'EN_ATTENTE_LIVRAISON' &&
      t.orderStatus !== 'Annulée' &&
      t.orderStatus !== 'cancelled'
  ).length;
  const totalUnitsSold = nonCancelledTransactions.reduce((acc, t) => {
    return acc + (t.items || []).reduce((itemAcc, it) => itemAcc + it.qty, 0);
  }, 0);

  // Filtered orders list
  const filteredOrders = orders.filter((ord) => {
    const q = ordersSearch.trim().toLowerCase();
    const status = ord.logisticsStatus || ord.status || 'En préparation';
    const courier = ord.courierName || '';

    const matchesSearch =
      !q ||
      ord.orderId.toLowerCase().includes(q) ||
      ord.customerName.toLowerCase().includes(q) ||
      ord.phone.toLowerCase().includes(q) ||
      ord.governorate.toLowerCase().includes(q) ||
      ord.address.toLowerCase().includes(q) ||
      (ord.courierTrackingRef && ord.courierTrackingRef.toLowerCase().includes(q));

    const matchesStatus = ordersStatusFilter === 'all' || status === ordersStatusFilter;
    const matchesCourier = ordersCourierFilter === 'all' || courier === ordersCourierFilter;

    return matchesSearch && matchesStatus && matchesCourier;
  });

  // Filtered sales ledger transactions
  const filteredSalesTransactions = salesHistory.filter((t) => {
    const q = salesSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.orderId.toLowerCase().includes(q) ||
      t.transactionId.toLowerCase().includes(q) ||
      t.client.name.toLowerCase().includes(q) ||
      t.client.phone.toLowerCase().includes(q) ||
      t.client.governorate.toLowerCase().includes(q) ||
      (t.items || []).some((it) => it.name.toLowerCase().includes(q));

    const matchesStatus =
      salesStatusFilter === 'all' ||
      (salesStatusFilter === 'ENCAISSÉ' &&
        (t.paymentStatus === 'ENCAISSÉ' || t.orderStatus === 'Livrée')) ||
      (salesStatusFilter === 'EN_ATTENTE_LIVRAISON' &&
        t.paymentStatus === 'EN_ATTENTE_LIVRAISON' &&
        t.orderStatus !== 'Annulée') ||
      (salesStatusFilter === 'ANNULÉE' &&
        (t.paymentStatus === 'ANNULÉE' || t.orderStatus === 'Annulée'));

    let matchesDate = true;
    if (salesDateFilter !== 'all') {
      const txDate = new Date(t.timestamp);
      const now = new Date();
      if (salesDateFilter === 'today') {
        matchesDate = txDate.toDateString() === now.toDateString();
      } else if (salesDateFilter === '7days') {
        const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
        matchesDate = diffDays <= 7;
      } else if (salesDateFilter === '30days') {
        const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
        matchesDate = diffDays <= 30;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Filtered stock audit logs
  const filteredStockLogs = stockLogs.filter((log) => {
    const q = auditSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      log.sku.toLowerCase().includes(q) ||
      log.productName.toLowerCase().includes(q) ||
      log.reference.toLowerCase().includes(q) ||
      log.color.toLowerCase().includes(q) ||
      log.size.toLowerCase().includes(q);

    const matchesType =
      auditTypeFilter === 'all' || log.type === auditTypeFilter;

    const matchesModel =
      auditModelFilter === 'all' ||
      log.productName.toLowerCase() === auditModelFilter.toLowerCase();

    return matchesSearch && matchesType && matchesModel;
  });

  // Filtered stock entry notes (Bons d'Entrée)
  const filteredStockEntries = localStockEntries.filter((entry) => {
    const q = entrySearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      entry.id.toLowerCase().includes(q) ||
      entry.supplierAtelier.toLowerCase().includes(q) ||
      entry.referenceBatch.toLowerCase().includes(q) ||
      entry.createdByName.toLowerCase().includes(q) ||
      entry.items.some(
        (it) =>
          it.productName.toLowerCase().includes(q) ||
          it.color.toLowerCase().includes(q) ||
          it.size.toLowerCase().includes(q)
      );

    const matchesStatus =
      entryStatusFilter === 'all' || entry.status === entryStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Export CSV formatted for Private Courier Deliveries in Tunisia
  const exportCourierManifestCSV = () => {
    const isOrdersTab = activeTab === 'orders';
    const sourceOrders = isOrdersTab ? filteredOrders : filteredSalesTransactions;

    const itemsToExport = selectedOrderIds.length > 0
      ? sourceOrders.filter((item: any) => selectedOrderIds.includes(item.orderId || item.id))
      : sourceOrders;

    if (itemsToExport.length === 0) {
      showNotice('Aucune commande disponible pour le manifeste');
      return;
    }

    const headers = [
      'Date_Commande',
      'Ref_Commande_KUZA',
      'Nom_Client',
      'Telephone_01',
      'Telephone_02',
      'Gouvernorat',
      'Adresse_Complete',
      'Articles_Et_Tailles',
      'Montant_COD_A_Encaisser_DT',
      'Nom_Livreur',
      'Ref_Suivi_Livreur',
      'Statut_Logistique',
      'Notes_Livraison',
    ];

    const rows = itemsToExport.map((item: any) => {
      const isTx = 'client' in item;
      const orderId = isTx ? item.orderId : item.orderId || item.id;
      const rawDate = isTx ? item.timestamp : item.createdAt;
      const dateFormatted = rawDate ? new Date(rawDate).toLocaleDateString('fr-FR') : '';
      const clientName = isTx ? item.client.name : item.customerName;
      const phone01 = isTx ? item.client.phone : item.phone;
      const phone02 = isTx ? (item.client.phoneSecondary || '') : (item.phoneSecondary || '');
      const gov = isTx ? item.client.governorate : item.governorate;
      const address = isTx ? item.client.address : item.address;
      const notes = isTx ? '' : (item.deliveryNotes || '');

      const articlesSummary = isTx
        ? item.items.map((it: any) => `${it.name} ${it.color} ${it.size} (x${it.qty})`).join(' + ')
        : (item.items || []).map((it: any) => `${it.product?.name || it.name} ${it.selectedColor?.name || it.color} ${it.selectedSize || it.size} (x${it.quantity || it.qty})`).join(' + ');

      const totalVal = isTx ? item.totalAmount : item.total;
      const codFormatted = `${(Number(totalVal) || 0).toFixed(3).replace('.', ',')} DT`;

      const courierName = item.courierName || 'Coursier Express Tunis';
      const courierRef = item.courierTrackingRef || '';
      const logisticsStat = item.logisticsStatus || item.orderStatus || item.status || 'En préparation';
      const instructions = notes
        ? `Remise contre paiement espèces strict - ${notes}`
        : 'Remise contre paiement espèces strict';

      return [
        `"${dateFormatted}"`,
        `"${orderId}"`,
        `"${String(clientName || '').replace(/"/g, '""')}"`,
        `"${phone01 || ''}"`,
        `"${phone02 || ''}"`,
        `"${String(gov || '').replace(/"/g, '""')}"`,
        `"${String(address || '').replace(/"/g, '""')}"`,
        `"${articlesSummary.replace(/"/g, '""')}"`,
        `"${codFormatted}"`,
        `"${String(courierName).replace(/"/g, '""')}"`,
        `"${String(courierRef).replace(/"/g, '""')}"`,
        `"${String(logisticsStat).replace(/"/g, '""')}"`,
        `"${instructions.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `manifeste_livreur_kuza_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice(`Manifeste livreur exporté (${itemsToExport.length} colis)`);
  };

  const handleBatchPrintSlips = () => {
    const isOrdersTab = activeTab === 'orders';
    const sourceOrders = isOrdersTab ? filteredOrders : filteredSalesTransactions;

    const itemsToPrint = selectedOrderIds.length > 0
      ? sourceOrders.filter((item: any) => selectedOrderIds.includes(item.orderId || item.id))
      : sourceOrders;

    if (itemsToPrint.length === 0) {
      showNotice('Veuillez sélectionner au moins une commande à imprimer');
      return;
    }

    const printModels: PrintableOrderModel[] = itemsToPrint.map((item: any) => {
      const isTx = 'client' in item;
      if (isTx) {
        return {
          id: item.orderId,
          orderId: item.orderId,
          createdAt: item.timestamp,
          date: item.timestamp,
          client: {
            name: item.client.name,
            phone: item.client.phone,
            phoneSecondary: item.client.phoneSecondary,
            governorate: item.client.governorate,
            address: item.client.address,
          },
          customerName: item.client.name,
          phone: item.client.phone,
          phoneSecondary: item.client.phoneSecondary,
          address: item.client.address,
          governorate: item.client.governorate,
          subtotal: item.subtotal,
          shipping: item.shippingFee,
          shippingFee: item.shippingFee,
          total: item.totalAmount,
          totalAmount: item.totalAmount,
          courierName: item.courierName,
          courierTrackingRef: item.courierTrackingRef,
          logisticsStatus: item.logisticsStatus || item.orderStatus,
          items: item.items.map((it: any, idx: number) => ({
            id: `item-${idx}`,
            name: it.name,
            product: {
              name: it.name,
              spec: '290 GSM Molleton Pur Coton',
              price: it.unitPrice,
            },
            color: it.color,
            selectedColor: { name: it.color },
            size: it.size,
            selectedSize: it.size,
            qty: it.qty,
            quantity: it.qty,
            unitPrice: it.unitPrice,
          })),
        };
      } else {
        const ord = item as OrderDetails;
        return {
          id: ord.orderId || ord.id,
          orderId: ord.orderId || ord.id,
          createdAt: ord.createdAt,
          date: ord.createdAt,
          client: {
            name: ord.customerName,
            phone: ord.phone,
            phoneSecondary: ord.phoneSecondary,
            address: ord.address,
            governorate: ord.governorate,
          },
          customerName: ord.customerName,
          phone: ord.phone,
          phoneSecondary: ord.phoneSecondary,
          address: ord.address,
          governorate: ord.governorate,
          deliveryNotes: ord.deliveryNotes,
          subtotal: ord.subtotal,
          shipping: ord.shipping || 8,
          shippingFee: ord.shipping || 8,
          total: ord.total,
          totalAmount: ord.total,
          courierName: ord.courierName,
          courierTrackingRef: ord.courierTrackingRef,
          logisticsStatus: ord.logisticsStatus || (ord.status as string),
          items: ord.items.map((it) => ({
            id: it.id,
            name: it.product.name,
            product: {
              name: it.product.name,
              spec: it.product.spec,
              price: it.product.price,
            },
            color: it.selectedColor.name,
            selectedColor: { name: it.selectedColor.name },
            size: it.selectedSize,
            selectedSize: it.selectedSize,
            qty: it.quantity,
            quantity: it.quantity,
            unitPrice: it.product.price,
          })),
        };
      }
    });

    setBatchOrdersForSlip(printModels);
  };

  const exportSalesCSV = () => {
    const headers = [
      'Date / Heure',
      'Transaction ID',
      'Réf Commande',
      'Client',
      'Téléphone',
      'Gouvernorat',
      'Articles',
      'Sous-total (TND)',
      'Livraison (TND)',
      'Total (TND)',
      'Statut Commande',
      'Statut Paiement',
    ];
    const rows = filteredSalesTransactions.map((tx) => [
      new Date(tx.timestamp).toLocaleString('fr-FR'),
      tx.transactionId,
      tx.orderId,
      `"${tx.client.name.replace(/"/g, '""')}"`,
      tx.client.phone,
      `"${tx.client.governorate.replace(/"/g, '""')}"`,
      `"${tx.items.map((it) => `${it.name} (${it.color} · ${it.size}) x${it.qty}`).join(' | ')}"`,
      tx.subtotal,
      tx.shippingFee,
      tx.totalAmount,
      tx.orderStatus,
      tx.paymentStatus,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `kuza_registre_ventes_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice('Bordereau des ventes exporté au format CSV');
  };

  const exportStockLogsCSV = () => {
    const headers = [
      'Horodatage',
      'SKU',
      'Pièce',
      'Coloris',
      'Taille',
      'Type de Mouvement',
      'Variation',
      'Ancien Stock',
      'Nouveau Stock',
      'Référence',
    ];
    const rows = filteredStockLogs.map((log) => [
      new Date(log.timestamp).toLocaleString('fr-FR'),
      log.sku,
      `"${log.productName.replace(/"/g, '""')}"`,
      log.color,
      log.size,
      log.type,
      log.changeQty > 0 ? `+${log.changeQty}` : log.changeQty,
      log.previousStock,
      log.newStock,
      `"${log.reference.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `kuza_audit_stock_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice("Journal d'audit des stocks exporté au format CSV");
  };

  return (
    <div className="min-h-screen max-w-[1920px] mx-auto bg-[#101010] text-[#E8E4DD] border-x border-[#34312D]/40 flex flex-col selection:bg-[#B9A995] selection:text-[#101010]">
      {/* Admin Header: Two-Row Structured Layout */}
      <header className="sticky top-0 z-40 w-full bg-[#101010]/95 backdrop-blur-md border-b border-[#34312D]">
        {/* ROW 1: TOP BRAND & ACTION BAR */}
        <div className="flex justify-between items-center py-2.5 px-4 sm:px-6 border-b border-[#34312D] bg-[#101010]">
          {/* Left Action: Retour Boutique */}
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono uppercase tracking-wider text-[#E8E4DD] transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1 text-[#B9A995]" />
              <span className="hidden sm:inline">RETOUR BOUTIQUE</span>
              <span className="sm:hidden">RETOUR</span>
            </button>
          </div>

          {/* Center Brand Title */}
          <div className="flex items-center justify-center gap-2.5">
            <KuzaMonogram className="w-5 h-5 text-[#B9A995] shrink-0" />
            <KuzaLogo className="h-4 sm:h-5 w-auto text-[#E8E4DD]" />
            <span className="text-[#8C8275] font-mono text-xs hidden sm:inline">·</span>
            <span
              className="font-serif text-xs sm:text-sm md:text-base tracking-[0.2em] uppercase text-[#B9A995] text-center hidden sm:inline"
              style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
            >
              DIRECTOIRE STOCK & LOGISTIQUE
            </span>
          </div>

          {/* Right Action: Verrouiller Stock */}
          <div className="flex items-center">
            <button
              onClick={onLogout}
              title="Verrouiller le Directoire Stock et retourner à la boutique"
              className="flex items-center px-3 py-1.5 text-xs font-mono text-[#E8E4DD] hover:text-amber-400 bg-[#181818] border border-[#34312D] hover:border-amber-400 transition-colors cursor-pointer shrink-0"
              aria-label="Verrouiller Stock & Logistique"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              <span className="hidden sm:inline">Verrouiller Stock</span>
              <span className="sm:hidden">Verrouiller</span>
            </button>
          </div>
        </div>

        {/* ROW 2: MODERN RESPONSIVE & MOBILE-FRIENDLY ADMIN TAB NAVIGATION BAR WITH GRADIENT MASKS */}
        <div className="relative w-full bg-[#181818] border-b border-[#34312D] py-2.5 px-2 md:px-6 flex items-center overflow-hidden z-40">
          {/* Left Fade Mask */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#181818] to-transparent z-10 pointer-events-none" />

          {/* Right Fade Mask */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#181818] to-transparent z-10 pointer-events-none" />

          {/* Tab Scroll Track */}
          <nav
            className="flex items-center gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory touch-pan-x px-4 w-full scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* 1. STOCKS */}
            <button
              onClick={(e) => {
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                setActiveTab('inventory');
              }}
              className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                  : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
              }`}
            >
              <Boxes className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'inventory' ? 'text-[#101010]' : 'text-[#B9A995]'}`} />
              <span>STOCKS <span className="font-mono tabular-nums">({totalUnitsInStock})</span></span>
            </button>

            {/* 2. PIÈCES */}
            <button
              onClick={(e) => {
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                setActiveTab('products');
              }}
              className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                  : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
              }`}
            >
              <Tag className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'products' ? 'text-[#101010]' : 'text-[#96918A]'}`} />
              <span>PIÈCES <span className="font-mono tabular-nums">({totalCatalogCount})</span></span>
            </button>

            {/* 3. COMMANDES */}
            <button
              onClick={(e) => {
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                setActiveTab('orders');
              }}
              className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                  : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
              }`}
            >
              <ShoppingBag className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'orders' ? 'text-[#101010]' : 'text-[#96918A]'}`} />
              <span>COMMANDES <span className="font-mono tabular-nums">({orders.length})</span></span>
            </button>

            {/* 4. VENTES */}
            <button
              onClick={(e) => {
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                setActiveTab('sales');
              }}
              className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'sales'
                  ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                  : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
              }`}
            >
              <TrendingUp className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'sales' ? 'text-[#101010]' : 'text-[#96918A]'}`} />
              <span>VENTES <span className="font-mono tabular-nums">({salesHistory.length})</span></span>
            </button>

            {/* 5. STATISTIQUES & ANALYTICS */}
            <button
              onClick={(e) => {
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                setActiveTab('analytics');
              }}
              className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                  : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
              }`}
            >
              <BarChart3 className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'analytics' ? 'text-[#101010]' : 'text-[#B9A995]'}`} />
              <span>STATISTIQUES & ANALYTICS</span>
            </button>

            {/* 6. TRAÇABILITÉ */}
            <button
              onClick={(e) => {
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                setActiveTab('audit');
              }}
              className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                  : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
              }`}
            >
              <History className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'audit' ? 'text-[#101010]' : 'text-[#96918A]'}`} />
              <span>TRAÇABILITÉ <span className="font-mono tabular-nums">({stockLogs.length})</span></span>
            </button>

            {/* 7. BONS D'ENTRÉE */}
            <button
              onClick={(e) => {
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                setActiveTab('entries');
              }}
              className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'entries'
                  ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                  : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
              }`}
            >
              <PackageCheck className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'entries' ? 'text-[#101010]' : 'text-emerald-400'}`} />
              <span>BONS D'ENTRÉE (RÉCEPTION STOCK) <span className="font-mono tabular-nums">({localStockEntries.length})</span></span>
            </button>

            {/* 8. PROMOTIONS */}
            <button
              onClick={(e) => {
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                setActiveTab('promotions');
              }}
              className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'promotions'
                  ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                  : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
              }`}
            >
              <Tag className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'promotions' ? 'text-[#101010]' : 'text-[#B9A995]'}`} />
              <span>PROMOTIONS <span className="font-mono tabular-nums">({localPromos.coupons.length + localPromos.bundleRules.length})</span></span>
            </button>

            {/* 9. PERSONNALISATION SITE (CMS) */}
            <button
              onClick={(e) => {
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                setActiveTab('cms');
              }}
              className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'cms'
                  ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                  : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
              }`}
            >
              <Layout className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'cms' ? 'text-[#101010]' : 'text-[#B9A995]'}`} />
              <span>PERSONNALISATION SITE (CMS)</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-16 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Sub-Header & Stock Pulse */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#34312D] gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#B9A995] animate-pulse" />
              <span className="font-mono text-[10px] text-[#B9A995] tracking-[0.28em] uppercase">
                DIRECTOIRE OPÉRATIONNEL — TUNIS SIDI BOU SAÏD
              </span>
            </div>
            <h1
              className="text-3xl md:text-4xl font-serif text-[#E8E4DD] tracking-tight"
              style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', 'Optima', serif" }}
            >
              Gestion Stock & Flux Logistique
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-[#181818] border border-[#34312D]">
              <span className="font-mono text-[10px] text-[#96918A] uppercase tracking-[0.2em]">CADENCE :</span>
              <span className="font-mono text-xs text-[#B9A995] font-semibold">9.4 PCS / JOUR</span>
            </div>
            <button
              onClick={() => {
                setFeedbackNotice("Flux d'atelier synchronisé (0s)");
                setTimeout(() => setFeedbackNotice(null), 2000);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-[#E8E4DD] transition-all cursor-pointer font-mono text-xs uppercase tracking-wider group"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-[#B9A995] group-hover:rotate-180 transition-transform duration-500" />
              <span>SYNCHRONISER FLUX</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Banner from Stitch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 bg-[#181818] border border-[#34312D] flex flex-col justify-between hover:border-[#B9A995]/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-mono tracking-[0.22em] text-[#96918A]">
                  METRIC 01 / VENTES
                </span>
                <span className="text-[10px] font-mono text-[#B9A995] px-2 py-0.5 bg-[#141414] border border-[#B9A995]/20">
                  +18.4% M-1
                </span>
              </div>
              <Wallet className="w-5 h-5 text-[#B9A995] mb-2" />
              <div className="my-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-light text-[#E8E4DD]">
                    {formatTND(totalRevenue > 0 ? totalRevenue : 18450)}
                  </span>
                </div>
                <p className="text-xs text-[#96918A] mt-1 font-light">
                  {orders.length} commande(s) passée(s) en cash on delivery
                </p>
              </div>
            </div>
            <div className="pt-3 mt-4 border-t border-[#34312D]/40 flex items-center justify-between text-[#96918A] font-mono text-[10px]">
              <span>SEUIL LIVRAISON : {formatTND(8)}</span>
              <span className="text-[#E8E4DD]">FLUX COD</span>
            </div>
          </div>

          <div className="p-6 bg-[#181818] border border-[#34312D] flex flex-col justify-between hover:border-[#B9A995]/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-mono tracking-[0.22em] text-[#96918A]">
                  METRIC 02 / CONFECTION
                </span>
                <span className="text-[10px] font-mono text-[#E8E4DD] px-2 py-0.5 bg-[#141414]">
                  ATELIER TUNIS
                </span>
              </div>
              <Package className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="my-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-light text-[#B9A995]">
                    {totalUnitsInStock}
                  </span>
                  <span className="font-mono text-xs text-[#96918A] uppercase">UNITÉS EN STOCK</span>
                </div>
                <p className="text-xs text-[#96918A] mt-1 font-light">
                  {activeProductsCount} modèle(s) actifs · Coton lourd 290–310 GSM
                </p>
              </div>
            </div>
            <div className="pt-3 mt-4 border-t border-[#34312D]/40 flex items-center justify-between text-[#96918A] font-mono text-[10px]">
              <span>CAPACITÉ ATELIER</span>
              <span className="text-[#B9A995]">NOMINALE 100%</span>
            </div>
          </div>

          <div className="p-6 bg-[#181818] border border-[#34312D] flex flex-col justify-between hover:border-[#B9A995]/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-mono tracking-[0.22em] text-[#96918A]">
                  METRIC 03 / EXPÉDITIONS
                </span>
                <span className="text-[10px] font-mono text-amber-300 px-2 py-0.5 bg-[#141414] border border-amber-300/30">
                  {orders.length} DOSSIER(S)
                </span>
              </div>
              <Truck className="w-5 h-5 text-sky-400 mb-2" />
              <div className="my-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-light text-[#E8E4DD]">
                    {orders.length}
                  </span>
                  <span className="font-mono text-xs text-[#96918A] uppercase">COLIS EXPRESS</span>
                </div>
                <p className="text-xs text-[#96918A] mt-1 font-light">
                  Expédition express sécurisée 24–48h Grand Tunis & Régions
                </p>
              </div>
            </div>
            <div className="pt-3 mt-4 border-t border-[#34312D]/40 flex items-center justify-between text-[#96918A] font-mono text-[10px]">
              <span>DÉLAI MOYEN : 24H</span>
              <span className="text-[#E8E4DD]">COURSIER TUNIS</span>
            </div>
          </div>

          <div className="p-6 bg-[#181818] border border-[#34312D] flex flex-col justify-between hover:border-[#B9A995]/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-mono tracking-[0.22em] text-[#96918A]">
                  METRIC 04 / AUDIT QUALITÉ
                </span>
                <span className="text-[10px] font-mono text-[#B9A995] px-2 py-0.5 bg-[#141414] border border-[#B9A995]/20">
                  SATISFACTION 98.8%
                </span>
              </div>
              <AlertTriangle className="w-5 h-5 text-amber-400 mb-2" />
              <div className="my-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-light text-amber-300">
                    {lowStockCount}
                  </span>
                  <span className="font-mono text-xs text-[#96918A] uppercase">
                    ALERTES STOCK (≤3)
                  </span>
                </div>
                <p className="text-xs text-[#96918A] mt-1 font-light">
                  {outOfStockCount > 0 ? `${outOfStockCount} taille(s) en rupture totale` : 'Zéro rupture critique'}
                </p>
              </div>
            </div>
            <div className="pt-3 mt-4 border-t border-[#34312D]/40 flex items-center justify-between text-[#96918A] font-mono text-[10px]">
              <span>CONTRÔLE ATELIER</span>
              <span className="text-[#B9A995]">CONFORME SS25</span>
            </div>
          </div>
        </div>

        {/* TAB 1: INVENTORY CONTROL MATRIX (GROUPED PRODUCT-COLOR MATRIX) */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Header, Search & Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#34312D] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className="text-2xl font-serif text-[#E8E4DD]"
                    style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
                  >
                    Matrice des Stocks
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 bg-[#181818] border border-[#34312D] text-[#B9A995]">
                    Vue Produit & Couleur
                  </span>
                </div>
                <p className="text-xs text-[#96918A] font-light mt-1">
                  Gestion centralisée par déclinaison couleur. Décompte automatique en temps réel à chaque commande.
                </p>
              </div>

              {/* Controls: Search, Filter Chips, Sync Button */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-64 min-w-[200px]">
                  <Search className="w-4 h-4 text-[#96918A] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filtrer produit, couleur, SKU..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] pl-9 pr-8 py-2 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none font-mono"
                  />
                  {inventorySearch && (
                    <button
                      onClick={() => setInventorySearch('')}
                      className="absolute right-2.5 top-2.5 text-[#96918A] hover:text-[#E8E4DD] p-0.5 cursor-pointer"
                      title="Effacer la recherche"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Filter Chips */}
                <div className="flex items-center border border-[#34312D] bg-[#181818] text-xs font-mono shrink-0">
                  <button
                    onClick={() => setInventoryFilter('all')}
                    className={`px-3 py-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                      inventoryFilter === 'all'
                        ? 'bg-[#E8E4DD] text-[#101010] font-semibold'
                        : 'text-[#96918A] hover:text-[#E8E4DD]'
                    }`}
                  >
                    <span>Tous</span>
                    <span className="text-[10px] opacity-75">({totalCardsCount})</span>
                  </button>
                  <button
                    onClick={() => setInventoryFilter('low')}
                    className={`px-3 py-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                      inventoryFilter === 'low'
                        ? 'bg-amber-300 text-[#101010] font-semibold'
                        : 'text-[#96918A] hover:text-[#E8E4DD]'
                    }`}
                  >
                    <span>Stock Faible</span>
                    <span className="text-[10px] opacity-75">({lowStockCardsCount})</span>
                  </button>
                  <button
                    onClick={() => setInventoryFilter('out')}
                    className={`px-3 py-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                      inventoryFilter === 'out'
                        ? 'bg-rose-400 text-[#101010] font-semibold'
                        : 'text-[#96918A] hover:text-[#E8E4DD]'
                    }`}
                  >
                    <span>Épuisé</span>
                    <span className="text-[10px] opacity-75">({outOfStockCardsCount})</span>
                  </button>
                </div>

                {/* Button 1: Solid Ivory + AJOUTER UN PRODUIT / DÉCLINAISON */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsCreatingNew(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] font-bold text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-sm"
                  title="Ajouter un nouveau produit ou déclinaison"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ AJOUTER UN PRODUIT / DÉCLINAISON</span>
                </button>

                {/* Button 2: Outlined Beige EXPORTER RAPPORT STOCK (CSV) */}
                <button
                  type="button"
                  onClick={exportStockLevelsCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#181818] hover:bg-[#202020] border border-[#B9A995]/70 hover:border-[#B9A995] text-xs font-mono text-[#B9A995] hover:text-[#E8E4DD] transition-colors cursor-pointer shrink-0"
                  title="Télécharger l'état complet des stocks en fichier CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#B9A995]" />
                  <span>EXPORTER RAPPORT STOCK (CSV)</span>
                </button>

                {/* Tout Mettre à Jour Button */}
                <button
                  onClick={handleSyncAllInventory}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#181818] hover:bg-[#202020] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono text-[#E8E4DD] transition-colors cursor-pointer shrink-0"
                  title="Valider et sauvegarder toute la matrice des stocks"
                >
                  <Save className="w-3.5 h-3.5 text-[#B9A995]" />
                  <span className="hidden sm:inline">Tout Mettre à Jour</span>
                </button>
              </div>
            </div>

            {/* Matrix Cards List */}
            {filteredMatrixCards.length === 0 ? (
              <div className="p-12 text-center bg-[#181818] border border-[#34312D] space-y-3">
                <Boxes className="w-8 h-8 text-[#96918A] mx-auto opacity-50" />
                <p className="text-sm text-[#E8E4DD] font-medium">
                  Aucun modèle ne correspond à vos critères de recherche
                </p>
                <p className="text-xs text-[#96918A]">
                  Modifiez votre saisie ou réinitialisez les filtres.
                </p>
                <button
                  onClick={() => {
                    setInventorySearch('');
                    setInventoryFilter('all');
                  }}
                  className="mt-2 px-3 py-1.5 bg-[#141414] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono text-[#E8E4DD] cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMatrixCards.map((card) => {
                  return (
                    <div
                      key={card.cardKey}
                      className="bg-[#181818] border border-[#34312D] hover:border-[#34312D]/80 transition-all p-4 sm:p-5"
                    >
                      {/* Card Header: Product info + Color identity + Aggregate badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#34312D]/60">
                        {/* Left: Thumbnail & Garment Identification */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          {card.thumbnail && (
                            <div className="w-12 h-14 bg-[#141414] border border-[#34312D] overflow-hidden shrink-0">
                              <img
                                src={card.thumbnail}
                                alt={`${card.product.name} - ${card.color.name}`}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                style={{ filter: 'none' }}
                              />
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono tracking-widest text-[#B9A995] uppercase">
                                SKU: {card.skuPrefix}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('audit');
                                  setAuditSearch(card.product.name);
                                  showNotice(`Filtrage de l'historique d'audit pour ${card.product.name}`);
                                }}
                                className="p-0.5 hover:bg-[#141414] rounded transition-colors cursor-pointer"
                                title={`Voir l'historique d'audit pour ${card.product.name} (${card.color.name})`}
                              >
                                <History className="w-4 h-4 cursor-pointer text-[#A0988E] hover:text-[#E8E4DD] transition-colors" />
                              </button>
                              <span className="text-[#34312D]">·</span>
                              <span className="text-[10px] font-mono text-[#96918A]">
                                {card.product.spec}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-[#34312D] shrink-0"
                                style={{ backgroundColor: card.color.hex }}
                                title={`Coloris : ${card.color.name}`}
                              />
                              <h3 className="text-base font-semibold text-[#E8E4DD] tracking-wide truncate">
                                {card.product.name}{' '}
                                <span className="text-[#96918A] font-normal">— {card.color.name}</span>
                              </h3>
                              <span className="text-xs font-mono text-[#B9A995] ml-1 shrink-0">
                                {formatTND(card.product.price)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Aggregate metrics & Quick batch replenishment */}
                        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                          <div className="flex items-center gap-2">
                            {/* Card Status Badge */}
                            {card.hasOutOfStock ? (
                              <span className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider bg-rose-950/30 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                <span>{card.outCount} rupture{card.outCount > 1 ? 's' : ''}</span>
                              </span>
                            ) : card.hasLowStock ? (
                              <span className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider bg-amber-950/30 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <span>⚠ Stock faible ({card.lowCount})</span>
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider bg-emerald-950/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <span>✓ En stock</span>
                              </span>
                            )}

                            {/* Total Units in this Colorway */}
                            <div className="px-2.5 py-1 bg-[#101010] border border-[#34312D] text-xs font-mono text-[#E8E4DD] tabular-nums">
                              <span className="font-semibold text-[#E8E4DD]">{card.totalUnits}</span>{' '}
                              <span className="text-[#96918A] text-[10px]">unités</span>
                            </div>
                          </div>

                          {/* Quick Batch Lot Restock */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                handleBatchAdjustCard(
                                  card.sizes.map((s) => s.key),
                                  2, // 2 pcs per size x 5 sizes = 10 pcs
                                  `${card.product.name} (${card.color.name})`
                                )
                              }
                              className="px-2.5 py-1 bg-[#101010] border border-[#34312D] hover:border-[#B9A995] text-[10px] font-mono text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer whitespace-nowrap"
                              title="Ajouter un lot de 10 pièces réparties sur toutes les tailles de ce coloris"
                            >
                              +1 lot (10 pcs)
                            </button>
                            <button
                              onClick={() =>
                                handleBatchAdjustCard(
                                  card.sizes.map((s) => s.key),
                                  10, // 10 pcs per size x 5 sizes = 50 pcs
                                  `${card.product.name} (${card.color.name})`
                                )
                              }
                              className="px-2.5 py-1 bg-[#101010] border border-[#34312D] hover:border-[#B9A995] text-[10px] font-mono text-[#B9A995] hover:text-[#E8E4DD] transition-colors cursor-pointer whitespace-nowrap"
                              title="Ajouter un lot de 50 pièces réparties sur toutes les tailles de ce coloris"
                            >
                              +5 lot (50 pcs)
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card Body: Compact Horizontal Size Grid */}
                      <div className="pt-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                          {card.sizes.map((sizeVariant) => {
                            const isOut = sizeVariant.qty === 0;
                            const isLow = sizeVariant.qty > 0 && sizeVariant.qty <= 3;

                            return (
                              <div
                                key={sizeVariant.key}
                                className={`p-3 border transition-colors flex flex-col justify-between ${
                                  isOut
                                    ? 'bg-[#121212] border-rose-500/40'
                                    : isLow
                                    ? 'bg-[#141414] border-amber-500/40'
                                    : 'bg-[#141414] border-[#34312D]'
                                }`}
                              >
                                {/* Top: Size Label & Live Status Badge */}
                                <div className="flex items-center justify-between gap-1 mb-2.5">
                                  <span className="px-2 py-0.5 bg-[#101010] border border-[#34312D] text-xs font-mono font-bold text-[#E8E4DD]">
                                    {sizeVariant.size}
                                  </span>

                                  {isOut ? (
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 bg-rose-500/10 px-1.5 py-0.5 border border-rose-500/20 line-through decoration-rose-500/80 font-medium">
                                      Épuisé
                                    </span>
                                  ) : isLow ? (
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/20 font-medium">
                                      Stock faible
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/20 font-medium">
                                      En stock
                                    </span>
                                  )}
                                </div>

                                {/* Middle: Inline Size Controls (- / Input / +) */}
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleStockChange(sizeVariant.key, -1)}
                                    disabled={sizeVariant.qty === 0}
                                    title="Retirer 1 unité"
                                    className="w-7 h-7 bg-[#101010] border border-[#34312D] hover:border-[#E8E4DD] disabled:opacity-25 disabled:cursor-not-allowed text-[#E8E4DD] text-xs font-mono transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3 text-[#96918A] hover:text-[#E8E4DD]" />
                                  </button>

                                  <input
                                    type="number"
                                    min="0"
                                    value={sizeVariant.qty}
                                    onChange={(e) =>
                                      handleSetStockDirect(
                                        sizeVariant.key,
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    title="Saisie directe du stock"
                                    className="w-full h-7 bg-[#101010] border border-[#34312D] focus:border-[#B9A995] text-center font-mono text-xs font-bold text-[#E8E4DD] focus:outline-none tabular-nums"
                                  />

                                  <button
                                    onClick={() => handleStockChange(sizeVariant.key, 1)}
                                    title="Ajouter 1 unité"
                                    className="w-7 h-7 bg-[#101010] border border-[#34312D] hover:border-[#B9A995] text-[#E8E4DD] text-xs font-mono transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3 text-[#96918A] hover:text-[#B9A995]" />
                                  </button>
                                </div>

                                {/* Bottom: Quick +5 atelier button */}
                                <div className="mt-2 pt-2 border-t border-[#34312D]/40">
                                  <button
                                    onClick={() => handleStockChange(sizeVariant.key, 5)}
                                    title="Réapprovisionner +5 unités atelier"
                                    className="w-full py-1 text-[10px] font-mono text-[#96918A] hover:text-[#B9A995] bg-[#101010] hover:bg-[#181818] border border-[#34312D]/60 hover:border-[#B9A995]/40 transition-colors text-center cursor-pointer"
                                  >
                                    +5 atelier
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCT CRUD (CATALOG MANAGEMENT) */}
        {activeTab === 'products' && (
          <PieceManagement
            products={products}
            inventory={inventory}
            orders={orders}
            salesHistory={salesHistory}
            onUpdateProducts={onUpdateProducts}
            onUpdateInventory={onUpdateInventory}
            onResetDefaults={onResetDefaults}
            showNotice={showNotice}
          />
        )}

        {/* TAB 3: ORDER LOGS & COURIER MANIFEST */}
        {activeTab === 'orders' && (
          <OrderJournal
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenDirectSaleModal={() => setIsDirectSaleModalOpen(true)}
            showNotice={showNotice}
          />
        )}

        {/* TAB 4: HISTORIQUE DES VENTES & RÈGLEMENTS COD */}
        {activeTab === 'sales' && (
          <SalesJournal
            salesHistory={salesHistory}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenSlipModal={(orderObj) => setSelectedOrderForSlip(orderObj)}
            onOpenDirectSaleModal={() => setIsDirectSaleModalOpen(true)}
            showNotice={showNotice}
          />
        )}

        {/* TAB: STATISTIQUES & ANALYTICS */}
        {activeTab === 'analytics' && (
          <AdminAnalytics
            orders={orders}
            salesHistory={salesHistory}
            products={products}
            onOpenOrderModal={(orderId) => {
              const matchedOrder = orders.find((o) => o.orderId === orderId);
              if (matchedOrder) {
                setSelectedOrderForSlip(matchedOrder);
              }
            }}
            showNotice={showNotice}
          />
        )}

        {/* TAB 5: TRAÇABILITÉ DES STOCKS */}
        {activeTab === 'audit' && (
          <AuditJournal
            stockLogs={stockLogs}
            products={products}
            orders={orders}
            inventory={inventory}
            onUpdateInventory={onUpdateInventory}
            onUpdateStockLogs={onUpdateStockLogs}
            onOpenSlipModal={(orderObj) => setSelectedOrderForSlip(orderObj)}
            showNotice={showNotice}
          />
        )}

        {/* TAB: BONS D'ENTRÉE (STOCK RECEIPT NOTES) */}
        {activeTab === 'entries' && (
          <BonsEntree
            entries={localStockEntries}
            products={products}
            onOpenCreateModal={() => setIsCreatingStockEntry(true)}
            onOpenPrintModal={(entry) => setSelectedEntryForPrint(entry)}
            onValidateDraft={handleValidateDraftEntry}
            onDeleteEntry={handleDeleteStockEntry}
            showNotice={showNotice}
          />
        )}

        {/* TAB 6: PROMOTIONS & AUTOMATIC BUNDLES */}
        {activeTab === 'promotions' && (
          <PromotionsManagement
            promotionsState={localPromos}
            products={products}
            orders={orders}
            salesHistory={salesHistory}
            onUpdatePromotions={(nextPromos) => {
              setLocalPromos(nextPromos);
              if (onUpdatePromotions) onUpdatePromotions(nextPromos);
            }}
            showNotice={showNotice}
          />
        )}

        {/* TAB 7: PERSONNALISATION SITE (CMS & BUILDER) */}
        {activeTab === 'cms' && (
          <div className="space-y-8 animate-fade-in">
            <SiteCmsTab onShowNotice={showNotice} />
          </div>
        )}
      </main>

      {/* MODAL: CREATE OR EDIT PRODUCT */}
      {(editingProduct || isCreatingNew) && (
        <ProductFormModal
          initialProduct={editingProduct}
          isNew={isCreatingNew}
          onClose={() => {
            setEditingProduct(null);
            setIsCreatingNew(false);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* Floating Feedback Notification */}
      {feedbackNotice && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#181818] border border-[#B9A995] text-xs font-mono text-[#E8E4DD] shadow-2xl flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-[#B9A995]" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* High-End Luxury Dispatch Slip / Receipt Modal */}
      {selectedOrderForSlip && (
        <PrintableBordereauModal
          order={selectedOrderForSlip}
          onClose={() => setSelectedOrderForSlip(null)}
        />
      )}

      {/* Modal: Create New Bon d'Entrée */}
      {isCreatingStockEntry && (
        <NewStockEntryModal
          products={products}
          onClose={() => setIsCreatingStockEntry(false)}
          onSave={handleSaveStockEntry}
        />
      )}

      {/* Modal: View & Print Official Bon d'Entrée */}
      {selectedEntryForPrint && (
        <PrintableStockEntryModal
          entryNote={selectedEntryForPrint}
          onClose={() => setSelectedEntryForPrint(null)}
        />
      )}

      {/* Modal: Direct Sale / Remise en Main Propre (Admin-Only POS) */}
      {isDirectSaleModalOpen && (
        <DirectSaleModal
          products={products}
          inventory={inventory}
          orders={orders}
          salesHistory={salesHistory}
          stockLogs={stockLogs}
          onUpdateInventory={onUpdateInventory}
          onUpdateOrders={(newOrders) => {
            if (onUpdateOrders) onUpdateOrders(newOrders);
          }}
          onUpdateSalesHistory={(newHist) => {
            if (onUpdateSalesHistory) onUpdateSalesHistory(newHist);
          }}
          onUpdateStockLogs={(newLogs) => {
            if (onUpdateStockLogs) onUpdateStockLogs(newLogs);
          }}
          onClose={() => setIsDirectSaleModalOpen(false)}
          showNotice={showNotice}
        />
      )}
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: ProductFormModal
// ==========================================
interface ProductFormModalProps {
  initialProduct: Product | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (product: Product, initialStock?: number) => void;
}

interface ProductFormData {
  name: string;
  price: string | number;
  description: string;
  initialStock: string | number;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  initialProduct,
  isNew,
  onClose,
  onSave,
}) => {
  // Clean formData state with essentials only
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialProduct?.name || '',
    price: initialProduct?.price !== undefined ? initialProduct.price.toString() : '79',
    description: initialProduct?.description || '',
    initialStock: '8',
  });

  // Color options
  const [colors, setColors] = useState<ProductColor[]>(
    initialProduct?.colors && initialProduct.colors.length > 0
      ? initialProduct.colors
      : [
          { name: 'Noir', hex: '#101010' },
          { name: 'Beige', hex: '#B9A995' },
        ]
  );

  // Available Sizes
  const [sizes, setSizes] = useState<string[]>(
    initialProduct?.sizes && initialProduct.sizes.length > 0
      ? initialProduct.sizes
      : ['XS', 'S', 'M', 'L', 'XL']
  );

  // Color-specific images dictionary { [colorName]: string[] }
  const [colorImages, setColorImages] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    const cols =
      initialProduct?.colors && initialProduct.colors.length > 0
        ? initialProduct.colors
        : [
            { name: 'Noir', hex: '#101010' },
            { name: 'Beige', hex: '#B9A995' },
          ];
    cols.forEach((c) => {
      if (initialProduct?.colorImages?.[c.name] && initialProduct.colorImages[c.name].length > 0) {
        map[c.name] = [...initialProduct.colorImages[c.name]];
      } else if (c.images && c.images.length > 0) {
        map[c.name] = [...c.images];
      } else if (initialProduct?.images && initialProduct.images.length > 0) {
        map[c.name] = [...initialProduct.images];
      } else {
        map[c.name] = [
          c.name === 'Beige' ? shelterSweatBeige : shelterSweatNoir,
        ];
      }
    });
    return map;
  });

  const [colorUrlInputs, setColorUrlInputs] = useState<Record<string, string>>({});
  const [colorDragging, setColorDragging] = useState<Record<string, boolean>>({});
  const [colorProcessing, setColorProcessing] = useState<Record<string, boolean>>({});
  const [colorNotices, setColorNotices] = useState<Record<string, string | null>>({});
  const [previewLightbox, setPreviewLightbox] = useState<{
    images: string[];
    index: number;
    title: string;
    subtitle?: string;
  } | null>(null);

  // State for adding a new color chip
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#B9A995');
  const [colorError, setColorError] = useState('');

  // Re-synchronize formData and state when initialProduct changes (e.g. clicking "Modifier")
  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || '',
        price: initialProduct.price !== undefined ? initialProduct.price.toString() : '79',
        description: initialProduct.description || '',
        initialStock: '8',
      });
      const nextColors =
        initialProduct.colors && initialProduct.colors.length > 0
          ? initialProduct.colors
          : [
              { name: 'Noir', hex: '#101010' },
              { name: 'Beige', hex: '#B9A995' },
            ];
      setColors(nextColors);
      setSizes(
        initialProduct.sizes && initialProduct.sizes.length > 0
          ? initialProduct.sizes
          : ['XS', 'S', 'M', 'L', 'XL']
      );

      const nextMap: Record<string, string[]> = {};
      nextColors.forEach((c) => {
        if (initialProduct.colorImages?.[c.name] && initialProduct.colorImages[c.name].length > 0) {
          nextMap[c.name] = [...initialProduct.colorImages[c.name]];
        } else if (c.images && c.images.length > 0) {
          nextMap[c.name] = [...c.images];
        } else if (initialProduct.images && initialProduct.images.length > 0) {
          nextMap[c.name] = [...initialProduct.images];
        } else {
          nextMap[c.name] = [
            c.name === 'Beige' ? shelterSweatBeige : shelterSweatNoir,
          ];
        }
      });
      setColorImages(nextMap);
    } else {
      setFormData({
        name: '',
        price: '79',
        description: '',
        initialStock: '8',
      });
      setColors([
        { name: 'Noir', hex: '#101010' },
        { name: 'Beige', hex: '#B9A995' },
      ]);
      setSizes(['XS', 'S', 'M', 'L', 'XL']);
      setColorImages({
        Noir: [shelterSweatNoir],
        Beige: [shelterSweatBeige],
      });
    }
  }, [initialProduct]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as any;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

  const toggleSize = (s: string) => {
    if (sizes.includes(s)) {
      if (sizes.length > 1) setSizes(sizes.filter((x) => x !== s));
    } else {
      setSizes([...sizes, s]);
    }
  };

  // Add / Remove color chips handlers
  const handleAddColor = () => {
    const trimmed = newColorName.trim();
    if (!trimmed) {
      setColorError('Veuillez renseigner un nom de coloris');
      return;
    }
    const exists = colors.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setColorError('Ce coloris existe déjà pour ce modèle');
      return;
    }
    const newColor: ProductColor = {
      name: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
      hex: newColorHex || '#101010',
      images: [],
    };
    setColors((prev) => [...prev, newColor]);
    setColorImages((prev) => ({
      ...prev,
      [newColor.name]: [shelterSweatNoir],
    }));
    setNewColorName('');
    setColorError('');
  };

  const handleRemoveColor = (colorNameToRemove: string) => {
    if (colors.length <= 1) {
      setColorError('Au moins un coloris est obligatoire');
      return;
    }
    setColors((prev) => prev.filter((c) => c.name !== colorNameToRemove));
    setColorImages((prev) => {
      const copy = { ...prev };
      delete copy[colorNameToRemove];
      return copy;
    });
    setColorError('');
  };

  const handleUpdateColorHex = (colorName: string, newHex: string) => {
    setColors((prev) =>
      prev.map((c) => (c.name === colorName ? { ...c, hex: newHex } : c))
    );
  };

  const notifyColor = (colorName: string, msg: string) => {
    setColorNotices((prev) => ({ ...prev, [colorName]: msg }));
    setTimeout(() => {
      setColorNotices((prev) => ({ ...prev, [colorName]: null }));
    }, 2400);
  };

  const handleColorFiles = async (colorName: string, files: FileList | File[]) => {
    setColorProcessing((prev) => ({ ...prev, [colorName]: true }));
    const converted: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        try {
          const dataUrl = await fileToOptimizedDataUrl(file);
          converted.push(dataUrl);
        } catch (err) {
          console.error('Erreur conversion image', err);
        }
      }
    }
    if (converted.length > 0) {
      setColorImages((prev) => ({
        ...prev,
        [colorName]: [...(prev[colorName] || []), ...converted],
      }));
      notifyColor(colorName, `${converted.length} photo(s) ajoutée(s) pour ${colorName}`);
    }
    setColorProcessing((prev) => ({ ...prev, [colorName]: false }));
  };

  const handleAddColorUrl = (colorName: string) => {
    const trimmed = (colorUrlInputs[colorName] || '').trim();
    if (!trimmed) return;
    setColorImages((prev) => ({
      ...prev,
      [colorName]: [...(prev[colorName] || []), trimmed],
    }));
    setColorUrlInputs((prev) => ({ ...prev, [colorName]: '' }));
    notifyColor(colorName, `Photo ajoutée pour ${colorName}`);
  };

  const handleSetColorPrimary = (colorName: string, index: number) => {
    if (index === 0) return;
    setColorImages((prev) => {
      const current = prev[colorName] || [];
      const selected = current[index];
      const remainder = current.filter((_, i) => i !== index);
      return {
        ...prev,
        [colorName]: [selected, ...remainder],
      };
    });
    notifyColor(colorName, `Photo définie comme couverture (${colorName})`);
  };

  const handleMoveColorImage = (colorName: string, index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    setColorImages((prev) => {
      const current = [...(prev[colorName] || [])];
      if (targetIdx < 0 || targetIdx >= current.length) return prev;
      const temp = current[index];
      current[index] = current[targetIdx];
      current[targetIdx] = temp;
      return {
        ...prev,
        [colorName]: current,
      };
    });
  };

  const handleDeleteColorImage = (colorName: string, index: number) => {
    setColorImages((prev) => {
      const current = (prev[colorName] || []).filter((_, i) => i !== index);
      return {
        ...prev,
        [colorName]: current,
      };
    });
    notifyColor(colorName, 'Photo retirée');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formData.name.trim().toUpperCase();
    if (!cleanName) return;

    const generatedId =
      initialProduct?.id ||
      cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const updatedColors = colors.map((c) => {
      const cImgs = colorImages[c.name] || [];
      return {
        ...c,
        images: cImgs.length > 0 ? cImgs : (c.images || []),
      };
    });

    const primaryColorImages =
      (colorImages[colors[0]?.name] && colorImages[colors[0]?.name].length > 0)
        ? colorImages[colors[0]?.name]
        : Object.values(colorImages).flat().filter(Boolean);

    // Strip away old legacy properties (savoirFaire, broderieSignature, labelDetails)
    // and maintain clean essentials
    const finalProduct: Product = {
      id: generatedId,
      name: cleanName,
      price: parseFloat(formData.price.toString()) || 79,
      currency: 'TND',
      spec: initialProduct?.spec || 'Édition Essentielle Atelier',
      description: formData.description.trim(),
      colors: updatedColors,
      colorImages: colorImages,
      sizes: sizes.length > 0 ? sizes : ['XS', 'S', 'M', 'L', 'XL'],
      branding: {
        embroidery: '',
        label: '',
      },
      images:
        primaryColorImages.length > 0
          ? primaryColorImages
          : [shelterSweatNoir],
      composition: initialProduct?.composition || 'Matière premium · 290 GSM',
      origin: initialProduct?.origin || 'Made in Tunisia 🇹🇳',
      visible: initialProduct?.visible !== undefined ? initialProduct.visible : true,
    };

    // Remove legacy properties if they existed
    delete (finalProduct as any).savoirFaire;
    delete (finalProduct as any).broderieSignature;
    delete (finalProduct as any).labelDetails;
    delete (finalProduct as any).showSavoirFaire;
    delete (finalProduct as any).savoirFaireTitle1;
    delete (finalProduct as any).savoirFaireText1;
    delete (finalProduct as any).savoirFaireTitle2;
    delete (finalProduct as any).savoirFaireText2;

    onSave(finalProduct, parseInt(formData.initialStock.toString()) || 8);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#101010] border border-[#34312D] text-[#E8E4DD] shadow-2xl overflow-hidden">
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-[#34312D] p-5 sm:p-6 bg-[#141414] shrink-0">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#B9A995] block">
              Atelier KŪZA · Fiche Modèle
            </span>
            <h2
              id="product-form-title"
              className="text-xl font-serif text-[#E8E4DD] mt-0.5"
              style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
            >
              {isNew ? 'Créer une Nouvelle Pièce' : `Modifier : ${formData.name || initialProduct?.name || 'Pièce'}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#96918A] hover:text-[#E8E4DD] hover:bg-[#181818] border border-transparent hover:border-[#34312D] transition-colors cursor-pointer"
            aria-label="Fermer la fiche produit"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form with Scrollable Content Body and Sticky Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8 space-y-7">
            {/* ======================================================== */}
            {/* 1. IDENTIFIANTS DU MODÈLE */}
            {/* ======================================================== */}
            <div className="p-4 sm:p-5 bg-[#141414] border border-[#34312D] space-y-4">
              <div className="flex items-center justify-between border-b border-[#34312D]/80 pb-2.5">
                <div className="text-xs uppercase font-mono tracking-widest text-[#B9A995] flex items-center gap-2 font-bold">
                  <span className="w-1.5 h-1.5 bg-[#B9A995]" />
                  <span>1. Identifiants du Modèle</span>
                </div>
                <span className="text-[10px] font-mono text-[#96918A]">Essentiels KŪZA</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#E8E4DD] mb-2 font-medium">
                    Nom du modèle *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    placeholder="ex: SHELTER SWEAT"
                    className="w-full bg-[#191919] border border-[#34312D] text-[#E8E4DD] px-4 py-3 rounded-none focus:border-[#B9A995] focus:outline-none placeholder-[#96918A]/50 font-medium tracking-wide"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#E8E4DD] mb-2 font-medium">
                    Prix (TND) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    min="1"
                    step="any"
                    value={formData.price || ''}
                    onChange={handleInputChange}
                    placeholder="79"
                    className="w-full bg-[#191919] border border-[#34312D] text-[#E8E4DD] px-4 py-3 rounded-none focus:border-[#B9A995] focus:outline-none placeholder-[#96918A]/50 font-mono tabular-nums"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono block">
                  Description du modèle
                </label>
                <textarea
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description épurée de la silhouette, coupe, matière et proportions..."
                  className="w-full bg-[#191919] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2.5 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none leading-relaxed"
                />
              </div>

              {isNew && (
                <div className="pt-2 border-t border-[#34312D]/60 flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono">
                    Stock initial par variante
                  </label>
                  <input
                    type="number"
                    name="initialStock"
                    min="0"
                    value={formData.initialStock}
                    onChange={handleInputChange}
                    className="w-24 bg-[#191919] border border-[#34312D] focus:border-[#B9A995] px-3 py-1.5 text-xs text-[#E8E4DD] focus:outline-none font-mono text-center"
                  />
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* 2. TAILLES DISPONIBLES */}
            {/* ======================================================== */}
            <div className="p-4 sm:p-5 bg-[#141414] border border-[#34312D] space-y-3">
              <div className="flex items-center justify-between border-b border-[#34312D]/80 pb-2.5">
                <div className="text-xs uppercase font-mono tracking-widest text-[#B9A995] flex items-center gap-2 font-bold">
                  <span className="w-1.5 h-1.5 bg-[#B9A995]" />
                  <span>2. Tailles Disponibles</span>
                </div>
                <span className="text-[10px] font-mono text-[#96918A]">
                  {sizes.length} taille{sizes.length > 1 ? 's' : ''} active{sizes.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex gap-2.5 flex-wrap pt-1">
                {ALL_SIZES.map((s) => {
                  const isSelected = sizes.includes(s);
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleSize(s)}
                      className={`min-w-12 h-10 px-3 text-xs font-mono uppercase transition-colors cursor-pointer border flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#E8E4DD] text-[#101010] border-[#E8E4DD] font-bold shadow-sm'
                          : 'bg-[#191919] text-[#96918A] border-[#34312D] hover:border-[#96918A]'
                      }`}
                    >
                      <span>[ {s} ]</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ======================================================== */}
            {/* 3. COLORIS */}
            {/* ======================================================== */}
            <div className="p-4 sm:p-5 bg-[#141414] border border-[#34312D] space-y-4">
              <div className="flex items-center justify-between border-b border-[#34312D]/80 pb-2.5">
                <div className="text-xs uppercase font-mono tracking-widest text-[#B9A995] flex items-center gap-2 font-bold">
                  <span className="w-1.5 h-1.5 bg-[#B9A995]" />
                  <span>3. Coloris ({colors.length})</span>
                </div>
                <span className="text-[10px] font-mono text-[#96918A]">
                  Gestion des teintes & pastilles
                </span>
              </div>

              {/* Existing Color Chips list */}
              <div className="flex flex-wrap gap-2.5">
                {colors.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-2 px-3 py-2 bg-[#181818] border border-[#34312D] group"
                  >
                    <input
                      type="color"
                      value={c.hex}
                      onChange={(e) => handleUpdateColorHex(c.name, e.target.value)}
                      className="w-5 h-5 rounded-full border border-[#34312D] bg-transparent cursor-pointer p-0 shrink-0"
                      title={`Modifier la teinte hex de ${c.name}`}
                    />
                    <span className="text-xs font-mono uppercase text-[#E8E4DD] font-medium tracking-wider">
                      {c.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#96918A]/70 uppercase">
                      {c.hex}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(c.name)}
                      disabled={colors.length <= 1}
                      className="ml-1 p-1 text-[#96918A] hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title={colors.length <= 1 ? 'Au moins 1 coloris obligatoire' : `Supprimer ${c.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Color Chip Input Row */}
              <div className="p-3 bg-[#191919] border border-[#34312D]/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase text-[#96918A] shrink-0">
                    Nouveau :
                  </span>
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => {
                      setNewColorName(e.target.value);
                      setColorError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddColor();
                      }
                    }}
                    placeholder="ex: Olive, Kaki, Écru..."
                    className="w-full bg-[#101010] border border-[#34312D] focus:border-[#B9A995] px-3 py-1.5 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-7 h-7 rounded border border-[#34312D] bg-transparent cursor-pointer p-0 shrink-0"
                    title="Choisir la couleur hex"
                  />
                  <input
                    type="text"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-20 bg-[#101010] border border-[#34312D] text-[11px] font-mono uppercase text-[#E8E4DD] px-2 py-1.5 focus:border-[#B9A995] focus:outline-none text-center"
                    placeholder="#101010"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3.5 py-1.5 bg-[#B9A995] hover:bg-[#c9baa7] text-[#101010] text-xs font-mono uppercase font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>

              {colorError && (
                <p className="text-[11px] font-mono text-rose-400">
                  {colorError}
                </p>
              )}
            </div>

            {/* ======================================================== */}
            {/* 4. PHOTOGRAPHIES PAR COLORIS */}
            {/* ======================================================== */}
            <div className="space-y-6 pt-3 border-t border-[#34312D]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs uppercase tracking-wider text-[#B9A995] font-mono flex items-center gap-2 font-bold">
                    <span className="w-1.5 h-1.5 bg-[#B9A995]" />
                    <ImageIcon className="w-3.5 h-3.5 text-[#B9A995]" />
                    <span>4. Photographies par Coloris ({colors.length} coloris)</span>
                  </label>
                  <p className="text-[11px] text-[#96918A] font-light mt-0.5">
                    Téléversement dédié pour chaque teinte. Sur la boutique, cliquer sur un coloris bascule automatiquement sur ses visuels.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#B9A995] bg-[#141414] border border-[#34312D] px-2.5 py-1 shrink-0">
                  {Object.values(colorImages).reduce((acc, arr) => acc + (arr?.length || 0), 0)} photo(s) au total
                </span>
              </div>

              {/* Containers for Each Color Variant */}
              <div className="space-y-5">
              {colors.map((color) => {
                const colorKey = color.name;
                const currentImgs = colorImages[colorKey] || [];
                const isDraggingThis = !!colorDragging[colorKey];
                const isProcessingThis = !!colorProcessing[colorKey];
                const noticeThis = colorNotices[colorKey];
                const urlVal = colorUrlInputs[colorKey] || '';

                return (
                  <div
                    key={colorKey}
                    className="p-4 sm:p-5 bg-[#141414] border border-[#34312D] space-y-4 transition-all"
                  >
                    {/* Container Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#34312D]/80 gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-4 h-4 rounded-full border border-[#E8E4DD]/40 shadow-sm shrink-0"
                          style={{ backgroundColor: color.hex }}
                          title={color.hex}
                        />
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs uppercase font-mono tracking-widest text-[#E8E4DD] font-bold">
                            PHOTOGRAPHIES — COLORIS : {color.name.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-[#96918A]">
                            ({currentImgs.length} photo{currentImgs.length > 1 ? 's' : ''})
                          </span>
                        </div>
                      </div>

                      {noticeThis && (
                        <span className="text-[10px] font-mono text-[#B9A995] animate-fade-in bg-[#181818] px-2 py-0.5 border border-[#B9A995]/40">
                          {noticeThis}
                        </span>
                      )}
                    </div>

                    {/* Hidden Native Multiple File Input */}
                    <input
                      id={`file-input-${colorKey}`}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleColorFiles(colorKey, e.target.files);
                          e.target.value = '';
                        }
                      }}
                    />

                    {/* Independent Drag & Drop Dropzone */}
                    <div
                      onDrop={(e) => {
                        e.preventDefault();
                        setColorDragging((prev) => ({ ...prev, [colorKey]: false }));
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          handleColorFiles(colorKey, e.dataTransfer.files);
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setColorDragging((prev) => ({ ...prev, [colorKey]: true }));
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setColorDragging((prev) => ({ ...prev, [colorKey]: false }));
                      }}
                      onClick={() => {
                        const input = document.getElementById(`file-input-${colorKey}`) as HTMLInputElement | null;
                        input?.click();
                      }}
                      className={`p-5 border-2 border-dashed transition-all cursor-pointer text-center space-y-2 ${
                        isDraggingThis
                          ? 'border-[#B9A995] bg-[#B9A995]/10 scale-[1.01]'
                          : 'border-[#34312D] hover:border-[#B9A995] bg-[#181818]'
                      }`}
                    >
                      <div className="w-8 h-8 mx-auto rounded-full bg-[#101010] border border-[#34312D] flex items-center justify-center text-[#B9A995]">
                        <UploadCloud className="w-4 h-4" />
                      </div>

                      <div>
                        <p className="text-xs text-[#E8E4DD] font-medium tracking-wide">
                          {isProcessingThis
                            ? `Traitement et optimisation des photos (${color.name})...`
                            : `Glissez-déposez des photos pour ${color.name}, ou cliquez pour parcourir`}
                        </p>
                        <p className="text-[10px] text-[#96918A] font-light mt-0.5">
                          Formats JPEG, PNG, WebP · Import direct Base64 · Shooting dédié au coloris {color.name}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const input = document.getElementById(`file-input-${colorKey}`) as HTMLInputElement | null;
                          input?.click();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#101010] border border-[#34312D] hover:border-[#B9A995] text-[11px] font-mono text-[#E8E4DD] transition-colors cursor-pointer"
                      >
                        <span>Parcourir les fichiers ({color.name})</span>
                      </button>
                    </div>

                    {/* Independent URL Input */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#96918A]" />
                        <input
                          type="url"
                          placeholder={`Lien URL de photographie pour le coloris ${color.name} (ex: Unsplash)...`}
                          value={urlVal}
                          onChange={(e) =>
                            setColorUrlInputs((prev) => ({ ...prev, [colorKey]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddColorUrl(colorKey);
                            }
                          }}
                          className="w-full bg-[#101010] border border-[#34312D] focus:border-[#B9A995] pl-9 pr-3 py-2 text-xs text-[#E8E4DD] focus:outline-none font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddColorUrl(colorKey)}
                        disabled={!urlVal.trim()}
                        className={`px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors border ${
                          urlVal.trim()
                            ? 'bg-[#181818] hover:bg-[#E8E4DD] text-[#E8E4DD] hover:text-[#101010] border-[#34312D] hover:border-[#E8E4DD] cursor-pointer'
                            : 'bg-[#101010] text-[#96918A]/40 border-[#34312D]/40 cursor-not-allowed'
                        }`}
                      >
                        Ajouter URL
                      </button>
                    </div>

                    {/* Independent Thumbnail Gallery Preview */}
                    {currentImgs.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] text-[#96918A] font-mono block">
                          Galerie visuelle {color.name} ({currentImgs.length}) · La 1ère photo sert de couverture lors du choix de ce coloris :
                        </span>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
                          {currentImgs.map((img, idx) => {
                            const isPrimary = idx === 0;
                            return (
                              <div
                                key={idx}
                                className={`relative group bg-[#101010] border p-2 flex flex-col justify-between transition-all ${
                                  isPrimary
                                    ? 'border-[#B9A995] ring-1 ring-[#B9A995]'
                                    : 'border-[#34312D] hover:border-[#96918A]'
                                }`}
                              >
                                {/* Thumbnail Image */}
                                <div className="relative aspect-[3/4] w-full bg-[#181818] overflow-hidden">
                                  <img
                                    src={img}
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover transition-all duration-300"
                                    style={{ filter: 'none' }}
                                  />

                                  {/* Primary Badge */}
                                  {isPrimary ? (
                                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#101010]/90 border border-[#B9A995] text-[9px] font-mono text-[#B9A995] flex items-center gap-1 shadow-md">
                                      <Star className="w-2.5 h-2.5 fill-[#B9A995]" />
                                      <span>Couverture</span>
                                    </div>
                                  ) : (
                                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#101010]/80 border border-[#34312D] text-[9px] font-mono text-[#96918A]">
                                      #{idx + 1}
                                    </div>
                                  )}

                                  {/* Lightbox Preview */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPreviewLightbox({
                                        images: currentImgs,
                                        index: idx,
                                        title: `${formData.name || 'Modèle'} — ${color.name}`,
                                        subtitle: `Atelier KŪZA · Coloris ${color.name}`,
                                      })
                                    }
                                    className="absolute bottom-1.5 right-1.5 p-1 bg-[#101010]/80 border border-[#34312D] hover:border-[#B9A995] text-[#E8E4DD] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    title="Agrandir avec zoom"
                                  >
                                    <Maximize2 className="w-3 h-3 text-[#B9A995]" />
                                  </button>
                                </div>

                                {/* Controls Toolbar */}
                                <div className="mt-2 pt-2 border-t border-[#34312D]/60 flex items-center justify-between text-xs font-mono">
                                  {/* Reorder */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleMoveColorImage(colorKey, idx, -1)}
                                      disabled={idx === 0}
                                      className={`p-1 border border-[#34312D] transition-colors ${
                                        idx === 0
                                          ? 'text-[#96918A]/30 cursor-not-allowed'
                                          : 'text-[#96918A] hover:text-[#E8E4DD] hover:bg-[#181818] cursor-pointer'
                                      }`}
                                      title="Déplacer vers la gauche"
                                    >
                                      <ChevronLeft className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveColorImage(colorKey, idx, 1)}
                                      disabled={idx === currentImgs.length - 1}
                                      className={`p-1 border border-[#34312D] transition-colors ${
                                        idx === currentImgs.length - 1
                                          ? 'text-[#96918A]/30 cursor-not-allowed'
                                          : 'text-[#96918A] hover:text-[#E8E4DD] hover:bg-[#181818] cursor-pointer'
                                      }`}
                                      title="Déplacer vers la droite"
                                    >
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Set Primary or Delete */}
                                  <div className="flex items-center gap-1">
                                    {!isPrimary && (
                                      <button
                                        type="button"
                                        onClick={() => handleSetColorPrimary(colorKey, idx)}
                                        className="p-1 border border-[#34312D] hover:border-[#B9A995] text-[#96918A] hover:text-[#B9A995] transition-colors cursor-pointer"
                                        title="Définir comme photo de couverture pour ce coloris"
                                      >
                                        <Star className="w-3 h-3" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteColorImage(colorKey, idx)}
                                      className="p-1 border border-[#34312D] hover:border-rose-400 text-[#96918A] hover:text-rose-400 transition-colors cursor-pointer"
                                      title="Retirer cette photo"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] font-mono text-[#96918A]/70 italic py-1">
                        Aucune photo enregistrée pour le coloris {color.name}. Ajoutez des fichiers ou une URL ci-dessus.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 sm:px-6 border-t border-[#34312D] bg-[#141414] flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-[#96918A]">
            {Object.values(colorImages).reduce((acc, arr) => acc + (arr?.length || 0), 0)} photo(s) au total · {colors.length} coloris
          </span>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#181818] border border-[#34312D] text-xs font-mono text-[#96918A] hover:text-[#E8E4DD] cursor-pointer transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
            >
              {isNew ? 'Créer la Pièce' : 'Enregistrer les Modifications'}
            </button>
          </div>
        </div>
      </form>
    </div>

    {/* Admin Photo Preview Lightbox */}
    {previewLightbox !== null && (
      <PhotoLightbox
        isOpen={true}
        images={previewLightbox.images}
        initialIndex={previewLightbox.index}
        productName={previewLightbox.title}
        subtitle={previewLightbox.subtitle || initialProduct?.spec || 'Atelier KŪZA'}
        onClose={() => setPreviewLightbox(null)}
      />
    )}
  </div>
);
};

