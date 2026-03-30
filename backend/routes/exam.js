const express = require('express');
const {
  createExam,
  getExams,
  getExam,
  updateExam,
  deleteExam,
  addQuestion,
  submitExam,
  getResults,
  getDashboardStats,
  assignStudents,
  getAssignedStudents,
  getQuestions,
  linkQuestion,
  approveResult,
  autosaveExam,
  getDraft,
  logProctoringEvent
} = require('../controllers/exam');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/dashboard/stats', getDashboardStats);
router.get('/results', getResults);
router.get('/questions/bank', authorize('admin', 'teacher'), getQuestions);
router.put('/results/:id/approve', authorize('admin', 'teacher'), approveResult);

router
  .route('/')
  .get(getExams)
  .post(authorize('admin', 'teacher'), createExam);

router.post('/:examId/questions', authorize('admin', 'teacher'), addQuestion);
router.post('/:examId/questions/:questionId/link', authorize('admin', 'teacher'), linkQuestion);
router.post('/:id/assign', authorize('admin', 'teacher'), assignStudents);
router.get('/:id/assigned-students', authorize('admin', 'teacher'), getAssignedStudents);

// Autosave & Proctoring routes (student)
router.post('/:id/autosave', authorize('student'), autosaveExam);
router.get('/:id/draft', authorize('student'), getDraft);
router.post('/:id/proctor-log', authorize('student'), logProctoringEvent);

router
  .route('/:id')
  .get(getExam)
  .put(authorize('admin', 'teacher'), updateExam)
  .delete(authorize('admin', 'teacher'), deleteExam);
router.post('/:id/submit', authorize('student'), submitExam);

module.exports = router;

