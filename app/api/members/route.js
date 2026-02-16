import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET — 获取所有会员
export async function GET() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — 新增会员
export async function POST(request) {
  const { name, phone, tier } = await request.json();

  if (!name || !phone || !tier) {
    return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
  }

  // 检查电话是否已存在
  const { data: existing } = await supabase
    .from('members')
    .select('id')
    .eq('phone', phone)
    .single();

  if (existing) {
    return NextResponse.json({ error: '此电话已注册' }, { status: 400 });
  }

  // 生成新 ID
  const { data: idResult } = await supabase.rpc('generate_member_id');
  const newId = idResult || 'LB001';

  const tierConfig = {
    'Black Gold': { topup: 6000, points: 6588 },
    'Platinum': { topup: 2000, points: 2288 },
  };

  const config = tierConfig[tier];
  if (!config) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });

  // 创建会员
  const { data: member, error: memberErr } = await supabase
    .from('members')
    .insert({
      id: newId,
      name,
      phone,
      tier,
      balance: config.topup,
      points: config.points,
    })
    .select()
    .single();

  if (memberErr) return NextResponse.json({ error: memberErr.message }, { status: 500 });

  // 记录初始充值
  await supabase.from('transactions').insert({
    member_id: newId,
    type: 'topup',
    amount: config.topup,
    note: 'Initial Top Up',
    categories: [],
  });

  return NextResponse.json(member);
}

// DELETE — 删除会员
export async function DELETE(request) {
  const { id } = await request.json();
  const { error } = await supabase.from('members').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}