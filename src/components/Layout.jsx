import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [activePage, setActivePage] = useState('Dashboard');  // Default active page

  return (
    <div className="flex h-screen bg-[#F4F6FA]">
      {/* Sidebar */}
      <div className="w-64 shadow-lg bg-[#0F1E33] rounded-full fixed h-full top-0 left-0 z-10">
        <Sidebar setActivePage={setActivePage} />  {/* Pass setActivePage to Sidebar */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Navbar */}
        <div className="shadow-lg bg-white rounded-full fixed w-full top-0 left-64 z-10">
          <Navbar activePage={activePage} />  {/* Pass activePage to Navbar */}
        </div>

        {/* Page Content */}
        <div className="flex-1  pt-4 bg-white mt-16 rounded-br-3xl shadow-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
