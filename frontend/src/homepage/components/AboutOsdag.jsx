/* eslint-disable react/prop-types */
import { useState } from "react";
import osdagLogo from "../../assets/homepage/osdag_logo.png";

import { ABOUT_OSDAG_TABS } from "../constants/aboutOsdag/tabs";

import AboutTab from "./tabs/AboutTab";
import ContributorsTab from "./tabs/ContributorsTab";
import AcknowledgementsTab from "./tabs/AcknowledgementsTab";
import LicenseTab from "./tabs/LicenseTab";
import PrivacyTab from "./tabs/PrivacyTab";
import CaveatsTab from "./tabs/CaveatsTab";

export default function AboutOsdag({ onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  const renderTab = () => {
    switch (activeTab) {
      case 0: return <AboutTab />;
      case 1: return <ContributorsTab />;
      case 2: return <AcknowledgementsTab />;
      case 3: return <LicenseTab />;
      case 4: return <PrivacyTab />;
      case 5: return <CaveatsTab />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-osdag-dark-color w-[600px] max-w-[95%] rounded-lg shadow-xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <span className="flex items-center gap-2 font-semibold">
            <img src={osdagLogo} alt="Osdag Logo" className="w-5 h-5" />
            About Osdag
          </span>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded hover:bg-[#e74c3c] hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          {ABOUT_OSDAG_TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`
                px-4 py-2 text-sm whitespace-nowrap border-b-2
                ${activeTab === i
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent hover:text-blue-500"}
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[60vh]">
          {renderTab()}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 py-2 border-t">
          <button
            onClick={onClose}
            className="px-4 py-1 rounded bg-osdag-green text-white hover:bg-green-700"
          >
            OK
          </button>
        </div>

      </div>
    </div>
  );
}