import api from '../utils/api';

export const getAdminCategories = () => api.get('/admin/categories');
export const getAdminQuizzes = () => api.get('/admin/quizzes');
export const getAdminUsers = () => api.get('/admin/users');
export const getAdminQuizQuestions = (quizId: string) => api.get(`/admin/quizzes/${quizId}/questions`);

export const createCategory = (data: { name: string; description: string }) => api.post('/admin/categories', data);
export const deleteCategory = (categoryId: string) => api.delete(`/admin/categories/${categoryId}`);

export const createQuiz = (data: { categoryId: string; title: string; description: string; timeLimit: number }) => api.post('/admin/quizzes', data);
export const deleteQuiz = (quizId: string) => api.delete(`/admin/quizzes/${quizId}`);

export const addQuestion = (quizId: string, data: any) => api.post(`/admin/quizzes/${quizId}/questions`, data);
export const updateQuestion = (questionId: string, data: any) => api.put(`/admin/questions/${questionId}`, data);
export const deleteQuestion = (questionId: string) => api.delete(`/admin/questions/${questionId}`);

export const deleteUser = (userId: string) => api.delete(`/admin/users/${userId}`);
export const inviteAdmin = (data: { username: string; email: string }) => api.post('/admin/create-admin', data);
