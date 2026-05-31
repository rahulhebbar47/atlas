/**
 * ATLAS BFCS Role Editor (Phase 4)
 *
 * Per-role display within the BFCS Threshold Editor:
 * - Role label + seniority badge
 * - Trigger status indicator (gold "TRIGGERED 2029" or muted "NOT YET ~2033")
 * - 4x BFCSScoreBar components (B, F, C, S)
 * - "Reset role" link if any threshold is overridden
 */

import { memo, useCallback } from 'react';
import type { BFCSRoleScoreSnapshot, BFCSThresholds } from '@/types';
import { useSimulationStore } from '@/stores/simulationStore';
import { BFCSScoreBar } from './BFCSScoreBar';

const BFCS_DIMENSIONS: (keyof BFCSThresholds)[] = ['better', 'faster', 'cheaper', 'safer'];

interface BFCSRoleEditorProps {
  snapshot: BFCSRoleScoreSnapshot;
}

export const BFCSRoleEditor = memo(function BFCSRoleEditor({
  snapshot,
}: BFCSRoleEditorProps) {
  const setBFCSThreshold = useSimulationStore((s) => s.setBFCSThreshold);
  const resetRoleBFCS = useSimulationStore((s) => s.resetRoleBFCS);

  const handleThresholdChange = useCallback(
    (dimension: keyof BFCSThresholds, value: number) => {
      setBFCSThreshold(snapshot.clusterId, snapshot.roleId, dimension, value);
    },
    [snapshot.clusterId, snapshot.roleId, setBFCSThreshold],
  );

  const handleResetRole = useCallback(() => {
    resetRoleBFCS(snapshot.clusterId, snapshot.roleId);
  }, [snapshot.clusterId, snapshot.roleId, resetRoleBFCS]);

  // Count how many of 4 dimensions are met
  const metCount = BFCS_DIMENSIONS.filter(
    (d) => snapshot.scores[d] >= snapshot.thresholds[d],
  ).length;

  return (
    <div className="space-y-2">
      {/* Role header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-medium text-text-primary">
            {snapshot.roleLabel}
          </span>
          <span className="font-mono text-[9px] text-text-muted px-1.5 py-0.5 bg-bg-elevated rounded">
            {metCount}/4
          </span>
        </div>

        {/* Trigger status */}
        <div className="flex items-center gap-2">
          {snapshot.isOverridden && (
            <button
              onClick={handleResetRole}
              className="text-[9px] font-mono text-text-muted hover:text-gold transition-colors"
            >
              reset
            </button>
          )}
          {snapshot.triggered ? (
            <span className="font-mono text-[9px] font-medium text-gold">
              TRIGGERED {snapshot.triggerYear ?? ''}
            </span>
          ) : (
            <span className="font-mono text-[9px] text-text-muted">
              {snapshot.triggerYear
                ? `~${snapshot.triggerYear}`
                : 'Beyond range'}
            </span>
          )}
        </div>
      </div>

      {/* 4x BFCS Score Bars */}
      <div className="space-y-1.5 pl-1">
        {BFCS_DIMENSIONS.map((dim) => (
          <BFCSScoreBar
            key={dim}
            dimension={dim}
            score={snapshot.scores[dim]}
            threshold={snapshot.thresholds[dim]}
            defaultThreshold={snapshot.defaultThresholds[dim]}
            onThresholdChange={handleThresholdChange}
            onReset={() =>
              setBFCSThreshold(
                snapshot.clusterId,
                snapshot.roleId,
                dim,
                snapshot.defaultThresholds[dim],
              )
            }
          />
        ))}
      </div>
    </div>
  );
});
