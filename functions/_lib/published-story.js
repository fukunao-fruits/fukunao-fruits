// Launch curation: link to the one already-approved legacy page, without
// converting its body, publishing drafts, or changing its order controls.
const path='/lp/p-185b1ab2aa6142288c53cd6eaf3ed286/';
const title='この間のみかん、おいしかった。｜佐木島産 日南みかん';
const marker='<main id="main" class="wrap">';
const landing=`<section class="meguri-welcome" aria-labelledby="meguri-welcome-title"><div class="meguri-welcome__copy"><p class="meguri-welcome__eyebrow">FUKUNAO FRUIT JOURNAL</p><h1 id="meguri-welcome-title">福直くだもの巡り</h1><p class="meguri-welcome__lead">果物を知る。<br>好きになる。<br>取り寄せる。</p><p class="meguri-welcome__text">旬の果物を、もっと身近に。<br>果物専門店の目利きで、味わいと選び方をご案内します。</p></div><nav class="meguri-welcome__links" aria-label="福直くだもの巡りの入口"><a href="/meguri/articles/">記事を読む <span>→</span></a><a href="/meguri/#categories">果物から探す <span>→</span></a><a href="/meguri/shop/">商品のご案内 <span>→</span></a></nav></section>`;
const landingStyle=`<style data-meguri-welcome>
.meguri-content>main.wrap>.eyebrow:first-child{display:none}
.meguri-welcome{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(260px,.75fr);gap:48px;align-items:end;margin:22px 0 56px;padding:clamp(32px,6vw,74px);background:linear-gradient(135deg,#24483b 0%,#1b3e33 100%);color:#fffaf0}
.meguri-welcome__eyebrow{margin:0 0 12px;color:#e9c47c;font:700 11px/1.5 system-ui,sans-serif;letter-spacing:.18em}.meguri-welcome h1{margin:0;font:600 clamp(28px,4vw,46px)/1.35 serif;letter-spacing:.08em}.meguri-welcome__lead{margin:20px 0 0;font:clamp(28px,3.6vw,44px)/1.5 serif;letter-spacing:.08em}.meguri-welcome__text{margin:22px 0 0;color:#e8eee8;font-size:15px;line-height:2}.meguri-welcome__links{display:grid;gap:9px}.meguri-welcome__links a{display:flex;align-items:center;justify-content:space-between;min-height:56px;padding:14px 16px;border:1px solid #789689;color:#fffaf0;font-size:15px}.meguri-welcome__links a:hover{background:#315d4e;text-decoration:none}.meguri-welcome__links span{color:#e9c47c;font-size:19px}@media(max-width:600px){.meguri-welcome{grid-template-columns:1fr;gap:26px;margin:8px -20px 36px;padding:38px 24px}.meguri-welcome h1{font-size:30px}.meguri-welcome__lead{margin-top:16px;font-size:30px}.meguri-welcome__text{margin-top:18px;font-size:14px;line-height:1.9}.meguri-welcome__links a{min-height:54px;font-size:14px}}
</style>`;
const card=`<section class="section" aria-labelledby="published-story-title"><p class="eyebrow">FROM OUR SHOP</p><h2 id="published-story-title">くだものの便り</h2><article class="story" style="padding:24px"><h3><a href="${path}">${title}</a></h3><p>広島県三原市沖・佐木島産の日南みかん。極早生の季節に、競り場で果実を見て選んだ一箱をご紹介します。</p><a class="read" href="${path}">記事を読む →</a></article></section>`;

export async function publishedStory(request,response){
 if(request.method!=='GET'||new URL(request.url).pathname!=='/meguri/'||response.status!==200||!response.headers.get('Content-Type')?.includes('text/html'))return response;
 const body=await response.text(),headers=new Headers(response.headers);
 headers.delete('Content-Length');headers.delete('ETag');headers.set('Cache-Control','no-store');
 // The article link itself is already public.  Keep the journal's opening
 // screen stable even if a separate availability check is temporarily slow.
 const page=body.includes(marker)
  ?body.replace('</head>',landingStyle+'</head>').replace(marker,marker+landing+card)
  :body;
 return new Response(page,{status:response.status,headers});
}
