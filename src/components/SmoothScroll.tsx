'use client';

import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import { useReducedMotion } from '@/kit/reduced-motion';

/** Eased wheel scrolling site-wide; native scrolling when the user prefers reduced motion. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <ReactLenis root options={{ lerp: 0.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
