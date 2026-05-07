async function scrapeMetadata(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; linra/1.0; +https://linra.app)',
      },
    });

    clearTimeout(timeout);

    const html = await response.text();

    const title = extractTitle(html);
    const description = extractDescription(html);
    const favicon = extractFavicon(html, url);

    return { title, description, favicon };
  } catch (err) {
    clearTimeout(timeout);
    const domain = extractDomain(url);
    return {
      title: null,
      description: null,
      favicon: domain
        ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
        : null,
    };
  }
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

function extractDescription(html) {
  let match = html.match(
    /<meta\s+(?:[^>]*?\s)?name=["']description["'][^>]*content=["']([^"']*)["']/i
  );
  if (!match) {
    match = html.match(
      /<meta\s+(?:[^>]*?\s)?content=["']([^"']*)["'][^>]*name=["']description["']/i
    );
  }
  if (!match) {
    match = html.match(
      /<meta\s+(?:[^>]*?\s)?property=["']og:description["'][^>]*content=["']([^"']*)["']/i
    );
  }
  if (!match) {
    match = html.match(
      /<meta\s+(?:[^>]*?\s)?content=["']([^"']*)["'][^>]*property=["']og:description["']/i
    );
  }
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

function extractFavicon(html, pageUrl) {
  const domain = extractDomain(pageUrl);
  const fallback = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    : null;

  let match = html.match(
    /<link\s+(?:[^>]*?\s)?rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i
  );
  if (!match) {
    match = html.match(
      /<link\s+(?:[^>]*?\s)?href=["']([^"']*)["'][^>]*rel=["'](?:shortcut )?icon["']/i
    );
  }

  if (!match) return fallback;

  const href = match[1].trim();
  if (!href) return fallback;

  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  if (href.startsWith('//')) return 'https:' + href;
  if (href.startsWith('/')) {
    try {
      const u = new URL(pageUrl);
      return `${u.protocol}//${u.host}${href}`;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

module.exports = { scrapeMetadata };
