import { isAuthorized, unauthorized } from '../_lib/auth.js';

export async function onRequestPost(context) {
  if (!isAuthorized(context.request, context.env)) return unauthorized();
  try {
    const { id } = await context.request.json();
    if (!id || typeof id !== 'string') return new Response('投稿IDが不正です。', { status: 400 });
    await context.env.INSTAGRAM_SELECTION.put('featured-media-id', id);
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return new Response('更新できませんでした。', { status: 500 });
  }
}
