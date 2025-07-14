import React, { useState, useEffect } from 'react';
import { Button, Popconfirm, message, Spin, Empty } from 'antd';
import { EyeOutlined, DeleteOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { isGuestUser, getCurrentUserEmail } from '../utils/auth';
import { MODULE_KEY_FIN_PLATE, MODULE_DISPLAY_FIN_PLATE } from '../constants/DesignKeys';

const RecentProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingProject, setDeletingProject] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = 'http://localhost:8000/api/';
  
  // Check if user is a guest
  const isGuest = isGuestUser();
  const userEmail = getCurrentUserEmail();
  
  useEffect(() => {
    // Don't fetch projects for guest users
    if (isGuest) {
      setLoading(false);
      return;
    }
    
    fetchRecentProjects();
  }, [isGuest]);

  const fetchRecentProjects = async () => {
    try {
      setLoading(true);
      console.log('Fetching projects for user email:', userEmail);
      console.log('Is guest user:', isGuest);
      
      const url = `${BASE_URL}projects/?user_email=${encodeURIComponent(userEmail)}`;
      console.log('API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setProjects(data.projects);
        console.log('Projects loaded successfully:', data.projects);
      } else {
        console.error('API returned error:', data.error);
        message.error('Failed to load recent projects');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to load recent projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      setDeletingProject(projectId);
      const response = await fetch(`${BASE_URL}projects/${projectId}/?user_email=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        message.success('Project deleted successfully');
        fetchRecentProjects(); // Refresh the list
      } else {
        message.error(data.error || 'Failed to delete project');
      }
    } catch (error) {
      message.error('Failed to delete project');
    } finally {
      setDeletingProject(null);
    }
  };

  const handleOpenProject = (project) => {
    // Directly open the project without showing a modal
    handleProjectModalConfirm(project);
  };

  const handleProjectModalConfirm = async (project) => {
    try {
      const response = await fetch(`${BASE_URL}projects/${project.id}/?user_email=${encodeURIComponent(userEmail)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        // Store project data in localStorage for the module to use
        localStorage.setItem('currentProject', JSON.stringify(data.project));
        
        // Navigate to the appropriate module with project name in URL
        const moduleRoutes = {
          // Short keys from SelectModulePage
          'fp': '/design/connections/shear/fin_plate',
          'ca': '/design/connections/shear/cleat_angle',
          'ep': '/design/connections/shear/end_plate',
          'sa': '/design/connections/shear/seated_angle',
          'cpb': '/design/connections/beam-to-beam-splice/cover_plate_bolted',
          'cpw': '/design/connections/beam-to-beam-splice/cover_plate_welded',
          'boltedtoendplate': '/design/tension-member/bolted_to_end_gusset',
          'ssb': '/design/FlexureMember/simply_supported_beam',
          // Legacy full names (keep for backward compatibility)
          [MODULE_KEY_FIN_PLATE]: '/design/connections/shear/fin_plate',
          'End-Plate-Connection': '/design/connections/shear/end_plate',
          'Cleat-Angle-Connection': '/design/connections/shear/cleat_angle',
          'Seated-Angle-Connection': '/design/connections/shear/seated_angle',
          'Cover-Plate-Bolted-Connection': '/design/connections/beam-to-beam-splice/cover_plate_bolted',
          'Cover-Plate-Welded-Connection': '/design/connections/beam-to-beam-splice/cover_plate_welded',
          'Beam-Beam-End-Plate-Connection': '/design/connections/beam-to-beam-splice/end_plate',
          'Beam-to-Column-End-Plate-Connection': '/design/connections/column-beam/end_plate',
          'Tension-Member-Bolted-Design': '/design/tension-member/bolted_to_end_gusset',
          'Simply-Supported-Beam': '/design/FlexureMember/simply_supported_beam'
        };
        
        const route = moduleRoutes[project.module_id];
        if (route) {
          // Navigate with project name in URL
          const projectNameForUrl = encodeURIComponent(project.name);
          navigate(`${route}/${projectNameForUrl}`);
        } else {
          message.error('Module route not found');
        }
      } else {
        message.error(data.error || 'Failed to load project');
      }
    } catch (error) {
      message.error('Failed to load project');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getModuleDisplayName = (moduleId) => {
    const moduleNames = {
      // Short keys from SelectModulePage
      'fp': 'Fin Plate Connection',
      'ca': 'Cleat Angle Connection',
      'ep': 'End Plate Connection',
      'sa': 'Seated Angle Connection',
      'cpb': 'Cover Plate Bolted',
      'cpw': 'Cover Plate Welded',
      'boltedtoendplate': 'Tension Member Bolted',
      'ssb': 'Simply Supported Beam',
      // Legacy full names (keep for backward compatibility)
      [MODULE_KEY_FIN_PLATE]: MODULE_DISPLAY_FIN_PLATE,
      'End-Plate-Connection': 'End Plate Connection',
      'Cleat-Angle-Connection': 'Cleat Angle Connection',
      'Seated-Angle-Connection': 'Seated Angle Connection',
      'Cover-Plate-Bolted-Connection': 'Cover Plate Bolted',
      'Cover-Plate-Welded-Connection': 'Cover Plate Welded',
      'Beam-Beam-End-Plate-Connection': 'Beam-Beam End Plate',
      'Beam-to-Column-End-Plate-Connection': 'Beam-Column End Plate',
      'Tension-Member-Bolted-Design': 'Tension Member Bolted',
      'Simply-Supported-Beam': 'Simply Supported Beam'
    };
    return moduleNames[moduleId] || moduleId;
  };

  const getProjectIcon = () => {
    return (
      <div className="w-8 h-8 bg-osdag-green/10 rounded-lg flex items-center justify-center">
        <span className="text-osdag-green font-semibold text-sm">L</span>
      </div>
    );
  };

  // Show guest message instead of projects for guest users
  if (isGuest) {
    return (
      <div className="text-center p-10">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Guest Mode"
        >
          <p className="text-gray-600 mb-4">
            Projects are not available in guest mode. Please sign up or log in to save and manage your projects.
          </p>
        </Empty>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-10">
        <Spin size="large" />
        <div className="mt-4">Loading recent projects...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center p-10">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No recent projects"
        >
          <p className="text-gray-600 mb-4">
            Start designing to see your projects here
          </p>
        </Empty>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-osdag-border dark:border-gray-700 shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <div className="p-6 border-b border-osdag-border dark:border-gray-700">
        <h2 className="text-card-title text-osdag-text-primary dark:text-white flex items-center">
          <ClockCircleOutlined className="mr-2" />
          Recent Projects
        </h2>
      </div>

      <div className="h-card-content overflow-y-auto scrollbar-thin">
        <div className="p-6 space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-4 rounded-xl border transition-all duration-300 cursor-pointer group bg-gray-50/50 dark:bg-gray-800/20 border-osdag-border dark:border-gray-700 hover:bg-osdag-green/20 hover:border-osdag-green/20 dark:hover:bg-osdag-green/20 hover:shadow-sm hover:pb-8"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getProjectIcon()}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-item-text text-osdag-text-primary dark:text-white font-semibold">
                        {project.name}
                      </span>
                      {project.has_output && (
                        <FileTextOutlined className="text-green-500 text-sm" title="Has output" />
                      )}
                    </div>

                    <p className="text-subtitle text-osdag-text-secondary dark:text-gray-400 mb-2">
                      {getModuleDisplayName(project.module_id)}
                    </p>

                    {/* Action buttons - show on hover */}
                    <div className="flex flex-wrap gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 max-h-0 group-hover:max-h-20 overflow-hidden">
                      <button 
                        className="px-3 py-1.5 text-xs font-medium bg-osdag-green/10 text-osdag-green rounded-lg hover:bg-osdag-green/20 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenProject(project);
                        }}
                      >
                        Open Project
                      </button>
                      <Popconfirm
                        title="Delete this project?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDeleteProject(project.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <button 
                          className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          {deletingProject === project.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </Popconfirm>
                    </div>
                  </div>
                </div>
                <span className="text-subtitle text-osdag-text-muted dark:text-gray-500 ml-4 flex-shrink-0">
                  {formatDate(project.updated_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentProjects; 