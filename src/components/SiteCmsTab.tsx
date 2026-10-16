import React, { useState, useRef } from 'react';
import {
  Layout,
  Sliders,
  Image as ImageIcon,
  Type,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Check,
  Sparkles,
  Phone,
  Instagram,
  Truck,
  ExternalLink,
  Layers,
  Info,
  ArrowUp,
  ArrowDown,
  Upload,
  Trash2,
  X,
  FileText,
  CheckCircle2,
  BookOpen,
  Scissors,
} from 'lucide-react';
import {
  useSiteConfig,
  DEFAULT_SITE_CONFIG,
  SiteConfig,
  SectionKey,
  DEFAULT_SECTION_ORDER,
} from '../context/SiteConfigContext';
import { fileToOptimizedDataUrl } from '../utils/imageUpload';
import { KuzaMonogram } from './KuzaMonogram';

interface SiteCmsTabProps {
  onShowNotice: (msg: string) => void;
}

const SECTION_LABELS: Record<SectionKey, { title: string; subtitle: string }> = {
  announcement: {
    title: "Bandeau d'Annonce Supérieur",
    subtitle: 'Bandeau défilant promo',
  },
  hero: {
    title: 'Section Hero (Accueil Principal)',
    subtitle: 'Atmosphère & Accroche visuelle',
  },
  bundle: {
    title: 'Featured Bundle (Duo Structuré)',
    subtitle: 'Offre Ensemble 135 DT',
  },
  collection: {
    title: 'Catalogue Collection (Pièces)',
    subtitle: "Grille de l'Archive 01",
  },
  philosophie: {
    title: 'Philosophie KŪZA (Form Needs Space)',
    subtitle: 'Manifesto & Philosophie textile',
  },
  atelier: {
    title: 'Manufacture & Savoir-Faire (Éditorial)',
    subtitle: 'Atelier de Tunis & Traçabilité',
  },
  footer: {
    title: 'Footer & Coordonnées Officielles',
    subtitle: 'Navigation basse & Réseaux',
  },
};

