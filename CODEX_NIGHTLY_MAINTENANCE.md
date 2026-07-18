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
7. Maintain Atlanta in parallel in `data/atlanta_product_knowledge_zh.json`. Run `npm run atlanta-knowledge:sync` after refreshing Atlanta. A correction to either location requires a quick audit of the same failure class in both locations. Product form has priority over incidental words: for example, pork and beans is a bean product, butter croissants are bakery, and Apple electronics or bean-bag games are not groceries.
8. Each description must identify the concrete product, explain normal use or cooking, and mention a Chinese equivalent only when helpful. Inspect the complete original name and retain the exact offer-image URL as evidence. When the name is ambiguous or conflicts with the visible image, Codex must actually inspect the image before setting `imageReviewed: true`; otherwise leave it false and queue review. Respect `eller`/`frit valg` as an assortment, preserve uncertainty, and do not invent ingredients, flavor, origin, health claims or meat cuts. Non-food items must be labelled and explained correctly. Never publish placeholder phrases such as “蔬菜商品”, “肉类优惠” or “具体品种以原名为准” for a product whose concrete identity is known.
9. Run `npm run taxonomy:sync`, `npm run descriptions:sync`, `npm run atlanta-knowledge:sync`, `npm run identities:update`, `npm test`, and `npm run validate` after editing fixed knowledge.
10. If there is no semantic deal change, no new identity evidence and no new or corrected taxonomy/description, restore only the generated data-file timestamp changes and exit without commit, push or deployment.
11. If there is a meaningful change, commit only the scoped repository files, push `main`, run `gh workflow run update-and-deploy.yml --repo isSiYua/aarhus-grocery-deals`, wait for success, and verify `https://issiyua.github.io/aarhus-grocery-deals/` plus both published offer JSON files. Never guess a flyer page number.

The final automation report must state whether anything changed, description and taxonomy reviewed/pending counts, identity-reuse evidence discovered, tests/validation status, commit (if any), workflow run (if any), and deployed URL.

## Fine taxonomy invariants

These rules apply to both newly published flyers and recurring products. Do not collapse a known concrete form back into a broad legacy group.

- Aarhus chicken, turkey, pork, beef and pork/beef mixed mince belong to top category `minced_meat`, while each species keeps its own comparison group. Atlanta ground beef, ground chicken and ground pork follow the same rule.
- Yoghurt and Skyr belong to top category `yoghurt`. Aarhus cream and cross-dairy refrigerated assortments belong to `cream_cold_dairy`; Atlanta milk, butter, cream and eggs remain in `dairy`.
- Cheese stays a top-level category, but the comparison group must express the identifiable form. Aarhus distinguishes grated, sliced, spreadable, cottage/ricotta, mozzarella/burrata, feta/white, grilling, soft-mould, aged hard, Danish table, mixed offer and other cheese. Atlanta distinguishes sliced, grated, portioned/sticks, prepared/breaded and table cheese.
- A recurring normalized product name plus comparison group must reuse its fixed taxonomy and Chinese description even when the promotion ID changes. A genuinely new name is classified by the deterministic rules first, then reviewed by Codex if it is pending or ambiguous.
- Tests and validation must fail if a known mince, yoghurt or identifiable cheese form returns to an obsolete broad category.
