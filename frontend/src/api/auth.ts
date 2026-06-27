import api from '../utils/api';

export const getProfile = () => api.get('/auth/profile');
export const login = (data: any) => api.post('/auth/login', data);
export const verifyLogin = (data: any) => api.post('/auth/verify-login', data);
export const register = (data: any) => api.post('/auth/register', data);
export const verifyAccount = (data: any) => api.post('/auth/verify-account', data);
export const forgotPassword = (data: any) => api.post('/auth/forgot-password', data);
export const resetPassword = (data: any) => api.post('/auth/reset-password', data);
export const completeRegistration = (data: any) => api.post('/auth/complete-registration', data);
