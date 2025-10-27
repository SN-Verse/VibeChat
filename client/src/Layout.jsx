// src/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNavBar from './components/TopNavBar';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
 