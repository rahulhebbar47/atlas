/**
 * ATLAS US Choropleth Map (Phase 6)
 *
 * React-rendered SVG map using D3-geo projections + TopoJSON.
 * D3 handles geometry (projection, path generation), React handles rendering.
 *
 * Features:
 *   - Color scale: green (low impact) → gold (moderate) → red (high impact)
 *   - Hover tooltip with state name + metric value
 *   - Click selects state → navigates to StateDetailView
 *   - Metric toggle buttons above map
 *   - Color legend bar below map
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { scaleSequential } from 'd3-scale';
import { interpolateRdYlGn } from 'd3-scale-chromatic';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { useSimulationStore } from '@/stores/simulationStore';
import { useStateMapData, useStateDataLoaded } from '@/hooks/useStateData';
import { STATE_FIPS_CODES } from '@/data/stateData';
import { formatPercent } from '@/utils/format';
import type { StateCode } from '@/types';
import type { StateMapDataPoint } from '@/hooks/useStateData';

// ============================================================
// Types
// ============================================================

interface StateFeature extends Feature<Geometry> {
  id: string;
  properties: { name: string };
}

type MetricKey = 'displacement' | 'unemploymentRate' | 'policyEffectiveness';

const METRIC_LABELS: Record<MetricKey, string> = {
  displacement: 'Displacement',
  unemploymentRate: 'Unemployment',
  policyEffectiveness: 'Policy Effect.',
};

// ============================================================
// FIPS → StateCode reverse lookup
// ============================================================

const FIPS_TO_STATE: Record<string, StateCode> = {};
for (const [code, fips] of Object.entries(STATE_FIPS_CODES)) {
  FIPS_TO_STATE[fips] = code as StateCode;
}

// ============================================================
// Map dimensions and projection
// ============================================================

const MAP_WIDTH = 960;
const MAP_HEIGHT = 600;

const projection = geoAlbersUsa()
  .scale(1280)
  .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);

const pathGenerator = geoPath().projection(projection);

// ============================================================
// Component
// ============================================================

export function StateMap() {
  const [features, setFeatures] = useState<StateFeature[]>([]);
  const [hoveredState, setHoveredState] = useState<StateCode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const mapData = useStateMapData();
  const stateDataLoaded = useStateDataLoaded();
  const selectedStateCode = useSimulationStore((s) => s.selectedStateCode);
  const setSelectedState = useSimulationStore((s) => s.setSelectedState);
  const stateMapMetric = useSimulationStore((s) => s.stateMapMetric);
  const setStateMapMetric = useSimulationStore((s) => s.setStateMapMetric);

  // Load TopoJSON on mount
  useEffect(() => {
    fetch('/data/us-states-10m.json')
      .then((res) => res.json())
      .then((topology: Topology) => {
        const geojson = feature(
          topology,
          topology.objects.states as GeometryCollection,
        ) as FeatureCollection<Geometry>;

        // Filter to only states we have FIPS codes for (50 + DC)
        const stateFeatures = geojson.features.filter(
          (f) => FIPS_TO_STATE[f.id as string],
        ) as StateFeature[];

        setFeatures(stateFeatures);
      })
      .catch((err) => {
        console.error('[ATLAS] Failed to load TopoJSON:', err);
      });
  }, []);

  // Build data lookup
  const dataLookup = useMemo(() => {
    const map = new Map<StateCode, StateMapDataPoint>();
    for (const d of mapData) {
      map.set(d.code, d);
    }
    return map;
  }, [mapData]);

  // Color scale: RdYlGn with FIXED domains per metric type.
  // FIX: Previously used a relative scale based on the data's
  // max value, which made all states look extreme even at low absolute values
  // (e.g., all states red at 4% unemployment). Fixed domains provide meaningful
  // color mapping:
  //   - displacement: 0% (green) → 30% (red)
  //   - unemployment: 2% (green) → 15% (red)
  //   - policyEffectiveness: 0% (red) → 100% (green) — reversed since high is good
  const colorScale = useMemo(() => {
    if (mapData.length === 0) return null;

    // For policyEffectiveness, higher is BETTER (green), lower is worse (red)
    // For displacement and unemployment, higher is WORSE (red), lower is better (green)
    // interpolateRdYlGn: domain[0] → Red, domain[1] → Green
    switch (stateMapMetric) {
      case 'displacement':
        // 30% displacement → Red, 0% → Green
        return scaleSequential<string>(interpolateRdYlGn).domain([0.30, 0]);
      case 'unemploymentRate':
        // 15% unemployment → Red, 2% → Green
        return scaleSequential<string>(interpolateRdYlGn).domain([0.15, 0.02]);
      case 'policyEffectiveness':
        // 0% effectiveness → Red, 100% → Green
        return scaleSequential<string>(interpolateRdYlGn).domain([0, 1.0]);
    }
  }, [mapData, stateMapMetric]);

  const getStateColor = useCallback(
    (fipsId: string): string => {
      if (!colorScale) return '#1a2235';
      const stateCode = FIPS_TO_STATE[fipsId];
      if (!stateCode) return '#1a2235';
      const data = dataLookup.get(stateCode);
      if (!data) return '#1a2235';
      return colorScale(data[stateMapMetric]);
    },
    [colorScale, dataLookup, stateMapMetric],
  );

  const formatMetricValue = useCallback(
    (data: StateMapDataPoint): string => {
      switch (stateMapMetric) {
        case 'displacement':
          return formatPercent(data.displacement);
        case 'unemploymentRate':
          return formatPercent(data.unemploymentRate);
        case 'policyEffectiveness':
          return formatPercent(data.policyEffectiveness);
      }
    },
    [stateMapMetric],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, fipsId: string) => {
      const stateCode = FIPS_TO_STATE[fipsId];
      if (stateCode) {
        setHoveredState(stateCode);
        const rect = e.currentTarget.closest('svg')?.getBoundingClientRect();
        if (rect) {
          setTooltipPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }
      }
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredState(null);
  }, []);

  const handleClick = useCallback(
    (fipsId: string) => {
      const stateCode = FIPS_TO_STATE[fipsId];
      if (stateCode) {
        setSelectedState(stateCode);
      }
    },
    [setSelectedState],
  );

  if (!stateDataLoaded) {
    return (
      <div className="border border-border rounded-2xl bg-bg-surface p-8 text-center">
        <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.1em] text-text-primary mb-2">
          State Data Not Available
        </h2>
        <p className="text-text-muted text-[13px]">
          Run the fetch script with <code className="font-mono text-gold">--include-states</code> to load state-level BLS data.
        </p>
      </div>
    );
  }

  const hoveredData = hoveredState ? dataLookup.get(hoveredState) : null;

  return (
    <div className="space-y-3">
      {/* Metric toggle buttons */}
      <div className="flex items-center gap-1">
        {(Object.keys(METRIC_LABELS) as MetricKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setStateMapMetric(key)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-mono transition-colors ${
              stateMapMetric === key
                ? 'bg-gold/15 text-gold border border-gold/30'
                : 'bg-bg-elevated text-text-muted border border-border hover:text-text-secondary'
            }`}
          >
            {METRIC_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Map container */}
      <div className="bg-bg-card border border-border rounded-[16px] p-6 relative">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="w-full h-auto"
          style={{ maxHeight: '500px' }}
        >
          {features.map((feat) => {
            const d = pathGenerator(feat);
            if (!d) return null;

            const stateCode = FIPS_TO_STATE[feat.id];
            const isSelected = stateCode === selectedStateCode;
            const isHovered = stateCode === hoveredState;

            return (
              <path
                key={feat.id}
                d={d}
                fill={getStateColor(feat.id)}
                stroke={
                  isSelected
                    ? '#D4A03C'
                    : isHovered
                      ? 'rgba(212, 160, 60, 0.6)'
                      : 'rgba(138, 150, 173, 0.2)'
                }
                strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.5}
                className="cursor-pointer transition-[stroke,stroke-width] duration-150"
                onMouseMove={(e) => handleMouseMove(e, feat.id)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(feat.id)}
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredData && (
          <div
            className="absolute pointer-events-none bg-bg-card border border-border rounded-[8px] px-3 py-2 z-10"
            style={{
              left: tooltipPos.x + 12,
              top: tooltipPos.y - 40,
            }}
          >
            <div className="font-mono text-[11px] text-text-primary font-medium">
              {hoveredData.name}
            </div>
            <div className="flex items-center gap-2 text-[11px] mt-1">
              <span className="text-text-muted">
                {METRIC_LABELS[stateMapMetric]}
              </span>
              <span className="font-mono text-text-primary ml-auto">
                {formatMetricValue(hoveredData)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Color legend with labeled ticks — shows fixed scale values */}
      {colorScale && (
        <div className="flex items-center gap-2 px-2">
          <span className="text-text-muted text-[10px] font-mono">
            {stateMapMetric === 'displacement' ? '0%'
              : stateMapMetric === 'unemploymentRate' ? '2%'
              : '0%'}
          </span>
          <div
            className="flex-1 h-2 rounded-full"
            style={{
              background: stateMapMetric === 'policyEffectiveness'
                ? 'linear-gradient(to right, #d73027, #fee08b, #1a9850)'
                : 'linear-gradient(to right, #1a9850, #fee08b, #d73027)',
            }}
          />
          <span className="text-text-muted text-[10px] font-mono">
            {stateMapMetric === 'displacement' ? '30%'
              : stateMapMetric === 'unemploymentRate' ? '15%'
              : '100%'}
          </span>
        </div>
      )}
    </div>
  );
}
