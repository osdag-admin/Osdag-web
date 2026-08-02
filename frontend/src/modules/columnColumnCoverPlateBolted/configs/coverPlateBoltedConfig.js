import { makeCoverPlateBoltedConfig } from '../../shared/config/coverPlateConfigFactory';

export const coverPlateBoltedConfig = makeCoverPlateBoltedConfig({
  sessionName: "Column Cover Plate Bolted Connection",
  routePath: "/design/connections/column-to-column-splice/cover_plate_bolted",
  designType: "Column-to-Column-Cover-Plate-Bolted-Connection",
  cadOptions: ["Model", "Column", "CoverPlate"],
  sectionOptionsKey: "columnList",
  defaultLoads: { axial: "100", moment: "70", shear: "50" },
});
