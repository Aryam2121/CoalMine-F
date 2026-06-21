import { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { getRoleInfo, getRoleBadgeClass } from '../utils/roles';

const Navbar = ({ activePage }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const roleInfo = getRoleInfo(user?.role);

  return (
    <div className="flex items-center justify-between gap-4 px-4 md:px-6 py-3 bg-mine-900/95 backdrop-blur-md text-white">
      <Link to="/" className="flex items-center gap-3 shrink-0 group">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-mine-950 font-bold text-lg shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
          ⛏
        </span>
        <div className="hidden sm:block">
          <span className="font-bold text-base leading-tight block">Mine Manager</span>
          <span className="text-[11px] text-slate-400">{activePage || 'Operations'}</span>
        </div>
      </Link>

      <div className="hidden lg:flex flex-1 max-w-md mx-4">
        <div className="flex w-full items-center rounded-xl bg-white/5 border border-white/10 px-4 py-2 focus-within:border-amber-500/40 focus-within:ring-1 focus-within:ring-amber-500/20 transition">
          <span className="text-slate-500 mr-2">⌕</span>
          <input
            type="search"
            placeholder={`Search ${activePage || 'dashboard'}…`}
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/alerts"
          className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition"
          aria-label="Alerts"
        >
          🔔
        </Link>

        <button
          type="button"
          onClick={() => setIsDarkMode((d) => !d)}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition text-lg"
          aria-label="Toggle theme"
        >
          {isDarkMode ? '🌙' : '☀️'}
        </button>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl pl-1 pr-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 transition"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold">
              {initials}
            </span>
            <span className="hidden md:block text-left leading-tight max-w-[120px]">
              <span className="block text-sm font-medium truncate">{user?.name}</span>
              <span className="block text-[10px] text-slate-400 truncate">{roleInfo.label}</span>
            </span>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-700/80 bg-gradient-to-r from-slate-800/50 to-transparent">
                  <p className="text-sm font-semibold truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  <span className={`inline-flex mt-2 items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getRoleBadgeClass(user?.role)}`}>
                    {roleInfo.label}
                  </span>
                </div>
                <ul className="py-1 text-sm">
                  <li>
                    <button
                      type="button"
                      onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-white/5"
                    >
                      Profile
                    </button>
                  </li>
                  <li>
                    <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2.5 hover:bg-white/5">
                      Settings
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => { logout(); navigate('/login'); }}
                      className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-red-500/10"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
