const sequelize = require('../config/db');
const User = require('./User');
const Exam = require('./Exam');
const Question = require('./Question');
const Result = require('./Result');
const Assignment = require('./Assignment');
const AuditLog = require('./AuditLog');
const DraftAnswer = require('./DraftAnswer');

// Relationships
Exam.belongsToMany(Question, { through: 'ExamQuestions', onDelete: 'CASCADE' });
Question.belongsToMany(Exam, { through: 'ExamQuestions' });

User.hasMany(Exam, { foreignKey: 'creatorId', as: 'createdExams' });
Exam.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

User.hasMany(Result, { onDelete: 'CASCADE' });
Result.belongsTo(User);

Exam.hasMany(Result, { onDelete: 'CASCADE' });
Result.belongsTo(Exam);

// Student Assignments
User.belongsToMany(Exam, { through: Assignment, as: 'assignedExams' });
Exam.belongsToMany(User, { through: Assignment, as: 'assignedStudents' });

// Draft Answers (Autosave)
User.hasMany(DraftAnswer, { onDelete: 'CASCADE' });
DraftAnswer.belongsTo(User);
Exam.hasMany(DraftAnswer, { onDelete: 'CASCADE' });
DraftAnswer.belongsTo(Exam);

const syncDB = async () => {
  const shouldAlter = process.env.DB_SYNC_ALTER === 'true';

  let retries = 5;
  while (retries > 0) {
    try {
      if (shouldAlter) {
        console.log(`Syncing database with alter: ${shouldAlter}...`);
        await sequelize.sync({ alter: true });
      } else {
        console.log('Syncing database (basic)...');
        await sequelize.sync();
      }
      console.log('Database synced successfully');
      break;
    } catch (error) {
      console.error(`Error syncing database. ${retries} retries left...`, error.message);
      retries -= 1;
      if (retries === 0) {
        console.error('[CRITICAL] Max retries reached. Database sync failed. Server will continue to run, but DB features will fail.');
      }
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

module.exports = {
  User,
  Exam,
  Question,
  Result,
  Assignment,
  AuditLog,
  DraftAnswer,
  syncDB
};
