import { selectedPost } from '../_lib/instagram.js';

const FORWARDED_HEADERS = ['content-type', 'content-length', 'content-range', 'accept-ranges'];

export async function onRequestGet(context) {
  try {
    const post = await selectedPost(context.env);
    if (!post?.video_url) return new Response('Video not available', { status: 404 });

    const requestHeaders = new Headers();
    const range = context.request.headers.get('range');
    if (range) requestHeaders.set('range', range);

    const upstream = await fetch(post.video_url, { headers: requestHeaders });
    if (!upstream.ok && upstream.status !== 206) {
      return new Response('Video not available', { status: 502 });
    }

    const headers = new Headers({
      'Cache-Control': 'no-store',
      'Cross-Origin-Resource-Policy': 'same-origin'
    });
    FORWARDED_HEADERS.forEach(name => {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    });
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return new Response('Video not available', { status: 502 });
  }
}
