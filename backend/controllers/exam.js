const { Exam, Question, Result, User, DraftAnswer, AuditLog } = require('../models');

// @desc    Create new exam
// @route   POST /api/exams
// @access  Private/Admin/Teacher
exports.createExam = async (req, res) => {
  try {
    req.body.creatorId = req.user.id;
    const exam = await Exam.create(req.body);
    res.status(201).json({ success: true, data: exam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
exports.getExams = async (req, res) => {
  try {
    let exams;
    
    console.log(`[DEBUG] getExams: User=${req.user.username}, Role=${req.user.role}, ID=${req.user.id}`);
    
    if (req.user.role === 'admin') {
      // Admins see everything
      exams = await Exam.findAll({
        include: [{ model: Question, attributes: ['id'] }]
      });
    } else if (req.user.role === 'teacher') {
      // Teachers see only their own exams
      exams = await Exam.findAll({
        where: { creatorId: req.user.id },
        include: [{ model: Question, attributes: ['id'] }]
      });
    } else {
      // Students see only assigned exams
      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Exam,
          as: 'assignedExams',
          include: [{ model: Question, attributes: ['id'] }]
        }]
      });
      exams = user ? (user.assignedExams || []) : [];
    }

    console.log(`[DEBUG] getExams found ${exams.length} exams`);
    res.status(200).json({ success: true, data: exams });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single exam with questions
// @route   GET /api/exams/:id
// @access  Private
exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: [Question]
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Check scheduling for students
    if (req.user.role === 'student') {
      const now = new Date();
      try {
        console.log(`[DEBUG] Exam Time Check:`);
        console.log(`  - Current Time (now): ${now.toISOString()} (${now.toLocaleString()})`);
        
        if (exam.startWindow) {
          const start = new Date(exam.startWindow);
          console.log(`  - Start Window: ${start.toISOString()} (${start.toLocaleString()})`);
          if (now < start) {
            return res.status(403).json({ 
              success: false, 
              message: `Exam has not started yet. Starts at: ${start.toLocaleString()}` 
            });
          }
        }
        
        if (exam.endWindow) {
          const end = new Date(exam.endWindow);
          console.log(`  - End Window: ${end.toISOString()} (${end.toLocaleString()})`);
          if (now > end) {
            return res.status(403).json({ 
              success: false, 
              message: 'Exam has already ended' 
            });
          }
        }
      } catch (logErr) {
        console.error(`[ERROR] Time Check Failed:`, logErr);
        // Continue if logging fails, safety check
      }
    }

    // Handle randomization
    if ((req.user.role === 'student' || exam.randomizeQuestions) && exam.Questions) {
      // Shuffle questions
      exam.Questions = exam.Questions.sort(() => Math.random() - 0.5);
    }

    res.status(200).json({ success: true, data: exam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private/Admin/Teacher
exports.updateExam = async (req, res) => {
  console.log(`[DEBUG] updateExam called for ID: ${req.params.id} by User: ${req.user.id}`);
  try {
    let exam = await Exam.findByPk(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Ownership check
    if (exam.creatorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this exam' });
    }

    exam = await exam.update(req.body);
    console.log(`[DEBUG] Exam updated successfully`);

    res.status(200).json({ success: true, data: exam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private/Admin/Teacher
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Ownership check
    if (exam.creatorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this exam' });
    }

    await exam.destroy();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Add question to exam
// @route   POST /api/exams/:examId/questions
// @access  Private/Admin/Teacher
exports.addQuestion = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.examId);

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Ownership check
    if (exam.creatorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to add questions to this exam' });
    }

    // Create question and link to exam via join table
    const question = await Question.create(req.body);
    await exam.addQuestion(question);
    
    res.status(201).json({ success: true, data: question });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all questions (Question Bank)
// @route   GET /api/exams/questions/bank
// @access  Private/Admin/Teacher
exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll();
    res.status(200).json({ success: true, data: questions });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Link existing question to exam
// @route   POST /api/exams/:examId/questions/:questionId/link
// @access  Private/Admin/Teacher
exports.linkQuestion = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.examId);
    const question = await Question.findByPk(req.params.questionId);

    if (!exam || !question) {
      return res.status(404).json({ success: false, message: 'Exam or Question not found' });
    }

    // Ownership check
    if (exam.creatorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await exam.addQuestion(question);
    res.status(200).json({ success: true, message: 'Question linked to exam' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Autosave exam answers (draft)
// @route   POST /api/exams/:id/autosave
// @access  Private/Student
exports.autosaveExam = async (req, res) => {
  try {
    const { answers } = req.body;
    const examId = req.params.id;
    const userId = req.user.id;

    // Verify exam exists
    const exam = await Exam.findByPk(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Check if already submitted
    const existingResult = await Result.findOne({
      where: { UserId: userId, ExamId: examId }
    });
    if (existingResult) {
      return res.status(400).json({ success: false, message: 'Exam already submitted, cannot autosave' });
    }

    // Upsert draft answer
    const [draft, created] = await DraftAnswer.findOrCreate({
      where: { UserId: userId, ExamId: examId },
      defaults: {
        answers: answers || {},
        startedAt: new Date(),
        lastSavedAt: new Date()
      }
    });

    if (!created) {
      draft.answers = answers || {};
      draft.lastSavedAt = new Date();
      await draft.save();
    }

    res.status(200).json({
      success: true,
      message: 'Draft saved',
      data: {
        lastSavedAt: draft.lastSavedAt,
        startedAt: draft.startedAt
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get saved draft for an exam
// @route   GET /api/exams/:id/draft
// @access  Private/Student
exports.getDraft = async (req, res) => {
  try {
    const draft = await DraftAnswer.findOne({
      where: { UserId: req.user.id, ExamId: req.params.id }
    });

    if (!draft) {
      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({
      success: true,
      data: {
        answers: draft.answers,
        startedAt: draft.startedAt,
        lastSavedAt: draft.lastSavedAt,
        tabSwitchCount: draft.tabSwitchCount
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Log a proctoring event (tab switch)
// @route   POST /api/exams/:id/proctor-log
// @access  Private/Student
exports.logProctoringEvent = async (req, res) => {
  try {
    const { eventType, message } = req.body;
    const examId = req.params.id;
    const userId = req.user.id;

    // Log to AuditLog
    await AuditLog.create({
      userId,
      username: req.user.username,
      action: `PROCTOR_${eventType || 'TAB_SWITCH'}`,
      entityType: 'Exam',
      entityId: examId,
      details: { message, timestamp: new Date().toISOString() },
      ipAddress: req.ip || req.connection?.remoteAddress
    });

    // Increment tab switch counter on draft
    const draft = await DraftAnswer.findOne({
      where: { UserId: userId, ExamId: examId }
    });
    if (draft) {
      draft.tabSwitchCount = (draft.tabSwitchCount || 0) + 1;
      await draft.save();
    }

    res.status(200).json({ success: true, message: 'Proctoring event logged' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Submit exam and calculate results
// @route   POST /api/exams/:id/submit
// @access  Private/Student
exports.submitExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: [Question]
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Check if already submitted
    const existingResult = await Result.findOne({
      where: { UserId: req.user.id, ExamId: exam.id }
    });

    if (existingResult) {
      return res.status(400).json({ success: false, message: 'Exam already submitted' });
    }

    // Server-side timer validation
    const draft = await DraftAnswer.findOne({
      where: { UserId: req.user.id, ExamId: exam.id }
    });

    if (draft && draft.startedAt) {
      const elapsedMs = Date.now() - new Date(draft.startedAt).getTime();
      const allowedMs = exam.duration * 60 * 1000;
      const gracePeriodMs = 60 * 1000; // 1 minute grace period for network latency

      if (elapsedMs > allowedMs + gracePeriodMs) {
        // Auto-submit with whatever answers we have, but flag it
        console.log(`[PROCTOR] Late submission detected for user ${req.user.id} on exam ${exam.id}. Elapsed: ${Math.round(elapsedMs/1000)}s, Allowed: ${exam.duration * 60}s`);
      }
    }

    const userAnswers = req.body.answers; // Expect { questionId: 'A', ... }
    let score = 0;

    exam.Questions.forEach(question => {
      if (userAnswers[question.id] === question.correctAnswer) {
        score++;
      }
    });

    const totalQuestions = exam.Questions.length;
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    const result = await Result.create({
      UserId: req.user.id,
      ExamId: exam.id,
      score,
      totalQuestions,
      percentage,
      ipAddress: req.ip || req.connection?.remoteAddress,
      browserData: {
        userAgent: req.headers['user-agent'],
        language: req.headers['accept-language'],
        tabSwitches: draft ? draft.tabSwitchCount : 0,
        proctoringData: req.body.proctoringData || null
      }
    });

    // Clean up draft after successful submission
    if (draft) {
      await draft.destroy();
    }

    res.status(201).json({
      success: true,
      data: {
        score,
        totalQuestions,
        percentage,
        resultId: result.id,
        ipAddress: result.ipAddress
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all results (Admin: all, Student: mine)
// @route   GET /api/results
// @access  Private
exports.getResults = async (req, res) => {
  try {
    const query = {};
    const include = [Exam, { model: User, attributes: ['id', 'username', 'email'] }];

    if (req.user.role === 'teacher') {
      const teacherExams = await Exam.findAll({
        where: { creatorId: req.user.id },
        attributes: ['id']
      });
      const examIds = teacherExams.map(e => e.id);
      query.ExamId = examIds;
    } else if (req.user.role === 'student') {
      query.UserId = req.user.id;
    }

    const results = await Result.findAll({
      where: query,
      include,
      order: [['submittedAt', 'DESC']]
    });

    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Approve/Verify result
// @route   PUT /api/results/:id/approve
// @access  Private/Admin/Teacher
exports.approveResult = async (req, res) => {
  try {
    const result = await Result.findByPk(req.params.id, { include: [Exam] });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && result.Exam.creatorId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    result.isApproved = true;
    await result.save();

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
// @desc    Assign students to exam
// @route   POST /api/exams/:id/assign
// @access  Private/Admin/Teacher
exports.assignStudents = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Ownership check
    if (exam.creatorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this exam' });
    }

    const { studentIds } = req.body; // Expect array of user IDs

    // Clear existing assignments if needed or just add new ones
    // For now, let's just add new ones and handle duplicates
    const { Assignment } = require('../models');
    
    // Efficiently handle assignments
    await Assignment.destroy({ where: { ExamId: exam.id } });
    
    const assignments = studentIds.map(userId => ({
      ExamId: exam.id,
      UserId: userId
    }));

    await Assignment.bulkCreate(assignments);

    res.status(200).json({ success: true, message: 'Students assigned successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get assigned students for an exam
// @route   GET /api/exams/:id/assigned-students
// @access  Private/Admin/Teacher
exports.getAssignedStudents = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'assignedStudents',
        attributes: ['id', 'username', 'email']
      }]
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    res.status(200).json({ success: true, data: exam.assignedStudents });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/exams/dashboard/stats
// @access  Private/Admin/Teacher
exports.getDashboardStats = async (req, res) => {
  try {
    let examsCount;
    let resultsCount;
    let studentsCount;

    if (req.user.role === 'admin') {
      examsCount = await Exam.count();
      resultsCount = await Result.count();
      studentsCount = await User.count({ where: { role: 'student' } });
    } else {
      // Teacher: only their exams, results for their exams, and students assigned to their exams
      const teacherExams = await Exam.findAll({ 
        where: { creatorId: req.user.id },
        attributes: ['id']
      });
      examsCount = teacherExams.length;
      
      const examIds = teacherExams.map(e => e.id);
      
      if (examIds.length > 0) {
        resultsCount = await Result.count({
          where: { ExamId: examIds }
        });
        
        // Distinct students assigned to this teacher's exams
        const { Assignment } = require('../models');
        const assignmentsCount = await Assignment.count({
          where: { ExamId: examIds },
          distinct: true,
          col: 'UserId'
        });
        studentsCount = assignmentsCount;
      } else {
        resultsCount = 0;
        studentsCount = 0;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        exams: examsCount,
        results: resultsCount,
        students: studentsCount
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

