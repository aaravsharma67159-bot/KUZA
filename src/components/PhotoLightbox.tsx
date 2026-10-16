import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Move,
} from 'lucide-react';

interface PhotoLightboxProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  productName?: string;
  subtitle?: string;
  onClose: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  productName = 'KŪZA',
  subtitle = 'Stock Central Tunis · 290 GSM',
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  // Sync initialIndex when lightbox opens or index changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1)));
      setZoomLevel(1);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex, images.length]);

  // Reset zoom & pan when switching images
  const resetTransform = useCallback(() => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetTransform();
  }, [images.length, resetTransform]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetTransform();
  }, [images.length, resetTransform]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => {
      const next = Math.min(prev + 0.5, 3);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleToggleZoom = () => {
    if (hasDraggedRef.current) return;
    setZoomLevel((prev) => {
      if (prev === 1) return 2;
      if (prev === 2) return 3;
      setPan({ x: 0, y: 0 });
      return 1;
    });
  };

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        resetTransform();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose, resetTransform]);

  // Fullscreen API toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasDraggedRef.current = true;
    }
    // Dynamic max drag boundary based on zoom level
    const maxBound = (zoomLevel - 1) * 450;
    const newX = Math.max(-maxBound, Math.min(maxBound, panStartRef.current.x + dx));
    const newY = Math.max(-maxBound, Math.min(maxBound, panStartRef.current.y + dy));
    setPan({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers for mobile/trackpad
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    panStartRef.current = { ...pan };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoomLevel <= 1 || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasDraggedRef.current = true;
    }
    const maxBound = (zoomLevel - 1) * 450;
    const newX = Math.max(-maxBound, Math.min(maxBound, panStartRef.current.x + dx));
    const newY = Math.max(-maxBound, Math.min(maxBound, panStartRef.current.y + dy));
    setPan({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];
  const formattedIndex = String(currentIndex + 1).padStart(2, '0');
  const formattedTotal = String(images.length).padStart(2, '0');

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#101010] text-[#E8E4DD] flex flex-col justify-between overflow-hidden select-none animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`Visualiseur architectural ${productName}`}
    >
      {/* Top Bar: Product Identity, Image Counter, Zoom Controls, Close */}
      <header className="relative z-30 flex items-center justify-between px-6 py-4 bg-[#101010]/90 backdrop-blur-md border-b border-[#34312D]">
        {/* Left: Product & Craftsmanship */}
        <div className="flex items-center gap-4">
          <span
            className="text-lg md:text-xl font-serif tracking-[0.2em] uppercase text-[#E8E4DD]"
            style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
          >
            {productName}
          </span>
          <span className="hidden sm:inline-block w-px h-4 bg-[#34312D]" />
          <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-widest text-[#B9A995]">
            {subtitle}
          </span>
        </div>

        {/* Center: Monospaced Index Indicator */}
        <div className="flex items-center gap-2 font-mono text-xs tracking-widest">
          <span className="text-[#E8E4DD] font-semibold">{formattedIndex}</span>
          <span className="text-[#96918A]">/</span>
          <span className="text-[#96918A]">{formattedTotal}</span>
        </div>

        {/* Right: Precision Zoom Controls & Close Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Zoom controls toolbar */}
          <div className="flex items-center bg-[#181818] border border-[#34312D] px-1 py-0.5">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className={`p-1.5 transition-colors cursor-pointer ${
                zoomLevel <= 1 ? 'text-[#96918A]/40 cursor-not-allowed' : 'text-[#96918A] hover:text-[#E8E4DD]'
              }`}
              title="Réduire zoom (-)"
              aria-label="Réduire zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="px-2 font-mono text-xs text-[#B9A995] tabular-nums min-w-[3rem] text-center">
              {zoomLevel.toFixed(1)}x
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className={`p-1.5 transition-colors cursor-pointer ${
                zoomLevel >= 3 ? 'text-[#96918A]/40 cursor-not-allowed' : 'text-[#96918A] hover:text-[#E8E4DD]'
              }`}
              title="Agrandir zoom (+)"
              aria-label="Agrandir zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {zoomLevel > 1 && (
              <button
                onClick={resetTransform}
                className="px-2 py-1 text-[10px] font-mono text-[#96918A] hover:text-[#E8E4DD] border-l border-[#34312D] flex items-center gap-1 cursor-pointer"
                title="Réinitialiser zoom (0)"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden md:inline">Reset</span>
              </button>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex p-2 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer"
            title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
            aria-label="Basculer plein écran"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Lightbox */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer text-xs font-mono"
            aria-label="Fermer le visualiseur (Échap)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">FERMER</span>
            <kbd className="hidden md:inline text-[9px] px-1 bg-[#101010] border border-[#34312D] text-[#96918A]">
              ESC
            </kbd>
          </button>
        </div>
      </header>

      {/* Main Visual Canvas Area */}
      <main
        className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrow Previous */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 md:left-8 z-30 p-3 bg-[#101010]/80 border border-[#34312D] hover:border-[#B9A995] text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer backdrop-blur-sm"
            aria-label="Photo précédente (Flèche gauche)"
            title="Précédent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Navigation Arrow Next */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 md:right-8 z-30 p-3 bg-[#101010]/80 border border-[#34312D] hover:border-[#B9A995] text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer backdrop-blur-sm"
            aria-label="Photo suivante (Flèche droite)"
            title="Suivant"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Zoomed / Pan-able Image Wrapper */}
        <div
          onClick={handleToggleZoom}
          className={`relative max-w-full max-h-[76vh] flex items-center justify-center transition-transform ${
            isDragging ? 'duration-0' : 'duration-300'
          } ${
            zoomLevel > 1
              ? isDragging
                ? 'cursor-grabbing'
                : 'cursor-grab'
              : 'cursor-zoom-in'
          }`}
          style={{
            transform: `scale(${zoomLevel}) translate(${pan.x / zoomLevel}px, ${pan.y / zoomLevel}px)`,
            transformOrigin: 'center center',
          }}
        >
          <img
            src={currentImage}
            alt={`${productName} vue macro ${currentIndex + 1}`}
            referrerPolicy="no-referrer"
            className="max-h-[76vh] max-w-[90vw] md:max-w-[80vw] object-contain shadow-2xl pointer-events-none"
            draggable={false}
          />
        </div>

        {/* Pan Active Indicator Overlay */}
        {zoomLevel > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 bg-[#181818]/90 border border-[#B9A995]/60 text-[11px] font-mono text-[#E8E4DD] flex items-center gap-2 backdrop-blur-sm shadow-xl pointer-events-none">
            <Move className="w-3.5 h-3.5 text-[#B9A995] animate-pulse" />
            <span>Glissez pour inspecter le tissage 290 GSM & broderies</span>
          </div>
        )}
      </main>

      {/* Bottom Bar: Thumbnail Strip & Navigation Helper */}
      <footer className="relative z-30 px-6 py-4 bg-[#101010]/90 backdrop-blur-md border-t border-[#34312D] flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Minimal Instruction Helper */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-[#96918A] font-mono">
          <span>Double-clic : Zoomer</span>
          <span>·</span>
          <span>Glisser : Explorer matière</span>
          <span>·</span>
          <span>Flèches : Naviguer</span>
        </div>

        {/* Center Thumbnail Strip */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scrollbar-none max-w-full py-1 mx-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                resetTransform();
              }}
              className={`relative w-14 h-18 shrink-0 border overflow-hidden transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'border-[#B9A995] ring-1 ring-[#B9A995] opacity-100 scale-105'
                  : 'border-[#34312D] opacity-40 hover:opacity-90'
              }`}
              aria-label={`Sélectionner vue ${idx + 1}`}
            >
              <img
                src={img}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 px-1 bg-[#101010]/80 text-[9px] font-mono text-[#E8E4DD]">
                {idx + 1}
              </span>
            </button>
          ))}
        </div>

        {/* Right Details Stamp */}
        <div className="text-[11px] font-mono text-[#96918A] tracking-wider uppercase text-right hidden sm:block">
          Coupe Contemporaine · Tunisie
        </div>
      </footer>
    </div>
  );
};
