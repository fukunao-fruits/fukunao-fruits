// One citrus accent, with lighter shades for the journal's reading surfaces.
// Inline styles preserve the upstream's restrictive Content-Security-Policy.
export const journalThemeCSS = `
:root{--orange:#995331;--citrus:#995331;--citrus-soft:#f4e5d5;--citrus-pale:#fbf4eb;--line:#e3d6c7}
.journal-header{background:rgba(244,229,213,.88);border-bottom-color:#d7b99c;box-shadow:0 2px 12px #99533108}
.brand em,.eyebrow,.read{color:var(--citrus)}
.journal-header .brand small{color:#7d4b32}
.journal-links a:hover,.mobile-links a:hover{color:var(--citrus);background:var(--citrus-soft)}
.journal-header .menu summary{border-color:#cba98c;background:#fff8f080}
.journal-header .mobile-links{background:#fffaf4;border-color:#d7b99c}
.journal-header .top-account a:last-child{color:#fffaf4;background:var(--citrus);border-color:var(--citrus)}
.journal-header .top-account a:hover{background:#ead2bb}
.journal-header .top-account a:last-child:hover{background:#7e4227;border-color:#7e4227}
.top-account a:focus-visible,.journal-header a:focus-visible,.journal-header summary:focus-visible{outline-color:var(--citrus)}
.section[aria-labelledby="published-story-title"]{padding:30px 36px 32px;background:var(--citrus-soft);border-left:4px solid var(--citrus)}
.section[aria-labelledby="published-story-title"] .story{max-width:none;padding:20px 0 0!important}
.section[aria-labelledby="published-story-title"] .read{margin-top:18px}
.section-head{border-bottom-color:#c79d77}
.read{border-bottom-color:var(--citrus)}
.categories a{border-color:#dfc8b0;background:#fffaf4}
.categories a:hover{border-color:var(--citrus);background:var(--citrus-soft)}
.shop-band{background:var(--citrus-soft);border-top:3px solid #ba8057}
.search-band{background:var(--citrus-pale);border-color:#dfc8b0}
.search-band button{background:var(--citrus);border-color:var(--citrus);color:#fffaf4}
.quiet{background:var(--citrus-pale);border-color:#e3d0bb}
.footer{background:var(--citrus);border-top:0;color:#fffaf4}
.footer .brand,.footer .brand em,.footer .note,.footer small{color:#fffaf4}
.footer a:focus-visible{outline:3px solid #fffaf4;outline-offset:4px}
@media(max-width:600px){
 .section[aria-labelledby="published-story-title"]{padding:24px 20px 26px}
 .search-band{padding:28px 20px}
 .shop-band{padding:28px 24px}
}
`;

export async function journalTheme(request, response) {
  if (request.method !== 'GET' || !new URL(request.url).pathname.startsWith('/meguri/') ||
      ![200,404].includes(response.status) || !response.headers.get('Content-Type')?.includes('text/html')) return response;
  const body = await response.text(), headers = new Headers(response.headers);
  headers.delete('Content-Length');
  headers.delete('ETag');
  headers.set('Cache-Control', 'no-store');
  const updated = body.includes('class="journal-header"') && !body.includes('data-journal-theme')
    ? body.replace('</head>', `<style data-journal-theme>${journalThemeCSS}</style></head>`)
    : body;
  return new Response(updated, {status: response.status, headers});
}
