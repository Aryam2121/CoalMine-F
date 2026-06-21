import api from '../services/axios';
import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import PageShell from './ui/PageShell';
import Button from './ui/Button';
import FormField from './ui/FormField';
import LoadingBlock from './ui/LoadingBlock';
import { FiUser, FiMail, FiLock, FiSun, FiMoon, FiBell, FiShield } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/AuthContext';
import { getRoleInfo, getRoleBadgeClass } from '../utils/roles';

const Settings = () => {
  const { user: authUser, login } = useContext(AuthContext);
  const [user, setUser] = useState({ name: '', email: '', password: '', _id: '' });
  const [theme, setTheme] = useState(localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light');
  const [notifications, setNotifications] = useState({
    alerts: true,
    email: true,
    training: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('account');

  useEffect(() => {
    const stored = localStorage.getItem('notificationPrefs');
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/users/me');
        setUser({ ...res.data, password: '' });
      } catch {
        if (authUser) setUser({ ...authUser, password: '' });
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, [authUser]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    const isDark = next === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', String(isDark));
    toast.info(`${isDark ? 'Dark' : 'Light'} mode enabled`);
  };

  const saveNotificationPrefs = () => {
    localStorage.setItem('notificationPrefs', JSON.stringify(notifications));
    toast.success('Notification preferences saved');
  };

  const handleSave = async () => {
    if (!user._id) return;
    setSaving(true);
    try {
      const payload = { name: user.name, email: user.email };
      if (user.password?.trim()) payload.password = user.password;
      const { data } = await api.put(`/users/profile/${user._id}`, payload);
      setUser(() => ({ ...data, password: '' }));
      login(data, localStorage.getItem('token'));
      toast.success('Profile updated');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const roleInfo = getRoleInfo(user?.role || authUser?.role);

  if (loading) {
    return (
      <PageShell title="Settings" subtitle="Loading…">
        <LoadingBlock />
      </PageShell>
    );
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: FiUser },
    { id: 'appearance', label: 'Appearance', icon: FiSun },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
  ];

  return (
    <PageShell title="Settings" subtitle="Manage your account, theme, and preferences">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-col lg:flex-row gap-6 max-w-4xl">
        <nav className="flex lg:flex-col gap-2 lg:w-48 shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                tab === t.id
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </nav>

        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 ops-panel"
        >
          <div className="ops-panel-body space-y-6">
            {tab === 'account' && (
              <>
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs ${getRoleBadgeClass(user.role)}`}>
                    <FiShield className="inline w-3 h-3 mr-1" />
                    {roleInfo.label}
                  </span>
                  <span className="text-xs text-slate-500">Role cannot be changed here</span>
                </div>
                <FormField label="Display name">
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 text-slate-500" />
                    <input className="input-field !pl-10" name="name" value={user.name} onChange={handleChange} />
                  </div>
                </FormField>
                <FormField label="Email">
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3 text-slate-500" />
                    <input className="input-field !pl-10" name="email" type="email" value={user.email} onChange={handleChange} />
                  </div>
                </FormField>
                <FormField label="New password" hint="Leave blank to keep current password">
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3 text-slate-500" />
                    <input
                      className="input-field !pl-10"
                      name="password"
                      type="password"
                      value={user.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </div>
                </FormField>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </>
            )}

            {tab === 'appearance' && (
              <>
                <p className="text-sm text-slate-400">Choose how the app looks on this device.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      theme === 'light' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <FiSun className="w-6 h-6 text-amber-400 mb-2" />
                    <p className="font-medium text-white">Light</p>
                    <p className="text-xs text-slate-500 mt-1">Bright panels for daylight use</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      theme === 'dark' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <FiMoon className="w-6 h-6 text-violet-400 mb-2" />
                    <p className="font-medium text-white">Dark</p>
                    <p className="text-xs text-slate-500 mt-1">Easier on eyes underground</p>
                  </button>
                </div>
              </>
            )}

            {tab === 'notifications' && (
              <>
                <p className="text-sm text-slate-400">Stored locally on this browser (demo preferences).</p>
                {[
                  { key: 'alerts', label: 'Safety alerts', desc: 'Critical mine alerts and SOS' },
                  { key: 'email', label: 'Email digests', desc: 'Weekly summary emails' },
                  { key: 'training', label: 'Training reminders', desc: 'Mandatory course deadlines' },
                ].map((pref) => (
                  <label
                    key={pref.key}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-800/30"
                  >
                    <div>
                      <p className="font-medium text-white text-sm">{pref.label}</p>
                      <p className="text-xs text-slate-500">{pref.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications[pref.key]}
                      onChange={(e) => setNotifications({ ...notifications, [pref.key]: e.target.checked })}
                      className="h-5 w-5 rounded border-slate-600 text-amber-500 focus:ring-amber-500"
                    />
                  </label>
                ))}
                <Button variant="secondary" onClick={saveNotificationPrefs}>Save preferences</Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
};

export default Settings;
