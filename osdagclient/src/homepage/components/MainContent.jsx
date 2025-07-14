import React from 'react';
import ProjectCard from './ProjectCard';
import RecentProjects from '../../components/RecentProjects';
import { recentModules } from '../data/mockData';
import { isGuestUser } from '../../utils/auth';

const MainContent = () => {
  const isGuest = isGuestUser();

  return (
    <div className="bg-white dark:bg-slate-950 flex-1 px-12 pb-6">
      <div className="max-w-7xl mx-auto h-full">
        <div className={`grid grid-cols-1 ${isGuest ? 'xl:grid-cols-1' : 'xl:grid-cols-2'} gap-8 h-full`}>
          {/* Recent Projects Card */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-osdag-border dark:border-gray-700 p-6">
            <RecentProjects />
          </div>
          
          {/* Recently used Modules Card - Hidden for guests */}
          {!isGuest && (
            <ProjectCard 
              title="Recently used Modules"
              items={recentModules}
              type="module"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MainContent; 