/* eslint-disable react/prop-types */
import React from 'react';
import { toast } from 'react-toastify';
import { DesignReportModal } from '../../modules/shared/components/DesignReportModal';
import { finPlateConfig } from '../../modules/shearConnection/finPlate/configs/finPlateConfig';
import { endPlateConfig } from '../../modules/shearConnection/endPlate/configs/endPlateConfig';
import { cleatAngleConfig } from '../../modules/shearConnection/cleatAngle/configs/cleatAngleConfig';
import { seatedAngleConfig } from '../../modules/shearConnection/seatAngle/configs/seatedAngleConfig';
import { coverPlateBoltedConfig } from '../../modules/coverPlateBolted/configs/coverPlateBoltedConfig';
import { coverPlateWeldedConfig } from '../../modules/coverPlateWelded/configs/coverPlateWeldedConfig';
import { beamBeamEndPlateConfig } from '../../modules/beamBeamEndPlate/configs/beamBeamEndPlateConfig';
import { beamToColumnEndPlateConfig } from '../../modules/beamToColumnEndPlate/configs/beamToColumnEndPlateConfig';
import { boltedToEndConfig } from '../../modules/TensionMembers/BoltedToEnd/configs/boltedToEndConfig';
import { simplySupportedBeamConfig } from '../../modules/flexuralMember/simplySupportedBeam/configs/simplySupportedBeamConfig';
import { purlinConfig } from '../../modules/flexuralMember/purlin/configs/purlinConfig';
import { onCantileverConfig } from '../../modules/flexuralMember/onCantilever/configs/onCantileverConfig';
import { lapJointWeldedConfig } from '../../modules/SimpleConnection/LapJointWelded/config/lapJointWeldedConfig';
import { lapJointBoltedConfig } from '../../modules/SimpleConnection/LapJointBolted/config/lapJointBoltedConfig';
import { buttJointWeldedConfig } from '../../modules/SimpleConnection/ButtJointWelded/config/buttJointWeldedConfig';
import { buttJointBoltedConfig } from '../../modules/SimpleConnection/ButtJointBolted/config/buttJointBoltedConfig';
import { isGuestUser } from '../../utils/auth';
import {
  MODULE_KEY_FIN_PLATE,
  MODULE_KEY_CLEAT_ANGLE,
  MODULE_KEY_END_PLATE,
  MODULE_KEY_SEAT_ANGLE,
  MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_BOLTED,
  MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_WELDED,
  MODULE_KEY_BEAM_BEAM_END_PLATE_ALT,
  MODULE_KEY_BEAM_COLUMN_END_PLATE_ALT,
  MODULE_KEY_TENSION_BOLTED,
  MODULE_KEY_SIMPLY_SUPPORTED_BEAM,
  MODULE_KEY_PURLIN,
  MODULE_KEY_ON_CANTILEVER_BEAM,
  MODULE_KEY_LAP_JOINT_WELDED,
  MODULE_KEY_LAP_JOINT_BOLTED,
  MODULE_KEY_BUTT_JOINT_WELDED,
  MODULE_KEY_BUTT_JOINT_BOLTED,
} from '../../constants/DesignKeys';
import { getProjectById } from "../../datasources/projectsDataSource";
import ProjectActionButtons from './ProjectActionButtons';
import { normalizeModuleKey } from '../../constants/modules';

const normalizeModuleId = normalizeModuleKey;

