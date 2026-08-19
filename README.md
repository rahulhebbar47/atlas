# ATLAS — AI Transformation Labor & Automation Simulator

Like the internal combustion engine or the assembly line before it, AI will reshape the future of work — but unlike those, it isn't scoped to a single task. AI can be applied across nearly every kind of cognitive labor, and increasingly physical labor too. That breadth is what makes its economic impact so hard to predict. We may see the entire economy transform. Or we may see a ceiling on capability, supply-chain crises that set back timelines, or adoption rates that diverge sharply by industry as regulatory friction bites.

AI will change the economy. The degree and the timeline are genuinely uncertain. ATLAS exists to make that uncertainty tractable: to test which timeline we appear to be in, to update projections as conditions change, and to evaluate policy interventions before committing to them.

## What This Is

ATLAS is a macroeconomic simulation that projects AI's impact on labor markets, GDP, income composition, and the broader economy through 2050. It is built for AI labs, policymakers, and anyone trying to reason rigorously about the economic transition ahead.

The model has four interconnected layers. The first is a standard macroeconomic engine — GDP and its expenditure components, consumption that responds differently to wage, asset, and transfer income, fiscal policy with debt dynamics, a Fed that reacts to inflation and employment, and bond and equity markets that price the result. The second is the AI overlay: capability trajectories for three technology vectors (generative, agentic, embodied), occupation-level displacement across 51 BLS clusters, adoption curves that move at different speeds for software and robotics, and an augmentation channel that runs parallel to displacement. The third is the production side of AI itself: the user's capability beliefs are treated as a **ceiling of possibility**, and what is actually realized is grounded by what the economy finances and builds — retained AI-sector profits, credit, and equity issuance fund a physical capacity machine (accelerator chips, powered electricity, datacenter shells, and an embodied robot/vehicle fleet, with capacity the minimum of its complements); grid power arrives through a delivery queue with measured interconnection lead times; the AI sector pays its own power bill out of its margins; and physical-world displacement is gated on the fleet actually built for it. The layers are stitched together by a catalog of inventoried feedback loops — the six macro loops (revenue pressure, Phillips curve, demand spillover, credit crunch, fiscal-monetary, housing wealth) plus the production-system loops (finance–profits, capacity grounding, adoption gating, and their kin) — though whether any given loop amplifies, dampens, or cancels out is what the simulation is for, not something baked in. The fourth layer is measurement: welfare per income fifth at that fifth's own cost of living (each fifth's consumption basket meets the model's sector price paths, and its wage share responds to who displacement actually hits), plus deliberately honest headline metrics — the model publishes a realized AI share of GDP and a separate AI output potential rather than a single conflated number, benchmarks demand absorption against a zero-AI counterfactual run of itself, and reports which physical or financial constraint bound the AI trajectory, and when.

Its core design principle is to **keep the author's bias out of the forecast**. Whether classical economic relationships will hold under transformative automation is itself unknown — so ATLAS does not hardcode the answer. Take the Phillips curve. Conventionally, as unemployment rises, workers lose bargaining power and wage growth slows. But under AI-driven displacement, the workers who remain may be productive enough — augmented by AI — that their wages rise even as unemployment climbs. ATLAS does not assert which holds. It implements the classic relationship and an AI-driven scarcity premium scales between them according to how the user configures the world, and shows what follows.

That philosophy runs throughout. The model's ~365 user-adjustable parameters are not fitting knobs; each one marks a point of genuine uncertainty about the future, carries its provenance (cited source or stated editorial judgment), and is reachable in the interface. ATLAS does not assert outcomes. It stress-tests them.

The interface is organized around that same idea. The left panel composes a worldview as four questions: *whose measurements do you trust* — an optional calibration layer that sets occupation-level automation shares and capability weights from Anthropic's published Economic Index usage data, off by default, disclosed, and fully revertible; *what do you believe* — the assumption dials, phrased in plain language; *what happens* — schedulable events like a chip shortage or a datacenter permitting freeze; and *what do we choose* — policy packages. Selections compose purely: they never overwrite your settings, and switching something on and off again leaves the simulation bit-for-bit where it started. The Advanced tab exposes the full parameter surface underneath.

## Built Entirely with Claude Code

