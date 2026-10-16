import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Download,
  FileText,
  TrendingUp,
  ShoppingBag,
  Percent,
  Truck,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  BarChart3,
  Layers,
  MapPin,
  Sparkles,
  Info,
  DollarSign,
  Boxes,
  Eye,
  X
} from 'lucide-react';
import { OrderDetails, SalesTransaction } from '../types';
import { Product } from '../data/products';
import { KuzaMonogram } from './KuzaMonogram';
import { KuzaLogo } from './KuzaLogo';

export type AnalyticsPeriod = 'today' | '7days' | 'month' | 'quarter' | 'year2026' | 'custom';

interface CourierSettlement {
  id: string;
  name: string;
  deliveredCount: number;
  cashCollected: number;
  shippingFees: number;
  status: 'PAID' | 'PENDING';
  statusLabel: string;
  virementRef: string;
  virementDate: string;
  contact: string;
  coverage: string;
}

interface AdminAnalyticsProps {
  orders: OrderDetails[];
  salesHistory: SalesTransaction[];
  products: Product[];
  onOpenOrderModal?: (orderId: string) => void;
  showNotice?: (msg: string) => void;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  orders,
  salesHistory,
  products,
  onOpenOrderModal,
  showNotice,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('month');
  const [customStartDate, setCustomStartDate] = useState('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState('2026-10-31');
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [activeChartMetric, setActiveChartMetric] = useState<'both' | 'revenue' | 'orders'>('both');
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; revenue: number; orders: number; x: number; y: number } | null>(null);
  const [selectedCourierModal, setSelectedCourierModal] = useState<CourierSettlement | null>(null);

  // Period label helper
  const periodLabel = useMemo(() => {
    switch (selectedPeriod) {
      case 'today':
        return "Aujourd'hui (13 Octobre 2026)";
      case '7days':
        return '7 Derniers Jours (06 — 13 Octobre 2026)';
      case 'month':
        return 'Ce Mois (Octobre 2026)';
      case 'quarter':
        return 'Trimestre T4 2026';
      case 'year2026':
        return 'Année Fiscale 2026';
      case 'custom':
        return `Période Personnalisée (${customStartDate} au ${customEndDate})`;
      default:
        return 'Octobre 2026';
    }
  }, [selectedPeriod, customStartDate, customEndDate]);

  // Courier settlement data
  const courierSettlements: CourierSettlement[] = useMemo(
    () => [
      {
        id: 'CR-EXP-TUNIS',
        name: 'Coursier Express Tunis',
        deliveredCount: 105,
        cashCollected: 13650.0,
        shippingFees: 840.0,
        status: 'PAID',
        statusLabel: '✅ Fond Versé',
        virementRef: 'VIR-BIAT-88329-TN',
        virementDate: '11 Octobre 2026 à 14:30',
        contact: '+216 71 889 000 · contact@coursierexpress.tn',
        coverage: 'Grand Tunis (Tunis, Ariana, Ben Arous, Manouba)',
      },
      {
        id: 'ARAMEX-TN',
        name: 'Aramex Tunisie',
        deliveredCount: 24,
        cashCollected: 3120.0,
        shippingFees: 192.0,
        status: 'PENDING',
        statusLabel: '⏳ En Attente de Clôture',
        virementRef: 'CLOTURE-HEBDO-S41',
        virementDate: 'Échéance: 15 Octobre 2026',
        contact: '+216 71 160 800 · aramex.tn@aramex.com',
        coverage: 'Inter-Gouvernorats (Sousse, Monastir, Sfax, Nabeul)',
      },
      {
        id: 'DIR-BANLIEUE-NORD',
        name: 'Livraison Directe Banlieue Nord',
        deliveredCount: 13,
        cashCollected: 1680.0,
        shippingFees: 104.0,
        status: 'PAID',
        statusLabel: '✅ Fond Versé',
        virementRef: 'ENCAISS-ESP-ATELIER-04',
        virementDate: '12 Octobre 2026 à 18:00',
        contact: '+216 29 111 222 · Mehdi & Livreur Dédié',
        coverage: 'La Marsa, Carthage, Sidi Bou Saïd, Gammarth',
      },
    ],
    []
  );

  // Daily revenue & orders timeline data for Chart A
  const timelineData = useMemo(() => {
    return [
      { day: '01 Oct', label: 'Jeu 01', revenue: 1420, orders: 11 },
      { day: '03 Oct', label: 'Sam 03', revenue: 2180, orders: 17 },
      { day: '05 Oct', label: 'Lun 05', revenue: 1890, orders: 14 },
      { day: '07 Oct', label: 'Mer 07', revenue: 2650, orders: 20 },
      { day: '09 Oct', label: 'Ven 09', revenue: 3120, orders: 24 },
      { day: '11 Oct', label: 'Dim 11', revenue: 3840, orders: 29 },
      { day: '13 Oct', label: 'Mar 13', revenue: 3350, orders: 27 },
    ];
  }, []);

  // Regional breakdown data for Chart C
  const regionalData = useMemo(() => {
    return [
      { region: 'Grand Tunis (Tunis, Ariana, Marsa)', percent: 45, orders: 64, revenue: 8302.5, rank: '1' },
      { region: 'Sousse / Monastir / Sahel', percent: 22, orders: 31, revenue: 4059.0, rank: '2' },
      { region: 'Nabeul / Hammamet', percent: 14, orders: 20, revenue: 2583.0, rank: '3' },
      { region: 'Sfax & Sud Maritime', percent: 11, orders: 16, revenue: 2029.5, rank: '4' },
      { region: 'Autres Gouvernorats (Bizerte, etc.)', percent: 8, orders: 11, revenue: 1476.0, rank: '5' },
    ];
  }, []);

