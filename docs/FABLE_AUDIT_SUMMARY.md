# ATLAS Model Audit — Summary

ATLAS underwent a full audit and remediation of its economic engine: every feedback loop,
every income and price channel, the fiscal-monetary system, the housing system, the
policy layer, and the data wiring that feeds them. The work proceeded as a sequence of
measurement-first reviews, each followed by ruled fixes and a regression battery, over the
model's complete surface. This document summarizes what was examined, what was found, what
changed, and which guarantees now run automatically in the test suite. Detailed working
records of the audit are maintained outside the repository.

## What was audited

- **The capability and adoption stack**: the AI capability trajectories, the
  Better/Faster/Cheaper/Safer threshold system, adoption S-curves, the automation-share
  decomposition, and the augmentation channel.
- **The displacement machinery**: task erosion, headcount and wage cascades, second-order
  employment multipliers, occupational composition, and the wage basis used to trigger
  adoption.
- **The macro core**: all six feedback loops (revenue pressure, wage-price, demand
  spillover, consumer credit, fiscal-monetary, housing wealth), the sectoral price system,
  the wage equation, corporate profits, and the demand-constrained GDP identity.
- **The fiscal-monetary system**: the Taylor rule, bond market and term premium, debt
  dynamics, monetization, inflation expectations, and the Federal Reserve's price measure.
- **The housing system**: the stock-flow rebuild — household formation, construction,
  replacement cost, land, rents, prices, foreclosures, and the wealth effect.
- **The policy layer**: every lever's income routing, the transfer bookkeeping, and the
  unemployment-insurance pricing.
- **The data layer**: every wired government data series (BLS, BEA, FRED), its committed
  vintage, and whether the value the model reads is the value the file holds.
- **The display layer**: whether what charts show reproduces from the model's honest
  measures.

## The major finding classes, in plain terms

**Cited values that sat unread.** In several places a constant carried a source citation
while the running code silently read a different, uncited fallback — the citation described
a value the simulation never used. The largest case: the model's fiscal-monetary anchors
(federal debt, the 10-year yield, credit spreads, corporate profits, equity levels) had
been riding fallback estimates while the committed government data went unread, because
file names and data keys had drifted apart. A related class: an entire occupational
category (software quality assurance) was double-represented — its workers counted inside
another category's observed data while the category itself ran on a synthetic estimate
roughly fifteen times the observed occupation.

**Aggregates standing in for people.** The model's headline welfare chart deflated income
by the aggregate price level — a basket no actual household buys — and labeled a
mean-of-a-subset as a median. In deflationary scenarios this understated lower-income
households' real outcomes by roughly thirty percent relative to honest per-quintile
measures. Similarly, unemployment-insurance dollars were priced at the average wage of
workers who kept their jobs, while the benefit economically replaces the wages of those
displaced — who earn measurably more than that average precisely because displacement
concentrates in higher-wage cognitive work.

**One-way channels and their labels.** Several deliberately one-way mechanisms (automation
deployment, land prices, labor-force participation) carried explanations that overstated
their inevitability. The mechanisms stand — each is a stated modeling choice — but their
documentation now says exactly that, and the model's unemployment measure is labeled for
what it is: total joblessness, an upper bound on the official U-3 rate, to be compared
against employment-to-population statistics.

## What changed

- **Re-anchored to current government data vintages**: federal debt, the 10-year Treasury
  yield, the deficit ratio, credit spreads, corporate profits, and equity levels now read
  the committed observed series; the loaders fail loudly rather than falling back silently.
- **Corrected occupational composition**: the double-counted quality-assurance category now
  carries its observed employment and wages; occupational baselines are consistent with
  the loaded survey data.
- **The quintile cost-of-living layer and a new default welfare chart**: five income
  quintiles, each deflated by its own consumption basket (Consumer Expenditure Survey
  shares), with a policy-comparison view driven by a true counterfactual run and a
  per-quintile income decomposition. The former aggregate-deflated lines are retired from
  the default view and relabeled to their true definitions.
- **Honest unemployment-insurance economics**: benefits are priced at the displaced pool's
  own prior wage and routed across quintiles by the displaced wage distribution; policy
  tables were re-recorded on the corrected machinery.
- **A joblessness display built for policy reading**: total jobless workers in millions and
  employment-to-population, with the measurement caveat on the chart.
- **Documentation rewritten to a single standard**: current-state descriptions with every
  constant's value, source, and adjustability stated; superseded mechanics are marked as
  historical rather than presented as live.

## The guarantees now enforced by the test suite

- **Conservation assertions**: every dollar of income reconstructs from its sources
  exactly; transfer outlays equal booked support; the GDP identity holds every year, every
  scenario.
- **Attribution assertions**: dollars must land in the RIGHT place, not merely somewhere —
  per-quintile policy routing and the unemployment-insurance pricing each carry an
  independent reconstruction test that fails on silent regressions (conservation alone
  cannot catch mis-routing).
- **Liveness-proven wiring**: the data loaders throw on missing files and unknown keys;
  configuration keys are exhaustively validated; a zero-AI run must reproduce a normal
  baseline economy bit-for-bit against pinned reference output.
- **The always-printed moderation readings**: every full test run prints the model's key
  moderation statistics (real household income, shelter inflation peak, revenue-pressure
  behavior) so a regression can never pass silently.

Detailed working records — the full measurement memos, rulings, and stage reports behind
each change — are maintained outside the repository.
