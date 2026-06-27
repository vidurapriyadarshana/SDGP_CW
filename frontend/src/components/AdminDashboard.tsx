import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Plus, Trash2, LogOut, BookOpen, Users, Award, 
  ShieldAlert, ListPlus, ClipboardList, CheckCircle2, RefreshCw 
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  categoryId: {
    _id: string;
    name: string;
  };
}

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Student';
  isVerified: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/admin/login');
    logout();
  };
  const [activeTab, setActiveTab] = useState<'overview' | 'category' | 'quiz' | 'question' | 'admin' | 'students' | 'admins_list'>('overview');
  
  // Loaded Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form Loading & Feedback States
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // --- Category Form State ---
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');

  // --- Quiz Form State ---
  const [quizCategory, setQuizCategory] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizTime, setQuizTime] = useState(600); // 10 mins default

  // --- Question Form State ---
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionPoints, setQuestionPoints] = useState(5);
  const [options, setOptions] = useState<{ optionText: string; isCorrect: boolean }[]>([
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false }
  ]);

  // --- Create Admin Form State ---
  const [adminUser, setAdminUser] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // Fetch categories, quizzes, and users for forms
  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [catRes, quizRes, userRes] = await Promise.all([
        api.get('/admin/categories'),
        api.get('/admin/quizzes'),
        api.get('/admin/users')
      ]);
      setCategories(catRes.data.data);
      setQuizzes(quizRes.data.data);
      setUsers(userRes.data.data);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearFeedback = () => setFeedback(null);

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${username}"?`)) {
      return;
    }
    setLoadingData(true);
    clearFeedback();
    try {
      await api.delete(`/admin/users/${userId}`);
      setFeedback({ type: 'success', message: `User "${username}" was deleted successfully.` });
      fetchData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.response?.data?.error || 'Failed to delete user.'
      });
    } finally {
      setLoadingData(false);
    }
  };

  // Submit New Category
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    clearFeedback();

    try {
      await api.post('/admin/categories', { name: categoryName, description: categoryDesc });
      setFeedback({ type: 'success', message: `Category "${categoryName}" created successfully!` });
      setCategoryName('');
      setCategoryDesc('');
      fetchData(); // Refresh list
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.response?.data?.error || 'Failed to create category.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit New Quiz
  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizCategory) {
      setFeedback({ type: 'error', message: 'Please select a category.' });
      return;
    }
    setSubmitting(true);
    clearFeedback();

    try {
      await api.post('/admin/quizzes', {
        categoryId: quizCategory,
        title: quizTitle,
        description: quizDesc,
        timeLimit: Number(quizTime)
      });
      setFeedback({ type: 'success', message: `Quiz "${quizTitle}" created successfully!` });
      setQuizTitle('');
      setQuizDesc('');
      setQuizTime(600);
      setQuizCategory('');
      fetchData(); // Refresh list
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.response?.data?.error || 'Failed to create quiz.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Add Option Input Field
  const addOptionField = () => {
    setOptions([...options, { optionText: '', isCorrect: false }]);
  };

  // Remove Option Input Field
  const removeOptionField = (index: number) => {
    if (options.length <= 2) return; // Enforce at least 2 options
    setOptions(options.filter((_, i) => i !== index));
  };

  // Edit Option Text
  const handleOptionTextChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index].optionText = val;
    setOptions(updated);
  };

  // Set Single Correct Option
  const handleOptionCorrectChange = (index: number) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    setOptions(updated);
  };

  // Submit Question
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) {
      setFeedback({ type: 'error', message: 'Please select a quiz.' });
      return;
    }

    const correctCount = options.filter(o => o.isCorrect).length;
    if (correctCount !== 1) {
      setFeedback({ type: 'error', message: 'Please select exactly one correct option.' });
      return;
    }

    const hasEmptyOption = options.some(o => !o.optionText.trim());
    if (hasEmptyOption) {
      setFeedback({ type: 'error', message: 'All option texts must be filled.' });
      return;
    }

    setSubmitting(true);
    clearFeedback();

    try {
      await api.post(`/admin/quizzes/${selectedQuizId}/questions`, {
        questionText,
        points: Number(questionPoints),
        options
      });

      setFeedback({ type: 'success', message: 'Question successfully added to quiz!' });
      setQuestionText('');
      setQuestionPoints(5);
      setOptions([
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false }
      ]);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.response?.data?.error || 'Failed to add question.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit New Admin User
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    clearFeedback();

    try {
      await api.post('/admin/create-admin', {
        username: adminUser,
        email: adminEmail
      });
      setFeedback({ type: 'success', message: `Admin invitation successfully sent to "${adminEmail}"!` });
      setAdminUser('');
      setAdminEmail('');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.response?.data?.error || 'Failed to send admin invitation.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Premium Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white uppercase">Admin Portal</h1>
            <p className="text-xs text-slate-400">Logged in as {user?.username}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button 
            onClick={fetchData}
            variant="ghost" 
            className="text-slate-400 hover:text-white"
            title="Refresh Data"
            disabled={loadingData}
          >
            <RefreshCw className={`h-4.5 w-4.5 ${loadingData ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            onClick={handleLogout}
            className="bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 transition-all duration-300 gap-2 h-9 px-4 rounded-lg"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-64 border-r border-slate-900 bg-slate-900/10 p-4 space-y-2 shrink-0">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
            Dashboard Panels
          </p>

          <button
            onClick={() => { setActiveTab('overview'); clearFeedback(); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'overview' 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Award className="h-4.5 w-4.5" />
            <span>Overview Metrics</span>
          </button>

          <button
            onClick={() => { setActiveTab('category'); clearFeedback(); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'category' 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <ListPlus className="h-4.5 w-4.5" />
            <span>Create Category</span>
          </button>

          <button
            onClick={() => { setActiveTab('quiz'); clearFeedback(); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'quiz' 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <ClipboardList className="h-4.5 w-4.5" />
            <span>Create Quiz Config</span>
          </button>

          <button
            onClick={() => { setActiveTab('question'); clearFeedback(); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'question' 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Manage Questions</span>
          </button>

          <button
            onClick={() => { setActiveTab('admin'); clearFeedback(); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'admin' 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span>Register Admin</span>
          </button>

          <button
            onClick={() => { setActiveTab('students'); clearFeedback(); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'students' 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span>Manage Students</span>
          </button>

          <button
            onClick={() => { setActiveTab('admins_list'); clearFeedback(); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'admins_list' 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span>Manage Admins</span>
          </button>
        </nav>

        {/* Content Area */}
        <main className="flex-1 p-6 relative overflow-y-auto">
          {/* Global Form Feedback */}
          {feedback && (
            <Alert 
              className={`mb-6 max-w-2xl border ${
                feedback.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              <AlertDescription className="font-semibold flex items-center gap-2">
                {feedback.type === 'success' && <CheckCircle2 className="h-4.5 w-4.5" />}
                {feedback.message}
              </AlertDescription>
            </Alert>
          )}

          {/* OVERVIEW PANEL */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-4">Overview Metrics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-slate-900 bg-slate-900/40">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Total Quiz Formats</CardTitle>
                    <BookOpen className="h-5 w-5 text-indigo-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">{quizzes.length}</div>
                    <p className="text-xs text-slate-500 mt-1">Configured quiz pools</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-900 bg-slate-900/40">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Quiz Categories</CardTitle>
                    <ListPlus className="h-5 w-5 text-cyan-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">{categories.length}</div>
                    <p className="text-xs text-slate-500 mt-1">Distinct knowledge areas</p>
                  </CardContent>
                </Card>
              </div>

              {/* Show Quizzes List Table */}
              <div className="mt-8">
                <h3 className="text-base font-bold text-white mb-4">Configured Quizzes</h3>
                <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-900/20 backdrop-blur-md">
                  {quizzes.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      No quizzes configured yet. Navigate to the "Create Quiz Config" tab to add one.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400">
                          <th className="p-4 font-semibold">Quiz Title</th>
                          <th className="p-4 font-semibold">Category</th>
                          <th className="p-4 font-semibold">Time Limit</th>
                          <th className="p-4 font-semibold">Quiz ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {quizzes.map((quiz) => (
                          <tr key={quiz._id} className="hover:bg-slate-900/30 transition-all text-slate-300">
                            <td className="p-4 font-semibold text-white">{quiz.title}</td>
                            <td className="p-4">{quiz.categoryId?.name || 'Unassigned'}</td>
                            <td className="p-4">{Math.floor(quiz.timeLimit / 60)} minutes</td>
                            <td className="p-4 font-mono text-xs text-slate-500">{quiz._id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CREATE CATEGORY PANEL */}
          {activeTab === 'category' && (
            <div className="max-w-2xl animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-2">Create Quiz Category</h2>
              <p className="text-sm text-slate-400 mb-6">Group quizzes under general headings e.g. Mathematics, general trivia, logic puzzles.</p>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Category Name</label>
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="E.g., Software Engineering"
                    className="w-full h-11 px-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Description</label>
                  <textarea
                    required
                    value={categoryDesc}
                    onChange={(e) => setCategoryDesc(e.target.value)}
                    placeholder="Brief detail explaining the contents of the category..."
                    rows={4}
                    className="w-full p-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  loading={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-6 rounded-lg w-full sm:w-auto"
                >
                  Create Category
                </Button>
              </form>
            </div>
          )}

          {/* CREATE QUIZ CONFIG PANEL */}
          {activeTab === 'quiz' && (
            <div className="max-w-2xl animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-2">Configure New Quiz Format</h2>
              <p className="text-sm text-slate-400 mb-6">Define a title, instructions, and time limits for students.</p>

              {categories.length === 0 ? (
                <div className="p-8 rounded-xl border border-slate-900 bg-slate-950/50 text-center space-y-4">
                  <p className="text-sm text-slate-400">You must create at least one Category before you can create a Quiz configuration.</p>
                  <Button onClick={() => setActiveTab('category')} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Go Create Category
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleQuizSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Select Category</label>
                    <select
                      required
                      value={quizCategory}
                      onChange={(e) => setQuizCategory(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    >
                      <option value="" disabled className="bg-slate-950">-- Select a category --</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id} className="bg-slate-950">{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Quiz Title</label>
                    <input
                      type="text"
                      required
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="E.g., Web Architecture Basics"
                      className="w-full h-11 px-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Description</label>
                    <textarea
                      value={quizDesc}
                      onChange={(e) => setQuizDesc(e.target.value)}
                      placeholder="E.g. This quiz will test your knowledge on REST APIs, GraphQL, and client-server relations..."
                      rows={3}
                      className="w-full p-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Time Limit (in seconds)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={quizTime}
                      onChange={(e) => setQuizTime(Number(e.target.value))}
                      placeholder="600"
                      className="w-full h-11 px-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                    <p className="text-[11px] text-slate-500">600 seconds is equivalent to 10 minutes.</p>
                  </div>

                  <Button
                    type="submit"
                    loading={submitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-6 rounded-lg w-full sm:w-auto"
                  >
                    Create Quiz Configuration
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* MANAGE QUESTIONS PANEL */}
          {activeTab === 'question' && (
            <div className="max-w-2xl animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-2">Add Questions to Quiz</h2>
              <p className="text-sm text-slate-400 mb-6">Create multiple choice questions. Make sure exactly one choice option is checked correct.</p>

              {quizzes.length === 0 ? (
                <div className="p-8 rounded-xl border border-slate-900 bg-slate-950/50 text-center space-y-4">
                  <p className="text-sm text-slate-400">You must configure a Quiz first before you can append questions to it.</p>
                  <Button onClick={() => setActiveTab('quiz')} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Go Create Quiz
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleQuestionSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Select Quiz</label>
                    <select
                      required
                      value={selectedQuizId}
                      onChange={(e) => setSelectedQuizId(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    >
                      <option value="" disabled className="bg-slate-950">-- Select a quiz format --</option>
                      {quizzes.map((quiz) => (
                        <option key={quiz._id} value={quiz._id} className="bg-slate-950">{quiz.title} ({quiz.categoryId?.name})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Question Text</label>
                    <input
                      type="text"
                      required
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="E.g., Which protocol runs on port 80 by default?"
                      className="w-full h-11 px-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Award Points</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={questionPoints}
                      onChange={(e) => setQuestionPoints(Number(e.target.value))}
                      className="w-full h-11 px-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-300">Options / Answers Choices</label>
                      <button
                        type="button"
                        onClick={addOptionField}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Choice
                      </button>
                    </div>

                    <div className="space-y-3">
                      {options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                          <input
                            type="checkbox"
                            checked={opt.isCorrect}
                            onChange={() => handleOptionCorrectChange(idx)}
                            className="h-4.5 w-4.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/50 cursor-pointer"
                            title="Mark as correct"
                          />
                          
                          <input
                            type="text"
                            required
                            value={opt.optionText}
                            onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                            placeholder={`Choice option ${idx + 1}`}
                            className="flex-1 h-9 px-3 rounded border border-slate-800 bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                          />

                          <button
                            type="button"
                            onClick={() => removeOptionField(idx)}
                            disabled={options.length <= 2}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 transition disabled:opacity-30 disabled:pointer-events-none"
                            title="Delete Choice"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    loading={submitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-6 rounded-lg w-full sm:w-auto"
                  >
                    Add Question to Quiz
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* REGISTER ADMIN PANEL */}
          {activeTab === 'admin' && (
            <div className="max-w-2xl animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-2">Register Administrative User</h2>
              <p className="text-sm text-slate-400 mb-6">Create secondary admin accounts with full permissions to customize subjects, quizzes and questions.</p>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Admin Username</label>
                  <input
                    type="text"
                    required
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="admin_doe"
                    className="w-full h-11 px-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin.doe@quizapp.com"
                    className="w-full h-11 px-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>



                <Button
                  type="submit"
                  loading={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-6 rounded-lg w-full sm:w-auto"
                >
                  Register Admin Account
                </Button>
              </form>
            </div>
          )}

          {/* MANAGE STUDENTS PANEL */}
          {activeTab === 'students' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-2">Manage Students</h2>
              <p className="text-sm text-slate-400 mb-6">List and delete registered student accounts.</p>

              <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-900/20 backdrop-blur-md">
                {users.filter(u => u.role === 'Student').length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No students registered yet.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400">
                        <th className="p-4 font-semibold">Username</th>
                        <th className="p-4 font-semibold">Email</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {users.filter(u => u.role === 'Student').map((u) => (
                        <tr key={u._id} className="hover:bg-slate-900/30 transition-all text-slate-300">
                          <td className="p-4 font-semibold text-white">{u.username}</td>
                          <td className="p-4">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              u.isVerified 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : 'bg-yellow-500/10 text-yellow-500'
                            }`}>
                              {u.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(u._id, u.username)}
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 transition"
                              title="Delete Student"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* MANAGE ADMINS PANEL */}
          {activeTab === 'admins_list' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-2">Manage Administrators</h2>
              <p className="text-sm text-slate-400 mb-6">List and delete administrative accounts.</p>

              <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-900/20 backdrop-blur-md">
                {users.filter(u => u.role === 'Admin').length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No administrators found.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400">
                        <th className="p-4 font-semibold">Username</th>
                        <th className="p-4 font-semibold">Email</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {users.filter(u => u.role === 'Admin').map((u) => (
                        <tr key={u._id} className="hover:bg-slate-900/30 transition-all text-slate-300">
                          <td className="p-4 font-semibold text-white">{u.username}</td>
                          <td className="p-4">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              u.isVerified 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : 'bg-yellow-500/10 text-yellow-500'
                            }`}>
                              {u.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(u._id, u.username)}
                              disabled={u._id === user?.id} // Cannot delete self
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 transition disabled:opacity-30 disabled:pointer-events-none"
                              title={u._id === user?.id ? "You cannot delete your own account" : "Delete Admin"}
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
