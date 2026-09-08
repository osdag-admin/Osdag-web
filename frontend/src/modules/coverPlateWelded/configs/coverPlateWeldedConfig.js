import { makeCoverPlateWeldedConfig } from '../../shared/config/coverPlateConfigFactory';

export const coverPlateWeldedConfig = makeCoverPlateWeldedConfig({
  sessionName: "Beam Cover Plate Welded Connection",
  routePath: "/design/connections/beam-to-beam-splice/cover_plate_welded",
  designType: "Beam-to-Beam-Cover-Plate-Welded-Connection",
  cadOptions: ["Model", "Beam", "CoverPlate"],
  sectionOptionsKey: "beamList",
  defaultLoads: { axial: "10", moment: "10", shear: "10" },
  memberMaterialField: "member_material",
});
