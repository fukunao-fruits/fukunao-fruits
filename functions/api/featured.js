import { selectedPost } from '../_lib/instagram.js';

export async function onRequestGet(context) {
  try {
    const post = await selectedPost(context.env);
    if (!post) return new Response(null, { status: 204 });
    return Response.json(post, { headers: { 'Cache-Control': 'public, max-age=300' } });
  } catch {
    return new Response(null, { status: 204 });
  }
}
