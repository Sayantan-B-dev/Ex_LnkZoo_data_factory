export async function POST(request) {
  const { url, content } = await request.json();

  if (!url || !content) {
    return Response.json({ error: 'url and content are required' }, { status: 400 });
  }

  const keys = [
    process.env.OPENROUTER_API_KEY_1,
    process.env.OPENROUTER_API_KEY_2,
    process.env.OPENROUTER_API_KEY_3,
  ].filter(k => k && k.startsWith('sk-or-'));

  if (keys.length === 0) {
    return Response.json({ error: 'No valid API keys configured on server' }, { status: 500 });
  }

  const prompt = `You are a content analyzer. Given user-provided content about a URL, generate a concise topic (max 10 words), a short description (2-3 sentences), and 3-5 relevant tags. Respond in strict JSON format: {"topic":"...","description":"...","tags":["...","..."]}. No markdown, no code blocks, just raw JSON.

URL: ${url}

Content:
${content.slice(0, 4000)}`;

  let attempts = 0;
  let keyIndex = 0;

  while (attempts < keys.length * 2) {
    attempts++;
    const key = keys[keyIndex];
    keyIndex = (keyIndex + 1) % keys.length;

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://data-factory.app',
          'X-Title': 'LnkZooDataFactory',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (res.status === 429) {
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }

      if (res.status === 401 || res.status === 403) {
        continue;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error(`OpenRouter error ${res.status}: ${text.slice(0, 200)}`);
        continue;
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        const m = text.match(/\{[\s\S]*?"topic"[\s\S]*?"description"[\s\S]*?"tags"[\s\S]*?\}/);
        if (m) parsed = JSON.parse(m[0]);
        else continue;
      }

      if (parsed.topic && parsed.description && Array.isArray(parsed.tags)) {
        return Response.json({
          topic: parsed.topic,
          description: parsed.description,
          tags: parsed.tags,
        });
      }
    } catch (err) {
      console.error('OpenRouter fetch error:', err.message);
      continue;
    }
  }

  return Response.json({ error: 'All API keys exhausted or failed' }, { status: 502 });
}
