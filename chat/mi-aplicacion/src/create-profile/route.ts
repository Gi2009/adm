// app/api/create-profile/route.ts
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  const body = await req.json();
  const { id, email, full_name } = body;
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

  const supabase = getServiceSupabase();
  const { error } = await supabase.from('user_profiles').upsert({ id, email, full_name });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
