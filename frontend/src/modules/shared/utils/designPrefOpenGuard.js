/**
 * Desktop-equivalent of `designPrefDialog.flag` / section readiness:
 * do not open Additional Inputs until the same prerequisites as `validateInputs`
 * would pass for design (sections chosen, cleat list non-empty, etc.).
 *
 * Reuses each module's `validateInputs` so rules stay in one place.
 */
export function canOpenAdditionalInputs(
  moduleConfig,
  inputs,
  extraState = {},
  contextData = {},
  selectionStates = {}
) {
  if (!moduleConfig?.validateInputs) {
    return { ok: true };
  }
  try {
    const v = moduleConfig.validateInputs(
      inputs,
      extraState,
      contextData,
      selectionStates
    );
    if (v?.isValid) {
      return { ok: true };
    }
    return {
      ok: false,
      message:
        v?.message ||
        "Complete required basic inputs (including sections) before opening Additional Inputs.",
    };
  } catch {
    return { ok: true };
  }
}
