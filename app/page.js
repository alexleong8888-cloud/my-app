'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['Dining', 'Alcohol', 'Events', 'Dessert', 'Private Room', 'Other'];

export default function Home() {
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', phone: '', tier: 'Platinum' });
  const [newTransaction, setNewTransaction] = useState({ type: 'Dining', amount: '', note: '' });

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    const { data, error } = await supabase.from('members').select('*').order('name');
    if (!error) setMembers(data);
    setLoading(false);
  }

  async function fetchTransactions(memberId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });
    if (!error) setTransactions(data);
  }

  async function handleAddMember() {
    const id = 'M' + Date.now();
    const { error } = await supabase.from('members').insert({
      id,
      name: newMember.name,
      phone: newMember.phone,
      tier: newMember.tier,
    });
    if (!error) {
      setNewMember({ name: '', phone: '', tier: 'Platinum' });
      setShowAddMember(false);
      fetchMembers();
    } else {
      alert('Error: ' + error.message);
    }
  }

  async function handleAddTransaction() {
    if (!selectedMember || !newTransaction.amount) return;
    const amount = parseFloat(newTransaction.amount);
    const { error } = await supabase.from('transactions').insert({
      member_id: selectedMember.id,
      type: newTransaction.type,
      amount,
      note: newTransaction.note,
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
    });
    if (!error) {
      await supabase
        .from('members')
        .update({
          balance: selectedMember.balance + amount,
          points: selectedMember.points + Math.floor(amount),
        })
        .eq('id', selectedMember.id);
      setNewTransaction({ type: 'Dining', amount: '', note: '' });
      fetchMembers();
      fetchTransactions(selectedMember.id);
      const { data } = await supabase.from('members').select('*').eq('id', selectedMember.id).single();
      if (data) setSelectedMember(data);
    }
  }

  function handleSearch() {
    const found = members.find((m) => m.phone.includes(searchPhone));
    if (found) {
      setSelectedMember(found);
      fetchTransactions(found.id);
    } else {
      alert('Member not found');
    }
  }

  function selectMember(member) {
    setSelectedMember(member);
    fetchTransactions(member.id);
  }

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🍸 LU BAR Admin</h1>

      {/* Search */}
      <div style={styles.searchBox}>
        <input
          style={styles.input}
          placeholder="Search by phone..."
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
        />
        <button style={styles.btn} onClick={handleSearch}>Search</button>
        <button style={styles.btnGreen} onClick={() => setShowAddMember(!showAddMember)}>+ Add Member</button>
      </div>

      {/* Add Member Form */}
      {showAddMember && (
        <div style={styles.card}>
          <h3>Add New Member</h3>
          <input style={styles.input} placeholder="Name" value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
          <input style={styles.input} placeholder="Phone" value={newMember.phone}
            onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })} />
          <select style={styles.input} value={newMember.tier}
            onChange={(e) => setNewMember({ ...newMember, tier: e.target.value })}>
            <option>Platinum</option>
            <option>Black Gold</option>
          </select>
          <button style={styles.btn} onClick={handleAddMember}>Save</button>
        </div>
      )}

      {/* Member List */}
      <div style={styles.grid}>
        <div style={styles.memberList}>
          <h2>Members ({members.length})</h2>
          {members.map((m) => (
            <div key={m.id} style={{
              ...styles.memberCard,
              border: selectedMember?.id === m.id ? '2px solid #f59e0b' : '1px solid #333',
            }} onClick={() => selectMember(m)}>
              <strong>{m.name}</strong>
              <span style={styles.tier}>{m.tier}</span>
              <div>📞 {m.phone}</div>
              <div>💰 ${m.balance} | ⭐ {m.points} pts</div>
            </div>
          ))}
        </div>

        {/* Member Detail */}
        <div style={styles.detail}>
          {selectedMember ? (
            <>
              <h2>{selectedMember.name}</h2>
              <p>Tier: <strong>{selectedMember.tier}</strong></p>
              <p>Balance: <strong>${selectedMember.balance}</strong></p>
              <p>Points: <strong>{selectedMember.points}</strong></p>
              <p>Phone: {selectedMember.phone}</p>

              <hr style={styles.hr} />
              <h3>Add Transaction</h3>
              <select style={styles.input} value={newTransaction.type}
                onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input style={styles.input} type="number" placeholder="Amount"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })} />
              <input style={styles.input} placeholder="Note (optional)"
                value={newTransaction.note}
                onChange={(e) => setNewTransaction({ ...newTransaction, note: e.target.value })} />
              <button style={styles.btnGreen} onClick={handleAddTransaction}>+ Add Transaction</button>

              <hr style={styles.hr} />
              <h3>Transaction History</h3>
              {transactions.length === 0 ? <p>No transactions yet</p> :
                transactions.map((t) => (
                  <div key={t.id} style={styles.transCard}>
                    <div><strong>{t.type}</strong> - ${t.amount}</div>
                    <div style={styles.small}>{t.date} {t.time} {t.note && `| ${t.note}`}</div>
                  </div>
                ))
              }
            </>
          ) : (
            <p>Select a member to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 1000, margin: '0 auto', padding: 20, fontFamily: 'sans-serif', color: '#fff', background: '#111', minHeight: '100vh' },
  title: { textAlign: 'center', fontSize: 28, marginBottom: 20 },
  loading: { textAlign: 'center', marginTop: 100, fontSize: 20, color: '#fff' },
  searchBox: { display: 'flex', gap: 10, marginBottom: 20 },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #444', background: '#222', color: '#fff', fontSize: 14, flex: 1 },
  btn: { padding: '10px 20px', borderRadius: 8, border: 'none', background: '#f59e0b', color: '#000', fontWeight: 'bold', cursor: 'pointer' },
  btnGreen: { padding: '10px 20px', borderRadius: 8, border: 'none', background: '#22c55e', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  card: { background: '#1a1a1a', padding: 20, borderRadius: 12, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 },
  grid: { display: 'flex', gap: 20 },
  memberList: { flex: 1 },
  memberCard: { background: '#1a1a1a', padding: 14, borderRadius: 10, marginBottom: 10, cursor: 'pointer' },
  tier: { marginLeft: 10, background: '#f59e0b', color: '#000', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 'bold' },
  detail: { flex: 2, background: '#1a1a1a', padding: 20, borderRadius: 12 },
  hr: { border: 'none', borderTop: '1px solid #333', margin: '16px 0' },
  transCard: { background: '#222', padding: 10, borderRadius: 8, marginBottom: 8 },
  small: { fontSize: 12, color: '#888', marginTop: 4 },
};