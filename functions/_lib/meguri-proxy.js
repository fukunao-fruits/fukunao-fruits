import {publishedStory} from './published-story.js';
import {topAccount} from './top-account.js';
import {journalTheme} from './journal-theme.js';
// Fixed public upstream. Never forwards cookies, authorization or an arbitrary URL.
export async function proxy(request){
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD','Cache-Control':'no-store'}});
 const u=new URL(request.url);
 if(!(u.pathname.startsWith('/meguri/')||['/meguri','/robots.txt','/sitemap.xml'].includes(u.pathname))||/%|\/\//.test(u.pathname)||u.search.length>800||[...u.searchParams.keys()].some(k=>!['q','page','from','utm_source','utm_medium','utm_campaign'].includes(k))||u.searchParams.getAll('q').length>1||u.searchParams.getAll('page').length>1||['from','utm_source','utm_medium','utm_campaign'].some(k=>u.searchParams.getAll(k).length>1||(u.searchParams.get(k)||'').length>120))return new Response('Not found',{status:404});
 if(u.pathname.startsWith('/meguri')&&!/^\/meguri(?:\/|\/articles(?:\/[a-z0-9-]+)?\/?|\/fruits\/[a-z0-9-]+\/?|\/(?:search|shop)\/?|\/products\/mgs_[a-f0-9]{32}\/?|\/sale-media\/mgs_[a-f0-9]{32}\/[a-f0-9]{64}\.webp|\/media\/[a-z0-9-]+\/[a-f0-9]{64}\.webp|\/sitemap-(?:products-)?[1-9][0-9]*\.xml)?$/.test(u.pathname))return new Response('Not found',{status:404});
 if(u.searchParams.has('from')&&(!/^\/meguri\/products\/mgs_[a-f0-9]{32}\/?$/.test(u.pathname)||!/^flp_[a-f0-9]{32}$/.test(u.searchParams.get('from'))))return new Response('Not found',{status:404});
 for(const key of ['utm_source','utm_medium','utm_campaign'])u.searchParams.delete(key);
 const upstream=new URL(u.pathname+u.search,'https://fukunao-free-lp-publisher.ttta-fuku.workers.dev');
 const headers=new Headers();if(request.headers.has('If-None-Match'))headers.set('If-None-Match',request.headers.get('If-None-Match'));
 try{const response=await fetch(upstream,{method:request.method,headers,redirect:'manual',cache:'no-store'});const h=new Headers(response.headers);h.delete('Set-Cookie');return await journalTheme(request,await topAccount(request,await publishedStory(request,new Response(request.method==='HEAD'?null:response.body,{status:response.status,headers:h}))));}
 catch{return new Response('ただいま記事を表示できません。時間をおいてお試しください。',{status:503,headers:{'Cache-Control':'no-store','Content-Type':'text/plain; charset=utf-8'}});}
}
