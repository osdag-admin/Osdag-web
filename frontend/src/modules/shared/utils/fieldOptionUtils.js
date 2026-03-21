import { INPUT_KEY_TO_LIST } from '../constants/moduleDataKeys';

/**
 * Resolve raw options for a field from contextData or field config.
 * @param {Object} field - Field config (options, getOptions, type)
 * @param {Object} contextData - Module lists (e.g. beamList, boltDiameterList)
 * @param {Object} inputs - Current form inputs (for getOptions / dynamicSelect)
 * @returns {Array} Raw list (array of values or { value, label } objects)
 */
export function getOptionsForField(field, contextData = {}, inputs = {}) {
  if (!field) return [];
  if (Array.isArray(field.options)) return field.options;
  if (typeof field.getOptions === 'function') return field.getOptions(inputs) || [];
  if (typeof field.options === 'string') return contextData[field.options] ?? [];
  if (field.type === 'sectionProfileList') return contextData[field.type] ?? contextData.sectionProfileList ?? [];
  return [];
}

/**
 * Get the list array for an input key (for "All" / customizable).
 * @param {string} inputKey - Form input key (e.g. bolt_diameter)
 * @param {Object} contextData - Module lists
 * @param {string} [fieldDataSource] - Optional override from field.dataSource
 * @returns {Array}
 */
export function getListForInputKey(inputKey, contextData = {}, fieldDataSource) {
  const listKey = fieldDataSource || INPUT_KEY_TO_LIST[inputKey];
  if (!listKey) return [];
  const list = contextData[listKey];
  return Array.isArray(list) ? list : [];
}
