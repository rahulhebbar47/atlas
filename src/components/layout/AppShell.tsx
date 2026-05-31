/**
 * ATLAS App Shell
 *
 * Three-panel layout per DESIGN_PHILOSOPHY.md:
 *   Controls (~280px, collapsible) | Main Viz (flex center) | Insights (~320px, collapsible)
 *
 * Full viewport height, no page-level scroll — each panel scrolls independently.
 */

import { Header } from './Header';
import { ControlsPanel } from './ControlsPanel';
import { MainVisualization } from './MainVisualization';
import { InsightsPanel } from './InsightsPanel';
import { PresentationMode } from './PresentationMode';
import { OnboardingOverlay } from '@/components/shared/OnboardingOverlay';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export function AppShell() {
  return (
    <div className="flex flex-col h-screen bg-bg-void text-text-primary font-body">
      <ErrorBoundary section="Header">
        <Header />
      </ErrorBoundary>
      <div className="flex flex-1 overflow-hidden">
        <ErrorBoundary section="Controls Panel">
          <ControlsPanel />
        </ErrorBoundary>
        <ErrorBoundary section="Main Visualization">
          <MainVisualization />
        </ErrorBoundary>
        <ErrorBoundary section="Insights Panel">
          <InsightsPanel />
        </ErrorBoundary>
      </div>
      <ErrorBoundary section="Presentation Mode">
        <PresentationMode />
      </ErrorBoundary>
      <OnboardingOverlay />
    </div>
  );
}
