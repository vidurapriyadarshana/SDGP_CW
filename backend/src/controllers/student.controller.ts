import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Category from '../models/Category';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import Attempt from '../models/Attempt';
import { sendSuccess } from '../utils/response';
import { CustomError } from '../utils/CustomError';

export const getQuizzes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quizzes = await Quiz.find().populate('categoryId', 'name');
    sendSuccess(res, 'Quizzes list retrieved successfully', quizzes, 200);
  } catch (error) {
    next(error);
  }
};

export const startQuizAttempt = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quizId = req.params.quizId;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new CustomError('Quiz not found', 404);
    }
    
    // Exclude correctness data to prevent Inspect sniff cheating
    const questions = await Question.find({ quizId }).select('-options.isCorrect');
    sendSuccess(res, 'Quiz loaded successfully', {
      quizId,
      title: quiz.title,
      timeLimit: quiz.timeLimit,
      questions
    }, 200);
  } catch (error) {
    next(error);
  }
};

export const submitQuizAttempt = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quizId = req.params.quizId;
    const userId = req.user?.userId;
    const { answers, startedAt } = req.body;

    const questions = await Question.find({ quizId });
    if (!questions || questions.length === 0) {
      throw new CustomError('No questions found for this quiz', 400);
    }

    let totalScore = 0;
    let maxPoints = 0;

    const gradingAnswers = questions.map(q => {
      const selection = answers.find((a: any) => a.questionId === q.id);
      const correctOpt = q.options.find(o => o.isCorrect === true);
      const isCorrect = selection && selection.selectedOptionId === correctOpt?._id?.toString();

      if (isCorrect) totalScore += q.points;
      maxPoints += q.points;

      return {
        questionId: q._id,
        selectedOptionId: selection ? selection.selectedOptionId : null,
        isCorrect: !!isCorrect
      };
    });

    const timeTaken = Math.round((Date.now() - new Date(startedAt).getTime()) / 1000);

    const attempt = new Attempt({
      userId,
      quizId,
      score: totalScore,
      totalPoints: maxPoints,
      timeTakenSeconds: timeTaken,
      startedAt,
      answers: gradingAnswers
    });

    await attempt.save();
    
    sendSuccess(res, 'Submission evaluated and logged successfully', {
      attemptId: attempt._id,
      score: totalScore,
      totalPoints: maxPoints,
      percentage: maxPoints > 0 ? (totalScore / maxPoints) * 100 : 0,
      timeTakenSeconds: timeTaken
    }, 200);
  } catch (error) {
    next(error);
  }
};

export const getAttemptsHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const attempts = await Attempt.find({ userId: req.user?.userId }).populate('quizId', 'title');
    sendSuccess(res, 'Attempts history retrieved successfully', attempts, 200);
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const leaderboard = await Attempt.find({ quizId: req.params.quizId })
      .populate('userId', 'username')
      .sort({ score: -1, timeTakenSeconds: 1 })
      .limit(10);
    sendSuccess(res, 'Leaderboard retrieved successfully', leaderboard, 200);
  } catch (error) {
    next(error);
  }
};
