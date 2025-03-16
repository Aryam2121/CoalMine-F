// import React, { useState } from 'react';
// import Sidebar from './Sidebar';
// import Navbar from './Navbar';

// const Layout = ({ children }) => {
//   const [activePage, setActivePage] = useState('Dashboard');  // Default active page

//   return (
//     <div className="flex h-screen bg-[#F4F6FA]">
//       {/* Sidebar */}
//       <div className="w-64 shadow-lg bg-[#0F1E33] rounded-full fixed h-full top-0 left-0 z-10">
//         <Sidebar setActivePage={setActivePage} />  {/* Pass setActivePage to Sidebar */}
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col ml-64">
//         {/* Navbar */}
//         <div className="shadow-lg bg-white rounded-full fixed w-full top-0 left-64 z-10">
//           <Navbar activePage={activePage} />  {/* Pass activePage to Navbar */}
//         </div>

//         {/* Page Content */}
//         <div className="flex-1  pt-4 bg-white mt-16 rounded-br-3xl shadow-md">
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Layout;
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, [location]);

  const hideLayout = ["/login", "/signup"].includes(location.pathname);

  return (
    <div className="flex h-screen bg-[#F4F6FA]">
      {/* Navbar (Full Width, Fixed at Top) */}
      {isAuthenticated && !hideLayout && (
        <div className=" bg-white fixed w-full top-0 left-0 z-50">
          <Navbar activePage={activePage}/>
        </div>
      )}

      <div className="flex w-full">
        {/* Sidebar (Shifted Down Below Navbar) */}
        {isAuthenticated && !hideLayout && (
          <div className="w-64 shadow-lg bg-[#0F1E33] fixed h-full top-24 left-0 z-40">
            <Sidebar setActivePage={setActivePage} />
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 py-8 px-4  flex flex-col ${isAuthenticated && !hideLayout ? 'ml-64 mt-16' : ''}`}>
          <div className="flex-1  bg-white shadow-md rounded-lg">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
