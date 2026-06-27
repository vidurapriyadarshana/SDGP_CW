import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { getQuizLeaderboard } from '../api/student';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Trophy, Clock, Award, ArrowLeft, RefreshCw, BarChart2 } from 'lucide-react';

interface LeaderboardEntry {
  _id: string;
  userId: {
    _id: string;
    username: string;
  } | null;
  score: number;
  totalPoints: number;
  timeTakenSeconds: number;
  createdAt: string;
}

export default function Results() {
  const { quizId } = useParams<{ quizId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // State parsed from router navigation
  const stateResult = location.state?.result;
  const stateQuiz = location.state?.quiz;

  // Fetch States
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no state results are present, redirect to dashboard to prevent crash
    if (!stateResult) {
      navigate('/dashboard');
      return;
    }

    const fetchLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        const response = await getQuizLeaderboard(quizId!);
        setLeaderboard(response.data.data);
      } catch (err: any) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [quizId, stateResult, navigate]);

  if (!stateResult) {
    return null;
  }

  const percentage = Math.round(stateResult.percentage);
  const isPassed = percentage >= 50;

  // Format time taken helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-950/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-white uppercase">Quiz Results</h1>
          <p className="text-xs text-slate-400">{stateQuiz?.title || 'Attempt Finished'}</p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard')}
          variant="outline"
          className="border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white flex items-center gap-2 h-9 px-4 rounded-lg text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Exit to Dashboard
        </Button>
      </header>

      {/* Main content grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Left Side: Score card Summary */}
        <section className="lg:col-span-1 space-y-6">
          <Card className="border-slate-900 bg-slate-900/20 backdrop-blur-md text-center p-6 space-y-6">
            
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Performance</h2>
              <p className="text-sm text-slate-500">Graded attempt results</p>
            </div>

            {/* Score Ring SVG */}
            <div className="relative flex items-center justify-center mx-auto h-40 w-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  strokeWidth="8"
                  stroke="#0f172a"
                  fill="transparent"
                  className="stroke-slate-900"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  strokeWidth="8"
                  stroke={isPassed ? '#6366f1' : '#ef4444'}
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * percentage) / 100}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-white tracking-tight">{percentage}%</span>
                <span className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${isPassed ? 'text-indigo-400' : 'text-red-400'}`}>
                  {isPassed ? 'Passed' : 'Failed'}
                </span>
              </div>
            </div>

            {/* Stats row cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                <span className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-indigo-400" /> Score Ratio
                </span>
                <span className="text-lg font-bold text-white">
                  {stateResult.score} <span className="text-xs text-slate-500 font-normal">/ {stateResult.totalPoints}</span>
                </span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                <span className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-indigo-400" /> Time Taken
                </span>
                <span className="text-lg font-bold text-white">
                  {formatTime(stateResult.timeTakenSeconds)}
                </span>
              </div>
            </div>

            {/* Retake and back controls */}
            <div className="space-y-2 pt-4 border-t border-slate-900">
              <Button
                onClick={() => navigate(`/quiz/${quizId}/play`)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Retake Quiz Attempt
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white"
              >
                Back to Dashboard
              </Button>
            </div>

          </Card>
        </section>

        {/* Right Side: Leaderboard Panel */}
        <section className="lg:col-span-2 space-y-6">
          <Card className="border-slate-900 bg-slate-900/20 backdrop-blur-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500 animate-pulse" /> Quiz Leaderboard
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Top performing students on this quiz challenge
                </CardDescription>
              </div>
              {loadingLeaderboard && <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />}
            </div>

            {leaderboard.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm border border-slate-900 rounded-xl bg-slate-950/20">
                No leaderboard entries logged yet. Be the first to claim a rank!
              </div>
            ) : (
              <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950/20">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400">
                      <th className="p-4 font-semibold w-16">Rank</th>
                      <th className="p-4 font-semibold">Student</th>
                      <th className="p-4 font-semibold">Score</th>
                      <th className="p-4 font-semibold">Time</th>
                      <th className="p-4 font-semibold text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {leaderboard.map((entry, index) => {
                      const rank = index + 1;
                      const isTopRank = rank <= 3;
                      
                      return (
                        <tr key={entry._id} className="hover:bg-slate-900/30 transition-all text-slate-300">
                          <td className="p-4 font-bold">
                            {isTopRank ? (
                              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                                rank === 1 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                rank === 2 ? 'bg-slate-400/10 text-slate-300 border border-slate-400/20' :
                                'bg-amber-600/10 text-amber-500 border border-amber-600/20'
                              }`}>
                                {rank}
                              </span>
                            ) : (
                              <span className="text-slate-500 pl-2">{rank}</span>
                            )}
                          </td>
                          <td className="p-4 font-semibold text-white">
                            {entry.userId?.username || 'Anonymous student'}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-white">{entry.score}</span>
                            <span className="text-slate-500 text-xs font-normal"> / {entry.totalPoints}</span>
                          </td>
                          <td className="p-4 font-mono text-xs">{formatTime(entry.timeTakenSeconds)}</td>
                          <td className="p-4 text-right text-xs text-slate-500">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>

      </main>
    </div>
  );
}
