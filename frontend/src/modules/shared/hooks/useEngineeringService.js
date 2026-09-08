/**
 * useEngineeringService Hook
 * 
 * Centralized API service layer for all engineering module operations.
 * This hook contains NO state - only API call functions.
 * 
 * All API calls are extracted from:
 * - ModuleState.jsx (Context)
 * - moduleApi.js
 * - EngineeringModule.jsx
 * - DesignReportModal.jsx
 */

import { useCallback } from 'react';
import { exportToCSV as exportToCSVUtil } from '../../../utils/csvUtils';
import {
  fetchModuleOptions,
  createDesign as dsCreateDesign,
  createCad as dsCreateCad,
  downloadCad as dsDownloadCad,
  exportCad as dsExportCad,
  addCustomMaterial as dsAddCustomMaterial,
  fetchDesignPreferences as dsFetchDesignPreferences,
} from '../../../datasources/modulesDataSource';
import { generateInitialReport as dsGenerateInitialReport, customizeReport as dsCustomizeReport } from '../../../datasources/reportsDataSource';
import { saveOsiFromInputs as dsSaveOsiFromInputs } from '../../../datasources/osiDataSource';
import { apiClient } from '../../../utils/apiClient';
import { getModuleSlug } from '../../../constants/apiRoutes';

// ===================================================================
// MAIN HOOK
// ===================================================================

