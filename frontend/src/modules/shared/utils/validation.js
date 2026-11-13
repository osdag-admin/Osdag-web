// Shared required-field validation, derived from inputSections config instead of hand-written per module.
// Design: every field is required unless it explicitly sets `required: false`.

// Types whose required-ness is fully determined by presence/emptiness of inputs[field.key].
const SIMPLE_VALUE_TYPES = new Set([
  'number', 'text', 'select', 'connectivitySelect', 'endPlateSelect',
  'sectionProfileSelect', 'sectionProfileList', 'dynamicSelect', 'thickness',
]);

/**
 * Labels copied from osdag_core keep its trailing "*" (e.g. "Width of Plate (mm) *"). That star
 * is part of the key's display string, not our required marker, which comes from `field.required`.
 */
export const stripRequiredMark = (label) =>
  typeof label === 'string' ? label.replace(/\s*\*\s*$/, '') : label;

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

// The numeric input strips letters while typing, but partial entries such as "-" or "." survive.
const isNumericValue = (value) => {
  if (typeof value === 'number') return Number.isFinite(value);
  return /^-?(\d+\.?\d*|\.\d+)$/.test(String(value).trim());
};

/** Visible, enabled 'number' fields whose non-empty value is not a number. */
export const getInvalidNumberFields = (inputSections, inputs, extraState) => {
  const invalid = [];
  for (const section of inputSections || []) {
    for (const field of section.fields || []) {
      const effectiveType = typeof field.conditionalType === 'function' ? field.conditionalType(inputs) : field.type;
      if (!field.key || effectiveType !== 'number' || field.disabled) continue;
      if (field.conditionalDisplay && !field.conditionalDisplay(extraState, inputs)) continue;
      const value = inputs?.[field.key];
      if (isEmptyValue(value) || isNumericValue(value)) continue;
      invalid.push({ key: field.key, label: field.label });
    }
  }
  return invalid;
};

/** Convenience wrapper returning the shape modules' validateInputs() expects. */
export const validateRequiredFields = (inputSections, inputs, extraState, selectionStates, message) => {
  const missing = getMissingRequiredFields(inputSections, inputs, extraState, selectionStates);
  if (missing.length === 0) {
    const invalid = getInvalidNumberFields(inputSections, inputs, extraState);
    if (invalid.length === 0) return { isValid: true };
    const badLabel = stripRequiredMark(invalid[0].label)?.trim() || invalid[0].key;
    return { isValid: false, message: `Please enter a valid number: ${badLabel}` };
  }
  const label = stripRequiredMark(missing[0].label)?.trim() || missing[0].key;
  return { isValid: false, message: message || `Please fill: ${label}` };
};