  // Matrix Heatmap Data: Size x Color for Chart D
  const matrixData = useMemo(() => {
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const colors = [
      { name: 'Noir Délavé (290 GSM)', hex: '#18181b', border: '#3f3f46' },
      { name: 'Beige Sable (290 GSM)', hex: '#b9a995', border: '#8c8275' },
    ];

    // percentage and units
    const cells: Record<string, { percent: number; count: number; recommendation: string }> = {
      'Noir Délavé (290 GSM)-XS': { percent: 3, count: 4, recommendation: 'Volume standard' },
      'Noir Délavé (290 GSM)-S': { percent: 12, count: 17, recommendation: 'Réassort régulier' },
      'Noir Délavé (290 GSM)-M': { percent: 34, count: 48, recommendation: '🔥 HAUTE DEMANDE - Priorité atelier' },
      'Noir Délavé (290 GSM)-L': { percent: 22, count: 31, recommendation: '🔥 HAUTE DEMANDE - Lot 290GSM' },
      'Noir Délavé (290 GSM)-XL': { percent: 9, count: 13, recommendation: 'Volume standard' },
      'Noir Délavé (290 GSM)-XXL': { percent: 4, count: 6, recommendation: 'Petite série' },

      'Beige Sable (290 GSM)-XS': { percent: 2, count: 3, recommendation: 'Petite série' },
      'Beige Sable (290 GSM)-S': { percent: 10, count: 14, recommendation: 'Réassort régulier' },
      'Beige Sable (290 GSM)-M': { percent: 18, count: 26, recommendation: 'Forte rotation' },
      'Beige Sable (290 GSM)-L': { percent: 28, count: 40, recommendation: '🔥 HAUTE DEMANDE - Priorité découpe' },
      'Beige Sable (290 GSM)-XL': { percent: 7, count: 10, recommendation: 'Volume standard' },
      'Beige Sable (290 GSM)-XXL': { percent: 3, count: 4, recommendation: 'Petite série' },
    };

    return { sizes, colors, cells };
  }, []);

