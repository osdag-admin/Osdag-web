import { Navigate, useParams, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProjectAuthGuard = () => {
  const { loading, isGuest } = useAuth();
  const { projectId } = useParams();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin dark:border-slate-700 dark:border-t-blue-500" />
        <p className="mt-4 text-gray-500 font-sans text-sm tracking-wide animate-pulse dark:text-gray-400">Loading Osdag Module...</p>
      </div>
    );
  }

  // If they are a guest but trying to load a saved project ID, strip it and redirect them to the base endpoint
  if (projectId && isGuest) {
    const guestPath = location.pathname.replace(`/${projectId}`, '');
    return <Navigate to={guestPath} replace />;
  }

  return <Outlet />;
};

export default ProjectAuthGuard;
