import { useRouteError, useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <div id="error-page" className="min-h-screen bg-osdag-bg-gray flex flex-col items-center justify-center p-6 font-sans w-full">
      <div className="bg-osdag-card-bg border border-osdag-border rounded-2xl p-10 max-w-lg w-full shadow-auth text-center flex flex-col items-center justify-center">
        
        {/* Simple Warning Icon */}
        <div className="w-16 h-16 bg-osdag-bg-gray rounded-full flex items-center justify-center border border-osdag-border mb-6">
          <svg
            className="w-8 h-8 text-osdag-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-osdag-text-primary mb-4">
          Oops!
        </h1>
        
        <p className="text-osdag-text-secondary text-base leading-relaxed mb-6">
          Sorry, an unexpected error has occurred or the page you are looking for does not exist.
        </p>

        {/* Error Details Container */}
        <div className="w-full bg-osdag-bg-gray border border-osdag-border rounded-xl p-4 mb-8 text-left max-h-32 overflow-y-auto">
          <div className="text-subtitle uppercase tracking-wider text-osdag-text-muted mb-1 font-mono">
            Error Details
          </div>
          <p className="font-mono text-item-text text-osdag-text-primary break-all">
            <i>{error?.statusText || error?.message || "Unknown Routing/Runtime Error"}</i>
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          className="px-8 py-3.5 bg-osdag-green hover:bg-osdag-dark-green text-white font-semibold rounded-xl shadow-card hover:shadow-card-hover cursor-pointer"
          onClick={() => navigate("/home")}
        >
          Return to Home
        </button>
        
      </div>
    </div>
  );
}