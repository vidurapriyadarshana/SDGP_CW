import Category from '../models/Category';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import User from '../models/User';
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

export const getCategories = async () => {
  return await Category.find();
};

export const getQuizzes = async () => {
  return await Quiz.find().populate('categoryId', 'name');
};

export const getUsers = async () => {
  return await User.find().select('-passwordHash').sort({ createdAt: -1 });
};

export const deleteUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new CustomError('User not found', 404);
  }
  await User.findByIdAndDelete(userId);
  return { message: 'User deleted successfully' };
};

export const deleteCategory = async (categoryId: string) => {
  const quizExists = await Quiz.exists({ categoryId });
  if (quizExists) {
    throw new CustomError('Cannot delete category because it has associated quizzes', 400);
  }
  const result = await Category.findByIdAndDelete(categoryId);
  if (!result) {
    throw new CustomError('Category not found', 404);
  }
  return { message: 'Category deleted successfully' };
};

export const deleteQuiz = async (quizId: string) => {
  const questionExists = await Question.exists({ quizId });
  if (questionExists) {
    throw new CustomError('Cannot delete quiz because it has associated questions', 400);
  }
  const result = await Quiz.findByIdAndDelete(quizId);
  if (!result) {
    throw new CustomError('Quiz not found', 404);
  }
  return { message: 'Quiz deleted successfully' };
};

export const deleteQuestion = async (questionId: string) => {
  const result = await Question.findByIdAndDelete(questionId);
  if (!result) {
    throw new CustomError('Question not found', 404);
  }
  return { message: 'Question deleted successfully' };
};

export const editQuestion = async (
  questionId: string, 
  questionText: string, 
  points: number, 
  options: { optionText: string; isCorrect: boolean }[]
) => {
  const question = await Question.findById(questionId);
  if (!question) {
    throw new CustomError('Question not found', 404);
  }

  const correctCount = options.filter(o => o.isCorrect === true).length;
  if (correctCount !== 1) {
    throw new CustomError('Exactly one option must be marked correct', 400);
  }

  const hasEmpty = options.some(o => !o.optionText.trim());
  if (hasEmpty) {
    throw new CustomError('All option texts must be filled', 400);
  }

  question.questionText = questionText;
  question.points = points;
  question.options = options;
  await question.save();

  return question;
};

export const getQuestionsForQuiz = async (quizId: string) => {
  return await Question.find({ quizId });
};
