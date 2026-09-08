import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MainContent from "../components/MainContent";
import { EmailVerificationBanner } from '../components/EmailVerificationBanner';
import { useAuth } from '../../context/AuthContext';
import mosLogo from '../../assets/homepage/mos_logo.png';
import constructSteelLogo from '../../assets/homepage/constructsteel_logo.png';
import moeLogo from '../../assets/homepage/moe_logo.png';
import InsdagLogo from '../../assets/homepage/insdag_logo.png';
// import fosseeLogo from '../../assets/homepage/fossee_logo.png';
// import Footer from "../components/Footer";

const Homepage = () => {
  const [showSideBar, setshowSideBar] = useState(false);
  const { user: currentUser } = useAuth();

  return (
    <div className="min-h-screen antialiased w-full relative  bg-white dark:bg-osdag-dark-color">
      <div className="flex lg:h-screen relative z-10">
        {/* Sidebar */}
        {showSideBar && (
          <div className="fixed inset-0 z-40 flex">
            {/* Overlay to close sidebar */}
            <button
              type="button"
              aria-label="Close sidebar"
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 cursor-pointer"
              onClick={() => setshowSideBar(false)}
            />
            <div className="relative flex-shrink-0 w-sidebar h-screen border-r border-osdag-border dark:border-gray-700 z-40">
              <Sidebar setshowSideBar={setshowSideBar} />
            </div>
          </div>
        )}

        {/* Sidebar for large screens */}
        <div className="flex-shrink-0 bg-white dark:bg-osdag-dark-color hidden lg:block">
          <Sidebar setshowSideBar={setshowSideBar} active="Home" />
        </div>

        {/* Main Content with background + overlay */}
        <div className="relative flex-1 h-[100vh] flex flex-col min-w-0 overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/images/background_light.svg')] bg-contain bg-right-bottom bg-no-repeat lg:bg-cover lg:bg-center dark:hidden"></div>
            <div className="absolute inset-0 bg-[url('/images/background_dark.svg')] bg-contain bg-right-bottom bg-no-repeat lg:bg-cover lg:bg-center hidden dark:block"></div>
          </div>

          {/* Foreground content */}
          <div className="relative flex-1 flex flex-col min-w-0 min-h-0">
            {/* Header */}
            <Header setshowSideBar={setshowSideBar} />

            {/* Email Verification Banner */}
            {currentUser && !currentUser.emailVerified && (
              <div className="px-6 pt-4">
                <EmailVerificationBanner
                  user={currentUser}
                  onVerified={() => {
                    // Reload user to get updated verification status
                    currentUser.reload();
                  }}
                />
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto flex flex-col justify-between">
              <div className="flex-1">
                <MainContent />
              </div>
              
              {/* Footer / Supported by logos */}
              <div className="px-4 sm:px-8 lg:px-12 py-3">
                <div className="mb-2"> 
                  <span className="text-lg font-semibold whitespace-nowrap dark:text-white">
                    Supported by:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <img src={moeLogo} alt="MOE Logo" className="h-[3rem] md:h-[4.2rem] dark:invert" />
                  <img src={mosLogo} alt="MOS Logo" className="h-[3rem] md:h-[4.2rem] dark:invert" /> 
                  <img src={constructSteelLogo} alt="Construct Steel Logo" className="h-[1rem] md:h-[1.44rem]" />
                  <img src={InsdagLogo} alt="Insdag Logo" className="h-[3rem] md:h-[4.2rem]" />
                </div>           
              </div>
            </div>            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;