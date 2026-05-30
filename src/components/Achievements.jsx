import React, { useState, useEffect, useMemo, useContext } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Award } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/axios';
import { AuthContext } from '../context/AuthContext';
import { isAdmin } from '../utils/roles';
import PageShell from './ui/PageShell';
import Button from './ui/Button';
import LoadingBlock from './ui/LoadingBlock';
import EmptyState from './ui/EmptyState';

const Achievements = () => {
  const { user } = useContext(AuthContext);
  const showAdminActions = isAdmin(user?.role);
  const [completedAchievements, setCompletedAchievements] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [activeFilter, setActiveFilter] = useState('All');
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [achRes, lbRes] = await Promise.all([
          api.get('/getAchieve'),
          api.get('/leaderboard', { params: { limit: 5 } }).catch(() => ({ data: {} })),
        ]);
        if (achRes.data?.success) setAchievements(achRes.data.data || []);
        setLeaderboard(lbRes.data?.leaderboard ?? []);
      } catch {
        toast.error('Failed to load achievements');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAchievementCompletion = async (achievementId, progressKey, target) => {
    if (!progressKey || (userProgress[progressKey] || 0) >= target) return;
    try {
      const updatedValue = (userProgress[progressKey] || 0) + 1;
      await api.put(`/achievements/${achievementId}`, { progressKey, progress: updatedValue });
      setUserProgress((prev) => ({ ...prev, [progressKey]: updatedValue }));
      if (updatedValue >= target) {
        setCompletedAchievements((prev) => [...prev, achievementId]);
        const name = achievements.find((a) => a._id === achievementId)?.name;
        toast.success(`Unlocked: ${name}`);
      } else {
        toast.success('Progress saved');
      }
    } catch {
      toast.error('Failed to update progress');
    }
  };

  const deleteAchievement = async (achievementId) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await api.delete(`/achievements/${achievementId}`);
      setAchievements((prev) => prev.filter((a) => a._id !== achievementId));
      toast.success('Achievement removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filteredAchievements = achievements.filter((achievement) => {
    const progress = userProgress[achievement.progressKey] || 0;
    if (activeFilter === 'Completed') return progress >= achievement.target;
    if (activeFilter === 'In-Progress') return progress < achievement.target;
    return true;
  });

  const stats = useMemo(
    () => ({
      total: achievements.length,
      completed: achievements.filter((a) => (userProgress[a.progressKey] || 0) >= a.target).length,
      inProgress: achievements.filter((a) => (userProgress[a.progressKey] || 0) < a.target).length,
    }),
    [achievements, userProgress]
  );

  return (
    <PageShell title="Achievements" subtitle="Safety milestones, streaks, and team recognition" variant="dark">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="ops-kpi-grid mb-6">
        {[
          { label: 'Total badges', value: stats.total, icon: <Award className="text-violet-400" /> },
          { label: 'Completed', value: stats.completed, icon: <Trophy className="text-amber-400" /> },
          { label: 'In progress', value: stats.inProgress, icon: <Target className="text-blue-400" /> },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="ops-kpi border-slate-700/70 bg-slate-900/50"
          >
            <div className="flex justify-between mb-1">{kpi.icon}<span className="ops-kpi-label">{kpi.label}</span></div>
            <p className="ops-kpi-value">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {leaderboard.length > 0 && (
        <div className="ops-panel mb-6">
          <div className="ops-panel-header">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Star className="text-amber-400 w-4 h-4" /> Top miners
            </h3>
          </div>
          <div className="ops-panel-body flex flex-wrap gap-3">
            {leaderboard.slice(0, 5).map((entry, i) => (
              <div key={entry._id || i} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">
                <span className="text-amber-400 font-bold mr-2">#{entry.rank ?? i + 1}</span>
                <span className="text-white">{entry.userId?.name || 'Miner'}</span>
                <span className="text-slate-500 ml-2">{entry.totalPoints ?? 0} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {['All', 'Completed', 'In-Progress'].map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeFilter === filter
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 border border-slate-700 hover:border-slate-600'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingBlock label="Loading achievements…" />
      ) : filteredAchievements.length === 0 ? (
        <EmptyState
          title="No achievements"
          message="Run seed script on the backend or add achievements via API."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement, i) => {
            const progress = userProgress[achievement.progressKey] || 0;
            const pct = Math.min(100, (progress / achievement.target) * 100);
            const done = progress >= achievement.target || completedAchievements.includes(achievement._id);
            return (
              <motion.div
                key={achievement._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`ops-panel ${done ? 'ring-1 ring-amber-500/40' : ''}`}
              >
                <div className="ops-panel-body space-y-3">
                  <div className="flex justify-between items-start">
                    <Trophy className={`w-6 h-6 ${done ? 'text-amber-400' : 'text-slate-600'}`} />
                    {done && <span className="status-pill--reviewed text-[10px]">Unlocked</span>}
                  </div>
                  <h3 className="font-semibold text-white">{achievement.name}</h3>
                  <p className="text-sm text-slate-400">{achievement.description}</p>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{progress} / {achievement.target}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 !py-2"
                      disabled={done}
                      onClick={() =>
                        handleAchievementCompletion(achievement._id, achievement.progressKey, achievement.target)
                      }
                    >
                      {done ? 'Completed' : '+1 Progress'}
                    </Button>
                    {showAdminActions && (
                      <Button variant="danger" className="!py-2" onClick={() => deleteAchievement(achievement._id)}>
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
};

export default Achievements;
