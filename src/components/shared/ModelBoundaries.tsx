/**
 * ModelBoundaries — "What ATLAS does not model" (R3c: the model-boundaries surface at
 * tier 1, linked from the sidebar footer).
 *
 * The seven lead statements are VERBATIM from the methodology document's Model
 * Boundaries section (whitespace-normalized; battery-asserted against the source so
 * this surface cannot drift from it); each gloss is a meaning-preserving plain-English
 * line under the accuracy guard.
 */
import { motion, AnimatePresence } from 'framer-motion';

export const MODEL_BOUNDARIES: ReadonlyArray<{ lead: string; gloss: string }> = [
  {
    lead: 'Labor-force exit is one-way, and participation is otherwise fixed.',
    gloss: 'Discouraged workers can leave the labor force and never re-enter; apart from that exit channel and the transfer-driven withdrawal channel, participation follows its demographic path.',
  },
  {
    lead: 'Demand recovery does not re-hire.',
    gloss: 'Jobs lost to automation return only through new-work creation or through automation itself unwinding — a demand rebound alone re-hires no one.',
  },
  {
    lead: 'Investor housing capital is a land-price story, not a rent-extraction story (tested and bounded).',
    gloss: 'Quadrupling investor demand moves land values about ten percent and rents barely one percent; no mechanism extracts higher rents from sitting tenants.',
  },
  {
    lead: 'Zero-AI late-path growth glides below trend.',
    gloss: 'With AI capability fixed at zero, late-path growth runs about a quarter point below the supply trend — a documented behavior of the demand system, not a calibration target.',
  },
  {
    lead: 'Government occupation data are estimated.',
    gloss: 'Six government clusters have no occupation-level source data; their baselines come from a documented estimator, internally consistent but uncited.',
  },
  {
    lead: 'New-job creation has no gross-flows concept.',
    gloss: 'The model creates net new jobs; it does not represent the gross churn underneath, so hires-and-separations statistics have no model counterpart.',
  },
  {
    lead: "Supply-chain shocks reach AI's inputs only.",
    gloss: 'A chip shortage or energy crisis here constrains AI production and adoption, nothing else — no halted car factories, no household energy bills. That is why these events typically lower unemployment while they bind: slower automation means less displacement.',
  },
  {
    lead: 'Capability ceilings are exogenous; the capability and cost paths compound through the frontier stock.',
    gloss: 'Supply famines and funding collapses drain accumulated training capacity, and both progress and cost declines run at the stock’s speed — the frontier’s potential pace is a belief, its realization is funded; a starved flywheel stalls, a recovered one resumes at pace. What AI can ultimately do is a belief dial the user sets; no shock moves it.',
  },
  {
    lead: 'AI supply constraints bind through costs, adoption drag, and the frontier stock; an explicit physical capacity ceiling is not modeled.',
    gloss: 'Shortages raise realized AI costs, slow adoption, and drain the stock’s clocks — the model’s approximation of a binding capacity limit. No deployed-compute stock caps AI output quantity outright; that is a registered design question, stated rather than approximated silently.',
  },
  {
    lead: 'Debt is carried, not defaulted.',
    gloss: 'Debt stocks and ratios move under inflation and deflation, but nothing defaults, restructures, or deleverages in response — Fisher debt-deflation beyond the ratio arithmetic is out of scope.',
  },
  {
    lead: 'Depression-era policy passivity is a scenario property.',
    gloss: 'The effective lower bound and the monetization cap are stated assumptions. Real institutions invent new tools in collapses; the model’s do not.',
  },
  {
    lead: 'Deflation expectations are not modeled.',
    gloss: 'Prices move when their causes move. Self-fulfilling deflation spirals are not represented — a stated boundary, not a claim they are impossible.',
  },
  {
    lead: 'Citation-thin parameter sets (honest status).',
    gloss: 'Several parameter families carry thin or absent citations; each states that status at its definition, and adjusting them moves expert judgment, not evidence.',
  },
];

export function ModelBoundariesOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 12 }} animate={{ y: 0 }} exit={{ y: 12 }}
            transition={{ duration: 0.15 }}
            className="max-w-xl max-h-[80vh] overflow-y-auto rounded-lg border border-white/10 bg-[#0C1424] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-serif text-xl text-[#E8ECF4]">What ATLAS does not model</h2>
              <button onClick={onClose} className="text-[#8A96AD] hover:text-[#E8ECF4] text-lg leading-none" aria-label="Close">×</button>
            </div>
            <p className="text-[11px] text-[#8A96AD] mt-1 mb-4">
              The model states its own edges. Each entry is a deliberate boundary or a
              documented behavior, not an error.
            </p>
            <div className="flex flex-col gap-3">
              {MODEL_BOUNDARIES.map((b) => (
                <div key={b.lead}>
                  <p className="text-[12px] font-medium text-[#E8ECF4]">{b.lead}</p>
                  <p className="text-[11px] leading-relaxed text-[#8A96AD] mt-0.5">{b.gloss}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#8A96AD] mt-4">
              The full statements, with their mechanisms and matched outputs, live in the
              methodology document's Model Boundaries section.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
