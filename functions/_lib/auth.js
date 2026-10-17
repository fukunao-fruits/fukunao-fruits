export function unauthorized() {
  return new Response('認証が必要です。', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Fukunao admin", charset="UTF-8"' }
  });
}

export function isAuthorized(request, env) {
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Basic ')) return false;
  try {
    const decoded = atob(header.slice(6));
    const divider = decoded.indexOf(':');
    const username = decoded.slice(0, divider);
    const password = decoded.slice(divider + 1);
    return username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD;
  } catch {
    return false;
  }
}
