import { message } from "antd";
import { useEngineeringContext } from "../context/EngineeringContext";

export const MobileBottomNav = () => {
  const { isMobile, docks, setDocks, designStatus } = useEngineeringContext();
  if (!isMobile) return null;
  const { output } = designStatus;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 bg-white dark:bg-osdag-dark-color border-t border-gray-200 dark:border-gray-800 flex justify-around items-center z-[2000]">
      <button
        onClick={() => setDocks({ input: true, cad: false, output: false, logs: false })}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-semibold transition-colors ${docks.input
          ? 'text-osdag-green'
          : 'text-gray-500 dark:text-gray-400 hover:text-osdag-green'
          }`}
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>Inputs</span>
      </button>

      <button
        onClick={() => setDocks({ input: false, cad: true, output: false, logs: true })}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-semibold transition-colors ${docks.cad && !docks.input && !docks.output
          ? 'text-osdag-green'
          : 'text-gray-500 dark:text-gray-400 hover:text-osdag-green'
          }`}
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>3D View</span>
      </button>

      <button
        onClick={() => {
          if (output) {
            setDocks({ input: false, cad: false, output: true, logs: true });
          } else {
            message.info("Please run the design first to view outputs.");
          }
        }}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-semibold transition-colors ${!output ? 'opacity-40 cursor-not-allowed' : ''
          } ${docks.output
            ? 'text-osdag-green'
            : 'text-gray-500 dark:text-gray-400 hover:text-osdag-green'
          }`}
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Outputs</span>
      </button>
    </div>
  );
};
