import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TabbedModulePage from '../components/ModulesCardLayout';
import { useParams } from 'react-router-dom';
import mosLogo from '../../assets/homepage/mos_logo.png';
import constructSteelLogo from '../../assets/homepage/constructsteel_logo.png';
import moeLogo from '../../assets/homepage/moe_logo.png';
import InsdagLogo from '../../assets/homepage/insdag_logo.png';

const SelectModulePage = () => {
  const [showSideBar, setshowSideBar] = useState(false);
  // Get module name from URL param
  const { moduleName } = useParams();

  return (
    <div className="min-h-screen antialiased w-full relative bg-white dark:bg-osdag-dark-color">
      <div className="flex lg:h-screen relative z-10">
        {/* Sidebar mobile overlay */}
        {showSideBar && (
          <div className="fixed inset-0 z-40 flex">
            <div className="flex-shrink-0 bg-white dark:bg-osdag-dark-color w-sidebar h-screen border-r border-osdag-border dark:border-gray-700">
              <Sidebar setshowSideBar={setshowSideBar} />
            </div>
            {/* Optional overlay div to close sidebar can be added here */}
          </div>
        )}

        {/* Sidebar for large screens */}
        <div className="flex-shrink-0 hidden lg:block">
          <Sidebar setshowSideBar={setshowSideBar} active={moduleName} />
        </div>

        {/* Main content with background and overlay */}
        <div className="relative flex-1 min-h-[100vh] flex flex-col min-w-0 overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/images/background_light.svg')] bg-cover bg-center dark:hidden"></div>
            <div className="absolute inset-0 bg-[url('/images/background_dark.svg')] bg-cover bg-center hidden dark:block"></div>
          </div>


          {/* Overlay: white with opacity for light; black with opacity for dark */}
          {/* <div className="absolute inset-0 bg-white/70 dark:bg-black/40"></div> */}

          {/* Foreground content */}
          <div className="relative flex-1 flex flex-col min-w-0">
            {/* Header */}
            <Header setshowSideBar={setshowSideBar} active={moduleName} />

            {/* Main Content */}
            <div className="flex-1 lg:overflow-y-auto">
              <TabbedModulePage />
            </div>
            <div className="pointer-events-none absolute bottom-6">
             <div className="px-6 py-3 rounded-md shadow-sm">
              <div className="mb-2">
               <span className="text-lg font-semibold whitespace-nowrap">
                 Supported by:
               </span>
              </div>
              <div className="flex items-center gap-6">
                <img src={moeLogo} alt="MOE Logo" className="h-[4.2rem] pointer-events-auto dark:invert" />
                <img src={mosLogo} alt="MOS Logo" className="h-[4.2rem] pointer-events-auto dark:invert" />
                <img src={constructSteelLogo} alt="Construct Steel Logo" className="h-[1.44rem] pointer-events-auto" />
                <img src={InsdagLogo} alt="Insdag Logo" className="h-[4.2rem] pointer-events-auto" />
              {/* <img src={fosseeLogo} alt="FOSSEE Logo" className="h-10 pointer-events-auto" /> */}
              </div>
             </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectModulePage;
