import React, { useState } from 'react';
import { ArrowUp, Check, Truck, RefreshCw, Scissors, ShieldCheck, Phone, Instagram } from 'lucide-react';
import { CustomerUser } from '../types';
import { KUZA_CONTACT } from '../utils/contact';
import { useSiteConfig } from '../context/SiteConfigContext';
import { KuzaMonogram } from './KuzaMonogram';
import { KuzaLogo } from './KuzaLogo';

interface FooterProps {
  onOpenSizeGuide: () => void;
  onNavigate: (sectionId: string) => void;
  currentUser?: CustomerUser | null;
  onOpenAdmin?: () => void;
  onOpenAccount?: () => void;
  onOpenLegal?: (tab: 'cgv' | 'legal') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenSizeGuide,
  onNavigate,
  currentUser,
  onOpenAdmin,
  onOpenAccount,
  onOpenLegal,
}) => {
  const { siteConfig } = useSiteConfig();
  const contactInfo = siteConfig.contact;
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
      }, 2000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full bg-[#101010] text-[#96918A] border-t border-[#34312D] pt-12 pb-12 mt-auto overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12 mb-12 border-b border-[#34312D]/60">
          <div className="p-4 bg-[#141414] border border-[#34312D]/60 flex items-start gap-3">
            <Truck className="w-4 h-4 text-[#B9A995] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E8E4DD] font-semibold block">
                LIVRAISON 24/48H
              </span>
              <p className="text-[10px] text-[#96918A] leading-tight">
                Expédition rapide sur toute la Tunisie.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#141414] border border-[#34312D]/60 flex items-start gap-3">
            <RefreshCw className="w-4 h-4 text-[#B9A995] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E8E4DD] font-semibold block">
                ÉCHANGE FACILE
              </span>
              <p className="text-[10px] text-[#96918A] leading-tight">
                Service client réactif pour vos changements de taille.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#141414] border border-[#34312D]/60 flex items-start gap-3">
            <Scissors className="w-4 h-4 text-[#B9A995] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E8E4DD] font-semibold block">
                CONFECTION LOCALE
              </span>
              <p className="text-[10px] text-[#96918A] leading-tight">
                Assemblé avec soin dans des ateliers tunisiens certifiés.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#141414] border border-[#34312D]/60 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-[#B9A995] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E8E4DD] font-semibold block">
                PAIEMENT SÉCURISÉ
              </span>
              <p className="text-[10px] text-[#96918A] leading-tight">
                Paiement en espèces à la livraison.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Clean Columns: Brand Info | Collections | Legal | Newsletter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-10 pb-12 border-b border-[#34312D]/40">
          {/* Column 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <KuzaMonogram className="w-8 h-8 text-[#B9A995] shrink-0" />
              <div>
                <KuzaLogo className="h-5 w-auto text-[#E8E4DD]" />
                <p className="text-[9px] uppercase tracking-[0.25em] text-[#B9A995] font-mono mt-0.5">
                  FORM NEEDS SPACE
                </p>
              </div>
            </div>
            <p className="text-xs text-[#96918A] leading-relaxed font-light pt-1">
              Maison de création indépendante alliant design architectural et patronage sans compromis. Pièces coupées dans des étoffes denses 290 GSM.
            </p>
            <div className="text-[11px] font-mono text-[#E8E4DD] pt-1">
              Designed in Tunis · Crafted in Tunisia 🇹🇳
            </div>
          </div>

          {/* Column 2: Collections */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-[#E8E4DD] font-mono block font-semibold">
              COLLECTIONS
            </span>
            <ul className="space-y-2 text-xs font-mono uppercase tracking-[0.16em]">
              <li>
                <button
                  onClick={() => onNavigate('collection')}
                  className="hover:text-[#E8E4DD] transition-colors cursor-pointer text-[#96918A]"
                >
                  Archive 01
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('bundle-set')}
                  className="hover:text-[#E8E4DD] transition-colors cursor-pointer text-[#96918A]"
                >
                  L'Ensemble Structuré
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('editorial')}
                  className="hover:text-[#E8E4DD] transition-colors cursor-pointer text-[#96918A]"
                >
                  Directoire Atelier
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSizeGuide}
                  className="hover:text-[#E8E4DD] transition-colors cursor-pointer text-[#96918A]"
                >
                  Guide des Tailles
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Accounts */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-[#E8E4DD] font-mono block font-semibold">
              LÉGAL & COMPTE
            </span>
            <ul className="space-y-2 text-xs font-mono uppercase tracking-[0.16em]">
              <li>
                <button
                  onClick={() => onOpenLegal && onOpenLegal('cgv')}
                  className="hover:text-[#E8E4DD] transition-colors cursor-pointer text-[#96918A]"
                >
                  Conditions Générales
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal && onOpenLegal('legal')}
                  className="hover:text-[#E8E4DD] transition-colors cursor-pointer text-[#96918A]"
                >
                  Mentions Légales
                </button>
              </li>
              {onOpenAccount && (
                <li>
                  <button
                    onClick={onOpenAccount}
                    className="hover:text-[#E8E4DD] transition-colors cursor-pointer text-[#B9A995]"
                  >
                    Espace Client
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Newsletter & Contact */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-[#E8E4DD] font-mono block font-semibold">
              NEWSLETTER & CONTACT
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              <a
                href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-2 text-[#E8E4DD] hover:text-[#B9A995] transition-colors cursor-pointer"
                title="Appeler le service client KŪZA"
              >
                <Phone className="w-3.5 h-3.5 text-[#B9A995] shrink-0" />
                <span>{contactInfo.phone}</span>
              </a>

              <a
                href={contactInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#E8E4DD] hover:text-[#B9A995] transition-colors cursor-pointer"
                title={`Compte Instagram officiel ${contactInfo.instagramHandle}`}
              >
                <Instagram className="w-3.5 h-3.5 text-[#B9A995] shrink-0" />
                <span className="lowercase font-normal tracking-normal">{contactInfo.instagramHandle}</span>
              </a>

              <p className="text-[#B9A995] pt-0.5 text-[10px] uppercase tracking-wider">TUNISIA 🇹🇳 — LOGISTIQUE DIRECTE</p>
            </div>

            {/* Micro Subscribe form */}
            <div className="pt-2">
              {subscribed ? (
                <div className="p-2 bg-[#181818] border border-[#B9A995] text-[11px] text-[#B9A995] flex items-center gap-1.5 font-mono">
                  <Check className="w-3 h-3" />
                  <span>Adresse enregistrée</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="votre@adresse.tn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-2.5 py-1.5 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-[10px] font-mono uppercase tracking-widest transition-colors font-medium cursor-pointer"
                  >
                    Rejoindre
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Center: Subtle, low-opacity vector watermark */}
        <div className="w-full text-center py-2">
          <KuzaMonogram className="w-10 h-10 text-[#B9A995]/30 mx-auto my-4" />
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#96918A] gap-4 font-mono uppercase tracking-[0.2em] border-t border-[#34312D]/40">
          <div className="flex flex-wrap items-center gap-2">
            <span>© {new Date().getFullYear()} KŪZA HAUTE MAISON. ALL RIGHTS RESERVED.</span>
            {currentUser?.role === 'admin' && onOpenAdmin && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-[#B9A995] transition-colors cursor-pointer text-[#B9A995]"
                >
                  ADMIN DASHBOARD
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#E8E4DD]">TUNIS — CARTHAGE — PARIS</span>
            <button
              onClick={scrollToTop}
              className="p-2 border border-[#34312D] hover:border-[#B9A995] text-[#E8E4DD] transition-colors cursor-pointer"
              aria-label="Retour en haut de page"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
