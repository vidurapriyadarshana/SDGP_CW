import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizPlay, submitQuiz } from '../api/student';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Timer, AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Check } from 'lucide-react';

interface Option {
  _id: string;
  optionText: string;
}

interface Question {
  _id: string;
  questionText: string;
  points: number;
  options: Option[];
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  timeLimit: number; // in seconds
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function QuizPlay() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  // Data States
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Game States
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Toast notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const startedAtRef = useRef<string>(new Date().toISOString());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeCriticalToastRef = useRef(false);
  const loadedRef = useRef(false);

  // Add toast helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Fetch Quiz & Questions on Mount
  useEffect(() => {
    const fetchQuizPlay = async () => {
      setLoading(true);
      try {
        const response = await getQuizPlay(quizId!);
        const { quiz, questions } = response.data.data;
        setQuiz(quiz);
        setQuestions(questions);
        setTimeLeft(quiz.timeLimit);
        startedAtRef.current = new Date().toISOString();
        if (!loadedRef.current) {
          addToast('Quiz loaded successfully. Good luck!', 'info');
          loadedRef.current = true;
        }
      } catch (err: any) {
        console.error(err);
        setError(
          err.response?.data?.message || 
          err.response?.data?.error || 
          'Failed to load quiz details.'
        );
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizPlay();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizId]);

  // Timer Countdown Logic
  useEffect(() => {
    if (loading || error || timeLeft <= 0 || submitting) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, error, timeLeft, submitting]);

  // Alert for critical time
  useEffect(() => {
    if (timeLeft === 60 && !timeCriticalToastRef.current) {
      addToast('Only 1 minute remaining! Hurry up!', 'error');
      timeCriticalToastRef.current = true;
    }
  }, [timeLeft]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
    addToast('Answer saved', 'success');
  };

  const handleAutoSubmit = async () => {
    // Collect answers
    const answersPayload = questions.map((q) => ({
      questionId: q._id,
      selectedOptionId: selectedAnswers[q._id] || ''
    }));

    setSubmitting(true);
    try {
      const response = await submitQuiz(quizId!, {
        startedAt: startedAtRef.current,
        answers: answersPayload
      });
      
      const result = response.data.data;
      navigate(`/quiz/${quizId}/results`, { state: { result, quiz } });
    } catch (err: any) {
      console.error(err);
      alert('Time expired! Quiz was submitted, but some answers could not be evaluated.');
      navigate('/dashboard');
    }
  };

  const handleManualSubmit = () => {
    setShowConfirmModal(true);
  };

  const executeSubmit = async () => {
    setSubmitting(true);
    try {
      const answersPayload = questions.map((q) => ({
        questionId: q._id,
        selectedOptionId: selectedAnswers[q._id] || ''
      }));

      const response = await submitQuiz(quizId!, {
        startedAt: startedAtRef.current,
        answers: answersPayload
      });

      const result = response.data.data;
      navigate(`/quiz/${quizId}/results`, { state: { result, quiz } });
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Failed to submit quiz attempt.'
      );
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  // Time format helper (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 p-4">
        <Alert className="max-w-md bg-red-500/10 border-red-500/20 text-red-400 mb-6">
          <AlertDescription>{error || 'Unable to retrieve quiz play details.'}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/dashboard')} className="bg-slate-800 hover:bg-slate-700 text-white">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const isTimeCritical = timeLeft < 60; // Less than 1 minute left

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-950/20 blur-[120px] pointer-events-none" />

      {/* Play Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-white uppercase">{quiz.title}</h1>
          <p className="text-xs text-slate-400">
            Question {currentIdx + 1} of {questions.length}
          </p>
        </div>

        {/* Timer container */}
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
          isTimeCritical 
            ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' 
            : 'bg-slate-900/50 border-slate-800 text-indigo-400'
        }`}>
          <Timer className="h-4.5 w-4.5" />
          <span className="font-mono font-bold text-sm tracking-wider">{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-6 gap-6 relative z-10">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 space-y-4 shrink-0">
          <Card className="border-slate-900 bg-slate-900/20 backdrop-blur-md">
            <CardHeader className="p-4 border-b border-slate-900">
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Question Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = !!selectedAnswers[q._id];
                  const isActive = currentIdx === idx;
                  
                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-9 w-9 text-xs font-bold rounded-lg border transition-all flex items-center justify-center ${
                        isActive 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-105' 
                          : isAnswered 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-900 space-y-2.5">
                <div className="flex items-center text-xs text-slate-400 gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 border border-indigo-400" />
                  <span>Current Question</span>
                </div>
                <div className="flex items-center text-xs text-slate-400 gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center text-xs text-slate-400 gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-900 border border-slate-800" />
                  <span>Unvisited / Unanswered</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            onClick={handleManualSubmit}
            loading={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/10"
          >
            Submit Quiz
          </Button>
        </aside>

        {/* Playboard Question Container */}
        <main className="flex-1 space-y-6">
          {currentQuestion && (
            <Card className="border-slate-900 bg-slate-900/20 backdrop-blur-md p-6 space-y-6">
              
              {/* Question Headline */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-bold text-white leading-relaxed">
                  {currentQuestion.questionText}
                </h3>
                <span className="shrink-0 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {currentQuestion.points} pts
                </span>
              </div>

              {/* Options Grid */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt) => {
                  const isChecked = selectedAnswers[currentQuestion._id] === opt._id;

                  return (
                    <button
                      key={opt._id}
                      onClick={() => handleSelectOption(currentQuestion._id, opt._id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                        isChecked 
                          ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-md' 
                          : 'bg-slate-950/40 border-slate-900 text-slate-300 hover:bg-slate-900/50 hover:border-slate-800'
                      }`}
                    >
                      <span className="text-sm font-medium leading-relaxed pr-4">{opt.optionText}</span>
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        isChecked 
                          ? 'border-indigo-500 bg-indigo-500 text-white' 
                          : 'border-slate-700'
                      }`}>
                        {isChecked && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-900">
                <Button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => prev - 1)}
                  variant="ghost"
                  className="text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                </Button>

                {currentIdx < questions.length - 1 ? (
                  <Button
                    onClick={() => setCurrentIdx((prev) => prev + 1)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Next <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleManualSubmit}
                    loading={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Finish Test <CheckCircle2 className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>

            </Card>
          )}
        </main>

      </div>

      {/* CUSTOM CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md border border-slate-900 bg-slate-900/90 p-6 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-violet-500" />
            
            <div className="flex items-center space-x-3 text-indigo-400">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">Submit Quiz Attempt?</h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              You have answered <span className="font-bold text-white">{Object.keys(selectedAnswers).length}</span> out of <span className="font-bold text-white">{questions.length}</span> questions. 
              {questions.length - Object.keys(selectedAnswers).length > 0 && (
                <span className="text-red-400 block mt-2 font-semibold">
                  Warning: You still have {questions.length - Object.keys(selectedAnswers).length} unanswered questions.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-900">
              <Button
                onClick={() => setShowConfirmModal(false)}
                variant="ghost"
                className="text-slate-400 hover:text-white"
              >
                Go Back
              </Button>
              <Button
                onClick={executeSubmit}
                loading={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Submit & Finish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM TOASTS CONTAINER */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center space-x-2.5 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl animate-slideIn ${
              t.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : t.type === 'error'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {t.type === 'error' && <AlertTriangle className="h-4 w-4 shrink-0" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
