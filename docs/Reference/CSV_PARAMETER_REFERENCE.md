# CSV Parameter Reference

ATLAS supports importing and exporting simulation parameters as CSV files. This enables formula verification workflows: export your current slider settings as CSV, edit values in Excel or Google Sheets, re-import, and compare simulation results.

This document is the complete reference for every valid parameter path accepted by the CSV import system.

---

## CSV Format

The CSV uses two columns with no required header row:

```
parameter_path,value
```

Rules:

- **Header row**: If the first row is literally `parameter_path,value`, it is skipped automatically.
- **Comment lines**: Lines starting with `#` are ignored.
- **Empty lines**: Skipped.
- **Omitted parameters**: Any parameter path not present in the CSV retains its default value from the Status Quo baseline.
- **Booleans**: Accepted values are `true`, `false`, `1`, `0`, `yes`, `no` (case-insensitive).
- **Numbers**: Standard decimal notation. Scientific notation is supported (e.g., `1.5e-8`).
- **Enums**: Must match one of the listed allowed values exactly (case-sensitive).
- **PolicySchedule**: See [PolicySchedule Values](#policyschedule-values) below.

### PolicySchedule Values

Several policy parameters use a **PolicySchedule** format that supports time-varying values via keyframes with linear interpolation.

**JSON Keyframe Format** (canonical):
```csv
policy.ubi.monthly_amount,"[{""year"":2025,""value"":0},{""year"":2035,""value"":1000}]"
```

The value is a JSON array of `{year, value}` objects. Values between keyframes are linearly interpolated. The JSON must be wrapped in double quotes with internal quotes doubled (CSV escaping).

**Flat Number Shorthand**:
```csv
policy.ubi.monthly_amount,1000
```

A single number is interpreted as a constant schedule at the simulation start year.

---

## Quick Start

A minimal CSV that changes only the simulation time range and enables UBI:

```csv
parameter_path,value
start_year,2025
end_year,2040
policy.ubi.enabled,true
policy.ubi.monthly_amount,1000
```

All other parameters use their defaults. You only need to include the rows you want to change.

---

## Full Parameter List

### 1. Global / Timeline Parameters (2 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `start_year` | integer | 2025 | First year of the simulation |
| `end_year` | integer | 2050 | Last year of the simulation. Must be greater than `start_year`. |

### 2. Macro Parameters (2 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `base_inflation_rate` | float | 0.02 | Baseline annual inflation rate (2% = 0.02) |
| `baseline_gdp_growth` | float | 0.02 | Baseline annual real GDP growth rate absent AI effects |

### 3. Population Parameters (3 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `total_population` | integer | 340000000 | Total US population |
| `labor_force` | integer | 168000000 | Total US civilian labor force |
| `population_growth_rate` | float | 0.004 | Annual population growth rate. Source: US Census Bureau Population Projections (2023 release), middle series. Optional — if omitted, uses default. |

### 4. New Job Creation Parameters (3 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `innovation_rate` | float | 1.5e-8 | Base rate of new job creation from technological innovation |
| `rd_multiplier` | float | 1.5 | R&D spending multiplier on job creation rate |
| `job_persistence_factor` | float | 1.5 | How quickly new jobs accumulate (higher = more persistent) |

### 5. Adoption Parameters (7 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `adoption.steepness.software` | float | 3.0 | S-curve steepness for software deployment adoption |
| `adoption.steepness.robotics` | float | 0.75 | S-curve steepness for robotics deployment adoption |
| `adoption.steepness.autonomous_vehicle` | float | 0.8 | S-curve steepness for autonomous vehicle deployment adoption |
| `adoption.steepness.hybrid` | float | 1.5 | S-curve steepness for hybrid deployment adoption |
| `adoption.competitive_pressure_multiplier` | float | 2.0 | How much competitive pressure accelerates adoption once threshold is crossed |
| `adoption.competitive_pressure_threshold` | float | 0.2 | Industry adoption fraction that triggers competitive pressure acceleration |
| `adoption.geopolitical_risk_factor` | float | 0.1 | Additional adoption pressure from geopolitical AI competition |

### 6. Capability Trajectories (12 paths)

Three consolidated AI capability vectors, each with 4 parameters controlling its S-curve trajectory over time. The capability score at any year is computed as: `floor + (ceiling - floor) * sigmoid(steepness * (year - midpoint))`.

Pattern: `capability.{vectorId}.{param}`

Vector IDs: `generative`, `agentic`, `embodied`

Parameters per vector: `floor`, `ceiling`, `steepness`, `midpoint`

**Note**: `midpoint` in the CSV maps to `midpointYear` in the TypeScript type. This is an intentional simplification for the CSV format.

| parameter_path | type | default | description |
|---|---|---|---|
| `capability.generative.floor` | float | 0.10 | Generative AI (language, code, creative, scientific): minimum capability score |
| `capability.generative.ceiling` | float | 0.95 | Generative AI: maximum achievable capability score |
| `capability.generative.steepness` | float | 0.6 | Generative AI: S-curve steepness (higher = faster transition) |
| `capability.generative.midpoint` | integer | 2033 | Generative AI: year of steepest capability growth |
| `capability.agentic.floor` | float | 0.05 | Agentic AI (multi-step workflows, decisions): minimum capability score |
| `capability.agentic.ceiling` | float | 0.90 | Agentic AI: maximum achievable capability score |
| `capability.agentic.steepness` | float | 0.5 | Agentic AI: S-curve steepness |
| `capability.agentic.midpoint` | integer | 2038 | Agentic AI: year of steepest capability growth |
| `capability.embodied.floor` | float | 0.02 | Embodied AI (robotics, autonomous vehicles): minimum capability score |
| `capability.embodied.ceiling` | float | 0.85 | Embodied AI: maximum achievable capability score |
| `capability.embodied.steepness` | float | 0.5 | Embodied AI: S-curve steepness |
| `capability.embodied.midpoint` | integer | 2043 | Embodied AI: year of steepest capability growth |

### 7. Policy Configuration

#### 7a. Minimum Wage (4 base paths + 51 state override paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `policy.minimum_wage.enabled` | boolean | true | Whether federal minimum wage is active. Default `true` reflects the existing US $7.25/hr federal minimum wage. |
| `policy.minimum_wage.federal_minimum` | PolicySchedule | `[{"year":2025,"value":7.25}]` | Federal minimum wage in USD/hour. Supports keyframes for time-varying schedules. |
| `policy.minimum_wage.indexed_to_inflation` | boolean | false | Whether the minimum wage automatically increases with inflation |
| `policy.minimum_wage.indexed_to_productivity` | boolean | false | Whether the minimum wage automatically increases with productivity growth |

State-level minimum wage overrides use the pattern: `policy.minimum_wage.state_override.{StateCode}`

Each takes a float value (USD/hour). Only include states you want to override. See the [State Codes](#all-state-codes) section for the full list of 51 state codes.

Example: `policy.minimum_wage.state_override.CA,15.50`

#### 7b. Wage Subsidy (4 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `policy.wage_subsidy.enabled` | boolean | false | Whether government wage subsidies are active |
| `policy.wage_subsidy.subsidy_percentage` | PolicySchedule | `[{"year":2025,"value":0}]` | Percentage of wages subsidized by government (0-1). Supports keyframes. |
| `policy.wage_subsidy.max_per_worker` | float | 0 | Maximum annual subsidy per worker in USD |
| `policy.wage_subsidy.phase_out_threshold` | float | 0 | Income threshold at which the subsidy begins to phase out (USD) |

#### 7c. Work Week Reduction (DEPRECATED — 0 paths)

This policy is deprecated. The `policy.work_week.*` paths are no longer recognized by the CSV import system and have no computation logic in the simulation. They are not exported.

#### 7d. Sovereign Wealth Fund (6 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `policy.swf.enabled` | boolean | false | Whether a sovereign wealth fund is established |
| `policy.swf.initial_fund_size` | float | 0 | Initial fund capitalization in billions USD |
| `policy.swf.annual_contribution` | PolicySchedule | `[{"year":2025,"value":0}]` | Annual government contribution in billions USD. Supports keyframes. |
| `policy.swf.expected_return` | float | 0.07 | Expected annual return rate on fund assets (7% = 0.07) |
| `policy.swf.distribution_rate` | float | 0.04 | Annual distribution rate from fund to population (4% = 0.04) |
| `policy.swf.distribution` | enum | universal | Distribution method. Allowed values: `universal`, `means_tested` |

#### 7e. Universal Equity (5 paths)

**Note (Phase 5g)**: Equity fields are merged into the Sovereign Wealth Fund internally. Both `policy.swf.*` and `policy.equity.*` paths write to the same underlying config object (`policyConfig.sovereignWealthFund`). You may use either prefix.

| parameter_path | type | default | description |
|---|---|---|---|
| `policy.equity.enabled` | boolean | false | Whether universal equity ownership of AI companies is mandated |
| `policy.equity.ownership_fraction` | PolicySchedule | `[{"year":2025,"value":0}]` | Fraction of AI company equity owned by the public (0-1). Supports keyframes. |
| `policy.equity.total_ai_profits` | float | 500 | Total AI company profits in billions USD/year |
| `policy.equity.profit_growth_rate` | float | 0.15 | Annual growth rate of AI company profits (15% = 0.15) |
| `policy.equity.distribution_method` | enum | equal | How equity dividends are distributed. Allowed values: `equal`, `progressive` |

#### 7f. Profit Sharing (4 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `policy.profit_sharing.enabled` | boolean | false | Whether mandatory profit sharing is required |
| `policy.profit_sharing.mandatory_percentage` | PolicySchedule | `[{"year":2025,"value":0}]` | Percentage of profits that must be shared (0-1). Supports keyframes. |
| `policy.profit_sharing.revenue_threshold` | float | 1000000000 | Minimum company revenue (USD) to trigger the requirement |
| `policy.profit_sharing.distribution_scope` | enum | national | Scope of profit distribution. Allowed values: `employees_only`, `community`, `national` |

#### 7g. Universal Basic Income (9 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `policy.ubi.enabled` | boolean | false | Whether UBI payments are active |
| `policy.ubi.monthly_amount` | PolicySchedule | `[{"year":2025,"value":0}]` | Monthly UBI payment per eligible person in USD. Supports keyframes for ramping. |
| `policy.ubi.age_threshold` | integer | 18 | Minimum age to receive UBI |
| `policy.ubi.mode` | enum | manual | UBI computation mode. Allowed values: `manual`, `indexed`. In `manual` mode, uses `monthly_amount` schedule directly. In `indexed` mode, indexes to productivity/inflation. |
| `policy.ubi.indexed_base_amount` | float | (optional) | Base amount for indexed mode. Only used when `mode` is `indexed`. |
| `policy.ubi.indexed_start_year` | integer | (optional) | Start year for indexed mode. Only used when `mode` is `indexed`. |
| `policy.ubi.productivity_index_rate` | float | (optional) | Rate at which UBI indexes to productivity growth. Only used when `mode` is `indexed`. |
| `policy.ubi.indexed_to_inflation` | boolean | true | Whether UBI amount automatically increases with inflation |
| `policy.ubi.indexed_to_productivity` | boolean | false | Whether UBI amount automatically increases with productivity growth |

#### 7h. Enhanced Unemployment Insurance (4 base paths + state overrides)

| parameter_path | type | default | description |
|---|---|---|---|
| `policy.enhanced_ui.enabled` | boolean | true | Whether unemployment insurance is active. Default `true` reflects the existing US unemployment insurance system. |
| `policy.enhanced_ui.replacement_rate` | PolicySchedule | `[{"year":2025,"value":0.45}]` | Fraction of prior wages replaced by UI benefits (45% = 0.45). Supports keyframes. |
| `policy.enhanced_ui.duration_weeks` | integer | 26 | Maximum duration of UI benefits in weeks |
| `policy.enhanced_ui.retraining_bonus` | float | 0 | Additional monthly payment for workers enrolled in retraining (USD) |

State-level Enhanced UI overrides use the pattern: `policy.enhanced_ui.state_override.{StateCode}.{field}`

Fields per state:

| field suffix | type | description |
|---|---|---|
| `replacement_rate` | PolicySchedule | State-specific UI replacement rate. Supports keyframes. |
| `duration_weeks` | integer | State-specific UI benefit duration in weeks |
| `retraining_bonus` | float | State-specific retraining bonus in USD |

Example: `policy.enhanced_ui.state_override.NY.replacement_rate,0.55`

#### 7i. Retraining (6 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `policy.retraining.enabled` | boolean | false | Whether government-funded retraining programs are active |
| `policy.retraining.stipend_monthly` | PolicySchedule | `[{"year":2025,"value":0}]` | Monthly stipend for workers in retraining (USD). Supports keyframes. |
| `policy.retraining.duration_months` | integer | 6 | Duration of retraining programs in months |
| `policy.retraining.effectiveness_rate` | float | 0.3 | Fraction of retrained workers who successfully transition to new employment (0-1) |
| `policy.retraining.participation_rate` | float | (optional) | Fraction of eligible displaced workers who enroll in retraining (0-1) |
| `policy.retraining.target_clusters` | string (CSV) | (empty) | Comma-separated list of cluster IDs to target for retraining. See the [Cluster/Role Enumeration](#clusterrole-enumeration) section for valid IDs. Example: `tech_swe,finance_banking,retail_cashiers` |

### 8. Second-Order Effect Parameters (4 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `demand_feedback_sensitivity` | float | (optional) | How much demand shortfalls feed back into employment |
| `credit_ue_sensitivity` | float | (optional) | Credit tightening sensitivity to unemployment |
| `credit_investment_sensitivity` | float | (optional) | Credit tightening sensitivity to investment conditions |
| `credit_consumption_sensitivity` | float | (optional) | Credit tightening sensitivity to consumption |

### 9. AI Production Parameters (3 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `ai_production_investment_fraction` | float | (optional) | Fraction of GDP invested in AI production |
| `ai_production_onshoring_fraction` | float | (optional) | Fraction of AI production onshored |
| `new_job_wage_fraction` | float | (optional) | Fraction of mean wage for new AI-created jobs |

### 10. Feedback Loop Parameters (4 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `revenue_pressure_sensitivity` | float | (optional) | How GDP contraction accelerates revenue pressure |
| `revenue_pressure_cap` | float | (optional) | Maximum revenue pressure multiplier |
| `revenue_pressure_decay` | float | (optional) | Decay rate of accumulated revenue pressure |
| `ai_wage_productivity_multiplier` | float | (optional) | AI productivity premium on wages (Phillips curve) |

### 11. Corporate Profits & Financial Markets (4 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `ai_profit_margin` | float | (optional) | Profit margin for AI sector |
| `traditional_profit_margin` | float | (optional) | Profit margin for traditional sector |
| `ai_pe_sensitivity` | float | (optional) | P/E ratio sensitivity for AI sector |
| `traditional_pe_sensitivity` | float | (optional) | P/E ratio sensitivity for traditional sector |

### 12. Minimum Wage Feedback (2 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `wage_pass_through` | float | (optional) | Minimum wage cost pass-through to prices |
| `wage_automation_sensitivity` | float | (optional) | Sensitivity of automation to wage increases |

### 13. Credit & Deflation (2 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `credit_deflation_sensitivity` | float | (optional) | Credit response to deflation |
| `scarcity_pass_through` | float | (optional) | Scarcity inflation pass-through rate |

### 14. Housing & Mortgage (10 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `business_credit_gdp_sensitivity` | float | (optional) | Business credit response to GDP |
| `max_business_credit_loosening` | float | (optional) | Maximum business credit loosening |
| `shelter_cpi_weight` | float | (optional) | Shelter weight in CPI |
| `shelter_inflation_stickiness` | float | (optional) | Stickiness of shelter inflation |
| `mortgage_stress_amplifier` | float | (optional) | Mortgage stress amplification factor |
| `foreclosure_lag` | float | (optional) | Lag years for foreclosure effects |
| `homeownership_recovery_rate` | float | (optional) | Recovery rate for homeownership |
| `housing_wealth_mpc` | float | (optional) | MPC out of housing wealth changes |
| `mpc_wage_ue_sensitivity` | float | (optional) | MPC sensitivity to unemployment for wage earners |
| `credit_adoption_sensitivity` | float | (optional) | Credit effect on AI adoption acceleration |

### 15. Housing Market Stabilization (3 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `institutional_buyer_rate` | float | (optional) | Institutional housing buyer absorption rate |
| `rental_demand_sensitivity` | float | (optional) | Rental demand sensitivity to displacement |
| `shelter_inflation_floor` | float | (optional) | Floor for shelter inflation rate |

### 16. Investment Demand Constraint (5 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `ai_utilization_sensitivity` | float | (optional) | AI capacity utilization sensitivity |
| `consumer_demand_investment_sensitivity` | float | (optional) | Consumer demand effect on investment |
| `credit_investment_response_sensitivity` | float | (optional) | Credit effect on investment response |
| `traditional_investment_demand_sensitivity` | float | (optional) | Traditional investment demand sensitivity |
| `traditional_investment_gdp_fraction` | float | (optional) | Traditional investment as fraction of GDP |

### 17. Income Distribution (3 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `bottom_80_wage_share` | float | (optional) | Bottom 80% share of wage income |
| `bottom_80_transfer_share` | float | (optional) | Bottom 80% share of transfer income |
| `bottom_80_asset_share` | float | (optional) | Bottom 80% share of asset income |

### 18. Quality Pass Parameters (5 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `phillips_curve_sensitivity` | float | (optional) | Phillips curve wage-unemployment sensitivity |
| `max_credit_tightening` | float | (optional) | Maximum credit tightening multiplier |
| `deferrable_consumption_share` | float | (optional) | Share of consumption that is deferrable |
| `deflation_midpoint` | float | (optional) | Midpoint for deflation S-curve |
| `deflation_steepness` | float | (optional) | Steepness of deflation S-curve |

### 19. Labor Supply Response (2 paths)

| parameter_path | type | default | description |
|---|---|---|---|
| `participation_elasticity` | float | (optional) | Labor force participation elasticity |
| `participation_threshold` | float | (optional) | Threshold triggering voluntary labor withdrawal |

### 20. Dynamic Money Velocity (1 path)

| parameter_path | type | default | description |
|---|---|---|---|
| `velocity_sensitivity` | float | (optional) | Sensitivity of money velocity to economic conditions |

### 21. Cluster Override (1 path)

| parameter_path | type | default | description |
|---|---|---|---|
| `other_uncategorized_multiplier_override` | float | (optional) | Override for Other/Uncategorized employment multiplier |

### 22. Per-Cluster Parameter Overrides (9 fields x N clusters)

Pattern: `cluster_override.{clusterId}.{field}`

Allows per-cluster overrides of capability weights, adoption dynamics, and economic parameters. The `{clusterId}` must be a valid cluster ID from the [Cluster/Role Enumeration](#clusterrole-enumeration). Any of the 51 clusters can be overridden.

| field | type | range | description |
|---|---|---|---|
| `generative_weight` | float | 0-1 | Weight of generative capability for this cluster's displacement |
| `agentic_weight` | float | 0-1 | Weight of agentic capability for this cluster's displacement |
| `embodied_weight` | float | 0-1 | Weight of embodied capability for this cluster's displacement |
| `adoption_steepness` | float | > 0 | S-curve steepness for adoption in this cluster |
| `adoption_ceiling` | float | 0-1 | Maximum adoption fraction for this cluster |
| `deployment_lag` | float | >= 0 | Additional years of deployment lag for this cluster |
| `wage_elasticity` | float | 0-1 | Wage depression elasticity for this cluster |
| `deflation_intensity` | float | 0-1 | Deflation intensity contribution from this cluster |
| `max_productivity_multiplier` | float | >= 1.0 | Maximum productivity multiplier for this cluster |

Example:
```csv
cluster_override.tech_swe.generative_weight,0.8
cluster_override.tech_swe.agentic_weight,0.6
cluster_override.tech_swe.adoption_ceiling,0.9
cluster_override.transport_trucking.embodied_weight,0.95
cluster_override.transport_trucking.deployment_lag,2
```

---

## BFCS Threshold Overrides

BFCS (Better/Faster/Cheaper/Safer) thresholds determine when AI adoption triggers for each occupation role. Each role has 4 threshold values in the range [0, 1]. All 4 must be exceeded by the corresponding AI capability scores before adoption begins.

### Pattern

```
bfcs.{clusterId}.{roleId}.{dimension}
```

Dimensions: `better`, `faster`, `cheaper`, `safer`

Value type: float [0, 1]

### Rules

- If a `bfcs.*` row is **omitted**, no override is applied -- the default threshold from `occupationClusters.ts` is used.
- If a `bfcs.*` row is **present**, it overrides that specific dimension for that role.
- If only some dimensions are specified for a role, the unspecified dimensions are filled from the cluster's default thresholds.
- Lower thresholds = AI adoption triggers earlier. Higher thresholds = adoption is delayed.

### Cluster/Role Enumeration

All 121 roles across 51 clusters, organized by sector. Each role has 4 BFCS dimensions, yielding **484 possible BFCS parameter paths** total.

#### Technology (4 clusters, 11 roles)

| cluster | role | default thresholds (B/F/C/S) |
|---|---|---|
| `tech_swe` | `junior_mid` | 0.6 / 0.7 / 0.5 / 0.7 |
| `tech_swe` | `senior` | 0.8 / 0.8 / 0.6 / 0.85 |
| `tech_swe` | `staff_principal` | 0.9 / 0.85 / 0.7 / 0.95 |
| `tech_data_ml` | `junior_analyst` | 0.5 / 0.6 / 0.4 / 0.5 |
| `tech_data_ml` | `ml_engineer` | 0.75 / 0.75 / 0.6 / 0.8 |
| `tech_data_ml` | `research_scientist` | 0.9 / 0.8 / 0.7 / 0.9 |
| `tech_it_support` | `tier1_support` | 0.5 / 0.6 / 0.4 / 0.4 |
| `tech_it_support` | `sysadmin` | 0.65 / 0.7 / 0.5 / 0.7 |
| `tech_it_support` | `devops_sre` | 0.8 / 0.8 / 0.6 / 0.85 |
| `tech_qa` | `manual_qa` | 0.4 / 0.5 / 0.3 / 0.5 |
| `tech_qa` | `automation_qa` | 0.6 / 0.65 / 0.5 / 0.65 |

#### Finance (4 clusters, 11 roles)

| cluster | role | default thresholds (B/F/C/S) |
|---|---|---|
| `finance_trading` | `execution_trader` | 0.6 / 0.8 / 0.5 / 0.7 |
| `finance_trading` | `quant_analyst` | 0.8 / 0.85 / 0.6 / 0.85 |
| `finance_trading` | `portfolio_manager` | 0.9 / 0.8 / 0.7 / 0.9 |
| `finance_banking` | `teller` | 0.4 / 0.5 / 0.3 / 0.3 |
| `finance_banking` | `junior_analyst` | 0.55 / 0.6 / 0.4 / 0.5 |
| `finance_banking` | `senior_banker` | 0.8 / 0.7 / 0.6 / 0.7 |
| `finance_accounting` | `bookkeeper` | 0.4 / 0.5 / 0.3 / 0.5 |
| `finance_accounting` | `accountant` | 0.6 / 0.65 / 0.5 / 0.7 |
| `finance_accounting` | `cpa_audit` | 0.8 / 0.75 / 0.6 / 0.85 |
| `finance_insurance` | `claims_processor` | 0.4 / 0.5 / 0.3 / 0.4 |
| `finance_insurance` | `underwriter` | 0.65 / 0.7 / 0.5 / 0.7 |

#### Healthcare (5 clusters, 13 roles)

| cluster | role | default thresholds (B/F/C/S) |
|---|---|---|
| `health_physicians` | `primary_care` | 0.85 / 0.7 / 0.7 / 0.99 |
| `health_physicians` | `specialist` | 0.9 / 0.75 / 0.75 / 0.995 |
| `health_physicians` | `surgeon` | 0.95 / 0.8 / 0.8 / 0.999 |
| `health_nurses` | `lpn` | 0.6 / 0.6 / 0.5 / 0.95 |
| `health_nurses` | `rn` | 0.7 / 0.65 / 0.6 / 0.97 |
| `health_nurses` | `nurse_practitioner` | 0.8 / 0.7 / 0.7 / 0.98 |
| `health_technicians` | `lab_technician` | 0.5 / 0.6 / 0.4 / 0.85 |
| `health_technicians` | `imaging_technician` | 0.6 / 0.7 / 0.5 / 0.9 |
| `health_home_health` | `home_health_aide` | 0.4 / 0.4 / 0.3 / 0.95 |
| `health_home_health` | `personal_care_aide` | 0.35 / 0.35 / 0.25 / 0.995 |
| `health_admin` | `medical_coder` | 0.4 / 0.5 / 0.3 / 0.5 |
| `health_admin` | `admin_staff` | 0.4 / 0.5 / 0.3 / 0.4 |
| `health_admin` | `hospital_admin` | 0.6 / 0.6 / 0.5 / 0.6 |

#### Education (3 clusters, 6 roles)

| cluster | role | default thresholds (B/F/C/S) |
|---|---|---|
| `edu_teachers` | `k12_teacher` | 0.9 / 0.8 / 0.8 / 0.95 |
| `edu_teachers` | `professor` | 0.9 / 0.8 / 0.7 / 0.9 |
| `edu_admin` | `school_admin` | 0.4 / 0.5 / 0.3 / 0.4 |
| `edu_admin` | `district_admin` | 0.5 / 0.55 / 0.4 / 0.5 |
| `edu_support` | `teaching_assistant` | 0.5 / 0.5 / 0.4 / 0.7 |
| `edu_support` | `librarian` | 0.5 / 0.6 / 0.4 / 0.5 |

#### Legal (2 clusters, 5 roles)

| cluster | role | default thresholds (B/F/C/S) |
|---|---|---|
| `legal_attorneys` | `junior_associate` | 0.6 / 0.65 / 0.5 / 0.7 |
| `legal_attorneys` | `senior_attorney` | 0.8 / 0.75 / 0.65 / 0.85 |
| `legal_attorneys` | `partner` | 0.9 / 0.8 / 0.75 / 0.9 |
| `legal_paralegals` | `legal_secretary` | 0.4 / 0.5 / 0.3 / 0.4 |
| `legal_paralegals` | `paralegal` | 0.5 / 0.6 / 0.4 / 0.6 |

#### Transportation (4 clusters, 8 roles)

| cluster | role | default thresholds (B/F/C/S) |
|---|---|---|
| `transport_trucking` | `long_haul` | 0.7 / 0.7 / 0.6 / 0.99 |
| `transport_trucking` | `short_haul` | 0.6 / 0.6 / 0.5 / 0.97 |
| `transport_delivery` | `delivery_driver` | 0.5 / 0.6 / 0.4 / 0.95 |
| `transport_delivery` | `courier` | 0.45 / 0.5 / 0.35 / 0.9 |
| `transport_taxi` | `driver` | 0.5 / 0.6 / 0.4 / 0.97 |
| `transport_warehouse` | `warehouse_worker` | 0.4 / 0.5 / 0.3 / 0.5 |
| `transport_warehouse` | `equipment_operator` | 0.5 / 0.6 / 0.4 / 0.7 |
| `transport_warehouse` | `logistics_coordinator` | 0.6 / 0.7 / 0.5 / 0.6 |

#### Manufacturing (3 clusters, 5 roles)

| cluster | role | default thresholds (B/F/C/S) |
|---|---|---|
| `mfg_assembly` | `line_worker` | 0.4 / 0.5 / 0.3 / 0.6 |
| `mfg_assembly` | `skilled_assembler` | 0.55 / 0.6 / 0.45 / 0.7 |
| `mfg_machinists` | `cnc_operator` | 0.5 / 0.6 / 0.4 / 0.75 |
| `mfg_machinists` | `master_machinist` | 0.8 / 0.75 / 0.6 / 0.9 |
| `mfg_qc` | `inspector` | 0.5 / 0.7 / 0.4 / 0.8 |

#### Construction / Trades (4 clusters, 10 roles)

| cluster | role | default thresholds (B/F/C/S) |
|---|---|---|
| `construction_electricians` | `apprentice` | 0.5 / 0.5 / 0.4 / 0.9 |
| `construction_electricians` | `journeyman` | 0.7 / 0.65 / 0.55 / 0.95 |
| `construction_electricians` | `master` | 0.85 / 0.75 / 0.65 / 0.98 |
| `construction_plumbers` | `apprentice` | 0.5 / 0.5 / 0.4 / 0.85 |
| `construction_plumbers` | `journeyman` | 0.7 / 0.65 / 0.55 / 0.9 |
| `construction_general` | `laborer` | 0.35 / 0.4 / 0.25 / 0.6 |
| `construction_general` | `carpenter` | 0.55 / 0.55 / 0.4 / 0.75 |
| `construction_general` | `heavy_equipment` | 0.5 / 0.6 / 0.4 / 0.8 |
| `construction_hvac` | `technician` | 0.55 / 0.55 / 0.45 / 0.85 |
| `construction_hvac` | `senior_technician` | 0.7 / 0.65 / 0.55 / 0.9 |

#### Retail (3 clusters, 6 roles)

| cluster | role | default thresholds (B/F/C/S) |
|---|---|---|
| `retail_cashiers` | `cashier` | 0.3 / 0.4 / 0.2 / 0.3 |
| `retail_cashiers` | `sales_associate` | 0.4 / 0.5 / 0.3 / 0.4 |
| `retail_management` | `store_manager` | 0.6 / 0.6 / 0.5 / 0.6 |
| `retail_management` | `district_manager` | 0.75 / 0.7 / 0.6 / 0.7 |
| `retail_ecommerce` | `fulfillment_worker` | 0.35 / 0.45 / 0.25 / 0.5 |
| `retail_ecommerce` | `ecommerce_coordinator` | 0.5 / 0.6 / 0.4 / 0.5 |

#### Food Service (3 clusters, 6 roles)

| cluster | role | default thresholds (B/F/C/S) |
|---|---|---|
| `food_fast_food` | `counter` | 0.3 / 0.4 / 0.2 / 0.4 |
| `food_fast_food` | `line_cook` | 0.35 / 0.45 / 0.25 / 0.5 |
| `food_restaurant` | `server` | 0.4 / 0.4 / 0.3 / 0.5 |
| `food_restaurant` | `chef` | 0.6 / 0.5 / 0.5 / 0.6 |
| `food_restaurant` | `head_chef` | 0.8 / 0.6 / 0.6 / 0.7 |
| `food_industrial` | `food_processing` | 0.3 / 0.4 / 0.2 / 0.5 |

#### Creative (4 clusters, 11 roles)

| cluster | role | default thresholds (B/F/C/S) |
|---|---|---|
| `creative_design` | `junior_designer` | 0.4 / 0.5 / 0.3 / 0.3 |
| `creative_design` | `senior_designer` | 0.7 / 0.7 / 0.6 / 0.5 |
| `creative_design` | `art_director` | 0.85 / 0.75 / 0.7 / 0.6 |
| `creative_writing` | `content_writer` | 0.4 / 0.5 / 0.3 / 0.3 |
| `creative_writing` | `journalist` | 0.65 / 0.6 / 0.5 / 0.6 |
| `creative_writing` | `senior_editor` | 0.8 / 0.7 / 0.6 / 0.7 |
| `creative_marketing` | `marketing_coordinator` | 0.4 / 0.5 / 0.3 / 0.3 |
| `creative_marketing` | `marketing_manager` | 0.65 / 0.65 / 0.5 / 0.5 |
| `creative_marketing` | `cmo_director` | 0.85 / 0.75 / 0.7 / 0.7 |
| `creative_media` | `production_assistant` | 0.4 / 0.5 / 0.3 / 0.3 |
| `creative_media` | `editor_producer` | 0.65 / 0.65 / 0.5 / 0.5 |

#### Professional Services (4 clusters, 10 roles)

| cluster | role | default thresholds (B/F/C/S) |
|---|---|---|
| `prof_consulting` | `junior_consultant` | 0.5 / 0.6 / 0.4 / 0.5 |
| `prof_consulting` | `senior_consultant` | 0.7 / 0.7 / 0.6 / 0.7 |
| `prof_consulting` | `partner_director` | 0.9 / 0.8 / 0.75 / 0.85 |
| `prof_hr` | `hr_coordinator` | 0.4 / 0.5 / 0.3 / 0.4 |
| `prof_hr` | `hr_manager` | 0.6 / 0.6 / 0.5 / 0.6 |
| `prof_real_estate` | `agent` | 0.5 / 0.5 / 0.4 / 0.4 |
| `prof_real_estate` | `broker` | 0.7 / 0.65 / 0.55 / 0.6 |
| `prof_admin` | `receptionist` | 0.3 / 0.4 / 0.2 / 0.3 |
| `prof_admin` | `admin_assistant` | 0.35 / 0.45 / 0.25 / 0.3 |
| `prof_admin` | `executive_assistant` | 0.55 / 0.6 / 0.45 / 0.5 |

#### Government (3 clusters, 8 roles)

| cluster | role | default thresholds (B/F/C/S) |
|---|---|---|
| `gov_federal` | `clerical_admin` | 0.4 / 0.5 / 0.3 / 0.4 |
| `gov_federal` | `analyst` | 0.6 / 0.65 / 0.5 / 0.65 |
| `gov_federal` | `senior_management` | 0.8 / 0.75 / 0.6 / 0.8 |
| `gov_state_local` | `clerical_admin` | 0.4 / 0.5 / 0.3 / 0.4 |
| `gov_state_local` | `analyst` | 0.6 / 0.65 / 0.5 / 0.65 |
| `gov_state_local` | `senior_management` | 0.8 / 0.75 / 0.6 / 0.8 |
| `gov_postal` | `mail_carrier` | 0.4 / 0.5 / 0.3 / 0.8 |
| `gov_postal` | `sorting_processing` | 0.3 / 0.5 / 0.2 / 0.5 |

#### Agriculture (2 clusters, 3 roles)

| cluster | role | default thresholds (B/F/C/S) |
|---|---|---|
| `ag_farm_labor` | `farmworker` | 0.35 / 0.4 / 0.25 / 0.5 |
| `ag_farm_labor` | `skilled_ag` | 0.5 / 0.55 / 0.4 / 0.6 |
| `ag_equipment` | `operator` | 0.4 / 0.5 / 0.35 / 0.7 |

#### Scientific R&D (2 clusters, 6 roles)

| cluster | role | default thresholds (B/F/C/S) |
|---|---|---|
| `sci_lab_research` | `lab_technician` | 0.5 / 0.6 / 0.4 / 0.7 |
| `sci_lab_research` | `research_scientist` | 0.8 / 0.75 / 0.65 / 0.85 |
| `sci_lab_research` | `principal_investigator` | 0.9 / 0.8 / 0.75 / 0.9 |
| `sci_engineering` | `junior_engineer` | 0.55 / 0.6 / 0.45 / 0.7 |
| `sci_engineering` | `senior_engineer` | 0.8 / 0.75 / 0.6 / 0.85 |
| `sci_engineering` | `principal_engineer` | 0.9 / 0.8 / 0.7 / 0.95 |

#### Other (1 cluster, 2 roles)

| cluster | role | default thresholds (B/F/C/S) |
|---|---|---|
| `other_uncategorized` | `general_worker` | 0.7 / 0.7 / 0.6 / 0.8 |
| `other_uncategorized` | `specialized_worker` | 0.8 / 0.8 / 0.7 / 0.9 |

**Summary**: 51 clusters, 121 roles, 4 dimensions each = **484 possible BFCS parameter paths**. All are optional -- only include rows for thresholds you want to override.

---

## State Policy Overrides

State policy overrides allow per-state configuration of economic policy parameters that vary geographically (minimum wage, regulatory environment, etc.).

### Pattern

```
state_override.{StateCode}.{field}
```

### Fields Per State (5)

| field | type | default | description |
|---|---|---|---|
| `minimum_wage` | float | (from stateData.ts) | State minimum wage override in USD/hour |
| `additional_ubi` | float | 0 | Additional state-level UBI payment in USD/month on top of federal UBI |
| `ui_replacement_rate` | float | (baseline) | State-specific unemployment insurance replacement rate |
| `av_regulatory` | enum | moderate | Autonomous vehicle regulatory environment. Allowed values: `permissive`, `moderate`, `restrictive` |
| `robotics_regulatory` | enum | moderate | Robotics regulatory environment. Allowed values: `permissive`, `moderate`, `restrictive` |

Regulatory environment affects adoption timing:
- `permissive`: No additional delay (0 years lag)
- `moderate`: 1 year additional adoption lag
- `restrictive`: 3 years additional adoption lag

### All State Codes

51 codes (50 states + District of Columbia):

`AL`, `AK`, `AZ`, `AR`, `CA`, `CO`, `CT`, `DE`, `DC`, `FL`, `GA`, `HI`, `ID`, `IL`, `IN`, `IA`, `KS`, `KY`, `LA`, `ME`, `MD`, `MA`, `MI`, `MN`, `MS`, `MO`, `MT`, `NE`, `NV`, `NH`, `NJ`, `NM`, `NY`, `NC`, `ND`, `OH`, `OK`, `OR`, `PA`, `RI`, `SC`, `SD`, `TN`, `TX`, `UT`, `VT`, `VA`, `WA`, `WV`, `WI`, `WY`

**Summary**: 51 states x 5 fields = **255 possible state override paths**. All are optional.

---

## Total Parameter Paths Summary

| Category | Count |
|---|---|
| 1. Global / Timeline | 2 |
| 2. Macro Parameters | 2 |
| 3. Population | 3 |
| 4. New Job Creation | 3 |
| 5. Adoption Parameters | 7 |
| 6. Capability Trajectories | 12 |
| 7a. Policy: Minimum Wage (base) | 4 |
| 7a. Policy: Minimum Wage (state overrides) | 51 |
| 7b. Policy: Wage Subsidy | 4 |
| 7c. Policy: Work Week (DEPRECATED) | 0 |
| 7d. Policy: SWF | 6 |
| 7e. Policy: Universal Equity | 5 |
| 7f. Policy: Profit Sharing | 4 |
| 7g. Policy: UBI | 9 |
| 7h. Policy: Enhanced UI (base) | 4 |
| 7h. Policy: Enhanced UI (state overrides) | 51 x 3 = 153 |
| 7i. Policy: Retraining | 6 |
| 8. Second-Order Effects | 4 |
| 9. AI Production | 3 |
| 10. Feedback Loops | 4 |
| 11. Corporate Profits & Markets | 4 |
| 12. Minimum Wage Feedback | 2 |
| 13. Credit & Deflation | 2 |
| 14. Housing & Mortgage | 10 |
| 15. Housing Market Stabilization | 3 |
| 16. Investment Demand Constraint | 5 |
| 17. Income Distribution | 3 |
| 18. Quality Pass | 5 |
| 19. Labor Supply Response | 2 |
| 20. Dynamic Money Velocity | 1 |
| 21. Cluster Override (other_uncategorized) | 1 |
| 22. Per-Cluster Overrides | 9 x 51 = 459 |
| BFCS Overrides | 484 |
| State Policy Overrides | 255 |
| **TOTAL POSSIBLE** | **~1,522** |

A typical CSV will have 50-150 rows (just the non-default parameters). The full reference provides ~1,522 possible paths. Most of the total comes from per-cluster overrides (459), BFCS overrides (484), state overrides (255), and policy state overrides (204).

---

## Examples

### Example 1: Accelerate All AI Capabilities

Push all AI capability midpoints earlier and increase steepness for faster S-curve transitions:

```csv
parameter_path,value
# Accelerate all 3 capability vectors by 3-5 years with steeper curves
capability.generative.midpoint,2028
capability.generative.steepness,0.9
capability.agentic.midpoint,2033
capability.agentic.steepness,0.8
capability.embodied.midpoint,2038
capability.embodied.steepness,0.7
```

### Example 2: Enable UBI at $1000/month

Enable a universal basic income (flat shorthand for constant schedule):

```csv
parameter_path,value
policy.ubi.enabled,true
policy.ubi.monthly_amount,1000
policy.ubi.age_threshold,18
policy.ubi.indexed_to_inflation,true
```

Or with a ramp from $0 to $1000 over 10 years using keyframe schedule:

```csv
parameter_path,value
policy.ubi.enabled,true
policy.ubi.monthly_amount,"[{""year"":2025,""value"":0},{""year"":2035,""value"":1000}]"
policy.ubi.age_threshold,18
policy.ubi.indexed_to_inflation,true
```

### Example 3: Override BFCS Thresholds for tech_swe

Lower all BFCS thresholds for junior/mid software developers to simulate faster automation onset, while raising thresholds for staff/principal to simulate higher resistance:

```csv
parameter_path,value
# Junior/mid devs: lower all thresholds (faster automation)
bfcs.tech_swe.junior_mid.better,0.3
bfcs.tech_swe.junior_mid.faster,0.4
bfcs.tech_swe.junior_mid.cheaper,0.2
bfcs.tech_swe.junior_mid.safer,0.3
# Senior devs: slightly lower thresholds
bfcs.tech_swe.senior.better,0.6
bfcs.tech_swe.senior.faster,0.6
bfcs.tech_swe.senior.cheaper,0.4
bfcs.tech_swe.senior.safer,0.7
# Staff/principal: raise thresholds (more resistant)
bfcs.tech_swe.staff_principal.better,0.95
bfcs.tech_swe.staff_principal.faster,0.95
bfcs.tech_swe.staff_principal.cheaper,0.85
bfcs.tech_swe.staff_principal.safer,0.99
```

### Example 4: Set California to Permissive AV Regulation

Configure California with permissive autonomous vehicle and robotics regulation, plus a higher state minimum wage:

```csv
parameter_path,value
state_override.CA.av_regulatory,permissive
state_override.CA.robotics_regulatory,permissive
state_override.CA.minimum_wage,16.00
state_override.CA.additional_ubi,200
```

### Example 5: Comprehensive Policy Scenario

Combine multiple policies for a "social safety net" scenario. PolicySchedule fields accept flat number shorthand (constant value) or JSON keyframe arrays:

```csv
parameter_path,value
# UBI ramping from $0 to $500/month over 5 years
policy.ubi.enabled,true
policy.ubi.monthly_amount,"[{""year"":2025,""value"":0},{""year"":2030,""value"":500}]"
policy.ubi.indexed_to_inflation,true
# Raise minimum wage to $15 indexed to inflation (flat shorthand = constant)
policy.minimum_wage.federal_minimum,15.00
policy.minimum_wage.indexed_to_inflation,true
# Establish sovereign wealth fund with ramping contributions
policy.swf.enabled,true
policy.swf.initial_fund_size,100
policy.swf.annual_contribution,"[{""year"":2025,""value"":25},{""year"":2035,""value"":75}]"
policy.swf.expected_return,0.07
policy.swf.distribution_rate,0.04
policy.swf.distribution,universal
# Enhanced UI with longer duration
policy.enhanced_ui.replacement_rate,0.55
policy.enhanced_ui.duration_weeks,39
policy.enhanced_ui.retraining_bonus,500
# Retraining programs targeting vulnerable clusters
policy.retraining.enabled,true
policy.retraining.stipend_monthly,2000
policy.retraining.duration_months,12
policy.retraining.effectiveness_rate,0.5
policy.retraining.target_clusters,retail_cashiers,food_fast_food,transport_trucking
```

---

## Cross-Field Validation

The CSV import applies the following validation rules after parsing:

1. **Year range**: If `end_year <= start_year`, both revert to defaults (2025 and 2050) with a warning.
2. **Capability floor/ceiling**: If `floor > ceiling` for any capability vector, the values are swapped with a warning.
3. **Invalid numbers**: Non-numeric values for numeric fields are skipped with a warning.
4. **Invalid booleans**: Values that are not `true`/`false`/`1`/`0`/`yes`/`no` produce a warning.
5. **Invalid enums**: Values that do not match the allowed set produce a warning.
6. **Unrecognized paths**: Any parameter path not in this reference produces a warning but does not halt import.
7. **BFCS cluster/role validation**: Invalid cluster or role IDs in BFCS paths produce warnings and are skipped.
8. **State code validation**: Invalid state codes in state override paths produce warnings and are skipped.
9. **PolicySchedule validation**: Values for PolicySchedule fields must be valid JSON keyframe arrays or flat numbers. Invalid JSON produces a warning.
10. **Cluster override validation**: Invalid cluster IDs in `cluster_override.*` paths produce warnings. Field values are range-validated (e.g., weights must be 0-1, `max_productivity_multiplier` must be >= 1.0).
11. **Config validation**: After all parameters are applied, the full config is validated and clamped by `validateConfig()` with any out-of-range values producing warnings.
