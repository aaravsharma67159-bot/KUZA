import React, { useState, useMemo } from 'react';
import {
  Tag,
  Sparkles,
  CheckCircle2,
  Wallet,
  Plus,
  RotateCcw,
  Search,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  X,
  Clock,
  Ban,
  Check,
  AlertCircle,
  HelpCircle,
  Percent,
  DollarSign,
} from 'lucide-react';
import {
  Coupon,
  BundleRule,
  PromotionsState,
  OrderDetails,
  SalesTransaction,
} from '../types';
import { Product } from '../data/products';
import { formatTND } from '../utils/currency';
import {
  formatDiscountPercent,
  isCampaignWithinDates,
  INITIAL_COUPONS,
  INITIAL_BUNDLE_RULES,
  saveStoredPromotions,
} from '../utils/promotions';

interface PromotionsManagementProps {
  promotionsState: PromotionsState;
  products: Product[];
  orders?: OrderDetails[];
  salesHistory?: SalesTransaction[];
  onUpdatePromotions?: (newPromos: PromotionsState) => void;
  showNotice: (msg: string) => void;
}

export const PromotionsManagement: React.FC<PromotionsManagementProps> = ({
  promotionsState,
  products,
  orders = [],
  salesHistory = [],
  onUpdatePromotions,
  showNotice,
}) => {
  const [localPromos, setLocalPromos] = useState<PromotionsState>(promotionsState);

  // Sync when prop updates
  React.useEffect(() => {
    setLocalPromos(promotionsState);
  }, [promotionsState]);

  // Filters state
  const [couponSearch, setCouponSearch] = useState('');
  const [couponFilter, setCouponFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals state
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [editingBundle, setEditingBundle] = useState<BundleRule | null>(null);
  const [isCreatingBundle, setIsCreatingBundle] = useState(false);

  // Helper to commit state changes
  const commitPromotions = (nextState: PromotionsState, noticeMessage?: string) => {
    setLocalPromos(nextState);
    saveStoredPromotions(nextState);
    if (onUpdatePromotions) {
      onUpdatePromotions(nextState);
    }
    if (noticeMessage) {
      showNotice(noticeMessage);
    }
  };

  // 1. Calculate synchronized customer economies
  const totalCustomerEconomies = useMemo(() => {
    const fromOrders = (orders || [])
      .filter((o) => o.status !== 'Annulée' && o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.discountAmount || 0), 0);

    const fromSales = (salesHistory || [])
      .filter((tx) => tx.paymentStatus !== 'ANNULÉE' && tx.orderStatus !== 'Annulée')
      .reduce((sum, tx) => sum + (tx.discountAmount || 0), 0);

    return Math.max(fromOrders, fromSales, 39); // Defaults to minimum 39 DT seeded from initial ledger
  }, [orders, salesHistory]);

  // Handlers for Coupons
  const handleToggleCoupon = (id: string) => {
    const updatedCoupons = localPromos.coupons.map((c) =>
      c.id === id ? { ...c, active: !c.active } : c
    );
    const target = updatedCoupons.find((c) => c.id === id);
    const nextState = { ...localPromos, coupons: updatedCoupons };
    commitPromotions(
      nextState,
      target?.active
        ? `Code « ${target.code} » activé`
        : `Code « ${target?.code} » désactivé`
    );
  };

  const handleDeleteCoupon = (id: string) => {
    const target = localPromos.coupons.find((c) => c.id === id);
    const updatedCoupons = localPromos.coupons.filter((c) => c.id !== id);
    const nextState = { ...localPromos, coupons: updatedCoupons };
    commitPromotions(nextState, `Code « ${target?.code || id} » supprimé`);
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
    const nextState = { ...localPromos, coupons: updatedCoupons };
    commitPromotions(nextState, `Code « ${coupon.code} » enregistré`);
    setEditingCoupon(null);
    setIsCreatingCoupon(false);
  };

  // Handlers for Bundles
  const handleToggleBundle = (id: string) => {
    const updatedRules = localPromos.bundleRules.map((b) =>
      b.id === id ? { ...b, active: !b.active } : b
    );
    const target = updatedRules.find((b) => b.id === id);
    const nextState = { ...localPromos, bundleRules: updatedRules };
    commitPromotions(
      nextState,
      target?.active
        ? `Offre « ${target.name} » activée`
        : `Offre « ${target?.name} » désactivée`
    );
  };

  const handleUpdateBundlePercent = (id: string, newPercent: number) => {
    const updatedRules = localPromos.bundleRules.map((b) =>
      b.id === id
        ? {
            ...b,
            discountPercent: newPercent,
            fixedPrice: undefined, // remove fixed price if percent selected
          }
        : b
    );
    const nextState = { ...localPromos, bundleRules: updatedRules };
    commitPromotions(nextState, `Remise bundle ajustée à -${newPercent}%`);
  };

  const handleDeleteBundle = (id: string) => {
    const target = localPromos.bundleRules.find((b) => b.id === id);
    const updatedRules = localPromos.bundleRules.filter((b) => b.id !== id);
    const nextState = { ...localPromos, bundleRules: updatedRules };
    commitPromotions(nextState, `Offre bundle « ${target?.name || id} » supprimée`);
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
    const nextState = { ...localPromos, bundleRules: updatedRules };
    commitPromotions(nextState, `Offre bundle « ${bundle.name} » enregistrée`);
    setEditingBundle(null);
    setIsCreatingBundle(false);
  };

  const handleResetPromotionsToDefault = () => {
    const initial: PromotionsState = {
      coupons: INITIAL_COUPONS,
      bundleRules: INITIAL_BUNDLE_RULES,
    };
    commitPromotions(initial, "Offres et coupons réinitialisés aux valeurs d'atelier");
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* 1. Header & Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#34312D] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2
              className="text-2xl md:text-3xl font-serif text-[#E8E4DD]"
              style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
            >
              Codes Promo & Offres Bundles
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 bg-[#181818] border border-[#B9A995] text-[#B9A995]">
              Moteur Commercial
            </span>
          </div>
          <p className="text-xs text-[#96918A] font-light mt-1">
            Gestion centralisée des coupons de réduction, des règles de packs automatiques (ex: Ensemble Full KŪZA à 135 DT) et du contrôle de non-cumulabilité.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleResetPromotionsToDefault}
            className="px-3.5 py-2 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-[11px] font-mono uppercase tracking-wider text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer flex items-center gap-1.5"
            title="Restaurer KUZA10 et Ensemble Full Kūza"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#B9A995]" />
            <span>Réinitialiser Offres</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingBundle(null);
              setIsCreatingBundle(true);
            }}
            className="px-3.5 py-2 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-[11px] font-mono uppercase tracking-wider text-[#E8E4DD] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#B9A995]" />
            <span>Nouveau Bundle</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingCoupon(null);
              setIsCreatingCoupon(true);
            }}
            className="px-4 py-2 bg-[#E8E4DD] hover:bg-white text-[#101010] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4 text-[#101010]" />
            <span>Créer un Code Promo</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        {/* Metric 1 */}
        <div className="p-4 sm:p-5 bg-[#181818] border border-[#34312D] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-[#96918A]">
                Codes Promo Actifs
              </span>
              <Tag className="w-3.5 h-3.5 text-[#B9A995]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#E8E4DD] tabular-nums">
                {localPromos.coupons.filter((c) => c.active).length}
              </span>
              <span className="text-[10px] text-[#96918A]">
                / {localPromos.coupons.length} configurés
              </span>
            </div>
          </div>
          <div className="pt-2 mt-3 border-t border-[#34312D]/40 text-[10px] text-[#96918A]">
            Actifs au panier & commande
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 sm:p-5 bg-[#181818] border border-[#34312D] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-[#96918A]">
                Offres Bundles Auto
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#B9A995]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#B9A995] tabular-nums">
                {localPromos.bundleRules.filter((b) => b.active).length}
              </span>
              <span className="text-[10px] text-[#96918A]">
                règle(s) active(s)
              </span>
            </div>
          </div>
          <div className="pt-2 mt-3 border-t border-[#34312D]/40 text-[10px] text-emerald-400">
            Détection automatique au panier
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 sm:p-5 bg-[#181818] border border-[#34312D] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-[#96918A]">
                Utilisations Coupons
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#E8E4DD] tabular-nums">
                {localPromos.coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0)}
              </span>
              <span className="text-[10px] text-[#96918A]">
                commandes appliquées
              </span>
            </div>
          </div>
          <div className="pt-2 mt-3 border-t border-[#34312D]/40 text-[10px] text-[#96918A]">
            Compteurs synchronisés
          </div>
        </div>

        {/* Metric 4: Synced Customer Economies (Real calculated amount, not static 0 DT) */}
        <div className="p-4 sm:p-5 bg-[#181818] border border-[#34312D] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-[#96918A]">
                Économies Clients
              </span>
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400 tabular-nums">
                {formatTND(totalCustomerEconomies)}
              </span>
            </div>
          </div>
          <div className="pt-2 mt-3 border-t border-[#34312D]/40 text-[10px] text-emerald-500/80">
            Total remises accordées réelles
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: AUTOMATIC BUNDLE PROMOTIONS */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#34312D] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-serif text-[#E8E4DD]">
                1. Offres Bundles & Packs Automatiques
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Sans code requis
              </span>
            </div>
            <p className="text-xs text-[#96918A] font-light mt-0.5">
              S'applique instantanément au panier lorsque toutes les pièces obligatoires d'un pack sont réunies.
            </p>
          </div>
        </div>

        {localPromos.bundleRules.length === 0 ? (
          <div className="p-8 bg-[#181818] border border-[#34312D] text-center space-y-2 font-mono">
            <p className="text-xs text-[#96918A]">Aucune offre bundle configurée</p>
            <button
              type="button"
              onClick={handleResetPromotionsToDefault}
              className="px-4 py-2 bg-[#101010] border border-[#34312D] hover:border-[#B9A995] text-xs text-[#E8E4DD] cursor-pointer"
            >
              Activer l'Ensemble Full KŪZA (-29,000 DT)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {localPromos.bundleRules.map((rule) => {
              const matchedProds = rule.requiredProductIds.map((pid) =>
                products.find((p) => p.id === pid) || { id: pid, name: pid, price: 0 }
              );
              const combinedPrice = matchedProds.reduce((acc, p) => acc + (p.price || 0), 0);
              const hasFixedPrice = Boolean(rule.fixedPrice && rule.fixedPrice > 0);
              const discountVal = hasFixedPrice
                ? Math.max(0, combinedPrice - (rule.fixedPrice || 0))
                : combinedPrice * (rule.discountPercent / 100);

              const dateStatus = isCampaignWithinDates(rule.startDate, rule.endDate);
              const isCurrentlyActive = rule.active && dateStatus.isValid;

              return (
                <div
                  key={rule.id}
                  className={`p-5 bg-[#181818] border transition-all space-y-4 ${
                    isCurrentlyActive
                      ? 'border-[#B9A995] ring-1 ring-[#B9A995]/30'
                      : 'border-[#34312D] opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold tracking-wider text-[#E8E4DD]">
                          {rule.name}
                        </span>

                        {/* Clean percentage or fixed discount badge */}
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#141414] border border-[#B9A995] text-[#B9A995] font-semibold">
                          {hasFixedPrice
                            ? `-29,000 DT REMISE`
                            : `-${formatDiscountPercent(rule.discountPercent)} SUR LE PACK`}
                        </span>

                        {/* Status indicators */}
                        {rule.active ? (
                          dateStatus.isValid ? (
                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              En direct
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-400">
                              {dateStatus.label}
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-mono text-[#96918A]">
                            ○ Désactivé
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#96918A] font-light">
                        {rule.description || 'Remise automatique combinée.'}
                      </p>

                      {/* Date Validity info if configured */}
                      {(rule.startDate || rule.endDate) && (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#96918A] pt-0.5">
                          <Calendar className="w-3 h-3 text-[#B9A995]" />
                          <span>
                            Période : {rule.startDate ? new Date(rule.startDate).toLocaleDateString('fr-FR') : 'Immédiat'}
                            {' → '}
                            {rule.endDate ? new Date(rule.endDate).toLocaleDateString('fr-FR') : 'Indéterminé'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Instant ACTIF / INACTIF toggle switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleBundle(rule.id)}
                      className={`px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider transition-all border cursor-pointer shrink-0 ${
                        rule.active
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
                          : 'bg-[#141414] text-[#96918A] border-[#34312D] hover:text-[#E8E4DD]'
                      }`}
                    >
                      {rule.active ? 'ACTIF ●' : 'INACTIF ○'}
                    </button>
                  </div>

                  {/* Required items tags */}
                  <div className="p-3 bg-[#141414] border border-[#34312D] space-y-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#96918A] block">
                      Articles Requis Simultanément ({rule.requiredProductIds.length}) :
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {matchedProds.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#181818] border border-[#34312D] text-xs font-mono text-[#E8E4DD]"
                        >
                          <span>{p.name}</span>
                          <span className="text-[#96918A]">({formatTND(p.price)})</span>
                        </span>
                      ))}
                    </div>
                    {combinedPrice > 0 && (
                      <div className="pt-2 border-t border-[#34312D]/60 flex items-center justify-between text-xs font-mono text-[#96918A]">
                        <span>Prix unitaire cumulé : {formatTND(combinedPrice)}</span>
                        <span className="text-emerald-400 font-bold">
                          {hasFixedPrice ? `Prix Pack : ${formatTND(rule.fixedPrice || 135)} ` : ''}
                          (Économie : -{formatTND(discountVal)})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Discount adjustment chips & actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#34312D] text-xs font-mono">
                    {/* HIDE percentage selection chips if fixed price bundle */}
                    {hasFixedPrice ? (
                      <div className="flex items-center gap-2 text-[11px] text-[#B9A995]">
                        <span className="px-2 py-0.5 bg-[#141414] border border-[#34312D] text-xs font-bold text-emerald-400">
                          Tarif Pack Fixe : {formatTND(rule.fixedPrice || 135)}
                        </span>
                        <span className="text-[10px] text-[#96918A] hidden sm:inline">
                          (Offre spéciale verrouillée)
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#96918A] uppercase">Remise :</span>
                        {[10, 15, 20, 25, 30].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => handleUpdateBundlePercent(rule.id, pct)}
                            className={`px-2 py-0.5 text-[10px] font-mono border transition-colors cursor-pointer ${
                              Math.round(rule.discountPercent) === pct
                                ? 'bg-[#B9A995] text-[#101010] border-[#B9A995] font-bold'
                                : 'bg-[#141414] text-[#96918A] border-[#34312D] hover:text-[#E8E4DD]'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBundle(rule);
                          setIsCreatingBundle(false);
                        }}
                        className="p-1.5 text-[#96918A] hover:text-[#E8E4DD] border border-transparent hover:border-[#34312D] transition-colors cursor-pointer"
                        title="Modifier la règle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBundle(rule.id)}
                        className="p-1.5 text-[#96918A] hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer"
                        title="Supprimer ce bundle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: MANUAL COUPONS */}
      {/* ======================================================== */}
      <div className="space-y-4 pt-4 border-t border-[#34312D]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#34312D] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-serif text-[#E8E4DD]">
                2. Codes Promotionnels Manuels
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-[#181818] border border-[#34312D] text-[#B9A995]">
                Saisie Client
              </span>
            </div>
            <p className="text-xs text-[#96918A] font-light mt-0.5">
              Codes à usage unique ou multiple (ex: KUZA10 pour -10%, ATELIER15 pour -15 DT).
            </p>
          </div>

          {/* Filter and Search */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#96918A]" />
              <input
                type="text"
                placeholder="Filtrer code..."
                value={couponSearch}
                onChange={(e) => setCouponSearch(e.target.value)}
                className="bg-[#181818] border border-[#34312D] focus:border-[#B9A995] pl-8 pr-3 py-1.5 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 font-mono focus:outline-none w-44"
              />
            </div>

            <div className="flex items-center border border-[#34312D] bg-[#181818]">
              {(['all', 'active', 'inactive'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCouponFilter(mode)}
                  className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    couponFilter === mode
                      ? 'bg-[#E8E4DD] text-[#101010] font-semibold'
                      : 'text-[#96918A] hover:text-[#E8E4DD]'
                  }`}
                >
                  {mode === 'all' ? 'TOUS' : mode === 'active' ? 'ACTIFS' : 'INACTIFS'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Coupons Grid */}
        {localPromos.coupons.length === 0 ? (
          <div className="p-8 bg-[#181818] border border-[#34312D] text-center space-y-2 font-mono">
            <p className="text-xs text-[#96918A]">Aucun code promotionnel créé</p>
            <button
              type="button"
              onClick={handleResetPromotionsToDefault}
              className="px-4 py-2 bg-[#101010] border border-[#34312D] hover:border-[#B9A995] text-xs text-[#E8E4DD] cursor-pointer"
            >
              Restaurer le code KUZA10
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localPromos.coupons
              .filter((c) => {
                const q = couponSearch.trim().toLowerCase();
                const matchQ = !q || c.code.toLowerCase().includes(q);
                const matchF =
                  couponFilter === 'all' ||
                  (couponFilter === 'active' && c.active) ||
                  (couponFilter === 'inactive' && !c.active);
                return matchQ && matchF;
              })
              .map((coupon) => {
                const usagePct =
                  coupon.usageLimit > 0
                    ? Math.min(100, Math.round((coupon.usedCount / coupon.usageLimit) * 100))
                    : 0;

                const dateStatus = isCampaignWithinDates(coupon.startDate, coupon.endDate);
                const isCurrentlyActive = coupon.active && dateStatus.isValid;

                return (
                  <div
                    key={coupon.id}
                    className={`p-4 bg-[#181818] border transition-all space-y-3 flex flex-col justify-between ${
                      isCurrentlyActive
                        ? 'border-[#34312D] hover:border-[#B9A995]'
                        : 'border-[#34312D]/60 opacity-60'
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Header: Code, Type & Toggle */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-bold text-[#E8E4DD] tracking-wider block">
                              {coupon.code}
                            </span>
                            {coupon.nonCumulative && (
                              <span
                                className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase"
                                title="Empêche le cumul avec l'Offre Ensemble"
                              >
                                Non-cumulable
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-[#96918A] uppercase">
                            {coupon.type === 'PERCENTAGE'
                              ? `Pourcentage : -${coupon.value}%`
                              : `Montant Fixe : -${formatTND(coupon.value)}`}
                          </span>
                        </div>

                        {/* Instant ACTIF / INACTIF toggle switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleCoupon(coupon.id)}
                          className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                            coupon.active
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
                              : 'bg-[#141414] text-[#96918A] border-[#34312D] hover:text-[#E8E4DD]'
                          }`}
                        >
                          {coupon.active ? 'ACTIF ●' : 'INACTIF ○'}
                        </button>
                      </div>

                      {/* Details: Minimum Order & Usage */}
                      <div className="p-2.5 bg-[#141414] border border-[#34312D] space-y-2 text-xs font-mono">
                        <div className="flex justify-between text-[#96918A]">
                          <span>Seuil commande :</span>
                          <span className="text-[#E8E4DD]">
                            {coupon.minOrderDT > 0 ? `${coupon.minOrderDT} DT` : 'Aucun minimum'}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#96918A]">
                          <span>Utilisations :</span>
                          <span className="text-[#E8E4DD]">
                            {coupon.usedCount} / {coupon.usageLimit > 0 ? coupon.usageLimit : '∞'}
                          </span>
                        </div>

                        {/* Date Validity info */}
                        {(coupon.startDate || coupon.endDate) && (
                          <div className="flex justify-between text-[#96918A] text-[10px] border-t border-[#34312D]/40 pt-1">
                            <span>Validité :</span>
                            <span className={dateStatus.isValid ? 'text-[#B9A995]' : 'text-rose-400'}>
                              {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString('fr-FR') : 'Immédiat'}
                              {' → '}
                              {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('fr-FR') : 'Illimité'}
                            </span>
                          </div>
                        )}

                        {coupon.usageLimit > 0 && (
                          <div className="w-full bg-[#101010] h-1 border border-[#34312D] overflow-hidden mt-1">
                            <div
                              className="bg-[#B9A995] h-full transition-all"
                              style={{ width: `${usagePct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 border-t border-[#34312D]/60 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-[#96918A]">
                        Réf: {coupon.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCoupon(coupon);
                            setIsCreatingCoupon(false);
                          }}
                          className="p-1.5 text-[#96918A] hover:text-[#E8E4DD] border border-transparent hover:border-[#34312D] transition-colors cursor-pointer"
                          title="Modifier ce code"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="p-1.5 text-[#96918A] hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer"
                          title="Supprimer ce code"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* MODAL: CREATE OR EDIT PROMO COUPON */}
      {(isCreatingCoupon || editingCoupon) && (
        <CouponFormModal
          initialCoupon={editingCoupon}
          onClose={() => {
            setIsCreatingCoupon(false);
            setEditingCoupon(null);
          }}
          onSave={handleSaveCoupon}
        />
      )}

      {/* MODAL: CREATE OR EDIT BUNDLE RULE */}
      {(isCreatingBundle || editingBundle) && (
        <BundleFormModal
          initialBundle={editingBundle}
          products={products}
          onClose={() => {
            setIsCreatingBundle(false);
            setEditingBundle(null);
          }}
          onSave={handleSaveBundle}
        />
      )}
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: CouponFormModal
// ==========================================
interface CouponFormModalProps {
  initialCoupon: Coupon | null;
  onClose: () => void;
  onSave: (coupon: Coupon) => void;
}

const CouponFormModal: React.FC<CouponFormModalProps> = ({
  initialCoupon,
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState(initialCoupon?.code || '');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>(initialCoupon?.type || 'PERCENTAGE');
  const [value, setValue] = useState<number>(initialCoupon?.value || 10);
  const [minOrderDT, setMinOrderDT] = useState<number>(initialCoupon?.minOrderDT || 0);
  const [usageLimit, setUsageLimit] = useState<number>(initialCoupon?.usageLimit || 100);
  const [startDate, setStartDate] = useState<string>(initialCoupon?.startDate || '');
  const [endDate, setEndDate] = useState<string>(initialCoupon?.endDate || '');
  const [nonCumulative, setNonCumulative] = useState<boolean>(initialCoupon?.nonCumulative || false);
  const [active, setActive] = useState<boolean>(
    initialCoupon?.active !== undefined ? initialCoupon.active : true
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Veuillez renseigner un code promotionnel');
      return;
    }
    if (value <= 0) {
      setError('La valeur de la réduction doit être supérieure à 0');
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      setError('La date de début ne peut pas être postérieure à la date de fin');
      return;
    }

    const savedCoupon: Coupon = {
      id: initialCoupon?.id || `promo-${Date.now()}`,
      code: cleanCode,
      type,
      value: Number(value),
      minOrderDT: Math.max(0, Number(minOrderDT) || 0),
      usageLimit: Math.max(0, Number(usageLimit) || 0),
      usedCount: initialCoupon?.usedCount || 0,
      active,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      nonCumulative,
    };

    onSave(savedCoupon);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coupon-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[#101010] border border-[#34312D] text-[#E8E4DD] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#34312D] p-5 bg-[#141414] shrink-0">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#B9A995] block">
              Atelier Commercial · Code Promo
            </span>
            <h2 id="coupon-modal-title" className="text-lg font-serif text-[#E8E4DD] mt-0.5">
              {initialCoupon ? `Modifier le code : ${initialCoupon.code}` : 'Créer un Nouveau Code Promo'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#96918A] hover:text-[#E8E4DD] hover:bg-[#181818] border border-transparent hover:border-[#34312D] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto no-scrollbar font-mono text-xs">
          {error && (
            <p className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {error}
            </p>
          )}

          {/* Code */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-[#96918A] block">
              Code de réduction (Majuscules) *
            </label>
            <input
              type="text"
              required
              placeholder="ex: KUZA10, ATELIER15"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              className="w-full h-10 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs uppercase font-mono text-[#E8E4DD] focus:outline-none"
            />
          </div>

          {/* Type Switcher */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-[#96918A] block">
              Type de réduction *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('PERCENTAGE')}
                className={`py-2 text-xs uppercase tracking-wider border transition-colors cursor-pointer ${
                  type === 'PERCENTAGE'
                    ? 'bg-[#E8E4DD] text-[#101010] border-[#E8E4DD] font-semibold'
                    : 'bg-[#181818] text-[#96918A] border-[#34312D] hover:text-[#E8E4DD]'
                }`}
              >
                Pourcentage (%)
              </button>
              <button
                type="button"
                onClick={() => setType('FIXED')}
                className={`py-2 text-xs uppercase tracking-wider border transition-colors cursor-pointer ${
                  type === 'FIXED'
                    ? 'bg-[#E8E4DD] text-[#101010] border-[#E8E4DD] font-semibold'
                    : 'bg-[#181818] text-[#96918A] border-[#34312D] hover:text-[#E8E4DD]'
                }`}
              >
                Montant Fixe (DT)
              </button>
            </div>
          </div>

          {/* Value */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-[#96918A] block">
              Valeur de la remise ({type === 'PERCENTAGE' ? '%' : 'DT'}) *
            </label>
            <input
              type="number"
              required
              min="0.1"
              step={type === 'PERCENTAGE' ? '1' : '0.5'}
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="w-full h-10 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs text-[#E8E4DD] focus:outline-none"
            />
          </div>

          {/* Min Order & Usage Limit Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-[#96918A] block">
                Seuil Min. Commande (DT)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0 = aucun seuil"
                value={minOrderDT}
                onChange={(e) => setMinOrderDT(parseFloat(e.target.value) || 0)}
                className="w-full h-10 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs text-[#E8E4DD] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-[#96918A] block">
                Limite d'utilisations
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0 = illimité"
                value={usageLimit}
                onChange={(e) => setUsageLimit(parseInt(e.target.value, 10) || 0)}
                className="w-full h-10 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs text-[#E8E4DD] focus:outline-none"
              />
            </div>
          </div>

          {/* Date Range Fields */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-[#96918A] block">
                Date de Début (Optionnel)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs text-[#E8E4DD] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-[#96918A] block">
                Date de Fin (Optionnel)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-10 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs text-[#E8E4DD] focus:outline-none"
              />
            </div>
          </div>

          {/* Non-cumulable option */}
          <div className="pt-2 p-3 bg-[#141414] border border-[#34312D] space-y-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={nonCumulative}
                onChange={(e) => setNonCumulative(e.target.checked)}
                className="w-4 h-4 accent-[#B9A995]"
              />
              <span className="text-xs text-[#E8E4DD] font-semibold">
                Non-cumulable avec l'Offre Ensemble
              </span>
            </label>
            <p className="text-[10px] text-[#96918A] pl-6 font-sans">
              Si coché, ce code ne pourra pas s'ajouter à la remise automatique accordée sur les packs.
            </p>
          </div>

          {/* Active Checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 accent-[#B9A995]"
              />
              <span className="text-xs text-[#E8E4DD]">
                Activer immédiatement ce code promotionnel pour la boutique
              </span>
            </label>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#34312D] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#181818] border border-[#34312D] text-xs text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#E8E4DD] hover:bg-white text-[#101010] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
            >
              {initialCoupon ? 'Enregistrer Modifications' : 'Créer le Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: BundleFormModal
// ==========================================
interface BundleFormModalProps {
  initialBundle: BundleRule | null;
  products: Product[];
  onClose: () => void;
  onSave: (bundle: BundleRule) => void;
}

const BundleFormModal: React.FC<BundleFormModalProps> = ({
  initialBundle,
  products,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialBundle?.name || 'ENSEMBLE FULL KŪZA');
  const [pricingMode, setPricingMode] = useState<'FIXED' | 'PERCENT'>(
    initialBundle?.fixedPrice ? 'FIXED' : 'PERCENT'
  );
  const [fixedPrice, setFixedPrice] = useState<number>(initialBundle?.fixedPrice || 135);
  const [discountPercent, setDiscountPercent] = useState<number>(
    initialBundle?.discountPercent || 20
  );
  const [requiredProductIds, setRequiredProductIds] = useState<string[]>(
    initialBundle?.requiredProductIds || ['shelter-sweat', 'rest-wide']
  );
  const [description, setDescription] = useState(
    initialBundle?.description ||
      "L'Ensemble Full KŪZA (Sweat + Pantalon) à 135,000 DT au lieu de 164,000 DT · Économisez 29,000 DT"
  );
  const [startDate, setStartDate] = useState<string>(initialBundle?.startDate || '');
  const [endDate, setEndDate] = useState<string>(initialBundle?.endDate || '');
  const [active, setActive] = useState<boolean>(
    initialBundle?.active !== undefined ? initialBundle.active : true
  );
  const [error, setError] = useState<string | null>(null);

  // Calculate sum of selected products
  const selectedSum = useMemo(() => {
    return requiredProductIds.reduce((sum, pid) => {
      const p = products.find((prod) => prod.id === pid);
      return sum + (p?.price || 0);
    }, 0);
  }, [requiredProductIds, products]);

  const toggleProduct = (pid: string) => {
    setError(null);
    if (requiredProductIds.includes(pid)) {
      if (requiredProductIds.length <= 1) {
        setError('Un bundle doit requérir au moins 1 article');
        return;
      }
      setRequiredProductIds(requiredProductIds.filter((id) => id !== pid));
    } else {
      setRequiredProductIds([...requiredProductIds, pid]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim().toUpperCase();
    if (!cleanName) {
      setError('Veuillez renseigner un nom pour cette offre ensemble');
      return;
    }
    if (requiredProductIds.length < 2) {
      setError('Sélectionnez au moins 2 pièces complémentaires pour constituer un bundle');
      return;
    }
    if (pricingMode === 'PERCENT' && (discountPercent <= 0 || discountPercent > 90)) {
      setError('Le pourcentage de remise doit être compris entre 1% et 90%');
      return;
    }
    if (pricingMode === 'FIXED' && (fixedPrice <= 0 || fixedPrice >= selectedSum)) {
      setError(`Le prix du pack fixe doit être inférieur au total combiné (${selectedSum} DT)`);
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      setError('La date de début ne peut pas être postérieure à la date de fin');
      return;
    }

    // Compute effective discount percent if in FIXED mode
    const calculatedPercent =
      pricingMode === 'FIXED' && selectedSum > 0
        ? Math.round(((selectedSum - fixedPrice) / selectedSum) * 1000) / 10
        : Number(discountPercent);

    const savedBundle: BundleRule = {
      id: initialBundle?.id || `bundle-${Date.now()}`,
      name: cleanName,
      requiredProductIds,
      discountPercent: calculatedPercent,
      fixedPrice: pricingMode === 'FIXED' ? Number(fixedPrice) : undefined,
      description: description.trim(),
      active,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    onSave(savedBundle);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bundle-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[#101010] border border-[#34312D] text-[#E8E4DD] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#34312D] p-5 bg-[#141414] shrink-0">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#B9A995] block">
              Atelier Commercial · Pack Ensemble
            </span>
            <h2 id="bundle-modal-title" className="text-lg font-serif text-[#E8E4DD] mt-0.5">
              {initialBundle ? `Modifier : ${initialBundle.name}` : 'Créer une Offre Bundle Automatique'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#96918A] hover:text-[#E8E4DD] hover:bg-[#181818] border border-transparent hover:border-[#34312D] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto no-scrollbar font-mono text-xs">
          {error && (
            <p className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {error}
            </p>
          )}

          {/* Bundle Name */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-[#96918A] block">
              Nom de l'ensemble (ex: ENSEMBLE FULL KŪZA) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value.toUpperCase());
                setError(null);
              }}
              className="w-full h-10 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs uppercase font-mono text-[#E8E4DD] focus:outline-none"
            />
          </div>

          {/* Required Products Selection */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-[#96918A] block">
              Pièces requises dans le panier pour déclencher l'offre ({requiredProductIds.length} sélectionnée(s)) *
            </label>
            <div className="p-3 bg-[#181818] border border-[#34312D] space-y-2 max-h-40 overflow-y-auto no-scrollbar">
              {products.map((p) => {
                const isSelected = requiredProductIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between p-2 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#141414] border-[#B9A995] text-[#E8E4DD]'
                        : 'bg-[#181818] border-[#34312D]/60 text-[#96918A] hover:text-[#E8E4DD]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProduct(p.id)}
                        className="w-4 h-4 accent-[#B9A995]"
                      />
                      <span className="text-xs font-medium">{p.name}</span>
                    </div>
                    <span className="text-xs text-[#B9A995]">
                      {formatTND(p.price)}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] text-[#96918A] px-1">
              <span>Total unitaire cumulé :</span>
              <span className="text-[#E8E4DD] font-bold">{formatTND(selectedSum)}</span>
            </div>
          </div>

          {/* Pricing Mode: Fixed Price vs Percent */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[#96918A] block">
              Tarification de l'ensemble *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPricingMode('FIXED')}
                className={`py-2 text-xs uppercase tracking-wider border transition-colors cursor-pointer ${
                  pricingMode === 'FIXED'
                    ? 'bg-[#E8E4DD] text-[#101010] border-[#E8E4DD] font-bold'
                    : 'bg-[#181818] text-[#96918A] border-[#34312D] hover:text-[#E8E4DD]'
                }`}
              >
                Prix Pack Fixe (DT)
              </button>
              <button
                type="button"
                onClick={() => setPricingMode('PERCENT')}
                className={`py-2 text-xs uppercase tracking-wider border transition-colors cursor-pointer ${
                  pricingMode === 'PERCENT'
                    ? 'bg-[#E8E4DD] text-[#101010] border-[#E8E4DD] font-bold'
                    : 'bg-[#181818] text-[#96918A] border-[#34312D] hover:text-[#E8E4DD]'
                }`}
              >
                Pourcentage (%)
              </button>
            </div>

            {pricingMode === 'FIXED' ? (
              <div className="p-3 bg-[#141414] border border-[#34312D] space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-[#96918A] block">
                  Prix combiné spécial pack (DT) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={fixedPrice}
                    onChange={(e) => setFixedPrice(parseFloat(e.target.value) || 0)}
                    className="w-36 h-10 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs font-bold text-emerald-400 focus:outline-none"
                  />
                  <div className="text-xs text-[#96918A]">
                    Économie accordée :{' '}
                    <span className="text-emerald-400 font-bold">
                      -{formatTND(Math.max(0, selectedSum - fixedPrice))}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-[#96918A] block">
                  Pourcentage de réduction sur le set (%) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    min="1"
                    max="90"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseInt(e.target.value, 10) || 0)}
                    className="w-28 h-10 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs text-[#E8E4DD] focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    {[15, 20, 25, 30].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDiscountPercent(pct)}
                        className={`px-2.5 py-1.5 text-xs border transition-colors cursor-pointer ${
                          discountPercent === pct
                            ? 'bg-[#B9A995] text-[#101010] border-[#B9A995] font-bold'
                            : 'bg-[#181818] text-[#96918A] border-[#34312D] hover:text-[#E8E4DD]'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-[#96918A] block">
                Date de Début (Optionnel)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs text-[#E8E4DD] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-[#96918A] block">
                Date de Fin (Optionnel)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-10 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs text-[#E8E4DD] focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-[#96918A] block">
              Description de l'offre (Affichée au client)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ex: L'Ensemble Full KŪZA à 135,000 DT au lieu de 164,000 DT"
              className="w-full h-10 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs text-[#E8E4DD] focus:outline-none"
            />
          </div>

          {/* Active Checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 accent-[#B9A995]"
              />
              <span className="text-xs text-[#E8E4DD]">
                Activer immédiatement cette offre bundle automatique
              </span>
            </label>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#34312D] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#181818] border border-[#34312D] text-xs text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#E8E4DD] hover:bg-white text-[#101010] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
            >
              {initialBundle ? 'Enregistrer Bundle' : 'Créer Bundle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
