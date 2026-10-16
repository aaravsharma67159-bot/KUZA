import React from 'react';
import { X, Phone, MapPin, Calendar, CreditCard, Package, Truck, Printer, FileText } from 'lucide-react';
import { OrderDetails } from '../types';
import { formatTND } from '../utils/currency';
import { KUZA_CONTACT } from '../utils/contact';
import { formatOrderDate } from './OrderJournal';
import { generatePdfInvoice } from '../utils/pdfInvoice';
import { PrintableOrderModel } from './PrintableBordereauModal';

interface OrderDetailModalProps {
  order: OrderDetails;
  onClose: () => void;
  onOpenSlip?: (orderModel: PrintableOrderModel) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onOpenSlip,
}) => {
  const orderId = order.orderId || order.id || 'KZ-COMMANDE';
  const readableDate = formatOrderDate(order.createdAt);

  const printableModel: PrintableOrderModel = {
    id: orderId,
    orderId,
    date: order.createdAt,
    createdAt: order.createdAt,
    customerName: order.customerName,
    phone: order.phone,
    governorate: order.governorate,
    address: order.address,
    deliveryNotes: order.deliveryNotes,
    subtotal: order.subtotal,
    shipping: order.shipping || 8,
    shippingFee: order.shipping || 8,
    total: order.total,
    totalAmount: order.total,
    items: order.items.map((it) => ({
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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl bg-[#101010] border border-[#34312D] text-[#E8E4DD] shadow-2xl overflow-hidden flex flex-col my-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#34312D] bg-[#141414]">
          <div className="flex items-center gap-3">
            <span
              className="text-lg font-serif tracking-widest uppercase text-[#E8E4DD]"
              style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
            >
              Fiche Commande
            </span>
            <span className="font-mono text-sm font-bold text-[#B9A995] bg-[#181818] px-2.5 py-0.5 border border-[#34312D]">
              {orderId}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer"
            aria-label="Fermer la modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Status & Date Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#181818] border border-[#34312D] text-xs font-mono">
            <div className="flex items-center gap-2 text-[#96918A]">
              <Calendar className="w-3.5 h-3.5 text-[#B9A995]" />
              <span>{readableDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase text-[#96918A]">STATUT:</span>
              <span
                className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider border ${
                  order.status === 'Livrée'
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                    : order.status === 'Expédiée'
                    ? 'border-[#B9A995] text-[#B9A995] bg-[#B9A995]/10'
                    : order.status === 'Annulée'
                    ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                    : 'border-[#34312D] text-[#E8E4DD] bg-[#141414]'
                }`}
              >
                {order.status || 'Commande reçue'}
              </span>
            </div>
          </div>

          {/* Customer & Delivery Card */}
          <div className="p-4 bg-[#181818] border border-[#34312D] space-y-3">
            <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-[#B9A995]">
              <MapPin className="w-3.5 h-3.5" />
              <span>COORDONNÉES CLIENT & LIVRAISON</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="text-sm font-semibold text-[#E8E4DD]">
                {order.customerName}
              </div>
              <div className="flex items-center gap-2 text-[#B9A995] font-mono">
                <Phone className="w-3.5 h-3.5" />
                <a href={`tel:${order.phone}`} className="hover:underline">
                  {order.phone}
                </a>
              </div>
              <div className="text-[#96918A] leading-relaxed">
                {order.governorate} — {order.address}
              </div>
              {order.deliveryNotes && (
                <div className="p-2 bg-[#141414] border border-[#34312D] text-[11px] text-[#B9A995] italic mt-2">
                  Instructions coursier : {order.deliveryNotes}
                </div>
              )}
            </div>
          </div>

          {/* Ordered Articles Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-widest text-[#96918A]">
              <span>ARTICLES COMMANDÉS</span>
              <span>
                {order.items.reduce((acc, i) => acc + i.quantity, 0)} pièce(s)
              </span>
            </div>

            <div className="border border-[#34312D] divide-y divide-[#34312D]/60 bg-[#181818]">
              {order.items.map((it) => (
                <div key={it.id} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-[#E8E4DD]">
                      {it.product.name}
                    </div>
                    <div className="text-[11px] font-mono text-[#96918A] mt-0.5">
                      Coloris : {it.selectedColor.name} &nbsp;·&nbsp; Taille : {it.selectedSize} &nbsp;·&nbsp; Qté : <strong className="text-[#B9A995]">×{it.quantity}</strong>
                    </div>
                  </div>
                  <div className="text-right font-mono text-sm text-[#E8E4DD] tabular-nums font-semibold">
                    {formatTND(it.product.price * it.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals */}
          <div className="p-4 bg-[#141414] border border-[#34312D] space-y-2 font-mono text-xs">
            <div className="flex justify-between text-[#96918A]">
              <span>Sous-total HT Atelier :</span>
              <span className="tabular-nums">{formatTND(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#96918A]">
              <span>Frais de livraison Express :</span>
              <span className="tabular-nums">{formatTND(order.shipping || 8)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#E8E4DD] pt-2 border-t border-[#34312D]">
              <span>NET À PAYER (COD) :</span>
              <span className="text-[#B9A995] tabular-nums">{formatTND(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#34312D] bg-[#141414] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-transparent border border-[#34312D] text-[#96918A] hover:text-[#E8E4DD] font-mono text-xs uppercase cursor-pointer"
          >
            Fermer
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => generatePdfInvoice(printableModel)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#181818] border border-[#34312D] text-[#E8E4DD] hover:border-[#B9A995] hover:text-[#B9A995] font-mono text-xs uppercase transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#B9A995]" />
              <span>Facture PDF</span>
            </button>

            {onOpenSlip && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSlip(printableModel);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#B9A995] text-[#101010] font-mono text-xs font-semibold uppercase hover:bg-[#E8E4DD] transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Bordereau Slip</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
