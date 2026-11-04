// Launch curation: link to the one already-approved legacy page, without
// converting its body, publishing drafts, or changing its order controls.
const path='/lp/p-185b1ab2aa6142288c53cd6eaf3ed286/';
const title='この間のみかん、おいしかった。｜佐木島産 日南みかん';
const marker='<main id="main" class="wrap">';
const card=`<section class="section" aria-labelledby="published-story-title"><p class="eyebrow">FROM OUR SHOP</p><h2 id="published-story-title">くだものの便り</h2><article class="story" style="padding:24px"><h3><a href="${path}">${title}</a></h3><p>広島県三原市沖・佐木島産の日南みかん。極早生の季節に、競り場で果実を見て選んだ一箱をご紹介します。</p><a class="read" href="${path}">記事を読む →</a></article></section>`;

export async function publishedStory(request,response){
 if(request.method!=='GET'||new URL(request.url).pathname!=='/meguri/'||response.status!==200||!response.headers.get('Content-Type')?.includes('text/html'))return response;
 const body=await response.text(),headers=new Headers(response.headers);
 headers.delete('Content-Length');headers.delete('ETag');headers.set('Cache-Control','no-store');
 let visible=false;
 if(body.includes(marker))try{
  const legacy=await fetch('https://fukunao-free-lp-publisher.ttta-fuku.workers.dev'+path,
   {method:'GET',redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(8000)});
  visible=legacy.status===200&&!!legacy.headers.get('Content-Type')?.includes('text/html')&&(await legacy.text()).includes(title);
 }catch{/* A stopped or unavailable publication must not be advertised. */}
 return new Response(visible?body.replace(marker,marker+card):body,{status:response.status,headers});
}
