import React, { useState } from 'react';
import osdagLogo from '../../assets/homepage/osdag_logo.png';
import iitbLogo from '../../assets/homepage/iitb_logo.png';
import { Link, useParams } from 'react-router-dom';
const Sidebar = ({ setshowSideBar, active }) => {
  const [navigationItems, setnavigationItems] = useState(() =>
    [
      {
        name: 'Home',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        ),
        link: '/home',
      },
      {
        name: 'Connections',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
        active: false,
        link: '/Connections',
      },
      {
        name: 'Tension Member',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
        active: false,
        link: '/TensionMember',
      },
      {
        name: 'Compression Member',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
        active: false,
        link: '/CompressionMember',
      },
      {
        name: 'Flexure Member',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
        active: false,
        link: '/FlexureMember',
      },
      {
        name: 'Beam-Column',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
        active: false,
        link: '/Beam-Column',
      },
      {
        name: 'Plate Girder',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
        active: false,
        link: '/PlateGirder',
      },
      {
        name: 'Truss',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
        active: false,
        link: '/Truss',
      },
      {
        name: '2D Frame',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
        active: false,
        link: '/2DFrame',
      },
      {
        name: '3D Frame',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
        active: false,
        link: '/3DFrame',
      },
      {
        name: 'Group Design',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
        active: false,
        link: '/GroupDesign',
      },
    ].map(item =>
      item.name === active
        ? { ...item, highlight: true }
        : item
    )
  );

  const handleCloseSidebar = () => {
    setshowSideBar(false);
  }

  const { moduleName } = useParams();

  return (
    <div className="w-sidebar h-screen border-r border-osdag-border dark:border-gray-700 flex flex-col">
      {/* Logo Section */}
      <div className=" border-b border-osdag-border dark:border-gray-700">
        <div className="flex items-center justify-center relative">
          <img
            src={osdagLogo}
            alt="osdag-logo"
            className="w-20 h-20 mx-6 my-6"
          />
          <button
            className="absolute right-5 top-5 md:block lg:hidden xl:hidden 2xl:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Close sidebar"
            onClick={handleCloseSidebar}
            type="button"
          >
            <svg className="w-6 h-6 text-osdag-text dark:text-osdag-text-dark" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900">
        {navigationItems.map((item, index) => {
          // Normalize for comparison: remove spaces, lowercase, etc.
          const itemKey = item.link.replace('/', '').toLowerCase();
          const paramKey = (moduleName || '').toLowerCase();

          const isActive = itemKey === paramKey;

          return (
            <Link to={item.link} key={index} onClick={handleCloseSidebar}>
              <div
                className={`mx-4 mb-2 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ease-in-out group
          ${isActive
                    ? 'bg-osdag-green text-white dark:bg-osdag-dark-green'
                    : 'hover:text-osdag-light-green hover:bg-gray-50 dark:hover:bg-gray-800/20 text-osdag-text dark:text-osdag-text-dark'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`transition-colors duration-200 flex items-center justify-center h-6 w-6
            ${isActive
                      ? 'text-white dark:text-osdag-text-dark'
                      : 'group-hover:text-osdag-light-green text-osdag-icon dark:text-osdag-icon-dark'
                    }`}>
                    <span className="h-5 w-5 flex items-center justify-center dark:text-gray-300">
                      {item.icon}
                    </span>
                  </div>
                  <span className="font-medium dark:text-gray-300">{item.name}</span>
                </div>
              </div>
            </Link>
          );
        })}

      </div>
      {/* Bottom Logo Section */}
      <div className="px-6 py-6 border-t border-osdag-border dark:border-gray-700">
        <div className="flex items-center justify-center mb-4">
          <img
            src={iitbLogo}
            alt="iitb-logo"
            className="w-16 h-16 dark:invert"
          />
        </div>
        <div className="text-center">
          <p className="text-xs text-osdag-text-muted font-medium">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 