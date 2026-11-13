import { makeSimpleConnectionWeldedConfig } from "../../shared/configFactory";
import { KEY_DISP_BUTTJOINTWELDED } from "../../../../constants/generated/coreKeys";

export const buttJointWeldedConfig = makeSimpleConnectionWeldedConfig({
    sessionName: "Butt Joint Welded",
    designType: KEY_DISP_BUTTJOINTWELDED,
    hasCoverPlate: true,
});
