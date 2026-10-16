import React, { useState, useEffect } from 'react';
import { X, Printer, FileText, CheckCircle2, Download } from 'lucide-react';
import { formatTND } from '../utils/currency';
import { KUZA_CONTACT } from '../utils/contact';
import { generatePdfInvoice } from '../utils/pdfInvoice';
import { KuzaMonogram } from './KuzaMonogram';
import { KuzaLogo } from './KuzaLogo';
import { InvoiceModal } from './InvoiceModal';

export interface ThermalReceiptOrder {
  id?: string;
  orderId?: string;
  createdAt?: string;
  date?: string;
  timestamp?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  governorate?: string;
  deliveryNotes?: string;
  subtotal?: number;
  shipping?: number;
  shippingFee?: number;
  discountAmount?: number;
  total?: number;
  totalAmount?: number;
  courierName?: string;
  courierTrackingRef?: string;
  client?: {
    name?: string;
    phone?: string;
    address?: string;
    governorate?: string;
  };
  items?: Array<{
    id?: string;
    name?: string;
    product?: {
      name?: string;
      price?: number;
    };
    color?: string;
    selectedColor?: {
      name?: string;
    };
    size?: string;
    selectedSize?: string;
    qty?: number;
    quantity?: number;
    unitPrice?: number;
  }>;
}

export interface ThermalReceiptModalProps {
  order?: ThermalReceiptOrder;
  orders?: ThermalReceiptOrder[];
  onClose: () => void;
}

