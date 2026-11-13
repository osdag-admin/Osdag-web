import { makeCoverPlateWeldedConfig } from '../../shared/config/coverPlateConfigFactory';
import { KEY_DISP_COLUMNCOVERPLATEWELD } from "../../../constants/generated/coreKeys";

export const coverPlateWeldedConfig = makeCoverPlateWeldedConfig({
  sessionName: "Column Cover Plate Welded Connection",
  designType: KEY_DISP_COLUMNCOVERPLATEWELD,
  cadOptions: ["Model", "Column", "CoverPlate"],
  sectionOptionsKey: "columnList",
  defaultLoads: { axial: "100", moment: "100", shear: "100" },
  memberMaterialField: "material",
  extraSubmissionParams: { flangespace: "0", type: "Fillet Weld" },
});
