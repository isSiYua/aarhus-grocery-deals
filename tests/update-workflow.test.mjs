import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const workflowUrl = new URL('../.github/workflows/update-and-deploy.yml', import.meta.url);

test('twice-daily Aarhus fallback refresh is token-free and deploys only material changes', async () => {
  const workflow = await fs.readFile(workflowUrl, 'utf8');

  assert.match(workflow, /name: Update deals and deploy/);
  assert.match(workflow, /cron: '17 1 \* \* \*'/);
  assert.match(workflow, /cron: '17 2 \* \* \*'/);
  assert.match(workflow, /cron: '17 13 \* \* \*'/);
  assert.match(workflow, /cron: '17 14 \* \* \*'/);
  assert.match(workflow, /Copenhagen 03:17 or 15:17/);
  assert.match(workflow, /npm run update:fallback/);
  assert.match(workflow, /Refresh Aarhus offers/);
  assert.doesNotMatch(workflow, /Refresh Aarhus and Atlanta/);
  assert.match(workflow, /git diff --quiet -- data\/\*\.json/);
  assert.match(workflow, /should_deploy/);
  assert.match(workflow, /cancel-in-progress: true/);
  assert.match(workflow, /node scripts\/report-update-status\.mjs/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm run audit:taxonomy/);
  assert.match(workflow, /npm run validate/);
  assert.match(workflow, /actions\/deploy-pages@[a-f0-9]{40}/);
  assert.doesNotMatch(workflow, /uses: [^\n]+@v\d/);
  assert.equal((workflow.match(/uses: [^\n]+@[a-f0-9]{40}/g) || []).length, 5);
  assert.doesNotMatch(workflow, /OPENAI_API_KEY|CODEX_ACCESS_TOKEN|npm run review:products/);
});
