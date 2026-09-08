import { makeCoverPlateBoltedConfig } from '../../shared/config/coverPlateConfigFactory';

export const coverPlateBoltedConfig = makeCoverPlateBoltedConfig({
  sessionName: "Beam Cover Plate Bolted Connection",
  routePath: "/design/connections/beam-to-beam-splice/cover_plate_bolted",
  designType: "Beam-to-Beam-Cover-Plate-Bolted-Connection",
  cadOptions: ["Model", "Beam", "CoverPlate"],
  sectionOptionsKey: "beamList",
  defaultLoads: { axial: "10", moment: "10", shear: "10" },
});
