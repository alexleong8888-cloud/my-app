'use client'

import { QRCodeSVG } from 'qrcode.react'

interface MemberData {
  member_id: string
  name: string
  phone: string
  tier: string
  balance: number
  points: number
}

interface TransactionData {
  id: string
  amount: number
  type: string
  categories?: string
  description?: string
  created_at: string
}

interface TierData {
  food_discount: number
  alcohol_discount: number
  free_parking: boolean
}

export default function CardUI({
  member,
  transactions,
  tierSettings,
  baseUrl,
}: {
  member: MemberData
  transactions: TransactionData[]
  tierSettings: TierData | null
  baseUrl: string
}) {
  const isGold = member.tier === 'Black Gold'
  const accent = isGold ? '#c8a84e' : '#9ca3af'
  const accentDim = isGold ? 'rgba(200,168,78,0.15)' : 'rgba(156,163,175,0.15)'
  const accentBorder = isGold ? 'rgba(200,168,78,0.25)' : 'rgba(156,163,175,0.25)'

  const cardBg = isGold
    ? 'linear-gradient(145deg, #1c1608 0%, #2a1f0a 40%, #1a150a 70%, #0d0a03 100%)'
    : 'linear-gradient(145deg, #111827 0%, #1e2333 40%, #151b2b 70%, #0a0e1a 100%)'

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#000',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      paddingBottom: '60px',
      overflowX: 'hidden',
    }}>
      {/* ===== 动画样式 ===== */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-1 { animation: fadeUp 0.6s ease-out both; }
        .fade-2 { animation: fadeUp 0.6s ease-out 0.15s both; }
        .fade-3 { animation: fadeUp 0.6s ease-out 0.3s both; }
        .fade-4 { animation: fadeUp 0.6s ease-out 0.45s both; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
      `}</style>

      {/* ===== HEADER ===== */}
      <div className="fade-1" style={{
        padding: '20px 20px 12px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: accent,
          letterSpacing: '8px',
        }}>LU BAR</h1>
        <p style={{
          fontSize: '9px',
          color: '#444',
          letterSpacing: '4px',
          marginTop: '4px',
        }}>MEMBERSHIP CARD</p>
      </div>

      {/* ===== 会员卡 ===== */}
      <div className="fade-1" style={{ padding: '0 20px', marginTop: '4px' }}>
        <div style={{
          background: cardBg,
          borderRadius: '20px',
          padding: '28px 24px',
          border: `1px solid ${accentBorder}`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 8px 40px ${accentDim}`,
        }}>
          {/* 闪光效果 */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: `linear-gradient(90deg, transparent, ${accent}08, transparent)`,
            animation: 'shimmer 4s ease-in-out infinite',
            pointerEvents: 'none',
          }} />

          {/* 装饰圆圈 */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-30px',
            width: '140px', height: '140px', borderRadius: '50%',
            border: `1px solid ${accent}12`,
          }} />
          <div style={{
            position: 'absolute', bottom: '-50px', left: '-20px',
            width: '120px', height: '120px', borderRadius: '50%',
            border: `1px solid ${accent}08`,
          }} />

          {/* 等级标签 */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: `${accent}15`,
            border: `1px solid ${accent}35`,
            borderRadius: '20px',
            padding: '5px 14px',
            fontSize: '11px',
            color: accent,
            fontWeight: '600',
            letterSpacing: '2px',
          }}>
            {isGold ? '★' : '◆'} {member.tier.toUpperCase()}
          </div>

          {/* 会员名 */}
          <h2 style={{
            fontSize: '26px',
            fontWeight: '600',
            marginTop: '20px',
            color: '#fff',
            position: 'relative',
          }}>{member.name}</h2>

          {/* 会员 ID */}
          <p style={{
            fontSize: '15px',
            color: '#777',
            marginTop: '6px',
            letterSpacing: '4px',
            fontFamily: '"SF Mono", "Fira Code", monospace',
          }}>{member.member_id}</p>

          {/* QR Code */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '28px',
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}>
              <QRCodeSVG
                value={`${baseUrl}/card/${member.member_id}`}
                size={130}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </div>
          <p style={{
            textAlign: 'center',
            fontSize: '10px',
            color: '#555',
            marginTop: '10px',
            letterSpacing: '2px',
          }}>SCAN TO VERIFY</p>
        </div>
      </div>

      {/* ===== 余额 & 积分 ===== */}
      <div className="fade-2" style={{
        padding: '16px 20px 0',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>
        <div style={{
          background: '#0a0a0a',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #1a1a1a',
        }}>
          <p style={{ fontSize: '10px', color: '#555', letterSpacing: '2px' }}>BALANCE 余额</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#fff', marginTop: '8px' }}>
            <span style={{ fontSize: '13px', color: '#666', marginRight: '2px' }}>RM</span>
            {member.balance.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div style={{
          background: '#0a0a0a',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #1a1a1a',
        }}>
          <p style={{ fontSize: '10px', color: '#555', letterSpacing: '2px' }}>POINTS 积分</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: accent, marginTop: '8px' }}>
            {member.points.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ===== 会员优惠 ===== */}
      {tierSettings && (
        <div className="fade-3" style={{ padding: '16px 20px 0' }}>
          <p style={{
            fontSize: '10px', color: '#444', letterSpacing: '3px', marginBottom: '10px',
          }}>BENEFITS 会员优惠</p>
          <div style={{
            background: '#0a0a0a',
            borderRadius: '16px',
            padding: '20px',
            border: `1px solid ${accentBorder}`,
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              <div>
                <p style={{ fontSize: '11px', color: '#555' }}>Food 折扣</p>
                <p style={{ fontSize: '22px', fontWeight: '700', color: accent, marginTop: '4px' }}>
                  {tierSettings.food_discount}%
                </p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#555' }}>Alcohol 折扣</p>
                <p style={{ fontSize: '22px', fontWeight: '700', color: accent, marginTop: '4px' }}>
                  {tierSettings.alcohol_discount}%
                </p>
              </div>
            </div>
            {tierSettings.free_parking && (
              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #1a1a1a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span>🅿️</span>
                <span style={{ color: '#4ade80', fontSize: '14px', fontWeight: '500' }}>
                  Free Parking
                </span>
                <span style={{ color: '#4ade80', marginLeft: 'auto' }}>✓</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== 最近交易 ===== */}
      <div className="fade-4" style={{ padding: '16px 20px 0' }}>
        <p style={{
          fontSize: '10px', color: '#444', letterSpacing: '3px', marginBottom: '10px',
        }}>TRANSACTIONS 最近交易</p>

        {transactions.length === 0 ? (
          <div style={{
            background: '#0a0a0a',
            borderRadius: '16px',
            padding: '40px',
            border: '1px solid #1a1a1a',
            textAlign: 'center',
          }}>
            <p style={{ color: '#333', fontSize: '14px' }}>暂无交易记录</p>
          </div>
        ) : (
          transactions.map((tx) => {
            const isTopUp = tx.type === 'top_up'
            return (
              <div key={tx.id} style={{
                background: '#0a0a0a',
                borderRadius: '14px',
                padding: '14px 16px',
                marginBottom: '8px',
                border: '1px solid #141414',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* 图标 */}
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: isTopUp ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${isTopUp ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', color: isTopUp ? '#4ade80' : '#ef4444',
                  }}>
                    {isTopUp ? '↑' : '↓'}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#ccc' }}>
                      {isTopUp ? '充值 Top Up' : (tx.categories || tx.description || '消费')}
                    </p>
                    <p style={{ fontSize: '11px', color: '#444', marginTop: '3px' }}>
                      {new Date(tx.created_at).toLocaleDateString('en-MY', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <span style={{
                  fontSize: '15px', fontWeight: '600',
                  color: isTopUp ? '#4ade80' : '#ef4444',
                  fontFamily: '"SF Mono", monospace',
                }}>
                  {isTopUp ? '+' : '-'}RM{Math.abs(tx.amount).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* ===== Footer ===== */}
      <div style={{ padding: '40px 20px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', color: '#222', letterSpacing: '3px' }}>
          POWERED BY LU BAR
        </p>
      </div>
    </div>
  )
}