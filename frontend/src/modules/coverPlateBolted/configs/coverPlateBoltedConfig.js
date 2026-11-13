import { makeCoverPlateBoltedConfig } from '../../shared/config/coverPlateConfigFactory';
import { KEY_DISP_BEAMCOVERPLATE } from "../../../constants/generated/coreKeys";

export const coverPlateBoltedConfig = makeCoverPlateBoltedConfig({
  sessionName: "Beam Cover Plate Bolted Connection",
  designType: KEY_DISP_BEAMCOVERPLATE,
  cadOptions: ["Model", "Beam", "CoverPlate"],
  sectionOptionsKey: "beamList",
  defaultLoads: { axial: "10", moment: "10", shear: "10" },
});