  // CSV Export Function
  const handleExportCsv = () => {
    try {
      const headers = ['Catégorie', 'Métrique', 'Valeur', 'Détails & Commentaires'];
      const rows = [
        ['KPI', "Chiffre d'Affaires Global", '18450.000 DT', 'Nets Articles: 16 850,000 DT | Port: 1 600,000 DT (+18.4%)'],
        ['KPI', 'Volume Commandes', '142', 'Panier Moyen: 130,000 DT | 98.2% COD'],
        ['KPI', 'Taux Conversion Bundle (135 DT)', '64.8%', '92 ensembles complets vendus | 2 668,000 DT remise accordée'],
        ['KPI', 'Recouvrement & Retours', '94.2%', '17 200,000 DT encaissé | 1 250,000 DT en cours transporteur'],
        ['LIVREUR', 'Coursier Express Tunis', '13650.000 DT', '105 colis livrés | Port: 840,000 DT | Fond Versé VIR-BIAT-88329-TN'],
        ['LIVREUR', 'Aramex Tunisie', '3120.000 DT', '24 colis livrés | Port: 192,000 DT | En attente clôture'],
        ['LIVREUR', 'Livraison Directe Banlieue Nord', '1680.000 DT', '13 colis livrés | Port: 104,000 DT | Fond Versé'],
        ['RÉGION', 'Grand Tunis', '45% (8302.500 DT)', '64 Commandes'],
        ['RÉGION', 'Sousse / Monastir', '22% (4059.000 DT)', '31 Commandes'],
        ['RÉGION', 'Nabeul / Hammamet', '14% (2583.000 DT)', '20 Commandes'],
        ['RÉGION', 'Sfax', '11% (2029.500 DT)', '16 Commandes'],
        ['RÉGION', 'Autres', '8% (1476.000 DT)', '11 Commandes'],
        ['PRODUIT', 'Ensemble Full KŪZA', '65%', '92 packs vendus (12 420,000 DT)'],
        ['PRODUIT', 'Shelter Sweat Seul', '20%', '31 pièces vendues (2 449,000 DT)'],
        ['PRODUIT', 'Rest Wide Seul', '15%', '23 pièces vendues (1 981,000 DT)'],
      ];

      const csvContent =
        '\uFEFF' +
        [headers.join(';'), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(';'))].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `kuza_analytics_financier_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (showNotice) showNotice('Export CSV des données analytiques téléchargé avec succès');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la génération du CSV.');
    }
  };

  // PDF Financial Report Printable Window
  const handleExportPdf = () => {
    const printWindow = window.open('', '_blank', 'width=920,height=1000');
    if (!printWindow) {
      alert('Veuillez autoriser les fenêtres pop-up pour générer le rapport financier PDF.');
      return;
    }

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>KŪZA · RAPPORT FINANCIER & ANALYTICS D'ATELIER</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #ffffff;
      color: #18181b;
      margin: 0;
      padding: 24px;
      line-height: 1.45;
      font-size: 13px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #18181b;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-family: 'Optima', 'Didot', serif;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #18181b;
    }
    .brand-sub {
      font-size: 11px;
      color: #71717a;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .doc-meta { text-align: right; }
    .doc-title {
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #047857;
    }
    .doc-date { font-family: monospace; font-size: 11px; color: #71717a; margin-top: 4px; }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .kpi-box {
      border: 1px solid #e4e4e7;
      background: #fafafa;
      padding: 12px;
      border-radius: 4px;
    }
    .kpi-label {
      font-size: 9px;
      font-family: monospace;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #71717a;
      margin-bottom: 6px;
    }
    .kpi-val {
      font-family: monospace;
      font-size: 18px;
      font-weight: 700;
      color: #18181b;
      margin-bottom: 4px;
    }
    .kpi-sub { font-size: 10px; color: #047857; font-weight: 600; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 12px;
    }
    th {
      background: #f4f4f5;
      color: #3f3f46;
      font-family: monospace;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.1em;
      padding: 8px 10px;
      text-align: left;
      border-bottom: 1px solid #d4d4d8;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #e4e4e7;
      color: #27272a;
    }
    .footer-stamp {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e4e4e7;
      padding-top: 20px;
      margin-top: 30px;
    }
    .stamp-box {
      border: 2px dashed #047857;
      padding: 8px 16px;
      font-family: monospace;
      font-size: 11px;
      color: #047857;
      text-transform: uppercase;
      text-align: center;
      letter-spacing: 0.1em;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">KŪZA</div>
      <div class="brand-sub">Directoire Atelier Confection · Tunis 🇹🇳</div>
      <div style="font-size: 10px; color: #a1a1aa; margin-top: 3px;">Registre Financier & Audit des Flux Transporteurs</div>
    </div>
    <div class="doc-meta">
      <div class="doc-title">Rapport d'Audit Financier</div>
      <div class="doc-date">Période : ${periodLabel}</div>
      <div class="doc-date">Généré le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-box">
      <div class="kpi-label">Chiffre d'Affaires Global</div>
      <div class="kpi-val">18 450,000 DT</div>
      <div class="kpi-sub">+18.4% vs mois dernier</div>
      <div style="font-size: 9px; color: #71717a; margin-top: 2px;">Articles: 16 850 DT | Port: 1 600 DT</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Commandes & Panier Moyen</div>
      <div class="kpi-val">142 Commandes</div>
      <div class="kpi-sub">Panier Moyen: 130,000 DT</div>
      <div style="font-size: 9px; color: #71717a; margin-top: 2px;">98.2% en Cash on Delivery (COD)</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Conversion Ensemble 135 DT</div>
      <div class="kpi-val">64.8%</div>
      <div class="kpi-sub">92 Ensembles Vendus</div>
      <div style="font-size: 9px; color: #71717a; margin-top: 2px;">Remise accordée: 2 668,000 DT</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Recouvrement Transport</div>
      <div class="kpi-val">94.2% Encaissé</div>
      <div class="kpi-sub">Taux de Retour : 3.1%</div>
      <div style="font-size: 9px; color: #71717a; margin-top: 2px;">En cours chez livreurs: 1 250 DT</div>
    </div>
  </div>

  <h3 style="font-family: monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px; color: #18181b;">
    1. Réconciliation des Flux Financiers & Livreurs Partenaires
  </h3>
  <table>
    <thead>
      <tr>
        <th>Partenaire Livreur</th>
        <th style="text-align: center;">Colis Livrés</th>
        <th style="text-align: right;">Cash Collecté</th>
        <th style="text-align: right;">Frais de Port</th>
        <th>Statut Virement</th>
        <th>Réf. Bordereau</th>
      </tr>
    </thead>
    <tbody>
      ${courierSettlements
        .map(
          (c) => `
      <tr>
        <td><strong>${c.name}</strong><br/><span style="font-size: 10px; color: #71717a;">${c.coverage}</span></td>
        <td style="text-align: center; font-family: monospace; font-weight: 700;">${c.deliveredCount}</td>
        <td style="text-align: right; font-family: monospace; font-weight: 700; color: #047857;">${c.cashCollected.toFixed(3).replace('.', ',')} DT</td>
        <td style="text-align: right; font-family: monospace;">${c.shippingFees.toFixed(3).replace('.', ',')} DT</td>
        <td><span style="font-family: monospace; font-weight: 700; color: ${c.status === 'PAID' ? '#047857' : '#d97706'};">${c.statusLabel}</span></td>
        <td style="font-family: monospace; font-size: 11px;">${c.virementRef}</td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h3 style="font-family: monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px; color: #18181b;">
    2. Répartition Régionale & Performance Produits
  </h3>
  <table>
    <thead>
      <tr>
        <th>Zone / Gouvernorat</th>
        <th style="text-align: center;">Part (%)</th>
        <th style="text-align: center;">Volume Commandes</th>
        <th style="text-align: right;">Chiffre d'Affaires</th>
      </tr>
    </thead>
    <tbody>
      ${regionalData
        .map(
          (r) => `
      <tr>
        <td><strong>#${r.rank} ${r.region}</strong></td>
        <td style="text-align: center; font-family: monospace; font-weight: 700;">${r.percent}%</td>
        <td style="text-align: center; font-family: monospace;">${r.orders} colis</td>
        <td style="text-align: right; font-family: monospace; font-weight: 700;">${r.revenue.toFixed(3).replace('.', ',')} DT</td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer-stamp">
    <div>
      <div style="font-weight: 700; text-transform: uppercase; font-size: 11px;">Contrôle de Gestion KŪZA Haute Maison</div>
      <div style="font-size: 10px; color: #71717a;">Audit validé par : Maître Mehdi — Directoire Opérationnel Tunis</div>
    </div>
    <div class="stamp-box">
      ✓ VISA DIRECTOIRE STOCK & LOGISTIQUE<br/>
      RAPPORT CERTIFIÉ CONFORME
    </div>
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="background: #18181b; color: #ffffff; border: none; padding: 12px 28px; font-family: monospace; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; font-weight: 700;">
      Imprimer / Télécharger en PDF
    </button>
  </div>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#E8E4DD] pb-16">
      {/* 1. TOP CONTROL TOOLBAR & FILTERS */}
      <div className="bg-[#141414] border border-[#34312D] p-4 sm:p-5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shadow-xl">
        {/* Left: Section Title & Date Filter Chips */}
        <div className="space-y-3 w-full xl:w-auto">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-[#B9A995]" />
            <span
              className="text-base sm:text-lg font-serif tracking-[0.2em] uppercase text-[#E8E4DD]"
              style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
            >
              DIRECTOIRE FINANCIER & ANALYTICS
            </span>
            <span className="text-xs font-mono text-[#8C8275] bg-[#181818] px-2 py-0.5 border border-[#34312D] hidden md:inline">
              SS25
            </span>
          </div>

          {/* Date range filter buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'today', label: "Aujourd'hui" },
              { id: '7days', label: '7 Derniers Jours' },
              { id: 'month', label: 'Ce Mois' },
              { id: 'quarter', label: 'Trimestre' },
              { id: 'year2026', label: 'Année 2026' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedPeriod(tab.id as AnalyticsPeriod);
                  setIsCustomDateOpen(false);
                }}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                  selectedPeriod === tab.id
                    ? 'bg-[#B9A995] text-[#101010] border-[#B9A995] font-bold shadow-md'
                    : 'bg-[#181818] text-[#A0988E] border-[#34312D] hover:text-[#E8E4DD] hover:border-[#B9A995]'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={() => {
                setSelectedPeriod('custom');
                setIsCustomDateOpen(!isCustomDateOpen);
              }}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 border ${
                selectedPeriod === 'custom'
                  ? 'bg-[#B9A995] text-[#101010] border-[#B9A995] font-bold shadow-md'
                  : 'bg-[#181818] text-[#A0988E] border-[#34312D] hover:text-[#E8E4DD] hover:border-[#B9A995]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Personnalisé</span>
            </button>
          </div>

          {/* Custom Date Inputs Dropdown */}
          {isCustomDateOpen && (
            <div className="p-3 bg-[#181818] border border-[#34312D] flex flex-wrap items-center gap-3 text-xs font-mono animate-fadeIn">
              <span className="text-[#96918A]">Du :</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-[#101010] border border-[#34312D] px-2 py-1 text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none"
              />
              <span className="text-[#96918A]">Au :</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-[#101010] border border-[#34312D] px-2 py-1 text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none"
              />
              <button
                onClick={() => {
                  if (showNotice) showNotice(`Période filtrée : ${customStartDate} au ${customEndDate}`);
                  setIsCustomDateOpen(false);
                }}
                className="px-2.5 py-1 bg-[#E8E4DD] text-[#101010] font-bold hover:bg-[#B9A995] transition-colors"
              >
                Appliquer
              </button>
            </div>
          )}
        </div>

        {/* Right: Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto xl:justify-end">
          {/* Button 1: Solid Ivory PDF Export */}
          <button
            onClick={handleExportPdf}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-mono uppercase tracking-wider font-bold transition-all shadow-md cursor-pointer"
            title="Générer le rapport PDF certifié de gestion stock"
          >
            <FileText className="w-4 h-4 text-[#101010]" />
            <span>📄 EXPORTER RAPPORT FINANCIER (PDF)</span>
          </button>

          {/* Button 2: Outlined Beige CSV Export */}
          <button
            onClick={handleExportCsv}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-[#181818] hover:bg-[#202020] text-[#B9A995] hover:text-[#E8E4DD] border border-[#B9A995] text-xs font-mono uppercase tracking-wider font-semibold transition-all shadow-sm cursor-pointer"
            title="Exporter l'ensemble des données au format CSV"
          >
            <Download className="w-4 h-4 text-[#B9A995]" />
            <span>📊 EXPORTER DONNÉES CSV</span>
          </button>
        </div>
      </div>

      {/* 2. HIGH-IMPACT KPI CARDS ROW (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: CHIFFRE D'AFFAIRES GLOBAL */}
        <div className="bg-[#181818] border border-[#34312D] p-5 relative overflow-hidden group hover:border-[#B9A995] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#96918A]">
              CHIFFRE D'AFFAIRES GLOBAL
            </span>
            <div className="p-1.5 bg-[#141414] border border-[#34312D] text-[#34D399]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div
            className="text-2xl sm:text-3xl font-mono font-bold text-[#E8E4DD] tracking-tight mb-2"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            18 450,000 DT
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#34D399] font-mono font-semibold mb-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs mois dernier</span>
          </div>

          <p className="text-[11px] text-[#96918A] font-mono leading-relaxed border-t border-[#34312D]/60 pt-2 mt-2">
            Nets Articles: <strong className="text-[#E8E4DD]">16 850,000 DT</strong> · Port: <strong className="text-[#B9A995]">1 600,000 DT</strong>
          </p>
        </div>

        {/* CARD 2: COMMANDES & PANIER MOYEN (AOV) */}
        <div className="bg-[#181818] border border-[#34312D] p-5 relative overflow-hidden group hover:border-[#B9A995] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#96918A]">
              COMMANDES & PANIER MOYEN (AOV)
            </span>
            <div className="p-1.5 bg-[#141414] border border-[#34312D] text-[#B9A995]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>

          <div
            className="text-2xl sm:text-3xl font-mono font-bold text-[#E8E4DD] tracking-tight mb-2"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            142 Commandes
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#B9A995] font-mono font-semibold mb-1">
            <span>Panier Moyen :</span>
            <strong className="text-[#E8E4DD]">130,000 DT</strong>
          </div>

          <p className="text-[11px] text-[#96918A] font-mono leading-relaxed border-t border-[#34312D]/60 pt-2 mt-2">
            <strong className="text-emerald-400">98.2%</strong> en Cash on Delivery (COD) · 1.8% Retraits
          </p>
        </div>

        {/* CARD 3: TAUX DE CONVERSION BUNDLE (SET 135 DT) */}
        <div className="bg-[#181818] border border-[#34312D] p-5 relative overflow-hidden group hover:border-[#B9A995] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#96918A]">
              CONVERSION BUNDLE (SET 135 DT)
            </span>
            <div className="p-1.5 bg-[#141414] border border-[#34312D] text-amber-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>

          <div
            className="text-2xl sm:text-3xl font-mono font-bold text-amber-300 tracking-tight mb-2"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            64.8%
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#E8E4DD] font-mono font-semibold mb-1">
            <span>92 Ensembles complets vendus</span>
          </div>

          <p className="text-[11px] text-[#96918A] font-mono leading-relaxed border-t border-[#34312D]/60 pt-2 mt-2">
            Remise totale accordée : <strong className="text-amber-400">2 668,000 DT</strong>
          </p>
        </div>

        {/* CARD 4: RECOUVREMENT & RETOURS LIVREUR */}
        <div className="bg-[#181818] border border-[#34312D] p-5 relative overflow-hidden group hover:border-[#B9A995] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#96918A]">
              RECOUVREMENT & RETOURS LIVREUR
            </span>
            <div className="p-1.5 bg-[#141414] border border-[#34312D] text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>

          <div
            className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tracking-tight mb-2"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            94.2% Encaissé
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#96918A] font-mono mb-1">
            <span>Taux de retour :</span>
            <strong className="text-emerald-400 font-bold">3.1%</strong>
            <span className="text-[10px] text-[#8C8275]">(Excellence sectorielle)</span>
          </div>

          <p className="text-[11px] text-[#96918A] font-mono leading-relaxed border-t border-[#34312D]/60 pt-2 mt-2">
            En cours chez livreurs : <strong className="text-amber-300">1 250,000 DT</strong>
          </p>
        </div>
      </div>

      {/* 3. INTERACTIVE CHARTS GRID (CARDS A, B, C, D) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART A (COL 1 & 2): ÉVOLUTION DU CA ET COMMANDES (Interactive Area / Bar Chart) */}
        <div className="lg:col-span-2 bg-[#181818] border border-[#34312D] p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#34312D] pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#B9A995] block">
                CHART A · COURBE DE PERFORMANCE
              </span>
              <h3
                className="text-lg font-serif text-[#E8E4DD] tracking-wide mt-0.5"
                style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
              >
                Évolution du Chiffre d'Affaires & Commandes
              </h3>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center gap-1.5 bg-[#141414] border border-[#34312D] p-1">
              <button
                onClick={() => setActiveChartMetric('both')}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                  activeChartMetric === 'both' ? 'bg-[#E8E4DD] text-[#101010] font-bold' : 'text-[#96918A] hover:text-[#E8E4DD]'
                }`}
              >
                Vue Mixte
              </button>
              <button
                onClick={() => setActiveChartMetric('revenue')}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                  activeChartMetric === 'revenue' ? 'bg-[#B9A995] text-[#101010] font-bold' : 'text-[#96918A] hover:text-[#E8E4DD]'
                }`}
              >
                CA (DT)
              </button>
              <button
                onClick={() => setActiveChartMetric('orders')}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                  activeChartMetric === 'orders' ? 'bg-[#34D399] text-[#101010] font-bold' : 'text-[#96918A] hover:text-[#E8E4DD]'
                }`}
              >
                Volume Colis
              </button>
            </div>
          </div>

