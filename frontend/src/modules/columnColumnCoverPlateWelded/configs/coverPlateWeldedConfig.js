import { makeCoverPlateWeldedConfig } from '../../shared/config/coverPlateConfigFactory';

export const coverPlateWeldedConfig = makeCoverPlateWeldedConfig({
  sessionName: "Column Cover Plate Welded Connection",
  routePath: "/design/connections/column-to-column-splice/cover_plate_welded",
  designType: "Column-to-Column-Cover-Plate-Welded-Connection",
  cadOptions: ["Model", "Column", "CoverPlate"],
  sectionOptionsKey: "columnList",
  defaultLoads: { axial: "100", moment: "100", shear: "100" },
  memberMaterialField: "material",
  extraSubmissionParams: { flangespace: "0", type: "Fillet Weld" },
});
