// Public pages only. Publishing credentials never enter the public website.
export async function onRequest(context) {
  const {request}=context;
  if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD','Cache-Control':'no-store'}});
  const incoming=new URL(request.url);
  const upstream=new URL(incoming.pathname,'https://fukunao-free-lp-publisher.ttta-fuku.workers.dev');
  try {
    const response=await fetch(upstream,{method:request.method,redirect:'manual'});
    const headers=new Headers(response.headers);
    headers.set('Cache-Control','no-store');
    return new Response(response.body,{status:response.status,headers});
  } catch {
    return new Response('ただいまページを表示できません。時間をおいてお試しください。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
  }
}
