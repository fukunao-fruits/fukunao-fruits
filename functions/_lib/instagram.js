const FIELDS = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';

function endpoint(path, env, extra = {}) {
  const url = new URL(`https://graph.instagram.com/${path}`);
  url.searchParams.set('fields', FIELDS);
  url.searchParams.set('access_token', env.INSTAGRAM_ACCESS_TOKEN);
  Object.entries(extra).forEach(([key, value]) => url.searchParams.set(key, value));
  return url;
}

function presentMedia(media) {
  const imageUrl = media.media_type === 'VIDEO' ? media.thumbnail_url : media.media_url;
  if (!imageUrl || !media.permalink) throw new Error('Instagram投稿の画像情報を取得できませんでした。');
  return {
    id: media.id,
    caption: media.caption || '',
    image_url: imageUrl,
    video_url: media.media_type === 'VIDEO' ? media.media_url : '',
    permalink: media.permalink,
    media_type: media.media_type,
    timestamp: media.timestamp || ''
  };
}

async function instagramFetch(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Instagram API error: ${response.status}`);
  return response.json();
}

export async function latestPosts(env) {
  const data = await instagramFetch(endpoint(`${env.INSTAGRAM_USER_ID}/media`, env, { limit: '3' }));
  return (data.data || []).map(presentMedia);
}

export async function selectedPost(env) {
  const mediaId = await env.INSTAGRAM_SELECTION.get('featured-media-id');
  if (!mediaId) return null;
  return presentMedia(await instagramFetch(endpoint(mediaId, env)));
}
