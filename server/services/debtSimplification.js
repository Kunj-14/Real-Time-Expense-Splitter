function simplifyDebts(expenses) {
  // balances[userId] = amount (positive means they are owed money, negative means they owe money)
  const balances = {};

  expenses.forEach(expense => {
    if (expense.settled) return;

    const paidBy = expense.paidBy.toString();
    if (!balances[paidBy]) balances[paidBy] = 0;
    balances[paidBy] += expense.totalAmount;

    expense.splits.forEach(split => {
      const user = split.user.toString();
      if (!balances[user]) balances[user] = 0;
      balances[user] -= split.amount;
    });
  });

  const debtors = [];
  const creditors = [];

  for (const [user, amount] of Object.entries(balances)) {
    if (amount < -0.01) debtors.push({ user, amount: -amount });
    else if (amount > 0.01) creditors.push({ user, amount });
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0; // debtors index
  let j = 0; // creditors index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    const amount = Math.min(debtor.amount, creditor.amount);
    
    transactions.push({
      from: debtor.user,
      to: creditor.user,
      amount: Math.round(amount * 100) / 100
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
}

module.exports = { simplifyDebts };
