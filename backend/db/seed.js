const { User, Exam, Question, syncDB } = require('../models');

const seedData = async () => {
  try {
    // 1. Create or Update Admin User
    let admin = await User.findOne({ where: { email: 'admin@test.com' } });
    if (!admin) {
      admin = await User.create({
        username: 'Admin User',
        email: 'admin@test.com',
        password: 'adminpassword123',
        role: 'admin',
        isApproved: true
      });
      console.log('[SEED] Admin user created: admin@test.com / adminpassword123');
    } else {
      // Ensure existing admin is approved
      if (!admin.isApproved) {
        admin.isApproved = true;
        await admin.save();
        console.log('[SEED] Existing admin user approved');
      }
      // Note: We don't force-reset the password here for security, 
      // but ensure the role is correct
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        await admin.save();
        console.log('[SEED] Existing user promoted to admin');
      }
    }

    // 2. Create Student User
    const student = await User.findOne({ where: { email: 'student@test.com' } });
    if (!student) {
      await User.create({
        username: 'Student User',
        email: 'student@test.com',
        password: 'studentpassword123',
        role: 'student',
        isApproved: true
      });
      console.log('Student user created: student@test.com / studentpassword123');
    }

    // 3. Create a sample exam
    const existingExam = await Exam.findOne({ where: { title: 'General Knowledge Quiz' } });
    if (!existingExam) {
      const exam = await Exam.create({
        title: 'General Knowledge Quiz',
        description: 'A basic quiz to test your general knowledge across various topics.',
        duration: 10,
        creatorId: admin.id
      });

      // 4. Add questions
      await Question.bulkCreate([
        {
          ExamId: exam.id,
          questionText: 'What is the capital of France?',
          optionA: 'London',
          optionB: 'Berlin',
          optionC: 'Paris',
          optionD: 'Madrid',
          correctAnswer: 'C'
        },
        {
          ExamId: exam.id,
          questionText: 'Which planet is known as the Red Planet?',
          optionA: 'Venus',
          optionB: 'Mars',
          optionC: 'Jupiter',
          optionD: 'Saturn',
          correctAnswer: 'B'
        },
        {
          ExamId: exam.id,
          questionText: 'Who painted the Mona Lisa?',
          optionA: 'Vincent van Gogh',
          optionB: 'Pablo Picasso',
          optionC: 'Leonardo da Vinci',
          optionD: 'Claude Monet',
          correctAnswer: 'C'
        }
      ]);
      console.log('Sample exam created with 3 questions');
    }

    console.log('Seeding completed successfully');
  } catch (err) {
    console.error('Error seeding data:', err);
  }
};

// If run directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