const ProjectsListCard = ({ projects: projectsProp = [], loading: loadingProp = false, onDeleteProject }) => {
  const [projects, setProjects] = React.useState(projectsProp);
  const [loading, setLoading] = React.useState(loadingProp);
  const [reportModalOpen, setReportModalOpen] = React.useState(false);
  const [designReportInputs, setDesignReportInputs] = React.useState({
    companyName: "Your company",
    groupTeamName: "Your team",
    designer: "You",
    projectTitle: "",
    subtitle: "",
    jobNumber: "1",
    client: "Someone else",
    additionalComments: "No comments",
    companyLogo: null,
    companyLogoName: "",
  });
  const [reportInputValues, setReportInputValues] = React.useState({});
  const [reportModuleId, setReportModuleId] = React.useState(null);
  const [reportModuleConfig, setReportModuleConfig] = React.useState(null);
  const [reportAllSelected, setReportAllSelected] = React.useState({});
  const [reportExtraState, setReportExtraState] = React.useState({});


  const isGuest = isGuestUser();

  React.useEffect(() => {
    if (isGuest) {
      setProjects([]);
      setLoading(false);
      return;
    }
    // If parent didn't provide projects, rely on MainContent's datasource-driven list
    if (projectsProp && projectsProp.length > 0) {
      setProjects(projectsProp);
      setLoading(loadingProp);
    } else {
      // No projects passed in and user is not guest: show empty state
      setProjects([]);
      setLoading(false);
    }
  }, [isGuest, projectsProp, loadingProp]);

  const handleDeleteProject = async (projectId) => {
    if (onDeleteProject) await onDeleteProject(projectId);
  };

  const handleGenerateReportClick = async (project) => {
    try {
      const detail = await fetchProjectDetail(project.id);
      setReportInputValues(detail?.inputs_json || {});
      const rawModId = detail?.submodule || detail?.module || MODULE_KEY_FIN_PLATE;
      const modId = normalizeModuleId(rawModId);
      setReportModuleId(modId);
      // Resolve moduleConfig to reuse DesignReportModal logic
      const resolver = {
        [MODULE_KEY_FIN_PLATE]: finPlateConfig,
        [MODULE_KEY_END_PLATE]: endPlateConfig,
        [MODULE_KEY_CLEAT_ANGLE]: cleatAngleConfig,
        [MODULE_KEY_SEAT_ANGLE]: seatedAngleConfig,
        [MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_BOLTED]: coverPlateBoltedConfig,
        [MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_WELDED]: coverPlateWeldedConfig,
        [MODULE_KEY_BEAM_BEAM_END_PLATE_ALT]: beamBeamEndPlateConfig,
        [MODULE_KEY_BEAM_COLUMN_END_PLATE_ALT]: beamToColumnEndPlateConfig,
        [MODULE_KEY_TENSION_BOLTED]: boltedToEndConfig,
        [MODULE_KEY_SIMPLY_SUPPORTED_BEAM]: simplySupportedBeamConfig,
        [MODULE_KEY_PURLIN]: purlinConfig,
        [MODULE_KEY_ON_CANTILEVER_BEAM]: onCantileverConfig,
        [MODULE_KEY_LAP_JOINT_WELDED]: lapJointWeldedConfig,
        [MODULE_KEY_LAP_JOINT_BOLTED]: lapJointBoltedConfig,
        [MODULE_KEY_BUTT_JOINT_WELDED]: buttJointWeldedConfig,
        [MODULE_KEY_BUTT_JOINT_BOLTED]: buttJointBoltedConfig,
      };
      const cfg = resolver[modId] || null;
      setReportModuleConfig(cfg);
      // allSelected: set all to false so saved arrays are used as-is
      if (cfg && Array.isArray(cfg.selectionConfig)) {
        const initSel = cfg.selectionConfig.reduce((acc, s) => { acc[s.inputKey] = false; return acc; }, {});
        setReportAllSelected(initSel);
      } else {
        setReportAllSelected({});
      }
      // extraState: carry connectivity for FinPlate (or default)
      const defaultConnectivity = 'Column Flange-Beam-Web';
      const selectedOption = (detail?.inputs_json && detail.inputs_json.connectivity) || defaultConnectivity;
      setReportExtraState({ selectedOption });
      setReportModalOpen(true);
    } catch (e) {
      toast.error(e.message || 'Failed to load project');
    }
  };

  const fetchProjectDetail = async (projectId) => {
    const data = await getProjectById(projectId);
    if (!data.success) throw new Error(data.error || 'Failed to load project');
    return data.project;
  };


  if (isGuest) {
    return (
      <div className="text-center p-10 text-gray-500 dark:text-gray-400">
        Projects are not available in guest mode
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-10">
        <div className="w-10 h-10 border-4 border-osdag-green border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="mt-4 text-gray-500 dark:text-white">Loading recent projects...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center p-10 dark:text-white">
        <p className="text-gray-500 dark:text-gray-400 mb-2">No recent projects</p>
        <p className="text-gray-600 dark:text-gray-500 text-sm">Start designing to see your projects here</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getProjectIcon = () => (
    <div className="w-8 h-8 bg-osdag-green/10 rounded-lg flex items-center justify-center">
      <span className="text-osdag-green font-semibold text-sm">L</span>
    </div>
  );

  return (
    <>
      {projects.map((project) => (
        <div key={project.id} className="p-4 rounded-xl border transition-all duration-300 cursor-pointer group bg-gray-50/50 dark:bg-gray-800/20 border-osdag-border dark:border-gray-700 hover:bg-osdag-green/20 hover:border-osdag-green/20 dark:hover:bg-osdag-green/20 hover:shadow-sm pb-8 md:pb-4 md:hover:pb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {getProjectIcon()}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-item-text text-osdag-text-primary dark:text-white font-semibold">{project.name}</span>
                </div>
                <p className="text-subtitle text-osdag-text-secondary dark:text-gray-400 mb-2">
                  Last modified: {formatDate(project.updated_at)} · Created: {formatDate(project.created_at)}
                </p>
                <div className="flex flex-wrap gap-2 mt-3 opacity-100 max-h-40 md:opacity-0 md:group-hover:opacity-100 md:max-h-0 md:group-hover:max-h-20 transition-all duration-300 overflow-hidden">
                  <ProjectActionButtons
                    project={project}
                    onGenerateReport={handleGenerateReportClick}
                  />

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-400 transition-all active:scale-95"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this project?')) {
                        handleDeleteProject(project.id);
                      }
                    }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <DesignReportModal
        isOpen={reportModalOpen}
        onCancel={() => { setReportModalOpen(false); }}
        onOk={() => { setReportModalOpen(false); }}
        designReportInputs={designReportInputs}
        setDesignReportInputs={setDesignReportInputs}
        output={{}} /* truthy to satisfy modal precondition */
        moduleId={reportModuleId}
        inputValues={reportInputValues}
        logs={[]}
        moduleConfig={reportModuleConfig}
        allSelected={reportAllSelected}
        extraState={reportExtraState}
      />
    </>
  );
};

export default ProjectsListCard;


