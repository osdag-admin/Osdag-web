import React, { useState } from 'react';
import { message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import ProjectNameModal from '../../../homepage/components/ProjectNameModal';
import { isGuestUser, canCreateProjects } from '../../../utils/auth';
import { expandAllSelectedInputs } from '../utils/osiInputSerializer';
import { createProject } from '../../../datasources/projectsDataSource';

/**
 * Hook to manage project creation logic and the naming modal
 */
export const useProjectCreation = ({
  inputs,
  extraState,
  allSelected,
  contextData,
  moduleConfig,
}) => {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleCreateProject = () => {
    if (isGuestUser()) {
      message.warning("Guest users cannot create projects. Please log in to create projects.");
      return;
    }
    if (!canCreateProjects()) {
      message.error("Please verify your email to create projects. Check your inbox for the verification link.");
      return;
    }
    setShowProjectModal(true);
  };

  const handleProjectModalConfirm = async (projectName) => {
    try {
      const safeProjectName = (projectName || 'Untitled Project').replace(/\s+/g, '_');
      const module_id = moduleConfig?.designType || inputs?.module;
      const parent_module = moduleConfig?.parentModule || 'connections';
      const mergedState = { ...inputs, ...extraState };
      const inputsForSave = expandAllSelectedInputs(mergedState, allSelected, contextData);

      const payload = {
        name: safeProjectName,
        module: parent_module,
        submodule: module_id,
        inputs_json: inputsForSave || {},
      };

      const result = await createProject(payload);
      if (result.success && result.project_id) {
        message.success(`Project "${safeProjectName}" created successfully`);
        // Navigate to current path + project ID
        const currentPath = location.pathname;
        navigate(`${currentPath}/${result.project_id}`, { replace: true });
      } else {
        message.error(result.error || 'Failed to create project');
      }
    } catch (err) {
      console.error('Error creating project:', err);
      message.error('Failed to create project');
    } finally {
      setShowProjectModal(false);
    }
  };

  const handleProjectModalCancel = () => {
    setShowProjectModal(false);
  };

  const projectCreationModal = (
    <ProjectNameModal
      visible={showProjectModal}
      onConfirm={handleProjectModalConfirm}
      onCancel={handleProjectModalCancel}
      title="Name Your Project"
      message="Please give your project a name to save it for later access."
      defaultValue=""
      confirmText="Create Project"
    />
  );

  return {
    handleCreateProject,
    projectCreationModal,
  };
};
