import { CONN_CFBW } from '../../constants/generated/coreKeys';
import { fetchModuleOptions } from '../../datasources/modulesDataSource';
import { unwrapReportInputs } from '../../modules/shared/utils/reportInputs';

const isAllSelection = (value) =>
  value === undefined ||
  value === null ||
  value === '' ||
  value === 'All' ||
  (Array.isArray(value) && (value.length === 0 || value.includes('All')));

/**
 * What the report dialog needs to rebuild a saved project's design request. A saved project
 * doesn't record which lists were on "All"; those lists are stored empty, so they are treated
 * as "All" and filled from the module's option lists.
 */
export async function loadProjectReportContext(savedInputs, moduleId, moduleConfig) {
  const inputs = unwrapReportInputs(savedInputs);
  const selectedOption = inputs.connectivity || CONN_CFBW;

  const allSelected = {};
  for (const selection of moduleConfig?.selectionConfig || []) {
    allSelected[selection.inputKey] = isAllSelection(inputs[selection.inputKey]);
  }

  const lists = await fetchModuleOptions(moduleId, { connectivity: inputs.connectivity })
    .then((options) => options?.data?.data || options?.data || {})
    .catch(() => ({}));

  return { allSelected, lists, extraState: { selectedOption } };
}
