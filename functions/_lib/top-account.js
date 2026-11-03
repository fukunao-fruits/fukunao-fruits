// Public HTML contains no member identity. The browser reads the existing,
// same-origin session endpoint using its HttpOnly session cookie.
export const accountCSS = `.top-account{display:flex;justify-content:flex-end;align-items:center;gap:10px;min-width:0;font:600 13px/1.5 system-ui,sans-serif;letter-spacing:.02em}.top-account a{display:flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:44px;max-width:100%;padding:9px 18px;border:1px solid currentColor;border-radius:4px;color:inherit;text-decoration:none;overflow-wrap:anywhere;text-align:center}.top-account a:hover{background:#ffffff18}.top-account a:focus-visible{outline:3px solid #c58d3d;outline-offset:3px}.header .top-account-row{margin-bottom:10px}.header .top-account a{background:#402422b3;color:#fff}.header .top-account a:hover{background:#792b2f}.utility .utility-account{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:12px;padding-block:6px}.utility .top-account{color:#233b30}.utility .top-account a:last-child{background:#233b30;color:#fff;border-color:#233b30}.utility .top-account a:hover{background:#edf0e4;color:#233b30}@media(max-width:600px){.top-account{font-size:12px;gap:8px}.top-account a{padding:9px 12px}.utility .wrap{flex-wrap:wrap;gap:0;padding-block:4px}.utility .utility-account{width:100%;justify-content:space-between;gap:8px}.utility .utility-account>a{font-size:10px}.utility .top-account{max-width:100%}.header .top-account-row{margin-bottom:8px}}`;
export function accountMarkup(next) {
  const path = next === '/meguri/' ? '/meguri/' : '/';
  const query = '?next=' + encodeURIComponent(path);
  return `<div class="top-account" data-top-account data-account-return="${path}" role="group" aria-label="会員メニュー"><a href="/checkout/account/register${query}">新規登録</a><a href="/checkout/account/login${query}">ログイン</a></div>`;
}
export const accountHead = `<style data-top-account-style>${accountCSS}</style><script defer src="/assets/meguri/top-account.js"></script>`;
export async function topAccount(request, response) {
  if (request.method !== 'GET' || new URL(request.url).pathname !== '/meguri/' ||
      response.status !== 200 || !response.headers.get('Content-Type')?.includes('text/html')) return response;
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
