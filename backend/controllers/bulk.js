const { Question, User, Exam, Result } = require('../models');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// @desc    Import Questions from CSV
// @route   POST /api/bulk/questions/import
// @access  Private/Admin/Teacher
exports.importQuestions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
    }

    let count = 0;
    const batch = [];
    const BATCH_SIZE = 50;
    
    const stream = fs.createReadStream(req.file.path).pipe(csv());

    stream.on('data', async (data) => {
      batch.push({
        questionText: data.questionText,
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,
        correctAnswer: data.correctAnswer,
        category: data.category || 'General'
      });

      if (batch.length >= BATCH_SIZE) {
        stream.pause();
        try {
          await Question.bulkCreate(batch.splice(0, BATCH_SIZE));
          count += BATCH_SIZE;
          stream.resume();
        } catch (err) {
          stream.destroy(err);
        }
      }
    });

    stream.on('end', async () => {
      try {
        if (batch.length > 0) {
          await Question.bulkCreate(batch);
          count += batch.length;
        }
        // Cleanup file
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        
        res.status(201).json({ 
          success: true, 
          message: `${count} questions imported successfully`
        });
      } catch (err) {
        res.status(400).json({ success: false, message: err.message });
      }
    });

    stream.on('error', (err) => {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(400).json({ success: false, message: `Import error: ${err.message}` });
    });

  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Export Questions to CSV
// @route   GET /api/bulk/questions/export
// @access  Private/Admin/Teacher
exports.exportQuestions = async (req, res) => {
  try {
    const fields = ['questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer', 'category'];
    
    res.header('Content-Type', 'text/csv');
    res.attachment('questions.csv');

    // Use streaming transforms for memory efficiency
    const { Transform } = require('json2csv');
    const transformOpts = { fields };
    const json2csv = new Transform(transformOpts);

    // Fetch questions in small batches if possible, but for now use findAll and stream it
    // Note: Question.findAll returns all at once. For true streaming from DB, use findEach or cursor
    const questions = await Question.findAll({ raw: true });
    
    if (!questions.length) {
      return res.status(404).json({ success: false, message: 'No questions found' });
    }

    const Readable = require('stream').Readable;
    const s = new Readable();
    s._read = () => {};
    s.push(JSON.stringify(questions));
    s.push(null);

    // For better efficiency with many records, we'd use a DB cursor
    const { AsyncParser } = require('json2csv');
    const parser = new AsyncParser({ fields });
    
    const csvStream = parser.parse(questions).toStream();
    return csvStream.pipe(res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
};

// @desc    Import Users (Students) from CSV
// @route   POST /api/bulk/users/import
// @access  Private/Admin
exports.importUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
    }

    let count = 0;
    const batch = [];
    const BATCH_SIZE = 50;
    const stream = fs.createReadStream(req.file.path).pipe(csv());

    stream.on('data', async (data) => {
      batch.push({
        username: data.username,
        email: data.email,
        password: data.password || 'Student123!',
        role: 'student',
        isApproved: true
      });

      if (batch.length >= BATCH_SIZE) {
        stream.pause();
        try {
          await User.bulkCreate(batch.splice(0, BATCH_SIZE), { ignoreDuplicates: true });
          count += BATCH_SIZE;
          stream.resume();
        } catch (err) {
          stream.destroy(err);
        }
      }
    });

    stream.on('end', async () => {
      try {
        if (batch.length > 0) {
          await User.bulkCreate(batch, { ignoreDuplicates: true });
          count += batch.length;
        }
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(201).json({ success: true, message: `${count} users imported successfully` });
      } catch (err) {
        res.status(400).json({ success: false, message: err.message });
      }
    });

    stream.on('error', (err) => {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(400).json({ success: false, message: `Import error: ${err.message}` });
    });

  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Export Results to CSV
// @route   GET /api/bulk/results/export
// @access  Private/Admin/Teacher
exports.exportResults = async (req, res) => {
  try {
    const results = await Result.findAll({
      include: [
        { model: Exam, attributes: ['title'] },
        { model: User, attributes: ['username', 'email'] }
      ],
      raw: true
    });

    if (!results.length) {
      return res.status(404).json({ success: false, message: 'No results found' });
    }

    const flattened = results.map(r => ({
      Exam: r['Exam.title'],
      Student: r['User.username'],
      Email: r['User.email'],
      Score: r.score,
      Total: r.totalQuestions,
      Percentage: r.percentage,
      Date: r.submittedAt,
      Approved: r.isApproved,
      IPAddress: r.ipAddress
    }));

    const fields = ['Exam', 'Student', 'Email', 'Score', 'Total', 'Percentage', 'Date', 'Approved', 'IPAddress'];
    
    res.header('Content-Type', 'text/csv');
    res.attachment('exam_results.csv');

    const { AsyncParser } = require('json2csv');
    const parser = new AsyncParser({ fields });
    
    return parser.parse(flattened).toStream().pipe(res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
};
