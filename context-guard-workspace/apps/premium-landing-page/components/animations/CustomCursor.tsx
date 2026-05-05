'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * CustomCursor – Replaces the browser cursor with a branded orange dot + ring.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveDot = (e: MouseEvent) => {
      gsap.to(dot.current, { x: e.clientX, y: e.clientY, duration: 0.05 });
      gsap.to(ring.current, { x: e.clientX, y: e.clientY, duration: 0.3, ease: 'power2.out' });
    };

    const onEnter = () => {
      gsap.to(ring.current, { scale: 1.8, borderColor: '#ff4500', duration: 0.2 });
    };

    const onLeave = () => {
      gsap.to(ring.current, { scale: 1, borderColor: '#ff4500', duration: 0.2 });
    };

    window.addEventListener('mousemove', moveDot);
    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    return () => window.removeEventListener('mousemove', moveDot);
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  );
}
