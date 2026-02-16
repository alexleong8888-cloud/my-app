import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return Response.json({ error: 'Member not found' }, { status: 404 });
  }

  return Response.json(data);
}