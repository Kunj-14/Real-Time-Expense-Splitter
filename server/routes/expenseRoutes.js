const express = require('express');
const { addExpense, getGroupExpenses, getGroupSettlement, markSettled } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, addExpense);
router.route('/group/:groupId').get(protect, getGroupExpenses);
router.route('/group/:groupId/settlement').get(protect, getGroupSettlement);
router.route('/group/:groupId/settle').post(protect, markSettled);

module.exports = router;
