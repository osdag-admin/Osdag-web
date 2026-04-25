import React, { useEffect, useState } from 'react';
import DashboardSectionCard from './DashboardSectionCard';
import ProjectsListCard from './ProjectsListCard';
import ModulesListCard from './ModulesListCard';
import { isGuestUser, getCurrentUserEmail } from '../../utils/auth';
import { getModuleDisplayName } from '../../constants/moduleNames';
import { listProjects, deleteProject as deleteProjectApi } from "../../datasources/projectsDataSource";

const MainContent = () => {
  const isGuest = isGuestUser();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const userEmail = getCurrentUserEmail();

  useEffect(() => {
    if (isGuest) {
      setLoading(false);
      return;
    }
    fetchRecentProjects();
    // eslint-disable-next-line
  }, [isGuest]);

  const fetchRecentProjects = async () => {
    setLoading(true);
    try {
      const data = await listProjects();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
      }
    } catch (e) {
      // swallow; UI will just show empty state
    } finally {
      setLoading(false);
    }
  };

  // Add a handler to delete a project and refresh the list
  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProjectApi(projectId);
      fetchRecentProjects();
    } catch (e) {
      // ignore; ProjectsListCard will show its own error if needed
    }
  };

  // Filter to most recent project per unique module_id
  const uniqueModulesMap = {};
  projects.forEach((project) => {
    if (
      !uniqueModulesMap[project.module_id] ||
      new Date(project.updated_at || project.created_at) > new Date(uniqueModulesMap[project.module_id].updated_at || uniqueModulesMap[project.module_id].created_at)
    ) {
      uniqueModulesMap[project.module_id] = project;
    }
  });
  const recentModules = Object.values(uniqueModulesMap).map(project => ({
    name: getModuleDisplayName(project.module_id),
    description: project.name,
    date: project.updated_at ? new Date(project.updated_at).toLocaleDateString() : '',
    module_id: project.module_id,
    project_id: project.id,
  }));

  return (
    <div className=" flex-1 px-12 pb-6">
      <div className="max-w-7xl mx-auto h-full">
        <div className={`flex flex-row gap-8 h-full`}>
          {/* Recent Projects */}
          <div className="flex-1">
            <DashboardSectionCard title="Recent Projects">
              <ProjectsListCard projects={projects} loading={loading} onDeleteProject={handleDeleteProject} />
            </DashboardSectionCard>
          </div>

          {/* Recently used Modules */}
          {isGuest ? null : (<div className="flex-1">
            <DashboardSectionCard title="Recently used Modules">
              <ModulesListCard items={recentModules} />
            </DashboardSectionCard>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainContent; 
