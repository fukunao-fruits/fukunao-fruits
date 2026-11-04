// Public HTML contains no member identity. The browser reads the existing,
// same-origin session endpoint using its HttpOnly session cookie.
export const accountCSS = `.top-account{display:flex;justify-content:flex-end;align-items:center;gap:6px;min-width:0;font:600 12px/1.5 system-ui,sans-serif}.top-account a{display:flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:44px;max-width:210px;padding:8px 12px;border:1px solid transparent;border-radius:4px;color:inherit;text-decoration:none;white-space:nowrap}.top-account a:last-child{border-color:#233b3066;background:#ffffff66}.top-account a:hover{background:#e4eada}.top-account a:focus-visible{outline:3px solid #c58d3d;outline-offset:3px}.top-account-name{min-width:0;overflow:hidden;text-overflow:ellipsis}.top-account-label{flex:none}.utility .utility-account{display:flex;align-items:center;justify-content:flex-end;gap:12px;padding-block:6px}.journal-header .utility .utility-account{gap:6px;padding:0}.journal-header .utility .utility-account>a{display:none}@media(max-width:600px){.top-account{gap:4px}.top-account a{padding-inline:8px}.top-account a:only-child{max-width:min(210px,calc(100vw - 180px))}.utility .wrap{flex-wrap:wrap;gap:0;padding-block:4px}.utility .utility-account{flex-wrap:wrap;width:100%;justify-content:space-between;gap:8px}.journal-header .utility .utility-account{flex-wrap:nowrap}}`;
export function accountMarkup(next) {
  const path = next === '/meguri/' ? '/meguri/' : '/';
  const query = '?next=' + encodeURIComponent(path);
  return `<div class="top-account" data-top-account data-account-return="${path}" data-account-layout="compact" role="group" aria-label="会員メニュー"><a href="/checkout/account/register${query}">新規登録</a><a href="/checkout/account/login${query}">ログイン</a></div>`;
}
export const accountHead = `<style data-top-account-style>${accountCSS}</style><script defer src="/assets/meguri/top-account.js"></script>`;
export async function topAccount(request, response) {
  if (request.method !== 'GET' || !new URL(request.url).pathname.startsWith('/meguri/') ||
      ![200,404].includes(response.status) || !response.headers.get('Content-Type')?.includes('text/html')) return response;
  const marker = '<div><a href="/">福直フルーツ公式サイト ↗</a></div>';
  const body = await response.text(), headers = new Headers(response.headers);
  headers.delete('Content-Length');
  headers.delete('ETag');
  headers.set('Cache-Control', 'no-store');
  const updated = body.includes(marker) && !body.includes('data-top-account')
    ? body.replace('</head>', accountHead + '</head>').replace(marker,
        `<div class="utility-account"><a href="/">福直フルーツ公式サイト ↗</a>${accountMarkup('/meguri/')}</div>`)
    : body;
  return new Response(updated, {status: response.status, headers});
}
