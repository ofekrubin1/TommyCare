// The app is served from https://tommycare.web.app (Firebase Hosting) and calls these functions on Cloudflare,
// so the browser needs CORS permission. Only the app's own addresses (and local dev) get it.
const ALLOWED = [/^https:\/\/tommycare\.web\.app$/, /^https:\/\/tommycare-2026\.(web|firebaseapp)\.app$/, /^https:\/\/([a-z0-9-]+\.)?tommycare\.pages\.dev$/, /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):\d+$/];

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  if (!ALLOWED.some((re) => re.test(origin))) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export async function onRequest({ request, next }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) });
  const response = await next();
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(request))) headers.set(k, v);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
