const FORBIDDEN_PUBLICATION_PATTERNS = [
  { pattern: /<\/?(?:script|iframe|form|object|embed)\b|javascript:/i, reason: 'HTML or script injection' },
  { pattern: /https?:\/\/|www\./i, reason: 'unexpected link in a repository-authored shopper field' },
  { pattern: /收款码|付款码|支付二维码|微信支付|支付宝转账|mobilepay\s*转账/i, reason: 'payment solicitation' },
  { pattern: /(?:向|给)(?:本站|作者|项目|维护者).{0,12}(?:付款|转账|汇款)/i, reason: 'impersonated payment request' },
  { pattern: /(?:打赏|捐款|募捐|赞助)(?:本站|作者|项目|维护者)?/i, reason: 'fundraising solicitation' },
  { pattern: /(?:加微信|私信作者|联系作者).{0,20}(?:付款|转账|领取|验证码)/i, reason: 'off-platform solicitation' },
  { pattern: /提供.{0,12}(?:银行卡|mitid|验证码|密码)|发送.{0,12}(?:验证码|密码)/i, reason: 'credential request' },
];

export function assertSafePublicationText(value, label) {
  const text = String(value || '');
  for (const { pattern, reason } of FORBIDDEN_PUBLICATION_PATTERNS) {
    if (pattern.test(text)) throw new Error(`Unsafe publication text (${reason}) in ${label}`);
  }
}
