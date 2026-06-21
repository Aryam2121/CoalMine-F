import api from '../services/axios';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Award, TrendingUp, BookOpen, Medal, Play } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from './ui/Button';
import LoadingBlock from './ui/LoadingBlock';
import EmptyState from './ui/EmptyState';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'safety_procedures', label: 'Safety', icon: '🛡️' },
  { value: 'equipment_operation', label: 'Equipment', icon: '⚙️' },
  { value: 'emergency_response', label: 'Emergency', icon: '🚨' },
  { value: 'health_hazards', label: 'Health', icon: '⚕️' },
  { value: 'compliance', label: 'Compliance', icon: '📋' },
  { value: 'first_aid', label: 'First aid', icon: '🩹' },
];

const categoryIcon = (cat) => CATEGORIES.find((c) => c.value === cat)?.icon || '📚';

const difficultyClass = (d) => {
  const map = {
    beginner: 'risk-pill--low',
    intermediate: 'status-pill--in-progress',
    advanced: 'risk-pill--medium',
    expert: 'risk-pill--high',
  };
  return map[d] || 'status-pill--draft';
};

const TrainingGamification = () => {
  const [trainings, setTrainings] = useState([]);
  const [myTrainings, setMyTrainings] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [activeTab, setActiveTab] = useState('available');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [progressingId, setProgressingId] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, mRes, lRes, sRes] = await Promise.all([
        api.get('/trainings', { params: { isActive: true } }),
        api.get('/user/trainings'),
        api.get('/leaderboard', { params: { limit: 10 } }),
        api.get('/leaderboard/me'),
      ]);
      setTrainings(tRes.data?.trainings ?? []);
      setMyTrainings(mRes.data?.trainings ?? []);
      setLeaderboard(lRes.data?.leaderboard ?? []);
      setMyStats(sRes.data?.stats ?? null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load training data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const enrollInTraining = async (trainingId) => {
    try {
      await api.post(`/training/${trainingId}/enroll`);
      toast.success('Enrolled successfully');
      loadAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Enrollment failed');
    }
  };

  const continueTraining = async (training) => {
    const id = training._id || training.trainingId;
    const nextProgress = Math.min(100, (training.progress || 0) + 25);
    const score = Math.min(100, (training.score || 70) + 5);
    setProgressingId(id);
    try {
      await api.patch(`/training/${id}/progress`, {
        progress: nextProgress,
        score: nextProgress >= 100 ? Math.max(score, 75) : score,
        timeSpent: 15,
      });
      toast.success(nextProgress >= 100 ? 'Course completed! Points awarded.' : `Progress: ${nextProgress}%`);
      loadAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not update progress');
    } finally {
      setProgressingId(null);
    }
  };

  const filteredTrainings = useMemo(
    () => (selectedCategory === 'all' ? trainings : trainings.filter((t) => t.category === selectedCategory)),
    [trainings, selectedCategory]
  );

  const rankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) return <LoadingBlock label="Loading training center…" />;

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {myStats && (
        <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/50 via-slate-900/80 to-blue-950/50 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="text-amber-400" /> Your progress
          </h2>
          <div className="ops-kpi-grid !grid-cols-2 sm:!grid-cols-5">
            {[
              { label: 'Rank', value: rankBadge(myStats.rank), icon: <Trophy className="text-amber-400 w-4 h-4" /> },
              { label: 'Points', value: myStats.totalPoints ?? 0, icon: <Star className="text-amber-400 w-4 h-4" /> },
              { label: 'Level', value: myStats.level ?? 1, icon: <TrendingUp className="text-emerald-400 w-4 h-4" /> },
              { label: 'Completed', value: myStats.statistics?.trainingsCompleted ?? 0, icon: <BookOpen className="text-blue-400 w-4 h-4" /> },
              { label: 'Badges', value: myStats.badges?.length ?? 0, icon: <Award className="text-violet-400 w-4 h-4" /> },
            ].map((s) => (
              <div key={s.label} className="ops-kpi !p-3 border-slate-700/50 bg-black/20">
                <div className="flex items-center gap-2 ops-kpi-label">{s.icon}{s.label}</div>
                <p className="ops-kpi-value !text-xl">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'available', label: 'Courses' },
          { id: 'my-trainings', label: 'My learning' },
          { id: 'leaderboard', label: 'Leaderboard' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === t.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'available' && (
        <>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setSelectedCategory(c.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  selectedCategory === c.value
                    ? 'border-amber-500/50 bg-amber-500/15 text-amber-200'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {c.icon && `${c.icon} `}{c.label}
              </button>
            ))}
          </div>

          {filteredTrainings.length === 0 ? (
            <EmptyState title="No courses" message="No training modules match this category." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTrainings.map((training, i) => (
                <motion.div
                  key={training._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="ops-panel"
                >
                  <div className="ops-panel-body space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-2xl">{categoryIcon(training.category)}</span>
                      <span className={difficultyClass(training.difficulty)}>{training.difficulty}</span>
                    </div>
                    <h3 className="font-semibold text-white">{training.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{training.description}</p>
                    <div className="flex gap-3 text-xs text-slate-500">
                      <span>⏱ {training.duration} min</span>
                      <span>⭐ {training.points} pts</span>
                    </div>
                    {training.isMandatory && (
                      <span className="risk-pill--high text-xs">Mandatory</span>
                    )}
                    <Button className="w-full !py-2" onClick={() => enrollInTraining(training._id)}>
                      Enroll
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'my-trainings' && (
        <div className="space-y-4">
          {myTrainings.length === 0 ? (
            <EmptyState
              title="No enrollments"
              message="Browse courses and enroll to start earning points."
              action={<Button onClick={() => setActiveTab('available')}>Browse courses</Button>}
            />
          ) : (
            myTrainings.map((training) => (
              <div key={training._id} className="ops-panel">
                <div className="ops-panel-body">
                  <div className="flex flex-wrap justify-between gap-4 mb-3">
                    <div className="flex gap-3">
                      <span className="text-2xl">{categoryIcon(training.category)}</span>
                      <div>
                        <h3 className="font-semibold text-white">{training.title}</h3>
                        <p className="text-sm text-slate-400">{training.description}</p>
                      </div>
                    </div>
                    {training.completed && (
                      <span className="status-pill--reviewed flex items-center gap-1">
                        <Medal className="w-4 h-4" /> Done
                      </span>
                    )}
                  </div>
                  <div className="mb-2 flex justify-between text-xs text-slate-400">
                    <span>Progress {training.progress ?? 0}%</span>
                    {training.score != null && <span>Score {training.score}%</span>}
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${training.completed ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${training.progress ?? 0}%` }}
                    />
                  </div>
                  {!training.completed && (
                    <Button
                      className="mt-4 w-full !py-2"
                      variant="secondary"
                      disabled={progressingId === training._id}
                      onClick={() => continueTraining(training)}
                    >
                      <Play className="w-4 h-4 inline mr-1" />
                      {progressingId === training._id ? 'Updating…' : 'Continue (+25%)'}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="ops-panel">
          <div className="ops-panel-header">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Trophy className="text-amber-400" /> Top performers
            </h3>
          </div>
          <div className="ops-panel-body space-y-2">
            {leaderboard.length === 0 ? (
              <p className="text-slate-500 text-sm">No leaderboard data yet.</p>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={entry._id || index}
                  className={`flex items-center gap-4 p-3 rounded-xl ${
                    index < 3 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-slate-800/40'
                  }`}
                >
                  <span className="text-xl font-bold w-10 text-center">{rankBadge(entry.rank ?? index + 1)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{entry.userId?.name || 'Miner'}</p>
                    <p className="text-xs text-slate-500">{entry.userId?.role || 'Worker'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-300">{entry.totalPoints ?? 0} pts</p>
                    <p className="text-xs text-slate-500">Lv {entry.level ?? 1}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingGamification;
