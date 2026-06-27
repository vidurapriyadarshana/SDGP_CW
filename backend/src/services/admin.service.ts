import Category from '../models/Category';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import { CustomError } from '../utils/CustomError';

export const createCategory = async (name: string, description: string) => {
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new CustomError('Category name already exists', 400);
  }

  const category = new Category({ name, description });
  await category.save();
  
  return { categoryId: category._id };
};

export const createQuiz = async (
  categoryId: string, 
  title: string, 
  description: string, 
  timeLimit: number, 
  creatorId: string | undefined
) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new CustomError('Invalid category ID', 400);
  }

  const quiz = new Quiz({ 
    categoryId, 
    creatorId, 
    title, 
    description, 
    timeLimit 
  });
  await quiz.save();
  
  return { quizId: quiz._id };
};

export const addQuestion = async (
  quizId: string, 
  questionText: string, 
  points: number, 
  options: { optionText: string; isCorrect: boolean }[]
) => {
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
  
  return { questionId: question._id };
};
