import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/User';
import Category from '../models/Category';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import Attempt from '../models/Attempt';

const cleanUpTestData = async () => {
  // Find test users
  const testUsers = await User.find({ 
    $or: [
      { email: /test_.*@example\.com/ },
      { username: /^test_/ }
    ]
  });
  const testUserIds = testUsers.map(u => u._id);

  // Find test categories
  const testCategories = await Category.find({ name: /^TestCategory/ });
  const testCategoryIds = testCategories.map(c => c._id);

  // Find test quizzes
  const testQuizzes = await Quiz.find({ title: /^TestQuiz/ });
  const testQuizIds = testQuizzes.map(q => q._id);

  // Clean up dependent questions and attempts
  if (testQuizIds.length > 0) {
    await Question.deleteMany({ quizId: { $in: testQuizIds } });
    await Attempt.deleteMany({ quizId: { $in: testQuizIds } });
  }

  if (testUserIds.length > 0) {
    await Attempt.deleteMany({ userId: { $in: testUserIds } });
  }

  // Delete actual documents
  await User.deleteMany({ _id: { $in: testUserIds } });
  await Category.deleteMany({ _id: { $in: testCategoryIds } });
  await Quiz.deleteMany({ _id: { $in: testQuizIds } });
};

beforeAll(async () => {
  // Ensure connection is fully established
  if (mongoose.connection.readyState !== 1) {
    await new Promise<void>((resolve, reject) => {
      mongoose.connection.once('open', resolve);
      mongoose.connection.once('error', reject);
    });
  }
  // Clear any existing test data from previous partial runs
  await cleanUpTestData();
});

afterAll(async () => {
  // Wipe test documents to leave a clean DB
  await cleanUpTestData();
  // Properly close database connection so Jest can exit
  await mongoose.connection.close();
});

