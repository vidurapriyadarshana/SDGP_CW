import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { 
  Play, BookOpen, Calendar, History, Trophy, LogOut, 
  ArrowRight, Sparkles, RefreshCw, Clock 
} from 'lucide-react';

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

interface Attempt {
  _id: string;
  score: number;
  totalPoints: number;
  timeTakenSeconds: number;
  submittedAt: string;
  quizId: {
    _id: string;
    title: string;
  } | null;
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [quizRes, attemptRes] = await Promise.all([
        api.get('/student/quizzes'),
        api.get('/student/attempts/history')
      ]);
      setQuizzes(quizRes.data.data);
      setAttempts(attemptRes.data.data);
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartQuiz = (quizId: string) => {
    navigate(`/quiz/${quizId}/play`);
  };

  const getBestScore = () => {
    if (attempts.length === 0) return '0%';
    const percentages = attempts.map(a => 
      a.totalPoints > 0 ? (a.score / a.totalPoints) * 100 : 0
    );
    return `${Math.round(Math.max(...percentages))}%`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-950/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Quiz Center</h1>
            <p className="text-xs text-slate-400">Welcome back, {user?.username} (Student)</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button 
            onClick={fetchData}
            variant="ghost" 
            className="text-slate-400 hover:text-white"
            title="Refresh Data"
            disabled={loading}
          >
            <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            onClick={logout}
            className="bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-white transition-all duration-300 gap-2 h-9 px-4 rounded-lg"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8 z-10">
        
        {/* Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Quizzes Attempted</CardTitle>
              <History className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{attempts.length}</div>
              <p className="text-xs text-slate-500 mt-1">Total completed attempts</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Personal Best</CardTitle>
              <Trophy className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{getBestScore()}</div>
              <p className="text-xs text-slate-500 mt-1">Highest percentage achieved</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Available Quizzes</CardTitle>
              <BookOpen className="h-5 w-5 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{quizzes.length}</div>
              <p className="text-xs text-slate-500 mt-1">Challenge categories active</p>
            </CardContent>
          </Card>
        </section>

        {/* Content Section Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Available Quizzes */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-400" /> Active Quizzes
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 rounded-xl bg-slate-800/30 animate-pulse border border-slate-800/50" />
                ))}
              </div>
            ) : quizzes.length === 0 ? (
              <Card className="border-slate-800 bg-slate-900/20 p-8 text-center text-slate-500">
                No active quizzes found. Please ask an Admin user to create a quiz configuration.
              </Card>
            ) : (
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <Card key={quiz._id} className="border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          {quiz.categoryId?.name || 'General'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {Math.round(quiz.timeLimit / 60)}m
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-white mt-2">{quiz.title}</CardTitle>
                      <CardDescription className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {quiz.description || 'No description provided.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-end pt-2">
                      <Button
                        onClick={() => handleStartQuiz(quiz._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 rounded-lg flex items-center gap-2 transition-all"
                      >
                        Start Challenge <Play className="h-3 w-3 fill-current" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right: Attempt History */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-400" /> Recent Attempts
            </h2>

            {loading ? (
              <div className="h-64 rounded-xl bg-slate-800/30 animate-pulse border border-slate-800/50" />
            ) : attempts.length === 0 ? (
              <Card className="border-slate-800 bg-slate-900/20 p-8 text-center text-slate-500">
                You haven't completed any quiz attempts yet. Your scorecards will appear here.
              </Card>
            ) : (
              <div className="space-y-3">
                {attempts.map((attempt) => {
                  const percent = attempt.totalPoints > 0 
                    ? Math.round((attempt.score / attempt.totalPoints) * 100) 
                    : 0;
                  
                  return (
                    <Card key={attempt._id} className="border-slate-800 bg-slate-900/50 text-slate-300">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                            {attempt.quizId?.title || 'Unknown Quiz'}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            percent >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                            percent >= 50 ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {percent}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Time: {attempt.timeTakenSeconds}s
                          </span>
                          <span>Score: {attempt.score}/{attempt.totalPoints}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {new Date(attempt.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
