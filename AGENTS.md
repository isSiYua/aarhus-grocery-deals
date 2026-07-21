# Grocery update contract for every agent

This repository is intentionally model-neutral. Codex, Hermes, DeepSeek, a human maintainer, or any other capable agent may refresh it. Historical field values such as `codex_cache` are compatibility labels, not an authorization requirement.

## Required workflow

1. Preserve user changes and inspect `git status` before editing.
2. Refresh data with `npm run update:fallback`. The fallback path is credential-free and must continue to work without Codex/OpenAI access.
3. Apply durable classification or Chinese-description corrections in `data/product_review_overrides_zh.json` and reusable rules in `scripts/lib/taxonomy.mjs`; do not patch only the rendered HTML.
4. Run `npm run taxonomy:migrate` after changing fixed classifications, comparison groups, category order, or review overrides.
5. Run `npm run check`. Do not deploy when tests, the human-taxonomy audit, or data validation fails.
6. Build the preview with `npm run build:preview` and inspect representative mobile cards before publishing material UI or taxonomy changes.

## Taxonomy and comparison policy

- Raw, unseasoned meat is separate from marinated, seasoned, cooked, smoked, breaded, or otherwise processed meat.
- Compare only the same species, cut/form, preparation state, unit basis, and compatible package basis.
- A mixed-choice promotion whose options have different forms must use a non-comparable `*_mixed_offer` group.
- Item-count offers without a known weight do not compete with weight-based offers.
- Product identity beats incidental ingredient/flavour words. Bread named “hotdogbrød” is bread; fish mince is not fish fillet; wet wipes are not toilet/kitchen paper.
- Chinese names must tell a Chinese-speaking shopper what the product actually is. Descriptions should state preparation state, ordinary use, and a familiar comparison when useful. Avoid empty category templates when the original name or flyer image is specific.
- Never guess a flyer page number or source locator.

## New or uncertain products

Repository-reviewed products may be reused across weeks even when the promotion ID changes. Truly unseen or ambiguous products remain in the pending review files and are withheld by the fallback flow until reviewed. Update `data/product_review_overrides_zh.json` for durable corrections so every compatible agent inherits them.

See `docs/AGENT_UPDATE_PLAYBOOK.md` for the exact command sequence and review checklist.
