import { getSupabase } from '../../../lib/supabase';

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('saved_links').select('*').order('saved_at', { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const map = {};
  for (const row of data) map[row.url] = { topic: row.topic, description: row.description, tags: row.tags, savedAt: row.saved_at };
  return Response.json(map);
}

export async function POST(request) {
  const { url, topic, description, tags, savedAt } = await request.json();
  if (!url) return Response.json({ error: 'url is required' }, { status: 400 });
  const supabase = getSupabase();
  const row = { url, topic: topic || '', description: description || '', tags: tags || [], saved_at: savedAt || new Date().toISOString() };
  const { error } = await supabase.from('saved_links').upsert(row, { onConflict: 'url' });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE() {
  const supabase = getSupabase();
  const { error } = await supabase.from('saved_links').delete().neq('url', '');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
