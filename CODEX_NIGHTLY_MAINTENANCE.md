# Codex nightly maintenance contract

This repository is maintained by the Codex desktop automation, not by an AI API embedded in the website or GitHub Actions.

## Nightly outcome

At 03:00 Europe/Copenhagen, inspect Aarhus and Atlanta deal sources. Only commit and deploy when at least one meaningful offer, source locator, stable product identity, or Codex-authored description changed. Timestamp-only differences are not meaningful changes.

## Required procedure

1. Work only in `/Users/issiyua/Documents/aarhus-grocery-deals`. Preserve unrelated user changes. If the worktree is not clean, do not overwrite it; report the blocker.
2. Fast-forward from `origin/main`, then save semantic snapshots of the published offer files before refreshing.
3. Run `npm run update` and `npm run locate`. Compare offer identity, price, package/unit price, validity, status, image/source link, page location, category and store data. Ignore `metadata.updatedAt`, `lastSeenAt`, `sourceLocation.verifiedAt` and formatting-only differences when deciding whether the deals changed.
4. Use `data/product_identity_history.json` to audit recurrence. The stable identity is based on normalized product name plus comparison group, never on a promotion offer ID. Record new source IDs, validity periods, catalog IDs and exact normalized image references. Report when the same source ID returns in a later promotion period, when the same stable product receives a different ID, or when an exact image reference is shared by different IDs. Do not infer image equality from merely similar URLs.
5. Read `data/product_taxonomy_pending.json`. Codex must review new products first, then up to 150 older pending products, and write the fixed result to `data/product_taxonomy_zh.json`. Classify by the concrete product form, not by incidental ingredient or flavor words. Fruit and vegetables must use species-level groups where useful; processed foods, tools, candles, meat and dairy must never leak into produce. Cross-species `eller` assortments use a mixed group and do not participate in a single-species minimum. Mark careful reviews with `authoredBy: "Codex"`, `reviewStatus: "reviewed"` and `taxonomyVersion: "codex-taxonomy-v1"`.
6. Read `data/product_descriptions_pending.json`. Codex itself must author useful Simplified Chinese descriptions directly in `data/product_descriptions_zh.json`; never call OpenAI or another model API, never request an API key, and never put secrets in the repository. Always handle newly observed products first, then work through up to 150 older backlog items ordered by occurrence count. Do not mass-fill the cache with generic category text merely to reduce the pending count.
7. Each description must identify the concrete product, explain normal use or cooking, and mention a Chinese equivalent only when helpful. Respect `eller`/`frit valg` as an assortment, preserve uncertainty, and do not invent ingredients, flavor, origin, health claims or meat cuts. Non-food items must be labelled and explained correctly. Use `authoredBy: "Codex"` and `descriptionSpecVersion: "zh-product-v2"`.
8. Run `npm run taxonomy:sync`, `npm run descriptions:sync`, `npm run identities:update`, `npm test`, and `npm run validate` after editing fixed knowledge.
9. If there is no semantic deal change, no new identity evidence and no new or corrected taxonomy/description, restore only the generated data-file timestamp changes and exit without commit, push or deployment.
10. If there is a meaningful change, commit only the scoped repository files, push `main`, run `gh workflow run update-and-deploy.yml --repo isSiYua/aarhus-grocery-deals`, wait for success, and verify `https://issiyua.github.io/aarhus-grocery-deals/` plus its published JSON. Never guess a flyer page number.

The final automation report must state whether anything changed, description and taxonomy reviewed/pending counts, identity-reuse evidence discovered, tests/validation status, commit (if any), workflow run (if any), and deployed URL.
