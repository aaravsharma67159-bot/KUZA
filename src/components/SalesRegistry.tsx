import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  RefreshCw,
  Receipt,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  Search,
  Filter,
  TrendingUp,
  Download,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { OrderDetails, SalesTransaction } from '../types';
import { formatTND } from '../utils/currency';
import { InvoiceModal } from './InvoiceModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { PrintableOrderModel } from './PrintableBordereauModal';

export interface SalesRegistryProps {
  orders?: OrderDetails[];
  salesHistory?: SalesTransaction[];
  onOpenSlipModal?: (order: any) => void;
  onOpenInvoiceModal?: (order: any) => void;
  onOpenDirectSaleModal?: () => void;
  showNotice?: (msg: string) => void;
}

interface RegistryRowItem {
  id: string;
  orderId: string;
  dateStr: string;
  customerName: string;
  destination: string;
  phone: string;
  itemsSpec: string;
  itemsNote: string;
  totalTTC: number;
  subtotal: number;
  shipping: number;
  fiscalStatus: 'ENCAISSÉ COD' | 'VIREMENT BIAT' | 'TRANSIT COD' | 'LIVRÉE' | 'EN PRÉPARATION';
  rawOrder?: any;
}

const DEFAULT_REGISTRY_ROWS: RegistryRowItem[] = [
  {
    id: 'KZ-8682',
    orderId: 'KZ-8682',
    dateStr: '05/10/2026 · 14:30',
    customerName: 'Ines Chaabane',
    destination: 'Corniche, Bizerte (7000)',
    phone: '+216 92 654 321',
    itemsSpec: '1× Shelter Sweat (Noir Minéral · XS)',
    itemsNote: 'Port Express Sécurisé Inclus (Circuit Court)',
    totalTTC: 87.0,
    subtotal: 79.0,
    shipping: 8.0,
    fiscalStatus: 'ENCAISSÉ COD',
    rawOrder: {
      orderId: 'KZ-8682',
      customerName: 'Ines Chaabane',
      phone: '+216 92 654 321',
      address: 'Corniche de Bizerte, Résidence Émeraude',
      governorate: 'Bizerte',
      date: '05/10/2026 — 14:30:00',
      total: 87.0,
      subtotal: 79.0,
      shipping: 8.0,
      items: [
        {
          name: 'SHELTER SWEAT — 290 GSM',
          selectedColor: { name: 'Noir Minéral' },
          selectedSize: 'XS',
          quantity: 1,
          unitPrice: 79.0,
        },
      ],
    },
  },
  {
    id: 'KZ-8681',
    orderId: 'KZ-8681',
    dateStr: '05/10/2026 · 11:15',
    customerName: 'Youssef Ben Mahmoud',
    destination: 'Les Berges du Lac II, Tunis',
    phone: '+216 98 112 233',
    itemsSpec: '1× Pantalon Monolithe (Laine & Soie · 42)',
    itemsNote: 'Retrait المخزن / Main Propre',
    totalTTC: 195.0,
    subtotal: 195.0,
    shipping: 0.0,
    fiscalStatus: 'VIREMENT BIAT',
    rawOrder: {
      orderId: 'KZ-8681',
      customerName: 'Youssef Ben Mahmoud',
      phone: '+216 98 112 233',
      address: 'Avenue de la Bourse, Les Berges du Lac II',
      governorate: 'Tunis',
      date: '05/10/2026 — 11:15:00',
      total: 195.0,
      subtotal: 195.0,
      shipping: 0.0,
      items: [
        {
          name: 'PANTALON MONOLITHE ARCHIVALE',
          selectedColor: { name: 'Laine & Soie Anthracite' },
          selectedSize: '42',
          quantity: 1,
          unitPrice: 195.0,
        },
      ],
    },
  },
  {
    id: 'KZ-8680',
    orderId: 'KZ-8680',
    dateStr: '04/10/2026 · 17:40',
    customerName: 'Amine Slim',
    destination: 'Route Touristique, Sousse',
    phone: '+216 22 445 566',
    itemsSpec: '2× T-Shirt Lin Lourd Saharien (Sable · M)',
    itemsNote: 'Livraison Express COD',
    totalTTC: 142.0,
    subtotal: 134.0,
    shipping: 8.0,
    fiscalStatus: 'TRANSIT COD',
    rawOrder: {
      orderId: 'KZ-8680',
      customerName: 'Amine Slim',
      phone: '+216 22 445 566',
      address: 'Résidence Les Palmiers, Route Touristique',
      governorate: 'Sousse',
      date: '04/10/2026 — 17:40:00',
      total: 142.0,
      subtotal: 134.0,
      shipping: 8.0,
      items: [
        {
          name: 'T-SHIRT LIN LOURD SAHARIEN',
          selectedColor: { name: 'Sable Désert' },
          selectedSize: 'M',
          quantity: 2,
          unitPrice: 67.0,
        },
      ],
    },
  },
];

