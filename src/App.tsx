/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PRODUCTS, Product, ProductColor, getVariantKey, INITIAL_INVENTORY } from './data/products';
import { CartItem, OrderDetails, InventoryMap, CustomerUser, SalesTransaction, StockMovementLog, PromotionsState, StockEntryNote } from './types';
import { DEFAULT_SALES_HISTORY, DEFAULT_STOCK_LOGS, DEFAULT_STOCK_ENTRIES, DEFAULT_ORDERS } from './data/initialLedger';


import {
  loadStoredPromotions,
  saveStoredPromotions,
  incrementCouponUsage,
  calculatePromotions,
  INITIAL_COUPONS,
  INITIAL_BUNDLE_RULES,
} from './utils/promotions';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CollectionSection } from './components/CollectionSection';
import { Manifesto } from './components/Manifesto';
import { AtelierSection } from './components/AtelierSection';
import { Footer } from './components/Footer';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { sendOrderNotification } from './utils/notification';
import { LegalComplianceModal } from './components/LegalComplianceModal';
import { LookbookModal } from './components/LookbookModal';
import { AnnouncementBar } from './components/AnnouncementBar';
import { BundleBanner } from './components/BundleBanner';
import { ScrollReveal } from './components/ScrollReveal';
import { useSiteConfig } from './context/SiteConfigContext';

// Default initial demo customer for quick evaluation
const DEFAULT_DEMO_USERS: CustomerUser[] = [
  {
    id: 'usr_demo_1',
    firstName: 'Yassine',
    lastName: 'Ben Salem',
    email: 'client@kuza.tn',
    phone: '98 123 456',
    governorate: 'Tunis',
    address: '14 Rue de la Liberté, Ennasr 2, Tunis',
    password: 'password123',
    createdAt: '15/01/2026',
    role: 'customer',
  },
];

// Master Admin profile for Atelier KŪZA
const ADMIN_USER: CustomerUser = {
  id: 'usr_admin_atelier',
  firstName: 'Atelier',
  lastName: 'KŪZA',
  email: 'admin@kuza.tn',
  phone: '+216 71 000 000',
  governorate: 'Tunis',
  address: 'Atelier Central KŪZA, La Goulette, Tunis',
  createdAt: '01/01/2026',
  role: 'admin',
};

