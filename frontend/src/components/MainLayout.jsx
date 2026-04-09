import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="layout-container">
      <Navbar />
      <Sidebar />
      <main className="main-layout fade-in">
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
