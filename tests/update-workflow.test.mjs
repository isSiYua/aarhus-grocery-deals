import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const workflowUrl = new URL('../.github/workflows/update-and-deploy.yml', import.meta.url);
const selectedWorkflowUrl = new URL('../.github/workflows/refresh-selected-stores.yml', import.meta.url);
const pullRequestWorkflowUrl = new URL('../.github/workflows/pull-request-checks.yml', import.meta.url);

test('twice-daily Aarhus fallback refresh is token-free and deploys only material changes', async () => {
  const workflow = await fs.readFile(workflowUrl, 'utf8');

  assert.match(workflow, /name: Update deals and deploy/);
  assert.match(workflow, /cron: '17 1 \* \* \*'/);
  assert.match(workflow, /cron: '17 2 \* \* \*'/);
  assert.match(workflow, /cron: '17 13 \* \* \*'/);
  assert.match(workflow, /cron: '17 14 \* \* \*'/);
  assert.match(workflow, /Copenhagen 03:17 or 15:17/);
  assert.match(workflow, /push:/);
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /should_refresh=false/);
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

test('trusted maintainers can refresh selected chains into an isolated pull request', async () => {
  const workflow = await fs.readFile(selectedWorkflowUrl, 'utf8');

  assert.match(workflow, /name: Check grocery chains and open a data PR/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /required: false/);
  assert.match(workflow, /default: ''/);
  assert.match(workflow, /auto-all/);
  assert.match(workflow, /npm run update:stores -- "\$REQUESTED_STORES"/);
  assert.match(workflow, /npm run check/);
  assert.match(workflow, /npm run build:preview/);
  assert.match(workflow, /git switch -c "\$branch"/);
  assert.match(workflow, /gh pr create/);
  assert.match(workflow, /pull-requests: write/);
  assert.match(workflow, /cancel-in-progress: false/);
  assert.doesNotMatch(workflow, /OPENAI_API_KEY|CODEX_ACCESS_TOKEN|npm run review:products/);
  assert.doesNotMatch(workflow, /uses: [^\n]+@v\d/);
  assert.equal((workflow.match(/uses: [^\n]+@[a-f0-9]{40}/g) || []).length, 2);
});

test('every pull request runs a read-only publication gate', async () => {
  const workflow = await fs.readFile(pullRequestWorkflowUrl, 'utf8');

  assert.match(workflow, /name: Publication gate/);
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /npm run check/);
  assert.match(workflow, /npm run build:preview/);
  assert.match(workflow, /git diff --exit-code/);
  assert.doesNotMatch(workflow, /contents: write|pull_request_target|OPENAI_API_KEY|CODEX_ACCESS_TOKEN/);
  assert.equal((workflow.match(/uses: [^\n]+@[a-f0-9]{40}/g) || []).length, 2);
});
