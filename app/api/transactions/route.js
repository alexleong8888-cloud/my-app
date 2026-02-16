import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET — 获取交易记录
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get('memberId');

  let query = supabase
    .from('transactions')
    .select('*, members(name)')
    .order('created_at', { ascending: false });

  if (memberId) {
    query = query.eq('member_id', memberId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — 充值或扣款
export async function POST(request) {
  const { memberId, type, amount, note, categories } = await request.json();

  // 获取会员
  const { data: member, error: fetchErr } = await supabase
    .from('members')
    .select('*')
    .eq('id', memberId)
    .single();

  if (fetchErr || !member) {
    return NextResponse.json({ error: '找不到会员' }, { status: 404 });
  }

  let newBalance;

  if (type === 'topup') {
    newBalance = parseFloat(member.balance) + parseFloat(amount);
  } else if (type === 'spend') {
    if (parseFloat(amount) > parseFloat(member.balance)) {
      return NextResponse.json({ error: '余额不足' }, { status: 400 });
    }
    newBalance = parseFloat(member.balance) - parseFloat(amount);
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  // 更新余额
  const { error: updateErr } = await supabase
    .from('members')
    .update({ balance: newBalance })
    .eq('id', memberId);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // 记录交易
  const { data: tx, error: txErr } = await supabase
    .from('transactions')
    .insert({
      member_id: memberId,
      type,
      amount: parseFloat(amount),
      note: note || (type === 'topup' ? 'Top Up' : 'Spend'),
      categories: categories || [],
    })
    .select()
    .single();

  if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 });

  return NextResponse.json({ transaction: tx, newBalance });
}