          {/* SVG Canvas for Chart A */}
          <div className="relative pt-2">
            <div className="h-64 sm:h-72 w-full relative">
              <svg viewBox="0 0 700 260" className="w-full h-full overflow-visible">
                <defs>
                  {/* Gradient for Revenue Area */}
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B9A995" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#B9A995" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#B9A995" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Gradient for Orders Bars */}
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#34D399" stopOpacity="0.15" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                {[40, 90, 140, 190, 240].map((y, idx) => (
                  <g key={y}>
                    <line x1="50" y1={y} x2="680" y2={y} stroke="#34312D" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.6" />
                    <text x="40" y={y + 4} fill="#8C8275" fontSize="10" fontFamily="monospace" textAnchor="end">
                      {idx === 0 ? '4 000 DT' : idx === 1 ? '3 000 DT' : idx === 2 ? '2 000 DT' : idx === 3 ? '1 000 DT' : '0 DT'}
                    </text>
                  </g>
                ))}

                {/* Vertical Order Volume Bars in background (if active) */}
                {(activeChartMetric === 'both' || activeChartMetric === 'orders') &&
                  timelineData.map((d, i) => {
                    const cx = 95 + i * 90;
                    const barHeight = (d.orders / 35) * 180;
                    const by = 240 - barHeight;
                    return (
                      <g key={`bar-${i}`}>
                        <rect
                          x={cx - 16}
                          y={by}
                          width="32"
                          height={barHeight}
                          fill="url(#barGradient)"
                          rx="2"
                          className="transition-all duration-300 hover:opacity-100 cursor-pointer"
                          opacity="0.85"
                          onMouseEnter={() => setHoveredPoint({ date: d.label, revenue: d.revenue, orders: d.orders, x: cx, y: by })}
                        />
                      </g>
                    );
                  })}

                {/* Smooth Area & Path for Revenue */}
                {(activeChartMetric === 'both' || activeChartMetric === 'revenue') && (
                  <>
                    {/* SVG Closed Area */}
                    <path
                      d={`
                        M 95,${240 - (timelineData[0].revenue / 4200) * 200}
                        C 140,${240 - (timelineData[0].revenue / 4200) * 200} 150,${240 - (timelineData[1].revenue / 4200) * 200} 185,${240 - (timelineData[1].revenue / 4200) * 200}
                        C 220,${240 - (timelineData[1].revenue / 4200) * 200} 240,${240 - (timelineData[2].revenue / 4200) * 200} 275,${240 - (timelineData[2].revenue / 4200) * 200}
                        C 310,${240 - (timelineData[2].revenue / 4200) * 200} 330,${240 - (timelineData[3].revenue / 4200) * 200} 365,${240 - (timelineData[3].revenue / 4200) * 200}
                        C 400,${240 - (timelineData[3].revenue / 4200) * 200} 420,${240 - (timelineData[4].revenue / 4200) * 200} 455,${240 - (timelineData[4].revenue / 4200) * 200}
                        C 490,${240 - (timelineData[4].revenue / 4200) * 200} 510,${240 - (timelineData[5].revenue / 4200) * 200} 545,${240 - (timelineData[5].revenue / 4200) * 200}
                        C 580,${240 - (timelineData[5].revenue / 4200) * 200} 600,${240 - (timelineData[6].revenue / 4200) * 200} 635,${240 - (timelineData[6].revenue / 4200) * 200}
                        L 635,240 L 95,240 Z
                      `}
                      fill="url(#areaGradient)"
                    />

                    {/* Top Golden Stroke */}
                    <path
                      d={`
                        M 95,${240 - (timelineData[0].revenue / 4200) * 200}
                        C 140,${240 - (timelineData[0].revenue / 4200) * 200} 150,${240 - (timelineData[1].revenue / 4200) * 200} 185,${240 - (timelineData[1].revenue / 4200) * 200}
                        C 220,${240 - (timelineData[1].revenue / 4200) * 200} 240,${240 - (timelineData[2].revenue / 4200) * 200} 275,${240 - (timelineData[2].revenue / 4200) * 200}
                        C 310,${240 - (timelineData[2].revenue / 4200) * 200} 330,${240 - (timelineData[3].revenue / 4200) * 200} 365,${240 - (timelineData[3].revenue / 4200) * 200}
                        C 400,${240 - (timelineData[3].revenue / 4200) * 200} 420,${240 - (timelineData[4].revenue / 4200) * 200} 455,${240 - (timelineData[4].revenue / 4200) * 200}
                        C 490,${240 - (timelineData[4].revenue / 4200) * 200} 510,${240 - (timelineData[5].revenue / 4200) * 200} 545,${240 - (timelineData[5].revenue / 4200) * 200}
                        C 580,${240 - (timelineData[5].revenue / 4200) * 200} 600,${240 - (timelineData[6].revenue / 4200) * 200} 635,${240 - (timelineData[6].revenue / 4200) * 200}
                      `}
                      fill="none"
                      stroke="#B9A995"
                      strokeWidth="2.5"
                    />

                    {/* Interactive Circles */}
                    {timelineData.map((d, i) => {
                      const cx = 95 + i * 90;
                      const cy = 240 - (d.revenue / 4200) * 200;
                      return (
                        <circle
                          key={`dot-${i}`}
                          cx={cx}
                          cy={cy}
                          r="5"
                          fill="#181818"
                          stroke="#E8E4DD"
                          strokeWidth="2"
                          className="cursor-pointer hover:r-7 transition-all"
                          onMouseEnter={() => setHoveredPoint({ date: d.label, revenue: d.revenue, orders: d.orders, x: cx, y: cy })}
                        />
                      );
                    })}
                  </>
                )}

                {/* X-Axis Day Labels */}
                {timelineData.map((d, i) => {
                  const cx = 95 + i * 90;
                  return (
                    <text key={`lbl-${i}`} x={cx} y={258} fill="#96918A" fontSize="11" fontFamily="monospace" textAnchor="middle">
                      {d.label}
                    </text>
                  );
                })}
              </svg>

              {/* Floating Tooltip Box */}
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none bg-[#101010]/95 border border-[#B9A995] p-3 text-xs font-mono shadow-2xl z-20"
                  style={{
                    left: `${(hoveredPoint.x / 700) * 100}%`,
                    top: `${Math.max(10, (hoveredPoint.y / 260) * 100 - 35)}%`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <div className="font-bold text-[#E8E4DD] border-b border-[#34312D] pb-1 mb-1">
                    {hoveredPoint.date} 2026
                  </div>
                  <div className="text-[#B9A995]">
                    CA : <strong>{hoveredPoint.revenue.toFixed(3).replace('.', ',')} DT</strong>
                  </div>
                  <div className="text-emerald-400">
                    Volume : <strong>{hoveredPoint.orders} colis expédiés</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Graph Legend & Status bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#34312D]/60 text-xs font-mono text-[#96918A]">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#B9A995]" />
                <span>Chiffre d'Affaires en Dinars (Aire beige)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#34D399]" />
                <span>Volume de Commandes (Barres vertes)</span>
              </div>
            </div>
            <span className="text-[#B9A995]">Moyenne Quotidienne : 2 635,700 DT / jour</span>
          </div>
        </div>

        {/* CHART B (COL 3): RÉPARTITION PAR PRODUIT ET BUNDLE (Donut Chart) */}
        <div className="bg-[#181818] border border-[#34312D] p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="border-b border-[#34312D] pb-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#B9A995] block">
              CHART B · VENTILATION ARTICLES
            </span>
            <h3
              className="text-lg font-serif text-[#E8E4DD] tracking-wide mt-0.5"
              style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
            >
              Répartition par Produit & Bundle
            </h3>
          </div>

          {/* Donut SVG Visual */}
          <div className="relative flex items-center justify-center my-auto py-2">
            <svg viewBox="0 0 200 200" className="w-44 h-44 sm:w-48 sm:h-48 transform -rotate-90">
              {/* Total Circumference for r=70 is 2*PI*70 = 439.82 */}
              {/* Segment 1: Ensemble Full KŪZA 65% -> strokeDasharray: 285.88 439.82 */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#B9A995"
                strokeWidth="24"
                strokeDasharray="285.88 439.82"
                strokeDashoffset="0"
                className="hover:stroke-[#E8E4DD] transition-all cursor-pointer"
              />
              {/* Segment 2: Shelter Sweat Seul 20% -> 87.96 439.82 */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#E8E4DD"
                strokeWidth="24"
                strokeDasharray="87.96 439.82"
                strokeDashoffset="-285.88"
                className="hover:stroke-white transition-all cursor-pointer"
              />
              {/* Segment 3: Rest Wide Seul 15% -> 65.97 439.82 */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#4A453E"
                strokeWidth="24"
                strokeDasharray="65.97 439.82"
                strokeDashoffset="-373.84"
                className="hover:stroke-[#6E675D] transition-all cursor-pointer"
              />
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#96918A]">PACK SET</span>
              <span className="text-2xl font-mono font-bold text-[#E8E4DD]">65%</span>
              <span className="text-[10px] font-mono text-[#B9A995]">PREMIÈRE VENTE</span>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="space-y-2.5 border-t border-[#34312D]/60 pt-3 text-xs font-mono">
            <div className="flex items-center justify-between p-2 bg-[#141414] border border-[#34312D]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#B9A995] rounded-full" />
                <span className="font-semibold text-[#E8E4DD]">Ensemble Full KŪZA</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#B9A995]">65%</span>
                <span className="text-[10px] text-[#96918A] ml-1.5">(92 packs · 12 420 DT)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-[#141414] border border-[#34312D]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#E8E4DD] rounded-full" />
                <span className="text-[#E8E4DD]">Shelter Sweat Seul</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#E8E4DD]">20%</span>
                <span className="text-[10px] text-[#96918A] ml-1.5">(31 pcs · 2 449 DT)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-[#141414] border border-[#34312D]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#4A453E] rounded-full" />
                <span className="text-[#A0988E]">Rest Wide Seul</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#A0988E]">15%</span>
                <span className="text-[10px] text-[#96918A] ml-1.5">(23 pcs · 1 981 DT)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CHARTS C & D (REGIONAL RANKINGS & STACKED HEATMAP GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART C: TOP GOUVERNORATS EN TUNISIE */}
        <div className="bg-[#181818] border border-[#34312D] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#34312D] pb-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#B9A995] block">
                CHART C · GÉOGRAPHIE & FLUX COD
              </span>
              <h3
                className="text-lg font-serif text-[#E8E4DD] tracking-wide mt-0.5"
                style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
              >
                Top Gouvernorats en Tunisie
              </h3>
            </div>
            <div className="p-1.5 bg-[#141414] border border-[#34312D] text-[#B9A995]">
              <MapPin className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-3.5 pt-1">
            {regionalData.map((reg) => (
              <div key={reg.region} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#141414] border border-[#34312D] rounded-full flex items-center justify-center font-bold text-[#B9A995]">
                      {reg.rank}
                    </span>
                    <span className="font-semibold text-[#E8E4DD]">{reg.region}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#E8E4DD]">{reg.percent}%</span>
                    <span className="text-[#96918A] ml-2 font-light">
                      ({reg.orders} colis · {reg.revenue.toFixed(3).replace('.', ',')} DT)
                    </span>
                  </div>
                </div>

                {/* Progress Bar with Luxury Golden Fill */}
                <div className="w-full h-2 bg-[#121212] border border-[#34312D] rounded-xs overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#B9A995] to-[#E8E4DD] transition-all duration-500"
                    style={{ width: `${reg.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#141414] border border-[#34312D] text-xs font-mono text-[#96918A] flex items-center justify-between">
            <span>Délai d'acheminement moyen :</span>
            <span className="text-emerald-400 font-bold">24h à 48h chrono partout en Tunisie</span>
          </div>
        </div>

        {/* CHART D: STACKED HEATMAP GRID (PERFORMANCE TAILLES & COULEURS) */}
        <div className="bg-[#181818] border border-[#34312D] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#34312D] pb-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#B9A995] block">
                CHART D · MATRICE DE COUPE ATELIER
              </span>
              <h3
                className="text-lg font-serif text-[#E8E4DD] tracking-wide mt-0.5"
                style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
              >
                Performance Tailles & Couleurs (Heatmap)
              </h3>
            </div>
            <div className="p-1.5 bg-[#141414] border border-[#34312D] text-[#B9A995]">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          {/* Matrix Heatmap Table */}
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[#34312D]">
                  <th className="text-left py-2 px-2 text-[#96918A] uppercase">Variante / Étoffe</th>
                  {matrixData.sizes.map((s) => (
                    <th key={s} className="text-center py-2 px-2 text-[#B9A995] font-bold">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34312D]/60">
                {matrixData.colors.map((c) => (
                  <tr key={c.name} className="hover:bg-[#151515] transition-colors">
                    <td className="py-2.5 px-2 font-medium text-[#E8E4DD] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border shrink-0"
                          style={{ backgroundColor: c.hex, borderColor: c.border }}
                        />
                        <span>{c.name}</span>
                      </div>
                    </td>

                    {matrixData.sizes.map((s) => {
                      const key = `${c.name}-${s}`;
                      const cell = matrixData.cells[key] || { percent: 0, count: 0, recommendation: '' };
                      const isHot = cell.percent >= 20;
                      const isMed = cell.percent >= 10 && cell.percent < 20;

                      return (
                        <td key={s} className="py-2.5 px-2 text-center">
                          <div
                            title={`${c.name} [Taille ${s}] : ${cell.percent}% (${cell.count} pièces) — ${cell.recommendation}`}
                            className={`py-1.5 px-2 rounded-xs transition-all cursor-pointer border ${
                              isHot
                                ? 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/40 font-bold ring-1 ring-[#34D399]/30'
                                : isMed
                                ? 'bg-[#B9A995]/20 text-[#B9A995] border-[#B9A995]/40 font-semibold'
                                : 'bg-[#141414] text-[#8C8275] border-[#34312D]'
                            }`}
                          >
                            <span className="block text-xs">{cell.percent}%</span>
                            <span className="text-[10px] block opacity-75">{cell.count}p</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actionable Atelier Recommendation */}
          <div className="p-3 bg-[#141414] border border-[#B9A995]/40 text-xs font-mono text-[#E8E4DD] space-y-1">
            <div className="flex items-center gap-1.5 text-[#B9A995] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>RECOMMANDATION PRODUCTION ATELIER :</span>
            </div>
            <p className="text-[#96918A]">
              Pic de demande soutenu sur <strong className="text-[#E8E4DD]">M Noir (34%)</strong> et{' '}
              <strong className="text-[#E8E4DD]">L Beige (28%)</strong>. Prioriser la découpe du lot{' '}
              <strong className="text-[#B9A995]">LOT-290GSM-04</strong> pour éviter tout risque de rupture.
            </p>
          </div>
        </div>
      </div>

      {/* 5. FINANCIAL & COURIER CASH FLOW SUMMARY TABLE */}
      <div className="bg-[#181818] border border-[#34312D] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#34312D] pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#B9A995] block">
              GESTION LOGISTIQUE & ENCAISSEMENTS
            </span>
            <h3
              className="text-lg font-serif text-[#E8E4DD] tracking-wide mt-0.5"
              style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
            >
              Suivi Financier & Recouvrement des Transporteurs
            </h3>
          </div>

          <div className="text-xs font-mono text-[#96918A] bg-[#141414] px-3 py-1.5 border border-[#34312D]">
            Total Collecté Réseau : <strong className="text-[#34D399]">18 450,000 DT</strong>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#34312D] text-[#96918A] uppercase">
                <th className="py-3 px-3">Partenaire Livreur</th>
                <th className="py-3 px-3 text-center">Colis Livrés</th>
                <th className="py-3 px-3 text-right">Cash Collecté</th>
                <th className="py-3 px-3 text-right">Frais Port</th>
                <th className="py-3 px-3">Statut Virement</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#34312D]/60">
              {courierSettlements.map((c) => (
                <tr key={c.id} className="hover:bg-[#141414] transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-[#E8E4DD]">{c.name}</div>
                    <div className="text-[10px] text-[#96918A]">{c.coverage}</div>
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold text-[#E8E4DD]">
                    {c.deliveredCount}
                  </td>

                  <td className="py-3.5 px-3 text-right font-bold text-emerald-400">
                    {c.cashCollected.toFixed(3).replace('.', ',')} DT
                  </td>

                  <td className="py-3.5 px-3 text-right text-[#96918A]">
                    {c.shippingFees.toFixed(3).replace('.', ',')} DT
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold border ${
                        c.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {c.statusLabel}
                    </span>
                    <div className="text-[10px] text-[#8C8275] mt-0.5">{c.virementRef}</div>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedCourierModal(c)}
                      className="px-2.5 py-1 bg-[#141414] hover:bg-[#B9A995] text-[#B9A995] hover:text-[#101010] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COURIER DETAILS MODAL */}
      {selectedCourierModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedCourierModal(null)}
        >
          <div
            className="bg-[#181818] border border-[#B9A995] max-w-lg w-full p-6 space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCourierModal(null)}
              className="absolute top-4 right-4 p-1.5 text-[#96918A] hover:text-[#E8E4DD] border border-[#34312D] hover:border-[#B9A995] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#34312D] pb-4">
              <div className="p-2 bg-[#141414] border border-[#34312D] text-[#B9A995]">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#B9A995] uppercase block">
                  BORDEREAU DE RECOUVREMENT
                </span>
                <h3
                  className="text-lg font-serif text-[#E8E4DD]"
                  style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
                >
                  {selectedCourierModal.name}
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs font-mono text-[#E8E4DD]">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#141414] border border-[#34312D]">
                <div>
                  <span className="text-[#96918A] block">Colis Livrés & Encaissés :</span>
                  <strong className="text-base text-[#E8E4DD]">{selectedCourierModal.deliveredCount}</strong>
                </div>
                <div>
                  <span className="text-[#96918A] block">Montant Net à Reverser :</span>
                  <strong className="text-base text-emerald-400">
                    {selectedCourierModal.cashCollected.toFixed(3).replace('.', ',')} DT
                  </strong>
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-[#141414] border border-[#34312D]">
                <div className="flex justify-between">
                  <span className="text-[#96918A]">Frais de port déduits :</span>
                  <span>{selectedCourierModal.shippingFees.toFixed(3).replace('.', ',')} DT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#96918A]">Référence Virement :</span>
                  <span className="text-[#B9A995] font-bold">{selectedCourierModal.virementRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#96918A]">Date & Heure :</span>
                  <span>{selectedCourierModal.virementDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#96918A]">Zone de livraison :</span>
                  <span>{selectedCourierModal.coverage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#96918A]">Contact :</span>
                  <span>{selectedCourierModal.contact}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#34312D]">
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Bordereau vérifié par l'Atelier KŪZA</span>
              </div>
              <button
                onClick={() => setSelectedCourierModal(null)}
                className="px-4 py-2 bg-[#E8E4DD] text-[#101010] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#B9A995] transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
