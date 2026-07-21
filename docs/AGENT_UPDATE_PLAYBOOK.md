# Agent-neutral deal update playbook

No Codex quota, OpenAI key, or model API is required for the scheduled refresh. GitHub Actions runs the same repository code every day at Copenhagen 03:30. This playbook is the fallback for any local agent or human maintainer.

## Routine refresh

```sh
git pull --ff-only
npm run update:fallback
npm run check
npm run build:preview
```

`update:fallback` downloads Aarhus and Atlanta source data, reuses repository-reviewed taxonomy/descriptions, queues unseen products, and withholds those unseen items from publication. If the source data did not change, the workflow may update refresh metadata without inventing product changes.

## When classification or Chinese text needs correction

1. Add a normalized original-name entry to `data/product_review_overrides_zh.json`.
2. Add or refine the general detection rule in `scripts/lib/taxonomy.mjs` so future names of the same kind are classified correctly.
3. Add a Chinese group explanation in `scripts/lib/explain-zh.mjs` if the comparison group is new.
4. Run:

```sh
npm run taxonomy:migrate
npm run check
npm run build:preview
```

5. Inspect the current offer, the lowest-price modal, neighbouring offers in the same small category, and at least one mobile layout.

## Mandatory self-review questions

- Is it raw, or is it seasoned, marinated, cooked, smoked, breaded, minced, formed, or mixed?
- Are all products in the lowest-price pool truly interchangeable in species, cut/form, preparation state, and unit basis?
- Does the Chinese name reveal the actual item rather than merely its broad category?
- Does the explanation match both the original name and the visible flyer evidence?
- Are fruit, vegetables, seafood, meat, non-food paper goods, and drinks kept out of one another's aisles?
- Did the audit run for both Aarhus and Atlanta?

The command `npm run audit:taxonomy` converts these known failure modes into a deployment-blocking gate. Add a regression rule whenever a new repeatable error pattern is discovered.
