import React from 'react';
import fosseeLogo from '../../assets/homepage/fossee_logo.png';
import governmentLogo from '../../assets/homepage/mos_logo.png';
import constructsteelLogo from '../../assets/homepage/constructsteel_logo.png';

const Footer = () => {
  return (
    <div className="border-t border-osdag-border dark:border-gray-700 py-8">
      <div className="mx-4 lg:mx-12">
        <div className="flex items-center justify-center space-x-4 lg:space-x-16">
          {/* FOSSEE Logo */}
          <div className="flex items-center">
            <img src={fosseeLogo} alt="fossee-logo" className="h-8" />
          </div>
          
          {/* Government Logo */}
          <div className="flex items-center">
            <img src={governmentLogo} alt="government-logo" className="h-8 dark:invert" />
          </div>
          
          {/* ConstructSteel Logo */}
          <div className="flex items-center">
            <img src={constructsteelLogo} alt="constructsteel-logo" className="h-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer; 