export const SiteCmsTab: React.FC<SiteCmsTabProps> = ({ onShowNotice }) => {
  const { siteConfig, updateSiteConfig, resetSiteConfig } = useSiteConfig();

  // Local draft state
  const [draftConfig, setDraftConfig] = useState<SiteConfig>(siteConfig);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // File upload state for Hero Image
  const [isHeroDragging, setIsHeroDragging] = useState(false);
  const [isHeroUploading, setIsHeroUploading] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  // File upload state for Atelier Photo
  const [isAtelierDragging, setIsAtelierDragging] = useState(false);
  const [isAtelierUploading, setIsAtelierUploading] = useState(false);
  const atelierFileInputRef = useRef<HTMLInputElement>(null);

  // Sync draft if external config updates
  React.useEffect(() => {
    setDraftConfig(siteConfig);
  }, [siteConfig]);

  // Toast timer cleanup
  React.useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleSave = () => {
    updateSiteConfig(draftConfig);
    setIsSaved(true);
    const successMsg = '✨ Configuration enregistrée et mise en ligne avec succès !';
    showToast(successMsg);
    onShowNotice(successMsg);
    setTimeout(() => setIsSaved(false), 2400);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Voulez-vous rétablir tous les paramètres d'origine de la marque KŪZA ?"
      )
    ) {
      resetSiteConfig();
      setDraftConfig(DEFAULT_SITE_CONFIG);
      const resetMsg = "✨ Configuration KŪZA d'origine rétablie avec succès.";
      showToast(resetMsg);
      onShowNotice(resetMsg);
    }
  };

  // Section reordering
  const currentOrder = draftConfig.sectionOrder || DEFAULT_SECTION_ORDER;

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setDraftConfig((prev) => ({
      ...prev,
      sectionOrder: newOrder,
    }));
  };

  // Image Upload Handlers for Hero
  const processHeroFile = async (file: File) => {
    if (!file) return;
    try {
      setIsHeroUploading(true);
      const dataUrl = await fileToOptimizedDataUrl(file);
      setDraftConfig((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          bgImageUrl: dataUrl,
        },
      }));
      showToast('Image Hero importée avec succès.');
    } catch (err: any) {
      alert(err?.message || "Erreur lors du traitement de l'image");
    } finally {
      setIsHeroUploading(false);
    }
  };

  // Image Upload Handlers for Atelier
  const processAtelierFile = async (file: File) => {
    if (!file) return;
    try {
      setIsAtelierUploading(true);
      const dataUrl = await fileToOptimizedDataUrl(file);
      setDraftConfig((prev) => ({
        ...prev,
        atelier: {
          ...prev.atelier,
          photoUrl: dataUrl,
        },
      }));
      showToast("Photo d'atelier importée avec succès.");
    } catch (err: any) {
      alert(err?.message || "Erreur lors du traitement de l'image");
    } finally {
      setIsAtelierUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 relative">
      {/* Top Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 max-w-md bg-[#181818] border border-[#B9A995] text-[#E8E4DD] px-5 py-4 shadow-2xl flex items-center gap-3.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-full bg-[#B9A995]/20 border border-[#B9A995] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#B9A995]" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-mono tracking-wide text-[#E8E4DD] leading-relaxed">
              {toastMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[#96918A] hover:text-[#E8E4DD] p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-[#181818] border border-[#34312D]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-[#B9A995]" />
            <h2
              className="text-lg sm:text-xl font-serif text-[#E8E4DD] tracking-wide uppercase"
              style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
            >
              PERSONNALISATION SITE (CMS & BUILDER)
            </h2>
          </div>
          <p className="text-xs text-[#96918A] max-w-2xl font-light">
            Gérez en temps réel l'ensemble des textes, typographies, bannières tarifaires, photographies et l'ordre des sections visibles de la vitrine KŪZA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider border border-rose-500/40 text-rose-400 hover:bg-rose-950/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RÉINITIALISER (PAR DÉFAUT)</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            {isSaved ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Save className="w-4 h-4" />}
            <span>ENREGISTRER LES MODIFICATIONS</span>
          </button>
        </div>
      </div>

      {/* Grid: Sections Visibility & Global Bar Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Sections Reordering & Visibility Toggles */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#181818] border border-[#34312D] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#34312D] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#B9A995]" />
                <h3
                  className="text-sm font-serif text-[#E8E4DD] uppercase tracking-wide"
                  style={{ fontFamily: "'Optima', serif" }}
                >
                  SECTIONS DU SITE (AFFICHER / MASQUER)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#96918A] uppercase">
                ORDRE VITRINE LIVE
              </span>
            </div>

            <p className="text-xs text-[#96918A]">
              Utilisez les flèches <span className="text-[#E8E4DD] font-mono">⬆️ / ⬇️</span> pour réordonner la page d'accueil ou activez / masquez les blocs en un clic :
            </p>

            {/* Dynamic Draggable / Arrow-Reordered Sections Stack */}
            <div className="space-y-2.5">
              {currentOrder.map((secKey, index) => {
                const isVisible = draftConfig.sections[secKey];
                const meta = SECTION_LABELS[secKey] || {
                  title: secKey,
                  subtitle: '',
                };
                const isFirst = index === 0;
                const isLast = index === currentOrder.length - 1;

                return (
                  <div
                    key={secKey}
                    className="p-3 bg-[#141414] border border-[#34312D] flex items-center justify-between gap-3 transition-colors hover:border-[#34312D]/80"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Move Up / Down Buttons */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveSection(index, 'up')}
                          disabled={isFirst}
                          title="Déplacer vers le haut"
                          className={`w-6 h-6 flex items-center justify-center border text-[11px] transition-colors ${
                            isFirst
                              ? 'border-[#262626] text-[#444] cursor-not-allowed opacity-40'
                              : 'border-[#34312D] text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#202020] cursor-pointer'
                          }`}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSection(index, 'down')}
                          disabled={isLast}
                          title="Déplacer vers le bas"
                          className={`w-6 h-6 flex items-center justify-center border text-[11px] transition-colors ${
                            isLast
                              ? 'border-[#262626] text-[#444] cursor-not-allowed opacity-40'
                              : 'border-[#34312D] text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#202020] cursor-pointer'
                          }`}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Number badge */}
                      <span className="font-mono text-[10px] text-[#B9A995] shrink-0 bg-[#1c1c1c] px-1.5 py-0.5 border border-[#34312D]">
                        0{index + 1}
                      </span>

                      {/* Label */}
                      <div className="min-w-0">
                        <div className="text-xs font-mono text-[#E8E4DD] tracking-wide truncate">
                          {meta.title}
                        </div>
                        <div className="text-[10px] text-[#96918A] truncate font-light">
                          {meta.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Visibility Toggle Switch */}
                    <button
                      type="button"
                      onClick={() =>
                        setDraftConfig((prev) => ({
                          ...prev,
                          sections: {
                            ...prev.sections,
                            [secKey]: !isVisible,
                          },
                        }))
                      }
                      className={`shrink-0 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border ${
                        isVisible
                          ? 'bg-emerald-950/40 text-[#34D399] border-emerald-500/40'
                          : 'bg-rose-950/30 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {isVisible ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>VISIBLE</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>MASQUÉ</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Contact & Global Store Parameters */}
          <div className="bg-[#181818] border border-[#34312D] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#34312D] pb-3">
              <Phone className="w-4 h-4 text-[#B9A995]" />
              <h3
                className="text-sm font-serif text-[#E8E4DD] uppercase tracking-wide"
                style={{ fontFamily: "'Optima', serif" }}
              >
                COORDONNÉES & TARIFS COMMANDE
              </h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                  Téléphone / WhatsApp Client :
                </label>
                <input
                  type="text"
                  value={draftConfig.contact.phoneDisplay}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        phoneDisplay: e.target.value,
                        phone: `+216 ${e.target.value}`,
                      },
                    }))
                  }
                  className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none"
                  placeholder="92 929 276"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                  Identifiant Instagram :
                </label>
                <input
                  type="text"
                  value={draftConfig.contact.instagramHandle}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        instagramHandle: e.target.value,
                        instagramUrl: `https://www.instagram.com/${e.target.value.replace('@', '')}/`,
                      },
                    }))
                  }
                  className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none"
                  placeholder="@kuza.tn"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                  Frais de Livraison Standard :
                </label>
                <input
                  type="text"
                  value={draftConfig.contact.flatShippingFee}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        flatShippingFee: e.target.value,
                      },
                    }))
                  }
                  className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none"
                  placeholder="8,000 DT"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hero CMS & Featured Bundle & Philosophie & Atelier */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Top Announcement Bar Settings */}
          <div className="bg-[#181818] border border-[#34312D] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#34312D] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B9A995]" />
                <h3
                  className="text-sm font-serif text-[#E8E4DD] uppercase tracking-wide"
                  style={{ fontFamily: "'Optima', serif" }}
                >
                  BANDEAU D'ANNONCE SUPÉRIEUR
                </h3>
              </div>
              <label className="flex items-center gap-2 text-xs font-mono text-[#E8E4DD] cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftConfig.announcement.visible}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      announcement: { ...prev.announcement, visible: e.target.checked },
                    }))
                  }
                  className="accent-[#B9A995]"
                />
                <span>ACTIF</span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                Texte du bandeau supérieur :
              </label>
              <textarea
                rows={2}
                value={draftConfig.announcement.text}
                onChange={(e) =>
                  setDraftConfig((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, text: e.target.value },
                  }))
                }
                className="w-full p-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none resize-none leading-relaxed"
                placeholder="✨ OFFRE EXCLUSIVE ATELIER..."
              />
            </div>
          </div>

          {/* 2. Hero Section CMS Controls (With Dropzone) */}
          <div className="bg-[#181818] border border-[#34312D] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#34312D] pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#B9A995]" />
                <h3
                  className="text-sm font-serif text-[#E8E4DD] uppercase tracking-wide"
                  style={{ fontFamily: "'Optima', serif" }}
                >
                  SECTION HERO (ACCUEIL PRINCIPAL)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#B9A995] uppercase">
                TYPOGRAPHIE & VISUEL
              </span>
            </div>

            <div className="space-y-4">
              {/* Interactive Image Dropzone for Hero */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1.5">
                  📁 IMPORTER OU SELECTIONNER UNE NOUVELLE IMAGE DE FOND :
                </label>

                {/* Dropzone Container */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsHeroDragging(true);
                  }}
                  onDragLeave={() => setIsHeroDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsHeroDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) processHeroFile(file);
                  }}
                  onClick={() => heroFileInputRef.current?.click()}
                  className={`relative p-5 border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                    isHeroDragging
                      ? 'border-[#B9A995] bg-[#B9A995]/10'
                      : 'border-[#34312D] bg-[#121212] hover:border-[#B9A995]/70 hover:bg-[#161616]'
                  }`}
                >
                  <input
                    ref={heroFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processHeroFile(file);
                    }}
                    className="hidden"
                  />

                  {draftConfig.hero.bgImageUrl ? (
                    <div className="w-full flex flex-col sm:flex-row items-center gap-4">
                      {/* Image Thumbnail Preview */}
                      <div className="relative w-32 h-20 sm:w-40 sm:h-24 bg-[#1a1a1a] border border-[#34312D] overflow-hidden shrink-0 group">
                        <img
                          src={draftConfig.hero.bgImageUrl}
                          alt="Hero Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-mono text-[#E8E4DD]">
                          APERÇU
                        </div>
                      </div>

                      {/* Dropzone Description & Action */}
                      <div className="flex-1 text-left space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs font-mono text-[#E8E4DD]">
                            Image chargée et active
                          </span>
                        </div>
                        <p className="text-[11px] text-[#96918A]">
                          Glissez une nouvelle image ici ou cliquez pour remplacer.
                        </p>
                        <div className="pt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              heroFileInputRef.current?.click();
                            }}
                            className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-[#222] hover:bg-[#333] text-[#E8E4DD] border border-[#34312D]"
                          >
                            Changer d'image
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDraftConfig((prev) => ({
                                ...prev,
                                hero: {
                                  ...prev.hero,
                                  bgImageUrl: DEFAULT_SITE_CONFIG.hero.bgImageUrl,
                                },
                              }));
                              showToast('Image Hero restaurée par défaut.');
                            }}
                            className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-rose-400 hover:bg-rose-950/20 border border-rose-500/30 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Effacer</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-3 flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#1c1c1c] border border-[#34312D] flex items-center justify-center text-[#B9A995]">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-mono text-[#E8E4DD] uppercase tracking-wider">
                          📁 Glissez une image ici ou parcourez
                        </p>
                        <p className="text-[10px] text-[#96918A] mt-0.5">
                          PNG, JPEG, WEBP · Traitement haute résolution instantané
                        </p>
                      </div>
                    </div>
                  )}

                  {isHeroUploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs font-mono text-[#B9A995] tracking-wider">
                      OPTIMISATION EN COURS...
                    </div>
                  )}
                </div>

                {/* Optional URL input fallback */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#96918A] shrink-0">
                    OU URL DIRECTE :
                  </span>
                  <input
                    type="text"
                    value={draftConfig.hero.bgImageUrl}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, bgImageUrl: e.target.value },
                      }))
                    }
                    className="flex-1 h-8 px-2.5 bg-[#121212] border border-[#34312D] text-[11px] font-mono text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                    Coordonnées GPS / Ville :
                  </label>
                  <input
                    type="text"
                    value={draftConfig.hero.coordinatesText}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, coordinatesText: e.target.value },
                      }))
                    }
                    className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none"
                    placeholder="LOC: 36.8065° N, 10.1815° E / TUNIS"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                    Bouton Action Hero :
                  </label>
                  <input
                    type="text"
                    value={draftConfig.hero.buttonText}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, buttonText: e.target.value },
                      }))
                    }
                    className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none"
                    placeholder="EXPLORER LA COLLECTION ↓"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                  Accroche Principale (Optima / Serif) :
                </label>
                <input
                  type="text"
                  value={draftConfig.hero.tagline}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, tagline: e.target.value },
                    }))
                  }
                  className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-serif text-[#E8E4DD] italic focus:border-[#B9A995] focus:outline-none"
                  placeholder="FORM NEEDS SPACE."
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                  Sous-titre de Marque (Avenir Next W1G) :
                </label>
                <input
                  type="text"
                  value={draftConfig.hero.subTagline}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, subTagline: e.target.value },
                    }))
                  }
                  className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none"
                  placeholder="MARQUE CONTEMPORAINE TUNISIENNE..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                  Badge Origine Atelier :
                </label>
                <input
                  type="text"
                  value={draftConfig.hero.originBadge}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, originBadge: e.target.value },
                    }))
                  }
                  className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none"
                  placeholder="CONÇU À TUNIS · FAÇONNÉ DANS NOS ATELIERS PARTENAIRES EN TUNISIE 🇹🇳"
                />
              </div>
            </div>
          </div>

          {/* 3. Featured Bundle / Offre Ensemble CMS Controls */}
          <div className="bg-[#181818] border border-[#34312D] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#34312D] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#B9A995]" />
                <h3
                  className="text-sm font-serif text-[#E8E4DD] uppercase tracking-wide"
                  style={{ fontFamily: "'Optima', serif" }}
                >
                  FEATURED BUNDLE (OFFRE DUO ENSEMBLE)
                </h3>
              </div>
              <label className="flex items-center gap-2 text-xs font-mono text-[#E8E4DD] cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftConfig.bundle.visible}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      bundle: { ...prev.bundle, visible: e.target.checked },
                    }))
                  }
                  className="accent-[#B9A995]"
                />
                <span>SECTION ACTIVE</span>
              </label>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                    Titre Principal (Optima) :
                  </label>
                  <input
                    type="text"
                    value={draftConfig.bundle.title}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        bundle: { ...prev.bundle, title: e.target.value },
                      }))
                    }
                    className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none uppercase"
                    placeholder="L'ENSEMBLE STRUCTURÉ KŪZA"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                    Sous-titre Duo Textile :
                  </label>
                  <input
                    type="text"
                    value={draftConfig.bundle.subTagline}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        bundle: { ...prev.bundle, subTagline: e.target.value },
                      }))
                    }
                    className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none uppercase"
                    placeholder="SHELTER SWEAT (290 GSM) + REST WIDE (290 GSM)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                  Description de l'Ensemble :
                </label>
                <textarea
                  rows={2}
                  value={draftConfig.bundle.description}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      bundle: { ...prev.bundle, description: e.target.value },
                    }))
                  }
                  className="w-full p-3 bg-[#121212] border border-[#34312D] text-xs text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none resize-none leading-relaxed"
                  placeholder="L'association architecturale complète de l'Archive 01..."
                />
              </div>

              {/* Price Settings: IBM Plex Mono */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-emerald-400 mb-1">
                    Prix Promo Ensemble :
                  </label>
                  <input
                    type="text"
                    value={draftConfig.bundle.specialPrice}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        bundle: { ...prev.bundle, specialPrice: e.target.value },
                      }))
                    }
                    className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] font-bold focus:border-[#B9A995] focus:outline-none"
                    placeholder="135,000 DT"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#96918A] mb-1">
                    Prix Original Total :
                  </label>
                  <input
                    type="text"
                    value={draftConfig.bundle.originalPrice}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        bundle: { ...prev.bundle, originalPrice: e.target.value },
                      }))
                    }
                    className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#96918A] focus:border-[#B9A995] focus:outline-none"
                    placeholder="164,000 DT"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#34D399] mb-1">
                    Badge Économie :
                  </label>
                  <input
                    type="text"
                    value={draftConfig.bundle.discountBadge}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        bundle: { ...prev.bundle, discountBadge: e.target.value },
                      }))
                    }
                    className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#34D399] focus:border-[#B9A995] focus:outline-none"
                    placeholder="-29,000 DT ÉCONOMISÉS"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                  Intitulé du Bouton d'Action :
                </label>
                <input
                  type="text"
                  value={draftConfig.bundle.buttonText}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      bundle: { ...prev.bundle, buttonText: e.target.value },
                    }))
                  }
                  className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] uppercase focus:border-[#B9A995] focus:outline-none"
                  placeholder="AJOUTER L'ENSEMBLE AU PANIER"
                />
              </div>
            </div>
          </div>

          {/* 4. Section Philosophie (Form Needs Space) Controls */}
          <div className="bg-[#181818] border border-[#34312D] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#34312D] pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#B9A995]" />
                <h3
                  className="text-sm font-serif text-[#E8E4DD] uppercase tracking-wide"
                  style={{ fontFamily: "'Optima', serif" }}
                >
                  SECTION PHILOSOPHIE (FORM NEEDS SPACE)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#B9A995] uppercase">
                MANIFESTO & IDENTITÉ
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                    Titre Principal (Headline) :
                  </label>
                  <input
                    type="text"
                    value={draftConfig.philosophie?.headline || ''}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        philosophie: {
                          ...prev.philosophie,
                          headline: e.target.value,
                        },
                      }))
                    }
                    className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] uppercase focus:border-[#B9A995] focus:outline-none"
                    placeholder="FORM NEEDS SPACE."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                    Sous-titre (Sub-headline) :
                  </label>
                  <input
                    type="text"
                    value={draftConfig.philosophie?.subTitle || ''}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        philosophie: {
                          ...prev.philosophie,
                          subTitle: e.target.value,
                        },
                      }))
                    }
                    className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] uppercase focus:border-[#B9A995] focus:outline-none"
                    placeholder="PHILOSOPHIE // IDENTITÉ"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                  Citation Principale de la Marque :
                </label>
                <input
                  type="text"
                  value={draftConfig.philosophie?.quote || ''}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      philosophie: {
                        ...prev.philosophie,
                        quote: e.target.value,
                      },
                    }))
                  }
                  className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-serif italic text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none"
                  placeholder="« Le vêtement ne doit pas contraindre la silhouette... »"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                  Paragraphe Manifeste (Vision & Matière) :
                </label>
                <textarea
                  rows={3}
                  value={draftConfig.philosophie?.paragraph || ''}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      philosophie: {
                        ...prev.philosophie,
                        paragraph: e.target.value,
                      },
                    }))
                  }
                  className="w-full p-3 bg-[#121212] border border-[#34312D] text-xs text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none resize-none leading-relaxed"
                  placeholder="Marque tunisienne contemporaine, KŪZA explore un vestiaire pensé autour du confort..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                  Badge Origine & Territoire :
                </label>
                <input
                  type="text"
                  value={draftConfig.philosophie?.originBadge || ''}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      philosophie: {
                        ...prev.philosophie,
                        originBadge: e.target.value,
                      },
                    }))
                  }
                  className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none"
                  placeholder="KŪZA · Tunisie 🇹🇳"
                />
              </div>
            </div>
          </div>

          {/* 5. Section Manufacture & Atelier Controls (With Dedicated Dropzone) */}
          <div className="bg-[#181818] border border-[#34312D] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#34312D] pb-3">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#B9A995]" />
                <h3
                  className="text-sm font-serif text-[#E8E4DD] uppercase tracking-wide"
                  style={{ fontFamily: "'Optima', serif" }}
                >
                  MANUFACTURE & ATELIER (ÉDITORIAL TUNISIE)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#B9A995] uppercase">
                SAVOIR-FAIRE & COUTURE
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                    Titre Principal Éditorial :
                  </label>
                  <input
                    type="text"
                    value={draftConfig.atelier?.title || ''}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        atelier: {
                          ...prev.atelier,
                          title: e.target.value,
                        },
                      }))
                    }
                    className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none"
                    placeholder="Philosophie & Confection Tunisienne"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                    Sous-titre / En-tête :
                  </label>
                  <input
                    type="text"
                    value={draftConfig.atelier?.subTitle || ''}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        atelier: {
                          ...prev.atelier,
                          subTitle: e.target.value,
                        },
                      }))
                    }
                    className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] uppercase focus:border-[#B9A995] focus:outline-none"
                    placeholder="MANUFACTURE ARCHITECTURALE // ÉDITORIAL"
                  />
                </div>
              </div>

              {/* Photo Atelier Dropzone */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1.5">
                  📁 IMPORTER OU SELECTIONNER LA PHOTO DE L'ATELIER :
                </label>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsAtelierDragging(true);
                  }}
                  onDragLeave={() => setIsAtelierDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsAtelierDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) processAtelierFile(file);
                  }}
                  onClick={() => atelierFileInputRef.current?.click()}
                  className={`relative p-5 border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                    isAtelierDragging
                      ? 'border-[#B9A995] bg-[#B9A995]/10'
                      : 'border-[#34312D] bg-[#121212] hover:border-[#B9A995]/70 hover:bg-[#161616]'
                  }`}
                >
                  <input
                    ref={atelierFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processAtelierFile(file);
                    }}
                    className="hidden"
                  />

                  {draftConfig.atelier?.photoUrl ? (
                    <div className="w-full flex flex-col sm:flex-row items-center gap-4">
                      {/* Image Thumbnail Preview */}
                      <div className="relative w-32 h-20 sm:w-40 sm:h-24 bg-[#1a1a1a] border border-[#34312D] overflow-hidden shrink-0 group">
                        <img
                          src={draftConfig.atelier.photoUrl}
                          alt="Atelier Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-mono text-[#E8E4DD]">
                          APERÇU
                        </div>
                      </div>

                      <div className="flex-1 text-left space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs font-mono text-[#E8E4DD]">
                            Photo d'atelier active
                          </span>
                        </div>
                        <p className="text-[11px] text-[#96918A]">
                          Glissez une nouvelle image ici ou cliquez pour remplacer.
                        </p>
                        <div className="pt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              atelierFileInputRef.current?.click();
                            }}
                            className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-[#222] hover:bg-[#333] text-[#E8E4DD] border border-[#34312D]"
                          >
                            Changer d'image
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDraftConfig((prev) => ({
                                ...prev,
                                atelier: {
                                  ...prev.atelier,
                                  photoUrl: DEFAULT_SITE_CONFIG.atelier.photoUrl,
                                },
                              }));
                              showToast("Photo d'atelier restaurée par défaut.");
                            }}
                            className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-rose-400 hover:bg-rose-950/20 border border-rose-500/30 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Effacer</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-3 flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#1c1c1c] border border-[#34312D] flex items-center justify-center text-[#B9A995]">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-mono text-[#E8E4DD] uppercase tracking-wider">
                          📁 Glissez la photo de l'atelier ici
                        </p>
                        <p className="text-[10px] text-[#96918A] mt-0.5">
                          Format paysage recommandé · Encodage automatique
                        </p>
                      </div>
                    </div>
                  )}

                  {isAtelierUploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs font-mono text-[#B9A995] tracking-wider">
                      OPTIMISATION EN COURS...
                    </div>
                  )}
                </div>

                {/* Direct URL input fallback */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#96918A] shrink-0">
                    OU URL DIRECTE :
                  </span>
                  <input
                    type="text"
                    value={draftConfig.atelier?.photoUrl || ''}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        atelier: {
                          ...prev.atelier,
                          photoUrl: e.target.value,
                        },
                      }))
                    }
                    className="flex-1 h-8 px-2.5 bg-[#121212] border border-[#34312D] text-[11px] font-mono text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                  Récit et Confection (Narrative Text) :
                </label>
                <textarea
                  rows={4}
                  value={draftConfig.atelier?.narrative || ''}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      atelier: {
                        ...prev.atelier,
                        narrative: e.target.value,
                      },
                    }))
                  }
                  className="w-full p-3 bg-[#121212] border border-[#34312D] text-xs text-[#E8E4DD] focus:border-[#B9A995] focus:outline-none resize-none leading-relaxed"
                  placeholder="Chaque vêtement KŪZA défie l'obsolescence..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B9A995] mb-1">
                  Badge Gravé Visuel (Watermark) :
                </label>
                <input
                  type="text"
                  value={draftConfig.atelier?.badge || ''}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      atelier: {
                        ...prev.atelier,
                        badge: e.target.value,
                      },
                    }))
                  }
                  className="w-full h-10 px-3 bg-[#121212] border border-[#34312D] text-xs font-mono text-[#E8E4DD] uppercase focus:border-[#B9A995] focus:outline-none"
                  placeholder="ATELIER 01 — TUNIS SUD · CONTRÔLE QUALITÉ"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-4 z-30 p-4 bg-[#141414]/95 backdrop-blur-md border border-[#34312D] flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono text-[#96918A]">
          <Info className="w-4 h-4 text-[#B9A995]" />
          <span className="hidden sm:inline">
            Toutes les modifications prennent effet immédiatement sur la vitrine boutique KŪZA.
          </span>
          <span className="sm:hidden">Effet immédiat en direct.</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider border border-rose-500/40 text-rose-400 hover:bg-rose-950/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RÉINITIALISER</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 text-xs font-mono uppercase tracking-wider bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
          >
            {isSaved ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Save className="w-4 h-4" />}
            <span>ENREGISTRER LES MODIFICATIONS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
