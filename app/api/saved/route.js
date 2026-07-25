import { getSupabase } from '../../../lib/supabase';

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('saved_links').select('*').order('saved_at', { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const map = {};
  for (const row of data) {
    const entry = { topic: row.topic, description: row.description, tags: row.tags, savedAt: row.saved_at };
    if (row.dead) entry.dead = true;
    if (row.flagged_at) entry.flaggedAt = row.flagged_at;
    map[row.url] = entry;
  }
  return Response.json(map);
}

export async function POST(request) {
  const body = await request.json();
  const { url, topic, description, tags, savedAt, dead, flaggedAt } = body;
  if (!url) return Response.json({ error: 'url is required' }, { status: 400 });
  const supabase = getSupabase();
  const row = {
    url,
    topic: topic || '',
    description: description || '',
    tags: tags || [],
    saved_at: savedAt || new Date().toISOString(),
  };
  if (dead !== undefined) row.dead = dead;
  if (flaggedAt) row.flagged_at = flaggedAt;
  const { error } = await supabase.from('saved_links').upsert(row, { onConflict: 'url' });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(request) {
  const supabase = getSupabase();
  const url = request.nextUrl?.searchParams?.get('url');
  if (url) {
    const { error } = await supabase.from('saved_links').delete().eq('url', url);
    if (error) return Response.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase.from('saved_links').delete().neq('url', '');
    if (error) return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}