export const SalesRegistry: React.FC<SalesRegistryProps> = ({
  orders = [],
  salesHistory = [],
  onOpenSlipModal,
  onOpenInvoiceModal,
  onOpenDirectSaleModal,
  showNotice,
}) => {
  // Modal states
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
  const [selectedThermalOrder, setSelectedThermalOrder] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Combine default certified rows with any dynamic orders
  const combinedRows = useMemo(() => {
    const list: RegistryRowItem[] = [...DEFAULT_REGISTRY_ROWS];

    orders.forEach((ord) => {
      // Prevent duplicates of hardcoded demo orders
      if (list.some((r) => r.orderId === ord.orderId)) return;

      const dateStr = ord.createdAt
        ? new Date(ord.createdAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }) +
          ' · ' +
          new Date(ord.createdAt).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Récemment';

      const itemsSpec = ord.items
        .map((it) => `${it.quantity}× ${it.product.name} (${it.selectedColor.name} · ${it.selectedSize})`)
        .join(', ');

      const fiscalStatus =
        ord.status === 'Livrée'
          ? 'ENCAISSÉ COD'
          : ord.status === 'Expédiée'
          ? 'TRANSIT COD'
          : 'EN PRÉPARATION';

      list.push({
        id: ord.id || ord.orderId,
        orderId: ord.orderId,
        dateStr,
        customerName: ord.customerName,
        destination: `${ord.governorate} — ${ord.address}`,
        phone: ord.phone,
        itemsSpec: itemsSpec || 'Articles Collection KŪZA',
        itemsNote: `Expédition: ${formatTND(ord.shipping || 8)} · Colis Privé`,
        totalTTC: ord.total,
        subtotal: ord.subtotal,
        shipping: ord.shipping || 8,
        fiscalStatus: fiscalStatus as any,
        rawOrder: ord,
      });
    });

    return list;
  }, [orders]);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return combinedRows;
    const q = searchQuery.toLowerCase();
    return combinedRows.filter(
      (r) =>
        r.orderId.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        r.itemsSpec.toLowerCase().includes(q)
    );
  }, [combinedRows, searchQuery]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (showNotice) {
        showNotice('✨ Registre comptable et fiscal synchronisé avec succès.');
      }
    }, 600);
  };

  const handleOpenInvoice = (row: RegistryRowItem) => {
    const targetOrder = row.rawOrder || {
      orderId: row.orderId,
      customerName: row.customerName,
      phone: row.phone,
      address: row.destination,
      total: row.totalTTC,
      subtotal: row.subtotal,
      shipping: row.shipping,
      date: row.dateStr,
    };

    if (onOpenInvoiceModal) {
      onOpenInvoiceModal(targetOrder);
    } else {
      setSelectedInvoiceOrder(targetOrder);
    }
  };

  const handleOpenSlip = (row: RegistryRowItem) => {
    const targetOrder = row.rawOrder || {
      orderId: row.orderId,
      customerName: row.customerName,
      phone: row.phone,
      address: row.destination,
      total: row.totalTTC,
      subtotal: row.subtotal,
      shipping: row.shipping,
      date: row.dateStr,
    };

    if (onOpenSlipModal) {
      onOpenSlipModal(targetOrder);
    } else {
      setSelectedThermalOrder(targetOrder);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & BREADCRUMB CONTEXT                       */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#34312D]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#B9A995]">
              Registres Comptables
            </span>
            <span className="text-[#34312D] text-xs">/</span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#96918A]">
              Fiscalité MF-1845920-A-M-000
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-serif text-[#E8E4DD] tracking-tight uppercase"
            style={{ fontFamily: "'Optima', 'Cormorant Garamond', 'Playfair Display', serif" }}
          >
            Directoire des Ventes & Commandes
          </h1>

          <p className="text-xs text-[#96918A] max-w-3xl font-light">
            Registre d'adjudication, bordereaux de livraison et génération d'actes de facturation A4 certifiés conformes DGI.
          </p>
        </div>

        {/* Live Atelier Telemetry & Quick Action */}
        <div className="flex flex-wrap items-center gap-3">
          {onOpenDirectSaleModal && (
            <button
              type="button"
              onClick={onOpenDirectSaleModal}
              className="px-4 py-2.5 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-md whitespace-nowrap"
              title="Enregistrer un retrait direct ou une vente en main propre au dépôt (المخزن)"
            >
              <span>+ NOUVELLE VENTE DIRECTE (REMISE EN MAIN PROPRE)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            className="px-4 py-2.5 bg-[#181818] hover:bg-[#202020] border border-[#34312D] text-[#E8E4DD] text-xs font-mono uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#B9A995] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser Registre</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenInvoice(DEFAULT_REGISTRY_ROWS[0])}
            className="px-4 py-2.5 bg-[#141414] text-[#E8E4DD] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono font-bold uppercase tracking-widest hover:text-[#B9A995] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-[#B9A995]" />
            <span>Facture Réf (#KZ-8682)</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. STAT METROLOGY CARDS (3 CARDS)                        */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Volume Facturé M-1 */}
        <div className="bg-[#181818] border border-[#34312D] border-l-4 border-l-[#B9A995] p-6 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#96918A]">
              Volume Facturé M-1
            </span>
            <TrendingUp className="w-4 h-4 text-[#B9A995]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl sm:text-3xl font-serif text-[#E8E4DD] font-bold"
              style={{ fontFamily: "'Optima', serif" }}
            >
              18,450.000
            </span>
            <span className="text-xs font-mono text-[#B9A995] uppercase">TND</span>
          </div>
          <span className="text-[11px] font-mono text-[#96918A] mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">+14.2%</span> par rapport au cycle précédent
          </span>
        </div>

        {/* Card 2: Factures Émises & Conformes */}
        <div className="bg-[#181818] border border-[#34312D] border-l-4 border-l-[#96918A] p-6 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#96918A]">
              Factures Émises & Conformes
            </span>
            <ShieldCheck className="w-4 h-4 text-[#96918A]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl sm:text-3xl font-serif text-[#E8E4DD] font-bold"
              style={{ fontFamily: "'Optima', serif" }}
            >
              142
            </span>
            <span className="text-xs font-mono text-[#96918A] uppercase">Actes Émis</span>
          </div>
          <span className="text-[11px] font-mono text-[#96918A] mt-2">
            Toutes déclarées sous TVA 19% Code Douane 482910M
          </span>
        </div>

        {/* Card 3: Attente Encaissement COD */}
        <div className="bg-[#181818] border border-[#34312D] border-l-4 border-l-[#D5C4AF] p-6 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#96918A]">
              Attente Encaissement COD
            </span>
            <Truck className="w-4 h-4 text-[#D5C4AF]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl sm:text-3xl font-serif text-[#D5C4AF] font-bold"
              style={{ fontFamily: "'Optima', serif" }}
            >
              14
            </span>
            <span className="text-xs font-mono text-[#96918A] uppercase">Colis en Transit</span>
          </div>
          <span className="text-[11px] font-mono text-[#96918A] mt-2">
            Valeur marchande en cours: 1,840.000 TND
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN ORDERS REGISTRY TABLE                            */}
      {/* ======================================================== */}
      <div className="bg-[#181818] border border-[#34312D] flex flex-col shadow-xl">
        {/* Table Top Controls Bar */}
        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#34312D] bg-[#141414]">
          <div className="flex items-center gap-3">
            <h2
              className="text-base font-serif text-[#E8E4DD] uppercase tracking-wide"
              style={{ fontFamily: "'Optima', serif" }}
            >
              Journal des Commandes & Émissions
            </h2>
            <span className="px-2.5 py-0.5 bg-[#1C1B1B] text-[#B9A995] border border-[#34312D] text-[10px] font-mono uppercase tracking-wider">
              Automne-Hiver 2026
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Quick Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#96918A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher réf, client, ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#101010] border border-[#34312D] focus:border-[#B9A995] text-xs font-mono text-[#E8E4DD] placeholder-[#666] outline-none"
              />
            </div>

            {onOpenDirectSaleModal && (
              <button
                type="button"
                onClick={onOpenDirectSaleModal}
                className="px-3.5 py-1.5 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm whitespace-nowrap"
                title="Enregistrer un retrait direct ou une vente en main propre au dépôt (المخزن)"
              >
                <span>+ NOUVELLE VENTE DIRECTE (REMISE EN MAIN PROPRE)</span>
              </button>
            )}

            <span className="text-[#96918A] text-[11px] font-mono hidden md:inline">
              Tri: Date décroissante
            </span>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141414] text-[#A0988E] text-[11px] font-mono uppercase tracking-widest border-b border-[#34312D]">
                <th className="py-3 px-5 text-[#A0988E]">Réf / Date</th>
                <th className="py-3 px-5 text-[#A0988E]">Acquéreur & Destination</th>
                <th className="py-3 px-5 text-[#A0988E]">Spécification de Commande</th>
                <th className="py-3 px-5 text-right text-[#A0988E]">Montant TTC</th>
                <th className="py-3 px-5 text-center text-[#A0988E]">Règlement Fiscal</th>
                <th className="py-3 px-5 text-right text-[#A0988E]">Actions Directoire</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#34312D]/60 text-xs font-mono text-[#E8E4DD]">
              {filteredRows.map((row) => {
                const isHighlight = row.orderId === 'KZ-8682';
                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-[#202020]/70 transition-colors ${
                      isHighlight ? 'bg-[#1C1B1B]/70' : ''
                    }`}
                  >
                    {/* 1. Réf / Date */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col">
                        <span className="text-xs text-[#B9A995] font-mono font-bold tracking-wider">
                          #{row.orderId}
                        </span>
                        <span className="text-[#96918A] text-[10px] mt-0.5">
                          {row.dateStr}
                        </span>
                      </div>
                    </td>

                    {/* 2. Acquéreur & Destination */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#E8E4DD]">
                          {row.customerName}
                        </span>
                        <span className="text-[#96918A] text-[11px] truncate max-w-xs">
                          {row.destination}
                        </span>
                      </div>
                    </td>

                    {/* 3. Spécification de Commande */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col">
                        <span className="text-[#E8E4DD] font-light">
                          {row.itemsSpec}
                        </span>
                        <span className="text-[#B9A995]/80 text-[10px] mt-0.5">
                          {row.itemsNote}
                        </span>
                      </div>
                    </td>

                    {/* 4. Montant TTC */}
                    <td className="py-4 px-5 text-right font-mono font-bold text-[#E8E4DD]">
                      {row.totalTTC.toFixed(3)} DT
                    </td>

                    {/* 5. Règlement Fiscal */}
                    <td className="py-4 px-5 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border ${
                          row.fiscalStatus === 'ENCAISSÉ COD'
                            ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30'
                            : row.fiscalStatus === 'VIREMENT BIAT'
                            ? 'bg-blue-950/30 text-blue-400 border-blue-500/30'
                            : 'bg-amber-950/30 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            row.fiscalStatus === 'ENCAISSÉ COD'
                              ? 'bg-emerald-400'
                              : row.fiscalStatus === 'VIREMENT BIAT'
                              ? 'bg-blue-400'
                              : 'bg-amber-400'
                          }`}
                        ></span>
                        {row.fiscalStatus}
                      </span>
                    </td>

                    {/* 6. Actions Directoire (Imprimer Slip + Facture PDF A4) */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Imprimer Slip (80mm) */}
                        <button
                          type="button"
                          onClick={() => handleOpenSlip(row)}
                          className="px-3 py-1.5 bg-[#181818] hover:bg-[#222222] border border-[#34312D] text-[#96918A] hover:text-[#E8E4DD] text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Imprimer le ticket de caisse thermique 80mm"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#B9A995]" />
                          <span>Imprimer Slip</span>
                        </button>

                        {/* Facture PDF A4 */}
                        <button
                          type="button"
                          onClick={() => handleOpenInvoice(row)}
                          className="px-3.5 py-1.5 bg-[#B9A995]/20 hover:bg-[#B9A995] text-[#B9A995] hover:text-[#101010] border border-[#B9A995]/50 text-[11px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 font-bold cursor-pointer shadow-sm"
                          title="Générer et visualiser la facture certifiée A4"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Facture PDF A4</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Footer */}
        <div className="p-4 bg-[#141414] border-t border-[#34312D] flex items-center justify-between text-[#96918A] text-xs font-mono">
          <span>
            {filteredRows.length} opérations enregistrées sur 142 factures clôturées
          </span>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#E8E4DD] cursor-pointer">← Précédent</span>
            <span className="text-[#E8E4DD] font-bold">1 / 1</span>
            <span className="hover:text-[#E8E4DD] cursor-pointer">Suivant →</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. ACTIVE MODALS: INVOICE MODAL & THERMAL RECEIPT MODAL  */}
      {/* ======================================================== */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {selectedThermalOrder && (
        <ThermalReceiptModal
          order={selectedThermalOrder}
          onClose={() => setSelectedThermalOrder(null)}
        />
      )}
    </div>
  );
};

export default SalesRegistry;
