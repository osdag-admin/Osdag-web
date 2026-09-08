/* eslint-disable react/prop-types */
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MODULE_ROUTES } from '../../constants/modules';
import { getProjectById } from "../../datasources/projectsDataSource";
import { saveOsiFromInputs } from "../../datasources/osiDataSource";
import { getModuleRoute } from "../../constants/moduleRoutes";

const btnBase =
  "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-osdag-green hover:text-osdag-green transition-all active:scale-95";

const ProjectActionButtons = ({
  project,
  onActionComplete,
  onGenerateReport,
}) => {
  const navigate = useNavigate();

  const handleOpenProject = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const route = MODULE_ROUTES[project.routeKey] || getModuleRoute(project.submodule);
    if (route) {
      navigate(`${route}/${project.id}`);
      if (onActionComplete) onActionComplete();
    } else {
      toast.error('Module route not found');
    }
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onGenerateReport) {
      onGenerateReport(project);
      return;
    }
    const route = MODULE_ROUTES[project.routeKey] || getModuleRoute(project.submodule);
    if (route) {
      navigate(`${route}/${project.id}?action=report`);
      if (onActionComplete) onActionComplete();
    } else {
      toast.error('Module route not found');
    }
  };

  const handleDownloadOsi = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const detailRes = await getProjectById(project.id);
      if (!detailRes.success) {
        toast.error('Failed to load project');
        return;
      }
      const projectDetail = detailRes.project;
      const inputs = projectDetail?.inputs_json || {};
      const module_id = projectDetail?.submodule || projectDetail?.module || project.submodule;
      const data = await saveOsiFromInputs({ name: project.name, moduleId: module_id, inputs, inline: true });
      if (!data.success || !data.content_base64) {
        toast.error(data.error || 'Failed to prepare OSI');
        return;
      }
      const binaryString = atob(data.content_base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename || `${project.name}.osi`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (_e) {
      toast.error('Failed to download OSI');
    }
  };

  return (
    <>
      <button type="button" className={btnBase} onClick={handleOpenProject}>
        {/* Open icon */}
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Open Project
      </button>

      <button type="button" className={btnBase} onClick={handleGenerateReport}>
        {/* Report icon */}
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Generate Report
      </button>

      <button type="button" className={btnBase} onClick={handleDownloadOsi}>
        {/* Download icon */}
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download OSI
      </button>
    </>
  );
};

export default ProjectActionButtons;
