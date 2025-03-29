// import React, { useState,useEffect } from "react";
// import { Link } from "react-router-dom";
// import MenuIcon from '@mui/icons-material/Menu';
// import CloseIcon from '@mui/icons-material/Close';
// import DashboardIcon from '@mui/icons-material/Dashboard';
// import SafetyIcon from '@mui/icons-material/Shield';
// import UserIcon from '@mui/icons-material/People';
// import ResourceIcon from '@mui/icons-material/Storage';
// import InventoryIcon from '@mui/icons-material/Inventory';
// import WeatherIcon from '@mui/icons-material/WbSunny';
// import DataUsageIcon from '@mui/icons-material/DataUsage';
// import ReportIcon from '@mui/icons-material/Description';
// import AuditIcon from '@mui/icons-material/Assessment';
// import NotificationsIcon from '@mui/icons-material/Notifications';
// import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // Updated Icon Import
// import LoginIcon from '@mui/icons-material/Login';
// import SunIcon from '@mui/icons-material/WbSunny';
// import MoonIcon from '@mui/icons-material/NightsStay';

// const Navbar = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [activeLink, setActiveLink] = useState("/");
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };
//   useEffect(() => {
//     // Check for user's preferred color scheme
//     const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//     if (prefersDark) {
//       setIsDarkMode(true);
//       document.documentElement.classList.add('dark');
//     }
//   }, []);
//   const handleLinkClick = (link) => {
//     setActiveLink(link);
//     setIsMenuOpen(false); // Close menu when a link is clicked
//   };
//   const toggleDarkMode = () => {
//     setIsDarkMode(!isDarkMode);
//     if (isDarkMode) {
//       document.documentElement.classList.remove('dark');
//     } else {
//       document.documentElement.classList.add('dark');
//     }
//   };
//   return (
//     <nav className="sticky top-0 bg-gray-800 dark:bg-gray-900 shadow-lg z-50">
//     <div className="container mx-auto px-4 py-3  flex items-center">
//       {/* Logo Section */}
//       <div className="text-white text-2xl font-extrabold tracking-wide">
//         <Link
//           to="/"
//           onClick={() => handleLinkClick('/')}
//           className="hover:text-yellow-400 transition-all duration-300"
//         >
//           Mine Manager
//         </Link>
//       </div>

//       {/* Dark Mode Toggle (Desktop) */}
//       <button
//         onClick={toggleDarkMode}
//         className="hidden md:block text-gray-300 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
//         aria-label="Toggle Dark Mode"
//       >
//         {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
//       </button>

//       {/* Desktop Navbar Links */}
//       <div className="hidden md:flex space-x-6">
//         {[
//           { to: '/', label: 'Dashboard', Icon: DashboardIcon },
//           { to: '/shift-logs', label: 'Shift Logs', Icon: InventoryIcon },
//           { to: '/safety-plan', label: 'Safety Plan', Icon: SafetyIcon },
//           { to: '/user-management', label: 'User Management', Icon: UserIcon },
//           { to: '/resources', label: 'Resources', Icon: ResourceIcon },
//           { to: '/inventory', label: 'Inventory', Icon: InventoryIcon },
//           { to: '/weather', label: 'Weather', Icon: WeatherIcon },
//           { to: '/data-visualization', label: 'Data Visualization', Icon: DataUsageIcon },
//           { to: '/report-generation', label: 'Report Generation', Icon: ReportIcon },
//           { to: '/audit-logs', label: 'Audit Logs', Icon: AuditIcon },
//           { to: '/notifications', label: 'Notifications', Icon: NotificationsIcon },
//           { to: '/alerts', label: 'Alerts', Icon: WarningAmberIcon },
//           { to: '/login', label: 'Login', Icon: LoginIcon },
//         ].map(({ to, label, Icon }) => (
//           <Link
//             key={to}
//             to={to}
//             onClick={() => handleLinkClick(to)}
//             className={`flex items-center text-gray-300 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors duration-300 ${
//               activeLink === to ? 'text-yellow-400 border-b-2 border-yellow-400' : ''
//             }`}
//           >
//             <Icon className="mr-2 text-lg" /> {label}
//           </Link>
//         ))}
//       </div>

//       {/* Mobile Hamburger Menu */}
//       <div className="md:hidden flex items-center">
//         {/* Dark Mode Toggle (Mobile) */}
//         <button
//           onClick={toggleDarkMode}
//           className="mr-2 text-gray-300 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
//           aria-label="Toggle Dark Mode"
//         >
//           {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
//         </button>
//         <button onClick={toggleMenu} className="text-gray-300 hover:text-white focus:outline-none">
//           {isMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
//         </button>
//       </div>
//     </div>

