/* eslint-disable react/prop-types */
import osdagLogo from '../../assets/homepage/osdag_logo.png';

export default function AskQuestion({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white border-2 border-osdag-green w-[340px] shadow-lg">

        {/* Header */}
        <div className="flex justify-between items-center px-3 py-2 border-b">
          <div className="flex items-center gap-2">
            <img
              src={osdagLogo}
              alt="Osdag Logo"
              className="w-6 h-6"
            />

            <h2 className="text-black">
              Ask Questions
            </h2>
        </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="px-4 py-2 text-black hover:bg-red-500 hover:text-white transition-colors"
          >
           ×
          </button>
        </div>

        {/* Body */}
        <div className="p-5 text-sm">
          <p className="mb-3 text-gray-400">Please visit :</p>

          <a
            href="https://github.com/osdag-admin/Osdag/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline break-all text-sm"
          >
            https://github.com/osdag-admin/Osdag/discussions
          </a>
        </div>

      </div>
    </div>
  );
}
