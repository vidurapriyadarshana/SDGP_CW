import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Category from '../models/Category';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import { sendSuccess } from '../utils/response';
import { CustomError } from '../utils/CustomError';

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      throw new CustomError('Category name already exists', 400);
    }

    const category = new Category({ name, description });
    await category.save();
    
    sendSuccess(res, 'Category created successfully', { categoryId: category._id }, 201);
  } catch (error) {
    next(error);
  }
};

export const createQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { categoryId, title, description, timeLimit } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      throw new CustomError('Invalid category ID', 400);
    }

    const quiz = new Quiz({ 
      categoryId, 
      creatorId: req.user?.userId, 
      title, 
      description, 
      timeLimit 
    });
    await quiz.save();
    
    sendSuccess(res, 'Quiz created successfully', { quizId: quiz._id }, 201);
  } catch (error) {
    next(error);
  }
};

export const addQuestion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { questionText, points, options } = req.body;
    const quizId = req.params.quizId;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new CustomError('Quiz not found', 404);
    }

    // Verify exactly one option is correct
    const correctOptions = options.filter((o: any) => o.isCorrect === true);
    if (correctOptions.length !== 1) {
      throw new CustomError('A question must have exactly one correct option', 400);
    }

    const question = new Question({ quizId, questionText, points, options });
    await question.save();
    
    sendSuccess(res, 'Question added successfully', { questionId: question._id }, 201);
  } catch (error) {
    next(error);
  }
};
