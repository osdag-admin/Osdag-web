// Shared required-field validation, derived from inputSections config instead of hand-written per module.
// Design: every field is required unless it explicitly sets `required: false`.

// Types whose required-ness is fully determined by presence/emptiness of inputs[field.key].
const SIMPLE_VALUE_TYPES = new Set([
  'number', 'text', 'select', 'connectivitySelect', 'endPlateSelect',
  'sectionProfileSelect', 'sectionProfileList', 'dynamicSelect', 'thickness',
]);

const isEmptyValue = (value) => {
  if (value === undefined || value === null || value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
};

/**
 * Walk every field in inputSections and return the ones that are required (default,
 * unless `required: false`), currently visible (conditionalDisplay), not disabled,
 * and empty in `inputs`.
 *
 * "customizable" fields (bolt diameter/grade, plate thickness, anchor sizes, etc.) are a
 * special case: their value only needs to be a non-empty array when the sibling
 * `selectionStates[field.selectionKey]` is "Customized" — otherwise the full list from
 * `field.dataSource` is used instead of `inputs[field.key]`, so an empty array is valid.
 */
export const getMissingRequiredFields = (inputSections, inputs, extraState, selectionStates) => {
  const missing = [];
  for (const section of inputSections || []) {
    for (const field of section.fields || []) {
      if (!field.key) continue;
      if (field.disabled || field.required === false) continue;
      if (field.conditionalDisplay && !field.conditionalDisplay(extraState, inputs)) continue;

      if (field.type === 'customizable') {
        const isCustomized = selectionStates?.[field.selectionKey] === 'Customized';
        if (isCustomized && isEmptyValue(inputs?.[field.key])) {
          missing.push({ key: field.key, label: field.label });
        }
        continue;
      }

      if (!SIMPLE_VALUE_TYPES.has(field.type)) continue;
      if (isEmptyValue(inputs?.[field.key])) {
        missing.push({ key: field.key, label: field.label });
      }
    }
  }
  return missing;
};

/** Convenience wrapper returning the shape modules' validateInputs() expects. */
export const validateRequiredFields = (inputSections, inputs, extraState, selectionStates, message) => {
  const missing = getMissingRequiredFields(inputSections, inputs, extraState, selectionStates);
  if (missing.length === 0) return { isValid: true };
  const label = missing[0].label?.replace(/\*\s*$/, '').trim() || missing[0].key;
  return { isValid: false, message: message || `Please fill: ${label}` };
};
