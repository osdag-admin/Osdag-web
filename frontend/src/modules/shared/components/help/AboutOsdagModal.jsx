/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import HelpDialogShell from "./HelpDialogShell";
import {
  ABOUT_HTML,
  ACKNOWLEDGEMENTS,
  CAVEATS_HTML,
  CONTRIBUTORS_TEXT,
  LICENSE_HTML,
  PRIVACY_HTML,
} from "./helpContent";

const TAB_IDS = [
  "About",
  "Contributors",
  "Acknowledgements",
  "License",
  "Privacy Policy",
  "Caveats",
];

export const AboutOsdagModal = ({ open, onClose, initialTab = "About" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case "About":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img src="/images/Osdag_logo.svg" alt="Osdag" className="h-14 w-auto" />
              <div>
                <div className="text-xl font-semibold text-osdag-green">Osdag</div>
                <div className="text-sm text-gray-500">Open Source Design of Steel Structures</div>
              </div>
            </div>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: ABOUT_HTML }} />
          </div>
        );
      case "Contributors":
        return (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm whitespace-pre-wrap">
            {CONTRIBUTORS_TEXT}
          </div>
        );
      case "Acknowledgements":
        return (
          <div className="space-y-4 text-sm">
            <p>Osdag acknowledges the support and contributions of the following organizations:</p>
            <ul className="list-disc pl-5 space-y-2">
              {ACKNOWLEDGEMENTS.map((item) => (
                <li key={item.name}>
                  <a href={item.href} target="_blank" rel="noreferrer" className="text-osdag-green underline">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      case "License":
        return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: LICENSE_HTML }} />;
      case "Privacy Policy":
        return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: PRIVACY_HTML }} />;
      case "Caveats":
        return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: CAVEATS_HTML }} />;
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <HelpDialogShell open={open} onClose={onClose} title="About Osdag" width={840}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          {TAB_IDS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-osdag-green text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="max-h-[60vh] overflow-y-auto pr-1">{tabContent}</div>
      </div>
    </HelpDialogShell>
  );
};

export default AboutOsdagModal;
