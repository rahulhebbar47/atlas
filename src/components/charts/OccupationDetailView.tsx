/**
 * ATLAS Occupation Detail View (Phase 4)
 *
 * Per-cluster deep dive shown when a cluster is selected from the browser.
 * Contains:
 * 1. Back button + cluster header
 * 2. Role breakdown table (current year data)
 * 3. BFCS trajectory chart (4 lines per role)
 * 4. Cluster employment chart (baseline vs actual)
 * 5. Second-order impact metric cards
 */

import { useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { useClusterDetailData } from '@/hooks/useOccupationData';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { getCategoryColor } from '@/utils/colors';
import { formatNumber, formatPercent } from '@/utils/format';
import { BFCSTrajectoryChart } from './BFCSTrajectoryChart';
import { ClusterEmploymentChart } from './ClusterEmploymentChart';
import { MultiplierFlowDiagram } from './MultiplierFlowDiagram';

export function OccupationDetailView() {
  const selectedClusterId = useSimulationStore((s) => s.selectedClusterId);
  const setSelectedCluster = useSimulationStore((s) => s.setSelectedCluster);
  const detail = useClusterDetailData(selectedClusterId ?? '');

  const cluster = useMemo(
    () => OCCUPATION_CLUSTERS.find((c) => c.id === selectedClusterId),
    [selectedClusterId],
  );

  if (!selectedClusterId || !detail || !cluster) return null;

  const categoryColor = getCategoryColor(cluster.category);

  return (
    <div className="space-y-6">
      {/* Back button + header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => setSelectedCluster(null)}
            className="flex items-center gap-1.5 text-text-muted hover:text-gold text-[11px] font-mono mb-2 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7.5 9L4.5 6L7.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Browser
          </button>

          <h2 className="font-display text-xl text-text-primary">
            {cluster.name}
          </h2>

          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: categoryColor }}
              />
              <span className="text-text-secondary text-[11px]">
                {cluster.category}
              </span>
            </div>
            <span className="text-text-muted text-[10px] font-mono">
              {cluster.deploymentType.toUpperCase()}
            </span>
            <span className="text-text-muted text-[10px] font-mono">
              {cluster.employmentMultiplier.toFixed(1)}x multiplier
            </span>
          </div>
        </div>

        {/* Summary stat */}
        <div className="text-right">
          <div className="font-mono text-lg text-text-primary">
            {formatNumber(detail.baselineEmployment, { compact: true })}
          </div>
          <div className="text-text-muted text-[10px] font-mono">
            baseline employment
          </div>
        </div>
      </div>

      {/* Role Breakdown Table */}
      <RoleBreakdownTable detail={detail} />

      {/* Charts side by side on wide screens */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <BFCSTrajectoryChart clusterId={selectedClusterId} />
        <ClusterEmploymentChart clusterId={selectedClusterId} />
      </div>

      {/* Cascade Effects Flow Diagram (Phase 8) */}
      <MultiplierFlowDiagram clusterId={selectedClusterId} />

      {/* Second-order impact */}
      <SecondOrderImpact detail={detail} multiplier={cluster.employmentMultiplier} />
    </div>
  );
}

/** Role breakdown table for the current year. */
function RoleBreakdownTable({ detail }: { detail: NonNullable<ReturnType<typeof useClusterDetailData>> }) {
  const currentCluster = detail.currentYearCluster;
  if (!currentCluster) return null;

  return (
    <div className="bg-bg-card border border-border rounded-[16px] p-4 overflow-x-auto">
      <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted mb-3">
        Role Breakdown
      </h3>
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-border">
            <th className="py-1.5 px-2 text-left text-text-muted font-mono text-[10px] uppercase tracking-wider">Role</th>
            <th className="py-1.5 px-2 text-right text-text-muted font-mono text-[10px] uppercase tracking-wider">Employment</th>
            <th className="py-1.5 px-2 text-right text-text-muted font-mono text-[10px] uppercase tracking-wider">Displaced %</th>
            <th className="py-1.5 px-2 text-right text-text-muted font-mono text-[10px] uppercase tracking-wider">Adoption</th>
            <th className="py-1.5 px-2 text-right text-text-muted font-mono text-[10px] uppercase tracking-wider">Task Erosion</th>
            <th className="py-1.5 px-2 text-right text-text-muted font-mono text-[10px] uppercase tracking-wider">Wage Impact</th>
            <th className="py-1.5 px-2 text-right text-text-muted font-mono text-[10px] uppercase tracking-wider">Trigger</th>
          </tr>
        </thead>
        <tbody>
          {currentCluster.roles.map((role, i) => {
            const bfcs = currentCluster.bfcsOutput.find((b) => b.roleId === role.roleId);
            const displacementFrac = 1 - role.headcountMultiplier;
            const wageDepression = 1 - role.wageMultiplier;
            return (
              <tr
                key={role.roleId}
                className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-bg-elevated/20' : ''}`}
              >
                <td className="py-1.5 px-2 text-text-primary font-medium">
                  {role.roleId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </td>
                <td className="py-1.5 px-2 text-right font-mono text-text-secondary">
                  {formatNumber(role.remainingEmployment, { compact: true })}
                </td>
                <td
                  className="py-1.5 px-2 text-right font-mono"
                  style={{
                    color: displacementFrac > 0.01 ? '#EF4444' : '#9CA3AF',
                  }}
                >
                  {formatPercent(displacementFrac, 1)}
                </td>
                <td className="py-1.5 px-2 text-right font-mono text-text-secondary">
                  {formatPercent(bfcs?.adoptionRate ?? 0, 0)}
                </td>
                <td className="py-1.5 px-2 text-right font-mono text-text-secondary">
                  {formatPercent(role.displacementPct, 1)}
                </td>
                <td
                  className="py-1.5 px-2 text-right font-mono"
                  style={{
                    color: wageDepression > 0.01 ? '#F97316' : '#9CA3AF',
                  }}
                >
                  {wageDepression > 0.001
                    ? `-${formatPercent(wageDepression, 1)}`
                    : '\u2014'}
                </td>
                <td className="py-1.5 px-2 text-right font-mono text-text-secondary">
                  {bfcs?.triggerYear ?? '\u2014'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Second-order impact metric cards. */
function SecondOrderImpact({
  detail,
  multiplier,
}: {
  detail: NonNullable<ReturnType<typeof useClusterDetailData>>;
  multiplier: number;
}) {
  const currentCluster = detail.currentYearCluster;
  if (!currentCluster) return null;

  const directDisplacement = currentCluster.totalDirectDisplacement;
  const secondOrder = currentCluster.secondOrderDisplacement ?? 0;
  const totalImpact = directDisplacement + secondOrder;

  return (
    <div className="bg-bg-card border border-border rounded-[16px] p-4">
      <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted mb-3">
        Second-Order Impact
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Direct Displacement"
          value={formatNumber(directDisplacement, { compact: true })}
          color="#EF4444"
        />
        <MetricCard
          label="Multiplier"
          value={`${multiplier.toFixed(1)}x`}
          color="#8A96AD"
        />
        <MetricCard
          label="Second-Order"
          value={formatNumber(secondOrder, { compact: true })}
          color="#F97316"
        />
        <MetricCard
          label="Total Impact"
          value={formatNumber(totalImpact, { compact: true })}
          color="#EF4444"
        />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className="font-mono text-lg" style={{ color }}>
        {value}
      </div>
      <div className="text-text-muted text-[10px] font-mono mt-0.5">
        {label}
      </div>
    </div>
  );
}
