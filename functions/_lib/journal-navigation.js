// The journal has one reading entrance. Search belongs to the article index;
// existing article, category and product URLs remain valid.
const search = `<section class="journal-article-search" aria-label="記事を検索"><p>味わいや選び方、生産者のこだわりを記事でご紹介します。</p><form class="search-form" method="get" action="/meguri/search/" role="search"><label for="journal-article-query">記事を検索</label><div><input id="journal-article-query" name="q" type="search" maxlength="80" placeholder="例：紅ほっぺ、みかん、広島"><button type="submit">検索</button></div></form></section>`;
const style = `<style data-journal-reading-navigation>
.journal-header[data-meguri-shell] .shell-links a,.journal-header .journal-links a,.journal-header[data-meguri-shell] .shell-mobile>a,.journal-header .mobile-links>a{font-size:16px}
.journal-article-search{margin:0 0 32px;max-width:720px}.journal-article-search p{font-size:16px;line-height:1.9;margin:0 0 22px}
.journal-article-search .search-form{display:block}.journal-article-search label{display:block;margin-bottom:8px;font-size:16px;font-weight:600}.journal-article-search .search-form>div{display:flex;gap:8px}
.journal-article-search input,.journal-article-search button{font-size:16px;min-height:48px}
main[data-journal-home] .split{display:block}main[data-journal-home] .card .label,main[data-journal-home] .hero .label,main[data-journal-list] .card .label{display:none}
main[data-journal-list] .search-form input,main[data-journal-list] .search-form button{font-size:16px;min-height:48px}
main[data-journal-home] .summary,main[data-journal-list] .summary{font-size:16px}
@media(max-width:600px){.journal-article-search{margin-bottom:26px}.journal-article-search button{padding-inline:16px}main[data-journal-list] .card h2{font-size:16px}main[data-journal-list] .meta{font-size:14px}}
</style>`;

export function journalNavigation(request,response){
 const path=new URL(request.url).pathname;
 if(request.method!=='GET'||!/^\/(?:meguri\/|lp\/)/.test(path)||![200,404].includes(response.status)||!response.headers.get('Content-Type')?.includes('text/html'))return response;
 const home=path==='/meguri/',articleIndex=path==='/meguri/articles/',listing=articleIndex||path==='/meguri/search/'||path.startsWith('/meguri/fruits/');
 const remove={element(e){e.remove();}};
 const rewrite=new HTMLRewriter()
  .on('header.journal-header nav a[href="/meguri/#categories"]',remove)
  .on('header.journal-header nav a[href="/meguri/shop/"]',remove)
  .on('header.journal-header nav a[href="/meguri/search/"]',remove)
  .on('head',{element(e){e.append(style,{html:true});}});
 if(home)rewrite
  .on('main',{element(e){e.setAttribute('data-journal-home','');}})
  .on('main > h1.eyebrow',remove)
  .on('main #categories',remove)
  .on('main #shop',remove)
  .on('main .split > aside',remove)
  .on('main #search h2',{element(e){e.setInnerContent('記事を検索');}});
 if(listing)rewrite
  .on('main',{element(e){e.setAttribute('data-journal-list','');}});
 if(articleIndex)rewrite.on('main .intro',{element(e){e.after(search,{html:true});}});
 const headers=new Headers(response.headers);
 headers.delete('Content-Length');headers.delete('ETag');headers.set('Cache-Control','no-store');
 return rewrite.transform(new Response(response.body,{status:response.status,headers}));
}
