function candidatePaths(pathname) {
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const withoutQuery = cleanPath.split('?')[0];
  const withoutHash = withoutQuery.split('#')[0];
  const normalizedPath = withoutHash === '/' ? '/index.html' : withoutHash;

  const candidates = [normalizedPath];

  if (!/\.[^/]+$/.test(normalizedPath)) {
    candidates.push(`${normalizedPath}.html`);
    candidates.push(`${normalizedPath}/index.html`);
  }

  if (normalizedPath.toLowerCase().endsWith('.html')) {
    const withoutExt = normalizedPath.slice(0, -5);
    candidates.push(`${withoutExt}.HTML`);
    candidates.push(`${withoutExt}.Html`);
  }

  return [...new Set(candidates)];
}

async function tryAssetFetch(assetBinding, request, pathname) {
  const candidates = candidatePaths(pathname);

  for (const candidate of candidates) {
    const candidateUrl = new URL(request.url);
    candidateUrl.pathname = candidate;
    const response = await assetBinding.fetch(new Request(candidateUrl.toString(), request));

    if (response.status !== 404) {
      return { response, resolvedPath: candidate };
    }
  }

  return { response: null, resolvedPath: null };
}

export default {
  async fetch(request, env) {
    try {
      const assets = env.ASSETS;
      if (!assets || typeof assets.fetch !== 'function') {
        return new Response('Assets binding is unavailable or invalid', {
          status: 500,
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        });
      }

      const url = new URL(request.url);
      const { response } = await tryAssetFetch(assets, request, url.pathname);

      if (!response) {
        return new Response('No se encontró el recurso solicitado', {
          status: 404,
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        });
      }

      return response;
    } catch (error) {
      return new Response('Worker error', {
        status: 500,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
  },
};