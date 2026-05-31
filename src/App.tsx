/**
 * ATLAS Root Application Component
 *
 * Phase 2: Renders the three-panel dashboard shell.
 * Phase 7: Decodes shared scenario from URL parameters on mount.
 */

import { useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { decodeScenarioFromURL } from '@/utils/scenarios';
import { decodeFiscalFromURL } from '@/utils/exportTimeline';
import { useSimulationStore } from '@/stores/simulationStore';

export function App() {
  const loadScenario = useSimulationStore((s) => s.loadScenario);
  const setFiscalPolicyPreset = useSimulationStore((s) => s.setFiscalPolicyPreset);
  const setParameterOverride = useSimulationStore((s) => s.setParameterOverride);

  // On mount, check for a shared scenario or fiscal config in URL params
  useEffect(() => {
    // Check for full scenario URL first
    const config = decodeScenarioFromURL();
    if (config) {
      loadScenario(config);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // Check for compact fiscal URL
    const fiscal = decodeFiscalFromURL();
    if (fiscal) {
      setFiscalPolicyPreset(fiscal.profile);
      for (const [key, value] of Object.entries(fiscal.overrides)) {
        const colonIdx = key.lastIndexOf(':');
        if (colonIdx >= 0) {
          const paramKey = key.slice(0, colonIdx);
          const year = parseInt(key.slice(colonIdx + 1), 10);
          if (!isNaN(year)) {
            setParameterOverride(paramKey, year, value);
          }
        }
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [loadScenario, setFiscalPolicyPreset, setParameterOverride]);

  return <AppShell />;
}
