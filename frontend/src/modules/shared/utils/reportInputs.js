export function unwrapReportInputs(inputValues = {}) {
  const values = inputValues?.inputs && typeof inputValues.inputs === 'object'
    ? inputValues.inputs
    : inputValues || {};

  if (values.dock && typeof values.dock === 'object') {
    return { ...values.dock, ...(values.pref || {}) };
  }
  return values;
}
