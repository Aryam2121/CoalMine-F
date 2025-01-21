// import React from 'react'; 
// import { 
//   FaTachometerAlt, 
//   FaTasks, 
//   FaCalendarAlt, 
//   FaChartBar, 
//   FaUsers, 
//   FaCogs, 
//   FaQuestionCircle, 
//   FaSignOutAlt, 
//   FaFileAlt, 
//   FaCloud, 
//   FaRegBuilding, 
//   FaTools, 
//   FaExclamationCircle, 
//   FaBell, 
//   FaSignInAlt 
// } from 'react-icons/fa';
// import { Link } from 'react-router-dom';

// const Sidebar = () => {
//   const menuItems = [
//     { to: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
//     { to: '/shift-logs', label: 'Shift Logs', icon: <FaTasks /> },
//     { to: '/safety-plan', label: 'Safety Plan', icon: <FaCalendarAlt /> },
//     { to: '/user-management', label: 'User Management', icon: <FaUsers /> },
//     { to: '/resources', label: 'Resources', icon: <FaRegBuilding /> },
//     { to: '/inventory', label: 'Inventory', icon: <FaTools /> },
//     { to: '/weather', label: 'Weather', icon: <FaCloud /> },
//     { to: '/data-visualization', label: 'Data Visualization', icon: <FaChartBar /> },
//     { to: '/report-generation', label: 'Report Generation', icon: <FaFileAlt /> },
//     { to: '/audit-logs', label: 'Audit Logs', icon: <FaRegBuilding /> },
//     { to: '/notifications', label: 'Notifications', icon: <FaBell /> },
//     { to: '/alerts', label: 'Alerts', icon: <FaExclamationCircle /> },
//     { to: '/login', label: 'Login', icon: <FaSignInAlt /> }
//   ];

//   return (
//     <div className="min-h-screen w-64 bg-[#0F1E33] shadow-lg flex flex-col justify-between rounded-l-3xl border-r-2 border-gray-200">
//       {/* Logo Section */}
//       <div className="p-6 flex flex-col items-center space-y-4">
//         <div className="bg-white text-blue-700 rounded-full p-4 shadow-lg">
//           <span className="font-bold text-xl">Mine Manager</span>
//         </div>
//       </div>

//       {/* Menu Section */}
//       <div className="flex-grow px-6 overflow-y-auto">
//         <h2 className="text-gray-300 uppercase text-sm mb-4 tracking-wide">Menu</h2>
//         <ul className="space-y-4">
//           {menuItems.map((item) => (
//             <li key={item.to} className="relative group">
//               <Link
//                 to={item.to}
//                 className="flex items-center space-x-4 text-gray-100 hover:text-white hover:bg-blue-700 p-2 rounded-lg transition-all transform hover:scale-105"
//               >
//                 <div className="w-6 h-6 flex items-center justify-center">
//                   {item.icon}
//                 </div>
//                 <span className="text-lg font-medium">{item.label}</span>
//               </Link>
//               {/* Active/Selected Item Indicator */}
//               <span className="absolute inset-y-0 left-0 w-1 bg-blue-700 group-hover:block hidden rounded-r-lg"></span>
//             </li>
//           ))}
//         </ul>

//         <h2 className="text-gray-300 uppercase text-sm mt-8 mb-4 tracking-wide">General</h2>
//         <ul className="space-y-4">
//           <li className="flex items-center space-x-4 text-gray-100 hover:text-white hover:bg-blue-700 p-2 rounded-lg transition-all transform hover:scale-105">
//             <FaCogs />
//             <span>Settings</span>
//           </li>
//           <li className="flex items-center space-x-4 text-gray-100 hover:text-white hover:bg-blue-700 p-2 rounded-lg transition-all transform hover:scale-105">
//             <FaQuestionCircle />
//             <span>Help</span>
//           </li>
//           <li className="flex items-center space-x-4 text-gray-100 hover:text-white hover:bg-blue-700 p-2 rounded-lg transition-all transform hover:scale-105">
//             <FaSignOutAlt />
//             <span>Logout</span>
//           </li>
//         </ul>
//       </div>

