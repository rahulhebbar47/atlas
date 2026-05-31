/**
 * ATLAS BFCS Threshold Editor (Phase 4)
 *
 * Cluster selector (grouped by category) + per-role threshold editing.
 * Sits below Capability Controls in the left panel.
 *
 * - Grouped <select> dropdown of 51 clusters
 * - When cluster selected, expands to show all roles via BFCSRoleEditor
 * - "N of M roles triggered" badge
 * - "Reset to defaults" button per cluster
 * - Framer Motion AnimatePresence for expand/collapse
 */

import { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '@/stores/simulationStore';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { useBFCSScoresForCluster } from '@/hooks/useBFCSScores';
import { useBFCSOverrideCount } from '@/hooks/useSimulation';
import { getCategoryColor } from '@/utils/colors';
import { BFCSRoleEditor } from './BFCSRoleEditor';

/** Build grouped cluster options for the <select> dropdown. */
function useClusterGroups(): Array<{
  category: string;
  clusters: Array<{ id: string; name: string }>;
}> {
  return useMemo(() => {
    const grouped = new Map<string, Array<{ id: string; name: string }>>();

    for (const cluster of OCCUPATION_CLUSTERS) {
      if (!grouped.has(cluster.category)) {
        grouped.set(cluster.category, []);
      }
      grouped.get(cluster.category)!.push({
        id: cluster.id,
        name: cluster.name,
      });
    }

    return Array.from(grouped.entries()).map(([category, clusters]) => ({
      category,
      clusters,
    }));
  }, []);
}

/** Build bfcsOverrides that set all 4 thresholds to 1.0 for every role in every cluster. */
function buildMaxThresholdOverrides(): Record<string, Record<string, { better: number; faster: number; cheaper: number; safer: number }>> {
  const overrides: Record<string, Record<string, { better: number; faster: number; cheaper: number; safer: number }>> = {};
  for (const cluster of OCCUPATION_CLUSTERS) {
    const clusterOverrides: Record<string, { better: number; faster: number; cheaper: number; safer: number }> = {};
    for (const role of cluster.roles) {
      clusterOverrides[role.id] = { better: 1.0, faster: 1.0, cheaper: 1.0, safer: 1.0 };
    }
    overrides[cluster.id] = clusterOverrides;
  }
  return overrides;
}

export function BFCSEditor() {
  const selectedClusterId = useSimulationStore((s) => s.selectedClusterId);
  const setSelectedCluster = useSimulationStore((s) => s.setSelectedCluster);
  const resetClusterBFCS = useSimulationStore((s) => s.resetClusterBFCS);
  const updateConfig = useSimulationStore((s) => s.updateConfig);
  const overrideCount = useBFCSOverrideCount();

  const clusterGroups = useClusterGroups();

  const handleClusterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setSelectedCluster(value === '' ? null : value);
    },
    [setSelectedCluster],
  );

  const handleResetCluster = useCallback(() => {
    if (selectedClusterId) {
      resetClusterBFCS(selectedClusterId);
    }
  }, [selectedClusterId, resetClusterBFCS]);

  const handleResetAll = useCallback(() => {
    updateConfig((config) => ({ ...config, bfcsOverrides: {} }));
  }, [updateConfig]);

  const handleMaxAll = useCallback(() => {
    updateConfig((config) => ({ ...config, bfcsOverrides: buildMaxThresholdOverrides() }));
  }, [updateConfig]);

  // Get the selected cluster's metadata
  const selectedCluster = useMemo(
    () => OCCUPATION_CLUSTERS.find((c) => c.id === selectedClusterId),
    [selectedClusterId],
  );

  return (
    <div className="space-y-3">
      {/* Presets */}
      <div className="flex items-center gap-2">
        <span className="text-text-muted text-[10px] font-mono uppercase tracking-wider mr-auto">Presets</span>
        <button
          onClick={handleResetAll}
          className="text-[10px] font-mono px-2 py-1 rounded border border-border text-text-secondary hover:text-text-primary hover:border-gold transition-colors"
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleMaxAll}
          className="text-[10px] font-mono px-2 py-1 rounded border border-border text-text-secondary hover:text-text-primary hover:border-gold transition-colors"
        >
          Full Augmentation
        </button>
      </div>

      {/* Cluster selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-text-secondary text-[11px] font-medium">
            Select Cluster
          </label>
          {overrideCount > 0 && (
            <span className="font-mono text-[9px] text-gold px-1.5 py-0.5 bg-gold-subtle rounded">
              {overrideCount} modified
            </span>
          )}
        </div>

        <select
          value={selectedClusterId ?? ''}
          onChange={handleClusterChange}
          className="w-full bg-bg-elevated border border-border rounded-md px-2.5 py-1.5 text-[11px] font-mono text-text-primary focus:border-gold focus:outline-none transition-colors appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%234E5D75' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            paddingRight: '28px',
          }}
        >
          <option value="">Choose an occupation cluster...</option>
          {clusterGroups.map((group) => (
            <optgroup key={group.category} label={group.category}>
              {group.clusters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Expanded cluster editor */}
      <AnimatePresence initial={false}>
        {selectedCluster && selectedClusterId && (
          <motion.div
            key={selectedClusterId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <ClusterRolesPanel
              clusterId={selectedClusterId}
              clusterName={selectedCluster.name}
              category={selectedCluster.category}
              roleCount={selectedCluster.roles.length}
              onResetCluster={handleResetCluster}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Inner panel showing roles for the selected cluster. */
function ClusterRolesPanel({
  clusterId,
  clusterName,
  category,
  roleCount,
  onResetCluster,
}: {
  clusterId: string;
  clusterName: string;
  category: string;
  roleCount: number;
  onResetCluster: () => void;
}) {
  const snapshots = useBFCSScoresForCluster(clusterId);
  const bfcsOverrides = useSimulationStore((s) => s.config.bfcsOverrides);
  const hasOverrides = bfcsOverrides[clusterId] !== undefined;

  const triggeredCount = snapshots.filter((s) => s.triggered).length;
  const categoryColor = getCategoryColor(category);

  return (
    <div className="border border-border rounded-lg bg-bg-surface p-3 space-y-3">
      {/* Cluster header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: categoryColor }}
          />
          <span className="font-mono text-[11px] font-medium text-text-primary truncate max-w-[140px]">
            {clusterName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-text-muted">
            <span className={triggeredCount > 0 ? 'text-gold' : ''}>
              {triggeredCount}
            </span>
            /{roleCount} triggered
          </span>
          {hasOverrides && (
            <button
              onClick={onResetCluster}
              className="text-[9px] font-mono text-text-muted hover:text-gold transition-colors"
            >
              reset all
            </button>
          )}
        </div>
      </div>

      {/* Role editors */}
      <div className="space-y-4">
        {snapshots.map((snapshot) => (
          <div
            key={snapshot.roleId}
            className="border-t border-border pt-3 first:border-t-0 first:pt-0"
          >
            <BFCSRoleEditor snapshot={snapshot} />
          </div>
        ))}
      </div>
    </div>
  );
}
