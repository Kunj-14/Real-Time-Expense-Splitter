const express = require('express');
const { createGroup, getGroups, getGroupById, addMember } = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, createGroup).get(protect, getGroups);
router.route('/:id').get(protect, getGroupById);
router.route('/:id/members').post(protect, addMember);

module.exports = router;
