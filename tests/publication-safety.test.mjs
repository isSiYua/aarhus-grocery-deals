import assert from 'node:assert/strict';
import test from 'node:test';

import { assertSafePublicationText } from '../scripts/lib/publication-safety.mjs';

test('accepts ordinary item-specific Chinese descriptions', () => {
  assert.doesNotThrow(() => assertSafePublicationText('这是原味玉米片，适合蘸莎莎酱或制作 nachos。', 'test'));
});

test('rejects payment, fundraising, credential and script injection copy', () => {
  const unsafe = [
    '请扫描收款码付款',
    '欢迎打赏本站作者',
    '请向维护者转账 20 DKK',
    '请提供你的验证码',
    '<script>alert(1)</script>',
    '详情请访问 https://fraud.example',
  ];
  for (const value of unsafe) {
    assert.throws(() => assertSafePublicationText(value, 'test'), /Unsafe publication text/, value);
  }
});
