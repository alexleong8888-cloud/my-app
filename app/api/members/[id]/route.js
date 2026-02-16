export async function GET(request, { params }) {
  const { id } = params;

  // 模拟会员数据库
  const members = {
    '1001': {
      id: '1001',
      name: 'Alice',
      cardType: 'black',
      topUpAmount: 6000,
      creditAmount: 6588,
      balance: 4812.50,
      points: 4812,
      phone: '012-3456789',
      birthday: '06-15',
      joinDate: '2025-12-01',
      benefits: {
        foodDiscount: 12,
        alcoholDiscount: 10,
        parking: true,
      },
      transactions: [
        { id: 1, date: '2026-02-14', time: '20:35', desc: 'Dining', amount: 388.00, balanceAfter: 4812.50 },
        { id: 2, date: '2026-02-10', time: '19:20', desc: 'Dining & Drinks', amount: 562.00, balanceAfter: 5200.50 },
        { id: 3, date: '2026-02-05', time: '21:10', desc: 'Lounge - Drinks', amount: 280.00, balanceAfter: 5762.50 },
        { id: 4, date: '2026-01-28', time: '19:45', desc: 'Dining', amount: 445.50, balanceAfter: 6042.50 },
        { id: 5, date: '2026-01-20', time: '20:00', desc: 'Dining & Drinks', amount: 545.50, balanceAfter: 6488.00 },
        { id: 6, date: '2026-01-15', time: '18:30', desc: 'Top Up (Black Gold)', amount: -6588.00, balanceAfter: 6588.00 },
      ],
    },
    '1002': {
      id: '1002',
      name: 'Bob',
      cardType: 'platinum',
      topUpAmount: 3000,
      creditAmount: 3180,
      balance: 2150.00,
      points: 2150,
      phone: '012-9876543',
      birthday: '03-22',
      joinDate: '2026-01-10',
      benefits: {
        foodDiscount: 8,
        alcoholDiscount: 5,
        parking: false,
      },
      transactions: [
        { id: 1, date: '2026-02-12', time: '19:00', desc: 'Dining', amount: 320.00, balanceAfter: 2150.00 },
        { id: 2, date: '2026-02-01', time: '20:30', desc: 'Drinks', amount: 180.00, balanceAfter: 2470.00 },
        { id: 3, date: '2026-01-10', time: '12:00', desc: 'Top Up (Platinum)', amount: -3180.00, balanceAfter: 3180.00 },
      ],
    },
  };

  const member = members[id];

  if (!member) {
    return Response.json(
      { error: 'Member Not Found', message: `No member with ID: ${id}` },
      { status: 404 }
    );
  }

  return Response.json(member);
}