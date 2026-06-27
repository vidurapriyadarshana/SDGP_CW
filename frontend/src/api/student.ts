import api from '../utils/api';

export const getQuizzes = () => api.get('/student/quizzes');
export const getAttemptHistory = () => api.get('/student/attempts/history');
export const getQuizPlay = (quizId: string) => api.get(`/student/quizzes/${quizId}/play`);
export const submitQuiz = (quizId: string, data: any) => api.post(`/student/quizzes/${quizId}/submit`, data);
export const getQuizLeaderboard = (quizId: string) => api.get(`/student/quizzes/${quizId}/leaderboard`);
