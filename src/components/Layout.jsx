import { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import EmergencyBroadcastModal from './realtime/EmergencyBroadcastModal';
import EvacuationMusterBanner from './realtime/EvacuationMusterBanner';
import ShiftGateModal from './realtime/ShiftGateModal';
import OfflineBanner from './OfflineBanner';
import { AuthContext } from '../context/AuthContext';
import { isManager } from '../utils/roles';
const Layout = ({ children }) => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useContext(AuthContext);
  const location = useLocation();

  const hideLayout = ['/login', '/signup'].includes(location.pathname);
  const showShiftGate = isAuthenticated && !isManager(user?.role) && location.pathname !== '/safety-check-in';

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated || hideLayout) {
    return <div className="app-shell-bg min-h-screen">{children}</div>;
  }

  return (
    <div className="app-shell-bg flex h-screen overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 shadow-lg">
        <OfflineBanner />
        <Navbar
          activePage={activePage}
          mobileMenuOpen={mobileMenuOpen}
          onMenuToggle={() => setMobileMenuOpen((open) => !open)}
        />
      </header>

      {mobileMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 top-16 z-40 bg-black/50 md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 overflow-hidden transition-transform duration-200 ease-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar setActivePage={setActivePage} onNavigate={() => setMobileMenuOpen(false)} />
      </aside>

      <main className="ml-0 md:ml-64 mt-16 flex-1 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden scrollbar-hidden p-3 md:p-5 pb-20">
        <div className="main-panel !overflow-visible">
          {children}
        </div>
      </main>
      <EmergencyBroadcastModal />
      <EvacuationMusterBanner />
      {showShiftGate && <ShiftGateModal />}
      <ToastContainer position="top-right" autoClose={5000} newestOnTop />
    </div>
  );
};

export default Layout;
