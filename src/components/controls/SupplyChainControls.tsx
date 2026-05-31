/**
 * ATLAS Phase 9: Supply Chain Controls
 *
 * UI controls for supply chain uncertainty parameters.
 * Orange accent (#F97316) per design spec.
 *
 * Flat subtitle layout matching InvestmentCorporateControls pattern.
 * Sections: Supply Shock Scenarios, Cost Pass-Through, Training Cost Dynamics,
 *           Training Cost Shares, Procurement Constraints, Supply Resilience,
 *           Cascade & Hysteresis.
 */

import { useCallback, useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import { getDefaultSupplyChainConfig } from '@/models/supplyChain';
import type { SupplyChainConfig } from '@/types';

const SC_COLOR = '#F97316';

/** Stable default — allocated once to avoid infinite re-render from new object refs. */
const STABLE_DEFAULT = getDefaultSupplyChainConfig();

export function SupplyChainControls() {
  const scFromStore = useSimulationStore((s) => s.config.supplyChainConfig);
  const sc = useMemo(() => scFromStore ?? STABLE_DEFAULT, [scFromStore]);
  const updateConfig = useSimulationStore((s) => s.updateConfig);

  // Helper: update a field on the SC config
  const updateSC = useCallback(
    (updater: (prev: SupplyChainConfig) => Partial<SupplyChainConfig>) => {
      updateConfig((config) => {
        const prev = config.supplyChainConfig ?? STABLE_DEFAULT;
        return { ...config, supplyChainConfig: { ...prev, ...updater(prev) } };
      });
    },
    [updateConfig],
  );

  // Supply Inputs
  const handleInput = useCallback(
    (field: keyof SupplyChainConfig['inputs']) => (value: number) => {
      updateSC((prev) => ({ inputs: { ...prev.inputs, [field]: value } }));
    },
    [updateSC],
  );

  // Resilience
  const handleResilience = useCallback(
    (field: keyof SupplyChainConfig['resilience']) => (value: number) => {
      updateSC((prev) => ({ resilience: { ...prev.resilience, [field]: value } }));
    },
    [updateSC],
  );

  // Training Dynamics
  const handleTrainingDynamics = useCallback(
    (component: 'aiChips' | 'energy' | 'datacenter', field: 'techDeclineRate' | 'scalePressure') =>
      (value: number) => {
        updateSC((prev) => ({
          trainingDynamics: {
            ...prev.trainingDynamics,
            [component]: { ...prev.trainingDynamics[component], [field]: value },
          },
        }));
      },
    [updateSC],
  );

  // Training Composition
  const handleComposition = useCallback(
    (field: keyof SupplyChainConfig['trainingComposition']) => (value: number) => {
      updateSC((prev) => {
        const newComp = { ...prev.trainingComposition, [field]: value };
        const sum = newComp.aiChips + newComp.energy + newComp.datacenter;
        if (sum > 0) {
          newComp.aiChips /= sum;
          newComp.energy /= sum;
          newComp.datacenter /= sum;
        }
        return { trainingComposition: newComp };
      });
    },
    [updateSC],
  );

  // Procurement Shares (auto-normalized to 100%)
  const handleProcurement = useCallback(
    (field: keyof SupplyChainConfig['procurementShares']) => (value: number) => {
      updateSC((prev) => {
        const newShares = { ...prev.procurementShares, [field]: value };
        const sum = newShares.aiChips + newShares.energy + newShares.datacenter;
        if (sum > 0) {
          newShares.aiChips /= sum;
          newShares.energy /= sum;
          newShares.datacenter /= sum;
        }
        return { procurementShares: newShares };
      });
    },
    [updateSC],
  );

  const fmtIdx = (v: number) => `${v.toFixed(0)}%`;
  const fmtPct = (v: number) => `${(v * 100).toFixed(0)}%`;
  const fmtDec = (v: number) => v.toFixed(2);
  const fmtRate = (v: number) => `${(v * 100).toFixed(1)}%/yr`;

  return (
    <div className="space-y-5">
      {/* Supply Shock Scenarios — capacity/price indices relative to baseline (100% = no constraint) */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Supply Shock Scenarios</p>
        <Slider label="AI Chip Availability" value={sc.inputs.aiChips} min={0} max={100} step={1}
          color={SC_COLOR} onChange={handleInput('aiChips')} formatValue={fmtIdx} />
        <Slider label="Energy Price Level" value={sc.inputs.energyPrice} min={50} max={500} step={5}
          color={SC_COLOR} onChange={handleInput('energyPrice')} formatValue={fmtIdx} />
        <Slider label="Grid Capacity for AI" value={sc.inputs.energyCapacity} min={0} max={100} step={1}
          color={SC_COLOR} onChange={handleInput('energyCapacity')} formatValue={fmtIdx} />
        <Slider label="Training DC Capacity" value={sc.inputs.trainingDCCapacity} min={0} max={100} step={1}
          color={SC_COLOR} onChange={handleInput('trainingDCCapacity')} formatValue={fmtIdx} />
        <Slider label="Inference DC Capacity" value={sc.inputs.inferenceDCCapacity} min={0} max={100} step={1}
          color={SC_COLOR} onChange={handleInput('inferenceDCCapacity')} formatValue={fmtIdx} />
        <Slider label="Robotics HW Availability" value={sc.inputs.roboticsHardware} min={0} max={100} step={1}
          color={SC_COLOR} onChange={handleInput('roboticsHardware')} formatValue={fmtIdx} />
        <Slider label="Software Efficiency" value={sc.inputs.softwareEfficiency} min={50} max={300} step={5}
          color={SC_COLOR} onChange={handleInput('softwareEfficiency')} formatValue={fmtIdx} />
      </div>

      {/* Cost Pass-Through — how much supply costs reach deployers/consumers */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Cost Pass-Through</p>
        <Slider label="Lab → Deployer Rate" value={sc.costPassThroughRate} min={0} max={1} step={0.01}
          color={SC_COLOR} onChange={(v) => updateSC(() => ({ costPassThroughRate: v }))} formatValue={fmtPct} />
        <Slider label="Deployer → Consumer Rate" value={sc.consumerPassThroughRate} min={0} max={1} step={0.01}
          color={SC_COLOR} onChange={(v) => updateSC(() => ({ consumerPassThroughRate: v }))} formatValue={fmtPct} />
      </div>

      {/* Training Cost Dynamics — per-component tech improvement and scaling pressure */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Training Cost Dynamics</p>
        <Slider label="Chip Cost Decline" value={sc.trainingDynamics.aiChips.techDeclineRate}
          min={-0.80} max={0.30} step={0.01} color={SC_COLOR}
          onChange={handleTrainingDynamics('aiChips', 'techDeclineRate')} formatValue={fmtRate} />
        <Slider label="Energy Cost Decline" value={sc.trainingDynamics.energy.techDeclineRate}
          min={-0.30} max={0.30} step={0.01} color={SC_COLOR}
          onChange={handleTrainingDynamics('energy', 'techDeclineRate')} formatValue={fmtRate} />
        <Slider label="DC Cost Decline" value={sc.trainingDynamics.datacenter.techDeclineRate}
          min={-0.30} max={0.30} step={0.01} color={SC_COLOR}
          onChange={handleTrainingDynamics('datacenter', 'techDeclineRate')} formatValue={fmtRate} />
        <Slider label="Chip Scale Pressure" value={sc.trainingDynamics.aiChips.scalePressure}
          min={0} max={0.50} step={0.01} color={SC_COLOR}
          onChange={handleTrainingDynamics('aiChips', 'scalePressure')} formatValue={fmtDec} />
        <Slider label="Energy Scale Pressure" value={sc.trainingDynamics.energy.scalePressure}
          min={0} max={0.50} step={0.01} color={SC_COLOR}
          onChange={handleTrainingDynamics('energy', 'scalePressure')} formatValue={fmtDec} />
        <Slider label="DC Scale Pressure" value={sc.trainingDynamics.datacenter.scalePressure}
          min={0} max={0.50} step={0.01} color={SC_COLOR}
          onChange={handleTrainingDynamics('datacenter', 'scalePressure')} formatValue={fmtDec} />
        <Slider label="DC Regulatory Friction" value={sc.regulatoryFriction}
          min={0.1} max={5.0} step={0.1} color={SC_COLOR}
          onChange={(v) => updateSC(() => ({ regulatoryFriction: v }))} formatValue={fmtDec} />
        <Slider label="Training Scale Growth" value={sc.trainingScaleGrowthRate}
          min={1.0} max={10.0} step={0.1} color={SC_COLOR}
          onChange={(v) => updateSC(() => ({ trainingScaleGrowthRate: v }))} formatValue={(v) => `${v.toFixed(1)}x/yr`} />
      </div>

      {/* Training Cost Shares — initial composition (auto-normalized to 100%) */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Training Cost Shares</p>
        <Slider label="Chip Cost Share" value={sc.trainingComposition.aiChips} min={0} max={1} step={0.01}
          color={SC_COLOR} onChange={handleComposition('aiChips')} formatValue={fmtPct} />
        <Slider label="Energy Cost Share" value={sc.trainingComposition.energy} min={0} max={1} step={0.01}
          color={SC_COLOR} onChange={handleComposition('energy')} formatValue={fmtPct} />
        <Slider label="DC Cost Share" value={sc.trainingComposition.datacenter} min={0} max={1} step={0.01}
          color={SC_COLOR} onChange={handleComposition('datacenter')} formatValue={fmtPct} />
      </div>

      {/* Procurement Constraint Shares — physical throughput limits (auto-normalized to 100%) */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Procurement Constraints</p>
        <Slider label="Chip Procurement Share" value={sc.procurementShares.aiChips} min={0} max={1} step={0.01}
          color={SC_COLOR} onChange={handleProcurement('aiChips')} formatValue={fmtPct} />
        <Slider label="Energy Procurement Share" value={sc.procurementShares.energy} min={0} max={1} step={0.01}
          color={SC_COLOR} onChange={handleProcurement('energy')} formatValue={fmtPct} />
        <Slider label="DC Procurement Share" value={sc.procurementShares.datacenter} min={0} max={1} step={0.01}
          color={SC_COLOR} onChange={handleProcurement('datacenter')} formatValue={fmtPct} />
        <Slider label="Cost vs Procurement Blend" value={sc.costVsProcurementBlend} min={0} max={1} step={0.01}
          color={SC_COLOR} onChange={(v) => updateSC(() => ({ costVsProcurementBlend: v }))} formatValue={fmtPct} />
      </div>

      {/* Supply Resilience — domestic substitution capacity per input [0=fully exposed, 1=fully resilient] */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Supply Resilience</p>
        <Slider label="Chip Fab Resilience" value={sc.resilience.aiChips} min={0} max={0.85} step={0.01}
          color={SC_COLOR} onChange={handleResilience('aiChips')} formatValue={fmtPct} />
        <Slider label="Energy Grid Resilience" value={sc.resilience.energy} min={0} max={0.95} step={0.01}
          color={SC_COLOR} onChange={handleResilience('energy')} formatValue={fmtPct} />
        <Slider label="Training DC Resilience" value={sc.resilience.trainingDC} min={0} max={0.95} step={0.01}
          color={SC_COLOR} onChange={handleResilience('trainingDC')} formatValue={fmtPct} />
        <Slider label="Inference DC Resilience" value={sc.resilience.inferenceDC} min={0} max={0.95} step={0.01}
          color={SC_COLOR} onChange={handleResilience('inferenceDC')} formatValue={fmtPct} />
        <Slider label="Rare Earth Resilience" value={sc.resilience.roboticsHardware} min={0} max={0.85} step={0.01}
          color={SC_COLOR} onChange={handleResilience('roboticsHardware')} formatValue={fmtPct} />
      </div>

      {/* Cascade & Hysteresis — chip cascade timing and adoption stickiness */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Cascade & Hysteresis</p>
        <Slider label="Chip Cascade Lag" value={sc.chipCascadeLag} min={1} max={5} step={0.1}
          color={SC_COLOR} onChange={(v) => updateSC(() => ({ chipCascadeLag: v }))}
          formatValue={(v) => `${v.toFixed(1)}yr`} />
        <Slider label="Cascade Cost Premium" value={sc.chipCascadeCostPremium} min={0} max={0.50} step={0.01}
          color={SC_COLOR} onChange={(v) => updateSC(() => ({ chipCascadeCostPremium: v }))} formatValue={fmtPct} />
        <Slider label="Cognitive Hysteresis Max" value={sc.hysteresisMaxCognitive} min={0} max={0.50} step={0.01}
          color={SC_COLOR} onChange={(v) => updateSC(() => ({ hysteresisMaxCognitive: v }))} formatValue={fmtDec} />
        <Slider label="Embodied Hysteresis Max" value={sc.hysteresisMaxEmbodied} min={0} max={0.60} step={0.01}
          color={SC_COLOR} onChange={(v) => updateSC(() => ({ hysteresisMaxEmbodied: v }))} formatValue={fmtDec} />
      </div>
    </div>
  );
}
