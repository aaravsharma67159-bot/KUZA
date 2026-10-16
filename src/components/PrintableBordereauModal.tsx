import React, { useEffect } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { formatTND } from '../utils/currency';
import { KUZA_CONTACT } from '../utils/contact';
import { KuzaMonogram } from './KuzaMonogram';
import { KuzaLogo } from './KuzaLogo';

export interface PrintableOrderModel {
  id?: string;
  orderId?: string;
  createdAt?: string;
  date?: string;
  timestamp?: string;
  customerName?: string;
  phone?: string;
  phoneSecondary?: string;
  address?: string;
  governorate?: string;
  deliveryNotes?: string;
  subtotal?: number;
  shipping?: number;
  shippingFee?: number;
  total?: number;
  totalAmount?: number;
  courierName?: string;
  courierTrackingRef?: string;
  logisticsStatus?: string;
  client?: {
    name?: string;
    phone?: string;
    phoneSecondary?: string;
    address?: string;
    governorate?: string;
  };
  items?: Array<{
    id?: string;
    name?: string;
    product?: {
      name?: string;
      spec?: string;
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

interface PrintableBordereauModalProps {
  order?: PrintableOrderModel | null;
  orders?: PrintableOrderModel[] | null;
  onClose: () => void;
}

// Subcomponent: Individual Dispatch Slip
const SingleSlipDocument: React.FC<{
  order: PrintableOrderModel;
  format: '80mm' | 'A5';
  isLast?: boolean;
}> = ({ order, format, isLast = false }) => {
  // 1. Data mapping for Référence Bordereau
  const refCode = order.id || order.orderId || 'KZ-5891';

  // 2. Data mapping for Date d'émission
  const rawDate = order.date || order.createdAt || order.timestamp;
  let formattedDate = '05/10/2026 12:20:00';
  if (rawDate) {
    const parsed = new Date(rawDate);
    if (!isNaN(parsed.getTime())) {
      const pad = (n: number) => String(n).padStart(2, '0');
      formattedDate = `${pad(parsed.getDate())}/${pad(parsed.getMonth() + 1)}/${parsed.getFullYear()} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
    } else {
      formattedDate = String(rawDate);
    }
  }

  // 3. Destinataire data mapping
  const clientName = order.client?.name || order.customerName || 'Client KŪZA';
  const clientPhone = order.client?.phone || order.phone || '+216 -- --- ---';
  const clientPhoneSecondary = order.client?.phoneSecondary || order.phoneSecondary;
  const clientAddress = order.client?.address || order.address || 'Adresse de livraison';
  const rawGov = order.client?.governorate || order.governorate || 'TUNIS';
  const zoneLabel = `Zone • ${rawGov}`;
  const clientGovFormatted = `${rawGov.toUpperCase()} — TUNISIE`;

  // 4. Articles itemization mapping
  const itemsList = (order.items || []).map((it, idx) => {
    const productName = it.product?.name || it.name || 'PIÈCE ATELIER KŪZA';
    const colorName = it.selectedColor?.name || it.color || 'Noir';
    const sizeName = it.selectedSize || it.size || 'M';
    const quantity = it.quantity !== undefined ? it.quantity : it.qty !== undefined ? it.qty : 1;
    const unitPrice =
      it.product?.price !== undefined
        ? it.product.price
        : it.unitPrice !== undefined
        ? it.unitPrice
        : 79;
    const lineTotal = unitPrice * quantity;
    const spec = it.product?.spec || '290 GSM Molleton Pur Coton';

    return {
      key: it.id || `item-${idx}`,
      productName,
      colorName,
      sizeName,
      quantity,
      unitPrice,
      lineTotal,
      spec,
    };
  });

  // 5. Totaux data mapping
  const shippingFee = order.shippingFee !== undefined ? order.shippingFee : order.shipping !== undefined ? order.shipping : 8;
  const computedSubtotal = itemsList.reduce((sum, item) => sum + item.lineTotal, 0);
  const subtotal = order.subtotal !== undefined ? order.subtotal : computedSubtotal;
  const totalAmount =
    order.totalAmount !== undefined
      ? order.totalAmount
      : order.total !== undefined
      ? order.total
      : subtotal + shippingFee;

  return (
    <article
      className={`print-slip-box paper-texture w-full bg-[#FAF9F5] text-zinc-950 p-6 sm:p-10 md:p-12 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)] border border-[#E3DFD5] relative overflow-hidden transition-all duration-300 font-mono mb-6 ${
        !isLast ? 'slip-page-break' : ''
      }`}
      data-purpose="dispatch-slip-document"
    >
      {/* Subtle Atelier Watermark Stamp */}
      <div
        aria-hidden="true"
        className="absolute right-6 top-8 pointer-events-none select-none opacity-[0.045] flex flex-col items-center rotate-[-12deg]"
      >
        <div className="w-48 h-48 rounded-full border-4 border-black flex items-center justify-center p-3 text-center">
          <div className="w-full h-full rounded-full border border-dashed border-black flex flex-col items-center justify-center p-2">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase">ATELIER CONTRÔLE</span>
            <span className="font-serif text-3xl font-bold tracking-tight" style={{ fontFamily: "'Cormorant Garamond', 'Cinzel', serif" }}>
              KŪZA
            </span>
            <span className="text-[8px] tracking-[0.25em]">SIDI BOU SAÏD</span>
            <span className="text-[7px] tracking-wider mt-1">LOT CONFORME · 2026</span>
          </div>
        </div>
      </div>

      {/* Brand Header */}
      <header className="text-center pb-7 border-b border-zinc-950/20 relative" data-purpose="brand-identity">
        <div className="flex justify-center mb-2">
          <KuzaMonogram className="w-10 h-10 text-zinc-950" fillColor="#0f0f0f" />
        </div>
        <div className="flex justify-center my-2">
          <KuzaLogo className="h-9 w-auto text-zinc-950" fillColor="#0f0f0f" />
        </div>
        <p
          className="text-[11px] sm:text-[12px] font-semibold tracking-[0.35em] uppercase text-zinc-800 mb-1.5"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Form Needs Space.
        </p>
        <p
          className="italic text-xs sm:text-[13px] text-zinc-600 tracking-wider"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Made in Tunisia · Atelier Haute Couture
        </p>
      </header>

      {/* Document Meta Section */}
      <section className="py-5 border-b border-zinc-950/15 text-[11px] sm:text-xs" data-purpose="document-metadata">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Left: Ref code */}
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span
                className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 font-medium"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                RÉF. BORDEREAU:
              </span>
              <span
                className="text-sm sm:text-base font-bold tracking-wider text-black"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {refCode}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-zinc-600">
              <span className="uppercase tracking-widest text-zinc-400">EXPÉDITION COD :</span>
              <span className="bg-zinc-200 px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider text-zinc-800">
                STANDARD SÉCURISÉ
              </span>
            </div>
          </div>

          {/* Right: Date & Barcode */}
          <div className="flex flex-col sm:items-end justify-center space-y-1">
            <div className="flex sm:flex-col sm:items-end">
              <span
                className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 font-medium sm:text-right"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                DATE D'ÉMISSION:
              </span>
              <span
                className="font-medium text-zinc-900 tracking-wider ml-2 sm:ml-0 text-[11px] sm:text-xs"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {formattedDate}
              </span>
            </div>
            {/* Stylized Barcode */}
            <div className="pt-1 flex items-center space-x-2">
              <div
                aria-label={`Barcode ${refCode}-2026`}
                className="w-36 h-6 code128-barcode opacity-85"
                role="img"
              ></div>
              <span
                className="text-[9px] text-zinc-400 tracking-tighter"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                *{refCode.replace(/[^A-Za-z0-9]/g, '')}*
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Courier Logistics Strip (If assigned) */}
      {(order.courierName || order.courierTrackingRef) && (
        <section className="mt-4 p-3 bg-white/90 border border-zinc-900/20 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 font-sans">
                TRANSPORTEUR PRIVÉ :
              </span>
              <span className="font-bold text-zinc-950 font-mono">
                {order.courierName || 'Coursier Express Tunis'}
              </span>
            </div>
            {order.courierTrackingRef && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 font-sans">
                  N° BORDEREAU SUIVI :
                </span>
                <span className="font-mono font-bold text-zinc-950 bg-zinc-100 px-2 py-0.5 border border-zinc-300">
                  {order.courierTrackingRef}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Shipping Recipient Box */}
      <section className="mt-5" data-purpose="recipient-logistics">
        <div className="border border-zinc-950/20 bg-white/70 p-5 sm:p-6 backdrop-blur-[2px] relative">
          <div className="flex justify-between items-center mb-3.5 pb-2 border-b border-zinc-200">
            <h2
              className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-zinc-700"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              DESTINATAIRE (LIVRAISON COD)
            </h2>
            <span
              className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-zinc-900 text-white font-medium"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {zoneLabel}
            </span>
          </div>

          <div className="space-y-1.5">
            <p
              className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950 leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {clientName}
            </p>
            <p
              className="text-xs sm:text-sm text-zinc-800 font-medium tracking-wide flex items-center gap-3"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              <span><span className="text-zinc-500 font-normal">Tél 1:</span> {clientPhone}</span>
              {clientPhoneSecondary && (
                <span><span className="text-zinc-500 font-normal">Tél 2:</span> {clientPhoneSecondary}</span>
              )}
            </p>
            <p
              className="text-xs sm:text-[13px] text-zinc-700 tracking-wide pt-0.5 leading-relaxed"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {clientAddress}
            </p>
            <p
              className="text-xs sm:text-sm font-bold tracking-wider text-black pt-0.5 uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {clientGovFormatted}
            </p>
          </div>

          {order.deliveryNotes && (
            <div className="mt-2 p-2 bg-zinc-100/80 border border-zinc-200 text-[10px] text-zinc-700 font-mono">
              <span className="font-semibold text-zinc-500">Note :</span> {order.deliveryNotes}
            </div>
          )}

          <div
            className="mt-4 pt-3 border-t border-dashed border-zinc-300 flex items-center justify-between text-[10px] text-zinc-500"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <span>Instructions : Remise en main propre contre paiement espèces strict</span>
            <span className="text-[9px] text-zinc-400 font-mono">KŪZA LOGISTICS #{refCode}</span>
          </div>
        </div>
      </section>

      {/* Articles Order Table */}
      <section className="mt-6" data-purpose="order-items-breakdown">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className="border-b border-zinc-950/25 text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-600"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <th className="pb-2 text-left font-medium" scope="col">
                DÉSIGNATION DE LA PIÈCE
              </th>
              <th className="pb-2 text-center font-medium w-16" scope="col">
                TAILLE
              </th>
              <th className="pb-2 text-center font-medium w-12" scope="col">
                QTÉ
              </th>
              <th className="pb-2 text-right font-medium w-28" scope="col">
                MONTANT
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/80">
            {itemsList.length === 0 ? (
              <tr className="align-top text-xs sm:text-sm">
                <td colSpan={4} className="py-4 text-center text-zinc-500 italic">
                  Aucun article renseigné
                </td>
              </tr>
            ) : (
              itemsList.map((item) => (
                <tr key={item.key} className="align-top text-xs sm:text-sm">
                  <td className="py-3.5 pr-3">
                    <div
                      className="font-bold text-zinc-950 uppercase tracking-wider text-xs sm:text-[13px]"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {item.productName}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      Coloris : {item.colorName} · 290 GSM Molleton
                    </div>
                  </td>
                  <td
                    className="py-3.5 px-2 text-center font-bold text-zinc-900 text-xs sm:text-sm"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {item.sizeName}
                  </td>
                  <td
                    className="py-3.5 px-2 text-center font-bold text-zinc-900 text-xs sm:text-sm"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    className="py-3.5 pl-2 text-right font-medium text-zinc-950 whitespace-nowrap text-xs sm:text-sm"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {formatTND(item.lineTotal)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Subtotal lines */}
        <div
          className="mt-2 pt-3 border-t border-zinc-950/15 space-y-2 text-xs"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          <div className="flex justify-between items-center text-zinc-700">
            <span className="tracking-wider">Sous-total articles</span>
            <span className="font-medium text-zinc-900">{formatTND(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-zinc-700">
            <span className="tracking-wider flex items-center">
              Frais de port (Flat)
              <span
                className="ml-2 text-[9px] uppercase tracking-normal px-1.5 py-0.5 bg-zinc-200/70 text-zinc-600 rounded"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Express
              </span>
            </span>
            <span className="font-medium text-zinc-900">{formatTND(shippingFee)}</span>
          </div>
        </div>
      </section>

      {/* Total COD Block */}
      <section className="mt-5" data-purpose="total-cod-amount">
        <div className="bg-black text-white p-5 sm:p-6 text-center shadow-lg relative overflow-hidden">
          <span className="absolute top-1.5 left-2 text-[8px] font-mono text-zinc-600">+</span>
          <span className="absolute top-1.5 right-2 text-[8px] font-mono text-zinc-600">+</span>
          <span className="absolute bottom-1.5 left-2 text-[8px] font-mono text-zinc-600">+</span>
          <span className="absolute bottom-1.5 right-2 text-[8px] font-mono text-zinc-600">+</span>

          <p
            className="text-[10px] sm:text-[11px] font-medium tracking-[0.3em] uppercase text-zinc-400 mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            MONTANT TOTAL À ENCAISSER EN ESPÈCES (COD)
          </p>

          <div className="flex items-baseline justify-center space-x-2 my-1">
            <span
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {Number(totalAmount || 0).toFixed(3).replace('.', ',')}
            </span>
            <span
              className="text-lg sm:text-xl font-bold tracking-widest text-[#BCA88D]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              DT
            </span>
          </div>

          <p
            className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-zinc-400 mt-2"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            PAIEMENT CASH À LA LIVRAISON (COD) — ÉMARGEMENT OBLIGATOIRE
          </p>
        </div>
      </section>

      {/* Official Thermal Support Lines under Total Sum */}
      <section
        className="mt-4 pt-3 pb-2 border-t border-b border-dashed border-zinc-950/40 text-center text-xs leading-relaxed"
        data-purpose="thermal-receipt-support-footer"
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        <div className="font-bold tracking-widest uppercase text-zinc-950 text-[11px]">
          ATELIER KŪZA — SERVICE CLIENT
        </div>
        <div className="text-zinc-800 text-[11px]">
          Tél / WhatsApp : {KUZA_CONTACT.phone}
        </div>
        <div className="text-zinc-800 text-[11px]">
          Instagram : {KUZA_CONTACT.instagramHandle}
        </div>
        <div className="italic text-zinc-600 text-[10px] pt-0.5">
          Merci pour votre confiance.
        </div>
      </section>

      {/* Signatures Section */}
      <section className="mt-5 pt-4 border-t border-dashed border-zinc-300 text-xs" data-purpose="verification-signatures">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Quality Visa Atelier */}
          <div className="flex flex-col justify-between p-3 border border-zinc-200/90 bg-white/40">
            <span
              className="text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-600 mb-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              VISA ATELIER KŪZA
            </span>
            <div className="h-10 flex items-center justify-center relative">
              <div className="border border-[#BCA88D] text-[#8C7355] px-2.5 py-0.5 text-[9px] rotate-[-3deg] uppercase tracking-wider text-center font-mono">
                <span>CONTRÔLE QUALITÉ OK</span>
                <span className="block text-[7px] tracking-widest opacity-80">ATELIER N° 04</span>
              </div>
            </div>
            <span className="text-[8px] text-zinc-400 text-center border-t border-zinc-200/60 pt-1 font-mono">
              Scellé et conditionné à la main
            </span>
          </div>

          {/* Recipient Signature */}
          <div className="flex flex-col justify-between p-3 border border-zinc-200/90 bg-white/40">
            <div className="flex justify-between items-center mb-1">
              <span
                className="text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-600"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                SIGNATURE DESTINATAIRE
              </span>
              <span className="text-[8px] text-zinc-400 font-mono">Émargement</span>
            </div>
            <div className="h-10 border border-dashed border-zinc-300/80 bg-zinc-50/50 flex items-center justify-center">
              <span className="text-[9px] text-zinc-400 italic font-mono">
                Émargement espèces reçu
              </span>
            </div>
            <span className="text-[8px] text-zinc-400 text-center border-t border-zinc-200/60 pt-1 font-mono">
              Date & heure : ____ / ____ / 2026
            </span>
          </div>
        </div>
      </section>

      {/* Document Footer Note */}
      <footer
        className="mt-6 pt-3 border-t border-zinc-950/20 text-center text-[9px] text-zinc-500 tracking-wider uppercase flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        <span>KŪZA Haute Couture · Tunis</span>
        <span className="font-mono text-zinc-400">ID TRANSACTION: TX-{refCode}-COD</span>
        <span>Service Client: {KUZA_CONTACT.phone} · {KUZA_CONTACT.instagramHandle}</span>
      </footer>
    </article>
  );
};

export const PrintableBordereauModal: React.FC<PrintableBordereauModalProps> = ({
  order,
  orders,
  onClose,
}) => {
  const [paperFormat, setPaperFormat] = React.useState<'80mm' | 'A5'>('80mm');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const ordersList: PrintableOrderModel[] = orders && orders.length > 0 ? orders : order ? [order] : [];

  if (ordersList.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTicket = () => {
    const slipEl = document.querySelector('.print-container');
    if (!slipEl) return;

    const firstOrderId = ordersList[0]?.id || ordersList[0]?.orderId || 'bordereau';
    const htmlDoc = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bordereau KŪZA - ${firstOrderId}</title>
  <style>
    @page { size: ${paperFormat === '80mm' ? '80mm auto' : 'A5 auto'}; margin: 0mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: ${paperFormat === '80mm' ? '4mm 3mm' : '8mm 6mm'};
      background: #ffffff;
      color: #000000;
      font-family: 'Space Mono', 'Courier New', monospace;
      width: ${paperFormat === '80mm' ? '80mm' : '100%'};
      max-width: ${paperFormat === '80mm' ? '80mm' : '100%'};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    table { width: 100%; border-collapse: collapse; }
    .no-print { display: none !important; }
  </style>
</head>
<body>
  ${slipEl.innerHTML}
</body>
</html>`;

    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket_bordereau_kuza_${firstOrderId.toLowerCase()}_${paperFormat}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 lg:p-10 flex items-start justify-center min-h-screen">
      <style>{`
        /* Embedded Paper Texture */
        .paper-texture {
          background-color: #FAF9F6;
          background-image: 
            radial-gradient(#1c1b18 0.4px, transparent 0.4px),
            radial-gradient(#7c786e 0.3px, #FAF9F6 0.3px);
          background-size: 20px 20px;
          background-position: 0 0, 10px 10px;
        }

        /* Barcode pseudo-pattern using repeating linear gradients */
        .code128-barcode {
          background: repeating-linear-gradient(
            90deg,
            #111 0px,
            #111 1.5px,
            transparent 1.5px,
            transparent 3px,
            #111 3px,
            #111 5px,
            transparent 5px,
            transparent 6px,
            #111 6px,
            #111 7px,
            transparent 7px,
            transparent 10px,
            #111 10px,
            #111 13px,
            transparent 13px,
            transparent 15px,
            #111 15px,
            #111 16px,
            transparent 16px,
            transparent 19px,
            #111 19px,
            #111 21px,
            transparent 21px,
            transparent 24px,
            #111 24px,
            #111 25px,
            transparent 25px,
            transparent 27px,
            #111 27px,
            #111 30px,
            transparent 30px,
            transparent 32px
          );
        }

        /* Thermal or A5 Page Print Rules */
        @media print {
          /* 1. Force 80mm thermal roll format */
          @page {
            size: ${paperFormat === '80mm' ? '80mm auto' : 'A5 auto'};
            margin: 0mm;
          }

          /* 2. Hide everything in the document by default */
          body * {
            visibility: hidden !important;
          }

          /* 3. Hide non-printable UI elements explicitly */
          .no-print, header, nav, footer, button, backdrop, [data-purpose="modal-action-bar"], [data-purpose="modal-header"] {
            display: none !important;
          }

          /* 4. Strictly isolate the printable paper receipt */
          .print-container,
          .print-container * {
            visibility: visible !important;
          }

          .print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${paperFormat === '80mm' ? '80mm' : '100%'} !important;
            max-width: ${paperFormat === '80mm' ? '80mm' : '100%'} !important;
            padding: 4mm 3mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          .slip-page-break {
            page-break-after: always !important;
            break-after: page !important;
            margin-bottom: 8mm !important;
            padding-bottom: 8mm !important;
            border-bottom: 1px dashed #000000 !important;
          }
        }
      `}</style>

      {/* Centered Document Inner Container */}
      <div className={`relative w-full ${paperFormat === '80mm' ? 'max-w-2xl' : 'max-w-3xl'} my-auto z-10 flex flex-col items-center`}>
        {/* TopBar Controls (no-print) */}
        <header
          className="w-full flex items-center justify-between px-2 py-3 mb-2 text-xs font-mono tracking-widest uppercase text-zinc-400 no-print"
          data-purpose="modal-header"
        >
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-zinc-300 font-semibold">
              {ordersList.length > 1
                ? `BORDEREAUX D'EXPÉDITION (${ordersList.length} COLIS SÉLECTIONNÉS)`
                : "BORDEREAU D'EXPÉDITION V-COD"}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[11px]">
            {/* Format toggle: 80mm vs A5 */}
            <div className="flex items-center border border-zinc-700 bg-zinc-900 rounded overflow-hidden">
              <button
                type="button"
                onClick={() => setPaperFormat('80mm')}
                className={`px-2.5 py-1 text-[10px] transition-colors cursor-pointer ${
                  paperFormat === '80mm'
                    ? 'bg-zinc-200 text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                80mm Ticket
              </button>
              <button
                type="button"
                onClick={() => setPaperFormat('A5')}
                className={`px-2.5 py-1 text-[10px] transition-colors cursor-pointer ${
                  paperFormat === 'A5'
                    ? 'bg-zinc-200 text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                A5 Feuille
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-zinc-300 hover:text-white transition-colors duration-150 p-1 cursor-pointer ml-2"
              title="Fermer l'aperçu (Échap)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Printable Paper Document Container */}
        <main
          className="print-container w-full"
          data-purpose="dispatch-slip-document"
        >
          {ordersList.map((ord, idx) => (
            <SingleSlipDocument
              key={ord.id || ord.orderId || idx}
              order={ord}
              format={paperFormat}
              isLast={idx === ordersList.length - 1}
            />
          ))}
        </main>

        {/* Modal Action Buttons (no-print) */}
        <div
          className="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 no-print"
          data-purpose="modal-action-bar"
        >
          <button
            onClick={onClose}
            type="button"
            className="w-full sm:w-auto px-6 py-3 border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-150 active:scale-95 text-center cursor-pointer"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Fermer l'aperçu
          </button>

          <div className="flex w-full sm:w-auto items-center space-x-2">
            <button
              type="button"
              onClick={handleDownloadTicket}
              className="px-5 py-3 border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 font-sans text-xs font-semibold tracking-[0.2em] uppercase transition-all shadow-md cursor-pointer flex items-center gap-2"
              title="Télécharger le ticket bordereau autonome"
            >
              <Download className="w-4 h-4 text-[#B9A995]" />
              <span>Télécharger le ticket</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-7 py-3 bg-white hover:bg-zinc-100 text-black font-sans text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>
                {ordersList.length > 1
                  ? `Imprimer les ${ordersList.length} bordereaux (${paperFormat})`
                  : `Imprimer le bordereau (${paperFormat})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PrintableBordereauModal;
