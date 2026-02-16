import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// POST — 验证 PIN
export async function POST(request) {
  const { pin } = await request.json();

  const { data } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'pin')
    .single();

  if (data && data.value === pin) {
    return NextResponse.json({ valid: true });
  }
  return NextResponse.json({ valid: false }, { status: 401 });
}

// PUT — 修改 PIN
export async function PUT(request) {
  const { oldPin, newPin } = await request.json();

  const { data } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'pin')
    .single();

  if (!data || data.value !== oldPin) {
    return NextResponse.json({ error: '旧密码不正确' }, { status: 401 });
  }

  if (!/^\d{4}$/.test(newPin)) {
    return NextResponse.json({ error: '新密码必须是4位数字' }, { status: 400 });
  }

  const { error } = await supabase
    .from('admin_settings')
    .update({ value: newPin })
    .eq('key', 'pin');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}