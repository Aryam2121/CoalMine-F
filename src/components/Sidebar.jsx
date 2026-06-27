import { useMemo, useContext } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import {

  FaTachometerAlt,

  FaTasks,

  FaCalendarAlt,

  FaChartBar,

  FaUsers,

  FaFileAlt,

  FaCloud,

  FaRegBuilding,

  FaTools,

  FaExclamationCircle,

  FaBell,

  FaSignOutAlt,

  FaHardHat,

  FaClipboardCheck,

  FaCog,

  FaUserCircle,

  FaRobot,

  FaTrophy,

  FaAmbulance,

  FaGraduationCap,

  FaBrain,

  FaHistory,
  FaBroadcastTower,
  FaWrench,
  FaComments,
  FaChartLine,
  FaShieldAlt,
  FaClipboardList,
  FaRoute,
  FaFireExtinguisher,
  FaMapSigns,
  FaUserFriends,
} from 'react-icons/fa';

import { AuthContext } from '../context/AuthContext';

import { filterMenuForRole, getRoleInfo, getRoleBadgeClass, MENU_SECTIONS } from '../utils/roles';

const ICONS = {
  '/': <FaTachometerAlt />,
  '/live-operations': <FaBroadcastTower />,
  '/coal-mines': <FaHardHat />,
  '/shift-logs': <FaTasks />,
  '/attendance': <FaClipboardCheck />,
  '/safety-check-in': <FaClipboardCheck />,
  '/maintenance': <FaWrench />,
  '/team-chat': <FaComments />,
  '/safety-plan': <FaCalendarAlt />,
  '/alerts': <FaExclamationCircle />,
  '/emergency': <FaAmbulance />,
  '/safety-report': <FaFileAlt />,
  '/capa': <FaShieldAlt />,
  '/compliance-reports': <FaFileAlt />,
  '/compliance-center': <FaShieldAlt />,
  '/training': <FaGraduationCap />,
  '/resources': <FaRegBuilding />,
  '/inventory': <FaTools />,
  '/weather': <FaCloud />,
  '/executive': <FaChartLine />,
  '/predictive-analytics': <FaBrain />,
  '/predictive-maintenance': <FaWrench />,
  '/data-visualization': <FaChartBar />,
  '/report-generation': <FaClipboardList />,
  '/audit-logs': <FaHistory />,
  '/notifications': <FaBell />,
  '/achievements': <FaTrophy />,
  '/chatbot': <FaRobot />,
  '/user-management': <FaUsers />,
  '/evacuation': <FaRoute />,
  '/near-miss': <FaExclamationCircle />,
  '/safety-drills': <FaFireExtinguisher />,
  '/work-permits': <FaClipboardList />,
  '/equipment-registry': <FaTools />,
  '/hazard-zones': <FaMapSigns />,
  '/contractors': <FaUserFriends />,
  '/incident-forecast': <FaChartBar />,
};

const Sidebar = ({ setActivePage, onNavigate }) => {

  const { logout, user } = useContext(AuthContext);

  const navigate = useNavigate();

  const location = useLocation();

  const roleInfo = getRoleInfo(user?.role);

  const menuSections = useMemo(() => {
    const withIcons = MENU_SECTIONS.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        icon: ICONS[item.to] || <FaTachometerAlt />,
      })),
    }));
    return filterMenuForRole(withIcons, user?.role);
  }, [user?.role]);



  const isActive = (path) => {

    if (path === '/') return location.pathname === '/';

    return location.pathname.toLowerCase().startsWith(path.toLowerCase());

  };



  return (

    <div className="flex h-full w-full flex-col overflow-hidden bg-gradient-to-b from-mine-900 to-mine-950 border-r border-white/5">

      <div className="px-4 py-4 border-b border-white/5">

        <p className="text-[10px] uppercase tracking-widest text-amber-500/90 font-semibold">Signed in</p>

        <p className="text-sm font-semibold text-white truncate mt-0.5">{user?.name || 'User'}</p>

        <span className={`inline-flex mt-2 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${getRoleBadgeClass(user?.role)}`}>
          {roleInfo.label}
        </span>

      </div>



      <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hidden overscroll-contain px-2 py-3">

        {menuSections.map((section) => (

          <div key={section.label} className="mb-4">

            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">

              {section.label}

            </p>

            <ul className="space-y-0.5">

              {section.items.map((item) => (

                <li key={item.to}>

                  <Link

                    to={item.to}

                    onClick={() => {
                      setActivePage?.(item.label);
                      onNavigate?.();
                    }}

                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${

                      isActive(item.to)

                        ? 'bg-gradient-to-r from-amber-500/90 to-amber-600 text-mine-950 shadow-md shadow-amber-500/20'

                        : 'text-slate-400 hover:text-white hover:bg-white/5'

                    }`}

                  >

                    <span className="text-base opacity-90">{item.icon}</span>

                    <span>{item.label}</span>

                  </Link>

                </li>

              ))}

            </ul>

          </div>

        ))}

      </nav>



      <div className="border-t border-white/5 p-2 space-y-0.5">

        <Link

          to="/profile"
          onClick={() => onNavigate?.()}

          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5"

        >

          <FaUserCircle /> Profile

        </Link>

        <Link

          to="/settings"
          onClick={() => onNavigate?.()}

          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5"

        >

          <FaCog /> Settings

        </Link>

        <button

          type="button"

          onClick={() => {

            logout();

            navigate('/login');

          }}

          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10"

        >

          <FaSignOutAlt /> Logout

        </button>

      </div>

    </div>

  );

};



export default Sidebar;


