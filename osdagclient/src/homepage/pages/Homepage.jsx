import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MainContent from '../components/MainContent';
import Footer from '../components/Footer';

const Homepage = () => {
  const [showSideBar, setshowSideBar] = useState(false);
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 antialiased w-full">
      <div className="flex lg:h-screen">
        {/* Sidebar */}
        {showSideBar && (
          <div className="fixed inset-0 z-40 flex">
            <div className="flex-shrink-0 bg-white dark:bg-slate-950 w-sidebar h-screen border-r border-osdag-border dark:border-gray-700">
              <Sidebar setshowSideBar={setshowSideBar} />
            </div>
            {/* Overlay to close sidebar */}
            {/* <div
              className="fixed inset-0 bg-black bg-opacity-30"
              onClick={() => setshowSideBar(false)}
            /> */}
          </div>
        )}
        <div className="flex-shrink-0 hidden lg:block">
          <Sidebar setshowSideBar={setshowSideBar} active={"Home"} />
        </div>
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <Header setshowSideBar={setshowSideBar} />

          {/* Main Content */}
          <div className="flex-1 lg:overflow-y-auto">
            <MainContent />
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Homepage; 