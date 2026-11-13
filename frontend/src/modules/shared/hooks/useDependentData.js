import { useEffect } from "react";
import { KEY_DISP_FINPLATE, KEY_DISP_CLEATANGLE, CONN_CFBW, CONN_CWBW } from "../../../constants/generated/coreKeys";

/**
 * Handles side-effect data fetches that depend on form inputs.
 * - Supported section preferences (non Fin/Cleat)
 * - Design preferences for FinPlate/CleatAngle connectivity combos
 */
export const useDependentData = (getDesignPreferences, moduleConfig, inputs, extraState) => {
  // Supported section preferences for other modules
  useEffect(() => {
    const handler = setTimeout(() => {
      const loadSupportedData = async () => {
        const designationVal = inputs.section_designation || inputs.member_designation;
        if (
          designationVal &&
          moduleConfig.cameraKey !== KEY_DISP_FINPLATE &&
          moduleConfig.cameraKey !== KEY_DISP_CLEATANGLE
        ) {
          let resolvedDesignation = designationVal;
          if (Array.isArray(designationVal)) {
            resolvedDesignation = designationVal.find(item => item !== "All") || designationVal[0];
          }

          if (resolvedDesignation && resolvedDesignation !== "All" && resolvedDesignation !== "Select Section") {
            const getSectionType = (profile, cameraKey) => {
              const prof = String(profile || "").toLowerCase();
              if (prof.includes("angle")) return "angles";
              if (prof.includes("channel")) return "channels";
              if (prof.includes("column")) return "columns";
              if (prof.includes("beam")) return "beams";
              
              const cam = String(cameraKey || "").toLowerCase();
              if (cam.includes("compression") || cam.includes("tension") || cam.includes("strut")) {
                return "angles";
              }
              return "beams";
            };

            try {
              await getDesignPreferences({
                supported_section: resolvedDesignation,
                section_type: getSectionType(inputs.section_profile, moduleConfig.cameraKey),
              });
            } catch (error) {
              console.error("Failed to load supported data:", error);
            }
          }
        }
      };

      loadSupportedData();
    }, 250);

    return () => clearTimeout(handler);
  }, [inputs.section_designation, inputs.member_designation, inputs.section_profile, moduleConfig.cameraKey, getDesignPreferences]);

  // Design preferences for FinPlate / CleatAngle modules
  useEffect(() => {
    const handler = setTimeout(() => {
      const loadDesignPreferences = async () => {
        if (moduleConfig.cameraKey === KEY_DISP_FINPLATE || moduleConfig.cameraKey === KEY_DISP_CLEATANGLE) {
          const connectivity = extraState?.selectedOption || inputs.connectivity;

          try {
            let params = null;

            if (connectivity === CONN_CFBW || connectivity === CONN_CWBW) {
              if (inputs.column_section && inputs.beam_section) {
                params = {
                  supported_section: inputs.beam_section,
                  supporting_section: inputs.column_section,
                  connectivity: connectivity.split(" ").join("-"),
                };
              }
            } else if (connectivity === "Beam-Beam") {
              if (inputs.primary_beam && inputs.secondary_beam) {
                params = {
                  supported_section: inputs.secondary_beam,
                  supporting_section: inputs.primary_beam,
                  connectivity,
                };
              }
            }

            if (params) {
              await getDesignPreferences(params);
            }
          } catch {
            // Swallow error; caller can log if needed
          }
        }
      };

      loadDesignPreferences();
    }, 250);

    return () => clearTimeout(handler);
  }, [
    inputs.column_section,
    inputs.beam_section,
    inputs.primary_beam,
    inputs.secondary_beam,
    extraState?.selectedOption,
    inputs.connectivity,
    getDesignPreferences,
    moduleConfig.cameraKey,
  ]);
};