export const SingleThermalReceiptSlip: React.FC<{ order: ThermalReceiptOrder }> = ({ order }) => {
  const rawDate = order.createdAt || order.date || order.timestamp || new Date().toISOString();
  let readableDate = rawDate;
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      readableDate =
        d.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }) +
        ' à ' +
        d.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });
    }
  } catch {
    readableDate = rawDate;
  }

  const orderId = order.orderId || order.id || 'KZ-8682';
  const customerName = order.customerName || order.client?.name || 'Client KŪZA';
  const customerPhone = order.phone || order.client?.phone || '+216 -- --- ---';
  const customerAddress = order.address || order.client?.address || 'Adresse de livraison non spécifiée';
  const customerGov = order.governorate || order.client?.governorate || 'TUNIS';
  const courierName = order.courierName || 'EXPRESS LIVRAISON TUNISIE (COD)';

  const items =
    order.items && order.items.length > 0
      ? order.items.map((it, idx) => ({
          id: it.id || `item-${idx}`,
          name: it.name || it.product?.name || 'Vêtement KŪZA',
          color: it.color || it.selectedColor?.name || 'Noir',
          size: it.size || it.selectedSize || 'M',
          quantity: it.qty ?? it.quantity ?? 1,
          unitPrice: it.unitPrice || it.product?.price || 79,
          total: (it.unitPrice || it.product?.price || 79) * (it.qty ?? it.quantity ?? 1),
        }))
      : [
          {
            id: 'item-1',
            name: 'SHELTER SWEAT',
            color: 'Noir',
            size: 'M',
            quantity: 1,
            unitPrice: 79,
            total: 79,
          },
        ];

  const subtotal = order.subtotal ?? items.reduce((acc, it) => acc + it.total, 0);
  const shippingFee = order.shipping ?? order.shippingFee ?? 8;
  const discountAmount = order.discountAmount ?? 0;
  const totalAmount = order.total ?? order.totalAmount ?? Math.max(0, subtotal + shippingFee - discountAmount);

  return (
    <div
      className="p-4 bg-white text-black font-mono text-xs leading-tight shadow-md border border-zinc-200 select-text w-[80mm] max-w-[80mm] mx-auto"
      style={{
        fontFamily: "'Courier New', Courier, monospace, sans-serif",
      }}
    >
      {/* Header: Brand Atelier & GPS */}
      <div className="text-center pb-2 border-b border-dashed border-black space-y-1">
        <div className="flex justify-center items-center gap-2 mb-1">
          <KuzaMonogram className="w-6 h-6 text-black" fillColor="#000000" />
          <KuzaLogo className="h-4 w-auto text-black" color="#000000" />
        </div>
        <h1 className="text-sm font-bold tracking-[0.2em] uppercase">
          KŪZA · DIRECTOIRE STOCK & LOGISTIQUE // TUNIS
        </h1>
        <p className="text-[10px] tracking-wider uppercase text-zinc-700">
          MANUFACTURE ARCHITECTURALE · TUNISIE 🇹🇳
        </p>
        <p className="text-[9px] text-zinc-600">
          LOC: 36.8065° N, 10.1815° E / TUNIS
        </p>
        <div className="pt-1 text-[10px] text-zinc-800 font-semibold">
          DATE : {readableDate}
        </div>
      </div>

      {/* Order Reference & Barcode */}
      <div className="py-2 border-b border-dashed border-black text-center space-y-1.5">
        <div className="flex justify-between items-center text-[11px] font-bold">
          <span>N° COMMANDE :</span>
          <span className="text-xs tracking-wider">{orderId}</span>
        </div>

        {/* Barcode representation */}
        <div className="flex justify-center items-center h-7 gap-0.5 overflow-hidden my-1">
          {[3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1, 4, 1, 3, 2, 4, 1, 2].map(
            (w, i) => (
              <div
                key={i}
                className="bg-black h-full"
                style={{ width: `${w * 1.4}px` }}
              />
            )
          )}
        </div>
        <div className="text-[9px] tracking-[0.3em] uppercase text-zinc-800">
          *{orderId}*
        </div>
      </div>

      {/* Recipient & Delivery Details Box */}
      <div className="py-2.5 border-b border-dashed border-black space-y-1 text-[11px]">
        <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">
          [ DESTINATAIRE / LIVRAISON ]
        </div>
        <div className="font-bold text-xs uppercase text-black">
          CLIENT : {customerName}
        </div>
        <div className="font-bold text-black">
          TÉL : {customerPhone}
        </div>
        <div className="text-zinc-900 leading-snug">
          GOUVERNORAT : <span className="font-bold">{customerGov}</span>
        </div>
        <div className="text-zinc-900 leading-snug">
          ADRESSE : {customerAddress}
        </div>
        <div className="pt-0.5 text-[10px] text-zinc-800">
          TRANSPORTEUR : <span className="font-semibold">{courierName}</span>
        </div>
        {order.deliveryNotes && (
          <div className="pt-1 text-[10px] italic text-zinc-700 bg-zinc-100 p-1 border border-zinc-300">
            NOTE LIVREUR : {order.deliveryNotes}
          </div>
        )}
      </div>

      {/* Line Items Table */}
      <div className="py-2 border-b border-dashed border-black">
        <div className="flex justify-between font-bold text-[10px] uppercase pb-1 border-b border-black">
          <span className="w-8/12">ARTICLE / VARIANTE</span>
          <span className="w-1/12 text-center">QTÉ</span>
          <span className="w-3/12 text-right">TOTAL</span>
        </div>

        <div className="divide-y divide-zinc-200 pt-1 space-y-1.5">
          {items.map((it) => (
            <div key={it.id} className="pt-1 text-[10px] flex justify-between items-start">
              <div className="w-8/12 pr-1">
                <div className="font-bold uppercase text-[11px] text-black">
                  {it.name}
                </div>
                <div className="text-[9px] text-zinc-600">
                  {it.color} · {it.size} ({formatTND(it.unitPrice)})
                </div>
              </div>
              <div className="w-1/12 text-center font-bold text-[11px]">
                {it.quantity}
              </div>
              <div className="w-3/12 text-right font-bold text-[11px] tabular-nums">
                {formatTND(it.total)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Totals Breakdown */}
      <div className="py-2 border-b border-dashed border-black space-y-1 text-[11px]">
        <div className="flex justify-between text-zinc-700">
          <span>Sous-total articles :</span>
          <span className="tabular-nums font-semibold">{formatTND(subtotal)}</span>
        </div>
        <div className="flex justify-between text-zinc-700">
          <span>Frais de livraison :</span>
          <span className="tabular-nums font-semibold">{formatTND(shippingFee)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-800 font-semibold">
            <span>Remise promo / Pack :</span>
            <span className="tabular-nums">-{formatTND(discountAmount)}</span>
          </div>
        )}
      </div>

      {/* Grand Total Box (Cash on Delivery Highlight) */}
      <div className="my-2 p-2 bg-black text-white text-center space-y-0.5">
        <div className="text-sm sm:text-base font-bold tracking-wider">
          NET À PAYER (CASH ON DELIVERY) : {formatTND(totalAmount)}
        </div>
        <div className="text-[8px] text-zinc-300 uppercase tracking-wider">
          PAIEMENT EN ESPÈCES À LA LIVRAISON (MONTANT EXACT)
        </div>
      </div>

      {/* Verification Stamp & Footer */}
      <div className="pt-2 text-center space-y-1.5">
        <div className="mx-auto w-52 p-1.5 border border-dashed border-black text-[9px] uppercase font-bold tracking-wider">
          [ ATELIER KŪZA TUNIS · LOT CONFORME ]
          <div className="text-[8px] font-normal text-zinc-600">
            CONTRÔLE QUALITÉ 100% CERTIFIÉ
          </div>
        </div>

        <div className="pt-1 text-[11px] text-zinc-900 font-bold">
          SUPPORT : +216 92 929 276
        </div>
        <p className="text-[9px] text-zinc-600">
          www.kuza.tn · Instagram: @kuza.tn
        </p>
        <p className="text-[9px] text-zinc-700 font-medium pt-0.5">
          Merci pour votre commande · Artisanat KŪZA 🇹🇳
        </p>
      </div>
    </div>
  );
};

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  order,
  orders,
  onClose,
}) => {
  const [showA4Invoice, setShowA4Invoice] = useState(false);

  // Normalize order list
  const ordersList: ThermalReceiptOrder[] = orders && orders.length > 0
    ? orders
    : order
    ? [order]
    : [
        {
          orderId: 'KZ-8682',
          customerName: 'Aymen Cherif',
          phone: '+216 98 123 456',
          governorate: 'TUNIS',
          address: 'Avenue Habib Bourguiba, 1001 Tunis',
          subtotal: 79,
          shipping: 8,
          total: 87,
        },
      ];

  const isBatch = ordersList.length > 1;
  const activeOrderForSinglePdf = ordersList[0];

  // Execute print for 80mm slip queue
  const handlePrint = () => {
    window.print();
  };

  // Generate commercial PDF invoice for active order
  const handleDownloadPdf = () => {
    generatePdfInvoice(activeOrderForSinglePdf);
  };

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Dynamic 80mm Thermal Receipt Page Rules */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto !important;
            margin: 0mm !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-lg bg-[#101010] border border-[#34312D] text-[#E8E4DD] shadow-2xl flex flex-col my-auto overflow-hidden">
        {/* Header toolbar (Hidden in print) */}
        <div className="flex items-center justify-between p-4 border-b border-[#34312D] bg-[#141414] print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#B9A995]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#B9A995] font-semibold">
              {isBatch
                ? `QUEUE D'IMPRESSION GROUPÉE (${ordersList.length} TICKETS 80MM)`
                : 'TICKET THERMIQUE 80MM (REÇU LIVREUR)'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#96918A] hover:text-[#E8E4DD] cursor-pointer transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls Bar (Print & PDF) */}
        <div className="px-4 py-3 bg-[#181818] border-b border-[#34312D] flex flex-wrap items-center justify-between gap-2 print:hidden">
          <button
            type="button"
            onClick={() => setShowA4Invoice(true)}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 bg-[#B9A995]/20 hover:bg-[#B9A995] text-[#B9A995] hover:text-[#101010] border border-[#B9A995]/40 text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
            title="Visualiser la facture certifiée A4"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>FACTURE A4</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 bg-[#121212] hover:bg-[#1f1f1f] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono text-[#E8E4DD] transition-colors cursor-pointer"
            title="Télécharger la facture PDF"
          >
            <Download className="w-3.5 h-3.5 text-[#B9A995]" />
            <span>PDF DIRECT</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-2 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
            title="Imprimer directement sur imprimante thermique 80mm"
          >
            <Printer className="w-4 h-4" />
            <span>{isBatch ? `🖨️ IMPRIMER SÉLECTIONNÉS (${ordersList.length})` : '🖨️ IMPRIMER (80MM)'}</span>
          </button>
        </div>

        {/* Scrollable Preview Area for Modal View */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh] flex flex-col items-center bg-[#0d0d0d] print:p-0 print:m-0 print:max-h-none print:bg-white no-scrollbar">
          {/* =========================================================================
              80MM THERMAL RECEIPT SLIP CONTAINER
              Target ID: #printable-thermal-slip
              Strictly styled for standard 80mm POS receipt printers (Epson, Xprinter, Zebra)
              ========================================================================= */}
          <div
            id="printable-thermal-slip"
            className="w-[80mm] max-w-[80mm] space-y-4 print:space-y-0"
          >
            {ordersList.map((ord, idx) => (
              <div
                key={ord.orderId || ord.id || idx}
                className="thermal-slip-page w-[80mm] max-w-[80mm] mx-auto"
                style={{
                  pageBreakAfter: idx < ordersList.length - 1 ? 'always' : 'auto',
                  breakAfter: idx < ordersList.length - 1 ? 'page' : 'auto',
                }}
              >
                <SingleThermalReceiptSlip order={ord} />
                {idx < ordersList.length - 1 && (
                  <div className="py-3 text-center text-[9px] font-mono text-[#96918A] uppercase tracking-widest border-y border-dashed border-[#34312D] my-3 print:hidden">
                    ✂ - - COUPURE PAPIER (TICKET {idx + 1}/{ordersList.length}) - - ✂
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer toolbar (Hidden in print) */}
        <div className="p-4 bg-[#141414] border-t border-[#34312D] flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#181818] border border-[#34312D] text-xs font-mono text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer"
          >
            FERMER
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-mono font-bold uppercase transition-colors cursor-pointer shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>{isBatch ? `IMPRIMER SÉLECTIONNÉS (${ordersList.length} TICKETS 80MM)` : 'IMPRIMER TICKET THERMIQUE (80MM)'}</span>
          </button>
        </div>
      </div>

      {/* Render Certified A4 Invoice Modal */}
      {showA4Invoice && (
        <InvoiceModal
          order={activeOrderForSinglePdf}
          onClose={() => setShowA4Invoice(false)}
        />
      )}
    </div>
  );
};

export default ThermalReceiptModal;
