import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectNameModal from '../../components/ProjectNameModal';
import { getCurrentUserEmail, isGuestUser } from '../../utils/auth';
import { MODULE_KEY_FIN_PLATE } from '../../constants/DesignKeys';

const MODULE_ROUTES = {
  fp: "/design/connections/shear/fin_plate",
  [MODULE_KEY_FIN_PLATE]: "/design/connections/shear/fin_plate",
  ca: "/design/connections/shear/cleat_angle",
  ep: "/design/connections/shear/end_plate",
  sa: "/design/connections/shear/seated_angle",
  cpb: "/design/connections/beam-to-beam-splice/cover_plate_bolted",
  cpw: "/design/connections/beam-to-beam-splice/cover_plate_welded",
  boltedtoendplate: "/design/tension-member/bolted_to_end_gusset",
  weldedtoendplate: "/design/tension-member/welded_to_end_gusset",
  bp: "/design/connections/base_plate",
};

const ProjectCard = ({ title, items, type = 'project' }) => {
  const navigate = useNavigate();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const getIcon = (type, itemType) => {
    if (type === 'project') {
      return (
        <div className="w-8 h-8 bg-osdag-green/10 rounded-lg flex items-center justify-center">
          <span className="text-osdag-green font-semibold text-sm">L</span>
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 bg-osdag-green/10 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-osdag-green" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  const handleModuleClick = (item) => {
    const route = MODULE_ROUTES[item.module_id];
    if (!route) return;
    if (isGuestUser()) {
      navigate(route);
      return;
    }
    setSelectedModule(item);
    setShowProjectModal(true);
  };

  const handleProjectModalConfirm = async (projectName) => {
    if (selectedModule) {
      try {
        const safeProjectName = (projectName || `${selectedModule.name} Project`).replace(/\s+/g, '_');
        const response = await fetch('http://localhost:8000/api/projects/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: safeProjectName,
            module_id: selectedModule.module_id,
            module_name: selectedModule.name,
            user_email: getCurrentUserEmail(),
          }),
        });
        if (response.ok) {
          const route = MODULE_ROUTES[selectedModule.module_id];
          if (route) {
            navigate(`${route}/${encodeURIComponent(safeProjectName)}`);
          }
        }
      } catch (e) {
        // handle error
      }
      setShowProjectModal(false);
      setSelectedModule(null);
    }
  };

  const handleProjectModalCancel = () => {
    setShowProjectModal(false);
    setSelectedModule(null);
  };

  return (
    <div className="rounded-2xl border border-osdag-border dark:border-gray-700 shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <div className="p-6 border-b border-osdag-border dark:border-gray-700">
        <h2 className="text-card-title text-osdag-text-primary dark:text-white">
          {title}
        </h2>
      </div>

      <div className="h-card-content overflow-y-auto scrollbar-thin">
        <div className="p-6 space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all duration-300 group bg-gray-50/50 dark:bg-gray-800/20 border-osdag-border dark:border-gray-700 hover:bg-osdag-green/20 hover:border-osdag-green/20 dark:hover:bg-osdag-green/20 hover:shadow-sm ${type === 'project' ? 'hover:pb-8 cursor-pointer' : ''}`}
              onClick={type === 'project' ? () => {/* existing project click logic if any */} : undefined}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getIcon(type, item.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-item-text text-osdag-text-primary dark:text-white font-semibold">
                        {item.name}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-subtitle text-osdag-text-secondary dark:text-gray-400 mb-2 truncate">
                        {item.description}
                      </p>
                    )}

                    {item.subtitle && (
                      <p className="text-subtitle text-osdag-text-secondary dark:text-gray-400 mb-2">
                        {item.subtitle}
                      </p>
                    )}

                    {/* Action buttons - show on hover for all items */}
                    {type === 'project' && (
                      <div className="flex flex-wrap gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 max-h-0 group-hover:max-h-20 overflow-hidden">
                        <button className="px-3 py-1.5 text-xs font-medium bg-osdag-green/10 text-osdag-green rounded-lg hover:bg-osdag-green/20 transition-colors">
                          Generate Report
                        </button>
                        <button className="px-3 py-1.5 text-xs font-medium bg-osdag-green/10 text-osdag-green rounded-lg hover:bg-osdag-green/20 transition-colors">
                          Download OSI
                        </button>
                        <button className="px-3 py-1.5 text-xs font-medium bg-osdag-green/10 text-osdag-green rounded-lg hover:bg-osdag-green/20 transition-colors">
                          Open project
                        </button>
                      </div>
                    )}
                    {type === 'module' && (
                      <div className="flex flex-wrap gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 max-h-0 group-hover:max-h-20 overflow-hidden">
                        <button
                          className="px-3 py-1.5 text-xs font-medium bg-osdag-green/10 text-osdag-green rounded-lg hover:bg-osdag-green/20 transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleModuleClick(item); }}
                        >
                          Open
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-subtitle text-osdag-text-muted dark:text-gray-500 ml-4 flex-shrink-0">
                  {item.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Project Name Modal for modules */}
      {type === 'module' && (
        <ProjectNameModal
          visible={showProjectModal}
          onCancel={handleProjectModalCancel}
          onConfirm={handleProjectModalConfirm}
        />
      )}
    </div>
  );
};

export default ProjectCard; 