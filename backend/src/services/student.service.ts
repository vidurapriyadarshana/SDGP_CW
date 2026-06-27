import Quiz from '../models/Quiz';
import Question from '../models/Question';
import Attempt from '../models/Attempt';
import { CustomError } from '../utils/CustomError';

export const getQuizzes = async () => {
  return await Quiz.find().populate('categoryId', 'name');
};

export const startQuizAttempt = async (quizId: string) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new CustomError('Quiz not found', 404);
  }
  
  // Exclude correctness data to prevent Inspect sniff cheating
  const questions = await Question.find({ quizId }).select('-options.isCorrect');
  return {
    quiz,
    questions
  };
};

export const submitQuizAttempt = async (
  quizId: string, 
  userId: string | undefined, 
  answers: { questionId: string; selectedOptionId: string | null }[], 
  startedAt: string
) => {
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

  return {
    attemptId: attempt._id,
    score: totalScore,
    totalPoints: maxPoints,
    percentage: maxPoints > 0 ? (totalScore / maxPoints) * 100 : 0,
    timeTakenSeconds: timeTaken
  };
};

export const getAttemptsHistory = async (userId: string | undefined) => {
  return await Attempt.find({ userId }).populate('quizId', 'title');
};

export const getLeaderboard = async (quizId: string) => {
  return await Attempt.find({ quizId })
    .populate('userId', 'username')
    .sort({ score: -1, timeTakenSeconds: 1 })
    .limit(10);
};
