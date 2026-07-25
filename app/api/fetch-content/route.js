export async function GET(request) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) return Response.json({ success: false, error: 'url parameter required' }, { status: 400 });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LnkZooDataFactory/1.0)' },
    });
    clearTimeout(timeout);

    if (!res.ok) return Response.json({ success: false, error: `HTTP ${res.status}` });

    const html = await res.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, 6000);

    return Response.json({ success: true, text: text || 'No readable content found', length: text.length });
  } catch (err) {
    return Response.json({ success: false, error: err.name === 'AbortError' ? 'Request timed out' : 'Fetch failed' });
  }
}
