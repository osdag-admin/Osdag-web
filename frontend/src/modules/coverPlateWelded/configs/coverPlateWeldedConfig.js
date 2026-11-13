import { makeCoverPlateWeldedConfig } from '../../shared/config/coverPlateConfigFactory';
import { KEY_DISP_BEAMCOVERPLATEWELD } from "../../../constants/generated/coreKeys";

export const coverPlateWeldedConfig = makeCoverPlateWeldedConfig({
  sessionName: "Beam Cover Plate Welded Connection",
  designType: KEY_DISP_BEAMCOVERPLATEWELD,
  cadOptions: ["Model", "Beam", "CoverPlate"],
  sectionOptionsKey: "beamList",
  defaultLoads: { axial: "10", moment: "10", shear: "10" },
  memberMaterialField: "member_material",
});
