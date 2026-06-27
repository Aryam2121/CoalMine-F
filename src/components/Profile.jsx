import api from '../services/axios';
import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiShield, FiSettings, FiAward, FiCalendar } from 'react-icons/fi';
import PageShell from './ui/PageShell';
import Button from './ui/Button';
import LoadingBlock from './ui/LoadingBlock';
import { AuthContext } from '../context/AuthContext';
import { getRoleInfo, getRoleBadgeClass } from '../utils/roles';

const Profile = () => {
  const { user: authUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/leaderboard/me').catch(() => ({ data: {} })),
        ]);
        setUser(profileRes.data);
        setStats(statsRes.data?.stats ?? null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load profile');
        if (authUser) setUser(authUser);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authUser]);

  const getInitials = (name) =>
    (name || '?')
      .split(' ')
      .map((w) => w[0]?.toUpperCase())
      .join('')
      .slice(0, 2);

  const roleInfo = getRoleInfo(user?.role);

  if (loading) {
    return (
      <PageShell title="Profile" subtitle="Your account and activity">
        <LoadingBlock />
      </PageShell>
    );
  }

  if (error && !user) {
    return (
      <PageShell title="Profile">
        <p className="text-red-400">{error}</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Profile"
      subtitle="Account details, role, and training summary"
      action={
        <Button variant="secondary" onClick={() => navigate('/settings')}>
          <FiSettings className="inline mr-1" /> Edit settings
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 ops-panel"
        >
          <div className="ops-panel-body text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-700 text-mine-950 flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
              {getInitials(user?.name)}
            </div>
            <h2 className="mt-5 text-2xl font-bold text-white">{user?.name}</h2>
            <p className="text-slate-400 flex items-center justify-center gap-2 mt-2 text-sm">
              <FiMail /> {user?.email}
            </p>
            <span className={`inline-flex mt-4 items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${getRoleBadgeClass(user?.role)}`}>
              <FiShield /> {roleInfo.label}
            </span>
            <p className="mt-4 text-xs text-slate-500 leading-relaxed px-2">{roleInfo.description}</p>
            {user?.createdAt && (
              <p className="mt-4 text-xs text-slate-500 flex items-center justify-center gap-1">
                <FiCalendar /> Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </motion.div>

        <div className="lg:col-span-2 space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="ops-panel">
            <div className="ops-panel-header">
              <h3 className="font-semibold text-white">Role & access</h3>
            </div>
            <div className="ops-panel-body">
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-slate-500">Role</dt>
                  <dd className="text-white font-medium mt-1">{roleInfo.label}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Account ID</dt>
                  <dd className="text-white font-mono text-xs mt-1 truncate">{user?._id}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-slate-500">
                Your role controls which pages and actions are available. Contact an administrator to change your role.
              </p>
            </div>
          </motion.div>

          {stats && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="ops-panel">
              <div className="ops-panel-header flex items-center gap-2">
                <FiAward className="text-amber-400" />
                <h3 className="font-semibold text-white">Training stats</h3>
              </div>
              <div className="ops-panel-body">
                <div className="ops-kpi-grid !grid-cols-2 sm:!grid-cols-4">
                  {[
                    { label: 'Points', value: stats.totalPoints ?? 0 },
                    { label: 'Level', value: stats.level ?? 1 },
                    { label: 'Completed', value: stats.statistics?.trainingsCompleted ?? 0 },
                    { label: 'Rank', value: stats.rank ? `#${stats.rank}` : '—' },
                  ].map((s) => (
                    <div key={s.label} className="ops-kpi !p-3 border-slate-700/50">
                      <span className="ops-kpi-label">{s.label}</span>
                      <p className="ops-kpi-value !text-lg">{s.value}</p>
                    </div>
                  ))}
                </div>
                <Link to="/training" className="inline-block mt-4 text-sm text-amber-400 hover:underline">
                  Go to training center →
                </Link>
              </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="ops-panel">
            <div className="ops-panel-body flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => navigate('/settings')}>Account settings</Button>
              <Button variant="ghost" onClick={() => navigate('/attendance')}>Attendance</Button>
              <Button variant="ghost" onClick={() => navigate('/safety-report')}>Safety reports</Button>
            </div>
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
};

export default Profile;
