import { makeSimpleConnectionBoltedConfig } from "../../shared/configFactory";
import { KEY_DISP_LAPJOINTBOLTED } from "../../../../constants/generated/coreKeys";

export const lapJointBoltedConfig = makeSimpleConnectionBoltedConfig({
    sessionName: "Lap Joint Bolted",
    designType: KEY_DISP_LAPJOINTBOLTED,
    hasCoverPlate: false,
});
