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
import React, { useState } from 'react';

const Navbar = ({ activePage }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // State to track dark mode

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode); // Toggle between dark and light mode
  };

  const getSearchPlaceholder = () => {
    switch (activePage) {
      case 'Inventory':
        return 'Search Inventory';
      case 'Resources':
        return 'Search Resources';
      case 'Shift Logs':
        return 'Search Shift Logs';
      case 'Safety Plan':
        return 'Search Safety Plan';
      case 'User Management':
        return 'Search Users';
      case 'Weather':
        return 'Search Weather';
      case 'Data Visualization':
        return 'Search Visualizations';
      case 'Report Generation':
        return 'Search Reports';
      case 'Audit Logs':
        return 'Search Audit Logs';
      case 'Notifications':
        return 'Search Notifications';
      case 'Alerts':
        return 'Search Alerts';
      case 'Dashboard':
      default:
        return 'Search Dashboard';
    }
  };

  return (
    <div className={`flex items-center p-4 ${isDarkMode ? 'bg-[#0F1E33]' : 'bg-white'} shadow-lg rounded-b-3xl`}>
      {/* Left Section: Search Bar */}
      <div className={`flex items-center ${isDarkMode ? 'bg-[#1E2A43]' : 'bg-[#F4F6FA]'} rounded-full shadow-lg px-4 py-2 w-1/2 sm:w-1/3 hover:shadow-xl transition duration-300 ease-in-out`}>
        <svg
          className="w-5 h-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder={getSearchPlaceholder()}
          className={`flex-grow bg-transparent focus:outline-none text-sm ${isDarkMode ? 'text-white' : 'text-black'} placeholder-gray-400 pl-3`}
        />
        <button className="ml-2 bg-[#3A4C76] text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-[#3A4C76] transition transform hover:scale-105 duration-200">
          ⌘ F
        </button>
      </div>

      {/* Right Section: Icons and Profile */}
      <div className="flex items-center ml-8 space-x-6">
        {/* Email Icon */}
        <button className={`p-2 rounded-full ${isDarkMode ? 'bg-[#1E2A43]' : 'bg-[#F4F6FA]'} hover:bg-[#2F3B5C] transition ease-in-out duration-200 transform hover:scale-110`}>
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 4h16v16H4z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </button>

        {/* Notification Icon */}
        <button className={`p-2 rounded-full ${isDarkMode ? 'bg-[#1E2A43]' : 'bg-[#F4F6FA]'} hover:bg-[#2F3B5C] transition ease-in-out duration-200 transform hover:scale-110`}>
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11.5a6.5 6.5 0 00-13 0v2.658c0 .379-.214.725-.595.917L3 17h5" />
            <path d="M13 21h-2a2 2 0 002 2h2a2 2 0 01-2-2z" />
          </svg>
        </button>

        {/* Profile Section */}
        <div className={`flex items-center space-x-3 hover:bg-[#2F3B5C] rounded-full p-2 transition duration-300 ease-in-out transform hover:scale-105 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-[#3A4C76] shadow-lg"
          />
          <div className="text-right">
            <p className="text-sm font-semibold">Totok Michael</p>
            <p className="text-xs text-[#A7B2C1]">tmichael20@mail.com</p>
          </div>
        </div>

        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full ${isDarkMode ? 'bg-[#1E2A43]' : 'bg-[#F4F6FA]'} hover:bg-[#2F3B5C] transition ease-in-out duration-200 transform hover:scale-110`}
        >
          {isDarkMode ? (
            <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M17 12h5M12 17v5M12 2v5M7 12H2" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M14.72 9.28a5 5 0 10-7.44 7.44" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
