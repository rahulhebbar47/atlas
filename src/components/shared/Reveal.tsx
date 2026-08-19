/**
 * Reveal — the shared height-reveal transition (R3c motion-consistency item: the new
 * surfaces adopt the Framer Motion convention; 0.15s micro-interaction per
 * DESIGN_PHILOSOPHY.md).
 */
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Reveal({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