//     {/* Mobile Menu */}
//     <div
//       className={`md:hidden bg-gray-800 dark:bg-gray-900 text-gray-300 dark:text-gray-200 p-4 space-y-4 transition-transform transform ${
//         isMenuOpen ? 'translate-y-0' : '-translate-y-full'
//       } duration-300 ease-in-out`}
//     >
//       {[
//         { to: '/', label: 'Dashboard' },
//         { to: '/shift-logs', label: 'Shift Logs' },
//         { to: '/safety-plan', label: 'Safety Plan' },
//         { to: '/user-management', label: 'User Management' },
//         { to: '/resources', label: 'Resources' },
//         { to: '/inventory', label: 'Inventory' },
//         { to: '/weather', label: 'Weather' },
//         { to: '/data-visualization', label: 'Data Visualization' },
//         { to: '/report-generation', label: 'Report Generation' },
//         { to: '/audit-logs', label: 'Audit Logs' },
//         { to: '/notifications', label: 'Notifications' },
//         { to: '/alerts', label: 'Alerts' },
//         { to: '/login', label: 'Login' },
//       ].map(({ to, label }) => (
//         <Link
//           key={to}
//           to={to}
//           onClick={() => handleLinkClick(to)}
//           className={`block py-2 px-4 rounded hover:bg-gray-700 hover:text-yellow-400 focus:outline-none focus:bg-gray-700 focus:text-yellow-400 transition-colors duration-300 ${
//             activeLink === to ? 'bg-gray-700 text-yellow-400' : ''
//           }`}
//         >
//           {label}
//         </Link>
//       ))}
//     </div>
//   </nav>
  
//   );
// };

// export default Navbar;
import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import boy from "../assets/boy.png";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import Profile from './Profile';
import { useNavigate } from 'react-router-dom';
const Navbar = ({ activePage }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleProfileMenu = () => setIsProfileOpen(!isProfileOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSearchPlaceholder = () => {
    const placeholders = {
      'Inventory': 'Search Inventory',
      'Resources': 'Search Resources',
      'Shift Logs': 'Search Shift Logs',
      'Safety Plan': 'Search Safety Plan',
      'User Management': 'Search Users',
      'Weather': 'Search Weather',
      'Data Visualization': 'Search Visualizations',
      'Report Generation': 'Search Reports',
      'Audit Logs': 'Search Audit Logs',
      'Notifications': 'Search Notifications',
      'Alerts': 'Search Alerts',
      'Dashboard': 'Search Dashboard',
    };
    return placeholders[activePage] || 'Search...';
  };

  return (
    <div className={`flex items-center justify-between px-6 py-3 ${isDarkMode ? 'bg-[#0F1E33]' : 'bg-white'} shadow-lg relative z-50`}>
      
      {/* Left Section - App Name */}
      <div className="bg-white text-blue-700 rounded-full p-4 shadow-lg transform hover:scale-110 transition-all">
          <span className="font-bold text-xl">Mine Manager</span>
        </div>

      {/* Right Section */}
      <div className="flex items-center space-x-6">
  {/* Search Bar (Moved to Right) */}
  <div className={`hidden sm:flex items-center ${isDarkMode ? 'bg-[#1E2A43]' : 'bg-[#F4F6FA]'} rounded-full shadow-lg px-4 py-2 w-full sm:w-[28rem]`}>
    <input
      type="text"
      placeholder={getSearchPlaceholder()}
      className={`flex-grow bg-transparent focus:outline-none text-sm ${isDarkMode ? 'text-white' : 'text-black'} placeholder-gray-400 pl-2`}
    />
  </div>

  {/* Notification Icon */}
  <button className="p-2 rounded-full bg-[#1E2A43] hover:bg-[#2F3B5C] transition transform hover:scale-110 text-white">
    🔔
  </button>

  {/* Profile Section */}
  <div className="relative" ref={profileRef}>
    <button className="flex items-center space-x-3" onClick={toggleProfileMenu}>
      <img
        src={boy}
        alt="Profile"
        className="w-10 h-10 rounded-full border-2 border-[#3A4C76] shadow-lg cursor-pointer"
      />
    </button>

    {/* Profile Dropdown */}
    {isProfileOpen && (
  <motion.div 
    initial={{ opacity: 0, y: -10 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -10 }}
    className="absolute right-0 mt-3 w-56 bg-gray-900 bg-opacity-90 backdrop-blur-xl shadow-xl rounded-xl border border-gray-700 z-50"
  >
    {/* User Info */}
    {/* <div className="p-4 border-b border-gray-700 flex items-center gap-3 bg-gradient-to-r from-gray-800 to-gray-900">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-lg shadow-md">
        {user?.name?.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{user?.name}</p>
        <p className="text-xs text-gray-400">{user?.email}</p>
      </div>
    </div> */}

    {/* Dropdown Options */}
    <ul className="text-sm text-gray-300">
      <li>
        <button 
          onClick={() => navigate("/profile")} 
          className="flex items-center gap-2 px-4 py-3 hover:bg-gray-800 text-white w-full text-left transition duration-200"
        >
          👤 View Profile
        </button>
      </li>
      <li>
        <Link 
          to="/settings" 
          className="flex items-center gap-2 px-4 py-3 hover:bg-gray-800 text-white transition duration-200"
        >
          ⚙️ Settings
        </Link>
      </li>
      <li>
        <button 
          onClick={logout} 
          className="flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-gray-800 w-full text-left transition duration-200"
        >
          🚪 Logout
        </button>
      </li>
    </ul>
  </motion.div>
)}


  </div>

  {/* Dark Mode Toggle */}
  <button onClick={toggleTheme} className="p-2 rounded-full bg-[#1E2A43] hover:bg-[#2F3B5C] transition transform hover:scale-110 text-white">
    {isDarkMode ? "🌙" : "☀️"}
  </button>
</div>
    </div>
  );
};

export default Navbar;
