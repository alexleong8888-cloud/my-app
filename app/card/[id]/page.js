'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

var GOLD = '#c9a227';

export default function MemberCard() {
  var params = useParams();
  var [member, setMember] = useState(null);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState(false);

  useEffect(function () {
    fetch('/api/members/' + params.id)
      .then(function (r) {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(function (d) { setMember(d); setLoading(false); })
      .catch(function () { setError(true); setLoading(false); });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: GOLD + '33', borderTopColor: GOLD }}></div>
          <p className="text-gray-600 text-xs">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-white font-bold">Member Not Found</p>
          <p className="text-gray-600 text-xs mt-1">This card link is invalid.</p>
        </div>
      </div>
    );
  }

  var isBlackGold = member.tier === 'Black Gold';
  var tc = isBlackGold ? GOLD : '#a8a8a6';
  var bgGrad = isBlackGold
    ? 'linear-gradient(135deg, #1a1a0e 0%, #0d0d08 40%, #1a1508 100%)'
    : 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 40%, #1a1a1a 100%)';

  var tiers = {
    'Black Gold': { foodDisc: 10, alcDisc: 10, parking: true },
    'Platinum': { foodDisc: 5, alcDisc: 5, parking: false },
  };
  var tierInfo = tiers[member.tier] || tiers['Platinum'];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl overflow-hidden border shadow-2xl" style={{ background: bgGrad, borderColor: tc + '25' }}>
          <div className="h-1" style={{ background: 'linear-gradient(90deg, transparent, ' + tc + ', transparent)' }}></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, ' + tc + ', ' + tc + '88)' }}>
                  <span className="text-sm font-black text-black">LB</span>
                </div>
                <div>
                  <h1 className="text-sm font-black italic tracking-widest" style={{ color: tc }}>LU BAR</h1>
                  <p className="text-gray-700" style={{ fontSize: '8px', letterSpacing: '0.15em' }}>MEMBERSHIP CARD</p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full" style={{ background: tc + '15', border: '1px solid ' + tc + '30' }}>
                <span className="text-xs font-bold" style={{ color: tc }}>★ {member.tier}</span>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700" style={{ fontSize: '9px', letterSpacing: '0.2em' }}>MEMBER</p>
              <h2 className="text-2xl font-black text-white tracking-wide mt-0.5">{member.name}</h2>
              <p className="text-xs text-gray-600 mt-1 font-mono">{member.id}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl p-4 text-center" style={{ background: tc + '08', border: '1px solid ' + tc + '15' }}>
                <p className="text-gray-600" style={{ fontSize: '8px', letterSpacing: '0.2em' }}>BALANCE</p>
                <p className="text-xl font-black mt-1" style={{ color: tc }}>RM{parseFloat(member.balance).toFixed(2)}</p>
              </div>
              <div className="rounded-2xl p-4 text-center" style={{ background: tc + '08', border: '1px solid ' + tc + '15' }}>
                <p className="text-gray-600" style={{ fontSize: '8px', letterSpacing: '0.2em' }}>POINTS</p>
                <p className="text-xl font-black mt-1" style={{ color: tc }}>{member.points}</p>
              </div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: tc + '06', border: '1px solid ' + tc + '10' }}>
              <p className="text-gray-600 mb-3" style={{ fontSize: '8px', letterSpacing: '0.2em' }}>BENEFITS</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Food Discount</span>
                  <span className="text-xs font-bold text-white">{tierInfo.foodDisc}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Alcohol Discount</span>
                  <span className="text-xs font-bold text-white">{tierInfo.alcDisc}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Free Parking</span>
                  <span className="text-xs font-bold text-white">{tierInfo.parking ? 'Yes' : '-'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-1 mt-2" style={{ background: 'linear-gradient(90deg, transparent, ' + tc + '44, transparent)' }}></div>
        </div>
        <div className="text-center mt-6">
          <p className="text-gray-700" style={{ fontSize: '10px' }}>Present this card when visiting</p>
          <p className="text-xs font-bold mt-1" style={{ color: tc }}>LU BAR</p>
        </div>
      </div>
    </div>
  );
}