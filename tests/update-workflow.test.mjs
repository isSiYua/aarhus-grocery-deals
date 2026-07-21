import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const workflowUrl = new URL('../.github/workflows/update-and-deploy.yml', import.meta.url);

test('daily fallback refreshes and deploys without Codex or OpenAI credentials', async () => {
  const workflow = await fs.readFile(workflowUrl, 'utf8');

  assert.match(workflow, /name: Update deals and deploy/);
  assert.match(workflow, /cron: '0 1 \* \* \*'/);
  assert.match(workflow, /cron: '0 2 \* \* \*'/);
  assert.match(workflow, /Copenhagen 03:00/);
  assert.match(workflow, /npm run update:fallback/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm run audit:taxonomy/);
  assert.match(workflow, /npm run validate/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.doesNotMatch(workflow, /OPENAI_API_KEY|CODEX_ACCESS_TOKEN|npm run review:products/);
});
