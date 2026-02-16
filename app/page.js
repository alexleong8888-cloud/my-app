'use client';
import { useState, useEffect, useCallback } from 'react';

const GOLD = '#c9a227';
const TIERS = {
  'Black Gold': { topup: 6000, points: 6588, foodDisc: 10, alcDisc: 10, parking: true },
  'Platinum': { topup: 2000, points: 2288, foodDisc: 5, alcDisc: 5, parking: false },
};
const CATEGORIES = ['Dining', 'Alcohol', 'Events', 'Dessert', 'Private Room', 'Other'];

export default function Home() {
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('dashboard');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [txFilter, setTxFilter] = useState('all');
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addTier, setAddTier] = useState('Platinum');
  const [topAmt, setTopAmt] = useState('');
  const [topNote, setTopNote] = useState('');
  const [pinStep, setPinStep] = useState(false);
  const [pinVal, setPinVal] = useState('');
  const [pinErr, setPinErr] = useState(false);
  const [spAmt, setSpAmt] = useState('');
  const [spCats, setSpCats] = useState([]);
  const [cpOld, setCpOld] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [cpErr, setCpErr] = useState('');

  var fetchMembers = useCallback(async function () {
    try {
      var res = await fetch('/api/members');
      var data = await res.json();
      if (Array.isArray(data)) setMembers(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  var fetchTransactions = useCallback(async function (memberId) {
    try {
      var url = memberId ? '/api/transactions?memberId=' + memberId : '/api/transactions';
      var res = await fetch(url);
      var data = await res.json();
      if (Array.isArray(data)) setTransactions(data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(function () {
    fetchMembers();
    fetchTransactions();
  }, [fetchMembers, fetchTransactions]);

  var flash = function (msg, ok) {
    if (ok === undefined) ok = true;
    setToast({ msg: msg, ok: ok });
    setTimeout(function () { setToast(null); }, 3000);
  };

  var closeModal = function () {
    setModal(null);
    setPinStep(false);
    setPinVal('');
    setPinErr(false);
  };

  var handleAdd = async function () {
    if (!addName.trim() || !addPhone.trim()) return flash('请填写姓名和电话', false);
    var res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: addName.trim(), phone: addPhone.trim(), tier: addTier }),
    });
    var data = await res.json();
    if (!res.ok) return flash(data.error, false);
    await fetchMembers();
    await fetchTransactions();
    setAddName(''); setAddPhone(''); setAddTier('Platinum');
    closeModal();
    flash('✅ ' + data.name + ' 注册成功！');
  };

  var topupGoPin = function () {
    if (!topAmt || parseFloat(topAmt) <= 0) return flash('请输入有效金额', false);
    setPinStep(true); setPinVal(''); setPinErr(false);
  };

  var topupConfirm = async function () {
    var pinRes = await fetch('/api/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pinVal }),
    });
    if (!pinRes.ok) { setPinErr(true); setPinVal(''); return; }
    var res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: selected.id, type: 'topup',
        amount: parseFloat(topAmt), note: topNote || 'Top Up', categories: [],
      }),
    });
    var data = await res.json();
    if (!res.ok) return flash(data.error, false);
    await fetchMembers(); await fetchTransactions();
    var updRes = await fetch('/api/members');
    var updData = await updRes.json();
    if (Array.isArray(updData)) {
      setMembers(updData);
      setSelected(updData.find(function (m) { return m.id === selected.id; }));
    }
    setTopAmt(''); setTopNote('');
    closeModal();
    flash('✅ 充值 RM' + parseFloat(topAmt).toFixed(2) + ' 成功');
  };

  var spendConfirm = async function () {
    if (!spAmt || parseFloat(spAmt) <= 0) return flash('请输入有效金额', false);
    if (spCats.length === 0) return flash('请选择至少一个消费类别', false);
    var res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: selected.id, type: 'spend',
        amount: parseFloat(spAmt), note: spCats.join(', '), categories: spCats,
      }),
    });
    var data = await res.json();
    if (!res.ok) return flash(data.error, false);
    await fetchMembers(); await fetchTransactions();
    var updRes = await fetch('/api/members');
    var updData = await updRes.json();
    if (Array.isArray(updData)) {
      setMembers(updData);
      setSelected(updData.find(function (m) { return m.id === selected.id; }));
    }
    setSpAmt(''); setSpCats([]);
    closeModal();
    flash('✅ 扣款 RM' + parseFloat(spAmt).toFixed(2) + ' 成功');
  };

  var handleDelete = async function () {
    var res = await fetch('/api/members', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id }),
    });
    if (!res.ok) return flash('删除失败', false);
    await fetchMembers();
    setSelected(null); setPage('members');
    closeModal();
    flash('已删除');
  };

  var handleChangePin = async function () {
    setCpErr('');
    if (cpNew.length !== 4) return setCpErr('新密码必须是4位数字');
    if (cpNew !== cpConfirm) return setCpErr('两次输入不一致');
    var res = await fetch('/api/pin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPin: cpOld, newPin: cpNew }),
    });
    var data = await res.json();
    if (!res.ok) return setCpErr(data.error);
    setCpOld(''); setCpNew(''); setCpConfirm('');
    closeModal();
    flash('✅ 密码修改成功！');
  };

  var toggleCat = function (c) {
    setSpCats(function (prev) {
      if (prev.includes(c)) return prev.filter(function (x) { return x !== c; });
      return prev.concat([c]);
    });
  };

  var totalBalance = members.reduce(function (s, m) { return s + parseFloat(m.balance || 0); }, 0);
  var totalTopup = transactions.filter(function (t) { return t.type === 'topup'; }).reduce(function (s, t) { return s + parseFloat(t.amount || 0); }, 0);
  var totalSpend = transactions.filter(function (t) { return t.type === 'spend'; }).reduce(function (s, t) { return s + parseFloat(t.amount || 0); }, 0);
  var bgCount = members.filter(function (m) { return m.tier === 'Black Gold'; }).length;
  var ptCount = members.filter(function (m) { return m.tier === 'Platinum'; }).length;
  var recentTx = transactions.slice(0, 5);

  var filtered = members.filter(function (m) {
    var s = search.toLowerCase();
    return (m.name || '').toLowerCase().includes(s) || (m.phone || '').includes(s) || (m.id || '').toLowerCase().includes(s);
  });

  var filteredTx = txFilter === 'all' ? transactions : transactions.filter(function (t) {
    return t.type === (txFilter === 'topup' ? 'topup' : 'spend');
  });

  var tierColor = function (tier) { return tier === 'Black Gold' ? GOLD : '#a8a8a6'; };
  var fmtBal = function (b) { return parseFloat(b).toLocaleString('en', { minimumFractionDigits: 2 }); 
  };

  var fmtBal = function (b) { return parseFloat(b).toLocaleString('en', { minimumFractionDigits: 2 }); };

