const express = require('express');
const { getUsers, approveUser, deleteUser } = require('../controllers/user');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin', 'teacher'), getUsers);
router.put('/:id/approve', authorize('admin'), approveUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
