import { isAuthorized, unauthorized } from '../_lib/auth.js';
import { latestPosts } from '../_lib/instagram.js';

export async function onRequestGet(context) {
  if (!isAuthorized(context.request, context.env)) return unauthorized();
  try {
    return Response.json(await latestPosts(context.env), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Instagram投稿を取得できませんでした。' }, { status: 502 });
  }
}
