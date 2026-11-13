import { makeSimpleConnectionWeldedConfig } from "../../shared/configFactory";
import { KEY_DISP_LAPJOINTWELDED } from "../../../../constants/generated/coreKeys";

export const lapJointWeldedConfig = makeSimpleConnectionWeldedConfig({
    sessionName: "Lap Joint Welded",
    designType: KEY_DISP_LAPJOINTWELDED,
    hasCoverPlate: false,
});
