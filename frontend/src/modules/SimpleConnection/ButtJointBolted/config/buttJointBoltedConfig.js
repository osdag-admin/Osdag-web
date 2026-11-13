import { makeSimpleConnectionBoltedConfig } from "../../shared/configFactory";
import { KEY_DISP_BUTTJOINTBOLTED } from "../../../../constants/generated/coreKeys";

export const buttJointBoltedConfig = makeSimpleConnectionBoltedConfig({
    sessionName: "Butt Joint Bolted",
    designType: KEY_DISP_BUTTJOINTBOLTED,
    hasCoverPlate: true,
});