export const useEngineeringService = () => {
  const apiCall = apiClient;

  // ===================================================================
  // 1. MODULE DATA - Get module options and data
  // ===================================================================

  /**
   * Get module data (options, lists, etc.)
   * @param {string} moduleKey - Module identifier
   * @param {Object} options - Optional parameters
   * @param {string} options.connectivity - Connection type filter
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  const getModuleData = useCallback(async (moduleKey, options = {}) => {
    try {
      return await fetchModuleOptions(moduleKey, {
        connectivity: options.connectivity,
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // ===================================================================
  // 2. DESIGN - Design calculation
  // ===================================================================

  /**
   * Create design calculation
   * @param {string} moduleKey - Module identifier
   * @param {Object} inputs - Design input values
   * @returns {Promise<{status: number, body: Object}>}
   */
  const createDesign = useCallback(async (moduleKey, inputs) => {
    try {
      return await dsCreateDesign(moduleKey, inputs);
    } catch (error) {
      return { status: 500, body: { success: false, error: error.message } };
    }
  }, []);

  // ===================================================================
  // 3. CAD - 3D Model generation and download
  // ===================================================================

  /**
   * Create 3D CAD model
   * @param {string} moduleKey - Module identifier
   * @param {Object} inputs - Design input values
   * @returns {Promise<{success: boolean, files?: Object, hover_dict?: Object, error?: string}>}
   */
  const createCADModel = useCallback(async (moduleKey, inputs) => {
    try {
      const { status, data } = await dsCreateCad(moduleKey, inputs);

      // Handle "coming soon" status (200 with coming_soon status)
      if (status === 200 && data.status === 'coming_soon') {
        return {
          success: false,
          coming_soon: true,
          message: data.message || '3D model generation is coming soon',
        };
      }

      if (status === 201 && data.status === 'success') {
        return {
          success: true,
          files: data.files,
          hover_dict: data.hover_dict,
        };
      } else {
        throw new Error(data.message || 'CAD generation failed');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Download CAD model in specified format
   * @param {string} format - File format (e.g., 'step', 'iges', 'stl')
   * @returns {Promise<{success: boolean, blob?: Blob, error?: string}>}
   */
  const downloadCADModel = useCallback(async (format) => {
    try {
      return await dsDownloadCad(format);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Export CAD in requested format using module inputs.
   */
  const exportCADModel = useCallback(
    async (moduleId, inputValues, format, section = "Model") => {
      try {
        return await dsExportCad(moduleId, inputValues, format, section);
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    []
  );

  /**
   * Design and generate CAD in one call
   * @param {string} moduleKey - Module identifier
   * @param {Object} inputs - Design input values
   * @returns {Promise<{design?: Object, cad?: Object, error?: string}>}
   */
  const designAndGenerateCad = useCallback(async (moduleKey, inputs) => {
    try {
      // First, run design calculation
      const designResult = await createDesign(moduleKey, inputs);
      
      if (designResult.status !== 201) {
        return { design: null, cad: null, error: designResult.body?.message || 'Design calculation failed' };
      }

      const designData = designResult.body;
      const hasData = designData?.data && Object.keys(designData.data || {}).length > 0;
      const isSuccess = designResult.status === 201 && designData?.success !== false && (hasData || Array.isArray(designData));

      if (!isSuccess) {
        return { design: null, cad: null, error: designData?.message || 'Design calculation failed' };
      }

      // Then, generate CAD
      const cadResult = await createCADModel(moduleKey, inputs);
      
      if (!cadResult.success) {
        return { design: designData, cad: null, error: cadResult.error };
      }

      return { design: designData, cad: cadResult, error: null };
    } catch (error) {
      return { design: null, cad: null, error: error.message };
    }
  }, [createDesign, createCADModel]);

  // ===================================================================
  // 4. PROJECTS - Project management
  // ===================================================================

  /**
   * Get project by ID
   * @param {number} projectId - Project ID
   * @returns {Promise<{success: boolean, project?: Object, error?: string}>}
   */
  const getProject = useCallback(async (projectId) => {
    try {
      const response = await apiCall(`api/projects/${projectId}/`, {
        method: 'GET',
      });

      const data = await response.json();
      if (data.success && data.project) {
        return { success: true, project: data.project };
      } else {
        return { success: false, error: data.error || 'Project not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [apiCall]);

  /**
   * Update project
   * @param {number} projectId - Project ID
   * @param {Object} data - Project data to update
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const updateProject = useCallback(async (projectId, data) => {
    try {
      const response = await apiCall(`api/projects/${projectId}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to update project' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [apiCall]);

  // ===================================================================
  // 5. OSI FILES - OSI file generation
  // ===================================================================

  /**
   * Save OSI file from inputs
   * @param {string} name - Project name
   * @param {string} moduleId - Module identifier
   * @param {Object} inputs - Input values
   * @param {boolean} inline - Whether to return inline (for download)
   * @returns {Promise<{success: boolean, content_base64?: string, filename?: string, error?: string}>}
   */
  const saveOSIFromInputs = useCallback(async (name, moduleId, inputs, inline = false) => {
    try {
      return await dsSaveOsiFromInputs({ name, moduleId, inputs, inline });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // ===================================================================
  // 6. REPORTS - Report generation
  // ===================================================================

  /**
   * Generate initial report
   * @param {string} moduleKey - Module identifier (e.g., designType)
   * @param {Object} reportData - Report data including metadata, input_values, etc.
   * @returns {Promise<{success: boolean, report_id?: string, sections?: Object, error?: string}>}
   */
  const generateInitialReport = useCallback(async (moduleKey, reportData) => {
    try {
      return await dsGenerateInitialReport(moduleKey, reportData);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Customize report (generate PDF)
   * @param {string} reportId - Report ID
   * @param {Array<string>} selectedSections - Selected sections
   * @returns {Promise<{success: boolean, blob?: Blob, error?: string}>}
   */
  const customizeReport = useCallback(async (reportId, selectedSections) => {
    try {
      return await dsCustomizeReport(reportId, selectedSections);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // ===================================================================
  // 7. MATERIALS & PREFERENCES - Custom materials and design preferences
  // ===================================================================

  /**
   * Add custom material
   * @param {Object} materialData - Material data
   * @param {string} materialData.grade - Material grade
   * @param {Object} materialData.inputs - Material properties (fy_20, fy_20_40, fy_40, fu)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  const addCustomMaterial = useCallback(async (materialData) => {
    try {
      return await dsAddCustomMaterial(materialData);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Get design preferences
   * @param {Object} params - Query parameters
   * @param {string} params.supported_section - Supported section
   * @param {string} params.supporting_section - Supporting section
   * @param {string} params.connectivity - Connectivity type
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  const getDesignPreferences = useCallback(async (params = {}) => {
    try {
      return await dsFetchDesignPreferences(params);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Upload company logo
   * @param {File} file - Logo file
   * @param {string} filename - Logo filename
   * @returns {Promise<{success: boolean, logoPath?: string, error?: string}>}
   */
  const uploadCompanyLogo = useCallback(async (file, filename) => {
    try {
      const formData = new FormData();
      formData.append('file', file, filename);

      const response = await apiCall('api/company-logo/', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 201) {
        const result = await response.json();
        return { success: true, logoPath: result.logoFullPath };
      } else {
        throw new Error(`Logo upload failed: ${response.status}`);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [apiCall]);

  // ===================================================================
  // RETURN API
  // ===================================================================

  return {
    // Module Data
    getModuleData,

    // Design
    createDesign,
    designAndGenerateCad,

    // CAD
    createCADModel,
    downloadCADModel,
    exportCADModel,

    // Projects
    getProject,
    updateProject,

    // OSI Files
    saveOSIFromInputs,

    // Reports
    generateInitialReport,
    customizeReport,

    // Materials & Preferences
    addCustomMaterial,
    getDesignPreferences,
    uploadCompanyLogo,

    // CSV
    exportToCSV: exportToCSVUtil,

    // Utilities
    getSlug: getModuleSlug,
  };
};

