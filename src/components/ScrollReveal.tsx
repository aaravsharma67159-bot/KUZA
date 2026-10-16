import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  as?: 'div' | 'section' | 'article';
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  id,
  className = '',
  threshold = 0.08,
  rootMargin = '0px 0px -40px 0px',
  delay = 0,
  as: Component = 'div',
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // If running in SSR or user prefers reduced motion
    if (typeof window === 'undefined') {
      setIsRevealed(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }

    const el = elementRef.current;
    if (!el) return;

    // Check if element is already in viewport on mount
    const checkInitialVisibility = () => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < windowHeight * 0.95 && rect.bottom > 0) {
        if (delay > 0) {
          const timer = setTimeout(() => setIsRevealed(true), delay);
          return () => clearTimeout(timer);
        }
        setIsRevealed(true);
        return true;
      }
      return false;
    };

    if (checkInitialVisibility()) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setIsRevealed(true);
            }, delay);
          } else {
            setIsRevealed(true);
          }
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(el);

    // Passive scroll check backup for rapid smooth-scroll navigation
    const handleScrollBackup = () => {
      if (checkInitialVisibility()) {
        observer.unobserve(el);
        window.removeEventListener('scroll', handleScrollBackup);
      }
    };
    window.addEventListener('scroll', handleScrollBackup, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollBackup);
    };
  }, [threshold, rootMargin, delay]);

  return (
    <Component
      id={id}
      ref={elementRef}
      className={`scroll-fade-section w-full ${isRevealed ? 'is-revealed' : ''} ${className}`}
    >
      {children}
    </Component>
  );
};
