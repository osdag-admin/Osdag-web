import React, { useState } from 'react';
import osdagLogo from '../../assets/homepage/osdag_logo.png';
import iitbLogo from '../../assets/homepage/iitb_logo.png';
import homeIcon from '../../assets/homepage/home_default.svg';
import connectionIcon from '../../assets/homepage/connection.svg';
import tensionIcon from '../../assets/homepage/tension_member.svg';
import compressionIcon from '../../assets/homepage/compression_member.svg'
import flexuralIcon from '../../assets/homepage/flexural_member.svg';
import beamcolumnIcon from '../../assets/homepage/beam_column.svg';
import trussIcon from '../../assets/homepage/truss.svg';
import frame2dIcon from '../../assets/homepage/2d_frame.svg';
import frame3dIcon from '../../assets/homepage/3d_frame.svg';
import { Link, useParams } from 'react-router-dom';
const Sidebar = ({ setshowSideBar, active }) => {
  const [navigationItems, setnavigationItems] = useState(() =>
    [
      {
        name: 'Home',
        icon: <img src={homeIcon} alt="Home" className="w-10 h-10" />,
        link: '/home',
      },
      {
        name: 'Connection',
        icon: <img src={connectionIcon} alt="Connection" className="w-10 h-10" />,
        active: false,
        link: '/Connections',
      },
      {
        name: 'Tension Member',
        icon: <img src={tensionIcon} alt="Tension Member" className="w-10 h-10" />,
        active: false,
        link: '/TensionMember',
      },
      {
        name: 'Compression Member',
        icon: <img src={compressionIcon} alt="Compression Member" className="w-10 h-10" />,
        active: false,
        link: '/CompressionMember',
      },
      {
        name: 'Flexural Member',
        icon: <img src={flexuralIcon} alt="Flexural Member" className="w-10 h-10" />,
        active: false,
        link: '/FlexureMember',
        // comingSoon: true,
      },
      {
        name: 'Beam-Column',
        icon: <img src={beamcolumnIcon} alt="Beam-Column" className="w-10 h-10" />,
        active: false,
        link: '/Beam-Column',
        comingSoon: true,
      },
      {
        name: 'Truss',
        icon: <img src={trussIcon} alt="Truss" className="w-10 h-10" />,
        active: false,
        link: '/Truss',
        comingSoon: true,
      },
      {
        name: '2D Frame',
        icon: <img src={frame2dIcon} alt="2D Frame" className="w-10 h-10" />,
        active: false,
        link: '/2DFrame',
        comingSoon: true,
      },
      {
        name: '3D Frame',
        icon: <img src={frame3dIcon} alt="3D Frame" className="w-10 h-10" />,
        active: false,
        link: '/3DFrame',
        comingSoon: true,
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
    <div className="w-sidebar h-screen border-r border-osdag-border dark:border-gray-700 flex flex-col bg-white dark:bg-osdag-dark-color">
      {/* Logo Section */}
      <div className=" border-b border-osdag-border dark:border-gray-700">
        <div className="flex items-center justify-center relative">
          <div className="flex items-center justify-center flex-col">
            <img
              src="/images/Osdag_logo.svg"
              alt="osdag-logo"
              className="w-20 h-20 mx-6 my-3"
            />
            <div className="text-center mb-2">
              <p className="text-xs text-osdag-text-muted font-medium">Version 1.0.0</p>
            </div>
          </div>

          <button
            className="absolute right-5 top-5 md:block lg:hidden xl:hidden 2xl:hidden p-2 rounded transition 
             hover:bg-gray-200 dark:hover:bg-osdag-dark-color"
            aria-label="Close sidebar"
            onClick={handleCloseSidebar}
            type="button"
          >
            <svg
              className="w-6 h-6 text-osdag-text dark:text-osdag-text-dark"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
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

          const comingSoon = item.comingSoon;

          return (
            <Link
              to={item.link}
              key={index}
              onClick={(event) => {
                if (comingSoon) {
                  event.preventDefault();
                  event.stopPropagation();
                  alert('Module under development');
                  return;
                }
                handleCloseSidebar();
              }}
            >
              <div
                className={`
      mx-4 mb-2 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out group
      ${comingSoon
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-osdag-dark-color dark:text-gray-500'
                    : isActive
                      ? 'bg-osdag-green text-white dark:bg-osdag-dark-green dark:text-white'
                      : 'cursor-pointer hover:text-osdag-green hover:bg-black/10 dark:hover:bg-black/40 text-black dark:text-white'}
    `}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`
          transition-colors duration-200 flex items-center justify-center h-10 w-10
          ${comingSoon
                        ? 'text-gray-400 dark:text-gray-500'
                        : isActive
                          ? 'text-white dark:text-white'
                          : 'group-hover:text-osdag-green text-black dark:text-osdag-green'}
        `}
                  >
                    <span className="h-10 w-10 flex items-center justify-center">
                      {item.icon}
                    </span>
                  </div>
                  <span
                    className={`font-medium ${comingSoon ? 'text-gray-400 dark:text-gray-500' : 'dark:text-white'}`}
                  >
                    {item.name}
                    {/* {comingSoon && (
                      <span className="ml-2 text-xs uppercase tracking-wide">(Coming Soon)</span>
                    )} */}
                  </span>
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
      </div>
    </div>
  );
};

export default Sidebar; 