export default function App() {
  const { siteConfig } = useSiteConfig();

  // Products state (persisted in localStorage with KŪZA Master Brief enforcement)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('kuza_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        // Reset/sanitize catalog names strictly to match KŪZA Master Brief and enrich color galleries:
        // Product 01: SHELTER SWEAT (79 TND) — [Replace any instance of "SWEATSHIRT BOXY FIT"]
        // Product 02: REST WIDE (85 TND)
        return parsed.map((p) => {
          const defaultProduct = PRODUCTS.find(
            (dp) => dp.id === p.id || (p.id === 'sweatshirt-boxy-fit' && dp.id === 'shelter-sweat')
          );
          const updatedColors = (p.colors || defaultProduct?.colors || []).map((col) => {
            const defCol = defaultProduct?.colors.find((dc) => dc.name === col.name);
            const hasLegacyPlaceholder = col.images?.some((img) =>
              typeof img === 'string' && (img.includes('unsplash') || img.includes('placeholder'))
            );
            const finalImages = hasLegacyPlaceholder || !col.images || col.images.length === 0
              ? defCol?.images || []
              : col.images;
            return {
              ...col,
              images: finalImages,
            };
          });

          const hasLegacyProductImages = p.images?.some((img) =>
            typeof img === 'string' && (img.includes('unsplash') || img.includes('placeholder'))
          );
          const finalProductImages = hasLegacyProductImages || !p.images || p.images.length === 0
            ? defaultProduct?.images || []
            : p.images;

          if (
            p.id === 'sweatshirt-boxy-fit' ||
            p.name.toUpperCase().includes('SWEATSHIRT BOXY FIT') ||
            p.name.toUpperCase().includes('BOXY FIT') ||
            p.id === 'shelter-sweat'
          ) {
            return {
              ...p,
              id: 'shelter-sweat',
              name: 'SHELTER SWEAT',
              price: 79,
              currency: 'TND',
              images: finalProductImages,
              colors: updatedColors,
              colorImages: defaultProduct?.colorImages,
            };
          }
          if (p.id === 'rest-wide') {
            return {
              ...p,
              id: 'rest-wide',
              name: 'REST WIDE',
              price: 85,
              currency: 'TND',
              images: finalProductImages,
              colors: updatedColors,
              colorImages: defaultProduct?.colorImages,
            };
          }
          return {
            ...p,
            images: finalProductImages,
            colors: updatedColors,
          };
        });
      }
      return PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  // Inventory state (Product x Color x Size SKU Matrix)
  const [inventory, setInventory] = useState<InventoryMap>(() => {
    try {
      const saved = localStorage.getItem('kuza_inventory');
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  });

  // Orders log (persisted in localStorage)
  const [orders, setOrders] = useState<OrderDetails[]>(() => {
    try {
      const saved = localStorage.getItem('kuza_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_ORDERS;
    } catch {
      return DEFAULT_ORDERS;
    }
  });

  // Sales History Ledger (persisted in localStorage kuza_sales_history)
  const [salesHistory, setSalesHistory] = useState<SalesTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('kuza_sales_history');
      return saved ? JSON.parse(saved) : DEFAULT_SALES_HISTORY;
    } catch {
      return DEFAULT_SALES_HISTORY;
    }
  });

  // Stock Movement Audit Trail (persisted in localStorage kuza_stock_logs)
  const [stockLogs, setStockLogs] = useState<StockMovementLog[]>(() => {
    try {
      const saved = localStorage.getItem('kuza_stock_logs');
      return saved ? JSON.parse(saved) : DEFAULT_STOCK_LOGS;
    } catch {
      return DEFAULT_STOCK_LOGS;
    }
  });

  // Stock Entry Notes / Bons d'Entrée (persisted in localStorage kuza_stock_entries)
  const [stockEntries, setStockEntries] = useState<StockEntryNote[]>(() => {
    try {
      const saved = localStorage.getItem('kuza_stock_entries');
      return saved ? JSON.parse(saved) : DEFAULT_STOCK_ENTRIES;
    } catch {
      return DEFAULT_STOCK_ENTRIES;
    }
  });

  // Registered Customer Accounts (persisted in localStorage)
  const [registeredUsers, setRegisteredUsers] = useState<CustomerUser[]>(() => {
    try {
      const saved = localStorage.getItem('kuza_registered_users');
      return saved ? JSON.parse(saved) : DEFAULT_DEMO_USERS;
    } catch {
      return DEFAULT_DEMO_USERS;
    }
  });

  // Current Logged-in User (persisted in localStorage)
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('kuza_customer_user') || localStorage.getItem('kuza_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'admin' && parsed.expiresAt && Date.now() > parsed.expiresAt) {
          localStorage.removeItem('kuza_customer_user');
          localStorage.removeItem('kuza_auth_user');
          return null;
        }
        if (!parsed.role) {
          parsed.role = parsed.email?.toLowerCase() === 'admin@kuza.tn' ? 'admin' : 'customer';
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Cart state persisted in localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kuza_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Admin View state (requires role: 'admin')
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    const isHashAdmin = window.location.hash === '#admin' || window.location.pathname === '/admin';
    try {
      const saved = localStorage.getItem('kuza_customer_user') || localStorage.getItem('kuza_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'admin' && parsed.expiresAt && Date.now() > parsed.expiresAt) {
          return false;
        }
        return isHashAdmin && parsed.role === 'admin';
      }
    } catch {
      // ignore
    }
    return false;
  });

  // UI Modals & Drawers state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedInitialColor, setSelectedInitialColor] = useState<ProductColor | undefined>(undefined);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [sizeGuideProductId, setSizeGuideProductId] = useState('shelter-sweat');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'cgv' | 'legal'>('cgv');
  const [isLookbookOpen, setIsLookbookOpen] = useState(false);

  // Promotions & Coupon state (backed by localStorage 'kuza_promotions')
  const [promotionsState, setPromotionsState] = useState<PromotionsState>(loadStoredPromotions);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);

  useEffect(() => {
    const handlePromoSync = () => {
      setPromotionsState(loadStoredPromotions());
    };
    window.addEventListener('kuza_promotions_updated', handlePromoSync);
    return () => window.removeEventListener('kuza_promotions_updated', handlePromoSync);
  }, []);

  const handleApplyCoupon = (code: string) => {
    const summary = calculatePromotions({
      items: cartItems,
      couponCode: code,
      promotionsState,
    });
    if (summary.couponError) {
      return { success: false, error: summary.couponError };
    }
    setAppliedCouponCode(summary.appliedCoupon?.code || code);
    return { success: true };
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode(null);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kuza_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('kuza_products', JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('kuza_inventory', JSON.stringify(inventory));
      localStorage.setItem('kuza_variant_stock', JSON.stringify(inventory));
    } catch {
      // ignore
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('kuza_sales_history', JSON.stringify(salesHistory));
    } catch {
      // ignore
    }
  }, [salesHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('kuza_stock_logs', JSON.stringify(stockLogs));
    } catch {
      // ignore
    }
  }, [stockLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('kuza_stock_entries', JSON.stringify(stockEntries));
    } catch {
      // ignore
    }
  }, [stockEntries]);


  useEffect(() => {
    try {
      localStorage.setItem('kuza_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('kuza_registered_users', JSON.stringify(registeredUsers));
    } catch {
      // ignore
    }
  }, [registeredUsers]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('kuza_customer_user', JSON.stringify(currentUser));
        localStorage.setItem('kuza_auth_user', JSON.stringify(currentUser));
        if (currentUser.role === 'admin') {
          localStorage.setItem('kuza_admin_session', 'true');
        } else {
          localStorage.removeItem('kuza_admin_session');
        }
      } else {
        localStorage.removeItem('kuza_customer_user');
        localStorage.removeItem('kuza_auth_user');
        localStorage.removeItem('kuza_admin_session');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // URL Hash Listener for #admin (guarded by role: 'admin')
  useEffect(() => {
    const handleHashChange = () => {
      const wantsAdmin = window.location.hash === '#admin' || window.location.pathname === '/admin';
      if (wantsAdmin) {
        if (currentUser?.role === 'admin') {
          setIsAdminView(true);
        } else {
          setIsAdminView(false);
          if (window.location.hash === '#admin') {
            window.history.pushState(null, '', window.location.pathname);
          }
          setIsAccountModalOpen(true);
          showToast('Veuillez vous connecter avec vos accès administrateur');
        }
      } else {
        setIsAdminView(false);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  useEffect(() => {
    // Session expiration check for admin
    if (currentUser?.role === 'admin' && (currentUser as any).expiresAt) {
      const timeLeft = (currentUser as any).expiresAt - Date.now();
      if (timeLeft <= 0) {
        handleLogout();
        showToast('Session Administrateur expirée (Limite 24h) · Directoire Stock verrouillé');
      } else {
        // Set a timer to auto logout when it expires
        const timer = setTimeout(() => {
          handleLogout();
          showToast('Session Administrateur expirée (Limite 24h) · Directoire Stock verrouillé');
        }, timeLeft);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser]);

  const openAdminView = () => {
    if (currentUser?.role === 'admin') {
      setIsAdminView(true);
      window.location.hash = '#admin';
    } else {
      setIsAccountModalOpen(true);
      showToast('Connexion requise pour accéder au contrôle de gestion stock');
    }
  };

  const closeAdminView = () => {
    setIsAdminView(false);
    if (window.location.hash === '#admin') {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Unified Role-Based Auth: Handles both Admin and Customer logins
  const handleLogin = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // 1. Role-Based Auth: Admin Role Detection
    if (cleanEmail === 'admin@kuza.tn') {
      if (cleanPass === 'kuza2026') {
        const adminSession = {
          ...ADMIN_USER,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h auto-logout
        };
        setCurrentUser(adminSession);
        setIsAdminView(true);
        window.location.hash = '#admin';
        showToast('Authentification réussie · Rôle : Administrateur Stock & Gestion (Session 24h)');
        return { success: true, role: 'admin' };
      }
      return { success: false, message: 'Mot de passe administrateur stock incorrect.' };
    }

    // 2. Role-Based Auth: Customer Accounts
    const user = registeredUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPass
    );
    if (user) {
      const customerWithRole: CustomerUser = {
        ...user,
        role: 'customer',
      };
      setCurrentUser(customerWithRole);
      showToast(`Bienvenue, ${user.firstName}`);
      return { success: true, role: 'customer' };
    }

    return { success: false, message: 'Email ou mot de passe incorrect.' };
  };

  const handleSignup = (userData: Omit<CustomerUser, 'id' | 'createdAt'>) => {
    if (userData.email.toLowerCase() === 'admin@kuza.tn') {
      return { success: false, message: "L'adresse admin@kuza.tn est réservée à l'administration atelier et ne peut être enregistrée comme compte client." };
    }
    const exists = registeredUsers.some(
      (u) => u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (exists) {
      return { success: false, message: 'Un compte existe déjà avec cette adresse email.' };
    }
    const newUser: CustomerUser = {
      ...userData,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toLocaleDateString('fr-FR'),
      role: 'customer',
    };
    setRegisteredUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    showToast(`Compte créé. Bienvenue, ${newUser.firstName} !`);
    return { success: true, role: 'customer' };
  };

  const handleUpdateProfile = (updatedData: Partial<CustomerUser>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
    );
    showToast('Coordonnées mises à jour avec succès');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdminView(false);
    if (window.location.hash === '#admin') {
      window.history.pushState(null, '', window.location.pathname);
    }
    showToast('Session fermée · Retour à la boutique');
  };

  const handleRegisterAfterCheckout = (userData: Omit<CustomerUser, 'id' | 'createdAt'>) => {
    handleSignup(userData);
  };

  // Add single item to cart with stock validation
  const handleAddToCart = (product: Product, color: ProductColor, size: string, quantity = 1) => {
    const key = getVariantKey(product.id, color.name, size);
    const availableStock = inventory[key] !== undefined ? inventory[key] : 10;

    if (availableStock <= 0) {
      showToast(`Cette taille est épuisée en stock (${size})`);
      return;
    }

    const lineId = `${product.id}-${color.name}-${size}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === lineId);
      if (existing) {
        return prev.map((item) =>
          item.id === lineId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: lineId,
          product,
          selectedColor: color,
          selectedSize: size,
          quantity,
        },
      ];
    });
    showToast(`Ajouté au panier : ${product.name} (${color.name} · ${size})`);
  };

  // Quick Add from Product Card
  const handleQuickAdd = (product: Product, color: ProductColor, size: string) => {
    handleAddToCart(product, color, size, 1);
  };

  // Add Full Bundle to Cart (Shelter Sweat + Rest Wide at 135 DT promo)
  const handleAddBundleToCart = (
    sweatColor: ProductColor,
    sweatSize: string,
    wideColor: ProductColor,
    wideSize: string
  ) => {
    const sweatProduct = products.find((p) => p.id === 'shelter-sweat');
    const wideProduct = products.find((p) => p.id === 'rest-wide');

    if (!sweatProduct || !wideProduct) {
      showToast('Erreur : Produits du set non trouvés.');
      return;
    }

    const sweatLineId = `${sweatProduct.id}-${sweatColor.name}-${sweatSize}`;
    const wideLineId = `${wideProduct.id}-${wideColor.name}-${wideSize}`;

    setCartItems((prev) => {
      let updated = [...prev];

      // 1. Add or increment Sweat
      const existingSweat = updated.find((it) => it.id === sweatLineId);
      if (existingSweat) {
        updated = updated.map((it) =>
          it.id === sweatLineId ? { ...it, quantity: it.quantity + 1 } : it
        );
      } else {
        updated.push({
          id: sweatLineId,
          product: sweatProduct,
          selectedColor: sweatColor,
          selectedSize: sweatSize,
          quantity: 1,
        });
      }

      // 2. Add or increment Pantalon
      const existingWide = updated.find((it) => it.id === wideLineId);
      if (existingWide) {
        updated = updated.map((it) =>
          it.id === wideLineId ? { ...it, quantity: it.quantity + 1 } : it
        );
      } else {
        updated.push({
          id: wideLineId,
          product: wideProduct,
          selectedColor: wideColor,
          selectedSize: wideSize,
          quantity: 1,
        });
      }

      return updated;
    });

    showToast("Ensemble Full KŪZA ajouté au panier ! Tarif remisé à 135,000 DT (-29,000 DT)");
    setIsCartOpen(true);
  };

  // Quantity updates
  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  // Remove Item
  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  // Direct checkout shortcut
  const handleDirectCheckout = (product: Product, color: ProductColor, size: string) => {
    handleAddToCart(product, color, size, 1);
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Open Product Modal
  const handleSelectProduct = (product: Product, initialColor?: ProductColor) => {
    setSelectedProduct(product);
    setSelectedInitialColor(initialColor);
  };

  // Open Size Guide Modal
  const handleOpenSizeGuide = (productId = 'shelter-sweat') => {
    setSizeGuideProductId(productId);
    setIsSizeGuideOpen(true);
  };

  // Smooth scroll helper
  const handleNavigate = (sectionId: string) => {
    if (isAdminView) {
      closeAdminView();
    }
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (sectionId === 'collection' || sectionId === 'pieces' || sectionId === 'catalogue') {
      const elem =
        document.getElementById('pieces') ||
        document.getElementById('collection') ||
        document.getElementById('catalogue');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    if (sectionId === 'lookbook' || sectionId === 'editorial') {
      const elem =
        document.getElementById('lookbook') ||
        document.getElementById('editorial');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle successful Cash on Delivery order: deduct stock automatically & sync!
  const handleOrderSuccess = (order: OrderDetails) => {
    // 1. Link to logged-in user if available
    const enrichedOrder: OrderDetails = {
      ...order,
      customerId: currentUser ? currentUser.id : order.customerId,
      customerEmail: currentUser ? currentUser.email : order.customerEmail,
    };

    // 2. Save to orders history
    setOrders((prev) => [enrichedOrder, ...prev]);

    // 3. Automatically deduct stock per SKU variant and create movement logs
    const newLogs: StockMovementLog[] = [];
    const timestamp = new Date().toISOString();

    setInventory((prev) => {
      const updated = { ...prev };
      order.items.forEach((item) => {
        const key = getVariantKey(item.product.id, item.selectedColor.name, item.selectedSize);
        const currentQty = updated[key] ?? 10;
        const nextQty = Math.max(0, currentQty - item.quantity);
        updated[key] = nextQty;

        newLogs.push({
          logId: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp,
          sku: key,
          productName: item.product.name,
          color: item.selectedColor.name,
          size: item.selectedSize,
          type: 'VENTE',
          changeQty: -item.quantity,
          previousStock: currentQty,
          newStock: nextQty,
          reference: order.orderId,
        });
      });
      return updated;
    });

    if (newLogs.length > 0) {
      setStockLogs((prev) => [...newLogs, ...prev]);
    }

    // 4. Create an entry in kuza_sales_history
    const newTx: SalesTransaction = {
      transactionId: `TX-${order.orderId}`,
      orderId: order.orderId,
      timestamp,
      client: {
        name: order.customerName,
        phone: order.phone,
        governorate: order.governorate,
        address: order.address,
      },
      items: order.items.map((it) => ({
        productId: it.product.id,
        name: it.product.name,
        color: it.selectedColor.name,
        size: it.selectedSize,
        qty: it.quantity,
        unitPrice: it.product.price,
      })),
      subtotal: order.subtotal,
      shippingFee: order.shipping || 8,
      discountAmount: order.discountAmount || 0,
      promoCode: order.appliedCouponCode,
      bundleOffer: order.appliedBundleName,
      totalAmount: order.total,
      paymentStatus: 'EN_ATTENTE_LIVRAISON',
      orderStatus: order.status || 'Commande reçue',
    };
    setSalesHistory((prev) => [newTx, ...prev]);

    // 5. Increment coupon usage if used
    if (order.appliedCouponCode) {
      incrementCouponUsage(order.appliedCouponCode);
      setPromotionsState(loadStoredPromotions());
    }
    setAppliedCouponCode(null);

    // 6. Fire automated background email alerts (customer and atelier)
    sendOrderNotification(enrichedOrder);

    // 7. Clear cart
    setCartItems([]);
    showToast("Confirmation transmise · Un récapitulatif a été envoyé à votre adresse email.");
  };

  // Reset to default catalog and inventory
  const handleResetDefaults = () => {
    setProducts(PRODUCTS);
    setInventory(INITIAL_INVENTORY);
    setSalesHistory(DEFAULT_SALES_HISTORY);
    setStockLogs(DEFAULT_STOCK_LOGS);
    setStockEntries(DEFAULT_STOCK_ENTRIES);
    const initialPromos: PromotionsState = {
      coupons: INITIAL_COUPONS,
      bundleRules: INITIAL_BUNDLE_RULES,
    };
    setPromotionsState(initialPromos);
    saveStoredPromotions(initialPromos);
    setAppliedCouponCode(null);
    localStorage.removeItem('kuza_products');
    localStorage.removeItem('kuza_inventory');
    localStorage.removeItem('kuza_variant_stock');
    localStorage.removeItem('kuza_sales_history');
    localStorage.removeItem('kuza_stock_logs');
    localStorage.removeItem('kuza_stock_entries');
    showToast('Catalogue, stocks, réceptions et promotions réinitialisés');
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // If Admin View is active and authenticated with role: 'admin', render Admin Dashboard
  if (isAdminView && currentUser?.role === 'admin') {
    return (
      <AdminDashboard
        products={products}
        inventory={inventory}
        orders={orders}
        salesHistory={salesHistory}
        stockLogs={stockLogs}
        stockEntries={stockEntries}
        promotionsState={promotionsState}
        onUpdateInventory={(newInv) => setInventory(newInv)}
        onUpdateProducts={(newProds) => setProducts(newProds)}
        onUpdateOrders={(newOrders) => setOrders(newOrders)}
        onUpdateSalesHistory={(newHist) => setSalesHistory(newHist)}
        onUpdateStockLogs={(newLogs) => setStockLogs(newLogs)}
        onUpdateStockEntries={(newEntries) => setStockEntries(newEntries)}
        onUpdatePromotions={(newPromos) => setPromotionsState(newPromos)}
        onClose={closeAdminView}
        onLogout={handleLogout}
        onResetDefaults={handleResetDefaults}
      />
    );
  }


  return (
    <div className="max-w-[1920px] mx-auto min-h-screen bg-[#101010] text-[#E8E4DD] border-x border-[#34312D]/30 flex flex-col selection:bg-[#B9A995] selection:text-[#101010]">
      {/* 1. TOP ANNOUNCEMENT BAR (Special Set Bundle Promotion: 135,000 DT) */}
      {siteConfig.sections.announcement && (
        <AnnouncementBar
          onPromoClick={() => {
            const target = document.getElementById('bundle-set');
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
      )}

      {/* Top Bar with COMPTE link and conditional Admin action for authenticated admin */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigate={handleNavigate}
        onOpenAdmin={openAdminView}
        onOpenAccount={() => setIsAccountModalOpen(true)}
        onOpenLookbook={() => setIsLookbookOpen(true)}
        currentUser={currentUser}
        customerName={currentUser ? currentUser.firstName : undefined}
        products={products}
        onSelectProduct={handleSelectProduct}
      />

      {/* Main Content Area: dynamically ordered based on siteConfig.sectionOrder */}
      <main className="flex-1 flex flex-col">
        {(siteConfig.sectionOrder || ['hero', 'bundle', 'collection', 'philosophie', 'atelier'])
          .filter((key) => key !== 'announcement' && key !== 'footer')
          .map((sectionKey) => {
            if (!siteConfig.sections[sectionKey as keyof typeof siteConfig.sections]) {
              return null;
            }
            switch (sectionKey) {
              case 'hero':
                return <Hero key="hero" onExplore={() => handleNavigate('collection')} />;
              case 'bundle':
                return (
                  <ScrollReveal key="bundle">
                    <BundleBanner
                      products={products}
                      inventory={inventory}
                      onAddBundleToCart={handleAddBundleToCart}
                      onSelectProduct={handleSelectProduct}
                    />
                  </ScrollReveal>
                );
              case 'collection':
                return (
                  <ScrollReveal key="collection">
                    <CollectionSection
                      products={products}
                      inventory={inventory}
                      onSelectProduct={handleSelectProduct}
                      onQuickAdd={handleQuickAdd}
                      onNavigateToBundle={() => {
                        const target = document.getElementById('bundle-set');
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    />
                  </ScrollReveal>
                );
              case 'philosophie':
                return (
                  <ScrollReveal key="philosophie">
                    <Manifesto key="philosophie" />
                  </ScrollReveal>
                );
              case 'atelier':
                return (
                  <ScrollReveal key="atelier">
                    <AtelierSection key="atelier" />
                  </ScrollReveal>
                );
              default:
                return null;
            }
          })}
      </main>

      {/* Footer with COMPTE and conditional Espace Admin links */}
      {siteConfig.sections.footer && (
        <ScrollReveal>
          <Footer
            onOpenSizeGuide={() => handleOpenSizeGuide('shelter-sweat')}
            onNavigate={handleNavigate}
            currentUser={currentUser}
            onOpenAdmin={openAdminView}
            onOpenAccount={() => setIsAccountModalOpen(true)}
            onOpenLegal={(tab) => {
              setLegalTab(tab);
              setIsLegalOpen(true);
            }}
          />
        </ScrollReveal>
      )}

      {/* Unified Customer / Admin Account Modal */}
      {isAccountModalOpen && (
        <CustomerAccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          currentUser={currentUser}
          orders={orders}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onUpdateProfile={handleUpdateProfile}
          onLogout={handleLogout}
          onOpenAdmin={openAdminView}
        />
      )}

      {/* Product Detail Modal (PDP) with real-time stock control */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          initialColor={selectedInitialColor}
          inventory={inventory}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onOpenSizeGuide={handleOpenSizeGuide}
          onDirectCheckout={handleDirectCheckout}
        />
      )}

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        promotionsState={promotionsState}
        appliedCouponCode={appliedCouponCode}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        products={products}
        onSelectProduct={handleSelectProduct}
      />

      {/* Checkout Modal with Dual Mode (Guest vs Logged-In) */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cartItems}
          currentUser={currentUser}
          promotionsState={promotionsState}
          appliedCouponCode={appliedCouponCode}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
          onOrderSuccess={handleOrderSuccess}
          onRegisterAfterCheckout={handleRegisterAfterCheckout}
          onOpenLegal={(tab) => {
            setLegalTab(tab);
            setIsLegalOpen(true);
          }}
        />
      )}

      {/* Size Guide Modal with Interactive Fit Calculator */}
      {isSizeGuideOpen && (
        <SizeGuideModal
          isOpen={isSizeGuideOpen}
          defaultProductId={sizeGuideProductId}
          onClose={() => setIsSizeGuideOpen(false)}
        />
      )}

      {/* Legal Compliance Terms & Mentions */}
      <LegalComplianceModal
        isOpen={isLegalOpen}
        initialTab={legalTab}
        onClose={() => setIsLegalOpen(false)}
      />

      {/* Visual Editorial Lookbook Modal */}
      {isLookbookOpen && (
        <LookbookModal
          isOpen={isLookbookOpen}
          onClose={() => setIsLookbookOpen(false)}
          products={products}
          onSelectProduct={handleSelectProduct}
          onScrollToEditorial={() => handleNavigate('editorial')}
        />
      )}

      {/* Floating Micro Notification Toast */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#181818] border border-[#B9A995] text-xs font-mono text-[#E8E4DD] shadow-2xl flex items-center gap-2 animate-fade-in"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#B9A995]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