var waLink = function (m) {
  if (!m) return '#';
  var bal = parseFloat(m.balance).toFixed(2);
  var cardUrl = window.location.origin + '/card/' + m.id;
  var msg = '◆ Welcome to LU BAR! ◆'
    + '\n\nID: ' + m.id
    + '\nName: ' + m.name
    + '\nTier: ' + m.tier
    + '\nBalance: RM' + bal
    + '\nPoints: ' + m.points
    + '\n\n🎴 Your Membership Card:'
    + '\n' + cardUrl
    + '\n\nThank you! ◆';
  return 'https://api.whatsapp.com/send/?phone=' + m.phone.replace(/[^0-9]/g, '') + '&text=' + encodeURIComponent(msg);
};

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading LU BAR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200">

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className={'px-6 py-3 rounded-xl text-sm font-bold shadow-2xl ' + (toast.ok ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200')}>
            {toast.msg}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-black/90 backdrop-blur border-b border-gray-900 px-4 py-3 flex items-center justify-between">
        {page === 'detail' ? (
          <button onClick={function () { setPage('members'); setSelected(null); fetchTransactions(); }} className="text-yellow-600 text-sm font-semibold">← 返回</button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-600 to-yellow-900 flex items-center justify-center">
              <span className="text-xs font-black text-black">LB</span>
            </div>
            <div>
              <h1 className="text-sm font-black text-yellow-600 italic tracking-wider">LU BAR</h1>
              <p className="text-[9px] text-gray-600 tracking-widest">ADMIN PANEL</p>
            </div>
          </div>
        )}
        <button onClick={function () { setAddName(''); setAddPhone(''); setAddTier('Platinum'); setModal('add'); }}
          className="w-8 h-8 rounded-lg bg-yellow-600 flex items-center justify-center text-black font-bold text-lg">+</button>
      </header>

      {page !== 'detail' && (
        <div className="flex border-b border-gray-900 px-2 bg-gray-950">
          {[
            { key: 'dashboard', icon: '📊', text: 'Dashboard' },
            { key: 'members', icon: '👥', text: '会员' },
            { key: 'transactions', icon: '📋', text: '交易' },
            { key: 'settings', icon: '⚙️', text: '设置' }
          ].map(function (n) {
            return (
              <button key={n.key} onClick={function () { setPage(n.key); if (n.key !== 'detail') fetchTransactions(); }}
                className={'flex-1 px-2 py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1 ' + (page === n.key ? 'border-yellow-600 text-yellow-600' : 'border-transparent text-gray-600')}>
                <span className="text-xs">{n.icon}</span> {n.text}
              </button>
            );
          })}
        </div>
      )}

      <div className="max-w-lg mx-auto p-4 pb-20">

        {page === 'dashboard' && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="w-9 h-9 rounded-xl bg-yellow-900/30 flex items-center justify-center mb-3">
                  <span className="text-lg">👥</span>
                </div>
                <p className="text-2xl font-black text-white">{members.length}</p>
                <p className="text-xs text-gray-500">总会员</p>
                <p className="text-[10px] text-gray-600 mt-1">Black Gold {bgCount} · Platinum {ptCount}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="w-9 h-9 rounded-xl bg-yellow-900/30 flex items-center justify-center mb-3">
                  <span className="text-lg">💰</span>
                </div>
                <p className="text-xl font-black text-white">RM{fmtBal(totalBalance)}</p>
                <p className="text-xs text-gray-500">总余额</p>
                <p className="text-[10px] text-gray-600 mt-1">{transactions.length} 笔交易</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="w-9 h-9 rounded-xl bg-green-900/30 flex items-center justify-center mb-3">
                  <span className="text-lg">📈</span>
                </div>
                <p className="text-xl font-black text-white">RM{totalTopup.toLocaleString('en')}</p>
                <p className="text-xs text-gray-500">总充值</p>
                <p className="text-[10px] text-gray-600 mt-1">Total Top Up</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="w-9 h-9 rounded-xl bg-orange-900/30 flex items-center justify-center mb-3">
                  <span className="text-lg">⬇️</span>
                </div>
                <p className="text-xl font-black text-white">RM{totalSpend.toLocaleString('en')}</p>
                <p className="text-xs text-gray-500">总消费</p>
                <p className="text-[10px] text-gray-600 mt-1">Total Spending</p>
              </div>
            </div>

            <p className="text-[10px] font-bold text-gray-500 tracking-widest mb-3 flex items-center gap-2">
              <span>👑</span> 会员等级
            </p>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ background: GOLD }}></div>
                <span className="text-sm font-bold flex-1">Black Gold</span>
                <span className="text-sm font-bold mr-3" style={{ color: GOLD }}>{bgCount}</span>
                <div className="w-24 h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: (members.length ? (bgCount / members.length * 100) : 0) + '%', background: GOLD }}></div>
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">{members.length ? Math.round(bgCount / members.length * 100) : 0}%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-sm font-bold flex-1">Platinum</span>
                <span className="text-sm font-bold mr-3 text-gray-400">{ptCount}</span>
                <div className="w-24 h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gray-500" style={{ width: (members.length ? (ptCount / members.length * 100) : 0) + '%' }}></div>
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">{members.length ? Math.round(ptCount / members.length * 100) : 0}%</span>
              </div>
            </div>

            <p className="text-[10px] font-bold text-gray-500 tracking-widest mb-3 flex items-center gap-2">
              <span>🕐</span> 最近交易
            </p>
            <div className="space-y-2">
              {recentTx.map(function (t) {
                return (
                  <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center gap-3">
                    <div className={'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ' + (t.type === 'topup' ? 'bg-green-900/30' : 'bg-red-900/30')}>
                      <span className="text-sm">{t.type === 'topup' ? '⬆️' : '⬇️'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{(t.members && t.members.name) || t.member_id}</p>
                      <p className="text-xs text-gray-600 truncate">{t.note} · {new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={'text-sm font-bold flex-shrink-0 ' + (t.type === 'topup' ? 'text-green-400' : 'text-red-400')}>
                      {t.type === 'topup' ? '+' : '-'}RM{parseFloat(t.amount).toFixed(2)}
                    </span>
                  </div>
                );
              })}
              {recentTx.length === 0 && <p className="text-center text-gray-700 py-8">暂无记录</p>}
            </div>
          </div>
        )}

        {page === 'members' && (
          <div>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">🔍</span>
              <input type="text" placeholder="搜索姓名 / 电话 / ID..." value={search}
                onChange={function (e) { setSearch(e.target.value); }}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-yellow-800" />
            </div>
            <p className="text-xs text-yellow-600 font-bold mb-3">{filtered.length} 位会员</p>
            <div className="space-y-2">
              {filtered.map(function (m) {
                return (
                  <button key={m.id} onClick={function () { setSelected(m); setPage('detail'); fetchTransactions(m.id); }}
                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-3 text-left hover:border-gray-700 transition">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-black font-black text-lg flex-shrink-0"
                      style={{ background: tierColor(m.tier) }}>
                      {(m.name || '?').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm">{m.name}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: tierColor(m.tier) + '22', color: tierColor(m.tier), border: '1px solid ' + tierColor(m.tier) + '44' }}>
                          {m.tier}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{m.id} · {m.phone}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-sm" style={{ color: tierColor(m.tier) }}>RM{fmtBal(m.balance)}</p>
                      <p className="text-[10px] text-gray-600">{m.points} pts</p>
                    </div>
                    <span className="text-gray-700 text-lg">›</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {page === 'transactions' && (
          <div>
            <div className="flex gap-2 mb-4">
              {[{ key: 'all', text: '全部' }, { key: 'topup', text: '充值' }, { key: 'spend', text: '消费' }].map(function (f) {
                return (
                  <button key={f.key} onClick={function () { setTxFilter(f.key); }}
                    className={'px-4 py-2 rounded-full text-xs font-bold border transition ' + (txFilter === f.key ? 'bg-white/10 border-gray-600 text-white' : 'border-gray-800 text-gray-600')}>
                    {f.text}
                  </button>
                );
              })}
            </div>
            <div className="space-y-2">
              {filteredTx.map(function (t) {
                return (
                  <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center gap-3">
                    <div className={'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ' + (t.type === 'topup' ? 'bg-green-900/30' : 'bg-red-900/30')}>
                      <span className="text-sm">{t.type === 'topup' ? '⬆️' : '⬇️'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold">{(t.members && t.members.name) || t.member_id}</p>
                        <span className="text-[10px] text-gray-600">{t.member_id}</span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{t.note} · {new Date(t.created_at).toLocaleString()}</p>
                    </div>
                    <span className={'text-sm font-bold flex-shrink-0 ' + (t.type === 'topup' ? 'text-green-400' : 'text-red-400')}>
                      {t.type === 'topup' ? '+' : '-'}RM{parseFloat(t.amount).toFixed(2)}
                    </span>
                  </div>
                );
              })}
              {filteredTx.length === 0 && <p className="text-center text-gray-700 py-10">暂无记录</p>}
            </div>
          </div>
        )}

        {page === 'settings' && (
          <div>
            <p className="text-[10px] font-bold text-gray-500 tracking-widest mb-3 flex items-center gap-2">
              <span>👑</span> 会员配套
            </p>
            {['Black Gold', 'Platinum'].map(function (t) {
              return (
                <div key={t} className="bg-gray-900 border rounded-2xl p-4 mb-3"
                  style={{ borderColor: tierColor(t) + '33' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: tierColor(t) }}></div>
                    <p className="font-black text-sm" style={{ color: tierColor(t) }}>{t}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-black/50 rounded-lg p-3"><p className="text-gray-600 text-[10px]">Top Up</p><p className="font-bold text-white mt-1">RM {TIERS[t].topup.toLocaleString()}</p></div>
                    <div className="bg-black/50 rounded-lg p-3"><p className="text-gray-600 text-[10px]">积分</p><p className="font-bold text-white mt-1">{TIERS[t].points.toLocaleString()}</p></div>
                    <div className="bg-black/50 rounded-lg p-3"><p className="text-gray-600 text-[10px]">Food 折扣</p><p className="font-bold text-white mt-1">{TIERS[t].foodDisc}%</p></div>
                    <div className="bg-black/50 rounded-lg p-3"><p className="text-gray-600 text-[10px]">Alcohol 折扣</p><p className="font-bold text-white mt-1">{TIERS[t].alcDisc}%</p></div>
                  </div>
                  {TIERS[t].parking && (
                    <div className="mt-2 p-2.5 rounded-lg text-xs font-bold text-center" style={{ background: GOLD + '12', color: GOLD }}>🅿️ Free Parking ✓</div>
                  )}
                </div>
              );
            })}

            <p className="text-[10px] font-bold text-gray-500 tracking-widest mb-3 mt-6 flex items-center gap-2">
              <span>🔐</span> ADMIN 密码管理
            </p>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-900/20 flex items-center justify-center">
                  <span className="text-lg">🔒</span>
                </div>
                <div>
                  <p className="text-sm font-bold">充值验证密码</p>
                  <p className="text-xs text-gray-600">充值时需输入 4 位 PIN</p>
                </div>
              </div>
              <button onClick={function () { setCpOld(''); setCpNew(''); setCpConfirm(''); setCpErr(''); setModal('changePin'); }}
                className="px-4 py-2 rounded-lg text-xs font-bold" style={{ background: GOLD, color: '#000' }}>🔑 修改密码</button>
            </div>
          </div>
        )}

        {page === 'detail' && selected && (
          <div>
            <div className="rounded-2xl p-5 mb-4" style={{ background: '#111', border: '1px solid ' + tierColor(selected.tier) + '33' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-black font-black text-xl"
                  style={{ background: tierColor(selected.tier) }}>
                  {(selected.name || '?').charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">{selected.name}</h2>
                  <p className="text-xs text-gray-600">{selected.id} · {selected.phone}</p>
                </div>
                <span className="ml-auto text-[10px] font-bold px-3 py-1 rounded-full"
                  style={{ background: tierColor(selected.tier) + '22', color: tierColor(selected.tier), border: '1px solid ' + tierColor(selected.tier) + '44' }}>
                  {selected.tier}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-[9px] text-gray-500">BALANCE</p>
                  <p className="text-sm font-black" style={{ color: tierColor(selected.tier) }}>RM{fmtBal(selected.balance)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-[9px] text-gray-500">POINTS</p>
                  <p className="text-sm font-black" style={{ color: tierColor(selected.tier) }}>{(selected.points || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-[9px] text-gray-500">JOINED</p>
                  <p className="text-sm font-black text-gray-500">{selected.join_date}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-5">
              <button onClick={function () { setTopAmt(''); setTopNote(''); setPinStep(false); setModal('topup'); }}
                className="bg-green-900/20 border border-green-800/30 rounded-xl py-3 flex flex-col items-center gap-1">
                <span className="text-green-400 text-lg">↑</span>
                <span className="text-[10px] text-gray-500 font-bold">充值</span>
              </button>
              <button onClick={function () { setSpAmt(''); setSpCats([]); setModal('spend'); }}
                className="bg-orange-900/20 border border-orange-800/30 rounded-xl py-3 flex flex-col items-center gap-1">
                <span className="text-orange-400 text-lg">↓</span>
                <span className="text-[10px] text-gray-500 font-bold">扣款</span>
              </button>
              <a href={waLink(selected)} target="_blank" rel="noopener noreferrer"
                className="bg-green-900/20 border border-green-800/30 rounded-xl py-3 flex flex-col items-center gap-1 no-underline">
                <span className="text-lg">📱</span>
                <span className="text-[10px] text-gray-500 font-bold">WhatsApp</span>
              </a>
              <button onClick={function () { setModal('delete'); }}
                className="bg-gray-900 border border-gray-800 rounded-xl py-3 flex flex-col items-center gap-1">
                <span className="text-gray-500 text-lg">🗑</span>
                <span className="text-[10px] text-gray-500 font-bold">删除</span>
              </button>
            </div>

            <p className="text-[10px] font-bold text-gray-600 tracking-widest mb-3">BENEFITS</p>
            <div className="space-y-2 mb-5">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex justify-between items-center">
                <span className="text-sm">🍽 Food Discount</span>
                <span className="font-bold text-sm" style={{ color: tierColor(selected.tier) }}>{TIERS[selected.tier] && TIERS[selected.tier].foodDisc}% OFF</span>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex justify-between items-center">
                <span className="text-sm">🍷 Alcohol Discount</span>
                <span className="font-bold text-sm" style={{ color: tierColor(selected.tier) }}>{TIERS[selected.tier] && TIERS[selected.tier].alcDisc}% OFF</span>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex justify-between items-center">
                <span className="text-sm">🅿️ Free Parking</span>
                <span className="font-bold text-sm" style={{ color: tierColor(selected.tier) }}>{TIERS[selected.tier] && TIERS[selected.tier].parking ? '✓ VIP' : '—'}</span>
              </div>
            </div>

            <p className="text-[10px] font-bold text-gray-600 tracking-widest mb-3">交易记录</p>
            <div className="space-y-2">
              {transactions.map(function (t) {
                return (
                  <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center gap-3">
                    <div className={'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ' + (t.type === 'topup' ? 'bg-green-900/30' : 'bg-red-900/30')}>
                      <span>{t.type === 'topup' ? '↑' : '↓'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{t.note}</p>
                      <p className="text-xs text-gray-600">{new Date(t.created_at).toLocaleString()}</p>
                    </div>
                    <span className={'text-sm font-bold ' + (t.type === 'topup' ? 'text-green-400' : 'text-red-400')}>
                      {t.type === 'topup' ? '+' : '-'}RM{parseFloat(t.amount).toFixed(2)}
                    </span>
                  </div>
                );
              })}
              {transactions.length === 0 && <p className="text-center text-gray-700 py-10">暂无记录</p>}
            </div>
          </div>
        )}
      </div>

      {modal === 'add' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/85"></div>
          <div className="relative w-full max-w-md bg-gray-950 rounded-3xl border border-gray-800 p-6 max-h-[90vh] overflow-auto" onClick={function (e) { e.stopPropagation(); }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-black" style={{ color: GOLD }}>新增会员</h3>
              <button onClick={closeModal} className="text-gray-600 text-xl">✕</button>
            </div>
            <label className="block text-[10px] font-bold text-gray-500 tracking-widest mb-1">姓名 *</label>
            <input type="text" value={addName} onChange={function (e) { setAddName(e.target.value); }} placeholder="会员姓名"
              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm text-white mb-4 outline-none focus:border-yellow-800" />
            <label className="block text-[10px] font-bold text-gray-500 tracking-widest mb-1">电话号码 *</label>
            <input type="tel" value={addPhone} onChange={function (e) { setAddPhone(e.target.value); }} placeholder="60123456789"
              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm text-white mb-4 outline-none focus:border-yellow-800" />
            <label className="block text-[10px] font-bold text-gray-500 tracking-widest mb-1">会员等级 *</label>
            <div className="flex gap-2 mb-4">
              {['Platinum', 'Black Gold'].map(function (t) {
                return (
                  <button key={t} onClick={function () { setAddTier(t); }}
                    className="flex-1 p-3 rounded-xl text-center border-2 transition"
                    style={{ borderColor: addTier === t ? tierColor(t) : '#222', background: addTier === t ? tierColor(t) + '12' : 'transparent' }}>
                    <p className="font-black text-sm" style={{ color: tierColor(t) }}>{t}</p>
                    <p className="text-[10px] text-gray-500">RM{TIERS[t].topup.toLocaleString()} → {TIERS[t].points} pts</p>
                  </button>
                );
              })}
            </div>
            <div className="bg-gray-900 rounded-xl p-3 text-xs text-gray-500 mb-5">
              ℹ️ 注册后自动充值 <strong style={{ color: tierColor(addTier) }}>RM{TIERS[addTier].topup.toLocaleString()}</strong> 获得 <strong style={{ color: tierColor(addTier) }}>{TIERS[addTier].points}</strong> 积分
            </div>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-3 rounded-xl border border-gray-800 text-gray-500 font-bold text-sm">取消</button>
              <button onClick={handleAdd} className="flex-1 py-3 rounded-xl font-bold text-sm text-black" style={{ background: GOLD }}>✓ 确认注册</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'topup' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/85"></div>
          <div className="relative w-full max-w-md bg-gray-950 rounded-3xl border border-gray-800 p-6 max-h-[90vh] overflow-auto" onClick={function (e) { e.stopPropagation(); }}>
            {!pinStep ? (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-lg font-black text-green-400">充值 Top Up</h3>
                  <button onClick={closeModal} className="text-gray-600 text-xl">✕</button>
                </div>
                <p className="text-xs text-gray-600 mb-5">{selected.name} · 余额 RM{fmtBal(selected.balance)}</p>
                <label className="block text-[10px] font-bold text-gray-500 tracking-widest mb-1">充值金额 (RM)</label>
                <input type="number" value={topAmt} onChange={function (e) { setTopAmt(e.target.value); }} placeholder="0.00"
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-4 text-2xl font-black text-white text-center mb-3 outline-none focus:border-green-800" />
                <div className="flex gap-2 flex-wrap mb-4">
                  {[100, 200, 500, 1000, 2000, 6000].map(function (v) {
                    return (
                      <button key={v} onClick={function () { setTopAmt(String(v)); }}
                        className="px-3 py-2 rounded-lg text-xs font-bold border transition"
                        style={{ borderColor: topAmt === String(v) ? '#34d399' : '#222', background: topAmt === String(v) ? '#34d39918' : 'transparent', color: topAmt === String(v) ? '#34d399' : '#666' }}>
                        {v >= 1000 ? (v / 1000) + 'k' : v}
                      </button>
                    );
                  })}
                </div>
                <label className="block text-[10px] font-bold text-gray-500 tracking-widest mb-1">备注</label>
                <input type="text" value={topNote} onChange={function (e) { setTopNote(e.target.value); }} placeholder="Top Up / Bonus…"
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm text-white mb-5 outline-none" />
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-3 rounded-xl border border-gray-800 text-gray-500 font-bold text-sm">取消</button>
                  <button onClick={topupGoPin} className="flex-1 py-3 rounded-xl bg-green-600 text-black font-bold text-sm">🔒 下一步</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-lg font-black" style={{ color: GOLD }}>验证 Admin 密码</h3>
                  <button onClick={function () { setPinStep(false); setPinErr(false); }} className="text-gray-600 text-sm">← 返回</button>
                </div>
                <p className="text-xs text-gray-600 mb-8">充值 <strong className="text-green-400">RM{parseFloat(topAmt).toFixed(2)}</strong> → {selected.name}</p>
                <div className="text-center mb-8">
                  <p className="text-sm text-gray-500 mb-5">请输入 4 位 Admin PIN</p>
                  <div className="flex gap-3 justify-center mb-5">
                    {[0, 1, 2, 3].map(function (i) {
                      return <div key={i} className="w-4 h-4 rounded-full border-2" style={{ borderColor: pinErr ? '#ef4444' : '#333', background: i < pinVal.length ? (pinErr ? '#ef4444' : GOLD) : 'transparent' }}></div>;
                    })}
                  </div>
                  <input type="password" maxLength={4} value={pinVal} autoFocus
                    onChange={function (e) { setPinVal(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinErr(false); }}
                    className="w-40 mx-auto block bg-black border border-gray-800 rounded-xl px-4 py-3 text-xl font-black text-white text-center tracking-widest outline-none"
                    placeholder="····" />
                  {pinErr && <p className="text-xs text-red-500 font-bold mt-4">❌ 密码不正确</p>}
                </div>
                <div className="flex gap-3">
                  <button onClick={function () { setPinStep(false); }} className="flex-1 py-3 rounded-xl border border-gray-800 text-gray-500 font-bold text-sm">返回</button>
                  <button onClick={topupConfirm} disabled={pinVal.length < 4}
                    className={'flex-1 py-3 rounded-xl font-bold text-sm ' + (pinVal.length === 4 ? 'bg-green-600 text-black' : 'bg-gray-800 text-gray-600')}>✓ 确认充值</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {modal === 'spend' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/85"></div>
          <div className="relative w-full max-w-md bg-gray-950 rounded-3xl border border-gray-800 p-6 max-h-[90vh] overflow-auto" onClick={function (e) { e.stopPropagation(); }}>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-lg font-black text-orange-400">扣款 Deduct</h3>
              <button onClick={closeModal} className="text-gray-600 text-xl">✕</button>
            </div>
            <p className="text-xs text-gray-600 mb-5">{selected.name} · 余额 RM{fmtBal(selected.balance)}</p>
            <label className="block text-[10px] font-bold text-gray-500 tracking-widest mb-1">扣款金额 (RM)</label>
            <input type="number" value={spAmt} onChange={function (e) { setSpAmt(e.target.value); }} placeholder="0.00"
              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-4 text-2xl font-black text-white text-center mb-4 outline-none focus:border-orange-800" />
            <label className="block text-[10px] font-bold text-gray-500 tracking-widest mb-2">消费类别（可多选）*</label>
            <div className="flex gap-2 flex-wrap mb-4">
              {CATEGORIES.map(function (c) {
                var on = spCats.includes(c);
                return (
                  <button key={c} onClick={function () { toggleCat(c); }}
                    className="px-4 py-2 rounded-lg text-sm font-bold border transition"
                    style={{ borderColor: on ? '#fb923c' : '#222', background: on ? '#fb923c18' : 'transparent', color: on ? '#fb923c' : '#666' }}>
                    {on ? '✓ ' : ''}{c}
                  </button>
                );
              })}
            </div>
            {spCats.length > 0 && <p className="text-xs text-orange-400 font-semibold mb-4">已选: {spCats.join(', ')}</p>}
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-3 rounded-xl border border-gray-800 text-gray-500 font-bold text-sm">取消</button>
              <button onClick={spendConfirm} className="flex-1 py-3 rounded-xl bg-orange-500 text-black font-bold text-sm">↓ 确认扣款</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'delete' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/85"></div>
          <div className="relative w-full max-w-md bg-gray-950 rounded-3xl border border-gray-800 p-6 text-center" onClick={function (e) { e.stopPropagation(); }}>
            <div className="w-14 h-14 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-black mb-2">确认删除？</h3>
            <p className="text-sm text-gray-500 mb-1">将永久删除 <strong className="text-white">{selected.name}</strong></p>
            <p className="text-xs text-red-400 mb-6">余额 RM{fmtBal(selected.balance)} · {selected.points} 积分</p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-3 rounded-xl border border-gray-800 text-gray-500 font-bold text-sm">取消</button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm">🗑 确认删除</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'changePin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/85"></div>
          <div className="relative w-full max-w-md bg-gray-950 rounded-3xl border border-gray-800 p-6" onClick={function (e) { e.stopPropagation(); }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-black" style={{ color: GOLD }}>修改 Admin 密码</h3>
              <button onClick={closeModal} className="text-gray-600 text-xl">✕</button>
            </div>
            <label className="block text-[10px] font-bold text-gray-500 tracking-widest mb-1">旧密码</label>
            <input type="password" maxLength={4} value={cpOld}
              onChange={function (e) { setCpOld(e.target.value.replace(/\D/g, '').slice(0, 4)); }}
              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-xl font-black text-white text-center tracking-widest mb-4 outline-none" placeholder="····" />
            <label className="block text-[10px] font-bold text-gray-500 tracking-widest mb-1">新密码（4位数字）</label>
            <input type="password" maxLength={4} value={cpNew}
              onChange={function (e) { setCpNew(e.target.value.replace(/\D/g, '').slice(0, 4)); }}
              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-xl font-black text-white text-center tracking-widest mb-4 outline-none" placeholder="····" />
            <label className="block text-[10px] font-bold text-gray-500 tracking-widest mb-1">确认新密码</label>
            <input type="password" maxLength={4} value={cpConfirm}
              onChange={function (e) { setCpConfirm(e.target.value.replace(/\D/g, '').slice(0, 4)); }}
              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-xl font-black text-white text-center tracking-widest mb-5 outline-none" placeholder="····" />
            {cpErr && <p className="text-xs text-red-500 font-bold text-center mb-4">❌ {cpErr}</p>}
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-3 rounded-xl border border-gray-800 text-gray-500 font-bold text-sm">取消</button>
              <button onClick={handleChangePin} className="flex-1 py-3 rounded-xl font-bold text-sm text-black" style={{ background: GOLD }}>🔑 确认修改</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}