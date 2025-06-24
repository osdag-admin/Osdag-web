import React from 'react';
import ProjectCard from './ProjectCard';
import { recentProjects, recentModules } from '../data/mockData';

const MainContent = () => {
  return (
    <div className="bg-white dark:bg-slate-950 flex-1 px-12 pb-6">
      <div className="max-w-7xl mx-auto h-full">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
          {/* Recent Projects Card */}
          <ProjectCard 
            title="Recent Projects"
            items={recentProjects}
            type="project"
          />
          
          {/* Recently used Modules Card */}
          <ProjectCard 
            title="Recently used Modules"
            items={recentModules}
            type="module"
          />
        </div>
      </div>
    </div>
  );
};

export default MainContent; 