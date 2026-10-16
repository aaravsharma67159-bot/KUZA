import React, { useEffect } from 'react';
import { X, User, Lock, Phone, Instagram, ArrowRight } from 'lucide-react';
import { CustomerUser } from '../types';
import { KUZA_CONTACT } from '../utils/contact';
import { KuzaMonogram } from './KuzaMonogram';
import { KuzaLogo } from './KuzaLogo';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenAccount?: () => void;
  onOpenAdmin?: () => void;
  currentUser?: CustomerUser | null;
  customerName?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentSection,
  onNavigate,
  onOpenAccount,
  onOpenAdmin,
  currentUser,
  customerName,
}) => {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLink = (sectionId: string) => {
    onClose();
    onNavigate(sectionId);
  };

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
      {/* 1. Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Slide-over Drawer Panel Container */}
      <aside className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-[320px] bg-[#101010] border-r border-[#34312D] p-6 z-50 flex flex-col justify-between shadow-2xl overflow-y-auto animate-slideInLeft">
        <div>
          {/* Top Header Bar inside Drawer */}
          <div className="relative pb-6 border-b border-[#34312D] text-center">
            <button
              onClick={onClose}
              className="absolute top-0 right-0 p-1 text-[#E8E4DD] hover:text-[#B9A995] transition-colors cursor-pointer touch-manipulation z-10"
              aria-label="Fermer le menu de navigation"
            >
              <X className="w-6 h-6 text-[#E8E4DD] cursor-pointer" />
            </button>

            <div className="pt-1">
              <KuzaLogo className="h-8 w-auto text-[#B9A995] mx-auto mb-4" />
              <div className="flex items-center justify-center gap-2">
                <KuzaMonogram className="w-4 h-4 text-[#B9A995] shrink-0" />
                <span className="text-[10px] font-mono tracking-widest text-[#8C8275] uppercase block">
                  Stock Central Tunis · 🇹🇳
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col mt-4 space-y-1">
            <button
              onClick={() => handleLink('collection')}
              className={`text-left text-lg font-serif tracking-widest uppercase py-3.5 border-b border-[#34312D]/50 flex items-center justify-between transition-colors cursor-pointer ${
                currentSection === 'collection' ? 'text-[#B9A995]' : 'text-[#E8E4DD] hover:text-[#B9A995]'
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span>COLLECTION</span>
                <span className="text-[10px] font-mono text-[#96918A]">SS25</span>
              </div>
              {currentSection === 'collection' ? (
                <span className="w-1.5 h-1.5 bg-[#B9A995] rounded-full" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 text-[#96918A]/50" />
              )}
            </button>

            <button
              onClick={() => handleLink('philosophie')}
              className={`text-left text-lg font-serif tracking-widest uppercase py-3.5 border-b border-[#34312D]/50 flex items-center justify-between transition-colors cursor-pointer ${
                currentSection === 'philosophie' ? 'text-[#B9A995]' : 'text-[#E8E4DD] hover:text-[#B9A995]'
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span>PHILOSOPHIE</span>
                <span className="text-[10px] font-mono text-[#96918A]">WABI-SABI</span>
              </div>
              {currentSection === 'philosophie' ? (
                <span className="w-1.5 h-1.5 bg-[#B9A995] rounded-full" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 text-[#96918A]/50" />
              )}
            </button>

            <button
              onClick={() => handleLink('lookbook')}
              className={`text-left text-lg font-serif tracking-widest uppercase py-3.5 border-b border-[#34312D]/50 flex items-center justify-between transition-colors cursor-pointer ${
                currentSection === 'lookbook' ? 'text-[#B9A995]' : 'text-[#E8E4DD] hover:text-[#B9A995]'
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span>CAMPAGNE</span>
                <span className="text-[10px] font-mono text-[#96918A]">ÉDITORIAL</span>
              </div>
              {currentSection === 'lookbook' ? (
                <span className="w-1.5 h-1.5 bg-[#B9A995] rounded-full" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 text-[#96918A]/50" />
              )}
            </button>
          </nav>

          {/* Account & Administration Quick Access */}
          <div className="mt-8 space-y-3 font-mono text-xs">
            {onOpenAccount && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAccount();
                }}
                className="w-full flex items-center gap-2.5 p-3 bg-[#181818] border border-[#34312D] text-[#E8E4DD] hover:border-[#B9A995] transition-colors cursor-pointer text-left uppercase tracking-wider"
              >
                <User className="w-4 h-4 stroke-[1.25] text-[#B9A995]" />
                <span>{customerName ? `COMPTE (${customerName})` : 'MON COMPTE / GESTION'}</span>
              </button>
            )}

            {onOpenAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="w-full flex items-center gap-2.5 p-3 bg-[#141414] border border-[#34312D] text-[#8C8275] hover:text-[#B9A995] hover:border-[#B9A995] transition-colors cursor-pointer text-left uppercase tracking-wider"
              >
                <Lock className="w-4 h-4 stroke-[1.25] text-[#8C8275]" />
                <span>ACCÈS ADMIN / STOCK & GESTION</span>
              </button>
            )}
          </div>
        </div>

        {/* Drawer Footer Contact & Origin */}
        <div className="pt-5 border-t border-[#34312D] space-y-3 text-left font-mono">
          <div className="p-3 bg-[#141414] border border-[#34312D] space-y-1.5">
            <span className="text-[10px] text-[#B9A995] uppercase tracking-wider block font-semibold">
              ASSISTANCE TUNISIE
            </span>
            <div className="flex items-center gap-3 pt-1 text-[11px]">
              <a
                href={KUZA_CONTACT.phoneTel}
                className="flex items-center gap-1.5 text-[#E8E4DD] hover:text-[#B9A995] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#B9A995]" />
                <span>{KUZA_CONTACT.phoneDisplay}</span>
              </a>
              <span className="text-[#34312D]">·</span>
              <a
                href={KUZA_CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#E8E4DD] hover:text-[#B9A995] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-[#B9A995]" />
                <span>{KUZA_CONTACT.instagramHandle}</span>
              </a>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-[#8C8275] tracking-widest uppercase block">
              TUNIS 🇹🇳 · CONFECTION ARCHIVALE
            </span>
            <p className="text-[10px] text-[#96918A]/60">
              COLLECTION 290 GSM · LIVRAISON 24/48H
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};
