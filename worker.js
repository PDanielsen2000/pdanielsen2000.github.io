export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Proxy: /g/collect → google-analytics.com/g/collect
    if (url.pathname === '/g/collect') {
      const target = new URL('https://www.google-analytics.com/g/collect');
      target.search = url.search;

      const proxyRequest = new Request(target.toString(), {
        method: request.method,
        headers: {
          'Content-Type': request.headers.get('Content-Type') || 'text/plain',
          'X-Forwarded-For': request.headers.get('CF-Connecting-IP') || '',
          'User-Agent': request.headers.get('User-Agent') || '',
        },
        body: request.method === 'POST' ? request.body : undefined,
      });

      const response = await fetch(proxyRequest);
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store',
        },
      });
    }

    // Proxy: /gtag/js → googletagmanager.com/gtag/js
    if (url.pathname.startsWith('/gtag/js')) {
      const target = new URL('https://www.googletagmanager.com/gtag/js');
      target.search = url.search;

      const response = await fetch(target.toString(), {
        headers: { 'User-Agent': request.headers.get('User-Agent') || '' },
      });

      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Everything else → serve static Jekyll site
    return env.ASSETS.fetch(request);
  },
};