describe('Quiz Web App MVP API Integration Tests', () => {
  // Store authentication tokens and IDs for nested tests
  let studentToken: string;
  let adminToken: string;
  let categoryId: string;
  let quizId: string;
  let questionId: string;
  let correctOptionId: string;

  describe('1. Authentication Endpoints', () => {
    
    it('should register a new student user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'test_student',
          email: 'test_student@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test_student@example.com');
    });

    it('should register a new user to become admin', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'test_admin',
          email: 'test_admin@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should verify the student account with the OTP retrieved from the database', async () => {
      // Find the student user to get the registration OTP
      const user = await User.findOne({ email: 'test_student@example.com' });
      expect(user).toBeDefined();
      expect(user?.otpCode).toBeDefined();

      const response = await request(app)
        .post('/api/auth/verify-account')
        .send({
          email: 'test_student@example.com',
          otp: user?.otpCode
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify isVerified became true
      const updatedUser = await User.findOne({ email: 'test_student@example.com' });
      expect(updatedUser?.isVerified).toBe(true);
    });

    it('should verify the admin account and promote user to Admin role', async () => {
      // Find the admin user to get the registration OTP
      const user = await User.findOne({ email: 'test_admin@example.com' });
      expect(user).toBeDefined();
      expect(user?.otpCode).toBeDefined();

      const response = await request(app)
        .post('/api/auth/verify-account')
        .send({
          email: 'test_admin@example.com',
          otp: user?.otpCode
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Manually grant the 'Admin' role since auth register registers 'Student' by default
      await User.updateOne({ email: 'test_admin@example.com' }, { role: 'Admin' });

      const updatedUser = await User.findOne({ email: 'test_admin@example.com' });
      expect(updatedUser?.role).toBe('Admin');
    });

    it('should initiate student login and require OTP (2FA)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test_student@example.com',
          password: 'password123',
          role: 'Student'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.requiresOTP).toBe(true);
    });

    it('should complete student login with the generated OTP', async () => {
      const user = await User.findOne({ email: 'test_student@example.com' });
      expect(user?.otpCode).toBeDefined();

      const response = await request(app)
        .post('/api/auth/verify-login')
        .send({
          email: 'test_student@example.com',
          otp: user?.otpCode
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      studentToken = response.body.data.token;
    });

    it('should initiate admin login and require OTP (2FA)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test_admin@example.com',
          password: 'password123',
          role: 'Admin'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.requiresOTP).toBe(true);
    });

    it('should complete admin login with the generated OTP', async () => {
      const user = await User.findOne({ email: 'test_admin@example.com' });
      expect(user?.otpCode).toBeDefined();

      const response = await request(app)
        .post('/api/auth/verify-login')
        .send({
          email: 'test_admin@example.com',
          otp: user?.otpCode
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      adminToken = response.body.data.token;
    });

    it('should fetch the profile of the logged-in student', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test_student@example.com');
    });

    it('should trigger a password reset request', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test_student@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resetToken).toBeDefined();

      const resetToken = response.body.data.resetToken;

      // Reset the password back using the reset token
      const resetResponse = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'password123' // Keep password123 for later operations
        });

      expect(resetResponse.status).toBe(200);
      expect(resetResponse.body.success).toBe(true);
    });

  });

  describe('2. Admin Endpoints', () => {

    it('should block category creation if student token is used', async () => {
      const response = await request(app)
        .post('/api/admin/categories')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'TestCategory',
          description: 'A category for integration testing'
        });

      expect(response.status).toBe(403);
    });

    it('should create a new category when using admin token', async () => {
      const response = await request(app)
        .post('/api/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'TestCategory',
          description: 'A category for integration testing'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.categoryId).toBeDefined();
      categoryId = response.body.data.categoryId;
    });

    it('should create a new quiz configuration within the category', async () => {
      const response = await request(app)
        .post('/api/admin/quizzes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId,
          title: 'TestQuiz',
          description: 'An integration testing quiz',
          timeLimit: 120
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.quizId).toBeDefined();
      quizId = response.body.data.quizId;
    });

    it('should add a multiple-choice question to the created quiz', async () => {
      const response = await request(app)
        .post(`/api/admin/quizzes/${quizId}/questions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          questionText: 'What is the value of 2 + 2?',
          points: 10,
          options: [
            { optionText: '3', isCorrect: false },
            { optionText: '4', isCorrect: true },
            { optionText: '5', isCorrect: false }
          ]
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.questionId).toBeDefined();
      questionId = response.body.data.questionId;

      // Find options to check their IDs for grading later
      const question = await Question.findById(questionId);
      expect(question).toBeDefined();
      const correctOption = question?.options.find(o => o.isCorrect);
      expect(correctOption).toBeDefined();
      correctOptionId = correctOption?._id?.toString() || '';
    });

    it('should register a new Admin user using the current admin session', async () => {
      const response = await request(app)
        .post('/api/admin/create-admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'test_admin_sub',
          email: 'test_admin_sub@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

  });

  describe('3. Student Endpoints', () => {

    it('should fetch the list of quizzes and include our test quiz', async () => {
      const response = await request(app)
        .get('/api/student/quizzes')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      const ourQuiz = response.body.data.find((q: any) => q._id === quizId);
      expect(ourQuiz).toBeDefined();
      expect(ourQuiz.title).toBe('TestQuiz');
    });

    it('should fetch the play state (questions without answers)', async () => {
      const response = await request(app)
        .get(`/api/student/quizzes/${quizId}/play`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.questions).toBeDefined();
      expect(response.body.data.questions.length).toBe(1);

      // Verify that options are served but without correctness information
      const servedQuestion = response.body.data.questions[0];
      expect(servedQuestion.options[0].isCorrect).toBeUndefined();
    });

    it('should submit a correct quiz attempt and receive score evaluation', async () => {
      const response = await request(app)
        .post(`/api/student/quizzes/${quizId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          startedAt: new Date(Date.now() - 10000).toISOString(), // 10 seconds ago
          answers: [
            {
              questionId,
              selectedOptionId: correctOptionId
            }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.score).toBe(10);
      expect(response.body.data.totalPoints).toBe(10);
      expect(response.body.data.percentage).toBe(100);
    });

    it('should retrieve attempts history for the student', async () => {
      const response = await request(app)
        .get('/api/student/attempts/history')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);

      const ourAttempt = response.body.data.find((a: any) => a.quizId?._id === quizId);
      expect(ourAttempt).toBeDefined();
      expect(ourAttempt.score).toBe(10);
    });

    it('should retrieve the leaderboard for the quiz and show our student score', async () => {
      const response = await request(app)
        .get(`/api/student/quizzes/${quizId}/leaderboard`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      
      const topAttempt = response.body.data[0];
      expect(topAttempt.score).toBe(10);
      expect(topAttempt.userId.username).toBe('test_student');
    });

  });
});
