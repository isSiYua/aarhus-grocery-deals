# Agent-neutral Aarhus deal update playbook

The scheduled path is credential-free and model-neutral. GitHub Actions checks the public Aarhus flyer feed at Copenhagen 03:17 and 15:17. It never calls Codex/OpenAI and therefore consumes no model tokens.

Atlanta is a frozen historical archive. Routine, fallback, review, preview, and taxonomy commands must not modify or fetch Atlanta data. Only an explicit future reactivation decision may use `npm run update:atlanta:archive` or `INCLUDE_ATLANTA_ARCHIVE=1`.

## Routine refresh

```sh
git pull --ff-only
npm run update:fallback
npm run check
npm run build:preview
```

`update:fallback` downloads only Aarhus source data, reuses repository-reviewed taxonomy/descriptions, queues truly unseen products, and withholds those unseen rows from publication. A successful source refresh is authoritative: a promotion missing from the new flyer leaves current data and moves to history. The UI also filters by `validUntil`, so an expired category disappears even before the next scheduled run.

Unchanged offers keep their stable identity, discovery date, last meaningful confirmation timestamp, and reviewed Chinese content. Sorting is deterministic to keep automated commits small. Scheduled Pages deployment happens only when data, source health, or a pending-review queue materially changes; a manual workflow run always deploys code changes.

## When classification or Chinese text needs correction

1. Add a normalized original-name entry to `data/product_review_overrides_zh.json`.
2. Add or refine the reusable rule in `scripts/lib/taxonomy.mjs`.
3. Add a Chinese group explanation in `scripts/lib/explain-zh.mjs` if the comparison group is new.
4. Run:

```sh
npm run taxonomy:migrate
npm run check
npm run build:preview
```

5. Inspect the offer, its comparison pool, neighbouring products, and at least one 390 px mobile card.

## Mandatory self-review

- Is it raw, seasoned, marinated, cooked, smoked, breaded, minced, formed, or mixed?
- Are products in a lowest-price pool interchangeable in species, cut/form, preparation state, unit basis, and package basis?
- Does the Chinese name reveal the actual item rather than a broad template?
- Does the explanation match the original name, description, and any inspected flyer image?
- Are mixed-choice, item-count, and unknown-weight offers excluded from incompatible price pools?
- Did `npm run check` pass the tests, Aarhus audit, archived-data integrity check, privacy scan, and validation?
- Are both pending review counts understood before deployment?

Never patch rendered HTML as the only correction, never guess a flyer page, and never deploy after a failed check.
