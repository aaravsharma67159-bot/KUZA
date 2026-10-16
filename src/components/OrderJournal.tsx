import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Printer,
  CheckSquare,
  Square,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  FileSpreadsheet,
  X,
  QrCode,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  PackageCheck,
  ChevronDown,
  XCircle,
} from 'lucide-react';
import { OrderDetails, LogisticsStatus } from '../types';
import { formatTND } from '../utils/currency';
import { PrintableBordereauModal, PrintableOrderModel } from './PrintableBordereauModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';

interface OrderJournalProps {
  orders: OrderDetails[];
  onUpdateOrderStatus: (orderId: string, newStatus: string) => void;
  onOpenDirectSaleModal?: () => void;
  showNotice: (msg: string) => void;
}

// Convert raw ISO string to readable French format: 06 Oct 2026 à 08:15
export function formatOrderDate(dateStr: string): string {
  if (!dateStr) return 'Date inconnue';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Août',
      'Sep',
      'Oct',
      'Nov',
      'Déc',
    ];
    const month = months[d.getMonth()] || '';
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} à ${hours}:${mins}`;
  } catch {
    return dateStr;
  }
}

export const OrderJournal: React.FC<OrderJournalProps> = ({
  orders,
  onUpdateOrderStatus,
  onOpenDirectSaleModal,
  showNotice,
}) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'amount-desc' | 'amount-asc'>('recent');

  // Checkbox multi-selection for bulk courier actions
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Cash remittance tracking state: [orderId]: boolean (true = Fond versé à l'atelier, false = En attente)
  const [remittanceState, setRemittanceState] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('kuza_cod_remittance');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Thermal 80mm Slip Modal state (Single or Batch Queue)
  const [thermalSlipOrder, setThermalSlipOrder] = useState<OrderDetails | null>(null);
  const [batchThermalOrders, setBatchThermalOrders] = useState<OrderDetails[] | null>(null);

  // Active filters detection
  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all' || sortBy !== 'recent';

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('recent');
    showNotice('Filtres réinitialisés');
  };

  const handleBatchPrint = () => {
    const selectedOrders = orders.filter((o) => selectedOrderIds.includes(o.orderId || o.id || ''));
    if (selectedOrders.length === 0) {
      showNotice('Sélectionnez au moins une commande à imprimer');
      return;
    }
    setBatchThermalOrders(selectedOrders);
  };

  // Bordereau Modal for batch print
  const [bordereauOrder, setBordereauOrder] = useState<PrintableOrderModel | null>(null);

  // Toggle single order selection
  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Toggle select all
  const toggleSelectAll = (filteredIds: string[]) => {
    if (selectedOrderIds.length === filteredIds.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredIds);
    }
  };

  // Toggle COD Remittance status
  const handleToggleRemittance = (orderId: string) => {
    const nextVal = !remittanceState[orderId];
    const updated = { ...remittanceState, [orderId]: nextVal };
    setRemittanceState(updated);
    try {
      localStorage.setItem('kuza_cod_remittance', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    showNotice(
      nextVal
        ? `Commande ${orderId} : Fond encaissé versé à l'atelier`
        : `Commande ${orderId} : En attente de virement livreur`
    );
  };

  // Export Tunisian Courier Manifest CSV
  const handleExportCourierManifest = () => {
    const exportList =
      selectedOrderIds.length > 0
        ? orders.filter((o) => selectedOrderIds.includes(o.orderId || o.id || ''))
        : orders;

    if (exportList.length === 0) {
      showNotice('Aucune commande à exporter');
      return;
    }

    const headers = [
      'N_COMMANDE',
      'DESTINATAIRE',
      'TELEPHONE',
      'GOUVERNORAT',
      'ADRESSE_COMPLETE',
      'MONTANT_COD_DT',
      'STATUT',
      'REMISE_EN_CAISSE',
      'DATE_COMMANDE',
    ];

    const rows = exportList.map((ord) => {
      const id = ord.orderId || ord.id || '';
      const remitted = remittanceState[id] ? 'VERSÉ' : 'EN_ATTENTE';
      return [
        `"${id}"`,
        `"${(ord.customerName || '').replace(/"/g, '""')}"`,
        `"${ord.phone || ''}"`,
        `"${ord.governorate || ''}"`,
        `"${(ord.address || '').replace(/"/g, '""')}"`,
        (ord.total || 0).toFixed(3),
        `"${ord.status || 'Reçue'}"`,
        `"${remitted}"`,
        `"${ord.createdAt || ''}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `KUZA_MANIFESTE_LIVREUR_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotice(`Manifeste de ${exportList.length} commande(s) exporté en CSV`);
  };

  // Batch Print Selected Bordereaux
  const handlePrintSelected = () => {
    if (selectedOrderIds.length === 0) {
      showNotice('Veuillez sélectionner au moins une commande à imprimer');
      return;
    }
    const targetOrder = orders.find((o) => selectedOrderIds.includes(o.orderId || o.id || ''));
    if (!targetOrder) return;

    const printable: PrintableOrderModel = {
      id: targetOrder.orderId || targetOrder.id || '',
      orderId: targetOrder.orderId || targetOrder.id || '',
      createdAt: targetOrder.createdAt,
      date: targetOrder.createdAt,
      client: {
        name: targetOrder.customerName,
        phone: targetOrder.phone,
        address: targetOrder.address,
        governorate: targetOrder.governorate,
      },
      customerName: targetOrder.customerName,
      phone: targetOrder.phone,
      address: targetOrder.address,
      governorate: targetOrder.governorate,
      deliveryNotes: targetOrder.deliveryNotes,
      subtotal: targetOrder.subtotal,
      shipping: targetOrder.shipping || 8,
      shippingFee: targetOrder.shipping || 8,
      total: targetOrder.total,
      totalAmount: targetOrder.total,
      items: targetOrder.items.map((it) => ({
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

    setBordereauOrder(printable);
  };

  // Filter & Sort
  const filteredOrders = useMemo(() => {
    return orders
      .filter((ord) => {
        const id = ord.orderId || ord.id || '';
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchId = id.toLowerCase().includes(q);
          const matchClient = (ord.customerName || '').toLowerCase().includes(q);
          const matchPhone = (ord.phone || '').includes(q);
          const matchGov = (ord.governorate || '').toLowerCase().includes(q);
          const matchAddr = (ord.address || '').toLowerCase().includes(q);
          if (!matchId && !matchClient && !matchPhone && !matchGov && !matchAddr) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== 'all') {
          const st = (ord.status || '').toLowerCase();
          if (statusFilter === 'preparation' && !st.includes('préparation')) return false;
          if (statusFilter === 'expedie' && !st.includes('expédiée')) return false;
          if (statusFilter === 'livre' && !st.includes('livrée')) return false;
          if (statusFilter === 'annule' && !st.includes('annulée') && !st.includes('refus')) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'amount-desc') {
          return (b.total || 0) - (a.total || 0);
        }
        if (sortBy === 'amount-asc') {
          return (a.total || 0) - (b.total || 0);
        }
        return 0;
      });
  }, [orders, searchQuery, statusFilter, sortBy]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: orders.length,
      preparation: orders.filter((o) => (o.status || '').toLowerCase().includes('préparation')).length,
      expedie: orders.filter((o) => (o.status || '').toLowerCase().includes('expédiée')).length,
      livre: orders.filter((o) => (o.status || '').toLowerCase().includes('livrée')).length,
      annule: orders.filter(
        (o) => (o.status || '').toLowerCase().includes('annulée') || (o.status || '').toLowerCase().includes('refus')
      ).length,
    };
  }, [orders]);

  const allFilteredIds = filteredOrders.map((o) => o.orderId || o.id || '');
  const allSelected = allFilteredIds.length > 0 && selectedOrderIds.length === allFilteredIds.length;

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & COURIER ACTIONS */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#34312D] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#B9A995] bg-[#141414] border border-[#34312D] px-2 py-0.5">
              LOGISTIQUE & EXPÉDITIONS
            </span>
            <span className="text-xs font-mono text-[#96918A]">
              · {orders.length} commande{orders.length > 1 ? 's' : ''} au journal
            </span>
          </div>
          <h2
            className="text-2xl font-serif text-[#E8E4DD] mt-1"
            style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
          >
            Journal des Commandes & Manifeste Livreur
          </h2>
          <p className="text-xs text-[#96918A] font-light mt-0.5">
            Suivi des expéditions en contre-remboursement (Cash on Delivery), encaissements et génération de bordereaux.
          </p>
        </div>

        {/* Action Toolbar: CSV Export + Print Slips */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {onOpenDirectSaleModal && (
            <button
              type="button"
              onClick={onOpenDirectSaleModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm whitespace-nowrap"
              title="Enregistrer un retrait direct ou une vente en main propre à l'atelier"
            >
              <span>+ NOUVELLE VENTE DIRECTE (MAIN PROPRE)</span>
            </button>
          )}

          <button
            onClick={handleExportCourierManifest}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-[#E8E4DD] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
            title="Exporter les informations clients et montants COD pour les agences de livraison"
          >
            <FileSpreadsheet className="w-4 h-4 stroke-[2.2]" />
            <span>EXPORTER MANIFESTE LIVREUR (CSV)</span>
          </button>

          <button
            onClick={handlePrintSelected}
            disabled={selectedOrderIds.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#181818] border border-[#B9A995]/60 hover:border-[#B9A995] text-[#E8E4DD] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Imprimer les bordereaux officiels pour les commandes cochées"
          >
            <Printer className="w-3.5 h-3.5 text-[#B9A995]" />
            <span>
              IMPRIMER SÉLECTIONNÉS ({selectedOrderIds.length})
            </span>
          </button>
        </div>
      </div>

      {/* 2. ORDER SEARCH & STATUS FILTER TOOLBAR */}
      <div className="p-4 bg-[#141414] border border-[#34312D] space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input & Filter Reset Button */}
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#96918A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par N° commande (KZ-8682), Client, Téléphone, Ville..."
                className="w-full pl-10 pr-9 py-2 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] text-xs text-[#E8E4DD] placeholder-[#96918A]/60 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#96918A] hover:text-[#E8E4DD] p-0.5"
                  title="Effacer la recherche"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono text-[#B9A995] hover:text-[#E8E4DD] transition-colors cursor-pointer shrink-0"
                title="Réinitialiser tous les filtres"
              >
                <XCircle className="w-4 h-4 cursor-pointer text-[#B9A995]" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>

          {/* Sort Dropdown & Direct Sale Button */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <span className="text-xs font-mono text-[#96918A] uppercase tracking-wider shrink-0 hidden sm:inline">
              Trier par :
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#181818] border border-[#34312D] text-xs font-mono text-[#E8E4DD] px-3 py-2 focus:border-[#B9A995] focus:outline-none cursor-pointer"
            >
              <option value="recent">⏱️ Plus récents</option>
              <option value="amount-desc">💎 Montant élevé</option>
              <option value="amount-asc">💵 Montant modéré</option>
            </select>

            {onOpenDirectSaleModal && (
              <button
                type="button"
                onClick={onOpenDirectSaleModal}
                className="px-3.5 py-2 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                title="Enregistrer un retrait direct ou une vente en main propre à l'atelier"
              >
                <span>+ NOUVELLE VENTE DIRECTE (REMISE EN MAIN PROPRE)</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs & Multi-Select Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#34312D]/60">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs font-mono transition-colors cursor-pointer shrink-0 border ${
                statusFilter === 'all'
                  ? 'bg-[#E8E4DD] text-[#101010] border-[#E8E4DD] font-semibold'
                  : 'bg-[#181818] text-[#96918A] border-[#34312D] hover:border-[#96918A] hover:text-[#E8E4DD]'
              }`}
            >
              Toutes ({counts.all})
            </button>

            <button
              onClick={() => setStatusFilter('preparation')}
              className={`px-3 py-1 text-xs font-mono transition-colors cursor-pointer shrink-0 border ${
                statusFilter === 'preparation'
                  ? 'bg-[#E8E4DD] text-[#101010] border-[#E8E4DD] font-semibold'
                  : 'bg-[#181818] text-[#96918A] border-[#34312D] hover:border-[#96918A] hover:text-[#E8E4DD]'
              }`}
            >
              En préparation ({counts.preparation})
            </button>

            <button
              onClick={() => setStatusFilter('expedie')}
              className={`px-3 py-1 text-xs font-mono transition-colors cursor-pointer shrink-0 border ${
                statusFilter === 'expedie'
                  ? 'bg-[#B9A995] text-[#101010] border-[#B9A995] font-semibold'
                  : 'bg-[#181818] text-[#B9A995] border-[#34312D] hover:border-[#B9A995]'
              }`}
            >
              Expédiées ({counts.expedie})
            </button>

            <button
              onClick={() => setStatusFilter('livre')}
              className={`px-3 py-1 text-xs font-mono transition-colors cursor-pointer shrink-0 border ${
                statusFilter === 'livre'
                  ? 'bg-emerald-400 text-[#101010] border-emerald-400 font-semibold'
                  : 'bg-[#181818] text-emerald-400/90 border-[#34312D] hover:border-emerald-500/50'
              }`}
            >
              Livrées ({counts.livre})
            </button>

            <button
              onClick={() => setStatusFilter('annule')}
              className={`px-3 py-1 text-xs font-mono transition-colors cursor-pointer shrink-0 border ${
                statusFilter === 'annule'
                  ? 'bg-rose-500 text-white border-rose-500 font-semibold'
                  : 'bg-[#181818] text-rose-400/90 border-[#34312D] hover:border-rose-400'
              }`}
            >
              Annulées ({counts.annule})
            </button>
          </div>

          {/* Select all toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleSelectAll(allFilteredIds)}
              className="flex items-center gap-1.5 text-xs font-mono text-[#96918A] hover:text-[#E8E4DD] cursor-pointer"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-[#B9A995]" />
              ) : (
                <Square className="w-4 h-4 text-[#96918A]" />
              )}
              <span>Sélectionner tout ({filteredOrders.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Batch Action Toolbar */}
      {selectedOrderIds.length > 0 && (
        <div className="p-3.5 bg-[#151515] border border-[#B9A995] flex flex-wrap items-center justify-between gap-3 animate-fade-in shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#E8E4DD] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B9A995] animate-pulse" />
              <span>{selectedOrderIds.length} commande(s) sélectionnée(s)</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              className="text-[11px] font-mono text-[#96918A] hover:text-[#E8E4DD] underline cursor-pointer"
            >
              Désélectionner tout
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleBatchPrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
              title="Générer une file d'impression 80mm continue pour tous les slips sélectionnés"
            >
              <Printer className="w-4 h-4" />
              <span>IMPRIMER SÉLECTIONNÉS ({selectedOrderIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. ORDER CARDS LIST */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 bg-[#181818] border border-[#34312D] text-center space-y-3">
          <p className="text-sm font-mono text-[#96918A]">
            Aucune commande ne correspond aux filtres appliqués.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="px-4 py-2 bg-[#141414] border border-[#34312D] text-xs font-mono text-[#E8E4DD] hover:border-[#B9A995]"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((ord) => {
            const orderId = ord.orderId || ord.id || 'KZ-COMMANDE';
            const isSelected = selectedOrderIds.includes(orderId);
            const isRemitted = !!remittanceState[orderId];
            const readableDate = formatOrderDate(ord.createdAt);

            return (
              <div
                key={orderId}
                className={`p-5 sm:p-6 bg-[#181818] border transition-all flex flex-col justify-between space-y-4 hover:border-[#B9A995]/60 ${
                  isSelected ? 'border-[#B9A995] ring-1 ring-[#B9A995]/50' : 'border-[#34312D]'
                }`}
              >
                <div>
                  {/* Top Row: Checkbox, Order ID, Date, and Status */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#34312D]">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSelectOrder(orderId)}
                        className="text-[#96918A] hover:text-[#E8E4DD] cursor-pointer"
                        title="Sélectionner pour export / impression groupée"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#B9A995]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#96918A]" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-mono font-bold text-[#E8E4DD]">
                            {orderId}
                          </span>
                          <span className="text-[10px] font-mono text-[#B9A995] bg-[#141414] border border-[#34312D] px-1.5 py-0.5">
                            COD
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#96918A] font-mono mt-0.5">
                          <Calendar className="w-3 h-3 text-[#96918A]" />
                          <span>{readableDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Select & Visual Badge */}
                    <div className="flex flex-col items-end gap-1.5">
                      <select
                        value={ord.status || 'Commande reçue'}
                        onChange={(e) => onUpdateOrderStatus(orderId, e.target.value)}
                        className="bg-[#141414] border border-[#34312D] text-[#E8E4DD] text-xs font-mono px-2.5 py-1 focus:border-[#B9A995] focus:outline-none cursor-pointer"
                      >
                        <option value="Commande reçue">1. Commande reçue</option>
                        <option value="Confirmation en cours">2. Confirmation en cours</option>
                        <option value="Commande confirmée">3. Commande confirmée</option>
                        <option value="En préparation">4. En préparation</option>
                        <option value="Expédiée">5. Expédiée</option>
                        <option value="Livrée">6. Livrée (Encaissé)</option>
                        <option value="Annulée">7. Annulée</option>
                      </select>

                      <span
                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border font-mono ${
                          ord.status === 'Livrée'
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                            : ord.status === 'Expédiée'
                            ? 'border-[#B9A995] text-[#B9A995] bg-[#B9A995]/10'
                            : ord.status === 'Annulée'
                            ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                            : 'border-[#34312D] text-[#96918A]'
                        }`}
                      >
                        {ord.status || 'Commande reçue'}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Shipping Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3.5 text-xs border-b border-[#34312D]/60">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#96918A] block">
                        Destinataire & Contact :
                      </span>
                      <div className="text-sm font-semibold text-[#E8E4DD] mt-1">
                        {ord.customerName}
                      </div>
                      <div className="flex items-center gap-1.5 text-[#B9A995] font-mono mt-1">
                        <Phone className="w-3.5 h-3.5" />
                        <a href={`tel:${ord.phone}`} className="hover:underline">
                          {ord.phone}
                        </a>
                      </div>
                      <div className="flex items-start gap-1.5 text-[#96918A] mt-1.5 font-light">
                        <MapPin className="w-3.5 h-3.5 text-[#96918A] shrink-0 mt-0.5" />
                        <span>
                          {ord.governorate} — {ord.address}
                        </span>
                      </div>
                      {ord.deliveryNotes && (
                        <div className="mt-2 text-[11px] text-[#B9A995] bg-[#141414] p-1.5 border border-[#34312D]/50 italic">
                          Note : {ord.deliveryNotes}
                        </div>
                      )}
                    </div>

                    {/* Ordered Items Breakdown */}
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#96918A] block">
                        Pièces Préparées ({ord.items.reduce((s, i) => s + i.quantity, 0)} pcs) :
                      </span>
                      <div className="space-y-1.5 mt-1 max-h-32 overflow-y-auto no-scrollbar">
                        {ord.items.map((it) => (
                          <div
                            key={it.id}
                            className="p-1.5 bg-[#141414] border border-[#34312D]/50 flex items-center justify-between text-xs"
                          >
                            <span className="truncate pr-2 text-[#E8E4DD]">
                              <strong>{it.quantity}x</strong> {it.product.name} ({it.selectedColor.name} · {it.selectedSize})
                            </span>
                            <span className="font-mono text-[#B9A995] shrink-0 tabular-nums">
                              {formatTND(it.product.price * it.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total Amount in IBM Plex Mono */}
                      <div className="mt-3 pt-2 border-t border-[#34312D]/60 flex items-center justify-between font-mono">
                        <span className="text-[11px] text-[#96918A] uppercase">Net à payer :</span>
                        <span className="text-base font-bold text-[#E8E4DD] tabular-nums">
                          {formatTND(ord.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4. CASH COLLECTION TRACKING (COD STATUS REMITTANCE) */}
                  <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#E8E4DD] bg-[#141414] border border-[#34312D] px-2.5 py-1">
                        💳 Cash à encaisser : <strong>{formatTND(ord.total)}</strong>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleRemittance(orderId)}
                        className={`px-2.5 py-1 text-xs font-mono border transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isRemitted
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                            : 'border-amber-400/40 bg-amber-400/10 text-amber-300 hover:border-amber-400'
                        }`}
                        title="Cliquer pour basculer le statut d'encaissement"
                      >
                        {isRemitted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>✅ Fond versé à l'atelier</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-300" />
                            <span>⏳ En attente de virement livreur</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick Thermal Printing Slip Button */}
                    <button
                      type="button"
                      onClick={() => setThermalSlipOrder(ord)}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#B9A995] hover:bg-[#E8E4DD] text-[#101010] text-xs font-mono font-bold uppercase transition-colors cursor-pointer shadow-sm"
                      title="Ouvrir l'aperçu du ticket de caisse thermique 80mm"
                    >
                      <Printer className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>🖨️ IMPRIMER SLIP</span>
                    </button>
                  </div>
                </div>

                {/* Logistics Quick Actions Buttons Row */}
                <div className="pt-2 border-t border-[#34312D]/60 flex items-center gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(orderId, 'En préparation')}
                    className="flex-1 py-1.5 bg-[#141414] border border-[#34312D] hover:border-[#B9A995] text-[#96918A] hover:text-[#E8E4DD] text-[10px] uppercase tracking-wider transition-colors cursor-pointer text-center"
                  >
                    En préparation
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(orderId, 'Expédiée')}
                    className="flex-1 py-1.5 bg-[#141414] border border-[#34312D] hover:border-[#B9A995] text-[#96918A] hover:text-[#E8E4DD] text-[10px] uppercase tracking-wider transition-colors cursor-pointer text-center"
                  >
                    Remis Livreur
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(orderId, 'Livrée')}
                    className="flex-1 py-1.5 bg-[#141414] border border-[#34312D] hover:border-emerald-500 text-emerald-400/80 hover:text-emerald-400 text-[10px] uppercase tracking-wider transition-colors cursor-pointer text-center"
                  >
                    Livrée & Encaissé
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. THERMAL PRINTING PREVIEW MODAL (Single Slip or Batch Continuous Queue) */}
      {(thermalSlipOrder || batchThermalOrders) && (
        <ThermalReceiptModal
          order={thermalSlipOrder || undefined}
          orders={batchThermalOrders || undefined}
          onClose={() => {
            setThermalSlipOrder(null);
            setBatchThermalOrders(null);
          }}
        />
      )}

      {/* Official Bordereau Modal for Print */}
      {bordereauOrder && (
        <PrintableBordereauModal
          order={bordereauOrder}
          onClose={() => setBordereauOrder(null)}
        />
      )}
    </div>
  );
};

export default OrderJournal;