//       {/* Download App Section */}
//       <div className="bg-white p-4 mx-4 mb-4 rounded-lg text-center shadow-lg">
//         <h3 className="text-blue-700 font-medium text-lg">Download our Mobile App</h3>
//         <p className="text-sm text-gray-500 mt-1">Get easy in another way</p>
//         <button className="bg-blue-700 text-white px-4 py-2 mt-2 rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105">
//           Download
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaTasks, FaCalendarAlt, FaChartBar, FaUsers, FaCogs, FaQuestionCircle, FaSignOutAlt, FaFileAlt, FaCloud, FaRegBuilding, FaTools, FaExclamationCircle, FaBell, FaSignInAlt } from 'react-icons/fa';

const Sidebar = ({ setActivePage, activePage }) => {
  const menuItems = useMemo(() => [
    { to: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { to: '/shift-logs', label: 'Shift Logs', icon: <FaTasks /> },
    { to: '/safety-plan', label: 'Safety Plan', icon: <FaCalendarAlt /> },
    { to: '/user-management', label: 'User Management', icon: <FaUsers /> },
    { to: '/resources', label: 'Resources', icon: <FaRegBuilding /> },
    { to: '/inventory', label: 'Inventory', icon: <FaTools /> },
    { to: '/weather', label: 'Weather', icon: <FaCloud /> },
    { to: '/data-visualization', label: 'Data Visualization', icon: <FaChartBar /> },
    { to: '/report-generation', label: 'Report Generation', icon: <FaFileAlt /> },
    { to: '/audit-logs', label: 'Audit Logs', icon: <FaRegBuilding /> },
    { to: '/notifications', label: 'Notifications', icon: <FaBell /> },
    { to: '/alerts', label: 'Alerts', icon: <FaExclamationCircle /> },
    { to: '/login', label: 'Login', icon: <FaSignInAlt /> }
  ], []);

  return (
    <div className="min-h-screen w-64 bg-[#0F1E33] shadow-lg flex flex-col justify-between rounded-l-3xl border-r-2 border-gray-200">
      <div className="p-6 flex flex-col items-center space-y-4">
        <div className="bg-white text-blue-700 rounded-full p-4 shadow-lg transform hover:scale-110 transition-all">
          <span className="font-bold text-xl">Mine Manager</span>
        </div>
      </div>

      {/* Menu Section */}
      <div className="flex-grow px-6 overflow-y-auto">
        <h2 className="text-gray-300 uppercase text-sm mb-4 tracking-wide">Menu</h2>
        <ul className="space-y-4">
          {menuItems.map((item) => (
            <li key={item.to} className="relative group">
              <Link
                to={item.to}
                onClick={() => setActivePage(item.label)} // Set the active page when clicked
                className={`flex items-center space-x-4 text-gray-100 p-2 rounded-lg transition-all transform hover:scale-105 focus:outline-none ${
                  activePage === item.label ? 'bg-blue-700 text-white font-bold border-l-4 border-blue-400' : 'hover:bg-blue-700 hover:text-white'
                }`}
                role="menuitem"
                aria-label={item.label}
                aria-current={activePage === item.label ? 'page' : undefined} // Adding aria-current for active page
              >
                <div className="w-7 h-7 flex items-center justify-center">{item.icon}</div> {/* Increased icon size */}
                <span className="text-lg font-medium">{item.label}</span>
              </Link>
              {/* Active/Selected Item Indicator */}
              <span
                className={`absolute inset-y-0 left-0 w-1 bg-blue-700 group-hover:block hidden rounded-r-lg ${
                  activePage === item.label ? 'block' : ''
                }`}
              ></span>
            </li>
          ))}
        </ul>

        <h2 className="text-gray-300 uppercase text-sm mt-8 mb-4 tracking-wide">General</h2>
        <ul className="space-y-4">
          <li className="flex items-center space-x-4 text-gray-100 hover:text-white hover:bg-blue-700 p-2 rounded-lg transition-all transform hover:scale-105 focus:outline-none">
            <FaCogs />
            <span>Settings</span>
          </li>
          <li className="flex items-center space-x-4 text-gray-100 hover:text-white hover:bg-blue-700 p-2 rounded-lg transition-all transform hover:scale-105 focus:outline-none">
            <FaQuestionCircle />
            <span>Help</span>
          </li>
          <li className="flex items-center space-x-4 text-gray-100 hover:text-white hover:bg-blue-700 p-2 rounded-lg transition-all transform hover:scale-105 focus:outline-none">
            <FaSignOutAlt />
            <span>Logout</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
