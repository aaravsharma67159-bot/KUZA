import React from 'react';
import { X, FileText, ShieldCheck, Scale } from 'lucide-react';

interface LegalComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'cgv' | 'legal';
}

export const LegalComplianceModal: React.FC<LegalComplianceModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'cgv',
}) => {
  const [activeTab, setActiveTab] = React.useState<'cgv' | 'legal'>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#101010] border border-[#34312D] text-[#E8E4DD] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#34312D] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B9A995] block">
              Maison KŪZA · Conformité Légale
            </span>
            <h2
              id="legal-title"
              className="text-xl font-serif text-[#E8E4DD] tracking-wide mt-1"
              style={{ fontFamily: "'Playfair Display', 'Optima', serif" }}
            >
              Cadre Réglementaire & Charte Client
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#96918A] hover:text-[#E8E4DD] hover:bg-[#181818] border border-transparent hover:border-[#34312D] transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#34312D] shrink-0 bg-[#141414]">
          <button
            onClick={() => setActiveTab('cgv')}
            className={`flex-1 py-3.5 text-xs font-mono uppercase tracking-widest cursor-pointer border-b-2 -mb-px transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'cgv'
                ? 'border-[#B9A995] bg-[#101010] text-[#E8E4DD] font-semibold'
                : 'border-transparent text-[#96918A] hover:text-[#E8E4DD]'
            }`}
          >
            <Scale className="w-4 h-4 text-[#B9A995]" />
            <span>Conditions Générales (CGV)</span>
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={`flex-1 py-3.5 text-xs font-mono uppercase tracking-widest cursor-pointer border-b-2 -mb-px transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'legal'
                ? 'border-[#B9A995] bg-[#101010] text-[#E8E4DD] font-semibold'
                : 'border-transparent text-[#96918A] hover:text-[#E8E4DD]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#B9A995]" />
            <span>Mentions & Confidentialité</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-xs text-[#96918A] leading-relaxed font-light">
          {activeTab === 'cgv' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[#E8E4DD] uppercase tracking-wider mb-2 font-mono">
                  1. Champ d'Application
                </h3>
                <p>
                  Les présentes Conditions Générales de Vente (CGV) régissent toutes les ventes de vêtements, accessoires, et objets d'artisanat conclus sur la boutique en ligne de la Maison KŪZA (kuza.tn), à destination de la Tunisie et de l'étranger.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#E8E4DD] uppercase tracking-wider mb-2 font-mono">
                  2. Tarification & Transport (Tunisie)
                </h3>
                <p>
                  Les prix de nos pièces d'atelier sont indiqués en Dinars Tunisiens (TND) nets. La livraison nationale en Tunisie fait l'objet d'un tarif forfaitaire unique de <strong className="text-[#E8E4DD] font-mono">8 TND</strong> par commande, quel que soit le gouvernorat de destination (du Grand Tunis aux régions méridionales).
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#E8E4DD] uppercase tracking-wider mb-2 font-mono">
                  3. Modalités de Paiement (COD Exclusif)
                </h3>
                <p>
                  Conformément aux directives de notre charte opérationnelle, le paiement s'effectue exclusivement par <strong className="text-[#E8E4DD]">Paiement Cash à la livraison (Cash on Delivery - COD)</strong>. Le client s'engage à régler la somme totale exacte en espèces au coursier mandaté lors de la remise en main propre du colis.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#E8E4DD] uppercase tracking-wider mb-2 font-mono">
                  4. Délais de Livraison & Logistique
                </h3>
                <p>
                  Notre service logistique assure des délais d'expédition de <strong className="text-[#E8E4DD]">24 à 48 heures ouvrables</strong> à compter de la confirmation d'atelier pour le Grand Tunis, et de 48 à 72 heures pour les autres régions. Le coursier prend systématiquement contact par téléphone pour planifier le créneau de passage exact.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#E8E4DD] uppercase tracking-wider mb-2 font-mono">
                  5. Politique de Retour & Échange (7 Jours d'Atelier)
                </h3>
                <p>
                  Chaque pièce KŪZA est emballée sous housse de protection scellée. Vous disposez d’un délai de <strong className="text-[#E8E4DD]">7 jours francs</strong> à compter de la réception pour demander un échange ou un remboursement. L'article doit être retourné neuf, non porté, non lavé, accompagné de ses étiquettes et impérativement dans son <strong className="text-[#E8E4DD]">pochon en coton d'origine KŪZA</strong> intact. Les frais de retour logistique restent à la charge du client.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#E8E4DD] uppercase tracking-wider mb-2 font-mono">
                  6. Litiges & Juridiction
                </h3>
                <p>
                  Les présentes conditions sont soumises à la législation tunisienne. En cas de contestation ou de litige commercial non résolu à l'amiable, les <strong className="text-[#E8E4DD]">Tribunaux de Tunis</strong> seront exclusivement compétents.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[#E8E4DD] uppercase tracking-wider mb-2 font-mono">
                  1. Mentions Légales Corporate
                </h3>
                <p className="space-y-1">
                  <span className="block">Éditeur : Maison KŪZA SARL, Tunis, Sidi Bou Saïd.</span>
                  <span className="block font-mono">Registre du Commerce : RCS Tunis B0119282024</span>
                  <span className="block font-mono">Contact : contact@kuza.tn · Tél / WhatsApp : +216 92 929 276 · Instagram : @kuza.tn</span>
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#E8E4DD] uppercase tracking-wider mb-2 font-mono">
                  2. Hébergement du Service
                </h3>
                <p>
                  Ce site internet et son application de prévisualisation interactive sont hébergés sur des serveurs sécurisés en Europe-West (Vite / Node.js Runtime Platform). L'infrastructure garantit une disponibilité continue de 99.9% de nos matrices opérationnelles.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#E8E4DD] uppercase tracking-wider mb-2 font-mono">
                  3. Protection des Données & DPA (RGPD Tunisien)
                </h3>
                <p>
                  KŪZA applique une politique stricte de confidentialité des données personnelles en pleine conformité avec la loi tunisienne n° 2004-63 portant sur la protection des données personnelles (DPA compliance).
                </p>
                <p className="mt-2">
                  Vos informations d'expédition (Nom, Prénom, Téléphone, Adresse, Gouvernorat) sont collectées et traitées uniquement pour la finalisation de la commande et le suivi logistique du livreur. Aucune donnée n'est cédée, vendue ou louée à des tiers à des fins publicitaires.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#E8E4DD] uppercase tracking-wider mb-2 font-mono">
                  4. Sécurité des Informations de Test
                </h3>
                <p>
                  Pour le confort de nos clients et inspecteurs, les comptes créés en session sont sauvegardés de manière persistante sur votre stockage local (`localStorage`) crypté par votre navigateur. Vous pouvez à tout moment purger ces journaux à l'aide des outils de réinitialisation de l'atelier d'administration.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#34312D] bg-[#141414] flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer font-semibold"
          >
            Fermer l'Aperçu
          </button>
        </div>
      </div>
    </div>
  );
};
