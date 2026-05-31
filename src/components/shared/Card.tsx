/**
 * ATLAS Card Component
 *
 * Styled container matching DESIGN_PHILOSOPHY.md:
 * 1px border, no shadows, 16px radius, 24px padding.
 */

import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <div
      className={`bg-bg-card border border-border rounded-[16px] p-6 ${className}`}
    >
      {title && (
        <div className="mb-4">
          <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
            {title}
          </h3>
          {subtitle && (
            <p className="text-text-secondary text-sm mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
