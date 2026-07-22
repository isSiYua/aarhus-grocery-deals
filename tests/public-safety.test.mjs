import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const read = path => fs.readFile(new URL(path, import.meta.url), 'utf8');

test('public site keeps its browser security and anti-impersonation guardrails', async () => {
  const [index, app, notice, security] = await Promise.all([
    read('../index.html'),
    read('../app.js'),
    read('../PUBLIC_NOTICE_ZH.md'),
    read('../SECURITY.md'),
  ]);

  assert.match(index, /default-src 'self'/);
  assert.match(index, /script-src 'self'/);
  assert.match(index, /object-src 'none'/);
  assert.match(index, /base-uri 'none'/);
  assert.match(index, /form-action 'none'/);
  assert.match(index, /name="referrer" content="no-referrer"/);
  assert.match(app, /所有功能永久免费/);
  assert.match(app, /不设置会员或付费功能/);
  assert.doesNotMatch(app, /不接受捐款|唯一打赏说明|收款码/);
  assert.match(app, /不代表任何超市、Tjek 或 eTilbudsavis/);
  assert.match(notice, /要求转账/);
  assert.match(notice, /都不是本项目的行为/);
  assert.match(security, /private vulnerability reporting|私下报告安全漏洞/i);
});

test('routine automation is Aarhus-only, token-free, and pins every action', async () => {
  const [pkgText, updateWorkflow, codeqlWorkflow] = await Promise.all([
    read('../package.json'),
    read('../.github/workflows/update-and-deploy.yml'),
    read('../.github/workflows/codeql.yml'),
  ]);
  const pkg = JSON.parse(pkgText);

  assert.doesNotMatch(pkg.scripts.update, /atlanta/i);
  assert.doesNotMatch(pkg.scripts['update:fallback'], /codex|openai|atlanta/i);
  assert.match(updateWorkflow, /npm run update:fallback/);
  assert.doesNotMatch(updateWorkflow, /update:atlanta|update-atlanta/i);
  assert.match(updateWorkflow, /git diff --quiet -- data\/\*\.json/);

  for (const workflow of [updateWorkflow, codeqlWorkflow]) {
    for (const line of workflow.split('\n').filter(value => /\buses:/.test(value))) {
      assert.match(line, /@[a-f0-9]{40}\s*$/, `Action is not pinned to a commit: ${line.trim()}`);
    }
  }
});
