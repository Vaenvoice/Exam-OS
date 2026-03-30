const express = require('express');
const {
  importQuestions,
  exportQuestions,
  importUsers,
  exportResults
} = require('../controllers/bulk');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.use(protect);

router.post('/questions/import', authorize('admin', 'teacher'), upload.single('file'), importQuestions);
router.get('/questions/export', authorize('admin', 'teacher'), exportQuestions);

router.post('/users/import', authorize('admin'), upload.single('file'), importUsers);
router.get('/results/export', authorize('admin', 'teacher'), exportResults);

module.exports = router;
