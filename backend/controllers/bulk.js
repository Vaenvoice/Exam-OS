const { Question, User, Exam, Result } = require('../models');
const csv = require('csv-parser');
const { Parser, parse } = require('json2csv');
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

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          // Validate and format questions
          const formattedQuestions = results.map(q => ({
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            category: q.category || 'General'
          }));

          const questions = await Question.bulkCreate(formattedQuestions);
          
          // Cleanup file
          fs.unlinkSync(req.file.path);
          
          res.status(201).json({ 
            success: true, 
            message: `${questions.length} questions imported successfully`,
            data: questions 
          });
        } catch (innerErr) {
          res.status(400).json({ success: false, message: innerErr.message });
        }
      });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Export Questions to CSV
// @route   GET /api/bulk/questions/export
// @access  Private/Admin/Teacher
exports.exportQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({ raw: true });
    
    if (!questions.length) {
      return res.status(404).json({ success: false, message: 'No questions found to export' });
    }

    const fields = ['questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer', 'category'];
    const opts = { fields };
    let csvData;
    if (Parser) {
      const parser = new Parser(opts);
      csvData = parser.parse(questions);
    } else {
      csvData = parse(questions, opts);
    }

    res.header('Content-Type', 'text/csv');
    res.attachment('questions.csv');
    return res.send(csvData);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
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

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const usersData = results.map(u => ({
            username: u.username,
            email: u.email,
            password: u.password || 'Student123!', // Default password if not provided
            role: 'student',
            isApproved: true
          }));

          const users = await User.bulkCreate(usersData, { ignoreDuplicates: true });
          
          fs.unlinkSync(req.file.path);
          
          res.status(201).json({ 
            success: true, 
            message: `${users.length} users imported successfully`
          });
        } catch (innerErr) {
          res.status(400).json({ success: false, message: innerErr.message });
        }
      });
  } catch (err) {
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
      return res.status(404).json({ success: false, message: 'No results found to export' });
    }

    // Flatten data for CSV
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
    const opts = { fields };
    let csvData;
    if (Parser) {
      const parser = new Parser(opts);
      csvData = parser.parse(flattened);
    } else {
      csvData = parse(flattened, opts);
    }

    res.header('Content-Type', 'text/csv');
    res.attachment('exam_results.csv');
    return res.send(csvData);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
