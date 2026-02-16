import { createClient } from '@supabase/supabase-js'
import CardUI from './CardUI'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function generateMetadata({ params }) {
  const { id } = await params
  const memberId = id.toUpperCase()

  const { data: member } = await supabase
    .from('members')
    .select('name, tier')
    .eq('member_id', memberId)
    .single()

  if (!member) return { title: 'LU BAR' }

  return {
    title: `${member.name} | LU BAR ${member.tier}`,
    description: `LU BAR ${member.tier} VIP Membership Card`,
    openGraph: {
      title: `LU BAR ${member.tier} Member`,
      description: `${member.name} 的专属会员卡`,
    },
  }
}

export default async function CardPage({ params }) {
  const { id } = await params
  const memberId = id.toUpperCase()

  // 1️⃣ 获取会员信息
  const { data: member, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', memberId)
    .single()

  if (!member || error) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, sans-serif',
        padding: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
        <h2 style={{ color: '#888', fontSize: '20px' }}>会员卡不存在</h2>
        <p style={{ fontSize: '14px', color: '#444', marginTop: '8px' }}>Card not found</p>
        <p style={{ fontSize: '12px', color: '#333', marginTop: '16px' }}>
          请联系 LU BAR 获取正确链接
        </p>
      </div>
    )
  }

  // 2️⃣ 获取交易记录
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(10)

  // 3️⃣ 获取等级配置
  let tierSettings = null
  try {
    const { data } = await supabase
      .from('tier_settings')
      .select('*')
      .eq('name', member.tier)
      .single()
    tierSettings = data
  } catch {
    // 没有 tier_settings 表就用默认
  }

  if (!tierSettings) {
    const defaults = {
      'Black Gold': { food_discount: 10, alcohol_discount: 10, free_parking: true },
      'Platinum': { food_discount: 5, alcohol_discount: 5, free_parking: false },
    }
    tierSettings = defaults[member.tier] || null
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  return (
    <CardUI
      member={member}
      transactions={transactions || []}
      tierSettings={tierSettings}
      baseUrl={baseUrl}
    />
  )
}