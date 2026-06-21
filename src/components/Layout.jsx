import { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import EmergencyBroadcastModal from './realtime/EmergencyBroadcastModal';
import ShiftGateModal from './realtime/ShiftGateModal';
import { AuthContext } from '../context/AuthContext';
import { isManager } from '../utils/roles';
const Layout = ({ children }) => {
  const [activePage, setActivePage] = useState('Dashboard');
  const { isAuthenticated, user } = useContext(AuthContext);
  const location = useLocation();

  const hideLayout = ['/login', '/signup'].includes(location.pathname);
  const showShiftGate = isAuthenticated && !isManager(user?.role) && location.pathname !== '/safety-check-in';

  if (!isAuthenticated || hideLayout) {
    return <div className="app-shell-bg min-h-screen">{children}</div>;
  }

  return (
    <div className="app-shell-bg flex h-screen overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 shadow-lg">
        <Navbar activePage={activePage} />
      </header>

      <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 md:block overflow-hidden">
        <Sidebar setActivePage={setActivePage} activePage={activePage} />
      </aside>

      <main className="ml-0 md:ml-64 mt-16 flex-1 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden scrollbar-hidden p-3 md:p-5">
        <div className="main-panel !overflow-visible">
          {children}
        </div>
      </main>
      <EmergencyBroadcastModal />
      {showShiftGate && <ShiftGateModal />}
      <ToastContainer position="top-right" autoClose={5000} newestOnTop />
    </div>
  );
};

export default Layout;
