const Expense = require('../models/Expense');
const Group = require('../models/Group');
const { simplifyDebts } = require('../services/debtSimplification');

const addExpense = async (req, res) => {
  const { groupId, description, totalAmount, splits } = req.body;
  try {
    const expense = await Expense.create({
      groupId,
      description,
      totalAmount,
      paidBy: req.user.id,
      splits
    });
    
    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'username')
      .populate('splits.user', 'username');

    const io = req.app.get('io');
    if (io) {
      io.to(groupId).emit('new_expense', populatedExpense);
    }

    res.status(201).json(populatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGroupExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ groupId: req.params.groupId })
      .populate('paidBy', 'username')
      .populate('splits.user', 'username')
      .sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGroupSettlement = async (req, res) => {
  try {
    const expenses = await Expense.find({ groupId: req.params.groupId });
    const transactions = simplifyDebts(expenses);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markSettled = async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    
    const settlement = await Expense.create({
      groupId: req.params.groupId,
      description: 'Settlement Payment',
      totalAmount: amount,
      paidBy: from,
      splits: [
        { user: from, amount: 0 },
        { user: to, amount: amount }
      ],
      settled: true // A special flag if we want to skip it from debt calculation later, although in standard simplification settling adds an offsetting record
    });

    const populated = await Expense.findById(settlement._id)
      .populate('paidBy', 'username')
      .populate('splits.user', 'username');
      
    const io = req.app.get('io');
    if (io) io.to(req.params.groupId).emit('new_expense', populated);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addExpense, getGroupExpenses, getGroupSettlement, markSettled };