Every line of code in this repository was written with [Claude Code](https://docs.anthropic.com/en/docs/claude-code), Anthropic's agentic command-line tool. I worked as the architect — defining the economic model, specifying the mathematics, directing the implementation, and auditing every output against first principles and against government data. Claude Code served as the implementation engine.

That division of labor is itself an instance of what ATLAS models. Claude Code cannot run a project like this unsupervised yet, but it sharply reduces the number of people any given task requires. ATLAS captures the same dynamic in the wider economy: firms may retain or even add workers during an augmentation phase to produce more output per team, then automate entire role categories once AI crosses the Better, Faster, Cheaper, and Safer thresholds for a given role.

The conventional answer to displacement is to retrain the workforce. Retrain to what, though, if language models become the substrate of white-collar work and humanoid robots the substrate of blue-collar work? A model cannot answer that question directly. What it can do is estimate how much time we have to answer it ourselves.

## Status & Limitations

ATLAS is a scenario-analysis tool, not a point forecast. Its purpose is to make assumptions explicit and trace their consequences — not to predict a single future. Two things follow from that:

- The hardest economic questions — whether classical relationships survive transformative AI — are deliberately left to the user as parameters rather than resolved in code. Different configurations produce different futures by design.
- The model is under active development. Each development phase adds or refines a feedback loop, and the interactions between loops are where the modeling is most demanding and most open to revision.

Given a fixed configuration, the model is fully deterministic: the same inputs always produce the same outputs.

## Running ATLAS Locally

ATLAS is a React + TypeScript application built with Vite.

```bash
git clone https://github.com/rahulhebbar47/atlas.git
cd atlas
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser. (`vite.config.ts` sets the dev port to 3000; if it's already in use, Vite will pick the next free port and print the actual URL.)

**Requirements:** Node.js 18+, npm

## Project Structure

The economic engine lives in `src/models/` — pure, deterministic TypeScript functions with no side effects. Key modules:

- **`simulation.ts`** — master orchestrator; runs the full year-by-year simulation loop.
- **`macro.ts`** — GDP computation, labor-share dynamics, income composition, and macro feedback loops.
- **`bfcs.ts`** — the Better/Faster/Cheaper/Safer threshold model; a role automates only when all four thresholds are met simultaneously.
- **`displacement.ts`** — the cascade from task erosion to headcount reduction to wage impact.
- **`adoption.ts`** — asymmetric S-curve adoption dynamics with deployment-type differentiation.
- **`capabilities.ts`** — AI capability vector trajectories across technology categories.
- **`buildout.ts`** — AI buildout finance and the physical capacity machine: chips, energy (with the grid-interconnection delivery queue), datacenters, and the embodied fleet.
- **`constants.ts`** — every model constant, individually named, sourced (BLS, BEA, FRED, CBO, Census), and documented. No magic numbers anywhere else in `src/models/`.

Supporting modules cover monetary policy, fiscal response, bond and equity markets, supply-chain constraints, new-job creation, and policy simulation. The UI layer (`src/components/`) renders everything reactively — adjust a parameter and the economy responds. There is no "run simulation" button.

## Documentation

Documentation lives under `docs/`, grouped by purpose.

**[Methodology](docs/Methodology/)** — the economic model's science:
- **[DATA_MODEL.md](docs/Methodology/DATA_MODEL.md)** — full mathematical specification of the economic model.
- **[POLICY_MODEL.md](docs/Methodology/POLICY_MODEL.md)** — specification of the policy-simulation layer.
- **[FEEDBACK_LOOP_REFERENCE.md](docs/Methodology/FEEDBACK_LOOP_REFERENCE.md)** — catalog of the macro feedback loops and how they interact.
- **[OCCUPATION_CLUSTERS.md](docs/Methodology/OCCUPATION_CLUSTERS.md)** — the 51-cluster occupation taxonomy.
- **[ALPHA_DRIVERS.md](docs/Methodology/ALPHA_DRIVERS.md)** — automation-share (α) decomposition.

**[Data](docs/Data/)** — sourcing and integration:
- **[BLS_API.md](docs/Data/BLS_API.md)** — BLS/BEA/FRED data integration and the static-JSON pipeline.
- **[DATA_MAPPING.md](docs/Data/DATA_MAPPING.md)** — every constant mapped to its real-data source.
- **[ATLAS_API_DATA_REFERENCE.md](docs/Data/ATLAS_API_DATA_REFERENCE.md)** — independent audit package for reproducing values.

**[Reference](docs/Reference/)** — lookup tables:
- **[USER_PARAMETERS.md](docs/Reference/USER_PARAMETERS.md)** — every user-adjustable parameter, each mapped to the equation it drives.
- **[VARIABLE_REGISTRY.md](docs/Reference/VARIABLE_REGISTRY.md)** — complete registry of every variable in the system.
- **[CSV_PARAMETER_REFERENCE.md](docs/Reference/CSV_PARAMETER_REFERENCE.md)** — every valid CSV import/export parameter path.

**[Architecture](docs/Architecture/)** — how the engine runs:
- **[EXECUTION_FLOW.md](docs/Architecture/EXECUTION_FLOW.md)** — how the simulation executes, step by step.

**[Design](docs/Design/)** — visual identity:
- **[DESIGN_PHILOSOPHY.md](docs/Design/DESIGN_PHILOSOPHY.md)** — UI/design system reference.

**[Phases](docs/Phases/)** — development roadmap and history.

## License

Released under the MIT License. See [LICENSE](LICENSE) for details.

## Contact

**Rahul Hebbar**
rahul.hebbar47@gmail.com
